import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, erc20Abi, formatEther, formatUnits, getAddress, http } from 'viem';
import { arbitrum, arbitrumSepolia } from 'viem/chains';
import { CommerceError, enforceRateLimit, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';
import { createServerClient } from '@/lib/supabase';
import { controlClient, resolveOwnedTenant, resolveTenantNetwork, TenantOwnershipError } from '@/lib/control-plane';
import {
  FUNDING_NETWORKS, MIN_DEPOSIT_USDC, USDC_DECIMALS, WITHDRAW_FEE_USDC,
  type FundingNetwork, type FundingNetworkConfig,
} from '@/lib/hyperliquid-funding';
import { arbitrumRpcUrl } from '@/lib/hyperliquid-network';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────────────────────────────────────
// READ-ONLY. This route never accepts a private key, never moves funds, and never writes
// anything. It answers one question for the signed-in customer, scoped to their own tenant only
// (resolved via resolveOwnedTenant — see src/lib/control-plane.ts; owner_email proposes the
// tenant and the purchase link to this user decides between several):
// "where is my agent's trading wallet, what network is it on, and has money arrived."
//
// The network is the TENANT's (resolveTenantNetwork), never this deployment's, and is never
// guessed: when it cannot be resolved the state is 'network_unknown' and no config or balance is
// returned. Every balance read is independent; a failed read is null (unknown), never zero and
// never a failed response.
//
// The optional hosting_subscriptions lookup below is supplemental — it is used only to attach a
// subscriptionId (so wallet verification can also update the customer's self-serve onboarding
// record) and is never required for the funding UI itself to work, because today a tenant can
// exist in the control plane before the billing product's own linkage does.
// ─────────────────────────────────────────────────────────────────────────────────────────────

const ACTIVE_SUBSCRIPTION_STATUSES = ['trialing', 'active', 'past_due', 'paused', 'unpaid'];
const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NO_STORE = { 'Cache-Control': 'no-store' };

type FundingState = 'no_tenant' | 'awaiting_wallet' | 'provisioning' | 'ready' | 'network_unknown';
type Balances = {
  accountValue: string | null; withdrawable: string | null; spotUsdc: string | null;
  walletUsdc: string | null; gasEth: string | null;
};
const UNKNOWN_BALANCES: Balances = { accountValue: null, withdrawable: null, spotUsdc: null, walletUsdc: null, gasEth: null };

function checksummed(value: unknown): `0x${string}` | null {
  return typeof value === 'string' && ADDRESS.test(value) ? getAddress(value) : null;
}

// A decimal string as Hyperliquid sends it, or null when missing or not a number.
function decimalString(value: unknown): string | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const s = String(value);
  return /^-?\d+(\.\d+)?$/.test(s) ? s : null;
}

async function hlInfo(cfg: FundingNetworkConfig, body: unknown) {
  const res = await fetch(`${cfg.hyperliquidApi}/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Hyperliquid responded ${res.status}`);
  return res.json();
}

async function orNull<T>(read: () => Promise<T>): Promise<T | null> {
  try {
    return await read();
  } catch {
    // An unreadable balance is UNKNOWN, never zero — the RPC or API could be down, rate-limited, etc.
    return null;
  }
}

async function readBalances(cfg: FundingNetworkConfig, address: `0x${string}`): Promise<Balances> {
  const client = createPublicClient({
    chain: cfg.network === 'mainnet' ? arbitrum : arbitrumSepolia,
    transport: http(arbitrumRpcUrl(cfg.network)),
  });
  const [perp, spot, walletUsdc, gasEth] = await Promise.all([
    orNull(() => hlInfo(cfg, { type: 'clearinghouseState', user: address })),
    orNull(() => hlInfo(cfg, { type: 'spotClearinghouseState', user: address })),
    orNull(async () => formatUnits(
      await client.readContract({ address: cfg.usdc, abi: erc20Abi, functionName: 'balanceOf', args: [address] }),
      USDC_DECIMALS,
    )),
    orNull(async () => formatEther(await client.getBalance({ address }))),
  ]);
  const spotBalances = Array.isArray(spot?.balances) ? (spot.balances as Array<{ coin?: unknown; total?: unknown }>) : null;
  const spotEntry = spotBalances?.find(b => b?.coin === 'USDC');
  return {
    accountValue: decimalString(perp?.marginSummary?.accountValue),
    withdrawable: decimalString(perp?.withdrawable),
    // A readable spot account with no USDC entry holds zero USDC; an unreadable one is unknown.
    spotUsdc: spotBalances ? (spotEntry ? decimalString(spotEntry.total) : '0') : null,
    walletUsdc,
    gasEth,
  };
}

// Hyperliquid /info {type:'extraAgents'} — verified live on both networks to answer
// [{ name, address, validUntil }]. An expired approval no longer lets the agent trade.
async function readAgentApproved(cfg: FundingNetworkConfig, main: string, agent: string): Promise<boolean | null> {
  const agents = await orNull(() => hlInfo(cfg, { type: 'extraAgents', user: main }));
  if (!Array.isArray(agents)) return null;
  return agents.some((a: { address?: unknown; validUntil?: unknown }) =>
    typeof a?.address === 'string' && a.address.toLowerCase() === agent.toLowerCase()
    && !(typeof a.validUntil === 'number' && a.validUntil <= Date.now()));
}

const toNumber = (value: string | null) => (value === null ? null : Number(value));

export async function GET(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);
    await enforceRateLimit(req, 'funding_status', 120, 60);
    const supabase = createServerClient();

    const requested = req.nextUrl.searchParams.get('subscriptionId');
    if (requested !== null && !UUID.test(requested)) throw new CommerceError('INVALID_SUBSCRIPTION', 'Invalid subscription.');

    const subRow = await supabase.from('hosting_subscriptions').select('id,status,created_at').eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const subscriptions = subRow.data || [];
    let subscription;
    if (requested) {
      if (subRow.error) throw new CommerceError('SUBSCRIPTION_LOOKUP_FAILED', 'Your subscription could not be verified.', 503);
      subscription = subscriptions.find((row) => row.id === requested);
      if (!subscription) throw new CommerceError('SUBSCRIPTION_NOT_OWNED', 'This subscription does not belong to your account.', 403);
    } else {
      subscription =
        subscriptions.find((row) => ACTIVE_SUBSCRIPTION_STATUSES.includes(row.status)) ||
        subscriptions[0] || null;
    }

    let declaredAddress: string | null = null;
    if (subscription) {
      const { data: onboarding } = await supabase.from('hosting_onboarding')
        .select('account_address').eq('subscription_id', subscription.id).eq('user_id', user.id).maybeSingle();
      declaredAddress = checksummed(onboarding?.account_address);
    }
    // The customer's latest signed ownership proof (written by verify-wallet), else their designation.
    const { data: proof } = await supabase.from('hosting_audit').select('metadata, created_at')
      .eq('user_id', user.id).eq('action', 'funding_wallet_verified')
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    const verifiedAddress = checksummed(proof?.metadata?.address) ?? declaredAddress;

    const base = {
      subscriptionId: subscription?.id ?? null,
      subscriptionStatus: subscription?.status ?? null,
      declaredAddress,
      verifiedAddress,
      minDepositUsdc: MIN_DEPOSIT_USDC,
      withdrawFeeUsdc: WITHDRAW_FEE_USDC,
    };

    // Same ownership resolution dashboard-link and the customer's instance page already use
    // (control.tenants.owner_email), narrowed by the purchase link to this user — see
    // src/lib/control-plane.ts. includeArchived: true so an archived workspace still renders its
    // state (and its funds can still be withdrawn) instead of looking like "never provisioned".
    const cp = controlClient();
    let owned;
    try {
      owned = await resolveOwnedTenant(cp, user.email!, {
        includeArchived: true, userId: user.id, subscriptionId: subscription?.id,
      });
    } catch (err) {
      if (err instanceof TenantOwnershipError) {
        return NextResponse.json({
          ...base,
          state: 'no_tenant' satisfies FundingState,
          hasTenant: false, tenant: null, network: null, config: null,
          addressMismatch: false, agentApproved: null, balances: UNKNOWN_BALANCES,
          message: err.code === 'AMBIGUOUS_TENANT'
            ? 'Multiple workspaces are linked to this account — contact support to resolve which one to fund.'
            : err.code === 'NOT_OWNER'
              ? err.message
              : (subscription
                ? 'Your subscription is active, but no trading tenant has reached the control plane yet — check back shortly.'
                : 'No trading tenant is provisioned for this account yet — subscribe on /hosted to get one.'),
        }, { headers: NO_STORE });
      }
      throw err;
    }

    const { data: tenant, error: tenantError } = await cp.from('tenants')
      .select('slug, display_name, status, main_wallet_address, api_wallet_address')
      .eq('id', owned.id).single();
    if (tenantError || !tenant) throw new CommerceError('TENANT_LOOKUP_FAILED', 'Your tenant status could not be loaded.', 503);

    const mainWallet = checksummed(tenant.main_wallet_address);
    const apiWallet = checksummed(tenant.api_wallet_address);

    let network: FundingNetwork | null = null;
    try {
      network = await resolveTenantNetwork(cp, owned.id);
    } catch (err) {
      if (!(err instanceof CommerceError && err.code === 'NETWORK_UNKNOWN')) throw err;
    }
    const config = network ? FUNDING_NETWORKS[network] : null;

    const state: FundingState = !config ? 'network_unknown'
      : mainWallet ? 'ready'
        : verifiedAddress ? 'provisioning'
          : 'awaiting_wallet';

    const [balances, agentApproved] = await Promise.all([
      config && mainWallet ? readBalances(config, mainWallet) : Promise.resolve(UNKNOWN_BALANCES),
      config && mainWallet && apiWallet ? readAgentApproved(config, mainWallet, apiWallet) : Promise.resolve(null),
    ]);

    return NextResponse.json({
      ...base,
      state,
      hasTenant: true,
      network,
      config,
      addressMismatch: Boolean(verifiedAddress && mainWallet && verifiedAddress.toLowerCase() !== mainWallet.toLowerCase()),
      agentApproved,
      tenant: {
        slug: tenant.slug,
        displayName: tenant.display_name,
        status: tenant.status,
        mainWallet,
        apiWallet,
        mainWalletAddress: mainWallet,
        apiWalletAddress: apiWallet,
      },
      balances: {
        ...balances,
        // The earlier numeric fields, still read by /account/funding.
        arbitrumUsdc: toNumber(balances.walletUsdc),
        arbitrumUsdcKnown: balances.walletUsdc !== null,
        arbitrumGasEth: toNumber(balances.gasEth),
        arbitrumGasEthKnown: balances.gasEth !== null,
        hyperliquidAccountValueUsd: toNumber(balances.accountValue),
        hyperliquidAccountValueKnown: balances.accountValue !== null,
        fundsArrived: balances.accountValue !== null && Number(balances.accountValue) > 0,
      },
    }, { headers: NO_STORE });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    if (!(error instanceof CommerceError)) console.error('Funding status failed', error);
    return NextResponse.json(errorResponseBody(error instanceof CommerceError ? error : new CommerceError('FUNDING_UNAVAILABLE', 'Your funding status could not be loaded.', 500)), { status, headers: NO_STORE });
  }
}
