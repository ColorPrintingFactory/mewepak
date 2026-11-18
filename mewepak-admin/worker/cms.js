const tables = {
  pages: 'slug,title,summary,sections,seo_title,seo_description',
  articles: 'slug,title,excerpt,body,featured_image_url,seo_title,seo_description',
  product_categories: 'id,slug,name,short_description,image_url,menu_group,menu_order,show_in_menu,seo_title,seo_description',
  products: 'slug,name,short_description,description,primary_image_url,gallery_urls,features,material_options,printing_options,applications,seo_title,seo_description,category:product_categories(slug)',
};

const pathFor = {
  pages: (row) => row.slug === 'home' ? '/' : '/' + row.slug + '/',
  articles: (row) => '/' + row.slug + '/',
  product_categories: (row) => '/products/' + row.slug + '/',
  products: (row) => '/products/' + (row.category?.slug || 'uncategorized') + '/' + row.slug + '/',
};

const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

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
      } else if (!/^(class|id|alt|title|role|width|height|loading|decoding|type|controls|muted|autoplay|loop|playsinline|tabindex|colspan|rowspan|aria-[\w-]+|viewbox|fill|stroke|stroke-width|d|points|cx|cy|r|x|y|x1|x2|y1|y2)$/i.test(name)) {
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

export async function serveCms(request, asset, database, getAsset) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '') + '/';
  if (request.method !== 'GET' || /^\/(admin|booking|3d-preview|assets)(\/|$)/.test(path) || /\.[a-z0-9]+\/$/i.test(path)) return asset;
  if (asset.ok && !asset.headers.get('content-type')?.includes('text/html')) return asset;
  try {
    const lists = await Promise.all(Object.entries(tables).map(async ([table, select]) => {
      const response = await database(table + '?' + new URLSearchParams({ select, status: 'eq.published', order: table === 'product_categories' ? 'menu_order.asc,slug.asc' : 'slug.asc' }));
      if (!response.ok) throw new Error('Published content unavailable');
      return (await response.json()).map((row) => ({ table, row, path: pathFor[table](row) }));
    }));
    const entries = lists.flat();
    const entry = entries.find((candidate) => candidate.path === path);
    const base = await getAsset('/assets/original/cms-baseline.json');
    if (!base.ok) return asset;
    const baseline = await base.json();
    if (!entry && baseline[path]) return new Response('Page not found.', { status: 404 });
    const isSearch = path.startsWith('/search/') || (path === '/' && url.searchParams.has('s'));
    if (!asset.ok && !entry && !isSearch) return asset;
    const source = asset.ok ? asset : await getAsset('/');
    if (!source.ok) return asset;
    const rewriter = new HTMLRewriter();
    const edit = (selector, handler) => rewriter.on(selector, { element: handler });
    const replace = (selector, value) => edit(selector, (el) => el.setInnerContent(value));
    const replaceHtml = (selector, value) => edit(selector, (el) => el.setInnerContent(value, { html: true }));
    const previous = baseline[path] || {};
    const row = entry?.row;
    if (row) {
      const title = row.title || row.name;
      if (row.seo_title !== previous.seo_title || title !== previous.title) replace('title', row.seo_title || title);
      if (row.seo_description && row.seo_description !== previous.seo_description) {
        edit('meta[name="description"],meta[property="og:description"]', (el) => el.setAttribute('content', row.seo_description));
        edit('head', (el) => el.append(`<meta name="description" content="${escape(row.seo_description)}">`, { html: true }));
        edit('meta[name="description"]', (el) => el.remove());
      }
      if (title !== previous.title && asset.ok && path !== '/') {
        let headingUpdated = false;
        edit('main h1', (el) => {
          if (headingUpdated) return;
          headingUpdated = true;
          el.setInnerContent(title);
        });
      }
      const pageBody = row.sections?.find((section) => section.type === 'rendered_page')?.html;
      if (typeof pageBody === 'string') replaceHtml('main', await sanitize(pageBody));
      if (entry.table === 'articles' && asset.ok && await digest(row.body) !== previous.body_hash) {
        replaceHtml('.entry-content', await sanitize(row.body));
      }
      if (entry.table === 'products' && asset.ok) {
        if (row.short_description !== previous.short_description) replace('main h1 ~ p', row.short_description);
        if (row.description && await digest(row.description) !== previous.description_hash) {
          const html = await sanitize(row.description);
          edit('main', (el) => el.append(`<section class="max-w-7xl mx-auto p-6 mewepak-prose">${html}</section>`, { html: true }));
        }
        const image = safeUrl(row.primary_image_url);
        if (image && image !== previous.primary_image_url) edit('[data-single-gallery-track] > div:first-child img,[data-product-zoom-preview],[data-single-gallery-thumb="0"] img', (el) => el.setAttribute('src', image));
      }
      if (entry.table === 'product_categories' && asset.ok) {
        if (row.short_description !== previous.short_description) replace('main h1 ~ p', row.short_description);
        const image = safeUrl(row.image_url);
        if (image && image !== previous.image_url) edit('[data-category-gallery-main]', (el) => el.setAttribute('src', image));
      }
      const featured = safeUrl(row.featured_image_url);
      if (featured && featured !== previous.featured_image_url) edit('.wp-block-post-featured-image img,.entry-content ~ img', (el) => {
        el.setAttribute('src', featured);
        el.removeAttribute('srcset');
      });
      if (!asset.ok && typeof pageBody !== 'string' && !isSearch) {
        const body = await sanitize(row.body || row.description || '');
        replaceHtml('main', `<section class="max-w-7xl mx-auto px-6 py-16 mewepak-prose"><h1>${escape(title)}</h1>${renderCards([entry])}${body}</section>`);
      }
    }
    if (isSearch) {
      const keyword = url.searchParams.get('s') ?? decodeURIComponent(path.slice(8, -1).replaceAll('+', ' '));
      const words = keyword.toLowerCase().trim().split(/\s+/).filter(Boolean);
      const matches = words.length ? entries.filter(({ row }) => words.every((word) => [row.name, row.title, row.short_description, row.excerpt, row.summary].join(' ').toLowerCase().includes(word))) : [];
      replace('title', 'Search | Mewepak');
      replaceHtml('main', `<section class="max-w-7xl mx-auto px-6 py-16"><h1>Search results for ${escape(keyword)}</h1><div class="grid md:grid-cols-3 gap-5 mt-8">${renderCards(matches) || '<p>No matching pages or products.</p>'}</div></section>`);
    } else if (path === '/products/' || path === '/blog/' || entry?.table === 'product_categories') {
      const existing = new Set(Object.keys(baseline));
      const newEntries = entries.filter((item) => !existing.has(item.path) && (
        path === '/products/' ? ['product_categories', 'products'].includes(item.table)
          : path === '/blog/' ? item.table === 'articles' : item.table === 'products' && item.row.category?.slug === row.slug
      ));
      if (newEntries.length) edit('main', (el) => el.append(`<div class="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-5">${renderCards(newEntries)}</div>`, { html: true }));
    }
    edit('script[src="/assets/original/runtime-data.js"]', (el) => {
      el.after(`<script src="/api/frontend-navigation"></script>`, { html: true });
    });
    edit('script[src="/assets/original/main.js"]', (el) => el.setAttribute('src', '/assets/original/main.js?cms=1'));
    const result = rewriter.transform(new Response(source.body, { status: 200, headers: source.headers }));
    result.headers.set('cache-control', 'no-store');
    result.headers.delete('etag');
    result.headers.delete('content-length');
    return result;
  } catch {
    return asset;
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
