#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '../..');
const outputDirectory = resolve(root, 'docs/design-review/hero-video');
const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const viewports = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'tablet-1024', width: 1024, height: 768 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-430', width: 430, height: 932 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-360', width: 360, height: 800 },
];

async function waitForHero(page) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.fonts.status === 'loaded');
  await page.getByTestId('hero-shirt-poster').waitFor();
}

async function pauseVideoAt(page, time) {
  await page.getByTestId('hero-shirt-video').waitFor();
  await page.evaluate(async (targetTime) => {
    const video = document.querySelector('[data-testid="hero-shirt-video"]');
    if (!(video instanceof HTMLVideoElement)) return;

    video.pause();
    await new Promise((resolve) => {
      video.addEventListener('seeked', resolve, { once: true });
      video.currentTime = targetTime;
    });
  }, time);
}

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktop = await desktopContext.newPage();
  await waitForHero(desktop);
  await pauseVideoAt(desktop, 0.1);
  await desktop.screenshot({ path: resolve(outputDirectory, 'desktop-initial.png') });

  await pauseVideoAt(desktop, 5.4);
  await desktop.screenshot({ path: resolve(outputDirectory, 'desktop-later-frame.png') });

  await desktop.evaluate(() => window.scrollTo(0, 850));
  await desktop.waitForTimeout(180);
  await desktop.screenshot({ path: resolve(outputDirectory, 'header-scrolled.png') });
  await desktopContext.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobile = await mobileContext.newPage();
  await waitForHero(mobile);
  await pauseVideoAt(mobile, 2.1);
  await mobile.screenshot({ path: resolve(outputDirectory, 'mobile.png') });
  await mobileContext.close();

  const reducedContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const reduced = await reducedContext.newPage();
  await waitForHero(reduced);
  await reduced.screenshot({ path: resolve(outputDirectory, 'reduced-motion-poster.png') });
  await reducedContext.close();

  const viewportResults = [];
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await waitForHero(page);
    const dimensions = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    viewportResults.push({
      ...viewport,
      ...dimensions,
      horizontalOverflow: dimensions.scrollWidth > dimensions.clientWidth,
    });
    await context.close();
  }

  await writeFile(
    resolve(outputDirectory, 'viewport-checks.json'),
    `${JSON.stringify(viewportResults, null, 2)}\n`,
  );
} finally {
  await browser.close();
}
