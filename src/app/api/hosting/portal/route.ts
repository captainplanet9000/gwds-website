import { NextRequest, NextResponse } from 'next/server';
import { CommerceError, errorResponseBody, getSiteUrl, requireVerifiedUser } from '@/lib/commerce';
import { getStripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);
    const { data: subscription, error } = await createServerClient().from('hosting_subscriptions')
      .select('stripe_customer_id, livemode').eq('user_id', user.id)
      .not('stripe_customer_id', 'is', null).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (error || !subscription?.stripe_customer_id) throw new CommerceError('BILLING_ACCOUNT_NOT_FOUND', 'No hosting billing account was found.', 404);
    // livemode is recorded per subscription (from the Stripe event that created it) precisely
    // because this database now serves both the live site and the test-mode pilot -- a live-mode
    // Stripe key cannot open a portal session for a test-mode customer, or vice versa.
    const session = await getStripe(subscription.livemode !== false).billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${getSiteUrl()}/account/hosting`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
