create or replace function control.acquire_cycle_lease_for_host(
  p_tenant_id uuid,
  p_host text,
  p_holder text,
  p_ttl_seconds integer default null
)
returns table(
  acquired boolean, reason text, lease_id uuid, fence bigint,
  cycle_run_id uuid, expires_at timestamptz, halted boolean
)
language plpgsql security definer
set search_path = control, pg_catalog
as $fn$
declare
  v_actual_host text;
begin
  if p_tenant_id is null or p_host is null or btrim(p_host) = ''
     or p_holder is null or btrim(p_holder) = '' then
    return query select false, 'ambiguous_caller', null::uuid, null::bigint,
      null::uuid, null::timestamptz, null::boolean;
    return;
  end if;

  -- Hold the same tenant lock used by acquire_cycle_lease while checking placement. The old
  -- function reacquires this transaction lock safely, and no second claimant can pass between
  -- this host check and the actual fenced lease insert.
  perform pg_advisory_xact_lock(control.tenant_lock_key(p_tenant_id));
  select t.host into v_actual_host from control.tenants t where t.id = p_tenant_id;
  if not found then
    return query select false, 'unknown_tenant', null::uuid, null::bigint,
      null::uuid, null::timestamptz, null::boolean;
    return;
  end if;
  if v_actual_host <> btrim(p_host) then
    return query select false, 'wrong_host', null::uuid, null::bigint,
      null::uuid, null::timestamptz, null::boolean;
    return;
  end if;

  return query select * from control.acquire_cycle_lease(
    p_tenant_id, p_holder, p_ttl_seconds
  );
end;
$fn$;

revoke all on function control.acquire_cycle_lease_for_host(uuid,text,text,integer) from public;
grant execute on function control.acquire_cycle_lease_for_host(uuid,text,text,integer) to service_role;

comment on function control.acquire_cycle_lease_for_host(uuid,text,text,integer) is
  'Host-scoped wrapper around the fenced acquire_cycle_lease path. Refuses wrong-host claims before creating a lease or cycle run.';
