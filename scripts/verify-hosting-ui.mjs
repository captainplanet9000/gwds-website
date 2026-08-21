import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

function loadEnv(path) {
  const result = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index < 1) continue;
    let value = line.slice(index + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = JSON.parse(value);
    result[line.slice(0, index)] = value;
  }
  return result;
}

const baseUrl = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const env = loadEnv(process.argv[3] || '.env.local');
if (!env.GWDS_ADMIN_PASSWORD) throw new Error('GWDS_ADMIN_PASSWORD is required for the operator UI check');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const unexpectedConsoleErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error' && !message.text().includes('status of 401')) unexpectedConsoleErrors.push(message.text());
});

await page.goto(`${baseUrl}/hosted`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(800);
const publicCheck = {
  heading: await page.getByRole('heading', { name: "Don't want to run it? We'll run it." }).count(),
  gateCopy: await page.getByText('The control plane is built. Runtime activation stays gated.').count(),
  errorOverlay: await page.locator('[data-nextjs-dialog]').count(),
};

await page.goto(`${baseUrl}/account/hosting`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(900);
const customerRedirect = page.url();

await page.goto(`${baseUrl}/admin`, { waitUntil: 'domcontentloaded' });
await page.getByPlaceholder('Enter password').fill(env.GWDS_ADMIN_PASSWORD);
await page.getByRole('button', { name: 'Sign In' }).click();
await page.waitForTimeout(1200);
await page.goto(`${baseUrl}/admin/hosting`, { waitUntil: 'domcontentloaded' });
await page.getByRole('heading', { name: 'Hosting Operations' }).waitFor();
await page.screenshot({ path: 'tmp/admin-hosting-check.png', fullPage: true });
const operatorCheck = {
  heading: await page.getByRole('heading', { name: 'Hosting Operations' }).count(),
  headingBox: await page.getByRole('heading', { name: 'Hosting Operations' }).boundingBox(),
  headingStyle: await page.getByRole('heading', { name: 'Hosting Operations' }).evaluate((element) => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return { color: style.color, opacity: style.opacity, visibility: style.visibility, display: style.display, topElement: document.elementFromPoint(box.left + 5, box.top + 5)?.tagName };
  }),
  gateClosed: await page.getByText('Production activation gate is closed.').count(),
  gateBox: await page.getByText('Production activation gate is closed.').boundingBox(),
  tabs: await page.getByRole('button').allTextContents(),
  ciphertextVisible: (await page.locator('body').innerText()).includes('ciphertext'),
  errorOverlay: await page.locator('[data-nextjs-dialog]').count(),
  sidebarBox: await page.locator('.admin-sidebar-wrap').boundingBox(),
  navBox: await page.locator('.admin-sidebar-wrap nav').boundingBox(),
  userPillBox: await page.getByText('Superuser').locator('..').locator('..').boundingBox(),
};

const adminResponse = await page.request.get(`${baseUrl}/api/admin/hosting`);
const result = {
  baseUrl,
  publicCheck,
  customerRedirect,
  operatorCheck,
  adminApiStatus: adminResponse.status(),
  unexpectedConsoleErrors,
};
console.log(JSON.stringify(result, null, 2));
await browser.close();

if (publicCheck.heading !== 1 || publicCheck.gateCopy !== 1 || publicCheck.errorOverlay !== 0
  || !customerRedirect.includes('/account/login?next=/account/hosting')
  || operatorCheck.heading !== 1 || operatorCheck.gateClosed !== 1 || operatorCheck.errorOverlay !== 0
  || operatorCheck.ciphertextVisible || adminResponse.status() !== 200 || unexpectedConsoleErrors.length) {
  process.exitCode = 1;
}
