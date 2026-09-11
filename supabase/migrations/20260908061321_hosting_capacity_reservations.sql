-- Admission capacity is separate from the public sales switch and plan gates.
-- Keep at zero until the deployed fleet has passed its capacity acceptance run.
create table public.hosting_capacity (
  id boolean primary key default true check (id),
  max_subscriptions integer not null default 0 check (max_subscriptions between 0 and 1000),
  updated_at timestamptz not null default now()
);
alter table public.hosting_capacity enable row level security;
revoke all on public.hosting_capacity from public, anon, authenticated;
grant select, update on public.hosting_capacity to service_role;
insert into public.hosting_capacity(id) values (true);

create or replace function public.enforce_hosting_capacity()
returns trigger language plpgsql security invoker set search_path = public, pg_temp as $$
declare
  capacity integer;
  occupied bigint;
begin
  -- Serialize checkouts BEFORE counting reservations: parallel buyers cannot
  -- all observe the same last available slot.
  perform pg_advisory_xact_lock(hashtextextended('cival.hosting.admission', 0));
  select max_subscriptions into capacity from public.hosting_capacity where id = true for share;
  if capacity is null or capacity = 0 then raise exception 'HOSTING_CAPACITY_CLOSED'; end if;
  select count(*) into occupied from public.hosting_subscriptions
    where status in ('pending_checkout','incomplete','trialing','active','past_due','unpaid','paused');
  if occupied >= capacity then raise exception 'HOSTING_CAPACITY_FULL'; end if;
  return new;
end;
$$;
revoke all on function public.enforce_hosting_capacity() from public, anon, authenticated;
create trigger hosting_subscription_admission
before insert on public.hosting_subscriptions
for each row execute function public.enforce_hosting_capacity();

comment on table public.hosting_capacity is
  'Maximum open subscription reservations, not a measured worker capacity. Pending Stripe checkouts reserve seats until confirmed expired. Sales and plan readiness gates still apply.';
