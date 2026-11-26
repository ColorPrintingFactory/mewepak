import { applyRecommendations } from './recommendations.js';
import { applyProcurement } from './procurement.js';
import { renderArticleLayout } from './article-layout.js';
import { renderMarketLayout } from './market-layout.js';
import { renderResourceLayout } from './resource-layout.js';
import { renderSolutionsLayout } from './solutions-layout.js';
import { applyProductDetail, productDetailTemplate } from './product-detail.js';
import { applyHomeProducts, applyCategoryProducts, withoutUnverifiedProducts } from './catalogue-listings.js';
import storefrontChrome from './storefront-chrome.json' with { type: 'json' };

const storefrontHeader = storefrontChrome.header.join('\n');
const storefrontFooter = storefrontChrome.footer.join('\n');

function withStorefrontChrome(asset) {
  if (!asset.ok || !asset.headers.get('content-type')?.includes('text/html')) return asset;
  const result = new HTMLRewriter()
    .on('.wp-site-blocks > header.wp-block-template-part', {
      element: (el) => el.setInnerContent(storefrontHeader, { html: true }),
    })
    .on('.wp-site-blocks > footer.wp-block-template-part, body > footer.wp-block-template-part', {
      element: (el) => el.setInnerContent(storefrontFooter, { html: true }),
    })
    .transform(asset);
  for (const header of ['etag', 'content-length']) result.headers.delete(header);
  return result;
}

const tables = {
  pages: 'slug,title,summary,sections,seo_title,seo_description',
  articles: 'slug,title,excerpt,body,featured_image_url,seo_title,seo_description,published_at',
  product_categories: 'id,slug,name,short_description,image_url,menu_group,menu_order,show_in_menu,seo_title,seo_description',
  products: 'slug,name,short_description,description,primary_image_url,gallery_urls,features,material_options,printing_options,finishing_options,applications,technical_specs,seo_title,seo_description,sort_order,category:product_categories(slug)',
};

export const processPath = '/sustainability/our-process/';

const pathFor = {
  pages: (row) => row.slug === 'home' ? '/' : '/' + row.slug + '/',
  articles: (row) => '/' + row.slug + '/',
  product_categories: (row) => '/products/' + row.slug + '/',
  products: (row) => '/products/' + (row.category?.slug || 'uncategorized') + '/' + row.slug + '/',
};

const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const bullets = (items) => '<ul class="list-disc pl-6 space-y-2">' + items.map((item) => '<li>' + escape(item) + '</li>').join('') + '</ul>';

async function digest(value) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function safeUrl(value) {
  return typeof value === 'string' && (/^\/(?![\\/])/.test(value) || /^https:\/\//i.test(value)) ? value : '';
}

async function sanitize(markup) {
  const allowed = new Set('a article aside b blockquote br button caption circle code col colgroup dd details div dl dt em figcaption figure footer g h1 h2 h3 h4 h5 h6 header hr i img li line mark nav ol p path picture polygon polyline pre rect s section small span strong sub summary sup svg table tbody td th thead tr u ul video source'.split(' '));
  return new HTMLRewriter().on('*', { element(el) {
    if (!allowed.has(el.tagName)) {
      if (/^(script|style|iframe|object|embed|template|form)$/i.test(el.tagName)) el.remove();
      else el.removeAndKeepContent();
      return;
    }
    for (const [name, value] of el.attributes) {
      if (/^(href|src|poster)$/.test(name)) {
        if (!safeUrl(value) && !/^#[\w-]+$/.test(value)) el.removeAttribute(name);
      } else if (!/^(class|id|alt|title|role|width|height|loading|decoding|type|controls|muted|autoplay|loop|playsinline|tabindex|colspan|rowspan|aria-[\w-]+|data-(?:category-gallery(?:-main|-thumb)?|single-gallery(?:-track|-thumb|-next|-prev)?|product-tabs|tab|panel|full-alt)|viewbox|fill|stroke|stroke-width|d|points|cx|cy|r|x|y|x1|x2|y1|y2)$/i.test(name)) {
        el.removeAttribute(name);
      }
    }
  } }).transform(new Response(markup, { headers: { 'content-type': 'text/html; charset=utf-8' } })).text();
}

function renderCards(entries) {
  return entries.map(({ row, path }) => {
    const title = row.name || row.title;
    const image = safeUrl(row.primary_image_url || row.featured_image_url || row.image_url);
    return `<a href="${escape(path)}" class="block border border-gray-200 rounded-xl p-5 !no-underline">${image ? `<img loading="lazy" src="${escape(image)}" alt="" class="w-full h-44 object-contain">` : ''}<h3 class="!text-xl !font-semibold">${escape(title)}</h3><p class="!text-gray-600">${escape(row.short_description || row.excerpt || row.summary)}</p></a>`;
  }).join('');
}

export async function catalogPaths(database) {
  const fields = {
    pages: 'slug',
    articles: 'slug',
    product_categories: 'slug',
    products: 'slug,category:product_categories(slug)',
  };
  const lists = await Promise.all(Object.entries(fields).map(async ([table, select]) => {
    const params = { select, status: 'eq.published' };
    if (table === 'articles') params.published_at = 'lte.' + new Date().toISOString();
    const response = await database(table + '?' + new URLSearchParams(params));
    if (!response.ok) throw new Error('Published content unavailable');
    return (await response.json()).map(pathFor[table]);
  }));
  return lists.flat().filter((path) => /^\/(?:[a-z0-9_-]+\/)*$/i.test(path));
}

export async function serveCms(request, asset, database, getAsset, capturePage) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') + '/';
  if (request.method !== 'GET' || /^\/(admin|assets)(\/|$)/.test(path) || /\.[a-z0-9]+\/$/i.test(path)) return asset;
  asset = withStorefrontChrome(asset);
  if (/^\/(booking|3d-preview)\/$/.test(path)) return asset;
  if (asset.ok && !asset.headers.get('content-type')?.includes('text/html')) return asset;
  try {
    const [lists, base] = await Promise.all([Promise.all(Object.entries(tables).map(async ([table, select]) => {
      const params = { select, status: 'eq.published', order: table === 'product_categories' ? 'menu_order.asc,slug.asc' : 'slug.asc' };
      if (table === 'articles') params.published_at = 'lte.' + new Date().toISOString();
      const response = await database(table + '?' + new URLSearchParams(params));
      if (!response.ok) throw new Error('Published content unavailable');
      return (await response.json()).map((row) => ({ table, row, path: pathFor[table](row) }));
    })), getAsset('/assets/original/cms-baseline.json')]);
    const entries = lists.flat();
    const entry = entries.find((candidate) => candidate.path === path);
    if (!base.ok) return withoutUnverifiedProducts(path, asset);
    const baseline = await base.json();
    if (!entry && baseline[path]) return new Response('Page not found.', { status: 404 });
    const isSearch = path.startsWith('/search/') || (path === '/' && url.searchParams.has('s'));
    if (!asset.ok && !entry && !isSearch) return asset;
    const product = entry?.table === 'products';
    const template = product && path !== productDetailTemplate
      ? withStorefrontChrome(await getAsset(productDetailTemplate))
      : asset;
    const productDetail = product && template.ok;
    const source = productDetail ? template : asset.ok ? asset : withStorefrontChrome(await getAsset('/'));
    if (!source.ok) return asset;
    const rewriter = new HTMLRewriter();
    const edit = (selector, handler) => rewriter.on(selector, { element: handler });
    const replace = (selector, value) => edit(selector, (el) => el.setInnerContent(value));
    const replaceHtml = (selector, value) => edit(selector, (el) => el.setInnerContent(value, { html: true }));
    const previous = baseline[path] || {};
    const row = entry?.row;
    const publishedPaths = new Set(entries.map((item) => item.path));
    const sections = Array.isArray(row?.sections) ? row.sections : [];
    const choices = sections.find((section) => section.type === 'recommended_formats')?.slugs;
    const categories = entries.filter((item) => item.table === 'product_categories').map((item) => item.row);
    applyRecommendations(path, edit, publishedPaths, baseline);

    if (path === '/') {
      if (!url.searchParams.has('s')) applyHomeProducts({ edit, replace, replaceHtml, entries, baseline, escape, safeUrl });
      const slides = sections.find((section) => section.type === 'home_banners')?.slides;
      if (Array.isArray(slides)) {
        const banners = slides.slice(0, 4).map((slide) => ({
          ...Object.fromEntries(['name', 'kicker', 'title', 'accent', 'description'].map((field) =>
            [field, typeof slide?.[field] === 'string' ? slide[field].trim().slice(0, 250) : ''])),
          photos: Array.isArray(slide?.photos) ? slide.photos.slice(0, 3).map((src) => safeUrl(src)) : [],
        }));
        edit('#mewepak-homepage', (el) => el.setAttribute('data-hero-overrides', JSON.stringify(banners)));
        const first = banners[0];
        first?.photos.forEach((src, i) => {
          if (src) edit(`img[data-hero-shot="${i}"]`, (el) => el.setAttribute('src', src));
        });
        if (first?.kicker) replace('#v2-hero-kicker', first.kicker);
        if (first?.description) replace('#v2-hero-description', first.description);
      }
    }
    edit('a[href]', (el) => {
      const href = el.getAttribute('href');
      if (!href.startsWith('/') || href.startsWith('//')) return;
      const target = href.split(/[?#]/)[0].replace(/\/+$/, '') + '/';
      if (baseline[target] && !publishedPaths.has(target) && !['/booking/', '/3d-preview/'].includes(target)) el.remove();
    });
    if (path === '/contact/' || path === '/inquiry/') {
      edit('main form[data-mewepak-quote]', (el) => el.before('<p class="mb-5"><a href="/booking/" class="!font-semibold !text-[#007f7c]">Book a packaging consultation</a></p>', { html: true }));
    }
    if (path === '/') {
      edit('main a[href="#viewer"]', (el) => el.after('<a href="/3d-preview/" class="inline-flex px-4 py-3 !font-semibold !text-[#007f7c]">Open 3D Preview</a>', { html: true }));
    }
    if (row) {
      const title = row.title || row.name;
      if ((productDetail && path !== productDetailTemplate) || row.seo_title !== previous.seo_title || title !== previous.title) {
        replace('title', row.seo_title || title);
      }
      const description = (row.seo_description || row.short_description || row.excerpt || row.summary || '').trim();
      if (description) {
        edit('meta[name="description"]', (el) => el.remove());
        edit('meta[property="og:description"]', (el) => el.setAttribute('content', description));
        edit('head', (el) => el.append(`<meta name="description" content="${escape(description)}">`, { html: true }));
      } else if (!asset.ok) {
        edit('meta[name="description"],meta[property="og:description"]', (el) => el.remove());
      }
      if (title !== previous.title && asset.ok && path !== '/' && entry.table !== 'articles' && !productDetail) {
        let headingUpdated = false;
        edit('main h1', (el) => {
          if (headingUpdated) return;
          headingUpdated = true;
          el.setInnerContent(title);
        });
      }
      const pageBody = sections.find((section) => section.type === 'rendered_page')?.html;
      const market = entry.table === 'pages' && /^\/markets\/[a-z-]+\/$/.test(path)
        && typeof pageBody !== 'string'
        ? renderMarketLayout({ entry, categories, choices, baseline, publishedPaths, escape })
        : null;
      const solution = entry.table === 'pages' && typeof pageBody !== 'string' && path.startsWith('/solutions/')
        ? renderSolutionsLayout({ entry, previous, publishedPaths, escape, processPath })
        : null;
      const resource = !solution && !market && entry.table === 'pages' && typeof pageBody !== 'string'
        ? await renderResourceLayout({ entry, previous, escape, getAsset })
        : null;
      if (solution || market || resource) {
        edit('head', (el) => el.append('<link rel="stylesheet" href="/assets/original/packaging-pages.css?v=buyers-1">', { html: true }));
      }
      if (solution) {
        if (row.seo_title) replace('title', row.seo_title);
        edit('head', (el) => el.append('<link rel="stylesheet" href="/assets/original/solutions-layout.css?v=solution-buyers">', { html: true }));
        if (path === '/solutions/prepress/') {
          edit('head', (el) => el.append('<link rel="stylesheet" href="/assets/image-magnifier.css"><script type="module" src="/assets/image-magnifier.js"></script>', { html: true }));
        }
        if (path === '/solutions/') {
          edit('#mewepak-homepage.process-page', (el) => el.removeAndKeepContent());
          edit('link[href="/assets/client-design/process.css"]', (el) => el.remove());
        }
        edit('main', (el) => {
          el.removeAttribute('data-client-page');
          el.setAttribute('data-solutions-layout', '');
          el.setInnerContent(solution, { html: true });
        });
      } else if (market) {
        edit('head', (el) => el.append('<link rel="stylesheet" href="/assets/original/market-layout.css?v=flow-header">', { html: true }));
        edit('main', (el) => {
          el.setAttribute('data-market-layout', '');
          el.setInnerContent(market, { html: true });
        });
      } else if (resource) {
        edit('head', (el) => el.append('<link rel="stylesheet" href="/assets/original/resource-centre.css?v=resource-depth">', { html: true }));
        if (resource.isLibrary) {
          edit('head', (el) => el.append('<script src="/assets/client-design/resource-library.js?v=resource-depth" defer></script>', { html: true }));
        }
        if (resource.isLca) {
          edit('head', (el) => el.append('<link rel="stylesheet" href="/assets/client-design/sustainability.css"><script src="/assets/client-design/sustainability.js?v=resource-depth" defer></script>', { html: true }));
        }
        edit('main', (el) => {
          el.setAttribute('data-resource-layout', '');
          el.setInnerContent(resource.html, { html: true });
        });
      } else if (typeof pageBody === 'string') {
        replaceHtml('main', await sanitize(pageBody));
      }
      if (entry.table === 'articles' && asset.ok && await digest(row.body) !== previous.body_hash) {
        const body = await sanitize(row.body);
        edit('main .entry-content > *:not(.mewepak-article-related):not(.mw-article-related):not(.mewepak-article-cta):not(.mewepak-author)', (el) => el.remove());
        edit('main .entry-content', (el) => el.prepend(`<div class="mewepak-prose" data-article-body>${body}</div>`, { html: true }));
      }
      if (productDetail) await applyProductDetail({ entry, entries, previous, edit, replace, replaceHtml, escape, safeUrl, sanitize, digest });
      if (entry.table === 'product_categories' && asset.ok) {
        applyCategoryProducts({ entry, entries, replace, replaceHtml, safeUrl, escape });
        if (row.short_description !== previous.short_description) replace('main h1 ~ p', row.short_description);
        const image = safeUrl(row.image_url);
        if (image && image !== previous.image_url) {
          edit('[data-category-gallery-main], [data-category-gallery-thumb].is-active img', (el) => {
            el.setAttribute('src', image);
            el.removeAttribute('srcset');
          });
          edit('[data-category-gallery-thumb].is-active', (el) => el.setAttribute('data-full-src', image));
        }
      }
      if (entry.table === 'articles') {
        const article = renderArticleLayout({ entry, entries, baseline, escape, safeUrl });
        edit('head', (el) => el.append('<link rel="stylesheet" href="/assets/original/article-layout.css?v=compact-header">', { html: true }));
        edit('main', (el) => el.setAttribute('data-article-layout', ''));
        if (asset.ok) {
          edit('main > div.bg-gray-50:first-child', (el) => el.replace(article.breadcrumbs, { html: true }));
          edit('main > .wp-block-cover', (el) => el.replace(article.hero, { html: true }));
          edit('main > .wp-block-columns > .wp-block-column:nth-child(2)', (el) => el.replace(article.sidebar, { html: true }));
          edit('main .mewepak-lede, main > .wp-block-columns > .wp-block-column:first-child > .wp-block-separator', (el) => el.remove());
          edit('main .mewepak-article-related, main .mw-article-related, main .mewepak-article-cta', (el) => el.remove());
          edit('body > .wp-block-group.alignfull.has-surface-background-color', (el) => el.remove());
          edit('main', (el) => el.append(article.footer, { html: true }));
        } else {
          const body = await sanitize(row.body || '');
          replaceHtml('main', article.breadcrumbs + article.hero + `<div class="mw-article-body"><div class="mewepak-prose entry-content">${body}</div>${article.sidebar}</div>` + article.footer);
        }
      }
      if (!asset.ok && !productDetail && !market && !solution && typeof pageBody !== 'string' && !isSearch && entry.table !== 'articles') {
        const body = await sanitize(row.body || row.description || '');
        const images = [...new Set([row.primary_image_url || row.featured_image_url || row.image_url, ...(row.gallery_urls || [])].map(safeUrl).filter(Boolean))];
        const gallery = images.map((src) => `<img class="w-full h-64 object-contain" src="${escape(src)}" alt="${escape(title)}">`).join('');
        const fields = [['features', 'Features'], ['material_options', 'Materials'], ['printing_options', 'Printing and finishing'], ['applications', 'Applications']];
        const specifications = fields.filter(([key]) => row[key]?.length).map(([key, label]) => `<h2>${label}</h2>${bullets(row[key])}`).join('');
        const inquiry = entry.table === 'products' ? `<a href="/inquiry/?product=${encodeURIComponent(title)}#quote-request">Request a Quote</a>` : '';
        replaceHtml('main', `<section class="max-w-7xl mx-auto px-6 py-16 mewepak-prose"><h1>${escape(title)}</h1><p>${escape(row.short_description || row.excerpt || row.summary)}</p><div class="grid md:grid-cols-3 gap-5">${gallery}</div>${body}${specifications}${inquiry}</section>`);
      }
    }
    applyProcurement(path, edit, replace, entry, entries, publishedPaths, baseline, escape);
    if (path === '/' || path === '/blog/') {
      const articles = new Map(entries.filter(({ table }) => table === 'articles').map(({ row }) => [row.slug, row]));
      edit('main article[data-article-slug]', (el) => {
        const article = articles.get(el.getAttribute('data-article-slug'));
        if (!article) return el.remove();
        if (path === '/') {
          el.setAttribute('data-search', article.title);
        }
      });
      for (const article of articles.values()) {
        const { slug, title, excerpt } = article;
        if (!/^[a-z0-9_-]+$/i.test(slug)) continue;
        const href = '/' + slug + '/';
        const card = `main article[data-article-slug="${slug}"]`;
        if (path === '/') {
          replace(card + ' .mw-blog-content h3', title);
          edit(card + ' .mw-read', (el) => {
            if (excerpt) el.setAttribute('aria-description', excerpt);
          });
        } else {
          replace(card + ' h2 > a, ' + card + ' h3 > a', title);
          const summary = (excerpt || '').trim();
          const blurb = summary.length > 176 ? summary.slice(0, 176).replace(/\s+\S*$/, '') + '…' : summary;
          replace(card + ' > p, ' + card + ' .in-feature-copy > p', blurb);
        }
        edit(card + ' a[aria-label]', (el) => el.setAttribute('aria-label', 'Read ' + title));
        const image = safeUrl(article.featured_image_url);
        edit(card + ' img', (el) => {
          el.setAttribute('alt', '');
          if (image && image !== baseline[href]?.featured_image_url) {
            el.setAttribute('src', image);
            el.removeAttribute('srcset');
            el.removeAttribute('data-asset');
          }
        });
      }
    }
    if (isSearch) {
      const keyword = (url.searchParams.get('s') ?? decodeURIComponent(path.slice(8, -1).replaceAll('+', ' '))).trim().slice(0, 120);
      const words = keyword.toLowerCase().trim().split(/\s+/).filter(Boolean);
      const matches = words.length ? entries.filter(({ row }) => words.every((word) => [row.name, row.title, row.short_description, row.excerpt, row.summary].join(' ').toLowerCase().includes(word))) : [];
      replace('title', 'Search | Mewepak');
      const title = keyword ? `Search results for “${escape(keyword)}”` : 'Search packaging and resources';
      const empty = keyword ? 'No matching pages or products. Try a packaging format or a shorter search.' : 'Enter a product, packaging format or topic.';
      replaceHtml('main', `<section class="storefront-search max-w-7xl mx-auto px-6 py-16"><h1>${title}</h1>
        <form role="search" aria-label="Search Mewepak" action="/" method="get">
          <input type="search" name="s" value="${escape(keyword)}" maxlength="120" aria-label="Search products and resources" required>
          <button type="submit">Search</button>
        </form>
        ${matches.length ? `<div class="grid md:grid-cols-3 gap-5 mt-8">${renderCards(matches)}</div>`
          : `<p>${empty}</p><a href="/products/">Browse packaging formats</a>`}
      </section>`);
    } else if (path === '/blog/') {
      const articles = entries.filter(({ table }) => table === 'articles');
      edit('#in-grid[data-featured-articles]', (el) => {
        const featured = new Set(el.getAttribute('data-featured-articles').split(' '));
        for (const { row, path: href } of articles) {
          if (featured.has(href)) continue;
          const image = safeUrl(row.featured_image_url);
          const media = image ? `<a class="in-card-media" href="${escape(href)}" aria-label="Read ${escape(row.title)}"><img src="${escape(image)}" alt="" loading="lazy" decoding="async"></a>` : '';
          el.append(`<article class="in-card" data-article="${escape(row.slug)}">${media}<h3><a href="${escape(href)}">${escape(row.title)}</a></h3><p>${escape(row.excerpt || '')}</p><a class="in-read" href="${escape(href)}">Read guide <span aria-hidden="true">↗</span></a></article>`, { html: true });
        }
      });
    } else if (path === '/products/' || (entry?.table === 'product_categories' && !asset.ok)) {
      const existing = new Set(Object.keys(baseline));
      const newEntries = entries.filter((item) => !existing.has(item.path) && (
        path === '/products/' ? ['product_categories', 'products'].includes(item.table)
          : item.table === 'products' && item.row.category?.slug === row.slug
      ));
      if (newEntries.length) edit('main', (el) => el.append(`<div class="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-5">${renderCards(newEntries)}</div>`, { html: true }));
    }
    edit('script[src="/assets/original/runtime-data.js"]', (el) => {
      if (path === '/') el.setAttribute('defer', '');
      el.after(`<script src="/api/frontend-navigation"${path === '/' ? ' defer' : ''}></script>`, { html: true });
    });
    edit('script[src="/assets/original/main.js"]', (el) => {
      el.setAttribute('src', '/assets/original/main.js?cms=1');
      if (path === '/') el.setAttribute('defer', '');
    });
    capturePage?.(entry, entries, previous);
    const result = rewriter.transform(new Response(source.body, { status: 200, headers: source.headers }));
    result.headers.set('cache-control', 'no-store');
    result.headers.delete('etag');
    result.headers.delete('content-length');
    return result;
  } catch {
    return withoutUnverifiedProducts(path, asset);
  }
}

export async function frontendNavigation(database) {
  const response = await database('product_categories?select=slug,name,short_description,image_url,menu_group&status=eq.published&show_in_menu=eq.true&order=menu_order.asc,slug.asc');
  if (!response.ok) return new Response('', { status: 503 });
  const categories = await response.json();
  const source = `(function (rows) {
    var data = window.mewepakProductsMenuData;
    if (!data || !data.groups) return;
    var original = Object.values(data.groups).flatMap(function(group) { return group.items; });
    var originalsByPath = Object.fromEntries(original.map(function(item) { return [item.path.replace(/\\/+$/, ''), item]; }));
    var images = {};
    Object.values(data.groups).forEach(function(group) { group.items = []; });
    rows.forEach(function(row) {
      if (!data.groups[row.menu_group]) return;
      var path = '/products/' + row.slug;
      var old = originalsByPath[path] || {};
      var image = /^\\/(?![\\\\/])|^https:\\/\\//i.test(row.image_url) ? row.image_url : old.image;
      var entry = Object.assign({}, old, {path:path, label:row.name, description:row.short_description, image:image || '/assets/media/2026/06/logo.png'});
      data.groups[row.menu_group].items.push(entry);
      images[path] = entry;
    });
    window.mewepakMenuCategoryImages = images;
  })(${JSON.stringify(categories).replace(/</g, '\\u003c')});`;
  return new Response(source, { headers: { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
}