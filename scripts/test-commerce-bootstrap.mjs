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
  console.log('PASS: 13 clean commerce migrations, owner-read grants, legacy restrictions, view invoker, function isolation, repeated hardening.');
} catch (error) {
  console.error(String(error.stderr || error.message).slice(-2500)); process.exitCode = 1;
} finally {
  sql(`DROP DATABASE IF EXISTS ${database};`, 'postgres');
}
