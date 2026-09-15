// Pure helpers for the hosting Deposit & Withdraw panel: amount checks, the gate that decides
// whether a wallet action may be signed, signature shaping, and friendly wallet errors. No React,
// no wagmi, no fetch — everything here is unit-tested in funding-helpers.test.ts.

import { parseSignature, type Hex } from 'viem';
import {
  normalizeAmount,
  type FundingNetwork,
  type FundingNetworkConfig,
} from '@/lib/hyperliquid-funding';

export type FundingState = 'no_tenant' | 'awaiting_wallet' | 'provisioning' | 'ready' | 'network_unknown';

const FUNDING_STATES: readonly FundingState[] = ['no_tenant', 'awaiting_wallet', 'provisioning', 'ready', 'network_unknown'];

export type FundingBalances = {
  accountValue: string | null;
  withdrawable: string | null;
  spotUsdc: string | null;
  walletUsdc: string | null;
  gasEth: string | null;
};

// `mainWallet`/`apiWallet` are the contract names; the older `...Address` names are still sent
// by the route for existing callers, so either is accepted.
export type FundingTenant = {
  slug: string;
  status: string;
  mainWallet?: string | null;
  apiWallet?: string | null;
  displayName?: string | null;
  mainWalletAddress?: string | null;
  apiWalletAddress?: string | null;
};

export type FundingResponse = {
  state: FundingState;
  network: FundingNetwork | null;
  config: FundingNetworkConfig | null;
  minDepositUsdc: number;
  withdrawFeeUsdc: number;
  tenant: FundingTenant | null;
  verifiedAddress: string | null;
  addressMismatch: boolean;
  agentApproved: boolean | null;
  balances: Partial<FundingBalances> | null;
  subscriptionId?: string | null;
  message?: string;
};

export type HistoryItem = {
  type: 'deposit' | 'withdraw';
  usdc: string;
  fee: string | null;
  time: number;
  hash: string;
};

/** The state the server reported, or null when the response is not one this panel understands. */
export function resolveState(value: unknown): FundingState | null {
  return FUNDING_STATES.includes(value as FundingState) ? (value as FundingState) : null;
}

export function tenantWallets(tenant: FundingTenant | null | undefined) {
  return {
    mainWallet: tenant?.mainWallet ?? tenant?.mainWalletAddress ?? null,
    apiWallet: tenant?.apiWallet ?? tenant?.apiWalletAddress ?? null,
  };
}

/** A finite number, or null. An unreadable balance is unknown, never zero. */
export function toAmount(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function sameAddress(a: string | null | undefined, b: string | null | undefined): boolean {
  return !!a && !!b && a.toLowerCase() === b.toLowerCase();
}

export function shortAddress(address: string | null | undefined): string {
  if (!address) return '—';
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatUsd(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export type AmountCheck = { amount: string | null; problem: string | null };

/** Validates a deposit. The minimum is a hard block: Hyperliquid never credits a smaller deposit. */
export function checkDeposit(
  input: string,
  opts: { minDeposit: number; walletBalance: number | null; symbol: string; chainName: string },
): AmountCheck {
  if (!input.trim()) return { amount: null, problem: null };
  const amount = normalizeAmount(input);
  if (!amount) return { amount: null, problem: 'Enter an amount like 25 or 100.50.' };
  const n = Number(amount);
  if (n < opts.minDeposit) {
    return {
      amount,
      problem: `The minimum deposit is ${opts.minDeposit} ${opts.symbol}. Hyperliquid never credits a smaller deposit, so the money would be lost.`,
    };
  }
  if (opts.walletBalance !== null && n > opts.walletBalance) {
    return { amount, problem: `Your wallet only has ${opts.walletBalance.toFixed(2)} ${opts.symbol} on ${opts.chainName}.` };
  }
  return { amount, problem: null };
}

/** Validates a withdrawal: it must exceed Hyperliquid's flat fee and fit what is withdrawable. */
export function checkWithdraw(input: string, opts: { fee: number; withdrawable: number | null }): AmountCheck {
  if (!input.trim()) return { amount: null, problem: null };
  const amount = normalizeAmount(input);
  if (!amount) return { amount: null, problem: 'Enter an amount like 25 or 100.50.' };
  const n = Number(amount);
  if (n <= opts.fee) return { amount, problem: `Withdraw more than the $${opts.fee} Hyperliquid fee.` };
  if (opts.withdrawable === null) {
    return { amount, problem: 'Your available balance could not be loaded. Refresh and try again.' };
  }
  if (n > opts.withdrawable) {
    return {
      amount,
      problem: `Only ${formatUsd(opts.withdrawable)} is available to withdraw. Money held as margin for open positions can't be withdrawn until those positions close.`,
    };
  }
  return { amount, problem: null };
}

/**
 * The Max withdrawal: the withdrawable balance rounded DOWN to cents, done on the decimal string
 * so binary floating point can never round it up past what Hyperliquid will allow.
 */
export function maxWithdrawAmount(withdrawable: string | number | null | undefined): string | null {
  const n = toAmount(withdrawable);
  if (n === null || n <= 0) return null;
  let text = typeof withdrawable === 'string' ? withdrawable.trim() : '';
  if (!/^\d+(\.\d+)?$/.test(text)) text = n.toFixed(12);
  const [whole, fraction = ''] = text.split('.');
  const result = `${whole.replace(/^0+(?=\d)/, '')}.${(fraction + '00').slice(0, 2)}`;
  return Number(result) > 0 ? result : null;
}

/** Roughly what arrives in the wallet after Hyperliquid's flat withdrawal fee. */
export function receiveAfterFee(amount: string, fee: number): number {
  return Math.max(0, Number(amount) - fee);
}

/** Hyperliquid's /exchange wants {r, s, v}, not the 65-byte hex string a wallet returns. */
export function signatureToRsv(signature: Hex): { r: Hex; s: Hex; v: number } {
  const parsed = parseSignature(signature);
  const v = parsed.v !== undefined ? Number(parsed.v) : parsed.yParity + 27;
  return { r: parsed.r, s: parsed.s, v };
}

/** True once Hyperliquid's ledger shows a deposit matching the one just sent. */
export function depositCredited(items: HistoryItem[], sent: { since: number; amount: string }): boolean {
  const amount = Number(sent.amount);
  return items.some((item) => (
    item.type === 'deposit'
    && item.time >= sent.since - 60_000
    && Math.abs(Math.abs(Number(item.usdc)) - amount) < 0.01
  ));
}

export type ActionGate = { allowed: true; reason: null } | { allowed: false; reason: string };

/**
 * Whether the connected wallet may sign a funds action ('funds': deposit, withdraw) or approve the
 * trading key ('approve'). Every signable action requires the workspace to be ready on a known
 * network AND the connected wallet to be the trading account itself: a deposit from any other
 * wallet credits a different Hyperliquid account, and Hyperliquid only accepts the key approval
 * from the account's own wallet.
 */
export function actionGate(input: {
  state: FundingState;
  hasConfig: boolean;
  mainWallet: string | null;
  connectedAddress: string | null | undefined;
  purpose: 'funds' | 'approve';
}): ActionGate {
  const blocked = (reason: string): ActionGate => ({ allowed: false, reason });
  switch (input.state) {
    case 'no_tenant':
      return blocked('This opens once your payment is confirmed and your workspace is set up.');
    case 'awaiting_wallet':
      return blocked('Verify the wallet that will hold your funds first. This opens when setup finishes.');
    case 'provisioning':
      return blocked('Your workspace is still being set up. This opens automatically when it finishes.');
    case 'network_unknown':
      return blocked("We can't confirm which Hyperliquid network your workspace uses, so nothing can be signed here. Contact support.");
    case 'ready':
      break;
  }
  if (!input.hasConfig || !input.mainWallet) {
    return blocked('Your trading account details are incomplete. Contact support.');
  }
  if (!input.connectedAddress) {
    return blocked(`Connect your wallet (${shortAddress(input.mainWallet)}) to continue.`);
  }
  if (!sameAddress(input.connectedAddress, input.mainWallet)) {
    return blocked(input.purpose === 'funds'
      ? `You connected ${shortAddress(input.connectedAddress)}, but your trading account is ${shortAddress(input.mainWallet)}. Switch to that account in your wallet. A deposit from any other wallet would be credited to a different Hyperliquid account.`
      : `You connected ${shortAddress(input.connectedAddress)}, but only your trading account's wallet (${shortAddress(input.mainWallet)}) can approve its trading key. Switch to that account in your wallet.`);
  }
  return { allowed: true, reason: null };
}

type ErrorLike = { name?: unknown; code?: unknown; message?: unknown; shortMessage?: unknown; details?: unknown; cause?: unknown };

function errorChain(error: unknown): ErrorLike[] {
  const chain: ErrorLike[] = [];
  let current: unknown = error;
  while (current && typeof current === 'object' && chain.length < 8) {
    chain.push(current as ErrorLike);
    current = (current as ErrorLike).cause;
  }
  return chain;
}

/** Turns wallet, chain and relay failures into one sentence a customer can act on. */
export function friendlyWalletError(error: unknown, chainName = 'the right network'): string {
  const chain = errorChain(error);
  const names = chain.map((e) => String(e.name ?? ''));
  const codes = chain.map((e) => e.code);
  const text = chain.map((e) => `${e.shortMessage ?? ''} ${e.message ?? ''} ${e.details ?? ''}`).join(' ');

  if (codes.includes(4001) || names.includes('UserRejectedRequestError') || /user rejected|user denied|rejected the request|request rejected|user cancel/i.test(text)) {
    return 'You cancelled the request in your wallet. Nothing was sent.';
  }
  if (
    codes.includes(4902)
    || names.some((n) => ['ChainMismatchError', 'ConnectorChainMismatchError', 'SwitchChainError', 'ChainNotConfiguredError', 'SwitchChainNotSupportedError'].includes(n))
    || /chain mismatch|does not match the target chain|unrecognized chain|wrong network|chain not configured/i.test(text)
  ) {
    return `Your wallet is on a different network. Switch it to ${chainName} and try again.`;
  }
  if (names.includes('InsufficientFundsError') || /insufficient funds|gas required exceeds allowance/i.test(text)) {
    return `Your wallet needs a little ETH on ${chainName} to pay the network fee.`;
  }
  if (/exceeds balance|insufficient balance/i.test(text)) {
    return "Your wallet doesn't hold enough of the token for this amount.";
  }
  if (names.includes('ConnectorNotFoundError') || names.includes('ProviderNotFoundError') || /provider not found|no injected provider/i.test(text)) {
    return "No wallet was found. Install a browser wallet such as MetaMask or Rabby, or open this page in your wallet app's browser.";
  }
  if (names.includes('ConnectorNotConnectedError')) return 'Connect your wallet first.';

  const first = chain[0];
  const message = String(first?.shortMessage || first?.message || '').trim();
  return message ? message.slice(0, 300) : 'Something went wrong. Please try again.';
}
