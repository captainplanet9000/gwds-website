import { describe, expect, it } from 'vitest';
import { FUNDING_NETWORKS, normalizeAmount, withdrawDomain } from './hyperliquid-funding';
import { bridgeAddress, usdcAddress } from './hyperliquid-network';
import { buildApproveAgentRequest } from './hyperliquid-agent';

describe('funding network constants', () => {
  it("uses Hyperliquid's USDC2 on testnet, not Circle's Sepolia USDC", () => {
    expect(FUNDING_NETWORKS.testnet.usdc).toBe('0x1baAbB04529D43a73232B713C0FE471f7c7334d5');
    expect(FUNDING_NETWORKS.testnet.usdcSymbol).toBe('USDC2');
    expect(usdcAddress('testnet')).toBe(FUNDING_NETWORKS.testnet.usdc);
    expect(usdcAddress('mainnet')).toBe('0xaf88d065e77c8cC2239327C5EDb3A432268e5831');
  });

  it('takes the bridge from the per-network constants', () => {
    expect(bridgeAddress('mainnet')).toBe('0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7');
    expect(bridgeAddress('testnet')).toBe('0x08cfc1B6b2dCF36A1480b99353A354AA8AC56f89');
  });

  it('signs user actions for the Arbitrum chain of the network', () => {
    expect(withdrawDomain(FUNDING_NETWORKS.mainnet).chainId).toBe(42161);
    expect(withdrawDomain(FUNDING_NETWORKS.testnet).chainId).toBe(421614);
    const { action, typedData } = buildApproveAgentRequest(`0x${'22'.repeat(20)}`, 'agent', 'testnet');
    expect(action).toMatchObject({ hyperliquidChain: 'Testnet', signatureChainId: '0x66eee' });
    expect(typedData.domain.chainId).toBe(421614);
  });
});

describe('normalizeAmount', () => {
  it.each([
    ['010.500', '10.5'],
    ['25', '25'],
    ['0.000001', '0.000001'],
    ['7.0', '7'],
  ])('normalizes %s to %s', (raw, expected) => expect(normalizeAmount(raw)).toBe(expected));

  it.each(['', '-1', '1e3', '1.1234567', 'abc', '.5'])('rejects %j', raw => expect(normalizeAmount(raw)).toBeNull());
});
