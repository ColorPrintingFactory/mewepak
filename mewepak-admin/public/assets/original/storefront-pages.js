(() => {
  'use strict';

  const main = document.querySelector('main[data-storefront-page]');
  if (!main) return;

  const header = document.querySelector('[data-mewepak-header]');
  const shell = header?.closest('.wp-block-template-part');
  if (header && shell?.nextElementSibling === main) {
    const positionContent = () => {
      const height = header.getBoundingClientRect().height;
      const reserved = shell.getBoundingClientRect().height;
      main.style.setProperty('--page-header-offset', Math.max(0, height - reserved) + 'px');
      document.documentElement.style.scrollPaddingTop = height + 'px';
    };
    positionContent();
    new ResizeObserver(positionContent).observe(header);
  }

  if (['article', 'archive'].includes(main.dataset.storefrontPage)) {
    const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' });
    for (const time of main.querySelectorAll('time[datetime]')) {
      const date = new Date(time.dateTime.slice(0, 10));
      if (Number.isFinite(date.getTime())) time.textContent = dateFormat.format(date);
    }
  }
})();
