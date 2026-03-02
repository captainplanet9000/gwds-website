import { NextRequest, NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/store-db';

export async function POST(req: NextRequest) {
  const { code, total } = await req.json();
  if (!code) return NextResponse.json({ valid: false, error: 'No code provided' });
  const result = await validateCoupon(code, total || 0);
  return NextResponse.json(result);
}
