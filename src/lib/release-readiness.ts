/**
 * Explicit evidence gate for new source-product sales. Storage existence is not
 * installation acceptance. Existing entitlements/downloads do not consult this.
 * Remove an entry only after the exact replacement archive passes the release
 * checklist in STORE-RELEASE-ACCEPTANCE.md and its immutable hash is registered.
 */
const awaitingAcceptance = new Set([
  'trading-dashboard-template', 'multi-strat-bundle', 'everything-bundle',
  'darvas-indicator', 'elliott-wave-agent', 'vwap-momentum-agent',
  'heikin-ashi-agent', 'mean-reversion-agent', 'macro-sentiment-agent',
]);

export const SOURCE_RELEASES_ON_HOLD = true;

export function needsReleaseAcceptance(id: string): boolean {
  return awaitingAcceptance.has(id);
}
