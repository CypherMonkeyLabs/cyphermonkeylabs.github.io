/**
 * Stub catalog for /nav-demo.html.
 * The twelve published entries use the real lab URLs.
 * makeScaleLabs() adds clearly labeled samples so the menu can be tried at 100 labs.
 */

const starter = [
  {
    id: "uc",
    title: "UC Lab",
    shortTitle: "UC Lab",
    summary: "Practice rooms for calling, meetings, and collaboration.",
    category: "unified-comms",
    tags: ["uc", "calling", "meetings", "collaboration"],
    status: "live",
    order: 2,
    url: "https://cyphermonkeylabs.com/uc-lab-free-university-mesmerizing/",
    repo: "https://github.com/CypherMonkeyLabs/uc-lab-free-university-mesmerizing",
  },
  {
    id: "ai",
    title: "AI Lab",
    shortTitle: "AI Lab",
    summary: "Practice rooms for prompts, models, and how AI tools behave.",
    category: "ai",
    tags: ["ai", "prompts", "models"],
    status: "live",
    order: 1,
    url: "https://cyphermonkeylabs.com/ai-lab-free-university-mesmerizing/",
    repo: "https://github.com/CypherMonkeyLabs/ai-lab-free-university-mesmerizing",
  },
  {
    id: "amazon-connect",
    title: "Amazon Connect Lab",
    shortTitle: "Amazon Connect",
    summary: "A walkthrough lab for the Amazon Connect contact center.",
    category: "contact-center",
    tags: ["amazon connect", "contact center", "cloud"],
    status: "live",
    order: 2,
    url: "https://cyphermonkeylabs.com/amazon-connect-lab-free-university-mesmerizing/",
    repo: "https://github.com/CypherMonkeyLabs/amazon-connect-lab-free-university-mesmerizing",
  },
  {
    id: "microsoft-voice",
    title: "Microsoft Voice & Contact Center Lab",
    shortTitle: "Microsoft Voice",
    summary: "Practice rooms for Microsoft voice and contact-center ideas.",
    category: "unified-comms",
    tags: ["microsoft", "voice", "contact center"],
    status: "live",
    order: 3,
    url: "https://cyphermonkeylabs.com/microsoft-voice-cc-lab-free-university-mesmerizing/",
    repo: "https://github.com/CypherMonkeyLabs/microsoft-voice-cc-lab-free-university-mesmerizing",
  },
  {
    id: "five9",
    title: "Five9 Lab",
    shortTitle: "Five9",
    summary: "A lab for exploring how a Five9 contact center fits together.",
    category: "contact-center",
    tags: ["five9", "contact center"],
    status: "live",
    order: 3,
    url: "https://cyphermonkeylabs.com/five9-lab-free-university-mesmerizing/",
    repo: "https://github.com/CypherMonkeyLabs/five9-lab-free-university-mesmerizing",
  },
  {
    id: "genesys",
    title: "Genesys Cloud Lab",
    shortTitle: "Genesys Cloud",
    summary: "A lab for exploring Genesys Cloud contact-center ideas.",
    category: "contact-center",
    tags: ["genesys", "cloud", "contact center"],
    status: "live",
    order: 4,
    url: "https://cyphermonkeylabs.com/genesys-cloud-lab-free-university-mesmerizing/",
    repo: "https://github.com/CypherMonkeyLabs/genesys-cloud-lab-free-university-mesmerizing",
  },
  {
    id: "nice",
    title: "NICE CXone Lab",
    shortTitle: "NICE CXone",
    summary: "A lab for exploring NICE CXone contact-center ideas.",
    category: "contact-center",
    tags: ["nice", "cxone", "contact center"],
    status: "live",
    order: 5,
    url: "https://cyphermonkeylabs.com/nice-cxone-lab-free-university-mesmerizing/",
    repo: "https://github.com/CypherMonkeyLabs/nice-cxone-lab-free-university-mesmerizing",
  },
  {
    id: "sip",
    title: "SIP Universe",
    shortTitle: "SIP Universe",
    summary: "See how phone calls move across the internet with SIP.",
    category: "protocols",
    tags: ["sip", "calling", "protocol"],
    status: "live",
    order: 1,
    url: "https://cyphermonkeylabs.com/sip-universe-lab-free-university-mesmerizing/",
    repo: "https://github.com/CypherMonkeyLabs/sip-universe-lab-free-university-mesmerizing",
    i18n: {
      es: {
        title: "Universo SIP",
        summary: "Mira cómo las llamadas viajan por internet con SIP.",
      },
    },
  },
  {
    id: "gems",
    title: "Gemini Gems gallery",
    shortTitle: "Gemini Gems",
    summary: "A gallery of Gemini Gem examples you can open and study.",
    category: "tools",
    kind: "gallery",
    tags: ["gemini", "gems", "ai", "gallery"],
    status: "live",
    order: 1,
    url: "/gemini-gems-free-gallery/",
    repo: "https://github.com/cipher0x9/gemini-gems-free-gallery",
  },
  {
    id: "canon",
    title: "CypherWebex Canon",
    shortTitle: "Canon",
    summary: "Flagship Webex lab with 63 rooms, navigation, and live flows.",
    category: "unified-comms",
    tags: ["webex", "canon", "flagship", "rooms", "flows"],
    status: "live",
    featured: true,
    order: 1,
    url: "https://cypherwebex-canon-test.vercel.app",
  },
  {
    id: "gcp-cc",
    title: "Google Cloud Contact Center",
    shortTitle: "Google Cloud",
    summary: "A lab for Google Cloud contact-center ideas. Not open yet.",
    category: "contact-center",
    tags: ["google", "cloud", "contact center"],
    status: "coming",
    order: 6,
  },
  {
    id: "languages",
    title: "Languages",
    shortTitle: "Languages",
    summary: "Practice rooms for Sanskrit, Telugu, Arabic, and English. Not open yet.",
    category: "languages",
    tags: ["languages", "sanskrit", "telugu", "arabic", "english"],
    status: "coming",
    order: 1,
  },
  {
    id: "coding",
    title: "Coding",
    shortTitle: "Coding",
    summary: "Practice rooms for CS50 ideas, Python, and DevOps. Not open yet.",
    category: "coding",
    tags: ["coding", "cs50", "python", "devops"],
    status: "coming",
    order: 1,
  },
];

export const demoCatalog = { labs: starter };

const SAMPLE_CATEGORIES = [
  "contact-center",
  "unified-comms",
  "protocols",
  "ai",
  "tools",
  "languages",
  "coding",
];

export function makeScaleLabs(count = 100) {
  const labs = [];
  const total = Math.max(0, Number(count) || 0);
  for (let i = 1; i <= total; i += 1) {
    const n = String(i).padStart(3, "0");
    const category = SAMPLE_CATEGORIES[(i - 1) % SAMPLE_CATEGORIES.length];
    const soon = i % 11 === 0;
    labs.push({
      id: `sample-${n}`,
      title: `Sample lab ${n}`,
      shortTitle: `Sample ${n}`,
      summary: "Sample data so the menu can be tried at full size. This is not a real course.",
      category,
      tags: ["sample", category],
      status: soon ? "coming-soon" : "live",
      order: i,
      featured: false,
      url: soon ? "" : `https://cyphermonkeylabs.com/sample-lab-${n}/`,
      repo: soon ? "" : `https://github.com/CypherMonkeyLabs/sample-lab-${n}`,
    });
  }
  return { labs };
}
