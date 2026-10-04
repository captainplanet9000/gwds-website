import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { products } from './products';
import releases from './source-releases.json';
import { productGuides, productGuideHref } from './product-learning';

describe('Customer product documentation', () => {
  it('covers every current product once and matches the registered release', () => {
    expect(productGuides.map(g => g.id).sort()).toEqual(products.filter(p => !p.legacy).map(p => p.id).sort());
    for (const guide of productGuides) {
      const release = releases[guide.id as keyof typeof releases];
      expect(guide.version).toBe(release.version);
      expect(guide.sha256).toBe(release.sha256);
      expect(guide.tutorial.length).toBeGreaterThanOrEqual(5);
      expect(guide.acceptance.length).toBeGreaterThanOrEqual(6);
      expect(guide.limits).toContain('source software');
    }
  });
  it('ships readable manuals, tutorial downloads, checklists and captioned videos', () => {
    for (const guide of productGuides) {
      for (const file of ['guide.pdf','guide.md','tutorial.md','acceptance-checklist.md','documentation.zip']) {
        expect(existsSync(join('public/docs/products', guide.id, file)), `${guide.id}/${file}`).toBe(true);
      }
      expect(readFileSync(join('public/docs/products', guide.id, 'guide.pdf')).subarray(0,5).toString()).toBe('%PDF-');
      for (const video of guide.videos) {
        for (const ext of ['mp4','png','vtt']) expect(existsSync(join('public/tutorials', `${video}.${ext}`))).toBe(true);
        expect(readFileSync(join('public/tutorials', `${video}.vtt`), 'utf8')).toMatch(/^WEBVTT/);
      }
      if (guide.defaultConfig) expect(JSON.parse(readFileSync(join('public/docs/products',guide.id,'default-config.json'),'utf8'))).toEqual(guide.defaultConfig);
    }
  });
  it('keeps legacy customers on general setup rather than a nonexistent guide', () => {
    expect(productGuideHref('legacy-product')).toBe('/docs/setup');
    expect(productGuideHref('darvas-indicator')).toBe('/docs/products/darvas-indicator');
  });
});
