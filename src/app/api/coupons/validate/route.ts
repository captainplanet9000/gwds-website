import { NextRequest, NextResponse } from 'next/server';
import { CommerceError, errorResponseBody, normalizeCoupon, requireVerifiedUser } from '@/lib/commerce';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    await requireVerifiedUser(req);
    const body = await req.json() as { code?: unknown; items?: unknown };
    const code = normalizeCoupon(body.code);
    if (!code) throw new CommerceError('INVALID_COUPON', 'Enter a coupon code.');
    if (!Array.isArray(body.items) || !body.items.length || body.items.length > 12) {
      throw new CommerceError('INVALID_CART', 'Add a product before applying a coupon.');
    }
    const ids = body.items.map((entry) => {
      if (!entry || typeof entry !== 'object' || !('productId' in entry) || typeof entry.productId !== 'string') {
        throw new CommerceError('INVALID_CART', 'Your cart contains an invalid product.');
      }
      return entry.productId;
    });
    if (new Set(ids).size !== ids.length) throw new CommerceError('INVALID_CART', 'Duplicate products are not allowed.');

    const supabase = createServerClient();
    const [{ data: products }, { data: coupon }] = await Promise.all([
      supabase.from('products').select('id,price_cents').in('id', ids).eq('is_active', true),
      supabase.from('gwds_coupons').select('code,discount_type,discount_value,max_uses,used_count,min_order,applies_to,excludes,expires_at,is_active').eq('code', code).maybeSingle(),
    ]);
    if (!products || products.length !== ids.length) throw new CommerceError('PRODUCT_UNAVAILABLE', 'A cart product is unavailable.', 409);
    if (!coupon?.is_active) throw new CommerceError('INVALID_COUPON', 'That coupon code is not valid.');
    if (coupon.expires_at && new Date(coupon.expires_at).getTime() <= Date.now()) throw new CommerceError('COUPON_EXPIRED', 'That coupon has expired.');
    if (coupon.max_uses !== null && (coupon.used_count || 0) >= coupon.max_uses) throw new CommerceError('COUPON_LIMIT_REACHED', 'That coupon has reached its usage limit.');

    const subtotalCents = products.reduce((sum, product) => sum + product.price_cents, 0);
    if (subtotalCents < Number(coupon.min_order || 0) * 100) throw new CommerceError('COUPON_MINIMUM_NOT_MET', 'Your order does not meet this coupon’s minimum.');
    const appliesTo = Array.isArray(coupon.applies_to) ? coupon.applies_to : [];
    const excludes = Array.isArray(coupon.excludes) ? coupon.excludes : [];
    const eligibleCents = products.filter((product) => (!appliesTo.length || appliesTo.includes(product.id)) && !excludes.includes(product.id))
      .reduce((sum, product) => sum + product.price_cents, 0);
    if (!eligibleCents) throw new CommerceError('COUPON_NOT_APPLICABLE', 'That coupon does not apply to these products.');

    const value = Number(coupon.discount_value);
    const discountCents = coupon.discount_type === 'percentage'
      ? Math.round(eligibleCents * value / 100)
      : Math.min(eligibleCents, Math.round(value * 100));
    if (!Number.isFinite(discountCents) || discountCents <= 0 || subtotalCents - discountCents < 50) {
      throw new CommerceError('TOTAL_TOO_LOW', 'This coupon would put the order below the payment minimum.');
    }

    return NextResponse.json({
      valid: true,
      coupon: { code: coupon.code, discount_type: coupon.discount_type, discount_value: value },
      discount: discountCents / 100,
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json({ valid: false, ...errorResponseBody(error) }, { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
