import { NextResponse } from 'next/server';
import { products } from '@/lib/products';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  const sb = createServerClient();
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
    // Orders + Revenue
    const { data: orders } = await sb.from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (orders) {
      const completed = orders.filter(o => o.status === 'completed');
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
        const date = new Date(order.created_at).toISOString().split('T')[0];
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
      const { data: orderItems } = await sb.from('order_items')
        .select('product_id, price_cents, quantity');
      
      if (orderItems) {
        const productRevenue: any = {};
        orderItems.forEach((item: any) => {
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
    const { count: custCount } = await sb.from('customers')
      .select('*', { count: 'exact', head: true });
    totalCustomers = custCount || 0;

    // Subscribers
    const { count: subCount } = await sb.from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    totalSubscribers = subCount || 0;

    // New messages
    const { count: msgCount } = await sb.from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');
    newMessages = msgCount || 0;

    // Active coupons
    const { count: couponCount } = await sb.from('gwds_coupons')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    activeCoupons = couponCount || 0;

  } catch (e: any) {
    console.error('Stats error:', e.message);
  }

  return NextResponse.json({
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
  });
}
