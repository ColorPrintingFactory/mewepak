(() => {
  const original = document.querySelector('[data-mewepak-header], .mwl-header, .site-header');
  if (!original || !('IntersectionObserver' in window)) return;

  const language = document.documentElement.lang.split('-')[0];
  const labels = {
    en: ['Menu', 'Quick navigation', 'Quote', 'Book'],
    de: ['Menü', 'Schnellnavigation', 'Angebot', 'Termin'],
    es: ['Menú', 'Navegación rápida', 'Cotizar', 'Reservar'],
    fr: ['Menu', 'Navigation rapide', 'Devis', 'Réserver'],
    ar: ['القائمة', 'التنقّل السريع', 'عرض سعر', 'احجز'],
  };
  const [menuLabel, navLabel, shortQuoteLabel, shortBookingLabel] = labels[language] || labels.en;
  const localized = ['de', 'es', 'fr', 'ar'].includes(language);
  const parentPath = localized ? '/' + language : '';
  const originalNav = original.querySelector('[data-nav], .mwl-primary-nav, .site-nav');
  const rootLink = original.querySelector('.mwl-brand, a:has(.mewepak-header-logo), .brand')
    || original.querySelector('a[href="' + parentPath + '/"]');
  const quoteLink = original.querySelector('[data-header-action="quote"]');
  const bookingLink = original.querySelector('[data-header-action="booking"]');
  if (!originalNav || !rootLink || !quoteLink || !bookingLink) return;

  const element = (tag, className) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  };
  const normalizePath = path => path.replace(/\/+$/, '') + '/';
  const currentPath = normalizePath(location.pathname);
  function linkFrom(source) {
    const link = element('a');
    link.href = source.getAttribute('href');
    link.textContent = (source.querySelector('.mewepak-category-menu-title') || source).textContent.trim();
    if (source.hreflang) link.hreflang = source.hreflang;
    const path = normalizePath(link.pathname);
    if (currentPath === path) link.setAttribute('aria-current', 'page');
    else if (path !== parentPath + '/' && currentPath.startsWith(path)) link.setAttribute('aria-current', 'location');
    return link;
  }

  const bar = element('header', 'mw-compact-header');
  bar.hidden = true;
  bar.setAttribute('data-compact-header', '');
  const row = element('div', 'mw-compact-header__row');
  const brand = rootLink.cloneNode(true);
  brand.className = 'mw-compact-header__brand';

  const panels = [...original.querySelectorAll('[data-mega-panel]')];
  const desktop = element(panels.length ? 'div' : 'nav', 'mw-compact-header__desktop');
  const desktopViewport = matchMedia('(min-width: 1181px)');
  let navSlot;
  let panelSlot;
  if (panels.length) {
    // Preserve the full header's height while the original navigation is in the fixed bar.
    navSlot = element('div', 'mw-compact-header__nav-slot');
    navSlot.hidden = true;
    originalNav.before(navSlot);
    panelSlot = document.createComment('Storefront dropdowns');
    panels[0].before(panelSlot);
    originalNav.setAttribute('aria-label', navLabel);
  } else {
    desktop.setAttribute('aria-label', navLabel);
  }
  const mobile = element('details', 'mw-compact-header__mobile');
  mobile.name = 'mw-compact-navigation';
  const mobileSummary = element('summary');
  mobileSummary.textContent = menuLabel;
  const mobileNav = element('nav', 'mw-compact-header__panel');
  mobileNav.setAttribute('aria-label', navLabel);
  mobile.append(mobileSummary, mobileNav);

  for (const source of originalNav.querySelectorAll('a[href]')) {
    const link = linkFrom(source);
    if (!link.textContent) continue;
    link.setAttribute('data-compact-primary', '');
    mobileNav.append(link.cloneNode(true));
    const group = source.closest('[data-nav-item]')?.dataset.navItem;
    const panel = panels.find((candidate) => candidate.dataset.megaPanel === group);
    for (const child of panel?.querySelectorAll('[data-compact-mobile-link]') || []) {
      mobileNav.append(linkFrom(child));
    }
    if (!panels.length) desktop.append(link);
  }

  const actions = element('div', 'mw-header-actions mw-header-actions--compact');
  for (const [source, label] of [[quoteLink, shortQuoteLabel], [bookingLink, shortBookingLabel]]) {
    const link = source.cloneNode(false);
    link.setAttribute('aria-label', source.textContent.trim());
    const full = element('span', 'mw-compact-header__action-full');
    full.textContent = source.textContent.trim();
    const short = element('span', 'mw-compact-header__action-short');
    short.textContent = label;
    link.append(full, short);
    actions.append(link);
  }
  row.append(brand, desktop, mobile, actions);
  bar.append(row);
  document.body.append(bar);
  document.documentElement.classList.add('mw-has-compact-header');

  const openMenus = () => bar.querySelectorAll('details[open]');
  function closeMenus() {
    openMenus().forEach(menu => { menu.open = false; });
  }
  document.addEventListener('pointerdown', event => {
    if (!bar.contains(event.target)) closeMenus();
  });
  bar.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const menu = [...openMenus()].find(node => node.contains(document.activeElement));
    if (!menu) return;
    menu.open = false;
    menu.querySelector('summary').focus();
    event.preventDefault();
  });
  bar.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenus();
  });

  function placeDesktopNavigation() {
    if (!navSlot) return;
    const inFixedBar = !bar.hidden && desktopViewport.matches;
    if (inFixedBar === desktop.contains(originalNav)) return;
    originalNav.dispatchEvent(new Event('mewepak-navigation-dismiss'));
    if (inFixedBar) {
      navSlot.style.height = originalNav.getBoundingClientRect().height + 'px';
      navSlot.hidden = false;
      desktop.append(originalNav);
      bar.append(...panels);
    } else {
      navSlot.after(originalNav);
      navSlot.hidden = true;
      panelSlot.after(...panels);
    }
  }

  desktopViewport.addEventListener('change', () => {
    closeMenus();
    placeDesktopNavigation();
  });
  new IntersectionObserver(([entry]) => {
    bar.hidden = entry.isIntersecting || entry.boundingClientRect.bottom > 0;
    if (bar.hidden) closeMenus();
    placeDesktopNavigation();
  }).observe(original);
})();
