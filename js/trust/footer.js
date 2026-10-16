import { LINKS, SOCIAL, strings } from './copy.js';
import { externalLink, h, svgInfo } from './dom.js';
import { applySettingsDetail, prefersReduced, replaceMount, scrollToTop } from './settings.js';

function licenseLine(copy) {
  const line = h('p', { class: 'ground-rules__licenses' });
  const code = h('strong', { text: copy.licenseCode });
  const content = h('strong', { text: copy.licenseContent });
  const brand = h('strong', { text: copy.licenseBrand });
  line.append(
    code,
    ' ',
    h('a', { href: LINKS.mit, text: copy.licenseMit }),
    ' · ',
    content,
    ` ${copy.licenseContentRest} `,
    externalLink(LINKS.cc, copy.licenseCc),
    ' · ',
    brand,
    ` ${copy.licenseBrandRest}`,
  );
  const cc = line.querySelector('a[rel]');
  if (cc) cc.setAttribute('rel', 'license noopener noreferrer');
  return line;
}

function groundRules(copy) {
  const section = h('section', { id: 'disclaimer', class: 'ground-rules', 'aria-labelledby': 'disclaimer-title' });
  const icon = h('div', { class: 'ground-rules__icon' });
  icon.append(svgInfo());
  const body = h('div', { class: 'ground-rules__body' });
  const lead = h('p', { class: 'ground-rules__kicker', text: copy.groundLead });
  const title = h('h2', { id: 'disclaimer-title', tabindex: '-1', text: copy.groundTitle });
  const para = h('p');
  para.append(
    h('strong', { text: `${copy.independent} ` }),
    copy.affiliatedBefore,
    h('strong', { text: copy.affiliatedStrong }),
    copy.affiliatedAfter,
    h('a', { href: LINKS.correction, text: copy.tellMission }),
    '.',
  );
  const motto = h('p', { class: 'ground-rules__motto' });
  motto.append(h('strong', { text: copy.motto }), ' ', copy.mottoRest);
  const details = h('details', { class: 'ground-rules__details' });
  details.append(h('summary', { text: copy.trademarksSummary }), h('p', { text: copy.trademarksBody }));
  body.append(lead, title, para, motto, licenseLine(copy), details, h('p', { text: copy.corrections }));
  section.append(icon, body);
  return section;
}

function actionLink(href, label, hint, external) {
  const item = h('li');
  const wrap = h('a', { class: 'action-link', href });
  if (external) {
    wrap.setAttribute('rel', 'noopener noreferrer');
    wrap.setAttribute('target', '_blank');
  }
  wrap.append(h('span', { class: 'action-link__label', text: label }), h('span', { class: 'action-link__hint', text: hint }));
  if (external) wrap.append(document.createTextNode(''), h('span', { class: 'visually-hidden', text: ' (opens new tab)' }));
  item.append(wrap);
  return item;
}

function column(title, links) {
  const block = h('section');
  block.append(h('h3', { text: title }));
  const list = h('ul', { class: 'footer-links' });
  for (const link of links) {
    const item = h('li');
    if (link.external) item.append(externalLink(link.href, link.label));
    else item.append(h('a', { href: link.href, text: link.label }));
    list.append(item);
  }
  block.append(list);
  return block;
}

function socialColumn(copy) {
  const block = h('section');
  block.append(h('h3', { text: copy.socialCol }));
  const list = h('ul', { class: 'footer-links' });
  for (const item of SOCIAL) {
    const li = h('li');
    const link = externalLink(item.href, item.label);
    link.setAttribute('aria-label', `${item.name} (opens new tab)`);
    li.append(link);
    list.append(li);
  }
  block.append(list);
  return block;
}

export function renderFooter(lang) {
  const copy = strings(lang);
  const footer = h('footer', { class: 'cml-footer' });
  const aurora = h('div', { class: 'cml-aurora', 'aria-hidden': 'true' });
  if (prefersReduced()) aurora.dataset.static = 'true';
  const inner = h('div', { class: 'cml-footer__stack' });
  const actions = h('nav', { class: 'trust-actions', 'aria-label': copy.actionsLabel });
  const actionList = h('ul');
  actionList.append(
    actionLink(LINKS.repo, copy.repo, copy.repoHint, true),
    actionLink(LINKS.rate, copy.rate, copy.rateHint, true),
    actionLink(LINKS.comment, copy.comment, copy.commentHint, true),
    actionLink(LINKS.help, copy.help, copy.helpHint, false),
  );
  actions.append(actionList);
  const grid = h('div', { class: 'footer-grid' });
  grid.append(
    column(copy.explore, [
      { href: LINKS.labs, label: copy.labs },
      { href: LINKS.timeline, label: copy.timeline },
      { href: LINKS.gems, label: copy.gems },
    ]),
    column(copy.aboutCol, [
      { href: LINKS.about, label: copy.author },
      { href: LINKS.verify, label: copy.verify },
      { href: LINKS.changelog, label: copy.changelog },
    ]),
    column(copy.helpCol, [
      { href: LINKS.help, label: copy.contact },
      { href: LINKS.accessibility, label: copy.accessibility },
      { href: LINKS.privacy, label: copy.privacy },
    ]),
    socialColumn(copy),
  );
  const bar = h('div', { class: 'cml-footer__bar' });
  const legal = h('p');
  legal.append(
    copy.copyright,
    ' · ',
    h('a', { href: LINKS.mit, text: copy.licenseMit }),
    ' · ',
  );
  const cc = externalLink(LINKS.cc, copy.licenseCc);
  cc.setAttribute('rel', 'license noopener noreferrer');
  legal.append(cc);
  const top = h('button', { type: 'button', class: 'back-to-top', text: copy.backToTop });
  top.addEventListener('click', scrollToTop);
  bar.append(legal, top);
  inner.append(groundRules(copy), actions, grid, bar);
  footer.append(aurora, inner);
  return footer;
}

export function mountFooter(rootEl) {
  if (!rootEl) throw new Error('mountFooter: root element is required');
  let lang = document.documentElement.lang || 'en';
  const onSettings = (event) => {
    applySettingsDetail(event.detail);
    const next = document.documentElement.lang || lang;
    if (next !== lang) {
      lang = next;
      paint();
    }
  };
  function paint() {
    rootEl.replaceChildren(renderFooter(lang));
  }
  paint();
  window.addEventListener('cm:settings', onSettings);
  return replaceMount(rootEl, {
    destroy() {
      window.removeEventListener('cm:settings', onSettings);
      rootEl.replaceChildren();
    },
  });
}
