// Front-door link rule: anchors on index.html may point only to this site, GitHub (CypherMonkeyLabs org and the cipher0x9 profile), or the Linktree.
import { readFile } from 'node:fs/promises';

const ALLOWED = [
  /^#/, /^\//, /^\?/,
  /^https:\/\/cyphermonkeylabs\.com(\/|$)/,
  /^https:\/\/github\.com\/CypherMonkeyLabs(\/|$)/,
  /^https:\/\/github\.com\/cipher0x9\/?$/,
  /^https:\/\/linktr\.ee\/cyphermonkey\/?$/,
];
const files = ['index.html'];
let bad = 0;
for (const file of files) {
  const html = await readFile(file, 'utf8');
  for (const m of html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)) {
    if (!ALLOWED.some((re) => re.test(m[1]))) { console.error(`${file}: disallowed link ${m[1]}`); bad++; }
  }
}
if (bad) process.exit(1);
console.log('front-door links ok');
