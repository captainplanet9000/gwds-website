import { NextRequest, NextResponse } from 'next/server';
import { isPaidOrder, readReportRows } from '@/lib/reporting';
import { products } from '@/lib/products';
import { createServerClient } from '@/lib/supabase';
import { adminUnauthorized, requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return adminUnauthorized();

  let totalRevenue = 0;
  let totalOrders = 0;
  let totalCustomers = 0;
  let totalSubscribers = 0;
  let newMessages = 0;
  let recentOrders: any[] = [];
  let activeCoupons = 0;
  let revenueByDay: any[] = [];
  let revenueByProduct: any[] = [];

  try {
    const sb = createServerClient();
    // Orders + Revenue
    const orders = await readReportRows((from, to) => sb.from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false }).order('id').range(from, to));
    
    if (orders) {
      const completed = orders.filter(isPaidOrder);
      totalOrders = completed.length;
      totalRevenue = completed.reduce((s: number, o: any) => s + ((o.total_cents || 0) / 100), 0);
      recentOrders = orders.slice(0, 10);

      // Revenue by day (last 30 days)
      const last30Days: any = {};
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        last30Days[key] = 0;
      }

      completed.forEach((order: any) => {
        const date = new Date(order.paid_at || order.created_at).toISOString().split('T')[0];
        if (last30Days.hasOwnProperty(date)) {
          last30Days[date] += (order.total_cents || 0) / 100;
        }
      });

      revenueByDay = Object.entries(last30Days).map(([date, revenue]) => ({
        label: new Date(date).getDate().toString(),
        value: revenue,
        date
      }));

      // Revenue by product
      const orderItems = await readReportRows((from, to) => sb.from('order_items')
        .select('order_id, product_id, price_cents, quantity', { count: 'exact' })
        .order('id').range(from, to));

      if (orderItems) {
        // Items are scoped to the same `completed` orders behind the headline
        // totals. Aggregating every item counted cancelled/refunded carts, so
        // this panel could report revenue the headline said did not exist —
        // two figures on one screen disagreeing about money.
        const completedOrderIds = new Set(completed.map((o: any) => o.id));
        const productRevenue: any = {};
        orderItems.forEach((item: any) => {
          if (!completedOrderIds.has(item.order_id)) return;
          if (!productRevenue[item.product_id]) {
            productRevenue[item.product_id] = 0;
          }
          productRevenue[item.product_id] += ((item.price_cents || 0) * (item.quantity || 1)) / 100;
        });

        revenueByProduct = Object.entries(productRevenue)
          .map(([productId, revenue]) => {
            const product = products.find(p => p.id === productId);
            return {
              productId,
              productName: product?.name || productId,
              revenue
            };
          })
          .sort((a: any, b: any) => b.revenue - a.revenue)
          .slice(0, 10);
      }
    }

    // Customers
    const { count: custCount, error: custCountError } = await sb.from('customers')
      .select('*', { count: 'exact', head: true });
    if (custCountError) throw custCountError;
    totalCustomers = custCount || 0;

    // Subscribers
    const { count: subCount, error: subCountError } = await sb.from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    if (subCountError) throw subCountError;
    totalSubscribers = subCount || 0;

    // New messages
    const { count: msgCount, error: msgCountError } = await sb.from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');
    if (msgCountError) throw msgCountError;
    newMessages = msgCount || 0;

    // Active coupons
    const { count: couponCount, error: couponCountError } = await sb.from('gwds_coupons')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    if (couponCountError) throw couponCountError;
    activeCoupons = couponCount || 0;

  } catch (e: any) {
    console.error('Stats query failed:', e instanceof Error ? e.message : 'Database query failed');
    return NextResponse.json({ error: 'Operations data is unavailable. Retry shortly.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    totalRevenue: totalRevenue.toFixed(2),
    totalOrders,
    totalProducts: products.length,
    totalCustomers,
    totalSubscribers,
    newMessages,
    activeCoupons,
    recentOrders,
    revenueByDay,
    revenueByProduct,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
