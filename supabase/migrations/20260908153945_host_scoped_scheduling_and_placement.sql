-- A paid subscription is admitted globally by hosting_capacity, then placed on exactly one
-- validated host here. No host is enabled by this migration: cloud commissioning is explicit.
create table if not exists control.host_registry (
  host text primary key,
  admissions_enabled boolean not null default false,
  max_tenants integer not null default 0 check (max_tenants between 0 and 1000),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (host ~ '^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$')
);
alter table control.host_registry enable row level security;
alter table control.host_registry force row level security;
revoke all on control.host_registry from public, anon, authenticated;
grant select, insert, update, delete on control.host_registry to service_role;

insert into control.host_registry(host, admissions_enabled, max_tenants, note)
values ('local', false, 0, 'Existing workstation host. Never selected for public signup.')
on conflict (host) do nothing;

create index if not exists tenants_host_status_idx on control.tenants(host, status);

create or replace function control.due_tenants_for_host(p_host text, p_limit integer default 50)
returns table(
  tenant_id uuid, slug citext, base_url text, max_cycle_seconds integer,
  priority smallint, overdue_seconds numeric
)
language plpgsql stable security definer
set search_path = control, pg_catalog
as $fn$
begin
  if p_host is null or btrim(p_host) = '' then
    raise exception 'due_tenants_for_host requires a host' using errcode = 'check_violation';
  end if;
  return query
  select t.id, t.slug, t.base_url, sc.max_cycle_seconds, sc.priority,
         extract(epoch from (now() - sc.next_run_at))
    from control.tenant_schedule sc
    join control.tenants t on t.id = sc.tenant_id
   where sc.enabled and t.status = 'active' and t.host = btrim(p_host)
     and sc.next_run_at <= now()
     and (sc.backoff_until is null or sc.backoff_until <= now())
     and not exists (
       select 1 from control.cycle_leases l
        where l.tenant_id = t.id and l.expires_at > now()
     )
   order by sc.priority asc, sc.next_run_at asc
   limit greatest(least(p_limit, 500), 1);
end;
$fn$;
revoke all on function control.due_tenants_for_host(text, integer) from public;
grant execute on function control.due_tenants_for_host(text, integer) to service_role;

create or replace function public.provision_hosting_tenant(
  p_hosting_subscription_id uuid, p_plan text, p_owner_email text,
  p_display_name text, p_requested_by text
)
returns jsonb language plpgsql security definer
set search_path = control, public, pg_catalog
as $fn$
declare
  v_tenant_id uuid;
  v_slug text;
  v_command_id uuid;
  v_host text;
  v_created boolean := false;
begin
  if p_hosting_subscription_id is null then
    raise exception 'provision_hosting_tenant requires hosting_subscription_id'
      using errcode = 'check_violation';
  end if;
  if p_requested_by is null or btrim(p_requested_by) = '' then
    raise exception 'provision_hosting_tenant requires a named actor'
      using errcode = 'check_violation';
  end if;

  select id, slug::text into v_tenant_id, v_slug from control.tenants
   where hosting_subscription_id = p_hosting_subscription_id;

  if v_tenant_id is null then
    -- Serializes placement so concurrent webhooks cannot overfill the same last host slot.
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('cival.hosting.placement', 0)
    );
    select h.host into v_host
      from control.host_registry h
      cross join lateral (
        select count(*)::integer as assigned from control.tenants placed
         where placed.host = h.host and placed.status <> 'archived'
      ) usage
     where h.admissions_enabled and h.max_tenants > usage.assigned
       and exists (select 1 from control.port_pool p where p.host = h.host)
     order by usage.assigned asc, h.host asc limit 1;
    if v_host is null then
      raise exception 'HOSTING_NO_AVAILABLE_HOST'
        using errcode = 'check_violation',
              hint = 'Register and validate a cloud host before enabling admissions.';
    end if;

    v_slug := 'cival-' || substr(replace(p_hosting_subscription_id::text, '-', ''), 1, 20);
    insert into control.tenants(
      slug, display_name, owner_email, plan, hosting_subscription_id, status, host
    ) values (
      v_slug, coalesce(nullif(btrim(p_display_name), ''), v_slug),
      nullif(btrim(p_owner_email), ''),
      coalesce(nullif(btrim(p_plan), ''), 'standard'),
      p_hosting_subscription_id, 'provisioning', v_host
    )
    on conflict (hosting_subscription_id) where hosting_subscription_id is not null do nothing
    returning id into v_tenant_id;
    if v_tenant_id is null then
      select id, slug::text into v_tenant_id, v_slug from control.tenants
       where hosting_subscription_id = p_hosting_subscription_id;
    else
      v_created := true;
    end if;
  end if;

  if v_tenant_id is null then
    raise exception 'provision_hosting_tenant could not resolve a tenant for subscription %',
      p_hosting_subscription_id;
  end if;
  if not exists (
    select 1 from control.tenant_commands
     where tenant_id = v_tenant_id and command = 'provision'
  ) then
    insert into control.tenant_commands(tenant_id, command, args, requested_by)
    values (v_tenant_id, 'provision', '{}'::jsonb, p_requested_by)
    returning id into v_command_id;
  end if;
  return jsonb_build_object(
    'tenant_id', v_tenant_id, 'slug', v_slug,
    'created', v_created, 'command_id', v_command_id
  );
end;
$fn$;
revoke all on function public.provision_hosting_tenant(uuid,text,text,text,text) from public;
grant execute on function public.provision_hosting_tenant(uuid,text,text,text,text) to service_role;
