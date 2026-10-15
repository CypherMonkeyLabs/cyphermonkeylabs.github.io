/** Settings store. localStorage key: cm.settings. Event: cm:settings. */

export const KEY = "cm.settings";
export const LEGACY_KEY = "cml:settings:v1";

const THEMES = ["dawn", "starlight", "contrast", "system"];
const MOTIONS = ["system", "reduce", "full"];
const SOUNDS = ["off", "ui", "ambient"];
const QUALITIES = ["auto", "high", "medium", "low", "static"];
const MASCOTS = ["animated", "still", "hidden"];
const RAILS = ["expanded", "collapsed", "auto"];
const LANGS = ["en", "es"];
const SCALES = [1, 1.12, 1.25, 1.5];
const QUERY_KEYS = {
  theme: THEMES,
  motion: MOTIONS,
  quality: QUALITIES,
};

const THEME_COLOR = {
  dawn: "#FBF7FF",
  starlight: "#0F1030",
  contrast: "#FFFFFF",
};

export function memoryStorage(seed = {}) {
  const data = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    },
  };
}

export function browserStorage() {
  return {
    getItem(key) {
      try {
        return localStorage.getItem(key);
      } catch (err) {
        return null;
      }
    },
    setItem(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (err) {
        /* Quota or private mode. The in-memory session still updates the page. */
      }
    },
    removeItem(key) {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        /* Ignore private-mode removal failures. */
      }
    },
  };
}

function parse(json) {
  if (!json) return null;
  try {
    const value = JSON.parse(json);
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value;
  } catch (err) {
    return null;
  }
}

export function readRawSettings(storage) {
  return parse(storage.getItem(KEY)) || parse(storage.getItem(LEGACY_KEY)) || {};
}

function snapVolume(value) {
  const n = Math.round(Number(value) / 5) * 5;
  if (!Number.isFinite(n)) return 80;
  return Math.min(100, Math.max(0, n));
}

function pickScale(value) {
  const n = Number(value);
  for (const scale of SCALES) {
    if (Math.abs(scale - n) < 0.001) return scale;
  }
  return null;
}

export function pickKnown(raw) {
  const out = {};
  if (!raw || typeof raw !== "object") return out;
  if (THEMES.includes(raw.theme)) out.theme = raw.theme;
  if (LANGS.includes(raw.lang)) out.lang = raw.lang;
  if (MOTIONS.includes(raw.motion)) out.motion = raw.motion;
  if (SOUNDS.includes(raw.sound)) out.sound = raw.sound;
  if (QUALITIES.includes(raw.quality)) out.quality = raw.quality;
  if (MASCOTS.includes(raw.mascot)) out.mascot = raw.mascot;
  if (RAILS.includes(raw.authorRail)) out.authorRail = raw.authorRail;
  if (typeof raw.shortcuts === "boolean") out.shortcuts = raw.shortcuts;
  if (typeof raw.tilt === "boolean") out.tilt = raw.tilt;
  if ("volume" in raw && raw.volume != null && raw.volume !== "") {
    const volume = Number(raw.volume);
    if (Number.isFinite(volume)) out.volume = snapVolume(volume);
  }
  const scale = pickScale(raw.textScale);
  if (scale != null && "textScale" in raw) out.textScale = scale;
  return out;
}

export function parseQuery(search) {
  const params = new URLSearchParams(search || "");
  const out = {};
  for (const [key, allowed] of Object.entries(QUERY_KEYS)) {
    const value = params.get(key);
    if (value && allowed.includes(value)) out[key] = value;
  }
  return out;
}

function withDefaults(picked, env) {
  let lang = picked.lang;
  if (!lang) {
    const path = env.pathname || "/";
    lang = path === "/es" || path.startsWith("/es/") ? "es" : "en";
  }
  return {
    v: 1,
    theme: picked.theme || "dawn",
    lang,
    motion: picked.motion || "system",
    sound: picked.sound || "off",
    volume: picked.volume ?? 80,
    quality: picked.quality || "auto",
    mascot: picked.mascot || "animated",
    textScale: picked.textScale || 1,
    shortcuts: picked.shortcuts ?? true,
    tilt: picked.tilt ?? false,
    authorRail: picked.authorRail || "auto",
  };
}

export function resolveThemePref(theme, env) {
  switch (theme) {
    case "dawn":
    case "starlight":
    case "contrast":
      return theme;
    case "system":
      return env.dark ? "starlight" : "dawn";
    default: {
      const unknown = theme;
      throw new Error(`Unknown theme: ${String(unknown)}`);
    }
  }
}

export function resolveMotionPref(motion, env) {
  switch (motion) {
    case "reduce":
    case "full":
      return motion;
    case "system":
      return env.reduce ? "reduce" : "full";
    default: {
      const unknown = motion;
      throw new Error(`Unknown motion: ${String(unknown)}`);
    }
  }
}

export function computeState(raw, session, env) {
  const picked = pickKnown(raw || {});
  const query = pickKnown(session || {});
  const prefs = withDefaults({ ...picked, ...query }, env);
  const resolvedTheme = !picked.theme && !query.theme && env.moreContrast
    ? "contrast"
    : resolveThemePref(prefs.theme, env);
  const resolvedMotion = resolveMotionPref(prefs.motion, env);
  return {
    v: 1,
    theme: resolvedTheme,
    themePreference: prefs.theme,
    lang: prefs.lang,
    sound: prefs.sound,
    motion: resolvedMotion,
    motionPreference: prefs.motion,
    volume: prefs.volume,
    quality: prefs.quality,
    mascot: prefs.mascot,
    textScale: prefs.textScale,
    shortcuts: prefs.shortcuts,
    tilt: prefs.tilt,
    authorRail: prefs.authorRail,
  };
}

function defaultEnv() {
  if (typeof window === "undefined") {
    return { search: "", pathname: "/", dark: false, reduce: false, moreContrast: false };
  }
  return {
    search: window.location.search,
    pathname: window.location.pathname,
    dark: window.matchMedia("(prefers-color-scheme: dark)").matches,
    reduce: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    moreContrast: window.matchMedia("(prefers-contrast: more)").matches,
  };
}

export function createStore(options = {}) {
  const storage = options.storage || (typeof localStorage === "undefined" ? memoryStorage() : browserStorage());
  const readEnv = typeof options.env === "function" ? options.env : () => options.env || defaultEnv();
  let session = parseQuery(readEnv().search);
  const listeners = new Set();

  function snapshot() {
    return computeState(readRawSettings(storage), session, readEnv());
  }

  function notify() {
    const state = snapshot();
    for (const listener of listeners) listener(state);
    return state;
  }

  return {
    getState: snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    update(partial) {
      const next = { ...readRawSettings(storage) };
      for (const [key, value] of Object.entries(partial || {})) {
        next[key] = value;
        delete session[key];
      }
      const clean = { ...pickKnown(next), v: 1 };
      storage.setItem(KEY, JSON.stringify(clean));
      storage.removeItem(LEGACY_KEY);
      return notify();
    },
    reset() {
      storage.removeItem(KEY);
      storage.removeItem(LEGACY_KEY);
      session = {};
      return notify();
    },
    notify,
  };
}

let singleton = null;

export function getStore() {
  if (!singleton) singleton = createStore();
  return singleton;
}

export function bindDocument(store) {
  if (typeof document === "undefined") return () => {};
  const apply = (state) => {
    const root = document.documentElement;
    root.dataset.theme = state.theme;
    root.dataset.motion = state.motion;
    root.dataset.quality = state.quality;
    root.dataset.mascot = state.mascot;
    root.lang = state.lang;
    root.style.setProperty("--text-scale", String(state.textScale));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && THEME_COLOR[state.theme]) meta.setAttribute("content", THEME_COLOR[state.theme]);
    document.dispatchEvent(new CustomEvent("cm:settings", { detail: state }));
  };
  const unsubscribe = store.subscribe(apply);
  apply(store.getState());
  const queries = [
    window.matchMedia("(prefers-color-scheme: dark)"),
    window.matchMedia("(prefers-reduced-motion: reduce)"),
    window.matchMedia("(prefers-contrast: more)"),
  ];
  const onMedia = () => store.notify();
  for (const query of queries) query.addEventListener("change", onMedia);
  return () => {
    unsubscribe();
    for (const query of queries) query.removeEventListener("change", onMedia);
  };
}
