import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const releases = JSON.parse(readFileSync(new URL('../src/lib/source-releases.json', import.meta.url)));
const origin = 'https://www.civalsystems.com';
const catalog = await (await fetch(`${origin}/api/store/catalog`)).json();
const browser = await chromium.launch({ headless: true });
const checks = [];
try {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    for (const [id, release] of Object.entries(releases)) {
      assert(catalog.products.some(p => p.id === id && p.available && p.version === release.version), `Catalog unavailable: ${id}`);
      const response = await page.goto(`${origin}/store/${id}`, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      const result = await page.evaluate(() => ({
        heading: document.querySelector('h1')?.textContent,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        brokenImages: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src')),
        text: document.body.innerText,
      }));
      assert(!result.overflow, `${id} overflows at ${width}px`);
      assert.equal(result.brokenImages.length, 0, `${id} has broken images`);
      assert(/source|framework/i.test(result.text), `${id} lacks scope disclosure`);
      assert(!/purchases (?:are )?paused|not yet available/i.test(result.text), `${id} still shows sale hold`);
      checks.push({ id, width, heading: result.heading, noHorizontalOverflow: true, imagesLoaded: true, scopeDisclosed: true });
    }
    await page.close();
  }
  const report = { checkedAt: new Date().toISOString(), result: 'PASS', checks };
  writeFileSync('C:/GWDS/artifacts/published-source-pages-20260928.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
