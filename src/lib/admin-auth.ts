import { createHmac, createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export const ADMIN_COOKIE = 'cival-admin-session';
const SESSION_DURATION_SECONDS = 8 * 60 * 60;

interface AdminSession {
  v: 1;
  iat: number;
  exp: number;
  nonce: string;
}

function sessionSecret(): string {
  const secret = process.env.GWDS_ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('GWDS_ADMIN_SESSION_SECRET is not configured');
  return secret;
}

function signature(payload: string): string {
  return createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
}

function equalText(left: string, right: string): boolean {
  const leftHash = createHash('sha256').update(left).digest();
  const rightHash = createHash('sha256').update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function verifyAdminPassword(password: unknown): boolean {
  const expected = process.env.GWDS_ADMIN_PASSWORD;
  return typeof password === 'string' && password.length <= 256
    && typeof expected === 'string' && expected.length >= 16
    && equalText(password, expected);
}

export function createAdminSession(): string {
  const now = Math.floor(Date.now() / 1000);
  const session: AdminSession = {
    v: 1,
    iat: now,
    exp: now + SESSION_DURATION_SECONDS,
    nonce: randomBytes(16).toString('base64url'),
  };
  const payload = Buffer.from(JSON.stringify(session), 'utf8').toString('base64url');
  return `${payload}.${signature(payload)}`;
}

export function verifyAdmin(req: NextRequest): boolean {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const [payload, suppliedSignature, extra] = token.split('.');
  if (!payload || !suppliedSignature || extra) return false;
  if (!equalText(signature(payload), suppliedSignature)) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AdminSession;
    const now = Math.floor(Date.now() / 1000);
    return session.v === 1 && typeof session.nonce === 'string' && session.nonce.length >= 16
      && Number.isInteger(session.iat) && Number.isInteger(session.exp)
      && session.iat <= now + 60 && session.exp > now && session.exp - session.iat === SESSION_DURATION_SECONDS;
  } catch {
    return false;
  }
}

export function setAdminCookie(response: NextResponse, value: string) {
  response.cookies.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION_SECONDS,
    path: '/',
    priority: 'high',
  });
}

export function clearAdminCookie(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
}

export function adminUnauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
}
