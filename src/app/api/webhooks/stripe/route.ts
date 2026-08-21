import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createServerClient } from '@/lib/supabase';
import { sendOrderReadyEmail, type OrderEmailData } from '@/lib/email';
import { deliverHostingNotification } from '@/lib/hosting-notifications';
import { hashPayload, type OrderItemRow } from '@/lib/commerce';
import { parsePeriod } from '@/lib/hosting';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

interface FulfillmentResult {
  order_id: string;
  processed: boolean;
}

function objectId(value: string | { id: string } | null): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

function requireMetadataId(value: string | undefined, label: string): string {
  if (!value || !/^[0-9a-f-]{36}$/i.test(value)) throw new Error(`${label}_MISSING`);
  return value;
}

async function deliverOrderEmail(orderId: string) {
  const supabase = createServerClient();
  const { data: outbox } = await supabase
    .from('email_outbox')
    .select('id,status,attempts,recipient_email')
    .eq('order_id', orderId)
    .eq('template', 'order_confirmation')
    .in('status', ['pending', 'failed'])
    .lt('attempts', 5)
    .maybeSingle();

  if (!outbox) return;
  const { data: claimed } = await supabase
    .from('email_outbox')
    .update({ status: 'sending', attempts: (outbox.attempts || 0) + 1, last_error: null })
    .eq('id', outbox.id)
    .in('status', ['pending', 'failed'])
    .select('id')
    .maybeSingle();
  if (!claimed) return;

  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id,customer_name,total_cents,created_at')
      .eq('id', orderId)
      .single();
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id,quantity')
      .eq('order_id', orderId);
    if (orderError || itemsError || !order || !items?.length) throw new Error('Order email data is incomplete');

    const message = await sendOrderReadyEmail(outbox.recipient_email, {
      ...order,
      items,
    } as OrderEmailData);

    await supabase.from('email_outbox').update({
      status: 'sent',
      provider_message_id: message?.id || null,
      sent_at: new Date().toISOString(),
      last_error: null,
    }).eq('id', outbox.id);
  } catch (error) {
    const safeMessage = error instanceof Error ? error.message.slice(0, 500) : 'Unknown email failure';
    await supabase.from('email_outbox').update({ status: 'failed', last_error: safeMessage }).eq('id', outbox.id);
    throw error;
  }
}

async function fulfillSession(event: Stripe.Event, session: Stripe.Checkout.Session, payloadHash: string) {
  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') return;

  const orderId = requireMetadataId(session.metadata?.order_id, 'ORDER_ID');
  const userId = requireMetadataId(session.metadata?.user_id, 'USER_ID');
  const email = session.customer_details?.email || session.customer_email;
  const paymentIntentId = objectId(session.payment_intent);
  if (!email || !paymentIntentId || session.amount_total === null || !session.currency) {
    throw new Error('SESSION_PAYMENT_DATA_MISSING');
  }

  const supabase = createServerClient();
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id,stripe_session_id,user_id,customer_email,total_cents,customer_name')
    .eq('id', orderId)
    .single();
  const { data: itemData, error: itemsError } = await supabase
    .from('order_items')
    .select('id,order_id,product_id,quantity,price_cents,stripe_price_id,product_version')
    .eq('order_id', orderId)
    .order('created_at');
  const items = (itemData || []) as OrderItemRow[];

  if (orderError || itemsError || !order || !items.length) throw new Error('ORDER_NOT_FOUND');
  if (order.stripe_session_id !== session.id || order.user_id !== userId
    || order.customer_email.toLowerCase() !== email.toLowerCase()
    || order.total_cents !== session.amount_total) {
    throw new Error('ORDER_SESSION_MISMATCH');
  }
  const keyIsLive = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ?? false;
  if (event.livemode !== keyIsLive) throw new Error('LIVEMODE_MISMATCH');

  const { data, error } = await supabase.rpc('fulfill_store_order', {
    p_event_id: event.id,
    p_event_type: event.type,
    p_payload_hash: payloadHash,
    p_order_id: orderId,
    p_stripe_session_id: session.id,
    p_payment_intent_id: paymentIntentId,
    p_user_id: userId,
    p_customer_email: email,
    p_customer_name: order.customer_name || '',
    p_total_cents: session.amount_total,
    p_currency: session.currency,
    p_livemode: event.livemode,
    p_items: items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price_cents: item.price_cents,
      stripe_price_id: item.stripe_price_id,
      product_version: item.product_version,
    })),
  });
  if (error) throw new Error(`FULFILLMENT_FAILED:${error.message}`);

  const result = (data?.[0] || null) as FulfillmentResult | null;
  const customerId = objectId(session.customer);
  if (customerId) {
    await supabase.from('customers').update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
  }

  // Also runs for an idempotent retry so a previously failed email can recover.
  await deliverOrderEmail(result?.order_id || orderId);
}

async function activateHostingSession(event: Stripe.Event, session: Stripe.Checkout.Session, payloadHash: string) {
  if (session.mode !== 'subscription') throw new Error('HOSTING_SESSION_MODE_MISMATCH');
  const hostingSubscriptionId = requireMetadataId(session.metadata?.hosting_subscription_id, 'HOSTING_SUBSCRIPTION_ID');
  const userId = requireMetadataId(session.metadata?.user_id, 'USER_ID');
  const planId = session.metadata?.hosting_plan_id;
  const customerEmail = session.customer_details?.email || session.customer_email;
  const stripeSubscriptionId = objectId(session.subscription);
  const stripeCustomerId = objectId(session.customer);
  if (!planId || !/^[a-z0-9-]{2,40}$/.test(planId) || !customerEmail || !stripeSubscriptionId || !stripeCustomerId) {
    throw new Error('HOSTING_SESSION_DATA_MISSING');
  }

  const subscription = await getStripe().subscriptions.retrieve(stripeSubscriptionId, { expand: ['items.data.price'] });
  const price = subscription.items.data[0]?.price;
  if (!price || subscription.items.data.length !== 1 || subscription.metadata?.commerce_kind !== 'hosting'
    || subscription.metadata?.hosting_subscription_id !== hostingSubscriptionId
    || subscription.metadata?.hosting_plan_id !== planId || subscription.metadata?.user_id !== userId) {
    throw new Error('HOSTING_SUBSCRIPTION_METADATA_MISMATCH');
  }
  const periods = parsePeriod(subscription);
  const { data, error } = await createServerClient().rpc('activate_hosting_checkout', {
    p_event_id: event.id,
    p_event_type: event.type,
    p_payload_hash: payloadHash,
    p_subscription_id: hostingSubscriptionId,
    p_user_id: userId,
    p_plan_id: planId,
    p_checkout_session_id: session.id,
    p_stripe_customer_id: stripeCustomerId,
    p_stripe_subscription_id: subscription.id,
    p_stripe_price_id: price.id,
    p_customer_email: customerEmail,
    p_status: subscription.status,
    p_period_start: periods.start,
    p_period_end: periods.end,
    p_trial_end: periods.trialEnd,
    p_cancel_at_period_end: subscription.cancel_at_period_end,
    p_livemode: event.livemode,
  });
  if (error || !data?.[0]) throw new Error(`HOSTING_ACTIVATION_FAILED:${error?.message || 'no result'}`);

  await createServerClient().from('customers').update({ stripe_customer_id: stripeCustomerId, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  await deliverHostingNotification(hostingSubscriptionId);
}

async function syncHostingSubscription(event: Stripe.Event, subscription: Stripe.Subscription, payloadHash: string) {
  if (subscription.metadata?.commerce_kind !== 'hosting') return;
  const periods = parsePeriod(subscription);
  const { error } = await createServerClient().rpc('sync_hosting_subscription', {
    p_event_id: event.id,
    p_event_type: event.type,
    p_payload_hash: payloadHash,
    p_stripe_subscription_id: subscription.id,
    p_status: subscription.status,
    p_cancel_at_period_end: subscription.cancel_at_period_end,
    p_period_start: periods.start,
    p_period_end: periods.end,
    p_trial_end: periods.trialEnd,
    p_livemode: event.livemode,
  });
  if (error) throw new Error(`HOSTING_SYNC_FAILED:${error.message}`);
  const internalId = subscription.metadata?.hosting_subscription_id;
  if (internalId && /^[0-9a-f-]{36}$/i.test(internalId)) {
    const supabase = createServerClient();
    const { data: instance } = await supabase.from('hosting_instances')
      .select('id,provider_project_id')
      .eq('subscription_id', internalId)
      .maybeSingle();
    if (instance?.provider_project_id) {
      const taskType = ['active', 'trialing'].includes(subscription.status) ? 'resume' : 'suspend';
      await supabase.from('hosting_provisioning_tasks').upsert({
        instance_id: instance.id,
        task_type: taskType,
        status: 'queued',
        priority: 95,
        idempotency_key: `stripe-${taskType}-${event.id}`,
        payload: { stripe_event_id: event.id, subscription_status: subscription.status },
      }, { onConflict: 'idempotency_key', ignoreDuplicates: true });
    }
    await deliverHostingNotification(internalId);
  }
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const record = invoice as Stripe.Invoice & {
    subscription?: string | { id: string } | null;
    parent?: { subscription_details?: { subscription?: string | { id: string } | null } } | null;
  };
  return objectId(record.subscription || record.parent?.subscription_details?.subscription || null);
}

async function syncHostingInvoice(event: Stripe.Event, invoice: Stripe.Invoice, payloadHash: string) {
  const subscriptionId = invoiceSubscriptionId(invoice);
  if (!subscriptionId) return;
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  if (subscription.metadata?.commerce_kind !== 'hosting') return;
  await syncHostingSubscription(event, subscription, payloadHash);
  await createServerClient().from('hosting_subscriptions').update({
    last_invoice_status: invoice.status,
    last_payment_at: event.type === 'invoice.paid' ? new Date().toISOString() : undefined,
    updated_at: new Date().toISOString(),
  }).eq('stripe_subscription_id', subscriptionId);
}

async function applyStatusEvent(args: {
  event: Stripe.Event;
  payloadHash: string;
  sessionId?: string | null;
  paymentIntentId?: string | null;
  status: string;
  reason: string;
  revoke: boolean;
  restore?: boolean;
}) {
  const supabase = createServerClient();
  const { data, error } = await supabase.rpc('apply_store_order_status_event', {
    p_event_id: args.event.id,
    p_event_type: args.event.type,
    p_payload_hash: args.payloadHash,
    p_stripe_session_id: args.sessionId || null,
    p_payment_intent_id: args.paymentIntentId || null,
    p_livemode: args.event.livemode,
    p_status: args.status,
    p_reason: args.reason.slice(0, 500),
    p_revoke: args.revoke,
  });
  if (error) throw new Error(`STATUS_UPDATE_FAILED:${error.message}`);

  const result = (data?.[0] || null) as FulfillmentResult | null;
  if (args.restore && result?.order_id) {
    const { data: itemRows } = await supabase.from('order_items').select('id').eq('order_id', result.order_id);
    const ids = (itemRows || []).map((item) => item.id);
    if (ids.length) {
      await supabase.from('entitlements').update({ status: 'active', revoked_at: null, revoke_reason: null })
        .in('source_order_item_id', ids);
    }
  }
}

async function bindPaymentIntentFromMetadata(intent: Stripe.PaymentIntent) {
  const orderId = intent.metadata?.order_id;
  const userId = intent.metadata?.user_id;
  if (!orderId || !userId || !/^[0-9a-f-]{36}$/i.test(orderId) || !/^[0-9a-f-]{36}$/i.test(userId)) return;

  const { data, error } = await createServerClient()
    .from('orders')
    .update({ payment_intent_id: intent.id, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('user_id', userId)
    .select('id')
    .maybeSingle();
  if (error || !data) throw new Error('PAYMENT_INTENT_ORDER_MISMATCH');
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: 'Webhook is not configured' }, { status: 503 });

  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const payloadHash = hashPayload(payload);
  try {
    const keyIsLive = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ?? false;
    if (event.livemode !== keyIsLive) throw new Error('LIVEMODE_MISMATCH');

    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
        if (session.metadata?.commerce_kind === 'hosting') await activateHostingSession(event, session, payloadHash);
        else await fulfillSession(event, session, payloadHash);
        break;
      }
      case 'checkout.session.async_payment_failed':
        await applyStatusEvent({ event, payloadHash, sessionId: event.data.object.id, status: 'payment_failed', reason: event.type, revoke: false });
        break;
      case 'checkout.session.expired':
        await applyStatusEvent({ event, payloadHash, sessionId: event.data.object.id, status: 'expired', reason: event.type, revoke: false });
        break;
      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        await bindPaymentIntentFromMetadata(intent);
        await applyStatusEvent({ event, payloadHash, paymentIntentId: intent.id, status: 'payment_failed', reason: intent.last_payment_error?.message || event.type, revoke: false });
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object;
        const fullyRefunded = charge.amount_refunded >= charge.amount;
        await applyStatusEvent({ event, payloadHash, paymentIntentId: objectId(charge.payment_intent), status: fullyRefunded ? 'refunded' : 'partially_refunded', reason: event.type, revoke: fullyRefunded });
        break;
      }
      case 'charge.dispute.created': {
        const dispute = event.data.object;
        const charge = await getStripe().charges.retrieve(objectId(dispute.charge)!);
        await applyStatusEvent({ event, payloadHash, paymentIntentId: objectId(charge.payment_intent), status: 'disputed', reason: dispute.reason, revoke: true });
        break;
      }
      case 'charge.dispute.closed': {
        const dispute = event.data.object;
        const charge = await getStripe().charges.retrieve(objectId(dispute.charge)!);
        const won = dispute.status === 'won';
        await applyStatusEvent({ event, payloadHash, paymentIntentId: objectId(charge.payment_intent), status: won ? 'paid' : 'dispute_lost', reason: `dispute_${dispute.status}`, revoke: !won, restore: won });
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncHostingSubscription(event, event.data.object, payloadHash);
        break;
      case 'invoice.paid':
      case 'invoice.payment_failed':
        await syncHostingInvoice(event, event.data.object, payloadHash);
        break;
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook processing failed', {
      eventId: event.id,
      eventType: event.type,
      error: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
