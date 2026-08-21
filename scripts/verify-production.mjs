import { chromium } from 'playwright';

const baseUrl = (process.argv[2] || 'https://www.civalsystems.com').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const consoleErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});

const routeChecks = {};
const routes = [
  ['/', 'Your paper-trading command center.'],
  ['/store', 'One verified release'],
  ['/store/trading-dashboard-template', 'Cival Core'],
  ['/hosted', "Don't want to run it? We'll run it."],
  ['/status', 'Service status'],
  ['/docs/setup', 'Cival Core'],
  ['/account/login', 'Sign in'],
  ['/account/register', 'Create'],
  ['/contact', 'Contact'],
  ['/terms', 'Terms of Service'],
  ['/privacy', 'Privacy'],
  ['/refunds', 'Refund'],
  ['/disclaimer', 'Disclaimer'],
  ['/hosting-terms', 'Hosting'],
];

try {
  for (const [route, expectedText] of routes) {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.waitForTimeout(400);
    const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    routeChecks[route] = {
      status: response?.status() || 0,
      expectedText: body.toLowerCase().includes(expectedText.toLowerCase()),
      errorOverlay: await page.locator('[data-nextjs-dialog]').count(),
    };
  }

  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 45_000 });
  const home = {
    accent: await page.locator('.cival').first().evaluate((node) => getComputedStyle(node).getPropertyValue('--color-accent').trim()),
    heroCanvas: await page.locator('[data-hero-bg] canvas').count(),
    demoHref: await page.getByRole('link', { name: /interactive demo/i }).getAttribute('href'),
  };

  await page.goto(`${baseUrl}/store`, { waitUntil: 'networkidle', timeout: 45_000 });
  const productLinks = [...new Set(await page.locator('a[href^="/store/"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')).filter(Boolean)))];

  await page.goto(`${baseUrl}/store/trading-dashboard-template`, { waitUntil: 'networkidle', timeout: 45_000 });
  const galleryImages = await page.locator('img[src*="core-v2"]').evaluateAll((images) => images.map((img) => ({
    src: img.getAttribute('src'),
    loaded: img.complete && img.naturalWidth >= 1000 && img.naturalHeight >= 500,
  })));
  const gallery = [...new Map(galleryImages.map((image) => [image.src, image])).values()];

  const legacy = await page.request.get(`${baseUrl}/store/meme-trading-suite`);
  const demo = await page.request.get('https://cival-core-v2-template.vercel.app');
  const api = {
    checkoutPaused: (await page.request.post(`${baseUrl}/api/checkout`, { data: {} })).status(),
    hostingCheckoutPaused: (await page.request.post(`${baseUrl}/api/hosting/checkout`, { data: {} })).status(),
    credentialVaultRemoved: (await page.request.post(`${baseUrl}/api/hosting/credentials`, { data: {} })).status(),
    adminProtected: (await page.request.get(`${baseUrl}/api/admin/hosting`)).status(),
    cronProtected: (await page.request.get(`${baseUrl}/api/cron/hosting-provision`)).status(),
  };

  const result = {
    baseUrl,
    routeChecks,
    home,
    productLinks,
    gallery,
    legacyProductStatus: legacy.status(),
    demoStatus: demo.status(),
    api,
    consoleErrors,
  };
  console.log(JSON.stringify(result, null, 2));

  const routesPass = Object.values(routeChecks).every((check) => check.status === 200 && check.expectedText && check.errorOverlay === 0);
  const pass = routesPass
    && home.accent.toLowerCase() === '#4ade9f'
    && home.heroCanvas === 1
    && home.demoHref === 'https://cival-core-v2-template.vercel.app'
    && productLinks.length === 1 && productLinks[0] === '/store/trading-dashboard-template'
    && gallery.length === 4 && gallery.every((image) => image.loaded)
    && legacy.status() === 404 && demo.status() === 200
    && api.checkoutPaused === 503 && api.hostingCheckoutPaused === 503
    && api.credentialVaultRemoved === 410 && api.adminProtected === 401 && api.cronProtected === 401
    && consoleErrors.length === 0;
  if (!pass) process.exitCode = 1;
} finally {
  await browser.close();
}
