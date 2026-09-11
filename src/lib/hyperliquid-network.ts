// Hyperliquid / Arbitrum network configuration shared by server routes and the browser funding
// UI. This mirrors the SAME constants the live trading dashboard uses (Cival-Dashboard-v9's
// src/lib/hyperliquid/network-config.ts and src/lib/treasury/wallet.ts), verified from that
// code rather than guessed — see NEXT_PUBLIC_HYPERLIQUID_NETWORK below.
//
// Nothing here ever holds a private key or moves funds. It only names public, well-known
// identifiers: chain ids, the native-USDC contract address on Arbitrum One, and Hyperliquid's
// public REST endpoints. The one address this deliberately does NOT hardcode is the Hyperliquid
// bridge contract — see bridgeAddress() below.

export type HyperliquidNetwork = 'mainnet' | 'testnet';

/** Defaults to testnet, same fail-safe default the live dashboard uses. */
export function currentNetwork(): HyperliquidNetwork {
  const raw = (process.env.NEXT_PUBLIC_HYPERLIQUID_NETWORK || 'testnet').trim().toLowerCase();
  return raw === 'mainnet' ? 'mainnet' : 'testnet';
}

export function isMainnet(): boolean {
  return currentNetwork() === 'mainnet';
}

/** Hyperliquid's public REST base URL for the active network. */
export function hyperliquidApiUrl(): string {
  return isMainnet() ? 'https://api.hyperliquid.xyz' : 'https://api.hyperliquid-testnet.xyz';
}

/** Arbitrum EVM chain id — 42161 mainnet (One), 421614 testnet (Sepolia). Also the EIP-712
 *  domain chainId Hyperliquid's own SDK uses for user-signed actions (verified from the
 *  `hyperliquid` npm package's signUserSignedAction, which hardcodes 42161 / 421614). */
export function arbitrumChainId(): number {
  return isMainnet() ? 42161 : 421614;
}

/** The same chain id, hex-encoded, as Hyperliquid's `signatureChainId` action field expects. */
export function hyperliquidSignatureChainId(): `0x${string}` {
  return isMainnet() ? '0xa4b1' : '0x66eee';
}

/** "Mainnet" / "Testnet" — the exact capitalization Hyperliquid's action schema requires. */
export function hyperliquidChainName(): 'Mainnet' | 'Testnet' {
  return isMainnet() ? 'Mainnet' : 'Testnet';
}

/** Native USDC on Arbitrum One, 6 decimals. Hyperliquid deposits/withdraws settle in this token.
 *  Verified against Cival-Dashboard-v9's src/lib/treasury/wallet.ts ARBITRUM_USDC constant. */
export const ARBITRUM_USDC_MAINNET = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as const;
/** Circle's testnet USDC on Arbitrum Sepolia. Used only when NEXT_PUBLIC_HYPERLIQUID_NETWORK=testnet. */
export const ARBITRUM_USDC_TESTNET = '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d' as const;
export const USDC_DECIMALS = 6;

export function usdcAddress(): `0x${string}` {
  return isMainnet() ? ARBITRUM_USDC_MAINNET : ARBITRUM_USDC_TESTNET;
}

/**
 * The Hyperliquid Arbitrum bridge contract — the address a plain USDC transfer credits to the
 * SENDER's own Hyperliquid account. Deliberately NOT hardcoded: the live dashboard's own
 * deposit route (src/app/api/hyperliquid/treasury/deposit/route.ts) refuses to guess this
 * address too, reading it only from HYPERLIQUID_BRIDGE_ADDRESS, because a USDC transfer to the
 * wrong Arbitrum address is unrecoverable. This file follows the identical rule.
 *
 * Returns null when unconfigured — callers must render "not configured" rather than fabricate
 * a value.
 */
export function bridgeAddress(): `0x${string}` | null {
  const raw = String(process.env.HYPERLIQUID_BRIDGE_ADDRESS || '').trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(raw)) return null;
  return raw as `0x${string}`;
}

/** A public Arbitrum RPC endpoint for read-only balance checks. Override with ARBITRUM_RPC_URL
 *  for a paid/rate-limited-friendlier provider. */
export function arbitrumRpcUrl(): string {
  const configured = String(process.env.ARBITRUM_RPC_URL || '').trim();
  if (configured) return configured;
  return isMainnet() ? 'https://arb1.arbitrum.io/rpc' : 'https://sepolia-rollup.arbitrum.io/rpc';
}
