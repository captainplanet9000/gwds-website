import { NextResponse } from 'next/server';

export async function GET() {
  const orders: any[] = [];

  // Try Supabase
  try {
    const { supabase } = await import('@/lib/supabase');
    const { data } = await supabase.from('gwds_orders').select('*').order('created_at', { ascending: false }).limit(50);
    if (data && data.length > 0) {
      return NextResponse.json({ orders: data });
    }
  } catch (e) {}

  // Fallback: file-based orders
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const dir = path.join(process.cwd(), 'data', 'orders');
    const files = await fs.readdir(dir);
    for (const f of files.sort().reverse()) {
      if (!f.endsWith('.json')) continue;
      const order = JSON.parse(await fs.readFile(path.join(dir, f), 'utf-8'));
      orders.push(order);
    }
  } catch (e) {}

  return NextResponse.json({ orders });
}
