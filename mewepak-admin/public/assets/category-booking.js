(async () => {
  const enquiryForm = document.querySelector('form[data-category-enquiry]');
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!enquiryForm.reportValidity()) return;
      const data = new FormData(enquiryForm);
      const field = (name) => String(data.get(name) || '').trim();
      const payload = {
        category: field('category').slice(0, 120),
        name: field('name').slice(0, 120),
        email: field('email').slice(0, 254),
        company: field('company').slice(0, 160),
        country: field('country').slice(0, 100),
        application: field('application').slice(0, 160),
        quantity: field('quantity').slice(0, 100),
        dimensions: field('dimensions').slice(0, 120),
        format: field('format').slice(0, 160),
        notes: field('notes').slice(0, 1500),
      };
      try {
        sessionStorage.setItem('mewepakCategoryEnquiryV1', JSON.stringify(payload));
      } catch {
        // Do not fall back to a query string containing contact details.
      }
      window.location.assign('/inquiry/#quote-request');
    });
  }

  const preview = document.querySelector('.mewepak-booking-schedule--inline');
  if (!preview) return;

  const grid = preview.querySelector('.mewepak-booking-schedule__row');
  const note = preview.querySelector('.mewepak-booking-schedule__note');
  try {
    const response = await fetch('/api/booking-upcoming');
    if (!response.ok) throw new Error('Could not read availability.');
    const { timezone, slots } = await response.json();
    if (!slots.length) {
      note.textContent = 'No open times in the next two weeks. Check the booking page for later dates.';
      return;
    }

    const labels = new Intl.DateTimeFormat('en', {
      timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric',
    });
    grid.replaceChildren(...slots.map(({ date, window }) => {
      const slot = document.createElement('div');
      slot.className = 'mewepak-booking-schedule__slot';
      const day = document.createElement('span');
      day.textContent = labels.format(new Date(date + 'T00:00:00Z'));
      const time = document.createElement('strong');
      time.textContent = window.slice(0, 5);
      slot.append(day, time);
      return slot;
    }));
    const zone = new Intl.DateTimeFormat('en', { timeZone: timezone, timeZoneName: 'longGeneric' })
      .formatToParts().find(({ type }) => type === 'timeZoneName');
    note.textContent = 'Times shown in ' + (zone?.value || timezone) + '. Confirm your time on the booking page.';
  } catch {
    note.textContent = 'Open the booking page to check consultation times.';
  }
})();
