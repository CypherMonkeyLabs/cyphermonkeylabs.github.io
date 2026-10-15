const KNOWN_VENDORS = new Map([
  ['amazon-connect', 'Amazon Web Services or Amazon Connect'],
  ['microsoft-voice', 'Microsoft'],
  ['microsoft-voice-cc', 'Microsoft'],
  ['five9', 'Five9'],
  ['genesys', 'Genesys'],
  ['genesys-cloud', 'Genesys'],
  ['nice', 'NICE'],
  ['nice-cxone', 'NICE'],
  ['canon', 'Cisco or Webex'],
  ['webex', 'Cisco or Webex'],
  ['gems', 'Google'],
  ['gemini-gems', 'Google'],
  ['gcp-cc', 'Google'],
]);

export function vendorLine(lab) {
  const listed = Array.isArray(lab.vendorsReferenced) ? lab.vendorsReferenced.filter(Boolean) : [];
  if (listed.length) return listed.join(', ');
  return KNOWN_VENDORS.get(lab.id) || '';
}

export function normalizeLabs(data) {
  const rows = Array.isArray(data) ? data : Array.isArray(data?.labs) ? data.labs : [];
  return rows.map((row) => {
    const status = String(row.status || '').toLowerCase();
    return {
      id: String(row.id || ''),
      title: String(row.title || row.name || row.id || ''),
      url: String(row.url || ''),
      repo: String(row.repo || row.source || ''),
      status,
      vendorsReferenced: Array.isArray(row.vendorsReferenced) ? row.vendorsReferenced.map(String) : [],
    };
  }).filter((lab) => lab.id);
}

export async function loadLabs() {
  const paths = ['/data/labs.json', '/labs.json'];
  for (const path of paths) {
    try {
      const response = await fetch(path, { headers: { accept: 'application/json' } });
      if (!response.ok) continue;
      return normalizeLabs(await response.json());
    } catch {
      // Try the next manifest path.
    }
  }
  return [];
}
