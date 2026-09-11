import { NextRequest, NextResponse } from 'next/server';
import { CommerceError, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';
import { createServerClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);
    const sessionId = req.nextUrl.searchParams.get('session_id');
    if (!sessionId || !/^cs_(test_|live_)?[A-Za-z0-9_]+$/.test(sessionId)) {
      throw new CommerceError('INVALID_SESSION_ID', 'A valid checkout session is required.');
    }

    const supabase = createServerClient();
    const { data: order } = await supabase
      .from('orders')
      .select('id,status,fulfillment_status')
      .eq('stripe_session_id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!order) throw new CommerceError('ORDER_NOT_FOUND', 'This checkout was not found.', 404);

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      fulfillmentStatus: order.fulfillment_status,
      paid: order.status === 'paid' && order.fulfillment_status === 'fulfilled',
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
