-- Adds the notification template used to alert operations when a paid hosting subscription's
-- tenant provisioning fails after payment succeeded. Payment succeeding and provisioning failing
-- is "a customer who paid for nothing" — this must never be a silent state, so a cron watcher
-- (src/app/api/cron/hosting-provision-watch) enqueues one of these per failed provisioning command
-- (deduplicated by command id) addressed to the operations alert address. See
-- C:/GWDS/hosting/db/migrations/0016_hosting_provision_failures.sql for the read side.

alter table public.hosting_notifications
  drop constraint hosting_notifications_template_check;

alter table public.hosting_notifications
  add constraint hosting_notifications_template_check
  check (template in (
    'hosting_started','hosting_payment_failed','hosting_canceled','hosting_activated',
    'hosting_incident','hosting_provisioning_failed'
  ));
