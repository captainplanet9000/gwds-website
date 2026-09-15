import { NextRequest, NextResponse } from 'next/server';
import { COMMERCE_VERSIONS, CommerceError, errorResponseBody, getSiteUrl, requireVerifiedUser } from '@/lib/commerce';
import { HOSTING_SERVICE_TERMS_VERSION, hostingLaunchMessage, hostingSalesEnabled } from '@/lib/hosting';
import { getStripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';

type Client = ReturnType<typeof createServerClient>;

/** Stripe's default Checkout Session lifetime. */
const CHECKOUT_SESSION_LIFETIME_MS = 24 * 60 * 60 * 1000;

// Subscription capacity (hosting_capacity) and host placement (control.host_registry) are two
// separate admission systems. Without this check a customer can pay while no host admits tenants,
// and provision_hosting_tenant then raises HOSTING_NO_AVAILABLE_HOST after the charge. Placement can
// still race, but nobody is charged while placement is known to be closed.
async function requireAdmittingHost(supabase: Client) {
  const { data, error } = await supabase.rpc('hosting_host_capacity');
  if (error) throw new CommerceError('HOSTING_UNAVAILABLE', 'Hosted workspaces are temporarily unavailable. No payment was taken.', 503);
  const hosts = (data || []) as Array<{ admissions_enabled?: boolean; available_slots?: number | string }>;
  if (!hosts.some((host) => host.admissions_enabled && Number(host.available_slots) > 0)) {
    throw new CommerceError('HOSTING_NO_HOST_AVAILABLE', 'No hosted workspace capacity is open right now, so checkout is paused. No payment was taken. Please check back shortly.', 409);
  }
}

interface UnfinishedCheckout {
  id: string;
  plan_id: string;
  status: string;
  stripe_checkout_session_id: string | null;
  created_at: string;
}

async function retireCheckout(supabase: Client, row: UnfinishedCheckout) {
  const { error } = await supabase.from('hosting_subscriptions')
    .update({ status: 'incomplete_expired', updated_at: new Date().toISOString() })
    .eq('id', row.id).eq('status', row.status);
  if (error) throw new CommerceError('HOSTING_CHECKOUT_UNAVAILABLE', 'Your previous checkout could not be closed. No payment was taken.', 503);
}

/**
 * A customer with an unfinished checkout gets that checkout back instead of an
 * OPEN_SUBSCRIPTION_EXISTS refusal, and a checkout that can no longer be paid is closed so a new one
 * can start. "Unfinished" means never activated: activation is what binds stripe_subscription_id,
 * and an 'incomplete' row that WAS activated is a real Stripe subscription awaiting payment, which
 * the billing portal manages. The only unactivated 'incomplete' rows are checkouts whose async
 * payment failed (see the Stripe webhook).
 *
 * Never closes a checkout Stripe may still collect for: a paid or processing session, or a row
 * whose session id was never bound and could still be open, is refused rather than replaced, so
 * the customer is never charged twice.
 */
async function settleUnfinishedCheckouts(
  supabase: Client,
  userId: string,
  planId: string,
): Promise<{ resumeUrl: string; subscriptionId: string } | { retired: boolean }> {
  const { data, error } = await supabase.from('hosting_subscriptions')
    .select('id,plan_id,status,stripe_checkout_session_id,created_at')
    .eq('user_id', userId).in('status', ['pending_checkout', 'incomplete']).is('stripe_subscription_id', null)
    .order('created_at', { ascending: false });
  if (error) throw new CommerceError('HOSTING_CHECKOUT_UNAVAILABLE', hostingLaunchMessage(), 503);

  let retired = false;
  for (const row of (data || []) as UnfinishedCheckout[]) {
    const session = row.stripe_checkout_session_id
      ? await getStripe().checkout.sessions.retrieve(row.stripe_checkout_session_id)
      : null;
    if (session?.status === 'open' && row.status === 'pending_checkout' && row.plan_id === planId && session.url) {
      return { resumeUrl: session.url, subscriptionId: row.id };
    }
    if (session?.status === 'complete' && row.status === 'pending_checkout') {
      if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
        throw new CommerceError('CHECKOUT_ALREADY_PAID', 'Your payment was received and your workspace is being set up. Refresh this page in a moment.', 409);
      }
      throw new CommerceError('CHECKOUT_PAYMENT_PROCESSING', 'Your last payment is still processing with Stripe. Check back once it settles.', 409);
    }
    if (!session && Date.now() - new Date(row.created_at).getTime() < CHECKOUT_SESSION_LIFETIME_MS) {
      throw new CommerceError('CHECKOUT_FINALIZING', 'A previous checkout is still being finalized. Please try again later.', 409);
    }
    if (session?.status === 'open') {
      const expired = await getStripe().checkout.sessions.expire(session.id);
      if (expired.status !== 'expired') throw new CommerceError('HOSTING_CHECKOUT_UNAVAILABLE', 'Your previous checkout could not be closed. No payment was taken.', 503);
    }
    await retireCheckout(supabase, row);
    retired = true;
  }
  return { retired };
}

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
    if (typeof body.planId !== 'string' || !/^[a-z0-9-]{2,40}$/.test(body.planId)) {
      throw new CommerceError('INVALID_PLAN', 'Choose a valid hosting plan.');
    }

    const supabase = createServerClient();
    const { data: plan, error: planError } = await supabase.from('hosting_plans')
      .select('id,name,price_cents,currency,billing_interval,stripe_price_id,is_active,launch_ready')
      .eq('id', body.planId).maybeSingle();
    if (planError) throw new CommerceError('HOSTING_UNAVAILABLE', 'Hosting plans are temporarily unavailable.', 503);
    if (!plan?.is_active || !plan.launch_ready || !plan.stripe_price_id || plan.price_cents < 50) {
      throw new CommerceError('PLAN_NOT_READY', hostingLaunchMessage(), 503);
    }

    await requireAdmittingHost(supabase);

    // Terms were accepted and recorded when the unfinished checkout was created, so resuming it
    // does not ask again. Starting a NEW checkout always does.
    const unfinished = await settleUnfinishedCheckouts(supabase, user.id, plan.id);
    if ('resumeUrl' in unfinished) {
      return NextResponse.json({ stripeUrl: unfinished.resumeUrl, subscriptionId: unfinished.subscriptionId, resumed: true });
    }
    if (body.acceptedTerms !== true) {
      throw unfinished.retired
        ? new CommerceError('CHECKOUT_RESTART_REQUIRED', 'That checkout can no longer be completed. Choose a plan below and accept the terms to start again.', 409)
        : new CommerceError('LEGAL_ACCEPTANCE_REQUIRED', 'Accept the hosting terms, Terms, Refund Policy, and Trading Disclaimer to continue.');
    }

    const price = await getStripe().prices.retrieve(plan.stripe_price_id);
    const live = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ?? false;
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
    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
      success_url: `${siteUrl}/account/hosting?checkout=success`,
      cancel_url: `${siteUrl}/hosted?checkout=cancelled`,
      customer: customer?.stripe_customer_id || undefined,
      customer_email: customer?.stripe_customer_id ? undefined : user.email!,
      client_reference_id: user.id,
      metadata,
      subscription_data: { metadata },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    }, { idempotencyKey: `hosting-checkout-${pendingSubscriptionId}` });
    checkoutSessionId = session.id;
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

// Cancels the signed-in customer's own unpaid checkout: the Stripe session is expired first (so it
// can no longer be paid), and only then is the reservation released. Only a pending_checkout row
// qualifies; anything Stripe already completed is left for billing to settle.
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);
    const subscriptionId = req.nextUrl.searchParams.get('subscriptionId') || '';
    if (!/^[0-9a-f-]{36}$/i.test(subscriptionId)) throw new CommerceError('INVALID_SUBSCRIPTION', 'Choose a valid subscription.');

    const supabase = createServerClient();
    const { data: row, error } = await supabase.from('hosting_subscriptions')
      .select('id,status,stripe_checkout_session_id')
      .eq('id', subscriptionId).eq('user_id', user.id).maybeSingle();
    if (error) throw new CommerceError('HOSTING_CHECKOUT_UNAVAILABLE', 'Your checkout could not be loaded. Please retry.', 503);
    if (!row) throw new CommerceError('SUBSCRIPTION_NOT_FOUND', 'That checkout was not found.', 404);
    if (row.status !== 'pending_checkout') throw new CommerceError('NOT_PENDING_CHECKOUT', 'Only an unfinished checkout can be canceled here.', 409);

    if (row.stripe_checkout_session_id) {
      const session = await getStripe().checkout.sessions.retrieve(row.stripe_checkout_session_id);
      if (session.status === 'complete') {
        throw new CommerceError('CHECKOUT_ALREADY_COMPLETED', 'This checkout was already completed at Stripe, so it cannot be canceled here. Refresh the page, and use Manage billing to cancel the subscription.', 409);
      }
      if (session.status === 'open') {
        const expired = await getStripe().checkout.sessions.expire(session.id);
        if (expired.status !== 'expired') throw new CommerceError('HOSTING_CHECKOUT_UNAVAILABLE', 'The checkout could not be canceled. Please retry.', 503);
      }
    }

    const { data: updated, error: updateError } = await supabase.from('hosting_subscriptions')
      .update({ status: 'incomplete_expired', updated_at: new Date().toISOString() })
      .eq('id', row.id).eq('user_id', user.id).eq('status', 'pending_checkout').select('id').maybeSingle();
    if (updateError) throw new CommerceError('HOSTING_CHECKOUT_UNAVAILABLE', 'The checkout could not be canceled. Please retry.', 503);
    if (!updated) throw new CommerceError('NOT_PENDING_CHECKOUT', 'This checkout changed while it was being canceled. Refresh the page.', 409);

    return NextResponse.json({ ok: true, subscriptionId: row.id }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    if (!(error instanceof CommerceError)) console.error('Hosting checkout cancel failed', { error: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
