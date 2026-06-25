import { expect, test, type Browser, type Page } from '@playwright/test';

type HeroEvent = {
  name: 'forward' | 'reverse';
  type: string;
  time: number;
  loop: boolean;
  state?: string;
  visibleMedia?: string;
};

declare global {
  interface Window {
    __heroEvents?: HeroEvent[];
  }
}

async function waitForHeroIdle(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.fonts.status === 'loaded');
  await expect(page.getByTestId('hero-shirt-media')).toHaveAttribute('data-state', 'idle');
}

async function speedUpHero(page: Page, playbackRate = 4) {
  await page.evaluate((rate) => {
    for (const testId of ['hero-shirt-video', 'hero-shirt-video-reverse']) {
      const video = document.querySelector(`[data-testid="${testId}"]`);
      if (video instanceof HTMLVideoElement) video.playbackRate = rate;
    }
  }, playbackRate);
}

async function instrumentHero(page: Page) {
  await page.evaluate(() => {
    window.__heroEvents = [];

    for (const [name, testId] of [
      ['forward', 'hero-shirt-video'],
      ['reverse', 'hero-shirt-video-reverse'],
    ] as const) {
      const video = document.querySelector(`[data-testid="${testId}"]`);
      if (!(video instanceof HTMLVideoElement)) continue;

      for (const type of ['play', 'playing', 'pause', 'seeking', 'seeked', 'ended', 'timeupdate']) {
        video.addEventListener(type, () => {
          window.__heroEvents?.push({
            name,
            type,
            time: Number(video.currentTime.toFixed(3)),
            loop: video.loop,
            state:
              document
                .querySelector('[data-testid="hero-shirt-media"]')
                ?.getAttribute('data-state') ?? undefined,
            visibleMedia:
              document
                .querySelector('[data-testid="hero-shirt-media"]')
                ?.getAttribute('data-visible-media') ?? undefined,
          });
        });
      }
    }
  });
}

async function heroEvents(page: Page) {
  return page.evaluate(() => window.__heroEvents ?? []);
}

async function heroSnapshot(page: Page) {
  return page.evaluate(() => {
    const media = document.querySelector('[data-testid="hero-shirt-media"]');
    const poster = document.querySelector('[data-testid="hero-shirt-poster"]');
    const forward = document.querySelector('[data-testid="hero-shirt-video"]');
    const reverse = document.querySelector('[data-testid="hero-shirt-video-reverse"]');
    const isVisible = (element: Element | null) =>
      element instanceof HTMLElement && getComputedStyle(element).visibility === 'visible';

    return {
      state: media?.getAttribute('data-state'),
      visibleMedia: media?.getAttribute('data-visible-media'),
      visibleCount: [poster, forward, reverse].filter(isVisible).length,
      posterVisible: isVisible(poster),
      forwardVisible: isVisible(forward),
      reverseVisible: isVisible(reverse),
      forward:
        forward instanceof HTMLVideoElement
          ? {
              currentTime: forward.currentTime,
              duration: forward.duration,
              loop: forward.loop,
              paused: forward.paused,
            }
          : null,
      reverse:
        reverse instanceof HTMLVideoElement
          ? {
              currentTime: reverse.currentTime,
              duration: reverse.duration,
              loop: reverse.loop,
              paused: reverse.paused,
            }
          : null,
    };
  });
}

async function expectSingleVisibleMedia(page: Page) {
  await expect.poll(async () => (await heroSnapshot(page)).visibleCount).toBe(1);
}

async function createStaticModePage(
  browser: Browser,
  options: { reducedMotion?: boolean; saveData?: boolean; mobile?: boolean },
) {
  const context = await browser.newContext({
    reducedMotion: options.reducedMotion ? 'reduce' : 'no-preference',
    viewport: options.mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    hasTouch: options.mobile,
    isMobile: options.mobile,
  });
  const page = await context.newPage();

  if (options.saveData) {
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
  }

  return { context, page };
}

test('starts on the real first frame without showing poster and video together', async ({
  page,
}) => {
  await waitForHeroIdle(page);

  const snapshot = await heroSnapshot(page);
  expect(snapshot.state).toBe('idle');
  expect(snapshot.visibleMedia).toBe('forward');
  expect(snapshot.visibleCount).toBe(1);
  expect(snapshot.posterVisible).toBe(false);
  expect(snapshot.forwardVisible).toBe(true);
  expect(snapshot.forward?.currentTime).toBeLessThanOrEqual(0.015);
  expect(snapshot.forward?.loop).toBe(false);
});

for (const progress of [0.25, 0.5, 0.9] as const) {
  test(`returns through reverse after leaving hover at ${Math.round(progress * 100)}%`, async ({
    page,
  }) => {
    await waitForHeroIdle(page);
    await speedUpHero(page);
    await instrumentHero(page);

    const hoverZone = page.getByTestId('hero-shirt-hover-zone');
    const forward = page.getByTestId('hero-shirt-video');
    await hoverZone.hover();

    const duration = await forward.evaluate((video) => (video as HTMLVideoElement).duration);
    await expect
      .poll(
        async () => {
          const currentTime = await forward.evaluate(
            (video) => (video as HTMLVideoElement).currentTime,
          );
          return currentTime / duration;
        },
        { timeout: 12_000 },
      )
      .toBeGreaterThan(progress);

    const leaveTime = await forward.evaluate((video) => (video as HTMLVideoElement).currentTime);
    await page.mouse.move(4, 4);
    await expect(page.getByTestId('hero-shirt-media')).toHaveAttribute('data-state', 'reverse', {
      timeout: 5_000,
    });
    await expectSingleVisibleMedia(page);
    await expect(page.getByTestId('hero-shirt-media')).toHaveAttribute('data-state', 'idle', {
      timeout: 8_000,
    });

    const events = await heroEvents(page);
    const reverseSeek = events.find((event) => event.name === 'reverse' && event.type === 'seeked');
    const expectedReverseTime = duration - leaveTime;
    if (reverseSeek) {
      expect(reverseSeek.time).toBeGreaterThan(expectedReverseTime - 0.25);
      expect(reverseSeek.time).toBeLessThan(expectedReverseTime + 0.25);
    } else {
      expect(expectedReverseTime).toBeLessThanOrEqual(0.08);
    }
    expect(
      events.filter((event) => event.name === 'reverse' && event.type === 'seeking'),
    ).toHaveLength(reverseSeek ? 1 : 0);
    expect(events.some((event) => event.loop)).toBe(false);

    const snapshot = await heroSnapshot(page);
    expect(snapshot.visibleMedia).toBe('forward');
    expect(snapshot.forward?.currentTime).toBeLessThanOrEqual(0.02);
  });
}

test('plays forward once, holds the last frame, and returns from the end without looping', async ({
  page,
}) => {
  await waitForHeroIdle(page);
  await speedUpHero(page);
  await instrumentHero(page);

  await page.getByTestId('hero-shirt-hover-zone').hover();
  await expect(page.getByTestId('hero-shirt-media')).toHaveAttribute('data-state', 'holding-end', {
    timeout: 6_000,
  });
  await page.waitForTimeout(600);

  let snapshot = await heroSnapshot(page);
  expect(snapshot.visibleMedia).toBe('forward');
  expect(snapshot.forward?.loop).toBe(false);
  expect(snapshot.forward?.paused).toBe(true);
  expect(snapshot.forward?.currentTime).toBeCloseTo(snapshot.forward?.duration ?? 0, 1);

  await page.mouse.move(4, 4);
  await expect(page.getByTestId('hero-shirt-media')).toHaveAttribute('data-state', 'idle', {
    timeout: 8_000,
  });

  const events = await heroEvents(page);
  expect(events.filter((event) => event.name === 'forward' && event.type === 'ended')).toHaveLength(
    1,
  );
  expect(events.some((event) => event.loop)).toBe(false);
  snapshot = await heroSnapshot(page);
  expect(snapshot.forward?.currentTime).toBeLessThanOrEqual(0.02);
});

test('handles reverse reentry and ten rapid hover exits without concurrent media', async ({
  page,
}) => {
  await waitForHeroIdle(page);
  await speedUpHero(page);
  await instrumentHero(page);

  const hoverZone = page.getByTestId('hero-shirt-hover-zone');
  await hoverZone.hover();
  await page.waitForTimeout(800);
  await page.mouse.move(4, 4);
  await expect(page.getByTestId('hero-shirt-media')).toHaveAttribute('data-state', 'reverse');

  await page.waitForTimeout(180);
  await hoverZone.hover();
  await expect(page.getByTestId('hero-shirt-media')).toHaveAttribute('data-state', 'forward', {
    timeout: 5_000,
  });
  await page.waitForTimeout(240);
  await page.mouse.move(4, 4);
  await expect(page.getByTestId('hero-shirt-media')).toHaveAttribute('data-state', 'idle', {
    timeout: 8_000,
  });

  for (let index = 0; index < 10; index += 1) {
    await hoverZone.hover();
    await page.waitForTimeout(40);
    await page.mouse.move(4, 4);
    await page.waitForTimeout(40);
    await expectSingleVisibleMedia(page);
  }

  await expect(page.getByTestId('hero-shirt-media')).toHaveAttribute('data-state', 'idle', {
    timeout: 10_000,
  });
  await expectSingleVisibleMedia(page);
  const snapshot = await heroSnapshot(page);
  expect(snapshot.visibleMedia).toBe('forward');
  expect(snapshot.forward?.loop).toBe(false);
  expect(snapshot.reverse?.loop).toBe(false);
});

test('resets cleanly when the hero leaves the viewport or the tab becomes hidden', async ({
  page,
}) => {
  await waitForHeroIdle(page);
  await speedUpHero(page);

  const hoverZone = page.getByTestId('hero-shirt-hover-zone');
  await hoverZone.hover();
  await expect
    .poll(() =>
      page
        .getByTestId('hero-shirt-video')
        .evaluate((video) => (video as HTMLVideoElement).currentTime),
    )
    .toBeGreaterThan(0.3);

  await page.evaluate(() => window.scrollTo(0, 1_100));
  await expect(page.getByTestId('hero-shirt-media')).toHaveAttribute('data-state', 'idle', {
    timeout: 5_000,
  });

  await page.evaluate(() => window.scrollTo(0, 0));
  await hoverZone.hover();
  await expect(page.getByTestId('hero-shirt-media')).toHaveAttribute('data-state', 'forward');
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.getByTestId('hero-shirt-media')).toHaveAttribute('data-state', 'idle', {
    timeout: 5_000,
  });
});

test('uses only static media for reduced motion, save-data, and coarse pointer', async ({
  browser,
}) => {
  for (const options of [{ reducedMotion: true }, { saveData: true }, { mobile: true }] as const) {
    const { context, page } = await createStaticModePage(browser, options);
    await page.goto('/');

    await expect(page.getByTestId('hero-shirt-poster')).toBeVisible();
    await expect(page.getByTestId('hero-shirt-video')).toHaveCount(0);
    await expect(page.getByTestId('hero-shirt-video-reverse')).toHaveCount(0);
    await context.close();
  }
});

test('falls back cleanly when reverse media fails', async ({ page }) => {
  await page.route('**/useart-hero-transparente-reverse.webm', (route) =>
    route.fulfill({ status: 404, body: '' }),
  );

  await waitForHeroIdle(page);
  await speedUpHero(page);
  await instrumentHero(page);

  const hoverZone = page.getByTestId('hero-shirt-hover-zone');
  await hoverZone.hover();
  await expect
    .poll(() =>
      page
        .getByTestId('hero-shirt-video')
        .evaluate((video) => (video as HTMLVideoElement).currentTime),
    )
    .toBeGreaterThan(0.3);
  await page.mouse.move(4, 4);
  await expect(page.getByTestId('hero-shirt-media')).toHaveAttribute('data-state', 'idle', {
    timeout: 5_000,
  });

  const events = await heroEvents(page);
  expect(events.filter((event) => event.name === 'reverse' && event.type === 'play')).toHaveLength(
    0,
  );
  expect(
    events.filter((event) => event.name === 'reverse' && event.type === 'seeking').length,
  ).toBeLessThanOrEqual(1);
  await expectSingleVisibleMedia(page);
});

test('uses the poster fallback when forward media fails', async ({ page }) => {
  await page.route('**/useart-hero-transparente.webm', (route) =>
    route.fulfill({ status: 404, body: '' }),
  );

  await page.goto('/');
  await expect(page.getByTestId('hero-shirt-media')).toHaveAttribute('data-state', 'error');
  await expect(page.getByTestId('hero-shirt-poster')).toBeVisible();
  await expect(page.getByTestId('hero-shirt-video')).toHaveCount(0);
  await expect(page.getByTestId('hero-shirt-video-reverse')).toHaveCount(0);
});

test('keeps CTA clickable, console clean, and viewport without horizontal overflow', async ({
  page,
}) => {
  const issues: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') issues.push(message.text());
  });
  page.on('pageerror', (error) => issues.push(error.message));

  await waitForHeroIdle(page);
  expect(await page.locator('html').evaluate((html) => html.scrollWidth === html.clientWidth)).toBe(
    true,
  );

  await page.getByRole('link', { name: 'Explorar coleção' }).click();
  await expect(page).toHaveURL(/#colecao$/);
  expect(issues).toEqual([]);
});
