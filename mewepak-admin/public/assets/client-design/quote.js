
(() => {
  const page = document.querySelector('.quote-page');
  if (!page) return;

  const form = page.querySelector('#qt-form');
  const steps = [...form.querySelectorAll('[data-quote-step]')];
  const progress = page.querySelector('#qt-steps');
  const indicators = [...progress.children];
  const status = page.querySelector('#qt-step-status');
  const back = page.querySelector('#qt-back');
  const nextLabel = page.querySelector('#qt-next-label');
  const guideSelection = page.querySelector('#qt-guide-selection');
  const review = page.querySelector('#qt-review');
  const reviewDetails = page.querySelector('#qt-review-details');
  const download = page.querySelector('#qt-download');
  const nextLabels = ['Continue to pack details', 'Continue to contact', 'Review my quote request'];
  let currentStep = 0;

  function showStep(index, moveFocus = true) {
    currentStep = index;
    for (const [stepIndex, step] of steps.entries()) {
      step.hidden = stepIndex !== index;
      indicators[stepIndex].classList.toggle('is-complete', stepIndex < index);
      if (stepIndex === index) indicators[stepIndex].setAttribute('aria-current', 'step');
      else indicators[stepIndex].removeAttribute('aria-current');
    }
    review.hidden = true;
    download.removeAttribute('href');
    guideSelection.hidden = true;
    form.hidden = false;
    progress.hidden = false;
    status.hidden = false;
    status.textContent = `Step ${index + 1} of ${steps.length}`;
    back.hidden = index === 0;
    nextLabel.textContent = nextLabels[index];
    if (moveFocus) steps[index].querySelector('h3').focus();
  }

  function showReview() {
    const formData = new FormData(form);
    const value = (name) => String(formData.get(name) || '').trim();
    const details = [
      ['Product', value('product')],
      ['Estimated order quantity', value('quantity')],
      ['Preferred format', value('format')],
      ['Pack size or fill weight', value('size')],
      ['Material preference', value('material')],
      ['Finish preference', value('finish')],
      ['Artwork status', value('artwork')],
      ['Target delivery', value('timing')],
      ['Features', formData.getAll('feature').join(', ')],
      ['Pouch concept', value('concept')],
      ['Name', value('name')],
      ['Email address', value('email')],
      ['Company or brand', value('company')],
      ['Country or region', value('region')],
      ['Project notes', value('notes')],
    ].filter(([, detail]) => detail);

    const rows = details.map(([label, detail]) => {
      const row = document.createElement('div');
      if (label === 'Project notes') row.className = 'qt-review-notes';
      const term = document.createElement('dt');
      term.textContent = label;
      const description = document.createElement('dd');
      description.textContent = detail;
      row.append(term, description);
      return row;
    });
    reviewDetails.replaceChildren(...rows);

    const subject = `Packaging quote request — ${value('product')}`;
    const brief = details.map(([label, detail]) => `${label}: ${detail}`).join('\n');
    const body = `Hello MewePak,\n\nI’d like a quote for this packaging project.\n\n${brief}\n\nThank you.`;
    download.href = `data:text/plain;charset=utf-8,${encodeURIComponent(body)}`;
    window.mewepakClient.fillBrief('qt', formData, brief);
    form.hidden = true;
    progress.hidden = true;
    guideSelection.hidden = true;
    status.textContent = 'Review';
    review.hidden = false;
    page.querySelector('#qt-review-title').focus();
  }

  form.addEventListener('input', (event) => {
    event.target.setCustomValidity('');
    guideSelection.hidden = true;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    for (const control of steps[currentStep].querySelectorAll('input, select, textarea')) {
      const blank = control.required && !control.value.trim();
      control.setCustomValidity(blank ? 'Please fill in this field.' : '');
      if (!control.reportValidity()) return;
    }
    if (currentStep < steps.length - 1) showStep(currentStep + 1);
    else showReview();
  });

  back.addEventListener('click', () => showStep(currentStep - 1));
  page.querySelector('#qt-edit').addEventListener('click', () => showStep(0));

  function showGuideSelection(message) {
    showStep(Math.min(currentStep, 1), false);
    guideSelection.hidden = false;
    guideSelection.textContent = message;
  }

  for (const action of page.querySelectorAll('[data-quote-material]')) {
    action.addEventListener('click', () => {
      form.elements.material.value = action.dataset.quoteMaterial;
      showGuideSelection(`${form.elements.material.value} added to Pack details.`);
    });
  }

  const artworkName = page.querySelector('#qt-artwork-name');
  const artworkTitle = page.querySelector('#qt-artwork-title');
  const paletteLabel = page.querySelector('#qt-artwork-palette');
  const concept = page.querySelector('#qt-concept');
  const palettes = [...page.querySelectorAll('input[name="conceptPalette"]')];

  function updateArtwork() {
    const palette = palettes.find((option) => option.checked).value;
    artworkTitle.textContent = artworkName.value.trim() || 'Your brand';
    paletteLabel.textContent = palette;
    concept.dataset.palette = palette;
  }

  artworkName.addEventListener('input', updateArtwork);
  for (const palette of palettes) palette.addEventListener('change', updateArtwork);
  updateArtwork();

  page.querySelector('#qt-use-concept').addEventListener('click', () => {
    updateArtwork();
    form.elements.concept.value = `${artworkTitle.textContent} · ${paletteLabel.textContent} · Stand-up pouch concept`;
    page.querySelector('#qt-concept-field').hidden = false;
    showGuideSelection('Pouch concept added to Pack details.');
  });

  showStep(0, false);

  try {
    const stored = sessionStorage.getItem('mewepakCategoryEnquiryV1');
    if (stored) {
      sessionStorage.removeItem('mewepakCategoryEnquiryV1');
      const source = JSON.parse(stored);
      const setValue = (name, value) => {
        const control = form.elements.namedItem(name);
        if (control && typeof value === 'string' && value.trim()) control.value = value.trim();
      };
      setValue('product', source.application);
      setValue('quantity', source.quantity);
      setValue('size', source.dimensions);
      setValue('name', source.name);
      setValue('email', source.email);
      setValue('company', source.company);
      setValue('region', source.country);
      const context = [
        source.category ? `Requested category: ${source.category}` : '',
        source.format ? `Format interest: ${source.format}` : '',
        source.notes || '',
      ].filter(Boolean).join('\n');
      if (context) form.elements.notes.value = context.slice(0, 1500);
    }
  } catch {
    sessionStorage.removeItem('mewepakCategoryEnquiryV1');
  }

  const enquiry = new URLSearchParams(location.search);
  form.elements.size.value = (enquiry.get('size') || '').trim().slice(0, 120);
  const finish = enquiry.get('finish');
  if ([...form.elements.finish.options].some(option => option.value === finish)) {
    form.elements.finish.value = finish;
  }
  const application = (enquiry.get('application') || '').trim().slice(0, 160);
  if (application) {
    const notes = form.elements.notes;
    notes.value = [notes.value, `Packaging application: ${application}`].filter(Boolean).join('\n').slice(0, 1500);
  }
  const format = form.dataset.previewFormat;
  if (format) {
    const options = [...form.querySelectorAll('input[name="format"]')];
    let match = options.find((option) => option.value.toLowerCase() === format.toLowerCase());
    if (!match) {
      const label = options.find((option) => option.value === 'Other format').closest('label').cloneNode(true);
      match = label.querySelector('input');
      match.value = format;
      label.querySelector('.qt-format-body > span').textContent = format;
      form.querySelector('.qt-formats').prepend(label);
    }
    match.checked = true;
    guideSelection.hidden = false;
    guideSelection.textContent = format + ' selected for this quote.';
  }
})();
