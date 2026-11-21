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

const quoteExample = [
  {
    name: '250 g retail pack',
    format: 'Flat-bottom pouch',
    requirements: 'Plan for repeated opening and a front panel that faces forward on the shelf.',
    sample: 'Confirm the filled footprint, zipper clearance and back-panel space for the barcode.',
    quote: 'Specify the selling size, print designs and estimated units per design.',
  },
  {
    name: '1 kg wholesale pack',
    format: 'Pinch-bottom pouch',
    requirements: 'Allow for the larger fill and check how the pack stacks in a shipping case.',
    sample: 'Fill and seal on the intended equipment. Check the top closure, pack dimensions and units per case.',
    quote: 'Provide the intended case pack, shipping destination and requested delivery date.',
  },
];

const consultationTopics = [
  ['Product and filling', 'Share the coffee or tea type, fill weight and how the pack will be filled and sealed.'],
  ['Material and features', 'Discuss barrier targets, valve placement, reseal options and artwork constraints.'],
  ['First sample and quote', 'Decide which sizes or constructions to compare and what to send for a project quote.'],
];

const questions = [
  ['Does my coffee bag need a valve?', 'Share how soon you pack after roasting, the coffee form and your storage conditions. Review the valve decision and placement with your packaging team before approving the design.'],
  ['Can I compare samples before ordering?', 'Request a sample of the format or finish you want to review. Share your intended fill, target size and delivery region so the team can confirm the available sample options.'],
  ['How do I confirm MOQ and lead time?', 'Provide quantities per size and print design, the required features, artwork status and delivery destination. Ask for the applicable minimum, production estimate and shipping estimate for that specification.'],
];

export function coffeeFormatCheck(format) {
  return formatChecks[format];
}

export function renderCoffeeMarket({ publishedPaths, formatId, hasFormats, escape, arrow }) {
  const bookingLink = '/booking/?topic=coffee-tea';
  const sampleLink = publishedPaths.has('/contact/') ? '/contact/?topic=samples#project-enquiry' : '';
  const processLink = publishedPaths.has('/sustainability/our-process/') ? '/sustainability/our-process/#process-stages' : '';
  const navLinks = [
    ['market-selection', 'Applications'],
    ...(hasFormats ? [[formatId, 'Pack formats']] : []),
    ['coffee-specifications', 'Materials & features'],
    ['coffee-quote-example', 'Spec example'],
    ['coffee-sample-review', 'Sample & production'],
    ['project-brief', 'Quote checklist'],
    ['coffee-consultation', 'Book a consultation'],
  ];
  return {
    consultationAnchor: '#coffee-consultation',
    opening: `<nav class="mw-coffee-nav" aria-label="Coffee and tea packaging sections">
      <ul class="mw-market-inner">${navLinks.map(([id, label]) => `<li><a href="#${id}">${escape(label)}</a></li>`).join('')}</ul>
    </nav>`,
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
    <section class="mw-coffee-section mw-market-inner" id="coffee-quote-example" aria-labelledby="coffee-quote-example-title">
      <h2 id="coffee-quote-example-title">One roast, two pack specifications</h2>
      <p class="mw-coffee-example-lead">Illustrative project for a roaster planning a retail pack and a wholesale pack. Use the example to see how the use case shapes the sample request and the quote.</p>
      <div class="mw-coffee-example-grid">
        ${quoteExample.map(({ name, format, requirements, sample, quote }) => `<article class="mw-coffee-example">
          <h3>${escape(name)}</h3>
          <p class="mw-coffee-example-format">${escape(format)}</p>
          <dl>
            <div><dt>Use case</dt><dd>${escape(requirements)}</dd></div>
            <div><dt>Check on the sample</dt><dd>${escape(sample)}</dd></div>
            <div><dt>Include in the quote</dt><dd>${escape(quote)}</dd></div>
          </dl>
        </article>`).join('')}
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
    consultation: `<section class="mw-coffee-consultation mw-market-inner" id="coffee-consultation" aria-labelledby="coffee-consultation-title">
      <div class="mw-coffee-consultation-copy">
        <h2 class="text-white" id="coffee-consultation-title">Book a packaging consultation</h2>
        <p class="text-white">Talk through your coffee or tea project with Mewepak when you’re still comparing formats, materials or sample options.</p>
        <a class="mw-coffee-book-button" href="${bookingLink}">Choose a consultation time ${arrow}</a>
        <p class="mw-coffee-book-prep text-white">Have a current pouch or pack spec? Keep it handy for the discussion.</p>
      </div>
      <div class="mw-coffee-consultation-agenda">
        <h3>What we can review</h3>
        <dl>
          ${consultationTopics.map(([label, description]) => `<div><dt>${escape(label)}</dt><dd>${escape(description)}</dd></div>`).join('')}
        </dl>
      </div>
    </section>`,
    faq: `<section class="mw-coffee-section mw-market-inner" aria-labelledby="coffee-questions-title">
      <h2 id="coffee-questions-title">Common purchasing questions</h2>
      <div class="mw-coffee-faq">
        ${questions.map(([question, answer]) => `<details><summary>${escape(question)}</summary><p>${escape(answer)}</p></details>`).join('')}
      </div>
    </section>`,
  };
}
