import { NextRequest, NextResponse } from 'next/server';
import { getAllCoupons, createCoupon } from '@/lib/store-db';

export async function GET() {
  try {
    const coupons = await getAllCoupons();
    return NextResponse.json({ coupons });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, description, discount_type, discount_value, max_uses, min_order, applies_to, excludes, is_active, expires_at } = body;

    if (!code || !discount_type || discount_value === undefined) {
      return NextResponse.json({ error: 'Missing required fields: code, discount_type, discount_value' }, { status: 400 });
    }
    if (!['percentage', 'fixed'].includes(discount_type)) {
      return NextResponse.json({ error: 'discount_type must be percentage or fixed' }, { status: 400 });
    }
    if (discount_type === 'percentage' && (discount_value < 0 || discount_value > 100)) {
      return NextResponse.json({ error: 'Percentage discount must be 0-100' }, { status: 400 });
    }

    const coupon = await createCoupon({
      code,
      description: description || '',
      discount_type,
      discount_value: Number(discount_value),
      max_uses: max_uses ? Number(max_uses) : null,
      min_order: Number(min_order) || 0,
      applies_to: applies_to || null,
      excludes: excludes || null,
      is_active: is_active !== false,
      expires_at: expires_at || null,
    });

    return NextResponse.json({ coupon });
  } catch (error: any) {
    if (error.message?.includes('duplicate key') || error.message?.includes('unique')) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
