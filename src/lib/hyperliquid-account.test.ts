import { afterEach, describe, expect, it, vi } from 'vitest';
import { readAgentApproval, summarizeHyperliquidAccount } from './hyperliquid-account';

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

describe('readAgentApproval', () => {
  const owner = '0x1111111111111111111111111111111111111111';
  const agent = '0x2222222222222222222222222222222222222222';
  afterEach(() => vi.unstubAllGlobals());

  it('accepts only a venue agent role bound to the expected owner', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ role: 'agent', data: { user: owner.toUpperCase() } }) }));
    expect(await readAgentApproval('https://api.hyperliquid-testnet.xyz', agent, owner)).toBe(true);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ role: 'agent', data: { user: agent } }) }));
    expect(await readAgentApproval('https://api.hyperliquid-testnet.xyz', agent, owner)).toBe(false);
  });

  it('distinguishes an unapproved wallet from an unavailable venue check', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ role: 'missing' }) }));
    expect(await readAgentApproval('https://api.hyperliquid-testnet.xyz', agent, owner)).toBe(false);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    expect(await readAgentApproval('https://api.hyperliquid-testnet.xyz', agent, owner)).toBe(null);
  });
});
