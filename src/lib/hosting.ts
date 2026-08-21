import type Stripe from 'stripe';
import { CommerceError } from '@/lib/commerce';

export const HOSTING_SERVICE_TERMS_VERSION = '2026-08-20';

export const HOSTING_PLAN_COPY = [
  {
    id: 'paper',
    name: 'Paper',
    priceCents: 0,
    priceLabel: 'Free',
    intervalLabel: '',
    description: 'A private managed workspace for simulated execution and onboarding.',
    features: ['Full hosted dashboard', 'One paper agent', 'No card required'],
  },
  {
    id: 'solo',
    name: 'Solo',
    priceCents: 1900,
    priceLabel: '$19',
    intervalLabel: '/ month',
    description: 'One private paper workspace with cloud saves and managed updates.',
    features: ['Private paper workspace', 'Verified customer sign-in', 'Core Edition licence included'],
  },
  {
    id: 'desk',
    name: 'Desk',
    priceCents: 7900,
    priceLabel: '$79',
    intervalLabel: '/ month',
    description: 'A managed paper-research desk with priority operations support.',
    features: ['Coordinated paper agents', 'Cloud workspace backups', 'Release updates', 'Priority support'],
    featured: true,
  },
  {
    id: 'fund',
    name: 'Fund',
    priceCents: 29900,
    priceLabel: '$299',
    intervalLabel: '/ month',
    description: 'A custom paper-research deployment for professional teams.',
    features: ['Dedicated deployment', 'Custom onboarding', 'Role-planning workshop', 'Private support channel'],
  },
] as const;

export const HOSTING_AGENT_IDS = [
  'darvas-box',
  'elliott-wave',
  'vwap-momentum',
  'heikin-ashi',
  'mean-reversion',
  'macro-sentiment',
  'regime-coordinator',
] as const;

export function hostingSalesEnabled() {
  return process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED === 'true';
}

export function hostingLaunchMessage() {
  return 'Hosted subscriptions are paused until the runtime, tenant isolation, monitoring, and recovery launch gates pass. No payment was taken.';
}

export function normalizeHostingText(value: unknown, maxLength: number, required = false): string | null {
  if (typeof value !== 'string') {
    if (required) throw new CommerceError('INVALID_INPUT', 'A required field is missing.');
    return null;
  }
  const normalized = value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
  if (required && !normalized) throw new CommerceError('INVALID_INPUT', 'A required field is missing.');
  return normalized || null;
}

export function parsePeriod(subscription: Stripe.Subscription) {
  const record = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };
  const item = subscription.items.data[0] as Stripe.SubscriptionItem & {
    current_period_start?: number;
    current_period_end?: number;
  };
  const start = record.current_period_start ?? item?.current_period_start;
  const end = record.current_period_end ?? item?.current_period_end;
  return {
    start: start ? new Date(start * 1000).toISOString() : null,
    end: end ? new Date(end * 1000).toISOString() : null,
    trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
  };
}

export function publicHostingConfig() {
  return {
    salesEnabled: hostingSalesEnabled(),
    serviceTermsVersion: HOSTING_SERVICE_TERMS_VERSION,
  };
}
