import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /api/admin/* routes (except auth/login endpoints)
  if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/auth') && !pathname.startsWith('/api/admin/login')) {
    const cookie = req.cookies.get('gwds-admin-session');
    if (!cookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      const session = JSON.parse(Buffer.from(cookie.value, 'base64').toString());
      if (!session.authenticated || Date.now() >= session.expires) {
        return NextResponse.json({ error: 'Session expired' }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*'],
};
