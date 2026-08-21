-- Database-backed administrative membership. Admin access is granted by the
-- server only after Supabase has validated a user session at AAL2 (TOTP MFA).

create table if not exists public.admin_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'operator', 'support', 'auditor')),
  enabled boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_members_enabled_role_idx
  on public.admin_members (enabled, role);

alter table public.admin_members enable row level security;
revoke all on table public.admin_members from anon, authenticated;
grant all on table public.admin_members to service_role;

comment on table public.admin_members is
  'Server-only RBAC membership for the Cival operations console; interactive access also requires Supabase AAL2.';
