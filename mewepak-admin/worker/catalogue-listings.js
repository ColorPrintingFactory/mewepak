const homeArtwork = {
  'frozen-candied-grapes-atomic-sourberry-hanging-pouch': ['Frozen Candied Grapes', 'Hanging stand-up pouch', 'frozen-grapes', '/assets/media/2026/06/Frozen-Candied-Grapes-Atomic-Sourberry-Hanging-Pouch-1-scaled.jpeg'],
  'cotton-candy-pastel-pink-hanging-pouch': ['Cotton Candy', 'Hanging stand-up pouch', 'cotton-candy', '/assets/media/2026/06/Cotton-Candy-Pastel-Pink-Hanging-Pouch-1-scaled.jpeg'],
  'premium-almonds-window-stand-up-pouch': ['Premium Almonds', 'Window stand-up pouch', 'almond-pouch', '/assets/media/2026/06/Premium-Almonds-Window-Stand-Up-Pouch-1-scaled.jpeg'],
};
const originalOrder = new Map(Object.keys(homeArtwork).map((slug, index) => [slug, index]));
const byCatalogueOrder = (a, b) => (originalOrder.get(a.row.slug) ?? originalOrder.size)
  - (originalOrder.get(b.row.slug) ?? originalOrder.size) || a.row.sort_order - b.row.sort_order;

export function applyHomeProducts({ edit, replace, replaceHtml, entries, baseline, safeUrl, escape }) {
  const categories = new Map(entries.filter(({ table }) => table === 'product_categories')
    .map(({ row }) => [row.slug, row.name]));
  const products = entries.filter(({ table, row }) => table === 'products' && categories.has(row.category?.slug))
    .sort((a, b) => Number(Boolean(b.row.is_featured)) - Number(Boolean(a.row.is_featured)) || byCatalogueOrder(a, b))
    .slice(0, 16);

  replaceHtml('.hy-product-track', products.map(({ row, path }) => {
    const [shortName, format, thumbnail, original] = Object.hasOwn(homeArtwork, row.slug) ? homeArtwork[row.slug] : [];
    const title = row.name === baseline[path]?.title && shortName ? shortName : row.name;
    const image = safeUrl(row.primary_image_url);
    const thumb = image && image === original ? '/assets/media/home-thumbs/' + thumbnail : '';
    const src = thumb ? thumb + '-400.webp' : image;
    const responsive = thumb ? ` srcset="${thumb}-400.webp 400w, ${thumb}-800.webp 800w" sizes="(max-width: 600px) calc(100vw - 36px), (max-width: 1000px) 43vw, 310px"` : '';
    const href = escape(path);
    return `<article class="mw-product" data-product-slug="${escape(row.slug)}">${src ? `<a class="mw-artwork-button cursor-interaction" href="${href}" aria-label="${escape(`View ${title} packaging`)}"><img class="mw-product-image" src="${escape(src)}"${responsive} alt="" width="400" height="400" loading="lazy" decoding="async"></a>` : ''}
      <div class="mw-product-content"><p class="mw-product-type">${escape(format || categories.get(row.category.slug) || 'Custom packaging')}</p>
      <h3>${escape(title)}</h3><a class="mw-text-action cursor-interaction" href="${href}">View packaging ↗</a></div></article>`;
  }).join(''));
  if (products.length < 2) edit('.hy-product-controls button', (el) => el.setAttribute('disabled', ''));
  replace('#hy-product-status', products.length ? 'Featured packaging 1 of ' + products.length : '');
  replace('#hy-product-page', (products.length ? '01' : '00') + ' / ' + String(products.length).padStart(2, '0'));
}

export function applyCategoryProducts({ entry, entries, replace, replaceHtml, safeUrl, escape }) {
  const count = entries.filter(({ table, row }) => table === 'products' && row.category?.slug === entry.row.slug)
    .sort(byCatalogueOrder);
  replace('#product-grid .mewepak-category-grid__count', String(count.length));
  replace('#product-grid .mewepak-category-grid__count-label', count.length === 1 ? 'Product in this collection' : 'Products in this collection');
  replaceHtml('#product-grid .mewepak-category-grid', count.map(({ row, path }) => {
    const image = safeUrl(row.primary_image_url);
    return `<article class="mewepak-category-grid__item" data-product-slug="${escape(row.slug)}">
      <a href="${escape(path)}" class="mewepak-category-grid__link !no-underline">
        ${image ? `<div class="mewepak-category-grid__media"><img src="${escape(image)}" alt="" class="mewepak-category-grid__image" loading="lazy" decoding="async"></div>` : ''}
        <div class="mewepak-category-grid__body"><h3 class="mewepak-category-grid__title">${escape(row.name)}</h3></div>
      </a>
    </article>`;
  }).join(''));
}

// The exported site contains older catalogue cards. Suppress them when published data cannot be confirmed.
export function withoutUnverifiedProducts(path, asset) {
  if ((!asset.ok || !asset.headers.get('content-type')?.includes('text/html')) ||
    !(path === '/' || /^\/products\/[^/]+\/$/.test(path))) return asset;
  const rewriter = new HTMLRewriter();
  const clear = (selector, value = '') => rewriter.on(selector, { element: (el) => el.setInnerContent(value) });
  if (path === '/') {
    clear('.hy-product-track');
    clear('#hy-product-page', '—');
    clear('#hy-product-status');
    rewriter.on('.hy-product-controls button', { element: (el) => el.setAttribute('disabled', '') });
  } else {
    clear('#product-grid .mewepak-category-grid');
    clear('#product-grid .mewepak-category-grid__count', '—');
  }
  const revised = rewriter.transform(asset);
  revised.headers.delete('content-length');
  revised.headers.delete('etag');
  return revised;
}
