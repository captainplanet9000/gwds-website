# Cival Systems Store

The Next.js storefront for Cival Systems source-code products. It includes the Claude-designed customer experience, Supabase accounts and entitlements, Stripe Checkout, signed webhook fulfillment, private short-lived downloads, email delivery, legal consent, refunds, contacts, newsletter management, and an authenticated admin area.

## Safety state

Sales are disabled unless `NEXT_PUBLIC_STORE_SALES_ENABLED=true`, but that flag is not the security boundary. The checkout API independently requires a verified account, exact database/Stripe price agreement, an active product, verified artifact metadata, and a working signed URL from the private `downloads` bucket. If any check fails, no Stripe Checkout Session is created.

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
```

Never commit `.env*`, product archives, service-role keys, webhook secrets, customer data, or live exchange/API credentials.

## Database

For a clean Supabase project, apply `src/migrations/001_initial_schema.sql` through the latest migration in numeric order. `supabase-schema.sql` is intentionally non-executable because the historical all-in-one schema contained an unsafe public download policy.

Commerce writes occur through service-only Postgres functions. Customers can only read rows owned by their verified Supabase user ID. Download tokens are random, stored as SHA-256 hashes, short lived, revocable, and consumed atomically.

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

Preview deployments are safe with sales disabled. Production activation is a separate step: verify canonical domain and webhook URLs, run a complete Stripe test-mode purchase and refund, confirm email and private downloads, then set `NEXT_PUBLIC_STORE_SALES_ENABLED=true` and redeploy. See [LAUNCH_RUNBOOK.md](./LAUNCH_RUNBOOK.md).
