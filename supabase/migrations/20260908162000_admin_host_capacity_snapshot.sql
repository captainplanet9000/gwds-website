create or replace function public.hosting_host_capacity()
returns table(
  host text,
  admissions_enabled boolean,
  max_tenants integer,
  active_tenants bigint,
  available_slots bigint,
  note text,
  updated_at timestamptz
)
language sql
security definer
set search_path = control, pg_catalog
stable
as $fn$
  select
    h.host,
    h.admissions_enabled,
    h.max_tenants,
    count(t.id) filter (where t.status <> 'archived') as active_tenants,
    greatest(
      h.max_tenants::bigint - count(t.id) filter (where t.status <> 'archived'),
      0::bigint
    ) as available_slots,
    h.note,
    h.updated_at
  from control.host_registry h
  left join control.tenants t on t.host = h.host
  group by h.host, h.admissions_enabled, h.max_tenants, h.note, h.updated_at
  order by h.host;
$fn$;

revoke all on function public.hosting_host_capacity() from public, anon, authenticated;
grant execute on function public.hosting_host_capacity() to service_role;

comment on function public.hosting_host_capacity() is
  'Service-role-only host admission and placement summary for the authenticated operator console.';
