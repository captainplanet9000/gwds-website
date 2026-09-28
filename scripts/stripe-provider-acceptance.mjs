import fs from 'node:fs';
import Stripe from 'stripe';

// Provider contract acceptance only. This does not certify application webhook
// fulfillment, browser checkout, email arrival, or production delivery.
const secret = JSON.parse(fs.readFileSync('C:/GWDS/launch-acceptance-20260926/stripe-sandbox.private.json', 'utf8')).stripeSecretKey;
if (!/^sk_test_/.test(secret || '')) throw new Error('Sandbox key required');
const stripe = new Stripe(secret);
const run = `cival-acceptance-${Date.now()}`;
const report = { run, at: new Date().toISOString(), mode: 'test', scope: 'Stripe provider contracts; not application end-to-end', plans: [], cleanup: [] };
const cleanup = [];
const assert = (x, m) => { if (!x) throw new Error(m); };
const output = 'C:/GWDS/artifacts/stripe-provider-acceptance-20260928.json';
const save = () => fs.writeFileSync(output, JSON.stringify(report, null, 2));
try {
  for (const [plan, amount] of [['solo', 2900], ['desk', 7900], ['fund', 19900]]) {
    const product = await stripe.products.create({ name: `Acceptance fixture ${plan}`, metadata: { acceptance_run: run } });
    cleanup.push(async () => stripe.products.update(product.id, { active: false }));
    const price = await stripe.prices.create({ product: product.id, currency: 'usd', unit_amount: amount, recurring: { interval: 'month' } });
    cleanup.push(async () => stripe.prices.update(price.id, { active: false }));
    const customer = await stripe.customers.create({ name: 'Cival isolated acceptance fixture', metadata: { acceptance_run: run } });
    cleanup.push(async () => stripe.customers.del(customer.id));
    const pm = await stripe.paymentMethods.attach('pm_card_visa', { customer: customer.id });
    await stripe.customers.update(customer.id, { invoice_settings: { default_payment_method: pm.id } });
    const session = await stripe.checkout.sessions.create({ customer: customer.id, mode: 'subscription', payment_method_types: ['card'], payment_method_collection: 'always', line_items: [{ price: price.id, quantity: 1 }], success_url: 'http://127.0.0.1:3107/account/hosting', cancel_url: 'http://127.0.0.1:3107/hosted', ...(plan === 'solo' ? { subscription_data: { trial_period_days: 7 } } : {}) });
    assert(session.livemode === false && session.status === 'open' && session.payment_method_collection === 'always', `${plan}: checkout configuration mismatch`);
    const expired = await stripe.checkout.sessions.expire(session.id);
    assert(expired.status === 'expired' && !expired.subscription, `${plan}: abandoned checkout created a subscription`);
    let sub = await stripe.subscriptions.create({ customer: customer.id, items: [{ price: price.id }], default_payment_method: pm.id, metadata: { acceptance_run: run }, ...(plan === 'solo' ? { trial_period_days: 7 } : {}) });
    cleanup.push(async () => { const current = await stripe.subscriptions.retrieve(sub.id); if (current.status !== 'canceled') await stripe.subscriptions.cancel(sub.id); });
    const evidence = { plan, amount, checkoutRequiresCard: true, abandonedCheckoutExpired: true, subscriptionId: sub.id };
    if (plan === 'solo') {
      assert(sub.status === 'trialing' && sub.trial_end - sub.trial_start === 604800, 'Solo trial is not exactly seven days');
      evidence.sevenDayTrial = true;
      sub = await stripe.subscriptions.update(sub.id, { trial_end: 'now' });
    }
    // Finalize/pay the real sandbox invoice, including the draft generated when
    // ending Solo's trial. No wall-clock trial waiting or live payment involved.
    let invoice = await stripe.invoices.retrieve(typeof sub.latest_invoice === 'string' ? sub.latest_invoice : sub.latest_invoice.id);
    if (invoice.status === 'draft') invoice = await stripe.invoices.finalizeInvoice(invoice.id);
    if (invoice.status === 'open') invoice = await stripe.invoices.pay(invoice.id);
    assert(invoice.status === 'paid' && invoice.amount_paid === amount, `${plan}: invoice did not settle the expected amount`);
    evidence.invoicePaid = true;
    const payments = await stripe.invoicePayments.list({ invoice: invoice.id });
    const pi = payments.data.find(p => p.payment?.payment_intent)?.payment.payment_intent;
    assert(pi, `${plan}: paid invoice lacks a payment intent`);
    const first = Math.floor(amount / 4);
    const partial = await stripe.refunds.create({ payment_intent: pi, amount: first, metadata: { acceptance_run: run } });
    assert(partial.status === 'succeeded', `${plan}: partial refund failed`);
    const rest = await stripe.refunds.create({ payment_intent: pi, amount: amount - first, metadata: { acceptance_run: run } });
    assert(rest.status === 'succeeded', `${plan}: remaining refund failed`);
    const intent = await stripe.paymentIntents.retrieve(pi);
    const charge = await stripe.charges.retrieve(typeof intent.latest_charge === 'string' ? intent.latest_charge : intent.latest_charge.id);
    assert(charge.refunded && charge.amount_refunded === amount, `${plan}: refund totals differ`);
    evidence.partialAndFullRefund = true;
    const canceled = await stripe.subscriptions.cancel(sub.id);
    assert(canceled.status === 'canceled', `${plan}: cancellation failed`);
    evidence.canceled = true;
    report.plans.push(evidence); save();
    console.log(JSON.stringify(evidence));
  }
  const declined = await stripe.customers.create({ name: 'Cival decline acceptance', metadata: { acceptance_run: run } });
  cleanup.push(async () => stripe.customers.del(declined.id));
  try {
    await stripe.paymentIntents.create({ amount: 2900, currency: 'usd', customer: declined.id, payment_method: 'pm_card_chargeDeclined', payment_method_types: ['card'], confirm: true });
    throw new Error('Declined test card unexpectedly paid');
  } catch (error) {
    assert(error.code === 'card_declined', `Unexpected decline result: ${error.code || error.message}`);
    report.declinedCardRejected = true;
  }
  report.result = 'PASS';
} catch (error) {
  report.result = 'FAIL'; report.error = String(error.message).replace(/(?:sk|rk)_(?:test|live)_\S+/g, '[REDACTED]');
  process.exitCode = 1;
} finally {
  for (const operation of cleanup.reverse()) {
    try { await operation(); report.cleanup.push('ok'); }
    catch (error) { report.cleanup.push({ error: error.code || error.type || 'cleanup-failed' }); process.exitCode = 1; }
  }
  save(); console.log(JSON.stringify({ result: report.result, error: report.error, plans: report.plans.length, cleanup: report.cleanup }));
}
