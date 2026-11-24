const homeArtwork = {
  'frozen-candied-grapes-atomic-sourberry-hanging-pouch': ['Frozen Candied Grapes', 'Hanging stand-up pouch', 'frozen-grapes', '/assets/media/2026/06/Frozen-Candied-Grapes-Atomic-Sourberry-Hanging-Pouch-1-scaled.jpeg'],
  'cotton-candy-pastel-pink-hanging-pouch': ['Cotton Candy', 'Hanging stand-up pouch', 'cotton-candy', '/assets/media/2026/06/Cotton-Candy-Pastel-Pink-Hanging-Pouch-1-scaled.jpeg'],
  'premium-almonds-window-stand-up-pouch': ['Premium Almonds', 'Window stand-up pouch', 'almond-pouch', '/assets/media/2026/06/Premium-Almonds-Window-Stand-Up-Pouch-1-scaled.jpeg'],
};
const homepageOrder = Object.keys(homeArtwork);

export function applyHomeProducts({ edit, replace, replaceHtml, entries, baseline, safeUrl, escape }) {
  const categories = new Map(entries.filter(({ table }) => table === 'product_categories')
    .map(({ row }) => [row.slug, row.name]));
  const products = entries.filter(({ table, row }) => table === 'products' && categories.has(row.category?.slug))
    .sort((a, b) => Number(b.row.is_featured) - Number(a.row.is_featured)
      || a.row.sort_order - b.row.sort_order
      || (homepageOrder.includes(a.row.slug) ? homepageOrder.indexOf(a.row.slug) : homepageOrder.length)
        - (homepageOrder.includes(b.row.slug) ? homepageOrder.indexOf(b.row.slug) : homepageOrder.length));

  if (!products.length) {
    edit('#mw-products', (el) => el.remove());
    edit('a[href="#mw-products"]', (el) => el.setAttribute('href', '/products/'));
    return;
  }

  replaceHtml('.hy-product-track', products.map(({ row, path }) => {
    const [shortName, format, thumbnail, original] = Object.hasOwn(homeArtwork, row.slug) ? homeArtwork[row.slug] : [];
    const title = row.name === baseline[path]?.title && shortName ? shortName : row.name;
    const image = safeUrl(row.primary_image_url);
    const thumb = image && image === original ? '/assets/media/home-thumbs/' + thumbnail : '';
    const src = thumb ? thumb + '-400.webp' : image;
    const responsive = thumb ? ` srcset="${thumb}-400.webp 400w, ${thumb}-800.webp 800w" sizes="(max-width: 600px) calc(100vw - 36px), (max-width: 1000px) 45vw, 31vw"` : '';
    const href = escape(path);
    return `<article class="mw-product" data-product-slug="${escape(row.slug)}">${src ? `<a class="mw-artwork-button cursor-interaction" href="${href}" aria-label="${escape(title)}"><img class="mw-product-image" src="${escape(src)}"${responsive} alt="" width="400" height="400" loading="lazy" decoding="async"></a>` : ''}
      <div class="mw-product-content"><p class="mw-product-type">${escape(format || categories.get(row.category.slug) || 'Custom packaging')}</p>
      <h3>${escape(title)}</h3><a class="mw-text-action cursor-interaction" href="${href}">View packaging ↗</a></div></article>`;
  }).join(''));
  edit('.hy-product-track', (el) => el.setAttribute('data-product-count', String(products.length)));
  replace('#hy-product-status', 'Featured packaging 1 of ' + products.length);
  replace('#hy-product-page', '01 / ' + String(products.length).padStart(2, '0'));
}

const quoteLink = (slug) => '/inquiry/?format=' + encodeURIComponent(slug) + '#quote-request';

export function categoryCollection({ entry, entries, safeUrl, escape }) {
  const products = entries.filter(({ table, row }) => table === 'products' && row.category?.slug === entry.row.slug)
    .sort((a, b) => a.row.sort_order - b.row.sort_order);
  const name = escape(entry.row.name);
  const content = products.length
    ? `<div class="flex flex-wrap items-end justify-between gap-6 mb-10">
        <div><span class="mewepak-eyebrow">Product collection</span><h2 class="!text-3xl lg:!text-5xl !font-semibold">Explore the ${name} collection</h2></div>
        <div class="mewepak-category-grid__meta"><span class="mewepak-category-grid__count">${products.length}</span>
          <span class="mewepak-category-grid__count-label">${products.length === 1 ? 'Product' : 'Products'} in this collection</span></div>
       </div><div class="mewepak-category-grid">${products.map(({ row, path }) => {
        const image = safeUrl(row.primary_image_url);
        return `<article class="mewepak-category-grid__item" data-product-slug="${escape(row.slug)}">
          <a href="${escape(path)}" class="mewepak-category-grid__link !no-underline">
            ${image ? `<div class="mewepak-category-grid__media"><img src="${escape(image)}" alt="" class="mewepak-category-grid__image" loading="lazy" decoding="async"></div>` : ''}
            <div class="mewepak-category-grid__body"><h3 class="mewepak-category-grid__title">${escape(row.name)}</h3></div>
          </a>
        </article>`;
       }).join('')}</div>`
    : `<div class="max-w-2xl"><h2 class="!text-3xl lg:!text-5xl !font-semibold">Plan your ${escape(entry.row.name.toLowerCase())} project</h2>
      <p class="mt-4">Discuss the size, material and printing you need for your product.</p>
      <a href="${quoteLink(entry.row.slug)}" class="inline-flex mt-5 !font-semibold !text-[#007f7c]">Request a quote <span aria-hidden="true" class="ml-2">↗</span></a></div>`;
  return `<section id="product-grid" class="relative py-16 lg:py-24 bg-[#f7f7f3]"><div class="max-w-7xl mx-auto px-6 lg:px-8">${content}</div></section>`;
}

// The exported site contains older catalogue cards. Suppress them when published data cannot be confirmed.
export function withoutUnverifiedProducts(path, asset) {
  if ((!asset.ok || !asset.headers.get('content-type')?.includes('text/html')) ||
    !(path === '/' || /^\/products\/[^/]+\/$/.test(path))) return asset;
  const target = path === '/' ? '#mw-products' : '#product-grid';
  const fallback = path === '/' ? '/products/' : quoteLink(path.split('/')[2]);
  const revised = new HTMLRewriter()
    .on(target, { element: (el) => el.remove() })
    .on(`a[href="${target}"]`, { element: (el) => el.setAttribute('href', fallback) })
    .transform(asset);
  revised.headers.delete('content-length');
  revised.headers.delete('etag');
  return revised;
}
