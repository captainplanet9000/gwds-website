import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const sb = createServerClient();
    
    // Get purchase counts per product
    const { data: items } = await sb.from('order_items')
      .select('product_id')
      .order('product_id');
    
    const counts: Record<string, number> = {};
    if (items) {
      for (const item of items) {
        counts[item.product_id] = (counts[item.product_id] || 0) + 1;
      }
    }

    return NextResponse.json({ purchaseCounts: counts });
  } catch (err: any) {
    return NextResponse.json({ purchaseCounts: {} });
  }
}
