-- Managed-hosting control plane for Cival Systems.
-- Customer-facing reads are owner-scoped with RLS. Every mutation is performed
-- by authenticated server routes using the service role. No exchange secret is
-- exposed through the Data API, including to its owner.

create extension if not exists pgcrypto;

create table public.hosting_plans (
  id text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  name text not null,
  description text not null,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'usd' check (currency = 'usd'),
  billing_interval text not null default 'month' check (billing_interval in ('month', 'year', 'none')),
  stripe_product_id text unique,
  stripe_price_id text unique,
  agent_limit integer check (agent_limit is null or agent_limit > 0),
  agent_hours integer check (agent_hours is null or agent_hours > 0),
  workspace_limit integer check (workspace_limit is null or workspace_limit > 0),
  seat_limit integer check (seat_limit is null or seat_limit > 0),
  support_tier text not null default 'standard',
  included_product_id text references public.products(id) on delete set null,
  features jsonb not null default '[]'::jsonb check (jsonb_typeof(features) = 'array'),
  is_active boolean not null default true,
  launch_ready boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (price_cents = 0 and billing_interval = 'none' and stripe_price_id is null)
    or
    (price_cents >= 50 and billing_interval in ('month', 'year') and (stripe_price_id is not null or not launch_ready))
  )
);

create table public.hosting_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null references public.hosting_plans(id) on delete restrict,
  customer_email text not null,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_checkout_session_id text unique,
  status text not null default 'pending_checkout' check (status in (
    'pending_checkout','incomplete','incomplete_expired','trialing','active',
    'past_due','canceled','unpaid','paused'
  )),
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'usd' check (currency = 'usd'),
  livemode boolean,
  cancel_at_period_end boolean not null default false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_end timestamptz,
  last_invoice_status text,
  last_payment_at timestamptz,
  terms_version text not null,
  refund_policy_version text not null,
  disclaimer_version text not null,
  service_terms_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  canceled_at timestamptz
);

create unique index hosting_one_open_subscription_per_user
  on public.hosting_subscriptions(user_id)
  where status in ('pending_checkout','incomplete','trialing','active','past_due','unpaid','paused');
create index hosting_subscriptions_user_created
  on public.hosting_subscriptions(user_id, created_at desc);
create index hosting_subscriptions_status
  on public.hosting_subscriptions(status, updated_at desc);

create table public.hosting_onboarding (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null unique references public.hosting_subscriptions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_name text,
  environment text not null default 'paper' check (environment in ('paper', 'live')),
  region text not null default 'iad1' check (region in ('iad1','sfo1','fra1','sin1')),
  exchange text not null default 'hyperliquid' check (exchange = 'hyperliquid'),
  account_address text,
  requested_agents jsonb not null default '[]'::jsonb check (jsonb_typeof(requested_agents) = 'array'),
  risk_profile text not null default 'conservative' check (risk_profile in ('conservative','balanced','custom')),
  max_drawdown_pct numeric(5,2) check (max_drawdown_pct is null or (max_drawdown_pct > 0 and max_drawdown_pct <= 100)),
  max_position_usd numeric(14,2) check (max_position_usd is null or max_position_usd > 0),
  status text not null default 'not_started' check (status in (
    'not_started','customer_input','operator_review','approved','blocked','complete'
  )),
  customer_notes text,
  operator_notes text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index hosting_onboarding_user on public.hosting_onboarding(user_id, updated_at desc);
create index hosting_onboarding_queue on public.hosting_onboarding(status, submitted_at);

create table public.hosting_instances (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null unique references public.hosting_subscriptions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null references public.hosting_plans(id) on delete restrict,
  tenant_key text not null unique check (tenant_key ~ '^cival-[a-z0-9-]{8,64}$'),
  status text not null default 'queued' check (status in (
    'queued','provisioning','active','degraded','maintenance','suspended','failed','decommissioning','decommissioned'
  )),
  provider text not null default 'vercel',
  region text not null default 'iad1',
  deployment_url text,
  provider_project_id text,
  provider_deployment_id text,
  database_ref text,
  release_version text,
  health_status text not null default 'unknown' check (health_status in ('unknown','healthy','degraded','unreachable')),
  last_heartbeat_at timestamptz,
  backup_status text not null default 'not_configured' check (backup_status in ('not_configured','healthy','warning','failed')),
  last_backup_at timestamptz,
  last_recovery_test_at timestamptz,
  activated_at timestamptz,
  suspended_at timestamptz,
  decommissioned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index hosting_instances_user on public.hosting_instances(user_id, updated_at desc);
create index hosting_instances_operations on public.hosting_instances(status, health_status, updated_at desc);

create table public.hosting_credentials (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references public.hosting_instances(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  credential_type text not null check (credential_type in ('hyperliquid_api_wallet','openai_api_key')),
  ciphertext text not null,
  iv text not null,
  auth_tag text not null,
  key_version integer not null default 1 check (key_version > 0),
  fingerprint text not null,
  last_four text not null,
  status text not null default 'pending_verification' check (status in ('pending_verification','active','invalid','revoked')),
  verified_at timestamptz,
  rotated_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(instance_id, credential_type)
);
create index hosting_credentials_status on public.hosting_credentials(status, updated_at desc);

create table public.hosting_provisioning_tasks (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references public.hosting_instances(id) on delete cascade,
  task_type text not null check (task_type in (
    'review','create_project','create_database','configure_secrets','deploy','health_check',
    'backup_check','recovery_test','suspend','resume','decommission','custom'
  )),
  status text not null default 'queued' check (status in ('queued','in_progress','blocked','completed','failed','canceled')),
  priority integer not null default 50 check (priority between 0 and 100),
  idempotency_key text not null unique,
  attempts integer not null default 0 check (attempts >= 0),
  assigned_to text,
  due_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  last_error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index hosting_tasks_queue on public.hosting_provisioning_tasks(status, priority desc, created_at);

create table public.hosting_incidents (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references public.hosting_instances(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  severity text not null check (severity in ('info','minor','major','critical')),
  status text not null default 'investigating' check (status in ('investigating','identified','monitoring','resolved')),
  customer_visible boolean not null default true,
  started_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index hosting_incidents_instance on public.hosting_incidents(instance_id, started_at desc);

create table public.hosting_usage_daily (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.hosting_subscriptions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  agent_hours numeric(12,3) not null default 0 check (agent_hours >= 0),
  peak_agents integer not null default 0 check (peak_agents >= 0),
  runtime_events bigint not null default 0 check (runtime_events >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(subscription_id, usage_date)
);
create index hosting_usage_user_date on public.hosting_usage_daily(user_id, usage_date desc);

create table public.hosting_audit (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  subscription_id uuid references public.hosting_subscriptions(id) on delete set null,
  instance_id uuid references public.hosting_instances(id) on delete set null,
  actor_type text not null check (actor_type in ('customer','admin','system','stripe')),
  actor_id text,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index hosting_audit_resource on public.hosting_audit(instance_id, created_at desc);
create index hosting_audit_user on public.hosting_audit(user_id, created_at desc);

create table public.hosting_notifications (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.hosting_subscriptions(id) on delete cascade,
  template text not null check (template in ('hosting_started','hosting_payment_failed','hosting_canceled','hosting_activated','hosting_incident')),
  recipient_email text not null,
  dedup_key text not null unique,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','sending','sent','failed')),
  attempts integer not null default 0 check (attempts >= 0),
  provider_message_id text,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index hosting_notifications_queue on public.hosting_notifications(status, created_at);

insert into public.hosting_plans (
  id,name,description,price_cents,billing_interval,agent_limit,agent_hours,
  workspace_limit,seat_limit,support_tier,included_product_id,features,is_active,launch_ready,sort_order
) values
  ('paper','Paper','Private managed workspace with simulated fills only.',0,'none',1,null,1,1,'community',null,
   '["Full hosted dashboard","One paper agent","No card required"]'::jsonb,true,false,10),
  ('solo','Solo','One supervised agent with managed updates and operations.',1900,'month',1,250,1,1,'standard','trading-dashboard-template',
   '["One live agent","250 agent-hours","Core Edition licence included"]'::jsonb,true,false,20),
  ('desk','Desk','Six coordinated agents with shared risk controls.',7900,'month',6,1000,1,1,'priority','everything-bundle',
   '["Six-agent farm","1,000 agent-hours","Desk Edition licence included","Priority support"]'::jsonb,true,false,30),
  ('fund','Fund','Dedicated multi-workspace runtime for professional teams.',29900,'month',null,null,null,null,'dedicated','everything-bundle',
   '["Dedicated workers","Multiple workspaces","Team access","Private agent delivery"]'::jsonb,true,false,40)
on conflict (id) do update set
  name=excluded.name, description=excluded.description, price_cents=excluded.price_cents,
  billing_interval=excluded.billing_interval, agent_limit=excluded.agent_limit,
  agent_hours=excluded.agent_hours, workspace_limit=excluded.workspace_limit,
  seat_limit=excluded.seat_limit, support_tier=excluded.support_tier,
  included_product_id=excluded.included_product_id, features=excluded.features,
  is_active=excluded.is_active, launch_ready=false, sort_order=excluded.sort_order, updated_at=now();

create or replace function public.create_hosting_checkout(
  p_user_id uuid,
  p_customer_email text,
  p_plan_id text,
  p_terms_version text,
  p_refund_policy_version text,
  p_disclaimer_version text,
  p_service_terms_version text
) returns table(subscription_id uuid, stripe_price_id text, price_cents integer, currency text)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_plan public.hosting_plans%rowtype;
  v_subscription_id uuid := gen_random_uuid();
begin
  if p_user_id is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_customer_email is null or length(trim(p_customer_email)) > 320 then raise exception 'INVALID_EMAIL'; end if;
  if p_terms_version is null or p_refund_policy_version is null or p_disclaimer_version is null or p_service_terms_version is null then
    raise exception 'LEGAL_ACCEPTANCE_REQUIRED';
  end if;

  select * into v_plan from public.hosting_plans where id=p_plan_id for share;
  if v_plan.id is null or not v_plan.is_active then raise exception 'PLAN_UNAVAILABLE'; end if;
  if not v_plan.launch_ready then raise exception 'HOSTING_NOT_LAUNCH_READY'; end if;
  if v_plan.price_cents < 50 or v_plan.stripe_price_id is null then raise exception 'PAID_PLAN_REQUIRED'; end if;
  if exists (
    select 1 from public.hosting_subscriptions
    where user_id=p_user_id and status in ('pending_checkout','incomplete','trialing','active','past_due','unpaid','paused')
  ) then raise exception 'OPEN_SUBSCRIPTION_EXISTS'; end if;

  insert into public.hosting_subscriptions (
    id,user_id,plan_id,customer_email,status,price_cents,currency,
    terms_version,refund_policy_version,disclaimer_version,service_terms_version
  ) values (
    v_subscription_id,p_user_id,v_plan.id,lower(trim(p_customer_email)),'pending_checkout',
    v_plan.price_cents,v_plan.currency,p_terms_version,p_refund_policy_version,
    p_disclaimer_version,p_service_terms_version
  );

  insert into public.hosting_audit(user_id,subscription_id,actor_type,actor_id,action)
  values(p_user_id,v_subscription_id,'customer',p_user_id::text,'hosting_checkout_created');

  return query select v_subscription_id,v_plan.stripe_price_id,v_plan.price_cents,v_plan.currency;
end;
$$;

create or replace function public.activate_hosting_checkout(
  p_event_id text,
  p_event_type text,
  p_payload_hash text,
  p_subscription_id uuid,
  p_user_id uuid,
  p_plan_id text,
  p_checkout_session_id text,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_stripe_price_id text,
  p_customer_email text,
  p_status text,
  p_period_start timestamptz,
  p_period_end timestamptz,
  p_trial_end timestamptz,
  p_cancel_at_period_end boolean,
  p_livemode boolean
) returns table(subscription_id uuid, instance_id uuid, processed boolean)
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_claimed integer;
  v_subscription public.hosting_subscriptions%rowtype;
  v_plan public.hosting_plans%rowtype;
  v_instance_id uuid;
begin
  insert into public.stripe_events(stripe_event_id,event_type,livemode,payload_hash,status)
  values(p_event_id,p_event_type,p_livemode,p_payload_hash,'processing') on conflict(stripe_event_id) do nothing;
  get diagnostics v_claimed = row_count;
  if v_claimed=0 then
    select id into v_instance_id from public.hosting_instances where subscription_id=p_subscription_id;
    return query select p_subscription_id,v_instance_id,false; return;
  end if;

  select * into v_subscription from public.hosting_subscriptions where id=p_subscription_id for update;
  select * into v_plan from public.hosting_plans where id=p_plan_id;
  if v_subscription.id is null or v_plan.id is null then raise exception 'HOSTING_SUBSCRIPTION_NOT_FOUND'; end if;
  if v_subscription.user_id<>p_user_id or v_subscription.plan_id<>p_plan_id then raise exception 'HOSTING_OWNER_MISMATCH'; end if;
  if lower(v_subscription.customer_email)<>lower(p_customer_email) then raise exception 'HOSTING_EMAIL_MISMATCH'; end if;
  if v_plan.stripe_price_id<>p_stripe_price_id or v_subscription.price_cents<>v_plan.price_cents then raise exception 'HOSTING_PRICE_MISMATCH'; end if;
  if p_status not in ('incomplete','trialing','active','past_due','unpaid','paused') then raise exception 'HOSTING_STATUS_INVALID'; end if;

  update public.hosting_subscriptions set
    stripe_checkout_session_id=p_checkout_session_id,stripe_customer_id=p_stripe_customer_id,
    stripe_subscription_id=p_stripe_subscription_id,status=p_status,livemode=p_livemode,
    current_period_start=p_period_start,current_period_end=p_period_end,trial_end=p_trial_end,
    cancel_at_period_end=coalesce(p_cancel_at_period_end,false),updated_at=now()
  where id=p_subscription_id;

  insert into public.hosting_onboarding(subscription_id,user_id,status)
  values(p_subscription_id,p_user_id,'customer_input') on conflict(subscription_id) do nothing;
  insert into public.hosting_instances(subscription_id,user_id,plan_id,tenant_key,status)
  values(p_subscription_id,p_user_id,p_plan_id,'cival-'||replace(p_subscription_id::text,'-',''),'queued')
  on conflict(subscription_id) do update set plan_id=excluded.plan_id,updated_at=now()
  returning id into v_instance_id;
  insert into public.hosting_provisioning_tasks(instance_id,task_type,status,priority,idempotency_key)
  values(v_instance_id,'review','queued',80,'initial-review-'||p_subscription_id::text) on conflict(idempotency_key) do nothing;
  insert into public.hosting_audit(user_id,subscription_id,instance_id,actor_type,actor_id,action,metadata)
  values(p_user_id,p_subscription_id,v_instance_id,'stripe',p_event_id,'hosting_subscription_activated',jsonb_build_object('status',p_status,'plan_id',p_plan_id));
  insert into public.hosting_notifications(subscription_id,template,recipient_email,dedup_key,payload)
  values(p_subscription_id,'hosting_started',lower(p_customer_email),'hosting-started-'||p_subscription_id::text,jsonb_build_object('plan_id',p_plan_id,'instance_id',v_instance_id))
  on conflict(dedup_key) do nothing;
  update public.stripe_events set status='completed',processed_at=now() where stripe_event_id=p_event_id;
  return query select p_subscription_id,v_instance_id,true;
end;
$$;

create or replace function public.sync_hosting_subscription(
  p_event_id text,p_event_type text,p_payload_hash text,p_stripe_subscription_id text,
  p_status text,p_cancel_at_period_end boolean,p_period_start timestamptz,p_period_end timestamptz,
  p_trial_end timestamptz,p_livemode boolean
) returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare v_claimed integer; v_row public.hosting_subscriptions%rowtype;
begin
  if p_status not in ('incomplete','incomplete_expired','trialing','active','past_due','canceled','unpaid','paused') then
    raise exception 'HOSTING_STATUS_INVALID';
  end if;
  insert into public.stripe_events(stripe_event_id,event_type,livemode,payload_hash,status)
  values(p_event_id,p_event_type,p_livemode,p_payload_hash,'processing') on conflict(stripe_event_id) do nothing;
  get diagnostics v_claimed=row_count; if v_claimed=0 then return false; end if;
  select * into v_row from public.hosting_subscriptions where stripe_subscription_id=p_stripe_subscription_id for update;
  if v_row.id is null then raise exception 'HOSTING_SUBSCRIPTION_NOT_FOUND'; end if;
  if v_row.livemode is distinct from p_livemode then raise exception 'HOSTING_LIVEMODE_MISMATCH'; end if;
  update public.hosting_subscriptions set status=p_status,cancel_at_period_end=coalesce(p_cancel_at_period_end,false),
    current_period_start=p_period_start,current_period_end=p_period_end,trial_end=p_trial_end,
    canceled_at=case when p_status='canceled' then coalesce(canceled_at,now()) else canceled_at end,updated_at=now()
  where id=v_row.id;
  update public.hosting_instances set
    status=case when p_status in ('active','trialing') and status='suspended' then 'queued'
                when p_status in ('past_due','unpaid','paused','canceled','incomplete_expired') then 'suspended' else status end,
    suspended_at=case when p_status in ('past_due','unpaid','paused','canceled','incomplete_expired') then coalesce(suspended_at,now()) else null end,
    updated_at=now() where subscription_id=v_row.id;
  insert into public.hosting_audit(user_id,subscription_id,actor_type,actor_id,action,metadata)
  values(v_row.user_id,v_row.id,'stripe',p_event_id,'hosting_subscription_synced',jsonb_build_object('status',p_status));
  if p_status in ('past_due','unpaid') then
    insert into public.hosting_notifications(subscription_id,template,recipient_email,dedup_key,payload)
    values(v_row.id,'hosting_payment_failed',v_row.customer_email,'hosting-payment-'||p_event_id,jsonb_build_object('status',p_status))
    on conflict(dedup_key) do nothing;
  elsif p_status='canceled' then
    insert into public.hosting_notifications(subscription_id,template,recipient_email,dedup_key,payload)
    values(v_row.id,'hosting_canceled',v_row.customer_email,'hosting-canceled-'||v_row.id::text,jsonb_build_object('status',p_status))
    on conflict(dedup_key) do nothing;
  end if;
  update public.stripe_events set status='completed',processed_at=now() where stripe_event_id=p_event_id;
  return true;
end;
$$;

alter table public.hosting_plans enable row level security;
alter table public.hosting_subscriptions enable row level security;
alter table public.hosting_onboarding enable row level security;
alter table public.hosting_instances enable row level security;
alter table public.hosting_credentials enable row level security;
alter table public.hosting_provisioning_tasks enable row level security;
alter table public.hosting_incidents enable row level security;
alter table public.hosting_usage_daily enable row level security;
alter table public.hosting_audit enable row level security;
alter table public.hosting_notifications enable row level security;

revoke all on table public.hosting_plans,public.hosting_subscriptions,public.hosting_onboarding,
  public.hosting_instances,public.hosting_credentials,public.hosting_provisioning_tasks,
  public.hosting_incidents,public.hosting_usage_daily,public.hosting_audit from public,anon,authenticated;
revoke all on table public.hosting_notifications from public,anon,authenticated;
grant select on table public.hosting_plans to anon,authenticated;
grant select on table public.hosting_subscriptions,public.hosting_onboarding,public.hosting_instances,
  public.hosting_incidents,public.hosting_usage_daily,public.hosting_audit to authenticated;
grant all on table public.hosting_plans,public.hosting_subscriptions,public.hosting_onboarding,
  public.hosting_instances,public.hosting_credentials,public.hosting_provisioning_tasks,
  public.hosting_incidents,public.hosting_usage_daily,public.hosting_audit to service_role;
grant all on table public.hosting_notifications to service_role;
grant usage,select on all sequences in schema public to service_role;

create policy hosting_plans_public_read on public.hosting_plans for select to anon,authenticated using(is_active=true);
create policy hosting_subscriptions_owner_read on public.hosting_subscriptions for select to authenticated using((select auth.uid())=user_id);
create policy hosting_onboarding_owner_read on public.hosting_onboarding for select to authenticated using((select auth.uid())=user_id);
create policy hosting_instances_owner_read on public.hosting_instances for select to authenticated using((select auth.uid())=user_id);
create policy hosting_incidents_owner_read on public.hosting_incidents for select to authenticated using((select auth.uid())=user_id and customer_visible=true);
create policy hosting_usage_owner_read on public.hosting_usage_daily for select to authenticated using((select auth.uid())=user_id);
create policy hosting_audit_owner_read on public.hosting_audit for select to authenticated using((select auth.uid())=user_id and actor_type<>'admin');

revoke all on function public.create_hosting_checkout(uuid,text,text,text,text,text,text) from public,anon,authenticated;
revoke all on function public.activate_hosting_checkout(text,text,text,uuid,uuid,text,text,text,text,text,text,text,timestamptz,timestamptz,timestamptz,boolean,boolean) from public,anon,authenticated;
revoke all on function public.sync_hosting_subscription(text,text,text,text,text,boolean,timestamptz,timestamptz,timestamptz,boolean) from public,anon,authenticated;
grant execute on function public.create_hosting_checkout(uuid,text,text,text,text,text,text) to service_role;
grant execute on function public.activate_hosting_checkout(text,text,text,uuid,uuid,text,text,text,text,text,text,text,timestamptz,timestamptz,timestamptz,boolean,boolean) to service_role;
grant execute on function public.sync_hosting_subscription(text,text,text,text,text,boolean,timestamptz,timestamptz,timestamptz,boolean) to service_role;
