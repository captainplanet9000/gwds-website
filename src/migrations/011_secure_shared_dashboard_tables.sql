-- Remove anonymous mutation access from the dashboard tables that share the
-- commerce Supabase project. Paper/demo tables retain read-only access so the
-- public demo can render. Internal memory, approvals, events, and treasury
-- state become service-role only until a real tenant ownership model exists.

revoke all on table
  public.trade_journal,
  public.paper_accounts,
  public.paper_positions,
  public.paper_orders,
  public.paper_fills,
  public.paper_equity_curve,
  public.agui_events,
  public.protections,
  public.agent_memory,
  public.trade_approvals,
  public.treasury_intents,
  public.treasury_state,
  public.treasury_lending
from public, anon, authenticated;

alter table public.trade_journal enable row level security;
alter table public.paper_accounts enable row level security;
alter table public.paper_positions enable row level security;
alter table public.paper_orders enable row level security;
alter table public.paper_fills enable row level security;
alter table public.paper_equity_curve enable row level security;
alter table public.agui_events enable row level security;
alter table public.protections enable row level security;
alter table public.agent_memory enable row level security;
alter table public.trade_approvals enable row level security;
alter table public.treasury_intents enable row level security;
alter table public.treasury_state enable row level security;
alter table public.treasury_lending enable row level security;

grant select on table
  public.trade_journal,
  public.paper_accounts,
  public.paper_positions,
  public.paper_orders,
  public.paper_fills,
  public.paper_equity_curve,
  public.protections
to anon, authenticated;

grant all on table
  public.trade_journal,
  public.paper_accounts,
  public.paper_positions,
  public.paper_orders,
  public.paper_fills,
  public.paper_equity_curve,
  public.agui_events,
  public.protections,
  public.agent_memory,
  public.trade_approvals,
  public.treasury_intents,
  public.treasury_state,
  public.treasury_lending
to service_role;

create policy trade_journal_demo_read on public.trade_journal
  for select to anon, authenticated using (true);
create policy paper_accounts_demo_read on public.paper_accounts
  for select to anon, authenticated using (true);
create policy paper_positions_demo_read on public.paper_positions
  for select to anon, authenticated using (true);
create policy paper_orders_demo_read on public.paper_orders
  for select to anon, authenticated using (true);
create policy paper_fills_demo_read on public.paper_fills
  for select to anon, authenticated using (true);
create policy paper_equity_curve_demo_read on public.paper_equity_curve
  for select to anon, authenticated using (true);
create policy protections_demo_read on public.protections
  for select to anon, authenticated using (true);
