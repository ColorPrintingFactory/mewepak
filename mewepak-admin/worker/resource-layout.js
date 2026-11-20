import { brandedVisual } from './packaging-visual.js';

const media = '/assets/media/packaging-guides/';
const artwork = media + 'artwork-checklist.pdf';
const trial = media + 'filled-pack-trial-checklist.pdf';
const brief = media + 'packaging-project-brief.pdf';
const artworkRequest = '/inquiry/?service=prepress#quote-request';
const materialReview = '/inquiry/?service=recycling#quote-request';
const contact = '/contact/#project-enquiry';
const eventContact = '/contact/?topic=events#project-enquiry';
const reportContact = '/contact/?topic=impact-report#project-enquiry';

const resourcePages = {
  '/added-value/pouch-patrol/': {
    title: 'Meet the team behind your pack',
    short: 'Pouch Patrol',
    lead: 'Know who to bring into the conversation at each stage, from preparing a project brief to releasing the pack for production.',
    action: ['/booking/', 'Book a project consultation'],
    heading: 'Who does what on a packaging project',
    items: [
      ['Project contact', 'Collects your product, quantities and delivery needs. Agree the brief and the next decision before asking for a production quote.'],
      ['Artwork and prepress', 'Reviews the drawing, artwork versions and proof requests with the people signing off the design.', '/solutions/prepress/', 'Explore artwork review'],
      ['Technical support', 'Helps agree sample and line-trial questions with the people filling and handling the pack.', '/solutions/technical/', 'Plan a packaging trial'],
      ['Quality and production', 'Confirm the accepted specifications, sample references and handoff before the pack goes to production.', '/sustainability/our-process/#process-stages', 'Explore production stages'],
    ],
    note: ['Have a project already in progress?', 'Include your quote or sample reference, the package revision, and the decision you need help with.'],
  },
  '/added-value/on-the-road/': {
    title: 'Trade shows and meetings',
    short: 'On The Road',
    lead: 'Ask where you can meet Mewepak or arrange a separate discussion about your packaging project.',
    action: [eventContact, 'Ask about upcoming events'],
    heading: 'Arrange a meeting',
    items: [
      ['Meet at an event', 'Send the event name, city and the days you plan to attend. Ask the team to confirm attendance and meeting availability.', eventContact, 'Send an event enquiry'],
      ['Discuss samples', 'Tell us which pouch constructions, sizes or finishes you want to see so we can confirm what to bring.'],
      ['Meet online', 'Book a packaging consultation when an in-person meeting is inconvenient.', '/booking/', 'Choose a consultation time'],
    ],
    note: ['Planning your visit?', 'Include the project name, packaging format and the people joining the conversation.'],
  },
  '/added-value/keepin-it-green/': {
    title: 'Plan a packaging material change',
    short: 'Keepin’ It Green',
    lead: 'Start with the pack you already use. Document what it needs to do, then compare a proposed material and agree how to verify the change.',
    action: [materialReview, 'Discuss a material change'],
    image: ['materials-workbench.webp', 'Pouches and film swatches on a sample workbench', 'Concept visual · material comparison'],
    heading: 'Bring the right inputs into the review',
    items: [
      ['Document the baseline', 'Record the existing film, closure, pack weight, product and shelf-life requirements. Add the places where the product is sold.'],
      ['Compare a candidate', 'Use the same product, pack performance requirements and storage assumptions to review both options.', '/sustainability/sustainable-packaging/', 'Explore material directions'],
      ['Agree the validation', 'Confirm the required sample checks, documents, market assumptions and approval owner.', '/solutions/recycling/', 'Review a specific project'],
    ],
    note: ['Preparing a project comparison?', 'Use the packaging screening tool to compare pack weight and modelled emissions with the same inputs and boundaries.', '/sustainability/lca-tool/', 'Compare packaging scenarios'],
  },
  '/added-value/careers/': {
    title: 'Careers at Mewepak',
    short: 'Careers',
    lead: 'Interested in flexible packaging? Tell us about the type of work, location and skills you bring.',
    action: ['/contact/?topic=careers#project-enquiry', 'Send a careers enquiry'],
    heading: 'Areas of work',
    items: [
      ['Packaging and artwork', 'Project briefs, pouch formats, print preparation and artwork review.'],
      ['Manufacturing and quality', 'Film, print, converting, inspection and production documentation.'],
      ['Customer and project support', 'Specifications, samples, cross-team coordination and delivery communication.'],
    ],
    note: ['How to enquire', 'Tell us your area of interest, current location and relevant experience. Ask the team about roles currently open.'],
  },
  '/added-value/help-center/': {
    title: 'Packaging help centre',
    short: 'Help Center',
    lead: 'Get the right document or guidance for artwork, samples, quotes and delivery. Start with the task you need to finish.',
    action: ['#resource-library', 'Find a checklist or guide'],
    image: ['format-library.webp', 'Stand-up pouch, flat sachet, flat-bottom pouch and roll stock samples', 'Concept visual · packaging formats'],
    heading: 'Documents and practical next steps',
    sections: [
      ['Artwork and dielines', [
        ['Artwork checklist', 'Prepare files, references and variant names for a proof review.', artwork, 'Download PDF', true],
        ['Project-specific dieline', 'Share your format, dimensions and required features so the team can identify the right drawing for your project.', artworkRequest, 'Request a dieline'],
      ]],
      ['Samples and trials', [
        ['Filled-pack trial checklist', 'Plan the filling, closure, handling and sample checks with your team.', trial, 'Download PDF', true],
        ['Project samples', 'Share the format, fill size, finish and delivery region to check available samples.', '/contact/?topic=samples#project-enquiry', 'Ask about samples'],
      ]],
      ['Quotes and order details', [
        ['Packaging project brief', 'Prepare product details, quantities by SKU, artwork status and delivery information.', brief, 'Download PDF', true],
        ['Quote and delivery questions', 'Find guidance on quantities, timelines, delivery and what to include in a quote request.', '/added-value/faq/#quotes-samples-orders', 'Browse FAQ'],
      ]],
    ],
    note: ['Need project-specific specifications?', 'Tell us the packaging format, intended use and documents you need. Add your quote number if you have one.', contact, 'Ask for specifications'],
  },
  '/sustainability/sustainable-packaging/': {
    title: 'Sustainable packaging options',
    short: 'Sustainable Packaging',
    lead: 'Compare material directions using the protection your product needs, how the pouch is filled and where the finished pack is sold.',
    action: [materialReview, 'Request a material review'],
    image: ['materials-workbench.webp', 'Concept pouch and film samples with a caliper', 'Concept visual · material comparison'],
    heading: 'Choose which change to investigate',
    table: {
      heads: ['Direction to assess', 'When to consider it', 'What to verify'],
      rows: [
        ['Mono-material design', 'You want to assess a simpler material structure for the intended destination.', 'Full construction including closures, inks and other components, product protection and destination-specific evidence.'],
        ['Lower pack weight', 'You are looking to reduce packaging mass for an existing product.', 'Strength, filled-pack handling, line performance and a comparable pack weight.'],
        ['Recycled-content construction', 'The project has a recycled-content objective.', 'Supplier documentation, scope, intended use and applicable customer requirements.'],
      ],
    },
    note: ['Already comparing two packs?', 'Bring your current construction, fill details, delivery market and any supporting data. Use sample trials to resolve product protection and equipment questions.', '/sustainability/lca-tool/', 'Open the comparison tool'],
  },
  '/sustainability/operations/': {
    title: 'Environmental practices in manufacturing',
    short: 'Operations Sustainability',
    lead: 'Find out which site records, reporting periods and manufacturing processes apply to your packaging project.',
    action: [reportContact, 'Request operations information'],
    heading: 'Information to request for a supplier review',
    items: [
      ['Energy and emissions', 'Identify the relevant site, reporting period and activities covered. Ask which records apply to your specification.'],
      ['Water and air', 'Ask what monitoring or records are available for the sites and processes relevant to your enquiry.'],
      ['Production waste', 'Ask about how relevant trim and production scrap are handled, what is tracked and which reporting period applies.'],
    ],
    note: ['Start with the site and scope', 'Share your project reference, reporting period and information request so available records can be matched to the enquiry.', '/sustainability/impact-report/', 'View reporting and document access'],
  },
  '/sustainability/social/': {
    title: 'People and responsible operations',
    short: 'Social Sustainability',
    lead: 'Discuss the workforce and site information your supplier review requires and which supporting records may be available.',
    action: [reportContact, 'Request supplier information'],
    heading: 'Topics for a supplier review',
    items: [
      ['Training and onboarding', 'Ask what role-specific training or onboarding records are available for the sites covered by your review.'],
      ['Workplace health and safety', 'Provide the site, reporting period and specific information your team needs.'],
      ['Community and workplace initiatives', 'Request information for a specific location, activity or reporting period.'],
    ],
    note: ['Have a supplier questionnaire?', 'Include the requested scope, document list and review deadline when contacting the team.'],
  },
  '/sustainability/impact-report/': {
    title: 'Impact reporting and document access',
    short: 'Impact Report',
    lead: 'Request available company or site information for your supplier review. Include the scope and reporting period you need.',
    action: [reportContact, 'Request a report or supporting data'],
    heading: 'What to include in a document request',
    items: [
      ['Reporting period and site', 'List the year or date range and the company, sites or activities the documentation should cover.'],
      ['Environmental information', 'Identify the metrics or topics you need and whether you require full documents or selected records.', '/sustainability/operations/', 'Explore operations topics'],
      ['Social or workforce information', 'Share the scope, location and any evidence requirements so the team can check availability.', '/sustainability/social/', 'Explore social sustainability topics'],
    ],
    note: ['Need records for a qualification deadline?', 'Include the request deadline, the supplier questionnaire if applicable, and a packaging project reference.'],
  },
  '/sustainability/lca-tool/': {
    title: 'Compare two packaging scenarios',
    short: 'Life Cycle Analysis Tool',
    lead: 'Estimate the packaging mass and modelled climate impact for two equivalent packs using consistent boundaries and data.',
    action: ['#lca-explorer', 'Open the comparison'],
  },
};

function link(href, label, escape, className = '', download = false) {
  return `<a class="${className}" href="${escape(href)}"${download ? ' download' : ''}>${escape(label)} <span aria-hidden="true">↗</span></a>`;
}

function resourceLink(row, escape) {
  const [title, description, href, label, download] = row;
  return `<div class="mwr-document">
    <div><h3>${escape(title)}</h3><p>${escape(description)}</p></div>
    ${href ? link(href, label, escape, 'mwr-link', download) : ''}
  </div>`;
}

function resourceTable(table, escape) {
  return `<table aria-label="Packaging material directions">
    <thead><tr>${table.heads.map((name) => `<th scope="col">${escape(name)}</th>`).join('')}</tr></thead>
    <tbody>${table.rows.map(([name, when, checks]) => `<tr><th scope="row">${escape(name)}</th>
      <td><span aria-hidden="true">${escape(table.heads[1])}</span>${escape(when)}</td>
      <td><span aria-hidden="true">${escape(table.heads[2])}</span>${escape(checks)}</td></tr>`).join('')}</tbody>
  </table>`;
}

async function renderLca(getAsset) {
  const parent = await getAsset('/sustainability/');
  if (!parent.ok) return '';
  const source = await parent.text();
  const form = source.match(/<section id="lca-explorer"[^>]*>[\s\S]*?<\/section>/)?.[0];
  if (!form) return '';
  return `<div id="mewepak-homepage" class="sustainability-page mwr-lca">
    ${form.replace('class="mw-inner"', 'class="mw-inner mwr-inner"').replace('Compare two<br>packaging scenarios.', 'Enter your baseline and proposed packs')}
  </div>`;
}

export async function renderResourceLayout({ entry, previous, escape, getAsset }) {
  const { path, row } = entry;
  const page = resourcePages[path];
  if (!page) return null;
  const isLca = path === '/sustainability/lca-tool/';
  const sustainability = path.startsWith('/sustainability/');
  const parent = sustainability ? 'Sustainability' : 'Added Value';
  const parentLink = sustainability ? '/sustainability/' : '/added-value/';
  const title = row.title && row.title !== previous.title ? row.title : page.title;
  const lca = isLca ? await renderLca(getAsset) : '';
  if (isLca && !lca) return null;

  return {
    isLca,
    html: `<nav class="mwr-inner mwr-crumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span>
      <a href="${parentLink}">${parent}</a><span aria-hidden="true">/</span><span aria-current="page">${escape(page.short)}</span>
    </nav>
    <header class="mwr-hero${page.image ? ' mwr-hero--photo' : ''}">
      <div class="mwr-inner mwr-hero__grid">
        <div><h1>${escape(title)}</h1><p>${escape(page.lead)}</p>
          ${link(...page.action, escape, 'mwr-button')}
        </div>
        ${page.image ? brandedVisual(media + page.image[0], page.image[1], page.image[2], escape, { eager: true }) : ''}
      </div>
    </header>
    ${lca || `<section class="mwr-inner mwr-body" id="resource-library" aria-labelledby="mwr-body-title">
      <h2 id="mwr-body-title">${escape(page.heading)}</h2>
      ${page.sections ? `<div class="mwr-collection">${page.sections.map(([name, rows]) => `<section>
        <h3>${escape(name)}</h3><div>${rows.map(row => resourceLink(row, escape)).join('')}</div>
      </section>`).join('')}</div>` : page.table ? resourceTable(page.table, escape)
          : `<div class="mwr-items">${page.items.map(row => resourceLink(row, escape)).join('')}</div>`}
    </section>`}
    ${page.note ? `<section class="mwr-inner mwr-note"><div><h2>${escape(page.note[0])}</h2><p>${escape(page.note[1])}</p></div>
      ${page.note[2] ? link(page.note[2], page.note[3], escape, 'mwr-button') : ''}
    </section>` : ''}`,
  };
}
