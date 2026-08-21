import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';

const root = new URL('../', import.meta.url).pathname.replace(/^\/(.:)/, '$1');
const envFile = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const split = line.indexOf('=');
      let value = line.slice(split + 1).trim();
      if (value.startsWith('"') && value.endsWith('"')) value = JSON.parse(value);
      return [line.slice(0, split), value];
    }),
);
const env = { ...envFile, ...process.env };
if (!env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) throw new Error('A Stripe sandbox secret key is required.');
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Supabase test prerequisites are missing.');
}

const stripe = new Stripe(env.STRIPE_SECRET_KEY);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const baseUrl = 'http://127.0.0.1:3107';
const webhookSecret = `whsec_${randomBytes(32).toString('hex')}`;
const runId = randomUUID();
const testEmail = `civallee4+stripe-${Date.now()}@gmail.com`;
const testPassword = `${randomBytes(24).toString('base64url')}aA9!`;
const orderIds = [];
let userId = null;
let originalProduct = null;
let testProduct = null;
let testPrice = null;
let server = null;
let browser = null;
let checkoutCustomer = null;
let serverTail = '';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForServer() {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    try {
      const response = await fetch(baseUrl, { redirect: 'manual' });
      if (response.status < 500) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error('Local Next.js server did not become ready.');
}

async function signedWebhook(type, object, eventId = `evt_cival_${randomUUID().replaceAll('-', '')}`) {
  const payload = JSON.stringify({
    id: eventId,
    object: 'event',
    api_version: null,
    created: Math.floor(Date.now() / 1000),
    data: { object },
    livemode: false,
    pending_webhooks: 1,
    request: null,
    type,
  });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac('sha256', webhookSecret).update(`${timestamp}.${payload}`).digest('hex');
  const response = await fetch(`${baseUrl}/api/webhooks/stripe`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'stripe-signature': `t=${timestamp},v1=${signature}` },
    body: payload,
  });
  const body = await response.json();
  assert(response.ok, `Webhook ${type} failed (${response.status}): ${body.error || 'unknown error'}`);
  return { eventId, payload };
}

async function createCheckout(accessToken) {
  const response = await fetch(`${baseUrl}/api/checkout`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({
      items: [{ productId: 'trading-dashboard-template', quantity: 1 }],
      name: 'Cival Stripe QA',
      acceptedTerms: true,
      acceptedPluginRequirement: false,
      marketingConsent: false,
    }),
  });
  const body = await response.json();
  assert(response.ok && body.stripeUrl && body.orderId, `Checkout creation failed (${response.status}): ${body.error || 'unknown error'}`);
  const { data: order, error: orderError } = await supabase.from('orders').select('stripe_session_id').eq('id', body.orderId).single();
  assert(!orderError && order?.stripe_session_id?.startsWith('cs_test_'), 'Checkout session was not bound to the order.');
  orderIds.push(body.orderId);
  return { ...body, url: body.stripeUrl, sessionId: order.stripe_session_id };
}

async function fillCard(page, url, cardNumber, expectSuccess) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const cardChoices = [
    page.getByRole('radio', { name: /^Card$/i }).first(),
    page.locator('[data-testid="card-accordion-item"]').first(),
    page.locator('[data-testid="payment-method-accordion-item"]').filter({ hasText: /^Card$/i }).first(),
    page.locator('button').filter({ hasText: /^Card$/i }).first(),
    page.getByText(/^Card$/i).last(),
  ];
  for (const choice of cardChoices) {
    if (await choice.count() && await choice.isVisible().catch(() => false)) {
      await choice.click({ force: true }).catch(() => undefined);
      await page.waitForTimeout(500);
    }
  }

  async function paymentField(selectors, label) {
    for (const frame of page.frames()) {
      for (const selector of selectors) {
        const candidate = frame.locator(selector).first();
        if (await candidate.count()) return candidate;
      }
    }
    const inputs = [];
    for (const frame of page.frames()) {
      const frameInputs = await frame.locator('input').evaluateAll((nodes) => nodes.slice(0, 30).map((node) => ({
        type: node.type,
        name: node.name,
        id: node.id,
        placeholder: node.placeholder,
        autocomplete: node.autocomplete,
        ariaLabel: node.getAttribute('aria-label'),
      }))).catch(() => []);
      if (frameInputs.length) inputs.push({ frame: frame.url(), inputs: frameInputs });
    }
    const diagnostics = {
      url: page.url(),
      title: await page.title(),
      text: (await page.locator('body').innerText().catch(() => '')).slice(0, 700),
      inputs,
    };
    throw new Error(`${label} field was not found: ${JSON.stringify(diagnostics)}`);
  }

  await (await paymentField(['input[name="cardNumber"]', 'input[autocomplete="cc-number"]', '#cardNumber', 'input[placeholder*="1234"]'], 'Card number')).fill(cardNumber);
  await (await paymentField(['input[name="cardExpiry"]', 'input[autocomplete="cc-exp"]', '#cardExpiry', 'input[placeholder*="MM"]'], 'Expiry')).fill('12 / 30');
  await (await paymentField(['input[name="cardCvc"]', 'input[autocomplete="cc-csc"]', '#cardCvc', 'input[placeholder="CVC"]'], 'CVC')).fill('123');
  const linkSave = page.getByRole('checkbox', { name: /Save my information/i }).first();
  if (await linkSave.count() && await linkSave.isChecked().catch(() => false)) await linkSave.uncheck({ force: true });
  const name = page.locator('input[autocomplete="cc-name"], input[name="billingName"], input[placeholder="Name on card"], input[placeholder="Full name on card"]').first();
  if (await name.count()) await name.fill('Cival Stripe QA');
  const postal = page.locator('input[autocomplete="postal-code"], input[name="postalCode"], input[placeholder="ZIP"], input[placeholder="Postal code"]').first();
  if (await postal.count()) await postal.fill('94107');
  await page.locator('[data-testid="hosted-payment-submit-button"]').click();
  if (expectSuccess) {
    try {
      await page.waitForURL(`${baseUrl}/checkout/success**`, { timeout: 45_000 });
    } catch {
      const current = new URL(page.url());
      throw new Error(`Stripe Checkout did not redirect after payment: ${JSON.stringify({
        location: `${current.origin}${current.pathname}`,
        text: (await page.locator('body').innerText().catch(() => '')).slice(-1400),
      })}`);
    }
  } else {
    await page.waitForTimeout(2500);
    assert(page.url().includes('checkout.stripe.com'), 'Declined card unexpectedly left Stripe Checkout.');
    const body = (await page.locator('body').innerText()).toLowerCase();
    assert(body.includes('declined') || body.includes('card was declined'), 'Expected declined-card feedback was not shown.');
  }
}

async function orderEvidence(orderId) {
  const [{ data: order }, { data: items }, { data: downloads }, { data: outbox }] = await Promise.all([
    supabase.from('orders').select('id,status,payment_intent_id,stripe_session_id,total_cents').eq('id', orderId).single(),
    supabase.from('order_items').select('id').eq('order_id', orderId),
    supabase.from('downloads').select('id').eq('order_id', orderId),
    supabase.from('email_outbox').select('id,status,attempts').eq('order_id', orderId),
  ]);
  const itemIds = (items || []).map((item) => item.id);
  const { data: entitlements } = itemIds.length
    ? await supabase.from('entitlements').select('id,status').in('source_order_item_id', itemIds)
    : { data: [] };
  return { order, items: items || [], entitlements: entitlements || [], downloads: downloads || [], outbox: outbox || [] };
}

async function cleanup() {
  if (browser) await browser.close().catch(() => undefined);
  if (server) server.kill();
  if (orderIds.length) {
    const { data: itemRows } = await supabase.from('order_items').select('id').in('order_id', orderIds);
    const itemIds = (itemRows || []).map((item) => item.id);
    await supabase.from('email_outbox').delete().in('order_id', orderIds);
    await supabase.from('downloads').delete().in('order_id', orderIds);
    if (itemIds.length) await supabase.from('entitlements').delete().in('source_order_item_id', itemIds);
    await supabase.from('orders').delete().in('id', orderIds);
  }
  if (userId) await supabase.auth.admin.deleteUser(userId).catch(() => undefined);
  if (originalProduct) {
    await supabase.from('products').update({ stripe_price_id: originalProduct.stripe_price_id, is_active: originalProduct.is_active }).eq('id', originalProduct.id);
  }
  if (checkoutCustomer) await stripe.customers.del(checkoutCustomer).catch(() => undefined);
  if (testPrice) await stripe.prices.update(testPrice.id, { active: false }).catch(() => undefined);
  if (testProduct) await stripe.products.update(testProduct.id, { active: false }).catch(() => undefined);
}

try {
  const { data: catalog, error: catalogError } = await supabase.from('products').select('*').eq('id', 'trading-dashboard-template').single();
  if (catalogError || !catalog) throw catalogError || new Error('Core catalog row is missing.');
  originalProduct = catalog;

  testProduct = await stripe.products.create({ name: 'Cival Core 2.0 — automated sandbox gauntlet', metadata: { cival_gauntlet: runId } });
  testPrice = await stripe.prices.create({ product: testProduct.id, currency: 'usd', unit_amount: 9900, metadata: { cival_gauntlet: runId } });
  const { error: catalogUpdateError } = await supabase.from('products').update({ stripe_price_id: testPrice.id, is_active: true }).eq('id', catalog.id);
  if (catalogUpdateError) throw catalogUpdateError;

  const { data: created, error: userError } = await supabase.auth.admin.createUser({ email: testEmail, password: testPassword, email_confirm: true, user_metadata: { cival_gauntlet: runId } });
  if (userError || !created.user) throw userError || new Error('Test user could not be created.');
  userId = created.user.id;
  const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: signedIn, error: signInError } = await anon.auth.signInWithPassword({ email: testEmail, password: testPassword });
  if (signInError || !signedIn.session?.access_token) throw signInError || new Error('Test user could not sign in.');

  const childEnv = {
    ...env,
    STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: webhookSecret,
    NEXT_PUBLIC_CORE_STRIPE_PRICE_ID: testPrice.id,
    NEXT_PUBLIC_STORE_SALES_ENABLED: 'true',
    NEXT_PUBLIC_HOSTING_SALES_ENABLED: 'false',
    HOSTING_AUTOMATION_ENABLED: 'false',
    NEXT_PUBLIC_SITE_URL: baseUrl,
    PORT: '3107',
  };
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', '3107'], { cwd: root, env: childEnv, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stdout.on('data', (chunk) => { serverTail = `${serverTail}${chunk}`.slice(-6000); });
  server.stderr.on('data', (chunk) => { serverTail = `${serverTail}${chunk}`.slice(-6000); });
  await waitForServer();

  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const successful = await createCheckout(signedIn.session.access_token);
  await fillCard(page, successful.url, '4242424242424242', true);
  const paidSession = await stripe.checkout.sessions.retrieve(successful.sessionId, { expand: ['payment_intent'] });
  assert(paidSession.payment_status === 'paid', 'Stripe sandbox session was not paid.');
  checkoutCustomer = typeof paidSession.customer === 'string' ? paidSession.customer : paidSession.customer?.id;
  const fulfillment = await signedWebhook('checkout.session.completed', paidSession);
  const paidEvidence = await orderEvidence(successful.orderId);
  assert(paidEvidence.order.status === 'paid', 'Order did not become paid.');
  assert(paidEvidence.items.length === 1 && paidEvidence.entitlements.length === 1, 'Fulfillment did not create exactly one item and entitlement.');
  assert(paidEvidence.downloads.length === 0, 'Fulfillment created a download token before the customer requested one.');
  assert(paidEvidence.entitlements[0].status === 'active', 'Paid entitlement is not active.');
  assert(paidEvidence.outbox.length === 1 && paidEvidence.outbox[0].status === 'sent', 'Confirmation email was not sent.');

  const regenerate = await fetch(`${baseUrl}/api/account/regenerate-download`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${signedIn.session.access_token}` },
    body: JSON.stringify({ orderId: successful.orderId, productId: 'trading-dashboard-template' }),
  });
  const regenerated = await regenerate.json();
  assert(regenerate.ok && typeof regenerated.downloadUrl === 'string', `Download token regeneration failed (${regenerate.status}).`);
  const download = await fetch(regenerated.downloadUrl, { redirect: 'manual' });
  assert(download.status === 303 && download.headers.get('location')?.startsWith('https://'), 'Customer download did not redirect to a signed artifact.');
  const downloadableEvidence = await orderEvidence(successful.orderId);
  assert(downloadableEvidence.downloads.length === 1, 'Customer download token was not recorded exactly once.');

  const replayBefore = JSON.stringify(downloadableEvidence);
  await signedWebhook('checkout.session.completed', paidSession, fulfillment.eventId);
  const replayAfter = JSON.stringify(await orderEvidence(successful.orderId));
  assert(replayBefore === replayAfter, 'Webhook replay changed fulfillment state.');

  const invalidSignature = await fetch(`${baseUrl}/api/webhooks/stripe`, { method: 'POST', headers: { 'stripe-signature': 't=1,v1=invalid' }, body: '{}' });
  assert(invalidSignature.status === 400, 'Invalid webhook signature was not rejected.');

  const declined = await createCheckout(signedIn.session.access_token);
  await fillCard(page, declined.url, '4000000000000002', false);
  const declinedSession = await stripe.checkout.sessions.retrieve(declined.sessionId);
  assert(declinedSession.payment_status === 'unpaid', 'Declined checkout became paid.');
  const expiredSession = await stripe.checkout.sessions.expire(declined.sessionId);
  await signedWebhook('checkout.session.expired', expiredSession);
  const expiredEvidence = await orderEvidence(declined.orderId);
  assert(expiredEvidence.order.status === 'expired' && expiredEvidence.entitlements.length === 0, 'Expired checkout was not closed without entitlement.');

  const paymentIntentId = typeof paidSession.payment_intent === 'string' ? paidSession.payment_intent : paidSession.payment_intent.id;
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const chargeId = typeof intent.latest_charge === 'string' ? intent.latest_charge : intent.latest_charge.id;
  await stripe.refunds.create({ payment_intent: paymentIntentId, amount: 2500, metadata: { cival_gauntlet: runId } });
  let charge = await stripe.charges.retrieve(chargeId);
  await signedWebhook('charge.refunded', charge);
  const partialEvidence = await orderEvidence(successful.orderId);
  assert(partialEvidence.order.status === 'partially_refunded' && partialEvidence.entitlements[0].status === 'active', 'Partial refund did not preserve access.');

  await stripe.refunds.create({ payment_intent: paymentIntentId, amount: 7400, metadata: { cival_gauntlet: runId } });
  charge = await stripe.charges.retrieve(chargeId);
  await signedWebhook('charge.refunded', charge);
  const refundEvidence = await orderEvidence(successful.orderId);
  assert(refundEvidence.order.status === 'refunded' && refundEvidence.entitlements[0].status === 'revoked', 'Full refund did not revoke access.');

  console.log(JSON.stringify({
    result: 'PASS',
    mode: 'Stripe sandbox',
    successfulCheckout: true,
    fulfillmentExactlyOnce: true,
    confirmationEmail: 'sent',
    webhookReplayIdempotent: true,
    invalidSignatureRejected: true,
    declinedCardRejected: true,
    expiredCheckoutClosed: true,
    partialRefundPreservedAccess: true,
    fullRefundRevokedAccess: true,
    cleanup: 'running',
  }, null, 2));
} catch (error) {
  const safeTail = serverTail
    .replace(/sk_(?:test|live)_[A-Za-z0-9]+/g, '[REDACTED_STRIPE_KEY]')
    .replace(/whsec_[A-Za-z0-9]+/g, '[REDACTED_WEBHOOK_SECRET]')
    .replace(/eyJ[A-Za-z0-9._-]+/g, '[REDACTED_JWT]');
  console.error(JSON.stringify({
    result: 'FAIL',
    error: error instanceof Error ? error.message : String(error),
    serverTail: safeTail,
  }, null, 2));
  process.exitCode = 1;
} finally {
  await cleanup();
}
