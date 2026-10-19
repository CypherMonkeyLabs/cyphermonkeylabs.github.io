export const fetched = "2026-10-19";

export const sisters = [
  {
    id: "wfm",
    title: "Workforce management",
    short: "WFM",
    glossary: "Workforce management on this map means forecasting, scheduling, and adherence where a lab actually uses those words. Amazon Connect's README lists forecasting, capacity, and schedules, plus native and third-party WFM. Genesys Cloud's README covers workforce management and a forecasting chapter. Five9's README says its workforce calculator is Erlang C, not Five9's engine. Microsoft's ecosystem track names workforce management. NICE's published manifest has tracks named Workforce management and Workforce management on the day. Webex's published track list includes Workforce & Quality. The Zoom, Talkdesk and Avaya page has a track named WFM, recording, QM. The BA Lab diagram Sister technologies on the overview includes Workforce scheduling."
  },
  {
    id: "recording",
    title: "Call recording and quality management",
    short: "Recording",
    glossary: "Recording and quality management are the evaluation and capture notes a lab names. Amazon Connect's README puts Contact Lens, quality, and analytics in one chapter, and the ecosystem list includes recording and quality. SIP Universe track 14 names recording beside E911, and the README says recording stays at the protocol and policy level. Genesys's README covers quality management and speech and text analytics. Five9's published menu has a Quality item: evaluations, analytics wording, and claims left as claims. NICE's manifest has Quality and recording, and Quality and Interaction Analytics. Microsoft's ecosystem track names compliance recording and quality management. Webex's published track list includes Workforce & Quality, and the first-month plan names recording on the calling-security days. The Zoom page has a WFM, recording, QM track. The BA diagram includes Screen recording. The AI Lab contact-center track says to keep the model beside the queue, the recording, and the person who owns the call."
  },
  {
    id: "e911",
    title: "E911",
    short: "E911",
    glossary: "E911 here is emergency calling as the labs describe it, not legal advice. SIP Universe track 14 is Toll fraud, E911, recording, and QoS. Amazon Connect's README lists US E911 for CCP agents. UC Lab has an Emergency calling track: prove location, ELIN or ERL, and the on-site notification. Microsoft's README includes an E911 discovery lab and emergency location. Genesys's README includes emergency calling. Five9's README lists E911 among the university pages. Webex's README names an ecosystem atlas that includes E911, and the published first-month plan names RedSky. CPaaS has an Emergency calling track. The Zoom, Talkdesk and Avaya page has an E911 and analytics track. Several of those pages say emergency notes are not legal advice."
  },
  {
    id: "analytics",
    title: "Analytics",
    short: "Analytics",
    glossary: "Analytics on this map is the reporting or speech-analytics work a lab names. Amazon Connect's published root menu has a Contact Lens chapter (transcripts, redaction, metrics, and evaluation forms). The README says the admin guide renamed Contact Lens to conversational analytics on 4 August 2026. Genesys's README covers speech and text analytics. Microsoft's mind-map list includes CQD and Power BI. Webex's README names analytics in the ecosystem atlas. Five9's Quality menu says evaluations, analytics wording, and claims left as claims. The Zoom page has an E911 and analytics track whose detail is location, and figures you confirm."
  },
  {
    id: "crm",
    title: "CRM",
    short: "CRM",
    glossary: "CRM on this map is a customer-record bridge a lab names. Amazon Connect's published menu has a CRM and CPaaS chapter. Microsoft's study order includes CRM and CTI (Dynamics 365 voice and Salesforce Voice). Genesys's README says Salesforce and Zendesk are the documented embeds and other CRMs stay on AppFoundry. Five9's README covers CRM adapters, and the published menu says named adapters and the CTI API, from the pages that opened. NICE's manifest has CRM integrations and CRM, CTI, and CPaaS. Webex's track list includes Flows, Integrations & Latest. The Zoom page has a CRM and AI bridges track. The BA diagram includes CRM profiles. The AI Lab ecosystem track says it maps CRM bridges."
  },
  {
    id: "agents",
    title: "AI agents",
    short: "AI agents",
    glossary: "AI agents on this map means the agent, bot, or assist work a lab names. The AI Lab README is a course on prompts, agents, MCP, and a contact-center track. Amazon Connect's ecosystem list includes AI configuration, and the README names Lex and agent assist. Microsoft's sister-technologies list includes AI agents with a human escape. Genesys's README covers Genesys AI and bots. Five9's README names IVA and GenAI Studio. NICE's manifest has Enlighten, Autopilot, and summaries. Webex's published track list includes AI Agents & Voice. The Zoom page names Virtual Agent under Zoom Contact Center and has a CRM and AI bridges track. CPaaS has a Contact center and AI track. Python Lab's README includes models and agents among the lessons. The BA Lab README says the notes cover AI omni-channel work. Its sister-technologies diagram says IVR and bots, which is that diagram's phrase."
  }
];

export const bridges = [
  { a: "sip-universe", b: "microsoft-voice-cc", because: "SIP Universe README track 12, Cloud voice and CCaaS SIP, names Teams Direct Routing." },
  { a: "sip-universe", b: "webex", because: "SIP Universe README track 12 names Webex Calling Local Gateway and Cloud Connected PSTN." },
  { a: "sip-universe", b: "amazon-connect", because: "SIP Universe README track 12 names Amazon Connect." },
  { a: "sip-universe", b: "five9", because: "SIP Universe README track 12 names Five9." },
  { a: "sip-universe", b: "genesys-cloud", because: "SIP Universe README track 12 names Genesys BYOC." },
  { a: "sip-universe", b: "nice-cxone", because: "SIP Universe README track 12 names NICE CXone." },
  { a: "sip-universe", b: "uc", because: "SIP Universe README track 15 is titled Ecosystem, certifications, and the UC bridge." },
  { a: "amazon-connect", b: "uc", because: "Amazon Connect's README bridge track names CUCM, UCCX, and UCCE. UC Lab's CCaaS track names Connect." },
  { a: "amazon-connect", b: "genesys-cloud", because: "Amazon Connect's README says the study covers bridges from Genesys, and the bridge track names Genesys." },
  { a: "amazon-connect", b: "webex", because: "Amazon Connect's README says the study covers bridges from Webex, and the bridge track names Webex Contact Center." },
  { a: "amazon-connect", b: "microsoft-voice-cc", because: "Amazon Connect's README integrations include Microsoft Teams. Microsoft's README bridge list names Amazon Connect." },
  { a: "uc", b: "webex", because: "UC Lab's study order goes to Webex Calling, and the CCaaS track names Webex CC. Webex's published track 11 is Platform Bridges: Unified CM, DI, and UCCX." },
  { a: "uc", b: "microsoft-voice-cc", because: "UC Lab's README has a Webex Calling and Teams Phone track and a Teams Phone path of 67 sections. Microsoft's README links the UC Lab and names CUCM and UCCE among cross-platform bridges." },
  { a: "uc", b: "genesys-cloud", because: "UC Lab's CCaaS track names Genesys. Genesys's README includes migration from Cisco UCCE / UCCX, and CUCM as a learning bridge." },
  { a: "uc", b: "nice-cxone", because: "UC Lab's CCaaS track names NICE." },
  { a: "uc", b: "five9", because: "UC Lab's CCaaS track names Five9. Five9's README calls the Cisco UCCX and UCCE material a teaching bridge." },
  { a: "microsoft-voice-cc", b: "genesys-cloud", because: "Microsoft's README lists Genesys among cross-platform bridges (CUCM, Webex, UCCE, Genesys, Amazon Connect)." },
  { a: "microsoft-voice-cc", b: "webex", because: "Microsoft's README links the Webex lab as a sister project and names Webex in the cross-platform bridge list." },
  { a: "genesys-cloud", b: "webex", because: "Genesys's README says CUCM and Webex appear as a learning bridge with Cisco citations, not as a converter." },
  { a: "nice-cxone", b: "genesys-cloud", because: "NICE's README says Genesys in that lab is the T-Lib / SIPREC recording page, not a named WFM connector. Five9 and Webex Contact Center are marked confirm: no opened page named them, so this map does not draw those two as bridges." }
];

export const siblings = [
  { a: "microsoft-voice-cc", b: "ai", because: "Microsoft's README sister-project list links the AI Lab." },
  { a: "sip-universe", b: "ai", because: "The published SIP Universe page names AI Lab beside UC Lab and Webex Lab." },
  { a: "nice-cxone", b: "ai", because: "The published NICE Contact Path page lists AI Lab among sibling labs." },
  { a: "nice-cxone", b: "ba-lab-grok", because: "The published NICE Contact Path page lists Business Analyst among sibling labs." },
  { a: "nice-cxone", b: "zoom-talkdesk-avaya", because: "The published NICE Contact Path page lists Zoom, Talkdesk, Avaya among sibling labs." },
  { a: "nice-cxone", b: "cpaas", because: "The published NICE Contact Path page lists CPaaS among sibling labs." },
  { a: "uc", b: "ai", because: "The published UC campus page has a next-lab strip that names AI Lab." }
];

export const beyond = [
  { label: "Sutra Nexus", href: "https://cyphermonkeylabs.com/sutra-nexus/", detail: "The live site lists Sutra Nexus as a separate project, not one of the thirteen labs." },
  { label: "Gemini Gems gallery", href: "https://cyphermonkeylabs.com/gemini-gems-free-gallery/", detail: "The live site lists the gallery as a small side project. Microsoft's README also links it as a design reference." }
];

export const labs = [
  {
    slug: "amazon-connect",
    title: "Amazon Connect Lab",
    short: "Connect",
    accent: "peach",
    tagline: "Flows, queues, routing profiles, Lex, agent assist, Contact Lens, Lambda, and the bridges the README names.",
    openUrl: "https://cyphermonkeylabs.com/amazon-connect-lab-free-university-mesmerizing/campus/",
    repo: "https://github.com/CypherMonkeyLabs/amazon-connect-lab-free-university-mesmerizing",
    learn: [
      "The README describes a static lab for Amazon Connect flows, queues, routing profiles, Lex, agent assist, Contact Lens, Lambda, Kinesis, the CCP, and bridges from Cisco UCCE, Genesys, and Webex.",
      "The campus section of the README says the offline campus has 18 tracks, 129 lessons, and 24 browser labs, and that it does not call AWS.",
      "The published campus meta description names foundations, flows, routing, the CCP, Global Resiliency, a CUCM bridge, and the ecosystem around WFM, recording, E911, CRM, and agent assist.",
      "The published root menu lists five chapter paths: Routing, Forecasting, Contact Lens, CRM and CPaaS, and Ecosystem."
    ],
    pathNote: "The published root menu calls these five chapters the paths from fundamentals to advanced. The campus README still describes 18 tracks from AWS foundations through the ecosystem.",
    path: [
      { title: "Routing", detail: "Published menu: who can take the contact, and in what order." },
      { title: "Forecasting", detail: "Published menu: interval, forecast, hiring plan, then adherence." },
      { title: "Contact Lens", detail: "Published menu: transcripts, redaction, metrics, and evaluation forms." },
      { title: "CRM and CPaaS", detail: "Published menu: Salesforce, Twilio's own docs, and the phone-number seam." },
      { title: "Ecosystem", detail: "Published menu: glossary, mind map, sisters, maps, bridges, and hooks." }
    ],
    sisters: {
      wfm: "README ecosystem list: native and third-party WFM, plus forecasting, capacity, and schedules.",
      recording: "README chapter Contact Lens, quality, and analytics, and the ecosystem recording-and-quality item.",
      e911: "README ecosystem list: US E911 for CCP agents.",
      analytics: "README: Contact Lens, quality, and analytics. It also says the admin guide renamed Contact Lens to conversational analytics on 4 August 2026.",
      crm: "Published CRM and CPaaS chapter, and the README integrations list (Salesforce, ServiceNow, Microsoft Teams).",
      agents: "README names Lex, agent assist, and AI configuration in the ecosystem list."
    },
    counts: [
      { value: "18 tracks, 129 lessons, 24 browser labs", source: "README campus section" },
      { value: "Five chapter paths, and a menu line that still says 18 tracks", source: "Published root page, 19 October 2026" }
    ],
    caveats: [
      "The README describes both a repository-root study site and an older campus shell under campus/. The open button uses the campus URL from the lab registry. The root URL was also fetched and returned HTTP 200."
    ],
    extraLinks: [
      { label: "Published study root", href: "https://cyphermonkeylabs.com/amazon-connect-lab-free-university-mesmerizing/", detail: "Fetched 19 October 2026. The README says the root is the study site and the campus folder keeps the earlier shell." }
    ],
    sources: [
      { label: "README on the main branch", href: "https://github.com/CypherMonkeyLabs/amazon-connect-lab-free-university-mesmerizing" },
      { label: "Published campus", href: "https://cyphermonkeylabs.com/amazon-connect-lab-free-university-mesmerizing/campus/" }
    ]
  },
  {
    slug: "sip-universe",
    title: "SIP Universe",
    short: "SIP",
    accent: "mint",
    tagline: "An independent study of SIP, SDP, RTP/SRTP, NAT, ICE, SBCs, trunking, and interop.",
    openUrl: "https://cyphermonkeylabs.com/sip-universe-lab-free-university-mesmerizing/campus/",
    repo: "https://github.com/CypherMonkeyLabs/sip-universe-lab-free-university-mesmerizing",
    learn: [
      "The README calls it a free learning-only study. The campus keeps a message dissector, an offer/answer negotiator, a header sandbox, and a border map.",
      "The README table lists 16 tracks, 112 lessons, 672 quiz items, 448 flashcards, 112 lesson labs, 112 fault-and-fix rows, 8 boss incidents, 40 interview drills, and 109 glossary terms.",
      "Track 12 is cloud voice and CCaaS SIP. Track 14 is toll fraud, E911, recording, and QoS. The README says toll-fraud material stays on defensive controls and does not describe how to place fraudulent calls.",
      "The published page meta description calls it a field guide to SIP, SDP, RTP/SRTP, NAT, ICE, and session border controllers."
    ],
    pathNote: "Track order and titles are the numbered list in the README.",
    path: [
      { title: "Foundations and how to read a call", detail: "README track 1." },
      { title: "SIP core: messages, transactions, dialogs", detail: "README track 2." },
      { title: "Call flows that operators actually trace", detail: "README track 3." },
      { title: "Registration, DNS, and routing", detail: "README track 4." },
      { title: "SDP and offer/answer", detail: "README track 5." },
      { title: "RTP, codecs, and DTMF", detail: "README track 6." },
      { title: "TLS, SRTP, identity, and abuse", detail: "README track 7." },
      { title: "NAT, ICE, and the ALG problem", detail: "README track 8." },
      { title: "Session border controllers", detail: "README track 9." },
      { title: "Cisco CUBE, CUCM, and Unity Connection", detail: "README track 10." },
      { title: "Oracle, Ribbon, and AudioCodes", detail: "README track 11." },
      { title: "Cloud voice and CCaaS SIP", detail: "README track 12. It names Teams Direct Routing, Webex Calling, Amazon Connect, Five9, Genesys BYOC, NICE CXone, and Twilio Elastic SIP." },
      { title: "Troubleshooting ladders, captures, and debug", detail: "README track 13." },
      { title: "Toll fraud, E911, recording, and QoS", detail: "README track 14." },
      { title: "Ecosystem, certifications, and the UC bridge", detail: "README track 15." },
      { title: "Interviews, incidents, and design drills", detail: "README track 16." }
    ],
    sisters: {
      e911: "README track 14 names E911. Recording and emergency calling stay at the protocol and policy level.",
      recording: "README track 14 names recording."
    },
    counts: [
      { value: "16 tracks, 112 lessons, 672 quiz items, 109 glossary terms", source: "README table" }
    ],
    caveats: [],
    extraLinks: [],
    sources: [
      { label: "README on the main branch", href: "https://github.com/CypherMonkeyLabs/sip-universe-lab-free-university-mesmerizing" },
      { label: "Published campus", href: "https://cyphermonkeylabs.com/sip-universe-lab-free-university-mesmerizing/campus/" }
    ]
  },
  {
    slug: "uc",
    title: "Unified Communications Lab",
    short: "UC",
    accent: "sky",
    tagline: "A free offline campus for voice, unified communications, and contact center systems.",
    openUrl: "https://cyphermonkeylabs.com/uc-lab-free-university-mesmerizing/campus/uc-lab-free-university.html",
    repo: "https://github.com/CypherMonkeyLabs/uc-lab-free-university-mesmerizing",
    learn: [
      "The README says the campus covers CUCM, CUBE, SIP, Webex Calling, Webex Contact Center, Teams Phone, UCCE, PCCE, CUIC, the main CCaaS platforms, E911, QoS, and troubleshooting.",
      "The README counts 580 sections across 14 tracks. Four paths share them: Cisco Voice Core (314), Webex Calling (69), Teams Phone (67), and Contact Center Engineer (130).",
      "The published page meta description says v21, with guided paths for those four names, and that it is offline after the shell is cached.",
      "The proof habit in the README is leg, identifier, counter, and capture."
    ],
    pathNote: "This order is the README study-order diagram, from the SIP ladder through troubleshooting.",
    path: [
      { title: "SIP ladder", detail: "README study order, first step." },
      { title: "CUCM and CUBE", detail: "Then Webex Calling or Teams Phone, and UCCE or PCCE and CUIC, both branch from here." },
      { title: "Webex Calling or Teams Phone", detail: "README study order." },
      { title: "UCCE or PCCE and CUIC", detail: "README study order." },
      { title: "The CCaaS platform you operate", detail: "The README names Webex CC, Connect, Genesys, NICE, and Five9 in the CCaaS track." },
      { title: "E911", detail: "README study order, from CUCM and CUBE." },
      { title: "QoS and the CUCM CLI", detail: "README study order." },
      { title: "Troubleshooting", detail: "README study order: one hypothesis, one change, one evidence pack is the track's finish line." }
    ],
    sisters: {
      e911: "README Emergency calling track: prove location, ELIN or ERL, and the on-site notification.",
      recording: "README Design notes track: read capacity, identity, recording, and failure domains. A lab named Record asks where the PSTN fork belongs."
    },
    counts: [
      { value: "580 sections, 14 tracks, 1,197 distinct flow definitions", source: "README" },
      { value: "Four paths: Cisco Voice Core 314, Webex Calling 69, Teams Phone 67, Contact Center Engineer 130", source: "README path table" }
    ],
    caveats: [
      "The README says version 21 remains the deep campus, and that the round-2 course is the repository root. The open button uses the campus file linked from the lab registry."
    ],
    extraLinks: [
      { label: "Repository root", href: "https://cyphermonkeylabs.com/uc-lab-free-university-mesmerizing/", detail: "The README points the round-2 course at the repository root index." }
    ],
    sources: [
      { label: "README on the main branch", href: "https://github.com/CypherMonkeyLabs/uc-lab-free-university-mesmerizing" },
      { label: "Published campus", href: "https://cyphermonkeylabs.com/uc-lab-free-university-mesmerizing/campus/uc-lab-free-university.html" }
    ]
  },
  {
    slug: "ai",
    title: "AI Lab",
    short: "AI",
    accent: "lavender",
    tagline: "A free course on models, retrieval, agents, MCP, evals, and a contact-center map.",
    openUrl: "https://cyphermonkeylabs.com/ai-lab-free-university-mesmerizing/campus/ai-lab-university.html",
    repo: "https://github.com/CypherMonkeyLabs/ai-lab-free-university-mesmerizing",
    learn: [
      "The README's front door lists programming foundations, models, retrieval, agents, MCP, voice and messaging, a voice stack, speech analytics, agent safety, a contact-center map, and compute you re-check.",
      "The README learning table has 16 tracks. It states 593 study pages, a 357-entry glossary, and 109 interview drills.",
      "The contact-center track's finish line in that table is: keep the model beside the queue, the recording, and the person who owns the call.",
      "The README says the lab does not claim professional GenAI work, and that notes on recording, consent, and emergency calling are educational and are not legal advice.",
      "The same README says other campuses are not linked from the AI Lab pages."
    ],
    pathNote: "This order is the learning-path diagram in the README. The published page title, fetched 19 October 2026, showed different course and room counts. Both readings are on this page. The path follows the README because that file writes the order.",
    path: [
      { title: "Start here", detail: "README: use the course, keep proof, and apply the safety rules. 6 lessons in the README table." },
      { title: "How models work", detail: "README: tokens, context, sampling, hallucination, and 2026 model roles." },
      { title: "Prompting", detail: "README: a job, an output shape, and a test for the next change." },
      { title: "Local models, or APIs and cost", detail: "The README diagram branches both ways from prompting." },
      { title: "Retrieval", detail: "README: cite a real passage, and measure whether retrieval found it." },
      { title: "Agents", detail: "README: a tool loop with a schema, a step cap, and a trace." },
      { title: "MCP and coding agents", detail: "README: connect a tool server without granting it silent access, then review a diff." },
      { title: "Evals", detail: "README: gate a change on quality, safety, latency, and cost." },
      { title: "Safety, then product skills", detail: "README: a one-page policy, then a feature a product manager and an engineer can measure." },
      { title: "Capstone", detail: "README: a small grounded assistant on notes you are allowed to use." },
      { title: "Contact center and ecosystem", detail: "README tracks beside the diagram: the queue and the recording, then ports, cutovers, CRM bridges, and emergency calling." }
    ],
    sisters: {
      recording: "README contact-center track: keep the model beside the queue, the recording, and the person who owns the call.",
      e911: "README ecosystem track: map ports, cutovers, CRM bridges, emergency calling, and what this course will not certify.",
      crm: "README ecosystem track names CRM bridges.",
      agents: "The README is a course on agents, MCP, and coding agents."
    },
    counts: [
      { value: "16 tracks, 593 study pages, glossary 357, interview drills 109", source: "README" },
      { value: "Published title text included Course: 96, Rooms: 19, and Glossary: 357", source: "Published page title, fetched 19 October 2026" }
    ],
    caveats: [
      "The README and the published title do not agree on the course and room counts. Glossary 357 appears in both. This portal does not pick a winner."
    ],
    extraLinks: [],
    sources: [
      { label: "README on the main branch", href: "https://github.com/CypherMonkeyLabs/ai-lab-free-university-mesmerizing" },
      { label: "Published campus", href: "https://cyphermonkeylabs.com/ai-lab-free-university-mesmerizing/campus/ai-lab-university.html" }
    ]
  },
  {
    slug: "nice-cxone",
    title: "NICE CXone Lab",
    short: "NICE",
    accent: "peach",
    tagline: "Contact Path: a free static study campus for NiCE CXone.",
    openUrl: "https://cyphermonkeylabs.com/nice-cxone-lab-free-university-mesmerizing/campus/",
    repo: "https://github.com/CypherMonkeyLabs/nice-cxone-lab-free-university-mesmerizing",
    learn: [
      "The README covers ACD setup, Studio scripting, skills and routing, IVR, digital channels, workforce management, quality and recording, Enlighten Autopilot and AutoSummary, CXone APIs, CRM integrations, telephony, and bridges a public NiCE page names.",
      "It says the lab is not affiliated with NiCE, and that it does not claim NiCE production experience for Lucky.",
      "The routing simulator uses the documented priority formula (time × acceleration) + initial priority. Personal Connection mode forces acceleration to 0.",
      "The published manifest lists 21 tracks. Their titles are the path below."
    ],
    pathNote: "Titles are the title fields of campus/data/manifest.json, in file order, fetched 19 October 2026.",
    path: [
      { title: "Foundations and prerequisites", detail: "Manifest track foundations." },
      { title: "Platform, licensing, and releases", detail: "Manifest track platform." },
      { title: "ACD setup", detail: "Manifest track acd." },
      { title: "People, teams, and agent apps", detail: "Manifest track people." },
      { title: "Skills and routing", detail: "Manifest track routing." },
      { title: "Studio scripting", detail: "Manifest track studio." },
      { title: "IVR", detail: "Manifest track ivr." },
      { title: "Digital channels", detail: "Manifest track digital." },
      { title: "Workforce management", detail: "Manifest track wfm." },
      { title: "Quality and recording", detail: "Manifest track quality." },
      { title: "Enlighten, Autopilot, and summaries", detail: "Manifest track enlighten." },
      { title: "CXone APIs", detail: "Manifest track apis." },
      { title: "CRM integrations", detail: "Manifest track crm." },
      { title: "Telephony and carriers", detail: "Manifest track voice." },
      { title: "UCCE, Avaya, and moved history", detail: "Manifest track migration." },
      { title: "Ecosystem, certifications, and the calendar", detail: "Manifest track ecosystem." },
      { title: "Skills routing and ACD", detail: "Manifest track skills-acd." },
      { title: "Workforce management on the day", detail: "Manifest track wfm-day." },
      { title: "Quality and Interaction Analytics", detail: "Manifest track qm-ia." },
      { title: "CRM, CTI, and CPaaS", detail: "Manifest track cti-cpaas." },
      { title: "Ecosystem map", detail: "Manifest track eco-map." }
    ],
    sisters: {
      wfm: "Manifest tracks: Workforce management, and Workforce management on the day.",
      recording: "Manifest tracks: Quality and recording, and Quality and Interaction Analytics.",
      analytics: "Manifest track Quality and Interaction Analytics.",
      crm: "Manifest tracks: CRM integrations, and CRM, CTI, and CPaaS.",
      agents: "Manifest track: Enlighten, Autopilot, and summaries."
    },
    counts: [
      { value: "21 tracks in the published manifest", source: "campus/data/manifest.json, 19 October 2026" }
    ],
    caveats: [
      "The README does not give a lesson count. This page does not invent one. Five9 and Webex Contact Center connectors are marked confirm in the README, so they are not drawn as bridges."
    ],
    extraLinks: [
      { label: "Published track manifest", href: "https://cyphermonkeylabs.com/nice-cxone-lab-free-university-mesmerizing/campus/data/manifest.json", detail: "Track titles on this portal come from this file." }
    ],
    sources: [
      { label: "README on the main branch", href: "https://github.com/CypherMonkeyLabs/nice-cxone-lab-free-university-mesmerizing" },
      { label: "Published campus", href: "https://cyphermonkeylabs.com/nice-cxone-lab-free-university-mesmerizing/campus/" }
    ]
  },
  {
    slug: "microsoft-voice-cc",
    title: "Microsoft Voice & Contact Center Lab",
    short: "Microsoft",
    accent: "sky",
    tagline: "A free offline campus for Teams Phone and Microsoft contact-center study.",
    openUrl: "https://cyphermonkeylabs.com/microsoft-voice-cc-lab-free-university-mesmerizing/campus/",
    repo: "https://github.com/CypherMonkeyLabs/microsoft-voice-cc-lab-free-university-mesmerizing",
    learn: [
      "The README describes Teams voice and Microsoft contact-center study: a PowerShell console, a Direct Routing ladder, a 3D SBC mesh, labs, a fault catalog, and cited notes.",
      "Its count table lists 20 tracks, 130 lessons, 25 labs, 668 quiz questions, 619 flashcards, and a 359-term glossary.",
      "The ecosystem track names workforce management, compliance recording and quality management, E911, analytics and Power BI, CRM and screen pop, and AI agents with a human escape.",
      "Cross-platform bridges named in the README: CUCM, Webex, UCCE, Genesys, and Amazon Connect.",
      "Sister projects linked from the README: UC Lab, AI Lab, Webex, and the Gemini Gems gallery as a design reference."
    ],
    pathNote: "The six steps are the README study order.",
    path: [
      { title: "Foundations, licensing, PowerShell, and the network", detail: "README study order, step 1." },
      { title: "PSTN connectivity, dial plans, voice routing, attendants, and queues", detail: "README study order, step 2." },
      { title: "Emergency calling, devices, SBCs, TLS, and troubleshooting", detail: "README study order, step 3." },
      { title: "Dynamics 365 Contact Center, coexistence, ACS, Speech, and Copilot Studio", detail: "README study order, step 4." },
      { title: "Exam status board, then the ecosystem track", detail: "README: glossary, mind map, sister technologies, integration maps, bridges, and future hooks." },
      { title: "CRM and CTI, comparison, routing, WFM, and quality evaluation", detail: "README step 6. The comparison has no ranking." }
    ],
    sisters: {
      wfm: "README ecosystem track and study-order step 6 name workforce management.",
      recording: "README: compliance recording and quality management, including Teams compliance recording.",
      e911: "README labs include E911 discovery and emergency location.",
      analytics: "README mind map includes CQD and Power BI.",
      crm: "README study order: CRM and CTI (Dynamics 365 voice and Salesforce Voice).",
      agents: "README sister technologies: AI agents with a human escape."
    },
    counts: [
      { value: "20 tracks, 130 lessons, 25 labs, 668 quiz questions", source: "README table" }
    ],
    caveats: [
      "The README says MS-700 is still live, MB-280 retired 31 July 2026, and AB-210 is not the contact-center exam and is not a replacement for MS-700. Check the exam page again before booking. This portal does not add dates of its own."
    ],
    extraLinks: [
      { label: "Gemini Gems gallery", href: "https://cyphermonkeylabs.com/gemini-gems-free-gallery/", detail: "Microsoft's README lists it as a design reference." }
    ],
    sources: [
      { label: "README on the main branch", href: "https://github.com/CypherMonkeyLabs/microsoft-voice-cc-lab-free-university-mesmerizing" },
      { label: "Published campus", href: "https://cyphermonkeylabs.com/microsoft-voice-cc-lab-free-university-mesmerizing/campus/" }
    ]
  },
  {
    slug: "genesys-cloud",
    title: "Genesys Cloud Lab",
    short: "Genesys",
    accent: "peach",
    tagline: "Signal Floor: a free, static operations university for Genesys Cloud CX.",
    openUrl: "https://cyphermonkeylabs.com/genesys-cloud-lab-free-university-mesmerizing/campus/",
    repo: "https://github.com/CypherMonkeyLabs/genesys-cloud-lab-free-university-mesmerizing",
    learn: [
      "The README says the curriculum covers organization setup, Architect flows, ACD routing, queues and skills, BYOC, SIP trunks, the Edge, emergency calling, workforce management, forecasting, quality management, speech and text analytics, Genesys AI and bots, Predictive Engagement, Platform APIs, AppFoundry and CRM embeds, and migration from Genesys Engage, PureConnect, and Cisco UCCE / UCCX.",
      "The ecosystem page holds the glossary, mind map, sister technologies, integration map, and the CRM, BYOC, and AI-agent bridges.",
      "verify.mjs on 16 October 2026, as reported in the README, counted 20 tracks, 142 lessons, 852 quiz items, 142 labs, and 142 faults.",
      "The README says CUCM and Webex appear as a learning bridge with Cisco citations, not as a converter."
    ],
    pathNote: "These steps follow the order of topics in the README's opening curriculum paragraph. The README also says there are 20 tracks. This list is not a claim that each line is one track title.",
    path: [
      { title: "Organization setup", detail: "README opening curriculum." },
      { title: "Architect flows, ACD, queues, and skills", detail: "README, including bullseye expansion and direct routing." },
      { title: "BYOC, SIP trunks, and the Edge", detail: "README." },
      { title: "Emergency calling", detail: "README." },
      { title: "Workforce management and forecasting", detail: "README forecasting chapter: views, creation methods, the editor, and schedule coverage." },
      { title: "Quality, speech, and text analytics", detail: "README quality-and-speech chapter: forms, AI scoring, programs, and limits." },
      { title: "Genesys AI, bots, and Predictive Engagement", detail: "README." },
      { title: "Platform APIs, AppFoundry, and CRM embeds", detail: "README: Salesforce and Zendesk are the documented embeds." },
      { title: "Migration from Engage, PureConnect, and Cisco UCCE / UCCX", detail: "README." },
      { title: "Ecosystem page", detail: "README: glossary, mind map, sister technologies, integration map, and bridges." }
    ],
    sisters: {
      wfm: "README covers workforce management and forecasting.",
      recording: "README covers quality management.",
      e911: "README includes emergency calling.",
      analytics: "README covers speech and text analytics.",
      crm: "README: Salesforce and Zendesk are the documented embeds. Other CRMs stay on AppFoundry.",
      agents: "README covers Genesys AI and bots, and AI-agent bridges on the ecosystem page."
    },
    counts: [
      { value: "20 tracks, 142 lessons, 852 quiz items, 142 labs, 55 glossary entries", source: "README, citing verify.mjs on 16 October 2026" }
    ],
    caveats: [],
    extraLinks: [
      { label: "Published landing page", href: "https://cyphermonkeylabs.com/genesys-cloud-lab-free-university-mesmerizing/", detail: "The README gives this as the canonical landing URL. The open button uses the campus URL from the lab registry." }
    ],
    sources: [
      { label: "README on the main branch", href: "https://github.com/CypherMonkeyLabs/genesys-cloud-lab-free-university-mesmerizing" },
      { label: "Published campus", href: "https://cyphermonkeylabs.com/genesys-cloud-lab-free-university-mesmerizing/campus/" }
    ]
  },
  {
    slug: "five9",
    title: "Five9 Lab",
    short: "Five9",
    accent: "peach",
    tagline: "An independent study floor for Five9 Virtual Contact Center.",
    openUrl: "https://cyphermonkeylabs.com/five9-lab-free-university-mesmerizing/campus/",
    repo: "https://github.com/CypherMonkeyLabs/five9-lab-free-university-mesmerizing",
    learn: [
      "The README walks VCC administration, inbound, outbound, and autodial campaigns, dialer modes, IVR, skills, Agent Desktop Plus, workforce engagement, IVA and GenAI Studio, CRM adapters, SIP, APIs and reporting, and a teaching bridge from Cisco UCCX and UCCE.",
      "It says the lab is not affiliated with, endorsed by, or sponsored by Five9, Inc.",
      "The README says verify.mjs reports 23 tracks, 161 lessons, 805 quiz questions, 644 flashcards, 161 labs, 161 faults, 36 interview answers, 8 boss incidents, and 44 glossary rows.",
      "The workforce calculator is Erlang C, not Five9's engine. The dialer pacing simulator is a classroom clock, not the Five9 dialer."
    ],
    pathNote: "The published Learn menu says tracks run from the domain model through routing, workforce, quality, CRM, and the ecosystem. The steps below use those words. They are not a full list of the 23 track titles.",
    path: [
      { title: "Domain model", detail: "Published Learn menu: tracks from the domain model." },
      { title: "Routing", detail: "Published menu also has Skills and ACD: skill groups as Five9 queues, and the ACD details that check could not read." },
      { title: "Workforce", detail: "Published menu: forecasts, schedules, intraday changes, and adherence." },
      { title: "Quality", detail: "Published menu: evaluations, analytics wording, and claims left as claims." },
      { title: "CRM and CTI", detail: "Published menu: named adapters and the CTI API, from the pages that opened." },
      { title: "Ecosystem", detail: "Published menu: glossary, mind map, sisters, integration list, bridges, and hooks." }
    ],
    sisters: {
      wfm: "README university pages include WFM. The calculator is Erlang C, not Five9's engine.",
      recording: "README university pages include recording. The published menu has a Quality item.",
      e911: "README university pages include E911.",
      analytics: "Published Quality line: analytics wording, and claims left as claims.",
      crm: "README covers CRM adapters.",
      agents: "README names IVA and GenAI Studio, and university pages for AI."
    },
    counts: [
      { value: "23 tracks, 161 lessons, 805 quiz questions, 44 glossary rows", source: "README, citing verify.mjs" }
    ],
    caveats: [],
    extraLinks: [
      { label: "Published front door", href: "https://cyphermonkeylabs.com/five9-lab-free-university-mesmerizing/", detail: "The README calls the repository root the round-2 front door. The open button uses the campus URL from the lab registry." }
    ],
    sources: [
      { label: "README on the main branch", href: "https://github.com/CypherMonkeyLabs/five9-lab-free-university-mesmerizing" },
      { label: "Published campus", href: "https://cyphermonkeylabs.com/five9-lab-free-university-mesmerizing/campus/" }
    ]
  },
  {
    slug: "zoom-talkdesk-avaya",
    title: "Zoom, Talkdesk and Avaya Lab",
    short: "Zoom",
    accent: "peach",
    tagline: "Free study notes for Zoom Phone, Zoom Contact Center, Zoom Workplace, Talkdesk, and Avaya.",
    openUrl: "https://cyphermonkeylabs.com/zoom-talkdesk-avaya-lab-free-university-mesmerizing/",
    repo: "https://github.com/CypherMonkeyLabs/zoom-talkdesk-avaya-lab-free-university-mesmerizing",
    learn: [
      "The README says these are study notes for Zoom Phone, Zoom Contact Center, Zoom Workplace, Talkdesk, and Avaya Aura and Avaya Infinity. They are not vendor documentation and not legal advice.",
      "The published page says the same, and adds that a number that was not on an opened page is marked confirm.",
      "The published page shows 12 tracks and 36 lessons, 3 lessons on each track. counts.json on that site says 12 tracks, 36 lessons, 75 diagrams, 71 terms, and 72 quizzes.",
      "The page also shows 75 drawings and 36 flows."
    ],
    pathNote: "Track titles and the one-line details are the words on the published page, in that page's order. Each track shows 3 lessons there.",
    path: [
      { title: "Zoom Workplace", detail: "Names the opened pages actually use." },
      { title: "Zoom Contact Center", detail: "Agents, consumers, and Virtual Agent." },
      { title: "Talkdesk", detail: "Cloud contact center and public APIs." },
      { title: "Avaya Aura", detail: "Enterprise voice on the products page." },
      { title: "Avaya Infinity", detail: "The CX platform the site opened." },
      { title: "SIP and media", detail: "Signaling, SDP, and RTP." },
      { title: "Call flows and routing", detail: "Ladders you can defend." },
      { title: "WFM, recording, QM", detail: "Schedules, SIPREC, and scores." },
      { title: "E911 and analytics", detail: "Location, and figures you confirm." },
      { title: "CRM and AI bridges", detail: "Embeds, sync, and Avaya AI lines." },
      { title: "Migration paths", detail: "Infinity, and Cisco pages that did not open. This portal does not draw a Cisco bridge from that line." },
      { title: "Licensing and roadmap", detail: "Named licenses, then confirm rows." }
    ],
    sisters: {
      wfm: "Published track: WFM, recording, QM.",
      recording: "Published track: WFM, recording, QM. The detail names SIPREC.",
      e911: "Published track: E911 and analytics.",
      analytics: "Published track: E911 and analytics. The detail says figures you confirm.",
      crm: "Published track: CRM and AI bridges.",
      agents: "Zoom Contact Center's published line names Virtual Agent. A later track is CRM and AI bridges."
    },
    counts: [
      { value: "12 tracks, 36 lessons, 75 drawings, 36 flows", source: "Published page, 19 October 2026" },
      { value: "12 tracks, 36 lessons, 75 diagrams, 71 terms, 72 quizzes", source: "Published assets/data/counts.json" }
    ],
    caveats: [
      "The README itself does not list the track titles. The path quotes the published page. Migration paths mention Cisco pages that did not open, so there is no platform-bridge line to the UC lab."
    ],
    extraLinks: [
      { label: "Published counts file", href: "https://cyphermonkeylabs.com/zoom-talkdesk-avaya-lab-free-university-mesmerizing/assets/data/counts.json", detail: "The README says counts are written to assets/data/counts.json." }
    ],
    sources: [
      { label: "README on the main branch", href: "https://github.com/CypherMonkeyLabs/zoom-talkdesk-avaya-lab-free-university-mesmerizing" },
      { label: "Published page", href: "https://cyphermonkeylabs.com/zoom-talkdesk-avaya-lab-free-university-mesmerizing/" }
    ]
  },
  {
    slug: "cpaas",
    title: "CPaaS Lab",
    short: "CPaaS",
    accent: "mint",
    tagline: "Free study notes for communications platform as a service.",
    openUrl: "https://cyphermonkeylabs.com/cpaas-lab-free-university-mesmerizing/",
    repo: "https://github.com/CypherMonkeyLabs/cpaas-lab-free-university-mesmerizing",
    learn: [
      "The README names Twilio, Vonage, Bandwidth, Sinch, Telnyx, Plivo, Infobip, Bird, and open alternatives. The published page also names FreeSWITCH, Asterisk, Kamailio, LiveKit, Jitsi, Matrix, and Jami.",
      "The README says these are study notes, not vendor documentation, not legal advice, and not a promise about work or pay.",
      "The published page shows 12 tracks, 36 lessons, 75 drawings, and 36 flows. Its counts.json says 12 tracks, 36 lessons, 75 diagrams, 71 terms, and 72 quizzes.",
      "A number that was not on an opened page is marked confirm. Emergency and recording notes are not legal advice, the published page says."
    ],
    pathNote: "Track titles and details are the words on the published page, in that page's order. Each track shows 3 lessons there.",
    path: [
      { title: "What CPaaS names", detail: "The word, then the companies whose pages opened." },
      { title: "SIP, WebRTC, RTP", detail: "Signaling, the description, and the media." },
      { title: "Numbers and trunks", detail: "E.164, DID, and the private and public domains." },
      { title: "SMS, MMS, 10DLC", detail: "Text, media, and the registration names." },
      { title: "STIR and SHAKEN", detail: "Identity, attestation, and the vendor pages." },
      { title: "Emergency calling", detail: "E911 words, and the duty pages that opened." },
      { title: "Programmable APIs", detail: "Voice, video, messaging, and verify." },
      { title: "Webhooks and IVR", detail: "Events inbound, and the verbs that gather." },
      { title: "Contact center and AI", detail: "IVR, ACD, and the agent pages." },
      { title: "Observability and price", detail: "Counts you can defend, and prices you confirm." },
      { title: "Compliance and migration", detail: "From a PBX toward a trunk, without a fake cutover." },
      { title: "Open alternatives", detail: "FreeSWITCH through Jami, then dates you confirm." }
    ],
    sisters: {
      e911: "Published track: Emergency calling.",
      agents: "Published track: Contact center and AI."
    },
    counts: [
      { value: "12 tracks, 36 lessons, 75 drawings, 36 flows", source: "Published page, 19 October 2026" },
      { value: "12 tracks, 36 lessons, 75 diagrams, 71 terms, 72 quizzes", source: "Published assets/data/counts.json" }
    ],
    caveats: [
      "The README does not list the twelve track titles. The path quotes the published page. SIP Universe's track 12 names Twilio Elastic SIP. This portal does not turn that into a bridge line, because neither README says the two labs are linked."
    ],
    extraLinks: [
      { label: "Published counts file", href: "https://cyphermonkeylabs.com/cpaas-lab-free-university-mesmerizing/assets/data/counts.json", detail: "The README says counts are written to assets/data/counts.json." }
    ],
    sources: [
      { label: "README on the main branch", href: "https://github.com/CypherMonkeyLabs/cpaas-lab-free-university-mesmerizing" },
      { label: "Published page", href: "https://cyphermonkeylabs.com/cpaas-lab-free-university-mesmerizing/" }
    ]
  },
  {
    slug: "webex",
    title: "Webex Lab",
    short: "Webex",
    accent: "sky",
    tagline: "A static study site for Webex Control Hub, Calling, Contact Center, Dedicated Instance, devices, and migration.",
    openUrl: "https://cyphermonkeylabs.com/webex-lab-free-university-mesmerizing/",
    repo: "https://github.com/CypherMonkeyLabs/webex-lab-free-university-mesmerizing",
    learn: [
      "The README says the written curriculum is the CypherWebex Canon: 11 tracks and 78 rooms. It does not call Webex.",
      "The published page repeats 11 tracks and 78 rooms, and names Control Hub, Webex Calling, both contact-center products, Dedicated Instance, migrations, SIP, flows, workforce and quality, AI agents, and platform bridges.",
      "The README points to an ecosystem atlas for Calling, Contact Center, Meetings, Devices, Control Hub, WFM, recording, E911, analytics, and AI agents.",
      "The published canon block shows 483 practice quiz questions and 842 flashcards. A scene control on the same fetched page shows 959 cards. This portal reports both."
    ],
    pathNote: "Track order, room counts, and the short lines are from the published track map fetched 19 October 2026. The README agrees that there are 11 tracks and 78 rooms.",
    path: [
      { title: "Control Hub & Platform", detail: "Published track 01. 7 rooms." },
      { title: "Webex Calling", detail: "Published track 02. 8 rooms." },
      { title: "WxCC Multi-tenant", detail: "Published track 03. 9 rooms." },
      { title: "WxCC Enterprise", detail: "Published track 04. 10 rooms." },
      { title: "Dedicated Instance", detail: "Published track 05. 6 rooms." },
      { title: "Migrations", detail: "Published track 06. 8 rooms." },
      { title: "SIP, Routing & Queues", detail: "Published track 07. 7 rooms." },
      { title: "Flows, Integrations & Latest", detail: "Published track 08. 8 rooms." },
      { title: "Workforce & Quality", detail: "Published track 09. 5 rooms. Forecast, schedule, and evaluate." },
      { title: "AI Agents & Voice", detail: "Published track 10. 5 rooms. Assistant, Studio, and voice." },
      { title: "Platform Bridges", detail: "Published track 11. 5 rooms. Unified CM, DI, and UCCX." }
    ],
    sisters: {
      wfm: "README ecosystem atlas names WFM. Published track 09 is Workforce & Quality.",
      recording: "README ecosystem atlas names recording. The published first-month plan names recording on days 25–30.",
      e911: "README ecosystem atlas names E911. The published first-month plan names RedSky on the calling-security days.",
      analytics: "README ecosystem atlas names analytics.",
      crm: "Published track 08 is Flows, Integrations & Latest.",
      agents: "Published track 10 is AI Agents & Voice. The README atlas names AI agents."
    },
    counts: [
      { value: "11 tracks, 78 rooms", source: "README and the published page" },
      { value: "483 practice quiz questions and 842 flashcards in the canon block; 959 cards in the scene control", source: "Published page, 19 October 2026" }
    ],
    caveats: [
      "The two card counts were both visible on the fetched page. This portal does not choose one."
    ],
    extraLinks: [],
    sources: [
      { label: "README on the main branch", href: "https://github.com/CypherMonkeyLabs/webex-lab-free-university-mesmerizing" },
      { label: "Published page", href: "https://cyphermonkeylabs.com/webex-lab-free-university-mesmerizing/" }
    ]
  },
  {
    slug: "python",
    title: "Python Lab",
    short: "Python",
    accent: "lavender",
    tagline: "A free static study studio for Python, from a first print through interview practice.",
    openUrl: "https://cyphermonkeylabs.com/python-lab-free-university-mesmerizing/",
    repo: "https://github.com/CypherMonkeyLabs/python-lab-free-university-mesmerizing",
    learn: [
      "The README says the pages are HTML, CSS, and JavaScript, with no build step, and that GitHub Pages can serve the repository root.",
      "Lessons run from syntax through objects, tests, async, typing, the standard library, Flask and FastAPI, NumPy and pandas, models and agents, automation, tooling, licensing, certifications, career study order, and projects.",
      "The browser runtime is Pyodide 314.0.7, which the README says is CPython 3.14.2, plus vendored NumPy 2.4.6 and pandas 3.0.2. The README says Python 3.15.0 (9 October 2026) is newer than this runtime.",
      "Checks include quizzes and three games: guess, snake, and a text adventure. The lab does not estimate pay.",
      "Content folders on the main branch are named level-00 through level-10. Those folder names are the path below."
    ],
    pathNote: "Folder names under content/ on the main branch, listed 19 October 2026. The README says Worlds covers level 0 through level 10.",
    path: [
      { title: "Level 00 · first program", detail: "Folder content/level-00_first-program." },
      { title: "Level 01 · values, types, names", detail: "Folder content/level-01_values-types-names." },
      { title: "Level 02 · decisions and loops", detail: "Folder content/level-02_decisions-and-loops." },
      { title: "Level 03 · functions and scope", detail: "Folder content/level-03_functions-and-scope." },
      { title: "Level 04 · lists, dicts, files", detail: "Folder content/level-04_lists-dicts-files." },
      { title: "Level 05 · classes and modules", detail: "Folder content/level-05_classes-and-modules." },
      { title: "Level 06 · paths and patterns", detail: "Folder content/level-06_paths-and-patterns." },
      { title: "Level 07 · generators and hints", detail: "Folder content/level-07_generators-and-hints." },
      { title: "Level 08 · coroutines", detail: "Folder content/level-08_coroutines." },
      { title: "Level 09 · PEPs and data model", detail: "Folder content/level-09_peps-and-data-model." },
      { title: "Level 10 · ecosystem map", detail: "Folder content/level-10_ecosystem-map." }
    ],
    sisters: {
      agents: "The README includes models and agents in the lesson list."
    },
    counts: [
      { value: "Pyodide 314.0.7 (CPython 3.14.2), NumPy 2.4.6, pandas 3.0.2", source: "README" },
      { value: "11 content folders, level-00 through level-10", source: "GitHub content directory on main, 19 October 2026" },
      { value: "9 slide decks (92 slides) and 11 guides", source: "README" }
    ],
    caveats: [],
    extraLinks: [
      { label: "content/ folder on GitHub", href: "https://github.com/CypherMonkeyLabs/python-lab-free-university-mesmerizing/tree/main/content", detail: "Level folder names used for the path." }
    ],
    sources: [
      { label: "README on the main branch", href: "https://github.com/CypherMonkeyLabs/python-lab-free-university-mesmerizing" },
      { label: "Published page", href: "https://cyphermonkeylabs.com/python-lab-free-university-mesmerizing/" }
    ]
  },
  {
    slug: "ba-lab-grok",
    title: "BA Lab",
    short: "BA",
    accent: "butter",
    tagline: "A free study lab for business analysis, from fundamentals through credentials.",
    openUrl: "https://cyphermonkeylabs.com/ba-lab-grok-free-university-mesmerizing/",
    repo: "https://github.com/CypherMonkeyLabs/ba-lab-grok-free-university-mesmerizing",
    learn: [
      "The README says there are 169 notes, 75 diagrams, 36 flows, and 54 flashcards. Omnichannel journeys, contact-center metrics, cloud-migration artifacts, and the ecosystem map are Learn rooms.",
      "The published page says: start with what the work is, then the six knowledge areas, then a testable requirement. Contact-center rooms cover journeys, metrics, and a move to the cloud.",
      "The published welcome says prices are copied only from pages opened in October 2026, anything missing is marked to be confirmed, nothing is sold, and the lab states no salaries.",
      "The sister-technologies diagram is titled Sister technologies on the overview and says Citations, not a shortlist. Its boxes are IVR and bots, CRM profiles, Workforce scheduling, Screen recording, Flows toward other systems, and Email service."
    ],
    pathNote: "The order is the published welcome, then the hero line fundamentals through modeling, delivery, data, and credentials.",
    path: [
      { title: "What the work is", detail: "Published welcome: start with what the work is." },
      { title: "The six knowledge areas", detail: "Published welcome. This portal does not name the six, because that sentence does not list them." },
      { title: "A testable requirement", detail: "Published welcome. The same page defines Need, Story, Trace, and Test in four short lines." },
      { title: "Modeling, delivery, and data", detail: "Published hero: notes from fundamentals through modeling, delivery, data, and credentials." },
      { title: "Contact-center rooms and credentials", detail: "README: journeys, metrics, cloud-migration artifacts, and the ecosystem map are Learn rooms. The hero ends on credentials." }
    ],
    sisters: {
      wfm: "Published diagram Sister technologies on the overview includes Workforce scheduling.",
      recording: "That diagram includes Screen recording.",
      crm: "That diagram includes CRM profiles.",
      agents: "The README says the notes cover AI omni-channel work. The same diagram's box is IVR and bots, not the phrase AI agents."
    },
    counts: [
      { value: "169 notes, 75 diagrams, 36 flows, 54 flashcards", source: "README" }
    ],
    caveats: [],
    extraLinks: [
      { label: "Sister technologies diagram", href: "https://cyphermonkeylabs.com/ba-lab-grok-free-university-mesmerizing/downloads/diagrams/eco-sisters.html", detail: "Published diagram page fetched 19 October 2026." },
      { label: "Contact-center mind map", href: "https://cyphermonkeylabs.com/ba-lab-grok-free-university-mesmerizing/downloads/diagrams/eco-mind.html", detail: "Published diagram. Boxes: Person and goal, Channels, Journey and blueprint, Queue and flow, Agent and profile, Measures, Three workstreams." }
    ],
    sources: [
      { label: "README on the main branch", href: "https://github.com/CypherMonkeyLabs/ba-lab-grok-free-university-mesmerizing" },
      { label: "Published page", href: "https://cyphermonkeylabs.com/ba-lab-grok-free-university-mesmerizing/" }
    ]
  }
];
