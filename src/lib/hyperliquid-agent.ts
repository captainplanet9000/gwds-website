// Builds the EIP-712 typed-data payload for Hyperliquid's "approveAgent" user-signed action.
//
// Verified directly from the official `hyperliquid` npm package (node_modules/hyperliquid,
// already a dependency of the live trading dashboard at C:/TradingFarm/Cival-Dashboard-v9),
// function signAgent -> signUserSignedAction:
//
//   domain:      { name: "HyperliquidSignTransaction", version: "1",
//                  chainId: isMainnet ? 42161 : 421614,
//                  verifyingContract: "0x0000000000000000000000000000000000000000" }
//   primaryType: "HyperliquidTransaction:ApproveAgent"
//   types:       { "HyperliquidTransaction:ApproveAgent": [
//                    { name: "hyperliquidChain", type: "string" },
//                    { name: "agentAddress",     type: "address" },
//                    { name: "agentName",        type: "string" },
//                    { name: "nonce",            type: "uint64" } ] }
//
// approveAgent grants the named address permission to SIGN TRADES on behalf of the connected
// wallet's Hyperliquid account. It can never withdraw or transfer funds — that asymmetry is
// exactly why an "agent"/API wallet is safe for an automated trading service to hold, and is
// the whole reason this flow exists: it lets Cival's tenant process trade without ever being
// handed the customer's own wallet key.
//
// This file only builds data to sign and the request to submit an already-signed action. It
// never touches a private key.
import { arbitrumChainId, hyperliquidChainName, hyperliquidSignatureChainId, hyperliquidApiUrl } from './hyperliquid-network';

export const APPROVE_AGENT_TYPES = {
  'HyperliquidTransaction:ApproveAgent': [
    { name: 'hyperliquidChain', type: 'string' },
    { name: 'agentAddress', type: 'address' },
    { name: 'agentName', type: 'string' },
    { name: 'nonce', type: 'uint64' },
  ],
} as const;

export interface ApproveAgentAction {
  type: 'approveAgent';
  hyperliquidChain: 'Mainnet' | 'Testnet';
  signatureChainId: `0x${string}`;
  agentAddress: `0x${string}`;
  agentName: string;
  nonce: number;
}

/** Builds the action object AND the exact typed-data payload wagmi's useSignTypedData needs to
 *  produce a signature Hyperliquid's /exchange endpoint will accept. Call this fresh right
 *  before signing — the nonce is a timestamp and Hyperliquid rejects stale/reused nonces. */
export function buildApproveAgentRequest(agentAddress: `0x${string}`, agentName: string) {
  const nonce = Date.now();
  const action: ApproveAgentAction = {
    type: 'approveAgent',
    hyperliquidChain: hyperliquidChainName(),
    signatureChainId: hyperliquidSignatureChainId(),
    agentAddress,
    agentName: agentName.slice(0, 50),
    nonce,
  };
  const typedData = {
    domain: {
      name: 'HyperliquidSignTransaction',
      version: '1',
      chainId: arbitrumChainId(),
      verifyingContract: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    },
    types: APPROVE_AGENT_TYPES,
    primaryType: 'HyperliquidTransaction:ApproveAgent' as const,
    message: {
      hyperliquidChain: action.hyperliquidChain,
      agentAddress: action.agentAddress,
      agentName: action.agentName,
      // EIP-712 "uint64" must be signed as a bigint; the JSON action sent to Hyperliquid still
      // carries `nonce` as a plain number (see `action` above) — only the typed-data message
      // needs the bigint form.
      nonce: BigInt(nonce),
    },
  };
  return { action, nonce, typedData };
}

export function exchangeEndpoint(): string {
  return `${hyperliquidApiUrl()}/exchange`;
}
