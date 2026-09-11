-- Storefront settings: single row, admin-managed.
create table if not exists public.store_settings (
  id bigint primary key default 1,
  theme_choice text default 'default' check (theme_choice in ('default','dark','light')),
  banner_text text default '',
  announcement_bar text default '',
  maintenance_pause_message text default '',
  updated_at timestamptz default now(),
  updated_by uuid,
  constraint store_settings_single_row check (id = 1)
);

alter table public.store_settings enable row level security;

-- Public MAY READ: banner/announcement text renders for anonymous storefront visitors.
drop policy if exists "Public can read store settings" on public.store_settings;
create policy "Public can read store settings"
  on public.store_settings for select
  using (true);

-- NO anon/authenticated WRITE POLICY, deliberately.
-- The first draft of this migration had `for update using (true) with check (true)` with a comment
-- claiming security was "enforced at the application layer via requireAdmin". RLS also governs
-- DIRECT PostgREST access, so that policy would have let any holder of the PUBLIC anon key rewrite
-- the storefront banner and maintenance message without touching the admin app at all.
-- Admin writes use createServerClient() (service role), which bypasses RLS, so granting no write
-- policy keeps requireAdmin as the only path in.
drop policy if exists "Admin can update store settings" on public.store_settings;

insert into public.store_settings (id) values (1) on conflict (id) do nothing;
