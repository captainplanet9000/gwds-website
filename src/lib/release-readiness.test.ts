import { describe, expect, it } from 'vitest';
import { products } from './products';
import { needsReleaseAcceptance, matchesSourceRelease } from './release-readiness';
import releases from './source-releases.json';

describe('source archive acceptance gate', () => {
  it('permits advertised frameworks only with their registered exact archive', () => {
    for (const product of products.filter(p => !p.legacy)) {
      expect(needsReleaseAcceptance(product.id)).toBe(false);
      const release = releases[product.id as keyof typeof releases];
      expect(release).toBeDefined();
      expect(matchesSourceRelease(product.id, release.sha256, release.bytes, release.version)).toBe(true);
      expect(matchesSourceRelease(product.id, 'wrong-hash', release.bytes, release.version)).toBe(false);
      expect(matchesSourceRelease(product.id, release.sha256, release.bytes + 1, release.version)).toBe(false);
      expect(matchesSourceRelease(product.id, release.sha256, release.bytes, 'stale-version')).toBe(false);
    }
  });
  it('does not gate managed hosting plans', () => {
    expect(needsReleaseAcceptance('solo')).toBe(false);
  });
});
