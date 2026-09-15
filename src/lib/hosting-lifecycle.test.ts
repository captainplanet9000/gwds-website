import { describe, expect, it } from 'vitest';
import {
  WALLET_UNVERIFIED_ERROR_CODE,
  deriveProvisionState,
  provisionPollDelayMs,
  selectCurrentSubscription,
} from '@/lib/hosting-lifecycle';

describe('current subscription selection', () => {
  it('prefers an open subscription over a newer closed one', () => {
    const rows = [
      { id: 'new', status: 'canceled' },
      { id: 'old', status: 'active' },
    ];
    expect(selectCurrentSubscription(rows)).toEqual({ current: rows[1], lastClosed: null });
  });

  // A canceled or abandoned checkout used to stay "the" subscription forever, hiding the plan
  // picker, so a customer could never subscribe again.
  it('treats canceled and abandoned subscriptions as history, not the current one', () => {
    const rows = [
      { id: 'abandoned', status: 'incomplete_expired' },
      { id: 'canceled', status: 'canceled' },
    ];
    expect(selectCurrentSubscription(rows)).toEqual({ current: null, lastClosed: rows[0] });
  });

  it('treats incomplete and pending checkout as open, as the server refuses a second checkout for them', () => {
    expect(selectCurrentSubscription([{ id: 'a', status: 'incomplete' }]).current?.id).toBe('a');
    expect(selectCurrentSubscription([{ id: 'b', status: 'pending_checkout' }]).current?.id).toBe('b');
  });

  it('handles an account with no subscriptions', () => {
    expect(selectCurrentSubscription(undefined)).toEqual({ current: null, lastClosed: null });
    expect(selectCurrentSubscription([])).toEqual({ current: null, lastClosed: null });
  });
});

describe('provision state', () => {
  const provisioning = { status: 'provisioning' };

  it.each([
    ['checkout not paid', 'pending_checkout', null, null, 'checkout_pending'],
    ['first payment incomplete', 'incomplete', null, null, 'checkout_pending'],
    ['paid, no tenant yet', 'active', null, null, 'setting_up'],
    ['billing lapsed before any tenant', 'past_due', null, null, 'inactive'],
    ['tenant waiting for the wallet, no command queued', 'active', provisioning, null, 'wallet_needed'],
    ['provision refused for an unverified wallet', 'active', provisioning,
      { status: 'failed', errorCode: WALLET_UNVERIFIED_ERROR_CODE }, 'wallet_needed'],
    ['provision failed for another reason', 'active', provisioning,
      { status: 'failed', errorCode: 'provision.tenant_not_halted' }, 'failed'],
    ['provision failed with no code (transient)', 'active', provisioning, { status: 'failed', errorCode: null }, 'failed'],
    ['provision queued', 'trialing', provisioning, { status: 'queued' }, 'in_progress'],
    ['provision claimed', 'active', provisioning, { status: 'claimed' }, 'in_progress'],
    ['tenant active', 'active', { status: 'active' }, { status: 'done' }, 'ready'],
    ['tenant suspended', 'past_due', { status: 'suspended' }, { status: 'done' }, 'inactive'],
  ])('%s', (_label, subscriptionStatus, tenant, command, expected) => {
    expect(deriveProvisionState({ subscriptionStatus, tenant, command })).toBe(expected);
  });
});

describe('provision polling cadence', () => {
  it('polls fast while the system works, slowly while it waits on a person, and stops when settled', () => {
    expect(provisionPollDelayMs('setting_up')).toBe(6_000);
    expect(provisionPollDelayMs('in_progress')).toBe(6_000);
    expect(provisionPollDelayMs('wallet_needed')).toBe(20_000);
    expect(provisionPollDelayMs('failed')).toBe(20_000);
    expect(provisionPollDelayMs('ready')).toBeNull();
    expect(provisionPollDelayMs('inactive')).toBeNull();
    expect(provisionPollDelayMs('checkout_pending')).toBeNull();
  });
});
