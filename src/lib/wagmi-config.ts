// wagmi configuration for the non-custodial funding flow (/account/funding). Only ever runs in
// the browser. Two connector kinds are offered:
//   - injected():      MetaMask, Rabby, Coinbase extension, etc. — whatever the browser exposes.
//   - walletConnect():  any WalletConnect-compatible mobile/hardware wallet, QR-paired.
// Neither connector, nor anything in this file, ever sees or stores a private key. Signing
// happens inside the wallet extension or the paired wallet app.
'use client';

import { createConfig, http } from 'wagmi';
import { arbitrum, arbitrumSepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';
import { arbitrumRpcUrl, isMainnet } from './hyperliquid-network';

const chain = isMainnet() ? arbitrum : arbitrumSepolia;
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const connectors = [injected({ shimDisconnect: true })];
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
