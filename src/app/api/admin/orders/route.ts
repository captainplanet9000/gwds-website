import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { adminUnauthorized, requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return adminUnauthorized();
  try {
    const sb = createServerClient();
    const { data, error } = await sb.from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({ orders: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, orders: [] }, { status: 500 });
  }
}
