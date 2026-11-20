(() => {
  const form = document.querySelector('[data-mewepak-booking]');
  if (!form) return;
  const { date, time, duration, customer_timezone: zone } = form.elements;
  const status = form.querySelector('[data-slot-status]');
  const timezone = form.querySelector('[data-slot-zone]');
  const t = form.dataset;
  const lang = document.documentElement.lang;
  const placeholder = () => new Option(t.choose, '');
  let availability;
  let scheduleZone;
  function today(inZone) {
    const dateTime = new Intl.DateTimeFormat('en-CA', { year:'numeric',month:'2-digit',day:'2-digit',timeZone:inZone });
    return dateTime.format(new Date());
  }
  function resetSlots() {
    time.replaceChildren(placeholder());
    duration.replaceChildren(placeholder());
  }
  async function load() {
    availability?.abort();
    const controller = new AbortController();
    availability=controller;
    resetSlots();
    timezone.textContent='';
    if (!date.value || !date.validity.valid) return;
    status.textContent=t.loading;
    try {
      const requested = date.value;
      const response = await fetch('/api/booking-slots?date=' + encodeURIComponent(requested), {
        signal:AbortSignal.any([controller.signal,AbortSignal.timeout(12000)]),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (controller.signal.aborted || date.value !== requested) return;
      scheduleZone=data.timezone;
      date.min=today(scheduleZone);
      if (date.value < date.min) {
        date.value=date.min;
        return load();
      }
      const zoneName=new Intl.DateTimeFormat(lang,{timeZone:scheduleZone,timeZoneName:'long'})
        .formatToParts(new Date()).find(part=>part.type==='timeZoneName')?.value || scheduleZone;
      timezone.textContent=t.zone + ' ' + zoneName;
      const hm=new Intl.DateTimeFormat(lang,{timeZone:'UTC',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
      const display=value=>hm.format(new Date('2000-01-01T'+value+':00Z'));
      for (const slot of data.slots) {
        if (!/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(slot)) continue;
        time.add(new Option(slot.split('-').map(display).join(' – '),slot));
      }
      const minutes=new Intl.NumberFormat(lang,{style:'unit',unit:'minute',unitDisplay:'short'});
      for (const value of data.meeting_durations) {
        if (!Number.isInteger(value) || value < 5 || value > 240) continue;
        duration.add(new Option(minutes.format(value),String(value)));
      }
      if (duration.options.length > 1) duration.selectedIndex=1;
      status.textContent=time.options.length > 1 ? '' : t.none;
    } catch {
      if (!controller.signal.aborted) status.textContent=t.unavailable;
    }
  }
  zone.value=Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  date.min=today('UTC');
  date.value=date.min;
  date.addEventListener('change',load);
  form.addEventListener('mwl-booking-saved',()=> {
    zone.value=Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    date.value=today(scheduleZone||'UTC');
    load();
  });
  form.addEventListener('mwl-booking-conflict',load);
  load();
})();
