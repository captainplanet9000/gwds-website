import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const adminPassword = process.env.GWDS_ADMIN_PASSWORD || 'gwds-admin-2026';

  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const session = createAdminSession();
  const response = NextResponse.json({ success: true });
  response.cookies.set('gwds-admin-session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60,
    path: '/',
  });

  return response;
}
