import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, erc20Abi, getAddress } from 'viem';
import { arbitrum, arbitrumSepolia } from 'viem/chains';
import { CommerceError, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';
import { createServerClient } from '@/lib/supabase';
import { controlClient, resolveOwnedTenant, TenantOwnershipError } from '@/lib/control-plane';
import {
  arbitrumChainId, arbitrumRpcUrl, bridgeAddress, currentNetwork, hyperliquidApiUrl,
  usdcAddress, USDC_DECIMALS,
} from '@/lib/hyperliquid-network';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────────────────────────────────────
// READ-ONLY. This route never accepts a private key, never moves funds, and never writes
// anything. It answers one question for the signed-in customer, scoped to their own tenant only
// (resolved via resolveOwnedTenant — see src/lib/control-plane.ts; owner_email is the
// correspondence that works today, the same one dashboard-link and the instance page use):
// "where is my agent's trading wallet, what network is it on, and has money arrived."
//
// The optional hosting_subscriptions lookup below is supplemental — it is used only to attach a
// subscriptionId (so wallet verification can also update the customer's self-serve onboarding
// record) and is never required for the funding UI itself to work, because today a tenant can
// exist in the control plane before the billing product's own linkage does.
// ─────────────────────────────────────────────────────────────────────────────────────────────

const ACTIVE_SUBSCRIPTION_STATUSES = ['trialing', 'active', 'past_due', 'paused', 'unpaid'];

function chainClient() {
  const chain = currentNetwork() === 'mainnet' ? arbitrum : arbitrumSepolia;
  return createPublicClient({ chain, transport: http(arbitrumRpcUrl()) });
}

async function readArbitrumBalances(address: `0x${string}`) {
  try {
    const client = chainClient();
    const [usdc, gasWei] = await Promise.all([
      client.readContract({ address: usdcAddress(), abi: erc20Abi, functionName: 'balanceOf', args: [address] }),
      client.getBalance({ address }),
    ]);
    return { usdc: Number(usdc) / 10 ** USDC_DECIMALS, gasEth: Number(gasWei) / 1e18 };
  } catch {
    // An unreadable balance is UNKNOWN, never zero — the RPC could be down, rate-limited, etc.
    return { usdc: null as number | null, gasEth: null as number | null };
  }
}

async function readHyperliquidEquity(address: `0x${string}`) {
  try {
    const res = await fetch(`${hyperliquidApiUrl()}/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'clearinghouseState', user: address }),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    const value = data?.marginSummary?.accountValue;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);
    const supabase = createServerClient();

    const network = {
      name: currentNetwork(),
      chain: 'Arbitrum ' + (currentNetwork() === 'mainnet' ? 'One' : 'Sepolia (testnet)'),
      chainId: arbitrumChainId(),
      settlementAsset: 'USDC',
      usdcContract: usdcAddress(),
      bridgeAddress: bridgeAddress(), // null when unconfigured — UI must render "not configured", never guess
    };

    const subRow = await supabase.from('hosting_subscriptions').select('id,status,created_at').eq('user_id', user.id)
      .order('created_at', { ascending: false });

    const subscriptions = subRow.data || [];
    const subscription =
      subscriptions.find((row) => ACTIVE_SUBSCRIPTION_STATUSES.includes(row.status)) ||
      subscriptions[0] || null;

    let declaredAddress: string | null = null;
    if (subscription) {
      const { data: onboarding } = await supabase.from('hosting_onboarding')
        .select('account_address').eq('subscription_id', subscription.id).eq('user_id', user.id).maybeSingle();
      if (onboarding?.account_address && /^0x[a-fA-F0-9]{40}$/.test(onboarding.account_address)) {
        declaredAddress = getAddress(onboarding.account_address);
      }
    }

    // Same ownership resolution dashboard-link and the customer's instance page already use
    // (control.tenants.owner_email) — see src/lib/control-plane.ts. includeArchived: true so an
    // archived workspace still renders its state instead of looking indistinguishable from
    // "never provisioned".
    const cp = controlClient();
    let owned;
    try {
      owned = await resolveOwnedTenant(cp, user.email!, { includeArchived: true });
    } catch (err) {
      if (err instanceof TenantOwnershipError) {
        return NextResponse.json({
          hasTenant: false, tenant: null, network, declaredAddress,
          subscriptionId: subscription?.id ?? null, subscriptionStatus: subscription?.status ?? null,
          message: err.code === 'AMBIGUOUS_TENANT'
            ? 'Multiple workspaces are linked to this account — contact support to resolve which one to fund.'
            : (subscription
              ? 'Your subscription is active, but no trading tenant has reached the control plane yet — check back shortly.'
              : 'No trading tenant is provisioned for this account yet — subscribe on /hosted to get one.'),
        }, { headers: { 'Cache-Control': 'no-store' } });
      }
      throw err;
    }

    const { data: tenant, error: tenantError } = await cp.from('tenants')
      .select('slug, display_name, status, main_wallet_address, api_wallet_address')
      .eq('id', owned.id).single();
    if (tenantError || !tenant) throw new CommerceError('TENANT_LOOKUP_FAILED', 'Your tenant status could not be loaded.', 503);

    const mainWallet = tenant.main_wallet_address && /^0x[a-fA-F0-9]{40}$/.test(tenant.main_wallet_address)
      ? getAddress(tenant.main_wallet_address) : null;
    const apiWallet = tenant.api_wallet_address && /^0x[a-fA-F0-9]{40}$/.test(tenant.api_wallet_address)
      ? getAddress(tenant.api_wallet_address) : null;

    const [arb, hlEquity] = await Promise.all([
      mainWallet ? readArbitrumBalances(mainWallet) : Promise.resolve({ usdc: null, gasEth: null }),
      mainWallet ? readHyperliquidEquity(mainWallet) : Promise.resolve(null),
    ]);

    return NextResponse.json({
      hasTenant: true,
      subscriptionId: subscription?.id ?? null,
      subscriptionStatus: subscription?.status ?? null,
      network,
      declaredAddress,
      addressMismatch: Boolean(declaredAddress && mainWallet && declaredAddress.toLowerCase() !== mainWallet.toLowerCase()),
      tenant: {
        slug: tenant.slug,
        displayName: tenant.display_name,
        status: tenant.status,
        mainWalletAddress: mainWallet,
        apiWalletAddress: apiWallet,
      },
      balances: {
        arbitrumUsdc: arb.usdc,
        arbitrumUsdcKnown: arb.usdc !== null,
        arbitrumGasEth: arb.gasEth,
        arbitrumGasEthKnown: arb.gasEth !== null,
        hyperliquidAccountValueUsd: hlEquity,
        hyperliquidAccountValueKnown: hlEquity !== null,
        fundsArrived: hlEquity !== null && hlEquity > 0,
      },
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    if (!(error instanceof CommerceError)) console.error('Funding status failed', error);
    return NextResponse.json(errorResponseBody(error instanceof CommerceError ? error : new CommerceError('FUNDING_UNAVAILABLE', 'Your funding status could not be loaded.', 500)), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
