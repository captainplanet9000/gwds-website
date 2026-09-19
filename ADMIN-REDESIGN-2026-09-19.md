# Admin interface refresh — 2026-09-19

## Implementation
Ant Design 6 replaces the custom admin shell and supplies the overview, audit log and server monitoring components. Its Next.js registry provides server-rendered component styles. Existing API authorization and operational commands remain in place.

The shared admin design uses white surfaces, slate typography and blue actions. Status colors are reserved for operational meaning. Legacy commerce, hosting, access, support and subscriber screens inherit the same typography, tables and controls. Storefront settings no longer embeds the developer theme playground; saved appearance and announcement controls remain available.

Audit activity has server-side filters, pagination and a record-details drawer. Stripe and email records have separate tabs. Errors retain previous data with an explicit warning. Mobile navigation uses a drawer; wide tables scroll within their cards.

During verification, Orders incorrectly treated `paid` records as pending. It now uses the same paid-order predicate as the overview, with explicit pending/cancelled/expired/refunded filters. Product management uses consistent line icons instead of corrupted catalog emoji.

## Validation
- Production build and TypeScript passed; 93 routes generated.
- 113 tests passed across 22 files, including existing reporting tests.
- Targeted lint of the new shell, overview, servers and audit components passed after the audit loading-state correction.
- Live browser: overview, audit records, details drawer, action filtering (6 matching failed-login records), reset, Stripe events and email records verified.
- Live server page showed current host telemetry, service status, and backup job result.
- Phone viewport 390 × 844: audit, server and order pages had no document-level horizontal overflow; navigation drawer opened and routed to Servers.
- Catalog, Hosting, Orders and Settings visually inspected. No captured console errors in the reviewed session.

## Scope
This is an admin presentation and usability release, not a certification of trading performance or overall launch readiness. UI verification did not submit refunds, change customer subscriptions, send emails, or change trading controls. Operational status remains driven by existing APIs.

## Framework references
- https://ant.design/docs/react/use-with-next/
- https://ant.design/components/table/
- https://ant.design/docs/react/customize-theme/
