import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!process.env.STRIPE_WEBHOOK_SECRET || !sig) {
    return NextResponse.json({ error: 'Missing webhook config' }, { status: 400 });
  }

  let event;
  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const orderId = session.metadata?.orderId;
    const email = session.customer_email;

    if (orderId) {
      // Update order status
      try {
        const { supabase } = await import('@/lib/supabase');
        await supabase
          .from('gwds_orders')
          .update({
            status: 'completed',
            stripe_payment_intent: session.payment_intent,
          })
          .eq('order_id', orderId);
      } catch (e) {}

      // Generate download tokens
      try {
        const items = JSON.parse(session.metadata?.items || '[]');
        const { supabase } = await import('@/lib/supabase');
        const { v4: uuid } = await import('uuid');

        for (const item of items) {
          await supabase.from('gwds_downloads').insert({
            order_id: orderId,
            product_slug: item.productId,
            token: uuid(),
            downloads_remaining: 3,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
      } catch (e) {
        console.error('Failed to create download tokens:', e);
      }

      // TODO: Send confirmation email via Resend
      console.log(`Order ${orderId} completed for ${email}`);
    }
  }

  return NextResponse.json({ received: true });
}
