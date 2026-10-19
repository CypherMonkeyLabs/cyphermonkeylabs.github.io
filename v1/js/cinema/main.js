/* Front door controller: menu, reveal, card tilt, sound toggle, guide bot, lazy 3D hero. No dependencies. */
import { mountGuide } from './dragbot.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = () => document.documentElement.dataset.motion === 'reduce' ||
  (document.documentElement.dataset.motion !== 'full' && matchMedia('(prefers-reduced-motion: reduce)').matches);
const saveData = () => !!(navigator.connection && navigator.connection.saveData);

/* menu */
const menu = $('#menu'), menuBtn = $('#menu-btn');
let lastFocus = null;
function openMenu() {
  lastFocus = document.activeElement;
  menu.hidden = false; document.body.classList.add('menu-open'); menuBtn.setAttribute('aria-expanded', 'true');
  $('.menu-item', menu).focus();
}
function closeMenu() {
  if (menu.hidden) return;
  menu.hidden = true; document.body.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded', 'false');
  (lastFocus || menuBtn).focus();
}
menuBtn.addEventListener('click', openMenu);
$('#menu-close').addEventListener('click', closeMenu);
menu.addEventListener('click', (e) => { if (e.target.closest('[data-menu-link]')) { const a = e.target.closest('a'); if ((a.getAttribute('href') || '').startsWith('#')) { menu.hidden = true; document.body.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded', 'false'); } } else if (e.target === menu) closeMenu(); });
document.addEventListener('keydown', (e) => {
  if (menu.hidden) return;
  if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
  if (e.key !== 'Tab') return;
  const f = $$('a,button', menu).filter((n) => n.offsetParent !== null);
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* reveal on scroll */
const targets = $$('.sec-head, .screen, .lab-group-head, .lab, .path li, .about > *, .contact-section, .more-link');
targets.forEach((el) => el.classList.add('reveal'));
if ('IntersectionObserver' in window && !reduced()) {
  const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  targets.forEach((el, i) => { el.style.transitionDelay = ((i % 4) * 70) + 'ms'; io.observe(el); });
} else targets.forEach((el) => el.classList.add('in'));

/* 3D tilt on lab cards (fine pointers only) */
if (matchMedia('(pointer:fine)').matches && !reduced()) {
  $$('.lab').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `rotateY(${(x * 10).toFixed(2)}deg) rotateX(${(-y * 10).toFixed(2)}deg) translateZ(8px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

/* trailer: never autoplays; pause when scrolled away */
const video = $('#trailer-video');
if (video && 'IntersectionObserver' in window) {
  new IntersectionObserver((es) => es.forEach((en) => { if (!en.isIntersecting && !video.paused) video.pause(); }), { threshold: 0.2 }).observe(video);
}

/* sound: off by default, tiny WebAudio pad, loaded only when asked */
const soundBtn = $('#sound-btn');
let audio = null;
soundBtn.addEventListener('click', async () => {
  const on = soundBtn.getAttribute('aria-pressed') !== 'true';
  if (!audio) audio = await import('./audio.js');
  on ? audio.start() : audio.stop();
  soundBtn.setAttribute('aria-pressed', String(on));
  soundBtn.setAttribute('aria-label', 'Ambient sound, currently ' + (on ? 'on' : 'off'));
  $('.btn-label', soundBtn).textContent = on ? 'Sound on' : 'Sound off';
  $('use', soundBtn).setAttribute('href', on ? '#i-sound-on' : '#i-sound-off');
});

/* guide bot answers from the lab catalog */
mountGuide();

/* 3D hero: lazy, only with WebGL, full motion, no save-data */
function webgl() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } }
if (!reduced() && !saveData() && webgl()) {
  const go = async () => {
    try {
      const { mountHero } = await import('./hero.js');
      const ok = await mountHero($('#hero-canvas'), $('#hero'));
      if (ok) { $('#hero-canvas').classList.add('on'); $('#hero-art').classList.add('live'); }
    } catch (err) { /* poster/CSS orbit stays */ }
  };
  (window.requestIdleCallback || ((f) => setTimeout(f, 300)))(go, { timeout: 1500 });
}
