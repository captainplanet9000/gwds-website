import { describe, expect, it } from 'vitest';
import { CommerceError } from '@/lib/commerce';
import { planExecutionMode } from '@/lib/hosting';
import {
  LOADOUT_STRATEGIES,
  MAX_AGENTS_PER_TENANT,
  UNRESOLVED_PLAN_AGENT_LIMIT,
  catalogueAgentIds,
  normalizeSubmittedLoadout,
  readStoredEntry,
  resolveAgentLimit,
  toStoredConfig,
  totalInstances,
} from '@/lib/loadout';

const market = (ticker: string) => ({ market: ticker });

describe('installable strategy set', () => {
  it('covers every agent product in the catalogue exactly once', () => {
    const specIds = LOADOUT_STRATEGIES.map((spec) => spec.agentId).sort();
    expect(specIds).toEqual(catalogueAgentIds().sort());
    expect(new Set(specIds).size).toBe(specIds.length);
  });

  it('allows only one regime coordinator', () => {
    const coordinator = LOADOUT_STRATEGIES.find((spec) => spec.agentId === 'macro-sentiment-agent');
    expect(coordinator?.maxInstances).toBe(1);
    expect(coordinator?.tradesMarket).toBe(false);
  });
});

describe('plan capacity resolution', () => {
  it('never resolves an unusable agent_limit into unlimited capacity', () => {
    expect(resolveAgentLimit(null)).toBe(UNRESOLVED_PLAN_AGENT_LIMIT);
    expect(resolveAgentLimit(undefined)).toBe(UNRESOLVED_PLAN_AGENT_LIMIT);
    expect(resolveAgentLimit(0)).toBe(UNRESOLVED_PLAN_AGENT_LIMIT);
    expect(resolveAgentLimit(-4)).toBe(UNRESOLVED_PLAN_AGENT_LIMIT);
    expect(resolveAgentLimit(Number.NaN)).toBe(UNRESOLVED_PLAN_AGENT_LIMIT);
  });

  it('clamps a plan that claims more than the platform ceiling', () => {
    expect(resolveAgentLimit(999)).toBe(MAX_AGENTS_PER_TENANT);
    expect(resolveAgentLimit(6)).toBe(6);
    expect(resolveAgentLimit(12.9)).toBe(12);
  });
});

describe('execution mode', () => {
  it('keeps a free plan simulated and a paid plan live', () => {
    expect(planExecutionMode(0)).toBe('simulated');
    expect(planExecutionMode(1900)).toBe('live');
    expect(planExecutionMode(29900)).toBe('live');
  });
});

describe('submitted loadout validation', () => {
  it('accepts a multi-instance strategy with distinct markets', () => {
    const entries = normalizeSubmittedLoadout([
      { agentId: 'darvas-indicator', instances: 2, config: [market('BTC'), market('eth')] },
      { agentId: 'macro-sentiment-agent', instances: 1, config: [{}] },
    ]);
    expect(totalInstances(entries)).toBe(3);
    expect(entries[0].config).toEqual([{ market: 'BTC' }, { market: 'ETH' }]);
    // The coordinator trades no market, so its instance config carries nothing.
    expect(entries[1].config).toEqual([{}]);
  });

  it('rejects two identically configured instances of one strategy', () => {
    expect(() =>
      normalizeSubmittedLoadout([
        { agentId: 'darvas-indicator', instances: 2, config: [market('BTC'), market('BTC')] },
      ]),
    ).toThrow(/configured identically/);
  });

  it('rejects a config array that does not match the instance count', () => {
    expect(() =>
      normalizeSubmittedLoadout([{ agentId: 'darvas-indicator', instances: 2, config: [market('BTC')] }]),
    ).toThrow(/one entry per instance/);
  });

  it('rejects a second regime coordinator', () => {
    expect(() =>
      normalizeSubmittedLoadout([{ agentId: 'macro-sentiment-agent', instances: 2, config: [{}, {}] }]),
    ).toThrow(/only one can run/);
  });

  it('rejects an unknown strategy, a duplicate line and a non-integer count', () => {
    expect(() =>
      normalizeSubmittedLoadout([{ agentId: 'everything-bundle', instances: 1, config: [market('BTC')] }]),
    ).toThrow(/not an installable strategy/);
    expect(() =>
      normalizeSubmittedLoadout([
        { agentId: 'darvas-indicator', instances: 1, config: [market('BTC')] },
        { agentId: 'darvas-indicator', instances: 1, config: [market('ETH')] },
      ]),
    ).toThrow(/listed twice/);
    expect(() =>
      normalizeSubmittedLoadout([{ agentId: 'darvas-indicator', instances: 1.5, config: [market('BTC')] }]),
    ).toThrow(/whole number/);
  });

  it('rejects a malformed market ticker', () => {
    for (const bad of ['BTC/USD', 'btc-perp', '', '   ', 'TOOLONGTICKER1']) {
      expect(() =>
        normalizeSubmittedLoadout([{ agentId: 'vwap-momentum-agent', instances: 1, config: [market(bad)] }]),
      ).toThrow(/market ticker/);
    }
  });

  it('refuses a total above the platform ceiling even before a plan is consulted', () => {
    const entries = [
      { agentId: 'darvas-indicator', instances: 7, config: ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(market) },
      { agentId: 'vwap-momentum-agent', instances: 7, config: ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(market) },
    ];
    expect(() => normalizeSubmittedLoadout(entries)).toThrow(new RegExp(`at most ${MAX_AGENTS_PER_TENANT} agents`));
  });

  it('reports validation failures as CommerceError so the route answers 4xx, not 500', () => {
    try {
      normalizeSubmittedLoadout('not-an-array');
      throw new Error('expected a rejection');
    } catch (error) {
      expect(error).toBeInstanceOf(CommerceError);
      expect((error as CommerceError).status).toBe(400);
    }
  });
});

describe('stored row reading', () => {
  it('takes the instance count from the column, not from the config array length', () => {
    const entry = readStoredEntry({
      agent_id: 'darvas-indicator',
      instances: 2,
      config: { instances: [market('BTC'), market('ETH'), market('SOL')] },
    });
    expect(entry.instances).toBe(2);
    expect(entry.config).toEqual([{ market: 'BTC' }, { market: 'ETH' }]);
  });

  it('pads a config array shorter than the instance count', () => {
    const entry = readStoredEntry({ agent_id: 'darvas-indicator', instances: 3, config: { instances: [market('BTC')] } });
    expect(entry.config).toEqual([{ market: 'BTC' }, {}, {}]);
  });

  it('reads a pre-capacity row as a single instance', () => {
    const entry = readStoredEntry({ agent_id: 'heikin-ashi-agent' });
    expect(entry).toEqual({ agentId: 'heikin-ashi-agent', instances: 1, config: [{}] });
  });

  it('clamps a stored count that exceeds the platform ceiling', () => {
    expect(readStoredEntry({ agent_id: 'darvas-indicator', instances: 40 }).instances).toBe(MAX_AGENTS_PER_TENANT);
    expect(readStoredEntry({ agent_id: 'darvas-indicator', instances: 0 }).instances).toBe(1);
  });

  it('drops a stored market that is no longer a valid ticker', () => {
    const entry = readStoredEntry({
      agent_id: 'darvas-indicator',
      instances: 1,
      config: { instances: [{ market: 'BTC/USD' }] },
    });
    expect(entry.config).toEqual([{}]);
  });

  it('round-trips a normalized entry through the stored config shape', () => {
    const [entry] = normalizeSubmittedLoadout([
      { agentId: 'mean-reversion-agent', instances: 2, config: [market('BTC'), market('SOL')] },
    ]);
    expect(readStoredEntry({ agent_id: entry.agentId, instances: entry.instances, config: toStoredConfig(entry) })).toEqual(
      entry,
    );
  });
});
