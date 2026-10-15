function e(){let e=document.createElement(`template`);e.innerHTML=`<svg class="monkey-svg" viewBox="0 0 240 280" role="img" aria-label="CypherMonkey, the studio mascot, dancing">
  <g class="tail">
    <path d="M156 188c28 8 46-14 38-38-8-22 16-34 28-18" fill="none" stroke="#146454" stroke-width="12" stroke-linecap="round"/>
  </g>
  <g class="leg-l">
    <ellipse cx="96" cy="224" rx="16" ry="24" fill="#146454"/>
    <ellipse cx="92" cy="248" rx="18" ry="9" fill="#1c7d68"/>
  </g>
  <g class="leg-r">
    <ellipse cx="146" cy="224" rx="16" ry="24" fill="#146454"/>
    <ellipse cx="150" cy="248" rx="18" ry="9" fill="#1c7d68"/>
  </g>
  <g class="arm-l">
    <path d="M78 148c-22 10-30 40-16 58" fill="none" stroke="#1c7d68" stroke-width="18" stroke-linecap="round"/>
    <circle cx="58" cy="210" r="13" fill="#1c7d68"/>
  </g>
  <g class="arm-r">
    <path d="M164 148c22 10 30 40 16 58" fill="none" stroke="#1c7d68" stroke-width="18" stroke-linecap="round"/>
    <circle cx="186" cy="210" r="13" fill="#1c7d68"/>
  </g>
  <ellipse cx="120" cy="176" rx="56" ry="52" fill="#1c7d68"/>
  <ellipse cx="120" cy="188" rx="30" ry="28" fill="#f2d2ae"/>
  <circle cx="120" cy="158" r="7" fill="#d6ff4a"/>
  <g class="head">
    <ellipse cx="58" cy="100" rx="24" ry="28" fill="#1c7d68"/>
    <ellipse cx="182" cy="100" rx="24" ry="28" fill="#1c7d68"/>
    <ellipse cx="58" cy="102" rx="12" ry="16" fill="#e7a090"/>
    <ellipse cx="182" cy="102" rx="12" ry="16" fill="#e7a090"/>
    <circle cx="120" cy="96" r="52" fill="#1c7d68"/>
    <ellipse cx="120" cy="112" rx="28" ry="20" fill="#f2d2ae"/>
    <ellipse cx="120" cy="106" rx="9" ry="6" fill="#5c3a32"/>
    <g class="eye-l">
      <circle cx="100" cy="90" r="9" fill="#f7f4ef"/>
      <circle cx="102" cy="91" r="4" fill="#241814"/>
    </g>
    <g class="eye-r">
      <circle cx="140" cy="90" r="9" fill="#f7f4ef"/>
      <circle cx="142" cy="91" r="4" fill="#241814"/>
    </g>
    <path d="M104 124c8 8 24 8 32 0" fill="none" stroke="#5c3a32" stroke-width="3" stroke-linecap="round"/>
    <path d="M76 78c12-30 76-30 88 0" fill="none" stroke="#d6ff4a" stroke-width="7" stroke-linecap="round"/>
  </g>
</svg>`;let t=e.content.firstElementChild;if(!(t instanceof SVGElement))throw Error(`Mascot art did not build`);return t}export{e as t};