import { LINKS } from './copy.js';

export function buildPublicIssueUrl(value) {
  const name = String(value.name || '').replace(/[\r\n]+/g, ' ').slice(0, 80);
  const topic = String(value.topic || 'general').replace(/[\r\n]+/g, ' ');
  const lab = String(value.lab || '').replace(/[\r\n]+/g, ' ');
  const message = String(value.message || '');
  const title = `[CML] ${topic}${lab ? ` · ${lab}` : ''} from ${name}`.slice(0, 180);
  const body = [
    message,
    '',
    `— ${name}`,
    `Topic: ${topic}`,
    `Lab: ${lab || 'n/a'}`,
    '',
    'Started from cyphermonkeylabs.com. The sender email address was not included, because GitHub issues are public.',
  ].join('\n');
  let url = `${LINKS.issueNew}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  if (url.length > 7000) url = LINKS.issueNew;
  const secret = String(value.email || '');
  if (secret && decodeURIComponent(url).toLowerCase().includes(secret.toLowerCase())) {
    throw new Error('refusing to publish an address');
  }
  return url;
}
