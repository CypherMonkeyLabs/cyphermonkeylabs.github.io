/**
 * Navigation contract (agent B).
 *
 *   import { mountNav } from "/js/nav/index.js";
 *   import { mountSettings } from "/js/settings/index.js";
 *
 *   const nav = await mountNav(root, labs);
 *   mountSettings();
 *
 * `labs` is an array, or { labs, pages, timeline, gems }.
 * Field names from /data/labs.json (pack 3: title, repo, summary)
 * and the current manifest (name, source, description) both work.
 * Pass nothing and the module fetches /data/labs.json, then /labs.json.
 *
 * Settings live in localStorage under `cm.settings`.
 * `document` receives `cm:settings` with theme, lang, sound, and motion.
 * `theme` and `motion` are the resolved values (what to paint).
 * `themePreference` and `motionPreference` keep "system".
 * Pre-paint: <script src="/js/settings/boot.js"></script> before CSS.
 * Other modules can ask for a sound with `cm:sound` { cue: "tick"|"open"|"sent" }.
 * Polite live region: #cm-polite. Assertive, for form errors: #cm-assertive.
 */

import { buildIndex, loadDefaultLabs, normalizeCatalog, pushRecent } from "./catalog.js";
import { mountChrome, contactClick } from "./chrome.js";
import { applyI18n, t, tf } from "./i18n.js";
import { brandMark } from "./icons.js";
import { mountPalette } from "./palette.js";
import { toHref } from "./routes.js";
import { mountSheet } from "./sheet.js";
import { playCue, primeFromGesture } from "../settings/sound.js";
import { getStore } from "../settings/store.js";

export function mountNav(rootEl, labsInput) {
  if (!rootEl) throw new Error("mountNav needs a root element");
  if (labsInput == null) return loadDefaultLabs().then((catalog) => start(rootEl, catalog));
  return Promise.resolve(start(rootEl, normalizeCatalog(labsInput)));
}

function start(rootEl, initial) {
  const store = getStore();
  const ac = new AbortController();
  const nodes = [];
  let catalog = initial;
  let index = [];
  const demo = rootEl.dataset.demo === "true";
  const ctx = {
    root: rootEl,
    signal: ac.signal,
    demo,
    nodes,
    api: {},
    brand: brandMark,
    getLang() { return store.getState().lang; },
    t(key) { return t(store.getState().lang, key); },
    tf(key, vars) { return tf(store.getState().lang, key, vars); },
    getState() { return store.getState(); },
    getCatalog() { return catalog; },
    getIndex() { return index; },
    href(path) { return toHref(path, demo); },
    updateSettings(partial) { return store.update(partial); },
  };

  function rebuild() {
    index = buildIndex(catalog, { lang: ctx.getLang(), t: ctx.t });
  }
  rebuild();
  rootEl.replaceChildren();

  const chrome = mountChrome(ctx);
  const sheet = mountSheet(ctx);
  const palette = mountPalette(ctx);
  ctx.api.openMenu = (trigger) => sheet.open(trigger);
  ctx.api.openPalette = (trigger) => {
    chrome.closeMega(false);
    if (sheet.dialog.open) {
      sheet.close(() => palette.open(trigger));
      return;
    }
    palette.open(trigger);
  };
  ctx.api.openSettings = (trigger) => {
    document.dispatchEvent(new CustomEvent("cm:open-settings", { detail: { trigger } }));
  };

  if (!document.getElementById("cm-polite")) {
    const polite = document.createElement("div");
    polite.id = "cm-polite";
    polite.className = "cm-sr";
    polite.setAttribute("aria-live", "polite");
    polite.setAttribute("aria-atomic", "true");
    const assertive = document.createElement("div");
    assertive.id = "cm-assertive";
    assertive.className = "cm-sr";
    assertive.setAttribute("aria-live", "assertive");
    assertive.setAttribute("aria-atomic", "true");
    document.body.append(polite, assertive);
    nodes.push(polite, assertive);
  }

  let lastLang = ctx.getLang();
  const onSettings = (event) => {
    const state = event.detail || store.getState();
    const langChanged = state.lang !== lastLang;
    lastLang = state.lang;
    if (langChanged) rebuild();
    applyI18n(document, state.lang);
    chrome.sync(state);
    sheet.sync(state);
    if (langChanged) {
      sheet.render();
      palette.render();
      chrome.renderMega();
    }
  };
  document.addEventListener("cm:settings", onSettings, { signal: ac.signal });

  document.addEventListener("click", (event) => {
    const contact = event.target.closest?.("[data-contact]");
    if (contact) {
      const go = () => {
        const handled = contactClick(event, demo);
        if (!handled) window.location.assign(contact.href);
      };
      if (sheet.dialog.open) {
        event.preventDefault();
        sheet.close(go);
      } else {
        go();
      }
    }
    const lab = event.target.closest?.("[data-lab]");
    if (!lab?.dataset.lab) return;
    pushRecent(lab.dataset.lab);
    if (lab.dataset.cue === "open") {
      primeFromGesture();
      playCue("open");
    }
  }, { signal: ac.signal });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (palette.dialog.open) palette.close();
      else ctx.api.openPalette(chrome.searchBtn);
      return;
    }
    if (event.key !== "/" || !store.getState().shortcuts) return;
    const active = document.activeElement;
    const tag = active?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || active?.isContentEditable) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    event.preventDefault();
    ctx.api.openPalette(chrome.searchBtn);
  }, { signal: ac.signal });

  applyI18n(document, ctx.getLang());
  chrome.sync(store.getState());
  sheet.sync(store.getState());

  return {
    destroy() {
      ac.abort();
      for (const node of nodes) node.remove();
      rootEl.replaceChildren();
    },
    setLabs(next) {
      catalog = normalizeCatalog(next);
      rebuild();
      sheet.render();
      palette.render();
      chrome.renderMega();
    },
    openMenu: ctx.api.openMenu,
    openPalette: ctx.api.openPalette,
    openSettings: ctx.api.openSettings,
  };
}
