import { test, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const qaDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(qaDir, "../..");
const shotRoot = path.join(qaDir, "screenshots");
const artifactRoot = "/opt/cursor/artifacts/screenshots";

const REQUIRED = [
  "amazon-connect",
  "sip-universe",
  "uc",
  "ai",
  "nice-cxone",
  "microsoft-voice-cc",
  "genesys-cloud",
  "five9",
  "zoom-talkdesk-avaya",
  "cpaas",
  "webex",
  "python",
  "ba-lab-grok"
];

const DOCUMENTED_BOT_WALL = new Map([
  ["x.com", "Automated clients sometimes get HTTP 403 from X. The profile URL is the one already on the v2 hub."],
  ["facebook.com", "Automated clients can be redirected to a Facebook login URL that answers 400. The profile URL is already on the v2 hub."],
  ["instagram.com", "Automated clients can land on an Instagram login interstitial. The profile URL is already on the v2 hub."]
]);

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", "screenshots", "report", "test-results", "playwright-report"].includes(ent.name)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(full, acc);
    else if (ent.name.endsWith(".html")) acc.push(full);
  }
  return acc;
}

const pages = walk(path.join(repoRoot, "v2"))
  .map((full) => "/" + path.relative(repoRoot, full).split(path.sep).join("/"))
  .sort();

const linkCache = new Map();

function shotName(url) {
  return url.replace(/^\/+/, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home";
}

async function saveShot(page, project, url, suffix) {
  const dir = path.join(shotRoot, project);
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${shotName(url)}${suffix ? "-" + suffix : ""}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function copyArtifact(file, name) {
  await mkdir(artifactRoot, { recursive: true });
  await fs.promises.copyFile(file, path.join(artifactRoot, name));
}

function hostOf(href) {
  return new URL(href).hostname.replace(/^www\./, "");
}

function documented(href, status) {
  const host = hostOf(href);
  const note = [...DOCUMENTED_BOT_WALL.entries()].find(([key]) => host === key || host.endsWith("." + key));
  if (!note) return "";
  if ([400, 401, 403, 429].includes(status)) return note[1];
  return "";
}

async function checkLinks(request, hrefs) {
  const failures = [];
  for (const href of hrefs) {
    const clean = href.split("#")[0];
    if (!clean || linkCache.has(clean)) continue;
    let status = 0;
    let error = "";
    try {
      const response = await request.get(clean, {
        timeout: 25000,
        maxRedirects: 5,
        headers: {
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
        }
      });
      status = response.status();
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }
    const ok = status === 200 || status === 206;
    const note = ok ? "" : documented(clean, status);
    linkCache.set(clean, { status, error, ok, note });
    if (!ok && !note) failures.push({ href: clean, status, error });
  }
  return failures;
}

test.beforeEach(async ({ page }, info) => {
  if (info.project.name !== "webgl-off") return;
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(type, ...args) {
      if (String(type).indexOf("webgl") !== -1) return null;
      return original.call(this, type, ...args);
    };
  });
});

test("the thirteen portals and the map are on disk", () => {
  for (const slug of REQUIRED) {
    expect(pages.some((url) => url.endsWith(`/v2/labs/${slug}/index.html`)), slug).toBe(true);
  }
  expect(pages.some((url) => url.endsWith("/v2/map/index.html"))).toBe(true);
  expect(pages.some((url) => url.endsWith("/v2/labs/portals/index.html"))).toBe(true);
});

for (const url of pages) {
  test(`checks ${url}`, async ({ page, request }, info) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });
    expect(response, url).toBeTruthy();
    expect(response.status(), url).toBeLessThan(400);
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
    });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${url} horizontal overflow`).toBeLessThanOrEqual(1);
    expect(errors, errors.join("\n")).toEqual([]);

    if (url.endsWith("/v2/index.html")) {
      await page.waitForURL((u) => u.pathname === "/" || u.pathname === "/index.html");
      await page.evaluate(() => window.CMFX && window.CMFX.ready);
      const hero = await page.evaluate(() => {
        const stage = document.querySelector(".hero .stage");
        const canvas = document.getElementById("hero-canvas");
        return {
          stage: stage ? stage.getBoundingClientRect().height : 0,
          canvas: canvas ? canvas.getBoundingClientRect().height : 0
        };
      });
      expect(hero.stage, `${url} hero stage height`).toBeGreaterThan(0);
      expect(hero.canvas, `${url} hero canvas height`).toBeGreaterThan(0);
      if (info.project.name === "short") {
        const doors = page.locator("#doors");
        await doors.scrollIntoViewIfNeeded();
        await expect(doors, "#doors visible at 390x430").toHaveCSS("opacity", "1");
        const box = await doors.boundingBox();
        expect(box && box.height, "#doors height at 390x430").toBeGreaterThan(0);
      }
    }

    const project = info.project.name;
    const file = await saveShot(page, project, url);
    const ours = await page.locator("body").getAttribute("data-suite");
    if (["desktop", "phone", "short"].includes(project) && (ours === "portal" || ours === "map" || ours === "portals")) {
      const ids = await page.locator("main section[id], #board").evaluateAll((nodes) => nodes.map((node) => node.id).filter(Boolean));
      for (const id of ids) {
        const box = await page.locator("#" + id).boundingBox();
        if (!box || box.height < 8) continue;
        await page.locator("#" + id).screenshot({ path: path.join(shotRoot, project, `${shotName(url)}-${id}.png`) });
      }
    }

    if (project === "desktop" && url.endsWith("/v2/map/index.html")) await copyArtifact(file, "map-1440.png");
    if (project === "phone" && url.endsWith("/v2/map/index.html")) await copyArtifact(file, "map-390x844.png");
    if (project === "short" && url.endsWith("/v2/map/index.html")) await copyArtifact(file, "map-390x430.png");
    if (project === "desktop" && url.endsWith("/v2/labs/webex/index.html")) await copyArtifact(file, "portal-webex-1440.png");
    if (project === "phone" && url.endsWith("/v2/labs/webex/index.html")) await copyArtifact(file, "portal-webex-390x844.png");
    if (project === "short" && url.endsWith("/v2/labs/python/index.html")) await copyArtifact(file, "portal-python-390x430.png");
    if (project === "reduced-motion" && url.endsWith("/v2/map/index.html")) await copyArtifact(file, "map-reduced-motion.png");
    if (project === "webgl-off" && url.endsWith("/v2/map/index.html")) await copyArtifact(file, "map-webgl-off.png");
    if (project === "desktop" && url.endsWith("/v2/labs/portals/index.html")) await copyArtifact(file, "portals-index-1440.png");

    if (project === "reduced-motion" && (ours === "portal" || ours === "map" || ours === "portals")) {
      await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
      const reduced = await page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      expect(reduced).toBe(true);
      if (ours === "portal") {
        const animation = await page.locator(".spin").evaluate((el) => getComputedStyle(el).animationName);
        expect(animation).toBe("none");
      }
    }

    if (project === "webgl-off" && (ours === "portal" || ours === "map")) {
      await expect(page.locator("html")).toHaveAttribute("data-webgl", "off");
      const context = await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        return canvas.getContext("webgl");
      });
      expect(context).toBeNull();
      if (ours === "map") {
        await expect(page.locator(".map-svg").first()).toBeVisible();
        await expect(page.locator("#card-hub")).toBeVisible();
        await expect(page.locator("#glossary")).toBeVisible();
        await expect(page.locator("#globe-try")).toBeHidden();
      }
      if (ours === "portal") {
        await expect(page.locator("#hero-art svg")).toBeVisible();
        await expect(page.locator("#globe-slot")).toBeHidden();
        await expect(page.getByRole("link", { name: "Open lab" }).first()).toBeVisible();
        await expect(page.getByRole("link", { name: "View repo" })).toBeVisible();
      }
    }

    if (project === "desktop") {
      const hrefs = await page.evaluate(() => {
        const found = [];
        document.querySelectorAll("a[href], link[href], script[src]").forEach((el) => {
          if (el.matches && el.matches("link[rel~='canonical']")) return;
          const raw = el.getAttribute("href") || el.getAttribute("src");
          if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("javascript:")) return;
          found.push(new URL(raw, location.href).href);
        });
        return found;
      });
      const failures = await checkLinks(request, hrefs);
      expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
    }
  });
}

test.afterAll(async ({}, info) => {
  if (info.project.name !== "desktop") return;
  await mkdir(path.join(qaDir, "report"), { recursive: true });
  const rows = [...linkCache.entries()].map(([href, row]) => ({ href, ...row }));
  await writeFile(path.join(qaDir, "report", "links.json"), JSON.stringify(rows, null, 2));
  await mkdir("/opt/cursor/artifacts", { recursive: true });
  await writeFile("/opt/cursor/artifacts/v2-qa-links.json", JSON.stringify({ pages, links: rows }, null, 2));
});
