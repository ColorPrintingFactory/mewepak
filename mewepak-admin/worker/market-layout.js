import marketDetails from './market-detail-content.json' with { type: 'json' };
import { marketFormats } from './recommendations.js';
import { coffeeFormatDetails, renderCoffeeMarket } from './coffee-market.js';

const arrow = '<span class="mw-market-arrow" aria-hidden="true">↗</span>';
const formatAnchors = {
  'coffee-tea': 'coffee-packaging-formats',
  'snacks-sweets': 'snacks-packaging-formats',
};

export function renderMarketLayout({ entry, categories, choices, baseline, publishedPaths, escape }) {
  const { path, row } = entry;
  const slug = path.split('/')[2];
  if (!Object.hasOwn(marketDetails, slug)) return null;
  const detail = marketDetails[slug];
  const isRender = detail.photo.startsWith('/assets/3d/');
  const title = escape(row.title);
  const heading = row.title === baseline[path]?.title ? title + ' Packaging' : title;
  const formatId = formatAnchors[slug] || slug + '-packaging-formats';
  const { featured, more } = marketFormats(slug, categories, choices, baseline);
  const intro = row.summary?.trim();
  const useSummary = intro && intro !== baseline[path]?.summary;
  const lead = escape(useSummary ? intro : detail.intro);
  const quoteUrl = publishedPaths.has('/inquiry/') ? '/inquiry/#quote-request' : '/contact/';
  const coffee = slug === 'coffee-tea'
    ? renderCoffeeMarket({ publishedPaths, formatId, hasFormats: featured.length || more.length, escape, arrow })
    : null;
  const cards = featured.map(({ key, href, title, description, image }) => {
    const desc = detail.formatDescriptions?.[key] || description;
    const buyer = coffee ? coffeeFormatDetails(key, quoteUrl) : null;
    return `<li class="mw-market-format">
      <a href="${href}" class="mw-market-format-link">
        ${image ? `<span class="mw-market-format-image"><img src="${escape(image)}" width="560" height="360" alt="" loading="lazy" decoding="async"></span>` : ''}
        <div class="mw-market-format-copy"><h3>${escape(title)}</h3>
          ${desc ? `<p>${escape(desc)}</p>` : ''}
          ${buyer?.check ? `<p class="mw-coffee-format-check">${escape(buyer.check)}</p>` : ''}
          <span class="mw-market-format-action">Explore format ${arrow}</span>
        </div>
      </a>
      ${buyer?.quote ? `<a class="mw-coffee-format-quote" href="${buyer.quote}" aria-label="Get a quote for ${escape(title)}">Quote this format ${arrow}</a>` : ''}
    </li>`;
  });
  const formatList = more.map(({ slug, name }) => `<li><a href="/products/${slug}/">${escape(name)} ${arrow}</a></li>`).join('');
  const links = [
    ...(detail.guide ? [[detail.guide, detail.guideLabel]] : []),
    ['/solutions/prepress/', 'Prepare your artwork'],
    ['/solutions/printing/', 'Compare printing and finish options'],
    ['/added-value/faq/', 'Read the packaging FAQ'],
  ].filter(([href]) => publishedPaths.has(href));
  const formatSection = cards.length || formatList ? `<section class="mw-market-formats mw-market-inner" id="${formatId}" aria-labelledby="${formatId}-title">
    <div class="mw-market-section-heading">
      <h2 id="${formatId}-title">Recommended packaging formats</h2>
      <a class="mw-market-text-link" href="/products/">View all products ${arrow}</a>
    </div>
    ${cards.length ? `<ul class="mw-market-format-grid" style="--market-format-columns:${cards.length}">${cards.join('')}</ul>` : ''}
    ${formatList ? `<details class="mw-market-other-formats"><summary>See more packaging formats</summary><ul>${formatList}</ul></details>` : ''}
  </section>` : '';
  const resources = links.length ? `<section class="mw-market-resources mw-market-inner" aria-labelledby="mw-market-resources-heading">
    <h2 id="mw-market-resources-heading">Project resources</h2>
    <ul>${links.map(([href, label]) => `<li><a href="${href}"><span>${escape(label)}</span>${arrow}</a></li>`).join('')}</ul>
  </section>` : '';

  return `<nav class="mw-market-crumb mw-market-inner" aria-label="Breadcrumb">
    <a href="/">Home</a><span aria-hidden="true">/</span>
    <a href="/markets/">Markets</a><span aria-hidden="true">/</span>
    <span aria-current="page">${title}</span>
  </nav>
  <header class="mw-market-hero" aria-labelledby="mw-market-title">
    <div class="mw-market-hero-grid mw-market-inner">
      <div class="mw-market-intro">
        <h1 id="mw-market-title">${heading}</h1>
        <p>${lead}</p>
        <div class="mw-market-actions">
          <a class="mw-market-button" href="${quoteUrl}">Request a quote ${arrow}</a>
          ${coffee?.sampleLink ? `<a class="mw-market-text-link" href="${coffee.sampleLink}">Ask about samples ${arrow}</a>`
            : formatSection ? `<a class="mw-market-text-link" href="#${formatId}">Explore formats <span aria-hidden="true">↓</span></a>` : ''}
        </div>
      </div>
      <img class="mw-market-cover${isRender ? ' mw-market-cover--render' : ''}" src="${detail.photo}" alt="${escape(detail.alt)}" width="850" height="850"
        fetchpriority="high" decoding="async">
    </div>
  </header>
  ${coffee?.opening || ''}
  ${formatSection}
  ${coffee?.technical || ''}
  <section class="mw-market-brief" id="project-brief" aria-labelledby="mw-market-brief-title">
    <div class="mw-market-brief-grid mw-market-inner">
      <div class="mw-market-brief-copy">
        <h2 id="mw-market-brief-title">What to share for a quote</h2>
        <p>${coffee
          ? 'List each size or design separately so we can review quantities, specifications and timing for each SKU.'
          : 'Bring the details you already know so we can compare bag styles, materials and print options for your product.'}</p>
      </div>
      <ul class="mw-market-questions">
        ${detail.questions.map((question) => `<li>${escape(question)}</li>`).join('')}
      </ul>
    </div>
  </section>
  ${coffee?.faq || ''}
  ${resources}
  <section class="mw-market-next" aria-labelledby="mw-market-next-title">
    <div class="mw-market-next-inner mw-market-inner">
      <div><h2 id="mw-market-next-title">Planning your next pack?</h2>
        <p>Share your product, target quantities and any samples or artwork you have.</p></div>
      <a class="mw-market-button" href="${quoteUrl}">Request a quote ${arrow}</a>
    </div>
  </section>`;
}
