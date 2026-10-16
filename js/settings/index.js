import { announce, el } from "../nav/dom.js";
import { icon } from "../nav/icons.js";
import { applyI18n, t } from "../nav/i18n.js";
import { bindDialog, closeDialog, openDialog } from "../nav/focus.js";
import { bindDocument, getStore } from "./store.js";
import { bindSound, primeFromGesture, playCue } from "./sound.js";

let mounted = false;
let tiltStop = null;

function valueFor(key, state) {
  switch (key) {
    case "theme":
      return state.themePreference;
    case "motion":
      return state.motionPreference;
    case "textScale":
      return state.textScale;
    case "sound":
    case "quality":
    case "mascot":
    case "lang":
      return state[key];
    default: {
      const unknown = key;
      throw new Error(`Unknown setting group: ${String(unknown)}`);
    }
  }
}

function radioGroup(store, key, labelKey, options) {
  const labelId = `cm-set-${key}`;
  const group = el("div", { class: "cm-group", role: "radiogroup", "aria-labelledby": labelId });
  group.append(el("p", { class: "cm-group__label", id: labelId, "data-i18n": labelKey }));
  const buttons = [];
  for (const opt of options) {
    const button = el("button", {
      type: "button",
      class: "cm-choice",
      role: "radio",
      "data-value": String(opt.value),
      "aria-checked": "false",
      tabindex: "-1",
    }, [
      el("span", { class: "cm-choice__mark", "aria-hidden": "true" }),
      el("span", { "data-i18n": opt.labelKey }),
    ]);
    button.addEventListener("click", () => {
      const value = key === "textScale" ? Number(opt.value) : opt.value;
      if (key === "sound" && value !== "off") {
        store.update({ [key]: value });
        primeFromGesture();
        playCue("tick");
        return;
      }
      store.update({ [key]: value });
    });
    button.addEventListener("keydown", (event) => {
      const nextKey = event.key === "ArrowRight" || event.key === "ArrowDown"
        || event.key === "ArrowLeft" || event.key === "ArrowUp"
        || event.key === "Home" || event.key === "End";
      if (!nextKey) return;
      event.preventDefault();
      const index = buttons.indexOf(button);
      let next = index;
      if (event.key === "Home") next = 0;
      else if (event.key === "End") next = buttons.length - 1;
      else if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % buttons.length;
      else next = (index - 1 + buttons.length) % buttons.length;
      buttons[next].click();
      buttons[next].focus();
    });
    buttons.push(button);
    group.append(button);
  }
  return { group, buttons, key };
}

function detachTilt() {
  tiltStop?.();
  tiltStop = null;
}

function attachTilt() {
  if (tiltStop || typeof window === "undefined") return;
  let sx = 0;
  let sy = 0;
  let frame = 0;
  const onOrient = (event) => {
    const tx = Math.max(-0.4, Math.min(0.4, ((event.gamma || 0) / 90) * 0.4));
    const ty = Math.max(-0.4, Math.min(0.4, ((event.beta || 0) / 180) * 0.4));
    sx += 0.1 * (tx - sx);
    sy += 0.1 * (ty - sy);
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      document.dispatchEvent(new CustomEvent("cm:tilt", { detail: { x: sx, y: sy } }));
    });
  };
  window.addEventListener("deviceorientation", onOrient);
  tiltStop = () => {
    window.removeEventListener("deviceorientation", onOrient);
    if (frame) window.cancelAnimationFrame(frame);
  };
}

async function enableTilt(store) {
  const orientation = window.DeviceOrientationEvent;
  if (orientation && typeof orientation.requestPermission === "function") {
    try {
      const result = await orientation.requestPermission();
      if (result !== "granted") {
        store.update({ tilt: false });
        announce(t(store.getState().lang, "settings.tilt.denied"));
        return;
      }
    } catch (err) {
      store.update({ tilt: false });
      announce(t(store.getState().lang, "settings.tilt.denied"));
      return;
    }
  }
  store.update({ tilt: true });
  announce(t(store.getState().lang, "settings.tilt.ready"));
}

export function mountSettings() {
  const store = getStore();
  if (mounted) return store;
  mounted = true;
  bindDocument(store);
  bindSound();

  const groups = [
    radioGroup(store, "theme", "settings.theme", [
      { value: "dawn", labelKey: "settings.theme.dawn" },
      { value: "starlight", labelKey: "settings.theme.starlight" },
      { value: "contrast", labelKey: "settings.theme.contrast" },
      { value: "system", labelKey: "settings.theme.system" },
    ]),
    radioGroup(store, "lang", "settings.lang", [
      { value: "en", labelKey: "settings.lang.en" },
      { value: "es", labelKey: "settings.lang.es" },
    ]),
    radioGroup(store, "sound", "settings.sound", [
      { value: "off", labelKey: "settings.sound.off" },
      { value: "ui", labelKey: "settings.sound.ui" },
      { value: "ambient", labelKey: "settings.sound.ambient" },
    ]),
    radioGroup(store, "motion", "settings.motion", [
      { value: "system", labelKey: "settings.motion.system" },
      { value: "reduce", labelKey: "settings.motion.reduce" },
      { value: "full", labelKey: "settings.motion.full" },
    ]),
    radioGroup(store, "quality", "settings.quality", [
      { value: "auto", labelKey: "settings.quality.auto" },
      { value: "high", labelKey: "settings.quality.high" },
      { value: "medium", labelKey: "settings.quality.medium" },
      { value: "low", labelKey: "settings.quality.low" },
      { value: "static", labelKey: "settings.quality.static" },
    ]),
    radioGroup(store, "mascot", "settings.mascot", [
      { value: "animated", labelKey: "settings.mascot.animated" },
      { value: "still", labelKey: "settings.mascot.still" },
      { value: "hidden", labelKey: "settings.mascot.hidden" },
    ]),
    radioGroup(store, "textScale", "settings.text", [
      { value: 1, labelKey: "settings.text.100" },
      { value: 1.12, labelKey: "settings.text.112" },
      { value: 1.25, labelKey: "settings.text.125" },
      { value: 1.5, labelKey: "settings.text.150" },
    ]),
  ];

  const volume = el("input", {
    id: "cm-volume",
    type: "range",
    min: "0",
    max: "100",
    step: "5",
    "aria-describedby": "cm-volume-value",
  });
  const volumeValue = el("span", { id: "cm-volume-value", class: "cm-volume__value" }, "80");
  const shortcuts = el("button", {
    type: "button",
    class: "cm-switch",
    role: "switch",
    "aria-checked": "true",
    "aria-describedby": "cm-shortcuts-help",
  }, [
    el("span", { "data-i18n": "settings.shortcuts" }),
    el("span", { class: "cm-switch__ui", "aria-hidden": "true" }, [el("span", { class: "cm-switch__thumb" })]),
    el("span", { class: "cm-switch__state" }),
  ]);
  const tilt = el("button", {
    type: "button",
    class: "cm-switch",
    role: "switch",
    "aria-checked": "false",
    "aria-describedby": "cm-tilt-help",
  }, [
    el("span", { "data-i18n": "settings.tilt" }),
    el("span", { class: "cm-switch__ui", "aria-hidden": "true" }, [el("span", { class: "cm-switch__thumb" })]),
    el("span", { class: "cm-switch__state" }),
  ]);
  const shareBtn = el("button", { type: "button", class: "cm-btn", "data-i18n": "settings.share" });
  const resetBtn = el("button", { type: "button", class: "cm-btn", "data-i18n": "settings.reset" });
  const yesBtn = el("button", { type: "button", class: "cm-btn cm-btn--primary", hidden: true, "data-i18n": "settings.reset.yes" });
  const cancelBtn = el("button", { type: "button", class: "cm-btn", hidden: true, "data-i18n": "settings.reset.cancel" });
  const title = el("h2", {
    id: "cm-settings-title",
    tabindex: "-1",
    "data-initial-focus": "true",
    "data-i18n": "settings.title",
  });
  const closeBtn = el("button", {
    type: "button",
    class: "cm-close",
    "data-i18n-attr": "aria-label:settings.close",
  }, [icon("close"), el("span", { "data-i18n": "settings.close" })]);
  const dialog = el("dialog", {
    id: "cm-settings",
    class: "cm-settings cm-dialog",
    "aria-labelledby": "cm-settings-title",
  }, [
    el("header", { class: "cm-settings__head" }, [title, closeBtn]),
    el("div", { class: "cm-settings__body" }, [
      el("p", { class: "cm-settings__lead", "data-i18n": "settings.lead" }),
      ...groups.map((group) => group.group),
      el("div", { class: "cm-volume" }, [
        el("label", { for: "cm-volume", "data-i18n": "settings.volume" }),
        volume,
        volumeValue,
      ]),
      shortcuts,
      el("p", { id: "cm-shortcuts-help", class: "cm-help", "data-i18n": "settings.shortcuts.help" }),
      tilt,
      el("p", { id: "cm-tilt-help", class: "cm-help", "data-i18n": "settings.tilt.help" }),
      el("div", { class: "cm-reset" }, [
        el("p", { class: "cm-help", "data-i18n": "settings.reset.help" }),
        el("div", { class: "cm-reset__row" }, [shareBtn, resetBtn, yesBtn, cancelBtn]),
      ]),
    ]),
  ]);
  document.body.append(dialog);
  bindDialog(dialog, { backdrop: true });
  closeBtn.addEventListener("click", () => closeDialog(dialog));

  function disarm() {
    resetBtn.hidden = false;
    yesBtn.hidden = true;
    cancelBtn.hidden = true;
  }
  resetBtn.addEventListener("click", () => {
    resetBtn.hidden = true;
    yesBtn.hidden = false;
    cancelBtn.hidden = false;
    yesBtn.focus();
  });
  cancelBtn.addEventListener("click", () => {
    disarm();
    resetBtn.focus();
  });
  yesBtn.addEventListener("click", () => {
    store.reset();
    disarm();
    announce(t(store.getState().lang, "settings.reset.done"));
  });
  shareBtn.addEventListener("click", async () => {
    const state = store.getState();
    const url = new URL(window.location.href);
    url.searchParams.set("theme", state.themePreference);
    url.searchParams.set("motion", state.motionPreference);
    url.searchParams.set("quality", state.quality);
    const link = url.toString();
    try {
      await navigator.clipboard.writeText(link);
    } catch (err) {
      const field = document.createElement("input");
      field.value = link;
      field.readOnly = true;
      dialog.append(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    announce(t(store.getState().lang, "settings.share.done"));
  });
  shortcuts.addEventListener("click", () => {
    store.update({ shortcuts: !store.getState().shortcuts });
  });
  tilt.addEventListener("click", () => {
    if (store.getState().tilt) store.update({ tilt: false });
    else enableTilt(store);
  });
  volume.addEventListener("input", () => {
    store.update({ volume: Number(volume.value) });
  });

  function sync(state) {
    for (const group of groups) {
      const current = String(valueFor(group.key, state));
      for (const button of group.buttons) {
        const on = button.dataset.value === current;
        button.setAttribute("aria-checked", on ? "true" : "false");
        button.tabIndex = on ? 0 : -1;
      }
    }
    volume.value = String(state.volume);
    volumeValue.textContent = String(state.volume);
    shortcuts.setAttribute("aria-checked", state.shortcuts ? "true" : "false");
    shortcuts.querySelector(".cm-switch__state").textContent = t(state.lang, state.shortcuts ? "state.on" : "state.off");
    tilt.setAttribute("aria-checked", state.tilt ? "true" : "false");
    tilt.querySelector(".cm-switch__state").textContent = t(state.lang, state.tilt ? "state.on" : "state.off");
    if (state.tilt) attachTilt();
    else detachTilt();
    applyI18n(dialog, state.lang);
  }

  store.subscribe(sync);
  sync(store.getState());
  document.addEventListener("cm:open-settings", (event) => {
    openDialog(dialog, { trigger: event.detail?.trigger, focus: title });
  });
  return store;
}
