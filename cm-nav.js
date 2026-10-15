/* Generated from labs.json and site.json. Do not edit by hand. */
const LABS = [
  {
    "id": "uc",
    "name": "UC Lab",
    "url": "https://cyphermonkeylabs.com/uc-lab-free-university-mesmerizing/",
    "source": "https://github.com/CypherMonkeyLabs/uc-lab-free-university-mesmerizing",
    "status": "live"
  },
  {
    "id": "ai",
    "name": "AI Lab",
    "url": "https://cyphermonkeylabs.com/ai-lab-free-university-mesmerizing/",
    "source": "https://github.com/CypherMonkeyLabs/ai-lab-free-university-mesmerizing",
    "status": "live"
  },
  {
    "id": "amazon-connect",
    "name": "Amazon Connect Lab",
    "url": "https://cyphermonkeylabs.com/amazon-connect-lab-free-university-mesmerizing/",
    "source": "https://github.com/CypherMonkeyLabs/amazon-connect-lab-free-university-mesmerizing",
    "status": "live"
  },
  {
    "id": "microsoft-voice",
    "name": "Microsoft Voice & Contact Center Lab",
    "url": "https://cyphermonkeylabs.com/microsoft-voice-cc-lab-free-university-mesmerizing/",
    "source": "https://github.com/CypherMonkeyLabs/microsoft-voice-cc-lab-free-university-mesmerizing",
    "status": "live"
  },
  {
    "id": "five9",
    "name": "Five9 Lab",
    "url": "https://cyphermonkeylabs.com/five9-lab-free-university-mesmerizing/",
    "source": "https://github.com/CypherMonkeyLabs/five9-lab-free-university-mesmerizing",
    "status": "live"
  },
  {
    "id": "genesys",
    "name": "Genesys Cloud Lab",
    "url": "https://cyphermonkeylabs.com/genesys-cloud-lab-free-university-mesmerizing/",
    "source": "https://github.com/CypherMonkeyLabs/genesys-cloud-lab-free-university-mesmerizing",
    "status": "live"
  },
  {
    "id": "nice",
    "name": "NICE CXone Lab",
    "url": "https://cyphermonkeylabs.com/nice-cxone-lab-free-university-mesmerizing/",
    "source": "https://github.com/CypherMonkeyLabs/nice-cxone-lab-free-university-mesmerizing",
    "status": "live"
  },
  {
    "id": "sip",
    "name": "SIP Universe",
    "url": "https://cyphermonkeylabs.com/sip-universe-lab-free-university-mesmerizing/",
    "source": "https://github.com/CypherMonkeyLabs/sip-universe-lab-free-university-mesmerizing",
    "status": "live"
  },
  {
    "id": "gems",
    "name": "Gemini Gems gallery",
    "url": "https://cipher0x9.github.io/gemini-gems-free-gallery/",
    "source": "https://github.com/cipher0x9/gemini-gems-free-gallery",
    "status": "live"
  },
  {
    "id": "canon",
    "name": "CypherWebex Canon",
    "url": "https://cypherwebex-canon-test.vercel.app",
    "source": "",
    "status": "live"
  },
  {
    "id": "gcp-cc",
    "name": "Google Cloud Contact Center",
    "url": "",
    "source": "",
    "status": "coming"
  },
  {
    "id": "languages",
    "name": "Languages",
    "url": "",
    "source": "",
    "status": "coming"
  },
  {
    "id": "coding",
    "name": "Coding",
    "url": "",
    "source": "",
    "status": "coming"
  }
];
const DEFAULTS = {
  "home": "https://cyphermonkeylabs.com/",
  "contact": "https://github.com/CypherMonkeyLabs/cyphermonkeylabs.github.io/issues/new"
};

const THEMES = {
  canopy: ['#10211b', '#e8f6ef', '#d6ff4a', '#142006', 'rgba(214,255,74,.35)', '#b7d2c6'],
  market: ['#24102a', '#f8e9ff', '#ff4ecd', '#2a0618', 'rgba(255,78,205,.4)', '#e3c6ea'],
  ice: ['#0c1c28', '#e7f7ff', '#7ee7ff', '#042028', 'rgba(126,231,255,.4)', '#c5e4f2'],
  amber: ['#271c10', '#fff3df', '#ffb020', '#2a1604', 'rgba(255,176,32,.45)', '#f0ddc4'],
  paper: ['#fffdf8', '#14211c', '#0c6b4a', '#ffffff', 'rgba(20,33,28,.16)', '#3d5248'],
};

const CSS = `
:host { display: block; color: var(--cm-text, #e8f6ef); background: var(--cm-bg, #10211b); font-family: "Segoe UI", "Helvetica Neue", sans-serif; }
:host([theme="canopy"]) { --cm-bg:#10211b; --cm-text:#e8f6ef; --cm-accent:#d6ff4a; --cm-ink:#142006; --cm-line:rgba(214,255,74,.35); --cm-muted:#b7d2c6; }
:host([theme="market"]) { --cm-bg:#24102a; --cm-text:#f8e9ff; --cm-accent:#ff4ecd; --cm-ink:#2a0618; --cm-line:rgba(255,78,205,.4); --cm-muted:#e3c6ea; }
:host([theme="ice"]) { --cm-bg:#0c1c28; --cm-text:#e7f7ff; --cm-accent:#7ee7ff; --cm-ink:#042028; --cm-line:rgba(126,231,255,.4); --cm-muted:#c5e4f2; }
:host([theme="amber"]) { --cm-bg:#271c10; --cm-text:#fff3df; --cm-accent:#ffb020; --cm-ink:#2a1604; --cm-line:rgba(255,176,32,.45); --cm-muted:#f0ddc4; }
:host([theme="paper"]) { --cm-bg:#fffdf8; --cm-text:#14211c; --cm-accent:#0c6b4a; --cm-ink:#ffffff; --cm-line:rgba(20,33,28,.16); --cm-muted:#3d5248; }
.bar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 8px; }
.mark { width: 28px; height: 28px; flex: none; }
label { display: grid; gap: 2px; font-size: 0.75rem; color: var(--cm-muted); }
select, a, button { min-height: 44px; display: inline-flex; align-items: center; padding: 0 12px; border-radius: 999px; border: 1px solid var(--cm-line); background: transparent; color: var(--cm-text); font: inherit; font-size: 0.95rem; text-decoration: none; }
select { background: var(--cm-bg); }
.home { background: var(--cm-accent); color: var(--cm-ink); border-color: transparent; font-weight: 700; }
button:disabled { color: var(--cm-muted); cursor: not-allowed; }
.status { flex-basis: 100%; margin: 0; color: var(--cm-muted); }
:focus { outline: none; }
:focus-visible { outline: 3px solid var(--cm-accent); outline-offset: 2px; }
`;

class CmNav extends HTMLElement {
  static get observedAttributes() {
    return ['theme', 'lab', 'home', 'source', 'download', 'contact'];
  }

  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
    if ('adoptedStyleSheets' in Document.prototype) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(CSS);
      this._root.adoptedStyleSheets = [sheet];
    }
  }

  connectedCallback() {
    if (!this.hasAttribute('theme')) this.setAttribute('theme', 'canopy');
    this._render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this._render();
  }

  _render() {
    const theme = THEMES[this.getAttribute('theme') || 'canopy'] ? this.getAttribute('theme') : 'canopy';
    if (this.getAttribute('theme') !== theme) this.setAttribute('theme', theme);
    const home = this.getAttribute('home') || DEFAULTS.home;
    const contact = this.getAttribute('contact') || DEFAULTS.contact;
    const selected = LABS.find((lab) => lab.id === this.getAttribute('lab')) || LABS.find((lab) => lab.status === 'live');
    const source = this.getAttribute('source') || (selected && selected.source) || '';
    const download = this.getAttribute('download') || '';

    const bar = document.createElement('nav');
    bar.className = 'bar';
    bar.setAttribute('aria-label', 'Lab bar');

    const mark = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mark.setAttribute('class', 'mark');
    mark.setAttribute('viewBox', '0 0 32 32');
    mark.setAttribute('aria-hidden', 'true');
    mark.innerHTML = '<circle cx="16" cy="17" r="7" fill="none" stroke="currentColor" stroke-width="2"></circle><circle cx="9" cy="14" r="3.2" fill="none" stroke="currentColor" stroke-width="2"></circle><circle cx="23" cy="14" r="3.2" fill="none" stroke="currentColor" stroke-width="2"></circle>';

    const label = document.createElement('label');
    label.append('Lab');
    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Choose a lab');
    const open = document.createElement('optgroup');
    open.label = 'Open';
    const soon = document.createElement('optgroup');
    soon.label = 'Coming soon';
    for (const lab of LABS) {
      const option = document.createElement('option');
      option.value = lab.id;
      option.textContent = lab.name;
      if (selected && lab.id === selected.id) option.selected = true;
      (lab.status === 'live' ? open : soon).append(option);
    }
    select.append(open, soon);
    label.append(select);

    const homeLink = document.createElement('a');
    homeLink.className = 'home';
    homeLink.href = home;
    homeLink.textContent = 'Home';

    const sourceLink = this._linkOrDisabled(source, 'View source', 'This lab has no public source link yet.');
    const downloadLink = this._linkOrDisabled(download, 'Download offline', 'This lab has not published an offline pack.');
    if (download) downloadLink.setAttribute('download', '');

    const contactLink = document.createElement('a');
    contactLink.href = contact;
    contactLink.textContent = 'Contact';

    const status = document.createElement('p');
    status.className = 'status';
    status.setAttribute('role', 'status');

    select.addEventListener('change', () => {
      const lab = LABS.find((item) => item.id === select.value);
      if (!lab) return;
      if (lab.status !== 'live' || !lab.url) {
        status.textContent = `${lab.name} is not open yet.`;
        return;
      }
      window.location.href = lab.url;
    });

    bar.append(mark, label, homeLink, sourceLink, downloadLink, contactLink, status);
    this._root.replaceChildren(bar);
  }

  _linkOrDisabled(href, text, reason) {
    if (!href) {
      const button = document.createElement('button');
      button.type = 'button';
      button.disabled = true;
      button.textContent = text;
      button.title = reason;
      return button;
    }
    const link = document.createElement('a');
    link.href = href;
    link.textContent = text;
    return link;
  }
}

if (!customElements.get('cm-nav')) customElements.define('cm-nav', CmNav);
