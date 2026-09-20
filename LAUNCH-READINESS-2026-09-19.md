# Launch audit — 19 September 2026

## Decision

**Not approved for an unrestricted commercial launch.** The storefront and the existing hosted pilot are operating, but a working website is not proof that every paid product is deployable or that every trading and recovery path has passed acceptance. Source sales remain deliberately blocked. Hosting admissions are capacity-limited; this audit does not authorize a mainnet switch.

## Completed in this audit

| Area | Evidence / change | Practical limit |
|---|---|---|
| Public website | All 21 sitemap URLs returned HTTP 200 | HTTP reachability does not exercise every form or every visual state |
| Storefront build | Production build, including TypeScript, passed | Separate downloadable Core runtime still has its own blockers |
| Automated checks | 113 tests passed; dependency audit reported zero known vulnerabilities | Not a penetration test or profitability test |
| Protected APIs | Anonymous requests to admin servers/audit/orders/settings and account instance/orders/hosting return 401 | Cross-account testing is a separate requirement |
| Host telemetry | Installed a one-minute AWS collector and protected `control.host_telemetry` table; service-role read succeeds, anonymous read denied | Single current host, latest snapshot only; not an external alerting service |
| Admin server UI | Live memory, disk, CPU load, service/container status, backup result, timestamps, stale-data warnings and provider console links | Console links require AWS/Vercel authorization; SSM enrollment is not established by a running agent |
| Audit UI | Fixed nonexistent Stripe/email column queries; verified live records render; added live/test labels and failure states | An email marked sent is not evidence of inbox delivery |
| Hosting revenue | Excludes trial and test-mode subscriptions from live active plan value | Plan value is not collected cash or accounting revenue |
| Store settings | Effective source-sales status respects the release hold; writes limited to owner/operator | Some public page copy still lives in version-controlled source |
| Stripe | Live charges/payouts enabled; support/branding configured; active store prices inspected | No new paid transaction executed in this audit |
| Billing copy | Corrected live Stripe names/descriptions for VWAP and Sentiment Proxy Research to match their actual scope | Price amounts and subscription terms unchanged |
| Backup integrity | All four files in the latest daily backup match SHA-256/size; PostgreSQL archive table of contents readable | Isolated PostgreSQL restore passed; complete host/application recovery remains outstanding |

Production admin release: `dpl_7vhuWWmvP6L22qBHT31CVj7u3S4v`. Mobile verification at 390 px confirmed the admin no longer expands beyond the viewport; wide tables remain internally scrollable. The telemetry migration has been applied to the actual self-hosted production database. Collector service and timer are enabled on cloud-01.

## Host condition at inspection

cloud-01 has 2 CPU cores and approximately 8 GB RAM. Memory use was about 44%, disk use 24.8%, with 115.7 GB free. Core services were active. Three tenant containers were running. These are point-in-time observations, not capacity benchmarks or a trading-success claim.

The configured admission cap is five tenants with three assigned: **two available slots at inspection**. Do not run a broad acquisition campaign against this capacity without measured load testing and additional placement capacity. Do not increase the limit just to make checkout available.

Latest verified daily backup: `20260919T081520Z`. AWS inspection found that only the old stopped host had automatic snapshots enabled. This audit enabled daily 09:00 UTC snapshots on `cival-cloud-01-production-v2` and requested `cival-production-v2-launch-20260919`. Its completion is recorded below; configuration alone is not a restore test. Backups contain sensitive data and must remain private.

## Remaining launch gates

1. **Source release acceptance (blocking source sales):** A fresh strict typecheck in this audit still reports 74 Core compiler diagnostics. The prior schema inventory also records 23 referenced-but-undefined tables. Complete clean Windows/Linux installs, empty-database setup, owner isolation, the exact plugin loader, and independent Trader validation. See `STORE-RELEASE-ACCEPTANCE.md`; the compiler count was rechecked; the schema gap count is the prior recorded inventory.
2. **Trading acceptance (blocking broad automation/mainnet claims):** Record complete open/protect/manage/close cycles on the final tenant runtime, partial fills, cancellation failures, stale data, restart reconciliation and emergency controls. A running container is not this evidence. Never manufacture a trade just for marketing.
3. **Payment-to-service acceptance:** Run an isolated Stripe test journey through verified signup, eligible/ineligible trial, payment failure, checkout abandonment, duplicate/out-of-order webhooks, provisioning retry, cancellation, refund, entitlement revocation and account isolation. The existing production store order is a $0.50 fulfillment test, not normal-volume evidence.
4. **Disaster recovery:** Isolated database restore now passes. Finish the full host/application restore from the independent snapshot; compare critical records and tenant configuration; measure recovery time and data loss. Keep the restored environment disconnected from live venues and email delivery.
5. **External alert delivery:** The current host has CPU, status-check and burst-capacity alarms in OK state, with notifications enabled and a Valid email contact. Confirm actual delivery with a controlled notification test. The historical SNS confirmation and an active alarm configuration do not prove present delivery. Add collector-staleness, backup-age, disk, memory, endpoint and provisioning-failure alerts with an operator escalation path.
6. **Scale:** Load-test shared data fan-out, tenant CPU/RAM, queue backlogs and API limits; validate placement on a second host and exhaustion behavior. The current admin shows admission capacity, not autoscaling assurance.
7. **Funding/withdrawal:** Dedicated security and UX acceptance of chain, asset, address, signing permissions, transaction states, rejection, reconciliation and customer isolation before broad real-fund use.
8. **Email:** Verify actual inbox delivery for verification, reset, purchase, provisioning, trial reminder, payment failure and cancellation. Inspect sender authentication and bounce handling. Do not count `sent` as `delivered`.
9. **Release operations:** Finish the hosted runtime's standard immutable CI deploy path and rollback drill. Storefront build success does not resolve a legacy direct-SSH runtime deployment failure.
10. **Admin completeness:** Existing customer, order, product, coupon, entitlement, refund, audit and tenant controls are present. Arbitrary server shells are intentionally accessed through authenticated infrastructure consoles. A fully integrated infrastructure control plane, all business-copy editing, historical monitoring and every recovery action are not implemented by this audit.

## Operator runbook

Use `/admin/servers` for measured host status and `/admin/hosting` for admission capacity, tenant commands, tasks and incidents. Treat stale telemetry, failed collection or unknown status as requiring investigation. A queued command is not completed until its recorded result confirms it.

Use AWS Lightsail browser SSH for terminal access. AWS returned no registered Session Manager instances in us-east-2; the installed SSM process alone does not enable that path. Use Vercel for deployment/function logs. Never put an unrestricted command executor or persistent infrastructure credentials in the storefront client. Record actions and preserve recovery artifacts before maintenance. Stopping a process does not close venue positions.

For an incident: pause new admissions if needed; identify affected tenants; publish a factual incident through Hosting Ops; investigate provider and tenant logs; reconcile actual venue state after recovery; close the incident only after the customer path is verified. Do not expose logs containing secrets or customer balances in public marketing.

## Campaign decision

`campaigns/2026-09-launch` contains 100 drafts, images, UTM links, publication gates and a rollout plan. Nothing was posted, emailed or scheduled. Educational promotion can explain the product honestly. Hosting conversion posts require the hosting gates and capacity review; source-product conversion remains held until artifact acceptance. Do not call the business “100% production ready” based on this report.

## Research references

- [AWS Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html): authenticated managed shell access.
- [Session logging](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-logging.html): auditability and provider-supported session records.
- [CloudWatch alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Alarms.html): alarm state and notification configuration.
- [CloudWatch agent metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/metrics-collected-by-CloudWatch-agent.html): memory/disk and host metrics for external monitoring.

These sources informed the infrastructure-console approach. They do not establish that every AWS feature is configured in this account.

## Additional billing verification

All three active hosting plans have matching active live recurring Stripe prices: Solo $29/month, Desk $79/month and Fund $199/month. The API independently checks amount, currency, interval and live mode before checkout. No checkout was charged by this verification.

## Recovery drill result

Restored the latest `postgres.dump` into a new container using the exact running PostgreSQL image (`supabase/postgres:17.6.1.136`). The container had no network, no published ports, no production volumes and constrained CPU/memory. The initial restore identified a required `pg_net` preload. With that prerequisite included, a clean repeat finished in 121 seconds with exit code 0 and no restore errors. Readable restored records included 19 orders, five tenants and 12 auth users. These are backup-time records; they are not asserted to equal later live counts.

The disposable container was removed after verification. `scripts/verify-isolated-restore.py` preserves the procedure. Private output is retained on the server under `/var/backups/cival/restore-audit-20260919.*`. This is a database restore drill, not a full-host recovery test, a measured production RTO or proof of trading reconciliation.

## Snapshot state at handoff

The current production host now has AutoSnapshot Enabled at 09:00 UTC. Manual snapshot `cival-production-v2-launch-20260919` was still pending at the latest check; do not mark that copy complete until AWS reports available. Existing available snapshots belong to the old host and predate this audit.

## Follow-up verification — 20 September 2026 UTC

AWS now reports `cival-production-v2-launch-20260919` **available**, with source
`cival-cloud-01-production-v2`. The CLI account and instance public IP were checked
against the actual host before changing configuration.

The production host returned no failed systemd units. Three tenant containers and
the Supabase services were running; disk usage was 25%, memory available about
4.4 GB, and the backup/telemetry timers were scheduled. These are fresh operational
observations, not load-test or trade-lifecycle acceptance.

The Lightsail Email contact is `Valid`. `TestAlarm` for the production CPU alarm
returned `Succeeded`; inbox delivery is not yet independently confirmed. Disabled
notifications on the three alarms targeting the retired, stopped `cival-cloud-01`
instance, including its noisy status-check ALARM. The production-v2 alarms remain
enabled. The prior alarm configuration was saved privately before modification.

The completed snapshot does not yet constitute a full-host recovery drill. Do not
boot a snapshot clone with trading containers enabled: it could duplicate execution.

## Deployed follow-up — 20 September 2026 UTC

- Created clean recovery host `cival-cloud-02` (`3.151.88.151`), 8 GB Lightsail,
  $44/month bundle. Firewall active; admissions disabled; no customer workloads.
- Copied the verified backup into a private, encrypted, versioned S3 bucket and
  restored both databases and 671 persistent files on the new host. Payload SHA-256
  and sizes matched. Restore took 53 seconds after download. Restored 19 orders,
  5 tenant records and 12 auth users. No production trading process was started.
- Installed automatic daily offsite backup on production, verified its first run,
  and enabled its timer. The backup identity can upload but cannot read/delete
  objects. CloudWatch backup alarm is OK. **Its separate operations SNS email
  subscription remains PendingConfirmation**; the user was asked to confirm it.
- Hosting test run: 690 passed, no skips. Core: 27 unit tests, strict typecheck,
  configured build and real 35-table isolation/paper-ledger integrations pass.
  The referenced-table gaps are resolved. Core remains an unpublished candidate.
- Fixed stale Stripe subscription webhook handling by retrieving current Stripe
  state before issuing tenant lifecycle commands. Added regression tests for late
  active/past-due events and API unavailability. Storefront: 116 tests, typecheck and
  production build pass. Commit `c3e295a` deployed as
  `dpl_HovhVGAXKEUH6wecJ19ULpBCtcyt`, aliased to civalsystems.com. Home, store and
  hosted pages returned 200; unsigned webhook request returned 400.

The AWS operations scripts/runbook are committed in hosting as `a9132e3`.
Independent database/file recovery is verified, but full application recovery,
fencing, placement/load acceptance, real test-mode purchase journeys, funding,
email inbox verification and complete final-runtime trading remain open. These
facts supersede earlier compiler/table counts and snapshot-pending observations;
they do not remove the launch gates.

Later in the same follow-up, isolated cold-start/restart checks passed on the
recovery host using the exact production image: health, tenant-header enforcement,
empty provider keys, upstream auth rejection, scheduler auth, and persisted
halt-new-trades after restart. Cold start was 7.75 seconds and idle memory 262.7 MiB.
The fixture had no customer keys or external network access; all fixture containers
were removed. This is not yet a complete restored-database application failover.

Refund handling now fetches current charge totals for delayed refund events and
does not reactivate a fully refunded order after a won dispute. Commit `7f516b1`
is live as `dpl_8y6DwNPhhuHFTFgM7wCZVKt8HU6f`; 118 storefront tests pass. Both billing
fix commits are pushed to the existing customer-flow branch.


## Runtime deployment and remaining execution gate — 20 September UTC

The immutable hosted repair `03d8a1e` is deployed to all three active workspaces.
Image SHA-256: `670e461219ef5d2a6c0a9fa05b3b514f3d1c90fac0b147157b28acc3e9cd7554`.
The host command queue recorded graceful stops; the reconciler restarted all three.
Explicit start commands raced the reconciler and were refused as already claimed;
subsequent Docker and control-plane checks verified all three running on the new
image. Both local and control-plane new-entry halts remain enabled.

The pilot ownership query incorrectly excluded closed fill records and calculated
0.139 BNB owned exposure instead of the actual 0.312 short. Verified venue entry
IDs and two historical partial-close fill IDs were repaired in the tenant ledger.
The deployed status API now attributes 0.312 BNB to the agent and does not claim
ETH, AVAX or SUI. Full-size reduce-only stop/target coverage was verified at the
existing prices before obsolete exact order IDs were canceled. No position was
closed by this repair. This is position/protection reconciliation, not a completed
trade lifecycle or permission to clear the new-entry halt.

Follow-up guardian fixes passed 17 targeted tests and were pushed as `87dace6`;
their image build is in progress. They reject failed venue snapshots, preserve
existing protection during replacement, request only missing protection types,
and flag duplicates for exact-order reconciliation instead of canceling the coin.

Core passed fresh Linux npm installation, 27 tests, strict TypeScript and build,
plus repeated Windows checks after dependency fixes. Production dependency audit:
0 critical, 0 high, 5 moderate, 13 low. Remaining findings are SDK dependencies;
this is not a claim of vulnerability-free software. Core remains unpublished.
The separate operations SNS subscription still needs recipient confirmation;
one confirmation email was resent. Lightsail's own contact remains valid.


The recovery acceptance now includes the real dashboard reading its restored
PostgreSQL data through pinned PostgREST. Tenant-scoped agent reads, empty
cross-tenant reads, mismatched header rejection and persistent halt after restart
passed in an isolated clean run (70.84 seconds including restore, excluding image
download). No customer signing keys, public ports or external network access.
Procedure is committed in hosting `e48d6d4`. Public failover, execution fencing,
exchange reconciliation and loaded multi-host placement remain unverified.

Core bootstrap upgrade plus repeated application passed against the dedicated
acceptance database: 35 tables, 5 recorded schema/migration steps. This resolves
the repeated-installer check, not the whole customer setup journey.

### Execution work still required before broad automation

- Persist an entry intent and client order ID before exchange submission; reconcile
  ambiguous network responses before any retry. A saved row after acknowledgement
  does not cover a crash between venue acceptance and database persistence.
- Implement hosted pending-entry reconciliation and partial-fill/cancel races.
  The separate Core candidate contains helpers, but those are not evidence that
  the hosted scheduler runs them.
- Replace the agent-card positions endpoint's historical latest-trader/5% heuristic
  and execution-thought fallback with the same reconciled ownership ledger.
  It currently queries only 500 entry-like rows and can misattribute old exposure.
- Verify all alternate close, emergency, DCA, protection and maker paths against
  agent ownership; no coin-wide cancellation or inferred fill/P&L may substitute
  for matched venue order and fill evidence.
- Prove the final runtime's open -> protect -> manage -> close -> reconcile cycle,
  including restart and duplicate delivery, before clearing the pilot entry halt.

Remaining business acceptance: actual isolated Stripe test-mode checkout through
fulfillment/provisioning and cancellation/refund recovery; delivered onboarding
and billing email; customer funding/withdrawal rejection and reconciliation;
public failover and execution fencing; loaded capacity/placement; exact install
and plugin acceptance for each source product. Existing mocked/unit tests do not
replace those journeys. Source downloads remain held.

## Latest deployed state — 20 September 2026, 02:38 UTC

Guardian follow-up `87dace6e6f45b9c121599088ab1b7653648a9fac` is now running in all
three active hosted workspaces, image
`sha256:66b0830ae72c0b084c72438ae1865886c359e9dfe6f49fe29b85ebc74d020fe3`.
Build, dependency policy, CI isolation tests and the exact-image AWS smoke passed.
Fresh venue verification still showed exactly one reduce-only stop and one target,
both 0.312 BNB. The runtime ownership response matched the -0.312 BNB venue position.
The pilot's local halt is true and control-plane halt is true at state version 8;
the recorded reason now identifies the remaining submission/lifecycle gates.
No mainnet operation or position closure was performed by this repair.

The source archive remains private. Storefront billing fixes are live. Public
HTTPS checks passed; the dashboard refused an unauthenticated request with 401.
This update supersedes the earlier follow-up-image-building note.
