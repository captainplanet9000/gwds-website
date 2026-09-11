import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { processOneHostingTask } from '@/lib/hosting-worker';

export const runtime = 'nodejs';
export const maxDuration = 60;

function authorized(req: NextRequest): boolean {
  const configured = process.env.CRON_SECRET;
  const supplied = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!configured || !supplied) return false;
  const left = Buffer.from(configured);
  const right = Buffer.from(supplied);
  return left.length === right.length && timingSafeEqual(left, right);
}
export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const result = await processOneHostingTask(`vercel-cron-${process.env.VERCEL_REGION || 'unknown'}`);
  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
}
