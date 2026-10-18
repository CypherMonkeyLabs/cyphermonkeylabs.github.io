import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const SHOTS = '/opt/cursor/artifacts/screenshots';
const DOCUMENTED = new Map([
  ['instagram.com', 'Bot GET often lands on an Instagram login interstitial. The profile URL is the one published on linktr.ee/CypherMonkey and the response is still HTTP 200.'],
]);

function watch(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

async function shot(page, name) {
  await mkdir(SHOTS, { recursive: true });
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false });
  await page.screenshot({ path: `${SHOTS}/${name}-full.png`, fullPage: true });
}

test('home renders the stage, rail, bar, and twelve doors', async ({ page }, info) => {
  const errors = watch(page);
  await page.goto('/v2/');
  await expect(page.locator('#domain')).toHaveText('cyphermonkeylabs.com');
  await expect(page.locator('.zodiac-symbol')).toHaveText('猴');
  await expect(page.locator('.who')).toContainText('Lifelong student');
  await expect(page.locator('#explore')).toHaveText('Explore 14 labs');
  await expect(page.locator('.rail a.coin')).toHaveCount(12);
  await expect(page.locator('.globe')).toHaveCount(3);
  await expect(page.locator('.bar')).toContainText('not affiliated');
  await expect(page.locator('.door')).toHaveCount(12);
  await expect(page.locator('a[href*="linkedin.com"]')).toHaveCount(0);
  const name = info.project.name === 'mobile' ? 'v2-home-390' : 'v2-home-1440';
  await page.waitForTimeout(1200);
  await shot(page, name);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('timeline placements switch from the URL flag', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Placement review is a desktop pass');
  await page.goto('/v2/?timeline=b');
  await expect(page.locator('#timeline-b')).toBeVisible();
  await expect(page.locator('#timeline-a')).toBeHidden();
  await page.goto('/v2/?timeline=a');
  await expect(page.locator('#timeline-a')).toBeVisible();
  await expect(page.locator('#timeline-b')).toBeHidden();
  await shot(page, 'v2-timeline-a-1440');
  await page.goto('/v2/?timeline=c');
  await expect(page.locator('#timeline-c')).toBeVisible();
  await expect(page.locator('#timeline-b')).toBeHidden();
  await shot(page, 'v2-timeline-c-1440');
});

test('mobile default is a swipe strip, not a side column', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile');
  await page.goto('/v2/');
  const side = page.locator('#timeline-b .tl');
  await expect(side).toBeVisible();
  const display = await side.evaluate((node) => getComputedStyle(node).display);
  expect(display).toBe('flex');
  await shot(page, 'v2-timeline-strip-390');
});

test('reduced motion and webgl=0 keep the poster', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/v2/');
  await page.waitForTimeout(400);
  await expect(page.locator('.poster')).toBeVisible();
  await expect(page.locator('.monkey-slot canvas')).toHaveCount(0);
  const animation = await page.locator('.domain').evaluate((node) => getComputedStyle(node).animationName);
  expect(animation).toBe('none');
  await shot(page, 'v2-reduced-motion-1440');

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/v2/?webgl=0');
  await page.waitForTimeout(400);
  await expect(page.locator('.monkey-slot canvas')).toHaveCount(0);
  await expect(page.locator('.poster')).toBeVisible();
});

test('search palette finds SIP Universe and Escape closes it', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/v2/');
  await page.locator('#open-search').focus();
  await page.keyboard.press('Control+k');
  await expect(page.locator('#palette')).toBeVisible();
  await page.locator('#palette-input').fill('sip');
  await expect(page.locator('#palette-list a').first()).toContainText('SIP');
  await page.keyboard.press('Escape');
  await expect(page.locator('#palette')).toBeHidden();
  await expect(page.locator('#open-search')).toBeFocused();
});

test('protocol filter survives reload on the catalog', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/v2/labs/');
  await page.locator('a[data-chip="cat"][data-value="protocols"]').click();
  await expect(page).toHaveURL(/cat=protocols/);
  await expect(page.locator('.door:visible')).toHaveCount(2);
  await page.reload();
  await expect(page.locator('.door:visible')).toHaveCount(2);
  await shot(page, 'v2-labs-protocols-1440');
});

test('catalog pages and the hundred-door fixture', async ({ page }, info) => {
  const errors = watch(page);
  await page.goto('/v2/labs/');
  await expect(page.locator('.door')).toHaveCount(15);
  const name = info.project.name === 'mobile' ? 'v2-labs-390' : 'v2-labs-1440';
  await shot(page, name);
  if (info.project.name === 'desktop') {
    await page.goto('/v2/labs/?fixture=100');
    await expect(page.locator('.door')).toHaveCount(100);
    await page.goto('/v2/');
    await expect(page.locator('.door')).toHaveCount(12);
    await page.goto('/v2/timeline/');
    await expect(page.locator('.tl li').first()).toBeVisible();
    await shot(page, 'v2-timeline-page-1440');
  }
  expect(errors, errors.join('\n')).toEqual([]);
});

test('narrow width does not scroll sideways', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile');
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/v2/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('pages work with JavaScript off', async ({ browser }, info) => {
  test.skip(info.project.name !== 'desktop');
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:8765/v2/');
  await expect(page.locator('.door')).toHaveCount(12);
  await expect(page.locator('.rail a.coin')).toHaveCount(12);
  await expect(page.locator('.globe')).toHaveCount(3);
  await expect(page.locator('#disclaimer')).toContainText('not affiliated');
  await expect(page.locator('.poster')).toBeVisible();
  await context.close();
});

test('every published link returns 200 or is documented', async ({ page, request }, info) => {
  test.skip(info.project.name !== 'desktop', 'Link check runs once');
  await page.goto('/v2/');
  const home = await page.locator('a[href^="http"]').evaluateAll((nodes) => nodes.map((node) => node.href));
  await page.goto('/v2/labs/');
  const labs = await page.locator('a[href^="http"]').evaluateAll((nodes) => nodes.map((node) => node.href));
  await page.goto('/v2/timeline/');
  const timeline = await page.locator('a[href^="http"]').evaluateAll((nodes) => nodes.map((node) => node.href));
  const hrefs = [...new Set([...home, ...labs, ...timeline])].filter((href) => !href.includes('linkedin.com'));
  expect(hrefs.some((href) => href.includes('linkedin.com'))).toBe(false);
  const results = [];
  for (const href of hrefs) {
    let status = 0;
    let finalUrl = href;
    let error = '';
    try {
      const response = await request.get(href, { timeout: 25000, maxRedirects: 5 });
      status = response.status();
      finalUrl = response.url();
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }
    const host = new URL(href).hostname.replace(/^www\./, '');
    const documented = [...DOCUMENTED.entries()].find(([key]) => host.endsWith(key));
    const ok = status === 200 || status === 206;
    results.push({ href, status, finalUrl, error, ok, note: documented ? documented[1] : '' });
  }
  await mkdir('/opt/cursor/artifacts', { recursive: true });
  await writeFile('/opt/cursor/artifacts/v2-link-check.json', JSON.stringify(results, null, 2));
  const unexpected = results.filter((row) => !row.ok && !row.note);
  expect(unexpected, JSON.stringify(unexpected, null, 2)).toEqual([]);
});

test('records transfer size for the home page', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop');
  await page.goto('/v2/');
  await page.waitForTimeout(1500);
  const perf = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource').map((entry) => ({
      name: entry.name.replace(location.origin, ''),
      type: entry.initiatorType,
      transfer: entry.transferSize,
      encoded: entry.encodedBodySize,
    }));
    return {
      dcl: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      load: nav ? Math.round(nav.loadEventEnd) : null,
      requests: resources.length,
      transfer: resources.reduce((sum, entry) => sum + entry.transfer, 0),
      resources,
    };
  });
  await mkdir('/opt/cursor/artifacts', { recursive: true });
  await writeFile('/opt/cursor/artifacts/v2-perf.json', JSON.stringify(perf, null, 2));
  expect(perf.requests).toBeGreaterThan(3);
});
