import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it } from 'vitest';
import { ADMIN_COOKIE, createAdminSession, verifyAdmin, verifyAdminPassword } from './admin-auth';

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
    process.env.GWDS_ADMIN_PASSWORD = 'a-strong-test-password';
  });

  it('uses a signed, verifiable cookie', () => {
    const token = createAdminSession();
    expect(token.split('.')).toHaveLength(2);
    expect(verifyAdmin(requestWithCookie(token))).toBe(true);
  });

  it('rejects missing and tampered cookies', () => {
    const token = createAdminSession();
    expect(verifyAdmin(requestWithCookie())).toBe(false);
    expect(verifyAdmin(requestWithCookie(`${token.slice(0, -1)}x`))).toBe(false);
  });

  it('compares the configured password without a source-code fallback', () => {
    expect(verifyAdminPassword('a-strong-test-password')).toBe(true);
    expect(verifyAdminPassword('gwds-admin-2026')).toBe(false);
    delete process.env.GWDS_ADMIN_PASSWORD;
    expect(verifyAdminPassword('a-strong-test-password')).toBe(false);
  });
});
