import { solutions } from './solutions-content.js';
import { buyingGuides } from './solutions-buying-guides.js';
import { solutionDeliverables } from './solution-deliverables.js';
import { brandedVisual } from './packaging-visual.js';
import { qualityPath, samplePath, trialChecklist } from './procurement.js';

const base = '/solutions/';
const imageBase = '/assets/media/solutions/';
const visuals = '/assets/media/packaging-guides/';
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

function enquiry(quote, serviceKey = '', actionLabel = 'Request a quote') {
  const booking = '/booking/' + (serviceKey ? '?service=' + serviceKey : '');
  return `<section class="sl-wrap sl-next" aria-labelledby="solution-inquiry-title">
    <div class="sl-next__panel">
      <div>
        <h2 id="solution-inquiry-title" class="text-white">${serviceKey ? 'Review this with our team' : 'Tell us about your packaging project'}</h2>
        <p class="text-white">${serviceKey ? 'Share the details you have and what you need to confirm before making a decision.' : 'Share your brief for a quote, or book a consultation to talk through an open requirement.'}</p>
      </div>
      <div class="sl-actions">
        ${action(quote, actionLabel)}
        ${action(booking, 'Book a consultation', true)}
      </div>
    </div>
  </section>`;
}

function renderDeliverables(detail, key, escape) {
  return `<section class="sl-wrap sl-section sl-deliverables" id="service-deliverables" aria-labelledby="service-deliverables-title">
    <h2 id="service-deliverables-title">${escape(detail.heading)}</h2>
    <p>${escape(detail.lead)}</p>
    <dl>${detail.outcomes.map(([name, description]) => `<div><dt>${escape(name)}</dt><dd>${escape(description)}</dd></div>`).join('')}</dl>
    ${key === 'prepress' ? '<a class="sl-download" href="/assets/media/packaging-guides/artwork-checklist.pdf" download>Download artwork checklist (PDF) →</a>' : ''}
  </section>`;
}

function renderExampleRecord(record, escape) {
  return `<div class="sl-record">
    <h3>${escape(record.title)}</h3>
    <table aria-label="${escape(record.title)}">
      <thead><tr>${record.columns.map((label) => `<th scope="col">${escape(label)}</th>`).join('')}</tr></thead>
      <tbody>${record.rows.map(([row, value, check]) => `<tr><th scope="row">${escape(row)}</th>
        <td><span aria-hidden="true">${escape(record.columns[1])}</span>${escape(value)}</td>
        <td><span aria-hidden="true">${escape(record.columns[2])}</span>${escape(check)}</td></tr>`).join('')}</tbody>
    </table>
  </div>`;
}

function renderBuyingGuide(guide, detail, escape) {
  return `<section class="sl-example sl-wrap" id="service-example" aria-labelledby="service-example-title">
    <div class="sl-example__panel">
      <div><p class="sl-example__label">Illustrative project</p><h2 id="service-example-title">${escape(guide.example.title)}</h2>
        <p>${escape(guide.example.situation)}</p></div>
      <dl class="sl-list">
        <div><dt>What to review</dt><dd>${escape(guide.example.review)}</dd></div>
        <div><dt>Handoff for approval</dt><dd>${escape(guide.example.handoff)}</dd></div>
      </dl>
    </div>
      ${renderExampleRecord(detail.record, escape)}
  </section>
  <section class="sl-band" id="service-stages" aria-labelledby="service-stages-title">
    <div class="sl-wrap sl-section">
      <div class="sl-section-heading">
        <h2 id="service-stages-title">From brief to approval</h2>
        <p>${escape(guide.decision)}</p>
      </div>
      <ol class="sl-stages">
        ${guide.steps.map(([title, note, output], i) => `<li>
          <span class="sl-stage-number" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          <h3>${escape(title)}</h3>
          <p>${escape(note)}</p>
          <dl><dt>Output to agree</dt><dd>${escape(output)}</dd></dl>
        </li>`).join('')}
      </ol>
    </div>
  </section>
  <section class="sl-wrap sl-section" id="service-controls" aria-labelledby="service-controls-title">
    <h2 id="service-controls-title">What to verify before sign-off</h2>
    <div class="sl-controls">
      ${guide.checks.map(([title, check, record]) => `<article>
        <h3>${escape(title)}</h3>
        <dl><div><dt>Review</dt><dd>${escape(check)}</dd></div>
          <div><dt>Keep on file</dt><dd>${escape(record)}</dd></div></dl>
      </article>`).join('')}
    </div>
  </section>
  `;
}

export function renderSolutionsLayout({ entry, previous, publishedPaths, escape, processPath }) {
  const { path, row } = entry;
  if (!path.startsWith(base)) return null;
  const key = path.slice(base.length, -1);
  const overview = path === base;
  if (!overview && (!Object.hasOwn(solutions, key) || path !== base + key + '/')) return null;

  const service = overview ? null : solutions[key];
  const guide = overview ? null : buyingGuides[key];
  const detail = overview ? null : solutionDeliverables[key];
  const name = service?.name || 'Solutions';
  const title = escape(row.title !== previous.title && row.title ? row.title : service?.heading || 'Flexible packaging solutions');
  const lead = escape(row.summary?.trim() || service?.lead
    || 'Find the right support for your packaging project, from preparing artwork to reviewing materials and validating a filled pack.');
  const quoteQuery = new URLSearchParams();
  if (service) quoteQuery.set('service', key);
  if (key === 'retort') quoteQuery.set('format', 'retort-pouch');
  const query = quoteQuery.size ? '?' + escape(quoteQuery.toString()) : '';
  const quote = publishedPaths.has('/inquiry/') ? '/inquiry/' + query + '#quote-request' : '/contact/';
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
          ${action(quote, detail?.action || 'Request a quote')}
          ${action(service ? '#service-deliverables' : '#packaging-services', service ? 'View deliverables' : 'Explore services', true)}
        </div>
      </div>
      ${brandedVisual(detail?.image ? visuals + detail.image + '.webp' : imageBase + (key || 'overview') + '.webp',
        detail?.alt || service?.alt || 'Illustrative flexible film converting line with teal material and steel rollers',
        detail?.caption || 'Process illustration', escape, { className: 'sl-hero__visual', eager: true, expand: key === 'prepress' })}
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
      <section class="sl-band" id="choose-by-task" aria-labelledby="solution-tasks-title">
        <div class="sl-wrap sl-section sl-columns">
          <h2 id="solution-tasks-title">Find support by buying task</h2>
          <div class="sl-task-links">
            ${cards.map(([slug, item]) => `<a href="${base}${slug}/#service-stages">
              <span><strong>${escape(buyingGuides[slug].task)}</strong><small>${escape(item.name)}</small></span>${arrow}
            </a>`).join('')}
          </div>
        </div>
      </section>
      <section class="sl-wrap sl-section sl-columns" id="prepare-your-brief" aria-labelledby="solution-brief-title">
        <h2 id="solution-brief-title">What to include in your brief</h2>
        <dl class="sl-list">${procurement.map(([term, note]) => `<div><dt>${escape(term)}</dt><dd>${escape(note)}</dd></div>`).join('')}</dl>
      </section>
      ${enquiry(quote)}`;
  }

  const nextSteps = {
    prepress: [
      ['/markets/coffee-tea/', 'See coffee packaging specifications'],
      [qualityPath, 'Review artwork and quality approval records'],
    ],
    technical: [
      ['/markets/frozen-food/', 'See frozen-food trial requirements'],
      ['/products/roll-stock-films/', 'Prepare your rollstock specification'],
      [qualityPath, 'Review supplier quality documentation'],
    ],
    recycling: [['/sustainability/impact-report/', 'Find sustainability supporting documents']],
    retort: [[qualityPath, 'Review supplier quality documentation']],
  };
  const links = [...(nextSteps[key] || []), ...service.related].filter(([href]) => publishedPaths.has(href));
  if (publishedPaths.has(processPath)) links.push([processPath + '#process-stages', 'Our production process']);
  if (publishedPaths.has(base)) links.push([base, 'All packaging solutions']);
  return `${crumbs}${hero}
    <nav class="sl-jump" aria-label="On this page"><div class="sl-wrap">
      <a href="#service-deliverables">Deliverables</a><a href="#service-example">Worked example</a><a href="#service-stages">Approval stages</a>
      <a href="#service-controls">Sign-off checks</a><a href="#service-brief">Quote checklist</a>
      <a href="#service-faq">Questions</a>
    </div></nav>
    ${renderDeliverables(detail, key, escape)}
    ${renderBuyingGuide(guide, detail, escape)}
    <section class="sl-wrap sl-section sl-columns" id="service-process" aria-labelledby="service-process-title">
      <h2 id="service-process-title">What we review</h2>
      <dl class="sl-list">${service.scope.map(([term, note]) => `<div><dt>${escape(term)}</dt><dd>${escape(note)}</dd></div>`).join('')}</dl>
    </section>
    <section class="sl-band" id="service-brief" aria-labelledby="service-brief-title">
      <div class="sl-wrap sl-section">
        <div class="sl-section-heading sl-section-heading--split">
          <div><h2 id="service-brief-title">Prepare your quote request</h2>
          <p>Use the editable worksheet to collect the information that applies to your project.</p></div>
          <a class="sl-download" href="${imageBase}checklists/${key}-rfq.txt" download>Download RFQ worksheet (.txt) ${arrow}</a>
        </div>
        <div class="sl-checklist">
          <div><h3>What to send</h3><ul>${service.inputs.map(item => `<li>${escape(item)}</li>`).join('')}</ul></div>
          <div><h3>What we’ll confirm with you</h3><ul>${service.outputs.map(item => `<li>${escape(item)}</li>`).join('')}</ul></div>
        </div>
      </div>
    </section>
    <section class="sl-wrap sl-section sl-columns" id="service-faq" aria-labelledby="service-faq-title">
      <h2 id="service-faq-title">Common questions</h2>
      <div class="sl-answers">${[...service.faq, ...guide.faq].map(([question, answer]) => `<details><summary>${escape(question)}</summary><p>${escape(answer)}</p></details>`).join('')}</div>
    </section>
    ${key === 'technical' ? `<section class="sl-wrap sl-references" aria-labelledby="technical-trial-next">
      <h2 id="technical-trial-next">Prepare a sample and trial plan</h2>
      <ul><li><a href="${trialChecklist}" download>Download the filled-pack trial checklist ${arrow}</a></li>
      ${publishedPaths.has('/contact/') ? `<li><a href="${samplePath}">Ask about samples for your trial ${arrow}</a></li>` : ''}</ul>
    </section>` : ''}
    ${guide.resources?.length ? `<section class="sl-wrap sl-references" aria-label="Technical references"><h3>Technical references</h3>
      <ul>${guide.resources.map(([url, label]) => `<li><a href="${escape(url)}">${escape(label)} ${arrow}</a></li>`).join('')}</ul>
    </section>` : ''}
    ${links.length ? `<nav class="sl-wrap sl-related" aria-label="Related packaging services">
      ${links.map(([url, label]) => `<a href="${url}">${escape(label)} ${arrow}</a>`).join('')}
    </nav>` : ''}
    ${enquiry(quote, key, detail.action)}`;
}
