import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const sb = createServerClient();
    const { data, error } = await sb.from('customers')
      .select('*')
      .order('last_order_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ customers: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
