// MW_CATEGORY_TEMPLATE_V3
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const titleCase = (value) => {
  const text = String(value || '').trim();
  return text && text === text.toLowerCase() ? text.replace(/\b\w/g, (c) => c.toUpperCase()) : text;
};
const queryPath = (path, values) => path + '?' + new URLSearchParams(values);

const CATEGORY_CSS = ':root{--mwcd-ink:#153933;--mwcd-body:#536e64;--mwcd-deep:#102d36;--mwcd-green:#006d5b;--mwcd-aqua:#00bdb6;--mwcd-mint:#e8f3ec;--mwcd-line:#d4e2d8;--mwcd-soft:#f4f7f3}' +
'.mwcd{color:var(--mwcd-ink);font:16px/1.65 Arial,Helvetica,sans-serif;background:#fff}.mwcd *{box-sizing:border-box}.mwcd h1,.mwcd h2,.mwcd h3,.mwcd p{margin-top:0}.mwcd h1,.mwcd h2,.mwcd h3{line-height:1.12!important;letter-spacing:-.035em!important;color:var(--mwcd-ink)!important}.mwcd h1{font-size:clamp(44px,4.8vw,68px)!important;font-weight:500!important;margin-bottom:24px}.mwcd h2{font-size:clamp(32px,3.3vw,45px)!important;font-weight:500!important;margin-bottom:23px}.mwcd h3{font-size:24px!important;font-weight:500!important;margin-bottom:15px}.mwcd p{color:var(--mwcd-body)!important}.mwcd a{color:inherit;text-decoration:none}.mwcd button,.mwcd input,.mwcd select,.mwcd textarea{font:inherit}.mwcd button{cursor:pointer}.mwcd img{max-width:100%}.mwcd .wrap{max-width:1320px;padding-inline:40px;margin-inline:auto}.mwcd .breadcrumb{padding-block:24px;display:flex;gap:13px;font-size:12px;color:#687e71}.mwcd .hero{display:grid;grid-template-columns:1.03fr .97fr;gap:65px;align-items:center;padding-top:20px;padding-bottom:65px}.mwcd .eyebrow{font-size:12px;font-weight:600;letter-spacing:.14em;color:var(--mwcd-green)!important;margin:0 0 20px;display:block}.mwcd .lead{font-size:19px;line-height:1.7}.mwcd .hero-description{font-size:16px;max-width:500px;line-height:1.8}.mwcd .actions{display:flex;gap:20px;align-items:center;flex-wrap:wrap;margin-top:27px}.mwcd .btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:13px 21px;border:1px solid transparent;border-radius:4px;line-height:1.35;font-size:14px;font-weight:600;text-decoration:none;transition:.2s}.mwcd .primary{background:var(--mwcd-green)!important;color:#fff!important}.mwcd .outline{background:#fff;color:var(--mwcd-ink);border-color:#aac5b4}.mwcd .mint{background:#bce9d2;color:#123f31}.mwcd .text-link{font-size:14px;font-weight:600;text-decoration:underline!important;text-underline-offset:5px;color:var(--mwcd-green)!important}.mwcd .hero-tags{display:flex;gap:10px;flex-wrap:wrap;margin-top:30px}.mwcd .hero-tags span{font-size:12px;border:1px solid var(--mwcd-line);padding:6px 9px;border-radius:3px;color:#52715f}.mwcd .hero-visual{position:relative;margin:0;border-radius:9px;background:#eff3ed;min-height:530px;padding:35px 25px 95px;overflow:hidden}.mwcd .hero-visual>img{display:block;width:100%;height:365px;object-fit:contain;mix-blend-mode:multiply}.mwcd .visual-label{position:absolute;top:22px;left:23px;font-size:10px;letter-spacing:.16em;color:#5c7668}.mwcd figcaption{font-size:11px;text-align:center;color:#6b7f70;margin-top:6px}.mwcd .visual-note{position:absolute;bottom:0;left:0;right:0;padding:22px 25px;display:flex;align-items:center;justify-content:space-between;gap:25px;background:#dfecdf;border-top:1px solid #d4e1d1}.mwcd .visual-note strong{font-size:18px;line-height:1.3;font-weight:500;letter-spacing:-.4px}.mwcd .visual-note span{font-size:12px;color:#57725d;max-width:150px}.mwcd .section-bar{background:#f8faf7;border-block:1px solid var(--mwcd-line)}.mwcd .section-bar nav{display:flex;gap:38px;overflow-x:auto;white-space:nowrap;padding-block:18px;font-size:14px;color:#536e5a}.mwcd .section{padding-block:75px}.mwcd .section-head{display:flex;align-items:end;justify-content:space-between;gap:70px;margin-bottom:35px}.mwcd .section-head h2{margin:0}.mwcd .section-head>p{max-width:390px;margin:0;font-size:16px}.mwcd .option-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.mwcd .option-card{border:1px solid var(--mwcd-line);border-radius:7px;overflow:hidden;display:flex;flex-direction:column;background:#fff}.mwcd .option-symbol{height:190px;display:flex;align-items:center;justify-content:center;position:relative;background:#eff7f3}.mwcd .option-symbol svg{height:150px;width:160px;stroke:#376e5c;stroke-width:1.8;fill:#ffffff80}.mwcd .option-symbol span{position:absolute;bottom:15px;font-size:10px;color:#60816b;letter-spacing:.12em}.mwcd .printed-symbol{background:#e5eee8}.mwcd .printed-symbol svg{fill:#a9cbbb}.mwcd .closure-symbol{background:#f0f2e7}.mwcd .closure-symbol svg{fill:#d7dfbc}.mwcd .option-card>div:last-child{padding:26px;display:flex;flex:1;flex-direction:column;align-items:start}.mwcd .option-card h3{font-size:25px!important}.mwcd .option-card p{font-size:16px;margin-bottom:24px}.mwcd .small{font-size:13px;color:#6b7e70}.mwcd .note{margin:17px 0 0}.mwcd .applications-section{background:#eef5ef;padding-block:75px}.mwcd .application-layout{display:grid;grid-template-columns:.85fr 1.15fr;gap:80px;align-items:center}.mwcd .application-layout .lead{max-width:380px}.mwcd .application-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.mwcd .application-tile{display:flex;flex-direction:column;align-items:start;text-align:left;border:1px solid #ccded1;background:#fff;padding:24px;border-radius:5px;color:var(--mwcd-ink)}.mwcd .application-tile>span{font-size:10px;letter-spacing:.15em;color:#6f896f}.mwcd .application-tile strong{font-size:26px;font-weight:500;letter-spacing:-.7px;margin:9px 0 8px}.mwcd .application-tile small{font-size:14px;color:#637b67;line-height:1.6}.mwcd .other-tile{background:#dcebdd}.mwcd .content-with-rail{max-width:1320px;padding:0 40px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:34px;align-items:start}.mwcd .rail-content{min-width:0}.mwcd .rail-content .wrap{padding-inline:0;max-width:none}.mwcd .rail-content .section{padding-block:58px}.mwcd .rail-content .section-head{display:block;margin-bottom:28px}.mwcd .rail-content .section-head>p{margin-top:20px;max-width:100%}.mwcd .rail-content .option-grid{gap:15px}.mwcd .rail-content .option-card>div:last-child{padding:22px}.mwcd .rail-content .option-card h3{font-size:23px!important}.mwcd .rail-content .option-card p{font-size:15px}.mwcd .rail-content .applications-section{padding:35px 27px;border:1px solid #dae6d7;border-radius:7px}.mwcd .rail-content .application-layout{display:block}.mwcd .rail-content .application-layout .lead{max-width:100%;font-size:18px}.mwcd .rail-content .application-grid{margin-top:28px;grid-template-columns:repeat(3,1fr);gap:12px}.mwcd .rail-content .application-tile{padding:19px 16px}.mwcd .rail-content .application-tile strong{font-size:24px}.mwcd .rail-content .application-tile small{font-size:13px}.mwcd .spec-layout{display:grid;grid-template-columns:1.35fr .65fr;gap:60px}.mwcd .rail-content .spec-layout{grid-template-columns:1fr;gap:28px}.mwcd table{border-collapse:collapse;width:100%;text-align:left;font-size:16px}.mwcd caption{text-align:left;font-size:19px;font-weight:500;margin-bottom:20px}.mwcd th,.mwcd td{vertical-align:top;padding:17px 18px;border-block-start:1px solid var(--mwcd-line)}.mwcd th{width:30%;font-weight:500;color:#58715d;background:#f5f8f2}.mwcd td{color:#395746}.mwcd .expert-card{padding:35px;background:#e6f3eb;border:1px solid #ccdfcf;border-radius:7px;align-self:start}.mwcd .expert-card h3{font-size:35px!important;margin-block:25px}.mwcd .expert-card p{font-size:16px}.mwcd .expert-card .btn{width:100%;margin-top:10px;padding-inline:12px}.mwcd .expert-whatsapp{display:block;text-align:center;font-size:14px;color:var(--mwcd-green)!important;text-decoration:underline!important;text-underline-offset:5px;margin-top:20px}.mwcd .recommend-rail{height:100%;padding-top:58px;padding-bottom:35px}.mwcd .recommend-rail-inner{position:sticky;top:24px;background:#eef5ee;border:1px solid #d2e2d4;border-radius:8px;padding:24px 19px}.mwcd .recommend-rail-inner>.eyebrow{font-size:10px;letter-spacing:.1em;margin-bottom:15px}.mwcd .recommend-rail-inner>h3{font-size:29px!important;margin-bottom:15px}.mwcd .recommend-intro{font-size:14px;line-height:1.6;margin-bottom:21px}.mwcd .recommend-scroll{position:relative;height:426px;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;padding-right:5px}.mwcd .recommend-rail-card{display:grid;grid-template-columns:83px minmax(0,1fr);gap:12px;align-items:center;background:#fff;border:1px solid #d4e1d3;border-radius:5px;padding:12px 10px;min-height:138px;margin-bottom:10px}.mwcd .recommend-rail-card img{display:block;width:83px;height:99px;object-fit:contain;background:#f0f4ed;mix-blend-mode:multiply}.mwcd .recommend-rail-card strong{display:block;font-size:16px;line-height:1.25;font-weight:600}.mwcd .recommend-rail-card small{display:block;font-size:12px;line-height:1.5;color:#6b806e;margin-top:7px}.mwcd .recommend-rail-card b{display:block;font-size:12px;font-weight:600;color:var(--mwcd-green);text-decoration:underline;text-underline-offset:4px;margin-top:9px}.mwcd .recommend-rail-controls{display:flex;gap:6px;margin-top:17px}.mwcd .recommend-rail-controls a{border:1px solid #b4cdbb;background:#fff;border-radius:4px;padding:8px 9px;min-height:37px;font-size:12px;color:var(--mwcd-ink);flex:1;text-align:center}.mwcd .recommend-position{font-size:11px;color:#718572;margin:12px 0 17px}.mwcd .process-section{padding-block:65px;background:#f5f7f1;border-block:1px solid #e1e8d9}.mwcd .process-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:45px}.mwcd .process-grid article{border-top:1px solid #bfcebf;padding-top:25px}.mwcd .process-grid p{font-size:16px;margin:0}.mwcd .process-grid h3{font-size:24px!important}.mwcd .product-section{padding-block:70px}.mwcd .product-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.mwcd .product-card{border:1px solid var(--mwcd-line);border-radius:7px;overflow:hidden;background:#fff}.mwcd .product-card .media{height:285px;padding:18px;background:#f1f5ef}.mwcd .product-card img{width:100%;height:100%;object-fit:contain}.mwcd .product-card .copy{padding:24px}.mwcd .product-empty{padding:32px;border:1px dashed #a8bea9;border-radius:7px;background:#f7faf6}.mwcd .product-empty h3{margin-bottom:10px}.mwcd .enquiry-layout{display:grid;grid-template-columns:.8fr 1.2fr;gap:85px;align-items:start}.mwcd .enquiry-layout aside{padding-top:15px}.mwcd .brief-summary{border-block:1px solid var(--mwcd-line);padding-block:23px;margin-block:30px}.mwcd .brief-summary span{font-size:11px;letter-spacing:.1em;color:#6f836e}.mwcd .brief-summary p{font-size:20px;line-height:1.4;color:var(--mwcd-ink)!important;margin:12px 0 0}.mwcd form{padding:32px;border:1px solid var(--mwcd-line);border-radius:7px;background:#fff}.mwcd .fields{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:22px}.mwcd label{display:block;font-size:14px;font-weight:500}.mwcd input,.mwcd select,.mwcd textarea{display:block;width:100%;background:#fff;border:1px solid #b8cdbe;padding:11px 12px;border-radius:4px;margin-top:8px;color:var(--mwcd-ink);font-size:15px}.mwcd textarea{resize:vertical;margin-bottom:22px}.mwcd .faq-section{background:#f4f7f3;padding-block:65px}.mwcd .faq-layout{display:grid;grid-template-columns:.8fr 1.2fr;gap:85px}.mwcd .faqs details{border-bottom:1px solid #cdded1}.mwcd .faqs summary{padding:22px 25px 22px 0;position:relative;list-style:none;cursor:pointer;font-size:17px;font-weight:500;line-height:1.5}.mwcd .faqs summary:after{content:"+";position:absolute;right:0;color:var(--mwcd-green);font-size:22px}.mwcd .faqs details[open] summary:after{content:"−"}.mwcd .faqs p{font-size:16px;line-height:1.8;padding-right:20px}.mwcd .related-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.mwcd .related-grid>a{display:block;padding:30px;border:1px solid var(--mwcd-line);border-radius:6px}.mwcd .related-grid span{font-size:10px;letter-spacing:.12em;color:#678469}.mwcd .related-grid h3{font-size:26px!important;margin-top:20px}.mwcd .related-grid b{font-size:14px;font-weight:600;text-decoration:underline;text-underline-offset:5px;color:var(--mwcd-green)}.mwcd .closing{background:var(--mwcd-deep);border-radius:7px;padding:40px;display:flex;align-items:center;justify-content:space-between;gap:35px;margin-bottom:75px}.mwcd .closing .eyebrow{color:#99d3b7!important}.mwcd .closing h2{color:#fff!important;margin:0;font-size:38px!important}.mwcd .closing .btn{flex-shrink:0}@media(max-width:1100px){.mwcd .hero{gap:30px}.mwcd .application-layout,.mwcd .spec-layout{gap:40px}.mwcd .enquiry-layout,.mwcd .faq-layout{gap:45px}.mwcd .section-head{gap:35px}.mwcd .content-with-rail{grid-template-columns:minmax(0,1fr) 275px;gap:25px}.mwcd .rail-content .option-grid{grid-template-columns:1fr}.mwcd .rail-content .option-card{display:grid;grid-template-columns:155px 1fr}.mwcd .rail-content .option-symbol{height:100%;min-height:185px}.mwcd .rail-content .application-grid{grid-template-columns:1fr 1fr}}@media(max-width:900px){.mwcd .wrap{padding-inline:26px}.mwcd .content-with-rail{padding-inline:26px;grid-template-columns:minmax(0,1fr) 250px;gap:22px}.mwcd .hero{grid-template-columns:1fr 1fr;gap:25px}.mwcd h1{font-size:44px!important}.mwcd .rail-content .option-card{display:block}.mwcd .rail-content .option-symbol{height:150px;min-height:0}.mwcd .product-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:700px){.mwcd .wrap,.mwcd .content-with-rail{padding-inline:22px}.mwcd .hero{grid-template-columns:1fr;padding-top:10px;padding-bottom:40px;gap:30px}.mwcd h1{font-size:47px!important}.mwcd .content-with-rail{display:block}.mwcd .section{padding-block:52px}.mwcd h2{font-size:34px!important}.mwcd .section-head{display:block}.mwcd .section-head>p{max-width:100%;margin-top:20px}.mwcd .option-grid{grid-template-columns:1fr}.mwcd .application-grid,.mwcd .rail-content .application-grid{grid-template-columns:1fr 1fr}.mwcd .spec-layout{grid-template-columns:1fr}.mwcd .recommend-rail{height:auto;padding:0 0 50px}.mwcd .recommend-rail-inner{position:static;padding:27px 22px}.mwcd .process-grid,.mwcd .enquiry-layout,.mwcd .faq-layout,.mwcd .product-grid{grid-template-columns:1fr}.mwcd .fields{grid-template-columns:1fr}.mwcd .related-grid{grid-template-columns:1fr}.mwcd .closing{display:block;margin:0 22px 50px;padding:30px 25px}.mwcd .closing h2{font-size:33px!important}.mwcd .closing .btn{margin-top:25px}}';

function heroText(category) {
  const name = titleCase(category.name);
  const backendTitle = String(category.seo_title || '').trim();
  const backendDescription = String(category.seo_description || '').trim();
  return {
    eyebrow: name.toUpperCase() + ' PACKAGING',
    title: esc(backendTitle || name),
    lead: category.short_description || backendDescription || 'Flexible packaging configured around your product, packing process and presentation.',
    description: backendDescription || 'Start with the real product, then confirm the dimensions, material, print, features and production brief with the Mewepak team.',
    tags: ['Custom dimensions', 'Material options', 'Custom artwork'],
    visual: name + ' • Mewepak packaging format',
    noteStrong: 'Shape the pack.<br>Fit the product.',
    noteSmall: ''
  };
}

function optionCards(slug) {
  if (slug === 'polybag') return [
    ['clear-symbol','<svg viewBox="0 0 150 140"><path d="M42 24h66l5 91H37z"/><path d="M43 33h64M38 107h74"/><rect x="53" y="53" width="44" height="40" rx="5"/></svg>','PRODUCT VISIBILITY','Clear film polybags','Let the contents lead the presentation. Discuss a clear-film approach where product visibility is a priority.'],
    ['printed-symbol','<svg viewBox="0 0 150 140"><path d="M42 24h66l5 91H37z"/><path d="M43 33h64M38 107h74"/><path d="M44 62l65-15M45 90l65-15"/><path d="M60 42h30"/></svg>','BRAND PRESENTATION','Printed polybags','Plan colours, graphics and product information directly on the film, with a clear area where appropriate.'],
    ['closure-symbol','<svg viewBox="0 0 150 140"><path d="M47 19l29 12 28-12-16 33 22 67H40l23-67z"/><path d="M61 50h29M63 55h25M51 93h48"/></svg>','PACKING & CLOSURE','Closure-led formats','Review heat sealing or a twist-tie style closure to suit your filling method, presentation and use.']
  ];
  return [
    ['clear-symbol','<svg viewBox="0 0 150 140"><path d="M42 24h66l5 91H37z"/><path d="M43 33h64M38 107h74"/><rect x="53" y="53" width="44" height="40" rx="5"/></svg>','FORMAT & DIMENSIONS','Size around the product','Start with fill weight, dimensions, shelf format and the way the pack will be handled.'],
    ['printed-symbol','<svg viewBox="0 0 150 140"><path d="M42 24h66l5 91H37z"/><path d="M43 33h64M38 107h74"/><path d="M44 62l65-15M45 90l65-15"/><path d="M60 42h30"/></svg>','BRAND PRESENTATION','Plan the printed surface','Review artwork, colours, information hierarchy and where visibility or windows are needed.'],
    ['closure-symbol','<svg viewBox="0 0 150 140"><path d="M47 19l29 12 28-12-16 33 22 67H40l23-67z"/><path d="M61 50h29M63 55h25M51 93h48"/></svg>','FUNCTION & PERFORMANCE','Match features to use','Discuss closure, barrier, filling, storage and transport requirements before quotation.']
  ];
}

function applications(slug) {
  if (slug === 'polybag') return [
    ['BAKERY','Bread','Presentation for loaves and bakery ranges.'],
    ['BAKERY','Bagels','A compact format for grouped portions.'],
    ['DRY FOODS','Pasta','Plan visibility, dimensions and fill weight.'],
    ['SNACKS','Cookies','Review packing and closure preferences.'],
    ['DRY FOODS','Tea','Discuss the product’s protection requirements.']
  ];
  return [
    ['YOUR PRODUCT','Product type','Start with what the packaging needs to hold.'],
    ['PACKING LINE','Filling method','Share how the pack is filled and sealed.'],
    ['RETAIL','Shelf presentation','Define the front panel and display priorities.'],
    ['PERFORMANCE','Protection needs','Discuss barrier, storage and handling.'],
    ['ORDER','Quantity','Share estimated order volume if known.']
  ];
}

function productCards(products, slug) {
  const count = products.length;
  const body = count
    ? '<div class="product-grid">' + products.map((product) => '<a class="product-card" href="/products/' + encodeURIComponent(slug) + '/' + encodeURIComponent(product.slug) + '/"><div class="media">' +
      (product.primary_image_url ? '<img src="' + esc(product.primary_image_url) + '" alt="' + esc(titleCase(product.name)) + '" loading="lazy" decoding="async">' : '') +
      '</div><div class="copy"><p class="eyebrow">PRODUCT</p><h3>' + esc(titleCase(product.name)) + '</h3><p>' + esc(product.short_description || 'View this published product and its packaging details.') + '</p><b>View product →</b></div></a>').join('') + '</div>'
    : '<div class="product-empty"><p class="eyebrow">0 PUBLISHED PRODUCTS</p><h3>No individual products are published in this category yet.</h3><p>When a product is published in the backend under this category, it will appear here automatically.</p></div>';
  return '<section class="product-section wrap"><div class="section-head"><div><p class="eyebrow">PRODUCT COLLECTION</p><h2>Products in this collection.</h2></div><p><strong>' + count + '</strong> published product' + (count === 1 ? '' : 's') + ' synced from the backend.</p></div>' + body + '</section>';
}

function categoryTemplate(category, products, categories) {
  const name = titleCase(category.name);
  const hero = heroText(category);
  const opts = optionCards(category.slug);
  const apps = applications(category.slug);
  const recommendations = categories.filter((item) => item.slug !== category.slug).slice(0, 6);
  const related = recommendations.slice(0, 3);
  const inquiry = '/inquiry/?category=' + encodeURIComponent(category.slug) + '#quote-request';
  const booking = '/booking/?format=' + encodeURIComponent(category.slug);
  const sample = '/solutions/sample-kit/?format=' + encodeURIComponent(category.slug) + '#request';
  const image = category.image_url
    ? '<img src="' + esc(category.image_url) + '" alt="' + esc(name + ' packaging') + '" width="600" height="600">'
    : '';
  const applicationIntro = category.slug === 'polybag'
    ? '<h2>From daily bread<br>to dry-food essentials.</h2><p class="lead">Start with what you pack. We will help you discuss the film and format details that follow.</p>'
    : '<h2>Start with what<br>you need to pack.</h2><p class="lead">The product, filling method and shelf requirements shape the specification discussion.</p>';

  return '<main id="main" class="mwcd" data-storefront-page="category">' +
    '<div class="wrap breadcrumb"><a href="/">Home</a><span>/</span><a href="/products/">Products</a><span>/</span><span aria-current="page">' + esc(name) + '</span></div>' +
    '<section class="wrap hero"><div><p class="eyebrow">' + esc(hero.eyebrow) + '</p><h1>' + hero.title + '</h1><p class="lead">' + esc(hero.lead) + '</p><p class="hero-description">' + esc(hero.description) + '</p><div class="actions"><a class="btn primary" href="' + inquiry + '">Discuss Your ' + esc(name) + '</a><a class="text-link" href="#options">Explore format options</a></div><div class="hero-tags">' + hero.tags.map((tag) => '<span>' + esc(tag) + '</span>').join('') + '</div></div>' +
    '<figure class="hero-visual"><span class="visual-label">YOUR PRODUCT, IN FOCUS</span>' + image + '<figcaption>' + esc(hero.visual) + '</figcaption><div class="visual-note"><strong>' + hero.noteStrong + '</strong><span>' + esc(hero.noteSmall) + '</span></div></figure></section>' +
    '<div class="section-bar"><nav class="wrap" aria-label="On this page"><a href="#options">Format options</a><a href="#applications">Applications</a><a href="#customisation">Customisation</a><a href="#products">Products</a><a href="#questions">FAQs</a><a href="#enquiry">Start your brief</a></nav></div>' +
    '<div class="content-with-rail"><div class="rail-content">' +
      '<section class="section wrap" id="options"><div class="section-head"><div><p class="eyebrow">A SIMPLE FORMAT. A CONSIDERED CHOICE.</p><h2>Choose how your<br>product shows up.</h2></div><p>Explore the main packaging directions below. Your final material, size and features are reviewed around your product and packing process.</p></div><div class="option-grid">' +
        opts.map((item) => '<article class="option-card"><div class="option-symbol ' + item[0] + '" aria-hidden="true">' + item[1] + '<span>' + esc(item[2]) + '</span></div><div><h3>' + esc(item[3]) + '</h3><p>' + esc(item[4]) + '</p><a class="text-link" href="' + inquiry + '">Discuss this direction</a></div></article>').join('') +
      '</div><p class="small note">These are configuration directions, not separate stocked products. Availability and the complete specification are confirmed by the team.</p></section>' +
      '<section class="applications-section" id="applications"><div class="wrap application-layout"><div><p class="eyebrow">FLEXIBLE ACROSS YOUR RANGE</p>' + applicationIntro + '<a href="' + inquiry + '" class="text-link">Share your product requirements</a></div><div class="application-grid">' +
        apps.map((item) => '<a href="' + inquiry + '" class="application-tile"><span>' + esc(item[0]) + '</span><strong>' + esc(item[1]) + '</strong><small>' + esc(item[2]) + '</small></a>').join('') +
        '<div class="application-tile other-tile"><span>YOUR PRODUCT</span><strong>Something else?</strong><a href="' + inquiry + '">Let’s review the brief</a></div></div></div></section>' +
      '<section class="section wrap" id="customisation"><div class="section-head"><div><p class="eyebrow">THE DETAILS THAT SHAPE YOUR PACK</p><h2>Make the specification<br>work for your product.</h2></div><p>A useful brief connects the visual design with the way the bag is filled, closed, stored and handled.</p></div><div class="spec-layout"><div class="spec-content"><table><caption>' + esc(name) + ' details to discuss</caption><tbody>' +
        [['Format',name + ' packaging format.'],['Dimensions','Bag width, height, depth or gusset, fill weight and packing allowance.'],['Material & structure','Selected around product needs, handling and the packing process.'],['Product visibility','Clear areas, windows or fully printed presentation where relevant.'],['Artwork','Brand colours, graphics and front/back product information.'],['Closure & features','Review sealing, opening, dispensing or functional requirements.'],['Production brief','Product, fill weight, quantity, delivery destination and target timing.']].map((row) => '<tr><th scope="row">' + esc(row[0]) + '</th><td>' + esc(row[1]) + '</td></tr>').join('') +
      '</tbody></table><p class="small">Final structure, performance, suitability and production details require project-specific confirmation.</p></div><aside class="expert-card"><p class="eyebrow">LET’S FIND YOUR FIT</p><h3>Not sure what <br>to choose?</h3><p>Share your product and packing method. Our team can help you narrow down the questions before you request a quotation.</p><a class="btn primary" href="' + booking + '">Talk to a Packaging Expert</a><a class="expert-whatsapp" href="' + sample + '">Request packaging samples</a></aside></div></section>' +
    '</div><aside class="recommend-rail" aria-labelledby="recommend-rail-title"><div class="recommend-rail-inner"><p class="eyebrow">MORE PACKAGING OPTIONS</p><h3 id="recommend-rail-title">Recommended <br>bag styles.</h3><p class="recommend-intro">Explore other formats for your next pack.</p><div class="recommend-scroll" role="region" aria-label="Recommended packaging categories">' +
      recommendations.map((item) => '<a class="recommend-rail-card" href="/products/' + encodeURIComponent(item.slug) + '/">' +
        (item.image_url ? '<img src="' + esc(item.image_url) + '" alt="' + esc(titleCase(item.name)) + '" loading="lazy" decoding="async">' : '') +
        '<span><strong>' + esc(titleCase(item.name)) + '</strong><small>' + esc(item.short_description || 'Explore this packaging format.') + '</small><b>View category</b></span></a>').join('') +
      '</div><div class="recommend-rail-controls"><a href="#recommend-rail-title">Previous</a><a href="#recommend-rail-title">Next</a><a href="/products/">All</a></div><p class="recommend-position">' + recommendations.length + ' recommended formats</p><a class="text-link" href="/products/">Explore all packaging</a></div></aside></div>' +
    productCards(products, category.slug).replace('class="product-section wrap"', 'id="products" class="product-section wrap"') +
    '<section class="process-section"><div class="wrap"><div class="section-head"><div><p class="eyebrow">A CLEARER NEXT STEP</p><h2>From product brief<br>to packaging plan.</h2></div><p>Get the key questions in place before confirming artwork, specifications and production.</p></div><div class="process-grid"><article><h3>Share what you pack</h3><p>Tell us your product, fill weight, current dimensions and how you fill and close the bag.</p></article><article><h3>Review the options</h3><p>Discuss material, printing, visibility and functional requirements with the packaging team.</p></article><article><h3>Confirm the brief</h3><p>Agree the specification, artwork requirements, quantity, quotation and delivery arrangements.</p></article></div></div></section>' +
    '<section class="section wrap enquiry-layout" id="enquiry"><aside><p class="eyebrow">PLAN YOUR ' + esc(name.toUpperCase()) + '</p><h2>Tell us about<br>your product.</h2><p class="lead">A few details make the packaging conversation more useful.</p><div class="brief-summary"><span>YOUR CURRENT INTEREST</span><p>' + esc(name) + ' packaging — please advise</p></div><p class="small">No final size or material selected yet? Share what you know and we can discuss the rest.</p><a class="text-link" href="' + booking + '">Book a consultation</a></aside><form action="/inquiry/#quote-request" method="post" data-category-enquiry><input type="hidden" name="category" value="' + esc(category.slug) + '"><h3>Your packaging enquiry</h3><p class="small">Required fields are marked *.</p><div class="fields"><label>Name *<input name="name" autocomplete="name" required></label><label>Work email *<input name="email" type="email" autocomplete="email" required></label><label>Company<input name="company" autocomplete="organization"></label><label>Country / region *<input name="country" autocomplete="country-name" required></label><label>Product to pack *<input name="application" required placeholder="e.g. bread, coffee or snacks"></label><label>Estimated quantity<input name="quantity" placeholder="If known"></label><label>Bag size / fill weight<input name="dimensions" placeholder="If known"></label><label>Format interest<select name="format"><option>' + esc(name) + ' packaging — please advise</option><option>Custom dimensions</option><option>Custom printing</option><option>Material / barrier review</option></select></label></div><label>Project notes<textarea name="notes" rows="4" placeholder="Packing method, closure, artwork or target timing"></textarea></label><button type="submit" class="btn primary">Continue Your Enquiry</button><p class="small">Your details continue to the connected Mewepak inquiry flow.</p></form></section>' +
    '<section class="faq-section"><div class="wrap faq-layout" id="questions"><div><p class="eyebrow">A FEW USEFUL ANSWERS</p><h2>Before you choose.</h2><p>Questions about your product or an existing pack?</p><a href="' + booking + '" class="text-link">Talk through your requirements</a></div><div class="faqs">' +
      [['What is ' + name + '?', category.short_description || name + ' is one of Mewepak’s published flexible packaging categories.'],['Can I customise the size and printing?','Yes. Bring your dimensions, fill weight, artwork and the way the package will be used so the specification can be reviewed.'],['Can you recommend a material structure?','Share what you pack, how you fill it, the storage conditions and the protection requirements. Final material selection is confirmed as part of the project specification.'],['What are the minimum quantity and lead time?','These depend on the specification and order. Share the estimated quantity, delivery location and target date to request a project-specific quotation.'],['Can I request samples?','Yes. Use the sample-kit request or book a packaging consultation.']].map((item) => '<details><summary>' + esc(item[0]) + '</summary><p>' + esc(item[1]) + '</p></details>').join('') +
      '</div></div></section>' +
    '<section class="section wrap"><div class="section-head"><div><p class="eyebrow">LOOKING AT ANOTHER FORMAT?</p><h2>Explore the wider range.</h2></div><p>Each published format has its own category page, with a different approach to shape, presentation and use.</p></div><div class="related-grid">' +
      related.map((item) => '<a href="/products/' + encodeURIComponent(item.slug) + '/"><span>PACKAGING FORMAT</span><h3>' + esc(titleCase(item.name)) + '</h3><p>' + esc(item.short_description || 'Explore this published packaging category.') + '</p><b>Explore category</b></a>').join('') +
      '</div></section><section class="wrap closing"><div><p class="eyebrow">YOUR NEXT PACK STARTS WITH A CONVERSATION</p><h2>' + esc(name) + '.<br>Made around your needs.</h2></div><a class="btn mint" href="' + inquiry + '">Start Your ' + esc(name) + ' Brief</a></section>' +
  '</main>';
}

export async function applyCategoryTemplate(request, response, database) {
  if (request.method !== 'GET' || !response.headers.get('content-type')?.includes('text/html')) return response;
  const url = new URL(request.url);
  const match = /^\/products\/([^/]+)\/?$/.exec(url.pathname);
  if (!match) return response;
  try {
    const slug = decodeURIComponent(match[1]);
    const categoryResponse = await database(queryPath('product_categories', {
      select: 'id,name,slug,short_description,image_url,menu_order,seo_title,seo_description',
      status: 'eq.published',
      slug: 'eq.' + slug,
      limit: '1'
    }));
    if (!categoryResponse.ok) return response;
    const category = (await categoryResponse.json())[0];
    if (!category) return response;
    const [productsResponse, categoriesResponse] = await Promise.all([
      database(queryPath('products', {
        select: 'id,name,slug,short_description,primary_image_url,sort_order',
        status: 'eq.published',
        category_id: 'eq.' + category.id,
        order: 'sort_order.asc,name.asc',
        limit: '1000'
      })),
      database(queryPath('product_categories', {
        select: 'id,name,slug,short_description,image_url,menu_order',
        status: 'eq.published',
        order: 'menu_order.asc',
        limit: '100'
      }))
    ]);
    if (!productsResponse.ok || !categoriesResponse.ok) return response;
    const products = await productsResponse.json();
    const categories = await categoriesResponse.json();
    const html = categoryTemplate(category, products, categories);
    const liveGrid = products.map((product) => {
      const image = product.primary_image_url
        ? '<div class="mewepak-category-grid__media"><img src="' + esc(product.primary_image_url) + '" alt="' + esc(titleCase(product.name)) + '" class="mewepak-category-grid__image" loading="lazy" decoding="async"></div>'
        : '';
      return '<article class="mewepak-category-grid__item" data-product-slug="' + esc(product.slug) + '">' +
        '<a href="/products/' + encodeURIComponent(category.slug) + '/' + encodeURIComponent(product.slug) + '/" class="mewepak-category-grid__link !no-underline">' +
        image +
        '<div class="mewepak-category-grid__body"><h3 class="mewepak-category-grid__title">' + esc(titleCase(product.name)) + '</h3></div>' +
        '</a></article>';
    }).join('');
    const rewrite = new HTMLRewriter()
      .on('head', { element: (el) => el.append('<style id="mwcd-v3">' + CATEGORY_CSS + '</style>', { html: true }) })
      .on('#product-grid .mewepak-category-grid__count', { element: (el) => el.setInnerContent(String(products.length)) })
      .on('#product-grid .mewepak-category-grid__count-label', { element: (el) => el.setInnerContent(products.length === 1 ? 'Product in this collection' : 'Products in this collection') })
      .on('#product-grid .mewepak-category-grid', { element: (el) => el.setInnerContent(liveGrid, { html: true }) })
      .on('main[data-storefront-page="category"]', { element: (el) => el.replace(html, { html: true }) });
    const output = rewrite.transform(new Response(response.body, { status: response.status, headers: response.headers }));
    output.headers.delete('content-length');
    output.headers.delete('etag');
    return output;
  } catch (error) {
    console.error('category-template', error?.message || error);
    return response;
  }
}