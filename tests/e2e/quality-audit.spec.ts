import { expect, test, type Locator } from '@playwright/test';
import { getProducts } from '@/domain/products/products';

async function expectImageSource(locator: Locator, expected: string) {
  await expect(locator).toHaveAttribute('src', new RegExp(encodeURIComponent(expected), 'i'));
}

const productsWithColorMedia = getProducts().filter((product) =>
  product.colors.every((color) => Boolean(color.media?.src)),
);

for (const product of productsWithColorMedia) {
  test(`all declared colors update media for ${product.slug}`, async ({ page }) => {
    await page.goto(`/produto/${product.slug}/`);

    for (const color of product.colors) {
      const media = color.media!;
      await page.getByLabel(`Selecionar cor ${color.name}`).click();

      await expect(page.getByLabel(`Selecionar cor ${color.name}`)).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await expect(page.getByText('Cor selecionada:').getByRole('strong')).toHaveText(color.name);
      await expectImageSource(
        page.getByRole('button', { name: `Ampliar ${media.alt}` }).locator('img'),
        media.src!,
      );
    }

    const brown = product.colors.find((color) => color.id === 'marrom')!;
    await page.getByLabel(`Selecionar cor ${brown.name}`).click();
    await page.getByTestId('add-to-cart').click();
    await page.goto('/carrinho/');
    await expect(page.getByAltText(brown.media!.alt)).toHaveAttribute('src', brown.media!.src!);
  });
}

test('thumbnail selection keeps color, main media, and cart image synchronized', async ({
  page,
}) => {
  await page.goto('/produto/camiseta-hibrida-logo-lateral/');

  const product = getProducts().find((item) => item.slug === 'camiseta-hibrida-logo-lateral')!;
  const brown = product.colors.find((color) => color.id === 'marrom')!;

  await page.getByLabel(`Ver ${brown.media!.alt}`).click();
  await expect(page.getByLabel(`Selecionar cor ${brown.name}`)).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByText('Cor selecionada:').getByRole('strong')).toHaveText(brown.name);
  await expectImageSource(
    page.getByRole('button', { name: `Ampliar ${brown.media!.alt}` }).locator('img'),
    brown.media!.src!,
  );

  await page.getByTestId('add-to-cart').click();
  await page.goto('/carrinho/');
  await expect(page.getByAltText(brown.media!.alt)).toHaveAttribute('src', brown.media!.src!);
});

test('pending product colors remain explicit rather than reusing another variant image', async ({
  page,
}) => {
  await page.goto('/produto/camiseta-solid-masculina-logo-central/');

  await page.getByLabel('Selecionar cor Marrom').click();
  await expect(page.getByText('Cor selecionada:').getByRole('strong')).toHaveText('Marrom');
  await expect(
    page.getByText('Imagem desta variação (Marrom) ainda pendente.', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', {
      name: 'Ampliar Imagem pendente de Camiseta Solid Masculina - logo central na cor Marrom',
    }),
  ).toHaveCount(1);

  await page.getByTestId('add-to-cart').click();
  await page.goto('/carrinho/');
  await expect(page.getByText('Cor: Marrom')).toBeVisible();
  await expect(
    page.getByAltText('Imagem pendente de Camiseta Solid Masculina - logo central na cor Marrom'),
  ).toHaveCount(0);
});

test('kit previews reflect all three independent configuration choices', async ({ page }) => {
  await page.goto('/produto/kit-selecao-3-camisetas/');

  const configurations = [
    { piece: 'Peça 1', application: 'logo-lateral', color: 'branco-off-white', size: 'P' },
    { piece: 'Peça 2', application: 'logo-central', color: 'preto', size: 'M' },
    { piece: 'Peça 3', application: 'assinatura-lateral', color: 'marrom', size: 'G' },
  ] as const;

  for (const configuration of configurations) {
    const piece = page.getByRole('group', { name: configuration.piece });
    await piece.getByLabel('Aplicação').selectOption(configuration.application);
    await piece.getByLabel('Cor').selectOption(configuration.color);
    await piece.getByLabel('Tamanho').selectOption(configuration.size);
  }

  await expectImageSource(
    page.getByRole('group', { name: 'Peça 1' }).locator('img').first(),
    '/assets/products/hybrid-logo-lateral/branco.png',
  );
  await expectImageSource(
    page.getByRole('group', { name: 'Peça 2' }).locator('img').first(),
    '/assets/products/cutouts/hybrid-logo-central-preto.png',
  );
  await expectImageSource(
    page.getByRole('group', { name: 'Peça 3' }).locator('img').first(),
    '/assets/products/cutouts/hybrid-assinatura-marrom.png',
  );
});

test('invalid local storage is ignored without breaking cart rendering', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('art.cart.v1', JSON.stringify([null, { id: 'not-a-cart-item' }]));
  });
  await page.goto('/carrinho/');

  await expect(page.getByText('Seu carrinho está vazio.')).toBeVisible();
});

test('storefront navigation completes without console, page, or asset errors', async ({ page }) => {
  const issues: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') issues.push(message.text());
  });
  page.on('pageerror', (error) => issues.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().startsWith('http://127.0.0.1:3000')) {
      issues.push(`${response.status()} ${response.url()}`);
    }
  });

  for (const path of ['/', '/produto/camiseta-hibrida-logo-central/', '/carrinho/', '/checkout/']) {
    await page.goto(path);
    await expect(page.locator('body')).toBeVisible();
  }

  expect(issues).toEqual([]);
});
