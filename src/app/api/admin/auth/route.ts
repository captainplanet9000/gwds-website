import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const adminPass = process.env.GWDS_ADMIN_PASSWORD || 'gwds-admin-2026';

  if (password === adminPass) {
    const session = createAdminSession();
    const response = NextResponse.json({ ok: true });
    response.cookies.set('gwds-admin-session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });
    return response;
  }
  return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
}
