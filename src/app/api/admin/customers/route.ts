import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { adminUnauthorized, requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return adminUnauthorized();
  try {
    const sb = createServerClient();
    const { data, error } = await sb.from('customers')
      .select('*')
      .order('last_order_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ customers: data || [] });
  } catch (err: any) {
    console.error('Admin customers failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Customers could not be loaded.' }, { status: 500 });
  }
}
