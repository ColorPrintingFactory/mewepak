import { toolText } from '../../tool-language.js';

(() => {
  const page = document.querySelector('.mw-sample-kit');
  if (!page) return;

  const form = page.querySelector('#sampleForm');
  const review = page.querySelector('#review');
  const copyStatus = page.querySelector('#copyStatus');
  const formatCards = [...page.querySelectorAll('.format-card')];
  const formatInputs = [...form.elements.formats];
  const approachButtons = [...page.querySelectorAll('.comparison-choice')];
  const approach = form.elements.approach;
  const email = document.body.dataset.mewepakContactEmail || 'sales@mewepak.com';
  const sendForm = page.querySelector('#sample-send');
  const scrollBehavior = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  const formatsBySlug = new Map([
    ['stand-up-pouch', 'Stand-up pouches'],
    ['flat-bottom-pouch', 'Flat-bottom pouches'],
    ['flat-pouch', 'Flat pouches'],
    ['roll-stock-films', 'Rollstock'],
  ]);
  const requestedFormat = formatsBySlug.get(new URLSearchParams(location.search).get('format'));
  const matchingInput = formatInputs.find(input => input.value === requestedFormat);
  if (matchingInput) matchingInput.checked = true;
  let brief = '';

  function syncFormats() {
    const selected = formatInputs.filter(input => input.checked).map(input => input.value);
    page.querySelector('#selectionSummary').textContent = selected.map(value => toolText(value)).join(' · ') || toolText('No formats selected yet.');
    for (const card of formatCards) {
      const checked = selected.includes(card.dataset.format);
      card.classList.toggle('chosen', checked);
      const button = card.querySelector('.format-toggle');
      button.setAttribute('aria-pressed', String(checked));
      button.textContent = toolText(checked ? 'Selected' : 'Add to my request');
    }
  }

  function syncApproach() {
    for (const button of approachButtons) {
      const active = button.dataset.approach === approach.value;
      button.setAttribute('aria-pressed', String(active));
      const label = button.dataset.approach === 'Fully custom printed bag' ? 'Explore fully printed bags' : 'Explore labelled bags';
      button.textContent = toolText(active ? 'Added to your request' : label);
    }
  }

  function hideReview() {
    review.hidden = true;
    sendForm.querySelector('[data-quote-message]').textContent = '';
  }

  form.addEventListener('input', event => {
    hideReview();
    if (event.target.name === 'formats') syncFormats();
    if (event.target.name === 'approach') syncApproach();
  });

  for (const card of formatCards) {
    card.querySelector('.format-toggle').addEventListener('click', () => {
      const input = formatInputs.find(item => item.value === card.dataset.format);
      input.checked = !input.checked;
      syncFormats();
      hideReview();
    });
  }

  for (const button of approachButtons) {
    button.addEventListener('click', () => {
      approach.value = button.dataset.approach;
      syncApproach();
      hideReview();
      page.querySelector('#request').scrollIntoView({ behavior: scrollBehavior() });
    });
  }

  function buildBrief(data, text) {
    const line = (label, value) => text(label) + ': ' + value;
    return [
      text('Mewepak sample kit enquiry'),
      '',
      line('Name', data.get('name')),
      line('Email address', data.get('email')),
      line('Company', data.get('company')),
      line('Country / region', data.get('country')),
      line('Product / industry', data.get('product')),
      line('Target fill weight', data.get('weight') || text('To discuss')),
      line('Formats', data.getAll('formats').map(value => text(value)).join(', ') || text('Please recommend')),
      line('Branding approach', text(data.get('approach'))),
      '',
      line('Project notes', data.get('notes') || text('Please help me select suitable examples.')),
      '',
      text('Please confirm sample availability, kit contents, any kit and shipping costs, and estimated delivery arrangements before dispatch.'),
    ].join('\n');
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    brief = buildBrief(data, toolText);
    page.querySelector('#brief').textContent = brief;
    const subject = encodeURIComponent(toolText('Sample kit enquiry — {company}', { company: data.get('company') }));
    page.querySelector('#emailDraft').href = `mailto:${email}?subject=${subject}&body=${encodeURIComponent(brief)}`;
    copyStatus.textContent = '';
    review.hidden = false;
    review.focus({ preventScroll: true });
    review.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
  });

  sendForm.addEventListener('formdata', ({ formData }) => {
    const fields = new FormData(form);
    for (const name of ['name', 'email', 'company']) formData.set(name, fields.get(name));
    formData.set('product_type', 'Sample kit');
    formData.set('product_context', fields.get('product'));
    formData.set('details', buildBrief(fields, value => value));
  });

  page.querySelector('#copyBrief').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(brief);
      copyStatus.textContent = toolText('Request copied. Paste it into your email to {email}.', { email });
    } catch {
      copyStatus.textContent = toolText('Select and copy the request text above, or download it below.');
    }
  });

  page.querySelector('#downloadBrief').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([brief], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Mewepak_Sample_Request.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  syncFormats();
  syncApproach();
  form.querySelector('button[type="submit"]').disabled = false;
})();
