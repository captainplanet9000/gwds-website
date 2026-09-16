import { NextRequest, NextResponse } from 'next/server';
import { verifyMessage, getAddress } from 'viem';
import { CommerceError, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';
import { createServerClient } from '@/lib/supabase';
import { controlClient } from '@/lib/control-plane';
import { verifyChallengeToken } from '../challenge/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Verifies a signed ownership proof and records it. Nothing here ever sees a private key —
// `signature` was produced entirely inside the customer's wallet extension/app via wagmi's
// signMessage.
//
// This does NOT — and must not — write to the control-plane `tenants` table. That table is
// owned by the host-side provisioning agent (see C:/GWDS/hosting/services/tenant-runner); a
// Vercel route mutating tenant identity directly would bypass the one architectural rule that
// keeps a compromised web request from being able to repoint whose funds a tenant trades. The
// proof is durably recorded in hosting_audit (always) and, when the customer also has a linked
// self-serve subscription, in hosting_onboarding.account_address too. If the verified address
// does not match what the control plane already has provisioned as the tenant's main wallet, the
// caller is told so plainly — reconciling that requires support, not this page.
//
// It DOES read control.tenants (never writes) to reject a wallet another, still-active tenant
// already uses — control.tenants.tenants_main_wallet_unique is a partial unique index on
// lower(main_wallet_address) WHERE status <> 'archived', which provisioning hits AFTER this route
// already said "verified": the customer gets a false-positive checkmark on a wallet that can
// never activate, then retries forever. This is a same-project PostgREST query, not a
// cross-system call — the control plane lives in the `control` schema of the same Supabase
// project (see src/lib/control-plane.ts), so nothing here is more "architecturally undesirable"
// than every other route that already calls controlClient().
// ─────────────────────────────────────────────────────────────────────────────────────────────

function parseExpiry(message: string): number | null {
  const m = /^Expires: (\d+)$/m.exec(message);
  return m ? Number(m[1]) : null;
}
function parseAddress(message: string): string | null {
  const m = /^Address: (0x[a-fA-F0-9]{40})$/m.exec(message);
  return m ? m[1] : null;
}
function parseAccount(message: string): string | null {
  const m = /^Account: (.+)$/m.exec(message);
  return m ? m[1] : null;
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);
    const body = await req.json().catch(() => ({}));
    const subscriptionId = typeof body.subscriptionId === 'string' && /^[0-9a-f-]{36}$/i.test(body.subscriptionId) ? body.subscriptionId : null;
    const message = typeof body.message === 'string' ? body.message : '';
    const token = typeof body.token === 'string' ? body.token : '';
    const signature = typeof body.signature === 'string' ? body.signature : '';
    const claimedAddress = typeof body.address === 'string' ? body.address.trim() : '';

    if (!message || !token || !signature) throw new CommerceError('INVALID_PROOF', 'Missing verification proof.');
    if (!/^0x[a-fA-F0-9]{40}$/.test(claimedAddress)) throw new CommerceError('INVALID_ADDRESS', 'Provide a valid EVM wallet address.');

    // 1. The challenge token must be one THIS server minted for THIS exact message text.
    if (!verifyChallengeToken(message, token)) {
      throw new CommerceError('CHALLENGE_INVALID', 'This verification challenge is invalid or was tampered with.', 403);
    }
    // 2. The message must actually be about this user and this address, and not expired.
    const expiresAt = parseExpiry(message);
    if (!expiresAt || Date.now() > expiresAt) {
      throw new CommerceError('CHALLENGE_EXPIRED', 'This verification challenge expired — request a new one.', 403);
    }
    if (parseAccount(message) !== user.id) {
      throw new CommerceError('CHALLENGE_ACCOUNT_MISMATCH', 'This challenge was not issued for your account.', 403);
    }
    const messageAddress = parseAddress(message);
    if (!messageAddress || messageAddress.toLowerCase() !== claimedAddress.toLowerCase()) {
      throw new CommerceError('CHALLENGE_ADDRESS_MISMATCH', 'The signed address does not match the requested address.', 403);
    }
    // 3. The signature must actually recover to the claimed address.
    const address = getAddress(claimedAddress);
    const valid = await verifyMessage({ address, message, signature: signature as `0x${string}` });
    if (!valid) throw new CommerceError('SIGNATURE_INVALID', 'That signature does not match the claimed wallet.', 403);

    const supabase = createServerClient();
    const now = new Date().toISOString();

    // 4. Refuse a wallet already bound to a DIFFERENT, still-active tenant before ever returning
    // {verified:true} — see file header. `address` is checksummed (getAddress() above) and has no
    // '%'/'_' characters, so ilike() here is a safe case-insensitive equality check, not a wildcard
    // match (unlike the owner_email caution documented in src/lib/control-plane.ts).
    const cp = controlClient();
    const { data: collisions, error: collisionError } = await cp.from('tenants')
      .select('id, hosting_subscription_id')
      .neq('status', 'archived')
      .ilike('main_wallet_address', address);
    if (collisionError) throw new CommerceError('WALLET_CHECK_FAILED', 'Could not check wallet availability. Please retry.', 503);
    if (collisions && collisions.length > 0) {
      const ownSubscriptionIds = new Set<string>(subscriptionId ? [subscriptionId] : []);
      const { data: mySubs, error: mySubsError } = await supabase.from('hosting_subscriptions').select('id').eq('user_id', user.id);
      if (mySubsError) throw new CommerceError('WALLET_CHECK_FAILED', 'Could not check wallet availability. Please retry.', 503);
      for (const sub of (mySubs || []) as Array<{ id: string }>) ownSubscriptionIds.add(sub.id);
      const isForeign = (collisions as Array<{ hosting_subscription_id: string | null }>)
        .some(t => !t.hosting_subscription_id || !ownSubscriptionIds.has(t.hosting_subscription_id));
      if (isForeign) {
        throw new CommerceError(
          'WALLET_ALREADY_IN_USE',
          'This wallet already runs a different Cival workspace and cannot be linked here. Verify a different wallet, or contact support if you believe this is a mistake.',
          409,
        );
      }
    }

    // A successful response must mean the host agent can read the durable proof.
    // Refuse foreign subscriptions before writing either half of the proof.
    if (subscriptionId) {
      const { data: subscription, error } = await supabase.from('hosting_subscriptions').select('id').eq('id', subscriptionId).eq('user_id', user.id).maybeSingle();
      if (error) throw new CommerceError('SUBSCRIPTION_UNAVAILABLE', 'Your subscription could not be verified.', 503);
      if (!subscription) throw new CommerceError('SUBSCRIPTION_NOT_FOUND', 'This subscription does not belong to your account.', 403);
    }

    const { error: auditError } = await supabase.from('hosting_audit').insert({
      user_id: user.id, subscription_id: subscriptionId, actor_type: 'customer',
      actor_id: user.id, action: 'funding_wallet_verified', metadata: { address },
    });
    if (auditError) throw new CommerceError('PROOF_STORAGE_FAILED', 'Your wallet proof could not be saved. Please retry.', 503);

    // Write designation last: the provisioning reader requires BOTH records.
    // A failed designation leaves only valid signed evidence; retry is safe.
    if (subscriptionId) {
      const { data, error } = await supabase.from('hosting_onboarding')
        .update({ account_address: address, updated_at: now })
        .eq('subscription_id', subscriptionId).eq('user_id', user.id)
        .select('id').maybeSingle();
      if (error || !data) throw new CommerceError('WALLET_LINK_FAILED', 'Your wallet could not be linked to onboarding. Please retry.', 503);
    }

    return NextResponse.json({ verified: true, address, verifiedAt: now });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    if (!(error instanceof CommerceError)) console.error('Wallet verification failed', error);
    return NextResponse.json(errorResponseBody(error instanceof CommerceError ? error : new CommerceError('WALLET_VERIFICATION_FAILED', 'Wallet verification failed.', 500)), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
