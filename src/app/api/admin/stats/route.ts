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
  });
}
