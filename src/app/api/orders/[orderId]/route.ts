import { NextRequest, NextResponse } from 'next/server';
import { CommerceError, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';
import { createServerClient } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const user = await requireVerifiedUser(req);
    const { orderId } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(orderId)) throw new CommerceError('INVALID_ORDER_ID', 'Invalid order.', 400);

    const supabase = createServerClient();
    const { data: order } = await supabase
      .from('orders')
      .select('id,status,fulfillment_status,total_cents,created_at')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!order) throw new CommerceError('ORDER_NOT_FOUND', 'Order not found.', 404);

    const { data: items } = await supabase.from('order_items')
      .select('id,product_id,quantity,price_cents,product_version')
      .eq('order_id', order.id);
    return NextResponse.json({ ...order, items: items || [] }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
