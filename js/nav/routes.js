export const PATHS = {
  home: "/#launchpad",
  learn: "/#guide",
  labs: "/labs/",
  play: "/#launchpad",
  timeline: "/timeline/",
  gems: "/gems/",
  about: "/about/",
  legal: "/legal/",
  privacy: "/privacy/",
  a11y: "/accessibility/",
  contact: "/#contact",
};

const DEMO = {
  "/": "#launchpad",
  "/#launchpad": "#launchpad",
  "/#guide": "#guide",
  "/#labs": "#labs",
  "/#contact": "#contact",
  "/labs/": "#labs",
  "/timeline/": "#timeline",
  "/gems/": "#gems",
  "/about/": "#about",
  "/legal/": "#legal",
  "/privacy/": "#privacy",
  "/accessibility/": "#accessibility",
};

export function toHref(path, demo) {
  if (!demo) return path;
  return DEMO[path] || path;
}

export function isCurrent(path, demo, loc) {
  const here = loc || window.location;
  if (demo) {
    const hash = here.hash || "#launchpad";
    return toHref(path, true) === hash;
  }
  const url = new URL(path, here.origin || "https://cyphermonkeylabs.com");
  const pathName = String(here.pathname || "/").replace(/\/index\.html$/, "/");
  if (url.pathname === "/") {
    const onHome = pathName === "/" || pathName.endsWith("/index.html");
    return onHome && (!here.hash || here.hash === "#launchpad" || here.hash === "#");
  }
  if (url.pathname !== pathName) return false;
  if (!url.hash) return !here.hash;
  return url.hash === here.hash;
}
