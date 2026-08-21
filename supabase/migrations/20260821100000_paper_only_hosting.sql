-- Paper-only launch hardening. The supported service never accepts customer
-- exchange, wallet, or provider secrets.

update public.hosting_onboarding
set environment = 'paper', account_address = null, updated_at = now()
where environment <> 'paper' or account_address is not null;

update public.hosting_provisioning_tasks
set task_type = 'configure_workspace', updated_at = now()
where task_type = 'configure_secrets';

alter table public.hosting_provisioning_tasks
  drop constraint if exists hosting_provisioning_tasks_task_type_check;

alter table public.hosting_provisioning_tasks
  add constraint hosting_provisioning_tasks_task_type_check check (task_type in (
    'review','create_project','create_database','configure_workspace','deploy','health_check',
    'backup_check','recovery_test','suspend','resume','decommission','custom'
  ));

drop table if exists public.hosting_credentials;
