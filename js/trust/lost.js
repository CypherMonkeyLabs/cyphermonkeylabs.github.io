import { h, hiddenSpan } from './dom.js';
import { loadLabs, vendorLine } from './labs.js';

function isOpen(lab) {
  return lab.status === 'live' || lab.status === 'beta';
}

function card(lab) {
  const article = h('article', { class: 'lab-card' });
  article.append(h('h3', { text: lab.title }));
  const vendors = vendorLine(lab);
  if (vendors) article.append(h('p', { class: 'lab-card__note', text: `Not affiliated with ${vendors}.` }));
  const links = h('p', { class: 'lab-card__links' });
  if (isOpen(lab) && lab.url) {
    const open = h('a', { href: lab.url, rel: 'noopener noreferrer', target: '_blank' });
    open.append('Open lab', hiddenSpan(`: ${lab.title} (opens new tab)`));
    links.append(open);
  } else {
    links.append(h('span', { class: 'soon', text: 'Not open yet' }));
  }
  if (lab.repo) {
    const repo = h('a', { href: lab.repo, rel: 'noopener noreferrer', target: '_blank' });
    repo.append('View repo', hiddenSpan(`: ${lab.title} (opens new tab)`));
    links.append(repo);
  }
  article.append(links);
  return article;
}

export function mountLost(rootEl) {
  if (!rootEl) throw new Error('mountLost: root element is required');
  const search = h('div', { class: 'lost-search' });
  const input = h('input', { id: 'lost-search', type: 'search', autocomplete: 'off' });
  const status = h('p', { id: 'lost-status', class: 'hint', 'aria-live': 'polite' });
  search.append(h('label', { for: 'lost-search', text: 'Search labs' }), input, status);
  const list = h('div', { id: 'lost-labs', class: 'lab-list' });
  rootEl.replaceChildren(search, list);
  let labs = [];

  function render(query) {
    const needle = query.trim().toLowerCase();
    const matched = labs.filter((lab) => !needle || `${lab.title} ${lab.id}`.toLowerCase().includes(needle));
    list.replaceChildren(...matched.map(card));
    status.textContent = matched.length === 1 ? '1 lab' : `${matched.length} labs`;
  }

  input.addEventListener('input', () => render(input.value));
  const pending = loadLabs().then((rows) => {
    labs = rows;
    render('');
  });
  return { destroy() { rootEl.replaceChildren(); }, ready: pending };
}
