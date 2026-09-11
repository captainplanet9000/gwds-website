import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type Stripe from 'stripe';
import {
  hostingSalesEnabled,
  normalizeHostingText,
  parsePeriod,
  planExecutionMode,
} from '@/lib/hosting';

describe('managed hosting safety helpers', () => {
  const originalSales = process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED = 'false';
  });

  afterEach(() => {
    if (originalSales === undefined) delete process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED;
    else process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED = originalSales;
  });

  // A free plan that could execute live orders is an abuse vector with no cost to the abuser, and
  // it burns the same shared exchange request budget as a paying tenant. Price is what decides it.
  it('never arms live execution on a free plan', () => {
    expect(planExecutionMode(0)).toBe('simulated');
    expect(planExecutionMode(-1)).toBe('simulated');
    expect(planExecutionMode(1900)).toBe('live');
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
