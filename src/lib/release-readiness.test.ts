import { describe, expect, it } from 'vitest';
import { products } from './products';
import { needsReleaseAcceptance } from './release-readiness';

describe('source archive acceptance gate', () => {
  it('holds all currently advertised source products until exact-archive validation', () => {
    for (const product of products.filter(p => !p.legacy)) {
      expect(needsReleaseAcceptance(product.id)).toBe(true);
    }
  });
  it('does not gate managed hosting plans', () => {
    expect(needsReleaseAcceptance('solo')).toBe(false);
  });
});
