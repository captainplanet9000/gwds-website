import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 });
  }

  try {
    const supabase = createServerClient();

    const { data: order } = await supabase
      .from('orders')
      .select('id, status')
      .eq('stripe_session_id', sessionId)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ orderId: order.id, status: order.status });
  } catch (err: any) {
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}
