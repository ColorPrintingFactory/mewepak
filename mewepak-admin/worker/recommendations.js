const productPhotos = '/assets/media/2026/07/';
const designPhotos = '/assets/client-design/images/';

const formats = {
  'bag-in-box': ['Bag In Box', 'An inner bag and outer box for dispensing liquids.', 'icon-bag-in-box.webp'],
  'flat-bottom-pouch': ['Flat Bottom Pouch', 'A stable base and broad panels for upright display.', productPhotos + '1-2-768x768.webp'],
  'flat-pouch': ['Flat Pouch', 'A compact format for samples, sachets and individual portions.', 'icon-flat-pouch.webp'],
  'pinch-bottom-pouches': ['Pinch Bottom Pouches', 'Wide printable panels for larger dry-product packs.', productPhotos + '1-3-768x768.webp'],
  polybag: ['Polybag', 'A lightweight flexible bag for protection or simple presentation.', productPhotos + '1-4.webp'],
  'quad-seal-bag': ['Quad Seal Bag', 'A structured bag with four sealed corners and wide display panels.', 'icon-quad-seal-bag.webp'],
  'retort-pouch': ['Retort Pouch', 'A format to discuss for products that undergo retort processing.', 'icon-retort-pouch.webp'],
  'roll-stock-films': ['Roll Stock Films', 'Continuous film for compatible automated packaging lines.', productPhotos + '1-1-768x768.webp'],
  'shaped-pouch': ['Shaped Pouch', 'A custom silhouette for projects where the shape is part of the design.', 'icon-shaped-pouch.webp'],
  'spout-pouch': ['Spout Pouch', 'A pourable format with a resealable spout.', 'icon-spout-pouch.webp'],
  'stand-up-pouch': ['Stand Up Pouch', 'An upright display format with closure options.', productPhotos + '1-768x768.webp'],
  'stand-up-pouch-tap': ['Stand Up Pouch with Tap', 'A dispensing format to consider for larger liquid packs.', 'icon-stand-up-pouch-tap.webp'],
};

const markets = {
  accessories: ['Accessories', 'Small items and retail accessories that benefit from organised packaging.'],
  'baby-food': ['Baby Food', 'Purées, portions and other baby food packaging projects.', 'e81d60808ae47bc9'],
  'beauty-care': ['Beauty & Care', 'Samples, refill packs and beauty products.'],
  beverage: ['Beverages', 'Drinks, concentrates and other pourable products.', 'b516f69f40e45895'],
  cannabis: ['Cannabis', 'Formats to discuss for specific product and market requirements.'],
  cbd: ['CBD', 'Formats to discuss for specific product and market requirements.'],
  'cbd-thc': ['CBD & THC', 'Formats to discuss for specific product and market requirements.'],
  'coffee-tea': ['Coffee & Tea', 'Whole beans, ground coffee and loose-leaf tea.', '873549651fc1a911'],
  cosmetics: ['Cosmetics', 'Beauty samples, liquids and refill packaging.'],
  fashion: ['Fashion', 'Lightweight packaging for garments and retail presentation.'],
  'frozen-food': ['Frozen Food', 'Packaging designed around freezer handling and filling conditions.', '457e72a2cbb71194'],
  'fruits-veggies': ['Fruits & Vegetables', 'Formats for produce, portions and prepared ingredients.', '263d52df600b949b'],
  'home-care': ['Home Care', 'Refill and dispensing options for household products.', '1a461dfa6c622d5f'],
  'meat-poultry': ['Meat & Poultry', 'Packs to review against storage and processing requirements.'],
  'pet-food': ['Pet Food', 'Dry pet food, treats and prepared portions.', 'cfcdbd746a6ff3b8'],
  'powder-spices': ['Powders & Spices', 'Dry ingredients, blends and portions.'],
  'sauce-soup': ['Sauces & Soups', 'Pourable products and portion packs.', '39b101c6f4e0ea09'],
  'sea-food': ['Seafood', 'Packaging around portion, handling and storage requirements.'],
  'snacks-sweets': ['Snacks & Sweets', 'Individual portions, sharing packs and retail displays.', 'd1b92713ab295161'],
  supplement: ['Supplements', 'Powders, dry products and individual servings.', '740080ec3ae057b2'],
  'tobacco-filters': ['Tobacco & Filters', 'Flat, upright and film formats to discuss for the project.'],
};

const formatChoices = {
  accessories: ['polybag', 'flat-pouch', 'stand-up-pouch'],
  'baby-food': ['spout-pouch', 'retort-pouch', 'flat-pouch'],
  'beauty-care': ['spout-pouch', 'flat-pouch', 'shaped-pouch'],
  beverage: ['spout-pouch', 'stand-up-pouch-tap', 'bag-in-box'],
  cannabis: ['stand-up-pouch', 'flat-pouch', 'roll-stock-films'],
  cbd: ['stand-up-pouch', 'flat-pouch', 'shaped-pouch'],
  'cbd-thc': ['stand-up-pouch', 'flat-pouch', 'roll-stock-films'],
  cosmetics: ['spout-pouch', 'flat-pouch', 'shaped-pouch', 'roll-stock-films'],
  fashion: ['polybag', 'flat-pouch', 'stand-up-pouch'],
  'frozen-food': ['stand-up-pouch', 'flat-pouch', 'roll-stock-films'],
  'fruits-veggies': ['stand-up-pouch', 'flat-pouch', 'polybag', 'roll-stock-films'],
  'home-care': ['spout-pouch', 'stand-up-pouch-tap', 'bag-in-box', 'flat-bottom-pouch'],
  'meat-poultry': ['flat-pouch', 'retort-pouch', 'roll-stock-films'],
  'pet-food': ['quad-seal-bag', 'flat-bottom-pouch', 'stand-up-pouch', 'retort-pouch'],
  'powder-spices': ['flat-pouch', 'stand-up-pouch', 'flat-bottom-pouch', 'roll-stock-films'],
  'sauce-soup': ['spout-pouch', 'retort-pouch', 'flat-pouch', 'bag-in-box'],
  'sea-food': ['flat-pouch', 'retort-pouch', 'roll-stock-films'],
  supplement: ['stand-up-pouch', 'flat-pouch', 'flat-bottom-pouch', 'roll-stock-films'],
  'tobacco-filters': ['flat-pouch', 'stand-up-pouch', 'roll-stock-films'],
};

const marketChoices = {
  'bag-in-box': ['beverage', 'sauce-soup', 'home-care'],
  'flat-bottom-pouch': ['coffee-tea', 'pet-food', 'snacks-sweets', 'supplement'],
  'flat-pouch': ['snacks-sweets', 'supplement', 'frozen-food', 'cosmetics'],
  'pinch-bottom-pouches': ['coffee-tea', 'pet-food', 'powder-spices'],
  polybag: ['fashion', 'accessories', 'fruits-veggies'],
  'quad-seal-bag': ['pet-food', 'coffee-tea', 'snacks-sweets'],
  'retort-pouch': ['sauce-soup', 'baby-food', 'pet-food', 'sea-food'],
  'roll-stock-films': ['snacks-sweets', 'frozen-food', 'supplement', 'fruits-veggies'],
  'shaped-pouch': ['snacks-sweets', 'beauty-care', 'baby-food', 'cosmetics'],
  'spout-pouch': ['sauce-soup', 'baby-food', 'beverage', 'home-care'],
  'stand-up-pouch-tap': ['beverage', 'home-care', 'sauce-soup'],
};

const resources = [
  ['/solutions/prepress/', 'Prepare artwork'],
  ['/solutions/printing/', 'Explore print options'],
  ['/added-value/faq/', 'Read the packaging FAQ'],
];

const arrow = '<span aria-hidden="true">↗</span>';
const keyPath = (family, slug) => '/' + family + '/' + slug + '/';
const formatImage = (source) => source.startsWith('/') ? source : designPhotos + source;
const listLinks = (links) => links.map(([href, label]) => `<li><a href="${href}">${label} ${arrow}</a></li>`).join('');

function formatSection(id, heading, intro, cards, extras, moreLabel) {
  return `<section id="${id}" class="mw-format-section" aria-labelledby="${id}-title">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <h2 id="${id}-title">${heading}</h2>
      <p class="mw-format-section__intro">${intro}</p>
      <ul class="mw-format-grid">${cards.join('')}</ul>
      ${extras.length ? `<details class="mw-format-more"><summary>${moreLabel}</summary><ul>${listLinks(extras)}</ul></details>` : ''}
    </div>
  </section>`;
}

function card(href, title, description, image, action) {
  return `<li><a class="mw-format-card" href="${href}">
    <span class="mw-format-card__image"><img src="${image}" alt="" width="400" height="400" loading="lazy" decoding="async"></span>
    <span class="mw-format-card__body"><strong>${title}</strong><span>${description}</span>
    <span class="mw-card-link">${action} ${arrow}</span></span>
  </a></li>`;
}

export function applyRecommendations(path, edit, publishedPaths, baseline) {
  const [, family, slug] = path.split('/');
  if (path !== keyPath(family, slug)) return;
  const available = href => publishedPaths.has(href) || !Object.hasOwn(baseline, href);
  const otherFormats = (excluded) => Object.entries(formats).flatMap(([key, [title]]) => {
    const href = keyPath('products', key);
    return excluded.includes(key) || !available(href) ? [] : [[href, title]];
  });

  if (family === 'markets' && Object.hasOwn(markets, slug)) {
    const selected = formatChoices[slug];
    if (selected) {
      const cards = selected.flatMap(key => {
        const [title, description, photo] = formats[key];
        const href = keyPath('products', key);
        return available(href) ? [card(href, title, description, formatImage(photo), 'Explore format')] : [];
      });
      if (cards.length) {
        let first = true;
        edit('main .mewepak-market-detail > section.mewepak-market-section.bg-white', (el) => {
          if (!first) return;
          first = false;
          el.replace(formatSection(slug + '-packaging-formats', `Packaging formats for <span>${markets[slug][0].replaceAll('&', '&amp;')}.</span>`,
            'Compare suitable formats, then explore the wider packaging range.', cards, otherFormats(selected), 'See more packaging formats'), { html: true });
        });
      }
    }
    const links = resources.filter(([href]) => available(href));
    if (links.length) edit('main .mewepak-market-detail > section.mewepak-internal-links', (el) => {
      el.replace(`<section class="mw-format-section"><div class="max-w-7xl mx-auto px-6 lg:px-8">
        <h2>Plan your packaging project.</h2><div class="mw-format-more"><ul>${listLinks(links)}</ul></div>
      </div></section>`, { html: true });
    });
  }

  if (family === 'products' && Object.hasOwn(marketChoices, slug)) {
    const [formatName, , formatPhoto] = formats[slug];
    const cards = marketChoices[slug].flatMap(key => {
      const [title, description, photo] = markets[key];
      const href = keyPath('markets', key);
      const image = photo ? designPhotos + photo + '.webp' : formatImage(formatPhoto);
      return available(href) ? [card(href, title.replaceAll('&', '&amp;'), description, image, 'Explore market')] : [];
    });
    if (cards.length) edit('main .mewepak-product-category > section.mewepak-internal-links', (el) => {
      el.replace(formatSection(slug + '-markets', `Where <span>${formatName.toLowerCase()}</span> fits.`,
        'Explore markets and project examples to see where this packaging format may fit.', cards, otherFormats([slug]), 'Explore other packaging formats'), { html: true });
    });
  }
}
