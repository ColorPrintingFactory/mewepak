
(() => {
  const page = document.querySelector('.faq-page');
  if (!page) return;

  const form = page.querySelector('#fq-search');
  const query = page.querySelector('#fq-query');
  const status = page.querySelector('#fq-status');
  const clear = page.querySelector('#fq-clear');
  const reset = page.querySelector('#fq-reset');
  const empty = page.querySelector('#fq-empty');
  const topics = page.querySelector('.fq-topics');
  const results = page.querySelector('#faq-results');
  const commonWords = new Set([
    'a', 'about', 'an', 'and', 'are', 'can', 'could', 'do', 'does', 'for', 'how', 'i', 'in',
    'is', 'it', 'me', 'my', 'of', 'on', 'the', 'to', 'what', 'when', 'which',
    'will', 'with', 'would', 'you', 'your',
  ]);

  function normalize(value) {
    return value.normalize('NFKD')
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  const groups = Array.from(page.querySelectorAll('.fq-group'), (section) => ({
    section,
    link: topics.querySelector(`[href="#${section.id}"]`),
    count: section.querySelector('.fq-group-count'),
    questions: Array.from(section.querySelectorAll('.fq-question'), (detail) => ({
      detail,
      text: normalize(`${detail.textContent} ${detail.dataset.keywords}`),
    })),
  }));

  function applySearch() {
    const terms = normalize(query.value).split(' ').filter(
      (word) => word && !commonWords.has(word)
    );
    let total = 0;
    for (const group of groups) {
      let count = 0;
      for (const question of group.questions) {
        const matches = terms.every((term) => question.text.includes(term));
        question.detail.hidden = !matches;
        if (matches) count += 1;
      }
      const hasMatches = count > 0;
      group.section.hidden = !hasMatches;
      group.link.hidden = !hasMatches;
      group.count.textContent = String(count);
      total += count;
    }
    const label = total === 1 ? 'question' : 'questions';
    status.textContent = terms.length > 0 ? `${total} matching ${label}` : `${total} ${label}`;
    clear.hidden = !query.value;
    empty.hidden = total > 0;
    topics.hidden = total === 0;
    results.classList.toggle('fq-layout-empty', total === 0);
  }

  function resetSearch() {
    query.value = '';
    applySearch();
    query.focus();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    applySearch();
  });
  query.addEventListener('input', applySearch);
  clear.addEventListener('click', resetSearch);
  reset.addEventListener('click', resetSearch);
  applySearch();
  form.hidden = false;
})();
