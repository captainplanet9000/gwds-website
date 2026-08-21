import { chromium } from 'playwright';

const baseUrl = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const unexpectedConsoleErrors = [];

page.on('console', (message) => {
  if (message.type() === 'error' && !message.text().includes('status of 401')) {
    unexpectedConsoleErrors.push(message.text());
  }
});

await page.goto(`${baseUrl}/hosted`, { waitUntil: 'networkidle' });
const hostedText = await page.locator('body').innerText();
const publicCheck = {
  heading: await page.getByRole('heading', { name: "Don't want to run it? We'll run it." }).count(),
  paperOnly: hostedText.toLowerCase().includes('paper-only'),
  launchGate: hostedText.includes('Runtime activation stays gated'),
  secretPrompt: /seed phrase|private key|api-wallet secret/i.test(hostedText),
  errorOverlay: await page.locator('[data-nextjs-dialog]').count(),
};

await page.goto(`${baseUrl}/account/hosting`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(600);
const customerRedirect = page.url();

await page.goto(`${baseUrl}/admin/hosting`, { waitUntil: 'domcontentloaded' });
await page.getByText('Owner account and authenticator verification are required.')
  .waitFor({ state: 'visible', timeout: 8_000 })
  .catch(() => undefined);
const adminRedirect = page.url();
const adminText = await page.locator('body').innerText();
const adminGate = adminText.includes('Owner account and authenticator verification are required.')
  && adminText.includes('Shared admin passwords are disabled.');
const adminApi = await page.request.get(`${baseUrl}/api/admin/hosting`);
const credentialApi = await page.request.post(`${baseUrl}/api/hosting/credentials`, { data: {} });

const result = {
  baseUrl,
  publicCheck,
  customerRedirect,
  adminRedirect,
  adminGate,
  adminApiStatus: adminApi.status(),
  credentialApiStatus: credentialApi.status(),
  unexpectedConsoleErrors,
};
console.log(JSON.stringify(result, null, 2));
await browser.close();

if (publicCheck.heading !== 1 || !publicCheck.paperOnly || !publicCheck.launchGate
  || publicCheck.secretPrompt || publicCheck.errorOverlay !== 0
  || !customerRedirect.includes('/account/login?next=/account/hosting')
  || !adminRedirect.includes('/admin') || !adminGate || adminApi.status() !== 401
  || credentialApi.status() !== 410 || unexpectedConsoleErrors.length) {
  process.exitCode = 1;
}
