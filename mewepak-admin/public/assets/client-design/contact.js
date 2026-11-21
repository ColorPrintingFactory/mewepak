
(() => {
  const page = document.querySelector('.contact-page');
  if (!page) return;

  const form = page.querySelector('#ct-enquiry-form');
  const formHeading = page.querySelector('#ct-form-title');
  const callFields = page.querySelector('#ct-call-fields');
  const review = page.querySelector('#ct-review');
  const reviewHeading = page.querySelector('#ct-review-heading');
  const reviewCall = page.querySelector('#ct-review-call');
  const download = page.querySelector('#ct-download-brief');
  const modes = {
    quote: {
      title: 'Packaging quote',
      hint: 'Share your product and any pack specifications you already have.',
      placeholder: 'Tell us about your product, artwork, filling or storage needs…',
    },
    samples: {
      title: 'Sample enquiry',
      hint: 'Tell us which formats and features you would like to see.',
      placeholder: 'Describe the sample formats, sizes or finishes you are interested in…',
    },
    general: {
      title: 'General question',
      hint: 'Ask about materials, artwork or another packaging question.',
      placeholder: 'How can we help with your packaging question?',
    },
    call: {
      title: 'Expert call request',
      hint: 'Tell us what you’d like to discuss. We’ll confirm a time by email.',
      placeholder: 'What would you like to cover on the call?',
    },
  };
  let mode = 'quote';

  function clearReview() {
    review.hidden = true;
    download.removeAttribute('href');
  }

  const buttons = [...page.querySelectorAll('.ct-mode')];
  const productRequiredLabel = page.querySelector('#ct-product-required');
  const modeHint = page.querySelector('#ct-mode-hint');

  function selectMode(nextMode) {
    mode = nextMode;
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
    }
    const productRequired = mode === 'quote' || mode === 'samples';
    form.elements.product.required = productRequired;
    form.elements.product.setCustomValidity('');
    productRequiredLabel.hidden = !productRequired;
    callFields.hidden = mode !== 'call';
    callFields.disabled = callFields.hidden;
    modeHint.textContent = modes[mode].hint;
    form.elements.notes.placeholder = modes[mode].placeholder;
    clearReview();
  }

  const params = new URLSearchParams(window.location.search);
  const topic = params.get('topic');
  if (Object.hasOwn(modes, topic)) selectMode(topic);
  const topicLabels = {
    events: 'Trade show or event enquiry',
    careers: 'Careers enquiry',
    'impact-report': 'Supplier documentation request',
    'operations-evidence': 'Environmental operations evidence request',
    'social-evidence': 'Social and workforce evidence request',
    'delivery-assessment': 'Packaging delivery enquiry',
    'quality-documentation': 'Supplier quality documentation request',
  };
  if (Object.hasOwn(topicLabels, topic)) {
    selectMode('general');
    const lines = [topicLabels[topic]];
    if (topic === 'delivery-assessment') {
      const regions = {
        'north-america': 'North America', europe: 'Europe', 'asia-pacific': 'Asia Pacific',
        'middle-east-africa': 'Middle East or Africa', 'latin-america': 'Latin America', other: 'Other or multiple regions',
      };
      const region = params.get('region');
      if (Object.hasOwn(regions, region)) lines.push('Destination region: ' + regions[region]);
    }
    if (topic === 'quality-documentation') {
      const documents = {
        certificate: 'Certificate or audit record', declaration: 'Material or compliance declaration',
        specification: 'Specification or test record', traceability: 'Inspection or traceability record', other: 'Other or multiple documents',
      };
      const documentKey = params.get('document');
      if (Object.hasOwn(documents, documentKey)) lines.push('Requested document: ' + documents[documentKey]);
    }
    form.elements.notes.value ||= lines.join('\n') + '\n';
  }

  for (const button of buttons) {
    button.addEventListener('click', () => selectMode(button.dataset.mode));
  }

  for (const option of page.querySelectorAll('[data-ct-call-duration]')) {
    option.addEventListener('click', () => {
      form.elements.callDuration.value = option.dataset.ctCallDuration;
      selectMode('call');
      formHeading.focus({ preventScroll: true });
    });
  }

  form.addEventListener('input', (event) => {
    event.target.setCustomValidity('');
    clearReview();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    for (const field of form.querySelectorAll('[required]')) {
      field.setCustomValidity(field.value.trim() ? '' : 'Please fill in this field.');
    }
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const get = (name) => String(data.get(name) || '').trim();
    const show = (name) => get(name) || 'Not provided';
    const title = modes[mode].title;
    const fields = {
      'Enquiry type': title,
      Name: get('name'),
      Email: get('email'),
      Company: show('company'),
      'Country / region': show('country'),
      Product: show('product'),
      'Preferred format': show('format'),
      'Approximate quantity': show('quantity'),
      'Pack size / fill weight': show('size'),
    };
    const summary = {
      type: title,
      name: `${get('name')} / ${get('email')}`,
      company: `${show('company')} / ${show('country')}`,
      product: show('product'),
      format: show('format'),
      quantity: `${show('quantity')} / ${show('size')}`,
      notes: get('notes'),
    };
    reviewCall.hidden = mode !== 'call';
    if (!reviewCall.hidden) {
      fields['Call length'] = `${get('callDuration')} minutes`;
      fields['Preferred times / time zone'] = get('callAvailability') || 'Flexible';
      summary['call-details'] = `${fields['Call length']} · ${fields['Preferred times / time zone']}`;
    }
    for (const [key, value] of Object.entries(summary)) {
      page.querySelector(`#ct-review-${key}`).textContent = value;
    }

    const details = Object.entries(fields).map(([label, value]) => `${label}: ${value}`).join('\n');
    const body = `Hello Mewepak,\n\n${details}\n\nProject notes:\n${get('notes')}\n\nThank you.`;
    window.mewepakClient.fillBrief('ct', data, body, show('format'));
    download.href = `data:text/plain;charset=utf-8,${encodeURIComponent(body)}`;
    review.hidden = false;
    reviewHeading.focus();
  });

  page.querySelector('#ct-edit').addEventListener('click', () => {
    clearReview();
    form.elements.name.focus();
  });
})();
