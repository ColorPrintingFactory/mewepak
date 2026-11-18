
(() => {
  const page = document.querySelector('.insights-page');
  if (!page) return;

  const articles = [...page.querySelectorAll('[data-article]')];
  const filters = [...page.querySelectorAll('[data-filter]')];
  const search = page.querySelector('#in-search');
  const clear = page.querySelector('#in-clear');
  const count = page.querySelector('#in-count');
  const grid = page.querySelector('#in-grid');
  const empty = page.querySelector('#in-empty');
  let topic = 'all';

  const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

  function showResults() {
    const terms = normalize(search.value).split(' ').filter(Boolean);
    let visible = 0;
    for (const article of articles) {
      const text = normalize(`${article.textContent} ${article.dataset.keywords}`);
      const inTopic = topic === 'all' || article.dataset.category === topic;
      article.hidden = !inTopic || !terms.every((term) => text.includes(term));
      if (!article.hidden) visible += 1;
    }

    for (const filter of filters) {
      filter.setAttribute('aria-pressed', String(filter.dataset.filter === topic));
    }
    grid.hidden = !grid.querySelector('[data-article]:not([hidden])');
    clear.hidden = !search.value;
    empty.hidden = visible > 0;
    const noun = visible === 1 ? 'guide' : 'guides';
    const status = topic === 'all' && !terms.length ? 'to explore' : 'found';
    count.textContent = `${visible} ${noun} ${status}`;
  }

  function resetSearch() {
    search.value = '';
    showResults();
    search.focus();
  }

  for (const filter of filters) {
    filter.addEventListener('click', () => {
      topic = filter.dataset.filter;
      showResults();
    });
  }
  search.addEventListener('input', showResults);
  search.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && search.value) resetSearch();
  });
  clear.addEventListener('click', resetSearch);
  page.querySelector('#in-reset').addEventListener('click', () => {
    topic = 'all';
    resetSearch();
  });
  showResults();

})();
