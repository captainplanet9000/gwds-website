import { NextResponse } from 'next/server';
import { products } from '@/lib/products';

export async function GET() {
  let totalRevenue = 0;
  let totalOrders = 0;
  let totalCustomers = 0;
  const orderList: any[] = [];

  // Try Supabase
  try {
    const { supabase } = await import('@/lib/supabase');
    const { data: orders } = await supabase.from('gwds_orders').select('*').order('created_at', { ascending: false });
    if (orders) {
      totalOrders = orders.length;
      totalRevenue = orders.reduce((s: number, o: any) => s + (parseFloat(o.total) || 0), 0);
      const emails = new Set(orders.map((o: any) => o.email));
      totalCustomers = emails.size;
    }
  } catch (e) {}

  // Fallback: check file-based orders
  if (totalOrders === 0) {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const dir = path.join(process.cwd(), 'data', 'orders');
      const files = await fs.readdir(dir);
      for (const f of files) {
        if (!f.endsWith('.json')) continue;
        const order = JSON.parse(await fs.readFile(path.join(dir, f), 'utf-8'));
        orderList.push(order);
        totalOrders++;
        totalRevenue += order.total || 0;
      }
      const emails = new Set(orderList.map(o => o.email));
      totalCustomers = emails.size;
    } catch (e) {}
  }

  return NextResponse.json({
    totalRevenue: totalRevenue.toFixed(2),
    totalOrders,
    totalProducts: products.length,
    totalCustomers,
  });
}
