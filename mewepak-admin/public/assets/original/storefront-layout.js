(() => {
  'use strict';

  const main = document.querySelector('main[data-storefront-page]');
  if (!main) return;

  const article = main.hasAttribute('data-article-layout');
  const header = document.querySelector('[data-mewepak-header]');
  const shell = header?.closest('.wp-block-template-part');
  if (header && shell?.nextElementSibling === main) {
    const positionContent = () => {
      const height = header.getBoundingClientRect().height;
      const reserved = shell.getBoundingClientRect().height;
      main.style.setProperty('--page-header-offset', Math.max(0, height - reserved) + 'px');
      document.documentElement.style.scrollPaddingTop = height + 'px';
      if (article) main.style.setProperty('--article-header-height', height + 'px');
    };
    positionContent();
    new ResizeObserver(positionContent).observe(header);
  }

  if (article) {
    const contents = main.querySelector('.mw-article-contents');
    const headings = [...main.querySelectorAll('.entry-content h2')]
      .filter(heading => heading.textContent.trim() && !heading.closest('[hidden], [aria-hidden="true"]'));
    if (contents && headings.length > 1) {
      const list = contents.querySelector('ul');
      const links = headings.map(heading => {
        if (!heading.id) {
          const slug = heading.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          const baseId = 'article-' + (slug || 'section');
          let id = baseId;
          for (let suffix = 2; document.getElementById(id); suffix++) id = baseId + '-' + suffix;
          heading.id = id;
        }
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#' + encodeURIComponent(heading.id);
        link.textContent = heading.textContent.trim();
        item.append(link);
        list.append(item);
        return link;
      });
      contents.hidden = false;

      let current = -1;
      let frame = 0;
      const markSection = () => {
        frame = 0;
        if (!contents.offsetWidth) return;
        const top = (header?.getBoundingClientRect().bottom || 0) + 32;
        const next = headings.findLastIndex(heading => heading.getBoundingClientRect().top <= top);
        if (next === current) return;
        links[current]?.removeAttribute('aria-current');
        links[next]?.setAttribute('aria-current', 'location');
        current = next;
      };
      const scheduleSection = () => {
        if (!frame) frame = requestAnimationFrame(markSection);
      };
      window.addEventListener('scroll', scheduleSection, { passive: true });
      window.addEventListener('resize', scheduleSection);
      scheduleSection();
    }
  }

  if (main.dataset.storefrontPage === 'archive') {
    const title = main.querySelector('.wp-block-query-title');
    if (title) title.textContent = title.textContent.trim().replace(/^分类[:：]\s*/, '');
  }

  if (['article', 'archive'].includes(main.dataset.storefrontPage)) {
    const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' });
    for (const time of main.querySelectorAll('time[datetime]')) {
      const date = new Date(time.dateTime.slice(0, 10));
      if (Number.isFinite(date.getTime())) time.textContent = dateFormat.format(date);
    }
  }
})();
