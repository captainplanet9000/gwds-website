import { createHmac, timingSafeEqual } from 'node:crypto';
import { CommerceError } from '@/lib/commerce';

export function normalizeNewsletterEmail(value: unknown): string {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new CommerceError('INVALID_EMAIL', 'Enter a valid email address.');
  }
  return email;
}

export function newsletterToken(email: string): string {
  const secret = process.env.NEWSLETTER_SIGNING_SECRET;
  if (!secret || secret.length < 32) {
    throw new CommerceError('NEWSLETTER_UNAVAILABLE', 'Newsletter service is unavailable.', 503);
  }
  return createHmac('sha256', secret).update(email).digest('base64url');
}

export function validNewsletterToken(email: string, token: string): boolean {
  const expected = newsletterToken(email);
  const left = Buffer.from(expected);
  const right = Buffer.from(token);
  return left.length === right.length && timingSafeEqual(left, right);
}
