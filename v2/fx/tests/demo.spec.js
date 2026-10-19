import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const OUT = '/opt/cursor/artifacts/screenshots';

async function prepare(page, project) {
  if (project === 'webgl-off') {
    await page.addInitScript(() => {
      const orig = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function getContext(type, ...args) {
        if (String(type).includes('webgl')) return null;
        return orig.call(this, type, ...args);
      };
    });
  }
}

test('cmfx demo', async ({ page }, info) => {
  await mkdir(OUT, { recursive: true });
  const project = info.project.name;
  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });

  await prepare(page, project);
  await page.goto('/v2/fx/demo.html', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => {
    const text = document.getElementById('status')?.textContent || '';
    return text.startsWith('Ready');
  }, null, { timeout: 30000 });

  const contract = await page.evaluate(() => {
    const fx = window.CMFX;
    return {
      keys: Object.keys(fx).sort(),
      sound: Object.keys(fx.sound).sort(),
      reduced: fx.reducedMotion,
      soundOn: fx.sound.isOn(),
      aurora: document.getElementById('aurora-canvas')?.dataset.cmfx || '',
      globe: document.getElementById('globe-host')?.dataset.cmfx || '',
      particles: document.getElementById('particle-canvas')?.dataset.cmfx || '',
    };
  });

  expect(contract.keys).toEqual(['aurora', 'cursorTrail', 'globe3d', 'particles', 'ready', 'reducedMotion', 'sound', 'tiltCards']);
  expect(contract.sound).toEqual(['init', 'isOn', 'ping', 'toggle']);
  expect(contract.soundOn).toBe(false);
  expect(contract.particles).toBe('2d');

  if (project === 'reduced') {
    expect(contract.reduced).toBe(true);
    expect(contract.aurora).toBe('webgl');
    const trail = await page.locator('canvas.cmfx-trail').count();
    expect(trail).toBe(0);
    const first = await page.locator('#aurora-canvas').screenshot();
    await page.waitForTimeout(450);
    const second = await page.locator('#aurora-canvas').screenshot();
    expect(Buffer.compare(first, second)).toBe(0);
  } else if (project === 'webgl-off') {
    expect(contract.aurora).toBe('2d');
    expect(contract.globe).toBe('svg');
    await expect(page.getByText('WebGL is off. This is a still aurora painted in 2D.')).toBeVisible();
    await expect(page.getByText('WebGL is off. The labs are drawn as a flat circle')).toBeVisible();
  } else {
    expect(contract.reduced).toBe(false);
    expect(contract.aurora).toBe('webgl');
    expect(contract.globe).toBe('webgl');
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const overflowBottom = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflowBottom).toBeLessThanOrEqual(1);

  const sections = ['aurora', 'particles', 'globe', 'tilt', 'trail', 'sound'];
  for (const id of sections) {
    const section = page.locator(`#${id}`);
    await section.scrollIntoViewIfNeeded();
    await section.screenshot({ path: `${OUT}/cmfx-${project}-${id}.png` });
  }
  await page.screenshot({ path: `${OUT}/cmfx-${project}-full.png`, fullPage: true });

  if (project === 'desktop') {
    const button = page.locator('#cmfx-sound-toggle');
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => window.CMFX.sound.isOn())).toBe(true);
    await page.locator('[data-ping="ok"]').click();
    await button.click();
    expect(await page.evaluate(() => window.CMFX.sound.isOn())).toBe(false);

    const hrefs = await page.locator('a[href]').evaluateAll((nodes) => [...new Set(nodes.map((node) => node.href))]);
    const bad = [];
    for (const href of hrefs) {
      const response = await page.request.get(href, { timeout: 20000, failOnStatusCode: false });
      if (response.status() !== 200) bad.push(`${response.status()} ${href}`);
    }
    expect(bad, bad.join('\n')).toEqual([]);
  }

  expect(errors, errors.join('\n')).toEqual([]);

  if (project === 'desktop') {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: `${OUT}/root-hero.png` });
    await page.goto('/v2/', { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: `${OUT}/v2-current-hero.png` });
  }
});
