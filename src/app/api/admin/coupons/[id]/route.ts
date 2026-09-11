import { NextRequest, NextResponse } from 'next/server';
import { getCoupon, updateCoupon, deleteCoupon } from '@/lib/store-db';
import { adminUnauthorized, requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin(req)) return adminUnauthorized();
  try {
    const { id } = await params;
    const coupon = await getCoupon(id);
    if (!coupon) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    return NextResponse.json({ coupon });
  } catch (error: any) {
    console.error('Admin coupon GET failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'The coupon could not be loaded.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin(req, ['owner', 'operator'])) return adminUnauthorized();
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
    console.error('Admin coupon PUT failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'The coupon could not be updated.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin(req, ['owner'])) return adminUnauthorized();
  try {
    const { id } = await params;
    const deleted = await deleteCoupon(id);
    if (!deleted) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Admin coupon DELETE failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'The coupon could not be deleted.' }, { status: 500 });
  }
}
