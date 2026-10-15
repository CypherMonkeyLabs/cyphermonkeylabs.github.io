import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFileSync(join(root, path), "utf8");
const labs = JSON.parse(read("data/labs.json")).labs;
const timeline = JSON.parse(read("data/timeline.json")).events;
const gems = JSON.parse(read("data/gems.json")).gems;
const html = read("index.html");
const today = "2026-10-15";

const ids = new Set();
for (const lab of labs) {
  assert.equal(ids.has(lab.id), false, lab.id);
  ids.add(lab.id);
  assert.match(lab.url, /^https:\/\/(?:cyphermonkeylabs\.com\/[A-Za-z0-9._-]+|cipher0x9\.github\.io\/gemini-gems-free-gallery)(?:\/|$)/);
  assert.match(lab.repo, /^https:\/\/github\.com\/(?:CypherMonkeyLabs\/[A-Za-z0-9._-]+|cipher0x9\/gemini-gems-free-gallery)$/);
  const repoName = lab.repo.split("/").pop();
  const pagesName = new URL(lab.url).pathname.split("/").filter(Boolean)[0];
  assert.equal(pagesName.toLowerCase(), repoName.toLowerCase());
  assert.ok(lab.launchedAt <= today);
  assert.ok(lab.sources.length >= 1);
  assert.ok(html.includes(lab.url), lab.url);
  assert.ok(html.includes(lab.repo), lab.repo);
}

assert.equal(labs.length, 10);
for (const event of timeline) {
  assert.equal(event.review, "verified");
  assert.ok(event.sources.length >= 1);
}
assert.equal(gems.length, 33);
for (const gem of gems) {
  assert.match(gem.link, /^https:\/\/gemini\.google\.com\//);
  assert.match(gem.desk, /^https:\/\/cipher0x9\.github\.io\/gemini-gems-free-gallery\/gems\//);
  assert.equal(gem.requires, "Google account");
}

const banned = ["mailto:", "research@"];
for (const file of ["index.html", "css/content.css", "js/content/assemble.mjs", "data/labs.json", "data/site.json", "data/author.json"]) {
  const text = read(file);
  for (const word of banned) assert.equal(text.toLowerCase().includes(word), false, `${word} in ${file}`);
}
assert.equal(html.includes('href="#"'), false);
assert.equal(/<a[^>]*>[^<]*LinkedIn/i.test(html), false);

function syllables(word) {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleaned) return 0;
  const groups = cleaned.match(/[aeiouy]+/g);
  let count = groups ? groups.length : 1;
  if (cleaned.endsWith("e") && count > 1) count -= 1;
  return Math.max(1, count);
}
function grade(text) {
  const sentences = text.split(/[.!?]+/).filter((part) => part.trim()).length || 1;
  const words = text.split(/\s+/).filter(Boolean);
  const syll = words.reduce((sum, word) => sum + syllables(word), 0);
  return 0.39 * (words.length / sentences) + 11.8 * (syll / words.length) - 15.59;
}
const hero = "How does the world talk? Let's find out. Free labs for curious minds: contact centers, voice, SIP, and AI.";
const heroGrade = grade(hero);
console.log("hero grade", heroGrade.toFixed(2));
assert.ok(heroGrade <= 8, heroGrade);
console.log("content checks passed");
