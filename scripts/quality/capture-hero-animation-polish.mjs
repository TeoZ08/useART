#!/usr/bin/env node

import { mkdir, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '../..');
const outputDirectory = resolve(
  root,
  process.env.HERO_POLISH_OUTPUT ?? 'docs/hero-animation-polish/after',
);
const videoDirectory = resolve(outputDirectory, '.video');
const recordingName = process.env.HERO_POLISH_RECORDING ?? 'final-local-behavior.webm';
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

async function openHome(page) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.fonts.status === 'loaded');
}

async function waitForState(page, state, timeout = 12_000) {
  await page.waitForFunction(
    (expectedState) =>
      document.querySelector('[data-testid="hero-shirt-media"]')?.getAttribute('data-state') ===
      expectedState,
    state,
    { timeout },
  );
}

async function waitForForwardProgress(page, progress) {
  await page.waitForFunction(
    (targetProgress) => {
      const video = document.querySelector('[data-testid="hero-shirt-video"]');
      return (
        video instanceof HTMLVideoElement &&
        Number.isFinite(video.duration) &&
        video.duration > 0 &&
        video.currentTime / video.duration >= targetProgress
      );
    },
    progress,
    { timeout: 12_000 },
  );
}

async function waitForReverseProgress(page, progress) {
  await page.waitForFunction(
    (targetProgress) => {
      const video = document.querySelector('[data-testid="hero-shirt-video-reverse"]');
      return (
        video instanceof HTMLVideoElement &&
        Number.isFinite(video.duration) &&
        video.duration > 0 &&
        video.currentTime / video.duration >= targetProgress
      );
    },
    progress,
    { timeout: 12_000 },
  );
}

async function captureHero(page) {
  await openHome(page);
  await waitForState(page, 'idle');
  await page.screenshot({ path: resolve(outputDirectory, 'hero-idle.png') });

  const hoverZone = page.getByTestId('hero-shirt-hover-zone');
  await hoverZone.hover();
  await waitForState(page, 'forward');
  await page.waitForTimeout(180);
  await page.screenshot({ path: resolve(outputDirectory, 'hero-forward-start.png') });

  await waitForForwardProgress(page, 0.5);
  await page.screenshot({ path: resolve(outputDirectory, 'hero-forward-mid.png') });

  await waitForState(page, 'holding-end');
  await page.waitForTimeout(700);
  await page.screenshot({ path: resolve(outputDirectory, 'hero-forward-last.png') });

  await page.mouse.move(4, 4);
  await waitForState(page, 'reverse');
  await page.waitForTimeout(180);
  await page.screenshot({ path: resolve(outputDirectory, 'hero-reverse-start.png') });

  await waitForReverseProgress(page, 0.5);
  await page.screenshot({ path: resolve(outputDirectory, 'hero-reverse-mid.png') });

  await waitForState(page, 'idle');
  await page.screenshot({ path: resolve(outputDirectory, 'hero-reverse-end.png') });

  await hoverZone.hover();
  await page.waitForTimeout(1_100);
  await page.mouse.move(4, 4);
  await waitForState(page, 'reverse');
  await page.waitForTimeout(700);
  await hoverZone.hover();
  await waitForState(page, 'forward');
  await page.screenshot({ path: resolve(outputDirectory, 'hero-reentry-during-reverse.png') });
  await page.mouse.move(4, 4);
  await waitForState(page, 'idle');
}

async function captureStaticModes(browser) {
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const mobile = await mobileContext.newPage();
  watchPage(mobile);
  await openHome(mobile);
  await mobile.screenshot({ path: resolve(outputDirectory, 'hero-mobile-static.png') });
  await mobileContext.close();

  const reducedContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const reduced = await reducedContext.newPage();
  watchPage(reduced);
  await openHome(reduced);
  await reduced.screenshot({ path: resolve(outputDirectory, 'hero-reduced-motion-static.png') });
  await reducedContext.close();
}

async function captureViewportChecks(browser) {
  const responsiveness = [];
  for (const viewport of viewportChecks) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      hasTouch: viewport.width <= 430,
      isMobile: viewport.width <= 430,
    });
    const page = await context.newPage();
    watchPage(page);
    await openHome(page);
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
}

await mkdir(outputDirectory, { recursive: true });
await rm(videoDirectory, { recursive: true, force: true });
await mkdir(videoDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: videoDirectory, size: { width: 1440, height: 900 } },
  });
  const desktop = await desktopContext.newPage();
  watchPage(desktop);
  await captureHero(desktop);
  await desktopContext.close();

  const recordings = await readdir(videoDirectory);
  if (recordings.length > 0) {
    await rename(join(videoDirectory, recordings[0]), resolve(outputDirectory, recordingName));
  }
  await rm(videoDirectory, { recursive: true, force: true });

  await captureStaticModes(browser);
  await captureViewportChecks(browser);
  await writeFile(
    resolve(outputDirectory, 'runtime-issues.json'),
    `${JSON.stringify(runtimeIssues, null, 2)}\n`,
  );
} finally {
  await browser.close();
  await rm(videoDirectory, { recursive: true, force: true });
}
