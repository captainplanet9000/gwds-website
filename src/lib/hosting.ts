import { createCipheriv, createHash, randomBytes } from 'node:crypto';
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
    description: 'One supervised agent with managed updates and operations.',
    features: ['One live agent', '250 agent-hours', 'Core Edition licence included'],
  },
  {
    id: 'desk',
    name: 'Desk',
    priceCents: 7900,
    priceLabel: '$79',
    intervalLabel: '/ month',
    description: 'Six coordinated agents with shared risk controls.',
    features: ['Six-agent farm', '1,000 agent-hours', 'Desk Edition licence included', 'Priority support'],
    featured: true,
  },
  {
    id: 'fund',
    name: 'Fund',
    priceCents: 29900,
    priceLabel: '$299',
    intervalLabel: '/ month',
    description: 'Dedicated multi-workspace runtime for professional teams.',
    features: ['Dedicated workers', 'Multiple workspaces', 'Team access', 'Private agent delivery'],
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

function encryptionKey(): Buffer {
  const configured = process.env.HOSTING_CREDENTIAL_MASTER_KEY;
  if (!configured) throw new CommerceError('CREDENTIAL_VAULT_UNAVAILABLE', 'Credential storage is not configured.', 503);
  const decoded = /^[a-f0-9]{64}$/i.test(configured)
    ? Buffer.from(configured, 'hex')
    : Buffer.from(configured, 'base64');
  if (decoded.length !== 32) {
    throw new CommerceError('CREDENTIAL_VAULT_UNAVAILABLE', 'Credential storage is not configured.', 503);
  }
  return decoded;
}

export function encryptHostingCredential(secret: string, context: string) {
  if (secret.length < 16 || secret.length > 4096) {
    throw new CommerceError('INVALID_CREDENTIAL', 'The credential format is not valid.');
  }
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  cipher.setAAD(Buffer.from(context, 'utf8'));
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
    fingerprint: createHash('sha256').update(secret, 'utf8').digest('hex'),
    lastFour: secret.slice(-4),
    keyVersion: Number(process.env.HOSTING_CREDENTIAL_KEY_VERSION || '1'),
  };
}

export function publicHostingConfig() {
  return {
    salesEnabled: hostingSalesEnabled(),
    serviceTermsVersion: HOSTING_SERVICE_TERMS_VERSION,
  };
}
