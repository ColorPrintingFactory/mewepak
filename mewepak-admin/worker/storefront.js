const encode = (value) => String(value ?? '').replace(/[&<>"']/g, (char) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export async function publicSiteSettings(database) {
  const response = await database('site_settings?select=key,value&is_public=eq.true&key=in.(brand,company_contact,factory_tour,languages)');
  if (!response.ok) return {};
  const values = Object.fromEntries((await response.json()).map(({ key, value }) => [key, value]));
  const contact = values.company_contact || {};
  const brand = values.brand || {};
  const line = (value) => typeof value === 'string' ? value.slice(0, 180).trim() : '';
  const email = line(contact.email);
  const phone = line(contact.phone);
  const whatsapp = line(contact.whatsapp);
  const link = (value) => typeof value === 'string' && (/^\/(?![\\/])/.test(value) || /^https:\/\//i.test(value)) ? value : '';
  return {
    name: line(brand.name), tagline: line(brand.tagline),
    logo: link(brand.logo_url),
    email: /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email) ? email : '',
    phone: /^\+?[\d ().-]{6,30}$/.test(phone) ? phone : '',
    whatsapp: /^\+?[\d ().-]{6,30}$/.test(whatsapp) ? whatsapp : '',
    factory_tour: { video_url: link(values.factory_tour?.video_url), poster_url: link(values.factory_tour?.poster_url) },
    languages: Array.isArray(values.languages?.links) ? values.languages.links.slice(0, 20).flatMap((item) =>
      line(item?.label) && link(item?.url) ? [{ label: line(item.label), url: link(item.url) }] : []) : [],
  };
}

function storageAsset(url, projectUrl, model = false) {
  if (typeof url !== 'string') return '';
  if (/^\/assets\/[\w%./-]+$/.test(url) && !url.includes('..')) return url;
  try {
    const asset = new URL(url);
    if (asset.origin === new URL(projectUrl).origin && asset.pathname.startsWith('/storage/v1/object/public/site-media/')) {
      if (model && !/\.(glb|gltf)$/i.test(asset.pathname)) return '';
      return asset.href;
    }
  } catch {}
  return '';
}

async function publishedModels(database, projectUrl) {
  const response = await database('model_assets?select=id,name,model_url,poster_url,preview_settings,product_id,product:products(slug)&status=eq.published&order=sort_order.asc,name.asc');
  if (!response.ok) return [];
  return (await response.json()).flatMap((row) => {
    const url = storageAsset(row.model_url, projectUrl, true);
    if (!url || (row.product_id && !row.product?.slug)) return [];
    return [{ id: row.id, name: row.name, url, poster: storageAsset(row.poster_url, projectUrl), product: row.product?.slug, settings: row.preview_settings || {} }];
  });
}

async function quoteCategories(database) {
  const response = await database('product_categories?select=slug,name&status=eq.published&order=menu_order.asc,name.asc');
  return response.ok ? response.json() : [];
}

const connectPhotoRoot = '/assets/client-design/images/';
const connectPhotoGroups = [
  ['30e138afb1ec62c7', '12cf35da5b04561a', '497b30600ed09447'],
  ['70ca70e35365e5ab', 'fc7a6f96dc5e2acf', 'ebeeb82dedcb3576'],
];

function renderConnectSection() {
  const [left, right] = connectPhotoGroups.map((photos) => photos.map((photo) =>
    `<img src="${connectPhotoRoot}${photo}.webp" width="145" height="189" alt="" loading="lazy" decoding="async">`
  ).join(''));
  return `<section id="contact" class="storefront-connect" aria-label="Stay connected with Mewepak">
    <div class="storefront-connect__grid">
      <div class="storefront-connect__photos" aria-hidden="true">${left}</div>
      <div class="storefront-connect__copy">
        <p class="storefront-connect__eyebrow">Ideas worth staying connected to</p>
        <h2>Stay<br>Connected</h2>
        <p>Packaging ideas, product options and practical insights for your next project.</p>
        <form class="storefront-connect__form" data-mewepak-subscribe action="/api/submissions/newsletter" method="post">
          <div class="storefront-connect__email">
            <input name="email" type="email" aria-label="Newsletter email address" placeholder="Email address" autocomplete="email" maxlength="254" required>
            <button type="submit">Subscribe</button>
          </div>
          <p class="storefront-connect__status" data-subscribe-message aria-live="polite"></p>
        </form>
      </div>
      <div class="storefront-connect__copy">
        <p class="storefront-connect__eyebrow">Bring your next idea to the table</p>
        <h2>Let’s Talk<br>Packaging</h2>
        <p>Share your product, your brand and the packaging you have in mind. Let’s explore the next step together.</p>
        <a href="/inquiry/#quote-request" class="storefront-connect__link">Contact Us <span aria-hidden="true">↗</span></a>
      </div>
      <div class="storefront-connect__photos storefront-connect__photos--right" aria-hidden="true">${right}</div>
    </div>
  </section>`;
}

function renderProductNextStep(context) {
  const target = '/inquiry/' + (context ? '?product=' + encodeURIComponent(context) : '') + '#quote-request';
  return `<section id="product-next-step" class="mw-product-next" aria-labelledby="product-next-title">
    <div class="mw-product-next__panel">
      <p class="mw-product-next__eyebrow">Let’s bring your packaging idea to life</p>
      <h2 id="product-next-title">Your next standout pack starts with a conversation.</h2>
      <p class="mw-product-next__description">Share your product and packaging requirements with our team, or explore more formats before requesting a quote.</p>
      <div class="mw-product-next__actions">
        <a class="mw-product-next__action" href="${encode(target)}">Request a Quote <span aria-hidden="true">↗</span></a>
        <a class="mw-product-next__action mw-product-next__action--outline" href="/products/">Browse All Products</a>
      </div>
    </div>
  </section>`;
}

function storefrontPageType(url, path) {
  if (path.startsWith('/search') || (path === '/' && url.searchParams.has('s'))) return 'search';
  if (path === '/booking') return 'booking';
  if (path === '/3d-preview') return 'viewer';
  if (path.startsWith('/category/')) return 'archive';
  if (/^\/products\/[^/]+\/[^/]+$/.test(path)) return 'product';
  if (path.startsWith('/products/')) return 'category';
  return 'detail';
}

const publicMailbox = '(?:sales|support|info)@mewepak\\.com';
const publicMailto = new RegExp('^mailto:' + publicMailbox + '(?=\\?|$)', 'i');
const publicEmailText = new RegExp('(?<![\\w.+-])' + publicMailbox + '(?![\\w.-])', 'gi');

export function rewriteContactEmail(rewriter, email) {
  if (!email) return;
  let label = '';
  rewriter.on('body', { element: (el) => el.setAttribute('data-mewepak-contact-email', email) });
  rewriter.on('a[href^="mailto:"]', {
    element(el) {
      const href = el.getAttribute('href');
      if (publicMailto.test(href)) el.setAttribute('href', href.replace(publicMailto, () => 'mailto:' + email));
    },
    text(chunk) {
      label += chunk.text;
      if (!chunk.lastInTextNode) {
        chunk.remove();
        return;
      }
      chunk.replace(label.replace(publicEmailText, () => encode(email)), { html: true });
      label = '';
    },
  });
}

export async function connectStorefront(request, response, database, projectUrl, captureSettings) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  if (!response.ok || request.method !== 'GET' || /^\/admin(?:\/|$)/.test(path) || !response.headers.get('content-type')?.includes('text/html')) return response;
  const productSlug = path.match(/^\/products\/[^/]+\/([^/]+)$/)?.[1];
  const useModels = path === '/' || path === '/3d-preview' || !!productSlug;
  const hasQuote = path === '/contact' || path === '/inquiry';
  const [settings, models, categories] = await Promise.all([
    publicSiteSettings(database).catch(() => ({})),
    useModels ? publishedModels(database, projectUrl).catch(() => []) : [],
    hasQuote ? quoteCategories(database).catch(() => []) : [],
  ]);
  captureSettings?.(settings);
  const rewrite = new HTMLRewriter();
  const on = (selector, element) => rewrite.on(selector, { element });
  const set = (selector, name, value) => on(selector, (el) => el.setAttribute(name, value));
  const text = (selector, value) => on(selector, (el) => el.setInnerContent(value));
  rewriteContactEmail(rewrite, settings.email);
  const oldContact = [
    ['tel:+8613423118038', settings.phone, 'tel:' + (settings.phone || '').replace(/[^+\d]/g, ''), 'Call Us: ' + settings.phone],
    ['https://wa.me/8613537663353', settings.whatsapp, 'https://wa.me/' + (settings.whatsapp || '').replace(/\D/g, ''), 'WhatsApp: ' + settings.whatsapp],
  ];
  for (const [old, value, href, label] of oldContact) {
    if (!value) continue;
    const link = 'a[href="' + old + '"]';
    set(link, 'href', href);
    text('[data-mewepak-header] ' + link + ' > span', label);
  }
  if (settings.phone) set('#call a[href="tel:+86123456789"]', 'href', 'tel:' + settings.phone.replace(/[^+\d]/g, ''));
  if (settings.whatsapp) set('#call a[href="https://wa.me/86123456789"]', 'href', 'https://wa.me/' + settings.whatsapp.replace(/\D/g, ''));
  if (settings.phone) {
    set('a[href="tel:+8612345678"]', 'href', 'tel:' + settings.phone.replace(/[^+\d]/g, ''));
    text('a[href="tel:+8612345678"]', 'Phone: ' + settings.phone);
  }
  if (settings.whatsapp) {
    set('a[href="https://wa.me/8612345678"]', 'href', 'https://wa.me/' + settings.whatsapp.replace(/\D/g, ''));
    text('a[href="https://wa.me/8612345678"]', 'WhatsApp: ' + settings.whatsapp);
  }
  if (categories.length) {
    const selected = url.searchParams.get('category');
    const options = categories.map(({ slug, name }) =>
      '<option value="' + encode(slug) + '"' + (slug === selected ? ' selected' : '') + '>' + encode(name) + '</option>').join('');
    on('form[data-mewepak-quote] select[name="product_type"]', (el) => el.setInnerContent('<option value="">Select a product</option>' + options + '<option value="other">Other</option>', { html: true }));
  }
  for (const [form,type] of [['form[data-mewepak-quote]','quote'],['form[data-mewepak-subscribe]','newsletter']]) {
    set(form, 'method', 'post');
    set(form, 'action', '/api/submissions/' + type);
  }
  if (settings.tagline) text('[data-mewepak-header] p.tracking-wide', settings.tagline);
  if (settings.logo) set('.mewepak-header-logo,.mewepak-footer-logo', 'src', settings.logo);
  if (settings.name) set('.mewepak-header-logo,.mewepak-footer-logo', 'alt', settings.name + ' — Packaging Solutions Provider');
  set('script[src="/assets/original/main.js?cms=1"]', 'src', '/assets/original/storefront-navigation.js');
  set('script[src="/assets/original/main.js"]', 'src', '/assets/original/storefront-navigation.js');
  set('script[src="/assets/site.js"]', 'src', '/assets/site.js?storefront=contact-2');
  set('script[src="/assets/client-design/process.js"]', 'src', '/assets/client-design/process.js?v=contact');
  set('script[src="/assets/client-design/integration.js?shell=1"]', 'src', '/assets/client-design/integration.js?v=contact');
  set('script[src="/assets/3d/pouch-viewer.js"]', 'src', '/assets/3d/pouch-interactive.js?v=touch');
  set('link[href="/assets/client-design/home.css"]', 'href', '/assets/client-design/home.css?v=mobile-2');
  set('script[src="/assets/client-design/home.js?shell=1"]', 'src', '/assets/client-design/home.js?v=banner-editor');
  set('link[href="/assets/client-design/market-dialog.css"]', 'href', '/assets/client-design/market-dialog.css?v=mobile');
  set('link[href="/assets/3d/pouch-viewer.css"]', 'href', '/assets/3d/pouch-viewer.css?v=touch');
  set('footer[class*="00cfca"]', 'data-storefront-footer', '');
  if (path === '/markets') set('script[src="/assets/client-design/markets.js"]', 'src', '/assets/client-design/market-browser.js');
  if (/^\/(?:markets|products)\/[^/]+$/.test(path) || path === '/10-design-tips-for-maximum-shelf-impact') {
    on('head', (el) => el.append('<link rel="stylesheet" href="/assets/original/related-content.css">', { html: true }));
  }
  on('section#contact.from-gray-100', (el) => {
    el.replace(renderConnectSection(), { html: true });
  });
  on('head', (el) => el.append('<link rel="stylesheet" href="/assets/original/storefront-newsletter.css">', { html: true }));
  const pageType = storefrontPageType(url, path);
  if (pageType === 'category' || pageType === 'product') {
    let heading = '';
    rewrite.on('main h1', {
      text(chunk) { heading += chunk.text; },
    });
    on('main section[class~="bg-[#0f4c5c]"]', (el) => {
      const context = heading.replace(/^\s*Packaging solutions for\s+/i, '').replace(/\s+/g, ' ').trim();
      el.replace(renderProductNextStep(context), { html: true });
    });
    on('head', (el) => el.append('<link rel="stylesheet" href="/assets/original/product-next-step.css">', { html: true }));
  }
  let themedMain = false;
  let bodyClass = '';
  on('body', (el) => { bodyClass = el.getAttribute('class') || ''; });
  on('main', (el) => {
    const design = el.getAttribute('data-client-page');
    if (themedMain || (design && pageType !== 'search' && (design !== 'home' || path === '/'))) return;
    themedMain = true;
    const type = pageType === 'detail' && /(?:^|\s)single-post(?:\s|$)/.test(bodyClass) ? 'article' : pageType;
    el.setAttribute('data-storefront-page', type);
  });
  on('head', (el) => el.append('<link rel="stylesheet" href="/assets/original/storefront-layout.css?v=service-process"><script src="/assets/original/storefront-layout.js" defer></script>', { html: true }));
  on('head', (el) => el.append('<link rel="stylesheet" href="/assets/original/footer-products.css"><link rel="stylesheet" href="/assets/original/storefront-theme.css"><script src="/assets/storefront-forms.js?v=verification-3" defer></script>', { html: true }));
  if (settings.languages?.length) {
    const links = settings.languages.map(({ label, url: href }) => '<a class="block px-4 py-2 !text-gray-700 hover:!text-[#007f7c]" href="' + encode(href) + '">' + encode(label) + '</a>').join('');
    on('button[aria-label="Language selector"]', (el) => el.replace('<details class="relative hidden lg:block"><summary class="cursor-pointer text-sm text-gray-600">◎ Language</summary><nav aria-label="Available languages" class="absolute right-0 z-50 mt-2 rounded-lg bg-white shadow-lg min-w-36">' + links + '</nav></details>', { html: true }));
  }
  if (path === '/' && settings.factory_tour) {
    const { video_url, poster_url } = settings.factory_tour;
    const video = storageAsset(video_url, projectUrl);
    const poster = poster_url || 'https://placehold.co/800x450/d1d5db/64748b?text=Factory+Tour';
    if (video && /\.(mp4|webm)(?:\?|$)/i.test(video)) {
      on('img[alt="Factory tour"]', (el) => el.replace('<video controls playsinline preload="none" class="w-full h-full object-cover" aria-label="Factory tour" poster="' + encode(poster) + '" src="' + encode(video) + '"></video>', { html: true }));
      on('img[alt="Factory tour"] + div', (el) => el.remove());
    } else if (poster_url) {
      set('img[alt="Factory tour"]', 'src', poster_url);
    }
  }
  const defaultModel = models.find((model) => !model.product) || models[0];
  if (path === '/' && defaultModel) set('[data-mewepak-home-3d]', 'data-model-url', defaultModel.url);
  if (productSlug && models.some((model) => model.product === productSlug)) {
    let linked = false;
    on('.mewepak-product-primary-cta', (el) => {
      if (linked) return;
      linked = true;
      el.after('<a class="inline-flex px-4 py-3 !font-semibold !text-[#007f7c]" href="/3d-preview/?product=' + encodeURIComponent(productSlug) + '">Preview in 3D</a>', { html: true });
    });
  }
  if (path === '/3d-preview') {
    const active = models.find((model) => model.id === url.searchParams.get('model'))
      || models.find((model) => model.product && model.product === url.searchParams.get('product')) || defaultModel;
    if (active) {
      set('.mewepak-3d-container', 'data-model-url', active.url);
      set('.mewepak-3d-container', 'aria-label', active.name);
      if (active.settings.supports_front_texture === false) set('.mewepak-3d-container', 'data-front-artwork', 'false');
      if (active.settings.supports_back_texture === false) set('.mewepak-3d-container', 'data-back-artwork', 'false');
      if (active.poster) on('.mewepak-3d-container', (el) => el.prepend('<img data-model-poster src="' + encode(active.poster) + '" alt="" style="width:100%;height:100%;object-fit:contain">', { html: true }));
      if (models.length > 1) {
        const links = models.map((model) => '<a class="button" href="/3d-preview/?model=' + encodeURIComponent(model.id) + '"' + (model.id === active.id ? ' aria-current="true"' : '') + '>' + encode(model.name) + '</a>').join(' ');
        on('.mewepak-3d-container', (el) => el.before('<nav aria-label="Available packaging models">' + links + '</nav>', { html: true }));
      }
    }
    set('main a[href="/booking/"]', 'href', '/inquiry/');
  }
  const result = rewrite.transform(new Response(response.body, { status: response.status, headers: response.headers }));
  result.headers.set('cache-control', 'no-store');
  result.headers.delete('content-length');
  result.headers.delete('etag');
  return result;
}
