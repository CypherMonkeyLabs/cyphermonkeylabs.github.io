import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const shots = "/opt/cursor/artifacts/screenshots";

const PAGES = ["/", "/v1/", "/v2/", "/404.html"];

function watch(page) {
  const errors = [];
  const csp = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const url = message.location().url || "";
    // The Turnstile challenge frame logs its own data: probe. That CSP belongs to Cloudflare, not this page.
    if (url.startsWith("https://challenges.cloudflare.com/")) return;
    errors.push(message.text());
  });
  page.addInitScript(() => {
    window.__csp = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      window.__csp.push(`${event.violatedDirective} ${event.blockedURI}`);
    });
  });
  return {
    errors,
    async readCsp() {
      const found = await page.evaluate(() => window.__csp || []);
      csp.push(...found);
      return csp;
    }
  };
}

async function shot(page, name) {
  await mkdir(shots, { recursive: true });
  const file = path.join(shots, name);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

test.describe("homepage", () => {
  for (const url of PAGES) {
    test(`no console or CSP errors on ${url}`, async ({ page }, info) => {
      const seen = watch(page);
      const response = await page.goto(url, { waitUntil: "domcontentloaded" });
      expect(response, url).toBeTruthy();
      if (url === "/v2/") await page.waitForURL((next) => next.pathname === "/");
      await page.evaluate(async () => {
        if (document.fonts && document.fonts.ready) await document.fonts.ready;
      });
      await page.waitForTimeout(400);
      const skip = page.locator(".r3-skip");
      if (await skip.isVisible().catch(() => false)) {
        await skip.click();
        await page.locator(".r3-intro").waitFor({ state: "detached", timeout: 3000 }).catch(() => {});
      }
      const csp = await seen.readCsp();
      expect(seen.errors, seen.errors.join("\n")).toEqual([]);
      expect(csp, csp.join("\n")).toEqual([]);
      const width = info.project.name === "phone" ? "390" : "1280";
      const label = url === "/" ? "home" : url.replace(/\//g, "") || "home";
      await shot(page, `${label}-${width}.png`);
    });
  }

  test("guide bubble stays inside the viewport and clear of the eyebrow", async ({ page }, info) => {
    const seen = watch(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const skip = page.locator(".r3-skip");
    if (await skip.isVisible().catch(() => false)) {
      await skip.click();
      await expect(page.locator(".r3-intro")).toHaveCount(0);
    }
    const bubble = page.locator(".cmb-bubble.on");
    await expect(bubble).toBeVisible({ timeout: 8000 });
    await page.waitForTimeout(600);
    const box = await bubble.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const eye = document.querySelector(".hero .eyebrow");
      const eyeBox = eye ? eye.getBoundingClientRect() : null;
      let clip = "";
      let node = el.parentElement;
      while (node && node !== document.documentElement) {
        const style = getComputedStyle(node);
        const values = [style.overflow, style.overflowX, style.overflowY];
        const clips = values.some((value) => value === "hidden" || value === "clip" || value === "scroll" || value === "auto");
        if (clips) {
          const bounds = node.getBoundingClientRect();
          const outside = rect.top < bounds.top - 1 || rect.left < bounds.left - 1 || rect.right > bounds.right + 1 || rect.bottom > bounds.bottom + 1;
          if (outside) clip = node.className || node.tagName;
        }
        node = node.parentElement;
      }
      const card = document.querySelector(".hero-copy");
      const cardBox = card ? card.getBoundingClientRect() : null;
      const hits = (box) => box && !(rect.right < box.left || rect.left > box.right || rect.bottom < box.top || rect.top > box.bottom);
      const shown = (sel) => {
        const node = document.querySelector(sel);
        if (!node) return false;
        const style = getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
        const bounds = node.getBoundingClientRect();
        return bounds.width > 8 && bounds.height > 8;
      };
      return {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
        text: el.textContent,
        clip,
        overlap: !!hits(eyeBox) || !!hits(cardBox),
        eyebrow: eye ? eye.textContent : "",
        guides: { cyph: shown(".cmb-monkey"), astro: shown(".r3-astro"), legacy: shown(".r3-guide") }
      };
    });
    expect(box.text.length).toBeGreaterThan(0);
    expect(box.width).toBeGreaterThan(40);
    expect(box.height).toBeGreaterThan(12);
    expect(box.top).toBeGreaterThanOrEqual(-1);
    expect(box.left).toBeGreaterThanOrEqual(-1);
    expect(box.right).toBeLessThanOrEqual(page.viewportSize().width + 1);
    expect(box.bottom).toBeLessThanOrEqual(page.viewportSize().height + 1);
    expect(box.clip, JSON.stringify(box)).toBe("");
    expect(box.overlap, JSON.stringify(box)).toBe(false);
    expect(box.eyebrow.toLowerCase()).not.toContain("preview");
    if (info.project.name === "phone") {
      expect(box.guides.cyph).toBe(true);
      expect(box.guides.astro).toBe(false);
      expect(box.guides.legacy).toBe(false);
    }
    await expect(page.locator("body")).not.toContainText(/preview/i);
    const width = info.project.name === "phone" ? "390" : "1280";
    await shot(page, `bubble-${width}.png`);
    const csp = await seen.readCsp();
    expect(seen.errors, seen.errors.join("\n")).toEqual([]);
    expect(csp, csp.join("\n")).toEqual([]);
  });

  test("narrow phones keep one guide and a bubble off the hero text", async ({ page }, info) => {
    test.skip(info.project.name !== "phone", "this sweep sets its own widths");
    for (const width of [360, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/", { waitUntil: "domcontentloaded" });
      const skip = page.locator(".r3-skip");
      if (await skip.isVisible().catch(() => false)) await skip.click();
      const bubble = page.locator(".cmb-bubble.on");
      await expect(bubble).toBeVisible({ timeout: 8000 });
      await page.waitForTimeout(500);
      const state = await bubble.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const card = document.querySelector(".hero-copy").getBoundingClientRect();
        const overlap = !(rect.right < card.left || rect.left > card.right || rect.bottom < card.top || rect.top > card.bottom);
        const shown = (sel) => {
          const node = document.querySelector(sel);
          if (!node) return false;
          const style = getComputedStyle(node);
          if (style.display === "none" || style.visibility === "hidden") return false;
          const bounds = node.getBoundingClientRect();
          return bounds.width > 8 && bounds.height > 8;
        };
        return {
          overlap,
          inside: rect.top >= -1 && rect.left >= -1 && rect.right <= innerWidth + 1 && rect.bottom <= innerHeight + 1,
          cyph: shown(".cmb-monkey"),
          astro: shown(".r3-astro"),
          legacy: shown(".r3-guide")
        };
      });
      expect(state, `${width} ${JSON.stringify(state)}`).toMatchObject({
        overlap: false,
        inside: true,
        cyph: true,
        astro: false,
        legacy: false
      });
      await shot(page, `home-${width}.png`);
    }
  });

  test("contact form renders the Turnstile widget", async ({ page }, info) => {
    const seen = watch(page);
    await page.goto("http://cyphermonkeylabs.com:8766/", { waitUntil: "domcontentloaded" });
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await expect.poll(() => page.frames().some((frame) => frame.url().includes("challenges.cloudflare.com/cdn-cgi/challenge-platform")), { timeout: 20000 }).toBe(true);
    await expect(page.locator(".turnstile-host")).toBeVisible();
    await page.locator(".turnstile-host").scrollIntoViewIfNeeded();
    await expect(page.locator('input[name="cf-turnstile-response"]')).toHaveCount(1);
    const width = info.project.name === "phone" ? "390" : "1280";
    await shot(page, `contact-${width}.png`);
    const csp = await seen.readCsp();
    expect(seen.errors, seen.errors.join("\n")).toEqual([]);
    expect(csp, csp.join("\n")).toEqual([]);
  });

  test("live lab links return 200", async ({ page, request }, info) => {
    test.skip(info.project.name !== "desktop", "one live pass is enough");
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const hrefs = await page.locator("a.open").evaluateAll((nodes) => nodes.map((node) => node.href));
    expect(hrefs.length).toBeGreaterThanOrEqual(13);
    const failures = [];
    for (const href of hrefs) {
      let status = 0;
      let error = "";
      try {
        const response = await request.get(href, {
          timeout: 30000,
          maxRedirects: 5,
          headers: {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
          }
        });
        status = response.status();
      } catch (err) {
        error = err instanceof Error ? err.message : String(err);
      }
      if (status !== 200) failures.push({ href, status, error });
    }
    expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
  });
});
