# Install Sentiment Proxy Research

This is an unpublished candidate. Do not replace customer downloads until the exact archive passes STORE-RELEASE-ACCEPTANCE.md.

1. Confirm a compatible Core/Trader 2.1 dashboard. This module does not run in the browser-only Core 2.0 template.
2. Back up the database, configuration and plugins. Pause new entries and reconcile existing positions.
3. Copy this directory to plugins/macro-sentiment-agent. The manifest must be directly inside that folder.
4. Check that dist/strategy.js exists and exports strategy. Use the manifest defaults; old product manifests contained incompatible settings.
5. Restart and check the plugin loader. Select the strategy, symbol, interval and your risk limits.
6. Verify fresh data, signal decisions and order ownership in isolation. Then validate an open/manage/close lifecycle on testnet, including restart recovery and protection.
7. Do not enable real-money or unattended operation based solely on a successful signal test.

Remove or restore a plugin only after its managed positions and orders have been reconciled. Never run duplicate agents against the same position inadvertently.
