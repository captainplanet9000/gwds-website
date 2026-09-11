import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { CommerceError, enforceRateLimit, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    await enforceRateLimit(req, 'refund_request', 3, 24 * 60 * 60);
    const user = await requireVerifiedUser(req);
    const body = await req.json() as { orderId?: unknown; reason?: unknown };
    const orderId = typeof body.orderId === 'string' ? body.orderId : '';
    const reason = typeof body.reason === 'string' ? body.reason.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 3000) : '';
    if (!/^[0-9a-f-]{36}$/i.test(orderId) || reason.length < 10) throw new CommerceError('INVALID_REFUND_REQUEST', 'Choose an order and provide a brief reason.');

    const supabase = createServerClient();
    const { data: order } = await supabase.from('orders').select('id,total_cents,created_at,status')
      .eq('id', orderId).eq('user_id', user.id).in('status', ['paid', 'completed']).maybeSingle();
    if (!order) throw new CommerceError('ORDER_NOT_FOUND', 'Eligible order not found.', 404);

    const { data: existing } = await supabase.from('refund_requests').select('id,status')
      .eq('order_id', order.id).eq('user_id', user.id).in('status', ['requested', 'reviewing', 'approved']).maybeSingle();
    if (existing) throw new CommerceError('REFUND_ALREADY_REQUESTED', 'A refund request is already open for this order.', 409);

    const { error } = await supabase.from('refund_requests').insert({ user_id: user.id, order_id: order.id, reason, status: 'requested' });
    if (error) throw new CommerceError('REFUND_SAVE_FAILED', 'Your refund request could not be saved.', 503);

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    const support = process.env.SUPPORT_EMAIL || 'support@civalsystems.com';
    if (apiKey && from) {
      await new Resend(apiKey).emails.send({
        from, to: support, replyTo: user.email!,
        subject: `Refund request — order ${order.id.slice(0, 8)}`,
        text: `Customer: ${user.email}\nOrder: ${order.id}\nAmount: $${(order.total_cents / 100).toFixed(2)}\n\n${reason}`,
      }, { idempotencyKey: `refund-request-${order.id}` });
    }

    return NextResponse.json({ ok: true, message: 'Your request was received. We will respond within two business days.' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
