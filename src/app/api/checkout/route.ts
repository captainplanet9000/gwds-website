import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/lib/products';

// Stripe import — works if STRIPE_SECRET_KEY is set
let stripe: any = null;
async function getStripe() {
  if (stripe) return stripe;
  const Stripe = (await import('stripe')).default;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  stripe = new Stripe(key);
  return stripe;
}

const ORDERS_DIR = 'data/orders';

export async function POST(req: NextRequest) {
  try {
    const { items, email, name, couponCode } = await req.json();

    if (!items?.length || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Resolve products
    const orderItems = items.map((item: { productId: string; quantity: number }) => {
      const product = getProduct(item.productId);
      return {
        productId: item.productId,
        productName: product?.name || item.productId,
        quantity: item.quantity || 1,
        price: product?.price || 0,
        emoji: product?.emoji || '',
      };
    });

    const total = orderItems.reduce(
      (sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity,
      0
    );

    const orderId = `GWDS-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Try Stripe Checkout
    const stripeClient = await getStripe();
    if (stripeClient && total > 0) {
      const lineItems = orderItems
        .filter((i: any) => i.price > 0)
        .map((i: any) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${i.emoji} ${i.productName}`,
              description: `GWDS Digital Product`,
            },
            unit_amount: Math.round(i.price * 100),
          },
          quantity: i.quantity,
        }));

      const session = await stripeClient.checkout.sessions.create({
        mode: 'payment',
        line_items: lineItems,
        customer_email: email,
        metadata: {
          orderId,
          customerName: name,
          items: JSON.stringify(items),
        },
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3457'}/checkout/success?orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3457'}/checkout`,
      });

      // Save order as pending
      await saveOrder({
        orderId,
        email,
        name,
        items: orderItems,
        total,
        status: 'pending',
        stripeSessionId: session.id,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({ stripeUrl: session.url, orderId });
    }

    // No Stripe — save order directly (free items or test mode)
    await saveOrder({
      orderId,
      email,
      name,
      items: orderItems,
      total,
      status: total === 0 ? 'completed' : 'pending_payment',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ orderId, total });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}

async function saveOrder(order: any) {
  // Try Supabase first
  try {
    const { supabase } = await import('@/lib/supabase');
    const { error } = await supabase.from('gwds_orders').insert({
      order_id: order.orderId,
      email: order.email,
      name: order.name,
      items: order.items,
      total: order.total,
      status: order.status,
      stripe_session_id: order.stripeSessionId || null,
    });
    if (!error) return;
    console.log('Supabase order save failed (table may not exist yet), falling back to file');
  } catch (e) {}

  // Fallback: save to JSON file
  const fs = await import('fs/promises');
  const path = await import('path');
  const dir = path.join(process.cwd(), ORDERS_DIR);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, `${order.orderId}.json`),
    JSON.stringify(order, null, 2)
  );
}
