import { NextRequest, NextResponse } from 'next/server';
import { CommerceError, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';
import { encryptHostingCredential } from '@/lib/hosting';
import { createServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    if (Number(req.headers.get('content-length') || '0') > 8_192) throw new CommerceError('REQUEST_TOO_LARGE', 'The request is too large.', 413);
    const user = await requireVerifiedUser(req);
    const body = await req.json() as { instanceId?: unknown; credentialType?: unknown; secret?: unknown };
    const instanceId = typeof body.instanceId === 'string' ? body.instanceId : '';
    const credentialType = body.credentialType;
    if (!/^[0-9a-f-]{36}$/i.test(instanceId)
      || !['openai_api_key', 'hyperliquid_api_wallet'].includes(String(credentialType))
      || typeof body.secret !== 'string') {
      throw new CommerceError('INVALID_CREDENTIAL', 'Credential input is invalid.');
    }

    const supabase = createServerClient();
    const { data: instance } = await supabase.from('hosting_instances').select('id,subscription_id,status').eq('id', instanceId).eq('user_id', user.id).maybeSingle();
    if (!instance || ['decommissioning', 'decommissioned'].includes(instance.status)) throw new CommerceError('INSTANCE_UNAVAILABLE', 'This hosting instance cannot accept credentials.', 409);

    const encrypted = encryptHostingCredential(body.secret, `${user.id}:${instanceId}:${credentialType}`);
    const now = new Date().toISOString();
    const { error } = await supabase.from('hosting_credentials').upsert({
      instance_id: instanceId, user_id: user.id, credential_type: credentialType,
      ciphertext: encrypted.ciphertext, iv: encrypted.iv, auth_tag: encrypted.authTag,
      key_version: encrypted.keyVersion, fingerprint: encrypted.fingerprint, last_four: encrypted.lastFour,
      status: 'pending_verification', verified_at: null, revoked_at: null, rotated_at: now, updated_at: now,
    }, { onConflict: 'instance_id,credential_type' });
    if (error) throw new CommerceError('CREDENTIAL_SAVE_FAILED', 'The credential could not be secured.', 503);
    await supabase.from('hosting_audit').insert({ user_id: user.id, subscription_id: instance.subscription_id, instance_id: instanceId, actor_type: 'customer', actor_id: user.id, action: 'credential_rotated', metadata: { credential_type: credentialType, last_four: encrypted.lastFour } });
    return NextResponse.json({ ok: true, credentialType, lastFour: encrypted.lastFour, status: 'pending_verification' });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);
    const body = await req.json() as { instanceId?: unknown; credentialType?: unknown };
    const instanceId = typeof body.instanceId === 'string' ? body.instanceId : '';
    const credentialType = body.credentialType;
    if (!/^[0-9a-f-]{36}$/i.test(instanceId)
      || !['openai_api_key', 'hyperliquid_api_wallet'].includes(String(credentialType))) {
      throw new CommerceError('INVALID_CREDENTIAL', 'Credential input is invalid.');
    }
    const supabase = createServerClient();
    const { data: instance } = await supabase.from('hosting_instances').select('subscription_id').eq('id', instanceId).eq('user_id', user.id).maybeSingle();
    if (!instance) throw new CommerceError('INSTANCE_UNAVAILABLE', 'This hosting instance was not found.', 404);
    await supabase.from('hosting_credentials').update({ status: 'revoked', revoked_at: new Date().toISOString(), ciphertext: 'revoked', iv: 'revoked', auth_tag: 'revoked', updated_at: new Date().toISOString() })
      .eq('instance_id', instanceId).eq('user_id', user.id).eq('credential_type', credentialType);
    await supabase.from('hosting_audit').insert({ user_id: user.id, subscription_id: instance.subscription_id, instance_id: instanceId, actor_type: 'customer', actor_id: user.id, action: 'credential_revoked', metadata: { credential_type: credentialType } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
