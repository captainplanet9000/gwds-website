import pg from 'pg';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

// Deliberately local-only. This script creates and destroys its OWN test database.
const admin = new pg.Client({ host: '127.0.0.1', port: 55432, database: 'postgres', user: 'postgres', password: 'hosting' });
const name = `cival_capacity_test_${randomUUID().replaceAll('-', '')}`;
let pool;
await admin.connect();
try {
  await admin.query(`create database "${name}"`);
  pool = new pg.Pool({ host: '127.0.0.1', port: 55432, database: name, user: 'postgres', password: 'hosting', max: 25 });
  await pool.query('create table public.hosting_subscriptions(id uuid primary key default gen_random_uuid(), status text not null)');
  await pool.query(await readFile(new URL('../supabase/migrations/20260908061321_hosting_capacity_reservations.sql', import.meta.url), 'utf8'));
  await assert.rejects(pool.query("insert into hosting_subscriptions(status) values ('pending_checkout')"), /HOSTING_CAPACITY_CLOSED/);
  await pool.query('update hosting_capacity set max_subscriptions=100');
  const results = await Promise.allSettled(Array.from({ length: 120 }, () => pool.query("insert into hosting_subscriptions(status) values ('pending_checkout') returning id")));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 100);
  const rejected = results.filter(result => result.status === 'rejected');
  assert.equal(rejected.length, 20);
  assert.ok(rejected.every(result => result.reason.message.includes('HOSTING_CAPACITY_FULL')));
  await pool.query("update hosting_subscriptions set status='incomplete_expired' where id=(select id from hosting_subscriptions limit 1)");
  await pool.query("insert into hosting_subscriptions(status) values ('pending_checkout')");
  await assert.rejects(pool.query("insert into hosting_subscriptions(status) values ('pending_checkout')"), /HOSTING_CAPACITY_FULL/);
  const access = await pool.query("select has_table_privilege('authenticated','public.hosting_capacity','UPDATE') as allowed");
  assert.equal(access.rows[0].allowed, false);
  console.log('PASS: closed gate, 120 concurrent checkouts / 100 reservations, expiry releases one slot, customer writes denied. This tests admission, not 100 running dashboards.');
} finally {
  await pool?.end();
  await admin.query(`drop database if exists "${name}"`);
  await admin.end();
}

