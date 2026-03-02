import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_COOKIE = 'gwds-admin-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function verifyAdmin(req: NextRequest): boolean {
  const cookie = req.cookies.get(ADMIN_COOKIE);
  if (!cookie) return false;
  try {
    const session = JSON.parse(Buffer.from(cookie.value, 'base64').toString());
    return session.authenticated && Date.now() < session.expires;
  } catch { return false; }
}

export function createAdminSession(): string {
  const session = { authenticated: true, expires: Date.now() + SESSION_DURATION };
  return Buffer.from(JSON.stringify(session)).toString('base64');
}

export function adminUnauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
