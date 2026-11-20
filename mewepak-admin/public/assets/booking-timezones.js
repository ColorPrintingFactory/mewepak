const groupFor = {
  UTC: '001',
  America: '019',
  'Pacific/Honolulu': '019',
  'Atlantic/Reykjavik': '150',
  Europe: '150',
  Asia: '142',
  Africa: '002',
  Indian: '002',
  Australia: '009',
  Pacific: '009',
};

const aliases = {
  'Asia/Calcutta': 'Asia/Kolkata',
  'Asia/Katmandu': 'Asia/Kathmandu',
  'Asia/Rangoon': 'Asia/Yangon',
  'Asia/Saigon': 'Asia/Ho_Chi_Minh',
  'America/Buenos_Aires': 'America/Argentina/Buenos_Aires',
  'Europe/Kiev': 'Europe/Kyiv',
  'Etc/UTC': 'UTC',
};

function canonicalZone(zone) {
  const resolved = new Intl.DateTimeFormat('en', { timeZone: zone }).resolvedOptions().timeZone;
  return aliases[resolved] || resolved;
}

export function bookingDateNow(timeZone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

export function renderBookingTimeZones(select, zones, date, scheduleZone) {
  const previous = select.value;
  const locale = document.documentElement.lang || 'en';
  const browserZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
  const time = new Date(date + 'T12:00:00Z');
  const groupNames = new Intl.DisplayNames([locale], { type: 'region' });
  const groups = new Map(Object.values(groupFor).map(code => [code, []]));
  const options = new Map();

  for (const [zone, label] of Object.entries(zones || {})) {
    try {
      const format = new Intl.DateTimeFormat('en', { timeZone: zone, timeZoneName: 'longOffset' });
      const utcOffset = format.formatToParts(time).find(part => part.type === 'timeZoneName').value.replace('GMT', 'UTC');
      const city = String(label).replace(/^UTC\s*[+-]\d{1,2}:\d{2}\s+/i, '');
      const option = new Option(city + ' (' + utcOffset + ')', zone);
      options.set(zone, option);
      const group = groupFor[zone] || groupFor[zone.split('/')[0]] || '001';
      groups.get(group).push(option);
    } catch {
      // Leave invalid administrator-provided zones out of the selector.
    }
  }
  if (!options.size) return;

  const deviceZone = canonicalZone(browserZone);
  const preferredZone = options.has(browserZone) ? browserZone
    : [...options.keys()].find(zone => canonicalZone(zone) === deviceZone);
  const fallbackZone = options.has(scheduleZone) ? scheduleZone : options.keys().next().value;
  const selected = options.has(previous) ? previous : preferredZone || fallbackZone;
  const collator = new Intl.Collator(locale);
  const nodes = [];
  for (const [code, choices] of groups) {
    if (!choices.length) continue;
    const group = document.createElement('optgroup');
    group.label = groupNames.of(code);
    group.append(...choices.sort((left, right) => collator.compare(left.text, right.text)));
    nodes.push(group);
  }
  const current = options.get(selected);
  current.selected = true;
  current.defaultSelected = true;
  select.replaceChildren(...nodes);
  select.value = selected;
}
