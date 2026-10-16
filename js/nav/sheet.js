import { el } from "./dom.js";
import { icon } from "./icons.js";
import {
  categoryMeta,
  groupByCategory,
  labText,
  norm,
  queryIndex,
  readRecents,
} from "./catalog.js";
import { SOCIAL } from "./social.js";
import { PATHS } from "./routes.js";
import { bindDialog, closeDialog, openDialog } from "./focus.js";
import { playCue, primeFromGesture } from "../settings/sound.js";

const LIMIT = 40;

function labItems(catalog, lang, t) {
  return catalog.labs.map((lab) => {
    const text = labText(lab, lang);
    const meta = categoryMeta(lab.category);
    return {
      ...lab,
      title: text.title,
      summary: text.summary,
      fallback: text.fallback,
      categoryLabel: meta.labelKey ? t(meta.labelKey) : meta.fallbackLabel,
      group: "labs",
      labId: lab.id,
      href: lab.url,
      tags: lab.tags,
    };
  });
}

export function mountSheet(ctx) {
  const dialog = el("dialog", {
    id: "cm-menu",
    class: "cm-sheet cm-dialog",
    "aria-labelledby": "menu-title",
  });
  const title = el("h2", { id: "menu-title", tabindex: "-1", "data-initial-focus": "true", "data-i18n": "menu.title" });
  const closeBtn = el("button", {
    type: "button",
    class: "cm-close",
    "data-close": "true",
    "data-i18n-attr": "aria-label:menu.close",
  }, [icon("close"), el("span", { "data-i18n": "menu.close" })]);
  const head = el("header", { class: "cm-sheet__head", "data-drag-handle": "true" }, [
    el("span", { class: "cm-sheet__grip", "aria-hidden": "true" }),
    title,
    el("p", { class: "cm-sheet__lead", "data-i18n": "menu.lead" }),
    closeBtn,
  ]);

  const authorLinks = el("div", { class: "cm-author__links" });
  for (const item of SOCIAL) {
    authorLinks.append(el("a", {
      href: item.href,
      target: "_blank",
      rel: "me noopener noreferrer",
      "data-i18n-attr": `aria-label:${item.nameKey}`,
    }, [icon(item.icon), el("span", { class: "cm-sr", "data-i18n": item.labelKey })]));
  }
  const author = el("div", { class: "cm-author" }, [
    el("div", { class: "cm-avatar cm-avatar--small" }, []),
    el("div", {}, [
      el("p", { class: "cm-author__name", "data-i18n": "rail.name" }),
      el("p", { class: "cm-author__line", "data-i18n": "rail.sheetLine" }),
    ]),
    authorLinks,
  ]);
  author.querySelector(".cm-avatar").append(ctx.brand());

  const effects = el("button", {
    type: "button",
    class: "cm-link-row",
  }, [icon("gear"), el("span", { "data-i18n": "nav.effects" })]);
  const chips = el("div", { class: "cm-lab-chips" });
  for (const lab of ctx.getCatalog().labs) {
    if (lab.kind === "gallery" || !lab.url) continue;
    chips.append(el("a", {
      class: "cm-lab-chip",
      href: lab.url,
      "data-accent": lab.accent || "lavender",
      "data-lab": lab.id,
    }, lab.shortTitle || lab.title));
  }
  const primary = el("nav", { class: "cm-sheet__links", "data-i18n-attr": "aria-label:menu.primary" });
  const pages = [
    ["play", "nav.universe", PATHS.play],
    ["labs", "nav.labs", PATHS.labs],
    ["timeline", "nav.timeline", PATHS.timeline],
    ["gems", "nav.gems", PATHS.gems],
    ["about", "nav.about", PATHS.about],
    ["contact", "nav.contact", PATHS.contact],
  ];
  for (const [iconName, key, path] of pages) {
    primary.append(el("a", {
      class: key === "nav.gems" ? "cm-link-row nav-more" : "cm-link-row",
      href: ctx.href(path),
      "data-path": path,
    }, [
      icon(iconName),
      el("span", { "data-i18n": key }),
    ]));
  }
  if (document.getElementById("gems")) {
    primary.querySelector('[data-path="/gems/"]')?.setAttribute("href", "#gems");
  }
  primary.append(effects);
  effects.addEventListener("click", () => {
    closeDialog(dialog);
    ctx.api.openSettings(effects);
  });

  const search = el("input", {
    id: "cm-menu-q",
    class: "cm-input",
    type: "search",
    autocomplete: "off",
    spellcheck: "false",
    "data-i18n-placeholder": "menu.searchPh",
  });
  const clearBtn = el("button", {
    type: "button",
    class: "cm-icon-btn",
    hidden: true,
    "data-i18n-attr": "aria-label:menu.clear",
  }, [icon("close")]);
  const searchRow = el("div", { class: "cm-search-row" }, [
    el("label", { class: "cm-search-row__label", for: "cm-menu-q", "data-i18n": "menu.searchLabel" }),
    el("div", { class: "cm-search-row__box" }, [icon("search"), search, clearBtn]),
  ]);
  const count = el("p", { id: "cm-sheet-count", class: "cm-sr", "aria-live": "polite" });
  const results = el("div", { id: "cm-sheet-results" });

  const theme = el("select", { id: "cm-sheet-theme" });
  for (const value of ["dawn", "starlight", "contrast", "system"]) {
    theme.append(el("option", { value, "data-i18n": `settings.theme.${value}` }));
  }
  const motion = el("button", { type: "button", class: "cm-switch", role: "switch", "aria-checked": "false" }, [
    el("span", { "data-i18n": "menu.motion" }),
    el("span", { class: "cm-switch__ui", "aria-hidden": "true" }, [el("span", { class: "cm-switch__thumb" })]),
    el("span", { class: "cm-switch__state" }),
  ]);
  const sound = el("button", { type: "button", class: "cm-switch", role: "switch", "aria-checked": "false" }, [
    el("span", { "data-i18n": "menu.sound" }),
    el("span", { class: "cm-switch__ui", "aria-hidden": "true" }, [el("span", { class: "cm-switch__thumb" })]),
    el("span", { class: "cm-switch__state" }),
  ]);
  const quick = el("div", { class: "cm-quick" }, [
    el("p", { class: "cm-kicker", "data-i18n": "menu.quick" }),
    el("label", { class: "cm-field", for: "cm-sheet-theme" }, [
      el("span", { "data-i18n": "menu.theme" }),
      theme,
    ]),
    motion,
    sound,
  ]);
  const contact = el("a", {
    class: "cm-cta",
    href: ctx.href(PATHS.contact),
    "data-contact": "true",
    "data-i18n": "menu.contact",
  });
  const legal = el("nav", { class: "cm-legal", "aria-label": "Legal" }, [
    rowLink(PATHS.legal, "menu.legal", ctx),
    rowLink(PATHS.privacy, "menu.privacy", ctx),
    rowLink(PATHS.a11y, "menu.a11y", ctx),
  ]);
  const body = el("div", { class: "cm-sheet__body" }, [
    primary,
    el("p", { class: "cm-kicker", "data-i18n": "menu.planets" }),
    chips,
    author,
    el("p", { class: "cm-kicker", "data-i18n": "menu.categories" }),
    searchRow,
    count,
    results,
    quick,
    contact,
    legal,
  ]);
  dialog.append(head, body);
  document.body.append(dialog);
  ctx.nodes.push(dialog);
  bindDialog(dialog);
  dialog.addEventListener("close", () => menuExpanded(false));

  const expanded = new Set();
  let query = "";

  function labRow(lab) {
    const lang = ctx.getLang();
    const row = el("div", { class: "cm-lab" });
    const heading = el("p", { class: "cm-lab__title" }, lab.title);
    if (lab.fallback) heading.append(el("span", { class: "cm-badge", lang: "en" }, "EN"));
    if (lab.featured) heading.append(el("span", { class: "cm-badge" }, ctx.t("menu.featured")));
    if (lab.status === "beta") heading.append(el("span", { class: "cm-badge" }, ctx.t("menu.beta")));
    if (lab.status === "archived") heading.append(el("span", { class: "cm-badge" }, ctx.t("menu.archived")));
    row.append(heading);
    if (!lab.url) {
      row.append(el("p", { class: "cm-status" }, ctx.t("menu.soon")));
      return row;
    }
    const actions = el("div", { class: "cm-lab__actions" });
    actions.append(el("a", {
      class: "cm-mini",
      href: lab.url,
      "data-lab": lab.id,
      "data-cue": "open",
      "aria-label": ctx.tf("open.long", { title: lab.title }),
    }, ctx.t("menu.open")));
    if (lab.repo) {
      actions.append(el("a", {
        class: "cm-mini",
        href: lab.repo,
        target: "_blank",
        rel: "noopener noreferrer",
        "data-lab": lab.id,
        "aria-label": `${ctx.tf("repo.long", { title: lab.title })} ${ctx.t("external.suffix")}`,
      }, ctx.t("menu.repo")));
    }
    row.append(actions);
    return row;
  }

  function render() {
    const lang = ctx.getLang();
    const items = labItems(ctx.getCatalog(), lang, ctx.t);
    results.replaceChildren();
    clearBtn.hidden = query.length === 0;
    if (norm(query)) {
      const found = queryIndex(items, query, { limit: LIMIT });
      count.textContent = found.total === 0
        ? ctx.t("menu.empty")
        : found.total === 1
          ? ctx.t("menu.countOne")
          : found.total > found.items.length
            ? ctx.tf("menu.window", { shown: found.items.length, count: found.total })
            : ctx.tf("menu.count", { count: found.total });
      if (!found.items.length) {
        results.append(el("p", { class: "cm-empty" }, ctx.t("menu.empty")));
        return;
      }
      for (const lab of found.items) results.append(labRow(lab));
      return;
    }
    count.textContent = "";
    const recentIds = readRecents().filter((id) => items.some((lab) => lab.id === id)).slice(0, 4);
    if (recentIds.length) {
      results.append(el("p", { class: "cm-kicker" }, ctx.t("menu.recents")));
      for (const id of recentIds) {
        const lab = items.find((item) => item.id === id);
        if (lab) results.append(labRow(lab));
      }
    }
    for (const group of groupByCategory(ctx.getCatalog().labs)) {
      const meta = categoryMeta(group.id);
      const name = meta.labelKey ? ctx.t(meta.labelKey) : meta.fallbackLabel;
      const panelId = `cm-acc-${group.id}`;
      const buttonId = `cm-acc-btn-${group.id}`;
      const open = expanded.has(group.id);
      const button = el("button", {
        type: "button",
        class: "cm-acc",
        id: buttonId,
        "aria-expanded": open ? "true" : "false",
        "aria-controls": panelId,
      }, [
        el("span", { class: "cm-dot", "data-accent": meta.accent, "aria-hidden": "true" }),
        el("span", { class: "cm-acc__name" }, name),
        el("span", { class: "cm-count" }, String(group.labs.length)),
      ]);
      const panel = el("div", { id: panelId, class: "cm-acc__panel", role: "region", "aria-labelledby": buttonId });
      if (!open) panel.hidden = true;
      button.addEventListener("click", () => {
        if (expanded.has(group.id)) expanded.delete(group.id);
        else expanded.add(group.id);
        render();
        document.getElementById(buttonId)?.focus();
      });
      if (open) {
        const localized = labItems({ labs: group.labs }, lang, ctx.t);
        for (const lab of localized) panel.append(labRow(lab));
      }
      results.append(button, panel);
    }
  }

  function sync(state) {
    theme.value = state.themePreference;
    const reduced = state.motion === "reduce";
    motion.setAttribute("aria-checked", reduced ? "true" : "false");
    motion.querySelector(".cm-switch__state").textContent = ctx.t(reduced ? "state.on" : "state.off");
    const listening = state.sound !== "off";
    sound.setAttribute("aria-checked", listening ? "true" : "false");
    sound.querySelector(".cm-switch__state").textContent = ctx.t(listening ? "state.on" : "state.off");
  }

  search.addEventListener("input", () => {
    query = search.value;
    render();
  });
  clearBtn.addEventListener("click", () => {
    query = "";
    search.value = "";
    render();
    search.focus();
  });
  theme.addEventListener("change", () => ctx.updateSettings({ theme: theme.value }));
  motion.addEventListener("click", () => {
    const next = ctx.getState().motion === "reduce" ? "full" : "reduce";
    ctx.updateSettings({ motion: next });
  });
  sound.addEventListener("click", () => {
    const next = ctx.getState().sound === "off" ? "ui" : "off";
    ctx.updateSettings({ sound: next });
    if (next !== "off") {
      primeFromGesture();
      playCue("tick");
    }
  });
  closeBtn.addEventListener("click", () => closeDialog(dialog));
  bindSwipe(dialog, head);

  return {
    dialog,
    render,
    sync,
    open(trigger) {
      render();
      sync(ctx.getState());
      openDialog(dialog, { trigger, focus: title });
      menuExpanded(true);
    },
    close(then) {
      closeDialog(dialog, { then });
    },
  };
}

function menuExpanded(open) {
  document.querySelectorAll("[aria-controls='cm-menu']").forEach((node) => {
    node.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

function rowLink(path, key, ctx) {
  return el("a", { class: "cm-link-row cm-link-row--quiet", href: ctx.href(path) }, [
    el("span", { "data-i18n": key }),
  ]);
}

function bindSwipe(dialog, head) {
  let dragging = false;
  let startY = 0;
  let lastY = 0;
  let lastT = 0;
  head.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (event.target.closest("button, a, input, select")) return;
    dragging = true;
    startY = lastY = event.clientY;
    lastT = event.timeStamp;
    dialog.classList.add("is-dragging");
    head.setPointerCapture(event.pointerId);
  });
  head.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const dy = Math.max(0, event.clientY - startY);
    dialog.style.transform = `translateY(${dy}px)`;
    lastY = event.clientY;
    lastT = event.timeStamp;
  });
  const end = (event) => {
    if (!dragging) return;
    dragging = false;
    const dy = Math.max(0, event.clientY - startY);
    const velocity = (event.clientY - lastY) / Math.max(1, event.timeStamp - lastT);
    dialog.classList.remove("is-dragging");
    if (dy > 120 || velocity > 0.5) {
      closeDialog(dialog);
      return;
    }
    dialog.classList.add("is-settling");
    dialog.style.transform = "";
    window.setTimeout(() => dialog.classList.remove("is-settling"), 220);
  };
  head.addEventListener("pointerup", end);
  head.addEventListener("pointercancel", end);
}
