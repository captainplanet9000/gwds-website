import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

const container = 'cival-hosting-launch-acceptance';
const database = `commerce_${randomUUID().replaceAll('-', '')}`;
const sql = (input, db = database) => execFileSync('docker', ['exec', '-i', container, 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db, '-At'], { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
try {
  sql(`CREATE DATABASE ${database};`, 'postgres');
  sql(`CREATE SCHEMA auth;
CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS 'SELECT null::uuid';
CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS 'SELECT ''{}''::jsonb';`);
  const base = new URL('../src/migrations/', import.meta.url);
  const files = readdirSync(base).filter(f => f.endsWith('.sql')).sort();
  sql('BEGIN;\n' + files.map(f => readFileSync(new URL(f, base), 'utf8')).join('\n') + '\nCOMMIT;');
  sql(`DO $$ BEGIN
IF has_table_privilege('anon','public.orders','SELECT') OR has_table_privilege('authenticated','public.products','UPDATE') THEN RAISE EXCEPTION 'Commerce grants unsafe'; END IF;
IF NOT has_table_privilege('authenticated','public.orders','SELECT') THEN RAISE EXCEPTION 'Owner read missing'; END IF;
END $$;`);
  sql(`DO $$ DECLARE
u uuid := gen_random_uuid(); o uuid := gen_random_uuid(); item uuid := gen_random_uuid(); e uuid; payload jsonb; blocked boolean := false;
BEGIN
INSERT INTO auth.users(id,email,email_confirmed_at) VALUES(u,'refund@example.invalid',now());
INSERT INTO products(id,name,price_cents,category,is_active) VALUES('refund-fixture','Refund fixture',9900,'trading',true);
INSERT INTO orders(id,user_id,customer_email,total_cents,status,stripe_session_id) VALUES(o,u,'refund@example.invalid',9900,'checkout_pending','cs_fixture');
INSERT INTO order_items(id,order_id,product_id,quantity,price_cents,stripe_price_id,product_version) VALUES(item,o,'refund-fixture',1,9900,'price_fixture','fixture');
payload := '[{"product_id":"refund-fixture","quantity":1,"price_cents":9900,"stripe_price_id":"price_fixture","product_version":"fixture"}]'::jsonb;
PERFORM fulfill_store_order('evt_paid','checkout.session.completed','hash1',o,'cs_fixture','pi_fixture',u,'refund@example.invalid','Fixture',9900,'usd',false,payload);
SELECT id INTO e FROM entitlements WHERE source_order_item_id=item;
INSERT INTO downloads(order_id,product_id,entitlement_id,token_hash,expires_at,max_downloads) VALUES(o,'refund-fixture',e,'fixture-token',now()+interval '1 hour',5);
PERFORM apply_store_order_status_event('evt_partial','charge.refunded','hash2','cs_fixture','pi_fixture',false,'partially_refunded','partial',false);
PERFORM fulfill_store_order('evt_late_partial','checkout.session.async_payment_succeeded','hash3',o,'cs_fixture','pi_fixture',u,'refund@example.invalid','Fixture',9900,'usd',false,payload);
IF (SELECT status FROM orders WHERE id=o)<>'partially_refunded' THEN RAISE EXCEPTION 'Partial refund overwritten'; END IF;
IF NOT consume_store_download('fixture-token',o,'refund-fixture') THEN RAISE EXCEPTION 'Partial refund denied active download'; END IF;
PERFORM apply_store_order_status_event('evt_full','charge.refunded','hash4','cs_fixture','pi_fixture',false,'refunded','full',true);
PERFORM fulfill_store_order('evt_late_full','checkout.session.async_payment_succeeded','hash5',o,'cs_fixture','pi_fixture',u,'refund@example.invalid','Fixture',9900,'usd',false,payload);
PERFORM fulfill_store_order('evt_paid','checkout.session.completed','hash1',o,'cs_fixture','pi_fixture',u,'refund@example.invalid','Fixture',9900,'usd',false,payload);
IF (SELECT status FROM orders WHERE id=o)<>'refunded' OR (SELECT status FROM entitlements WHERE id=e)<>'revoked' THEN RAISE EXCEPTION 'Refunded access resurrected'; END IF;
IF consume_store_download('fixture-token',o,'refund-fixture') THEN RAISE EXCEPTION 'Revoked token accepted'; END IF;
IF (SELECT total_spent FROM customers WHERE user_id=u)<>99 OR (SELECT order_count FROM customers WHERE user_id=u)<>1 THEN RAISE EXCEPTION 'Duplicate revenue counted'; END IF;
BEGIN
PERFORM fulfill_store_order('evt_paid','checkout.session.completed','changed',o,'cs_fixture','pi_fixture',u,'refund@example.invalid','Fixture',9900,'usd',false,payload);
EXCEPTION WHEN OTHERS THEN IF SQLERRM <> 'STRIPE_EVENT_REPLAY_MISMATCH' THEN RAISE; END IF; blocked := true;
END;
IF NOT blocked THEN RAISE EXCEPTION 'Conflicting event replay accepted'; END IF;
END $$;`);
  // Also exercise shared-database objects, then repeat the repairs to verify
  // their idempotence and that optional-object handling retains restrictions.
  sql(`CREATE TABLE public.trade_journal(id uuid);
CREATE TABLE public.agent_memory(id uuid);
CREATE VIEW public.treasury_realized_pnl AS SELECT 0 AS amount;
CREATE FUNCTION public.seed_account_roster(text) RETURNS void LANGUAGE sql AS 'SELECT';
GRANT ALL ON public.trade_journal,public.agent_memory TO public,anon,authenticated;`);
  for (let i = 0; i < 2; i++) {
    sql(readFileSync(new URL('011_secure_shared_dashboard_tables.sql', base), 'utf8'));
    sql(readFileSync(new URL('012_public_api_lockdown.sql', base), 'utf8'));
  }
  sql(`DO $$ BEGIN
IF has_table_privilege('anon','public.trade_journal','INSERT') OR has_table_privilege('authenticated','public.agent_memory','SELECT') THEN RAISE EXCEPTION 'Legacy grants unsafe'; END IF;
IF NOT has_table_privilege('anon','public.trade_journal','SELECT') THEN RAISE EXCEPTION 'Demo read missing'; END IF;
IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid='public.agent_memory'::regclass) THEN RAISE EXCEPTION 'Legacy RLS missing'; END IF;
IF NOT (SELECT reloptions @> ARRAY['security_invoker=true'] FROM pg_class WHERE oid='public.treasury_realized_pnl'::regclass) THEN RAISE EXCEPTION 'View invoker missing'; END IF;
IF has_function_privilege('anon','public.seed_account_roster(text)','EXECUTE') THEN RAISE EXCEPTION 'Legacy function exposed'; END IF;
END $$;`);
  console.log('PASS: clean commerce bootstrap; partial/full refund replay and download access; duplicate revenue prevention; conflicting replay refusal; legacy RLS/grants/view/function hardening.');
} catch (error) {
  console.error(String(error.stderr || error.message).slice(-2500)); process.exitCode = 1;
} finally {
  sql(`DROP DATABASE IF EXISTS ${database};`, 'postgres');
}
