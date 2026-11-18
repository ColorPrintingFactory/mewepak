(() => {
  const forms = document.querySelectorAll('form[data-mewepak-quote], form[data-mewepak-subscribe]');
  if (!forms.length) return;
  let protection;
  function loadProtection() {
    protection ||= Promise.all([
      fetch('/api/config').then((response) => response.json()),
      new Promise((resolve, reject) => {
        if (window.turnstile) return resolve();
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.onload = resolve;
        script.onerror = () => { script.remove(); reject(new Error('Verification could not load. Please retry.')); };
        document.head.append(script);
      }),
    ]).then(([config]) => {
      if (!config.turnstileSiteKey || !window.turnstile) throw new Error('Verification is unavailable. Please retry.');
      return config.turnstileSiteKey;
    }).catch((error) => {
      protection = null;
      throw error;
    });
    return protection;
  }

  for (const form of forms) {
    const quote = form.hasAttribute('data-mewepak-quote');
    const type = quote ? 'quote' : 'newsletter';
    const message = form.querySelector(quote ? '[data-quote-message]' : '[data-subscribe-message]');
    const button = form.querySelector('button[type="submit"]');
    if (!message || !button) continue;
    const verification = document.createElement('div');
    verification.className = 'mt-3';
    message.before(verification);
    let widget;
    let pending = false;
    let token = '';
    let sending = false;
    const show = (text, error = false) => {
      message.textContent = text;
      message.classList.remove('hidden');
      message.classList.toggle('!text-red-600', error);
      message.setAttribute('role', error ? 'alert' : 'status');
    };
    async function submit() {
      if (!token || sending) return;
      if (form.closest('[hidden]') || !form.reportValidity()) {
        pending = false;
        token = '';
        button.disabled = false;
        if (widget !== undefined) window.turnstile.reset(widget);
        return;
      }
      sending = true;
      button.disabled = true;
      const inputs = Object.fromEntries(new FormData(form));
      inputs.source_page = location.pathname;
      if (quote && !inputs.product_context) inputs.product_context = new URLSearchParams(location.search).get('product') || '';
      try {
        const response = await fetch('/api/submissions/' + type, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ...inputs, turnstile_token: token }),
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.error || 'Unable to submit. Please try again.');
        form.reset();
        verification.hidden = true;
        show(quote ? 'Thank you. Your quote request has been received.' : 'Thanks for subscribing.');
      } finally {
        pending = false;
        sending = false;
        button.disabled = false;
        token = '';
        if (widget !== undefined) window.turnstile.reset(widget);
      }
    }
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (pending || sending || !form.reportValidity()) return;
      pending = true;
      button.disabled = true;
      try {
        if (token) return await submit();
        verification.hidden = false;
        if (widget === undefined) {
          const sitekey = await loadProtection();
          widget = window.turnstile.render(verification, {
            sitekey, action: type, size: 'flexible', execution: 'execute',
            appearance: 'interaction-only', retry: 'never',
            callback: (value) => {
              if (!pending || sending) return;
              token = value;
              show('Sending…');
              submit().catch((error) => show(error.message || 'Unable to submit. Please try again.', true));
            },
            'expired-callback': () => {
              token = ''; pending = false; button.disabled = false;
              show('Verification expired. Please submit again.', true);
            },
            'error-callback': () => {
              token = ''; pending = false; button.disabled = false;
              show('Verification failed. Please try again.', true);
            },
          });
        }
        show('Checking verification…');
        window.turnstile.execute(verification);
      } catch (error) {
        pending = false;
        show(error.message || 'Unable to submit. Please try again.', true);
      } finally {
        if (!sending && !pending) button.disabled = false;
      }
    });
  }
})();
