# Scheduled daily on Vercel

`vercel.json` runs this route once a day at 14:00 UTC (`0 14 * * *`), next to the existing
`/api/cron/hosting-provision` job at 07:00. Vercel sends `Authorization: Bearer $CRON_SECRET`, which
the route requires.

Each run does two things:

1. Queues one operator email per failed paid-signup provision (from
   `public.hosting_provision_failures()`), deduplicated by command id, sent to
   `HOSTING_OPS_ALERT_EMAIL` (or `SUPPORT_EMAIL`).
2. Drains the `public.hosting_notifications` outbox across all subscriptions (at most 25 messages per
   run), so customer emails whose inline delivery failed, or that the database queued with no
   request to send them, still go out.

It was previously left unscheduled on purpose. A `*/15 * * * *` schedule is rejected outright on
Vercel Hobby ("limited to daily cron jobs"), which failed the whole production deploy: every new
route 404'd while the previous build kept serving, so the failure looked like missing code rather
than a rejected config. Keep this schedule daily.

A daily check is a backstop, not real-time alerting. Detecting a stuck provision quickly is still
the host agent's job: it polls `control.tenant_commands` continuously and is the only process that
can act on a stuck provision. The host agent, or an operator, can also call this route on demand.

Vercel crons only fire on Vercel. A deployment of this code elsewhere (the self-hosted pilot) needs
its own daily caller, for example a systemd timer, sending the same bearer secret.
