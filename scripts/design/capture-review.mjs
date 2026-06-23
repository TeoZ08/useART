#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '../..');
const outputDirectory = resolve(root, 'docs/design-review/after');
const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const viewportChecks = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'tablet-1024', width: 1024, height: 768 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-430', width: 430, height: 932 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-360', width: 360, height: 800 },
];

async function waitForPage(page, path) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.fonts.status === 'loaded');
}

async function loadLazyImages(page) {
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);

  for (let position = 0; position < pageHeight; position += 680) {
    await page.evaluate((nextPosition) => window.scrollTo(0, nextPosition), position);
    await page.waitForTimeout(120);
  }

  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
  await page.waitForFunction(() => window.scrollY === 0);
  await page.waitForTimeout(500);
}

async function capture(page, path, filename, fullPage = true) {
  await waitForPage(page, path);
  await loadLazyImages(page);
  await page.screenshot({ path: resolve(outputDirectory, filename), fullPage });
}

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const desktopPage = await desktop.newPage();
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mobilePage = await mobile.newPage();

try {
  await capture(desktopPage, '/', 'home-desktop-full.png');
  await desktopPage.screenshot({ path: resolve(outputDirectory, 'home-desktop-fold.png') });
  await capture(mobilePage, '/', 'home-mobile-full.png');
  await capture(desktopPage, '/produto/camiseta-hibrida-logo-lateral/', 'product-desktop.png');
  await waitForPage(mobilePage, '/produto/camiseta-hibrida-logo-lateral/');
  await mobilePage.screenshot({ path: resolve(outputDirectory, 'product-mobile.png') });

  await waitForPage(desktopPage, '/produto/kit-selecao-3-camisetas/');
  await desktopPage.getByRole('group', { name: 'Peça 1' }).getByLabel('Cor').selectOption('preto');
  await desktopPage.getByRole('group', { name: 'Peça 2' }).getByLabel('Cor').selectOption('marrom');
  await desktopPage.getByRole('group', { name: 'Peça 3' }).getByLabel('Cor').selectOption('preto');
  await loadLazyImages(desktopPage);
  await desktopPage.screenshot({
    path: resolve(outputDirectory, 'kit-desktop.png'),
    fullPage: true,
  });

  await waitForPage(desktopPage, '/produto/camiseta-hibrida-logo-lateral/');
  await desktopPage.getByLabel('Selecionar cor Preto').click();
  await desktopPage.getByTestId('add-to-cart').click();
  await capture(desktopPage, '/carrinho/', 'cart-desktop.png');
  await capture(desktopPage, '/checkout/', 'checkout-desktop.png');

  const responsiveResults = [];
  for (const viewport of viewportChecks) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });
    const page = await context.newPage();
    await waitForPage(page, '/');
    const dimensions = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    responsiveResults.push({
      ...viewport,
      ...dimensions,
      horizontalOverflow: dimensions.scrollWidth > dimensions.clientWidth,
    });
    await context.close();
  }

  await writeFile(
    resolve(outputDirectory, 'viewport-checks.json'),
    `${JSON.stringify(responsiveResults, null, 2)}\n`,
  );
} finally {
  await desktop.close();
  await mobile.close();
  await browser.close();
}
