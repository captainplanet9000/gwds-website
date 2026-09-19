# Product galleries — September 19, 2026

User-selected sources: the public demo at ai-trading-dashboard-demo.vercel.app and the operational customer testnet at cival-5215d0a6023745c4a9a3.dash.civalsystems.com. Captures are real browser screenshots, not generated UI or composited trading results. Raw JPEGs are retained. No trading, funding, withdrawal, or network-switch action was performed for photography.

The eight-product lineup remains Core with Darvas, Trader with Core and all six strategies, and six standalone plugins. Product-specific galleries include the matching agent, its full detail view, shared workflow screens, and separate hosted examples for editions. Source labels and captions distinguish the broader demo and managed runtime from the downloadable 2.1 archives. Hosted Renko is explicitly not represented as a plugin bundled with Trader.

## Demo fixes made before capture

- Normalize whole-percent sample win rates before the fractional renderer (67%, not 6700%).
- Map sample symbols, quantity, entry, mark and P&L to the detail renderer. Populate sample trade statuses, creation dates, decisions and allocations.
- Correct unreadable metric text and use an em dash for metrics absent from the fixture.
- Disable execution actions on demo agent detail and guard their handlers.
- Distinguish sample agent status from a failed realtime connection; use open-position P&L rather than lifetime P&L in the unrealized field.
- Add a persistent sample-data/edition disclosure.
- Replace stale plugin offers, prices, links, instant-install promises and unsupported terms with the current lineup and setup guide.

Demo code is in the isolated worktree C:\GWDS\demo-product-galleries, based on the exact previously deployed commit. Its legacy build configuration skips type/lint checks; a successful deployment is not a clean security or type audit. The installed dependency tree still reports 121 findings (22 low, 53 moderate, 39 high, 7 critical); this work does not certify that legacy demo runtime for production trading.

## Findings deliberately not concealed in sales material

- Hosted trading panel hardcodes MAINNET / REAL FUNDS while the resolved environment and page banner are testnet. A fix is prepared in C:\GWDS\dashboard-runtime\src\app\dashboard\trading\page.tsx but is not yet deployed or server-verified.
- Hosted overview reports eight failed attempts in 24 hours and zero active trades while the exchange widget has four positions. Metrics use different scopes and need explicit labels and reconciliation.
- Hosted generic agent detail has incomplete position fields and counts that disagree with the visible trade history.
- Demo goals use incompatible field shapes, yielding blank units and implausible percentages; risk screen has incomplete volatility fixtures and incorrectly scaled confidence. Neither is published as evidence of working controls.
- Demo portfolio, farm, analytics and position-monitor fixtures are not a reconciled performance dataset. They must not be used as strategy performance evidence.
- Source installation and execution acceptance remains pending. This gallery release does not remove any product readiness gates or replace downloadable artifacts.

The caption catalog is src/lib/product-media.ts. Raw dimensions are recorded in src/lib/product-capture-dimensions.json. Tests verify all eight products have galleries, six standalone heroes differ, referenced JPEGs exist, and dimensions match the image metadata.

## Live verification

Storefront deployment dpl_FVT6PzZNgv6535VXXDbYzPnjwnW7 was promoted to www.civalsystems.com. All eight product pages returned HTTP 200 with galleries (Core: 6 views; Trader: 14; each standalone: 5), and all 24 raw JPEGs returned 200 with image content types. Live-browser gallery navigation and captions passed. The public demo deployment is dpl_AXA8uUyHrvABHvdB8augxhCqb7b1 (commit cffa7ca); its changes are preserved in ai-trading-dashboard PR #2. Store changes are in gwds-website PR #8.
