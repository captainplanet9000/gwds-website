import { createHmac, timingSafeEqual } from 'node:crypto';
export const CHALLENGE_TTL_MS = 5 * 60 * 1000;

export function challengeSecret(): string | null {
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
