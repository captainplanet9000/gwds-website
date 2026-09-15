import { describe, expect, it } from 'vitest';
import { recoverTypedDataAddress, UserRejectedRequestError, type Hex } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import {
  FUNDING_NETWORKS, WITHDRAW_PRIMARY_TYPE, WITHDRAW_TYPES, withdrawDomain,
} from '@/lib/hyperliquid-funding';
import {
  actionGate, checkDeposit, checkWithdraw, depositCredited, friendlyWalletError, maxWithdrawAmount,
  receiveAfterFee, resolveState, sameAddress, signatureToRsv, tenantWallets, toAmount,
  type HistoryItem,
} from './funding-helpers';

const MAIN = '0x1111111111111111111111111111111111111111';
const OTHER = '0x2222222222222222222222222222222222222222';
const depositOpts = { minDeposit: 5, walletBalance: 100, symbol: 'USDC2', chainName: 'Arbitrum Sepolia' };

describe('resolveState / tenantWallets / toAmount', () => {
  it('accepts only the contract states', () => {
    expect(resolveState('ready')).toBe('ready');
    expect(resolveState('network_unknown')).toBe('network_unknown');
    expect(resolveState(undefined)).toBeNull();
    expect(resolveState('active')).toBeNull();
  });

  it('reads either wallet field naming', () => {
    expect(tenantWallets({ slug: 's', status: 'active', mainWallet: MAIN, apiWallet: OTHER })).toEqual({ mainWallet: MAIN, apiWallet: OTHER });
    expect(tenantWallets({ slug: 's', status: 'active', mainWalletAddress: MAIN, apiWalletAddress: null })).toEqual({ mainWallet: MAIN, apiWallet: null });
    expect(tenantWallets(null)).toEqual({ mainWallet: null, apiWallet: null });
  });

  it('treats unreadable values as unknown, never zero', () => {
    expect(toAmount('12.5')).toBe(12.5);
    expect(toAmount('0')).toBe(0);
    expect(toAmount(null)).toBeNull();
    expect(toAmount('')).toBeNull();
    expect(toAmount('n/a')).toBeNull();
  });

  it('compares addresses case-insensitively and never matches a missing one', () => {
    expect(sameAddress(MAIN, MAIN.toUpperCase().replace('0X', '0x'))).toBe(true);
    expect(sameAddress(MAIN, OTHER)).toBe(false);
    expect(sameAddress(undefined, MAIN)).toBe(false);
  });
});

describe('checkDeposit', () => {
  it('says nothing for an empty field', () => {
    expect(checkDeposit('  ', depositOpts)).toEqual({ amount: null, problem: null });
  });

  it('rejects malformed amounts', () => {
    for (const bad of ['abc', '-5', '1e3', '5.1234567', '.5']) {
      expect(checkDeposit(bad, depositOpts).amount).toBeNull();
      expect(checkDeposit(bad, depositOpts).problem).toMatch(/Enter an amount/);
    }
  });

  it('hard-blocks deposits under the minimum with the loss warning', () => {
    const result = checkDeposit('4.99', depositOpts);
    expect(result.problem).toMatch(/minimum deposit is 5 USDC2/);
    expect(result.problem).toMatch(/lost/);
  });

  it('allows exactly the minimum and normalizes the amount', () => {
    expect(checkDeposit('5', depositOpts)).toEqual({ amount: '5', problem: null });
    expect(checkDeposit('010.500', depositOpts)).toEqual({ amount: '10.5', problem: null });
  });

  it('blocks more than the wallet holds, but not when the balance is unknown', () => {
    expect(checkDeposit('100.01', depositOpts).problem).toMatch(/only has 100.00 USDC2 on Arbitrum Sepolia/);
    expect(checkDeposit('100.01', { ...depositOpts, walletBalance: null }).problem).toBeNull();
  });
});

describe('checkWithdraw', () => {
  const opts = { fee: 1, withdrawable: 50 };

  it('requires more than the fee', () => {
    expect(checkWithdraw('1', opts).problem).toMatch(/more than the \$1/);
    expect(checkWithdraw('1.01', opts).problem).toBeNull();
  });

  it('blocks more than is withdrawable', () => {
    expect(checkWithdraw('50', opts).problem).toBeNull();
    expect(checkWithdraw('50.000001', opts).problem).toMatch(/Only \$50.00 is available/);
  });

  it('blocks when the withdrawable balance is unknown', () => {
    expect(checkWithdraw('10', { fee: 1, withdrawable: null }).problem).toMatch(/could not be loaded/);
  });
});

describe('maxWithdrawAmount / receiveAfterFee', () => {
  it('floors to cents without floating-point round-trips', () => {
    expect(maxWithdrawAmount('12.3456')).toBe('12.34');
    // Math.floor(0.29 * 100) / 100 is 0.28: the string path must not lose the cent.
    expect(maxWithdrawAmount('0.29')).toBe('0.29');
    expect(maxWithdrawAmount('7')).toBe('7.00');
    expect(maxWithdrawAmount('000.5')).toBe('0.50');
    expect(maxWithdrawAmount(12.999)).toBe('12.99');
  });

  it('returns null when there is nothing to withdraw', () => {
    expect(maxWithdrawAmount('0.004')).toBeNull();
    expect(maxWithdrawAmount('0')).toBeNull();
    expect(maxWithdrawAmount(null)).toBeNull();
    expect(maxWithdrawAmount(1e-7)).toBeNull();
  });

  it('subtracts the fee and never goes negative', () => {
    expect(receiveAfterFee('25.5', 1)).toBe(24.5);
    expect(receiveAfterFee('0.5', 1)).toBe(0);
  });
});

describe('signatureToRsv', () => {
  it('produces an {r,s,v} that recovers to the signing wallet for a withdraw3 payload', async () => {
    const account = privateKeyToAccount(generatePrivateKey());
    const cfg = FUNDING_NETWORKS.testnet;
    const message = { hyperliquidChain: cfg.hyperliquidChain, destination: account.address.toLowerCase(), amount: '10.5', time: BigInt(1_757_000_000_000) };
    const hex = await account.signTypedData({ domain: withdrawDomain(cfg), types: WITHDRAW_TYPES, primaryType: WITHDRAW_PRIMARY_TYPE, message });

    const rsv = signatureToRsv(hex);
    expect(rsv.r).toMatch(/^0x[0-9a-f]{64}$/);
    expect(rsv.s).toMatch(/^0x[0-9a-f]{64}$/);
    expect([27, 28]).toContain(rsv.v);
    const recovered = await recoverTypedDataAddress({
      domain: withdrawDomain(cfg), types: WITHDRAW_TYPES, primaryType: WITHDRAW_PRIMARY_TYPE, message,
      signature: { r: rsv.r, s: rsv.s, v: BigInt(rsv.v) },
    });
    expect(recovered).toBe(account.address);
  });

  it('maps a yParity-style final byte (00/01) to v 27/28', () => {
    const body = `0x${'11'.repeat(32)}${'22'.repeat(32)}`;
    expect(signatureToRsv(`${body}00` as Hex).v).toBe(27);
    expect(signatureToRsv(`${body}01` as Hex).v).toBe(28);
    expect(signatureToRsv(`${body}1c` as Hex).v).toBe(28);
  });
});

describe('depositCredited', () => {
  const since = 1_757_000_000_000;
  const item = (over: Partial<HistoryItem>): HistoryItem => ({ type: 'deposit', usdc: '25', fee: null, time: since + 30_000, hash: '0xabc', ...over });

  it('matches a deposit of the same amount after the transfer', () => {
    expect(depositCredited([item({})], { since, amount: '25' })).toBe(true);
  });

  it('ignores withdrawals, other amounts and older deposits', () => {
    expect(depositCredited([item({ type: 'withdraw' })], { since, amount: '25' })).toBe(false);
    expect(depositCredited([item({ usdc: '30' })], { since, amount: '25' })).toBe(false);
    expect(depositCredited([item({ time: since - 5 * 60_000 })], { since, amount: '25' })).toBe(false);
  });
});

describe('actionGate', () => {
  const base = { hasConfig: true, mainWallet: MAIN, connectedAddress: MAIN, purpose: 'funds' as const };

  it('blocks every state except ready', () => {
    for (const state of ['no_tenant', 'awaiting_wallet', 'provisioning', 'network_unknown'] as const) {
      expect(actionGate({ ...base, state }).allowed).toBe(false);
    }
    expect(actionGate({ ...base, state: 'network_unknown' }).reason).toMatch(/Contact support/);
  });

  it('blocks a ready workspace with no network config or main wallet', () => {
    expect(actionGate({ ...base, state: 'ready', hasConfig: false }).allowed).toBe(false);
    expect(actionGate({ ...base, state: 'ready', mainWallet: null }).allowed).toBe(false);
  });

  it('requires a connected wallet', () => {
    expect(actionGate({ ...base, state: 'ready', connectedAddress: undefined }).reason).toMatch(/Connect your wallet/);
  });

  it('requires the connected wallet to be the trading account', () => {
    const funds = actionGate({ ...base, state: 'ready', connectedAddress: OTHER });
    expect(funds.allowed).toBe(false);
    expect(funds.reason).toMatch(/credited to a different Hyperliquid account/);
    const approve = actionGate({ ...base, state: 'ready', connectedAddress: OTHER, purpose: 'approve' });
    expect(approve.reason).toMatch(/only your trading account's wallet/);
  });

  it('allows the trading account wallet regardless of address case', () => {
    expect(actionGate({ ...base, state: 'ready', connectedAddress: MAIN.toUpperCase().replace('0X', '0x') })).toEqual({ allowed: true, reason: null });
  });
});

describe('friendlyWalletError', () => {
  it('recognizes a cancelled request, including when it is wrapped', () => {
    expect(friendlyWalletError({ code: 4001, message: 'User rejected the request.' })).toMatch(/cancelled/);
    expect(friendlyWalletError({ message: 'outer', cause: { code: 4001 } })).toMatch(/cancelled/);
    expect(friendlyWalletError(new UserRejectedRequestError(new Error('no')))).toMatch(/cancelled/);
  });

  it('recognizes the wrong chain', () => {
    expect(friendlyWalletError({ name: 'ConnectorChainMismatchError', message: 'x' }, 'Arbitrum One')).toBe(
      'Your wallet is on a different network. Switch it to Arbitrum One and try again.',
    );
    expect(friendlyWalletError({ code: 4902, message: 'Unrecognized chain ID' })).toMatch(/different network/);
  });

  it('distinguishes missing gas from a missing token balance', () => {
    expect(friendlyWalletError({ name: 'InsufficientFundsError', message: 'x' }, 'Arbitrum Sepolia')).toMatch(/ETH on Arbitrum Sepolia/);
    expect(friendlyWalletError({ shortMessage: 'execution reverted: ERC20: transfer amount exceeds balance' })).toMatch(/enough of the token/);
  });

  it('passes other messages through and never returns an empty string', () => {
    expect(friendlyWalletError(new Error('Hyperliquid rejected the withdrawal.'))).toBe('Hyperliquid rejected the withdrawal.');
    expect(friendlyWalletError(undefined)).toMatch(/Something went wrong/);
  });
});
