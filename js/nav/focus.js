export function isReduced() {
  return document.documentElement.dataset.motion === "reduce";
}

function dock() {
  return document.querySelector(".cm-dock");
}

export function syncDockInert() {
  const bar = dock();
  if (!bar) return;
  const dialogOpen = Boolean(document.querySelector("dialog[open]"));
  const keyboard = document.documentElement.dataset.keyboard === "open";
  const hidden = bar.classList.contains("is-hidden");
  bar.inert = dialogOpen || keyboard || hidden;
}

export function openDialog(dialog, { trigger, focus } = {}) {
  if (!dialog || dialog.open) return;
  dialog._cmTrigger = trigger || document.activeElement;
  dialog.dataset.closing = "false";
  dialog.classList.remove("is-closing", "is-dragging", "is-settling");
  dialog.style.transform = "";
  if (!dialog.open) dialog.showModal();
  document.documentElement.classList.add("cm-lock");
  syncDockInert();
  window.requestAnimationFrame(() => {
    dialog.classList.add("is-shown");
    const target = focus || dialog.querySelector("[data-initial-focus]") || dialog.querySelector("h2");
    target?.focus();
  });
}

export function closeDialog(dialog, { then } = {}) {
  if (!dialog?.open || dialog.dataset.closing === "true") return;
  dialog.dataset.closing = "true";
  const trigger = dialog._cmTrigger;
  const reduced = isReduced();
  const ms = reduced ? 150 : 220;
  dialog.classList.remove("is-dragging");
  window.requestAnimationFrame(() => {
    dialog.classList.add("is-closing");
    dialog.classList.remove("is-shown");
    if (!reduced && dialog.classList.contains("cm-sheet")) {
      dialog.style.transform = "translateY(100%)";
    }
    window.setTimeout(() => {
      dialog.style.transform = "";
      dialog.classList.remove("is-closing", "is-shown", "is-settling", "is-dragging");
      dialog.dataset.closing = "false";
      if (dialog.open) dialog.close();
      if (!document.querySelector("dialog[open]")) {
        document.documentElement.classList.remove("cm-lock");
      }
      syncDockInert();
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
      then?.();
    }, ms);
  });
}

export function bindDialog(dialog, { backdrop = false } = {}) {
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    closeDialog(dialog);
  }, true);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog(dialog);
  });
  if (!backdrop) return;
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const inside = event.clientX >= rect.left
      && event.clientX <= rect.right
      && event.clientY >= rect.top
      && event.clientY <= rect.bottom;
    if (!inside) closeDialog(dialog);
  });
}
