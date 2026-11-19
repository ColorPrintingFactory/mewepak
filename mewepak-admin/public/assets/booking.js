(() => {
  'use strict';

  const form = document.querySelector('[data-booking-form]');
  if (!form) return;

  const topic = new URLSearchParams(window.location.search).get('topic');
  if (topic === 'coffee-tea' && !form.elements.topic.value) {
    form.elements.topic.value = 'Coffee and tea packaging consultation';
  }

  const dateInput = form.elements.date;
  const timezone = form.elements.timezone;
  const timeInput = form.elements.time;
  const week = form.querySelector('[data-booking-week]');
  const slots = form.querySelector('[data-slot-grid]');
  const slotStatus = form.querySelector('[data-booking-slot-status]');
  const retry = form.querySelector('[data-booking-retry]');
  const scheduleZone = form.querySelector('[data-booking-schedule-zone]');
  const durations = form.querySelector('[data-duration-options]');
  const status = form.querySelector('[data-form-status]');
  const summary = form.querySelector('[data-booking-summary]');
  const summaryTime = form.querySelector('[data-booking-summary-time]');
  const summaryType = form.querySelector('[data-booking-summary-type]');
  const verification = form.querySelector('[data-turnstile]');
  const verificationStatus = form.querySelector('[data-booking-verification-status]');
  const submit = form.querySelector('button[type="submit"]');
  const submitLabel = submit.querySelector('[data-booking-submit-label]');
  const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const utcDate = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short' });
  const fallbackZones = {
    'Asia/Shanghai': 'China',
    'America/New_York': 'New York',
    'Europe/London': 'London',
    'Asia/Dubai': 'Dubai',
  };
  let availabilityRequest;
  let turnstileWidget = null;
  let zoneLabel = '';

  function localDateKey() {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  function asDate(value) {
    return new Date(value + 'T12:00:00Z');
  }

  function showStatus(message, state = 'error') {
    status.textContent = message;
    status.dataset.state = state;
    status.hidden = !message;
  }

  function showSlotStatus(message, canRetry = false) {
    slotStatus.textContent = message;
    slotStatus.hidden = !message;
    retry.hidden = !canRetry;
  }

  function describeScheduleZone(value, date) {
    if (!value) return '';
    try {
      const format = new Intl.DateTimeFormat('en-US', { timeZone: value, timeZoneName: 'longGeneric' });
      return format.formatToParts(asDate(date)).find(part => part.type === 'timeZoneName')?.value || value;
    } catch {
      return value;
    }
  }

  function formatWindow(window) {
    return window.replace('-', '–');
  }

  function updateSummary() {
    const time = timeInput.value;
    const date = dateInput.value;
    const duration = form.elements.duration.value;
    summary.hidden = !time || !date || !duration;
    if (summary.hidden) return;
    summaryTime.textContent = [utcDate.format(asDate(date)), formatWindow(time), zoneLabel].filter(Boolean).join(' · ');
    const meeting = form.elements.meeting_type.value === 'factory_visit' ? 'Factory visit' : 'Video call';
    summaryType.textContent = duration + ' minutes · ' + meeting;
  }

  function renderWeek() {
    const selected = dateInput.value;
    const start = asDate(dateInput.min);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);
    const selectedDate = asDate(selected);
    if (selectedDate > end) start.setTime(selectedDate.getTime());

    const focusDate = week.contains(document.activeElement) ? document.activeElement.dataset.date : '';
    const buttons = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(start);
      day.setUTCDate(day.getUTCDate() + index);
      const key = day.toISOString().slice(0, 10);
      const button = document.createElement('button');
      button.className = 'bk-day';
      button.type = 'button';
      button.dataset.date = key;
      button.setAttribute('aria-label', utcDate.format(day));
      button.setAttribute('aria-pressed', String(key === selected));
      const name = document.createElement('span');
      name.textContent = weekday.format(day);
      const number = document.createElement('strong');
      number.textContent = day.getUTCDate();
      button.append(name, number);
      return button;
    });
    week.replaceChildren(...buttons);
    week.hidden = false;
    if (focusDate) buttons.find(button => button.dataset.date === focusDate)?.focus({ preventScroll: true });
  }

  function renderOptions(data, date) {
    document.querySelector('[data-booking-title]').textContent = data.display_title || 'Meet with Mewepak';
    document.querySelector('[data-booking-location]').textContent = data.display_location || 'Zoom / Factory Visit';

    const configuredZones = Object.entries(data.timezones || {});
    const choices = configuredZones.length ? configuredZones : Object.entries(fallbackZones);
    const currentOptions = [...timezone.options];
    const sameChoices = choices.length === currentOptions.length
      && choices.every(([zone, label], index) => currentOptions[index].value === zone && currentOptions[index].text === label);
    if (!sameChoices) {
      const previous = timezone.value;
      const zones = choices.map(([zone]) => zone);
      const selected = zones.includes(previous) ? previous : zones.includes(browserZone) ? browserZone : zones[0];
      timezone.replaceChildren(...choices.map(([zone, label]) => new Option(label, zone, zone === selected, zone === selected)));
    }

    const options = data.meeting_durations?.length ? data.meeting_durations : [15, 30];
    const previousDuration = form.elements.duration.value;
    const chosenDuration = options.map(String).includes(previousDuration) ? previousDuration : String(options[0]);
    const existing = [...durations.querySelectorAll('input')].map(input => input.value);
    if (existing.join('|') !== options.join('|')) {
      durations.replaceChildren(...options.map(duration => {
        const label = document.createElement('label');
        label.className = 'bk-choice';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'duration';
        input.value = duration;
        input.defaultChecked = String(duration) === String(options[0]);
        input.checked = String(duration) === chosenDuration;
        const text = document.createElement('span');
        text.textContent = duration + ' min';
        label.append(input, text);
        return label;
      }));
    }

    zoneLabel = describeScheduleZone(data.timezone, date);
    scheduleZone.textContent = zoneLabel ? 'Time windows are shown in ' + zoneLabel + '.' : '';
    scheduleZone.hidden = !zoneLabel;
  }

  async function loadSlots() {
    availabilityRequest?.abort();
    const date = dateInput.value;
    timeInput.value = '';
    slots.replaceChildren();
    updateSummary();
    renderWeek();
    if (date === '' || !dateInput.validity.valid) {
      showSlotStatus('Choose a valid appointment date to see available times.');
      slots.removeAttribute('aria-busy');
      return;
    }

    const request = new AbortController();
    availabilityRequest = request;
    slots.setAttribute('aria-busy', 'true');
    showSlotStatus('Loading available times…');
    try {
      const response = await fetch('/api/booking-slots?date=' + encodeURIComponent(date), { signal: request.signal });
      const data = await response.json();
      if (request.signal.aborted) return;
      if (!response.ok) throw new Error(data.error || 'Could not load available times.');
      renderOptions(data, date);
      const windows = data.slots || [];
      const buttons = windows.map(window => {
        const button = document.createElement('button');
        button.className = 'bk-slot';
        button.type = 'button';
        button.dataset.slot = window;
        button.textContent = formatWindow(window);
        button.setAttribute('aria-pressed', 'false');
        return button;
      });
      slots.replaceChildren(...buttons);
      showSlotStatus(windows.length ? '' : 'No times are available on this date. Choose another date.');
    } catch (error) {
      if (!request.signal.aborted) showSlotStatus(error.message || 'Could not load available times.', true);
    } finally {
      if (!request.signal.aborted) slots.removeAttribute('aria-busy');
    }
  }

  function waitForTurnstile(script) {
    if (window.turnstile) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => finish(reject), 10000);
      function finish(result) {
        clearTimeout(timeout);
        controller.abort();
        result();
      }
      script.addEventListener('load', () => finish(window.turnstile ? resolve : reject), { signal: controller.signal });
      script.addEventListener('error', () => finish(reject), { signal: controller.signal });
    });
  }

  async function configureTurnstile() {
    try {
      const response = await fetch('/api/config');
      const config = await response.json();
      if (!config.turnstileSiteKey) throw new Error('Missing verification configuration.');
      await waitForTurnstile(document.querySelector('[data-booking-verification]'));
      turnstileWidget = window.turnstile.render(verification, {
        sitekey: config.turnstileSiteKey,
        theme: 'light',
        size: window.matchMedia('(max-width: 374px)').matches ? 'compact' : 'flexible',
      });
    } catch {
      verificationStatus.textContent = 'Verification could not load. Refresh the page to try again.';
      verificationStatus.hidden = false;
    }
  }

  week.addEventListener('click', event => {
    const button = event.target.closest('[data-date]');
    if (!button || button.dataset.date === dateInput.value) return;
    dateInput.value = button.dataset.date;
    loadSlots();
  });
  slots.addEventListener('click', event => {
    const button = event.target.closest('[data-slot]');
    if (!button) return;
    slots.querySelector('[aria-pressed="true"]')?.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-pressed', 'true');
    timeInput.value = button.dataset.slot;
    if (status.dataset.state !== 'success') showStatus('');
    updateSummary();
  });
  retry.addEventListener('click', loadSlots);
  dateInput.addEventListener('change', loadSlots);
  form.addEventListener('change', event => {
    if (['meeting_type', 'duration'].includes(event.target.name)) updateSummary();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.disabled) return;
    showStatus('');
    const data = new FormData(form);
    const token = turnstileWidget !== null ? window.turnstile.getResponse(turnstileWidget) : '';
    if (!data.get('time')) return showStatus('Please choose an available time.');
    if (!token) return showStatus('Please complete the verification before booking.');

    submit.disabled = true;
    submitLabel.textContent = 'Sending request…';
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          date: data.get('date'), time: data.get('time'), timezone: data.get('timezone'),
          duration: Number(data.get('duration')), meeting_type: data.get('meeting_type'),
          name: data.get('name'), company: data.get('company'), email: data.get('email'),
          phone: data.get('phone'), topic: data.get('topic'), turnstile_token: token,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 409) loadSlots();
        throw new Error(result.error || 'The booking could not be saved.');
      }
      form.reset();
      dateInput.min = localDateKey();
      dateInput.value = dateInput.min;
      showStatus('Your consultation request has been received.', 'success');
      loadSlots();
    } catch (error) {
      showStatus(error.message || 'The request could not be sent. Please try again.');
    } finally {
      window.turnstile.reset(turnstileWidget);
      submit.disabled = false;
      submitLabel.textContent = 'Request consultation';
    }
  });

  dateInput.min = localDateKey();
  dateInput.value = dateInput.min;
  loadSlots();
  configureTurnstile();
})();
