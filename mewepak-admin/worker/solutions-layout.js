import { solutions } from './solutions-content.js';

const base = '/solutions/';
const imageBase = '/assets/media/solutions/';
const arrow = '<span aria-hidden="true">→</span>';
const procurement = [
  ['What you’re packing', 'Product, fill weight, how it’s used and the conditions it must withstand.'],
  ['What the pack must fit', 'Pack dimensions, filling line and any material or closure requirements.'],
  ['What you plan to order', 'Artwork status, quantities per SKU, delivery market and target date.'],
];

function action(href, title, secondary = false) {
  return `<a class="sl-button${secondary ? ' sl-button--plain' : ''}" href="${href}">${title} ${arrow}</a>`;
}

function image(key, alt, lazy = false) {
  const dimensions = key === 'overview' ? 'width="1152" height="768"' : 'width="760" height="500"';
  return `<img src="${imageBase}${key}.webp" alt="${alt}" ${dimensions} ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async">`;
}

function enquiry(quote, service = false) {
  return `<section class="sl-wrap sl-next" aria-labelledby="solution-inquiry-title">
    <div class="sl-next__panel">
      <div>
        <h2 id="solution-inquiry-title" class="text-white">${service ? 'Review this with our team' : 'Tell us about your packaging project'}</h2>
        <p class="text-white">${service ? 'Share the details you have and what you need to confirm before making a decision.' : 'Share your brief for a quote, or book a consultation to talk through an open requirement.'}</p>
      </div>
      <div class="sl-actions">
        ${action(quote, 'Request a quote')}
        ${action('/booking/', 'Book a consultation', true)}
      </div>
    </div>
  </section>`;
}

export function renderSolutionsLayout({ entry, previous, publishedPaths, escape, processPath }) {
  const { path, row } = entry;
  if (!path.startsWith(base)) return null;
  const key = path.slice(base.length, -1);
  const overview = path === base;
  if (!overview && (!Object.hasOwn(solutions, key) || path !== base + key + '/')) return null;

  const service = overview ? null : solutions[key];
  const name = service?.name || 'Solutions';
  const title = escape(row.title !== previous.title && row.title ? row.title : service?.heading || 'Flexible packaging solutions');
  const lead = escape(row.summary?.trim() || service?.lead
    || 'Find the right support for your packaging project, from preparing artwork to reviewing materials and validating a filled pack.');
  const quote = publishedPaths.has('/inquiry/') ? '/inquiry/' + (key === 'retort' ? '?format=retort-pouch' : '') + '#quote-request' : '/contact/';
  const crumbs = `<nav class="sl-wrap sl-crumb" aria-label="Breadcrumb">
    <a href="/">Home</a><span aria-hidden="true">/</span>
    ${service ? `<a href="${base}">Solutions</a><span aria-hidden="true">/</span>` : ''}
    <span aria-current="page">${escape(name)}</span>
  </nav>`;
  const hero = `<section class="sl-hero" aria-labelledby="solution-overview-title">
    <div class="sl-wrap sl-hero__inner">
      <div class="sl-hero__copy">
        <h1 id="solution-overview-title" class="text-white">${title}</h1>
        <p class="text-white">${lead}</p>
        <div class="sl-actions">
          ${action(quote, 'Request a quote')}
          ${action(service ? '#service-process' : '#packaging-services', service ? 'See what we review' : 'Explore services', true)}
        </div>
      </div>
      <figure class="sl-hero__visual">
        ${image(key || 'overview', escape(service?.alt || 'Illustrative flexible film converting line with teal material and steel rollers'))}
        ${key !== 'printing' ? '<figcaption>Process illustration</figcaption>' : ''}
      </figure>
    </div>
  </section>`;

  if (overview) {
    const cards = Object.entries(solutions).filter(([slug]) => publishedPaths.has(base + slug + '/'));
    return `${crumbs}${hero}
      <section class="sl-wrap sl-section" id="packaging-services" aria-labelledby="packaging-services-title">
        <h2 id="packaging-services-title">Explore our services</h2>
        <div class="sl-cards">
          ${cards.map(([slug, item]) => `<a class="sl-card" href="${base}${slug}/">
            ${image(slug, '', true)}
            <div class="sl-card__copy"><h3>${escape(item.name)}</h3><p>${escape(item.card)}</p>${arrow}</div>
          </a>`).join('')}
          ${publishedPaths.has(processPath) ? `<a class="sl-card sl-card--process" href="${processPath}#process-stages">
            <div class="sl-card__copy"><h3>Our production process</h3><p>Follow the manufacturing stages from artwork and film production through printing, lamination, slitting and pouch making.</p>${arrow}</div>
          </a>` : ''}
        </div>
      </section>
      <section class="sl-band" id="prepare-your-brief" aria-labelledby="solution-brief-title">
        <div class="sl-wrap sl-section sl-columns">
          <h2 id="solution-brief-title">What to include in your brief</h2>
          <dl class="sl-list">${procurement.map(([term, note]) => `<div><dt>${escape(term)}</dt><dd>${escape(note)}</dd></div>`).join('')}</dl>
        </div>
      </section>
      ${enquiry(quote)}`;
  }

  const links = service.related.filter(([href]) => publishedPaths.has(href));
  if (publishedPaths.has(processPath)) links.push([processPath + '#process-stages', 'Our production process']);
  if (publishedPaths.has(base)) links.push([base, 'All packaging solutions']);
  return `${crumbs}${hero}
    <nav class="sl-jump" aria-label="On this page"><div class="sl-wrap">
      <a href="#service-process">Scope of review</a><a href="#service-brief">Project checklist</a>
      <a href="#service-faq">Questions</a><a href="#solution-inquiry-title">Discuss your project</a>
    </div></nav>
    <section class="sl-wrap sl-section sl-columns" id="service-process" aria-labelledby="service-process-title">
      <h2 id="service-process-title">What we review</h2>
      <dl class="sl-list">${service.scope.map(([term, note]) => `<div><dt>${escape(term)}</dt><dd>${escape(note)}</dd></div>`).join('')}</dl>
    </section>
    <section class="sl-band" id="service-brief" aria-labelledby="service-brief-title">
      <div class="sl-wrap sl-section">
        <h2 id="service-brief-title">Project checklist</h2>
        <div class="sl-checklist">
          <div><h3>What to send</h3><ul>${service.inputs.map(item => `<li>${escape(item)}</li>`).join('')}</ul></div>
          <div><h3>What we’ll confirm with you</h3><ul>${service.outputs.map(item => `<li>${escape(item)}</li>`).join('')}</ul></div>
        </div>
      </div>
    </section>
    <section class="sl-wrap sl-section sl-columns" id="service-faq" aria-labelledby="service-faq-title">
      <h2 id="service-faq-title">Common questions</h2>
      <div class="sl-answers">${service.faq.map(([question, answer]) => `<details><summary>${escape(question)}</summary><p>${escape(answer)}</p></details>`).join('')}</div>
    </section>
    ${links.length ? `<nav class="sl-wrap sl-related" aria-label="Related packaging services">
      ${links.map(([url, label]) => `<a href="${url}">${escape(label)} ${arrow}</a>`).join('')}
    </nav>` : ''}
    ${enquiry(quote, true)}`;
}
