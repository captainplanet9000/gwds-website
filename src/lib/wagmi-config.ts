// wagmi configuration for the non-custodial funding flow (/account/funding). Only ever runs in
// the browser. EIP-6963 detects individual installed providers first; MetaMask and Coinbase
// SDKs are mobile fallbacks. WalletConnect offers other mobile/hardware wallets when configured.
// Neither connector, nor anything in this file, ever sees or stores a private key. Signing
// happens inside the wallet extension or the paired wallet app.
'use client';

import { createConfig, http } from 'wagmi';
import { arbitrum, arbitrumSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, metaMask, walletConnect } from 'wagmi/connectors';
import { arbitrumRpcUrl, isMainnet } from './hyperliquid-network';
import { keepBrowserWalletDiscovery } from './wallet-options';

const chain = isMainnet() ? arbitrum : arbitrumSepolia;
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const connectors = [
  injected({ shimDisconnect: true, unstable_shimAsyncInject: 2000 }),
  keepBrowserWalletDiscovery(metaMask({ dapp: { name: 'Cival Systems', url: 'https://www.civalsystems.com' } })),
  keepBrowserWalletDiscovery(coinbaseWallet({
    appName: 'Cival Systems', appLogoUrl: 'https://www.civalsystems.com/favicon.png',
    preference: { options: 'eoaOnly' },
  })),
];
// WalletConnect requires a project id (from cloud.walletconnect.com). Omit the connector
// entirely rather than initialize it with an empty id, which throws at runtime.
if (walletConnectProjectId) {
  connectors.push(
    walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: true,
      metadata: {
        name: 'Cival Systems',
        description: 'Fund and authorize your trading agent — non-custodially.',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://civalsystems.com',
        icons: ['/images/logo.png'],
      },
    }),
  );
}

export const walletConnectAvailable = Boolean(walletConnectProjectId);

let cachedConfig: ReturnType<typeof createConfig> | null = null;

/** Lazily built and memoized — createConfig must only ever run once per browser session. */
export function getWagmiConfig() {
  if (!cachedConfig) {
    cachedConfig = createConfig({
      chains: [chain],
      connectors,
      multiInjectedProviderDiscovery: true,
      // `chain` is a union (arbitrum | arbitrumSepolia) chosen at runtime by isMainnet(), so
      // `chain.id` alone types as `42161 | 421614` and wagmi's transports Record requires both
      // literal keys present regardless of which one is actually selected. Only the transport for
      // the runtime-selected `chain` is ever used; the other key is unreachable but keeps this
      // buildable under strict typing.
      transports: {
        [arbitrum.id]: http(arbitrumRpcUrl()),
        [arbitrumSepolia.id]: http(arbitrumRpcUrl()),
      },
      ssr: true,
    });
  }
  return cachedConfig;
}
