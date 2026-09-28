# Cival Systems operations runbook

This runbook applies to the storefront, digital fulfillment, customer accounts, and AWS-hosted dashboards. It does not create an uptime or response-time SLA. Read CURRENT-RELEASE-STATUS.md first: source-product sales, hosting admissions and each tenant's trading permissions are separate controls.

## Daily queue

1. Review Stripe webhook delivery, failed payments, refunds, disputes, and payout alerts.
2. Review the admin orders, support, refund, hosting-task, incident, and email-outbox queues.
3. Confirm the public storefront, sign-in, contact form, status page, Core demo, and private artifact download health.
4. Confirm each workspace's actual venue network, assigned host, scheduler heartbeat, entry permissions and outstanding order intents. The current owner pilot is testnet and explicitly unpaused; do not describe every tenant as paper-only or change other tenants' controls to match it. Verify tenant isolation and a recent validated backup.
5. Never ask a customer for an exchange key, wallet secret, seed phrase, or private key.

## Support handling

- Work oldest security, billing, fulfillment, and access requests first; then ordinary product questions.
- Verify account ownership before disclosing order, subscription, incident, or download details.
- Use the recorded order/subscription ID. Do not request full card data or credentials.
- Record the resolution and customer-visible summary in the system of record.
- The public site promises best-effort support only. Do not quote an SLA unless a signed order form supplies one.

## Refunds and disputes

- Review refund requests against the published policy and preserve the submitted reason and decision.
- Initiate approved refunds to the original payment method through Stripe.
- Verify the signed `charge.refunded` webhook updates order state and revokes the affected entitlement after a full refund.
- A partial source-product refund retains the active entitlement and download regeneration. A full refund must revoke both access and outstanding download tokens; a delayed success event must not restore them. Record the Stripe refund ID and application result separately.
- A hosting refund and subscription cancellation are separate actions. Inspect the subscription, customer request and workspace state; verify the required billing/lifecycle command actually completes. Do not infer cancellation from a refund or treat a queued command as a stopped runtime.
- For disputes, preserve evidence, avoid contacting the bank directly, and keep access revoked while the dispute state requires it.

## Incident severity

- **Critical:** security compromise, cross-tenant access, payment/fulfillment corruption, unauthorized execution or loss of execution authority. Stop new affected admissions and entries while preserving position protection and reconciliation wherever possible. Escalate unsafe exposure immediately; avoid stopping its only management process without an explicit recovery plan.
- **Major:** widespread auth, checkout, download, or workspace outage. Post a customer-safe incident and stop new affected sales.
- **Minor:** degraded non-critical feature with a safe workaround. Record and monitor it.
- **Info:** planned maintenance or a customer-visible update without impairment.

For every customer-visible incident, record start time, severity, current status, impact, mitigation, and resolution. Do not include customer identifiers, secrets, provider tokens, internal URLs, or exploit details on the public status page.

## Recovery

Hosted tenant execution is scheduled by the AWS host-scoped scheduler, not the
legacy Vercel provisioning worker. The primary also runs a five-minute hosting
notification timer; see HOSTING-NOTIFICATIONS-RUNBOOK.md. Check actual heartbeat,
cycle errors and command completion instead of treating an enabled unit as proof
of successful execution.

1. Disable the affected sales gate.
2. Preserve logs and database state; rotate exposed credentials before redeploying.
3. Restore from a validated backup into an isolated target.
4. Verify ownership, immutable image identity, network, cross-tenant denial, durable unresolved intents, position protection and reconciled balances. A health-200 response alone is only process liveness.
5. Record the recovery test time and result before returning an instance to `active`.
6. Communicate a factual customer-safe resolution and monitor for recurrence.

Never start a restored production tenant against a second writable database while
the original can still execute. Public failover requires old-host fencing,
one authoritative database, current credentials, routing/TLS verification and
reconciliation before entries. The recovery host has an installed but inactive
service release and a reboot-verified persistent disk; that is preparation, not
completed failover. Its /etc/cival/COMMISSIONED guard must not be created merely
to silence a failed service start.

## Capacity

The current AWS instance increase request remains open (case 179006243200988).
Do not raise hosting admissions to 100 based on the successful 100-reservation
database test. Admit only within commissioned, measured host capacity. A complete
capacity report must include simultaneous dashboards and agents, market-data
fan-out, scheduler delays, database load, memory/CPU, venue limits and recovery
headroom. Record resource costs and the tested workload with the measured limit.

## Launch authority

All eight source/UI/framework products are published under the owner's explicit
source-sale decision. Preserve their exact registered hashes and scope disclosures.
Hosting availability and mainnet execution are separate decisions; do not claim
unrestricted automation or 100-dashboard capacity from source publication. Record
the deployed commit, test evidence, remaining limitations and the owner's release
decision in CURRENT-RELEASE-STATUS.md.
