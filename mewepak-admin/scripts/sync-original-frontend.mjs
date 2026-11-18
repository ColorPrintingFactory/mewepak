import { mkdir, copyFile, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const sourceOrigin = 'https://yizbookwp-qfcmw-studio.wp.build';
const projectRoot = path.resolve(import.meta.dirname, '..');
const publicRoot = path.join(projectRoot, 'public');
const originalAssets = path.join(publicRoot, 'assets', 'original');
const localMediaRoot = path.join(publicRoot, 'assets', 'media');

const sitemapPaths = [
  '/wp-sitemap-posts-page-1.xml',
  '/wp-sitemap-posts-post-1.xml',
  '/wp-sitemap-posts-product-1.xml',
  '/wp-sitemap-taxonomies-product_cat-1.xml',
  '/wp-sitemap-taxonomies-category-1.xml',
];

const excludedRoutes = new Set([
  '/admin/', '/booking/', '/3d-preview/', '/sample-page/', '/shop/', '/cart/', '/checkout/', '/my-account/',
]);

const additionalRoutes = [
  '/products/flat-bottom-pouch/',
  '/products/spout-pouch/',
  '/products/quad-seal-bag/',
  '/products/retort-pouch/',
  '/products/roll-stock-films/',
  '/products/stand-up-pouch-tap/',
  '/products/bag-in-box/',
  '/products/flat-pouch/',
  '/products/shaped-pouch/',
  '/products/pinch-bottom-pouches/',
  '/products/polybag/',
];

const localStyles = new Map([
  ['mewepak-3d-preview-css', '/assets/3d/pouch-viewer.css'],
  ['mewepak-tailwind-css', '/assets/original/tailwind.css'],
  ['mewepak-custom-css', '/assets/original/custom.css'],
  ['woocommerce-blocktheme-css', '/assets/original/woocommerce-blocktheme.css'],
  ['woocommerce-layout-css', '/assets/original/woocommerce-layout.css'],
  ['woocommerce-smallscreen-css', '/assets/original/woocommerce-smallscreen.css'],
  ['woocommerce-general-css', '/assets/original/woocommerce.css'],
  ['wc-blocks-style-css', '/assets/original/wc-blocks.css'],
  ['fluent-form-styles-css', '/assets/original/fluent-forms-public.css'],
  ['fluentform-public-default-css', '/assets/original/fluentform-public-default.css'],
]);

const allowedScripts = new Map([
  ['mewepak-three-js', '/assets/3d/three.min.js'],
  ['mewepak-orbit-controls-js', '/assets/3d/OrbitControls.js'],
  ['mewepak-gltf-loader-js', '/assets/3d/GLTFLoader.js'],
  ['mewepak-home-viewer-js', '/assets/3d/home-viewer.js'],
  ['mewepak-main-js', '/assets/original/main.js'],
]);

function decodeXml(value) {
  return value.replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>');
}

function normalizeRoute(urlValue) {
  const url = new URL(urlValue, sourceOrigin);
  if (url.origin !== sourceOrigin) return null;
  let route = url.pathname || '/';
  if (!route.endsWith('/') && !path.posix.extname(route)) route += '/';
  if (route.startsWith('/wp-') || route.includes('/feed/') || route === '/feed/' || route === '/comments/') return null;
  if (excludedRoutes.has(route)) return null;
  return route;
}

function outputFileForRoute(route) {
  if (route === '/') return path.join(publicRoot, 'index.html');
  return path.join(publicRoot, route.replace(/^\/+|\/+$/g, ''), 'index.html');
}

function rewriteStylesheets(html) {
  return html.replace(/<link\b[^>]*rel=['"]stylesheet['"][^>]*>/gi, (tag) => {
    const id = tag.match(/\bid=['"]([^'"]+)['"]/i)?.[1] || '';
    const href = tag.match(/\bhref=['"]([^'"]+)['"]/i)?.[1] || '';
    let replacement = localStyles.get(id);
    if (!replacement) {
      if (href.includes('/themes/mewepak-fse/assets/css/tailwind.css')) replacement = '/assets/original/tailwind.css';
      else if (href.includes('/themes/mewepak-fse/assets/css/custom.css')) replacement = '/assets/original/custom.css';
      else if (href.includes('/mewepak-3d-preview/assets/css/pouch-viewer.css')) replacement = '/assets/3d/pouch-viewer.css';
    }
    return replacement ? `<link rel="stylesheet" id="${id || 'mewepak-local-style'}" href="${replacement}">` : '';
  });
}

function rewriteScripts(html) {
  return html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (tag, attributes, body) => {
    const id = attributes.match(/\bid=['"]([^'"]+)['"]/i)?.[1] || '';
    const src = attributes.match(/\bsrc=['"]([^'"]+)['"]/i)?.[1] || '';
    if (src) {
      let replacement = allowedScripts.get(id);
      if (!replacement) {
        if (src.includes('/mewepak-3d-preview/assets/js/three.min.js')) replacement = '/assets/3d/three.min.js';
        else if (src.includes('/mewepak-3d-preview/assets/js/OrbitControls.js')) replacement = '/assets/3d/OrbitControls.js';
        else if (src.includes('/mewepak-3d-preview/assets/js/GLTFLoader.js')) replacement = '/assets/3d/GLTFLoader.js';
        else if (src.includes('/mewepak-3d-preview/assets/js/home-viewer.js')) replacement = '/assets/3d/home-viewer.js';
        else if (src.includes('/themes/mewepak-fse/assets/js/main.js')) replacement = '/assets/original/main.js';
      }
      return replacement ? `<script id="${id || 'mewepak-local-script'}" src="${replacement}"></script>` : '';
    }
    if (/studio-companion-notice|_wpemojiSettings|wpEmojiSettingsSupports|wc_add_to_cart_params|woocommerce_params|wc_order_attribution/.test(body)) return '';
    if (/mewepak(?:ProductsMenuData|MenuCategoryImages|Forms)/.test(body)) return `<script${attributes}>${body}</script>`;
    return '';
  });
}

function sanitizeHtml(html) {
  html = html.replace(/<style>[\s\S]*?#studio-companion-notice[\s\S]*?<\/style>/i, '');
  html = html.replace(/<link\b[^>]*(?:feed|oembed|wp-json)[^>]*>/gi, '');
  html = rewriteStylesheets(html);
  html = rewriteScripts(html);
  html = html.replace(/<html\b[^>]*>/i, '<html lang="en">');
  html = html.replace(/<meta\s+name=['"]robots['"][^>]*>/i, '<meta name="robots" content="index,follow,max-image-preview:large">');
  html = html.replaceAll(sourceOrigin, '');
  html = html.replaceAll('https:\\/\\/yizbookwp-qfcmw-studio.wp.build', '');
  html = html.replaceAll('/wp-content/uploads/', '/assets/media/');
  html = html.replaceAll('\\/wp-content\\/uploads\\/', '\\/assets\\/media\\/');
  html = html.replace(/https?:\\?\/\\?\/yizbookwp-qfcmw-studio\.wp\.build\\?\/wp-content\\?\/plugins\\?\/mewepak-3d-preview\\?\/assets\\?\/models\\?\/doypack\.glb/gi, '/assets/3d/doypack.glb');
  html = html.replace(/\/wp-content\/plugins\/mewepak-3d-preview\/assets\/models\/doypack\.glb/gi, '/assets/3d/doypack.glb');
  html = html.replace(/<\?php[\s\S]*?\?>/g, '');
  html = html.replace(/array\(\)\s*\);[\s\S]*?\?&gt;/g, '');
  return html;
}

async function findMediaSource(relativePath) {
  const destination = path.join(localMediaRoot, relativePath);
  try {
    await readFile(destination);
    return destination;
  } catch {}

  const directory = path.dirname(destination);
  const extension = path.extname(destination);
  const basename = path.basename(destination, extension);
  const baseWithoutSize = basename.replace(/-\d+x\d+$/, '');
  try {
    const entries = await readdir(directory);
    const candidate = entries.find((entry) => {
      const entryExtension = path.extname(entry);
      const entryBase = path.basename(entry, entryExtension).replace(/-scaled$/, '');
      return entryExtension.toLowerCase() === extension.toLowerCase() && entryBase === baseWithoutSize;
    });
    return candidate ? path.join(directory, candidate) : null;
  } catch {
    return null;
  }
}

async function ensureReferencedMedia(html) {
  const references = new Set();
  for (const match of html.matchAll(/\/assets\/media\/([^'"\s,)\\]+)/g)) references.add(match[1]);
  for (const relativePath of references) {
    const destination = path.join(localMediaRoot, relativePath);
    const source = await findMediaSource(relativePath);
    if (!source || source === destination) continue;
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(source, destination);
  }
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'Mewepak migration sync' } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

async function prepareAssets() {
  await mkdir(originalAssets, { recursive: true });
  const themeRoot = path.resolve(projectRoot, '..', 'sitefiles', 'wp-content', 'themes', 'mewepak-fse', 'assets');
  await Promise.all([
    copyFile(path.join(themeRoot, 'css', 'tailwind.css'), path.join(originalAssets, 'tailwind.css')),
    copyFile(path.join(themeRoot, 'css', 'custom.css'), path.join(originalAssets, 'custom.css')),
    copyFile(path.join(themeRoot, 'js', 'main.js'), path.join(originalAssets, 'main.js')),
  ]);
}

async function collectRoutes() {
  const routes = new Set(['/', ...additionalRoutes]);
  for (const sitemapPath of sitemapPaths) {
    try {
      const xml = await fetchText(`${sourceOrigin}${sitemapPath}`);
      for (const match of xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)) {
        const route = normalizeRoute(decodeXml(match[1].trim()));
        if (route) routes.add(route);
      }
    } catch (error) {
      console.warn(`Skipping sitemap ${sitemapPath}: ${error.message}`);
    }
  }
  return [...routes].sort();
}

async function syncRoute(route) {
  const sourceUrl = `${sourceOrigin}${route}`;
  const response = await fetch(sourceUrl, { redirect: 'follow', headers: { 'user-agent': 'Mewepak migration sync' } });
  if (!response.ok) throw new Error(`${response.status} ${sourceUrl}`);
  const html = sanitizeHtml(await response.text());
  await ensureReferencedMedia(html);
  const output = outputFileForRoute(route);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, html);
  return route;
}

async function externalizeRuntimeData(routes) {
  let runtimeData = '';
  for (const route of routes) {
    const output = outputFileForRoute(route);
    let html;
    try {
      html = await readFile(output, 'utf8');
    } catch {
      continue;
    }
    html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (tag, attributes, body) => {
      if (!/mewepak(?:ProductsMenuData|MenuCategoryImages|Forms)/.test(body)) return tag;
      runtimeData ||= body;
      return '<script src="/assets/original/runtime-data.js"></script>';
    });
    await writeFile(output, html);
  }
  if (runtimeData) await writeFile(path.join(originalAssets, 'runtime-data.js'), runtimeData);
}

await prepareAssets();
const requestedRoutes = process.argv.slice(2).map((value) => normalizeRoute(value)).filter(Boolean);
const routes = requestedRoutes.length ? [...new Set(requestedRoutes)] : await collectRoutes();
const completed = [];
for (let index = 0; index < routes.length; index += 6) {
  const batch = routes.slice(index, index + 6);
  const results = await Promise.allSettled(batch.map(syncRoute));
  results.forEach((result, resultIndex) => {
    if (result.status === 'fulfilled') completed.push(result.value);
    else console.warn(`Skipping route ${batch[resultIndex]}: ${result.reason.message}`);
  });
}
await externalizeRuntimeData(completed);

console.log(JSON.stringify({ source: sourceOrigin, discovered: routes.length, completed: completed.length, routes: completed }, null, 2));
