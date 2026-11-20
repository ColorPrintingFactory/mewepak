import { bookingDateNow, renderBookingTimeZones } from './booking-timezones.js?v=1';

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
      const initialDate = !scheduleZone && requested === date.min;
      scheduleZone=data.timezone;
      date.min=bookingDateNow(scheduleZone);
      if (requested < date.min || (initialDate && requested !== date.min)) {
        date.value=date.min;
        return load();
      }
      renderBookingTimeZones(zone, data.timezones, requested, scheduleZone);
      const zoneName=new Intl.DateTimeFormat(lang,{timeZone:scheduleZone,timeZoneName:'longGeneric'})
        .formatToParts(new Date(requested + 'T12:00:00Z')).find(part=>part.type==='timeZoneName')?.value || scheduleZone;
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
  date.min=bookingDateNow();
  date.value=date.min;
  date.addEventListener('change',load);
  form.addEventListener('mwl-booking-saved',()=> {
    date.value=bookingDateNow(scheduleZone);
    load();
  });
  form.addEventListener('mwl-booking-conflict',load);
  load();
})();
