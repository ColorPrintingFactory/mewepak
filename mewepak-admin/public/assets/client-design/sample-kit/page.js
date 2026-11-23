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
  const email = 'sales@mewepak.com';
  const scrollBehavior = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  let brief = '';

  function syncFormats() {
    const selected = formatInputs.filter(input => input.checked).map(input => input.value);
    page.querySelector('#selectionSummary').textContent = selected.join(' · ') || 'No formats selected yet.';
    for (const card of formatCards) {
      const checked = selected.includes(card.dataset.format);
      card.classList.toggle('chosen', checked);
      const button = card.querySelector('.format-toggle');
      button.setAttribute('aria-pressed', String(checked));
      button.textContent = checked ? 'Selected' : 'Add to my request';
    }
  }

  function syncApproach() {
    for (const button of approachButtons) {
      const active = button.dataset.approach === approach.value;
      button.setAttribute('aria-pressed', String(active));
      const label = button.dataset.approach === 'Fully custom printed bag' ? 'Explore fully printed bags' : 'Explore labelled bags';
      button.textContent = active ? 'Added to your request' : label;
    }
  }

  form.addEventListener('input', event => {
    review.hidden = true;
    if (event.target.name === 'formats') syncFormats();
    if (event.target.name === 'approach') syncApproach();
  });

  for (const card of formatCards) {
    card.querySelector('.format-toggle').addEventListener('click', () => {
      const input = formatInputs.find(item => item.value === card.dataset.format);
      input.checked = !input.checked;
      syncFormats();
      review.hidden = true;
    });
  }

  for (const button of approachButtons) {
    button.addEventListener('click', () => {
      approach.value = button.dataset.approach;
      syncApproach();
      review.hidden = true;
      page.querySelector('#request').scrollIntoView({ behavior: scrollBehavior() });
    });
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    brief = [
      'MewePak sample kit enquiry',
      '',
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Company: ${data.get('company')}`,
      `Country / region: ${data.get('country')}`,
      `Product / industry: ${data.get('product')}`,
      `Target fill weight: ${data.get('weight') || 'To discuss'}`,
      `Formats: ${data.getAll('formats').join(', ') || 'Please recommend'}`,
      `Branding approach: ${data.get('approach')}`,
      '',
      `Project notes: ${data.get('notes') || 'Please help me select suitable examples.'}`,
      '',
      'Please confirm sample availability, kit contents, any kit and shipping costs, and estimated delivery arrangements before dispatch.',
    ].join('\n');
    page.querySelector('#brief').textContent = brief;
    const subject = encodeURIComponent(`Sample kit enquiry — ${data.get('company')}`);
    page.querySelector('#emailDraft').href = `mailto:${email}?subject=${subject}&body=${encodeURIComponent(brief)}`;
    copyStatus.textContent = '';
    review.hidden = false;
    review.focus({ preventScroll: true });
    review.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
  });

  page.querySelector('#copyBrief').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(brief);
      copyStatus.textContent = `Request copied. Paste it into your email to ${email}.`;
    } catch {
      copyStatus.textContent = 'Select and copy the request text above, or download it below.';
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
