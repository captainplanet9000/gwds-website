import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { adminUnauthorized, requireAdmin } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return adminUnauthorized();
  try {
    const sb = createServerClient();
    const { data, error } = await sb.from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ subscribers: data || [] });
  } catch (err: any) {
    console.error('Admin subscribers failed', { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'Subscribers could not be loaded.' }, { status: 500 });
  }
}
