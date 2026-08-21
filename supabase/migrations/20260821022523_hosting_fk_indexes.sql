-- Cover every managed-hosting foreign key used by lifecycle joins and deletes.
create index if not exists hosting_audit_subscription on public.hosting_audit(subscription_id);
create index if not exists hosting_credentials_user on public.hosting_credentials(user_id);
create index if not exists hosting_incidents_user on public.hosting_incidents(user_id);
create index if not exists hosting_instances_plan on public.hosting_instances(plan_id);
create index if not exists hosting_notifications_subscription on public.hosting_notifications(subscription_id);
create index if not exists hosting_plans_product on public.hosting_plans(included_product_id);
create index if not exists hosting_tasks_instance on public.hosting_provisioning_tasks(instance_id);
create index if not exists hosting_subscriptions_plan on public.hosting_subscriptions(plan_id);
