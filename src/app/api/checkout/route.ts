import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from '@/lib/products';
import { validateCoupon, incrementCouponUsage } from '@/lib/store-db';

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
        stripePriceId: product?.stripePriceId || null,
      };
    });

    const subtotal = orderItems.reduce(
      (sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity,
      0
    );

    // Validate coupon if provided
    let discount = 0;
    let validatedCoupon: string | undefined;
    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, subtotal);
      if (!couponResult.valid) {
        return NextResponse.json({ error: couponResult.error || 'Invalid coupon' }, { status: 400 });
      }
      discount = couponResult.discount || 0;
      validatedCoupon = couponResult.coupon?.code;
    }

    const total = Math.max(0, Math.round((subtotal - discount) * 100) / 100);
    const orderId = `GWDS-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // If total is $0 (100% coupon or free items), complete order immediately
    if (total === 0) {
      await saveOrder({
        orderId,
        email,
        name,
        items: orderItems,
        total: 0,
        subtotal,
        discount,
        couponCode: validatedCoupon,
        status: 'completed',
        createdAt: new Date().toISOString(),
      });

      // Increment coupon usage
      if (validatedCoupon) await incrementCouponUsage(validatedCoupon);

      // Create download tokens for free orders
      try {
        const { createServerClient } = await import('@/lib/supabase');
        const sb = createServerClient();
        
        // Find the order we just created
        const { data: order } = await sb.from('orders')
          .select('id')
          .eq('customer_email', email)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (order) {
          const productIds = orderItems.map((i: any) => i.productId);
          for (const productId of productIds) {
            await sb.from('downloads').insert({
              order_id: order.id,
              product_id: productId,
              download_token: crypto.randomUUID(),
              max_downloads: 999999,
              downloaded_count: 0,
              expires_at: null,
            });
          }

          // Send confirmation email
          try {
            const { sendOrderConfirmation } = await import('@/lib/email');
            const { data: downloads } = await sb.from('downloads').select('*').eq('order_id', order.id);
            const downloadLinks = (downloads || []).map((dl: any) => ({
              productId: dl.product_id,
              productName: orderItems.find((i: any) => i.productId === dl.product_id)?.productName || dl.product_id,
              downloadUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/downloads/${order.id}/${dl.product_id}?token=${dl.download_token}`,
            }));
            await sendOrderConfirmation(email, { ...order, customer_name: name || null, total_cents: 0, created_at: new Date().toISOString() }, downloadLinks);
          } catch (emailErr) {
            console.error('Failed to send free order email:', emailErr);
          }
        }
      } catch (e) {
        console.error('Free order download token error:', e);
      }

      // Telegram notification for free order
      try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        if (botToken && chatId) {
          const products = orderItems.map((i: any) => i.productName).join(', ');
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `🎁 <b>FREE ORDER</b> (coupon: ${validatedCoupon})\n\n📧 ${email}\n📦 ${products}`,
              parse_mode: 'HTML',
            }),
          });
        }
      } catch { /* best effort */ }

      // Update customer record
      try {
        const { createServerClient: sc } = await import('@/lib/supabase');
        const sbc = sc();
        const { data: cust } = await sbc.from('customers').select('*').eq('email', email.toLowerCase()).single();
        if (cust) {
          await sbc.from('customers').update({
            order_count: (cust.order_count || 0) + 1,
            last_order_at: new Date().toISOString(),
          }).eq('email', email.toLowerCase());
        } else {
          await sbc.from('customers').insert({
            email: email.toLowerCase(), name: name || '', total_spent: 0,
            order_count: 1, first_order_at: new Date().toISOString(), last_order_at: new Date().toISOString(),
          });
        }
        // Auto-subscribe to newsletter
        await sbc.from('newsletter_subscribers').upsert(
          { email: email.toLowerCase(), source: 'purchase', is_active: true },
          { onConflict: 'email' }
        );
      } catch { /* best effort */ }

      return NextResponse.json({ orderId, total: 0, free: true });
    }

    // Try Stripe Checkout for paid orders
    const stripeClient = await getStripe();
    if (stripeClient) {
      // When coupon applies partial discount, use price_data with adjusted prices
      const discountRatio = discount > 0 ? (subtotal - discount) / subtotal : 1;

      const lineItems = orderItems
        .filter((i: any) => i.price > 0)
        .map((i: any) => {
          const adjustedPrice = Math.round(i.price * discountRatio * 100);
          // If coupon applied, use price_data with adjusted amount (can't mix with pre-created prices)
          if (discount > 0) {
            return {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `${i.emoji} ${i.productName}`,
                  description: validatedCoupon ? `Coupon ${validatedCoupon} applied` : 'GWDS Digital Product',
                },
                unit_amount: adjustedPrice,
              },
              quantity: i.quantity,
            };
          }
          // No discount — use Stripe price ID if available
          if (i.stripePriceId) {
            return { price: i.stripePriceId, quantity: i.quantity };
          }
          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${i.emoji} ${i.productName}`,
                description: `GWDS Digital Product`,
              },
              unit_amount: Math.round(i.price * 100),
            },
            quantity: i.quantity,
          };
        });

      const session = await stripeClient.checkout.sessions.create({
        mode: 'payment',
        line_items: lineItems,
        customer_email: email,
        metadata: {
          orderId,
          customerName: name || '',
          items: JSON.stringify(items),
          product_ids: items.map((i: any) => i.productId).join(','),
          couponCode: validatedCoupon || '',
          discount: discount.toString(),
          subtotal: subtotal.toString(),
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
        subtotal,
        discount,
        couponCode: validatedCoupon,
        status: 'pending',
        stripeSessionId: session.id,
        createdAt: new Date().toISOString(),
      });

      return NextResponse.json({ stripeUrl: session.url, orderId });
    }

    // No Stripe and not free
    await saveOrder({
      orderId,
      email,
      name,
      items: orderItems,
      total,
      subtotal,
      discount,
      couponCode: validatedCoupon,
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ orderId, total });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}

async function saveOrder(order: any) {
  // Save to Supabase
  try {
    const { createServerClient } = await import('@/lib/supabase');
    const sb = createServerClient();

    // Insert order into our schema
    const insertData: any = {
      stripe_session_id: order.stripeSessionId || `local-${order.orderId}`,
      customer_email: order.email,
      customer_name: order.name,
      total_cents: Math.round(order.total * 100),
      status: order.status,
    };

    // Add coupon tracking if present
    if (order.couponCode) insertData.coupon_code = order.couponCode;
    if (order.discount) insertData.discount_cents = Math.round(order.discount * 100);
    if (order.subtotal) insertData.subtotal_cents = Math.round(order.subtotal * 100);

    const { data: orderRow, error } = await sb.from('orders').insert(insertData).select().single();

    if (error) {
      console.error('Supabase order insert error:', error.message);
      return; // Don't crash checkout — Stripe session already created
    }

    // Insert order items
    if (orderRow && order.items?.length) {
      const items = order.items.map((item: any) => ({
        order_id: orderRow.id,
        product_id: item.productId,
        quantity: item.quantity || 1,
        price_cents: Math.round((item.price || 0) * 100),
      }));
      try {
        await sb.from('order_items').insert(items);
      } catch (e: any) {
        console.error('Order items insert error:', e.message);
      }
    }
  } catch (e: any) {
    console.error('Save order error:', e.message);
    // Don't crash — the Stripe session is already created
  }
}
