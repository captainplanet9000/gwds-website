import { createHash, randomBytes } from 'node:crypto';
import type { NextRequest } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase';

export const COMMERCE_VERSIONS = {
  terms: '2026-08-13',
  refunds: '2026-08-13',
  disclaimer: '2026-08-13',
} as const;

export const DOWNLOAD_TTL_SECONDS = 15 * 60;
export const DOWNLOAD_MAX_USES = 3;
export const CORE_PRODUCT_ID = 'trading-dashboard-template';
export const CORE_BUNDLE_IDS = ['multi-strat-bundle', 'everything-bundle'] as const;

export class CommerceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = 'CommerceError';
  }
}

export interface CatalogProductRow {
  id: string;
  name: string;
  price_cents: number;
  stripe_price_id: string | null;
  stripe_price_id_test: string | null;
  stripe_price_id_live: string | null;
  version: string | null;
  artifact_path: string | null;
  artifact_sha256: string | null;
  artifact_size_bytes: number | null;
  artifact_ready: boolean;
  is_active: boolean;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_cents: number;
  stripe_price_id: string | null;
  product_version: string | null;
}

export function getBearerToken(req: NextRequest): string | null {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token.length > 20 ? token : null;
}

export async function requireVerifiedUser(req: NextRequest): Promise<User> {
  const token = getBearerToken(req);
  if (!token) {
    throw new CommerceError('AUTH_REQUIRED', 'Sign in to continue.', 401);
  }

  const supabase = createServerClient();
  const { data, error } = await supabase.auth.getUser(token);
  const user = data.user;

  if (error || !user?.id || !user.email) {
    throw new CommerceError('INVALID_SESSION', 'Your session expired. Sign in again.', 401);
  }
  if (!user.email_confirmed_at && !user.confirmed_at) {
    throw new CommerceError('EMAIL_NOT_VERIFIED', 'Verify your email before purchasing.', 403);
  }
  return user;
}

export function normalizeName(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
}

export function normalizeCoupon(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const code = value.trim().toUpperCase();
  if (!code) return null;
  if (!/^[A-Z0-9_-]{2,40}$/.test(code)) {
    throw new CommerceError('INVALID_COUPON', 'That coupon code is not valid.');
  }
  return code;
}

export function newDownloadToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashDownloadToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function hashPayload(payload: string): string {
  return createHash('sha256').update(payload, 'utf8').digest('hex');
}

export async function enforceRateLimit(
  req: NextRequest,
  bucket: string,
  limit: number,
  windowSeconds: number,
) {
  const secret = process.env.CIVAL_RATE_LIMIT_SECRET;
  if (!secret || secret.length < 32) {
    throw new CommerceError('RATE_LIMIT_UNAVAILABLE', 'This service is temporarily unavailable.', 503);
  }
  const address = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const fingerprint = createHash('sha256').update(`${secret}:${address}`).digest('hex');
  const { data, error } = await createServerClient().rpc('consume_api_rate_limit', {
    p_bucket: bucket,
    p_key_hash: fingerprint,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) throw new CommerceError('RATE_LIMIT_UNAVAILABLE', 'This service is temporarily unavailable.', 503);
  if (data !== true) throw new CommerceError('RATE_LIMITED', 'Too many requests. Please try again later.', 429);
}

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return raw.replace(/\/$/, '');
}

export function isLiveStripeKey(): boolean {
  return process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ?? false;
}

export function commerceErrorMessage(raw: string): CommerceError {
  const message = raw.toUpperCase();
  if (message.includes('ARTIFACT_NOT_READY')) {
    return new CommerceError(
      'RELEASE_NOT_READY',
      'Purchases are temporarily paused while this release is being verified. No payment was taken.',
      503,
    );
  }
  if (message.includes('PRODUCT_UNAVAILABLE') || message.includes('PRODUCT_NOT_CONFIGURED')) {
    return new CommerceError('PRODUCT_UNAVAILABLE', 'One or more products are not currently available.', 409);
  }
  if (message.includes('COUPON_EXPIRED')) {
    return new CommerceError('COUPON_EXPIRED', 'That coupon has expired.');
  }
  if (message.includes('COUPON_LIMIT_REACHED')) {
    return new CommerceError('COUPON_LIMIT_REACHED', 'That coupon has reached its usage limit.');
  }
  if (message.includes('COUPON_MINIMUM_NOT_MET')) {
    return new CommerceError('COUPON_MINIMUM_NOT_MET', 'Your order does not meet this coupon’s minimum.');
  }
  if (message.includes('COUPON_NOT_APPLICABLE')) {
    return new CommerceError('COUPON_NOT_APPLICABLE', 'That coupon does not apply to these products.');
  }
  if (message.includes('INVALID_COUPON')) {
    return new CommerceError('INVALID_COUPON', 'That coupon code is not valid.');
  }
  if (message.includes('TOTAL_BELOW_STRIPE_MINIMUM')) {
    return new CommerceError('TOTAL_TOO_LOW', 'The discounted order total is below the payment minimum.');
  }
  return new CommerceError('CHECKOUT_UNAVAILABLE', 'Checkout is temporarily unavailable. No payment was taken.', 503);
}

export function errorResponseBody(error: unknown): { error: string; code: string } {
  if (error instanceof CommerceError) return { error: error.message, code: error.code };
  return { error: 'The service is temporarily unavailable.', code: 'INTERNAL_ERROR' };
}
