# Cival Systems Store

The Next.js storefront and managed-hosting control plane for Cival Systems. It includes the Claude-designed customer experience, Supabase accounts and entitlements, Stripe Checkout and subscriptions, signed webhook fulfillment, private downloads, hosted onboarding and tenant lifecycle, credential encryption, runtime operations, email delivery, legal consent, refunds, contacts, newsletter management, and a server-authenticated admin area.

## Safety state

Source sales and hosted subscriptions use separate gates: `NEXT_PUBLIC_STORE_SALES_ENABLED` and `NEXT_PUBLIC_HOSTING_SALES_ENABLED`. Neither flag is the only security boundary. Store checkout also verifies the catalog and release artifact. Hosting checkout also verifies plan readiness, recurring Stripe price configuration, verified identity, legal acceptance, and the one-open-subscription rule. If any check fails, no Stripe Checkout Session is created.

Do not enable sales until every item in [LAUNCH_RUNBOOK.md](./LAUNCH_RUNBOOK.md) passes.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Stripe Checkout and signed webhooks
- Supabase Auth, Postgres, Row Level Security, and private Storage
- Resend transactional email
- Vercel deployment and environment management
- Vitest and ESLint

## Local development

Use Node.js 20 or newer.

```bash
npm ci
npm run dev
```

Required environment variable names are:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_STORE_SALES_ENABLED
NEXT_PUBLIC_HOSTING_SALES_ENABLED
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
RESEND_FROM_EMAIL
SUPPORT_EMAIL
GWDS_ADMIN_PASSWORD
GWDS_ADMIN_SESSION_SECRET
CIVAL_RATE_LIMIT_SECRET
NEWSLETTER_SIGNING_SECRET
HOSTING_CREDENTIAL_MASTER_KEY
HOSTING_CREDENTIAL_KEY_VERSION
```

Never commit `.env*`, product archives, service-role keys, webhook secrets, customer data, or live exchange/API credentials.

## Database

For a clean Supabase project, apply `src/migrations/001_initial_schema.sql` through `012_public_api_lockdown.sql`, followed by the timestamped migrations in `supabase/migrations`. `supabase-schema.sql` is intentionally non-executable because the historical all-in-one schema contained an unsafe public download policy.

Commerce writes occur through service-only Postgres functions. Customers can only read rows owned by their verified Supabase user ID. Download tokens are random, stored as SHA-256 hashes, short lived, revocable, and consumed atomically.

Hosting uses owner-scoped subscriptions, onboarding and instance records plus service-only credential, provisioning and operator records. Credentials are encrypted with AES-256-GCM using a versioned server-only master key and are never returned by customer or admin APIs. Every sensitive lifecycle action is appended to `hosting_audit`.

## Managed-hosting flow

1. An operator configures recurring Stripe products/prices, then explicitly opens a plan's database launch gate.
2. A verified customer accepts all service/legal versions and enters Stripe subscription Checkout.
3. Signed webhooks bind the Stripe customer/subscription, create onboarding, queue a tenant instance and create the first provisioning task idempotently.
4. The customer submits paper/live intent, public account address, agents and risk limits. They never submit a seed phrase or main wallet key.
5. A dedicated API-wallet secret is envelope-encrypted and queued for verification. Ciphertext is never displayed again.
6. Operators review onboarding, provision isolated provider/database resources, deploy a versioned release, test health, backup and recovery, then activate the tenant.
7. Stripe subscription events suspend service on unpaid/canceled states. The customer manages invoices, payment methods and cancellation in the Stripe portal.
8. Health, usage, incidents, credentials, provisioning tasks and the audit trail are managed under `/admin/hosting`; customers see their service under `/account/hosting`.

## Payment and fulfillment flow

1. A verified customer accepts the current Terms, Refund Policy, and Trading Disclaimer.
2. The API validates catalog, dependencies, artifact readiness, Storage access, and live/test Stripe price consistency.
3. Postgres creates the pending order and immutable item snapshot atomically.
4. Stripe Checkout receives the internal order and user IDs in server-authored metadata.
5. A signature-verified webhook validates mode, customer, total, session, and items before idempotent fulfillment.
6. The account receives entitlements; email links back to the account instead of exposing download tokens.
7. The customer requests a short-lived signed download. Refunds and lost disputes revoke access.

## Verification

```bash
npm test -- --run
npx tsc --noEmit
npm run lint
npm run build
npm audit
```

The release gate requires all tests, TypeScript, and the production build to pass; audit findings and lint warnings must be reviewed before activation.

## Deployment

Preview deployments are safe with both sales flags disabled. Store and hosting activation are separate decisions and require their respective acceptance suites. See [LAUNCH_RUNBOOK.md](./LAUNCH_RUNBOOK.md).
