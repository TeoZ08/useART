import { expect, test } from '@playwright/test';

test('editorial home presents the collection with a single primary action', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Conforto em movimento', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explorar coleção' })).toBeVisible();
  await expect(
    page.getByLabel('Conforto em movimento').getByRole('link', { name: 'Falar com a ART' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Peças para acompanhar o ritmo' })).toBeVisible();
});

test('hero keeps an interactive CTA while the transparent video is decorative', async ({
  page,
}) => {
  await page.goto('/');

  const poster = page.getByTestId('hero-shirt-poster');
  const video = page.getByTestId('hero-shirt-video');
  await expect(poster).toBeVisible();
  await expect(video).toBeAttached();
  await expect(video.locator('source')).toHaveAttribute(
    'src',
    '/videos/useart-hero-transparente.webm',
  );
  await expect(video).toHaveAttribute('preload', 'metadata');
  await expect(video).toHaveAttribute('tabindex', '-1');
  await expect(video).toHaveCSS('pointer-events', 'none');

  await page.getByRole('link', { name: 'Explorar coleção' }).click();
  await expect(page).toHaveURL(/#colecao$/);
  await expect.poll(() => video.evaluate((element) => element.paused)).toBe(true);

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(() => video.evaluate((element) => element.paused)).toBe(false);
});

test('hero uses only the poster for reduced motion and without JavaScript', async ({ browser }) => {
  const reducedMotionContext = await browser.newContext({ reducedMotion: 'reduce' });
  const reducedMotionPage = await reducedMotionContext.newPage();
  await reducedMotionPage.goto('/');

  await expect(reducedMotionPage.getByTestId('hero-shirt-poster')).toBeVisible();
  await expect(reducedMotionPage.getByTestId('hero-shirt-video')).toHaveCount(0);
  await reducedMotionContext.close();

  const noJavaScriptContext = await browser.newContext({ javaScriptEnabled: false });
  const noJavaScriptPage = await noJavaScriptContext.newPage();
  await noJavaScriptPage.goto('/');

  await expect(noJavaScriptPage.getByTestId('hero-shirt-poster')).toBeVisible();
  await expect(
    noJavaScriptPage.getByRole('heading', { name: 'Conforto em movimento', exact: true }),
  ).toBeVisible();
  await expect(noJavaScriptPage.getByRole('link', { name: 'Explorar coleção' })).toBeVisible();
  await noJavaScriptContext.close();
});

test('hero keeps the poster when data saving is enabled', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: {
        saveData: true,
        addEventListener() {},
        removeEventListener() {},
      },
    });
  });
  await page.goto('/');

  await expect(page.getByTestId('hero-shirt-poster')).toBeVisible();
  await expect(page.getByTestId('hero-shirt-video')).toHaveCount(0);
});

test('home header changes contrast after scroll and mobile hero has no overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.locator('header')).toHaveCSS('color', 'rgb(241, 239, 234)');
  expect(await page.locator('html').evaluate((html) => html.scrollWidth === html.clientWidth)).toBe(
    true,
  );

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => window.scrollTo(0, 850));
  await expect(page.locator('header')).toHaveCSS('color', 'rgb(9, 9, 9)');
  await expect(page.locator('header')).toHaveCSS('position', 'fixed');
});

test('customer can prepare an assisted WhatsApp order', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Conforto em movimento', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: /Camiseta Híbrida - logo lateral/i })
    .first()
    .click();
  const blackSwatch = page.getByLabel('Selecionar cor Preto');
  await blackSwatch.click();
  await expect(blackSwatch).toHaveAttribute('aria-pressed', 'true');
  await page.getByTestId('add-to-cart').click();
  await expect(page.getByText('Produto adicionado ao carrinho.')).toBeVisible();

  await page.goto('/carrinho');
  await page.getByPlaceholder('PRIMEIRACOMPRA').fill('PRIMEIRACOMPRA');
  await page.getByTestId('go-to-checkout').click();

  await page.getByLabel('Nome').fill('Cliente Teste');
  await page.getByLabel('WhatsApp').fill('+55 67 99999-0000');
  await page.getByRole('button', { name: /Entrega em Campo Grande\/MS/i }).click();
  await page.getByLabel('CEP').fill('79000-000');
  await page.getByLabel('Rua').fill('Rua Teste');
  await page.getByLabel('Número').fill('123');
  await page.getByLabel('Bairro').fill('Centro');
  await page.getByLabel('Cidade').fill('Campo Grande');

  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Abrir pedido no WhatsApp' }).click();
  const popup = await popupPromise;

  await expect(page.getByTestId('prepared-message')).toBeVisible();
  expect(popup.url()).toContain('5567991691441');
});

test('customer can add Kit Selecao with three independent configurations', async ({ page }) => {
  await page.goto('/produto/kit-selecao-3-camisetas/');

  await page
    .getByRole('group', { name: 'Peça 1' })
    .getByLabel('Aplicação')
    .selectOption('logo-lateral');
  await page.getByRole('group', { name: 'Peça 1' }).getByLabel('Cor').selectOption('preto');
  await page.getByRole('group', { name: 'Peça 1' }).getByLabel('Tamanho').selectOption('P');

  await page
    .getByRole('group', { name: 'Peça 2' })
    .getByLabel('Aplicação')
    .selectOption('logo-central');
  await page
    .getByRole('group', { name: 'Peça 2' })
    .getByLabel('Cor')
    .selectOption('branco-off-white');
  await page.getByRole('group', { name: 'Peça 2' }).getByLabel('Tamanho').selectOption('M');

  await page
    .getByRole('group', { name: 'Peça 3' })
    .getByLabel('Aplicação')
    .selectOption('assinatura-lateral');
  await page.getByRole('group', { name: 'Peça 3' }).getByLabel('Cor').selectOption('marrom');
  await page.getByRole('group', { name: 'Peça 3' }).getByLabel('Tamanho').selectOption('G');

  await page.getByTestId('add-to-cart').click();
  await page.goto('/carrinho/');

  await expect(page.getByText('Peça 1: Logo lateral, Preto, tamanho P')).toBeVisible();
  await expect(page.getByText('Peça 2: Logo central, Branco/off-white, tamanho M')).toBeVisible();
  await expect(page.getByText('Peça 3: Assinatura lateral, Marrom, tamanho G')).toBeVisible();
});

test('mobile storefront renders catalog entry points', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Conforto em movimento', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Camiseta Híbrida - logo lateral/i }).first(),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Abrir carrinho' })).toBeVisible();

  await page.getByRole('button', { name: 'Menu' }).click();
  const menu = page.getByRole('dialog', { name: 'Menu principal' });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('link', { name: 'Coleção' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Menu' })).toBeFocused();
});
