-- Harden legacy dashboard objects when the storefront shares their database.
-- A clean storefront installation does not contain these optional objects.
do $$
declare
  table_name text;
  demo_tables text[] := array['trade_journal','paper_accounts','paper_positions','paper_orders','paper_fills','paper_equity_curve','protections'];
begin
  foreach table_name in array array['trade_journal','paper_accounts','paper_positions','paper_orders','paper_fills','paper_equity_curve','agui_events','protections','agent_memory','trade_approvals','treasury_intents','treasury_state','treasury_lending']
  loop
    if to_regclass(format('public.%I', table_name)) is null then continue; end if;
    execute format('revoke all on table public.%I from public, anon, authenticated', table_name);
    execute format('alter table public.%I enable row level security', table_name);
    execute format('grant all on table public.%I to service_role', table_name);
    if table_name = any(demo_tables) then
      execute format('grant select on table public.%I to anon, authenticated', table_name);
      execute format('drop policy if exists %I on public.%I', table_name || '_demo_read', table_name);
      execute format('create policy %I on public.%I for select to anon, authenticated using (true)', table_name || '_demo_read', table_name);
    end if;
  end loop;
end $$;
