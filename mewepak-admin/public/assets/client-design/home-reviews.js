(() => {
  const section = document.getElementById('mw-customer-reviews');
  if (!section) return;

  const slides = [...section.querySelectorAll('[data-review-slide]')];
  const pages = [...section.querySelectorAll('[data-review-page]')];
  const controls = section.querySelector('[data-review-controls]');
  let current = 0;
  const rtl = getComputedStyle(section).direction === 'rtl';

  function show(index) {
    const next = (index + slides.length) % slides.length;
    if (next === current) return;
    slides[current].hidden = true;
    pages[current].removeAttribute('aria-current');
    current = next;
    slides[current].hidden = false;
    pages[current].setAttribute('aria-current', 'true');
  }

  controls.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-review-step')) show(current + Number(button.dataset.reviewStep));
    else show(Number(button.dataset.reviewPage));
  });

  controls.addEventListener('keydown', (event) => {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (!step) return;
    event.preventDefault();
    show(current + (rtl ? -step : step));
    if (event.target.matches('[data-review-page]')) pages[current].focus();
  });

  controls.hidden = false;
})();
