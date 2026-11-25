export const productDetailTemplate = '/products/stand-up-pouch/premium-almonds-window-stand-up-pouch/';

const profiles = {
  'frozen-candied-grapes-atomic-sourberry-hanging-pouch': {
    name: 'Frozen Candied Grapes',
    eyebrow: 'Custom printed hanging pouches',
    heading: ['Frozen Candied Grapes', 'Atomic Sourberry Hanging Pouch'],
    benefit: ['From pegboard to checkout.', 'The hang hole gives this high-contrast design a place on retail hooks, racks and seasonal displays.'],
    specifications: [
      ['Display', 'Hanging pouch with a built-in hang hole'],
      ['Artwork', 'Dark base with grape and sourberry graphics'],
      ['Print layout', 'Full-colour front and back'],
      ['Film and seal', 'Proposed around the product, filling line and storage conditions'],
    ],
    materialNote: 'Tell us whether your product ships frozen or at ambient temperature. Coating, moisture sensitivity and the cold chain affect which film and seals should be trialled.',
    artworkNote: 'Proof the black coverage and bright berry colours together. Review small text, barcode contrast and the clearance around the hang hole.',
    question: ['Can this pouch be used for a frozen product?', 'Share the intended storage, transport and handling temperatures. The material, seals and finished pack should be trialled under your actual cold-chain conditions.'],
  },
  'cotton-candy-pastel-pink-hanging-pouch': {
    name: 'Cotton Candy',
    eyebrow: 'Custom printed hanging pouches',
    heading: ['Cotton Candy', 'Pastel Pink Hanging Pouch'],
    sampleSize: '4 g',
    benefit: ['A light pack made for the hook.', 'The pastel artwork and hang hole suit party treats, seasonal promotions and checkout displays.'],
    specifications: [
      ['Display', 'Lightweight hanging pouch with a built-in hang hole'],
      ['Artwork', 'Pastel pink with a cotton candy illustration'],
      ['Print layout', 'Full-colour front and back'],
      ['Sealing approach', 'Heat-sealed edges'],
      ['Displayed weight', '4 g as shown on the example artwork'],
    ],
    materialNote: 'Cotton candy is sensitive to humidity. Review moisture protection and seal quality against the actual fill, distribution conditions and shelf-life target.',
    artworkNote: 'Proof the pastel pink on the chosen film. A white print base can help control the colour, while clear film can be evaluated for partial product visibility.',
    question: ['Can the pouch hold a different amount of cotton candy?', 'Yes. Share the weight and approximate volume of a portion. The 4 g artwork is a reference, and the finished size should be checked with a filled sample.'],
  },
  'premium-almonds-window-stand-up-pouch': {
    name: 'Premium Almonds',
    eyebrow: 'Custom printed nut packaging',
    sampleSize: '100 g',
    benefit: ['See the product. Keep the pack premium.', 'The transparent window, zipper and bottom gusset make this format practical for premium nuts and multi-serving snack ranges.'],
    materialNote: 'Oil content, oxidation sensitivity, expected shelf life, distribution temperature and the visible window all inform the final laminate.',
    artworkNote: 'Keep the warm cream field, deep maroon branding, almond photography and small back-panel text consistent on the selected material.',
    question: ['Can I change the window, size and zipper?', 'Yes. Share the target fill weight, preferred window shape and reclosure needs so the pouch can be reviewed around the real product and shelf-life target.'],
  },
};

const finishStyles = new Map([
  ['Matte', ['Matte', 'Matte finish', '']],
  ['Gloss', ['Gloss', 'Gloss finish', 'gloss']],
  ['Soft-touch matte', ['Soft-touch', 'Soft-touch matte', 'soft']],
  ['Spot gloss / Spot UV', ['Spot gloss', 'Spot gloss / Spot UV', 'spot']],
]);
const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const values = (field) => Array.isArray(field) ? field.filter((value) => typeof value === 'string' && value.trim()) : [];

function splitDetail(value) {
  const divider = value.indexOf(' — ');
  return divider < 0 ? [value, ''] : [value.slice(0, divider), value.slice(divider + 3)];
}

function isLikelyMaterialStructure(value) {
  return /\b(?:PET|PE|BOPA|PA|BOPP|OPP|CPP|RCPP|VMPET|MET[- ]?PET|AL|EVOH|LLDPE|HDPE|LDPE|PP|NY(?:LON)?|METALLOCENE|ALUMINIUM|ALUMINUM|FOIL|LAMINATE|LAMINATED|MONO[- ]?MATERIAL|PE[- ]?BASED|PE[- ]?RICH|PAPER|METALLI[ZS]ED)\b/i.test(value);
}

function capitalizeNote(value) {
  const clean = String(value || '').trim();
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : '';
}

function splitMaterialDetail(value) {
  const clean = String(value || '').trim().replace(/\s+/g, ' ');
  const [dashTitle, dashNote] = splitDetail(clean);
  if (dashNote) return [dashTitle.trim(), capitalizeNote(dashNote)];

  const parenthetical = clean.match(/^(.+?)\s+\(([^()]+)\)$/);
  if (parenthetical && parenthetical[1].length <= 90 && isLikelyMaterialStructure(parenthetical[1])) {
    return [parenthetical[1].trim(), capitalizeNote(parenthetical[2])];
  }

  const qualified = clean.match(/^(.{2,90}?)\s+(for|where|when|if|subject to|only where|designed with|designed for|with)\s+(.+)$/i);
  if (qualified && isLikelyMaterialStructure(qualified[1])) {
    const [, structure, connector, remainder] = qualified;
    if (/^with$/i.test(connector) && clean.length <= 58) return [clean, ''];
    const prefix = /^(when|if|subject to|only where|designed with|designed for|with)$/i.test(connector)
      ? connector + ' '
      : '';
    let structureTitle = structure.trim();
    let noteText = prefix + remainder;
    const comparable = structureTitle.match(/^(.{2,52}?)\s+or comparable\s+(.+)$/i);
    if (comparable && isLikelyMaterialStructure(comparable[1])) {
      structureTitle = comparable[1].trim();
      noteText = `Or comparable ${comparable[2]}. ${capitalizeNote(noteText)}`;
    }
    return [structureTitle, capitalizeNote(noteText)];
  }

  return [clean, ''];
}

const featureLabelAliases = new Map([
  ['storage cue', 'Storage condition'],
  ['declared quantity', 'Declared quantity'],
  ['declared net weight', 'Declared net weight'],
  ['declared net content', 'Declared net content'],
  ['declared weight shown', 'Declared weight'],
  ['declared quantity shown', 'Declared quantity'],
  ['declared capacity', 'Declared capacity'],
  ['declared volume', 'Declared volume'],
  ['net quantity', 'Net quantity'],
  ['nominal content', 'Nominal content'],
  ['nominal fill', 'Nominal fill'],
  ['pack count', 'Pack count'],
  ['declared count', 'Declared count'],
  ['format', 'Format'],
  ['bag format', 'Bag format'],
  ['bag style', 'Bag style'],
  ['pouch style', 'Pouch style'],
  ['pack style', 'Pack style'],
  ['packaging style', 'Packaging style'],
  ['container style', 'Container style'],
  ['pack type', 'Pack type'],
  ['package family', 'Package family'],
  ['closure', 'Closure'],
  ['closure type', 'Closure'],
  ['closure system', 'Closure'],
  ['opening method', 'Opening method'],
  ['access', 'Opening / closure'],
  ['product visibility', 'Product visibility'],
  ['dispensing feature', 'Dispensing feature'],
  ['base style', 'Base style'],
  ['product category', 'Product category'],
  ['product identity', 'Product identity'],
  ['product identity shown', 'Product identity'],
  ['front product identity', 'Product identity'],
  ['age communication', 'Age communication'],
  ['variant shown', 'Variant shown'],
  ['dieline marks found in source pdf', 'Dieline markers'],
  ['capacity shown on artwork', 'Displayed capacity'],
  ['capacity references shown on artwork', 'Displayed capacity'],
]);

function normalizedFeatureLabel(label) {
  const clean = String(label || '').trim().replace(/\s+/g, ' ');
  return featureLabelAliases.get(clean.toLowerCase()) || clean;
}

function generatedFeatureHeading(value) {
  const text = String(value || '').trim();
  const rules = [
    [/low-temperature|cold-chain|freezer/i, 'Low-temperature performance'],
    [/puncture resistance/i, 'Puncture resistance'],
    [/seal retention|seal integrity|seal strength/i, 'Seal integrity'],
    [/moisture-vapour|moisture protection|freezer burn|dehydration/i, 'Moisture protection'],
    [/oxygen|aroma barrier/i, 'Barrier performance'],
    [/print and lamination adhesion|lamination adhesion/i, 'Print & lamination durability'],
    [/scuff resistance|abrasion resistance/i, 'Scuff resistance'],
    [/material gauge|material.*validated|validation/i, 'Material validation'],
    [/multi-layer laminated flexible packaging film/i, 'Film construction'],
    [/rotogravure|flexographic printing/i, 'Printing process'],
    [/digital printing/i, 'Digital print option'],
    [/cmyk|pantone|up to \d+ colors|up to \d+ colours/i, 'Colour capability'],
    [/matte|matt|gloss|soft[- ]?touch|spot uv|spot gloss/i, 'Finish options'],
    [/solvent-based|solvent-free lamination/i, 'Lamination options'],
    [/hang hole|pegboard|hanging display/i, 'Retail display'],
    [/\b(?:no|without)\b[^.]{0,40}\b(?:reclosure|resealable|zipper)\b|\bno reclosure shown\b/i, 'Closure format'],
    [/resealable|reclosure|zipper/i, 'Reclosure'],
    [/spout|dispensing fitment|screw cap/i, 'Dispensing & closure'],
    [/transparent window|clear window|product window/i, 'Product visibility'],
    [/heat seal|heat-sealed|sealed top|sealed bottom/i, 'Seal format'],
    [/barcode|variable-code|lot and date/i, 'Barcode & coding'],
    [/white ink/i, 'White ink coverage'],
    [/front[- ]and[- ]back|front.*back|back.*front/i, 'Front & back artwork'],
    [/reverse-panel.*template copy|template copy.*replacement|template copy.*correction|requires .*correction/i, 'Artwork correction'],
    [/cannabinoid|dose statements?/i, 'Regulatory statements'],
    [/quick-preparation statement/i, 'Front-panel statement'],
    [/pet-care iconography/i, 'Front-panel iconography'],
    [/reverse ingredient line/i, 'Ingredient statement'],
    [/reverse references/i, 'Reverse-panel details'],
    [/striped retail design|red, blue and cream/i, 'Artwork colour & layout'],
    [/moisture and aroma protection/i, 'Moisture & aroma protection'],
    [/product imagery|fruit imagery|food imagery|ingredient imagery|photography|\bimagery\b/i, 'Product imagery'],
    [/product identity|positioning|variant shown/i, 'Product identity'],
    [/spanish-language|arabic|multilingual|language/i, 'Localized artwork'],
    [/distribution requirements|commercial distribution/i, 'Distribution readiness'],
    [/powder-safe|frozen handling|rough handling|handling performance/i, 'Handling performance'],
    [/claims|nutrition|dietary|organic|gluten|vegan|non-gmo/i, 'On-pack claims'],
    [/artwork|graphics/i, 'Artwork details'],
  ];
  for (const [pattern, heading] of rules) if (pattern.test(text)) return heading;
  if (text.length <= 34) return text;
  const clause = text.split(/\s+(?:for|to|with|against|where|while|when|that)\s+/i)[0].trim();
  if (clause.length >= 12 && clause.length <= 42 && clause.length <= text.length - 8) return clause;
  const words = text.split(/\s+/);
  const short = words.slice(0, 4).join(' ').replace(/[,:;.]$/, '');
  return short + (words.length > 4 ? '…' : '');
}

function splitFeatureDetail(value) {
  const clean = String(value || '').trim().replace(/\s+/g, ' ');
  const dash = clean.indexOf(' — ');
  if (dash > 0) return [normalizedFeatureLabel(clean.slice(0, dash)), clean.slice(dash + 3).trim()];

  const colon = clean.indexOf(':');
  if (colon > 0 && colon <= 60) {
    const label = clean.slice(0, colon).trim();
    const copy = clean.slice(colon + 1).trim();
    if (label && copy) return [normalizedFeatureLabel(label), copy];
  }

  const heading = generatedFeatureHeading(clean);
  return heading === clean && clean.length <= 34 ? [heading, ''] : [heading, clean];
}

function featureIcon(title, copy = '') {
  const text = (title + ' ' + copy).toLowerCase();
  if (/window|visibility/.test(text)) return 'window';
  if (/closure|reclosure|zipper|opening/.test(text)) return 'zip';
  if (/print|artwork|colour|color|finish|ink|barcode/.test(text)) return 'print';
  if (/format|style|gusset|pouch|bag|seal/.test(text)) return 'bag';
  return 'tune';
}

function isFinishGuidance(value) {
  const normalized = String(value || '').toLowerCase();
  if (/\b(?:matte|matt|gloss|soft[- ]?touch|spot[- ]?gloss|spot uv|selective gloss|satin|pearlescent)\b/.test(normalized)) return true;
  if (/\bmetallic\b/.test(normalized) && !/\bprinting\b/.test(normalized)) return true;
  return /\b(?:cold-foil|foil accent)\b/.test(normalized);
}

export async function applyProductDetail({ entry, entries, previous, edit, replace, replaceHtml, safeUrl, escape, sanitize, digest }) {
  const { row, path } = entry;
  const profile = Object.hasOwn(profiles, row.slug) ? profiles[row.slug] : null;
  const category = entries.find((item) => item.table === 'product_categories' && item.row.slug === row.category?.slug);
  const categoryName = category?.row.name || 'Packaging';
  const categoryPath = category?.path || '/products/';
  const format = row.category?.slug || '';
  const name = row.name;
  const applications = values(row.applications);
  const materials = values(row.material_options);
  const rawPrinting = [...new Set(values(row.printing_options).map((value) => value.trim()))].filter((value) => value !== 'Please advise');
  const explicitFinishes = [...new Set(values(row.finishing_options).map((value) => value.trim()))].filter((value) => value !== 'Please advise');
  const finishGuidance = [...new Set([...explicitFinishes, ...rawPrinting.filter(isFinishGuidance)])];
  const printing = rawPrinting.filter((value) => !isFinishGuidance(value));
  const technicalSpecs = Array.isArray(row.technical_specs)
    ? row.technical_specs.map((item) => {
      if (!item || typeof item !== 'object') return null;
      const label = typeof item.label === 'string' ? item.label.trim() : '';
      const value = typeof item.value === 'string' ? item.value.trim() : '';
      return label && value ? [label, value] : null;
    }).filter(Boolean)
    : [];
  const finishes = [...explicitFinishes, 'Please advise'];
  const defaultFinish = explicitFinishes[0] || 'Please advise';
  const featureCards = values(row.features).map((value) => {
    const [title, copy] = splitFeatureDetail(value);
    return [featureIcon(title, copy), title, copy];
  });
  const featureKeys = new Set(featureCards.map(([, title, copy]) => `${title.toLowerCase()}|${copy.toLowerCase()}`));
  const addFeatureFallback = (iconName, title, copy) => {
    if (featureCards.length >= 4 || !copy) return;
    const cleanTitle = String(title || '').trim();
    const cleanCopy = String(copy || '').trim();
    if (!cleanTitle || !cleanCopy) return;
    const key = `${cleanTitle.toLowerCase()}|${cleanCopy.toLowerCase()}`;
    if (featureKeys.has(key)) return;
    featureKeys.add(key);
    featureCards.push([iconName || featureIcon(cleanTitle, cleanCopy), cleanTitle, cleanCopy]);
  };
  if (featureCards.length < 4) {
    for (const [label, value] of technicalSpecs) {
      if (/^(?:packaging format|main applications)$/i.test(label)) continue;
      addFeatureFallback(featureIcon(label, value), normalizedFeatureLabel(label), value);
      if (featureCards.length >= 4) break;
    }
  }
  if (featureCards.length < 4 && materials.length) {
    const [structure, note] = splitMaterialDetail(materials[0]);
    addFeatureFallback('tune', 'Material direction', note ? `${structure} — ${note}` : structure);
  }
  if (featureCards.length < 4 && printing.length) {
    addFeatureFallback('print', 'Printing direction', printing[0]);
  }
  if (featureCards.length < 4 && finishGuidance.length) {
    addFeatureFallback('art', 'Surface finish', finishGuidance[0]);
  }
  if (featureCards.length < 4 && applications.length) {
    addFeatureFallback('bag', 'Application fit', applications[0]);
  }
  const application = applications[0] || '';
  const inquiry = (context = {}) => '/inquiry/?' + new URLSearchParams({
    ...(format && { format }), product: name, ...context,
  }) + '#quote-request';
  const quote = (label, className = 'btn') => `<a class="${className}" data-quote href="${escape(inquiry())}">${label}</a>`;
  const text = (value) => escape(value || '');
  const pills = (options) => options.map((value) => `<button type="button" class="pill" data-finish="${text(value)}" aria-pressed="${value === defaultFinish}">${text(finishStyles.get(value)?.[0] || value)}</button>`).join('');
  const finishGrid = finishGuidance.map((value) => {
    const [, label, dot] = finishStyles.get(value) || [value, value, ''];
    return `<div class="finish-card"><span class="finish-dot${dot ? ' ' + dot : ''}"></span>${text(label)}</div>`;
  }).join('');
  const quickFeatures = featureCards.slice(0, 4).map(([, title]) =>
    `<li><span class="tick" aria-hidden="true">✓</span>${text(title)}</li>`).join('');
  const featureMarkup = featureCards.slice(0, 4).map(([name, title, copy]) =>
    `<article class="almond-feature-card">${icon(name)}<h3>${text(title)}</h3>${copy ? `<p>${text(copy)}</p>` : ''}</article>`).join('');
  const additionalFeatures = featureCards.slice(4);
  const additionalFeatureMarkup = additionalFeatures.length
    ? `<details style="margin-top:24px"><summary style="cursor:pointer;font-weight:600">More product details (${additionalFeatures.length})</summary><ul class="custom-list" style="margin-top:16px">${additionalFeatures.map(([, title, copy]) => `<li><strong>${text(title)}</strong>${copy ? ` — ${text(copy)}` : ''}</li>`).join('')}</ul></details>`
    : '';
  const visibleApplications = applications.slice(0, 10);
  const additionalApplications = applications.slice(10);
  const applicationTags = visibleApplications.map((value) => `<span>${text(value)}</span>`).join('');
  const additionalApplicationMarkup = additionalApplications.length
    ? `<details style="margin-top:20px"><summary style="cursor:pointer;font-weight:600">More applications (${additionalApplications.length})</summary><div class="applications" style="margin-top:14px">${additionalApplications.map((value) => `<span>${text(value)}</span>`).join('')}</div></details>`
    : '';
  replaceHtml('.quick-features', quickFeatures);
  replaceHtml('#form-finish', finishes.map((value) =>
    `<option value="${text(value)}"${value === defaultFinish ? ' selected' : ''}>${text(value)}</option>`).join(''));
  edit('#form-application', (el) => el.setAttribute('value', application));
  edit('[data-quote]:not([data-recommend-enquiry])', (el) => {
    const size = profile?.sampleSize;
    el.setAttribute('href', inquiry({ ...(size && { size }), finish: defaultFinish }));
  });
  const description = row.description ? await sanitize(row.description) : '';
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
  if (true) {
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
  replaceHtml('.breadcrumb', `<a href="/">Home</a><span aria-hidden="true">/</span><a href="/products/">Packaging</a><span aria-hidden="true">/</span><a href="${text(categoryPath)}">${text(categoryName)}</a><span class="current-crumb" aria-hidden="true">/</span><span class="current-crumb" aria-current="page">${text(name)}</span>`);
  replaceHtml('.product-info h1', profile?.heading && previous.title === name ? profile.heading.map(text).join('<br>') : text(name));
  replace('.product-info .category .eyebrow', profile?.eyebrow || 'Custom printed packaging');
  replace('.product-info .lead', row.short_description || '');
  replaceHtml('.gallery-benefit', `${icon('bag')}<div><strong>${text(profile?.benefit[0] || 'Packaging built around your product.')}</strong><p>${text(profile?.benefit[1] || 'Confirm the artwork, dimensions and pack structure with your project team.')}</p></div>`);
  replaceHtml('.selection-box', `<div class="selection-block">
    <div class="option-row"><span class="option-label">Size to discuss</span>${profile?.sampleSize ? `<small>${text(profile.sampleSize)} shown in artwork</small>` : ''}</div>
    <div class="pills" role="group" aria-label="Preferred pouch size">
      ${profile?.sampleSize ? `<button type="button" class="pill" data-size="${text(profile.sampleSize)}" aria-pressed="true">${text(profile.sampleSize)}</button>` : ''}
      <button type="button" class="pill" data-size="${profile?.sampleSize ? 'Custom size' : ''}" aria-pressed="${!profile?.sampleSize}">${profile?.sampleSize ? 'Custom size' : 'Size to discuss'}</button>
    </div></div><div class="selection-block">
    <div class="option-row"><span class="option-label">Preferred finish</span><small>For your quote brief</small></div>
    <div class="pills finish-pills" role="group" aria-label="Preferred surface finish">${pills(finishes)}</div></div>`);
  edit('#form-size', (el) => el.setAttribute('value', profile?.sampleSize || ''));
  replaceHtml('.trust-strip .trust-grid', [
    ['art', 'Artwork with room for the details', 'Plan branding, required copy and the barcode.'],
    ['tune', 'A structure for your application', 'Review materials, seals and finish together.'],
    ['bag', 'Designed around your retail display', profile?.eyebrow === 'Custom printed hanging pouches' ? 'Discuss the hang hole and how the pouch will be displayed.' : 'Confirm the filled dimensions and how customers will use the pack.'],
  ].map(([i, heading, copy]) => `<article>${icon(i)}<div><strong>${heading}</strong><p>${copy}</p></div></article>`).join(''));
  const overview = description || `<p>${text(row.short_description)}</p>`;
  replaceHtml('#overview .intro-grid', `<div><span class="eyebrow">Designed around your product</span><h2>Packaging that fits your product.</h2><p>${text(profile?.benefit[1] || row.short_description)}</p></div><div class="description-copy">${overview}</div>`);
  replaceHtml('#features .container', sectionHeading('Packaging features', 'Small details. Stronger shelf presence.') +
    (featureMarkup ? `<div class="features">${featureMarkup}</div>${additionalFeatureMarkup}` : '<p>Confirm the pack structure and handling requirements as part of your quote.</p>'));
  const specifications = [['Packaging format', categoryName], ...technicalSpecs, ...(profile?.specifications || [])];
  if (applications.length) specifications.push(['Main applications', applications.slice(0, 4).join(', ')]);
  replaceHtml('#specifications', sectionHeading('Production & technical details', 'Know the format.', profile?.materialNote) +
    `<div class="details-grid"><div><table class="spec-table"><caption class="sr">${text(name)} specifications</caption><tbody>${rows(specifications)}</tbody></table>
    <p class="spec-note">Final dimensions, laminate and production specifications are confirmed for your project.</p></div>
    <aside class="brief-card"><span class="eyebrow">Make your brief count</span><h3>A better pack starts with the right details.</h3><p>Share the product and how it will be filled, stored and delivered.</p>${list(['Product and target fill weight', 'Quantity and delivery region', 'Artwork, closure and finish preferences'], 'custom-list')}${quote('Prepare Your Quote Brief')}</aside></div>`);
  replaceHtml('.expert-card ul', '<li>Materials and protection</li><li>Pack size and fill weight</li><li>Artwork and finishing details</li>');
  const materialMarkup = materials.length
    ? `<ul class="material-list">${materials.map((value) => {
      const [structure, note] = splitMaterialDetail(value);
      return `<li><strong>${text(structure)}</strong>${note ? `<span>${text(note)}</span>` : ''}</li>`;
    }).join('')}</ul>`
    : '<p>Tell us how the product is filled, stored and shipped so we can discuss a suitable film.</p>';
  const printingMarkup = printing.length
    ? list(printing, 'custom-list')
    : '<p>No specific print process is fixed in the supplied source. Confirm the process with the final artwork, quantity and substrate.</p>';
  const finishingMarkup = finishGrid
    ? `<div class="finish-grid">${finishGrid}</div>`
    : '<p>No specific surface finish is fixed in the supplied source. Matte, gloss or other effects can be reviewed during quoting where compatible.</p>';
  replaceHtml('#materials .container', sectionHeading('Materials, printing & finishing', 'Separate the structure, print process and surface finish.', profile?.materialNote) +
    `<div class="config-grid">
      <article class="config-panel"><h3>Material options to review</h3>${materialMarkup}<a class="text-button" href="/solutions/material-specifications/">Compare material specifications <span aria-hidden="true">↗</span></a></article>
      <article class="config-panel"><h3>Printing process & artwork requirements</h3>${printingMarkup}<a class="text-button" href="/solutions/printing/">Explore printing options <span aria-hidden="true">↗</span></a></article>
      <article class="config-panel" style="grid-column:1 / -1"><h3>Surface finish & embellishment</h3><p>${text(profile?.artworkNote || 'Review the finish against the selected film, artwork and handling requirements.')}</p>${finishingMarkup}</article>
    </div>`);
  replaceHtml('#customization .custom-section', `<article class="config-panel"><span class="eyebrow">Custom artwork</span><h2>A familiar format. Your own identity.</h2><p>${text(profile?.artworkNote || 'Bring your brand colours, artwork and key information to the packaging brief.')}</p>${quote('Discuss Your Custom Pouch', 'btn btn-teal')}</article><article class="config-panel"><span class="eyebrow">Before production</span><h3>Confirm the artwork and fit.</h3>${list(['Share target dimensions and fill weight', 'Check artwork placement and clearances', 'Review a proof or filled sample'], 'custom-list')}<a class="text-button" href="/solutions/prepress/">Explore prepress <span aria-hidden="true">↗</span></a></article>`);
  replaceHtml('#applications .container', `<span class="eyebrow">Suitable applications</span><h2>One format. Room for your range.</h2>${applications.length ? `<div class="applications">${applicationTags}</div>${additionalApplicationMarkup}` : '<p>Share your application so we can discuss the material and configuration.</p>'}`);
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