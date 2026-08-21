import fs from "node:fs";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

function loadEnv(file) {
  const env = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const splitAt = line.indexOf("=");
    if (splitAt < 1) continue;
    let value = line.slice(splitAt + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = JSON.parse(value);
    value = value.replace(/[\r\n]+$/, '');
    env[line.slice(0, splitAt)] = value;
  }
  return env;
}

const envPath = process.argv[2] || ".env.local";
const env = loadEnv(envPath);
const required = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
];

const output = {
  environment: Object.fromEntries(required.map((name) => [name, Boolean(env[name])])),
  stripe: { configured: false, prices: [], webhookEndpoints: [] },
  storage: { configured: false, buckets: [] },
  auth: { reachable: false },
};

if (env.STRIPE_SECRET_KEY) {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const account = await stripe.accounts.retrieve();
  output.stripe.configured = true;
  output.stripe.liveMode = env.STRIPE_SECRET_KEY.startsWith("sk_live_");
  output.stripe.chargesEnabled = account.charges_enabled;
  output.stripe.payoutsEnabled = account.payouts_enabled;
  output.stripe.detailsSubmitted = account.details_submitted;
  output.stripe.businessProfile = account.business_profile
    ? {
        name: account.business_profile.name,
        url: account.business_profile.url,
        supportEmail: account.business_profile.support_email,
        supportUrl: account.business_profile.support_url,
        supportPhoneConfigured: Boolean(account.business_profile.support_phone),
      }
    : null;
  output.stripe.branding = account.settings?.branding
    ? {
        iconConfigured: Boolean(account.settings.branding.icon),
        logoConfigured: Boolean(account.settings.branding.logo),
        primaryColor: account.settings.branding.primary_color,
        secondaryColor: account.settings.branding.secondary_color,
      }
    : null;
  output.stripe.statementDescriptor = account.settings?.payments?.statement_descriptor || null;

  const source = fs.readFileSync("src/lib/products.ts", "utf8");
  const priceIds = [...source.matchAll(/stripePriceId:\s*"([^"]+)"/g)].map((match) => match[1]);
  for (const id of [...new Set(priceIds)]) {
    try {
      const price = await stripe.prices.retrieve(id, { expand: ["product"] });
      output.stripe.prices.push({
        id,
        active: price.active,
        currency: price.currency,
        unitAmount: price.unit_amount,
        liveMode: price.livemode,
        product: typeof price.product === "string" ? price.product : price.product.name,
      });
    } catch (error) {
      output.stripe.prices.push({ id, error: error.code || error.type || "stripe_error" });
    }
  }

  try {
    const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
    output.stripe.webhookEndpoints = endpoints.data.map((endpoint) => ({
      status: endpoint.status,
      url: endpoint.url,
      events: endpoint.enabled_events,
    }));
  } catch (error) {
    output.stripe.webhookError = error.code || error.type || "stripe_error";
  }
}

if (env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  output.storage.configured = !bucketError;
  output.storage.error = bucketError?.message || null;

  for (const bucket of buckets || []) {
    const { data: objects, error } = await supabase.storage.from(bucket.id).list("", { limit: 100 });
    output.storage.buckets.push({
      id: bucket.id,
      public: bucket.public,
      objectCount: objects?.length || 0,
      objectNames: (objects || []).map((object) => object.name),
      error: error?.message || null,
    });
  }

  const { error: authError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
  output.auth.reachable = !authError;
  output.auth.error = authError?.message || null;
}

console.log(JSON.stringify(output, null, 2));
