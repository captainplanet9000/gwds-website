import { NextRequest, NextResponse } from 'next/server';
import { COMMERCE_VERSIONS, CommerceError, errorResponseBody, getSiteUrl, requireVerifiedUser } from '@/lib/commerce';
import { HOSTING_SERVICE_TERMS_VERSION, hostingLaunchMessage, hostingSalesEnabled } from '@/lib/hosting';
import { getStripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let pendingSubscriptionId: string | null = null;
  let checkoutSessionId: string | null = null;
  try {
    if (!hostingSalesEnabled()) {
      throw new CommerceError('HOSTING_PAUSED', hostingLaunchMessage(), 503);
    }
    if (Number(req.headers.get('content-length') || '0') > 8_192) {
      throw new CommerceError('REQUEST_TOO_LARGE', 'The request is too large.', 413);
    }

    const user = await requireVerifiedUser(req);
    const body = await req.json() as { planId?: unknown; acceptedTerms?: unknown };
    if (body.acceptedTerms !== true) {
      throw new CommerceError('LEGAL_ACCEPTANCE_REQUIRED', 'Accept the hosting terms, Terms, Refund Policy, and Trading Disclaimer to continue.');
    }
    if (typeof body.planId !== 'string' || !/^[a-z0-9-]{2,40}$/.test(body.planId)) {
      throw new CommerceError('INVALID_PLAN', 'Choose a valid hosting plan.');
    }

    const supabase = createServerClient();
    const { data: plan, error: planError } = await supabase.from('hosting_plans')
      .select('id,name,price_cents,currency,billing_interval,stripe_price_id_test,stripe_price_id_live,is_active,launch_ready')
      .eq('id', body.planId).maybeSingle();
    if (planError) throw new CommerceError('HOSTING_UNAVAILABLE', 'Hosting plans are temporarily unavailable.', 503);
    // hosting_plans.stripe_price_id_test/_live exist because pilot and production share this table
    // but use different-mode Stripe keys, and a Stripe price's mode can't change after creation --
    // see 20260911140000_split_stripe_price_id_by_mode.sql. Pick the column matching this
    // deployment's own key before this environment's price even exists there.
    const live = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ?? false;
    const stripePriceId = live ? plan?.stripe_price_id_live : plan?.stripe_price_id_test;
    if (!plan?.is_active || !plan.launch_ready || !stripePriceId || plan.price_cents < 50) {
      throw new CommerceError('PLAN_NOT_READY', hostingLaunchMessage(), 503);
    }

    const price = await getStripe().prices.retrieve(stripePriceId);
    if (!price.active || price.livemode !== live || price.type !== 'recurring' || price.currency !== plan.currency
      || price.unit_amount !== plan.price_cents || price.recurring?.interval !== plan.billing_interval) {
      throw new CommerceError('HOSTING_PRICE_MISMATCH', 'This hosting plan is not configured for billing.', 503);
    }

    const { data: created, error: createError } = await supabase.rpc('create_hosting_checkout', {
      p_user_id: user.id,
      p_customer_email: user.email!,
      p_plan_id: plan.id,
      p_terms_version: COMMERCE_VERSIONS.terms,
      p_refund_policy_version: COMMERCE_VERSIONS.refunds,
      p_disclaimer_version: COMMERCE_VERSIONS.disclaimer,
      p_service_terms_version: HOSTING_SERVICE_TERMS_VERSION,
    });
    if (createError || !created?.[0]) {
      const message = createError?.message || '';
      if (message.includes('HOSTING_CAPACITY_')) {
        throw new CommerceError('HOSTING_CAPACITY_UNAVAILABLE', 'Hosted workspaces are currently at capacity. Please check back shortly.', 409);
      }
      if (message.includes('OPEN_SUBSCRIPTION_EXISTS')) {
        throw new CommerceError('OPEN_SUBSCRIPTION_EXISTS', 'You already have an open hosting subscription. Manage it from your account.', 409);
      }
      throw new CommerceError('HOSTING_CHECKOUT_UNAVAILABLE', hostingLaunchMessage(), 503);
    }
    pendingSubscriptionId = created[0].subscription_id;

    const { data: customer } = await supabase.from('customers').select('stripe_customer_id').eq('user_id', user.id).maybeSingle();
    const siteUrl = getSiteUrl();
    const metadata = {
      commerce_kind: 'hosting',
      hosting_subscription_id: pendingSubscriptionId,
      hosting_plan_id: plan.id,
      user_id: user.id,
    };
    const sessionParamsFor = (stripeCustomerId: string | null) => ({
      mode: 'subscription' as const,
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${siteUrl}/account/hosting?checkout=success`,
      cancel_url: `${siteUrl}/hosted?checkout=cancelled`,
      customer: stripeCustomerId || undefined,
      customer_email: stripeCustomerId ? undefined : user.email!,
      client_reference_id: user.id,
      metadata,
      subscription_data: { metadata },
      allow_promotion_codes: true,
      billing_address_collection: 'auto' as const,
    });

    let usedCustomerId = customer?.stripe_customer_id ?? null;
    let session;
    try {
      session = await getStripe().checkout.sessions.create(
        sessionParamsFor(usedCustomerId),
        { idempotencyKey: `hosting-checkout-${pendingSubscriptionId}` },
      );
    } catch (stripeError) {
      // A stored stripe_customer_id from a DIFFERENT Stripe mode (e.g. a real purchase's live-mode
      // customer, looked up against this environment's test-mode key) is not a checkout failure --
      // it is stale data on our own row. Stripe reports it as invalid_request_error/resource_missing
      // naming the "customer" param; retry once, letting Stripe create a fresh customer for this
      // email under the CURRENT key's mode, and correct the stored id so this does not repeat.
      const isStaleCustomer = usedCustomerId !== null
        && typeof stripeError === 'object' && stripeError !== null
        && (stripeError as { type?: string }).type === 'StripeInvalidRequestError'
        && (stripeError as { param?: string }).param === 'customer';
      if (!isStaleCustomer) throw stripeError;

      usedCustomerId = null;
      session = await getStripe().checkout.sessions.create(
        sessionParamsFor(null),
        { idempotencyKey: `hosting-checkout-${pendingSubscriptionId}-remapped` },
      );
    }
    checkoutSessionId = session.id;
    if (usedCustomerId === null && session.customer && typeof session.customer === 'string') {
      await supabase.from('customers').update({ stripe_customer_id: session.customer }).eq('user_id', user.id);
    }
    if (!session.url) throw new CommerceError('STRIPE_SESSION_FAILED', 'Billing could not be started. No payment was taken.', 503);

    const { error: bindError } = await supabase.from('hosting_subscriptions')
      .update({ stripe_checkout_session_id: session.id, updated_at: new Date().toISOString() })
      .eq('id', pendingSubscriptionId).eq('user_id', user.id);
    if (bindError) throw new CommerceError('HOSTING_CHECKOUT_BIND_FAILED', 'Billing could not be finalized. No payment was taken.', 503);

    return NextResponse.json({ stripeUrl: session.url, subscriptionId: pendingSubscriptionId });
  } catch (error) {
    if (pendingSubscriptionId) {
      // Do not free a reservation while Stripe can still accept its payment.
      // If expiry fails, retain the row so a webhook can reconcile it safely.
      let releasable = !checkoutSessionId;
      if (checkoutSessionId) {
        try {
          const expired = await getStripe().checkout.sessions.expire(checkoutSessionId);
          releasable = expired.status === 'expired';
        } catch {
          console.error('Hosting checkout cleanup requires reconciliation', { subscriptionId: pendingSubscriptionId });
        }
      }
      if (releasable) {
        await createServerClient().from('hosting_subscriptions')
          .update({ status: 'incomplete_expired', updated_at: new Date().toISOString() })
          .eq('id', pendingSubscriptionId).eq('status', 'pending_checkout');
      }
    }
    const status = error instanceof CommerceError ? error.status : 500;
    if (error instanceof CommerceError) console.info('Hosting checkout rejected', { code: error.code });
    else console.error('Hosting checkout failed', { error: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
