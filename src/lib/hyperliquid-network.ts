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
/** Hyperliquid's own testnet bridge token, "USDC2", on Arbitrum Sepolia. The testnet bridge only
 *  credits this token, not Circle's Arbitrum Sepolia USDC (0x75faf114…), so sending Circle's
 *  token would not reach the customer's testnet account. Source:
 *  https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/usdc (checked on-chain:
 *  6 decimals). Used only when NEXT_PUBLIC_HYPERLIQUID_NETWORK=testnet. */
export const ARBITRUM_USDC_TESTNET = '0x1baAbB04529D43a73232B713C0FE471f7c7334d5' as const;
export const USDC_DECIMALS = 6;

export function usdcAddress(): `0x${string}` {
  return isMainnet() ? ARBITRUM_USDC_MAINNET : ARBITRUM_USDC_TESTNET;
}

/**
 * Hyperliquid's Arbitrum bridge (Bridge2): a plain USDC transfer to it credits the SENDER's own
 * Hyperliquid account within about a minute. Deposits under 5 USDC are never credited and are
 * lost. A transfer to the wrong address is unrecoverable, so these are not guessed: both come
 * from Hyperliquid's docs (https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/usdc)
 * and were checked on-chain (deployed contract code at each; valid EIP-55 checksums). This used
 * to return null unless HYPERLIQUID_BRIDGE_ADDRESS was set, and it was set in no environment,
 * so the funding page always said "not configured". The env var still overrides, for the day
 * Hyperliquid moves the bridge.
 */
export const HYPERLIQUID_BRIDGE_MAINNET = '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7' as const;
export const HYPERLIQUID_BRIDGE_TESTNET = '0x08cfc1B6b2dCF36A1480b99353A354AA8AC56f89' as const;
export const MIN_DEPOSIT_USDC = 5;

export function bridgeAddress(): `0x${string}` {
  const raw = String(process.env.HYPERLIQUID_BRIDGE_ADDRESS || '').trim();
  if (/^0x[a-fA-F0-9]{40}$/.test(raw)) return raw as `0x${string}`;
  return isMainnet() ? HYPERLIQUID_BRIDGE_MAINNET : HYPERLIQUID_BRIDGE_TESTNET;
}

/** A public Arbitrum RPC endpoint for read-only balance checks. Override with ARBITRUM_RPC_URL
 *  for a paid/rate-limited-friendlier provider. */
export function arbitrumRpcUrl(): string {
  const configured = String(process.env.ARBITRUM_RPC_URL || '').trim();
  if (configured) return configured;
  return isMainnet() ? 'https://arb1.arbitrum.io/rpc' : 'https://sepolia-rollup.arbitrum.io/rpc';
}
