import { describe, expect, it } from 'vitest';
import {
  COMMERCE_VERSIONS,
  CommerceError,
  hashDownloadToken,
  newDownloadToken,
  normalizeCoupon,
  normalizeName,
} from './commerce';
import { getProduct, products } from './products';

describe('commerce input boundaries', () => {
  it('normalizes customer names without control characters', () => {
    expect(normalizeName('  Ada\n\tLovelace  ')).toBe('Ada Lovelace');
    expect(normalizeName(42)).toBe('');
  });

  it('normalizes safe coupon codes and rejects unsafe input', () => {
    expect(normalizeCoupon(' cival-25 ')).toBe('CIVAL-25');
    expect(normalizeCoupon('')).toBeNull();
    expect(() => normalizeCoupon('<script>')).toThrow(CommerceError);
  });

  it('issues opaque download tokens and stores only deterministic hashes', () => {
    const token = newDownloadToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(hashDownloadToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashDownloadToken(token)).toBe(hashDownloadToken(token));
    expect(hashDownloadToken(newDownloadToken())).not.toBe(hashDownloadToken(token));
  });

  it('uses explicit legal document versions', () => {
    expect(COMMERCE_VERSIONS.terms).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(COMMERCE_VERSIONS.refunds).toBe(COMMERCE_VERSIONS.terms);
    expect(COMMERCE_VERSIONS.disclaimer).toBe(COMMERCE_VERSIONS.terms);
  });
});

describe('sellable catalog invariants', () => {
  const active = products.filter((product) => !product.legacy);

  it('has unique product and Stripe price identifiers', () => {
    expect(new Set(active.map((product) => product.id)).size).toBe(active.length);
    expect(new Set(active.map((product) => product.stripePriceId)).size).toBe(active.length);
  });

  it.each(active.map((product) => [product.id]))('%s has a complete paid-download configuration', (id) => {
    const product = getProduct(id);
    expect(product).toBeDefined();
    expect(product!.price).toBeGreaterThanOrEqual(0.5);
    expect(product!.stripePriceId).toMatch(/^price_[A-Za-z0-9]+$/);
    expect(product!.downloadUrl).toMatch(/^downloads\/[a-z0-9.-]+\.zip$/);
  });

  it('marks every add-on as requiring the Core platform', () => {
    const addons = active.filter((product) => product.productType === 'agent' || product.productType === 'extension');
    expect(addons.length).toBeGreaterThan(0);
    expect(addons.every((product) => product.requiresDashboard === true)).toBe(true);
  });
});
