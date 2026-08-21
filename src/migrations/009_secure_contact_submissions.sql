-- The historical contact table was omitted from the first commerce lockdown.
-- Keep it for the existing admin inbox, but make it service-role only.

drop policy if exists allow_all_contact_submissions on public.contact_submissions;
alter table public.contact_submissions enable row level security;
revoke all on table public.contact_submissions from public, anon, authenticated;
grant all on table public.contact_submissions to service_role;
