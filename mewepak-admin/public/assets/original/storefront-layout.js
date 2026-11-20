(() => {
  'use strict';

  const main = document.querySelector('main[data-storefront-page]');
  if (!main) return;

  const article = main.hasAttribute('data-article-layout');
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
        const next = headings.findLastIndex(heading => heading.getBoundingClientRect().top <= 32);
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
