import { CommerceError } from '@/lib/commerce';
import { getProduct, products } from '@/lib/products';

// ─────────────────────────────────────────────────────────────────────────────────────────────
// LOADOUT RULES — shared by the customer API (src/app/api/account/instance/loadout/route.ts) and
// the builder UI (src/app/account/instance/page.tsx).
//
// Everything in this file is pure, so the rules deciding how many live trading agents a customer
// may run are unit-testable without a database, a session or a network. The route is still the
// enforcement point: nothing here is safe to trust from a browser.
//
// TWO INDEPENDENT GATES, BOTH REQUIRED:
//   capacity    — how many agents may run at once, from the tenant's plan (hosting_plans.agent_limit)
//   entitlement — WHICH strategies may be chosen, from what the customer bought or their plan includes
// A plan grants capacity. It does not by itself grant access to a strategy the customer never
// bought, unless the plan's included_product_id covers it. Neither gate substitutes for the other.
// ─────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Platform ceiling on total agents for ONE tenant, whatever a plan row claims.
 *
 * The binding constraint is Hyperliquid's per-source-IP request-weight budget, which every tenant
 * behind the same egress address shares and which agent count multiplies. The authoritative copy
 * of this number is the CHECK on hosting_plans.agent_limit; this constant exists so a malformed
 * or not-yet-constrained plan row cannot talk the API into a larger number than the database
 * would ever have allowed.
 */
export const MAX_AGENTS_PER_TENANT = 12;

/**
 * Floor used when a tenant's plan cannot be resolved at all. Fail closed: an unknown plan is not
 * a licence to run twelve live strategies, and one agent is the smallest capacity any plan sells.
 */
export const UNRESOLVED_PLAN_AGENT_LIMIT = 1;

/** Hyperliquid perp tickers are bare uppercase symbols — no pair, no slash, no venue prefix. */
const MARKET_PATTERN = /^[A-Z0-9]{1,12}$/;

export interface StrategySpec {
  /** Storefront product id; also control.tenant_loadout.agent_id. */
  agentId: string;
  /**
   * Whether an instance of this strategy takes positions in a market of its own. False for the
   * regime coordinator, which places no orders — it reads the macro picture and tells the other
   * agents whether the desk is risk-on or risk-off.
   */
  tradesMarket: boolean;
  /**
   * Meaningful instance ceiling for this strategy alone, before the plan cap applies. Only the
   * coordinator is limited here, and for a correctness reason rather than a pricing one: two
   * coordinators broadcast two regimes, and the farm cannot be both risk-on and risk-off.
   */
  maxInstances: number;
}

export const LOADOUT_STRATEGIES: readonly StrategySpec[] = [
  { agentId: 'darvas-indicator', tradesMarket: true, maxInstances: MAX_AGENTS_PER_TENANT },
  { agentId: 'elliott-wave-agent', tradesMarket: true, maxInstances: MAX_AGENTS_PER_TENANT },
  { agentId: 'vwap-momentum-agent', tradesMarket: true, maxInstances: MAX_AGENTS_PER_TENANT },
  { agentId: 'heikin-ashi-agent', tradesMarket: true, maxInstances: MAX_AGENTS_PER_TENANT },
  { agentId: 'mean-reversion-agent', tradesMarket: true, maxInstances: MAX_AGENTS_PER_TENANT },
  { agentId: 'strategy-pack', tradesMarket: true, maxInstances: MAX_AGENTS_PER_TENANT },
  { agentId: 'macro-sentiment-agent', tradesMarket: false, maxInstances: 1 },
] as const;

const SPEC_BY_ID = new Map(LOADOUT_STRATEGIES.map((spec) => [spec.agentId, spec]));

export function getStrategySpec(agentId: string): StrategySpec | undefined {
  return SPEC_BY_ID.get(agentId);
}

/** Every agent-type product in the catalogue — the set LOADOUT_STRATEGIES must cover exactly. */
export function catalogueAgentIds(): string[] {
  return products.filter((product) => product.productType === 'agent').map((product) => product.id);
}

/**
 * One instance's parameters, as stored inside control.tenant_loadout.config.
 *
 * THE SHAPE IS AN ARRAY OF OBJECTS RATHER THAN AN ARRAY OF STRINGS, deliberately: a second
 * instance of a strategy is only capacity if it is doing something different, and "different"
 * will eventually mean more than the market (timeframe, risk profile). An object element gains a
 * field without a migration; a bare string would need one.
 */
export interface InstanceConfig {
  market?: string;
}

export interface LoadoutConfig {
  instances: InstanceConfig[];
}

/** One strategy's line in a submitted or stored loadout. */
export interface LoadoutEntry {
  agentId: string;
  instances: number;
  /** Length always equals `instances`. Empty objects for a strategy that trades no market. */
  config: InstanceConfig[];
}

export function totalInstances(entries: readonly { instances: number }[]): number {
  return entries.reduce((sum, entry) => sum + entry.instances, 0);
}

/**
 * Reads a stored control.tenant_loadout row back into an entry, tolerating a row written before
 * this shape existed or by a future writer that added fields.
 *
 * `instances` comes from the COLUMN, never from the length of the config array: the column is
 * what the database CHECK constrains and what SUM() caps, so a config array disagreeing with it
 * is trimmed or padded to match rather than being allowed to inflate the count.
 */
export function readStoredEntry(row: {
  agent_id: string;
  instances?: number | null;
  config?: unknown;
}): LoadoutEntry {
  const rawInstances = Math.trunc(Number(row.instances ?? 1));
  const instances = Number.isFinite(rawInstances)
    ? Math.max(1, Math.min(MAX_AGENTS_PER_TENANT, rawInstances || 1))
    : 1;
  const stored = (row.config as Partial<LoadoutConfig> | null | undefined)?.instances;
  const config: InstanceConfig[] = [];
  for (let index = 0; index < instances; index += 1) {
    const candidate = Array.isArray(stored) ? stored[index] : undefined;
    const market = typeof candidate?.market === 'string' && MARKET_PATTERN.test(candidate.market)
      ? candidate.market
      : undefined;
    config.push(market ? { market } : {});
  }
  return { agentId: row.agent_id, instances, config };
}

export function toStoredConfig(entry: LoadoutEntry): LoadoutConfig {
  return { instances: entry.config };
}

/**
 * Validates and normalizes a customer-submitted loadout.
 *
 * Throws CommerceError on anything malformed. Deliberately does NOT check entitlement or plan
 * capacity — those need the database and belong to the route, which must run them as well.
 */
export function normalizeSubmittedLoadout(value: unknown): LoadoutEntry[] {
  if (!Array.isArray(value)) {
    throw new CommerceError('INVALID_LOADOUT', 'loadout must be an array.', 400);
  }
  if (value.length > LOADOUT_STRATEGIES.length) {
    throw new CommerceError('INVALID_LOADOUT', 'More strategies were submitted than exist.', 400);
  }

  const entries: LoadoutEntry[] = [];
  const seen = new Set<string>();

  for (const raw of value) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new CommerceError('INVALID_LOADOUT', 'Each loadout item must be an object.', 400);
    }
    const item = raw as Record<string, unknown>;
    const agentId = item.agentId;
    if (typeof agentId !== 'string') {
      throw new CommerceError('INVALID_AGENT', 'A valid agentId is required.', 400);
    }
    const spec = SPEC_BY_ID.get(agentId);
    if (!spec) {
      throw new CommerceError('INVALID_AGENT', `${agentId} is not an installable strategy.`, 400);
    }
    if (seen.has(agentId)) {
      throw new CommerceError('DUPLICATE_AGENT', `${agentId} was listed twice.`, 400);
    }
    seen.add(agentId);

    const instances = item.instances;
    if (typeof instances !== 'number' || !Number.isInteger(instances) || instances < 1) {
      throw new CommerceError('INVALID_INSTANCES', 'instances must be a whole number of at least 1.', 400);
    }
    if (instances > spec.maxInstances) {
      const name = getProduct(agentId)?.name || agentId;
      throw new CommerceError(
        'INSTANCE_LIMIT',
        spec.maxInstances === 1
          ? `${name} coordinates the other agents, so only one can run.`
          : `${name} is limited to ${spec.maxInstances} instances.`,
        400,
      );
    }

    const submittedConfig = item.config;
    if (!Array.isArray(submittedConfig) || submittedConfig.length !== instances) {
      throw new CommerceError('INVALID_CONFIG', 'config must hold exactly one entry per instance.', 400);
    }

    const config: InstanceConfig[] = [];
    // Two instances of one strategy configured identically are not two agents' worth of capacity
    // — they read the same signal and compete for the same margin. Rejected rather than silently
    // deduplicated, so the customer picks a second market instead of paying for a copy.
    const fingerprints = new Set<string>();
    for (const rawInstance of submittedConfig) {
      if (!rawInstance || typeof rawInstance !== 'object' || Array.isArray(rawInstance)) {
        throw new CommerceError('INVALID_CONFIG', 'Each instance config must be an object.', 400);
      }
      const instanceConfig: InstanceConfig = {};
      if (spec.tradesMarket) {
        const market = (rawInstance as Record<string, unknown>).market;
        const normalized = typeof market === 'string' ? market.trim().toUpperCase() : '';
        if (!MARKET_PATTERN.test(normalized)) {
          throw new CommerceError(
            'INVALID_MARKET',
            'Each instance needs a Hyperliquid market ticker, for example BTC.',
            400,
          );
        }
        instanceConfig.market = normalized;
      }
      const fingerprint = JSON.stringify(instanceConfig);
      if (fingerprints.has(fingerprint)) {
        const name = getProduct(agentId)?.name || agentId;
        throw new CommerceError(
          'DUPLICATE_INSTANCE',
          `Two ${name} instances are configured identically. Give each one a different market.`,
          400,
        );
      }
      fingerprints.add(fingerprint);
      config.push(instanceConfig);
    }

    entries.push({ agentId, instances, config });
  }

  const total = totalInstances(entries);
  if (total > MAX_AGENTS_PER_TENANT) {
    throw new CommerceError(
      'PLATFORM_CAP_EXCEEDED',
      `A workspace can run at most ${MAX_AGENTS_PER_TENANT} agents.`,
      400,
    );
  }

  return entries;
}

/**
 * Clamps a plan's advertised agent_limit into something the API is willing to honour.
 *
 * agent_limit is nullable until migration 0021 lands, and a NULL there historically meant
 * "unlimited" — exactly the row this change exists to kill. NULL, zero, a non-integer, or
 * anything above the platform ceiling all resolve to a safe number here rather than to an
 * unbounded one.
 */
export function resolveAgentLimit(agentLimit: number | null | undefined): number {
  if (typeof agentLimit !== 'number' || !Number.isFinite(agentLimit)) return UNRESOLVED_PLAN_AGENT_LIMIT;
  const floored = Math.trunc(agentLimit);
  if (floored < 1) return UNRESOLVED_PLAN_AGENT_LIMIT;
  return Math.min(floored, MAX_AGENTS_PER_TENANT);
}
