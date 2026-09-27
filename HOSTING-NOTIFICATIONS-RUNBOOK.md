# Hosting notification operations

## Deployed service

Production website deployment: `dpl_9GJ4hNsQfuSPKGPizXAW375C32WU`, promoted on 2026-09-27 UTC.

The primary host runs `cival-hosting-notifications.timer` every five minutes. Its oneshot service calls the authenticated production queue endpoint. The root-only credential file is `/etc/cival/hosting-notification-cron.json`; never print it, put it in command arguments, or commit it. Keep this credential synchronized if the website CRON_SECRET changes.

Inspect service results with `systemctl status cival-hosting-notifications.timer` and `journalctl -u cival-hosting-notifications.service`. Output contains counts and HTTP codes, not recipient content or credentials. A successful HTTP response does not mean every email was delivered: check the admin notification table.

## Delivery and recovery

Admin → Notifications shows provider submission separately from delivery. The queue freezes message content on the first send and reuses a stable provider idempotency key. A two-minute lease excludes concurrent workers. Retry attempts are bounded with backoff. Older uncertain attempts and stale unsent notices stop for review before the provider's 24-hour deduplication window can be exceeded.

The provider status poll rotates through unresolved submissions. Bounced, complained, failed and suppressed messages require operator review. Do not repeatedly send to a bounced or suppressed address.

For a stale activation notice, inspect the customer's current subscription and instance first. Do not reset the old row or blindly clear its review flag. If the customer still needs an update, use a new notification with a new deduplication identity and accurate current-state copy after resolving the recipient/problem. Keep the old record as evidence. A provider-accepted but locally uncertain send must first be reconciled against the provider record before any new send.

## Evidence and limitations

- 126 storefront tests, strict typecheck and production build passed. Full lint completed with zero errors and 145 existing warnings.
- `scripts/test-hosting-notification-lease.mjs` verifies eight-worker exclusion, expired-lease recovery, frozen payload, stale-worker refusal, review after the deduplication window, and browser-role denial in a disposable PostgreSQL database.
- Initial production execution: processed 1, checked 9, failures 0. Readback: eight delivered, one bounced/review, one stale pending/review. No stale activation notice was sent.
- Migration: `20260927034759_durable_hosting_notifications.sql`, SHA-256 `912c88159c55cdb9c39d95795f7314d9abb48e4bfd44c23979ec1dd4582850ee`.
- Pre-migration outbox backup: `/var/backups/cival/notifications-before-20260927T0357.sql`.
- Public store/catalog returned 200; unauthenticated admin and cron endpoints returned 401.
- The active browser customer account is not an administrator. Authenticated admin visual acceptance remains outstanding.

This covers hosting notifications only. It does not prove every verification, purchase, refund or support email journey, public host failover, 100-dashboard capacity, customer-signed funding, or trading lifecycle acceptance. Source checkout holds and tenant entry controls were not lifted by this deployment.

## Rollback

Previous website deployment: `cival-systems-store-603lfqin1-civals-projects.vercel.app` (`dpl_AG6pmrqj9kNyPPxXP27adshyw6yJ`). If rolling back the website, stop the notification timer first. The database migration is additive; preserve all notification records and prepared message payloads. Do not restore the old outbox over newer sends, which would lose deduplication evidence.
