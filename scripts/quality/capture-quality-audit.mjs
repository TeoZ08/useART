#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '../..');
const outputDirectory = resolve(root, 'docs/quality-audit/after');
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

const runtimeIssues = [];

function watchPage(page) {
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeIssues.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => runtimeIssues.push(`pageerror: ${error.message}`));
  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().startsWith(baseUrl)) {
      runtimeIssues.push(`asset: ${response.status()} ${response.url()}`);
    }
  });
}

async function open(page, path) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.fonts.status === 'loaded');
}

async function captureProductVariant(page, colorName, fileName) {
  await open(page, '/produto/camiseta-hibrida-logo-lateral/');
  await page.getByLabel(`Selecionar cor ${colorName}`).click();
  await page.screenshot({ path: resolve(outputDirectory, fileName), fullPage: true });
}

async function configureKit(page) {
  const configurations = [
    { piece: 'Peça 1', application: 'logo-lateral', color: 'branco-off-white', size: 'P' },
    { piece: 'Peça 2', application: 'logo-central', color: 'preto', size: 'M' },
    { piece: 'Peça 3', application: 'assinatura-lateral', color: 'marrom', size: 'G' },
  ];

  for (const configuration of configurations) {
    const piece = page.getByRole('group', { name: configuration.piece });
    await piece.getByLabel('Aplicação').selectOption(configuration.application);
    await piece.getByLabel('Cor').selectOption(configuration.color);
    await piece.getByLabel('Tamanho').selectOption(configuration.size);
  }
}

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktop = await desktopContext.newPage();
  watchPage(desktop);

  await open(desktop, '/');
  await desktop.getByTestId('hero-shirt-poster').waitFor();
  await desktop.waitForFunction(
    () => document.querySelector('[data-testid="hero-shirt-media"]')?.dataset.state === 'ready',
  );
  await desktop.screenshot({ path: resolve(outputDirectory, 'hero-desktop-initial.png') });

  const hoverZone = desktop.getByTestId('hero-shirt-hover-zone');
  await hoverZone.hover();
  await desktop.waitForFunction(
    () => document.querySelector('[data-testid="hero-shirt-media"]')?.dataset.state === 'playing',
  );
  await desktop.waitForTimeout(550);
  await desktop.screenshot({ path: resolve(outputDirectory, 'hero-desktop-hover.png') });

  await desktop.mouse.move(4, 4);
  await desktop.waitForFunction(
    () => document.querySelector('[data-testid="hero-shirt-media"]')?.dataset.state === 'rewinding',
  );
  await desktop.waitForTimeout(220);
  await desktop.screenshot({ path: resolve(outputDirectory, 'hero-desktop-rewind.png') });

  await desktop.waitForFunction(
    () => document.querySelector('[data-testid="hero-shirt-media"]')?.dataset.state === 'ready',
  );
  await desktop.screenshot({ path: resolve(outputDirectory, 'hero-desktop-return.png') });

  await desktop.evaluate(() => window.scrollTo(0, 850));
  await desktop.waitForTimeout(180);
  await desktop.screenshot({ path: resolve(outputDirectory, 'header-after-scroll.png') });

  await captureProductVariant(desktop, 'Branco/off-white', 'product-lateral-white.png');
  await captureProductVariant(desktop, 'Preto', 'product-lateral-black.png');
  await captureProductVariant(desktop, 'Marrom', 'product-lateral-brown.png');

  await open(desktop, '/produto/camiseta-solid-masculina-logo-central/');
  await desktop.getByLabel('Selecionar cor Marrom').click();
  await desktop.screenshot({
    path: resolve(outputDirectory, 'product-pending-solid-brown.png'),
    fullPage: true,
  });

  await open(desktop, '/produto/kit-selecao-3-camisetas/');
  await configureKit(desktop);
  await desktop.screenshot({
    path: resolve(outputDirectory, 'kit-three-configurations.png'),
    fullPage: true,
  });

  await open(desktop, '/produto/camiseta-hibrida-logo-lateral/');
  await desktop.getByLabel('Selecionar cor Marrom').click();
  await desktop.getByTestId('add-to-cart').click();
  await open(desktop, '/carrinho/');
  await desktop.screenshot({
    path: resolve(outputDirectory, 'cart-brown-variant.png'),
    fullPage: true,
  });
  await open(desktop, '/checkout/');
  await desktop.screenshot({ path: resolve(outputDirectory, 'checkout.png'), fullPage: true });
  await desktopContext.close();

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const mobile = await mobileContext.newPage();
  watchPage(mobile);
  await open(mobile, '/');
  await mobile.getByTestId('hero-shirt-poster').waitFor();
  await mobile.screenshot({ path: resolve(outputDirectory, 'hero-mobile-poster.png') });
  await mobileContext.close();

  const responsiveness = [];
  for (const viewport of viewportChecks) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      hasTouch: viewport.width <= 430,
      isMobile: viewport.width <= 430,
    });
    const page = await context.newPage();
    watchPage(page);
    await open(page, '/');
    const dimensions = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    responsiveness.push({
      ...viewport,
      ...dimensions,
      horizontalOverflow: dimensions.scrollWidth > dimensions.clientWidth,
    });
    await context.close();
  }

  await writeFile(
    resolve(outputDirectory, 'viewport-checks.json'),
    `${JSON.stringify(responsiveness, null, 2)}\n`,
  );
  await writeFile(
    resolve(outputDirectory, 'runtime-issues.json'),
    `${JSON.stringify(runtimeIssues, null, 2)}\n`,
  );
} finally {
  await browser.close();
}
