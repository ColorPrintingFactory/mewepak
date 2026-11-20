import { brandedVisual } from './packaging-visual.js';
import { depth, guideItems } from './resource-depth-content.js';

const media = '/assets/media/packaging-guides/';
const materialReview = '/inquiry/?service=recycling#quote-request';
const reportContact = '/contact/?topic=impact-report#project-enquiry';

function signedPhoto(filename, alt, caption) {
  return [media + filename, alt, caption, { embeddedLogo: true }];
}

const pages = {
  'pouch-patrol': {
    title: 'Meet the team behind your pack', short: 'Pouch Patrol',
    intro: 'See who reviews the brief, tests the sample and approves each file before a flexible packaging order goes into production.',
    action: ['/booking/', 'Book a project consultation'],
  },
  'on-the-road': {
    title: 'Meet Mewepak and review a sample', short: 'On The Road',
    intro: 'Ask about upcoming trade shows, discuss sample packs online or enquire about visiting the factory.',
    action: ['/contact/?topic=events#project-enquiry', 'Ask about upcoming events'],
    image: signedPhoto('event-sample-meeting.webp', 'Visitors discussing flexible pouch samples at an exhibition counter', 'Concept visual · packaging sample meeting'),
  },
  'keepin-it-green': {
    title: 'Plan a packaging material change', short: 'Keepin’ It Green',
    intro: 'Compare a proposed material with the pack you use today. Agree what to measure, how to trial it and what your team needs to approve.',
    action: [materialReview, 'Discuss a material change'],
    image: [media + 'materials-workbench.webp', 'Pouches and film swatches on a sample workbench', 'Concept visual · material comparison'],
  },
  careers: {
    title: 'Careers at Mewepak', short: 'Careers',
    intro: 'Explore the work behind a finished pouch, from design and prepress to converting, quality and customer support.',
    action: ['/contact/?topic=careers#project-enquiry', 'Send a careers enquiry'],
    image: signedPhoto('packaging-careers.webp', 'Packaging specialists examining roll stock and a finished pouch at a workbench', 'Concept visual · careers in packaging'),
  },
  'help-center': {
    title: 'Packaging help centre', short: 'Help Center',
    intro: 'Find artwork checklists, sample worksheets and supplier documents. Use the directory to find what to download or who to contact.',
    action: ['#resource-library', 'Search the resource library'],
    image: [media + 'format-library.webp', 'Stand-up pouch, flat sachet, flat-bottom pouch and roll stock samples', 'Concept visual · packaging formats'],
  },
  'sustainable-packaging': {
    title: 'Sustainable packaging options', short: 'Sustainable Packaging',
    intro: 'Compare changes by application, from lighter packs to refill formats and structures designed for recycling. Start with the protection your product still needs.',
    action: [materialReview, 'Request a material review'],
    image: [media + 'materials-workbench.webp', 'Concept pouch and film samples with a caliper', 'Concept visual · material comparison'],
  },
  operations: {
    title: 'Environmental practices in manufacturing', short: 'Operations Sustainability',
    intro: 'Prepare site-level evidence requests for energy, production waste, water and air, and understand how that evidence relates to a specific pack.',
    action: ['/contact/?topic=operations-evidence#project-enquiry', 'Request operations information'],
  },
  social: {
    title: 'People and responsible operations', short: 'Social Sustainability',
    intro: 'Prepare a supplier review around the sites, training, workplace practices and follow-up records your team needs.',
    action: ['/contact/?topic=social-evidence#project-enquiry', 'Request supplier information'],
    image: signedPhoto('workplace-training.webp', 'Packaging specialists reviewing pouch samples during a training session', 'Concept visual · workplace training'),
  },
  'impact-report': {
    title: 'Impact reporting and document access', short: 'Impact Report',
    intro: 'Identify the right record for your supplier assessment, including the year and sites it should cover.',
    action: [reportContact, 'Request a report or supporting data'],
    image: signedPhoto('supplier-document-review.webp', 'Folders and packaging film samples ready for a supplier document review', 'Concept visual · supplier document review'),
  },
  'lca-tool': {
    title: 'Compare two packaging scenarios', short: 'Life Cycle Analysis Tool',
    intro: 'Use the calculator to compare packaging mass and modelled climate impact. Adjust the assumptions, view the results and export the scenario.',
    action: ['#lca-explorer', 'Open the comparison'],
    image: signedPhoto('packaging-comparison.webp', 'Two flexible packaging samples beside a laboratory scale', 'Concept visual · comparing pack weight'),
  },
};

function link(href, label, escape, className = '', download = false) {
  return `<a class="${className}" href="${escape(href)}"${download ? ' download' : ''}>${escape(label)} <span aria-hidden="true">↗</span></a>`;
}

function matrix({ headers, rows }, title, escape) {
  return `<table aria-label="${escape(title)}"><thead><tr>${headers.map(name => `<th scope="col">${escape(name)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(([key, ...cells]) => `<tr><th scope="row">${escape(key)}</th>
      ${cells.map((cell, index) => `<td><span aria-hidden="true">${escape(headers[index + 1])}</span>
        ${Array.isArray(cell) ? link(cell[1], cell[0], escape, 'mwr-link') : escape(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function feature({ id, title, intro, steps, cards, cases, matrix: data }, escape) {
  return `<section class="mwr-inner mwr-body mwr-feature" id="${id}" aria-labelledby="${id}-title">
    <div class="mwr-heading"><h2 id="${id}-title">${escape(title)}</h2>${intro ? `<p>${escape(intro)}</p>` : ''}</div>
    ${steps ? `<ol class="mwr-steps">${steps.map(([name, owner, text, outcome], i) => `<li>
      <span class="mwr-step-index" aria-hidden="true">${String(i + 1).padStart(2,'0')}</span>
      <p class="mwr-step-owner">${escape(owner)}</p><h3>${escape(name)}</h3><p>${escape(text)}</p>
      <div><strong>Output</strong><span>${escape(outcome)}</span></div>
    </li>`).join('')}</ol>` : ''}
    ${cards ? `<div class="mwr-feature-grid">${cards.map(([name, text, href, label]) => `<article>
      <h3>${escape(name)}</h3><p>${escape(text)}</p>${href ? link(href, label, escape, 'mwr-link') : ''}
    </article>`).join('')}</div>` : ''}
    ${cases ? `<div class="mwr-case-grid">${cases.map(([image, alt, use, name, text, href]) => `<article>
      <img src="${escape(image)}" alt="${escape(alt)}" width="600" height="375" loading="lazy" decoding="async">
      <div><p class="mwr-step-owner">${escape(use)}</p><h3>${escape(name)}</h3><p>${escape(text)}</p>
      ${link(href, 'Explore the application', escape, 'mwr-link')}</div>
    </article>`).join('')}</div>` : ''}
    ${data ? matrix(data, title, escape) : ''}
  </section>`;
}

function examplePanel([label, title, detail, href, action, download], escape) {
  return `<section class="mwr-example"><div class="mwr-inner mwr-example__body">
    <div><p class="mwr-step-owner">${escape(label)}</p><h2>${escape(title)}</h2></div>
    <div><p>${escape(detail)}</p>${link(href, action, escape, 'mwr-link', download)}</div>
  </div></section>`;
}

function questionPanel(questions, escape) {
  return `<section class="mwr-inner mwr-body mwr-questions" aria-labelledby="mwr-questions-title">
    <h2 id="mwr-questions-title">Questions to clarify</h2>
    <div>${questions.map(([question, answer]) => `<details><summary>${escape(question)}</summary><p>${escape(answer)}</p></details>`).join('')}</div>
  </section>`;
}

function helpLibrary(escape) {
  return `<section class="mwr-inner mwr-body mwr-library" id="resource-library" data-resource-library aria-labelledby="resource-library-title">
    <div class="mwr-heading"><h2 id="resource-library-title">Resource library</h2>
      <p>Download a worksheet, open a guide or send a project-specific request.</p></div>
    <form class="mwr-search" role="search" aria-label="Search the packaging resource library" hidden>
      <label>Search resources<input type="search" name="query" placeholder="Try artwork, samples or evidence"></label>
      <label>Resource type<select name="type"><option value="">All types</option><option>PDF</option><option>CSV</option><option>Guide</option><option>Tool</option><option>Request</option></select></label>
    </form>
    <p class="mwr-library-status" role="status" hidden></p>
    <div class="mwr-collection">${guideItems.map(([name, id, rows]) => `<section id="${id}" data-resource-group>
      <h3>${escape(name)}</h3><div>${rows.map(([title, description, href, label, type]) => `<article class="mwr-document" data-resource-type="${type}">
        <div><span class="mwr-document-type">${type}</span><h4>${escape(title)}</h4><p>${escape(description)}</p></div>
        ${link(href, label, escape, 'mwr-link', type === 'PDF' || type === 'CSV')}</article>`).join('')}</div>
      </section>`).join('')}</div>
    <div class="mwr-library-empty" hidden><h3>No resources match</h3><p>Shorten your search or select all resource types.</p></div>
  </section>`;
}

function materialComparison(escape) {
  const title = 'What to verify before changing materials';
  const comparison = {
    headers: ['Packaging direction', 'Use for an initial review', 'Evidence and tests to compare'],
    rows: [
      ['Mono-material design', 'Assess material and component compatibility for the intended recovery stream.', 'Full layer and component specification, barrier and seal checks, and market-specific design guidance.'],
      ['Lower pack weight', 'Compare less material for the same product and fill.', 'Finished pack weight, handling, liner or closure changes, and performance on the filling line.'],
      ['Recycled content', 'Assess a documented content target for a suitable application.', 'Supplier declaration scope, application requirements, protection and line performance.'],
      ['Refill format', 'Assess a smaller refill pack for an existing dispensing system.', 'Full refill and dispenser assumptions, dosing, shelf life, leakage checks and transport.'],
    ],
  };
  return `<section class="mwr-inner mwr-body mwr-feature" id="material-evidence" aria-labelledby="material-evidence-title">
    <div class="mwr-heading"><h2 id="material-evidence-title">${title}</h2></div>
    ${matrix(comparison, title, escape)}
    <p class="mwr-after-table">${link(media + 'mewepak-material-review.csv', 'Download the material review worksheet', escape, 'mwr-link', true)}</p>
  </section>`;
}

async function renderLca(getAsset) {
  const parent = await getAsset('/sustainability/');
  if (!parent.ok) return '';
  const source = await parent.text();
  const form = source.match(/<section id="lca-explorer"[^>]*>[\s\S]*?<\/section>/)?.[0];
  const dashboard = source.match(/<section id="impact-dashboard"[^>]*>[\s\S]*?<\/section>/)?.[0];
  if (!form || !dashboard) return '';
  return `<div id="mewepak-homepage" class="sustainability-page mwr-lca mwr-calculator">
    <section class="mwr-inner mwr-examples" aria-labelledby="mwr-example-presets"><h2 id="mwr-example-presets">Start with a worked example</h2>
      <p>These scenarios use illustrative inputs. Open one and replace the values with equivalent project data.</p>
      <div class="mwr-example-buttons" data-enhanced hidden>
        <button type="button" data-lca-preset="mass" aria-pressed="true">Compare pack weight</button>
        <button type="button" data-lca-preset="freight" aria-pressed="false">Compare freight factors</button>
        <button type="button" data-lca-preset="materials" aria-pressed="false">Compare material factors</button>
      </div>
    </section>
    ${form.replace('class="mw-inner"', 'class="mw-inner mwr-inner"').replace('Compare two<br>packaging scenarios.', 'Enter your baseline and proposed packs')}
    ${dashboard.replace('class="mw-inner"', 'class="mw-inner mwr-inner"')
      .replace('See what changes<br>when the pack changes.', 'Compare the results')
      .replace('These figures compare two packaging scenarios using the editable inputs in the LCA explorer. The starting example changes pack weight from 12 g to 9 g.', 'The chart uses the pack weights and stage factors entered above. Switch between the full order and 1,000 equivalent packs.')}
  </div>`;
}

export async function renderResourceLayout({ entry, previous, escape, getAsset }) {
  const { path, row } = entry;
  const route = /^\/(added-value|sustainability)\/([a-z-]+)\/$/.exec(path);
  if (!route || !Object.hasOwn(pages, route[2])) return null;
  const [, group, key] = route;
  const page = pages[key];
  const detail = depth[key];
  const isLca = key === 'lca-tool';
  const isLibrary = key === 'help-center';
  const sustainability = group === 'sustainability';
  const parent = sustainability ? 'Sustainability' : 'Added Value';
  const title = row.title && row.title !== previous.title ? row.title : page.title;
  const [src, alt, caption, imageOptions] = detail.image || page.image || [];
  const heroPhoto = src ? brandedVisual(src, alt, caption, escape, { ...imageOptions, eager: true }) : '';
  const lca = isLca ? await renderLca(getAsset) : '';
  if (isLca && !lca) return null;

  return {
    isLca,
    isLibrary,
    html: `<nav class="mwr-inner mwr-crumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span>
      <a href="/${group}/">${parent}</a><span aria-hidden="true">/</span><span aria-current="page">${escape(page.short)}</span>
    </nav>
    <header class="mwr-hero mwr-hero--editorial${heroPhoto ? ' mwr-hero--photo' : ''}">
      <div class="mwr-inner mwr-hero__grid">
        <div><p class="mwr-kicker">${parent} <span aria-hidden="true">/</span> ${escape(page.short)}</p><h1 class="text-white">${escape(title)}</h1><p>${escape(page.intro)}</p>
          <div class="mwr-hero-actions">${link(...page.action, escape, 'mwr-button')}${link(...detail.second, escape, 'mwr-link')}</div>
        </div>
        ${heroPhoto}
      </div>
    </header>
    ${detail.feature ? feature(detail.feature, escape) : ''}
    ${isLibrary ? helpLibrary(escape) : ''}
    ${key === 'sustainable-packaging' ? materialComparison(escape) : ''}
    ${lca}
    ${detail.example ? examplePanel(detail.example, escape) : ''}
    ${questionPanel(detail.questions, escape)}`,
  };
}
