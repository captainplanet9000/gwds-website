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

// Verifies the PRE-LAUNCH state of /hosted: the sales gate is expected to be shut. When the owner
// opens it, `gateDisclosed` below is the one assertion that must be revisited; every other check
// here stays correct on both sides of the gate.
await page.goto(`${baseUrl}/hosted`, { waitUntil: 'networkidle' });
const hostedText = await page.locator('body').innerText();
const publicCheck = {
  heading: await page.getByRole('heading', { name: "Don't want to run it? We'll run it." }).count(),
  // Inverted on purpose, and this is the point of the check rather than an incidental detail.
  // This script used to REQUIRE the words "paper-only" on /hosted, from when every tier was
  // simulated. The paid tiers now sell live agents, so that same assertion had quietly become a
  // guard holding the retired claim in place. It is now a guard against the claim coming back:
  // "paper-only" describes the whole hosted service and is false on three of the four tiers.
  paperOnlyClaim: /paper[-\s]?only/i.test(hostedText),
  // The two halves of the current, true story. Both must be on the page: dropping the first
  // oversells the free tier, dropping the second undersells the risk on the paid ones.
  freeTierSimulated: /simulated fills/i.test(hostedText),
  livePlansDisclosed: /run live agents/i.test(hostedText),
  launchGate: hostedText.includes('These plans are not on sale yet.'),
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

if (publicCheck.heading !== 1 || publicCheck.paperOnlyClaim
  || !publicCheck.freeTierSimulated || !publicCheck.livePlansDisclosed
  || !publicCheck.launchGate
  || publicCheck.secretPrompt || publicCheck.errorOverlay !== 0
  || !customerRedirect.includes('/account/login?next=/account/hosting')
  || !adminRedirect.includes('/admin') || !adminGate || adminApi.status() !== 401
  || credentialApi.status() !== 410 || unexpectedConsoleErrors.length) {
  process.exitCode = 1;
}
