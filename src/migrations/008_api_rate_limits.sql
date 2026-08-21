-- Small database-backed limiter for public forms and authentication endpoints.

create table if not exists public.api_rate_limits (
  bucket text not null,
  key_hash text not null,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 1,
  updated_at timestamptz not null default now(),
  primary key (bucket, key_hash)
);

alter table public.api_rate_limits enable row level security;
revoke all on table public.api_rate_limits from public, anon, authenticated;
grant all on table public.api_rate_limits to service_role;

create or replace function public.consume_api_rate_limit(
  p_bucket text,
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
begin
  if p_bucket is null or p_key_hash is null or p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  insert into public.api_rate_limits (bucket, key_hash, window_started_at, request_count, updated_at)
  values (p_bucket, p_key_hash, now(), 1, now())
  on conflict (bucket, key_hash) do update
  set request_count = case
        when public.api_rate_limits.window_started_at <= now() - make_interval(secs => p_window_seconds) then 1
        else public.api_rate_limits.request_count + 1
      end,
      window_started_at = case
        when public.api_rate_limits.window_started_at <= now() - make_interval(secs => p_window_seconds) then now()
        else public.api_rate_limits.window_started_at
      end,
      updated_at = now()
  returning request_count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_api_rate_limit(text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_api_rate_limit(text,text,integer,integer) to service_role;
