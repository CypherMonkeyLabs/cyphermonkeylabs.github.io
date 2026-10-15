function encodeHeader(value) {
  const clean = String(value).replace(/[\r\n]+/g, ' ');
  if (/^[\x20-\x7E]*$/.test(clean)) return clean;
  const bytes = new TextEncoder().encode(clean);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `=?UTF-8?B?${btoa(binary)}?=`;
}

function base64Body(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const raw = btoa(binary);
  return raw.replace(/.{1,76}/g, '$&\r\n').trim();
}

function assertHeader(value, label) {
  const text = String(value ?? '');
  if (!text || /[\r\n]/.test(text)) throw new Error(`unsafe ${label}`);
  return text;
}

export function buildPlainMessage({ fromName, fromAddr, toAddr, replyTo, subject, text }) {
  const from = assertHeader(fromAddr, 'from');
  const to = assertHeader(toAddr, 'to');
  const reply = assertHeader(replyTo, 'reply-to');
  const lines = [
    'MIME-Version: 1.0',
    `Date: ${new Date().toUTCString()}`,
    `From: ${encodeHeader(fromName || 'CML Mission Control')} <${from}>`,
    `To: ${to}`,
    `Reply-To: ${reply}`,
    `Subject: ${encodeHeader(subject || 'Message')}`,
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    base64Body(String(text ?? '')),
  ];
  return lines.join('\r\n');
}
