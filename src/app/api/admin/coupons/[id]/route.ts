import { NextRequest, NextResponse } from 'next/server';
import { getCoupon, updateCoupon, deleteCoupon } from '@/lib/store-db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const coupon = await getCoupon(id);
    if (!coupon) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    return NextResponse.json({ coupon });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (body.discount_type === 'percentage' && (body.discount_value < 0 || body.discount_value > 100)) {
      return NextResponse.json({ error: 'Percentage discount must be 0-100' }, { status: 400 });
    }
    const coupon = await updateCoupon(id, body);
    if (!coupon) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    return NextResponse.json({ coupon });
  } catch (error: any) {
    if (error.message?.includes('duplicate key') || error.message?.includes('unique')) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = await deleteCoupon(id);
    if (!deleted) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
