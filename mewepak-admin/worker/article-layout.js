const topics = {
  'choosing-packaging-for-frozen-chilled-foods': 'frozen',
  'coffee-packaging-preserving-freshness-flavor': 'coffee',
  'how-to-choose-the-right-barrier-film-for-coffee-packaging': 'coffee',
  'pet-food-packaging-what-pet-owners-want': 'pet',
  '5-sustainable-packaging-trends-to-watch': 'sustainability',
  'recyclable-mono-materials-the-future-of-packaging': 'sustainability',
  'understanding-barrier-materials-in-flexible-packaging': 'materials',
  '10-design-tips-for-maximum-shelf-impact': 'design',
  'the-ultimate-guide-to-stand-up-pouches-in-2024': 'formats',
  'how-to-choose-the-right-stand-up-pouch-for-your-product': 'formats',
  'flat-bottom-vs-stand-up-pouch-which-fits-your-brand': 'formats',
};

const topicLabels = {
  frozen: 'Food packaging',
  coffee: 'Coffee packaging',
  pet: 'Pet food packaging',
  sustainability: 'Sustainability',
  materials: 'Materials',
  design: 'Packaging design',
  formats: 'Pouch formats',
};

const studioCovers = {
  'how-to-choose-the-right-stand-up-pouch-for-your-product': '26f9b812dfc33516',
  'flat-bottom-vs-stand-up-pouch-which-fits-your-brand': 'cd6e96c5b2fb5106',
  'how-to-choose-the-right-barrier-film-for-coffee-packaging': 'e0e14ec25fe1a893',
  'choosing-packaging-for-frozen-chilled-foods': '888fab2980d0bbb3',
};

const resourceLinks = {
  frozen: ['/markets/frozen-food/', '/products/flat-pouch/', '/solutions/technical/'],
  coffee: ['/markets/coffee-tea/', '/products/flat-bottom-pouch/', '/solutions/technical/'],
  pet: ['/markets/pet-food/', '/products/stand-up-pouch/', '/solutions/technical/'],
  sustainability: ['/solutions/recycling/', '/sustainability/', '/sustainability/our-process/'],
  materials: ['/solutions/technical/', '/solutions/recycling/', '/products/'],
  design: ['/solutions/printing/', '/solutions/prepress/', '/products/'],
  formats: ['/products/stand-up-pouch/', '/products/flat-bottom-pouch/', '/products/flat-pouch/'],
};

const adjacentTopics = {
  frozen: ['materials', 'formats'],
  coffee: ['materials', 'formats'],
  pet: ['formats', 'materials'],
  sustainability: ['materials', 'formats'],
  materials: ['sustainability', 'formats'],
  design: ['formats', 'materials'],
  formats: ['design', 'materials'],
};

const dateFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long', timeZone: 'UTC',
});

export function renderArticleLayout({ entry, entries, baseline, escape, safeUrl }) {
  const { row, path } = entry;
  const topic = topics[row.slug];
  const title = escape(row.title);
  const label = topicLabels[topic] || 'Packaging guide';
  const excerpt = row.excerpt?.trim();
  const date = row.published_at ? new Date(row.published_at) : null;
  const time = date && Number.isFinite(date.valueOf())
    ? `<time datetime="${date.toISOString()}">${dateFormat.format(date)}</time>` : '';
  const coverFor = ({ row, path }) => {
    const image = safeUrl(row.featured_image_url);
    const studio = studioCovers[row.slug];
    if (studio && (!image || image === baseline[path]?.featured_image_url)) {
      return `/assets/client-design/images/${studio}.webp`;
    }
    return image;
  };
  const cover = coverFor(entry);
  const breadcrumbs = `<nav class="mw-article-inner mw-article-crumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/blog/">Blog</a><span aria-hidden="true">/</span><span aria-current="page">${title}</span></nav>`;
  const hero = `<header class="mw-article-hero"><div class="mw-article-inner mw-article-hero-grid">
    <div class="mw-article-intro">
      <div class="mw-article-meta"><span class="mw-article-topic">${label}</span>${time}</div>
      <h1>${title}</h1>
      ${excerpt ? `<p>${escape(excerpt)}</p>` : ''}
    </div>
    ${cover ? `<img class="mw-article-cover" src="${escape(cover)}" alt="" width="1600" height="900" fetchpriority="high" decoding="async">` : ''}
  </div></header>`;
  const resources = (resourceLinks[topic] || ['/products/', '/solutions/technical/', '/sustainability/our-process/'])
    .flatMap((target) => {
      const resource = entries.find((item) => item.path === target);
      if (!resource) return [];
      return `<li><a href="${escape(target)}"><span>${escape(resource.row.name || resource.row.title)}</span><span aria-hidden="true">↗</span></a></li>`;
    });
  const sidebar = resources.length ? `<aside class="mw-article-resources" aria-labelledby="mw-article-resources-title">
    <h2 id="mw-article-resources-title">Packaging resources</h2>
    <ul>${resources.join('')}</ul>
  </aside>` : '';

  // Choose a guide from each relevant topic before filling any remaining card slots.
  const candidates = entries.filter((item) => item.table === 'articles' && item.path !== path)
    .sort((first, second) => (second.row.published_at || '').localeCompare(first.row.published_at || ''));
  const preferred = [topic, ...(adjacentTopics[topic] || [])]
    .filter(Boolean).map((key) => candidates.find((item) => topics[item.row.slug] === key)).filter(Boolean);
  const cards = [...new Set([...preferred, ...candidates])].slice(0, 3).map((item) => {
    const image = coverFor(item);
    const url = escape(item.path);
    const headline = escape(item.row.title);
    const category = topicLabels[topics[item.row.slug]] || 'Packaging guide';
    const summary = item.row.excerpt?.trim();
    return `<article class="mw-article-card">
      ${image ? `<a class="mw-article-thumb" href="${url}" tabindex="-1" aria-hidden="true"><img src="${escape(image)}" alt="" width="720" height="405" loading="lazy" decoding="async"></a>` : ''}
      <p class="mw-article-topic">${category}</p>
      <h3><a href="${url}">${headline}</a></h3>
      ${summary ? `<p class="mw-article-summary">${escape(summary)}</p>` : ''}
    </article>`;
  });
  const related = cards.length ? `<section class="mw-article-related" aria-labelledby="mw-article-related-title">
    <div class="mw-article-inner">
      <div class="mw-article-section-heading"><h2 id="mw-article-related-title">Related guides</h2><a href="/blog/">View all guides <span aria-hidden="true">↗</span></a></div>
      <div class="mw-article-cards">${cards.join('')}</div>
    </div>
  </section>` : '';
  const quote = entries.some((item) => item.path === '/inquiry/') ? `<section class="mw-article-quote" aria-labelledby="mw-article-quote-title">
    <div class="mw-article-inner mw-article-quote-inner">
      <div><h2 id="mw-article-quote-title">Planning your packaging?</h2><p>Tell us about your product, pouch format and order quantities.</p></div>
      <a class="mw-article-button" href="/inquiry/#quote-request">Request a quote <span aria-hidden="true">↗</span></a>
    </div>
  </section>` : '';
  return { breadcrumbs, hero, sidebar, footer: quote + related };
}
