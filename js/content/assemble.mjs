import { categoryTile, gemCard, groupedLabs, labLaunch, timelineCard } from "./render.mjs";
import { mountMascot } from "./mascot.mjs";

const MODULES = {
  universe: "/js/universe/index.js",
  nav: "/js/nav/index.js",
  settings: "/js/settings/index.js",
  trust: "/js/trust/index.js",
};

async function loadJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(url);
  return response.json();
}

async function optionalImport(url) {
  try {
    const probe = await fetch(url, { method: "HEAD" });
    if (!probe.ok) return null;
    return await import(url);
  } catch {
    return null;
  }
}

function applySettings(settings) {
  if (!settings || typeof settings !== "object") return;
  const html = document.documentElement;
  const media = (query) => window.matchMedia(query).matches;
  let theme = settings.theme || html.dataset.theme || "starlight";
  if (theme === "system") theme = media("(prefers-color-scheme: dark)") ? "starlight" : "dawn";
  let motion = settings.motion || html.dataset.motion || "system";
  if (motion === "system") motion = media("(prefers-reduced-motion: reduce)") ? "reduce" : "full";
  html.dataset.theme = theme;
  html.dataset.motion = motion;
  if (settings.mascot) html.dataset.mascot = settings.mascot;
  if (settings.quality) html.dataset.quality = settings.quality;
  if (settings.textScale) html.style.setProperty("--text-scale", String(settings.textScale));
}

function readStoredSettings() {
  try {
    const raw = localStorage.getItem("cm.settings") || localStorage.getItem("cml:settings:v1");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function fillLabs(labs, categories) {
  const mount = document.querySelector("[data-lab-mount]");
  if (!mount) return;
  const baked = mount.querySelector("[data-lab]");
  if (!baked) {
    const tiles = document.querySelector("[data-tiles]");
    if (tiles) {
      tiles.innerHTML = categories
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((cat) => categoryTile(cat, labs.filter((lab) => lab.category === cat.id).length))
        .join("");
    }
    mount.innerHTML = groupedLabs(labs, categories);
  }
}

function fillTimeline(events) {
  const list = document.querySelector("[data-timeline]");
  const ordered = events.slice().sort((a, b) => a.date.localeCompare(b.date));
  if (list && !list.children.length) {
    list.innerHTML = ordered.map((event) => timelineCard(event)).join("");
  }
  const years = document.querySelector("[data-year-jump]");
  if (!years || years.options.length) return;
  const unique = [...new Set(ordered.map((event) => event.date.slice(0, 4)))];
  years.innerHTML = `<option value="">Jump to a year</option>${unique.map((year) => `<option value="${year}">${year}</option>`).join("")}`;
}

function fillGems(gems) {
  const mount = document.querySelector("[data-gem-mount]");
  if (!mount || mount.querySelector("[data-gem]")) return;
  const featured = gems.filter((gem) => gem.featured);
  const rest = gems.filter((gem) => !gem.featured);
  mount.innerHTML = `${featured.map((gem) => gemCard(gem)).join("")}
    <details class="gem-more"><summary>Show all ${gems.length} desks</summary><div class="gem-grid">${rest.map((gem) => gemCard(gem)).join("")}</div></details>`;
}

function wireFilters() {
  const form = document.querySelector("[data-filters]");
  const empty = document.querySelector("[data-empty]");
  if (!form) return;
  const params = new URLSearchParams(location.search);
  const cat = form.querySelector("[name=cat]");
  const level = form.querySelector("[name=level]");
  const q = form.querySelector("[name=q]");
  if (cat && params.get("cat")) cat.value = params.get("cat");
  if (level && params.get("level")) level.value = params.get("level");
  if (q && params.get("q")) q.value = params.get("q");

  const apply = () => {
    const category = cat?.value || "";
    const skill = level?.value || "";
    const query = (q?.value || "").trim().toLowerCase();
    let shown = 0;
    document.querySelectorAll("[data-lab]").forEach((card) => {
      const hay = `${card.dataset.title || ""} ${card.dataset.tags || ""}`;
      const ok = (!category || card.dataset.category === category)
        && (!skill || card.dataset.level === skill)
        && (!query || hay.includes(query));
      card.hidden = !ok;
      if (ok) shown += 1;
    });
    document.querySelectorAll(".cat-block").forEach((block) => {
      const visible = block.querySelectorAll("[data-lab]:not([hidden])").length;
      block.hidden = visible === 0;
    });
    if (empty) empty.hidden = shown !== 0;
    const url = new URL(location.href);
    ["cat", "level", "q"].forEach((key) => {
      const value = form.querySelector(`[name=${key}]`)?.value || "";
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    });
    history.replaceState(null, "", url);
  };
  form.addEventListener("input", apply);
  apply();
}

function wireTimeline() {
  const scroller = document.querySelector("[data-timeline-scroller]");
  const list = document.querySelector("[data-timeline]");
  if (!scroller || !list) return;
  document.querySelectorAll("[data-track-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const track = button.dataset.trackFilter;
      document.querySelectorAll("[data-track-filter]").forEach((item) => {
        item.setAttribute("aria-pressed", item === button ? "true" : "false");
      });
      list.querySelectorAll(".event").forEach((event) => {
        event.hidden = track !== "all" && event.dataset.track !== track;
      });
    });
  });
  const jump = (dir) => {
    scroller.scrollBy({ left: dir * 340, behavior: document.documentElement.dataset.motion === "reduce" ? "auto" : "smooth" });
  };
  document.querySelector("[data-time-prev]")?.addEventListener("click", () => jump(-1));
  document.querySelector("[data-time-next]")?.addEventListener("click", () => jump(1));
  scroller.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") jump(1);
    if (event.key === "ArrowLeft") jump(-1);
  });
  document.querySelector("[data-year-jump]")?.addEventListener("change", (event) => {
    const item = list.querySelector(`[data-year="${event.target.value}"]`);
    item?.scrollIntoView({ inline: "start", block: "nearest", behavior: document.documentElement.dataset.motion === "reduce" ? "auto" : "smooth" });
  });
}

function wireContact(labs, site) {
  const form = document.querySelector("#contact-form");
  if (!form) return;
  const labSelect = form.querySelector("[name=lab]");
  if (labSelect) {
    labs.forEach((lab) => {
      const option = document.createElement("option");
      option.value = lab.id;
      option.textContent = lab.title;
      labSelect.append(option);
    });
  }
  const params = new URLSearchParams(location.search);
  const topic = params.get("topic");
  const lab = params.get("lab");
  if (topic && form.topic) {
    const match = [...form.topic.options].some((option) => option.value === topic);
    if (match) form.topic.value = topic;
  }
  if (lab && labSelect) labSelect.value = lab;
  const opened = performance.now();
  const status = document.querySelector("[data-form-status]");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (form.company?.value) return;
    const errors = [];
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    if (name.length < 2 || name.length > 80) errors.push("Add a name between 2 and 80 characters.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) errors.push("Add an email address so a reply can reach you.");
    if (message.length < 20 || message.length > 4000) errors.push("Write a message between 20 and 4000 characters.");
    if ((message.match(/https?:\/\//g) || []).length > 3) errors.push("Use three links or fewer.");
    if (!form.consent.checked) errors.push("Check the box so I may use the message to reply.");
    if (performance.now() - opened < 3000) errors.push("Wait a few seconds, then send again.");
    if (errors.length) {
      if (status) {
        status.hidden = false;
        status.dataset.state = "error";
        status.innerHTML = `<strong>Check these and try again.</strong><ul>${errors.map((item) => `<li>${item}</li>`).join("")}</ul>`;
        status.focus();
      }
      document.dispatchEvent(new CustomEvent("cm:oops"));
      return;
    }
    const topicValue = form.topic.value;
    const labValue = form.lab.value;
    const endpoint = site.contact?.endpoint || form.dataset.contactEndpoint || "";
    if (endpoint) {
      const data = new FormData(form);
      data.set("t", String(Date.now() - (performance.now() - opened)));
      try {
        const response = await fetch(endpoint, { method: "POST", body: data });
        if (!response.ok) throw new Error("send");
      } catch {
        if (status) {
          status.hidden = false;
          status.dataset.state = "error";
          status.textContent = "The message did not send. Your words are still in the form.";
          status.focus();
        }
        document.dispatchEvent(new CustomEvent("cm:oops"));
        return;
      }
    } else {
      const issue = new URL(site.contact.issuesUrl);
      issue.searchParams.set("title", `[CML] ${topicValue}${labValue ? ` · ${labValue}` : ""}`);
      issue.searchParams.set("body", `${message}\n\n— ${name}\nReply to: ${email}\nTopic: ${topicValue}\nLab: ${labValue || "n/a"}`);
      window.open(issue.toString(), "_blank", "noopener");
    }
    if (status) {
      status.hidden = false;
      status.dataset.state = "ok";
      status.textContent = endpoint
        ? "Message received! I usually reply within a few days."
        : "A GitHub issue draft opened in a new tab. The site does not store the message.";
      status.focus();
    }
    form.reset();
    document.dispatchEvent(new CustomEvent("cm:celebrate"));
  });
}

function wireLabClicks() {
  let opened = false;
  try {
    opened = sessionStorage.getItem("cm.openedLab") === "1";
  } catch {
    opened = false;
  }
  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a.btn.primary");
    if (!link || !link.closest("[data-lab]")) return;
    if (opened) return;
    opened = true;
    try {
      sessionStorage.setItem("cm.openedLab", "1");
    } catch {
      /* ignore */
    }
    document.dispatchEvent(new CustomEvent("cm:celebrate"));
  });
}

function syncHeroBand() {
  const card = document.querySelector("#launchpad .hero-copy");
  if (!card) return;
  const top = card.getBoundingClientRect().top;
  const band = Math.max(0, Math.min(window.innerHeight, Math.ceil(window.innerHeight - top)));
  const next = `${band}px`;
  if (document.documentElement.style.getPropertyValue("--hero-band") === next) return;
  document.documentElement.style.setProperty("--hero-band", next);
}

function watchHeroBand() {
  syncHeroBand();
  const card = document.querySelector("#launchpad .hero-copy");
  const hero = card?.closest(".hero");
  if (card && "ResizeObserver" in window) {
    const observer = new ResizeObserver(() => syncHeroBand());
    observer.observe(card);
    if (hero) observer.observe(hero);
    const nav = document.querySelector("#nav-root");
    if (nav) observer.observe(nav);
    const launchpad = document.querySelector("#launchpad");
    if (launchpad) observer.observe(launchpad);
  }
  window.addEventListener("resize", syncHeroBand);
  window.addEventListener("scroll", syncHeroBand, { passive: true });
  document.querySelector(".page")?.addEventListener("scroll", syncHeroBand, { passive: true });
  document.fonts?.ready?.then(syncHeroBand);
}

function wireDepth() {
  const root = document.documentElement;
  const reduced = () => root.dataset.motion === "reduce";
  let frame = 0;
  let px = 0;
  let py = 0;
  window.addEventListener("pointermove", (event) => {
    if (reduced()) return;
    px = (event.clientX / window.innerWidth - 0.5) * 36;
    py = (event.clientY / window.innerHeight - 0.5) * 28;
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      root.style.setProperty("--star-x", `${px.toFixed(1)}px`);
      root.style.setProperty("--star-y", `${py.toFixed(1)}px`);
    });
  });
  const cards = ".lab-card, .gem-card, .tile";
  document.addEventListener("pointermove", (event) => {
    const card = event.target.closest?.(cards);
    if (!card || reduced()) return;
    const rect = card.getBoundingClientRect();
    const rx = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
    const ry = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
    card.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(10px)`;
  });
  document.addEventListener("pointerout", (event) => {
    const card = event.target.closest?.(cards);
    if (!card || card.contains(event.relatedTarget)) return;
    card.style.transform = "";
  });
  document.addEventListener("cm:tilt", (event) => {
    if (reduced()) return;
    const x = Number(event.detail?.x) || 0;
    const y = Number(event.detail?.y) || 0;
    document.querySelectorAll(cards).forEach((card) => {
      if (card.matches(":hover")) return;
      card.style.transform = `rotateX(${(y * 16).toFixed(2)}deg) rotateY(${(x * 16).toFixed(2)}deg)`;
    });
  });
}

function focusFromHash() {
  if (location.hash !== "#contact") return;
  const heading = document.querySelector("#contact-title");
  heading?.focus();
}

async function mountOptional(packs) {
  const [universe, nav, settings, trust] = await Promise.all([
    optionalImport(MODULES.universe),
    optionalImport(MODULES.nav),
    optionalImport(MODULES.settings),
    optionalImport(MODULES.trust),
  ]);
  const labs = packs.labs.labs;
  if (typeof nav?.mountNav === "function") {
    const navRoot = document.querySelector("#nav-root");
    if (navRoot) {
      const snapshot = navRoot.innerHTML;
      try {
        navRoot.replaceChildren();
        nav.mountNav(navRoot, labs);
      } catch {
        navRoot.innerHTML = snapshot;
      }
    }
  }
  if (typeof settings?.mountSettings === "function") {
    try {
      settings.mountSettings();
    } catch {
      /* settings stay on the stored key */
    }
  }
  if (typeof trust?.mountContact === "function") {
    const contactRoot = document.querySelector("#contact-root") || document.querySelector("#contact-panel");
    if (contactRoot) {
      const snapshot = contactRoot.innerHTML;
      try {
        contactRoot.replaceChildren();
        trust.mountContact(contactRoot);
      } catch {
        contactRoot.innerHTML = snapshot;
      }
    }
  }
  if (typeof trust?.mountFooter === "function") {
    const footerRoot = document.querySelector("#footer-root");
    if (footerRoot) {
      const snapshot = footerRoot.innerHTML;
      try {
        footerRoot.replaceChildren();
        trust.mountFooter(footerRoot);
      } catch {
        footerRoot.innerHTML = snapshot;
      }
    }
  }
  let universeApi = null;
  if (typeof universe?.mountUniverse === "function") {
    const canvas = document.querySelector("#universe-canvas");
    try {
      universeApi = universe.mountUniverse(canvas, labs, {
        reducedMotion: document.documentElement.dataset.motion === "reduce",
        theme: document.documentElement.dataset.theme || "starlight",
      });
      document.querySelector(".orbit-fallback")?.setAttribute("hidden", "");
      canvas?.removeAttribute("hidden");
    } catch {
      /* the drawn orbit stays */
    }
  }
  window.addEventListener("universe:select", (event) => {
    const id = event.detail?.id;
    document.querySelectorAll("[data-lab].is-picked").forEach((node) => node.classList.remove("is-picked"));
    const card = id ? document.querySelector(`[data-lab="${CSS.escape(id)}"]`) : null;
    if (!card) return;
    card.classList.add("is-picked");
    if (event.target && event.target.id === "universe-canvas") {
      card.scrollIntoView({ block: "nearest", behavior: document.documentElement.dataset.motion === "reduce" ? "auto" : "smooth" });
    }
  });
  document.addEventListener("click", (event) => {
    const card = event.target.closest?.("[data-lab]");
    if (!card?.dataset.lab || event.target.closest?.("a")) return;
    document.querySelectorAll("[data-lab].is-picked").forEach((node) => node.classList.remove("is-picked"));
    card.classList.add("is-picked");
    universeApi?.focusLab?.(card.dataset.lab);
  });
  syncHeroBand();
}

async function main() {
  applySettings({ ...readStoredSettings(), ...Object.fromEntries(new URLSearchParams(location.search)) });
  window.addEventListener("cm:settings", (event) => applySettings(event.detail));
  const [labsDoc, categories, timeline, gemsDoc, mascot, site] = await Promise.all([
    loadJson("/data/labs.json"),
    loadJson("/data/categories.json"),
    loadJson("/data/timeline.json"),
    loadJson("/data/gems.json"),
    loadJson("/data/mascot.json"),
    loadJson("/data/site.json"),
  ]);
  const labs = labsDoc.labs;
  fillLabs(labs, categories);
  const launches = labs.filter((lab) => lab.launchedAt).map((lab) => labLaunch(lab));
  fillTimeline([...timeline.events, ...launches]);
  fillGems(gemsDoc.gems);
  wireFilters();
  wireTimeline();
  wireContact(labs, site);
  wireDepth();
  watchHeroBand();
  wireLabClicks();
  focusFromHash();
  window.addEventListener("hashchange", focusFromHash);
  const mascotRoot = document.querySelector("#mascot-root");
  if (mascotRoot && document.documentElement.dataset.mascot !== "hidden") {
    mountMascot(mascotRoot, mascot);
    syncHeroBand();
  }
  document.documentElement.classList.add("is-ready");
  await mountOptional({ labs: labsDoc });
}

main().catch(() => {
  document.documentElement.classList.add("is-ready");
});
