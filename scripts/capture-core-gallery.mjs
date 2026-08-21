import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.argv[2] || 'https://cival-core-v2-template.vercel.app';
const output = path.resolve('public/images/products/core-v2');
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 });
const failures = [];
page.on('console', (message) => {
  if (message.type() === 'error') failures.push(`console:${message.text()}`);
});
page.on('pageerror', (error) => failures.push(`page:${error.message}`));

await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.screenshot({ path: path.join(output, 'overview.png'), fullPage: true });

for (const [label, filename] of [
  ['Paper Desk', 'paper-desk.png'],
  ['Agents', 'agents.png'],
  ['Settings', 'settings.png'],
]) {
  await page.getByRole('button', { name: new RegExp(label) }).click();
  await page.screenshot({ path: path.join(output, filename), fullPage: true });
}

await browser.close();
if (failures.length) throw new Error(`Gallery capture found browser errors:\n${failures.join('\n')}`);
console.log(`Captured verified Core 2.0 gallery from ${baseUrl} into ${output}`);
