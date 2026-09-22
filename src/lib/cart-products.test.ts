import { describe, expect, it } from 'vitest';
import { normalizeCartProducts, redundantCartProducts } from './cart-products';

describe('edition license coverage', () => {
  it('removes Darvas when Core is purchased, in either order', () => {
    for (const ids of [['darvas-indicator', 'trading-dashboard-template'], ['trading-dashboard-template', 'darvas-indicator']]) {
      expect(normalizeCartProducts(ids).map(p => p.id)).toEqual(['trading-dashboard-template']);
    }
  });
  it('replaces Core and included agents with Trader', () => {
    expect(normalizeCartProducts(['trading-dashboard-template', 'elliott-wave-agent', 'multi-strat-bundle']).map(p => p.id)).toEqual(['multi-strat-bundle']);
  });
  it('retains a separately required agent with Core', () => {
    expect(normalizeCartProducts(['trading-dashboard-template', 'vwap-momentum-agent'])).toHaveLength(2);
  });
  it('rejects duplicate, unknown and retired products during cart restoration', () => {
    expect(normalizeCartProducts(['darvas-indicator', 'darvas-indicator', 'unknown', 'meme-trading-suite']).map(p => p.id)).toEqual(['darvas-indicator']);
  });
  it('identifies overlapping items for server-side checkout rejection', () => {
    expect(redundantCartProducts(['trading-dashboard-template', 'darvas-indicator'])).toEqual(['darvas-indicator']);
  });
});
