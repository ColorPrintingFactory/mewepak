import { catalogPaths } from './cms.js';

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
    const body = 'User-agent: *\nDisallow: /admin/\nDisallow: /api/\n' +
      (policy.production ? 'Sitemap: ' + policy.origin + '/sitemap.xml\n' : '');
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

export function optimizePageSeo(request, response, env) {
  if (!response.headers.get('content-type')?.includes('text/html')) return response;
  const policy = seoPolicy(new URL(request.url), env);
  const result = new HTMLRewriter()
    .on('link[rel="canonical"]', { element: (el) => el.remove() })
    .on('head', { element: (el) => {
      if (!response.ok || privatePaths.test(policy.path)) return;
      const canonical = new URL(policy.path, policy.origin).href.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
      el.append(`<link rel="canonical" href="${canonical}">`, { html: true });
    } })
    .transform(response);
  if (policy.noindex) result.headers.set('x-robots-tag', 'noindex, follow');
  return result;
}
