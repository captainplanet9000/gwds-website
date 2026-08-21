import { spawnSync } from 'node:child_process';
import { createReadStream, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import Stripe from 'stripe';

function loadEnv(file) {
  const env = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const splitAt = line.indexOf('=');
    if (splitAt < 1) continue;
    let value = line.slice(splitAt + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = JSON.parse(value);
    env[line.slice(0, splitAt)] = value.replace(/[\r\n]+$/, '');
  }
  return env;
}

function setVercelProductionSecret(key, value) {
  const npxCli = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npx-cli.js');
  const result = spawnSync(process.execPath, [npxCli, 'vercel', 'env', 'add', key, 'production', '--force'], {
    cwd: process.cwd(),
    input: value,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`Could not configure ${key} in Vercel: ${result.error?.message || (result.stderr || result.stdout || '').trim()}`);
  }
}

const catalog = [
  {
    id: 'trading-dashboard-template',
    name: 'Cival Systems — Core Edition',
    description: 'Complete Cival TypeScript trading-system dashboard source workspace.',
    amount: 9900,
    existingPrice: 'price_1U09vdLLyk0oaesNmjX9ZSDL',
  },
  {
    id: 'strategy-pack',
    name: 'Cival Systems — Seven-Strategy Research Pack',
    description: 'Seven wired strategy modules with a reproducible historical-candle evaluation harness and evidence dossier.',
    amount: 14900,
  },
  {
    id: 'meme-trading-suite',
    name: 'Cival Systems — Meme Trading Suite',
    description: 'Solana meme-market research workspace and integration source extension.',
    amount: 7900,
    existingPrice: 'price_1U09vdLLyk0oaesNetEHtOa0',
  },
  {
    id: 'flash-loan-arbitrage',
    name: 'Cival Systems — Flash Loan Arbitrage Reference',
    description: 'Arbitrum cross-DEX and Aave V3 flash-loan reference source extension.',
    amount: 7900,
    existingPrice: 'price_1U09vdLLyk0oaesNO6v6K9Ei',
  },
  {
    id: 'multi-strat-bundle',
    name: 'Cival Systems — Trader Edition',
    description: 'Core Edition and Seven-Strategy Research Pack source bundle.',
    amount: 19900,
  },
  {
    id: 'everything-bundle',
    name: 'Cival Systems — Desk Edition',
    description: 'Complete Cival source collection: Core, strategies, meme-market workspace, and flash-loan reference.',
    amount: 34900,
  },
];

const hostingCatalog = [
  { id: 'solo', name: 'Cival Hosted — Solo', description: 'One supervised managed agent, 250 agent-hours, and Core Edition licence.', amount: 1900 },
  { id: 'desk', name: 'Cival Hosted — Desk', description: 'Six-agent managed farm, 1,000 agent-hours, Desk Edition licence, and priority support.', amount: 7900 },
  { id: 'fund', name: 'Cival Hosted — Fund', description: 'Dedicated managed workers, multiple workspaces, team access, and private agent delivery.', amount: 29900 },
];

const retiredPriceIds = [
  'price_1U09vdLLyk0oaesNIb1MgxJh',
  'price_1U09veLLyk0oaesNLxwlRQ8l',
  'price_1U09veLLyk0oaesNBbMPGIFW',
  'price_1U09veLLyk0oaesNtE88tL1l',
  'price_1U09veLLyk0oaesNh2F0P5l0',
  'price_1U09vfLLyk0oaesNxQMi8wuE',
  'price_1U09vfLLyk0oaesNmhg0rCpa',
  'price_1U09vfLLyk0oaesN5dTydx9a',
  'price_1T7p7ZLLyk0oaesN9Mt54Oaz',
];

const envPath = process.argv[2] || '.env.local';
const apply = process.argv.includes('--apply');
const env = loadEnv(envPath);
if (!env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is required');

const stripe = new Stripe(env.STRIPE_SECRET_KEY);
const siteUrl = (env.NEXT_PUBLIC_SITE_URL || 'https://www.civalsystems.com').replace(/\/$/, '');
const webhookUrl = `${siteUrl}/api/webhooks/stripe`;
const enabledEvents = [
  'charge.dispute.closed',
  'charge.dispute.created',
  'charge.refunded',
  'checkout.session.async_payment_failed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.completed',
  'checkout.session.expired',
  'payment_intent.payment_failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
];

const account = await stripe.accounts.retrieve();
const results = [];

if (apply) {
  try {
    await stripe.accounts.update(account.id, {
      business_profile: {
        name: 'Cival Systems',
        url: 'https://www.civalsystems.com',
        support_email: env.SUPPORT_EMAIL || undefined,
        support_url: `${siteUrl}/contact`,
      },
      settings: {
        branding: {
          primary_color: '#4ade9f',
          secondary_color: '#06110e',
        },
        payments: { statement_descriptor: 'CIVAL SYSTEMS' },
      },
    });
  } catch (error) {
    if (error?.type !== 'StripePermissionError') throw error;
    console.error('Stripe requires Dashboard authentication for account profile fields; catalog and webhook configuration will continue.');
  }

  try {
    let icon = account.settings?.branding?.icon || undefined;
    let logo = account.settings?.branding?.logo || undefined;
    if (!icon) {
      const uploaded = await stripe.files.create({
        file: { data: createReadStream('public/brand/cival-social-avatar-512-v1.png'), name: 'cival-systems-icon.png', type: 'image/png' },
        purpose: 'business_icon',
      });
      icon = uploaded.id;
    }
    if (!logo) {
      const uploaded = await stripe.files.create({
        file: { data: createReadStream('public/brand/cival-social-avatar-512-v1.png'), name: 'cival-systems-logo.png', type: 'image/png' },
        purpose: 'business_logo',
      });
      logo = uploaded.id;
    }
    await stripe.accounts.update(account.id, { settings: { branding: { icon, logo } } });
  } catch (error) {
    if (error?.type !== 'StripePermissionError') throw error;
    console.error('Stripe requires Dashboard authentication for logo uploads; catalog and webhook configuration will continue.');
  }
}

const existingProducts = await stripe.products.list({ active: true, limit: 100 });
for (const item of catalog) {
  let price;
  let product;
  if (item.existingPrice) {
    price = await stripe.prices.retrieve(item.existingPrice);
    product = await stripe.products.retrieve(typeof price.product === 'string' ? price.product : price.product.id);
  } else {
    product = existingProducts.data.find((candidate) => candidate.metadata?.cival_product_id === item.id);
    if (product) {
      const prices = await stripe.prices.list({ product: product.id, active: true, type: 'one_time', limit: 100 });
      price = prices.data.find((candidate) => candidate.currency === 'usd' && candidate.unit_amount === item.amount);
    }
  }

  if (apply) {
    if (!product) {
      product = await stripe.products.create({
        name: item.name,
        description: item.description,
        metadata: { cival_product_id: item.id },
      }, { idempotencyKey: `cival-product-${item.id}-v1` });
    } else {
      product = await stripe.products.update(product.id, {
        active: true,
        name: item.name,
        description: item.description,
        metadata: { ...product.metadata, cival_product_id: item.id },
      });
    }
    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        currency: 'usd',
        unit_amount: item.amount,
        metadata: { cival_product_id: item.id },
      }, { idempotencyKey: `cival-price-${item.id}-${item.amount}-v1` });
    }
    if (product.default_price !== price.id) {
      await stripe.products.update(product.id, { default_price: price.id });
    }
  }

  results.push({
    id: item.id,
    productId: product?.id || null,
    priceId: price?.id || null,
    amount: price?.unit_amount || item.amount,
    currency: price?.currency || 'usd',
    active: Boolean(product?.active && price?.active),
  });
}

const retired = [];

const hostingResults = [];
for (const item of hostingCatalog) {
  let product = existingProducts.data.find((candidate) => candidate.metadata?.cival_hosting_plan_id === item.id);
  let price;
  if (product) {
    const prices = await stripe.prices.list({ product: product.id, active: true, type: 'recurring', limit: 100 });
    price = prices.data.find((candidate) => candidate.currency === 'usd' && candidate.unit_amount === item.amount && candidate.recurring?.interval === 'month');
  }
  if (apply) {
    if (!product) {
      product = await stripe.products.create({
        name: item.name,
        description: item.description,
        metadata: { commerce_kind: 'hosting', cival_hosting_plan_id: item.id },
      }, { idempotencyKey: `cival-hosting-product-${item.id}-v1` });
    } else {
      product = await stripe.products.update(product.id, { active: true, name: item.name, description: item.description, metadata: { ...product.metadata, commerce_kind: 'hosting', cival_hosting_plan_id: item.id } });
    }
    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        currency: 'usd',
        unit_amount: item.amount,
        recurring: { interval: 'month' },
        tax_behavior: 'exclusive',
        metadata: { commerce_kind: 'hosting', cival_hosting_plan_id: item.id },
      }, { idempotencyKey: `cival-hosting-price-${item.id}-${item.amount}-monthly-v1` });
    }
    if (product.default_price !== price.id) await stripe.products.update(product.id, { default_price: price.id });

    if (env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
      const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/hosting_plans?id=eq.${encodeURIComponent(item.id)}`, {
        method: 'PATCH',
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ stripe_product_id: product.id, stripe_price_id: price.id, launch_ready: false, updated_at: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error(`Could not bind hosting plan ${item.id} to Stripe: ${response.status} ${await response.text()}`);
    }
  }
  hostingResults.push({ id: item.id, productId: product?.id || null, priceId: price?.id || null, amount: price?.unit_amount || item.amount, active: Boolean(product?.active && price?.active) });
}

let portalConfiguration = null;
if (apply) {
  const configurations = await stripe.billingPortal.configurations.list({ limit: 100 });
  portalConfiguration = configurations.data.find((candidate) => candidate.is_default) || configurations.data[0];
  const portalFeatures = {
    customer_update: { enabled: true, allowed_updates: ['address', 'email', 'name', 'phone', 'tax_id'] },
    invoice_history: { enabled: true },
    payment_method_update: { enabled: true },
    subscription_cancel: { enabled: true, mode: 'at_period_end', cancellation_reason: { enabled: true, options: ['too_expensive', 'missing_features', 'switched_service', 'unused', 'other'] } },
    subscription_update: { enabled: false },
  };
  portalConfiguration = portalConfiguration
    ? await stripe.billingPortal.configurations.update(portalConfiguration.id, { business_profile: { headline: 'Manage your Cival Systems hosting subscription', privacy_policy_url: `${siteUrl}/privacy`, terms_of_service_url: `${siteUrl}/terms` }, features: portalFeatures })
    : await stripe.billingPortal.configurations.create({ business_profile: { headline: 'Manage your Cival Systems hosting subscription', privacy_policy_url: `${siteUrl}/privacy`, terms_of_service_url: `${siteUrl}/terms` }, features: portalFeatures });
}

if (apply) {
  for (const priceId of retiredPriceIds) {
    const price = await stripe.prices.retrieve(priceId);
    const productId = typeof price.product === 'string' ? price.product : price.product.id;
    const product = await stripe.products.retrieve(productId);
    if (product.active) await stripe.products.update(productId, { active: false });
    const defaultPriceId = typeof product.default_price === 'string' ? product.default_price : product.default_price?.id;
    if (price.active && defaultPriceId !== price.id) await stripe.prices.update(price.id, { active: false });
    retired.push({ priceId: price.id, productId, productArchived: true, priceArchived: defaultPriceId !== price.id });
  }
}

const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
let endpoint = endpoints.data.find((item) => item.url === webhookUrl && item.status === 'enabled');
let webhookSecretConfigured = Boolean(env.STRIPE_WEBHOOK_SECRET);
if (apply) {
  if (!endpoint) {
    endpoint = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: enabledEvents,
      description: 'Cival Systems production commerce fulfillment',
    }, { idempotencyKey: 'cival-production-webhook-v1' });
    if (!endpoint.secret) throw new Error('Stripe did not return the new webhook signing secret');
    setVercelProductionSecret('STRIPE_WEBHOOK_SECRET', endpoint.secret);
    webhookSecretConfigured = true;
  } else {
    endpoint = await stripe.webhookEndpoints.update(endpoint.id, {
      enabled_events: enabledEvents,
      description: 'Cival Systems production commerce fulfillment',
    });
  }

  for (const stale of endpoints.data.filter((item) => item.status === 'enabled' && item.url !== webhookUrl && /gwds(?:\.app|-website\.vercel\.app)/i.test(item.url))) {
    await stripe.webhookEndpoints.del(stale.id);
  }
}

const updatedAccount = await stripe.accounts.retrieve();
console.log(JSON.stringify({
  applied: apply,
  liveMode: env.STRIPE_SECRET_KEY.startsWith('sk_live_'),
  chargesEnabled: updatedAccount.charges_enabled,
  payoutsEnabled: updatedAccount.payouts_enabled,
  businessProfile: {
    name: updatedAccount.business_profile?.name,
    url: updatedAccount.business_profile?.url,
    supportEmail: updatedAccount.business_profile?.support_email,
    supportUrl: updatedAccount.business_profile?.support_url,
  },
  branding: {
    iconConfigured: Boolean(updatedAccount.settings?.branding?.icon),
    logoConfigured: Boolean(updatedAccount.settings?.branding?.logo),
    primaryColor: updatedAccount.settings?.branding?.primary_color,
    secondaryColor: updatedAccount.settings?.branding?.secondary_color,
  },
  statementDescriptor: updatedAccount.settings?.payments?.statement_descriptor,
  products: results,
  hostingProducts: hostingResults,
  billingPortal: portalConfiguration ? { id: portalConfiguration.id, active: portalConfiguration.active, isDefault: portalConfiguration.is_default } : null,
  retiredProducts: retired,
  webhook: endpoint ? { url: endpoint.url, status: endpoint.status, events: endpoint.enabled_events } : null,
  webhookSecretConfigured,
}, null, 2));
