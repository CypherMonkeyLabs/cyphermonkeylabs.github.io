import { PATHS } from "./routes.js";

export const CATEGORIES = [
  { id: "contact-center", labelKey: "cat.contact-center", accent: "peach", order: 1 },
  { id: "unified-comms", labelKey: "cat.unified-comms", accent: "sky", order: 2 },
  { id: "protocols", labelKey: "cat.protocols", accent: "mint", order: 3 },
  { id: "ai", labelKey: "cat.ai", accent: "lavender", order: 4 },
  { id: "tools", labelKey: "cat.tools", accent: "butter", order: 5 },
  { id: "languages", labelKey: "cat.languages", accent: "pink", order: 6 },
  { id: "coding", labelKey: "cat.coding", accent: "mint", order: 7 },
];

const RECENTS_KEY = "cm.recents";
const RECENTS_MAX = 8;
const RESULT_LIMIT = 40;

export function memoryBag(seed = {}) {
  const data = new Map(Object.entries(seed));
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); },
  };
}

function bagOr(storage) {
  if (storage) return storage;
  try {
    if (typeof localStorage !== "undefined") return localStorage;
  } catch (err) {
    return memoryBag();
  }
  return memoryBag();
}

export function norm(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function titleCaseId(id) {
  return String(id || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function categoryMeta(id) {
  return CATEGORIES.find((category) => category.id === id) || {
    id,
    labelKey: "",
    accent: "lavender",
    order: 99,
    fallbackLabel: titleCaseId(id),
  };
}

function normalizeStatus(value) {
  const status = String(value || "live");
  switch (status) {
    case "live":
    case "beta":
    case "coming-soon":
    case "archived":
      return status;
    case "coming":
      return "coming-soon";
    default:
      return "live";
  }
}

function httpsUrl(value) {
  const url = String(value || "").trim();
  if (!/^https:\/\//i.test(url)) return "";
  return url;
}

export function normalizeLab(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = String(raw.id || "").trim();
  const title = String(raw.title || raw.name || "").trim();
  if (!id || !title) return null;
  const tags = Array.isArray(raw.tags) ? raw.tags.map((tag) => String(tag)) : [];
  const repo = httpsUrl(raw.repo || raw.source);
  return {
    id,
    title,
    shortTitle: String(raw.shortTitle || raw.short || title),
    tagline: String(raw.tagline || ""),
    summary: String(raw.summary || raw.description || ""),
    category: String(raw.category || "tools"),
    tags,
    status: normalizeStatus(raw.status),
    featured: Boolean(raw.featured),
    order: Number.isFinite(Number(raw.order)) ? Number(raw.order) : 0,
    url: httpsUrl(raw.url),
    repo: /^https:\/\/github\.com\//i.test(repo) ? repo : "",
    kind: raw.kind === "gallery" ? "gallery" : "lab",
    i18n: raw.i18n && typeof raw.i18n === "object" ? raw.i18n : {},
  };
}

export function normalizeCatalog(input) {
  const source = Array.isArray(input) ? { labs: input } : (input || {});
  const list = Array.isArray(source.labs) ? source.labs : [];
  return {
    labs: list.map(normalizeLab).filter(Boolean),
    pages: Array.isArray(source.pages) ? source.pages : null,
    timeline: Array.isArray(source.timeline) ? source.timeline : [],
    gems: Array.isArray(source.gems) ? source.gems : [],
  };
}

export function labText(lab, lang) {
  const localized = lang !== "en" ? lab.i18n?.[lang] : null;
  if (localized?.title) {
    return {
      title: String(localized.title),
      summary: String(localized.summary || localized.tagline || lab.summary || ""),
      fallback: false,
    };
  }
  return {
    title: lab.title,
    summary: lab.summary,
    fallback: lang !== "en",
  };
}

export function groupByCategory(labs) {
  const buckets = new Map();
  for (const lab of labs) {
    if (!buckets.has(lab.category)) buckets.set(lab.category, []);
    buckets.get(lab.category).push(lab);
  }
  const rank = new Map(CATEGORIES.map((category) => [category.id, category.order]));
  return [...buckets.keys()]
    .sort((a, b) => (rank.get(a) ?? 99) - (rank.get(b) ?? 99) || a.localeCompare(b))
    .map((id) => ({
      id,
      labs: buckets.get(id).slice().sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
    }));
}

function defaultPages() {
  return [
    { id: "home", titleKey: "page.home", href: PATHS.home, group: "pages" },
    { id: "labs", titleKey: "page.labs", href: PATHS.labs, group: "pages" },
    { id: "guide", titleKey: "page.guide", href: PATHS.learn, group: "pages" },
    { id: "about", titleKey: "page.about", href: PATHS.about, group: "pages" },
    { id: "legal", titleKey: "page.legal", href: PATHS.legal, group: "pages" },
    { id: "privacy", titleKey: "page.privacy", href: PATHS.privacy, group: "pages" },
    { id: "a11y", titleKey: "page.a11y", href: PATHS.a11y, group: "pages" },
    { id: "contact", titleKey: "page.contact", href: PATHS.contact, group: "pages" },
  ];
}

function defaultTimeline() {
  return [{ id: "timeline", titleKey: "page.timeline", summaryKey: "page.timeline.summary", href: PATHS.timeline, group: "timeline" }];
}

function defaultGems() {
  return [{ id: "gems-page", titleKey: "page.gems", summaryKey: "page.gems.summary", href: PATHS.gems, group: "gems" }];
}

export function buildIndex(catalog, translate) {
  const items = [];
  for (const lab of catalog.labs) {
    const text = labText(lab, translate.lang);
    const meta = categoryMeta(lab.category);
    items.push({
      id: `lab:${lab.id}`,
      labId: lab.id,
      group: lab.kind === "gallery" ? "gems" : "labs",
      title: text.title,
      summary: text.summary,
      href: lab.url,
      repo: lab.repo,
      tags: lab.tags,
      category: lab.category,
      categoryLabel: meta.labelKey ? translate.t(meta.labelKey) : (meta.fallbackLabel || titleCaseId(lab.category)),
      featured: lab.featured,
      status: lab.status,
      fallback: text.fallback,
      external: false,
    });
  }
  const pages = catalog.pages || defaultPages();
  const timeline = catalog.timeline.length ? catalog.timeline : defaultTimeline();
  const gems = catalog.gems.length ? catalog.gems : defaultGems();
  for (const entry of [...pages, ...timeline, ...gems]) {
    items.push({
      id: `${entry.group || "pages"}:${entry.id}`,
      group: entry.group || "pages",
      title: entry.title || (entry.titleKey ? translate.t(entry.titleKey) : entry.id),
      summary: entry.summary || (entry.summaryKey ? translate.t(entry.summaryKey) : ""),
      href: entry.href || "",
      tags: entry.tags || [],
      categoryLabel: "",
      featured: false,
      status: "live",
      fallback: false,
      external: false,
    });
  }
  return items;
}

function fuzzy(query, text) {
  if (query.length < 3) return false;
  let cursor = 0;
  let start = -1;
  for (let i = 0; i < query.length; i += 1) {
    const found = text.indexOf(query[i], cursor);
    if (found < 0) return false;
    if (start < 0) start = found;
    cursor = found + 1;
  }
  const span = cursor - start;
  return span <= Math.max(query.length * 3, query.length + 2);
}

export function scoreItem(query, item) {
  const q = norm(query);
  if (!q) return 1;
  const title = norm(item.title);
  const summary = norm(item.summary);
  const category = norm(item.categoryLabel);
  const id = norm(item.labId || item.id);
  const tags = (item.tags || []).map(norm);
  if (title === q || id === q) return 120;
  if (title.startsWith(q)) return 100;
  if (title.split(" ").some((word) => word.startsWith(q))) return 84;
  if (tags.some((tag) => tag === q || tag.startsWith(q))) return 76;
  if (category.startsWith(q)) return 68;
  if (title.includes(q)) return 58;
  if (q.length >= 4 && (tags.some((tag) => tag.includes(q)) || category.includes(q))) return 48;
  if (summary.includes(q) && (q.length >= 4 || summary.split(" ").some((word) => word.startsWith(q)))) return 36;
  if (q.length >= 4 && (fuzzy(q, title) || fuzzy(q, tags.join(" ")))) return 28;
  return 0;
}

export function queryIndex(items, query, options = {}) {
  const limit = options.limit || RESULT_LIMIT;
  const q = norm(query);
  if (!q) {
    const curated = [];
    const seen = new Set();
    const labs = items.filter((item) => item.group === "labs" || (item.group === "gems" && item.labId));
    const byCat = new Map();
    for (const item of labs) {
      const key = item.category || item.group;
      if (!byCat.has(key)) byCat.set(key, []);
      byCat.get(key).push(item);
    }
    for (const group of byCat.values()) {
      const pick = group.find((item) => item.featured) || group[0];
      if (pick && !seen.has(pick.id)) {
        curated.push(pick);
        seen.add(pick.id);
      }
    }
    for (const item of items) {
      if (item.group !== "labs" && !seen.has(item.id)) {
        curated.push(item);
        seen.add(item.id);
      }
    }
    return { items: curated.slice(0, limit), total: curated.length, emptyQuery: true };
  }
  const ranked = [];
  for (const item of items) {
    const score = scoreItem(q, item);
    if (score > 0) ranked.push({ item, score });
  }
  ranked.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));
  return {
    items: ranked.slice(0, limit).map((row) => row.item),
    total: ranked.length,
    emptyQuery: false,
  };
}

export function readRecents(storage) {
  try {
    const parsed = JSON.parse(bagOr(storage).getItem(RECENTS_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === "string" && id.length > 0 && id.length < 80).slice(0, RECENTS_MAX);
  } catch (err) {
    return [];
  }
}

export function pushRecent(id, storage) {
  const bag = bagOr(storage);
  const next = [id, ...readRecents(bag).filter((item) => item !== id)].slice(0, RECENTS_MAX);
  try {
    bag.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch (err) {
    return next;
  }
  return next;
}

export async function loadDefaultLabs() {
  const urls = ["/data/labs.json", "/labs.json"];
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) return normalizeCatalog(await response.json());
    } catch (err) {
      /* Try the next manifest path. */
    }
  }
  return normalizeCatalog([]);
}
