(() => {
  const original = document.querySelector('[data-mewepak-header], .mwl-header, .site-header');
  if (!original || !('IntersectionObserver' in window)) return;

  const language = document.documentElement.lang.split('-')[0];
  const labels = {
    en: ['Menu', 'Book a Consultation', 'Quick navigation', ' submenu', 'Book now'],
    de: ['Menü', 'Termin buchen', 'Schnellnavigation', ': Untermenü', 'Termin buchen'],
    es: ['Menú', 'Reservar consulta', 'Navegación rápida', ': submenú', 'Reservar'],
    fr: ['Menu', 'Prendre rendez-vous', 'Navigation rapide', ' : sous-menu', 'Rendez-vous'],
    ar: ['القائمة', 'احجز استشارة', 'التنقّل السريع', ' — القائمة الفرعية', 'احجز موعداً'],
  };
  const [menuLabel, bookingLabel, navLabel, submenuSuffix, shortBookingLabel] = labels[language] || labels.en;
  const localized = ['de', 'es', 'fr', 'ar'].includes(language);
  const parentPath = localized ? '/' + language : '';
  const originalNav = original.querySelector('[data-nav], .mwl-primary-nav, .site-nav');
  const rootLink = original.querySelector('.mwl-brand, a:has(.mewepak-header-logo), .brand')
    || original.querySelector('a[href="' + parentPath + '/"]');
  if (!originalNav || !rootLink) return;

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

  const desktop = element('nav', 'mw-compact-header__desktop');
  desktop.setAttribute('aria-label', navLabel);
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
    mobileNav.append(link.cloneNode(true));
    const name = source.closest('[data-nav-item]')?.dataset.navItem;
    const panel = name && [...original.querySelectorAll('[data-mega-panel]')]
      .find(node => node.dataset.megaPanel === name);
    if (!panel) {
      desktop.append(link);
      continue;
    }

    const group = element('div', 'mw-compact-header__group');
    const submenu = element('details');
    submenu.name = 'mw-compact-navigation';
    const trigger = element('summary', 'mw-compact-header__chevron');
    trigger.setAttribute('aria-label', link.textContent + submenuSuffix);
    const entries = element('div', 'mw-compact-header__panel mw-compact-header__panel--desktop');
    const seen = new Set();
    for (const source of panel.querySelectorAll('ul a[href]')) {
      const child = linkFrom(source);
      if (!child.textContent || seen.has(child.href)) continue;
      seen.add(child.href);
      entries.append(child);
    }
    if (!seen.size) {
      desktop.append(link);
      continue;
    }
    submenu.append(trigger, entries);
    group.append(link, submenu);
    desktop.append(group);
  }

  const appointment = element('a', 'mw-compact-header__appointment');
  appointment.href = parentPath + '/booking/';
  appointment.setAttribute('aria-label', bookingLabel);
  const fullLabel = element('span', 'mw-compact-header__appointment-full');
  fullLabel.textContent = bookingLabel;
  const shortLabel = element('span', 'mw-compact-header__appointment-short');
  shortLabel.textContent = shortBookingLabel;
  appointment.append(fullLabel, shortLabel);
  row.append(brand, desktop, mobile, appointment);
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

  new IntersectionObserver(([entry]) => {
    const hidden = entry.isIntersecting || entry.boundingClientRect.bottom > 0;
    if (hidden) closeMenus();
    bar.hidden = hidden;
  }).observe(original);
})();
