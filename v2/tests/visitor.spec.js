import { test, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const SHOTS = '/opt/cursor/artifacts/screenshots';
const DOCUMENTED = new Map([
  ['instagram.com', 'Bot GET returned HTTP 200 and followed to an Instagram login interstitial. The profile URL is the one published on linktr.ee/CypherMonkey.'],
  ['facebook.com', 'Bot GET was redirected to a Facebook login URL and answered HTTP 400. The profile URL is the one published on linktr.ee/CypherMonkey (https://www.facebook.com/Cyphermonkey0x9).'],
  ['x.com', 'Some automated clients get HTTP 403 from X. This run is recorded with the status actually returned. The profile URL is https://x.com/Cypher0x9 from linktr.ee/CypherMonkey.'],
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
  await expect(page.locator('a[href*="spotify.com"]')).toHaveCount(0);
  await expect(page.locator('.layout-switch')).toBeHidden();
  await expect(page.locator('.globe')).toHaveCount(3);
  await expect(page.locator('.bar')).toContainText('Not affiliated');
  await expect(page.locator('.door')).toHaveCount(12);
  await expect(page.locator('a[href*="linkedin.com"]')).toHaveCount(0);
  const name = info.project.name === 'mobile' ? 'v2-home-390' : 'v2-home-1440';
  await page.waitForTimeout(1200);
  await shot(page, name);
  expect(errors, errors.join('\n')).toEqual([]);
});

async function whiteShare(page, locator) {
  const png = await locator.screenshot();
  return page.evaluate(async (encoded) => {
    const image = new Image();
    image.src = `data:image/png;base64,${encoded}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let white = 0;
    const total = canvas.width * canvas.height;
    for (let index = 0; index < data.length; index += 4) {
      if (data[index] > 235 && data[index + 1] > 235 && data[index + 2] > 235) white += 1;
    }
    return white / total;
  }, png.toString('base64'));
}

test('hero stays coloured after the particle layer settles', async ({ page }, info) => {
  const gl = [];
  page.on('console', (message) => {
    if (message.text().includes('GL_CLOSE_PATH_NV')) gl.push(message.text());
  });
  await page.goto('/v2/');
  await page.waitForTimeout(2600);
  await expect(page.locator('.monkey-slot canvas')).toHaveCount(1);
  const share = await whiteShare(page, page.locator('.monkey-slot'));
  const name = info.project.name === 'mobile' ? 'v2-hero-390-after' : 'v2-hero-1440-after';
  await page.locator('.orbit').screenshot({ path: `${SHOTS}/${name}.png` });
  expect(share).toBeLessThan(0.35);
  expect(gl.length).toBeLessThan(12);
});

test('globe labels sit clear of the equator and stay at least 12px', async ({ page }) => {
  await page.goto('/v2/');
  const faults = await page.locator('.globe').evaluateAll((nodes) => nodes.flatMap((node) => {
    const sphere = node.querySelector('.sphere').getBoundingClientRect();
    const label = node.querySelector('.globe-label');
    const box = label.getBoundingClientRect();
    const size = parseFloat(getComputedStyle(label).fontSize);
    const overlaps = box.top < sphere.bottom && box.bottom > sphere.top && box.left < sphere.right && box.right > sphere.left;
    const problems = [];
    if (size < 12) problems.push(`${label.textContent} is ${size}px`);
    if (overlaps) problems.push(`${label.textContent} crosses the globe`);
    return problems;
  }));
  expect(faults).toEqual([]);
});

test('timeline placements switch from the URL flag', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Placement review is a desktop pass');
  await page.goto('/v2/?review=1');
  await expect(page.locator('.layout-switch')).toBeVisible();
  await expect(page.locator('#timeline-b')).toBeVisible();
  await page.goto('/v2/?timeline=b');
  await expect(page.locator('.layout-switch')).toBeVisible();
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
      const response = await request.get(href, {
        timeout: 25000,
        maxRedirects: 5,
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        },
      });
      status = response.status();
      finalUrl = response.url();
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }
    const host = new URL(href).hostname.replace(/^www\./, '');
    const ok = status === 200 || status === 206;
    const documented = !ok ? [...DOCUMENTED.entries()].find(([key]) => host.endsWith(key)) : null;
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
