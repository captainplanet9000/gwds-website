-- Security boundary for the shared production project.
-- Historical dashboard migrations granted the Postgres PUBLIC role unrestricted
-- access to operational tables and functions. Remove that inherited access and
-- explicitly restore only commerce owner reads and the read-only paper demo.

do $$
declare
  relation record;
begin
  for relation in
    select n.nspname, c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p', 'v', 'm', 'f')
  loop
    execute format(
      'revoke all privileges on table %I.%I from public, anon, authenticated',
      relation.nspname,
      relation.relname
    );
  end loop;
end $$;

revoke all privileges on all sequences in schema public from public, anon, authenticated;
revoke all privileges on all functions in schema public from public, anon, authenticated;

alter default privileges in schema public revoke all on tables from public, anon, authenticated;
alter default privileges in schema public revoke all on sequences from public, anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

-- Public catalog and verified-account reads used by the Cival storefront.
grant select on table public.products to anon, authenticated;
grant select on table
  public.orders,
  public.order_items,
  public.entitlements,
  public.refund_requests,
  public.support_requests,
  public.data_requests
to authenticated;

-- Deliberately public, read-only paper-demo data. RLS SELECT policies were
-- created in migration 011; there are no mutation grants or policies.
grant select on table
  public.trade_journal,
  public.paper_accounts,
  public.paper_positions,
  public.paper_orders,
  public.paper_fills,
  public.paper_equity_curve,
  public.protections
to anon, authenticated;

-- Treasury views must evaluate with the caller's permissions and are not part
-- of the public API.
alter view public.treasury_secured_today set (security_invoker = true);
alter view public.treasury_realized_pnl set (security_invoker = true);

alter function public.provision_account_schema(text) set search_path = public, pg_temp;
alter function public.seed_account_roster(text) set search_path = public, pg_temp;
