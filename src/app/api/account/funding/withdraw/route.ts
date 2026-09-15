import { NextRequest, NextResponse } from 'next/server';
import { recoverTypedDataAddress } from 'viem';
import { CommerceError, enforceRateLimit, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';
import { createServerClient } from '@/lib/supabase';
import {
  controlClient, resolveOwnedTenant, resolveTenantNetwork, TenantOwnershipError, tenantOwnershipCommerceError,
} from '@/lib/control-plane';
import {
  AMOUNT_PATTERN, FUNDING_NETWORKS, WITHDRAW_FEE_USDC, WITHDRAW_PRIMARY_TYPE, WITHDRAW_TYPES, withdrawDomain,
} from '@/lib/hyperliquid-funding';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_SIGNATURE_AGE_MS = 10 * 60 * 1000;
const HEX32 = /^0x[0-9a-fA-F]{64}$/;
const ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EXPECTED_FIELDS = 'amount,destination,hyperliquidChain,signatureChainId,time,type';

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Relays a Hyperliquid withdraw3 that the customer's own wallet already signed in their browser
// (ported from dashboard-runtime's /api/funding/withdraw, every check kept). This server never
// holds the main wallet key and cannot create a withdrawal. All it adds is refusal: it forwards a
// withdrawal only when it sends to the customer's OWN tenant main wallet AND was signed by that
// same wallet, for the tenant's network, in the last 10 minutes — so a stolen storefront session
// can neither originate nor redirect one.
//
// The main wallet comes from the tenant this signed-in customer owns (resolveOwnedTenant, with the
// purchase link required to belong to this user). Suspended, canceled and archived workspaces can
// still withdraw: a customer must always be able to take their money out.
// ─────────────────────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);
    await enforceRateLimit(req, 'funding_withdraw', 10, 60);
    const body = await req.json().catch(() => null);
    const action = body?.action;
    const signature = body?.signature;
    const nonce = body?.nonce;
    // Optional: only breaks a tie between several workspaces this customer bought.
    const subscriptionId = body?.subscriptionId ?? null;
    if (subscriptionId !== null && (typeof subscriptionId !== 'string' || !UUID.test(subscriptionId))) {
      throw new CommerceError('INVALID_SUBSCRIPTION', 'Invalid subscription.');
    }

    if (!action || typeof action !== 'object' || Array.isArray(action)) {
      throw new CommerceError('INVALID_WITHDRAWAL', 'Missing withdrawal.');
    }
    if (Object.keys(action).sort().join(',') !== EXPECTED_FIELDS) {
      throw new CommerceError('INVALID_WITHDRAWAL', 'Unexpected withdrawal fields.');
    }
    if (action.type !== 'withdraw3') throw new CommerceError('INVALID_WITHDRAWAL', 'Only withdrawals can be relayed here.');
    if (typeof action.amount !== 'string' || !AMOUNT_PATTERN.test(action.amount) || Number(action.amount) <= WITHDRAW_FEE_USDC) {
      throw new CommerceError('INVALID_AMOUNT', `Withdraw more than the $${WITHDRAW_FEE_USDC} Hyperliquid fee.`);
    }
    if (!Number.isSafeInteger(action.time) || nonce !== action.time) {
      throw new CommerceError('INVALID_NONCE', 'Invalid withdrawal timestamp.');
    }
    if (Math.abs(Date.now() - action.time) > MAX_SIGNATURE_AGE_MS) {
      throw new CommerceError('SIGNATURE_EXPIRED', 'This signature has expired. Please sign the withdrawal again.');
    }
    if (
      !signature || typeof signature !== 'object'
      || !HEX32.test(String(signature.r)) || !HEX32.test(String(signature.s))
      || (signature.v !== 27 && signature.v !== 28)
    ) {
      throw new CommerceError('INVALID_SIGNATURE', 'Invalid signature: send {r, s, v}.');
    }

    const cp = controlClient();
    let owned;
    try {
      owned = await resolveOwnedTenant(cp, user.email!, {
        includeArchived: true, userId: user.id, subscriptionId: subscriptionId ?? undefined,
      });
    } catch (err) {
      if (err instanceof TenantOwnershipError) throw tenantOwnershipCommerceError(err);
      throw err;
    }
    const { data: tenant, error: tenantError } = await cp.from('tenants')
      .select('slug, main_wallet_address').eq('id', owned.id).single();
    if (tenantError || !tenant) throw new CommerceError('TENANT_LOOKUP_FAILED', 'Your tenant status could not be loaded.', 503);
    const mainWallet = typeof tenant.main_wallet_address === 'string' && ADDRESS.test(tenant.main_wallet_address)
      ? tenant.main_wallet_address.toLowerCase() : null;
    if (!mainWallet) {
      throw new CommerceError('MAIN_WALLET_NOT_PROVISIONED', 'Your trading account is not set up yet.', 409);
    }

    const network = await resolveTenantNetwork(cp, owned.id);
    const cfg = FUNDING_NETWORKS[network];
    if (action.hyperliquidChain !== cfg.hyperliquidChain || action.signatureChainId !== cfg.signatureChainId) {
      throw new CommerceError('WRONG_NETWORK', `Your workspace trades on Hyperliquid ${network}; that withdrawal was signed for a different network.`);
    }
    // Hyperliquid signs `destination` as a string, so its case is part of the signed message.
    // The wallet panel always sends the lowercased main wallet; anything else is refused.
    if (action.destination !== mainWallet) {
      throw new CommerceError('DESTINATION_NOT_OWN_WALLET', 'Withdrawals can only go to your own verified wallet.', 403);
    }

    let signer: string;
    try {
      signer = await recoverTypedDataAddress({
        domain: withdrawDomain(cfg),
        types: WITHDRAW_TYPES,
        primaryType: WITHDRAW_PRIMARY_TYPE,
        message: {
          hyperliquidChain: action.hyperliquidChain,
          destination: action.destination,
          amount: action.amount,
          time: BigInt(action.time),
        },
        signature: { r: signature.r, s: signature.s, v: BigInt(signature.v) },
      });
    } catch {
      throw new CommerceError('INVALID_SIGNATURE', 'That signature could not be verified.');
    }
    if (signer.toLowerCase() !== mainWallet) {
      throw new CommerceError('SIGNER_MISMATCH', 'That withdrawal was signed by a different wallet than your trading account.', 403);
    }

    let hlStatus = 0;
    let hlBody: { status?: unknown; response?: unknown } | null = null;
    let unreachable = false;
    try {
      const res = await fetch(`${cfg.hyperliquidApi}/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, nonce, signature }),
        cache: 'no-store',
      });
      hlStatus = res.status;
      hlBody = await res.json().catch(() => null);
    } catch {
      unreachable = true;
    }

    await createServerClient().from('hosting_audit').insert({
      user_id: user.id, subscription_id: owned.hostingSubscriptionId ?? null, actor_type: 'customer', actor_id: user.id,
      action: 'funding_withdraw_relayed',
      metadata: {
        tenantSlug: tenant.slug, network, amount: action.amount, destination: action.destination,
        hlStatus, hlResponse: unreachable ? 'unreachable' : (hlBody?.status ?? null),
      },
    });

    if (unreachable) {
      throw new CommerceError('HYPERLIQUID_UNREACHABLE', 'Could not reach Hyperliquid. Check your history before trying again.', 502);
    }
    // Hyperliquid can answer HTTP 200 with status "err", so transport success alone is not acceptance.
    if (hlStatus !== 200 || hlBody?.status !== 'ok') {
      const detail = typeof hlBody?.response === 'string' ? hlBody.response : JSON.stringify(hlBody);
      throw new CommerceError('HYPERLIQUID_REJECTED', `Hyperliquid rejected the withdrawal: ${String(detail).slice(0, 240)}`, 502);
    }
    return NextResponse.json({ ok: true, status: 'ok', response: hlBody.response ?? null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    if (!(error instanceof CommerceError)) console.error('Withdrawal relay failed', error);
    return NextResponse.json(errorResponseBody(error instanceof CommerceError ? error : new CommerceError('WITHDRAWAL_FAILED', 'The withdrawal could not be relayed.', 500)), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
