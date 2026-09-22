import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { products } from './products';
import { productMedia } from './product-media';
import dimensions from './product-capture-dimensions.json';

describe('published product screenshots', () => {
  it('covers every current product and gives each standalone agent its own hero', () => {
    const current = products.filter(p => !p.legacy);
    expect(current).toHaveLength(8);
    for (const p of current) {
      expect(productMedia[p.id].length).toBeGreaterThanOrEqual(4);
      expect(p.image).toBe(productMedia[p.id][0].src);
    }
    expect(new Set(current.filter(p => p.productType === 'agent').map(p => p.image)).size).toBe(6);
  });

  it('ships each captioned image as a real JPEG with accurate dimensions', async () => {
    for (const image of Object.values(productMedia).flat()) {
      const file = join(process.cwd(), 'public', image.src);
      expect(existsSync(file), image.src).toBe(true);
      const bytes = readFileSync(file);
      expect(bytes.subarray(0,3).toString('hex')).toBe('ffd8ff');
      const metadata = await sharp(bytes).metadata();
      const measured = (dimensions as Record<string,{width:number;height:number}>)[image.src.split('/').pop()!];
      expect(measured).toEqual({width:metadata.width,height:metadata.height});
      expect(image.caption.length).toBeGreaterThan(40);
      expect(new URL(image.sourceUrl).protocol).toBe('https:');
    }
  });
});
