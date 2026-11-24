(() => {
  const forms = document.querySelectorAll('form[data-mewepak-quote], form[data-mewepak-subscribe], form[data-mewepak-booking]');
  if (!forms.length) return;
  let protection;
  function loadProtection() {
    protection ||= Promise.all([
      fetch('/api/config', { signal: AbortSignal.timeout(10000) }).then((response) => {
        if (!response.ok) throw new Error('Verification could not load. Please retry.');
        return response.json();
      }),
      new Promise((resolve, reject) => {
        if (window.turnstile) return resolve();
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        const fail = () => {
          clearTimeout(timer);
          script.remove();
          reject(new Error('Verification could not load. Please retry.'));
        };
        const timer = setTimeout(fail, 10000);
        script.onload = () => { clearTimeout(timer); resolve(); };
        script.onerror = fail;
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
    const booking = form.hasAttribute('data-mewepak-booking');
    const type = booking ? 'booking' : quote ? 'quote' : 'newsletter';
    const { locale, formSuccess, formFailure, formChecking, formVerification } = form.dataset;
    const message = form.querySelector(booking ? '[data-booking-message]' : quote ? '[data-quote-message]' : '[data-subscribe-message]');
    const button = form.querySelector('button[type="submit"]');
    if (!message || !button) continue;
    const verification = document.createElement('div');
    verification.className = 'mt-3';
    message.before(verification);
    let widget;
    let pending = false;
    let token = '';
    let sending = false;
    let verificationTimer;
    form.addEventListener('focusin', () => { loadProtection().catch(() => {}); });
    form.addEventListener('input', () => { loadProtection().catch(() => {}); });
    const show = (text, error = false) => {
      message.textContent = text;
      message.classList.remove('hidden');
      message.classList.toggle('!text-red-600', error);
      message.setAttribute('role', error ? 'alert' : 'status');
    };
    function failVerification(text) {
      clearTimeout(verificationTimer);
      if (!pending || sending) return;
      pending = false;
      token = '';
      button.disabled = false;
      if (widget !== undefined) {
        window.turnstile.remove(widget);
        widget = undefined;
      }
      verification.hidden = true;
      show(text, true);
    }
    async function submit() {
      if (!token || sending) return;
      if (form.closest('[hidden], dialog:not([open])') || !form.reportValidity()) {
        pending = false;
        token = '';
        button.disabled = false;
        if (widget !== undefined) window.turnstile.reset(widget);
        verification.hidden = true;
        return;
      }
      sending = true;
      button.disabled = true;
      const inputs = Object.fromEntries(new FormData(form));
      inputs.source_page = location.pathname;
      if (locale && quote) {
        inputs.details = [
          ...['product', 'destination'].filter(name => inputs[name]).map(name => {
            const label = form.elements[name].labels[0].textContent.trim();
            return label + ' ' + inputs[name];
          }),
          inputs.details,
        ].join('\n');
      }
      if (quote && !inputs.product_context) inputs.product_context = new URLSearchParams(location.search).get('product') || '';
      try {
        const response = await fetch(booking ? '/api/bookings' : '/api/submissions/' + type, {
          method: 'POST',
          signal: AbortSignal.timeout(12000),
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ...inputs, turnstile_token: token }),
        });
        const result = await response.json();
        if (booking && response.status === 409) form.dispatchEvent(new Event('mwl-booking-conflict'));
        if (!response.ok || !result.ok) throw new Error(result.error || 'Unable to submit. Please try again.');
        form.reset();
        if (booking) form.dispatchEvent(new Event('mwl-booking-saved'));
        verification.hidden = true;
        show(formSuccess || (quote ? 'Thank you. Your quote request has been received.' : 'Thanks for subscribing.'));
      } catch (error) {
        if (error.name === 'TimeoutError') {
          throw new Error('The server is taking too long to respond. Please check your connection and try again.');
        }
        throw error;
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
          show(formChecking || 'Loading verification…');
          const sitekey = await loadProtection();
          widget = window.turnstile.render(verification, {
            sitekey, action: type, size: verification.clientWidth < 300 ? 'compact' : 'flexible',
            execution: 'execute', ...(locale ? { language: locale } : {}),
            appearance: 'interaction-only', retry: 'never',
            callback: (value) => {
              if (!pending || sending) return;
              clearTimeout(verificationTimer);
              token = value;
              show(formChecking || 'Sending…');
              submit().catch((error) => show(formFailure || error.message || 'Unable to submit. Please try again.', true));
            },
            'expired-callback': () => failVerification(formVerification || 'Verification expired. Please submit again.'),
            'timeout-callback': () => failVerification(formVerification || 'Verification timed out. Please try again.'),
            'error-callback': () => failVerification(formVerification || 'Verification failed. Please try again.'),
          });
        }
        show(formChecking || 'Checking verification…');
        verificationTimer = setTimeout(() => failVerification(formVerification || 'Verification is taking too long. Please try again.'), 15000);
        window.turnstile.execute(verification);
      } catch (error) {
        failVerification(formVerification || error.message || 'Unable to submit. Please try again.');
      } finally {
        if (!sending && !pending) button.disabled = false;
      }
    });
  }
})();
