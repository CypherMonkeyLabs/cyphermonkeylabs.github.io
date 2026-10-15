import { mountContact } from './contact.js';
import { mountFooter } from './footer.js';
import { mountLost } from './lost.js';
import { applySettingsDetail } from './settings.js';

const parts = new Set((document.body.dataset.trustBoot || '').split(/\s+/).filter(Boolean));

function start(name, fn) {
  try {
    fn();
  } catch (error) {
    console.error(name, error);
  }
}

if (parts.has('contact')) {
  const root = document.getElementById('contact-root');
  if (root) start('mountContact', () => mountContact(root));
}
if (parts.has('footer')) {
  const root = document.getElementById('footer-root');
  if (root) start('mountFooter', () => mountFooter(root));
}
if (parts.has('lost')) {
  const root = document.getElementById('lost-root');
  if (root) start('mountLost', () => mountLost(root));
}

if (parts.has('demo')) {
  for (const button of document.querySelectorAll('[data-set-theme]')) {
    button.addEventListener('click', () => {
      const detail = { theme: button.getAttribute('data-set-theme') };
      applySettingsDetail(detail);
      window.dispatchEvent(new CustomEvent('cm:settings', { detail }));
    });
  }
  for (const button of document.querySelectorAll('[data-set-motion]')) {
    button.addEventListener('click', () => {
      const detail = { motion: button.getAttribute('data-set-motion') };
      applySettingsDetail(detail);
      window.dispatchEvent(new CustomEvent('cm:settings', { detail }));
    });
  }
  for (const button of document.querySelectorAll('[data-set-lang]')) {
    button.addEventListener('click', () => {
      const detail = { lang: button.getAttribute('data-set-lang') };
      applySettingsDetail(detail);
      window.dispatchEvent(new CustomEvent('cm:settings', { detail }));
    });
  }
  const mascot = document.getElementById('mascot-status');
  window.addEventListener('cm:mascot', (event) => {
    if (!mascot) return;
    const state = event.detail?.state;
    mascot.textContent = state === 'celebrate' ? 'Mascot cue: celebrate' : state === 'oops' ? 'Mascot cue: oops' : '';
  });
}
