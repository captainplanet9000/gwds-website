import { createHmac, createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const ADMIN_COOKIE = 'cival-admin-session';
const SESSION_DURATION_SECONDS = 15 * 60;

export const ADMIN_ROLES = ['owner', 'operator', 'support', 'auditor'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export interface AdminIdentity {
  userId: string;
  email: string;
  role: AdminRole;
}

interface AdminSession {
  v: 2;
  iat: number;
  exp: number;
  nonce: string;
  sub: string;
  email: string;
  role: AdminRole;
  aal: 'aal2';
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

export function createAdminSession(identity: AdminIdentity): string {
  const now = Math.floor(Date.now() / 1000);
  const session: AdminSession = {
    v: 2,
    iat: now,
    exp: now + SESSION_DURATION_SECONDS,
    nonce: randomBytes(16).toString('base64url'),
    sub: identity.userId,
    email: identity.email,
    role: identity.role,
    aal: 'aal2',
  };
  const payload = Buffer.from(JSON.stringify(session), 'utf8').toString('base64url');
  return `${payload}.${signature(payload)}`;
}

export function readAdminSession(req: NextRequest): AdminSession | null {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const [payload, suppliedSignature, extra] = token.split('.');
  if (!payload || !suppliedSignature || extra) return null;
  if (!equalText(signature(payload), suppliedSignature)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AdminSession;
    const now = Math.floor(Date.now() / 1000);
    return session.v === 2 && typeof session.nonce === 'string' && session.nonce.length >= 16
      && Number.isInteger(session.iat) && Number.isInteger(session.exp)
      && session.iat <= now + 60 && session.exp > now && session.exp - session.iat === SESSION_DURATION_SECONDS
      && typeof session.sub === 'string' && /^[0-9a-f-]{36}$/i.test(session.sub)
      && typeof session.email === 'string' && session.email.length <= 320
      && ADMIN_ROLES.includes(session.role)
      && session.aal === 'aal2'
      ? session
      : null;
  } catch {
    return null;
  }
}

export function verifyAdmin(req: NextRequest): boolean {
  return Boolean(readAdminSession(req));
}

export async function requireAdmin(
  req: NextRequest,
  allowedRoles: readonly AdminRole[] = ADMIN_ROLES,
): Promise<AdminIdentity | null> {
  const session = readAdminSession(req);
  if (!session) return null;

  const { data, error } = await createServerClient()
    .from('admin_members')
    .select('role,enabled')
    .eq('user_id', session.sub)
    .maybeSingle();
  if (error || !data?.enabled || !ADMIN_ROLES.includes(data.role as AdminRole)) return null;
  const role = data.role as AdminRole;
  if (!allowedRoles.includes(role)) return null;
  return { userId: session.sub, email: session.email, role };
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

export function adminForbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
}
