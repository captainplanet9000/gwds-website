begin;
create table if not exists control.host_telemetry (
 host text primary key references control.host_registry(host),
 observed_at timestamptz not null default now(),
 metrics jsonb not null check (jsonb_typeof(metrics) = 'object')
);
alter table control.host_telemetry enable row level security;
alter table control.host_telemetry force row level security;
revoke all on control.host_telemetry from public, anon, authenticated;
grant select on control.host_telemetry to service_role;
comment on table control.host_telemetry is 'Host-local collector writes allowlisted metrics. Admin API reads with service role; no customer access.';
notify pgrst, 'reload schema';
commit;
