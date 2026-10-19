/**
 * Globe links stay inside the labs' allowed destinations.
 * External http is dropped. Same-origin http is kept so local previews work.
 */

function allowedExternal(url) {
  const host = url.hostname.toLowerCase();
  if (host === 'cyphermonkeylabs.com' || host.endsWith('.cyphermonkeylabs.com')) return true;
  if (host === 'github.com' || host === 'www.github.com') {
    const owner = url.pathname.split('/').filter(Boolean)[0] || '';
    return owner.toLowerCase() === 'cyphermonkeylabs';
  }
  if (host === 'linktr.ee' || host === 'www.linktr.ee') {
    const name = url.pathname.split('/').filter(Boolean)[0] || '';
    return name.toLowerCase() === 'cyphermonkey';
  }
  return false;
}

export function safeUrl(value, baseHref) {
  if (typeof value !== 'string' || !value.trim()) return '';
  const base = baseHref || 'https://cyphermonkeylabs.com/';
  let url;
  try {
    url = new URL(value, base);
  } catch (err) {
    return '';
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
  let baseUrl;
  try {
    baseUrl = new URL(base);
  } catch (err) {
    return '';
  }
  if (url.origin === baseUrl.origin) return url.href;
  const host = url.hostname.toLowerCase();
  if (url.protocol === 'http:' && host !== 'localhost' && host !== '127.0.0.1') return '';
  if (!allowedExternal(url)) return '';
  return url.href;
}
