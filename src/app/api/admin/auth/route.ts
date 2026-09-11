import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, ADMIN_ROLES, clearAdminCookie, createAdminSession, requireAdmin, setAdminCookie, type AdminRole } from '@/lib/admin-auth';
import { createServerClient } from '@/lib/supabase';
import { createHmac } from 'node:crypto';
import { CommerceError, enforceRateLimit } from '@/lib/commerce';

export const runtime = 'nodejs';

function requestFingerprint(req: NextRequest): string {
  const address = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const secret = process.env.GWDS_ADMIN_SESSION_SECRET || 'unconfigured';
  return createHmac('sha256', secret).update(address).digest('hex');
}

async function audit(action: string, req: NextRequest) {
  try {
    await createServerClient().from('admin_audit').insert({ action, resource_type: 'admin_session', ip_hash: requestFingerprint(req) });
  } catch {
    // Authentication must not disclose database availability.
  }
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  return NextResponse.json(admin ? { ok: true, admin } : { ok: false }, { status: admin ? 200 : 401, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit(req, 'admin_login', 10, 15 * 60);
    const authorization = req.headers.get('authorization');
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!token || token.length > 8192) {
      await audit('admin_login_failed', req);
      return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    }

    const supabase = createServerClient();
    const { data: userResult, error: userError } = await supabase.auth.getUser(token);
    const user = userResult.user;
    if (userError || !user?.id || !user.email || !user.email_confirmed_at) {
      await audit('admin_login_failed', req);
      return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    }

    const { data: membership } = await supabase.from('admin_members').select('role,enabled').eq('user_id', user.id).maybeSingle();
    if (!membership?.enabled || !ADMIN_ROLES.includes(membership.role as AdminRole)) {
      await audit('admin_login_denied', req);
      return NextResponse.json({ ok: false, code: 'ACCESS_DENIED', error: 'Admin access is not assigned to this account.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
    }

    const { data: assurance, error: assuranceError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel(token);
    if (assuranceError || assurance.currentLevel !== 'aal2') {
      await audit('admin_mfa_required', req);
      return NextResponse.json({ ok: false, code: 'MFA_REQUIRED', error: 'Authenticator verification is required.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
    }

    const admin = { userId: user.id, email: user.email, role: membership.role as AdminRole };
    const response = NextResponse.json({ ok: true, admin }, { headers: { 'Cache-Control': 'no-store' } });
    setAdminCookie(response, createAdminSession(admin));
    await audit('admin_login_succeeded', req);
    return response;
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 503;
    return NextResponse.json({ ok: false, error: status === 429 ? 'Too many attempts. Try again later.' : 'Admin login is unavailable' }, { status, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  clearAdminCookie(response);
  await audit('admin_logout', req);
  return response;
}
