import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const stroke = "#1E1B3A";
const fur = "#C89B7B";
const face = "#FBE3CF";

const props = {
  stargazer: `<g>
      <path d="M168 168l22-40" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
      <rect x="178" y="112" width="40" height="14" rx="7" transform="rotate(-32 178 112)" fill="#C9B8FF" stroke="${stroke}" stroke-width="3"/>
      <circle cx="166" cy="172" r="5" fill="#5B4BD6" stroke="${stroke}" stroke-width="3"/>
    </g>`,
  astronaut: `<g>
      <circle cx="124" cy="104" r="54" fill="#A7D8FF" fill-opacity=".35" stroke="${stroke}" stroke-width="3"/>
      <path d="M78 146h92" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="176" cy="70" r="8" fill="#FFE8A3" stroke="${stroke}" stroke-width="3"/>
    </g>`,
  "headset-helper": `<g>
      <path d="M90 108c0-26 14-40 34-40s34 14 34 40" fill="none" stroke="${stroke}" stroke-width="3"/>
      <rect x="76" y="100" width="14" height="22" rx="4" fill="#5B4BD6" stroke="${stroke}" stroke-width="3"/>
      <rect x="158" y="100" width="14" height="22" rx="4" fill="#5B4BD6" stroke="${stroke}" stroke-width="3"/>
      <path d="M172 122c10 8 8 20-2 26" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="166" cy="150" r="5" fill="#FFB4A2" stroke="${stroke}" stroke-width="3"/>
    </g>`,
  "signal-surfer": `<g>
      <path d="M16 206c18-14 28 14 46 0s28 14 46 0 28 14 46 0 28 14 46 0" fill="none" stroke="#9EE6CF" stroke-width="8" stroke-linecap="round"/>
      <path d="M16 206c18-14 28 14 46 0s28 14 46 0 28 14 46 0 28 14 46 0" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
    </g>`,
  "robo-buddy": `<g>
      <rect x="176" y="156" width="40" height="30" rx="8" fill="#C9B8FF" stroke="${stroke}" stroke-width="3"/>
      <circle cx="190" cy="170" r="3" fill="${stroke}"/>
      <circle cx="206" cy="170" r="3" fill="${stroke}"/>
      <path d="M192 156v-10" stroke="${stroke}" stroke-width="3"/>
      <circle cx="192" cy="142" r="5" fill="#FFE8A3" stroke="${stroke}" stroke-width="3"/>
    </g>`,
  bookworm: `<g>
      <circle cx="110" cy="108" r="14" fill="none" stroke="${stroke}" stroke-width="3"/>
      <circle cx="140" cy="108" r="14" fill="none" stroke="${stroke}" stroke-width="3"/>
      <path d="M124 108h4" stroke="${stroke}" stroke-width="3"/>
      <rect x="36" y="176" width="32" height="8" fill="#FFB4A2" stroke="${stroke}" stroke-width="3"/>
      <rect x="40" y="168" width="32" height="8" fill="#A7D8FF" stroke="${stroke}" stroke-width="3"/>
      <rect x="34" y="160" width="32" height="8" fill="#FFE8A3" stroke="${stroke}" stroke-width="3"/>
    </g>`,
  "gem-collector": `<g>
      <circle cx="188" cy="156" r="16" fill="none" stroke="${stroke}" stroke-width="3"/>
      <path d="M200 168l16 18" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
      <path d="M40 186l16-28 14 20 10-16 14 24H40z" fill="#C9B8FF" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
    </g>`,
  inventor: `<g>
      <rect x="98" y="98" width="20" height="14" rx="6" fill="#9EE6CF" stroke="${stroke}" stroke-width="3"/>
      <rect x="126" y="98" width="20" height="14" rx="6" fill="#9EE6CF" stroke="${stroke}" stroke-width="3"/>
      <path d="M118 105h8" stroke="${stroke}" stroke-width="3"/>
      <path d="M178 176l24 20" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="176" cy="174" r="7" fill="none" stroke="${stroke}" stroke-width="3"/>
      <path d="M200 196l8 4" stroke="#FFE8A3" stroke-width="3" stroke-linecap="round"/>
    </g>`,
  dreamer: `<g>
      <path d="M28 188a26 26 0 1 0 22-44 20 20 0 1 1-22 44z" fill="#FFE8A3" stroke="${stroke}" stroke-width="3"/>
    </g>`,
  party: `<g>
      <path d="M108 78l16-30 16 30z" fill="#FFC6E0" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="124" cy="44" r="4" fill="#FFE8A3" stroke="${stroke}" stroke-width="3"/>
    </g>`,
};

const fx = {
  dreamer: `<text x="168" y="70" fill="${stroke}" font-size="16" font-family="sans-serif">z</text><text x="184" y="54" fill="${stroke}" font-size="14" font-family="sans-serif">z</text><text x="198" y="40" fill="${stroke}" font-size="12" font-family="sans-serif">z</text>`,
  party: `<circle cx="40" cy="40" r="4" fill="#FFB4A2"/><circle cx="70" cy="28" r="3" fill="#A7D8FF"/><circle cx="190" cy="36" r="4" fill="#FFE8A3"/><circle cx="210" cy="60" r="3" fill="#C9B8FF"/><circle cx="30" cy="70" r="3" fill="#9EE6CF"/>`,
};

function svg(prop, extra) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
  <g id="fx">${extra}</g>
  <g id="tail">
    <path d="M82 176c-30 10-48 36-34 52 10 12 28 4 30-10 2-14-10-24-6-36" fill="none" stroke="${fur}" stroke-width="10" stroke-linecap="round"/>
    <path d="M82 176c-30 10-48 36-34 52 10 12 28 4 30-10 2-14-10-24-6-36" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
  </g>
  <g id="body">
    <rect x="96" y="150" width="62" height="52" rx="16" fill="#A7D8FF" stroke="${stroke}" stroke-width="3"/>
    <rect x="104" y="160" width="16" height="12" rx="3" fill="#FFE8A3" stroke="${stroke}" stroke-width="3"/>
    <ellipse cx="126" cy="176" rx="34" ry="30" fill="${fur}" stroke="${stroke}" stroke-width="3"/>
    <ellipse cx="126" cy="182" rx="16" ry="14" fill="${face}" stroke="${stroke}" stroke-width="3"/>
  </g>
  <g id="arm-l">
    <path d="M100 164c-24 10-30 28-16 36" fill="none" stroke="${fur}" stroke-width="12" stroke-linecap="round"/>
    <path d="M100 164c-24 10-30 28-16 36" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="82" cy="202" r="7" fill="${face}" stroke="${stroke}" stroke-width="3"/>
  </g>
  <g id="arm-r">
    <path d="M152 160c26-4 34 12 30 26" fill="none" stroke="${fur}" stroke-width="12" stroke-linecap="round"/>
    <path d="M152 160c26-4 34 12 30 26" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="184" cy="186" r="7" fill="${face}" stroke="${stroke}" stroke-width="3"/>
  </g>
  <g id="head">
    <circle cx="80" cy="112" r="16" fill="${fur}" stroke="${stroke}" stroke-width="3"/>
    <circle cx="172" cy="112" r="16" fill="${fur}" stroke="${stroke}" stroke-width="3"/>
    <circle cx="80" cy="112" r="8" fill="${face}"/>
    <circle cx="172" cy="112" r="8" fill="${face}"/>
    <circle cx="126" cy="104" r="42" fill="${fur}" stroke="${stroke}" stroke-width="3"/>
    <ellipse cx="126" cy="114" rx="28" ry="24" fill="${face}" stroke="${stroke}" stroke-width="3"/>
    <path d="M126 58l7 14 14 2-11 9 3 14-13-8-13 8 3-14-11-9 14-2z" fill="#FFE8A3" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
    <g id="eye-l">
      <ellipse cx="112" cy="110" rx="8" ry="9" fill="#fff" stroke="${stroke}" stroke-width="3"/>
      <g id="pupil-l"><circle cx="114" cy="112" r="3" fill="${stroke}"/></g>
      <g id="lid-l"><rect x="103" y="101" width="18" height="18" rx="8" fill="${fur}"/></g>
    </g>
    <g id="eye-r">
      <ellipse cx="142" cy="110" rx="8" ry="9" fill="#fff" stroke="${stroke}" stroke-width="3"/>
      <g id="pupil-r"><circle cx="144" cy="112" r="3" fill="${stroke}"/></g>
      <g id="lid-r"><rect x="133" y="101" width="18" height="18" rx="8" fill="${fur}"/></g>
    </g>
    <g id="mouth"><path d="M116 126c6 8 16 8 22 0" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/></g>
  </g>
  <g id="prop">${prop}</g>
</svg>
`;
}

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "../../assets/mascot");
await mkdir(outDir, { recursive: true });
for (const [id, prop] of Object.entries(props)) {
  await writeFile(join(outDir, `${id}.svg`), svg(prop, fx[id] || ""), "utf8");
}
console.log(`wrote ${Object.keys(props).length} mascots`);
