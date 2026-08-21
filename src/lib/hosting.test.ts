import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type Stripe from 'stripe';
import {
  HOSTING_PLAN_COPY,
  encryptHostingCredential,
  hostingSalesEnabled,
  normalizeHostingText,
  parsePeriod,
} from '@/lib/hosting';

describe('managed hosting safety helpers', () => {
  const originalKey = process.env.HOSTING_CREDENTIAL_MASTER_KEY;
  const originalVersion = process.env.HOSTING_CREDENTIAL_KEY_VERSION;
  const originalSales = process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED;

  beforeEach(() => {
    process.env.HOSTING_CREDENTIAL_MASTER_KEY = Buffer.alloc(32, 7).toString('base64');
    process.env.HOSTING_CREDENTIAL_KEY_VERSION = '3';
    process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED = 'false';
  });

  afterEach(() => {
    if (originalKey === undefined) delete process.env.HOSTING_CREDENTIAL_MASTER_KEY;
    else process.env.HOSTING_CREDENTIAL_MASTER_KEY = originalKey;
    if (originalVersion === undefined) delete process.env.HOSTING_CREDENTIAL_KEY_VERSION;
    else process.env.HOSTING_CREDENTIAL_KEY_VERSION = originalVersion;
    if (originalSales === undefined) delete process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED;
    else process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED = originalSales;
  });

  it('keeps all public plans unique and nonnegative', () => {
    expect(new Set(HOSTING_PLAN_COPY.map((plan) => plan.id)).size).toBe(HOSTING_PLAN_COPY.length);
    expect(HOSTING_PLAN_COPY.every((plan) => plan.priceCents >= 0)).toBe(true);
  });

  it('keeps hosting sales disabled unless explicitly enabled', () => {
    expect(hostingSalesEnabled()).toBe(false);
    process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED = 'true';
    expect(hostingSalesEnabled()).toBe(true);
    process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED = 'TRUE';
    expect(hostingSalesEnabled()).toBe(false);
  });

  it('normalizes customer text and rejects an empty required field', () => {
    expect(normalizeHostingText('  alpha\u0000   desk  ', 40, true)).toBe('alpha desk');
    expect(() => normalizeHostingText('   ', 40, true)).toThrow('required field');
  });

  it('encrypts credentials with random authenticated ciphertext and a stable fingerprint', () => {
    const secret = '0x0123456789abcdef0123456789abcdef';
    const first = encryptHostingCredential(secret, 'user:instance:wallet');
    const second = encryptHostingCredential(secret, 'user:instance:wallet');
    expect(first.ciphertext).not.toContain(secret);
    expect(first.ciphertext).not.toBe(second.ciphertext);
    expect(first.iv).not.toBe(second.iv);
    expect(first.authTag).toHaveLength(24);
    expect(first.fingerprint).toBe(second.fingerprint);
    expect(first.lastFour).toBe('cdef');
    expect(first.keyVersion).toBe(3);
  });

  it('refuses malformed encryption keys', () => {
    process.env.HOSTING_CREDENTIAL_MASTER_KEY = 'not-a-32-byte-key';
    expect(() => encryptHostingCredential('0123456789abcdef', 'context')).toThrow('not configured');
  });

  it('reads billing periods from current Stripe subscription items', () => {
    const subscription = {
      trial_end: 1_800_000_000,
      items: { data: [{ current_period_start: 1_700_000_000, current_period_end: 1_700_086_400 }] },
    } as unknown as Stripe.Subscription;
    const period = parsePeriod(subscription);
    expect(period.start).toBe(new Date(1_700_000_000 * 1000).toISOString());
    expect(period.end).toBe(new Date(1_700_086_400 * 1000).toISOString());
    expect(period.trialEnd).toBe(new Date(1_800_000_000 * 1000).toISOString());
  });
});
