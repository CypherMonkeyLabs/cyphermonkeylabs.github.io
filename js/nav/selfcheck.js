import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { buildIndex, groupByCategory, normalizeCatalog, normalizeLab, queryIndex, scoreItem } from "./catalog.js";
import { demoCatalog, makeScaleLabs } from "./demo-data.js";
import { languageKeys, t } from "./i18n.js";
import { SOCIAL } from "./social.js";
import { computeState, createStore, memoryStorage, pickKnown } from "../settings/store.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "assets") continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path, out);
    else if (/\.(js|css|html)$/.test(name)) out.push(path);
  }
  return out;
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function channel(part) {
  const c = part / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function contrast(a, b) {
  const lum = (hex) => {
    const [r, g, bChannel] = hexToRgb(hex);
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(bChannel);
  };
  const hi = Math.max(lum(a), lum(b));
  const lo = Math.min(lum(a), lum(b));
  return (hi + 0.05) / (lo + 0.05);
}

function themeBlocks(css) {
  const blocks = {};
  const re = /(?:^|\n)([^{}]+)\{([^}]+)\}/g;
  let match = re.exec(css);
  while (match) {
    const body = match[2];
    const vars = {};
    for (const line of body.split(";")) {
      const hit = line.match(/(--[\w-]+)\s*:\s*(#[0-9A-Fa-f]{6})/);
      if (hit) vars[hit[1]] = hit[2].toUpperCase();
    }
    const selector = match[1].trim().replace(/\s+/g, " ");
    if (selector === ":root, html[data-theme=\"dawn\"]") blocks.dawn = vars;
    if (selector === "html[data-theme=\"starlight\"]") blocks.starlight = vars;
    if (selector === "html[data-theme=\"contrast\"]") blocks.contrast = vars;
    match = re.exec(css);
  }
  return blocks;
}

const quiet = { search: "", pathname: "/", dark: false, reduce: false, moreContrast: false };

test("English and Spanish chrome strings use the same keys", () => {
  const keys = languageKeys();
  assert.deepEqual(keys.en.slice().sort(), keys.es.slice().sort());
  assert.equal(t("es", "page.timeline"), "Línea de tiempo");
});

test("search ignores accents and ranks a SIP prefix", () => {
  const catalog = normalizeCatalog(demoCatalog);
  const index = buildIndex(catalog, {
    lang: "es",
    t: (key) => t("es", key),
  });
  const sip = queryIndex(index, "sip");
  assert.equal(sip.items[0].labId, "sip");
  assert.equal(sip.items[0].title, "Universo SIP");
  const timeline = index.find((item) => item.id.endsWith(":timeline"));
  assert.ok(timeline);
  assert.ok(scoreItem("linea", timeline) >= 84);
  const found = queryIndex(index, "linea");
  assert.ok(found.items.some((item) => item.id.endsWith(":timeline")));
});

test("one hundred sample labs group without dropping any", () => {
  const scaled = normalizeCatalog(makeScaleLabs(100));
  assert.equal(scaled.labs.length, 100);
  assert.ok(scaled.labs.every((lab) => lab.title.startsWith("Sample lab ")));
  assert.ok(scaled.labs.every((lab) => lab.summary.includes("not a real course")));
  const groups = groupByCategory(scaled.labs);
  const sum = groups.reduce((total, group) => total + group.labs.length, 0);
  assert.equal(sum, 100);
  assert.ok(groups.length >= 7);
  assert.ok(scaled.labs.some((lab) => lab.status === "coming-soon" && lab.url === ""));
});

test("legacy settings migrate into cm.settings and contrast stays automatic", () => {
  const storage = memoryStorage({
    "cml:settings:v1": JSON.stringify({
      theme: "starlight",
      lang: "es",
      sound: "ui",
      motion: "reduce",
      volume: 83,
    }),
  });
  const store = createStore({ storage, env: quiet });
  const first = store.getState();
  assert.equal(first.theme, "starlight");
  assert.equal(first.lang, "es");
  assert.equal(first.motion, "reduce");
  assert.equal(first.volume, 85);
  store.update({ shortcuts: false });
  assert.equal(storage.getItem("cml:settings:v1"), null);
  const saved = JSON.parse(storage.getItem("cm.settings"));
  assert.equal(saved.theme, "starlight");
  assert.equal(saved.volume, 85);
  assert.equal(saved.shortcuts, false);

  const contrast = computeState({}, {}, { ...quiet, moreContrast: true });
  assert.equal(contrast.theme, "contrast");
  assert.equal(contrast.themePreference, "dawn");
  const kept = computeState({ theme: "dawn" }, {}, { ...quiet, moreContrast: true });
  assert.equal(kept.theme, "dawn");
});

test("theme, motion, and quality in the URL stay out of storage", () => {
  const storage = memoryStorage();
  const store = createStore({
    storage,
    env: { ...quiet, search: "?theme=starlight&motion=reduce&quality=low" },
  });
  const state = store.getState();
  assert.equal(state.theme, "starlight");
  assert.equal(state.motion, "reduce");
  assert.equal(state.quality, "low");
  assert.equal(storage.getItem("cm.settings"), null);
  store.update({ lang: "es" });
  const saved = JSON.parse(storage.getItem("cm.settings"));
  assert.equal(saved.lang, "es");
  assert.equal(saved.theme, undefined);
  assert.equal(store.getState().theme, "starlight");
  store.reset();
  assert.equal(store.getState().theme, "dawn");
  assert.equal(pickKnown({ textScale: 1.1, volume: "nope" }).textScale, undefined);
});

test("author links match the contract and skip a profile and an address", () => {
  assert.deepEqual(SOCIAL.map((item) => item.id), ["x", "linktree", "hf", "github", "githubOrg", "devto"]);
  assert.equal(SOCIAL.find((item) => item.id === "x").href, "https://x.com/Cypher0x9");
  assert.equal(SOCIAL.find((item) => item.id === "github").href, "https://github.com/cipher0x9");
  assert.equal(SOCIAL.find((item) => item.id === "githubOrg").href, "https://github.com/CypherMonkeyLabs");
  const owned = walk(join(root, "js"))
    .filter((path) => !path.endsWith("selfcheck.js"))
    .concat(walk(join(root, "css")), join(root, "nav-demo.html"));
  const blob = owned.map((path) => readFileSync(path, "utf8")).join("\n").toLowerCase();
  assert.equal(blob.includes("mailto:"), false);
  assert.equal(blob.includes("linkedin"), false);
  assert.equal(blob.includes('href="#"'), false);
});

test("starter labs keep https GitHub repos and map coming to coming-soon", () => {
  const labs = normalizeCatalog(demoCatalog).labs;
  const canon = labs.find((lab) => lab.id === "canon");
  assert.equal(canon.featured, true);
  assert.equal(canon.repo, "");
  assert.equal(labs.find((lab) => lab.id === "gcp-cc").status, "coming-soon");
  assert.equal(normalizeLab({ id: "x", title: "X", repo: "https://example.com/nope" }).repo, "");
  assert.equal(labs.filter((lab) => lab.i18n.es).map((lab) => lab.id).join(), "sip");
});

test("token pairs used for text clear WCAG AA", () => {
  const css = readFileSync(join(root, "css/tokens.css"), "utf8");
  const themes = themeBlocks(css);
  assert.equal(themes.dawn["--bg"], "#FBF7FF");
  assert.equal(themes.starlight["--bg"], "#0F1030");
  assert.equal(themes.contrast["--focus"], "#000000");
  assert.equal(themes.contrast["--focus-halo"], "#FFFF00");
  const pairs = [
    ["dawn", "--ink", "--bg"],
    ["dawn", "--ink", "--surface"],
    ["dawn", "--on-primary", "--primary"],
    ["dawn", "--ink-muted", "--bg"],
    ["starlight", "--ink", "--bg"],
    ["starlight", "--ink-muted", "--bg"],
    ["starlight", "--on-primary", "--primary"],
    ["contrast", "--ink", "--bg"],
    ["contrast", "--on-primary", "--primary"],
  ];
  for (const [theme, fg, bg] of pairs) {
    const ratio = contrast(themes[theme][fg], themes[theme][bg]);
    assert.ok(ratio >= 4.5, `${theme} ${fg} on ${bg} is ${ratio.toFixed(2)}`);
  }
});
