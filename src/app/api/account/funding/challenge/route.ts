import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { CommerceError, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { buildChallengeMessage, challengeSecret, signChallenge, CHALLENGE_TTL_MS } from '@/lib/funding-challenge';
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
