import { previewFormats } from './preview-formats.js';

const applications = [
  ['Whole bean coffee', 'Share the roast-to-pack interval, fill weight and pack height. Ask whether a one-way valve fits your filling and storage plan.'],
  ['Ground coffee', 'Specify grind, target shelf life and filling method. Review aroma protection, headspace and the seal area on a filled sample.'],
  ['Loose-leaf tea', 'Provide fill weight and the approximate volume of the leaves. Review moisture and light protection and how the customer will reclose the pack.'],
];

const formatChecks = {
  'stand-up-pouch': 'Check the opening width, zipper and how the filled pouch stands.',
  'flat-bottom-pouch': 'Check the filled footprint, print panels and case fit.',
  'pinch-bottom-pouches': 'Check the top closure and handling at the intended fill weight.',
  'roll-stock-films': 'Confirm machine type, web width, repeat length and unwind direction.',
  'quad-seal-bag': 'Check panel widths, pack footprint and top closure after filling.',
};

const specifications = [
  ['Film and barrier', 'Share the shelf-life target and storage conditions. If your spec has oxygen or moisture transmission limits, include the values and test conditions.'],
  ['Valve, zipper and opening', 'Flag a valve, reseal or tear feature early. Check its position against fill volume, headspace and the area used to seal the pouch.'],
  ['Artwork and finish', 'Provide the approved dimensions, artwork status, finish preferences and any areas that need to remain clear for coding or a barcode.'],
];

const review = [
  ['Confirm the specification', 'Agree the dimensions, material direction, closure and print scope. Ask what can be represented in a sample.'],
  ['Review a filled sample', 'Fill and seal it with your product, then check standing stability, opening and closing, and how it fits in a shipping case.'],
  ['Approve artwork and delivery', 'Confirm the proof, quantity by SKU, delivery destination and requested date before signing off on production.'],
];

const questions = [
  ['Does my coffee bag need a valve?', 'Share how soon you pack after roasting, the coffee form and your storage conditions. Review the valve decision and placement with your packaging team before approving the design.'],
  ['Can I compare samples before ordering?', 'Request a sample of the format or finish you want to review. Share your intended fill, target size and delivery region so the team can confirm the available sample options.'],
  ['How do I confirm MOQ and lead time?', 'Provide quantities per size and print design, the required features, artwork status and delivery destination. Ask for the applicable minimum, production estimate and shipping estimate for that specification.'],
];

export function coffeeFormatDetails(format, quoteUrl) {
  const check = formatChecks[format];
  const quote = quoteUrl.startsWith('/inquiry/') && previewFormats.has(format)
    ? `/inquiry/?format=${encodeURIComponent(format)}#quote-request`
    : '';
  return { check, quote };
}

export function renderCoffeeMarket({ publishedPaths, formatId, hasFormats, escape, arrow }) {
  const sampleLink = publishedPaths.has('/contact/') ? '/contact/?topic=samples#project-enquiry' : '';
  const processLink = publishedPaths.has('/sustainability/our-process/') ? '/sustainability/our-process/#process-stages' : '';
  const navLinks = [
    ['coffee-applications', 'Applications'],
    ...(hasFormats ? [[formatId, 'Pack formats']] : []),
    ['coffee-specifications', 'Materials & features'],
    ['coffee-sample-review', 'Sample & production'],
    ['project-brief', 'Quote checklist'],
  ];
  return {
    sampleLink,
    opening: `<nav class="mw-coffee-nav" aria-label="Coffee and tea packaging sections">
      <ul class="mw-market-inner">${navLinks.map(([id, label]) => `<li><a href="#${id}">${escape(label)}</a></li>`).join('')}</ul>
    </nav>
    <section class="mw-coffee-section mw-market-inner" id="coffee-applications" aria-labelledby="coffee-applications-title">
      <h2 id="coffee-applications-title">Specify the pack for what you sell</h2>
      <div class="mw-coffee-applications">
        ${applications.map(([title, body]) => `<article><h3>${escape(title)}</h3><p>${escape(body)}</p></article>`).join('')}
      </div>
    </section>`,
    technical: `<section class="mw-coffee-spec" id="coffee-specifications" aria-labelledby="coffee-specifications-title">
      <div class="mw-market-inner mw-coffee-spec-grid">
        <div class="mw-coffee-spec-visual">
          <h2 id="coffee-specifications-title">Define the material and features</h2>
          <img src="/assets/media/blog-covers/understanding-barrier-materials-in-flexible-packaging.webp"
            alt="Illustrative layers of flexible packaging films" width="1600" height="900" loading="lazy" decoding="async">
        </div>
        <dl class="mw-coffee-spec-list">
          ${specifications.map(([title, body]) => `<div><dt>${escape(title)}</dt><dd>${escape(body)}</dd></div>`).join('')}
        </dl>
      </div>
    </section>
    <section class="mw-coffee-section mw-market-inner" id="coffee-sample-review" aria-labelledby="coffee-sample-review-title">
      <div class="mw-market-section-heading">
        <h2 id="coffee-sample-review-title">From specification to production</h2>
        ${processLink ? `<a class="mw-market-text-link" href="${processLink}">Explore the production process ${arrow}</a>` : ''}
      </div>
      <ol class="mw-coffee-review">
        ${review.map(([title, body]) => `<li><h3>${escape(title)}</h3><p>${escape(body)}</p></li>`).join('')}
      </ol>
      ${sampleLink ? `<div class="mw-coffee-review-links">
        <a class="mw-market-button" href="${sampleLink}">Ask about samples ${arrow}</a>
      </div>` : ''}
    </section>`,
    faq: `<section class="mw-coffee-section mw-market-inner" aria-labelledby="coffee-questions-title">
      <h2 id="coffee-questions-title">Common purchasing questions</h2>
      <div class="mw-coffee-faq">
        ${questions.map(([question, answer]) => `<details><summary>${escape(question)}</summary><p>${escape(answer)}</p></details>`).join('')}
      </div>
    </section>`,
  };
}
