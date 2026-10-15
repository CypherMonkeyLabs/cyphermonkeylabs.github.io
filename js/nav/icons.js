const NS = "http://www.w3.org/2000/svg";

const ICONS = {
  search: '<circle cx="11" cy="11" r="6.25"/><path d="M16 16.5 20.5 21"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.2M12 18.3V20.5M3.5 12h2.2M18.3 12h2.2M5.8 5.8l1.6 1.6M16.6 16.6l1.6 1.6M18.2 5.8l-1.6 1.6M7.4 16.6 5.8 18.2"/>',
  learn: '<path d="M4 5.5h6.5A2.5 2.5 0 0 1 13 8v11H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M20 5.5h-6.5A2.5 2.5 0 0 0 11 8v11h6.5a2.5 2.5 0 0 1 2.5 2.5z"/>',
  play: '<circle cx="12" cy="12" r="7"/><path d="M4.5 14.2c2.2-1.2 4.2-1.2 6.4 0s4.4 1.2 6.6 0 4.2-1.2 6.4 0"/>',
  labs: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  listen: '<path d="M4 10h3.5L12 6.5v11L7.5 14H4z"/><path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M17.8 7.2a6.5 6.5 0 0 1 0 9.6"/>',
  listenOff: '<path d="M4 10h3.5L12 6.5v11L7.5 14H4z"/><path d="M16 10l4 4M20 10l-4 4"/>',
  timeline: '<circle cx="12" cy="12" r="7.5"/><path d="M12 8v4.5l3 2"/>',
  gems: '<path d="m12 3.5 8 6-8 11-8-11z"/><path d="M4 9.5h16M8.2 9.5 12 20.5 15.8 9.5"/>',
  about: '<circle cx="12" cy="8" r="3"/><path d="M5.5 19.5c1.1-3 3.2-4.5 6.5-4.5s5.4 1.5 6.5 4.5"/>',
  contact: '<path d="M4 7h16v10H4z"/><path d="m4 7 8 6 8-6"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  chevronLeft: '<path d="m15 6-6 6 6 6"/>',
  x: '<path d="M5 5l14 14M19 5 5 19"/>',
  linktree: '<circle cx="12" cy="5.2" r="1.7" fill="currentColor" stroke="none"/><circle cx="6.8" cy="18.2" r="1.7" fill="currentColor" stroke="none"/><circle cx="17.2" cy="18.2" r="1.7" fill="currentColor" stroke="none"/><path d="M12 7.2v4.2M12 11.4 7.4 16.4M12 11.4l4.6 5"/>',
  hf: '<circle cx="12" cy="12" r="8"/><circle cx="9" cy="10.5" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="10.5" r="1" fill="currentColor" stroke="none"/><path d="M8.8 14.2c.8 1.2 2 1.9 3.2 1.9s2.4-.7 3.2-1.9"/>',
  github: '<path d="M9 19.5c-1.4-.4-2.4-1.4-2.4-2.8 0-1 .6-1.7 1.2-2-.5-.6-.8-1.5-.8-2.6 0-2.4 1.8-4.1 4.5-4.1s4.5 1.7 4.5 4.1c0 1.1-.3 2-.8 2.6.6.3 1.2 1 1.2 2 0 1.4-1 2.4-2.4 2.8"/>',
  devto: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M8 9.2v5.6M8 12h3.1M13.6 9.2 16.4 12 13.6 14.8"/>',
  check: '<path d="m5 12.2 4.2 4.2L19 7.8"/>',
  motion: '<path d="M3.5 15c1.8-3.2 3.6-3.2 5.4 0s3.6 3.2 5.4 0 3.6-3.2 5.4 0"/><path d="M3.5 9c1.8-3.2 3.6-3.2 5.4 0s3.6 3.2 5.4 0 3.6-3.2 5.4 0"/>',
};

export function iconNames() {
  return Object.keys(ICONS);
}

export function icon(name) {
  const body = ICONS[name];
  if (!body) {
    const unknown = name;
    throw new Error(`Unknown icon: ${String(unknown)}`);
  }
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("class", "cm-icon");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.75");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.innerHTML = body;
  return svg;
}

export function brandMark() {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 64 64");
  svg.setAttribute("class", "cm-mark");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.innerHTML = `
    <circle cx="14" cy="24" r="9" fill="currentColor"/>
    <circle cx="50" cy="24" r="9" fill="currentColor"/>
    <circle cx="32" cy="36" r="18" fill="currentColor"/>
    <circle cx="24.5" cy="42" r="3.1" fill="var(--peach)"/>
    <circle cx="39.5" cy="42" r="3.1" fill="var(--peach)"/>
    <circle cx="26" cy="33.5" r="2.3" fill="var(--bg)"/>
    <circle cx="38" cy="33.5" r="2.3" fill="var(--bg)"/>
    <path d="M27 43.5c1.7 2.6 8.3 2.6 10 0" fill="none" stroke="var(--bg)" stroke-width="2" stroke-linecap="round"/>
    <path d="M49 8.2 50.4 12l3.8.6-3.8.9L49 17.2l-1.4-3.7-3.8-.9 3.8-.6z" fill="var(--butter)"/>
  `;
  return svg;
}
