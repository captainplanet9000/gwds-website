-- Application-level paper workspace snapshots and due-aware worker leasing.

create table if not exists public.hosting_workspace_backups (
  id uuid primary key default gen_random_uuid(),
  instance_id uuid not null references public.hosting_instances(id) on delete cascade,
  tenant_key text not null,
  workspace jsonb not null,
  source_revision bigint not null,
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  recovery_tested_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists hosting_workspace_backups_instance_idx
  on public.hosting_workspace_backups (instance_id, created_at desc);

alter table public.hosting_workspace_backups enable row level security;
revoke all on table public.hosting_workspace_backups from anon, authenticated;
grant all on table public.hosting_workspace_backups to service_role;

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
    where (due_at is null or due_at <= now())
      and (
        status = 'queued'
        or (status = 'in_progress' and lease_expires_at < now())
      )
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
