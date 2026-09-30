import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(readFileSync(process.argv[2] || '.env.production.local', 'utf8')
  .split(/\r?\n/).filter(line => line && !line.startsWith('#') && line.includes('='))
  .map(line => {
    const at = line.indexOf('=');
    let value = line.slice(at + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = JSON.parse(value);
    return [line.slice(0, at), value];
  }));
if (!env.STRIPE_SECRET_KEY?.startsWith('sk_live_')) throw new Error('A live Stripe key is required');
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Production storage access is required');

const releases = JSON.parse(readFileSync('src/lib/source-releases.json', 'utf8'));
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } });
const stripe = new Stripe(env.STRIPE_SECRET_KEY);
const { data: rows, error } = await db.from('products')
  .select('id,price_cents,stripe_price_id_live,version,is_active,artifact_ready,artifact_path,artifact_sha256,artifact_size_bytes')
  .in('id', Object.keys(releases));
if (error || rows?.length !== Object.keys(releases).length) throw new Error('Catalog lookup failed or is incomplete');

const checks = [];
for (const [id, expected] of Object.entries(releases)) {
  const row = rows.find(item => item.id === id);
  if (!row?.is_active || !row.artifact_ready || row.version !== expected.version ||
      row.artifact_sha256 !== expected.sha256 || Number(row.artifact_size_bytes) !== expected.bytes ||
      !row.stripe_price_id_live || !row.artifact_path) throw new Error(`${id}: catalog release mismatch`);
  const [price, download] = await Promise.all([
    stripe.prices.retrieve(row.stripe_price_id_live),
    db.storage.from('downloads').download(row.artifact_path),
  ]);
  if (!price.active || !price.livemode || price.currency !== 'usd' || price.unit_amount !== row.price_cents)
    throw new Error(`${id}: live price mismatch`);
  if (download.error || !download.data) throw new Error(`${id}: private archive unavailable`);
  const archive = Buffer.from(await download.data.arrayBuffer());
  if (archive.length !== expected.bytes || createHash('sha256').update(archive).digest('hex') !== expected.sha256)
    throw new Error(`${id}: private archive integrity mismatch`);
  checks.push({ id, version: expected.version, priceUsd: row.price_cents / 100, archiveVerified: true });
}

const account = await stripe.accounts.retrieve();
const webhooks = await stripe.webhookEndpoints.list({ limit: 100 });
const endpoint = webhooks.data.find(item => item.url === 'https://www.civalsystems.com/api/webhooks/stripe' && item.status === 'enabled');
if (!account.charges_enabled || !account.payouts_enabled || !endpoint ||
    !endpoint.enabled_events.includes('checkout.session.completed') ||
    !endpoint.enabled_events.includes('charge.refunded')) throw new Error('Live payment or webhook configuration incomplete');

console.log(JSON.stringify({ checkedAt: new Date().toISOString(), result: 'PASS', products: checks,
  liveChargesEnabled: true, livePayoutsEnabled: true, productionWebhookEnabled: true }, null, 2));
