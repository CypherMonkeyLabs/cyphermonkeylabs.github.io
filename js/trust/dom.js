export function h(tag, attrs, children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value == null || value === false) continue;
    if (key === 'class') node.className = String(value);
    else if (key === 'text') node.textContent = String(value);
    else if (key === 'dataset' && value && typeof value === 'object') Object.assign(node.dataset, value);
    else node.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of children || []) appendChild(node, child);
  return node;
}

export function appendChild(node, child) {
  if (child == null || child === false) return;
  if (typeof child === 'string') node.append(document.createTextNode(child));
  else node.append(child);
}

export function hiddenSpan(text) {
  return h('span', { class: 'visually-hidden', text });
}

export function externalLink(href, label) {
  const link = h('a', { href, rel: 'noopener noreferrer', target: '_blank' });
  link.append(document.createTextNode(label), hiddenSpan(' (opens new tab)'));
  return link;
}

export function svgInfo() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 32 32');
  svg.setAttribute('width', '32');
  svg.setAttribute('height', '32');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '16');
  circle.setAttribute('cy', '16');
  circle.setAttribute('r', '13');
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', 'currentColor');
  circle.setAttribute('stroke-width', '2');
  const stem = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  stem.setAttribute('d', 'M16 14.5v8');
  stem.setAttribute('fill', 'none');
  stem.setAttribute('stroke', 'currentColor');
  stem.setAttribute('stroke-width', '2');
  stem.setAttribute('stroke-linecap', 'round');
  const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  dot.setAttribute('cx', '16');
  dot.setAttribute('cy', '10');
  dot.setAttribute('r', '1.5');
  dot.setAttribute('fill', 'currentColor');
  svg.append(circle, stem, dot);
  return svg;
}
