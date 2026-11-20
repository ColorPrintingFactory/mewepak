import marketDetails from './market-detail-content.json' with { type: 'json' };
import { marketFormats } from './recommendations.js';
import { marketProcurement } from './market-procurement.js';
import { brandedVisual } from './packaging-visual.js';
import { previewFormats } from './preview-formats.js';
import { coffeeFormatCheck, renderCoffeeMarket } from './coffee-market.js';
import { qualityPath, samplePath, trialChecklist } from './procurement.js';

const arrow = '<span class="mw-market-arrow" aria-hidden="true">↗</span>';
const formatAnchors = {
  'coffee-tea': 'coffee-packaging-formats',
  'snacks-sweets': 'snacks-packaging-formats',
};

const topicLinks = {
  'baby-food': ['/solutions/retort/', 'Review a process-matched pouch'],
  beverage: ['/solutions/technical/', 'Review filling and dispensing'],
  'frozen-food': ['/solutions/technical/', 'Plan a filled-pack trial'],
  'home-care': ['/solutions/technical/', 'Discuss a compatibility trial'],
  'meat-poultry': ['/solutions/technical/', 'Plan a filled-pack trial'],
  'pet-food': ['/solutions/retort/', 'Explore wet-product pouch trials'],
  'sauce-soup': ['/solutions/retort/', 'Review a process-matched pouch'],
  'sea-food': ['/solutions/technical/', 'Plan a filled-pack trial'],
};

const focusImages = {
  'frozen-food': '/assets/media/blog-covers/choosing-packaging-for-frozen-chilled-foods.webp',
  'pet-food': '/assets/media/blog-covers/pet-food-packaging-what-pet-owners-want.webp',
};

function renderSelection(procurement, escape) {
  const labels = ['Product or project', 'Formats to compare', 'Confirm before approval'];
  return `<section class="mw-market-inner mw-market-selection" id="market-selection" aria-labelledby="market-selection-title">
    <div class="mw-market-section-heading"><div><h2 id="market-selection-title">Choose a format for what you pack</h2>
      <p>Use these examples to choose what to compare on a filled sample.</p></div></div>
    <table aria-label="Packaging selection by product">
      <thead><tr>${labels.map((label) => `<th scope="col">${label}</th>`).join('')}</tr></thead>
      <tbody>${procurement.rows.map(([application, format, checks]) => `<tr>
        <th scope="row">${escape(application)}</th>
        <td><span aria-hidden="true">${labels[1]}</span>${escape(format)}</td>
        <td><span aria-hidden="true">${labels[2]}</span>${escape(checks)}</td>
      </tr>`).join('')}</tbody>
    </table>
  </section>`;
}

export function renderMarketLayout({ entry, categories, choices, baseline, publishedPaths, escape }) {
  const { path, row } = entry;
  const slug = path.split('/')[2];
  if (!Object.hasOwn(marketDetails, slug)) return null;
  const detail = marketDetails[slug];
  const procurement = marketProcurement[slug];
  const topicLink = topicLinks[slug] || ['/solutions/prepress/', 'Prepare your artwork'];
  const isRender = detail.photo.startsWith('/assets/3d/');
  const title = escape(row.title);
  const heading = row.title === baseline[path]?.title ? title + ' Packaging' : title;
  const formatId = formatAnchors[slug] || slug + '-packaging-formats';
  const { featured } = marketFormats(slug, categories, choices, baseline);
  const intro = row.summary?.trim();
  const useSummary = intro && intro !== baseline[path]?.summary;
  const lead = escape(useSummary ? intro : detail.intro);
  const quoteBase = publishedPaths.has('/inquiry/') ? '/inquiry/' : '';
  const quoteFor = (format) => quoteBase ? `${quoteBase}?market=${slug}${format ? '&amp;format=' + encodeURIComponent(format) : ''}#quote-request` : '/contact/';
  const quoteUrl = quoteFor();
  const bookingUrl = `/booking/?market=${slug}`;
  const coffee = slug === 'coffee-tea'
    ? renderCoffeeMarket({ publishedPaths, formatId, hasFormats: featured.length, escape, arrow })
    : null;
  const cards = featured.map(({ key, href, title, description, image }) => {
    const marketPhoto = detail.formatImages?.[key];
    const cardImage = marketPhoto || image;
    const desc = detail.formatDescriptions?.[key] || description;
    const check = coffee ? coffeeFormatCheck(key) : null;
    const categoryQuote = quoteBase && previewFormats.has(key) ? quoteFor(key) : '';
    return `<li class="mw-market-format">
      <a href="${href}" class="mw-market-format-link">
        ${cardImage ? `<span class="mw-market-format-image${marketPhoto ? ' mw-market-format-image--photo' : ''}"><img src="${escape(cardImage)}" width="${marketPhoto ? 760 : 560}" height="${marketPhoto ? 490 : 360}" alt="" loading="lazy" decoding="async"></span>` : ''}
        <div class="mw-market-format-copy"><h3>${escape(title)}</h3>
          ${desc ? `<p>${escape(desc)}</p>` : ''}
          ${check ? `<p class="mw-coffee-format-check">${escape(check)}</p>` : ''}
          <span class="mw-market-format-action">Explore format ${arrow}</span>
        </div>
      </a>
      ${categoryQuote ? `<a class="mw-coffee-format-quote" href="${categoryQuote}" aria-label="Get a quote for ${escape(title)}">Quote this format ${arrow}</a>` : ''}
    </li>`;
  });
  const links = [
    ...(detail.guide ? [[detail.guide, detail.guideLabel]] : []),
    topicLink,
    ...(['coffee-tea', 'frozen-food'].includes(slug) ? [[qualityPath, 'Review supplier quality documents']] : []),
    ['/solutions/printing/', 'Compare printing and finish options'],
    ['/added-value/faq/', 'Read the packaging FAQ'],
  ].filter(([href]) => publishedPaths.has(href));
  const formatSection = cards.length ? `<section class="mw-market-formats mw-market-inner" id="${formatId}" aria-labelledby="${formatId}-title">
    <div class="mw-market-section-heading">
      <h2 id="${formatId}-title">Recommended packaging formats</h2>
      <a class="mw-market-text-link" href="/products/">View all products ${arrow}</a>
    </div>
    <ul class="mw-market-format-grid" style="--market-format-columns:${cards.length}">${cards.join('')}</ul>
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
          ${coffee ? `<a class="mw-market-text-link" href="${coffee.consultationAnchor}">Book a consultation <span aria-hidden="true">↓</span></a>`
            : formatSection ? `<a class="mw-market-text-link" href="#${formatId}">Explore formats <span aria-hidden="true">↓</span></a>` : ''}
        </div>
      </div>
      ${brandedVisual(detail.photo, detail.alt, isRender ? 'Packaging render' : 'Application illustration', escape, { eager: true, className: 'mw-market-cover' })}
    </div>
  </header>
  ${coffee?.opening || ''}
  ${renderSelection(procurement, escape)}
  ${formatSection}
  ${coffee?.technical || `<section class="mw-market-focus mw-market-inner" aria-labelledby="market-focus-title">
    ${focusImages[slug] ? brandedVisual(focusImages[slug], detail.alt, 'Application illustration', escape) : ''}
    <div class="mw-market-focus__copy"><h2 id="market-focus-title">${escape(procurement.focus[0])}</h2>
      <p>${escape(procurement.focus[1])}</p>
      ${publishedPaths.has(topicLink[0]) ? `<a class="mw-market-text-link" href="${topicLink[0]}">${topicLink[1]} ${arrow}</a>` : ''}
    </div>
  </section>`}
  <section class="mw-market-brief" id="project-brief" aria-labelledby="mw-market-brief-title">
    <div class="mw-market-brief-grid mw-market-inner">
      <div class="mw-market-brief-copy">
        <h2 id="mw-market-brief-title">What to share for a quote</h2>
        <p>${coffee
          ? 'List each size or design separately so we can review quantities, specifications and timing for each SKU.'
          : 'Bring the details you already know so we can compare bag styles, materials and print options for your product.'}</p>
        ${coffee ? `<a class="mw-market-text-link mw-coffee-brief-download" href="/assets/coffee-tea-quote-worksheet.txt" download>Download the quote worksheet <span aria-hidden="true">↓</span></a>` : ''}
      </div>
      <ul class="mw-market-questions">
        ${detail.questions.map((question) => `<li>${escape(question)}</li>`).join('')}
      </ul>
    </div>
  </section>
  ${slug === 'frozen-food' ? `<section class="mw-market-inner mw-market-resources" id="frozen-food-trial" aria-labelledby="frozen-food-trial-title">
    <h2 id="frozen-food-trial-title">Prepare a frozen-food packaging trial</h2>
    <p>Record the product shape, fill conditions, freezer cycle, expected storage and case handling. Compare candidate packs after the same cycle and agree with your quality team how to check seals, flex damage, puncture and case fit.</p>
    <ul>
      <li><a href="${trialChecklist}" download>Download the filled-pack trial checklist ${arrow}</a></li>
      ${publishedPaths.has('/contact/') ? `<li><a href="${samplePath}">Ask about samples for a frozen-food trial ${arrow}</a></li>` : ''}
      ${publishedPaths.has('/solutions/technical/') ? `<li><a href="/solutions/technical/">Discuss trial conditions and approval checks ${arrow}</a></li>` : ''}
    </ul>
  </section>` : ''}
  ${coffee?.consultation || ''}
  ${coffee?.faq || ''}
  ${resources}
  <section class="mw-market-next" aria-labelledby="mw-market-next-title">
    <div class="mw-market-next-inner mw-market-inner">
      <div><h2 id="mw-market-next-title">Planning your next pack?</h2>
        <p>Share your product, target quantities and any samples or artwork you have.</p></div>
      <div class="mw-market-actions">
        <a class="mw-market-button" href="${quoteUrl}">Request a quote ${arrow}</a>
        ${coffee ? '' : `<a class="mw-market-text-link" href="${bookingUrl}">Discuss your packaging ${arrow}</a>`}
      </div>
    </div>
  </section>`;
}
