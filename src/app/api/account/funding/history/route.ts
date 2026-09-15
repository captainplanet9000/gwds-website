import { NextRequest, NextResponse } from 'next/server';
import { CommerceError, enforceRateLimit, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';
import {
  controlClient, resolveOwnedTenant, resolveTenantNetwork, TenantOwnershipError, tenantOwnershipCommerceError,
} from '@/lib/control-plane';
import { FUNDING_NETWORKS } from '@/lib/hyperliquid-funding';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LOOKBACK_MS = 180 * 24 * 60 * 60 * 1000;
const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NO_STORE = { 'Cache-Control': 'no-store' };

type LedgerUpdate = { time?: unknown; hash?: unknown; delta?: { type?: unknown; usdc?: unknown; fee?: unknown } };

// READ-ONLY. Deposit and withdrawal history for the signed-in customer's own tenant main wallet,
// read straight from Hyperliquid's ledger on the tenant's network (ported from dashboard-runtime's
// /api/funding/history), so it is authoritative and nothing is stored on our side. Same ownership
// and network rules as the withdraw relay; archived and suspended workspaces still see history.
export async function GET(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);
    await enforceRateLimit(req, 'funding_history', 60, 60);
    // Optional: only breaks a tie between several workspaces this customer bought.
    const requested = req.nextUrl.searchParams.get('subscriptionId');
    if (requested !== null && !UUID.test(requested)) throw new CommerceError('INVALID_SUBSCRIPTION', 'Invalid subscription.');

    const cp = controlClient();
    let owned;
    try {
      owned = await resolveOwnedTenant(cp, user.email!, {
        includeArchived: true, userId: user.id, subscriptionId: requested ?? undefined,
      });
    } catch (err) {
      if (err instanceof TenantOwnershipError) throw tenantOwnershipCommerceError(err);
      throw err;
    }
    const { data: tenant, error: tenantError } = await cp.from('tenants')
      .select('main_wallet_address').eq('id', owned.id).single();
    if (tenantError || !tenant) throw new CommerceError('TENANT_LOOKUP_FAILED', 'Your tenant status could not be loaded.', 503);
    const mainWallet = typeof tenant.main_wallet_address === 'string' && ADDRESS.test(tenant.main_wallet_address)
      ? tenant.main_wallet_address : null;
    if (!mainWallet) throw new CommerceError('MAIN_WALLET_NOT_PROVISIONED', 'Your trading account is not set up yet.', 409);

    const network = await resolveTenantNetwork(cp, owned.id);
    const cfg = FUNDING_NETWORKS[network];

    let updates: unknown;
    try {
      const res = await fetch(`${cfg.hyperliquidApi}/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'userNonFundingLedgerUpdates', user: mainWallet, startTime: Date.now() - LOOKBACK_MS }),
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`Hyperliquid responded ${res.status}`);
      updates = await res.json();
    } catch {
      return NextResponse.json(
        { error: 'Your deposit and withdrawal history could not be loaded from Hyperliquid.', code: 'HISTORY_UNAVAILABLE', network, items: [] },
        { status: 502, headers: NO_STORE },
      );
    }

    const items = (Array.isArray(updates) ? (updates as LedgerUpdate[]) : [])
      .filter(u => u?.delta?.type === 'deposit' || u?.delta?.type === 'withdraw')
      .map(u => ({
        type: u.delta!.type as 'deposit' | 'withdraw',
        usdc: String(u.delta!.usdc ?? '0'),
        fee: u.delta!.fee != null ? String(u.delta!.fee) : null,
        time: Number(u.time),
        hash: String(u.hash || ''),
      }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 50);

    return NextResponse.json({ network, items }, { headers: NO_STORE });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    if (!(error instanceof CommerceError)) console.error('Funding history failed', error);
    return NextResponse.json(
      { ...errorResponseBody(error instanceof CommerceError ? error : new CommerceError('HISTORY_UNAVAILABLE', 'Your history could not be loaded.', 500)), items: [] },
      { status, headers: NO_STORE },
    );
  }
}
