import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/admin-auth';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const loginRoute = pathname === '/api/admin/auth' || pathname === '/api/admin/login';
  if (loginRoute) return NextResponse.next();

  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const origin = req.headers.get('origin');
    if (origin && origin !== req.nextUrl.origin) {
      return NextResponse.json({ error: 'Invalid origin' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
    }
  }

  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = { matcher: ['/api/admin/:path*'] };
