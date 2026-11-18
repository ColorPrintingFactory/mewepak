(() => {
  'use strict';

  const packSlugs = {
    'stand-up': 'stand-up-pouch', 'flat-bottom': 'flat-bottom-pouch',
    'quad-seal': 'quad-seal-bag', 'flat-pouch': 'flat-pouch', shaped: 'shaped-pouch',
    retort: 'retort-pouch', spout: 'spout-pouch', 'tap-pouch': 'stand-up-pouch-tap',
    'bag-in-box': 'bag-in-box', rollstock: 'roll-stock-films',
  };
  const marketSlugs = {
    coffee: 'coffee-tea', snacks: 'snacks-sweets', supplement: 'supplement',
    pet: 'pet-food', sauce: 'sauce-soup', baby: 'baby-food', beverage: 'beverage',
    frozen: 'frozen-food', home: 'home-care', produce: 'fruits-veggies',
    meat: 'meat-poultry', beauty: 'beauty-care', seafood: 'sea-food',
    cbd: 'cbd', cosmetics: 'cosmetics', spices: 'powder-spices', fashion: 'fashion',
    tobacco: 'tobacco-filters', 'cbd-thc': 'cbd-thc', cannabis: 'cannabis', accessories: 'accessories',
  };
  const featured = {
    'product-grapes': 'frozen-candied-grapes-atomic-sourberry-hanging-pouch',
    'product-candy': 'cotton-candy-pastel-pink-hanging-pouch',
    'product-almonds': 'premium-almonds-window-stand-up-pouch',
  };

  async function read(path) {
    const response = await fetch(path, { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error('Content is unavailable');
    return response.json();
  }

  function fillBrief(type, brief, details, formatLabel) {
    const form = document.querySelector('[data-client-brief="' + type + '"]');
    const field = (name) => String(brief.get(name) || '').trim();
    const values = {
      name: field('name'), email: field('email'), company: field('company'),
      quantity: field('quantity'), product_type: formatLabel || field('format') || 'Help me choose',
      product_context: field('product'), details: details.slice(0, 4000),
    };
    for (const [key, value] of Object.entries(values)) form.elements.namedItem(key).value = value;
    form.querySelector('[data-quote-message]').textContent = '';
  }

  async function catalogue(formats) {
    const initial = formats.map((item) => ({ ...item, slug: packSlugs[item.id] || item.id }));
    try {
      const rows = await read('/api/content?type=categories');
      if (!Array.isArray(rows)) return initial;
      const designs = new Map(initial.map((item) => [item.slug, item]));
      const result = rows.map((row) => {
        const format = designs.get(row.slug);
        return {
          ...format, id: format?.id || row.slug, slug: row.slug, name: row.name,
          family: format?.family || 'pouches', kicker: format?.kicker || 'Packaging formats',
          summary: row.short_description || format?.summary || '',
          detail: format?.detail || row.short_description || '',
          keywords: format?.keywords || row.name, questions: format?.questions || [],
          alt: format?.alt || row.name, image: format?.image, imageUrl: row.image_url,
        };
      });
      const select = document.querySelector('#pk-format');
      const options = result.map((item) => new Option(item.name, item.id));
      select.replaceChildren(new Option('Please advise', ''), ...options);
      return result;
    } catch {
      return initial;
    }
  }

  function formatImage(format, assets) {
    if (format.image && assets[format.image]) return assets[format.image];
    return /^(?:\/(?![\\/])|https:\/\/)/i.test(format.imageUrl || '') ? format.imageUrl : (assets.logo || '/assets/media/2026/06/logo.png');
  }

  function formatIcon(slug) {
    if (!Object.values(packSlugs).includes(slug) || slug === 'roll-stock-films') return null;
    const image = document.createElement('img');
    image.src = '/assets/client-design/images/icon-' + slug + '.webp';
    image.className = 'client-format-icon';
    image.alt = '';
    image.loading = 'lazy';
    image.width = 30;
    image.height = 30;
    return image;
  }

  function detailLink(button, href) {
    const link = document.createElement('a');
    link.href = href;
    link.className = button.className;
    while (button.firstChild) link.append(button.firstChild);
    const label = button.getAttribute('aria-label');
    if (label) link.setAttribute('aria-label', label);
    button.replaceWith(link);
  }

  async function home() {
    for (const button of document.querySelectorAll('button.mw-market')) {
      const id = (button.dataset.marketPhoto || button.dataset.preview || '').replace(/^market-/, '').replace(/-photo$/, '');
      if (!marketSlugs[id]) continue;
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        location.assign('/markets/' + marketSlugs[id] + '/');
      });
    }
    try {
      const products = await read('/api/content?type=products');
      for (const [key, slug] of Object.entries(featured)) {
        const product = products.find((row) => row.slug === slug);
        if (!product?.category?.slug) continue;
        const href = '/products/' + encodeURIComponent(product.category.slug) + '/' + encodeURIComponent(slug) + '/';
        for (const button of document.querySelectorAll('button[data-preview="' + key + '"]')) detailLink(button, href);
        const image = document.querySelector('img[data-asset="' + key + '"]');
        if (image && /^(?:\/(?![\\/])|https:\/\/)/i.test(product.primary_image_url || '')) image.src = product.primary_image_url;
      }
    } catch {
      // The authored gallery remains usable while the catalog is offline.
    }
  }

  function syncBrand(settings) {
    if (settings.email) {
      for (const link of document.querySelectorAll('a[href="mailto:sales@mewepak.com"]')) {
        link.href = 'mailto:' + settings.email;
        for (const node of link.childNodes) {
          if (node.nodeType === Node.TEXT_NODE) node.textContent = node.textContent.replace('sales@mewepak.com', settings.email);
        }
      }
    }
    if (settings.logo) for (const image of document.querySelectorAll('img.mw-logo,img.mw-footer-logo')) image.src = settings.logo;
  }

  const quote = document.querySelector('#qt-form');
  if (quote) {
    const context = new URLSearchParams(location.search).get('product');
    if (context) quote.elements.namedItem('product').value = context.slice(0, 160);
  }
  window.mewepakClient = { fillBrief, catalogue, formatImage, formatIcon, home };
  window.addEventListener('DOMContentLoaded', () => read('/api/public-site').then(syncBrand).catch(() => {}), { once: true });
})();
