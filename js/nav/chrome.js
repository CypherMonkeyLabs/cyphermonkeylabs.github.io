import { announce, el } from "./dom.js";
import { brandMark, icon } from "./icons.js";
import { categoryMeta, groupByCategory, labText } from "./catalog.js";
import { isCurrent, PATHS } from "./routes.js";
import { SOCIAL } from "./social.js";
import { playCue, primeFromGesture } from "../settings/sound.js";
import { bindDialog, closeDialog, isReduced, openDialog } from "./focus.js";

function tick() {
  primeFromGesture();
  playCue("tick");
}

function focusTarget(id) {
  const target = document.getElementById(id);
  if (!target) return;
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus();
}

export function mountChrome(ctx) {
  const { root, signal } = ctx;
  const skipMain = el("a", { class: "cm-skip", href: "#main", "data-i18n": "skip.main" });
  const skipLabs = el("a", { class: "cm-skip", href: "#labs-list", "data-i18n": "skip.labs" });
  for (const link of [skipMain, skipLabs]) {
    link.addEventListener("click", () => focusTarget(link.getAttribute("href").slice(1)));
  }

  const logo = el("a", { class: "cm-logo", href: ctx.href(PATHS.home) }, [
    el("span", { class: "cm-logo__mark" }, brandMark()),
    el("span", { class: "cm-logo__full", "data-i18n": "logo.full" }),
    el("span", { class: "cm-logo__short", "aria-hidden": "true", "data-i18n": "logo.short" }),
  ]);

  const labsBtn = el("button", {
    type: "button",
    class: "cm-primary__link",
    "aria-expanded": "false",
    "aria-controls": "cm-mega",
    "data-path": PATHS.labs,
  }, [
    icon("labs"),
    el("span", { "data-i18n": "nav.labs" }),
  ]);
  const link = (path, key, iconName) => el("a", {
    class: "cm-primary__link",
    href: ctx.href(path),
    "data-path": path,
  }, [icon(iconName), el("span", { "data-i18n": key })]);

  const effects = el("button", {
    type: "button",
    class: "cm-primary__link",
  }, [icon("gear"), el("span", { "data-i18n": "nav.effects" })]);
  const primary = el("nav", { class: "cm-primary", "data-i18n-attr": "aria-label:nav.primary" }, [
    link(PATHS.play, "nav.universe", "play"),
    labsBtn,
    link(PATHS.timeline, "nav.timeline", "timeline"),
    link(PATHS.gems, "nav.gems", "gems"),
    link(PATHS.about, "nav.about", "about"),
    link(PATHS.contact, "nav.contact", "contact"),
    effects,
  ]);

  const mega = el("div", { id: "cm-mega", class: "cm-mega cm-glass", hidden: true });
  const megaBody = el("div", { class: "cm-mega__body" });
  mega.append(megaBody);
  primary.append(mega);

  const menuBtn = el("button", {
    type: "button",
    class: "cm-menu-btn",
    "aria-expanded": "false",
    "aria-controls": "cm-menu",
    "data-i18n-attr": "aria-label:dock.menu.long",
  }, [icon("menu"), el("span", { "data-i18n": "nav.menu" })]);

  const mac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || "");
  const searchBtn = el("button", {
    type: "button",
    class: "cm-search",
    "data-i18n-attr": "aria-label:nav.search",
    "aria-keyshortcuts": "Control+K Meta+K",
    "aria-controls": "cm-palette",
    "aria-expanded": "false",
  }, [
    icon("search"),
    el("span", { class: "cm-search__label", "data-i18n": "nav.search" }),
    el("kbd", { class: "cm-kbd", "aria-hidden": "true" }, mac ? "⌘K" : "Ctrl K"),
  ]);
  const contact = el("a", {
    class: "cm-contact",
    href: ctx.href(PATHS.contact),
    "data-contact": "true",
    "data-path": PATHS.contact,
  }, [el("span", { "data-i18n": "nav.contact" })]);
  const settingsBtn = el("button", {
    type: "button",
    class: "cm-icon-btn",
    "data-cm-settings": "true",
    "data-i18n-attr": "aria-label:nav.settings",
  }, [icon("gear")]);

  const tools = el("div", { class: "cm-tools" }, [searchBtn, contact, settingsBtn]);
  const rail = buildRail(ctx);
  const row = el("div", { class: "cm-bar__row" }, [rail.launch, logo, primary, menuBtn, tools]);
  const bar = el("header", { class: "cm-bar cm-glass" }, [row]);

  const dock = buildDock(ctx);
  const banner = buildBanner(ctx);

  root.append(skipMain, skipLabs, bar, rail.drawer, rail.slot, dock.element, banner.element);

  function closeMega(returnFocus) {
    mega.hidden = true;
    labsBtn.setAttribute("aria-expanded", "false");
    if (returnFocus) labsBtn.focus();
  }

  function renderMega() {
    const lang = ctx.getLang();
    megaBody.replaceChildren();
    const groups = groupByCategory(ctx.getCatalog().labs);
    if (!groups.length) {
      megaBody.append(el("p", { class: "cm-empty" }, ctx.t("menu.empty")));
      return;
    }
    const grid = el("div", { class: "cm-mega__grid" });
    for (const group of groups) {
      const meta = categoryMeta(group.id);
      const name = meta.labelKey ? ctx.t(meta.labelKey) : meta.fallbackLabel;
      const card = el("div", { class: "cm-mega__card" });
      card.append(el("a", { class: "cm-mega__head", href: ctx.href(PATHS.labs) }, [
        el("span", { class: "cm-dot", "data-accent": meta.accent, "aria-hidden": "true" }),
        el("span", {}, name),
        el("span", { class: "cm-count" }, String(group.labs.length)),
      ]));
      const preview = [
        ...group.labs.filter((lab) => lab.featured),
        ...group.labs.filter((lab) => !lab.featured),
      ].slice(0, 3);
      for (const lab of preview) {
        const text = labText(lab, lang);
        if (!lab.url) {
          card.append(el("p", { class: "cm-mega__lab" }, [
            el("span", {}, text.title),
            el("span", { class: "cm-badge" }, ctx.t("menu.soon")),
          ]));
          continue;
        }
        const anchor = el("a", { class: "cm-mega__lab", href: lab.url, "data-lab": lab.id, "data-cue": "open" }, [
          el("span", {}, text.title),
        ]);
        if (lab.featured) anchor.append(el("span", { class: "cm-badge" }, ctx.t("menu.featured")));
        if (text.fallback) anchor.append(el("span", { class: "cm-badge", lang: "en" }, "EN"));
        card.append(anchor);
      }
      grid.append(card);
    }
    megaBody.append(grid, el("a", { class: "cm-mega__all", href: ctx.href(PATHS.labs) }, ctx.t("mega.all")));
  }

  mega.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMega(false);
  });
  labsBtn.addEventListener("click", () => {
    if (mega.hidden) {
      renderMega();
      mega.hidden = false;
      labsBtn.setAttribute("aria-expanded", "true");
      tick();
    } else {
      closeMega(false);
    }
  });
  menuBtn.addEventListener("click", () => {
    tick();
    ctx.api.openMenu(menuBtn);
  });
  searchBtn.addEventListener("click", () => {
    tick();
    closeMega(false);
    ctx.api.openPalette(searchBtn);
  });
  settingsBtn.addEventListener("click", () => {
    tick();
    closeMega(false);
    ctx.api.openSettings(settingsBtn);
  });
  effects.addEventListener("click", () => {
    tick();
    closeMega(false);
    ctx.api.openSettings(effects);
  });

  document.addEventListener("pointerdown", (event) => {
    if (mega.hidden) return;
    if (bar.contains(event.target)) return;
    closeMega(false);
  }, { signal });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || mega.hidden || document.querySelector("dialog[open]")) return;
    event.preventDefault();
    closeMega(true);
  }, { signal });

  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    const dy = y - lastY;
    lastY = y;
    const focused = bar.contains(document.activeElement);
    if (focused || !mega.hidden || y < 120) {
      bar.classList.remove("is-hidden");
      return;
    }
    if (dy > 6) bar.classList.add("is-hidden");
    else if (dy < -6) bar.classList.remove("is-hidden");
  };
  window.addEventListener("scroll", onScroll, { passive: true, signal });
  bar.addEventListener("focusin", () => bar.classList.remove("is-hidden"));

  const onViewport = () => {
    const view = window.visualViewport;
    const open = Boolean(view && view.height < window.innerHeight * 0.75);
    document.documentElement.dataset.keyboard = open ? "open" : "closed";
    dock.element.classList.toggle("is-hidden", open);
    dock.element.inert = open || Boolean(document.querySelector("dialog[open]"));
  };
  window.visualViewport?.addEventListener("resize", onViewport, { signal });
  window.visualViewport?.addEventListener("scroll", onViewport, { signal });

  function paintCurrent() {
    root.querySelectorAll("[data-path]").forEach((node) => {
      if (isCurrent(node.dataset.path, ctx.demo)) node.setAttribute("aria-current", "page");
      else node.removeAttribute("aria-current");
    });
  }

  function sync(state) {
    rail.sync(state);
    dock.sync(state);
    banner.sync(state);
    paintCurrent();
    const menuOpen = document.getElementById("cm-menu")?.open;
    menuBtn.setAttribute("aria-expanded", menuOpen ? "true" : "false");
    const paletteOpen = document.getElementById("cm-palette")?.open;
    searchBtn.setAttribute("aria-expanded", paletteOpen ? "true" : "false");
  }

  window.addEventListener("hashchange", () => { paintCurrent(); rail.sync(ctx.getState()); }, { signal });
  window.addEventListener("resize", () => rail.sync(ctx.getState()), { signal });
  paintCurrent();
  rail.sync(ctx.getState());
  banner.sync(ctx.getState());

  return {
    renderMega,
    sync,
    closeMega,
    searchBtn,
    menuBtn,
    settingsBtn,
    paintCurrent,
  };
}

const RAIL_WIDE = 1500;

function buildRail(ctx) {
  const toggle = el("button", {
    type: "button",
    class: "cm-rail__toggle cm-icon-btn",
    "aria-expanded": "false",
  }, [icon("chevronLeft")]);
  const name = el("p", { class: "cm-rail__name", "data-i18n": "rail.name" });
  const bio = el("p", { class: "cm-rail__bio", "data-i18n": "rail.bio" });
  const list = el("ul", { class: "cm-social" });
  for (const item of SOCIAL) {
    list.append(el("li", {}, [
      el("a", {
        class: "cm-social__link",
        href: item.href,
        target: "_blank",
        rel: "me noopener noreferrer",
        "data-i18n-attr": `aria-label:${item.nameKey}`,
      }, [
        icon(item.icon),
        el("span", { class: "cm-social__label", "data-i18n": item.labelKey }),
      ]),
    ]));
  }
  const note = el("a", {
    class: "cm-note",
    href: ctx.href(PATHS.contact),
    "data-contact": "true",
    "data-i18n-attr": "aria-label:rail.note",
  }, [icon("contact"), el("span", { class: "cm-note__label", "data-i18n": "rail.note" })]);
  const fine = el("a", {
    class: "cm-fine",
    href: ctx.href(PATHS.legal),
    "data-i18n": "rail.small",
  });
  const text = el("div", { class: "cm-rail__text" }, [name, bio]);
  const element = el("aside", { class: "cm-rail cm-glass", "data-i18n-attr": "aria-label:rail.label" }, [
    toggle,
    el("div", { class: "cm-avatar" }, brandMark()),
    text,
    list,
    note,
    fine,
  ]);
  const launch = el("button", {
    type: "button",
    class: "cm-rail-launch",
    hidden: true,
    "aria-expanded": "false",
    "aria-controls": "cm-rail-drawer",
    "data-i18n-attr": "aria-label:rail.label",
  }, [el("span", { class: "cm-avatar cm-avatar--launch" }, brandMark())]);
  const drawer = el("dialog", {
    id: "cm-rail-drawer",
    class: "cm-rail-drawer cm-dialog",
    "aria-labelledby": "cm-rail-name",
  });
  name.id = "cm-rail-name";
  const slot = el("div", { class: "cm-rail-slot" });
  slot.append(element);
  bindDialog(drawer, { backdrop: true });

  function place(mode) {
    if (mode === "button") {
      if (element.parentElement !== drawer) drawer.append(element);
      return;
    }
    if (drawer.open) closeDialog(drawer);
    if (element.parentElement !== slot) slot.append(element);
  }

  function applyMode(mode) {
    document.documentElement.dataset.rail = mode === "button" ? "button" : "panel";
    launch.hidden = mode !== "button";
    place(mode);
    if (mode === "button") {
      element.hidden = false;
      element.dataset.mode = "drawer";
      document.documentElement.style.setProperty("--cm-rail", "0px");
      toggle.setAttribute("aria-expanded", drawer.open ? "true" : "false");
      toggle.setAttribute("aria-label", ctx.t("rail.collapse"));
      toggle.replaceChildren(icon("close"));
      return;
    }
    element.hidden = false;
    element.dataset.mode = mode;
    const expanded = mode === "expanded";
    document.documentElement.style.setProperty("--cm-rail", expanded ? "300px" : "72px");
    toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    const labelKey = expanded ? "rail.collapse" : "rail.expand";
    toggle.setAttribute("aria-label", ctx.t(labelKey));
    toggle.replaceChildren(icon(expanded ? "chevronLeft" : "chevron"));
  }

  function sync(state) {
    const pref = state?.authorRail || "auto";
    const width = window.innerWidth;
    if (width < RAIL_WIDE) {
      applyMode("button");
      return;
    }
    if (pref === "collapsed") applyMode("collapsed");
    else applyMode("expanded");
  }

  launch.addEventListener("click", () => {
    if (drawer.open) {
      closeDialog(drawer);
      launch.setAttribute("aria-expanded", "false");
      return;
    }
    openDialog(drawer, { trigger: launch, focus: name });
    launch.setAttribute("aria-expanded", "true");
    tick();
  });
  drawer.addEventListener("close", () => {
    launch.setAttribute("aria-expanded", "false");
  });

  toggle.addEventListener("click", () => {
    if (document.documentElement.dataset.rail === "button") {
      closeDialog(drawer);
      launch.focus();
      return;
    }
    const expanded = element.dataset.mode === "expanded";
    ctx.updateSettings({ authorRail: expanded ? "collapsed" : "expanded" });
    tick();
  });

  return { element, launch, drawer, slot, sync };
}

function buildDock(ctx) {
  const item = (path, key, longKey, iconName) => el("a", {
    class: "cm-dock__item",
    href: ctx.href(path),
    "data-path": path,
    "data-i18n-attr": `aria-label:${longKey}`,
  }, [
    icon(iconName),
    el("span", { class: "cm-dock__label", "data-i18n": key }),
  ]);
  const menu = el("button", {
    type: "button",
    class: "cm-dock__item",
    "aria-expanded": "false",
    "aria-controls": "cm-menu",
    "data-i18n-attr": "aria-label:dock.menu.long",
  }, [
    icon("menu"),
    el("span", { class: "cm-dock__label", "data-i18n": "dock.menu" }),
  ]);
  const listenIcon = el("span", { class: "cm-dock__icon" }, icon("listenOff"));
  const listenState = el("span", { class: "cm-dock__state" }, ctx.t("dock.state.off"));
  const listen = el("button", {
    type: "button",
    class: "cm-dock__item",
    "aria-pressed": "false",
    "data-i18n-attr": "aria-label:dock.listen.off",
  }, [
    listenIcon,
    el("span", { class: "cm-dock__label", "data-i18n": "dock.listen" }),
    listenState,
  ]);
  const element = el("nav", { class: "cm-dock cm-glass", "data-i18n-attr": "aria-label:nav.mobile" }, [
    item(PATHS.learn, "dock.learn", "dock.learn.long", "learn"),
    item(PATHS.labs, "dock.labs", "dock.labs.long", "labs"),
    item(PATHS.play, "dock.play", "dock.play.long", "play"),
    menu,
    listen,
  ]);
  menu.addEventListener("click", () => {
    tick();
    ctx.api.openMenu(menu);
  });
  listen.addEventListener("click", () => {
    const on = ctx.getState().sound === "off";
    ctx.updateSettings({ sound: on ? "ui" : "off" });
    if (on) {
      primeFromGesture();
      playCue("tick");
    }
  });
  function sync(state) {
    const menuOpen = document.getElementById("cm-menu")?.open;
    menu.setAttribute("aria-expanded", menuOpen ? "true" : "false");
    const listening = state.sound !== "off";
    listen.setAttribute("aria-pressed", listening ? "true" : "false");
    const listenKey = listening ? "dock.listen.on" : "dock.listen.off";
    listen.dataset.i18nAttr = `aria-label:${listenKey}`;
    listen.setAttribute("aria-label", ctx.t(listenKey));
    listenIcon.replaceChildren(icon(listening ? "listen" : "listenOff"));
    listenState.textContent = ctx.t(listening ? "dock.state.on" : "dock.state.off");
  }
  return { element, sync, menu };
}

function buildBanner(ctx) {
  const yes = el("button", { type: "button", class: "cm-banner__yes", lang: "es" }, "Ver en español");
  const no = el("button", { type: "button", class: "cm-banner__no", lang: "es" }, "Ahora no");
  const element = el("div", {
    class: "cm-banner",
    role: "region",
    lang: "es",
    hidden: true,
    "aria-label": "Oferta de idioma",
  }, [
    el("p", { lang: "es" }, "¿Prefieres este sitio en español?"),
    el("div", { class: "cm-banner__actions" }, [yes, no]),
  ]);
  function dismiss() {
    try { localStorage.setItem("cm.langBanner", "1"); } catch (err) { /* private mode */ }
    element.hidden = true;
  }
  yes.addEventListener("click", () => {
    dismiss();
    ctx.updateSettings({ lang: "es" });
    announce(ctx.t("settings.lang.es"));
  });
  no.addEventListener("click", dismiss);
  function sync(state) {
    let dismissed = false;
    try { dismissed = localStorage.getItem("cm.langBanner") === "1"; } catch (err) { dismissed = true; }
    const offered = (navigator.language || "").toLowerCase().startsWith("es");
    element.hidden = dismissed || !offered || state.lang !== "en";
  }
  return { element, sync };
}

export function contactClick(event, demo) {
  const heading = document.getElementById("contact-title");
  if (!heading) return false;
  const onHome = demo || location.pathname === "/" || location.pathname.endsWith("/index.html") || location.pathname.endsWith("/nav-demo.html");
  if (!onHome) return false;
  event.preventDefault();
  if (location.hash !== "#contact") location.hash = "contact";
  heading.setAttribute("tabindex", "-1");
  heading.focus();
  heading.scrollIntoView({ behavior: isReduced() ? "auto" : "smooth", block: "start" });
  return true;
}
