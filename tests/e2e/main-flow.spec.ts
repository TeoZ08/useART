import { expect, test, type BrowserContext, type Page } from '@playwright/test';

async function enterProtectedPreview(page: Page) {
  const shareUrl = process.env.PLAYWRIGHT_SHARE_URL;
  if (shareUrl) await page.goto(shareUrl, { waitUntil: 'domcontentloaded' });
}

async function recordGlbRequests(page: Page) {
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().endsWith('.glb')) requests.push(request.url());
  });
  return requests;
}

async function closeContext(context: BrowserContext) {
  await context.close();
}

test.beforeEach(async ({ page }) => enterProtectedPreview(page));

test('home preserves the editorial experience and loads the interactive 3D hero', async ({
  page,
}) => {
  const glbRequests = await recordGlbRequests(page);
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Conforto em movimento', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver coleção' })).toBeVisible();
  await expect(page.getByTestId('hero-shirt-3d')).toHaveAttribute('data-state', 'ready', {
    timeout: 20_000,
  });
  await expect(page.getByTestId('hero-shirt-3d-canvas')).toBeVisible();
  expect(glbRequests.some((url) => url.endsWith('/models/useart-professional-shirt.glb'))).toBe(
    true,
  );
});

test('reduced motion and Save-Data keep the poster and do not request the GLB', async ({
  browser,
}) => {
  for (const mode of ['reduced', 'save-data'] as const) {
    const context = await browser.newContext({
      reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference',
    });
    const page = await context.newPage();
    if (mode === 'save-data') {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'connection', {
          configurable: true,
          value: { saveData: true },
        });
      });
    }
    await enterProtectedPreview(page);
    const glbRequests = await recordGlbRequests(page);
    await page.goto('/');
    await expect(page.getByTestId('hero-shirt-3d')).toHaveAttribute('data-state', 'fallback');
    await expect(page.getByTestId('hero-shirt-3d-poster')).toBeVisible();
    expect(glbRequests).toEqual([]);
    await closeContext(context);
  }
});

test('catalog, product, Kit and cart use the remote commerce flow', async ({ page }) => {
  await page.goto('/');
  const fallbackVisible = (await page.getByTestId('catalog-fallback').count()) > 0;
  await expect(
    page.getByRole('link', { name: /Camiseta Híbrida - logo lateral/i }).first(),
  ).toBeVisible();
  await page.goto('/produto/camiseta-hibrida-logo-lateral');
  await expect(page.getByTestId('purchase-panel')).toBeVisible();
  if (fallbackVisible) {
    await expect(page.getByTestId('add-to-cart')).toBeDisabled();
    await expect(page.getByText(/compra indisponível enquanto o catálogo remoto/i)).toBeVisible();
    return;
  }
  await page.getByLabel('Selecionar cor Preto').click();
  await page.getByTestId('add-to-cart').click();
  await page.goto('/carrinho');
  await expect(page.getByText('Cor: Preto')).toBeVisible();

  await page.goto('/produto/kit-selecao-3-camisetas');
  for (const pieceName of ['Peça 1', 'Peça 2', 'Peça 3']) {
    await expect(page.getByRole('group', { name: pieceName })).toBeVisible();
  }
});

test('checkout page, public tracking and admin protection are reachable', async ({ page }) => {
  await page.goto('/checkout');
  await expect(page.getByRole('heading', { name: 'Criar pedido' })).toBeVisible();

  await page.goto('/pedido/token-inexistente');
  await expect(page.locator('body')).toBeVisible();

  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole('heading', { name: 'Administração' })).toBeVisible();
  await expect(
    page.getByText('Acesso somente para usuários convidados. Não há cadastro público.'),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /criar conta|cadastro|signup/i })).toHaveCount(0);
});

test('published staging creates and tracks a server-priced local order', async ({ page }) => {
  test.skip(
    process.env.RUN_ORDER_SMOKE !== 'true',
    'Executado somente contra o Preview de staging.',
  );

  await page.goto('/produto/camiseta-hibrida-logo-lateral');
  await page.getByLabel('Selecionar cor Preto').click();
  await page.getByTestId('add-to-cart').click();
  await page.goto('/carrinho');
  await page.getByPlaceholder('PRIMEIRACOMPRA').fill('PRIMEIRACOMPRA');
  await page.getByTestId('go-to-checkout').click();

  await page.getByLabel('Nome').fill('Smoke Preview');
  await page.getByLabel('WhatsApp').fill('+55 67 99999-0101');
  await page.getByRole('button', { name: /Entrega em Campo Grande\/MS/i }).click();
  await page.getByLabel('CEP').fill('79000-000');
  await page.getByLabel('Rua').fill('Rua Teste');
  await page.getByLabel('Número').fill('101');
  await page.getByLabel('Bairro').fill('Centro');
  await page.getByRole('textbox', { name: 'Cidade', exact: true }).fill('Campo Grande');
  await page.getByRole('checkbox').check();

  const orderResponse = page.waitForResponse((response) =>
    response.url().endsWith('/api/checkout/create-order'),
  );
  await page.getByRole('button', { name: 'Confirmar e criar pedido' }).click();
  const response = await orderResponse;
  const body = (await response.json()) as { orderCode: string; error?: string };
  expect(response.status(), body.error).toBe(201);
  expect(body.orderCode).toMatch(/^ART-/);
  await expect(page.getByTestId('order-created')).toContainText(body.orderCode);
  await page.getByRole('link', { name: 'Acompanhar pedido' }).click();
  await expect(page.getByRole('heading', { name: body.orderCode })).toBeVisible();
  await expect(page.getByText('R$ 50,50')).toBeVisible();
});

test('mobile storefront has no horizontal overflow and keeps core navigation usable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Conforto em movimento', exact: true }),
  ).toBeVisible();
  expect(await page.locator('html').evaluate((html) => html.scrollWidth === html.clientWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.getByRole('dialog', { name: 'Menu principal' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Menu' })).toBeFocused();
});

test('storefront navigation has no page, console or first-party asset errors', async ({ page }) => {
  const issues: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') issues.push(message.text());
  });
  page.on('pageerror', (error) => issues.push(error.message));
  page.on('response', (response) => {
    const origin = new URL(page.url()).origin;
    if (response.status() >= 400 && response.url().startsWith(origin)) {
      issues.push(`${response.status()} ${response.url()}`);
    }
  });

  for (const path of ['/', '/produto/camiseta-hibrida-logo-central', '/carrinho', '/checkout']) {
    await page.goto(path);
    await expect(page.locator('body')).toBeVisible();
  }
  expect(
    issues.filter(
      (issue) =>
        !issue.includes('catalog.remote_unavailable') &&
        !issue.includes('catalog.product_remote_unavailable'),
    ),
  ).toEqual([]);
});
