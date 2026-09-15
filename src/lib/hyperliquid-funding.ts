// Public constants for customer deposits and withdrawals, shared by the funding API routes and the
// browser wallet panel. Ported from dashboard-runtime's src/lib/funding/config.ts. Nothing here
// holds a key or moves funds: every deposit and withdrawal is signed in the customer's own wallet,
// and the server only relays a withdrawal that wallet already signed.
//
// Bridge and token addresses come from Hyperliquid's docs
// (https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/usdc) and were checked
// on-chain: both bridges have deployed contract code and both tokens report 6 decimals. Testnet
// deposits use Hyperliquid's own test token (USDC2), not Circle's Arbitrum Sepolia USDC, which
// the testnet bridge does not credit. A USDC transfer to the wrong address is unrecoverable, so
// these are deliberately not overridable by env.
//
// Client-safe: this file must never import a server-only module.

export type FundingNetwork = 'mainnet' | 'testnet';

export type FundingNetworkConfig = {
  network: FundingNetwork;
  /** Arbitrum EVM chain id the deposit is sent on. */
  chainId: number;
  chainName: string;
  rpcUrl: string;
  explorer: string;
  bridge: `0x${string}`;
  usdc: `0x${string}`;
  usdcSymbol: string;
  /** Hex Arbitrum chain id, used as a user-signed action's signatureChainId and EIP-712 domain chainId. */
  signatureChainId: '0xa4b1' | '0x66eee';
  hyperliquidChain: 'Mainnet' | 'Testnet';
  hyperliquidApi: string;
  hyperliquidApp: string;
};

export const FUNDING_NETWORKS: Record<FundingNetwork, FundingNetworkConfig> = {
  mainnet: {
    network: 'mainnet',
    chainId: 42161,
    chainName: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    bridge: '0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7',
    usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    usdcSymbol: 'USDC',
    signatureChainId: '0xa4b1',
    hyperliquidChain: 'Mainnet',
    hyperliquidApi: 'https://api.hyperliquid.xyz',
    hyperliquidApp: 'https://app.hyperliquid.xyz',
  },
  testnet: {
    network: 'testnet',
    chainId: 421614,
    chainName: 'Arbitrum Sepolia',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    explorer: 'https://sepolia.arbiscan.io',
    bridge: '0x08cfc1B6b2dCF36A1480b99353A354AA8AC56f89',
    usdc: '0x1baAbB04529D43a73232B713C0FE471f7c7334d5',
    usdcSymbol: 'USDC2',
    signatureChainId: '0x66eee',
    hyperliquidChain: 'Testnet',
    hyperliquidApi: 'https://api.hyperliquid-testnet.xyz',
    hyperliquidApp: 'https://app.hyperliquid-testnet.xyz',
  },
};

export function isFundingNetwork(value: unknown): value is FundingNetwork {
  return value === 'mainnet' || value === 'testnet';
}

export const USDC_DECIMALS = 6;
/** Hyperliquid never credits a bridge deposit under 5 USDC — the funds are lost, not refunded. */
export const MIN_DEPOSIT_USDC = 5;
/** Hyperliquid's flat withdrawal fee. */
export const WITHDRAW_FEE_USDC = 1;

export const WITHDRAW_PRIMARY_TYPE = 'HyperliquidTransaction:Withdraw' as const;

export const WITHDRAW_TYPES = {
  [WITHDRAW_PRIMARY_TYPE]: [
    { name: 'hyperliquidChain', type: 'string' },
    { name: 'destination', type: 'string' },
    { name: 'amount', type: 'string' },
    { name: 'time', type: 'uint64' },
  ],
} as const;

export function withdrawDomain(cfg: FundingNetworkConfig) {
  return {
    name: 'HyperliquidSignTransaction',
    version: '1',
    chainId: parseInt(cfg.signatureChainId, 16),
    verifyingContract: '0x0000000000000000000000000000000000000000' as const,
  };
}

/** A USDC amount string: digits, optionally up to 6 decimals, no sign or exponent. */
export const AMOUNT_PATTERN = /^\d+(\.\d{1,6})?$/;

/** "010.500" -> "10.5". Returns null for anything that isn't a plain positive decimal. */
export function normalizeAmount(raw: string): string | null {
  const s = raw.trim();
  if (!AMOUNT_PATTERN.test(s)) return null;
  const [int, frac = ''] = s.split('.');
  const i = int.replace(/^0+(?=\d)/, '');
  const f = frac.replace(/0+$/, '');
  return f ? `${i}.${f}` : i;
}
