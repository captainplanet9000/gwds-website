import { describe, expect, it } from 'vitest';
import { summarizeHyperliquidAccount } from './hyperliquid-account';

describe('summarizeHyperliquidAccount', () => {
  it('uses spot USDC once for unified accounts', () => {
    expect(summarizeHyperliquidAccount(
      'unifiedAccount',
      { marginSummary: { accountValue: '60.55', totalMarginUsed: '60.61' }, withdrawable: '0' },
      { balances: [{ coin: 'USDC', total: '989.50', hold: '60.61' }] },
    )).toEqual({ abstraction: 'unifiedAccount', accountValueUsd: 989.5, availableUsd: 928.89, marginUsedUsd: 60.61 });
  });

  it('adds separate ledgers for standard accounts', () => {
    expect(summarizeHyperliquidAccount(
      'disabled',
      { marginSummary: { accountValue: '100', totalMarginUsed: '20' }, withdrawable: '80' },
      { balances: [{ coin: 'USDC', total: '50', hold: '5' }] },
    )).toEqual({ abstraction: 'disabled', accountValueUsd: 150, availableUsd: 125, marginUsedUsd: 25 });
  });
});
