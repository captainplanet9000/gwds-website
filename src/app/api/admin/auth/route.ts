import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, clearAdminCookie, createAdminSession, setAdminCookie, verifyAdmin, verifyAdminPassword } from '@/lib/admin-auth';
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
  return NextResponse.json({ ok: verifyAdmin(req) }, { status: verifyAdmin(req) ? 200 : 401, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit(req, 'admin_login', 10, 15 * 60);
    const body = await req.json() as { password?: unknown };
    if (!verifyAdminPassword(body.password)) {
      await audit('admin_login_failed', req);
      return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    }

    const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    setAdminCookie(response, createAdminSession());
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

export { ADMIN_COOKIE };
