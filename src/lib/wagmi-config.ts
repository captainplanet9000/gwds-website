// wagmi configuration for the non-custodial wallet flows (/account/funding and the hosting wallet
// panel). Only ever runs in the browser. Two connector kinds are offered:
//   - injected():      MetaMask, Rabby, Coinbase extension, etc. — whatever the browser exposes.
//   - walletConnect():  any WalletConnect-compatible mobile/hardware wallet, QR-paired.
// Neither connector, nor anything in this file, ever sees or stores a private key. Signing
// happens inside the wallet extension or the paired wallet app.
'use client';

import { createConfig, http } from 'wagmi';
import { arbitrum, arbitrumSepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';
import { arbitrumRpcUrl, isMainnet } from './hyperliquid-network';

// Both chains are registered because the network belongs to each customer's tenant and is picked
// at call time (switch to the tenant's chainId), not fixed by this build. The build-time network
// is listed first only so it stays wagmi's default chain for callers that never switch.
const chains = isMainnet()
  ? ([arbitrum, arbitrumSepolia] as const)
  : ([arbitrumSepolia, arbitrum] as const);
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
      chains,
      connectors,
      // Each chain reads through its own network's RPC, never the other one's.
      transports: {
        [arbitrum.id]: http(arbitrumRpcUrl('mainnet')),
        [arbitrumSepolia.id]: http(arbitrumRpcUrl('testnet')),
      },
      ssr: true,
    });
  }
  return cachedConfig;
}
