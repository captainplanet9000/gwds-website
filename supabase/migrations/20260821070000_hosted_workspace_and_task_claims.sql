-- Durable paper-workspace state plus atomic leasing for the hosting worker.

alter table public.hosting_provisioning_tasks
  add column if not exists lease_expires_at timestamptz;

create table if not exists public.hosting_workspace_state (
  tenant_key text primary key references public.hosting_instances(tenant_key) on delete cascade,
  instance_id uuid not null unique references public.hosting_instances(id) on delete cascade,
  subscription_id uuid not null references public.hosting_subscriptions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace jsonb not null,
  revision bigint not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hosting_workspace_owner_idx
  on public.hosting_workspace_state (user_id, updated_at desc);

alter table public.hosting_workspace_state enable row level security;
revoke all on table public.hosting_workspace_state from anon, authenticated;
grant select, update on table public.hosting_workspace_state to authenticated;
grant all on table public.hosting_workspace_state to service_role;

drop policy if exists hosting_workspace_owner_read on public.hosting_workspace_state;
create policy hosting_workspace_owner_read on public.hosting_workspace_state
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.hosting_instances i
      join public.hosting_subscriptions s on s.id = i.subscription_id
      where i.id = hosting_workspace_state.instance_id
        and i.status in ('active', 'degraded', 'maintenance')
        and s.status in ('active', 'trialing')
    )
  );

drop policy if exists hosting_workspace_owner_update on public.hosting_workspace_state;
create policy hosting_workspace_owner_update on public.hosting_workspace_state
  for update to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.hosting_instances i
      join public.hosting_subscriptions s on s.id = i.subscription_id
      where i.id = hosting_workspace_state.instance_id
        and i.status in ('active', 'degraded', 'maintenance')
        and s.status in ('active', 'trialing')
    )
  )
  with check ((select auth.uid()) = user_id);

create or replace function public.claim_next_hosting_task(p_worker text)
returns setof public.hosting_provisioning_tasks
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with candidate as (
    select id
    from public.hosting_provisioning_tasks
    where status = 'queued'
       or (status = 'in_progress' and lease_expires_at < now())
    order by priority desc, created_at
    for update skip locked
    limit 1
  )
  update public.hosting_provisioning_tasks task
  set status = 'in_progress',
      attempts = task.attempts + 1,
      assigned_to = left(p_worker, 120),
      started_at = coalesce(task.started_at, now()),
      lease_expires_at = now() + interval '5 minutes',
      updated_at = now()
  from candidate
  where task.id = candidate.id
  returning task.*;
end;
$$;

revoke all on function public.claim_next_hosting_task(text) from public, anon, authenticated;
grant execute on function public.claim_next_hosting_task(text) to service_role;
