import { languageSwitcher } from './i18n.js';
import { compactHeaderAssets } from './compact-header.js';
import { headerActionsAssets, renderHeaderActions } from './header-actions.js';
import { siteIcons } from './site-icons.js';
import { homeFormatSection, homePreviewSection, homeReviewsPreview, homeSustainabilitySection } from './homepage-sections.js';
import { processPath } from './cms.js';
import { previewFormats, studioModelUrl } from './preview-formats.js';
import { markets } from './recommendations.js';
import { solutions } from './solutions-content.js';

const encode = (value) => String(value ?? '').replace(/[&<>"']/g, (char) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export async function publicSiteSettings(database) {
  const response = await database('site_settings?select=key,value&is_public=eq.true&key=in.(brand,company_contact,factory_tour,languages,us_locations)');
  if (!response.ok) return {};
  const values = Object.fromEntries((await response.json()).map(({ key, value }) => [key, value]));
  const contact = values.company_contact || {};
  const brand = values.brand || {};
  const line = (value) => typeof value === 'string' ? value.slice(0, 180).trim() : '';
  const email = line(contact.email);
  const phone = line(contact.phone);
  const whatsapp = line(contact.whatsapp);
  const office = values.us_locations || {};
  const telephone = (value) => /^\+?[\d ().-]{6,30}$/.test(value) && /^\d{6,15}$/.test(value.replace(/\D/g, '')) ? value : '';
  const video = (url) => /\.(mp4|webm)(?:[?#]|$)/i.test(url) ? url : '';
  const link = (value) => {
    if (typeof value !== 'string') return '';
    if (/^\/(?![\\/])/.test(value)) return value;
    try {
      const url = new URL(value);
      if (url.protocol === 'https:' && !url.username && !url.password) return url.href;
    } catch {}
    return '';
  };
  return {
    factoryEnabled: !!values.factory_tour,
    name: line(brand.name), tagline: line(brand.tagline),
    logo: link(brand.logo_url),
    email: /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email) ? email : '',
    phone: telephone(phone),
    whatsapp: telephone(whatsapp),
    factory_tour: { video_url: video(link(values.factory_tour?.video_url)), poster_url: link(values.factory_tour?.poster_url) },
    usLocations: {
      addresses: ['address_1','address_2','address_3'].map((key) => line(office[key])).filter(Boolean),
      tollFree: telephone(line(office.toll_free)), frontDesk: telephone(line(office.front_desk)),
    },
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
  const response = await database('model_assets?select=id,name,model_url,poster_url,preview_settings,product_id,product:products(slug,category:product_categories(slug))&status=eq.published&order=sort_order.asc,name.asc');
  if (!response.ok) return [];
  return (await response.json()).flatMap((row) => {
    const url = storageAsset(row.model_url, projectUrl, true);
    if (!url || (row.product_id && !row.product?.slug)) return [];
    const builtInPouch = url === '/assets/3d/doypack.glb';
    return [{
      id: row.id, name: row.name,
      url: builtInPouch ? studioModelUrl : url,
      poster: builtInPouch ? '/assets/3d/doypack-studio.webp' : storageAsset(row.poster_url, projectUrl),
      product: row.product?.slug, category: row.product?.category?.slug, settings: row.preview_settings || {},
    }];
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
        <a href="/contact/#project-enquiry" class="storefront-connect__link">Contact Us <span aria-hidden="true">↗</span></a>
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

const dial = (number) => number.replace(/[^+\d]/g, '');
function usTel(number) {
  const value = dial(number);
  return /^\d{10}$/.test(value) ? '+1' + value : value.startsWith('+') ? value : '+' + value;
}

export async function connectStorefront(request, response, database, projectUrl, captureSettings, preparedSettings, showReviewPreview = false) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  if (!response.ok || request.method !== 'GET' || /^\/admin(?:\/|$)/.test(path) || !response.headers.get('content-type')?.includes('text/html')) return response;
  const [, categorySlug, productSlug] = /^\/products\/([^/]+)(?:\/([^/]+))?$/.exec(path) || [];
  const useModels = path === '/' || path === '/3d-preview' || !!productSlug;
  const hasQuote = path === '/contact' || path === '/inquiry';
  const [settings, models, categories] = await Promise.all([
    preparedSettings || publicSiteSettings(database).catch(() => ({})),
    useModels ? publishedModels(database, projectUrl).catch(() => []) : [],
    hasQuote ? quoteCategories(database).catch(() => []) : [],
  ]);
  captureSettings?.(settings);
  const rewrite = new HTMLRewriter();
  const on = (selector, element) => rewrite.on(selector, { element });
  const set = (selector, name, value) => on(selector, (el) => el.setAttribute(name, value));
  const text = (selector, value) => on(selector, (el) => el.setInnerContent(value));
  on('head', (el) => el.append(siteIcons, { html: true }));
  on('a[href^="/solutions"]', (el) => {
    const href = el.getAttribute('href');
    const legacySection = /^\/solutions\/?(#(?:process-stages|project-enquiry|why-mewepak|packaging-help|get-in-touch))$/.exec(href);
    if (legacySection) el.setAttribute('href', processPath + legacySection[1]);
    else if (href === '/solutions') el.setAttribute('href', '/solutions/');
  });
  const quoteTarget = '/inquiry/#quote-request';
  const headerQuote = '[data-mewepak-header] a[class~="h-11"][href="/contact"],[data-mewepak-header] a[class~="h-11"][href="/inquiry/#quote-request"]';
  set('[data-mobile-menu] a[href="/contact"][class~="h-12"]', 'href', quoteTarget);
  on(headerQuote, (el) => el.replace(renderHeaderActions({ quoteHref: quoteTarget, variant: 'desktop' }), { html: true }));
  on('[data-mewepak-header] > .max-w-7xl > .h-16', (el) => el.after(
    renderHeaderActions({ quoteHref: quoteTarget, variant: 'mobile' }), { html: true }));
  if (path.startsWith('/markets/')) {
    set('main a[href="/contact/"][class~="px-8"][class~="py-3"]', 'href', quoteTarget);
  }
  set('.mewepak-article-cta a[href="/contact/"],body.single-post main a[href="/contact/"][class~="px-5"][class~="py-2.5"]', 'href', quoteTarget);
  on('footer a[href="#"]', (el) => el.remove());
  on('[data-mega-panel="Sustainability"] ul.space-y-2', (el) => el.prepend(
    `<li><a href="${processPath}" class="text-sm !text-gray-600 hover:!text-[#00cfca] transition-colors">Our Process</a></li>`, { html: true }));
  on('[data-mobile-menu] a[href="/sustainability"],[data-mobile-menu] a[href="/sustainability/"]', (el) => el.after(
    `<a class="block py-2 pl-8 pr-4 text-sm !text-gray-700 hover:!text-[#00cfca]" href="${processPath}">Our Process</a>`, { html: true }));
  const { usLocations = {} } = settings;
  set('body', 'data-mewepak-settings', JSON.stringify(settings));
  rewriteContactEmail(rewrite, settings.email);
  if (!settings.email) on('a[href^="mailto:"]', (el) => {
    if (publicMailto.test(el.getAttribute('href'))) el.remove();
  });
  const locations = 'footer ul.space-y-4';
  const { addresses = [], tollFree, frontDesk } = usLocations;
  if (path === '/about-us/global-reach' && (addresses.length || tollFree || frontDesk)) {
    const phones = [['Toll-free', tollFree], ['Front desk', frontDesk]].filter(([,number]) => number);
    on('#company-us-locations', el => el.setInnerContent(
      `${addresses.length ? `<ul>${addresses.map(address => `<li>${encode(address)}</li>`).join('')}</ul>` : ''}
      <div class="company-actions">${phones.map(([label, number]) =>
        `<a class="company-link" href="tel:${usTel(number)}">${label}: ${encode(number)}</a>`).join('')}</div>`, { html: true }));
  }
  for (let i = 0; i < 3; i++) {
    const row = `${locations} > li:nth-child(${i + 1})`;
    if (addresses[i]) text(row + ' > span', addresses[i]);
    else on(row, (el) => el.remove());
  }
  for (const [position, title, number] of [[1, 'Toll-Free', tollFree], [2, 'Front Desk', frontDesk]]) {
    const selector = `footer div.mt-6.space-y-3 > div:nth-child(${position})`;
    if (!number) on(selector, (el) => el.remove());
    else on(selector + ' > span', (el) => el.replace(
      `<a class="!text-sm !text-white/80" href="tel:${usTel(number)}">${title}: ${encode(number)}</a>`, { html: true }));
  }
  const oldContact = [
    ['tel:+8613423118038', settings.phone, 'tel:' + (settings.phone || '').replace(/[^+\d]/g, ''), 'Call Us: ' + settings.phone],
    ['https://wa.me/8613537663353', settings.whatsapp, 'https://wa.me/' + (settings.whatsapp || '').replace(/\D/g, ''), 'WhatsApp: ' + settings.whatsapp],
  ];
  for (const [old, value, href, label] of oldContact) {
    const link = 'a[href="' + old + '"]';
    if (!value) {
      on(link, (el) => el.remove());
      continue;
    }
    set(link, 'href', href);
    text('[data-mewepak-header] ' + link + ' > span', label);
  }
  if (!settings.phone) on('a[href="tel:+86123456789"],a[href="tel:+8612345678"]', (el) => el.remove());
  if (!settings.whatsapp) on('a[href="https://wa.me/86123456789"],a[href="https://wa.me/8612345678"]', (el) => el.remove());
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
  else on('[data-mewepak-header] p.tracking-wide', (el) => el.remove());
  const siteLogo = settings.logo === '/assets/media/2026/06/logo.png' ? '/assets/media/home-thumbs/mewepak-logo-420.webp' : settings.logo;
  if (siteLogo) set('.mewepak-header-logo,.mewepak-footer-logo', 'src', siteLogo);
  else on('.mewepak-header-logo,.mewepak-footer-logo', (el) => el.replace(
    `<span>${encode(settings.name || 'Mewepak')}</span>`, { html: true }));
  if (settings.name) set('.mewepak-header-logo,.mewepak-footer-logo', 'alt', settings.name + ' — Packaging Solutions Provider');
  const pageType = storefrontPageType(url, path);
  const navigationScript = '/assets/original/storefront-navigation.js?v=shared-menu';
  set('script[src="/assets/original/main.js?cms=1"],script[src="/assets/original/main.js"]', 'src', navigationScript);
  set('link[href="/assets/original/custom.css"]', 'href', '/assets/original/custom.css?v=products-grid');
  set('script[src="/assets/client-design/process.js"]', 'src', '/assets/client-design/process.js?v=settings-3');
  set('script[src="/assets/client-design/integration.js?shell=1"]', 'src', '/assets/client-design/integration.js?v=flow-header');
  set('link[href="/assets/site.css"]', 'href', '/assets/site.css?v=flow-header');
  set('script[src="/assets/3d/pouch-viewer.js"]', 'src', '/assets/3d/pouch-interactive.js?v=home-studio');
  if (path === '/contact') set('script[src="/assets/client-design/contact.js"]', 'src', '/assets/client-design/contact.js?v=company-enquiry');
  if (path === '/booking' || path === '/inquiry') {
    const serviceKey = url.searchParams.get('service');
    const marketKey = url.searchParams.get('market');
    const context = [];
    if (Object.hasOwn(solutions, serviceKey)) context.push('Packaging service: ' + solutions[serviceKey].heading);
    if (Object.hasOwn(markets, marketKey)) context.push('Packaging market: ' + markets[marketKey][0]);
    if (context.length) text(path === '/booking' ? '#booking-topic' : '#qt-form textarea[name="notes"]', context.join('\n'));
  }
  if (path === '/inquiry') {
    const format = previewFormats.get(url.searchParams.get('format'));
    if (format) set('#qt-form', 'data-preview-format', format.name);
    set('script[src="/assets/client-design/quote.js"]', 'src', '/assets/client-design/quote.js?v=packaging-2');
  }
  set('link[href="/assets/client-design/home.css"]', 'href', '/assets/client-design/home.css?v=banner-slide');
  set('script[src="/assets/client-design/home.js?shell=1"]', 'src', '/assets/client-design/home.js?v=banner-slide');
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
    const article = el.hasAttribute('data-article-layout');
    if (themedMain || (design && !article && pageType !== 'search' && (design !== 'home' || path === '/'))) return;
    themedMain = true;
    const type = article || (pageType === 'detail' && /(?:^|\s)single-post(?:\s|$)/.test(bodyClass)) ? 'article' : pageType;
    el.setAttribute('data-storefront-page', type);
  });
  on('head', (el) => el.append('<link rel="stylesheet" href="/assets/original/storefront-layout.css?v=flow-header"><script src="/assets/original/storefront-layout.js?v=compact-header" defer></script>', { html: true }));
  on('head', (el) => el.append('<link rel="stylesheet" href="/assets/original/storefront-settings.css"><link rel="stylesheet" href="/assets/original/footer-products.css"><link rel="stylesheet" href="/assets/original/storefront-theme.css"><script src="/assets/storefront-forms.js?v=locale-1" defer></script>', { html: true }));
  const switchPath = path === '/' ? '/' : path + '/';
  const query = ['/contact/', '/inquiry/'].includes(switchPath) ? url.search : '';
  on('head', (el) => el.append('<link rel="stylesheet" href="/assets/language-switch.css?v=1">', { html: true }));
  on('head', (el) => el.append(headerActionsAssets + compactHeaderAssets, { html: true }));
  on('button[aria-label="Language selector"]', (el) => el.replace(languageSwitcher(switchPath, 'en', query), { html: true }));
  if (path === '/') {
    on('head', (el) => el.append('<link rel="stylesheet" href="/assets/3d/pouch-viewer.css?v=packaging-1"><link rel="stylesheet" href="/assets/client-design/home-sections.css?v=home-studio"><script src="/assets/3d/pouch-interactive.js?v=home-studio" defer></script>', { html: true }));
    on('#mw-markets', (el) => el.after(homeFormatSection, { html: true }));
    on('#mw-sustainability', (el) => el.remove());
    on('#mw-contact', (el) => el.before(homeSustainabilitySection + homePreviewSection + (showReviewPreview ? homeReviewsPreview : ''), { html: true }));
    if (showReviewPreview) {
      on('head', (el) => el.append('<script src="/assets/client-design/home-reviews.js?v=1" defer></script>', { html: true }));
    }
    if (!settings.factoryEnabled) {
      on('.hy-factory', (el) => el.remove());
    } else {
      const { video_url: video, poster_url: poster } = settings.factory_tour;
      if (video) {
        on('.hy-video-cover', (el) => el.replace(
          `<video class="hy-video-cover mewepak-factory-video" controls playsinline preload="none" aria-label="Mewepak factory tour" poster="${encode(poster || '/assets/client-design/images/7a70e9c1e5090a83.webp')}" src="${encode(video)}"></video>`, { html: true }));
        text('.hy-video-caption', 'Mewepak factory tour');
      } else if (poster) {
        on('.hy-video-cover .v2-cover-background', (el) => {
          el.removeAttribute('data-asset');
          el.setAttribute('src', poster);
        });
      }
    }
  }
  const defaultModel = models.find((model) => !model.product) || models[0];
  if (path === '/' && defaultModel) set('[data-mewepak-home-3d]', 'data-model-url', defaultModel.url);
  if (categorySlug) {
    const productModel = productSlug && models.find((model) => model.product === productSlug);
    const format = previewFormats.get(categorySlug);
    if (productModel || format) {
      const params = new URLSearchParams(productModel ? { product: productSlug } : { format: format.id });
      const href = '/3d-preview/?' + params + '#packaging-preview';
      const previewLink = '<a class="inline-flex items-center px-4 py-3 !font-semibold !text-[#007f7c]" href="' +
        encode(href) + '">Preview in 3D <span class="ml-2" aria-hidden="true">↗</span></a>';
      let linked = false;
      const selector = productSlug
        ? 'main .mewepak-product-primary-cta'
        : 'main .mewepak-product-category a[href="/contact/"][class~="px-8"]';
      on(selector, (el) => {
        if (linked) return;
        linked = true;
        el.after(previewLink, { html: true });
      });
    }
  }
  if (path === '/3d-preview') {
    const builtIns = [...previewFormats.values()];
    const bespoke = models.filter((model) => model.url !== studioModelUrl).map((model) => ({
      id: model.id, name: model.name, url: model.url, poster: model.poster,
      format: previewFormats.has(model.category) ? model.category
        : previewFormats.has(model.product) ? model.product : '',
      front: model.settings.supports_front_texture !== false,
      back: model.settings.supports_back_texture !== false,
      mirror: true,
    }));
    const catalogue = [...builtIns, ...bespoke];
    const selectedModel = url.searchParams.get('model');
    const selectedProduct = url.searchParams.get('product');
    const productModel = selectedProduct && models.find((model) => model.product === selectedProduct);
    const active = catalogue.find((item) => item.id === selectedModel || item.id === productModel?.id)
      || previewFormats.get(url.searchParams.get('format')) || previewFormats.get(productModel?.category)
      || previewFormats.get(selectedProduct) || builtIns[0];
    const hrefFor = (model) => '/3d-preview/?' +
      new URLSearchParams(previewFormats.has(model.id) ? { format: model.id } : { model: model.id });
    const quoteHref = '/inquiry/' + (active.format ? '?format=' + encodeURIComponent(active.format) : '') + '#quote-request';
    const catalogueWithLinks = catalogue.map((model) => ({ ...model, href: hrefFor(model) }));
    const selector = '.mewepak-3d-container';
    set(selector, 'data-packaging-models', JSON.stringify(catalogueWithLinks));
    set(selector, 'data-active-model', active.id);
    set(selector, 'aria-label', 'Interactive 3D preview — ' + active.name);
    set('[data-preview-quote]', 'href', quoteHref);
    const cards = catalogueWithLinks.map((model) => '<li><a data-packaging-option="' + encode(model.id) + '"' +
      ' href="' + encode(model.href + '#packaging-preview') + '"' + (model.id === active.id ? ' aria-current="true"' : '') +
      '>' + (model.poster ? '<img src="' + encode(model.poster) + '" alt="" width="160" height="110" loading="lazy" decoding="async">' : '') +
      '<span>' + encode(model.name) + '</span></a></li>').join('');
    on('[data-packaging-options]', (el) => el.setInnerContent(cards, { html: true }));
    if (active.poster) on(selector, (el) => el.prepend(
      '<img class="mewepak-3d-poster" data-model-poster src="' + encode(active.poster) + '" alt="' + encode(active.name) + '">', { html: true }));
  }
  const result = rewrite.transform(new Response(response.body, { status: response.status, headers: response.headers }));
  result.headers.set('cache-control', 'no-store');
  result.headers.delete('content-length');
  result.headers.delete('etag');
  return result;
}
