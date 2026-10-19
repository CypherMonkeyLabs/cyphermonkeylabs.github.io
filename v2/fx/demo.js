const NODES = [
  { id: 'sip', label: 'SIP Universe', url: 'https://cyphermonkeylabs.com/sip-universe-lab-free-university-mesmerizing/campus/' },
  { id: 'uc', label: 'UC Lab', url: 'https://cyphermonkeylabs.com/uc-lab-free-university-mesmerizing/campus/uc-lab-free-university.html' },
  { id: 'connect', label: 'Amazon Connect', url: 'https://cyphermonkeylabs.com/amazon-connect-lab-free-university-mesmerizing/campus/' },
  { id: 'nice', label: 'NICE CXone', url: 'https://cyphermonkeylabs.com/nice-cxone-lab-free-university-mesmerizing/campus/' },
  { id: 'microsoft', label: 'Microsoft Voice', url: 'https://cyphermonkeylabs.com/microsoft-voice-cc-lab-free-university-mesmerizing/campus/' },
  { id: 'genesys', label: 'Genesys Cloud', url: 'https://cyphermonkeylabs.com/genesys-cloud-lab-free-university-mesmerizing/campus/' },
  { id: 'five9', label: 'Five9', url: 'https://cyphermonkeylabs.com/five9-lab-free-university-mesmerizing/campus/' },
  { id: 'zoom', label: 'Zoom TD Avaya', url: 'https://cyphermonkeylabs.com/zoom-talkdesk-avaya-lab-free-university-mesmerizing/' },
  { id: 'cpaas', label: 'CPaaS', url: 'https://cyphermonkeylabs.com/cpaas-lab-free-university-mesmerizing/' },
  { id: 'webex', label: 'Webex', url: 'https://cyphermonkeylabs.com/webex-lab-free-university-mesmerizing/' },
  { id: 'ai', label: 'AI Lab', url: 'https://cyphermonkeylabs.com/ai-lab-free-university-mesmerizing/campus/ai-lab-university.html' },
  { id: 'python', label: 'Python', url: 'https://cyphermonkeylabs.com/python-lab-free-university-mesmerizing/' },
  { id: 'ba', label: 'BA Lab', url: 'https://cyphermonkeylabs.com/ba-lab-grok-free-university-mesmerizing/' },
];

const fx = window.CMFX;
const status = document.getElementById('status');

fx.ready.then((api) => {
  api.aurora(document.getElementById('aurora-canvas'), {
    palette: ['#7c5cff', '#3ee0c5', '#24144a'],
    intensity: 0.85,
  });
  api.particles(document.getElementById('particle-canvas'), { count: 120, mouse: true });
  const globe = api.globe3d(document.getElementById('globe-host'), { nodes: NODES });
  api.tiltCards('.tilt-card');
  api.cursorTrail();
  api.sound.init();
  document.querySelectorAll('[data-ping]').forEach((button) => {
    button.addEventListener('click', () => {
      api.sound.ping(button.dataset.ping);
    });
  });
  return globe.ready.then(() => {
    const mode = document.getElementById('globe-host').dataset.cmfx || 'unknown';
    const motion = api.reducedMotion ? 'reduced motion' : 'motion on';
    status.textContent = `Ready. Globe is ${mode}. ${motion}. Sound is off until you toggle it.`;
  });
}).catch((err) => {
  status.textContent = 'The effect library did not start.';
  const detail = document.createElement('p');
  detail.textContent = err && err.message ? err.message : 'Unknown error';
  status.after(detail);
});
