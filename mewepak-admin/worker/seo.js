import { catalogPaths, processPath } from './cms.js';

const privatePaths = /^\/(?:admin|api|assets|search)(?:\/|$)/;
const legacyAliases = new Map([
  ['/wp-sitemap.xml', '/sitemap.xml'],
  ['/sitemap_index.xml', '/sitemap.xml'],
]);

export function seoPolicy(url, env) {
  const production = env.ENVIRONMENT === 'production' &&
    ['mewepak.com', 'www.mewepak.com'].includes(url.hostname);
  const path = url.pathname.replace(/\/{2,}/g, '/').replace(/\/index\.html$/, '/').replace(/\/+$/, '') + '/';
  return {
    origin: production ? 'https://mewepak.com' : url.origin,
    path,
    production,
    noindex: !production || privatePaths.test(path) || url.searchParams.has('s'),
  };
}

export async function seoEndpoint(request, env, database, getAsset) {
  const url = new URL(request.url);
  if (!['GET', 'HEAD'].includes(request.method)) return null;
  const policy = seoPolicy(url, env);
  if (policy.path === '/solutions/') {
    const target = new URL(processPath, policy.origin);
    target.search = url.search;
    return Response.redirect(target, 301);
  }
  const redirect = legacyAliases.get(url.pathname);
  if (redirect) return Response.redirect(new URL(redirect, policy.origin), 301);
  if (url.pathname === '/' || url.pathname === '/index.php') {
    const postId = url.searchParams.get('page_id') || url.searchParams.get('p');
    if (postId && /^\d{1,10}$/.test(postId)) {
      const mappings = await getAsset('/assets/original/wordpress-aliases.json');
      const legacy = mappings.ok ? (await mappings.json())[postId] : null;
      if (legacy) {
        const target = new URL(legacy, policy.origin);
        for (const [name, value] of url.searchParams) {
          if (name !== 'p' && name !== 'page_id') target.searchParams.append(name, value);
        }
        return Response.redirect(target, 301);
      }
    }
  }
  if (url.pathname === '/robots.txt') {
    const exclusions = 'Disallow: /admin/\nDisallow: /api/\n';
    const body = 'User-agent: *\n' + exclusions + (policy.production
      ? '\nUser-agent: OAI-SearchBot\nAllow: /\n' + exclusions + '\nSitemap: ' + policy.origin + '/sitemap.xml\n'
      : '');
    return new Response(request.method === 'HEAD' ? null : body, {
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=300' },
    });
  }
  if (url.pathname !== '/sitemap.xml') return null;
  try {
    const [catalog, baselineResponse, staticRoutes] = await Promise.all([
      catalogPaths(database), getAsset('/assets/original/cms-baseline.json'), getAsset('/assets/original/public-routes.json'),
    ]);
    if (!baselineResponse.ok || !staticRoutes.ok) throw new Error('Route assets unavailable');
    const [baseline, routes] = await Promise.all([baselineResponse.json(), staticRoutes.json()]);
    const sitemapPaths = [...new Set([...catalog, ...routes.filter((path) => !Object.hasOwn(baseline, path))])]
      .filter((path) => !privatePaths.test(path))
      .sort();
    const body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      sitemapPaths.map((path) => `  <url><loc>${new URL(path, policy.origin).href.replace(/&/g, '&amp;')}</loc></url>`).join('\n') + '\n</urlset>\n';
    return new Response(request.method === 'HEAD' ? null : body, {
      headers: {
        'content-type': 'application/xml; charset=utf-8',
        'cache-control': 'public, max-age=300',
        ...(!policy.production && { 'x-robots-tag': 'noindex' }),
      },
    });
  } catch {
    return new Response('Sitemap temporarily unavailable.', { status: 503, headers: { 'retry-after': '60' } });
  }
}

const sections = {
  products: 'Products', markets: 'Markets', solutions: 'Solutions', blog: 'Blog',
  'about-us': 'About Us', 'added-value': 'Added Value', sustainability: 'Sustainability',
};
const summary = 'Mewepak manufactures custom flexible packaging, including printed pouches and roll stock film, for businesses.';
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const text = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const scriptJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

function assetUrl(value, origin) {
  if (typeof value !== 'string' || !/^https:\/\/|^\/(?![\/\\])/i.test(value)) return '';
  try { return new URL(value, origin).href; } catch { return ''; }
}

function excerpt(value) {
  const plain = text(value);
  if (plain.length <= 165) return plain;
  const end = plain.lastIndexOf(' ', 162);
  return plain.slice(0, end > 95 ? end : 162).replace(/[,:;]+$/, '') + '…';
}

export function pageMetadata(policy, defaults, { page, catalog, settings } = {}, head = {}) {
  const { path, origin } = policy;
  const home = origin + '/';
  const url = new URL(path, origin).href;
  const orgId = home + '#organization';
  const siteId = home + '#website';
  const brand = settings?.name || 'Mewepak';
  const row = page?.row || {};
  const local = defaults[path] || {};
  const kind = page?.table || local.kind;
  const name = text(row.title || row.name || local.name || head.title || brand);
  const title = text(head.title || row.seo_title || name);
  const originalDescription = [row.seo_description, head.description].find((value) =>
    text(value) && !/^Explore custom .+ options for brand presentation, product protection, and flexible project requirements\./i.test(text(value)));
  const description = excerpt(originalDescription || local.description || row.short_description ||
    row.excerpt || row.summary || (path === '/' ? summary : ''));
  const image = assetUrl(row.primary_image_url || row.featured_image_url || row.image_url || local.image, origin);
  const logo = assetUrl(settings?.logo || '/assets/media/2026/06/logo.png', origin);
  const siteImage = assetUrl(defaults['/']?.image || logo, origin);
  const organization = {
    '@type': 'Organization', '@id': orgId, name: brand, url: home, logo,
    ...(settings?.email && { email: settings.email }),
    ...(settings?.phone && { telephone: settings.phone }),
  };
  const site = { '@type': 'WebSite', '@id': siteId, name: brand, url: home, publisher: { '@id': orgId }, inLanguage: 'en' };
  const current = {
    '@type': path === '/contact/' ? 'ContactPage' :
      path === '/about-us/' ? 'AboutPage' :
      kind === 'product_categories' || ['/products/', '/markets/', '/blog/'].includes(path) ? 'CollectionPage' : 'WebPage',
    '@id': url + '#webpage', url, name, isPartOf: { '@id': siteId }, inLanguage: 'en',
    ...(description && { description }),
  };
  const graph = [organization, site, current];
  if (path !== '/') {
    const parts = path.split('/').filter(Boolean);
    const routeNames = new Map((catalog || []).map((entry) => [entry.path, entry.row.title || entry.row.name]));
    const route = kind === 'articles' ? [['/blog/', 'Blog']] : parts.slice(0, -1).map((key, i) => {
      const link = '/' + parts.slice(0, i + 1).join('/') + '/';
      return [link, routeNames.get(link) || defaults[link]?.name || sections[key]];
    }).filter(([, label]) => label);
    const crumbs = [['/', 'Home'], ...route, [path, name]];
    const breadcrumbId = url + '#breadcrumb';
    graph.push({ '@type': 'BreadcrumbList', '@id': breadcrumbId, itemListElement: crumbs.map(([link, label], i) => ({
      '@type': 'ListItem', position: i + 1, name: label, item: new URL(link, origin).href,
    })) });
    current.breadcrumb = { '@id': breadcrumbId };
  }
  if (kind === 'products') {
    const id = url + '#product';
    graph.push({ '@type': 'Product', '@id': id, name, url, brand: { '@id': orgId },
      ...(description && { description }), ...(image && { image }) });
    current.mainEntity = { '@id': id };
  } else if (kind === 'articles') {
    const id = url + '#article';
    graph.push({ '@type': 'BlogPosting', '@id': id, headline: name, publisher: { '@id': orgId },
      mainEntityOfPage: { '@id': current['@id'] },
      ...(description && { description }), ...(image && { image }),
      ...(row.published_at && { datePublished: row.published_at }) });
    current.mainEntity = { '@id': id };
  }
  return { title, description, image: image || siteImage, graph, url, brand, isArticle: kind === 'articles' };
}

export async function optimizePageSeo(request, response, env, getAsset, data) {
  if (!response.headers.get('content-type')?.includes('text/html')) return response;
  const policy = seoPolicy(new URL(request.url), env);
  const searchable = response.ok && !privatePaths.test(policy.path) && !new URL(request.url).searchParams.has('s');
  let defaults = {};
  if (searchable && request.method === 'GET') {
    try {
      const file = await getAsset('/assets/original/seo-page-defaults.json');
      if (file.ok) defaults = await file.json();
    } catch { /* CMS and existing page metadata still apply. */ }
  }
  const head = { title: '', description: '' };
  const rewriter = new HTMLRewriter()
    .on('link[rel="canonical"],meta[name="robots"]', { element: (el) => el.remove() });
  if (searchable) {
    rewriter
      .on('title', { text: (chunk) => { head.title += chunk.text; } })
      .on('meta[name="description"]', { element: (el) => {
        head.description ||= el.getAttribute('content') || '';
        el.remove();
      } })
      .on('meta[property^="og:"],meta[name^="twitter:"]', { element: (el) => el.remove() })
      .on('head', { element: (el) => el.onEndTag((end) => {
        const meta = pageMetadata(policy, defaults, data, head);
        const social = {
          'og:title': meta.title, 'og:description': meta.description, 'og:image': meta.image,
          'og:url': meta.url, 'og:site_name': meta.brand, 'og:type': meta.isArticle ? 'article' : 'website',
        };
        const tags = [`<link rel="canonical" href="${escape(meta.url)}">`];
        if (meta.description) tags.push(`<meta name="description" content="${escape(meta.description)}">`);
        for (const [key, value] of Object.entries(social)) {
          if (value) tags.push(`<meta property="${key}" content="${escape(value)}">`);
        }
        tags.push(`<meta name="twitter:card" content="${meta.image ? 'summary_large_image' : 'summary'}">`);
        if (!policy.noindex) tags.push('<meta name="robots" content="index,follow,max-image-preview:large">');
        tags.push(`<script type="application/ld+json">${scriptJson({ '@context': 'https://schema.org', '@graph': meta.graph })}</script>`);
        end.before(tags.join(''), { html: true });
      }) });
  }
  const result = rewriter.transform(response);
  if (policy.noindex) result.headers.set('x-robots-tag', 'noindex, follow');
  return result;
}
