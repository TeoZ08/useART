import { expect, test } from '@playwright/test';

test('customer can prepare an assisted WhatsApp order', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'ART', exact: true })).toBeVisible();
  await page
    .getByRole('link', { name: /Camiseta Híbrida - logo lateral/i })
    .first()
    .click();
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
