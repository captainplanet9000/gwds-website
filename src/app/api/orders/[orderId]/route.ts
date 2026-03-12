import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getProduct } from '@/lib/products';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  try {
    const supabase = createServerClient();

    // Get order — try UUID id first, then stripe_session_id pattern (for free/coupon orders)
    let order: any = null;
    const { data: byId } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (byId) {
      order = byId;
    } else {
      // Free orders store stripe_session_id as "local-GWDS-xxx"
      const { data: bySession } = await supabase
        .from('orders')
        .select('*')
        .eq('stripe_session_id', `local-${orderId}`)
        .single();
      order = bySession;
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get order items (use the actual UUID, not the URL param)
    const dbId = order.id;
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', dbId);

    // Get download tokens
    const { data: downloads } = await supabase
      .from('downloads')
      .select('*')
      .eq('order_id', dbId);

    // Enrich items with product details and download tokens
    const enrichedItems = (items || []).map((item: any) => {
      const product = getProduct(item.product_id);
      const dl = (downloads || []).find(
        (d: any) => d.product_id === item.product_id
      );

      const remaining = dl ? (dl.max_downloads || 5) - (dl.downloaded_count || 0) : 0;

      return {
        productId: item.product_id,
        productName: product?.name || item.product_id,
        emoji: product?.emoji || '📦',
        priceCents: item.price_cents,
        quantity: item.quantity,
        downloadToken: dl?.download_token || null,
        downloadsRemaining: remaining,
        expiresAt: dl?.expires_at || null,
      };
    });

    return NextResponse.json({
      id: order.id,
      status: order.status,
      customerEmail: order.customer_email,
      totalCents: order.total_cents,
      createdAt: order.created_at,
      items: enrichedItems,
    });
  } catch (err: any) {
    console.error('Order fetch error:', err.message);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
