import { el } from "./dom.js";
import { icon } from "./icons.js";
import { norm, pushRecent, queryIndex, readRecents } from "./catalog.js";
import { toHref } from "./routes.js";
import { bindDialog, closeDialog, openDialog } from "./focus.js";
import { playCue, primeFromGesture } from "../settings/sound.js";

const ORDER = ["recent", "labs", "timeline", "gems", "pages"];

export function mountPalette(ctx) {
  const dialog = el("dialog", {
    id: "cm-palette",
    class: "cm-palette cm-dialog",
    "aria-labelledby": "cm-palette-title",
  });
  const title = el("h2", { id: "cm-palette-title", class: "cm-sr", "data-i18n": "palette.label" });
  const input = el("input", {
    id: "cm-q",
    class: "cm-input cm-input--lg",
    type: "search",
    role: "combobox",
    autocomplete: "off",
    spellcheck: "false",
    "aria-autocomplete": "list",
    "aria-expanded": "false",
    "aria-controls": "cm-q-list",
    "data-initial-focus": "true",
    "data-i18n-placeholder": "palette.placeholder",
  });
  const clearBtn = el("button", {
    type: "button",
    class: "cm-icon-btn",
    hidden: true,
    "data-i18n-attr": "aria-label:menu.clear",
  }, [icon("close")]);
  const list = el("div", {
    id: "cm-q-list",
    class: "cm-palette__list",
    role: "listbox",
    "data-i18n-attr": "aria-label:palette.label",
  });
  const count = el("p", { class: "cm-sr", "aria-live": "polite" });
  const hint = el("p", { class: "cm-palette__hint", "data-i18n": "palette.hint" });
  const form = el("form", { role: "search" }, [
    el("label", { class: "cm-sr", for: "cm-q", "data-i18n": "palette.label" }),
    el("div", { class: "cm-palette__bar" }, [icon("search"), input, clearBtn]),
    count,
    list,
    hint,
  ]);
  const closeBtn = el("button", {
    type: "button",
    class: "cm-close",
    "data-i18n-attr": "aria-label:palette.close",
  }, [icon("close"), el("span", { "data-i18n": "palette.close" })]);
  dialog.append(title, closeBtn, form);
  document.body.append(dialog);
  ctx.nodes.push(dialog);
  bindDialog(dialog, { backdrop: true });

  let active = 0;
  let query = "";

  function options() {
    return [...list.querySelectorAll("[role='option']")];
  }

  function setActive(index) {
    const opts = options();
    if (!opts.length) {
      input.removeAttribute("aria-activedescendant");
      return;
    }
    active = (index + opts.length) % opts.length;
    opts.forEach((opt, i) => opt.setAttribute("aria-selected", i === active ? "true" : "false"));
    input.setAttribute("aria-activedescendant", opts[active].id);
    opts[active].scrollIntoView({ block: "nearest" });
  }

  function choose(opt) {
    if (!opt) return;
    const labId = opt.dataset.lab;
    if (labId) pushRecent(labId);
    if (opt.dataset.cue === "open") {
      primeFromGesture();
      playCue("open");
    }
    const href = opt.getAttribute("href");
    if (!href) return;
    if (/^https?:\/\//i.test(href)) {
      closeDialog(dialog);
      return;
    }
    opt.dispatchEvent(new MouseEvent("click", { bubbles: false }));
  }

  function render() {
    const items = ctx.getIndex();
    let result;
    if (!norm(query)) {
      const recentItems = readRecents()
        .map((id) => items.find((item) => item.labId === id))
        .filter(Boolean)
        .map((item) => ({ ...item, group: "recent" }));
      const recentIds = new Set(recentItems.map((item) => item.labId));
      const rest = queryIndex(items, "", { limit: 24 }).items.filter((item) => !recentIds.has(item.labId));
      const merged = [...recentItems, ...rest];
      result = { items: merged.slice(0, 24), total: merged.length, emptyQuery: true };
    } else {
      result = queryIndex(items, query);
    }
    list.replaceChildren();
    clearBtn.hidden = query.length === 0;
    input.setAttribute("aria-expanded", "true");
    if (!result.items.length) {
      count.textContent = ctx.t("palette.empty");
      list.append(el("p", { class: "cm-empty" }, ctx.t("palette.empty")));
      input.removeAttribute("aria-activedescendant");
      return;
    }
    count.textContent = result.emptyQuery
      ? ctx.t("palette.start")
      : result.total === 1
        ? ctx.t("palette.countOne")
        : result.total > result.items.length
          ? ctx.tf("palette.window", { shown: result.items.length, count: result.total })
          : ctx.tf("palette.count", { count: result.total });
    const grouped = new Map(ORDER.map((key) => [key, []]));
    for (const item of result.items) {
      if (!grouped.has(item.group)) grouped.set(item.group, []);
      grouped.get(item.group).push(item);
    }
    for (const key of grouped.keys()) {
      const rows = grouped.get(key);
      if (!rows.length) continue;
      const group = el("div", { role: "group", "aria-label": ctx.t(`palette.${key}`) });
      group.append(el("p", { class: "cm-kicker" }, ctx.t(`palette.${key}`)));
      for (const item of rows) {
        const href = presentHref(item.href, ctx.demo);
        const id = `cm-opt-${key}-${item.labId || item.id}`.replace(/[^a-zA-Z0-9_-]/g, "-");
        const label = item.href
          ? item.title
          : `${item.title}. ${ctx.t("menu.soon")}`;
        const opt = href
          ? el("a", {
            id,
            role: "option",
            class: "cm-opt",
            href,
            "aria-selected": "false",
            "data-lab": item.labId || "",
            "data-cue": item.labId && item.href ? "open" : "",
          })
          : el("div", {
            id,
            role: "option",
            class: "cm-opt",
            tabindex: "-1",
            "aria-selected": "false",
            "aria-disabled": "true",
          });
        opt.append(
          el("span", { class: "cm-opt__title" }, item.title),
          el("span", { class: "cm-opt__meta" }, item.fallback ? "EN" : (item.categoryLabel || item.summary || "")),
        );
        if (!item.href) opt.title = label;
        if (href && !/^https?:/i.test(href)) {
          opt.addEventListener("click", (event) => {
            event.preventDefault();
            if (item.labId) pushRecent(item.labId);
            closeDialog(dialog, {
              then: () => {
                if (href.startsWith("#")) location.hash = href;
                else location.assign(href);
              },
            });
          });
        }
        opt.addEventListener("mousemove", () => {
          const opts = options();
          const index = opts.indexOf(opt);
          if (index >= 0) setActive(index);
        });
        group.append(opt);
      }
      list.append(group);
    }
    setActive(0);
  }

  input.addEventListener("input", () => {
    query = input.value;
    render();
  });
  clearBtn.addEventListener("click", () => {
    query = "";
    input.value = "";
    render();
    input.focus();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(active + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(active - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(options().length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const opt = options()[active];
      if (!opt) return;
      if (opt.tagName === "A") opt.click();
      else choose(opt);
    }
  });
  form.addEventListener("submit", (event) => event.preventDefault());
  closeBtn.addEventListener("click", () => closeDialog(dialog));
  dialog.addEventListener("close", () => {
    input.setAttribute("aria-expanded", "false");
    document.querySelectorAll("[aria-controls='cm-palette']").forEach((node) => {
      node.setAttribute("aria-expanded", "false");
    });
  });

  return {
    dialog,
    render,
    open(trigger) {
      query = "";
      input.value = "";
      render();
      openDialog(dialog, { trigger, focus: input });
      document.querySelectorAll("[aria-controls='cm-palette']").forEach((node) => {
        node.setAttribute("aria-expanded", "true");
      });
    },
    close() {
      closeDialog(dialog);
    },
  };
}

function presentHref(href, demo) {
  if (!href) return "";
  if (demo && href.startsWith("/")) return toHref(href, true);
  return href;
}
