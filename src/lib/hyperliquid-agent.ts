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
// wallet's Hyperliquid account. Hyperliquid does not let an agent withdraw, or send USDC to
// another address (withdraw3 / usdSend must be signed by the account's own key). Be precise
// about that limit: an agent CAN sign other L1 actions, including moving funds between the
// account's own spot and perp balances and depositing into a vault (vaultTransfer). That
// asymmetry is why an agent/API wallet is the right thing for an automated trading service to
// hold: it lets Cival's tenant process trade without ever being handed the customer's own key.
//
// This file only builds data to sign and the request to submit an already-signed action. It
// never touches a private key.
import {
  currentNetwork, hyperliquidApiUrl, hyperliquidChainName, hyperliquidSignatureChainId,
  type HyperliquidNetwork,
} from './hyperliquid-network';

export const APPROVE_AGENT_PRIMARY_TYPE = 'HyperliquidTransaction:ApproveAgent' as const;

export const APPROVE_AGENT_TYPES = {
  [APPROVE_AGENT_PRIMARY_TYPE]: [
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

/** The exact typed data an approveAgent action is signed as. The relay recovers the signer from
 *  this same function, so what the browser signs and what the server verifies cannot drift. */
export function approveAgentTypedData(action: ApproveAgentAction) {
  return {
    domain: {
      name: 'HyperliquidSignTransaction',
      version: '1',
      chainId: parseInt(action.signatureChainId, 16),
      verifyingContract: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    },
    types: APPROVE_AGENT_TYPES,
    primaryType: APPROVE_AGENT_PRIMARY_TYPE,
    message: {
      hyperliquidChain: action.hyperliquidChain,
      agentAddress: action.agentAddress,
      agentName: action.agentName,
      // EIP-712 "uint64" must be signed as a bigint; the JSON action sent to Hyperliquid still
      // carries `nonce` as a plain number (see the action) — only the typed-data message needs
      // the bigint form.
      nonce: BigInt(action.nonce),
    },
  };
}

/** Builds the action object AND the exact typed-data payload wagmi's useSignTypedData needs to
 *  produce a signature Hyperliquid's /exchange endpoint will accept. Call this fresh right
 *  before signing — the nonce is a timestamp and Hyperliquid rejects stale/reused nonces.
 *  Pass the TENANT's network; the relay refuses an approval signed for any other one. */
export function buildApproveAgentRequest(
  agentAddress: `0x${string}`,
  agentName: string,
  network: HyperliquidNetwork = currentNetwork(),
) {
  const nonce = Date.now();
  const action: ApproveAgentAction = {
    type: 'approveAgent',
    hyperliquidChain: hyperliquidChainName(network),
    signatureChainId: hyperliquidSignatureChainId(network),
    agentAddress,
    agentName: agentName.slice(0, 50),
    nonce,
  };
  return { action, nonce, typedData: approveAgentTypedData(action) };
}

export function exchangeEndpoint(network: HyperliquidNetwork = currentNetwork()): string {
  return `${hyperliquidApiUrl(network)}/exchange`;
}
