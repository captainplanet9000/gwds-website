import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getProduct } from '@/lib/products';
import { createServerClient } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import {
  COMMERCE_VERSIONS,
  CORE_BUNDLE_IDS,
  CORE_PRODUCT_ID,
  CommerceError,
  commerceErrorMessage,
  errorResponseBody,
  getSiteUrl,
  normalizeCoupon,
  normalizeName,
  requireVerifiedUser,
  type CatalogProductRow,
} from '@/lib/commerce';

export const runtime = 'nodejs';

interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

interface CheckoutBody {
  items?: unknown;
  name?: unknown;
  couponCode?: unknown;
  acceptedTerms?: unknown;
  acceptedPluginRequirement?: unknown;
  marketingConsent?: unknown;
}

interface CheckoutRpcResult {
  order_id: string;
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  coupon_code: string | null;
}

function parseItems(value: unknown): CheckoutItemInput[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 12) {
    throw new CommerceError('INVALID_CART', 'Your cart must contain between 1 and 12 products.');
  }

  const items = value.map((entry) => {
    if (!entry || typeof entry !== 'object') {
      throw new CommerceError('INVALID_CART', 'Your cart contains an invalid item.');
    }
    const productId = 'productId' in entry ? entry.productId : null;
    const quantity = 'quantity' in entry ? entry.quantity : null;
    if (typeof productId !== 'string' || !/^[a-z0-9-]{2,80}$/.test(productId) || quantity !== 1) {
      throw new CommerceError('INVALID_CART', 'Products may only be purchased once per order.');
    }
    return { productId, quantity: 1 };
  });

  if (new Set(items.map((item) => item.productId)).size !== items.length) {
    throw new CommerceError('DUPLICATE_PRODUCT', 'Duplicate products are not allowed.');
  }
  return items;
}

async function requireCatalog(items: CheckoutItemInput[]): Promise<CatalogProductRow[]> {
  const supabase = createServerClient();
  const ids = items.map((item) => item.productId);
  const { data, error } = await supabase
    .from('products')
    .select('id,name,price_cents,stripe_price_id,version,artifact_path,artifact_sha256,artifact_size_bytes,artifact_ready,is_active')
    .in('id', ids);

  if (error) throw new CommerceError('CATALOG_UNAVAILABLE', 'The product catalog is temporarily unavailable.', 503);
  const rows = (data || []) as CatalogProductRow[];
  if (rows.length !== ids.length) {
    throw new CommerceError('PRODUCT_UNAVAILABLE', 'One or more products are not currently available.', 409);
  }

  for (const row of rows) {
    const local = getProduct(row.id);
    const configured = local && !local.legacy && local.stripePriceId === row.stripe_price_id
      && Math.round(local.price * 100) === row.price_cents;
    if (!configured || !row.is_active) {
      throw new CommerceError('CATALOG_MISMATCH', 'A product is being updated. Please try again later.', 503);
    }
    if (!row.artifact_ready || !row.artifact_path || !row.artifact_sha256 || !row.artifact_size_bytes) {
      throw new CommerceError(
        'RELEASE_NOT_READY',
        `${row.name} is not on sale while its release archive is being verified. No payment was taken.`,
        503,
      );
    }
  }
  const storageChecks = await Promise.all(rows.map((row) =>
    supabase.storage.from('downloads').createSignedUrl(row.artifact_path!, 30),
  ));
  if (storageChecks.some((result) => result.error || !result.data?.signedUrl)) {
    throw new CommerceError('DOWNLOAD_SERVICE_UNAVAILABLE', 'Downloads are temporarily unavailable, so checkout is paused. No payment was taken.', 503);
  }
  return rows.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
}

async function requireCoreDependency(userId: string, items: CheckoutItemInput[]) {
  const localProducts = items.map((item) => getProduct(item.productId));
  const needsCore = localProducts.some((product) => product?.requiresDashboard);
  if (!needsCore) return;

  const cartIds = new Set(items.map((item) => item.productId));
  if (cartIds.has(CORE_PRODUCT_ID) || CORE_BUNDLE_IDS.some((id) => cartIds.has(id))) return;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .in('product_id', [CORE_PRODUCT_ID, ...CORE_BUNDLE_IDS])
    .limit(1);

  if (error) throw new CommerceError('ENTITLEMENT_CHECK_FAILED', 'We could not verify your Core Edition access.', 503);
  if (!data?.length) {
    throw new CommerceError('CORE_REQUIRED', 'This add-on requires Core Edition. Add Core Edition to your cart first.', 409);
  }
}

async function verifyStripePrices(rows: CatalogProductRow[]) {
  const stripe = getStripe();
  const prices = await Promise.all(rows.map((row) => stripe.prices.retrieve(row.stripe_price_id!)));
  prices.forEach((price, index) => {
    const row = rows[index];
    if (!price.active || price.livemode !== (process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ?? false)
      || price.currency !== 'usd' || price.type !== 'one_time' || price.unit_amount !== row.price_cents) {
      throw new CommerceError('STRIPE_PRICE_MISMATCH', `${row.name} is not configured for checkout.`, 503);
    }
  });
}

function lineItems(rows: CatalogProductRow[], order: CheckoutRpcResult): Stripe.Checkout.SessionCreateParams.LineItem[] {
  if (order.discount_cents === 0) {
    return rows.map((row) => ({ price: row.stripe_price_id!, quantity: 1 }));
  }
  const names = rows.map((row) => row.name).join(', ').slice(0, 490);
  return [{
    price_data: {
      currency: 'usd',
      unit_amount: order.total_cents,
      product_data: {
        name: `Cival Systems order (${rows.length} ${rows.length === 1 ? 'product' : 'products'})`,
        description: `${names}${order.coupon_code ? ` — ${order.coupon_code} applied` : ''}`,
      },
    },
    quantity: 1,
  }];
}

export async function POST(req: NextRequest) {
  let createdOrderId: string | null = null;
  let createdSessionId: string | null = null;

  try {
    if (process.env.NEXT_PUBLIC_STORE_SALES_ENABLED !== 'true') {
      throw new CommerceError('STORE_PAUSED', 'Checkout is paused while releases are being verified. No payment was taken.', 503);
    }

    const contentLength = Number(req.headers.get('content-length') || '0');
    if (contentLength > 16_384) throw new CommerceError('REQUEST_TOO_LARGE', 'Checkout request is too large.', 413);

    const user = await requireVerifiedUser(req);
    const body = await req.json() as CheckoutBody;
    if (body.acceptedTerms !== true) {
      throw new CommerceError('LEGAL_ACCEPTANCE_REQUIRED', 'Accept the Terms, Refund Policy, and Trading Disclaimer to continue.');
    }

    const items = parseItems(body.items);
    const name = normalizeName(body.name);
    const couponCode = normalizeCoupon(body.couponCode);
    const marketingConsent = body.marketingConsent === true;
    const hasPlugin = items.some((item) => getProduct(item.productId)?.requiresDashboard);
    if (hasPlugin && body.acceptedPluginRequirement !== true) {
      throw new CommerceError('PLUGIN_ACKNOWLEDGEMENT_REQUIRED', 'Acknowledge the Core Edition requirement to continue.');
    }

    const rows = await requireCatalog(items);
    await requireCoreDependency(user.id, items);
    await verifyStripePrices(rows);

    const supabase = createServerClient();
    const { data: checkoutData, error: checkoutError } = await supabase.rpc('create_store_checkout', {
      p_user_id: user.id,
      p_customer_email: user.email!,
      p_customer_name: name,
      p_coupon_code: couponCode,
      p_terms_version: COMMERCE_VERSIONS.terms,
      p_refund_policy_version: COMMERCE_VERSIONS.refunds,
      p_disclaimer_version: COMMERCE_VERSIONS.disclaimer,
      p_marketing_consent: marketingConsent,
      p_items: items.map((item) => ({ product_id: item.productId, quantity: 1 })),
    });

    if (checkoutError) throw commerceErrorMessage(checkoutError.message);
    const order = (checkoutData?.[0] || null) as CheckoutRpcResult | null;
    if (!order?.order_id || order.total_cents < 50) {
      throw new CommerceError('ORDER_CREATION_FAILED', 'Checkout could not be prepared. No payment was taken.', 503);
    }
    createdOrderId = order.order_id;

    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    const siteUrl = getSiteUrl();
    const stripe = getStripe();
    const sessionParamsFor = (stripeCustomerId: string | null): Stripe.Checkout.SessionCreateParams => ({
      mode: 'payment',
      line_items: lineItems(rows, order),
      client_reference_id: order.order_id,
      ...(stripeCustomerId ? { customer: stripeCustomerId } : { customer_email: user.email!, customer_creation: 'always' as const }),
      metadata: {
        order_id: order.order_id,
        user_id: user.id,
        product_ids: rows.map((row) => row.id).join(','),
        legal_version: COMMERCE_VERSIONS.terms,
      },
      payment_intent_data: {
        metadata: { order_id: order.order_id, user_id: user.id },
      },
      automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === 'true' },
      billing_address_collection: 'auto',
      phone_number_collection: { enabled: false },
      allow_promotion_codes: false,
      submit_type: 'pay',
      custom_text: {
        submit: { message: 'Software source code only. Trading involves substantial risk; no returns are guaranteed.' },
      },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout?canceled=1`,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
    });

    // A stored stripe_customer_id from a DIFFERENT Stripe mode (e.g. a real purchase's live-mode
    // customer, looked up against this environment's test-mode key) is not a checkout failure --
    // it is stale data on our own row. Same fix as /api/hosting/checkout: retry once without the
    // stored id, letting Stripe issue a fresh customer under the current key's mode, and correct
    // the stored id so this account does not hit this on every future purchase.
    let usedCustomerId = typeof customer?.stripe_customer_id === 'string' ? customer.stripe_customer_id : null;
    let session;
    try {
      session = await stripe.checkout.sessions.create(sessionParamsFor(usedCustomerId), {
        idempotencyKey: `cival-checkout-${order.order_id}`,
      });
    } catch (stripeError) {
      const isStaleCustomer = usedCustomerId !== null
        && typeof stripeError === 'object' && stripeError !== null
        && (stripeError as { type?: string }).type === 'StripeInvalidRequestError'
        && (stripeError as { param?: string }).param === 'customer';
      if (!isStaleCustomer) throw stripeError;

      usedCustomerId = null;
      session = await stripe.checkout.sessions.create(sessionParamsFor(null), {
        idempotencyKey: `cival-checkout-${order.order_id}-remapped`,
      });
    }
    createdSessionId = session.id;
    if (usedCustomerId === null && session.customer && typeof session.customer === 'string') {
      await supabase.from('customers').update({ stripe_customer_id: session.customer }).eq('user_id', user.id);
    }
    if (!session.url) throw new Error('Stripe did not return a checkout URL');

    const { error: bindError } = await supabase
      .from('orders')
      .update({ stripe_session_id: session.id, updated_at: new Date().toISOString() })
      .eq('id', order.order_id)
      .eq('stripe_session_id', `pending:${order.order_id}`);

    if (bindError) {
      await stripe.checkout.sessions.expire(session.id).catch(() => undefined);
      throw new CommerceError('ORDER_BIND_FAILED', 'Checkout could not be finalized. No payment was taken.', 503);
    }

    return NextResponse.json({ stripeUrl: session.url, orderId: order.order_id });
  } catch (error) {
    const code = error instanceof CommerceError ? error.code : 'UNEXPECTED';
    const context = {
      code,
      orderId: createdOrderId,
      sessionId: createdSessionId,
    };
    if (error instanceof CommerceError) console.info('Checkout rejected', context);
    else console.error('Checkout failed', context);

    if (createdOrderId) {
      const supabase = createServerClient();
      try {
        // Marks the order checkout_failed and, atomically in the same locked
        // transaction, releases any coupon-use reservation create_store_checkout
        // took for it — otherwise a failed checkout would permanently consume
        // one of the coupon's max_uses even though no payment ever happened.
        await supabase.rpc('release_store_checkout_coupon', {
          p_order_id: createdOrderId,
          p_reason: error instanceof CommerceError ? error.code : 'UNEXPECTED',
        });
      } catch {
        // The original failure is more useful than a cleanup failure.
      }
    }

    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status });
  }
}
