const productCategories = [
  {name:'Stand Up Pouch',slug:'stand-up-pouch',group:'pouch-formats',description:'Stand up pouches combine an upright gusseted base, laminated exterior, and shelf-ready front panel.'},
  {name:'Flat Bottom Pouch',slug:'flat-bottom-pouch',group:'pouch-formats',description:'A reinforced rectangular base and side gussets create a stable box-style profile.'},
  {name:'Retort Pouch',slug:'retort-pouch',group:'pouch-formats',description:'High-temperature resistant pouches for sterilized food products.'},
  {name:'Spout Pouch',slug:'spout-pouch',group:'pouch-formats',description:'Convenient pouches with integrated spouts for liquid and semi-liquid products.'},
  {name:'Roll Stock Films',slug:'roll-stock-films',group:'pouch-formats',description:'Continuous printed flexible film for automated form-fill-seal and wrapping lines.'},
  {name:'Stand Up Pouch with Tap',slug:'stand-up-pouch-tap',group:'pouch-formats',description:'Large format pouches with dispensing taps for bag-in-box applications.'},
  {name:'Bag In Box',slug:'bag-in-box',group:'pouch-formats',description:'Inner bags designed for box packaging, beverages, and liquid products.'},
  {name:'Pinch Bottom Pouches',slug:'pinch-bottom-pouches',group:'pouch-formats',description:'A folded reinforced base, structured side gussets, and broad print panels.'},
  {name:'polybag',slug:'polybag',group:'pouch-formats',description:'Lightweight flexible film in clear or printed formats.'},
  {name:'Quad Seal Bag',slug:'quad-seal-bag',group:'specialty-packaging',description:'Four-corner sealed bags offering shelf impact and filling capacity.'},
  {name:'Flat Pouch',slug:'flat-pouch',group:'specialty-packaging',description:'Simple three-side sealed pouches for sachets and samples.'},
  {name:'Shaped Pouch',slug:'shaped-pouch',group:'specialty-packaging',description:'Custom die-cut pouches in unique shapes for standout shelf presence.'}
];

const esc = (value='') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const arrow = '<span aria-hidden="true">→</span>';

const contactEmail = document.body.dataset.mewepakContactEmail;

function categoryLink(item) {
  return `<li><a href="/products/?category=${encodeURIComponent(item.slug)}">${esc(item.name)}</a></li>`;
}

function renderHeader() {
  const host = document.querySelector('[data-site-header]');
  if (!host) return;
  const pouch = productCategories.filter(x => x.group === 'pouch-formats');
  const specialty = productCategories.filter(x => x.group === 'specialty-packaging');
  host.innerHTML = `
    <header class="site-header">
      <div class="utility"><div class="container"><strong>Customized Packaging Factory Since 2007.</strong><div class="utility-links"><a href="https://wa.me/8613537663353">WhatsApp: +86 13537663353</a><a href="tel:+8613423118038">Call Us: +86-13423118038</a><a href="mailto:${esc(contactEmail || 'sales@mewepak.com')}">${esc(contactEmail || 'sales@mewepak.com')}</a></div></div></div>
      <div class="container header-main">
        <a class="brand" href="/"><img src="/assets/images/logo.png" alt="Mewepak — Packaging Solutions Provider"></a>
        <form class="search-form" action="/products/" role="search"><input name="q" type="search" placeholder="Search for products |" aria-label="Search for products"><button aria-label="Search">⌕</button></form>
        <div class="header-actions"><span class="language">◎ EN⌄</span><a class="button button-primary" href="/booking/">Request a Quote</a><button class="mobile-toggle" type="button" data-mobile-open aria-label="Open menu">☰</button></div>
      </div>
      <nav class="container nav" aria-label="Main navigation">
        <div class="nav-item"><a href="/">Home</a></div>
        <div class="nav-item"><a href="/products/">Products <span class="nav-caret">⌄</span></a><div class="mega"><div class="container mega-inner"><div class="mega-columns"><div><h3>Pouch Formats</h3><ul>${pouch.slice(0,5).map(categoryLink).join('')}</ul></div><div><h3>&nbsp;</h3><ul>${pouch.slice(5).map(categoryLink).join('')}</ul></div><div><h3>Specialty Packaging</h3><ul>${specialty.map(categoryLink).join('')}</ul></div></div><aside class="mega-feature"><span class="eyebrow">Featured</span><h4>Explore Our Premium Products</h4><p>Discover high-quality, customized packaging solutions tailored for your business needs.</p><a class="button button-dark" href="/products/">View All Products</a></aside></div></div></div>
        <div class="nav-item"><a href="/#markets">Markets <span class="nav-caret">⌄</span></a></div>
        <div class="nav-item"><a href="/#process">Solutions <span class="nav-caret">⌄</span></a></div>
        <div class="nav-item"><a href="/3d-preview/">3D Preview</a></div>
        <div class="nav-item"><a href="/#viewer">Added Value <span class="nav-caret">⌄</span></a></div>
        <div class="nav-item"><a href="/#sustainability">Sustainability <span class="nav-caret">⌄</span></a></div>
        <div class="nav-item"><a href="/#blog">Blog</a></div>
        <div class="nav-item"><a href="/booking/">Contact</a></div>
        <div class="nav-item"><a href="/#about">About Us <span class="nav-caret">⌄</span></a></div>
      </nav>
    </header>
    <div class="mobile-panel" data-mobile-panel><div class="mobile-top"><img src="/assets/images/logo.png" alt="Mewepak"><button class="mobile-close" data-mobile-close aria-label="Close menu">×</button></div><nav class="mobile-nav"><a href="/">Home</a><a href="/products/">Products</a><a href="/#markets">Markets</a><a href="/#process">Solutions</a><a href="/3d-preview/">3D Preview</a><a href="/#sustainability">Sustainability</a><a href="/booking/">Request a Quote</a></nav></div>`;
}

function renderFooter() {
  const host = document.querySelector('[data-site-footer]');
  if (!host) return;
  host.innerHTML = `<footer class="site-footer"><div class="container"><div class="footer-grid"><div><img class="footer-logo" src="/assets/images/logo.png" alt="Mewepak"><p class="footer-note">The Mewepak Is A Top-Rated Packaging Company Known For Its Many Benefits. Our Aim Is To Streamline Printing And Packaging For A Profitable And Satisfying Client Experience.</p></div><div class="footer-column"><h4>Products</h4><ul>${productCategories.slice(0,7).map(categoryLink).join('')}</ul></div><div class="footer-column"><h4>Company</h4><ul><li><a href="/">Home</a></li><li><a href="/#about">About Us</a></li><li><a href="/products/">Products</a></li><li><a href="/3d-preview/">3D Preview</a></li><li><a href="/booking/">Contact</a></li><li><a href="/booking/">Book a Consultation</a></li></ul></div><div class="footer-column"><h4>Contact</h4><ul><li><a href="tel:+18003961840">Toll-Free: 1-800-396-1840</a></li><li><a href="tel:+16303643944">Front Desk: 630-364-3944</a></li><li><a href="mailto:${esc(contactEmail || 'support@mewepak.com')}">${esc(contactEmail || 'support@mewepak.com')}</a></li><li><a href="https://wa.me/8613537663353">WhatsApp</a></li></ul></div></div><div class="footer-bottom"><span>© 2007–2026 Mewepak. All rights reserved.</span><span>Customized Packaging Factory Since 2007.</span></div></div></footer>`;
}

async function loadCategories() {
  try {
    const response = await fetch('/api/content?type=categories', {headers:{accept:'application/json'}});
    if (!response.ok) throw new Error();
    const rows = await response.json();
    return Array.isArray(rows) && rows.length ? rows : productCategories;
  } catch { return productCategories; }
}

async function renderCatalog() {
  const host = document.querySelector('[data-category-grid]');
  if (!host) return;
  const categories = await loadCategories();
  host.innerHTML = categories.map(item => `<a class="category-card" href="/products/?category=${encodeURIComponent(item.slug)}"><h3>${esc(item.name)}</h3><p>${esc(item.short_description || item.description || 'Custom flexible packaging engineered for your product and production requirements.')}</p><span>Explore format ${arrow}</span></a>`).join('');
}

async function renderProducts() {
  const host = document.querySelector('[data-product-grid]');
  if (!host) return;
  const fallback = [
    {name:'Premium Almonds Window Stand Up Pouch',category:'Stand Up Pouch',image:'/assets/images/Premium-Almonds-Window-Stand-Up-Pouch-1-600x740.jpeg'},
    {name:'Frozen Candied Grapes Hanging Pouch',category:'Stand Up Pouch',image:'/assets/images/Frozen-Candied-Grapes-Atomic-Sourberry-Hanging-Pouch-1-600x709.jpeg'},
    {name:'Cotton Candy Pastel Pink Hanging Pouch',category:'Shaped Pouch',image:'/assets/images/Cotton-Candy-Pastel-Pink-Hanging-Pouch-1-600x740.jpeg'}
  ];
  let rows = fallback;
  try {
    const response = await fetch('/api/content?type=products');
    const data = response.ok ? await response.json() : [];
    if (Array.isArray(data) && data.length) rows = data.slice(0,6).map((p,i)=>({name:p.name,category:p.category?.name || 'Products',image:p.primary_image_url || fallback[i%fallback.length].image,slug:p.slug}));
  } catch {}
  host.innerHTML = rows.map(p => `<a class="product-card" href="/products/?product=${encodeURIComponent(p.slug || '')}"><div class="product-photo"><img src="${esc(p.image)}" alt="${esc(p.name)}"><span class="product-tag">${esc(p.category)}</span></div><h3>${esc(p.name)}</h3></a>`).join('');
}

function bindMobile() {
  const panel = document.querySelector('[data-mobile-panel]');
  document.querySelector('[data-mobile-open]')?.addEventListener('click',()=>{panel?.classList.add('open');document.body.classList.add('menu-open');});
  const close=()=>{panel?.classList.remove('open');document.body.classList.remove('menu-open');};
  document.querySelector('[data-mobile-close]')?.addEventListener('click',close);
  panel?.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
}

renderHeader();
renderFooter();
bindMobile();
renderCatalog();
renderProducts();
fetch('/api/public-site').then((response) => response.json()).then((settings) => {
  for (const [selector, value, href, prefix] of [
    ['.utility a[href^="mailto:"]', settings.email, 'mailto:' + settings.email, ''],
    ['.utility a[href^="tel:"]', settings.phone, 'tel:' + (settings.phone || '').replace(/[^+\d]/g, ''), 'Call Us: '],
    ['a[href^="https://wa.me/"]', settings.whatsapp, 'https://wa.me/' + (settings.whatsapp || '').replace(/\D/g, ''), 'WhatsApp: '],
  ]) {
    if (!value) continue;
    document.querySelectorAll(selector).forEach((link) => { link.href = href; link.textContent = prefix + value; });
  }
  if (settings.logo) document.querySelectorAll('.brand img,.mobile-top img,.footer-logo').forEach((image) => { image.src = settings.logo; });
  if (settings.tagline) document.querySelectorAll('.utility strong,.footer-bottom span:last-child').forEach((label) => { label.textContent = settings.tagline; });
}).catch(() => {});
