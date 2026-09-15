import { NextRequest, NextResponse } from 'next/server';
import { isAddress, recoverTypedDataAddress } from 'viem';
import { CommerceError, enforceRateLimit, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';
import { createServerClient } from '@/lib/supabase';
import {
  controlClient, resolveOwnedTenant, resolveTenantNetwork, TenantOwnershipError, tenantOwnershipCommerceError,
} from '@/lib/control-plane';
import { approveAgentTypedData, exchangeEndpoint, type ApproveAgentAction } from '@/lib/hyperliquid-agent';
import { FUNDING_NETWORKS } from '@/lib/hyperliquid-funding';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HEX32 = /^0x[0-9a-fA-F]{64}$/;
const EXPECTED_FIELDS = 'agentAddress,agentName,hyperliquidChain,nonce,signatureChainId,type';
const MAX_SIGNATURE_AGE_MS = 10 * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────────────────────────
// A PURE RELAY for an action the customer's own wallet has ALREADY signed, client-side, via
// wagmi's useSignTypedData. This route exists only to avoid a browser-to-Hyperliquid CORS
// dependency — it never has, needs, or could construct a valid signature itself, because it
// never has the customer's private key. That signature was produced entirely inside their
// wallet extension/app before this request was ever sent.
//
// Restricted to type "approveAgent" only, and only for the api_wallet_address the control plane
// already recorded for THIS customer's own tenant (resolved via resolveOwnedTenant, the same
// owner_email correspondence dashboard-link and the instance page use, narrowed by the purchase
// link to this user) — so even a compromised/malicious client
// cannot repurpose this into a generic signed-message proxy to Hyperliquid.
//
// It also recovers the signer and requires it to be the tenant's verified main wallet.
// Hyperliquid applies an approval to whichever account signed it, so without this check a
// customer who connected a different wallet would approve the agent on the wrong account and
// their tenant would silently be unable to trade. The action must be signed for the TENANT's
// network and within the last 10 minutes.
// ─────────────────────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);
    await enforceRateLimit(req, 'funding_approve_agent', 10, 60);
    const body = await req.json().catch(() => ({}));
    const { action, nonce, signature } = body || {};

    if (!action || typeof action !== 'object' || Array.isArray(action) || action.type !== 'approveAgent') {
      throw new CommerceError('INVALID_ACTION', 'Only a signed approveAgent action may be relayed here.');
    }
    if (Object.keys(action).sort().join(',') !== EXPECTED_FIELDS) {
      throw new CommerceError('INVALID_ACTION', 'Unexpected approveAgent fields.');
    }
    if (typeof action.agentName !== 'string' || typeof action.agentAddress !== 'string' || !isAddress(action.agentAddress, { strict: false })) {
      throw new CommerceError('INVALID_ACTION', 'Invalid agent address or name.');
    }
    // Hyperliquid's /exchange wants {r, s, v}. A wallet returns a hex string; the client splits it
    // (viem parseSignature) before posting.
    if (
      !signature || typeof signature !== 'object'
      || !HEX32.test(String(signature.r)) || !HEX32.test(String(signature.s))
      || (signature.v !== 27 && signature.v !== 28)
    ) {
      throw new CommerceError('INVALID_SIGNATURE', 'Missing or malformed signature: send {r, s, v}.');
    }
    if (!Number.isSafeInteger(nonce) || nonce !== action.nonce) {
      throw new CommerceError('INVALID_NONCE', 'Nonce mismatch between action and request.');
    }
    if (Math.abs(Date.now() - nonce) > MAX_SIGNATURE_AGE_MS) {
      throw new CommerceError('SIGNATURE_EXPIRED', 'This approval signature has expired. Please sign it again.');
    }

    const subscriptionId = body.subscriptionId ?? null;
    const supabase = createServerClient();
    if (subscriptionId !== null) {
      if (typeof subscriptionId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subscriptionId)) {
        throw new CommerceError('INVALID_SUBSCRIPTION', 'Invalid subscription.');
      }
      const { data, error } = await supabase.from('hosting_subscriptions')
        .select('id').eq('id', subscriptionId).eq('user_id', user.id).maybeSingle();
      if (error) throw new CommerceError('SUBSCRIPTION_LOOKUP_FAILED', 'Your subscription could not be verified.', 503);
      if (!data) throw new CommerceError('SUBSCRIPTION_NOT_OWNED', 'This subscription does not belong to your account.', 403);
    }

    const cp = controlClient();
    let owned;
    try {
      owned = await resolveOwnedTenant(cp, user.email!, { userId: user.id, subscriptionId: subscriptionId ?? undefined });
    } catch (err) {
      if (err instanceof TenantOwnershipError) throw tenantOwnershipCommerceError(err);
      throw err;
    }
    const { data: tenant, error: tenantError } = await cp.from('tenants')
      .select('slug, api_wallet_address, main_wallet_address').eq('id', owned.id).single();
    if (tenantError || !tenant) throw new CommerceError('TENANT_LOOKUP_FAILED', 'Your tenant status could not be loaded.', 503);
    if (!tenant.api_wallet_address) {
      throw new CommerceError('AGENT_WALLET_NOT_PROVISIONED', 'Your tenant does not have an agent wallet to approve yet.', 409);
    }
    if (String(action.agentAddress).toLowerCase() !== String(tenant.api_wallet_address).toLowerCase()) {
      throw new CommerceError('AGENT_ADDRESS_MISMATCH', "That agent address does not match your tenant's provisioned agent wallet — refusing to relay.", 403);
    }
    if (!tenant.main_wallet_address) {
      throw new CommerceError('MAIN_WALLET_NOT_PROVISIONED', 'Your trading account is not set up yet. Verify your wallet and wait for provisioning to finish.', 409);
    }

    const network = await resolveTenantNetwork(cp, owned.id);
    const cfg = FUNDING_NETWORKS[network];
    if (action.hyperliquidChain !== cfg.hyperliquidChain || action.signatureChainId !== cfg.signatureChainId) {
      throw new CommerceError('WRONG_NETWORK', `Your workspace trades on Hyperliquid ${network}; that approval was signed for a different network.`);
    }

    let signer: string;
    try {
      signer = await recoverTypedDataAddress({
        ...approveAgentTypedData(action as ApproveAgentAction),
        signature: { r: signature.r, s: signature.s, v: BigInt(signature.v) },
      });
    } catch {
      throw new CommerceError('INVALID_SIGNATURE', 'That signature could not be verified.');
    }
    if (signer.toLowerCase() !== String(tenant.main_wallet_address).toLowerCase()) {
      throw new CommerceError(
        'SIGNER_MISMATCH',
        `That approval was signed by ${signer}, but your trading account is ${tenant.main_wallet_address}. Switch to that wallet and sign again.`,
        403,
      );
    }

    const hlRes = await fetch(exchangeEndpoint(network), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, nonce, signature }),
    });
    const hlBody = await hlRes.json().catch(() => ({}));

    await supabase.from('hosting_audit').insert({
      user_id: user.id, subscription_id: subscriptionId, actor_type: 'customer', actor_id: user.id,
      action: 'funding_agent_approval_relayed',
      metadata: { tenantSlug: tenant.slug, network, agentAddress: action.agentAddress, hlStatus: hlRes.status, hlResponse: hlBody?.status ?? null },
    });

    // The exchange can return HTTP 200 with status "err". Transport success is
    // not confirmation that the customer's agent authorization was accepted.
    if (!hlRes.ok || hlBody?.status !== 'ok' || hlBody?.response?.type !== 'default') {
      throw new CommerceError('HYPERLIQUID_REJECTED', `Hyperliquid rejected the approval: ${JSON.stringify(hlBody).slice(0, 300)}`, 502);
    }

    return NextResponse.json({ ok: true, hyperliquid: hlBody }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    if (!(error instanceof CommerceError)) console.error('Agent approval relay failed', error);
    return NextResponse.json(errorResponseBody(error instanceof CommerceError ? error : new CommerceError('AGENT_APPROVAL_FAILED', 'Agent approval could not be relayed.', 500)), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
