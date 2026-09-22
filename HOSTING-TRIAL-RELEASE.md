# Solo trial and customer journey — 19 September 2026

## Shipped behavior

- `/hosted` describes managed hosting, paid Solo/Desk/Fund capacity and a card-required seven-day Solo trial. Solo remains $29/month; Desk $79/month; Fund $199/month.
- The retired Paper plan is inactive in the production database. Existing subscription records were not removed.
- The checkout server grants a trial only to Solo customers with no prior Stripe-linked hosting subscription for their user ID or email. Abandoned checkouts do not consume eligibility. The client cannot select its own trial duration.
- Stripe Checkout collects a card. Missing-payment-method trial behavior is cancellation. Customers accept recurring-billing terms and can use the existing billing portal to cancel or update cards.
- The account displays the trial deadline, renewal amount, cancellation state and provisioning status. Pending checkout can be resumed or expired before choosing another plan.
- Account creation, verification links, magic links and Google OAuth retain an allowlisted customer destination. The production auth service allows the exact hosting, instance, funding and checkout return URLs for the production and pilot domains. Its post-change health check passed.
- The production Stripe webhook now includes `customer.subscription.trial_will_end`. Reminder handling retrieves current subscription state, skips canceled/ended trials, and deduplicates notification records. Email delivery uses each notification ID as the provider idempotency key.
- Onboarding enforces plan agent capacity on the server. Saved onboarding preferences are explicitly distinguished from current network/trading state, with a link to workspace, wallet and agents.
- All 24 screenshot assets are genuine 3,832-pixel-wide captures from the customer testnet or labeled public demo. Full-page detail captures retain their longer height. The gallery viewer loads the original asset.

## Verification

- 106 tests pass, covering trial eligibility, required card collection, wrong-mode prices, terms, checkout ownership/recovery, reminder state checks, onboarding limits, redirect safety and image integrity.
- Production build and TypeScript check pass. Targeted ESLint passed for the hosted page, new recovery endpoint, checkout/onboarding endpoints, redirect helper and gallery.
- Stripe test clock: 604,800-second trial converted to an active subscription with a paid 2,900-cent invoice. A separate no-card trial canceled. Scheduled cancellation was accepted. Test fixtures were removed/deactivated. Evidence: `release-assets/verification/solo-trial-stripe.json`.
- Live-mode integration: a temporary verified QA account created a Solo Checkout session through the deployed route. Required-card collection, seven-day metadata, owner-scoped resume and cancellation were verified. The session was expired, no payment submitted, and QA auth account deleted. Evidence: `release-assets/verification/solo-trial-live-checkout.json`.
- Browser: desktop and 390px mobile hosted page, signup destination, and existing customer's active/healthy hosting account. No horizontal overflow on the mobile page.
- All 24 published image URLs returned successfully and decoded at 3,832px width.

## Explicit remaining acceptance boundaries

This release does not claim that a newly paid/trial customer has completed a fresh end-to-end provisioning, wallet approval, strategy entry and managed exit through the final runtime. The existing customer workspace is operational on testnet, but its dashboard still shows failed attempts and metrics with inconsistent scopes; those require a separate runtime reconciliation.

No real card was charged, no real funds were transferred, and no trading/network controls were changed during this release. The trial reminder is configured and unit tested; arrival in a real recipient's mailbox was not tested.

The eight downloadable source products remain held by their release-readiness gates. Core still has 74 known compiler diagnostics and 23 schema gaps in the release candidate; candidate strategy improvements have not replaced customer ZIPs. See `STORE-RELEASE-ACCEPTANCE.md` and `PRODUCT-SCREENSHOT-AUDIT.md`. A successful hosting checkout or a screenshot gallery is not evidence that those archives are ready.

## Operational changes and rollback

- Initial trial deployment: `dpl_9LtPPVRvMh4etoKfoFryctQR6ozz`, commit `9c6ab35`.
- Account-copy/email-idempotency follow-up: commit `c3cfe99`, deployment `dpl_9iRsAjqCJMkvgWQoNUmynpFtdRuh`, promoted and browser-verified on www.civalsystems.com.
- Previous storefront deployment before this trial release: `dpl_FVT6PzZNgv6535VXXDbYzPnjwnW7`.
- Supabase auth config backup on the host: `/opt/cival/supabase/.env.before-solo-trial-20260919` (mode 0600). Only eight exact return URLs were appended. Recreated only the `auth` service.
- Stripe endpoint `we_1U6fUgLLyk0oaesNuymN6cPp` retained its existing events and added the trial reminder event.
- Do not re-enable the retired free plan or remove active customer subscriptions as part of rollback. Disable new hosting sales if a critical checkout/provisioning issue is discovered; preserve billing cancellation access.
