-- Cival Systems secure commerce migration
-- Designed to be backward-compatible with the existing products/orders schema.
-- Applied to production through the Supabase migration API on 2026-08-13.

create extension if not exists pgcrypto;

alter table public.products
  add column if not exists is_active boolean not null default false,
  add column if not exists version text,
  add column if not exists artifact_path text,
  add column if not exists artifact_sha256 text,
  add column if not exists artifact_size_bytes bigint,
  add column if not exists artifact_ready boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

alter table public.customers
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists stripe_customer_id text,
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

alter table public.orders
  add column if not exists payment_intent_id text,
  add column if not exists currency text not null default 'usd',
  add column if not exists livemode boolean,
  add column if not exists fulfillment_status text not null default 'pending',
  add column if not exists paid_at timestamptz,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists terms_version text,
  add column if not exists refund_policy_version text,
  add column if not exists disclaimer_version text,
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists failure_reason text;

alter table public.order_items
  add column if not exists stripe_price_id text,
  add column if not exists product_version text;

alter table public.downloads
  alter column download_token drop not null,
  add column if not exists entitlement_id uuid,
  add column if not exists token_hash text,
  add column if not exists revoked_at timestamptz,
  add column if not exists last_downloaded_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id),
  source_order_item_id uuid not null references public.order_items(id) on delete restrict,
  status text not null default 'active' check (status in ('active', 'revoked')),
  updates_until timestamptz,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoke_reason text,
  unique (source_order_item_id)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'downloads_entitlement_id_fkey'
      and conrelid = 'public.downloads'::regclass
  ) then
    alter table public.downloads
      add constraint downloads_entitlement_id_fkey
      foreign key (entitlement_id) references public.entitlements(id) on delete cascade;
  end if;
end $$;

create table if not exists public.stripe_events (
  stripe_event_id text primary key,
  event_type text not null,
  livemode boolean not null,
  payload_hash text,
  status text not null default 'processing' check (status in ('processing', 'completed', 'failed')),
  attempts integer not null default 1,
  order_id uuid references public.orders(id) on delete set null,
  last_error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create table if not exists public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  template text not null,
  recipient_email text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'failed')),
  attempts integer not null default 0,
  provider_message_id text,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (order_id, template)
);

create table if not exists public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete restrict,
  reason text not null,
  status text not null default 'requested' check (status in ('requested', 'reviewing', 'approved', 'denied', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.data_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_type text not null check (request_type in ('export', 'delete')),
  status text not null default 'requested' check (status in ('requested', 'processing', 'completed', 'denied')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.admin_audit (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  resource_type text,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_customers_email_lower on public.customers (lower(email));
create unique index if not exists idx_customers_user_id on public.customers (user_id) where user_id is not null;
create unique index if not exists idx_customers_stripe_id on public.customers (stripe_customer_id) where stripe_customer_id is not null;
create unique index if not exists idx_orders_payment_intent on public.orders (payment_intent_id) where payment_intent_id is not null;
create unique index if not exists idx_order_items_order_product on public.order_items (order_id, product_id);
create unique index if not exists idx_downloads_order_product on public.downloads (order_id, product_id);
create unique index if not exists idx_downloads_token_hash on public.downloads (token_hash) where token_hash is not null;
create index if not exists idx_orders_user_created on public.orders (user_id, created_at desc);
create index if not exists idx_entitlements_user on public.entitlements (user_id, status);
create index if not exists idx_stripe_events_order on public.stripe_events (order_id);
create index if not exists idx_email_outbox_pending on public.email_outbox (status, created_at);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'order_items_order_id_fkey'
      and conrelid = 'public.order_items'::regclass
  ) then
    alter table public.order_items
      add constraint order_items_order_id_fkey
      foreign key (order_id) references public.orders(id) on delete cascade;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'order_items_product_id_fkey'
      and conrelid = 'public.order_items'::regclass
  ) then
    alter table public.order_items
      add constraint order_items_product_id_fkey
      foreign key (product_id) references public.products(id) on delete restrict;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'downloads_order_id_fkey'
      and conrelid = 'public.downloads'::regclass
  ) then
    alter table public.downloads
      add constraint downloads_order_id_fkey
      foreign key (order_id) references public.orders(id) on delete cascade;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'downloads_product_id_fkey'
      and conrelid = 'public.downloads'::regclass
  ) then
    alter table public.downloads
      add constraint downloads_product_id_fkey
      foreign key (product_id) references public.products(id) on delete restrict;
  end if;
end $$;

-- Nothing from the previous broad catalog is sellable by default. The current
-- Cival catalog is explicitly reactivated below; artifact_ready remains false
-- until the exact release archive is uploaded and verified.
update public.products set is_active = false, artifact_ready = false, updated_at = now();

insert into public.products
  (id, name, description, price_cents, category, badge, emoji, features, stripe_price_id, download_url, is_active, version, artifact_path, artifact_ready, updated_at)
values
  ('trading-dashboard-template', 'Core Edition', 'The Cival platform with a paper-first dashboard, orchestration, risk views and source code.', 9900, 'trading', 'EDITION', '📊', '[]', 'price_1U09vdLLyk0oaesNmjX9ZSDL', 'downloads/ai-trading-dashboard-v2.0.0.zip', true, '2.0.0', 'ai-trading-dashboard-v2.0.0.zip', false, now()),
  ('meme-trading-suite', 'Meme Trading Suite', 'Solana meme-market extension for the Cival platform.', 7900, 'trading', 'EXTENSION', '🚀', '[]', 'price_1U09vdLLyk0oaesNetEHtOa0', 'downloads/meme-trading-suite-v2.0.0.zip', true, '2.0.0', 'meme-trading-suite-v2.0.0.zip', false, now()),
  ('flash-loan-arbitrage', 'Flash Loan Arbitrage Engine', 'Arbitrum arbitrage extension for the Cival platform.', 7900, 'trading', 'EXTENSION', '⚡', '[]', 'price_1U09vdLLyk0oaesNO6v6K9Ei', 'downloads/flash-loan-arbitrage-v2.0.0.zip', true, '2.0.0', 'flash-loan-arbitrage-v2.0.0.zip', false, now()),
  ('darvas-indicator', 'Darvas Box Breakout Agent', 'Darvas Box strategy agent for the Cival platform.', 4900, 'trading', 'AGENT', '📦', '[]', 'price_1U09vdLLyk0oaesNIb1MgxJh', 'downloads/darvas-indicator-v2.0.0.zip', true, '2.0.0', 'darvas-indicator-v2.0.0.zip', false, now()),
  ('elliott-wave-agent', 'Elliott Wave Pattern Agent', 'Elliott Wave strategy agent for the Cival platform.', 4900, 'trading', 'AGENT', '🌊', '[]', 'price_1U09veLLyk0oaesNLxwlRQ8l', 'downloads/elliott-wave-agent-v2.0.0.zip', true, '2.0.0', 'elliott-wave-agent-v2.0.0.zip', false, now()),
  ('vwap-momentum-agent', 'VWAP Pro Agent', 'VWAP momentum strategy agent for the Cival platform.', 4900, 'trading', 'AGENT', '📈', '[]', 'price_1U09veLLyk0oaesNBbMPGIFW', 'downloads/vwap-momentum-agent-v2.0.0.zip', true, '2.0.0', 'vwap-momentum-agent-v2.0.0.zip', false, now()),
  ('heikin-ashi-agent', 'Heikin Ashi Trend Agent', 'Heikin Ashi trend strategy agent for the Cival platform.', 4900, 'trading', 'AGENT', '🕯️', '[]', 'price_1U09veLLyk0oaesNtE88tL1l', 'downloads/heikin-ashi-agent-v2.0.0.zip', true, '2.0.0', 'heikin-ashi-agent-v2.0.0.zip', false, now()),
  ('mean-reversion-agent', 'Bollinger Mean Reversion Agent', 'Mean reversion strategy agent for the Cival platform.', 4900, 'trading', 'AGENT', '📉', '[]', 'price_1U09veLLyk0oaesNh2F0P5l0', 'downloads/mean-reversion-agent-v2.0.0.zip', true, '2.0.0', 'mean-reversion-agent-v2.0.0.zip', false, now()),
  ('macro-sentiment-agent', 'Macro & On-Chain Sentiment Agent', 'Macro regime and sentiment agent for the Cival platform.', 4900, 'trading', 'AGENT', '🧠', '[]', 'price_1U09vfLLyk0oaesNxQMi8wuE', 'downloads/macro-sentiment-agent-v2.0.0.zip', true, '2.0.0', 'macro-sentiment-agent-v2.0.0.zip', false, now()),
  ('multi-strat-bundle', 'Trader Edition', 'Core Edition plus six coordinated strategy agents.', 24900, 'trading', 'SAVE $144', '🏭', '[]', 'price_1U09vfLLyk0oaesNmhg0rCpa', 'downloads/multi-strat-bundle-v2.0.0.zip', true, '2.0.0', 'multi-strat-bundle-v2.0.0.zip', false, now()),
  ('everything-bundle', 'Desk Edition', 'The full Cival source catalog and one year of compatible updates.', 39900, 'trading', 'SAVE $152', '🌟', '[]', 'price_1U09vfLLyk0oaesN5dTydx9a', 'downloads/everything-bundle-v2.0.0.zip', true, '2.0.0', 'everything-bundle-v2.0.0.zip', false, now()),
  ('full-stack-trader-bundle', 'The Full Stack Trader', 'Legacy bundle retained for existing customer access.', 29900, 'trading', 'LEGACY', '🎯', '[]', 'price_1T7p7ZLLyk0oaesN9Mt54Oaz', 'downloads/full-stack-trader-bundle-v2.0.0.zip', false, '2.0.0', 'full-stack-trader-bundle-v2.0.0.zip', false, now())
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  category = excluded.category,
  badge = excluded.badge,
  emoji = excluded.emoji,
  stripe_price_id = excluded.stripe_price_id,
  download_url = excluded.download_url,
  is_active = excluded.is_active,
  version = excluded.version,
  artifact_path = excluded.artifact_path,
  artifact_ready = false,
  updated_at = now();

-- Backfill account ownership only when the order email matches a verified auth
-- identity. Legacy purchases remain claimable after that user verifies the same
-- email address.
update public.orders o
set user_id = u.id, updated_at = now()
from auth.users u
where o.user_id is null
  and u.email_confirmed_at is not null
  and lower(u.email) = lower(o.customer_email);

update public.customers c
set user_id = u.id, updated_at = now()
from auth.users u
where c.user_id is null
  and u.email_confirmed_at is not null
  and lower(u.email) = lower(c.email);

-- Replace every permissive policy on commerce-owned tables. Service-role API
-- routes bypass RLS; browser users receive only narrowly owned reads.
do $$
declare
  p record;
begin
  for p in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any (array[
        'products','orders','order_items','downloads','customers','gwds_coupons',
        'newsletter_subscribers','contact_messages','entitlements','stripe_events',
        'email_outbox','refund_requests','support_requests','data_requests','admin_audit'
      ])
  loop
    execute format('drop policy if exists %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.downloads enable row level security;
alter table public.customers enable row level security;
alter table public.gwds_coupons enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.entitlements enable row level security;
alter table public.stripe_events enable row level security;
alter table public.email_outbox enable row level security;
alter table public.refund_requests enable row level security;
alter table public.support_requests enable row level security;
alter table public.data_requests enable row level security;
alter table public.admin_audit enable row level security;

do $$
begin
  if to_regclass('public.contact_messages') is not null then
    execute 'alter table public.contact_messages enable row level security';
  end if;
end $$;

revoke all on table public.orders, public.order_items, public.downloads, public.customers,
  public.gwds_coupons, public.newsletter_subscribers, public.entitlements,
  public.stripe_events, public.email_outbox, public.refund_requests,
  public.support_requests, public.data_requests, public.admin_audit
from anon, authenticated;

grant select on table public.products to anon, authenticated;
grant select on table public.orders, public.order_items, public.entitlements,
  public.refund_requests, public.support_requests, public.data_requests
to authenticated;

grant all on table public.products, public.orders, public.order_items, public.downloads,
  public.customers, public.gwds_coupons, public.newsletter_subscribers,
  public.entitlements, public.stripe_events, public.email_outbox,
  public.refund_requests, public.support_requests, public.data_requests,
  public.admin_audit
to service_role;

create policy products_public_active_read
  on public.products for select
  to anon, authenticated
  using (is_active = true);

create policy orders_owner_read
  on public.orders for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (
      user_id is null
      and lower(customer_email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
    )
  );

create policy order_items_owner_read
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (
          o.user_id = (select auth.uid())
          or (
            o.user_id is null
            and lower(o.customer_email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
          )
        )
    )
  );

create policy entitlements_owner_read
  on public.entitlements for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy refund_requests_owner_read
  on public.refund_requests for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy support_requests_owner_read
  on public.support_requests for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy data_requests_owner_read
  on public.data_requests for select
  to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.fulfill_store_order(
  p_event_id text,
  p_event_type text,
  p_payload_hash text,
  p_order_id uuid,
  p_stripe_session_id text,
  p_payment_intent_id text,
  p_user_id uuid,
  p_customer_email text,
  p_customer_name text,
  p_total_cents integer,
  p_currency text,
  p_livemode boolean,
  p_items jsonb
)
returns table(order_id uuid, processed boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_claimed integer;
  v_order public.orders%rowtype;
  v_item record;
begin
  insert into public.stripe_events
    (stripe_event_id, event_type, livemode, payload_hash, status, order_id)
  values
    (p_event_id, p_event_type, p_livemode, p_payload_hash, 'processing', p_order_id)
  on conflict (stripe_event_id) do nothing;
  get diagnostics v_claimed = row_count;

  if v_claimed = 0 then
    return query select p_order_id, false;
    return;
  end if;

  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if v_order.id is null then
    raise exception 'ORDER_NOT_FOUND';
  end if;
  if v_order.stripe_session_id <> p_stripe_session_id then
    raise exception 'SESSION_MISMATCH';
  end if;
  if lower(v_order.customer_email) <> lower(p_customer_email) then
    raise exception 'EMAIL_MISMATCH';
  end if;
  if v_order.user_id is distinct from p_user_id then
    raise exception 'USER_MISMATCH';
  end if;
  if v_order.total_cents <> p_total_cents then
    raise exception 'AMOUNT_MISMATCH';
  end if;
  if lower(p_currency) <> 'usd' then
    raise exception 'CURRENCY_MISMATCH';
  end if;

  for v_item in
    select * from jsonb_to_recordset(p_items)
      as x(product_id text, quantity integer, price_cents integer, stripe_price_id text, product_version text)
  loop
    if not exists (
      select 1 from public.products p
      where p.id = v_item.product_id and p.is_active = true
    ) then
      raise exception 'INVALID_PRODUCT';
    end if;
    insert into public.order_items
      (order_id, product_id, quantity, price_cents, stripe_price_id, product_version)
    values
      (p_order_id, v_item.product_id, v_item.quantity, v_item.price_cents, v_item.stripe_price_id, v_item.product_version)
    on conflict (order_id, product_id) do nothing;
  end loop;

  if not exists (select 1 from public.order_items where order_id = p_order_id) then
    raise exception 'ORDER_ITEMS_MISSING';
  end if;

  update public.orders
  set status = 'paid',
      fulfillment_status = 'fulfilled',
      payment_intent_id = p_payment_intent_id,
      currency = lower(p_currency),
      livemode = p_livemode,
      paid_at = coalesce(paid_at, now()),
      updated_at = now()
  where id = p_order_id;

  insert into public.entitlements
    (user_id, product_id, source_order_item_id, status, updates_until)
  select
    p_user_id,
    oi.product_id,
    oi.id,
    'active',
    now() + interval '1 year'
  from public.order_items oi
  where oi.order_id = p_order_id
  on conflict (source_order_item_id) do update
    set status = 'active', revoked_at = null, revoke_reason = null;

  insert into public.customers
    (email, name, user_id, total_spent, order_count, first_order_at, last_order_at, marketing_consent, updated_at)
  values
    (lower(p_customer_email), coalesce(p_customer_name, ''), p_user_id,
     p_total_cents / 100.0, 1, now(), now(), v_order.marketing_consent, now())
  on conflict (lower(email)) do update
    set name = case when excluded.name <> '' then excluded.name else public.customers.name end,
        user_id = coalesce(public.customers.user_id, excluded.user_id),
        total_spent = coalesce(public.customers.total_spent, 0) + excluded.total_spent,
        order_count = coalesce(public.customers.order_count, 0) + 1,
        first_order_at = coalesce(public.customers.first_order_at, now()),
        last_order_at = now(),
        marketing_consent = public.customers.marketing_consent or excluded.marketing_consent,
        updated_at = now();

  if v_order.coupon_code is not null then
    update public.gwds_coupons
    set used_count = coalesce(used_count, 0) + 1, updated_at = now()
    where code = v_order.coupon_code;
  end if;

  if v_order.marketing_consent then
    insert into public.newsletter_subscribers (email, source, is_active, subscribed_at)
    values (lower(p_customer_email), 'purchase_opt_in', true, now())
    on conflict (email) do update
      set is_active = true, unsubscribed_at = null;
  end if;

  insert into public.email_outbox (order_id, template, recipient_email, payload)
  values (p_order_id, 'order_confirmation', lower(p_customer_email), jsonb_build_object('order_id', p_order_id))
  on conflict (order_id, template) do nothing;

  update public.stripe_events
  set status = 'completed', order_id = p_order_id, processed_at = now()
  where stripe_event_id = p_event_id;

  return query select p_order_id, true;
end;
$$;

create or replace function public.apply_store_order_status_event(
  p_event_id text,
  p_event_type text,
  p_payload_hash text,
  p_stripe_session_id text,
  p_payment_intent_id text,
  p_livemode boolean,
  p_status text,
  p_reason text,
  p_revoke boolean
)
returns table(order_id uuid, processed boolean)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order_id uuid;
  v_claimed integer;
begin
  select id into v_order_id
  from public.orders
  where (p_stripe_session_id is not null and stripe_session_id = p_stripe_session_id)
     or (p_payment_intent_id is not null and payment_intent_id = p_payment_intent_id)
  order by created_at desc
  limit 1
  for update;

  if v_order_id is null then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  insert into public.stripe_events
    (stripe_event_id, event_type, livemode, payload_hash, status, order_id)
  values
    (p_event_id, p_event_type, p_livemode, p_payload_hash, 'processing', v_order_id)
  on conflict (stripe_event_id) do nothing;
  get diagnostics v_claimed = row_count;

  if v_claimed = 0 then
    return query select v_order_id, false;
    return;
  end if;

  update public.orders
  set status = p_status,
      fulfillment_status = case when p_revoke then 'revoked' else fulfillment_status end,
      failure_reason = p_reason,
      updated_at = now()
  where id = v_order_id;

  if p_revoke then
    update public.entitlements e
    set status = 'revoked', revoked_at = now(), revoke_reason = p_reason
    from public.order_items oi
    where oi.id = e.source_order_item_id and oi.order_id = v_order_id;

    update public.downloads
    set revoked_at = now(), updated_at = now()
    where order_id = v_order_id and revoked_at is null;
  end if;

  update public.stripe_events
  set status = 'completed', processed_at = now()
  where stripe_event_id = p_event_id;

  return query select v_order_id, true;
end;
$$;

create or replace function public.consume_store_download(
  p_token_hash text,
  p_order_id uuid,
  p_product_id text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
begin
  update public.downloads d
  set downloaded_count = downloaded_count + 1,
      last_downloaded_at = now(),
      updated_at = now()
  where d.token_hash = p_token_hash
    and d.order_id = p_order_id
    and d.product_id = p_product_id
    and d.revoked_at is null
    and d.expires_at > now()
    and d.downloaded_count < d.max_downloads
    and exists (
      select 1 from public.entitlements e
      where e.id = d.entitlement_id
        and e.status = 'active'
        and e.revoked_at is null
    );
  get diagnostics v_count = row_count;
  return v_count = 1;
end;
$$;

revoke all on function public.fulfill_store_order(text,text,text,uuid,text,text,uuid,text,text,integer,text,boolean,jsonb) from public, anon, authenticated;
revoke all on function public.apply_store_order_status_event(text,text,text,text,text,boolean,text,text,boolean) from public, anon, authenticated;
revoke all on function public.consume_store_download(text,uuid,text) from public, anon, authenticated;
grant execute on function public.fulfill_store_order(text,text,text,uuid,text,text,uuid,text,text,integer,text,boolean,jsonb) to service_role;
grant execute on function public.apply_store_order_status_event(text,text,text,text,text,boolean,text,text,boolean) to service_role;
grant execute on function public.consume_store_download(text,uuid,text) to service_role;

-- Explicitly remove the historical arbitrary-SQL function if it exists.
drop function if exists public.exec_sql(text);
