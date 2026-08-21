# Cival Systems operations runbook

This runbook applies to the storefront, digital fulfillment, customer accounts, and managed paper workspaces. It does not create an uptime or response-time SLA.

## Daily queue

1. Review Stripe webhook delivery, failed payments, refunds, disputes, and payout alerts.
2. Review the admin orders, support, refund, hosting-task, incident, and email-outbox queues.
3. Confirm the public storefront, sign-in, contact form, status page, Core demo, and private artifact download health.
4. Confirm every active managed workspace reports paper mode, `liveTradingEnabled=false`, healthy tenant isolation, and a recent validated backup.
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
- For disputes, preserve evidence, avoid contacting the bank directly, and keep access revoked while the dispute state requires it.

## Incident severity

- **Critical:** security compromise, cross-tenant access, payment/fulfillment corruption, or any path capable of live execution. Disable the affected sales gate immediately.
- **Major:** widespread auth, checkout, download, or workspace outage. Post a customer-safe incident and stop new affected sales.
- **Minor:** degraded non-critical feature with a safe workaround. Record and monitor it.
- **Info:** planned maintenance or a customer-visible update without impairment.

For every customer-visible incident, record start time, severity, current status, impact, mitigation, and resolution. Do not include customer identifiers, secrets, provider tokens, internal URLs, or exploit details on the public status page.

## Recovery

1. Disable the affected sales gate.
2. Preserve logs and database state; rotate exposed credentials before redeploying.
3. Restore from a validated backup into an isolated target.
4. Verify ownership, workspace hash, paper-only health response, and cross-tenant denial.
5. Record the recovery test time and result before returning an instance to `active`.
6. Communicate a factual customer-safe resolution and monitor for recurrence.

## Launch authority

Store sales and hosting sales are separate gates. Neither gate may be enabled because a build is green. Use `LAUNCH_RUNBOOK.md`, record the deployed commit and artifact hash, and require every relevant security, lifecycle, legal/tax, and recovery check to pass first.
