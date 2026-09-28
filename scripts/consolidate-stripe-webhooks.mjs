import fs from 'node:fs';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// An explicit, reversible retirement of the superseded AWS pilot destination.
// Never acknowledge or replay a payment merely to clear a delivery alert.
const env = Object.fromEntries(fs.readFileSync('.env.production.local', 'utf8').split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => {
  const i = l.indexOf('='); let v = l.slice(i + 1).trim();
  if (v.startsWith('"') && v.endsWith('"')) v = JSON.parse(v);
  return [l.slice(0, i), v.replace(/[\r\n]+$/, '')];
}));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
assert(env.STRIPE_SECRET_KEY?.startsWith('sk_live_'), 'Live account configuration required');
const stripe = new Stripe(env.STRIPE_SECRET_KEY);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const pilot = await stripe.webhookEndpoints.retrieve('we_1UGgseLLyk0oaesNRCAVUoZ3');
const main = await stripe.webhookEndpoints.retrieve('we_1U6fUgLLyk0oaesNuymN6cPp');
assert(pilot.livemode && main.livemode, 'Wrong Stripe mode');
assert(pilot.url === 'https://pilot.civalsystems.com/api/webhooks/stripe', 'Unexpected pilot URL');
assert(main.url === 'https://www.civalsystems.com/api/webhooks/stripe' && main.status === 'enabled', 'Authoritative endpoint is not enabled');
assert(pilot.enabled_events.every(e => main.enabled_events.includes(e)), 'Main endpoint does not cover all pilot event types');
// The retired pilot used an older API version. Main's completed event records,
// not version equality, establish that it handled the current payloads.
console.log(JSON.stringify({ pilotApiVersion: pilot.api_version, mainApiVersion: main.api_version }));
const events = await stripe.events.list({ limit: 100 });
assert(!events.has_more, 'Paginate event history before retirement');
const pending = events.data.filter(e => e.pending_webhooks > 0);
const financial = pending.filter(e => e.type !== 'checkout.session.expired');
const { data: recorded, error } = await db.from('stripe_events').select('stripe_event_id,event_type,status,processed_at').in('stripe_event_id', financial.map(e => e.id));
if (error) throw new Error(`Fulfillment read failed: ${error.code}`);
assert(financial.every(e => recorded.some(r => r.stripe_event_id === e.id && r.status === 'completed')), 'Unfulfilled financial event: retirement refused');
const probe = await fetch(main.url, { method: 'POST', body: '{}', headers: { 'content-type': 'application/json' } });
assert(probe.status === 400, 'Main endpoint signature gate unavailable');
const report = { at: new Date().toISOString(), action: 'audit', pilot: { id: pilot.id, url: pilot.url, status: pilot.status, events: pilot.enabled_events }, main: { id: main.id, url: main.url, status: main.status, events: main.enabled_events }, pending: pending.map(e => ({ id: e.id, type: e.type })), fulfillment: recorded, signatureGate: probe.status };
const output = process.env.WEBHOOK_AUDIT_REPORT || 'C:/GWDS/artifacts/stripe-webhook-consolidation-20260928.json';
fs.writeFileSync(output, JSON.stringify(report, null, 2));
if (process.argv.includes('--apply')) {
  const updated = await stripe.webhookEndpoints.update(pilot.id, { disabled: true, description: 'Retired 2026-09-28: www.civalsystems.com is authoritative; AWS pilot had invalid database credentials. Retained for delivery history.' });
  assert(updated.status === 'disabled', 'Pilot retirement was not confirmed');
  report.action = 'retired-duplicate-pilot';
  report.pilot.status = updated.status;
  report.main.status = (await stripe.webhookEndpoints.retrieve(main.id)).status;
  assert(report.main.status === 'enabled', 'Authoritative destination unexpectedly disabled');
  fs.writeFileSync(output, JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
