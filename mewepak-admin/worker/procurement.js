export const samplePath = '/contact/?topic=samples#project-enquiry';
export const qualityPath = '/about-us/quality-certifications/';
export const trialChecklist = '/assets/media/packaging-guides/filled-pack-trial-checklist.pdf';
const dielinePath = (format) => '/solutions/dieline-generator/?format=' + format;

export const formats = {
  'bag-in-box': {
    heading: 'Custom Bag-in-Box Packaging',
    materials: 'Match the liner to the liquid and filling process',
    options: 'Box fit, fitment and dispensing options',
    approval: 'Check the full box and liner together',
    checks: [
      ['Liner and carton fit', 'Share the liquid, fill volume, carton dimensions and the position of the carton opening.'],
      ['Fitment and filling', 'Confirm the filling head, fitment diameter and cap or tap interface before ordering samples.'],
      ['Handling and dispensing', 'Check leaks around the fitting, flow at the intended orientation and how the liner empties.'],
    ],
    links: [['/markets/beverage/', 'Beverage packaging'], ['/solutions/technical/', 'Filling-line and dispensing review'], [qualityPath, 'Quality evidence for approval']],
  },
  'flat-bottom-pouch': {
    heading: 'Custom Flat-Bottom Pouches',
    materials: 'Choose film for barrier and base stability',
    options: 'Base depth, reseal and valve options',
    approval: 'Check shelf and case fit with a filled pouch',
    checks: [
      ['Filled dimensions and shelf fit', 'Provide the fill weight, bulk density, target width and height, and the space available on shelf and in the shipping case.'],
      ['Base, zipper and valve', 'Confirm how the base opens and whether the pack needs a zipper, tear notch or degassing valve. Review valve position on the dieline.'],
      ['First filled sample', 'Compare the standing footprint and top seal clearance. Test fill, reclosure and case fit on the sample before approving the drawing.'],
    ],
    links: [['/markets/coffee-tea/', 'Coffee and tea packaging'], ['/how-to-choose-the-right-barrier-film-for-coffee-packaging/', 'How to choose coffee barrier film'], [dielinePath('flat-bottom-pouch'), 'Prepare a flat-bottom pouch dieline']],
  },
  'flat-pouch': {
    heading: 'Custom Flat Pouches and Sachets',
    materials: 'Select film for the fill, storage and seal',
    options: 'Seal layout, opening and coding space',
    approval: 'Review a filled sachet before approving the drawing',
    checks: [
      ['Usable volume and seal width', 'Provide the target fill and product thickness. Check the usable cavity with the planned seal widths and the finished outer dimensions.'],
      ['Filling and opening', 'Confirm the fill opening, orientation on the line and the position of a tear notch or other opening feature.'],
      ['Filled-pack trial', 'Where the pack is frozen, assess seal integrity, handling and puncture on the filled pack after the relevant temperature cycles.'],
    ],
    links: [['/markets/frozen-food/', 'Frozen food packaging'], ['/choosing-packaging-for-frozen-chilled-foods/', 'Frozen and chilled packaging guide'], ['/solutions/technical/', 'Plan a filled flat-pouch trial']],
  },
  'pinch-bottom-pouches': {
    heading: 'Custom Pinch-Bottom Pouches',
    materials: 'Compare film structures for larger dry packs',
    options: 'Folded base, top closure and print panels',
    approval: 'Check the filled pack at its target weight',
    checks: [
      ['Fill and handling', 'Specify fill weight, product bulk density, pack size and how operators load and carry each pack.'],
      ['Base and top seal', 'Review the bottom folds and top closure together. Check the space required by the sealing equipment.'],
      ['Case and pallet fit', 'Place filled samples in the proposed case and evaluate the fold areas for wear during handling.'],
    ],
    links: [['/markets/coffee-tea/', 'Coffee and tea packaging'], ['/markets/pet-food/', 'Pet food packaging'], ['/solutions/technical/', 'Review filled-pack handling']],
  },
  polybag: {
    heading: 'Custom Poly Bags',
    materials: 'Choose film for visibility and handling',
    options: 'Size, closure, print and ventilation',
    approval: 'Check pack-out with the actual product',
    checks: [
      ['Load and fit', 'Provide product dimensions, weight and any sharp edges. Confirm the bag opening and allowance for insertion.'],
      ['Film and closure', 'Specify clarity, stiffness, closure and any ventilation needs. Confirm these requirements against the intended handling.'],
      ['Pack-out', 'Try insertion, closing, packing into the case and label placement using a representative sample.'],
    ],
    links: [['/markets/fashion/', 'Garment packaging'], ['/markets/accessories/', 'Retail accessories packaging'], ['/solutions/printing/', 'Review print and finish options']],
  },
  'quad-seal-bag': {
    heading: 'Custom Quad-Seal Bags',
    materials: 'Select material for fill weight and product protection',
    options: 'Side panels, corner seals and valve placement',
    approval: 'Validate the corners and filled footprint',
    checks: [
      ['Fill volume and side panels', 'Provide the target fill weight and product density. Check the gusset depth and finished front and side panel dimensions.'],
      ['Corner seals and closure', 'Confirm where the corner seals, top closure and any valve or print-safe areas fall on the drawing.'],
      ['Drop and case handling', 'Review the filled sample at its target weight. Confirm case fit and handling checks with the buyer’s quality team.'],
    ],
    links: [['/markets/pet-food/', 'Pet food packaging'], ['/markets/coffee-tea/', 'Coffee and tea packaging'], ['/solutions/technical/', 'Review bag geometry and handling']],
  },
  'retort-pouch': {
    heading: 'Custom Retort Pouches',
    materials: 'Match the pouch structure to the processing conditions',
    options: 'Portion size, pouch geometry and seal interface',
    approval: 'Coordinate filled-pack validation with your process team',
    checks: [
      ['Product and process inputs', 'Share the product, fill weight, pouch dimensions, filling method and processing conditions agreed with your process team.'],
      ['Seal and pouch construction', 'Review the seal area, seal contamination risks and proposed structure before requesting filled samples.'],
      ['Validation handoff', 'Agree who will run and approve the process-specific trial and what production documentation they will need.'],
    ],
    links: [['/markets/sauce-soup/', 'Sauce and soup packaging'], ['/solutions/retort/', 'Plan a retort pouch trial'], [qualityPath, 'Request quality documentation']],
  },
  'roll-stock-films': {
    heading: 'Custom Printed Rollstock Film',
    materials: 'Specify film for your filling and sealing line',
    options: 'Web width, repeat and unwind direction',
    approval: 'Run a short web trial on your line',
    checks: [
      ['Roll drawing', 'Share machine make or model, web width, core diameter, maximum roll diameter and unwind direction.'],
      ['Registration and sealing', 'Confirm repeat length, eye-mark position and print side with the artwork and machine teams. Share your current film and seal criteria where available.'],
      ['Line trial', 'Record web tracking, registration, seal results and the conditions used. For frozen applications, include post-freezer handling of the finished pack.'],
    ],
    links: [['/markets/frozen-food/', 'Frozen food packaging'], [dielinePath('roll-stock-films'), 'Generate a roll stock dieline'], ['/solutions/technical/', 'Review rollstock fit on your equipment']],
  },
  'shaped-pouch': {
    heading: 'Custom-Shaped Pouches',
    materials: 'Review film and seal performance around the contour',
    options: 'Custom outline, hanging features and print clearance',
    approval: 'Approve the filled shape and cut profile',
    checks: [
      ['Outline and capacity', 'Provide a reference outline, target fill and maximum pack dimensions. Review which parts of the shape hold product.'],
      ['Cut and seal layout', 'Mark the trim, seal, opening and hang-hole positions on the dieline before artwork approval.'],
      ['Handling and display', 'Check a filled prototype for how it hangs or stands, where it flexes and how the product is removed.'],
    ],
    links: [['/markets/snacks-sweets/', 'Snack and confectionery packaging'], [dielinePath('shaped-pouch'), 'Preview a shaped-pouch dieline'], ['/solutions/technical/', 'Confirm prototype checks']],
  },
  'spout-pouch': {
    heading: 'Custom Spout Pouches',
    materials: 'Match film and fitment to the product',
    options: 'Spout position, cap, opening and flow',
    approval: 'Check filling, sealing and dispensing together',
    checks: [
      ['Flow and fill', 'Share viscosity, particles, fill volume, filling conditions and how the product should dispense.'],
      ['Spout interface', 'Confirm spout bore, placement, cap and compatibility with the filling equipment before approving the sample.'],
      ['Filled sample', 'Review leaks, first opening and dispensing across the orientations and temperatures expected in use.'],
    ],
    links: [['/markets/sauce-soup/', 'Sauce and soup packaging'], ['/markets/home-care/', 'Home care refill packaging'], ['/solutions/technical/', 'Review the spout and filling line']],
  },
  'stand-up-pouch': {
    heading: 'Custom Stand-Up Pouches',
    materials: 'Compare film for protection, sealing and shelf life',
    options: 'Gusset, zipper, valve and finish options',
    approval: 'Check shelf stability and resealing with a filled pack',
    checks: [
      ['Fill and base geometry', 'Share the target fill weight, product bulk density and pack dimensions. Compare the base gusset and the top opening on a filled sample.'],
      ['Barrier and reseal', 'Define storage conditions and shelf-life goals. Review the film structure, zipper, tear notch and any valve together.'],
      ['Line and shelf trial', 'Check opening on the filling line, closure after repeated use, shelf stability and clearance in the shipping case.'],
    ],
    links: [['/markets/coffee-tea/', 'Coffee and tea packaging'], ['/flat-bottom-vs-stand-up-pouch-which-fits-your-brand/', 'Compare flat-bottom and stand-up pouches'], ['/solutions/technical/', 'Plan a stand-up pouch trial']],
  },
  'stand-up-pouch-tap': {
    heading: 'Custom Stand-Up Pouches with Tap',
    materials: 'Match film and tap to the liquid and fill',
    options: 'Tap position, clearance and filled capacity',
    approval: 'Verify fitment sealing and dispensing after handling',
    checks: [
      ['Liquid and intended use', 'Share fill volume, viscosity, particles, storage temperature and how the pack will be positioned during use.'],
      ['Tap fit and sealing', 'Confirm tap clearance, fitting position and the filling and sealing sequence on the chosen equipment.'],
      ['Dispensing after transport', 'After handling filled samples, check for leaks, the flow with the pack upright and how much liquid remains after use.'],
    ],
    links: [['/markets/beverage/', 'Beverage packaging'], ['/markets/home-care/', 'Home care packaging'], ['/solutions/technical/', 'Discuss tap and equipment compatibility']],
  },
};

export const guideCategories = {
  'packaging-guide': ['Packaging Selection Guides', 'Compare pouch formats and choose packaging for a specific product or filling process.'],
  materials: ['Packaging Materials Guides', 'Review barrier films, performance requirements and material options for flexible packs.'],
  sustainability: ['Sustainable Packaging Guides', 'Compare material options, recycling considerations and practical packaging trade-offs.'],
  'packaging-tips': ['Packaging Design Tips', 'Prepare the artwork, pack layout and finish before you approve a sample.'],
  'industry-news': ['Packaging Industry Insights', 'Read market and application insights for flexible packaging buyers.'],
  'case-studies': ['Packaging Project Planning', 'Explore project planning resources and illustrative examples for flexible packaging buyers.'],
};

const link = ([href, label], escape) => `<a href="${escape(href)}">${escape(label)} <span aria-hidden="true">↗</span></a>`;

const industryGroups = [
  ['Food & beverages', ['coffee-tea', 'snacks-sweets', 'beverage', 'sauce-soup', 'baby-food', 'powder-spices', 'fruits-veggies']],
  ['Cold chain & pet food', ['frozen-food', 'meat-poultry', 'sea-food', 'pet-food']],
  ['Personal care & retail', ['beauty-care', 'cosmetics', 'home-care', 'supplement', 'accessories', 'fashion']],
  ['Specialty markets', ['cannabis', 'cbd', 'cbd-thc', 'tobacco-filters']],
];

function renderIndustryDirectory(entries, escape) {
  const markets = new Map(entries
    .filter(({ path }) => /^\/markets\/[a-z0-9-]+\/$/.test(path))
    .map((entry) => [entry.path.split('/')[2], entry]));
  if (!markets.size) return '';
  const groups = industryGroups.map(([name, slugs]) => [name, slugs.flatMap((slug) => {
    const entry = markets.get(slug);
    markets.delete(slug);
    return entry ? [entry] : [];
  })]);
  groups.at(-1)[1].push(...markets.values());
  return `
    <nav class="mw-industry-directory" aria-labelledby="market-directory-title">
      <h3 id="market-directory-title">Browse all industries</h3>
      <div class="mw-industry-directory__grid">
        ${groups.filter(([, items]) => items.length).map(([name, items]) => `
          <div class="mw-industry-directory__group">
            <h4>${escape(name)}</h4>
            <ul>${items.map(({ path, row }) => `<li><a href="${escape(path)}">${escape(row.title)}</a></li>`).join('')}</ul>
          </div>`).join('')}
      </div>
    </nav>`;
}

export function applyProcurement(path, edit, replace, entry, entries, publishedPaths, baseline, escape) {
  const [, family, slug, nested] = path.split('/');
  const available = href => publishedPaths.has(href) || !Object.hasOwn(baseline, href);
  const sectionLinks = (items) => items.filter(([href]) => available(href)).map(item => link(item, escape)).join('');
  const addStyles = () => edit('head', (el) => el.append('<link rel="stylesheet" href="/assets/original/procurement.css?v=2">', { html: true }));
  const format = family === 'products' && !nested && entry?.table === 'product_categories' && Object.hasOwn(formats, slug) ? formats[slug] : null;
  if (format) {
    addStyles();
    if (entry.row.name === baseline[path]?.title) replace('main h1', format.heading);
    replace('main .mewepak-product-category > section[class*="py-20"][class*="py-28"] h2[class*="italic"]', format.materials);
    replace('main .mewepak-product-category > section[class*="py-16"][class*="py-24"][class~="bg-white"] h2[class*="mt-5"]', format.options);
    replace('main .mewepak-category-path h2', format.approval);
    const quote = '/inquiry/?format=' + encodeURIComponent(slug) + '#quote-request';
    edit('main .mewepak-product-category > section:first-of-type', (el) => el.after(`
      <section class="mw-buying" id="buying-specification" aria-labelledby="buying-specification-title">
        <h2 id="buying-specification-title">Prepare your packaging specification</h2>
        <dl class="mw-buying-grid">${format.checks.map(([term, description]) => `<div><dt>${escape(term)}</dt><dd>${escape(description)}</dd></div>`).join('')}</dl>
        <div class="mw-buying-actions">
          ${available('/inquiry/') ? link([quote, 'Quote this format'], escape) : ''}
          ${available('/contact/') ? link([samplePath, 'Ask about samples'], escape) : ''}
        </div>
        <nav class="mw-buying-links" aria-label="Related packaging resources">${sectionLinks(format.links)}</nav>
      </section>`, { html: true }));
  }
  if (path === '/about-us/') {
    edit('main .ab-document-links', (el) => {
      if (available('/about-us/global-reach/')) el.append('<div>' +
        link(['/about-us/global-reach/', 'Delivery and destination-market planning'], escape) + '</div>', { html: true });
    });
  }
  if (path === '/markets/') {
    const directory = renderIndustryDirectory(entries, escape);
    if (directory) {
      addStyles();
      edit('main #mk-market-grid', (el) => el.after(directory, { html: true }));
    }
  }
  if (family === 'category' && Object.hasOwn(guideCategories, slug)) {
    const [title, intro] = guideCategories[slug];
    addStyles();
    replace('main h1.wp-block-query-title', title);
    edit('main h1.wp-block-query-title', (el) => el.after(`
      <div class="mw-directory mw-directory--category"><p>${escape(intro)}</p>${link(['/blog/', 'View all packaging guides'], escape)}
        ${slug === 'case-studies' ? sectionLinks([['/added-value/pouch-patrol/', 'See how a packaging project moves to production']]) : ''}
      </div>`, { html: true }));
  }
}
