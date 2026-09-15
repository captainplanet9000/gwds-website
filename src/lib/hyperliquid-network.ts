// Hyperliquid / Arbitrum network helpers shared by server routes and the browser funding UI.
//
// The per-network constants (chain ids, token, bridge, API hosts) live in ./hyperliquid-funding
// (FUNDING_NETWORKS), ported from the dashboard's on-chain-checked funding config. Every helper
// here takes the network explicitly: a hosted customer's network is a property of THEIR tenant
// (resolveTenantNetwork in src/lib/control-plane.ts), not of this deployment, so server routes
// must always pass it. The no-argument form falls back to this deployment's build-time
// NEXT_PUBLIC_HYPERLIQUID_NETWORK and remains only for callers that predate per-tenant networks.
//
// Nothing here ever holds a private key or moves funds. It only names public, well-known
// identifiers.
import { FUNDING_NETWORKS, type FundingNetwork } from './hyperliquid-funding';

export { USDC_DECIMALS } from './hyperliquid-funding';

export type HyperliquidNetwork = FundingNetwork;

/** Defaults to testnet, same fail-safe default the live dashboard uses. */
export function currentNetwork(): HyperliquidNetwork {
  const raw = (process.env.NEXT_PUBLIC_HYPERLIQUID_NETWORK || 'testnet').trim().toLowerCase();
  return raw === 'mainnet' ? 'mainnet' : 'testnet';
}

export function isMainnet(network: HyperliquidNetwork = currentNetwork()): boolean {
  return network === 'mainnet';
}

/** Hyperliquid's public REST base URL for the network. */
export function hyperliquidApiUrl(network: HyperliquidNetwork = currentNetwork()): string {
  return FUNDING_NETWORKS[network].hyperliquidApi;
}

/** Arbitrum EVM chain id — 42161 mainnet (One), 421614 testnet (Sepolia). Also the EIP-712
 *  domain chainId Hyperliquid's own SDK uses for user-signed actions (verified from the
 *  `hyperliquid` npm package's signUserSignedAction, which hardcodes 42161 / 421614). */
export function arbitrumChainId(network: HyperliquidNetwork = currentNetwork()): number {
  return FUNDING_NETWORKS[network].chainId;
}

/** The same chain id, hex-encoded, as Hyperliquid's `signatureChainId` action field expects. */
export function hyperliquidSignatureChainId(network: HyperliquidNetwork = currentNetwork()): `0x${string}` {
  return FUNDING_NETWORKS[network].signatureChainId;
}

/** "Mainnet" / "Testnet" — the exact capitalization Hyperliquid's action schema requires. */
export function hyperliquidChainName(network: HyperliquidNetwork = currentNetwork()): 'Mainnet' | 'Testnet' {
  return FUNDING_NETWORKS[network].hyperliquidChain;
}

/** Native USDC on Arbitrum One, 6 decimals. Hyperliquid mainnet deposits/withdraws settle in this token. */
export const ARBITRUM_USDC_MAINNET = FUNDING_NETWORKS.mainnet.usdc;
/** Hyperliquid's own test token (USDC2) on Arbitrum Sepolia. The testnet bridge credits this, not
 *  Circle's Sepolia USDC. */
export const ARBITRUM_USDC_TESTNET = FUNDING_NETWORKS.testnet.usdc;

export function usdcAddress(network: HyperliquidNetwork = currentNetwork()): `0x${string}` {
  return FUNDING_NETWORKS[network].usdc;
}

/**
 * The Hyperliquid Bridge2 contract on Arbitrum — the address a plain token transfer credits to the
 * SENDER's own Hyperliquid account. Taken from the verified per-network constants rather than an
 * env var: one global HYPERLIQUID_BRIDGE_ADDRESS cannot be right for tenants on both networks, and
 * a transfer to the wrong Arbitrum address is unrecoverable.
 */
export function bridgeAddress(network: HyperliquidNetwork = currentNetwork()): `0x${string}` {
  return FUNDING_NETWORKS[network].bridge;
}

/** A public Arbitrum RPC endpoint for read-only balance checks. ARBITRUM_RPC_URL names ONE endpoint,
 *  for the chain this deployment was configured for, so it is honoured only for that network:
 *  pointing a testnet tenant's balance read at a mainnet RPC would return a confident wrong number
 *  rather than an error. */
export function arbitrumRpcUrl(network: HyperliquidNetwork = currentNetwork()): string {
  const configured = String(process.env.ARBITRUM_RPC_URL || '').trim();
  if (configured && network === currentNetwork()) return configured;
  return FUNDING_NETWORKS[network].rpcUrl;
}
