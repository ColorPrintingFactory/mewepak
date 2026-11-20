import ui from './i18n/ui.json' with { type: 'json' };
import { compactHeaderAssets } from './compact-header.js';
import bookingUi from './i18n/booking.json' with { type: 'json' };
import pages from './i18n/pages.json' with { type: 'json' };
import formatsCopy from './i18n/formats.json' with { type: 'json' };
import specialist from './i18n/specialist.json' with { type: 'json' };
import marketCopy from './i18n/markets.json' with { type: 'json' };
import marketDetails from './market-detail-content.json' with { type: 'json' };
import { previewFormats } from './preview-formats.js';

const copy = {
  ...pages,
  ...Object.fromEntries(Object.entries(formatsCopy).map(([slug, value]) => ['/products/' + slug + '/', value])),
  ...Object.fromEntries(Object.entries(marketCopy).map(([slug, value]) => ['/markets/' + slug + '/', value])),
  ...specialist,
};
const labels = { en: 'English', ...Object.fromEntries(Object.entries(ui).map(([key, value]) => [key, value.name])) };
const languages = Object.keys(ui);
const logo = '/assets/media/home-thumbs/mewepak-logo-420.webp';
const images = {
  '/': '/assets/client-design/images/8518a408df421d96.webp',
  '/markets/': '/assets/client-design/images/873549651fc1a911.webp',
  '/products/': '/assets/client-design/images/e48dd101819047f6.webp',
  '/markets/coffee-tea/': '/assets/client-design/images/873549651fc1a911.webp',
  '/markets/frozen-food/': '/assets/client-design/images/457e72a2cbb71194.webp',
  '/markets/pet-food/': '/assets/client-design/images/cfcdbd746a6ff3b8.webp',
  '/markets/snacks-sweets/': '/assets/client-design/images/d1b92713ab295161.webp',
  '/solutions/': '/assets/media/solutions/prepress.webp',
  '/solutions/prepress/': '/assets/media/solutions/prepress.webp',
  '/solutions/printing/': '/assets/media/solutions/printing.webp',
  '/solutions/technical/': '/assets/media/solutions/technical.webp',
  '/about-us/quality-certifications/': '/assets/media/about-details/quality-certifications.webp',
  '/sustainability/our-process/': '/assets/client-design/images/e28ba2d410cc1321.webp',
  '/choosing-packaging-for-frozen-chilled-foods/': '/assets/media/blog-covers/choosing-packaging-for-frozen-chilled-foods.webp',
  '/how-to-choose-the-right-barrier-film-for-coffee-packaging/': '/assets/client-design/images/e0e14ec25fe1a893.webp',
};
const nav = {
  en: ['Home','Products','Markets','Solutions','Added Value','Sustainability','Blog','Contact','About Us'],
  de: ['Startseite','Produkte','Branchen','Technik','Projektservice','Nachhaltigkeit','Ratgeber','Kontakt','Über uns'],
  es: ['Inicio','Productos','Sectores','Soluciones','Servicios','Sostenibilidad','Guías','Contacto','Nosotros'],
  fr: ['Accueil','Produits','Secteurs','Solutions','Services','Durabilité','Guides','Contact','À propos'],
  ar: ['الرئيسية','المنتجات','القطاعات','الحلول','الخدمات','الاستدامة','الأدلة','التواصل','عن الشركة'],
};
const mainRoutes = ['/', '/products/', '/markets/', '/solutions/', '/added-value/', '/sustainability/', '/blog/', '/contact/', '/about-us/'];
const childRoutes = (root) => Object.keys(copy).filter((path) => path.startsWith(root) && path !== root);
const marketPages = childRoutes('/markets/');
const formatPages = childRoutes('/products/');
const solutionPages = childRoutes('/solutions/');
const guidePages = ['/choosing-packaging-for-frozen-chilled-foods/', '/how-to-choose-the-right-barrier-film-for-coffee-packaging/'];
const related = {
  '/': ['/markets/coffee-tea/', '/markets/frozen-food/', '/solutions/technical/'],
  '/markets/coffee-tea/': ['/products/flat-bottom-pouch/', '/products/stand-up-pouch/', guidePages[1], '/solutions/prepress/'],
  '/markets/frozen-food/': ['/products/flat-pouch/', '/products/roll-stock-films/', guidePages[0], '/solutions/technical/'],
  '/markets/pet-food/': ['/products/flat-bottom-pouch/', '/products/quad-seal-bag/', '/products/retort-pouch/'],
  '/markets/snacks-sweets/': ['/products/stand-up-pouch/', '/products/flat-pouch/', '/products/shaped-pouch/'],
  '/solutions/prepress/': ['/solutions/printing/', '/products/roll-stock-films/', '/about-us/quality-certifications/'],
  '/solutions/technical/': ['/markets/frozen-food/', '/sustainability/our-process/', '/about-us/quality-certifications/'],
  '/solutions/recycling/': ['/sustainability/', '/sustainability/impact-report/', '/solutions/technical/'],
  '/solutions/retort/': ['/products/retort-pouch/', '/markets/sauce-soup/', '/about-us/quality-certifications/'],
  '/added-value/': ['/added-value/faq/', '/booking/', '/contact/'],
  '/about-us/': ['/about-us/quality-certifications/', '/about-us/global-reach/', '/about-us/impact-report/'],
  '/sustainability/': ['/sustainability/our-process/', '/sustainability/impact-report/', '/solutions/recycling/'],
  '/blog/': guidePages,
  [guidePages[0]]: ['/markets/frozen-food/', '/solutions/technical/', '/products/flat-pouch/'],
  [guidePages[1]]: ['/markets/coffee-tea/', '/products/flat-bottom-pouch/', '/solutions/prepress/'],
};
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const validSlug = /^\/(?:[a-z0-9_-]+\/)*$/;
export const localizedPath = (path, lang) => lang === 'en' ? path : '/' + lang + path;
export const hasLocalizedVersion = (path, lang) => !!copy[path]?.[lang];
const sampleAsset = '/assets/media/packaging-guides/filled-pack-trial-checklist.pdf';
const safeAsset = (value) => typeof value === 'string' && /^\/(?![\/\\])/.test(value) ? value : '';

export function detectLocale(pathname) {
  const match = /^\/(de|es|fr|ar)(?:\/|$)/.exec(pathname);
  if (!match) return null;
  const lang = match[1];
  const path = (pathname.slice(lang.length + 1).replace(/\/+$/, '') || '') + '/';
  return { lang, path, canonicalPath: localizedPath(path, lang) };
}

export function localizedPaths(englishPaths) {
  return englishPaths.flatMap(path => languages.filter(lang => hasLocalizedVersion(path, lang)).map(lang => localizedPath(path, lang)));
}

export function alternateTags(path, origin) {
  const variants = languages.filter(lang => hasLocalizedVersion(path, lang));
  if (!variants.length) return '';
  return ['en', ...variants, 'x-default'].map((lang) =>
    `<link rel="alternate" hreflang="${lang}" href="${escape(origin + localizedPath(path, lang === 'x-default' ? 'en' : lang))}">`
  ).join('');
}

export function languageSwitcher(path, lang = 'en', query = '') {
  const label = lang === 'en' ? 'Choose language' : ui[lang].language;
  const resetText = lang === 'en'
    ? 'Translations of this page are in preparation. The language links open the respective home pages.'
    : ui[lang].switchNote;
  const reset = !languages.some(key => hasLocalizedVersion(path, key));
  return `<details class="mwl-switch" name="mwl-language"><summary aria-label="${escape(label)}"><bdi>${lang.toUpperCase()}</bdi></summary>
    <div class="mwl-switch__panel">
      ${Object.entries(labels).map(([key, name]) => {
        const samePage = key === 'en' || hasLocalizedVersion(path, key);
        const target = samePage ? path : '/';
        return `<a href="${escape(localizedPath(target, key) + (samePage ? query : ''))}" lang="${key}" hreflang="${key}" dir="${key === 'ar' ? 'rtl' : 'ltr'}"${key === lang ? ' aria-current="true"' : ''}>${escape(name)}</a>`;
      }).join('')}
      ${reset ? `<p>${escape(resetText)}</p>` : ''}
    </div></details>`;
}

function photo(path) {
  const [, family, slug] = path.split('/');
  return images[path] || (family === 'markets' ? marketDetails[slug]?.photo
    : family === 'products' ? previewFormats.get(slug)?.poster : '') || '';
}
const titleFor = (path, lang) => copy[path][lang][0];
function cardGrid(paths, lang, available) {
  return `<div class="mwl-card-grid">${paths.filter(path => available.has(path) && hasLocalizedVersion(path, lang)).map((path) => {
    const [title, lead] = copy[path][lang];
    const image = photo(path);
    return `<a class="mwl-card" href="${localizedPath(path,lang)}">
      ${image ? `<img src="${escape(image)}" alt="" loading="lazy" width="520" height="310" decoding="async">` : ''}
      <div><strong>${escape(title)}</strong><p>${escape(lead)}</p></div>
    </a>`;
  }).join('')}</div>`;
}

const contextLabels = { de: 'Anfrageart', es: 'Tipo de solicitud', fr: 'Type de demande', ar: 'نوع الطلب' };

function requestForm(path, lang, url, available) {
  const t = ui[lang];
  const format = url.searchParams.get('format');
  const market = '/markets/' + url.searchParams.get('market') + '/';
  const solution = '/solutions/' + url.searchParams.get('service') + '/';
  const sample = url.searchParams.get('topic') === 'samples';
  const selected = [market, solution].find(key => available.has(key) && hasLocalizedVersion(key, lang));
  const inquiry = path === '/inquiry/' ? t.quote : (sample ? t.samples : t.contact);
  const context = `${contextLabels[lang]}: ${inquiry}${selected ? ' · ' + titleFor(selected,lang) : ''}`;
  const field = (label, name, attributes = '') => `<label>${escape(label)}<input name="${name}" ${attributes}></label>`;
  return `<form class="mwl-form" method="post" action="/api/submissions/quote" id="${path === '/inquiry/' ? 'quote-request' : 'project-enquiry'}"
    data-mewepak-quote data-locale="${lang}" data-form-success="${escape(t.success)}" data-form-failure="${escape(t.failure)}"
    data-form-checking="${escape(t.checking)}" data-form-verification="${escape(t.verification)}">
    <h2>${escape(t.projectTitle)}</h2>
    <input type="hidden" name="product_context" value="${escape(context)}">
    <div class="mwl-form__grid">
      ${field(t.person,'name','required maxlength="120" autocomplete="name"')}
      ${field(t.company,'company','required maxlength="160" autocomplete="organization"')}
      ${field(t.email,'email','type="email" dir="ltr" required maxlength="254" autocomplete="email"')}
      ${field(t.product,'product','required maxlength="150"')}
      <label>${escape(t.format)}<select name="product_type"><option value="other">${escape(t.other)}</option>
        ${formatPages.filter(key=>available.has(key)).map(key => {
          const slug = key.split('/')[2];
          return `<option value="${slug}"${format === slug ? ' selected' : ''}>${escape(titleFor(key,lang))}</option>`;
        }).join('')}
      </select></label>
      ${field(t.quantity,'quantity','maxlength="90" inputmode="numeric"')}
      ${field(t.destination,'destination','maxlength="100" autocomplete="country-name"')}
      <label class="mwl-form__details">${escape(t.details)}<textarea name="details" required maxlength="1800" rows="4" placeholder="${escape(t.projectPlaceholder)}"></textarea></label>
    </div>
    <button type="submit" class="mwl-button">${escape(t.submit)}</button>
    <p class="mwl-form__notice">${escape(t.privacy)}</p>
    <p data-quote-message class="hidden" role="status" aria-live="polite"></p>
  </form>`;
}

function appointmentForm(lang, url) {
  const u = ui[lang];
  const t = bookingUi[lang];
  const context = url.searchParams.get('market');
  const market = context && copy['/markets/' + context + '/']?.[lang]?.[0];
  const field = (label, name, attrs) => `<label>${escape(label)}<input name="${name}" ${attrs}></label>`;
  return `<form class="mwl-form" id="appointment" method="post" action="/api/bookings" data-mewepak-booking
    data-locale="${lang}" data-form-success="${escape(t.success)}" data-form-failure="${escape(t.failure)}"
    data-form-checking="${escape(u.checking)}" data-form-verification="${escape(u.verification)}"
    ${['zone','choose','loading','none','unavailable'].map(key=>`data-${key}="${escape(t[key])}"`).join(' ')}>
    <input type="hidden" name="customer_timezone">
    <div class="mwl-form__grid">
      ${field(t.date,'date','type="date" required')}
      <label>${escape(t.time)}<select name="time" required><option value="">${escape(t.choose)}</option></select></label>
      <p data-slot-zone class="mwl-form__details mwl-form__notice"></p><p data-slot-status class="mwl-form__details" role="status" aria-live="polite"></p>
      <label>${escape(t.type)}<select name="meeting_type" required><option value="video_call">${escape(t.video)}</option><option value="factory_visit">${escape(t.visit)}</option></select></label>
      <label>${escape(t.duration)}<select name="duration" required><option value="">${escape(t.choose)}</option></select></label>
      ${field(u.person,'name','required minlength="2" maxlength="120" autocomplete="name"')}
      ${field(u.company,'company','maxlength="160" autocomplete="organization"')}
      ${field(u.email,'email','type="email" dir="ltr" required maxlength="254" autocomplete="email"')}
      ${field(t.phone,'phone','type="tel" dir="ltr" required minlength="5" maxlength="50" autocomplete="tel"')}
      <label class="mwl-form__details">${escape(t.topic)}<textarea name="topic" rows="3" maxlength="1800">${escape(market||'')}</textarea></label>
    </div>
    <button type="submit" class="mwl-button">${escape(t.submit)}</button>
    <p class="mwl-form__notice">${escape(u.privacy)}</p>
    <p data-booking-message data-quote-message class="hidden" role="status" aria-live="polite"></p>
  </form>`;
}

function pageMarkup({ path, lang, available, origin, url, settings, production }) {
  const t = ui[lang];
  const localized = key => localizedPath(key,lang);
  const query = url.searchParams.get('s')?.trim().slice(0,90) || '';
  const quoteParams = new URLSearchParams();
  if (path.startsWith('/markets/') && path !== '/markets/') quoteParams.set('market',path.split('/')[2]);
  if (path.startsWith('/products/') && path !== '/products/') quoteParams.set('format',path.split('/')[2]);
  if (path.startsWith('/solutions/') && path !== '/solutions/') quoteParams.set('service',path.split('/')[2]);
  const queryString = quoteParams.size ? '?' + quoteParams : '';
  const quoteHref = localized('/inquiry/') + queryString + '#quote-request';
  const sampleHref = localized('/contact/') + (quoteParams.size ? queryString + '&topic=samples' : '?topic=samples') + '#project-enquiry';
  const [title, lead, ...sections] = copy[path][lang];
  const pageTitle = query ? t.results : title;
  const hero = query ? '' : photo(path);
  const customerRequest = path === '/contact/' || path === '/inquiry/';
  const appointment = path === '/booking/';
  const links = mainRoutes.map((key, i) => `<a href="${localized(key)}"${path === key ? ' aria-current="page"' : ''}>${escape(nav[lang][i])}</a>`).join('');
  const heading = (label, list) => `<section class="mwl-block"><h2>${escape(label)}</h2>${cardGrid(list,lang,available)}</section>`;
  const heroText = customerRequest && url.searchParams.get('topic') === 'samples' ? t.samples : pageTitle;
  const textBlocks = sections.flatMap((heading,i) => i % 2 ? [] : [`<section class="mwl-detail"><h2>${escape(heading)}</h2><p>${escape(sections[i+1])}</p></section>`]).join('');
  const languageSuffix = ((customerRequest || appointment) && url.search) || (query ? '?s=' + encodeURIComponent(query) : '');
  const canonical = origin + localized(path);
  const metaTitle = pageTitle + ' | Mewepak';
  const asset = hero || logo;
  const openGraph = `<meta property="og:title" content="${escape(metaTitle)}"><meta property="og:description" content="${escape(lead)}"><meta property="og:url" content="${escape(canonical)}"><meta property="og:image" content="${escape(new URL(asset,origin).href)}"><meta property="og:type" content="website">`;
  const schema = JSON.stringify({ '@context':'https://schema.org','@type':'WebPage', name:title, description:lead, url:canonical, inLanguage:lang, publisher:{'@type':'Organization',name:'Mewepak',url:origin+'/'} }).replace(/</g,'\\u003c');
  const showIndex = production && !url.searchParams.has('s');
  const email = /^[^\s<>"@]+@[^\s<>"@]+\.[^\s<>"@]+$/.test(settings?.email || '') ? settings.email : 'benson@mewepak.com';
  const phone = typeof settings?.phone === 'string' ? settings.phone.replace(/[^+\d]/g,'') : '';
  const normalizeSearch = value => value.normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase(lang);
  const needle = normalizeSearch(query).split(/\s+/);
  const searchResults = query ? Object.keys(copy).filter(key => {
    if (!available.has(key)) return false;
    const content = normalizeSearch(copy[key][lang].join(' '));
    return needle.every(term => content.includes(term));
  }) : [];
  return `<!doctype html><html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(metaTitle)}</title><meta name="description" content="${escape(lead)}">
<link rel="canonical" href="${escape(canonical)}">${query ? '' : alternateTags(path,origin)}
<meta name="robots" content="${showIndex ? 'index,follow,max-image-preview:large' : 'noindex,follow'}">
<link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/assets/language-switch.css?v=1"><link rel="stylesheet" href="/assets/localized-storefront.css?v=1">
${compactHeaderAssets}
${openGraph}<script type="application/ld+json">${schema}</script>
${customerRequest || appointment ? '<script src="/assets/storefront-forms.js?v=locale-1" defer></script>' : ''}
${appointment ? '<script src="/assets/localized-booking.js?v=1" defer></script>' : ''}
</head><body class="mwl-body">
<a class="mwl-skip" href="#content">${escape(t.skip)}</a>
<header class="mwl-header">
  <div class="mwl-utility"><div class="mwl-wrap"><span>${escape(t.factory)}</span><div>
    ${phone ? `<a href="tel:${escape(phone)}" dir="ltr">${escape(settings.phone)}</a>` : ''}
    <a href="mailto:${escape(email)}" dir="ltr">${escape(email)}</a>
  </div></div></div>
  <div class="mwl-headline mwl-wrap">
    <a href="${localized('/')}" class="mwl-brand"><img src="${escape(safeAsset(settings?.logo) || logo)}" alt="Mewepak" width="185" height="62"></a>
    <form role="search" action="${localized('/')}" class="mwl-search"><input type="search" name="s" placeholder="${escape(t.search)}" value="${escape(query)}" aria-label="${escape(t.search)}" maxlength="90"><button aria-label="${escape(t.search)}">⌕</button></form>
    ${languageSwitcher(path,lang,languageSuffix)}
    <a class="mwl-button mwl-head-quote" href="${escape(quoteHref)}">${escape(t.quote)}</a>
    <details class="mwl-mobile-nav" name="mwl-language"><summary aria-label="${escape(t.nav)}">☰</summary><nav aria-label="${escape(t.nav)}">${links}</nav></details>
  </div>
  <nav class="mwl-primary-nav mwl-wrap" aria-label="${escape(t.nav)}">${links}</nav>
</header>
<main id="content" class="mwl-wrap">
  ${path !== '/' ? `<nav class="mwl-crumb" aria-label="${escape(t.overview)}"><a href="${localized('/')}" >${escape(nav[lang][0])}</a><span aria-current="page">${escape(heroText)}</span></nav>` : ''}
  <section class="mwl-hero${hero ? ' mwl-hero--with-image' : ''}">
    <div><h1>${escape(heroText)}</h1>${query ? `<p class="mwl-query"><bdi>${escape(query)}</bdi></p>` : `<p>${escape(lead)}</p>`}
    ${!query && !customerRequest && !appointment ? `<div class="mwl-hero__actions"><a class="mwl-button" href="${escape(quoteHref)}">${escape(t.quote)}</a>
      <a class="mwl-secondary" href="${escape(sampleHref)}">${escape(t.samples)}</a></div>` : ''}
    </div>
    ${hero ? `<img class="mwl-hero-image" src="${escape(hero)}" alt="" width="650" height="450" fetchpriority="high" decoding="async">` : ''}
  </section>
  ${query ? (searchResults.length ? cardGrid(searchResults,lang,available) : `<p>${escape(t.empty)}</p>`) : `
  ${customerRequest ? requestForm(path,lang,url,available) : ''}
  ${appointment ? appointmentForm(lang,url) : ''}
  ${path === '/' || path === '/products/' ? heading(t.formats,path === '/' ? ['/products/stand-up-pouch/','/products/flat-bottom-pouch/','/products/roll-stock-films/'] : formatPages) : ''}
  ${path === '/markets/' ? heading(t.applications,marketPages) : ''}
  ${path === '/solutions/' ? heading(nav[lang][3],solutionPages) : ''}
  ${textBlocks ? `<div class="mwl-details">${textBlocks}
    ${path === '/markets/frozen-food/' || path === '/solutions/technical/' ? `<a class="mwl-secondary" href="${sampleAsset}" download>${escape(t.download)}</a>` : ''}
  </div>` : ''}
  ${path === '/contact/' ? `<p class="mwl-direct"><a href="${localized('/booking/')}">${escape(titleFor('/booking/',lang))}</a> · <a href="mailto:${escape(email)}" dir="ltr">${escape(email)}</a></p>` : ''}
  ${related[path] ? heading(t.related,related[path]) : path.startsWith('/products/') && path !== '/products/' ? heading(t.related,['/products/','/solutions/technical/']) : ''}
  `}
</main>
<footer class="mwl-footer"><div class="mwl-wrap"><a href="${localized('/')}" class="mwl-footer-brand">Mewepak</a>
  <nav aria-label="${escape(t.nav)}">${links}</nav>
  <a href="mailto:${escape(email)}" dir="ltr">${escape(email)}</a>
</div></footer>
</body></html>`;
}

export async function localizedResponse(request, match, { policy, settings, paths }) {
  if (!['GET','HEAD'].includes(request.method)) return new Response(null, { status:405, headers:{allow:'GET, HEAD'} });
  const { lang, path, canonicalPath } = match;
  const url = new URL(request.url);
  const available = new Set(paths);
  if (!validSlug.test(path) || !hasLocalizedVersion(path,lang) || !available.has(path)) {
    const home = localizedPath('/',lang);
    const text = ui[lang];
    return new Response(request.method === 'HEAD' ? null : `<!doctype html><html lang="${lang}"><meta charset="utf-8"><title>404 | Mewepak</title><h1>404</h1><p>${escape(text.empty)}</p><a href="${home}">${escape(nav[lang][0])}</a></html>`,
      { status:404, headers:{'content-type':'text/html; charset=utf-8','x-robots-tag':'noindex'} });
  }
  if (url.pathname !== canonicalPath) {
    url.pathname = canonicalPath;
    return Response.redirect(url,301);
  }
  const headers = { 'content-type':'text/html; charset=utf-8', 'content-language':lang, 'cache-control':'no-store' };
  if (policy.noindex) headers['x-robots-tag'] = 'noindex, follow';
  return new Response(request.method === 'HEAD' ? null : pageMarkup({ path,lang,available,origin:policy.origin,url,settings,production:policy.production }), { headers });
}
