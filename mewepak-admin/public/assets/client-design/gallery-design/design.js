(() => {
  const page = document.querySelector('.design-page');
  if (!page) return;

  const cards = [...page.querySelectorAll('[data-gallery-card]')];
  const filters = [...page.querySelectorAll('[data-market-filter]')];
  const resultCount = page.querySelector('#dg-result-count');
  const more = page.querySelector('#dg-more');
  const pageSize = 6;
  let market = 'all';
  let limit = pageSize;

  function updateGallery() {
    const matching = cards.filter((card) => market === 'all' || card.dataset.market === market);
    const visible = matching.slice(0, limit);
    for (const card of cards) card.hidden = !visible.includes(card);
    for (const filter of filters) {
      filter.setAttribute('aria-pressed', String(filter.dataset.marketFilter === market));
    }
    resultCount.textContent = `Showing ${visible.length} of ${matching.length} concepts`;
    more.hidden = visible.length >= matching.length;
    return visible;
  }

  for (const filter of filters) {
    filter.addEventListener('click', () => {
      market = filter.dataset.marketFilter;
      limit = pageSize;
      updateGallery();
    });
  }
  for (const link of page.querySelectorAll('.dg-hero-tile')) {
    link.addEventListener('click', () => {
      const card = document.getElementById(link.hash.slice(1));
      if (!card?.hidden) return;
      market = 'all';
      limit = pageSize;
      updateGallery();
    });
  }
  page.querySelector('#dg-show-more').addEventListener('click', () => {
    const previousLimit = limit;
    limit += pageSize;
    const visible = updateGallery();
    visible[previousLimit]?.querySelector('.image-magnifier').focus();
  });
  page.querySelector('#dg-filter-row').hidden = false;
  updateGallery();

  const form = page.querySelector('#dg-design-form');
  const draft = page.querySelector('#dg-draft');
  const draftLink = page.querySelector('#dg-open-email');
  const reference = page.querySelector('#dg-reference');

  function clearDraft() {
    draft.hidden = true;
    draftLink.removeAttribute('href');
  }

  for (const action of page.querySelectorAll('[data-design-request]')) {
    action.addEventListener('click', () => {
      form.elements.request.value = action.dataset.designRequest;
      clearDraft();
    });
  }

  form.addEventListener('input', (event) => {
    event.target.setCustomValidity('');
    clearDraft();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    for (const control of form.querySelectorAll('[required]')) {
      control.setCustomValidity(control.value.trim() ? '' : 'Please complete this field.');
    }
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const value = (key) => String(data.get(key) || '').trim();
    const request = value('request');
    const lines = [
      'Hello MewePak,',
      '',
      `Request: ${request}`,
      `Name: ${value('name')}`,
      `Email: ${value('email')}`,
    ];
    if (value('reference')) lines.push(`Inspiration or portfolio: ${value('reference')}`);
    lines.push('', value('details'), '', 'Thank you.');
    const body = lines.join('\n');
    draftLink.href = `${page.dataset.salesEmail}?subject=${encodeURIComponent(request + ' enquiry')}&body=${encodeURIComponent(body)}`;
    page.querySelector('#dg-draft-copy').textContent = body;
    draft.hidden = false;
    page.querySelector('#dg-draft-title').focus();
  });
  form.hidden = false;

  for (const link of page.querySelectorAll('[data-use-reference]')) {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      reference.value = link.closest('[data-gallery-card]').querySelector('h3').textContent;
      clearDraft();
      requestAnimationFrame(() => reference.focus({ preventScroll: true }));
    });
  }
})();
