import { doorArticle, escapeHtml } from './render.mjs';
import { makeFixtureLabs } from './catalog.mjs';
import { mountStage } from './stage.mjs';

const page = document.body.dataset.page || '';
const params = () => new URLSearchParams(location.search);

function reducedMotion() {
  return document.documentElement.dataset.motion === 'reduce';
}

let stageApi = null;

function mountIfNeeded() {
  if (page !== 'home' || reducedMotion() || stageApi) return;
  const stage = document.querySelector('.stage');
  if (!stage) return;
  stageApi = mountStage(stage);
}

function initMotion() {
  const button = document.getElementById('motion');
  if (!button) return;
  const paint = () => {
    const paused = reducedMotion();
    button.setAttribute('aria-pressed', paused ? 'true' : 'false');
    button.textContent = paused ? 'Motion paused' : 'Pause motion';
  };
  paint();
  button.addEventListener('click', () => {
    const os = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (os && reducedMotion()) return;
    if (reducedMotion()) {
      delete document.documentElement.dataset.motion;
      try { localStorage.removeItem('cm.v2.motion'); } catch { /* ignore */ }
      mountIfNeeded();
    } else {
      document.documentElement.dataset.motion = 'reduce';
      try { localStorage.setItem('cm.v2.motion', 'reduce'); } catch { /* ignore */ }
      if (stageApi) stageApi.stop();
      stageApi = null;
    }
    paint();
  });
}

function initBar() {
  const bar = document.querySelector('.bar');
  if (!bar) return;
  let last = window.scrollY;
  window.addEventListener('scroll', () => {
    if (!window.matchMedia('(min-width: 768px)').matches) {
      bar.classList.remove('is-away');
      return;
    }
    const y = window.scrollY;
    if (y > last + 8 && y > 120) bar.classList.add('is-away');
    else if (y < last - 8) bar.classList.remove('is-away');
    last = y;
  }, { passive: true });
}

function applyLabs() {
  const query = params();
  const cat = query.get('cat') || '';
  const level = query.get('level') || '';
  const status = query.get('status') || '';
  const q = (query.get('q') || '').trim().toLowerCase();
  const doors = [...document.querySelectorAll('.door')];
  let shown = 0;
  doors.forEach((door) => {
    const blob = (door.dataset.blob || '').toLowerCase();
    const secondary = (door.dataset.secondary || '').split(/\s+/).filter(Boolean);
    const catOk = !cat || door.dataset.cat === cat || secondary.includes(cat);
    const levelOk = !level || door.dataset.level === level;
    const statusOk = !status || door.dataset.status === status;
    const qOk = !q || blob.includes(q);
    const ok = catOk && levelOk && statusOk && qOk;
    door.hidden = !ok;
    if (ok) shown += 1;
  });
  document.querySelectorAll('[data-empty="labs"]').forEach((node) => {
    node.hidden = shown !== 0;
    if (cat === 'agents' && shown === 0) {
      node.textContent = 'No agent labs are published yet. That is where this work is heading.';
    }
  });
  document.querySelectorAll('a[data-chip]').forEach((chip) => {
    const current = query.get(chip.dataset.chip) || '';
    const on = current === chip.dataset.value;
    chip.classList.toggle('on', on);
    if (on) chip.setAttribute('aria-current', 'true');
    else chip.removeAttribute('aria-current');
  });
  const count = document.getElementById('shown-count');
  if (count) count.textContent = `${shown} shown`;
  const field = document.getElementById('q');
  if (field && document.activeElement !== field) field.value = query.get('q') || '';
}

function pushLabs(mutate, replace) {
  const query = params();
  mutate(query);
  const text = query.toString();
  const next = text ? `${location.pathname}?${text}` : location.pathname;
  if (replace) history.replaceState(null, '', next);
  else history.pushState(null, '', next);
  applyLabs();
}

function initFilters() {
  document.querySelectorAll('a[data-chip]').forEach((chip) => {
    chip.addEventListener('click', (event) => {
      event.preventDefault();
      pushLabs((query) => {
        if (chip.dataset.value) query.set(chip.dataset.chip, chip.dataset.value);
        else query.delete(chip.dataset.chip);
      });
    });
  });
  const form = document.querySelector('.finder');
  const field = document.getElementById('q');
  if (form && field) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      pushLabs((query) => {
        if (field.value.trim()) query.set('q', field.value.trim());
        else query.delete('q');
      });
    });
    field.addEventListener('input', () => {
      pushLabs((query) => {
        if (field.value.trim()) query.set('q', field.value.trim());
        else query.delete('q');
      }, true);
    });
  }
  window.addEventListener('popstate', applyLabs);
  applyLabs();
}

function initKinds() {
  document.querySelectorAll('button[data-kind]').forEach((button) => {
    button.addEventListener('click', () => {
      const kind = button.dataset.kind;
      const region = button.closest('.side, .tl-a, .story, .catalog') || document;
      region.querySelectorAll('button[data-kind]').forEach((peer) => {
        peer.classList.toggle('on', peer === button);
      });
      region.querySelectorAll('.tl li').forEach((item) => {
        item.hidden = Boolean(kind) && item.dataset.kind !== kind;
      });
      const visible = [...region.querySelectorAll('.tl li')].filter((item) => !item.hidden).length;
      region.querySelectorAll('[data-empty="kind"]').forEach((node) => {
        node.hidden = visible !== 0;
      });
    });
  });
}

function searchItems() {
  return [...document.querySelectorAll('[data-search-item]')].map((node) => ({
    title: node.dataset.title || node.textContent.trim(),
    href: node.dataset.href || node.getAttribute('href'),
    blob: `${node.dataset.blob || ''} ${node.dataset.title || ''}`.toLowerCase(),
  }));
}

function initPalette() {
  const palette = document.getElementById('palette');
  const input = document.getElementById('palette-input');
  const list = document.getElementById('palette-list');
  const opener = document.getElementById('open-search');
  if (!palette || !input || !list || !opener) return;
  let lastFocus = opener;

  function render(query) {
    const needle = query.trim().toLowerCase();
    const hits = searchItems().filter((item) => !needle || item.blob.includes(needle) || item.title.toLowerCase().includes(needle)).slice(0, 8);
    if (!hits.length) {
      list.innerHTML = '<li>No matches</li>';
      return;
    }
    list.innerHTML = hits.map((hit, index) => `<li><a role="option" href="${escapeHtml(hit.href)}" aria-selected="${index === 0 ? 'true' : 'false'}">${escapeHtml(hit.title)}</a></li>`).join('');
  }

  function open() {
    lastFocus = document.activeElement || opener;
    palette.hidden = false;
    input.value = '';
    render('');
    input.focus();
  }
  function close() {
    if (palette.hidden) return;
    palette.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  opener.addEventListener('click', open);
  palette.addEventListener('click', (event) => {
    if (event.target === palette) close();
  });
  input.addEventListener('input', () => render(input.value));
  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const link = list.querySelector('[aria-selected="true"]');
    if (!link) return;
    event.preventDefault();
    window.location.href = link.getAttribute('href');
  });
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (palette.hidden) open();
      else close();
      return;
    }
    if (event.key === 'Escape') close();
  });
}

function initBot() {
  const bot = document.getElementById('bot');
  const form = document.getElementById('bot-form');
  const input = document.getElementById('bot-input');
  const log = document.getElementById('bot-log');
  const ask = document.getElementById('ask');
  const closer = document.getElementById('bot-close');
  if (!bot || !form || !input || !log) return;
  let lastFocus = ask;

  function reply(question) {
    const about = document.querySelector('#about p');
    const heading = document.querySelector('.heading-card p');
    const rules = document.querySelector('#disclaimer p');
    const q = question.toLowerCase();
    let text = 'I can point you at a lab or a timeline note. Try a name such as SIP or Python.';
    let source = 'Guide on this page';
    let links = [];
    if (about && (q.includes('who') || q.includes('about') || q.includes('you'))) {
      text = about.textContent;
      source = 'About Cypher Monkey';
    } else if (heading && (q.includes('head') || q.includes('agent') || q.includes('where'))) {
      text = heading.textContent;
      source = 'Where I am heading';
    } else if (rules && (q.includes('official') || q.includes('affiliat') || q.includes('train') || q.includes('disclaimer'))) {
      text = rules.textContent;
      source = 'Ground rules';
    } else {
      const hits = searchItems().filter((item) => item.blob.includes(q) || item.title.toLowerCase().includes(q)).slice(0, 4);
      if (hits.length) {
        text = hits.map((hit) => hit.title).join('. ');
        source = hits.map((hit) => hit.title).join(', ');
        links = hits;
      }
    }
    const linkHtml = links.map((hit) => `<a href="${escapeHtml(hit.href)}">${escapeHtml(hit.title)}</a>`).join(' ');
    log.insertAdjacentHTML('beforeend', `<article><p><strong>You.</strong> ${escapeHtml(question)}</p><p>${escapeHtml(text)}</p>${linkHtml ? `<p>${linkHtml}</p>` : ''}<p class="tl-source">Source: ${escapeHtml(source)}</p></article>`);
    log.lastElementChild.scrollIntoView({ block: 'nearest' });
  }

  function open() {
    lastFocus = document.activeElement || ask || document.getElementById('open-search');
    bot.hidden = false;
    input.focus();
    if (stageApi) stageApi.wave();
  }
  function close() {
    if (bot.hidden) return;
    bot.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (ask) ask.addEventListener('click', open);
  if (closer) closer.addEventListener('click', close);
  bot.addEventListener('click', (event) => {
    if (event.target === bot) close();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    reply(question);
    input.value = '';
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
}

function initStagePointer() {
  const stage = document.querySelector('.stage');
  if (!stage) return;
  const pupils = [...stage.querySelectorAll('.pupil')];
  function look(x, y) {
    if (stageApi) stageApi.look(x, y);
    if (reducedMotion()) return;
    pupils.forEach((pupil) => {
      pupil.setAttribute('cx', String(Number(pupil.dataset.cx || pupil.getAttribute('cx')) + x * 3));
    });
  }
  pupils.forEach((pupil) => { pupil.dataset.cx = pupil.getAttribute('cx'); });
  stage.addEventListener('pointermove', (event) => {
    const rect = stage.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    look(x, y);
  });
  document.addEventListener('pointerover', (event) => {
    const coin = event.target.closest?.('.coin');
    if (coin) look(-0.9, -0.1);
    const door = event.target.closest?.('.door');
    if (door) {
      const accent = door.style.getPropertyValue('--accent').trim() || '#c4b5fd';
      stage.style.setProperty('--ring', accent);
      if (stageApi) stageApi.setColor(accent);
      look(0.4, 0.2);
    }
  });
  document.addEventListener('focusin', (event) => {
    if (event.target.closest?.('.coin')) look(-0.9, -0.1);
    if (event.target.closest?.('.door')) look(0.4, 0.2);
  });
  stage.addEventListener('click', (event) => {
    if (event.target.closest('a, button')) return;
    if (stageApi) stageApi.wave();
  });
}

function initGreetings() {
  const node = document.getElementById('cm-greetings');
  const hello = document.querySelector('.hello');
  if (!node || !hello || reducedMotion()) return;
  let greetings = [];
  try { greetings = JSON.parse(node.textContent); } catch { greetings = []; }
  if (greetings.length < 2) return;
  let index = 0;
  window.setInterval(() => {
    if (reducedMotion()) return;
    index = (index + 1) % greetings.length;
    const greeting = greetings[index];
    hello.textContent = greeting.hello;
    hello.lang = greeting.lang;
    hello.dir = greeting.dir;
  }, 20000);
}

function initJumps() {
  const mode = document.documentElement.dataset.timeline || 'b';
  document.querySelectorAll('.timeline-jump').forEach((link) => {
    link.hash = `#timeline-${mode}`;
  });
}

async function initFixture() {
  if (page !== 'labs' || params().get('fixture') !== '100') return;
  const grid = document.querySelector('.doors');
  if (!grid) return;
  const [labsFile, categoriesFile] = await Promise.all([
    fetch(new URL('../data/labs.json', import.meta.url)).then((response) => response.json()),
    fetch(new URL('../data/categories.json', import.meta.url)).then((response) => response.json()),
  ]);
  const fixture = makeFixtureLabs(100, labsFile.labs);
  grid.innerHTML = fixture.map((lab) => doorArticle(lab, categoriesFile.categories)).join('');
}

async function start() {
  initMotion();
  initBar();
  initKinds();
  initJumps();
  initGreetings();
  initPalette();
  initBot();
  initStagePointer();
  await initFixture();
  initFilters();
  mountIfNeeded();
}

start();
