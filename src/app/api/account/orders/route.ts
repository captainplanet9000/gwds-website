import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createServerClient();

    // Verify the user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all completed orders for this email
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, customer_email, customer_name, total_cents, status, created_at')
      .eq('customer_email', user.email)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Failed to fetch orders:', ordersError);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    if (!orders?.length) {
      return NextResponse.json({ orders: [] });
    }

    // Get items and downloads for each order
    const orderIds = orders.map((o) => o.id);

    const { data: items } = await supabase
      .from('order_items')
      .select('id, order_id, product_id, quantity, price_cents')
      .in('order_id', orderIds);

    const { data: downloads } = await supabase
      .from('downloads')
      .select('id, order_id, product_id, download_token, expires_at, downloaded_count, max_downloads')
      .in('order_id', orderIds);

    // Assemble the response
    const enrichedOrders = orders.map((order) => {
      const orderItems = (items || [])
        .filter((i) => i.order_id === order.id)
        .map((item) => ({
          ...item,
          downloads: (downloads || []).filter(
            (d) => d.order_id === order.id && d.product_id === item.product_id
          ),
        }));

      return { ...order, items: orderItems };
    });

    return NextResponse.json({ orders: enrichedOrders });
  } catch (error) {
    console.error('Account orders error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
