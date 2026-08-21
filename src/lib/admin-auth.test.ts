import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it } from 'vitest';
import { ADMIN_COOKIE, createAdminSession, readAdminSession, verifyAdmin } from './admin-auth';

const identity = {
  userId: '84e6814e-3019-4652-ad06-862a76dc6ed6',
  email: 'owner@example.com',
  role: 'owner' as const,
};

function requestWithCookie(value?: string): NextRequest {
  return {
    cookies: {
      get: (name: string) => name === ADMIN_COOKIE && value ? { name, value } : undefined,
    },
  } as unknown as NextRequest;
}

describe('admin sessions', () => {
  beforeEach(() => {
    process.env.GWDS_ADMIN_SESSION_SECRET = 'test-session-secret-that-is-longer-than-thirty-two-characters';
  });

  it('uses a signed, verifiable cookie', () => {
    const token = createAdminSession(identity);
    expect(token.split('.')).toHaveLength(2);
    expect(verifyAdmin(requestWithCookie(token))).toBe(true);
    expect(readAdminSession(requestWithCookie(token))?.role).toBe('owner');
  });

  it('rejects missing and tampered cookies', () => {
    const token = createAdminSession(identity);
    expect(verifyAdmin(requestWithCookie())).toBe(false);
    expect(verifyAdmin(requestWithCookie(`${token.slice(0, -1)}x`))).toBe(false);
  });
});
