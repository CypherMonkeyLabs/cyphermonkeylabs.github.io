import { ENDPOINT, LINKS, strings, topicLabel } from './copy.js';
import { buildPublicIssueUrl } from './issue-url.js';
import { h, hiddenSpan } from './dom.js';
import { loadLabs } from './labs.js';
import { LIMITS, normalizeTopic, timingError, validateFields } from './message-rules.js';
import { applySettingsDetail, prefersReduced, readSettings, replaceMount } from './settings.js';

const FIELD_IDS = {
  name: 'contact-name',
  email: 'contact-email',
  topic: 'contact-topic',
  lab: 'contact-lab',
  message: 'contact-message',
  consent: 'contact-consent',
  company: 'contact-company',
  stamp: 'contact-stamp',
};

const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let turnstileLoader;

function meta(name) {
  return document.querySelector(`meta[name="${name}"]`)?.getAttribute('content')?.trim() || '';
}

export function contactFailureCode(status, payload) {
  const code = payload && typeof payload.code === 'string' ? payload.code.trim() : '';
  if (code) return code;
  switch (status) {
    case 429: return 'rate';
    case 503: return 'unconfigured';
    case 400: return 'captcha';
    default: return 'invalid';
  }
}

function loadTurnstileApi() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileLoader) return turnstileLoader;
  turnstileLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.defer = true;
    script.dataset.cmlTurnstile = '1';
    script.addEventListener('load', () => resolve(window.turnstile), { once: true });
    script.addEventListener('error', () => {
      turnstileLoader = null;
      reject(new Error('captcha'));
    }, { once: true });
    document.head.append(script);
  });
  return turnstileLoader;
}

function turnstileTheme() {
  return document.documentElement.dataset.theme === 'starlight' ? 'dark' : 'light';
}

function turnstileSize() {
  return window.matchMedia('(max-width: 479px)').matches ? 'compact' : 'normal';
}

function pageConfig() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('contact');
  const mode = requested === 'worker' || requested === 'fallback' ? requested : (meta('cml-contact-mode') || 'fallback');
  return {
    mode,
    endpoint: meta('cml-contact-endpoint') || ENDPOINT,
    sitekey: meta('cml-turnstile-sitekey') || '',
  };
}

function errorText(copy, code) {
  switch (code) {
    case 'name': return copy.errorName;
    case 'email': return copy.errorEmail;
    case 'topic': return copy.errorTopic;
    case 'lab':
    case 'lab-unknown': return copy.errorLab;
    case 'message': return copy.errorMessage;
    case 'urls': return copy.errorUrls;
    case 'consent': return copy.errorConsent;
    case 'public-email': return copy.errorPublicEmail;
    case 'too_fast': return copy.errorTooFast;
    case 'captcha': return copy.errorCaptcha;
    case 'rate': return copy.errorRate;
    case 'invalid': return copy.errorInvalid;
    case 'unconfigured': return copy.errorUnconfigured;
    case 'network': return copy.errorNetwork;
    default: return copy.errorGeneric;
  }
}

function dispatchMascot(state) {
  window.dispatchEvent(new CustomEvent('cm:mascot', { detail: { state } }));
}

export function mountContact(rootEl, opts = {}) {
  if (!rootEl) throw new Error('mountContact: root element is required');
  const config = { ...pageConfig(), ...opts };
  let lang = document.documentElement.lang || 'en';
  let labs = [];
  let startedAt = 0;
  let widgetId = null;
  let renderGeneration = 0;
  let formState = {
    name: '',
    email: '',
    topic: 'general',
    lab: '',
    message: '',
    consent: false,
  };

  function snapshot() {
    const form = rootEl.querySelector('form');
    if (!form) return;
    formState = {
      name: form.elements.name.value,
      email: form.elements.email.value,
      topic: form.elements.topic.value,
      lab: form.elements.lab.value,
      message: form.elements.message.value,
      consent: form.elements.consent.checked,
    };
  }

  function paint() {
    dropWidget();
    const copy = strings(lang);
    const section = h('section', { id: 'contact', class: 'contact-section', 'aria-labelledby': 'contact-title' });
    const intro = h('div', { class: 'contact-intro' });
    intro.append(
      h('p', { class: 'eyebrow', text: 'Mission Control' }),
      h('h2', { id: 'contact-title', tabindex: '-1', text: copy.contactTitle }),
      h('p', { text: copy.contactLead }),
      h('p', { class: 'mailbox-note', text: config.mode === 'worker' ? copy.mailboxWorker : copy.mailboxFallback }),
    );
    const errors = h('div', { id: 'contact-errors', class: 'error-summary', role: 'alert', tabindex: '-1', hidden: 'hidden' });
    const form = h('form', {
      id: 'contact-form',
      class: 'contact-form',
      action: config.endpoint,
      method: 'post',
      novalidate: 'novalidate',
    });
    form.append(errors);
    form.append(honeypot(copy));
    form.append(h('input', { type: 'hidden', name: 't', id: FIELD_IDS.stamp, value: startedAt ? String(startedAt) : '' }));
    form.append(field(copy.name, FIELD_IDS.name, h('input', {
      id: FIELD_IDS.name, name: 'name', type: 'text', autocomplete: 'name', required: 'required', minlength: '2', maxlength: '80', value: formState.name,
    })));
    form.append(field(copy.email, FIELD_IDS.email, h('input', {
      id: FIELD_IDS.email, name: 'email', type: 'email', autocomplete: 'email', required: 'required', maxlength: '254', value: formState.email,
    }), copy.emailHint));
    form.append(field(copy.topic, FIELD_IDS.topic, topicSelect(copy)));
    form.append(field(copy.lab, FIELD_IDS.lab, labSelect(copy)));
    const message = h('textarea', {
      id: FIELD_IDS.message, name: 'message', required: 'required', minlength: '20', maxlength: '4000', rows: '6',
    });
    message.value = formState.message;
    const counter = h('p', { id: 'contact-count', class: 'hint', 'aria-live': 'polite', text: countText(copy, message.value) });
    message.addEventListener('input', () => { counter.textContent = countText(copy, message.value); });
    form.append(field(copy.message, FIELD_IDS.message, message, copy.messageHint));
    form.append(counter);
    form.append(consentRow(copy));
    if (config.mode === 'worker' && config.sitekey) form.append(turnstile(config.sitekey));
    const submit = h('button', { type: 'submit', class: 'btn-primary', text: copy.send });
    form.append(h('div', { class: 'form-actions' }, [submit]));
    const success = h('div', { id: 'contact-success', class: 'contact-success', role: 'status', tabindex: '-1', hidden: 'hidden' });
    section.append(intro, form, success);
    rootEl.replaceChildren(section);
    const prefill = prefillFromUrl();
    if (prefill.topic) form.elements.topic.value = prefill.topic;
    if (prefill.lab && [...form.elements.lab.options].some((option) => option.value === prefill.lab)) form.elements.lab.value = prefill.lab;
    watchStamp(form);
    form.addEventListener('submit', (event) => { event.preventDefault(); void onSubmit(form, success, submit); });
  }

  function honeypot(copy) {
    const wrap = h('div', { class: 'hp', 'aria-hidden': 'true' });
    wrap.append(h('label', { for: FIELD_IDS.company, text: copy.company }), h('input', {
      id: FIELD_IDS.company, name: 'company', type: 'text', tabindex: '-1', autocomplete: 'off',
    }));
    return wrap;
  }

  function topicSelect(copy) {
    const select = h('select', { id: FIELD_IDS.topic, name: 'topic', required: 'required' });
    for (const value of ['general', 'correction', 'lab-idea', 'collaboration', 'accessibility']) {
      const option = h('option', { value, text: topicLabel(value, lang) });
      if (value === formState.topic) option.selected = true;
      select.append(option);
    }
    return select;
  }

  function labSelect(copy) {
    const select = h('select', { id: FIELD_IDS.lab, name: 'lab' });
    select.append(h('option', { value: '', text: copy.labNone }));
    for (const lab of labs) {
      const option = h('option', { value: lab.id, text: lab.title });
      if (lab.id === formState.lab) option.selected = true;
      select.append(option);
    }
    return select;
  }

  function consentRow(copy) {
    const wrap = h('div', { class: 'consent' });
    const box = h('input', { id: FIELD_IDS.consent, name: 'consent', type: 'checkbox', value: 'yes', required: 'required' });
    box.checked = formState.consent;
    const label = h('label', { for: FIELD_IDS.consent });
    label.append(copy.consent, ' ', h('a', { href: LINKS.privacy, text: copy.privacyLink }));
    wrap.append(box, label);
    return wrap;
  }

  function widgetOptions(sitekey, note) {
    return {
      sitekey,
      appearance: 'always',
      theme: turnstileTheme(),
      size: turnstileSize(),
      'response-field': true,
      'response-field-name': 'cf-turnstile-response',
      'error-callback'() {
        note.hidden = false;
        note.textContent = strings(lang).errorCaptcha;
      },
      'expired-callback'() {
        if (widgetId != null && window.turnstile) window.turnstile.reset(widgetId);
      },
    };
  }

  function dropWidget() {
    if (widgetId == null || !window.turnstile) {
      widgetId = null;
      return;
    }
    try {
      window.turnstile.remove(widgetId);
    } catch {
      /* The node is already gone after a repaint. */
    }
    widgetId = null;
  }

  // Load Turnstile only when the form is near the screen or touched. The challenge iframe runs a
  // fetch('data:,') probe under Cloudflare's own CSP, which logs console errors on every page view.
  function whenNear(host, run) {
    let done = false;
    const go = () => { if (done) return; done = true; run(); };
    if (!('IntersectionObserver' in window)) { go(); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { observer.disconnect(); go(); }
    }, { rootMargin: '300px 0px' });
    observer.observe(host);
    host.closest('form')?.addEventListener('focusin', () => { observer.disconnect(); go(); }, { once: true });
  }

  function renderWidget(host, sitekey, note) {
    const generation = ++renderGeneration;
    whenNear(host, () => loadAndRender(host, sitekey, note, generation));
  }

  function loadAndRender(host, sitekey, note, generation) {
    loadTurnstileApi().then((api) => {
      if (generation !== renderGeneration || !host.isConnected || !api) return;
      dropWidget();
      widgetId = api.render(host, widgetOptions(sitekey, note));
    }).catch(() => {
      if (generation !== renderGeneration) return;
      note.hidden = false;
      note.textContent = strings(lang).errorCaptcha;
    });
  }

  function turnstile(sitekey) {
    const slot = h('div', { class: 'turnstile-slot' });
    const label = h('p', { class: 'turnstile-label', text: strings(lang).spamCheck });
    const host = h('div', { class: 'turnstile-host' });
    const note = h('p', { class: 'hint turnstile-note', hidden: 'hidden' });
    slot.append(label, host, note);
    renderWidget(host, sitekey, note);
    return slot;
  }

  function refreshTurnstile() {
    const host = rootEl.querySelector('.turnstile-host');
    const note = rootEl.querySelector('.turnstile-note');
    if (!host || !note || config.mode !== 'worker' || !config.sitekey) return;
    note.hidden = true;
    renderWidget(host, config.sitekey, note);
  }

  function watchStamp(form) {
    const input = form.elements.t;
    const mark = () => {
      if (startedAt) return;
      startedAt = Date.now();
      input.value = String(startedAt);
    };
    if (!('IntersectionObserver' in window)) {
      form.addEventListener('focusin', mark, { once: true });
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        mark();
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(form);
  }

  async function onSubmit(form, success, submit) {
    const copy = strings(lang);
    clearErrors(form);
    success.hidden = true;
    const knownLabs = labs.length ? labs.map((lab) => lab.id) : undefined;
    if (form.elements.company.value) {
      showSuccess(success, form, { kind: 'worker' });
      return;
    }
    const result = validateFields({
      name: form.elements.name.value,
      email: form.elements.email.value,
      topic: form.elements.topic.value,
      lab: form.elements.lab.value,
      message: form.elements.message.value,
      consent: form.elements.consent.checked,
    }, { knownLabs, rejectPublicEmail: config.mode !== 'worker' });
    const stampProblem = timingError(form.elements.t.value);
    const clientErrors = stampProblem ? [{ field: 'message', code: stampProblem }, ...result.errors] : result.errors;
    if (clientErrors.length) {
      showErrors(form, clientErrors);
      dispatchMascot('oops');
      return;
    }
    setBusy(form, submit, true);
    try {
      if (config.mode === 'worker') {
        await postWorker(form);
        showSuccess(success, form, { kind: 'worker' });
        dispatchMascot('celebrate');
        return;
      }
      const url = buildPublicIssueUrl({ ...result.value });
      const popup = window.open(url, '_blank', 'noopener,noreferrer');
      showSuccess(success, form, { kind: popup ? 'fallback' : 'blocked', url });
      dispatchMascot('celebrate');
    } catch (error) {
      if (widgetId != null && window.turnstile) window.turnstile.reset(widgetId);
      const code = error && error.code ? error.code : 'network';
      showErrors(form, [{ field: 'message', code }]);
      dispatchMascot('oops');
    } finally {
      setBusy(form, submit, false);
    }
  }

  async function postWorker(form) {
    if (!config.sitekey) {
      const error = new Error('captcha');
      error.code = 'captcha';
      throw error;
    }
    const token = form.querySelector('[name="cf-turnstile-response"]');
    if (token && !String(token.value || '').trim()) {
      const error = new Error('captcha');
      error.code = 'captcha';
      throw error;
    }
    let response;
    try {
      response = await fetch(config.endpoint, { method: 'POST', body: new FormData(form), headers: { accept: 'application/json' } });
    } catch {
      const error = new Error('network');
      error.code = 'network';
      throw error;
    }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      const code = contactFailureCode(response.status, payload);
      const error = new Error(code);
      error.code = code;
      throw error;
    }
  }

  function showErrors(form, errors) {
    const copy = strings(lang);
    const box = form.querySelector('#contact-errors');
    const list = h('ul');
    box.replaceChildren(h('p', { text: copy.errorSummary }), list);
    const seen = new Set();
    for (const item of errors) {
      if (seen.has(item.code + item.field)) continue;
      seen.add(item.code + item.field);
      const id = FIELD_IDS[item.field] || FIELD_IDS.message;
      const control = document.getElementById(id);
      if (control && control.type !== 'hidden') control.setAttribute('aria-invalid', 'true');
      const button = h('button', { type: 'button', text: errorText(copy, item.code) });
      button.addEventListener('click', () => control?.focus());
      list.append(h('li', {}, [button]));
    }
    box.hidden = false;
    box.focus();
  }

  function clearErrors(form) {
    const box = form.querySelector('#contact-errors');
    box.hidden = true;
    box.replaceChildren();
    const note = form.querySelector('.turnstile-note');
    if (note) note.hidden = true;
    for (const control of form.querySelectorAll('[aria-invalid="true"]')) control.removeAttribute('aria-invalid');
  }

  function showSuccess(panel, form, outcome) {
    const copy = strings(lang);
    let title = copy.successWorkerTitle;
    let body = copy.successWorkerBody;
    if (outcome.kind === 'fallback') {
      title = copy.successFallbackTitle;
      body = copy.successFallbackBody;
    } else if (outcome.kind === 'blocked') {
      title = copy.successBlockedTitle;
      body = copy.successBlockedBody;
    }
    const again = h('button', { type: 'button', class: 'btn-quiet', text: copy.sendAnother });
    again.addEventListener('click', () => {
      panel.hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    });
    const nodes = [h('p', { class: 'eyebrow', text: 'Mission Control' }), h('h3', { text: title }), h('p', { text: body })];
    if (outcome.url) nodes.push(h('a', { href: outcome.url, rel: 'noopener noreferrer', target: '_blank', text: copy.openIssue }));
    nodes.push(again);
    panel.replaceChildren(...nodes);
    panel.hidden = false;
    form.elements.email.value = '';
    form.elements.message.value = '';
    form.elements.consent.checked = false;
    if (outcome.kind !== 'blocked') form.hidden = true;
    panel.focus();
  }

  function setBusy(form, submit, busy) {
    const copy = strings(lang);
    form.setAttribute('aria-busy', busy ? 'true' : 'false');
    submit.disabled = busy;
    submit.textContent = busy ? copy.sending : copy.send;
    if (busy) submit.append(hiddenSpan(copy.sending));
  }

  function prefillFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return { topic: normalizeTopic(params.get('topic') || ''), lab: params.get('lab') || '' };
  }

  function onSettings(event) {
    snapshot();
    const previousTheme = document.documentElement.dataset.theme;
    applySettingsDetail(event.detail);
    const next = document.documentElement.lang || lang;
    if (next !== lang) {
      lang = next;
      paint();
      return;
    }
    if (document.documentElement.dataset.theme !== previousTheme) refreshTurnstile();
  }

  function onHash() {
    if (window.location.hash !== '#contact') return;
    const heading = document.getElementById('contact-title');
    if (!heading) return;
    heading.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' });
    heading.focus();
  }

  paint();
  window.addEventListener('cm:settings', onSettings);
  window.addEventListener('hashchange', onHash);
  if (window.location.hash === '#contact') queueMicrotask(onHash);
  const pending = loadLabs().then((rows) => {
    labs = rows;
    snapshot();
    const selected = rootEl.querySelector('#contact-lab')?.value || formState.lab;
    formState.lab = selected;
    const select = rootEl.querySelector('#contact-lab');
    if (!select) return;
    const copy = strings(lang);
    const current = select.value;
    select.replaceChildren(h('option', { value: '', text: copy.labNone }));
    for (const lab of labs) select.append(h('option', { value: lab.id, text: lab.title }));
    if ([...select.options].some((option) => option.value === current)) select.value = current;
    const prefill = prefillFromUrl();
    if (prefill.lab && [...select.options].some((option) => option.value === prefill.lab)) select.value = prefill.lab;
  });

  return replaceMount(rootEl, {
    destroy() {
      window.removeEventListener('cm:settings', onSettings);
      window.removeEventListener('hashchange', onHash);
      dropWidget();
      rootEl.replaceChildren();
    },
    ready: pending,
  });
}

function field(label, id, control, hint) {
  const wrap = h('div', { class: 'field' });
  wrap.append(h('label', { for: id, text: label }), control);
  if (hint) wrap.append(h('p', { class: 'hint', id: `${id}-hint`, text: hint }));
  if (hint) control.setAttribute('aria-describedby', `${id}-hint`);
  return wrap;
}

function countText(copy, value) {
  return `${value.length} / ${LIMITS.messageMax} ${copy.chars}`;
}
