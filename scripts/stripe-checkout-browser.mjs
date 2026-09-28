function assert(value, message) { if (!value) throw new Error(message); }
export async function fillCard(page, url, cardNumber, expectSuccess, baseUrl, successPath = '/checkout/success') {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const cardChoices = [
    page.getByRole('radio', { name: /^Card$/i }).first(),
    page.locator('[data-testid="card-accordion-item"]').first(),
    page.locator('[data-testid="payment-method-accordion-item"]').filter({ hasText: /^Card$/i }).first(),
    page.locator('button').filter({ hasText: /^Card$/i }).first(),
    page.getByText(/^Card$/i).last(),
  ];
  for (const choice of cardChoices) {
    if (await choice.count() && await choice.isVisible().catch(() => false)) {
      await choice.click({ force: true }).catch(() => undefined);
      await page.waitForTimeout(500);
    }
  }

  async function paymentField(selectors, label) {
    for (const frame of page.frames()) {
      for (const selector of selectors) {
        const candidate = frame.locator(selector).first();
        if (await candidate.count()) return candidate;
      }
    }
    const inputs = [];
    for (const frame of page.frames()) {
      const frameInputs = await frame.locator('input').evaluateAll((nodes) => nodes.slice(0, 30).map((node) => ({
        type: node.type,
        name: node.name,
        id: node.id,
        placeholder: node.placeholder,
        autocomplete: node.autocomplete,
        ariaLabel: node.getAttribute('aria-label'),
      }))).catch(() => []);
      if (frameInputs.length) inputs.push({ frame: frame.url(), inputs: frameInputs });
    }
    const diagnostics = {
      url: page.url(),
      title: await page.title(),
      text: (await page.locator('body').innerText().catch(() => '')).slice(0, 700),
      inputs,
    };
    throw new Error(`${label} field was not found: ${JSON.stringify(diagnostics)}`);
  }

  await (await paymentField(['input[name="cardNumber"]', 'input[autocomplete="cc-number"]', '#cardNumber', 'input[placeholder*="1234"]'], 'Card number')).fill(cardNumber);
  await (await paymentField(['input[name="cardExpiry"]', 'input[autocomplete="cc-exp"]', '#cardExpiry', 'input[placeholder*="MM"]'], 'Expiry')).fill('12 / 30');
  await (await paymentField(['input[name="cardCvc"]', 'input[autocomplete="cc-csc"]', '#cardCvc', 'input[placeholder="CVC"]'], 'CVC')).fill('123');
  const linkSave = page.getByRole('checkbox', { name: /Save my information/i }).first();
  if (await linkSave.count() && await linkSave.isChecked().catch(() => false)) await linkSave.uncheck({ force: true });
  const name = page.locator('input[autocomplete="cc-name"], input[name="billingName"], input[placeholder="Name on card"], input[placeholder="Full name on card"]').first();
  if (await name.count()) await name.fill('Cival Stripe QA');
  const postal = page.locator('input[autocomplete="postal-code"], input[name="postalCode"], input[placeholder="ZIP"], input[placeholder="Postal code"]').first();
  if (await postal.count()) await postal.fill('94107');
  await page.locator('[data-testid="hosted-payment-submit-button"]').click();
  if (expectSuccess) {
    try {
      await page.waitForURL(`${baseUrl}${successPath}**`, { timeout: 45_000 });
    } catch {
      const current = new URL(page.url());
      throw new Error(`Stripe Checkout did not redirect after payment: ${JSON.stringify({
        location: `${current.origin}${current.pathname}`,
        text: (await page.locator('body').innerText().catch(() => '')).slice(-1400),
      })}`);
    }
  } else {
    await page.waitForTimeout(2500);
    assert(page.url().includes('checkout.stripe.com'), 'Declined card unexpectedly left Stripe Checkout.');
    const body = (await page.locator('body').innerText()).toLowerCase();
    assert(body.includes('declined') || body.includes('card was declined'), 'Expected declined-card feedback was not shown.');
  }
}


