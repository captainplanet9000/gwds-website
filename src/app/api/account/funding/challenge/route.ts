import { NextRequest, NextResponse } from 'next/server';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { CommerceError, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Stateless ownership-proof challenge. No database row, no server memory — the "state" is
// entirely the HMAC token, which only this server can produce or check. This is fine here
// because the only thing this proves is "this browser controls this address's private key";
// it never authorizes a fund movement, so there is nothing worth building replay-protection
// storage for beyond the short expiry below.
// ─────────────────────────────────────────────────────────────────────────────────────────────

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

function challengeSecret(): string | null {
  const secret = process.env.WALLET_CHALLENGE_SECRET;
  return secret && secret.length >= 16 ? secret : null;
}

export function buildChallengeMessage(userId: string, address: string, issuedAt: number, nonce: string) {
  return [
    'Cival Systems — Funding Wallet Verification',
    `Account: ${userId}`,
    `Address: ${address.toLowerCase()}`,
    `Issued: ${issuedAt}`,
    `Expires: ${issuedAt + CHALLENGE_TTL_MS}`,
    `Nonce: ${nonce}`,
    '',
    'Signing this message proves you control this wallet. It authorizes nothing else — no funds move and no trade is placed.',
  ].join('\n');
}

export function signChallenge(message: string, secret: string): string {
  return createHmac('sha256', secret).update(message, 'utf8').digest('base64url');
}

export function verifyChallengeToken(message: string, token: string): boolean {
  const secret = challengeSecret();
  if (!secret) return false;
  const expected = Buffer.from(signChallenge(message, secret));
  const given = Buffer.from(String(token || ''));
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);
    const secret = challengeSecret();
    if (!secret) {
      throw new CommerceError('WALLET_VERIFICATION_UNAVAILABLE', 'Wallet verification is not configured on this deployment.', 503);
    }
    const body = await req.json().catch(() => ({}));
    const address = typeof body.address === 'string' ? body.address.trim() : '';
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new CommerceError('INVALID_ADDRESS', 'Provide a valid EVM wallet address.');
    }
    const issuedAt = Date.now();
    const nonce = randomBytes(12).toString('hex');
    const message = buildChallengeMessage(user.id, address, issuedAt, nonce);
    const token = signChallenge(message, secret);
    return NextResponse.json({ message, token, expiresAt: issuedAt + CHALLENGE_TTL_MS });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
