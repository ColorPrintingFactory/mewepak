export const productDetailTemplate = '/products/stand-up-pouch/premium-almonds-window-stand-up-pouch/';

const profiles = {
  'frozen-candied-grapes-atomic-sourberry-hanging-pouch': {
    name: 'Frozen Candied Grapes',
    heading: ['Frozen Candied Grapes', 'Atomic Sourberry Hanging Pouch'],
    application: 'Frozen-style candied grapes',
    benefit: ['From pegboard to checkout.', 'The hang hole gives this high-contrast design a place on retail hooks, racks and seasonal displays.'],
    features: [
      ['art', 'High-contrast berry artwork', 'Bright grape graphics and splash details stand out against the dark printed background.'],
      ['bag', 'Ready for hanging displays', 'The built-in hang hole supports pegboard, rack and checkout placement.'],
      ['tune', 'Protection matched to the product', 'Choose the film and seals around the candy coating, storage temperature and moisture sensitivity.'],
      ['print', 'Room for product information', 'Use the back panel for ingredients, nutrition information, storage instructions and a barcode.'],
    ],
    specifications: [
      ['Display', 'Hanging pouch with a built-in hang hole'],
      ['Artwork', 'Dark base with grape and sourberry graphics'],
      ['Print layout', 'Full-colour front and back'],
      ['Film and seal', 'Proposed around the product, filling line and storage conditions'],
    ],
    materialNote: 'Tell us whether your product ships frozen or at ambient temperature. Coating, moisture sensitivity and the cold chain affect which film and seals should be trialled.',
    materials: [
      'PET / PE for print clarity and standard confectionery packs',
      'BOPP / PE for lightweight candy and snack packs',
      'OPP / CPP for selected heat-sealed formats',
      'PET / VMPET / PE when higher light and moisture barriers are required',
      'White or clear laminated film with full-surface dark printing',
    ],
    applications: ['Frozen-style candied grapes', 'Sour candy', 'Berry-flavoured sweets', 'Candied fruit snacks', 'Limited-edition confectionery', 'Gummies and chewy sweets', 'Novelty retail snacks'],
    artworkNote: 'Proof the black coverage and bright berry colours together. Review small text, barcode contrast and the clearance around the hang hole.',
    question: ['Can this pouch be used for a frozen product?', 'Share the intended storage, transport and handling temperatures. The material, seals and finished pack should be trialled under your actual cold-chain conditions.'],
  },
  'cotton-candy-pastel-pink-hanging-pouch': {
    name: 'Cotton Candy',
    heading: ['Cotton Candy', 'Pastel Pink Hanging Pouch'],
    application: 'Cotton candy',
    sampleSize: '4 g',
    benefit: ['A light pack made for the hook.', 'The pastel artwork and hang hole suit party treats, seasonal promotions and checkout displays.'],
    features: [
      ['art', 'Pastel pink artwork', 'The illustrated front panel makes the product easy to recognise at a glance.'],
      ['bag', 'Made for pegboard displays', 'The built-in hang hole lets retailers display lightweight portions on hooks and racks.'],
      ['tune', 'Moisture and seal control', 'Choose the laminate and validate the heat seals around the expected humidity and shelf life.'],
      ['print', 'Front and back printing', 'Keep the front playful and leave room on the back for ingredients, storage instructions and a barcode.'],
    ],
    specifications: [
      ['Display', 'Lightweight hanging pouch with a built-in hang hole'],
      ['Artwork', 'Pastel pink with a cotton candy illustration'],
      ['Print layout', 'Full-colour front and back'],
      ['Sealing approach', 'Heat-sealed edges'],
      ['Displayed weight', '4 g as shown on the example artwork'],
    ],
    materialNote: 'Cotton candy is sensitive to humidity. Review moisture protection and seal quality against the actual fill, distribution conditions and shelf-life target.',
    materials: [
      'PET / PE for clean pastel printing and standard confectionery packs',
      'BOPP / PE for lightweight retail pouches',
      'OPP / CPP for selected heat-sealed formats',
      'Clear laminated film when product visibility is needed',
      'White laminated film for pastel colour control',
    ],
    applications: ['Cotton candy', 'Candy floss', 'Mini sweet packs', 'Party favours', 'Event giveaway treats', 'Novelty confectionery', 'Checkout sweets'],
    artworkNote: 'Proof the pastel pink on the chosen film. A white print base can help control the colour, while clear film can be evaluated for partial product visibility.',
    question: ['Can the pouch hold a different amount of cotton candy?', 'Yes. Share the weight and approximate volume of a portion. The 4 g artwork is a reference, and the finished size should be checked with a filled sample.'],
  },
};

const finishOptions = [
  ['Matte', 'Matte'], ['Gloss', 'Gloss'], ['Soft-touch matte', 'Soft-touch'],
  ['Spot gloss / Spot UV', 'Spot gloss'], ['Please advise', 'Please advise'],
];
const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const values = (field) => Array.isArray(field) ? field.filter((value) => typeof value === 'string' && value.trim()) : [];
function options(field, fallback) {
  const supplied = values(field);
  return supplied.length ? supplied : fallback || [];
}

export async function applyProductDetail({ entry, entries, previous, edit, replace, replaceHtml, safeUrl, escape, sanitize, digest }) {
  const { row, path } = entry;
  const curated = path === productDetailTemplate;
  const profile = Object.hasOwn(profiles, row.slug) ? profiles[row.slug] : null;
  const category = entries.find((item) => item.table === 'product_categories' && item.row.slug === row.category?.slug);
  const categoryName = category?.row.name || 'Packaging';
  const categoryPath = category?.path || '/products/';
  const format = row.category?.slug || '';
  const name = row.name;
  const applications = options(row.applications, profile?.applications);
  const materials = options(row.material_options, profile?.materials);
  const printing = values(row.printing_options);
  const features = values(row.features);
  const application = curated ? 'Premium almonds' : profile?.application || applications[0] || '';
  const inquiry = (context = {}) => '/inquiry/?' + new URLSearchParams({
    ...(format && { format }), product: name, ...context,
  }) + '#quote-request';
  const quote = (label, className = 'btn') => `<a class="${className}" data-quote href="${escape(inquiry())}">${label}</a>`;
  const text = (value) => escape(value || '');
  const description = row.description && (!curated || await digest(row.description) !== previous.description_hash)
    ? await sanitize(row.description) : '';
  const list = (items, className = '') => items.length
    ? `<ul class="${className}">${items.map((item) => `<li>${text(item)}</li>`).join('')}</ul>` : '';
  const rows = (items) => items.map(([key, value]) => `<tr><th scope="row">${text(key)}</th><td>${text(value)}</td></tr>`).join('');
  const sectionHeading = (kicker, heading, copy = '') => `<div class="section-heading"><div><span class="eyebrow">${kicker}</span><h2>${heading}</h2></div>${copy ? `<p>${text(copy)}</p>` : ''}</div>`;
  const related = entries.filter((item) => item.table === 'products' && item.path !== path)
    .sort((a, b) => Number(b.row.category?.slug === format) - Number(a.row.category?.slug === format)).slice(0, 3);
  const relatedMarkup = related.length ? `<section class="container catalog-related" aria-labelledby="catalog-related-title">
    <h2 id="catalog-related-title">Related products</h2><div class="related-grid">${related.map((item) => {
      const src = safeUrl(item.row.primary_image_url);
      return `<article class="related-card"><a class="related-graphic" href="${text(item.path)}" aria-label="${text(item.row.name)}">${src
        ? `<img src="${text(src)}" alt="" width="300" height="180" loading="lazy" decoding="async">`
        : icon('bag')}</a><div class="related-body"><h3>${text(item.row.name)}</h3><a class="text-button" href="${text(item.path)}">View product <span aria-hidden="true">↗</span></a></div></article>`;
    }).join('')}</div></section>` : '';

  edit('.mw-almond-pouch', (el) => {
    el.setAttribute('data-product-name', name);
    el.setAttribute('data-product-type', categoryName);
    el.setAttribute('data-product-application', application);
  });

  const updatedGallery = row.primary_image_url !== previous.primary_image_url ||
    JSON.stringify(row.gallery_urls || []) !== JSON.stringify(previous.gallery_urls || []);
  const images = [...new Set([row.primary_image_url, ...values(row.gallery_urls)].map(safeUrl).filter(Boolean))];
  if (!curated || updatedGallery) {
    const hero = images[0] ? `<img id="productimage" fetchpriority="high" src="${text(images[0])}" alt="${text(name)} artwork">
      <span class="artwork-chip" id="artwork-label">Packaging artwork</span>
      <span id="product-lens" class="product-lens" aria-hidden="true" hidden></span>
      <button class="gallery-view" id="zoom" type="button" aria-label="Magnify product image" aria-pressed="false">${icon('zoom')}</button>`
      : `<div class="product-image-placeholder">${icon('bag')}</div>`;
    replaceHtml('.main-photo', hero);
    edit('.main-photo', (el) => el.setAttribute('data-catalog-photo', ''));
    replaceHtml('.thumbs', images.length > 1 ? images.map((src, index) => `<button class="thumb" type="button" data-image data-image-src="${text(src)}" data-image-alt="${text(name)} artwork, view ${index + 1}" data-image-label="Packaging artwork · View ${index + 1}" aria-pressed="${index === 0}" aria-label="View product image ${index + 1}"><img src="${text(src)}" alt="" width="84" height="84" decoding="async"></button>`).join('') : '');
    if (images.length <= 1) edit('.thumbs', (el) => el.remove());
  }
  if (curated) {
    if (row.short_description !== previous.short_description) replace('.product-info .lead', row.short_description);
    if (name !== previous.title) {
      replace('.breadcrumb [aria-current]', name);
      replace('.product-info h1', name);
    }
    if (description) replaceHtml('#overview .description-copy', description);
    if (relatedMarkup) edit('#related', (el) => el.append(relatedMarkup, { html: true }));
    return;
  }

  replaceHtml('.breadcrumb', `<a href="/">Home</a><span aria-hidden="true">/</span><a href="/products/">Packaging</a><span aria-hidden="true">/</span><a href="${text(categoryPath)}">${text(categoryName)}</a><span class="current-crumb" aria-hidden="true">/</span><span class="current-crumb" aria-current="page">${text(name)}</span>`);
  replaceHtml('.product-info h1', profile && previous.title === name ? profile.heading.map(text).join('<br>') : text(name));
  replace('.product-info .category .eyebrow', profile ? 'Custom printed hanging pouches' : 'Custom printed packaging');
  replace('.product-info .lead', row.short_description || '');
  const featureCards = profile?.features || features.slice(0, 4).map((value, i) => [['art', 'bag', 'tune', 'print'][i], value, '']);
  const quick = featureCards.map(([, title]) => title);
  replaceHtml('.quick-features', quick.map((title) => `<li><span class="tick" aria-hidden="true">✓</span>${text(title)}</li>`).join(''));
  replaceHtml('.gallery-benefit', `${icon('bag')}<div><strong>${text(profile?.benefit[0] || 'Packaging built around your product.')}</strong><p>${text(profile?.benefit[1] || 'Confirm the artwork, dimensions and pack structure with your project team.')}</p></div>`);
  replaceHtml('.selection-box', `<div class="selection-block">
    <div class="option-row"><span class="option-label">Size to discuss</span>${profile?.sampleSize ? `<small>${text(profile.sampleSize)} shown in artwork</small>` : ''}</div>
    <div class="pills" role="group" aria-label="Preferred pouch size">
      ${profile?.sampleSize ? `<button type="button" class="pill" data-size="${text(profile.sampleSize)}" aria-pressed="true">${text(profile.sampleSize)}</button>` : ''}
      <button type="button" class="pill" data-size="${profile?.sampleSize ? 'Custom size' : ''}" aria-pressed="${!profile?.sampleSize}">${profile?.sampleSize ? 'Custom size' : 'Size to discuss'}</button>
    </div></div><div class="selection-block">
    <div class="option-row"><span class="option-label">Preferred finish</span><small>For your quote brief</small></div>
    <div class="pills finish-pills" role="group" aria-label="Preferred surface finish">${finishOptions.map(([value, label]) => `<button type="button" class="pill" data-finish="${value}" aria-pressed="${value === 'Please advise'}">${label}</button>`).join('')}</div></div>`);
  edit('[data-quote]:not([data-recommend-enquiry])', (el) => el.setAttribute('href', inquiry()));
  edit('#form-application', (el) => el.setAttribute('value', application));
  edit('#form-size', (el) => el.setAttribute('value', profile?.sampleSize || ''));
  replaceHtml('.trust-strip .trust-grid', [
    ['art', 'Artwork with room for the details', 'Plan branding, required copy and the barcode.'],
    ['tune', 'A structure for your application', 'Review materials, seals and finish together.'],
    ['bag', 'Designed around your retail display', profile ? 'Discuss the hang hole and how the pouch will be displayed.' : 'Confirm the filled dimensions and how customers will use the pack.'],
  ].map(([i, heading, copy]) => `<article>${icon(i)}<div><strong>${heading}</strong><p>${copy}</p></div></article>`).join(''));
  const overview = description || `<p>${text(row.short_description)}</p>`;
  replaceHtml('#overview .intro-grid', `<div><span class="eyebrow">Designed around your product</span><h2>Packaging that fits your product.</h2><p>${text(profile?.benefit[1] || row.short_description)}</p></div><div class="description-copy">${overview}</div>`);
  replaceHtml('#features .container', sectionHeading('Packaging features', 'Small details. Stronger shelf presence.') +
    (featureCards.length ? `<div class="features">${featureCards.map(([i, title, copy]) => `<article class="almond-feature-card">${icon(i)}<h3>${text(title)}</h3>${copy ? `<p>${text(copy)}</p>` : ''}</article>`).join('')}</div>` : '<p>Confirm the pack structure and handling requirements as part of your quote.</p>') +
    (profile ? '' : list(features.slice(4), 'custom-list')));
  const specifications = [['Packaging format', categoryName], ...(profile?.specifications || [])];
  if (applications.length) specifications.push(['Main applications', applications.slice(0, 4).join(', ')]);
  replaceHtml('#specifications', sectionHeading('Production & technical details', 'Know the format.', profile?.materialNote) +
    `<div class="details-grid"><div><table class="spec-table"><caption class="sr">${text(name)} specifications</caption><tbody>${rows(specifications)}</tbody></table>
    <p class="spec-note">Final dimensions, laminate and production specifications are confirmed for your project.</p></div>
    <aside class="brief-card"><span class="eyebrow">Make your brief count</span><h3>A better pack starts with the right details.</h3><p>Share the product and how it will be filled, stored and delivered.</p>${list(['Product and target fill weight', 'Quantity and delivery region', 'Artwork, closure and finish preferences'], 'custom-list')}${quote('Prepare Your Quote Brief')}</aside></div>`);
  replaceHtml('.expert-card ul', '<li>Materials and protection</li><li>Pack size and fill weight</li><li>Artwork and finishing details</li>');
  replaceHtml('#materials .container', sectionHeading('Materials & finishing', 'The look you want. The structure you need.', profile?.materialNote) +
    `<div class="config-grid"><article class="config-panel"><h3>Material options to review</h3>${materials.length ? list(materials, 'custom-list') : '<p>Tell us how the product is filled, stored and shipped so we can discuss a suitable film.</p>'}<a class="text-button" href="/solutions/material-specifications/">Compare material specifications <span aria-hidden="true">↗</span></a></article>
    <article class="config-panel"><h3>A finish that feels right</h3><p>${text(profile?.artworkNote || 'Compare finishes on your artwork and review colour and small-text legibility.')}</p>${printing.length ? list(printing, 'custom-list') : `<div class="finish-grid">${finishOptions.slice(0, 4).map(([, label]) => `<div class="finish-card"><span class="finish-dot"></span>${label}</div>`).join('')}</div>`}</article></div>`);
  replaceHtml('#customization .custom-section', `<article class="config-panel"><span class="eyebrow">Custom artwork</span><h2>A familiar format. Your own identity.</h2><p>${text(profile?.artworkNote || 'Bring your brand colours, artwork and key information to the packaging brief.')}</p>${quote('Discuss Your Custom Pouch', 'btn btn-teal')}</article><article class="config-panel"><span class="eyebrow">Before production</span><h3>Confirm the artwork and fit.</h3>${list(['Share target dimensions and fill weight', 'Check artwork placement and clearances', 'Review a proof or filled sample'], 'custom-list')}<a class="text-button" href="/solutions/prepress/">Explore prepress <span aria-hidden="true">↗</span></a></article>`);
  replaceHtml('#applications .container', `<span class="eyebrow">Suitable applications</span><h2>One format. Room for your range.</h2>${applications.length ? `<div class="applications">${applications.map((value) => `<span>${text(value)}</span>`).join('')}</div>` : '<p>Share your application so we can discuss the material and configuration.</p>'}`);
  replace('.product-resources .resource-card:first-child p', 'Review laminate options and discuss the protection your product needs.');
  replace('.product-resources .resource-card:nth-child(2) p', 'Review the pouch features, display method and details you want in your pack.');
  replace('.product-resources .resource-cta h3', 'Ready to shape your packaging?');
  const questions = [
    profile?.question || ['Can I change the size and artwork?', 'Yes. Share your target fill weight, dimensions and artwork so we can review a suitable configuration.'],
    ['Which material should I choose?', profile?.materialNote || 'Share your product, filling process and storage conditions so we can discuss a suitable film and seal.'],
    ['What should I include in a quote request?', 'Tell us what you are packing, the quantity, the delivery region and any size, finish or artwork preferences.'],
  ];
  replaceHtml('.faq-list', questions.map(([q, a]) => `<details><summary>${text(q)}</summary><p>${text(a)}</p></details>`).join(''));
  if (relatedMarkup) replaceHtml('#related', relatedMarkup);
  else edit('#related', (el) => el.remove());
  replace('.final-cta h2', 'Give your packaging a better first impression.');
  replace('.final-cta p', 'Share your product brief and explore a custom pack for your brand.');
  replaceHtml('.mobile-cta strong', `${text(profile?.name || name)}<span>${text(categoryName)} · Custom printed</span>`);
}
