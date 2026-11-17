(function () {
  "use strict";

  // Sticky header scrolled state
  var header = document.querySelector('[data-mewepak-header]');
  if (header) {
    var onScroll = function () {
      header.dataset.scrolled = window.scrollY > 20 ? 'true' : 'false';
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function buildProductMenuLink(entry, extraClassName) {
    if (!entry || !entry.path) return null;

    var link = document.createElement('a');
    link.href = entry.path;
    link.className = extraClassName || 'text-sm !text-gray-600 hover:!text-[#00cfca] transition-colors';

    var normalized = entry.path.replace(/\/+$/, '') || '/';
    var imageEntry = window.mewepakMenuCategoryImages && window.mewepakMenuCategoryImages[normalized] ? window.mewepakMenuCategoryImages[normalized] : entry;

    link.classList.add('mewepak-category-menu-link');

    var thumb = document.createElement('span');
    thumb.className = 'mewepak-category-menu-thumb';
    thumb.dataset.categoryMenuThumb = imageEntry.source || '';
    thumb.setAttribute('aria-hidden', 'true');

    var image = document.createElement('img');
    image.src = imageEntry.image;
    image.alt = '';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.className = 'mewepak-category-menu-thumb__image';
    thumb.appendChild(image);

    var body = document.createElement('span');
    body.className = 'mewepak-category-menu-copy';

    var title = document.createElement('span');
    title.className = 'mewepak-category-menu-title';
    title.textContent = entry.label || '';
    body.appendChild(title);

    if (entry.description) {
      var description = document.createElement('span');
      description.className = 'mewepak-category-menu-description';
      description.textContent = entry.description;
      body.appendChild(description);
    }

    link.appendChild(thumb);
    link.appendChild(body);

    return link;
  }

  function renderProductsMenu(root) {
    if (!root || !window.mewepakProductsMenuData || !window.mewepakProductsMenuData.groups) return;

    var groups = window.mewepakProductsMenuData.groups;
    var pouchItems = groups['pouch-formats'] && Array.isArray(groups['pouch-formats'].items) ? groups['pouch-formats'].items : [];
    var pouchSplitIndex = Math.ceil(pouchItems.length / 2);
    var desktopTargets = {
      'pouch-formats-primary': {
        target: root.querySelector('.mewepak-products-mega-list--pouch-primary'),
        items: pouchItems.slice(0, pouchSplitIndex)
      },
      'pouch-formats-secondary': {
        target: root.querySelector('.mewepak-products-mega-list--pouch-secondary'),
        items: pouchItems.slice(pouchSplitIndex)
      },
      'specialty-packaging': {
        target: root.querySelector('.mewepak-products-mega-list--specialty'),
        items: groups['specialty-packaging'] && Array.isArray(groups['specialty-packaging'].items) ? groups['specialty-packaging'].items : []
      }
    };

    Object.keys(desktopTargets).forEach(function (groupKey) {
      var config = desktopTargets[groupKey];
      if (!config || !config.target) return;

      config.target.innerHTML = '';

      if (!config.items.length) {
        var emptyItem = document.createElement('li');
        emptyItem.className = 'text-sm text-slate-400';
        emptyItem.textContent = 'No categories yet.';
        config.target.appendChild(emptyItem);
        return;
      }

      config.items.forEach(function (entry) {
        var listItem = document.createElement('li');
        var link = buildProductMenuLink(entry, 'mewepak-products-menu-row !text-gray-600 hover:!text-[#00cfca] transition-colors');
        if (!link) return;
        listItem.appendChild(link);
        config.target.appendChild(listItem);
      });
    });

    var mobilePanel = root.querySelector('[data-mobile-group="Products"] [data-mobile-group-panel]');
    if (mobilePanel) {
      mobilePanel.innerHTML = '';
      ['pouch-formats', 'specialty-packaging'].forEach(function (groupKey) {
        var group = groups[groupKey];
        if (!group || !Array.isArray(group.items) || !group.items.length) return;

        var heading = document.createElement('div');
        heading.className = 'px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider';
        heading.textContent = group.label || '';
        mobilePanel.appendChild(heading);

        group.items.forEach(function (entry) {
          var link = buildProductMenuLink(entry, 'block px-4 py-2 text-sm !text-gray-500 hover:!text-[#00cfca] hover:bg-[#00cfca]/5 rounded-lg transition-colors');
          if (link) mobilePanel.appendChild(link);
        });
      });
    }
  }

  function hydrateCategoryMenuImages(root) {
    if (!root || !window.mewepakMenuCategoryImages) return;

    root.querySelectorAll('a[href^="/products/"]').forEach(function (link) {
      if (link.querySelector('[data-category-menu-thumb]')) return;
      var href = link.getAttribute('href');
      if (!href || /^\/products\/?(#|$)/.test(href)) return;

      var normalized = href.replace(/https?:\/\/[^/]+/i, '').replace(/\/+$/, '') || '/';
      var entry = window.mewepakMenuCategoryImages[normalized];
      if (!entry) return;

      var rebuilt = buildProductMenuLink({
        path: normalized,
        label: entry.label || (link.textContent ? link.textContent.trim() : ''),
        description: entry.description || ''
      }, link.className);

      if (rebuilt) {
        link.replaceWith(rebuilt);
      }
    });
  }

  renderProductsMenu(document);
  hydrateCategoryMenuImages(document);

  document.querySelectorAll('[data-category-gallery]').forEach(function (gallery) {
    var mainImage = gallery.parentElement ? gallery.parentElement.querySelector('[data-category-gallery-main]') : null;
    if (!mainImage) return;

    gallery.querySelectorAll('[data-category-gallery-thumb]').forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var fullSrc = thumb.dataset.fullSrc;
        var fullAlt = thumb.dataset.fullAlt || mainImage.alt;
        if (!fullSrc) return;

        mainImage.src = fullSrc;
        mainImage.alt = fullAlt;

        gallery.querySelectorAll('[data-category-gallery-thumb]').forEach(function (candidate) {
          var active = candidate === thumb;
          candidate.classList.toggle('is-active', active);
          candidate.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
      });
    });
  });

  // Desktop mega menu — hover/focus on each nav item with megaMenu
  var navItems = document.querySelectorAll('[data-nav-item]');
  var panels = document.querySelectorAll('[data-mega-panel]');
  var hideTimer = null;

  function markCurrentNav() {
    var path = window.location.pathname.replace(/\/+$/, '') || '/';
    var links = document.querySelectorAll('[data-nav-link]');
    var sections = [
      { key: 'products', prefix: '/products' },
      { key: 'markets', prefix: '/markets' },
      { key: 'solutions', prefix: '/solutions' },
      { key: 'added-value', prefix: '/added-value' },
      { key: 'sustainability', prefix: '/sustainability' },
      { key: 'blog', prefix: '/blog' },
      { key: 'contact', prefix: '/contact' },
      { key: 'about-us', prefix: '/about-us' }
    ];
    var current = path === '/' ? 'home' : '';

    if (!current) {
      sections.some(function (section) {
        if (path === section.prefix || path.indexOf(section.prefix + '/') === 0) {
          current = section.key;
          return true;
        }
        return false;
      });
    }

    links.forEach(function (link) {
      link.classList.toggle('is-current', link.dataset.navLink === current);
      link.removeAttribute('data-active');
      var chevron = link.querySelector('svg');
      if (chevron) chevron.removeAttribute('data-active');
    });
  }

  markCurrentNav();

  function showPanel(label) {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    panels.forEach(function (p) {
      p.classList.toggle('hidden', p.dataset.megaPanel !== label);
    });
    navItems.forEach(function (item) {
      var match = item.dataset.navItem === label;
      var link = item.querySelector('a');
      if (link) link.dataset.active = match ? 'true' : 'false';
      var chevron = link && link.querySelector('svg');
      if (chevron) chevron.dataset.active = match ? 'true' : 'false';
    });
  }

  function hidePanels() {
    panels.forEach(function (p) { p.classList.add('hidden'); });
    navItems.forEach(function (item) {
      var link = item.querySelector('a');
      if (link) link.dataset.active = 'false';
      var chevron = link && link.querySelector('svg');
      if (chevron) chevron.dataset.active = 'false';
    });
  }

  function scheduleHide() {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(hidePanels, 120);
  }

  navItems.forEach(function (item) {
    var label = item.dataset.navItem;
    item.addEventListener('mouseenter', function () { showPanel(label); });
    item.addEventListener('mouseleave', scheduleHide);
    item.addEventListener('focusin', function () { showPanel(label); });
  });

  panels.forEach(function (panel) {
    panel.addEventListener('mouseenter', function () {
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    });
    panel.addEventListener('mouseleave', scheduleHide);
  });

  // Mobile drawer
  var mobileOpenBtn = document.querySelector('[data-mobile-open]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  var mobileDrawer = document.querySelector('[data-mobile-drawer]');
  var mobileCloseBtns = document.querySelectorAll('[data-mobile-close]');

  function openMobile() {
    if (!mobileMenu || !mobileDrawer) return;
    mobileMenu.classList.remove('hidden');
    requestAnimationFrame(function () {
      mobileDrawer.classList.remove('translate-x-full');
    });
    document.body.style.overflow = 'hidden';
  }

  function closeMobile() {
    if (!mobileMenu || !mobileDrawer) return;
    mobileDrawer.classList.add('translate-x-full');
    setTimeout(function () { mobileMenu.classList.add('hidden'); }, 300);
    document.body.style.overflow = '';
  }

  if (mobileOpenBtn) mobileOpenBtn.addEventListener('click', openMobile);
  mobileCloseBtns.forEach(function (btn) { btn.addEventListener('click', closeMobile); });

  // Mobile collapsible groups
  document.querySelectorAll('[data-mobile-group-trigger]').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var panel = trigger.parentElement.querySelector('[data-mobile-group-panel]');
      var chevron = trigger.querySelector('svg');
      if (!panel) return;
      var willOpen = panel.classList.contains('hidden');
      panel.classList.toggle('hidden', !willOpen);
      if (chevron) chevron.classList.toggle('rotate-180', willOpen);
    });
  });

  // Pretty search URLs: /search/<keyword>/ instead of /?s=<keyword>.
  document.querySelectorAll('form[role="search"]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var input = form.querySelector('input[name="s"]');
      if (!input) return;
      var term = input.value.trim().replace(/\s+/g, ' ');
      if (!term) {
        e.preventDefault();
        input.focus();
        return;
      }
      e.preventDefault();
      window.location.href = '/search/' + encodeURIComponent(term).replace(/%20/g, '+') + '/';
    });
  });

  // Search overlay
  var searchOpenBtn = document.querySelector('[data-search-open]');
  var searchOverlay = document.querySelector('[data-search-overlay]');
  var searchCloseBtns = document.querySelectorAll('[data-search-close]');

  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    var input = searchOverlay.querySelector('input[type="search"]');
    if (input) setTimeout(function () { input.focus(); }, 50);
  }

  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (searchOpenBtn) searchOpenBtn.addEventListener('click', openSearch);
  searchCloseBtns.forEach(function (btn) { btn.addEventListener('click', closeSearch); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMobile();
      closeSearch();
      hidePanels();
    }
  });

  // Scroll reveal
  var reveals = document.querySelectorAll('.mewepak-reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Hero slider
  var hero = document.querySelector('[data-mewepak-hero]');
  if (hero) {
    var texts = hero.querySelectorAll('[data-hero-text]');
    var pouches = hero.querySelectorAll('[data-hero-pouches]');
    var dots = hero.querySelectorAll('[data-hero-dot]');
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var progress = hero.querySelector('[data-hero-progress]');
    var slideCount = texts.length;
    var current = 0;
    var auto = true;
    var DURATION = 5000;
    var TICK = 50;
    var elapsed = 0;
    var timer = null;

    function show(idx) {
      current = (idx + slideCount) % slideCount;
      texts.forEach(function (t) { t.classList.toggle('is-active', Number(t.dataset.heroText) === current); });
      pouches.forEach(function (p) { p.classList.toggle('is-active', Number(p.dataset.heroPouches) === current); });
      dots.forEach(function (d) {
        var on = Number(d.dataset.heroDot) === current;
        d.classList.toggle('w-8', on);
        d.classList.toggle('!bg-[#00cfca]', on);
        d.classList.toggle('w-2', !on);
        d.classList.toggle('!bg-gray-300', !on);
        d.classList.toggle('hover:!bg-gray-400', !on);
      });
      elapsed = 0;
      if (progress) progress.style.width = '0%';
    }

    function tick() {
      if (!auto) return;
      elapsed += TICK;
      if (progress) progress.style.width = Math.min(100, (elapsed / DURATION) * 100) + '%';
      if (elapsed >= DURATION) show(current + 1);
    }

    function start() { if (timer) clearInterval(timer); timer = setInterval(tick, TICK); }

    if (prev) prev.addEventListener('click', function () { show(current - 1); });
    if (next) next.addEventListener('click', function () { show(current + 1); });
    dots.forEach(function (d) { d.addEventListener('click', function () { show(Number(d.dataset.heroDot)); }); });
    hero.addEventListener('mouseenter', function () { auto = false; });
    hero.addEventListener('mouseleave', function () { auto = true; });

    show(0);
    start();
  }

  // Product Showcase — auto-scrolling horizontal carousel
  var showcase = document.querySelector('[data-mewepak-showcase]');
  if (showcase) {
    var track = showcase.querySelector('[data-showcase-track]');
    var btnPrev = showcase.querySelector('[data-showcase-prev]');
    var btnNext = showcase.querySelector('[data-showcase-next]');
    var bar = showcase.querySelector('[data-showcase-progress]');
    var paused = false;

    function maxScroll() { return track.scrollWidth - track.clientWidth; }
    function updateBar() {
      var max = maxScroll();
      bar.style.width = max > 0 ? ((track.scrollLeft / max) * 100) + '%' : '0%';
    }

    function tickShowcase() {
      if (paused) return;
      var max = maxScroll();
      if (max <= 0) return;
      if (track.scrollLeft >= max - 2) track.scrollLeft = 0;
      else track.scrollLeft += 2.5;
      updateBar();
    }
    setInterval(tickShowcase, 24);

    track.addEventListener('scroll', updateBar, { passive: true });
    track.querySelectorAll('.group').forEach(function (card) {
      card.addEventListener('mouseenter', function () { paused = true; });
      card.addEventListener('mouseleave', function () { paused = false; });
    });
    if (btnPrev) btnPrev.addEventListener('click', function () { track.scrollBy({ left: -400, behavior: 'smooth' }); });
    if (btnNext) btnNext.addEventListener('click', function () { track.scrollBy({ left: 400, behavior: 'smooth' }); });
  }

  // Testimonials carousel — sync quote + image + dots
  var tSection = document.querySelector('[data-mewepak-testimonials]');
  if (tSection) {
    var tQuotes = tSection.querySelectorAll('[data-testimonial-quote]');
    var tImages = tSection.querySelectorAll('[data-testimonial-image]');
    var tDots   = tSection.querySelectorAll('[data-testimonial-dot]');
    var tCount  = tQuotes.length;
    var tCur    = 0;

    function tShow(idx) {
      tCur = (idx + tCount) % tCount;
      tQuotes.forEach(function (el) { el.classList.toggle('is-active', Number(el.dataset.testimonialQuote) === tCur); });
      tImages.forEach(function (el) { el.classList.toggle('is-active', Number(el.dataset.testimonialImage) === tCur); });
      tDots.forEach(function (el) {
        var active = Number(el.dataset.testimonialDot) === tCur;
        el.classList.toggle('w-8', active);
        el.classList.toggle('!bg-[#00cfca]', active);
        el.classList.toggle('w-2', !active);
        el.classList.toggle('!bg-gray-300', !active);
      });
    }

    tSection.querySelectorAll('[data-testimonial-prev]').forEach(function (b) { b.addEventListener('click', function () { tShow(tCur - 1); }); });
    tSection.querySelectorAll('[data-testimonial-next]').forEach(function (b) { b.addEventListener('click', function () { tShow(tCur + 1); }); });
    tDots.forEach(function (d) { d.addEventListener('click', function () { tShow(Number(d.dataset.testimonialDot)); }); });
  }

  // Product category detail — staged carousel with center highlight
  document.querySelectorAll('[data-mewepak-product-category-carousel], [data-mewepak-new-solutions-carousel]').forEach(function (carousel) {
    var slides = carousel.querySelectorAll('[data-category-carousel-slide]');
    var dots = carousel.querySelectorAll('[data-category-carousel-dot]');
    var prev = carousel.querySelector('[data-category-carousel-prev]');
    var next = carousel.querySelector('[data-category-carousel-next]');
    var count = slides.length;
    var current = 0;
    var timer = null;
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var stateClasses = [
      'is-center',
      'is-adjacent-left',
      'is-adjacent-right',
      'is-outer-left',
      'is-outer-right',
      'is-hidden'
    ];

    function circularDistance(index) {
      var distance = index - current;
      if (distance > count / 2) distance -= count;
      if (distance < -count / 2) distance += count;
      return distance;
    }

    function classify(distance, index) {
      if (0 === distance) return 'is-center';
      if (1 === distance) return 'is-adjacent-right';
      if (-1 === distance) return 'is-adjacent-left';
      if (count >= 4 && 2 === distance) return 'is-outer-right';
      if (count >= 4 && -2 === distance) return 'is-outer-left';
      if (2 === count && index !== current) return 'is-adjacent-right';
      return 'is-hidden';
    }

    function render() {
      slides.forEach(function (slide, index) {
        var state = classify(circularDistance(index), index);
        stateClasses.forEach(function (cls) { slide.classList.remove(cls); });
        slide.classList.add(state);
        slide.setAttribute('aria-hidden', state === 'is-hidden' ? 'true' : 'false');
        slide.tabIndex = state === 'is-center' ? 0 : -1;
      });

      dots.forEach(function (dot, index) {
        var active = index === current;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
      });
    }

    function show(index) {
      if (!count) return;
      current = (index + count) % count;
      render();
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      if (count <= 1 || reducedMotion) return;
      timer = setInterval(function () { show(current + 1); }, 4000);
    }

    function manual(index) {
      show(index);
      start();
    }

    if (count <= 1) {
      carousel.classList.add('has-single-slide');
    }

    if (prev) prev.addEventListener('click', function () { manual(current - 1); });
    if (next) next.addEventListener('click', function () { manual(current + 1); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        manual(Number(dot.dataset.categoryCarouselIndex) || 0);
      });
    });
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);

    render();
    start();
  });

  // Scroll to top — floating button, shown after scrolling 600px
  var scrollBtns = document.querySelectorAll('[data-scroll-top]');
  if (scrollBtns.length) {
    var toggleScrollBtns = function () {
      var show = window.scrollY > 600;
      scrollBtns.forEach(function (b) {
        b.classList.toggle('hidden', !show);
        b.classList.toggle('flex', show);
      });
    };
    toggleScrollBtns();
    window.addEventListener('scroll', toggleScrollBtns, { passive: true });
    scrollBtns.forEach(function (btn) {
      btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    });
  }

  // Blog category filter
  var blog = document.querySelector('[data-mewepak-blog]');
  if (blog) {
    var filterBtns = blog.querySelectorAll('[data-blog-filter]');
    var cards = blog.querySelectorAll('[data-blog-category]');
    var activeCls = ['!bg-[#00cfca]', '!text-white'];
    var idleCls = ['bg-gray-100', '!text-gray-600', 'hover:bg-gray-200'];
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.dataset.blogFilter;
        filterBtns.forEach(function (b) {
          var on = (b === btn);
          activeCls.forEach(function (c) { b.classList.toggle(c, on); });
          idleCls.forEach(function (c) { b.classList.toggle(c, !on); });
        });
        cards.forEach(function (card) {
          var show = (cat === 'All' || card.dataset.blogCategory === cat);
          card.classList.toggle('hidden', !show);
        });
      });
    });
  }

  // Products archive — per-category horizontal carousels
  document.querySelectorAll('[data-product-carousel]').forEach(function (car) {
    var track = car.querySelector('[data-carousel-track]');
    if (!track) return;
    var step = 280;
    var prev = car.querySelector('[data-carousel-prev]');
    var next = car.querySelector('[data-carousel-next]');
    var update = function () {
      var atStart = track.scrollLeft <= 0;
      var atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 10;
      if (prev) { prev.classList.toggle('hidden', atStart); }
      if (next) { next.classList.toggle('hidden', atEnd); }
    };
    if (prev) { prev.addEventListener('click', function () { track.scrollBy({ left: -step, behavior: 'smooth' }); }); }
    if (next) { next.addEventListener('click', function () { track.scrollBy({ left: step, behavior: 'smooth' }); }); }
    track.addEventListener('scroll', update, { passive: true });
    update();
  });

  // Single product gallery
  document.querySelectorAll('[data-single-gallery]').forEach(function (gallery) {
    var track = gallery.querySelector('[data-single-gallery-track]');
    if (!track) return;
    var slides = track.children.length;
    if (!slides) return;
    var current = 0;
    var prev = gallery.parentElement.querySelector('[data-single-gallery-prev]');
    var next = gallery.parentElement.querySelector('[data-single-gallery-next]');
    var thumbs = gallery.parentElement.parentElement.querySelectorAll('[data-single-gallery-thumb]');

    var render = function () {
      var offset = slides > 0 ? (current * 100) / slides : 0;
      track.style.transform = 'translateX(-' + offset + '%)';
      thumbs.forEach(function (thumb) {
        var active = Number(thumb.dataset.singleGalleryThumb) === current;
        thumb.classList.toggle('border-[#00cfca]', active);
        thumb.classList.toggle('border-gray-100', !active);
      });
    };

    if (prev) {
      prev.addEventListener('click', function () {
        current = (current - 1 + slides) % slides;
        render();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        current = (current + 1) % slides;
        render();
      });
    }
    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        current = Number(thumb.dataset.singleGalleryThumb) || 0;
        render();
      });
    });
    render();
  });

  // Single product image zoom — Taobao style
  document.querySelectorAll('[data-product-zoom]').forEach(function (shell) {
    var image = shell.querySelector('[data-product-zoom-image]');
    var mask = shell.querySelector('.mewepak-single-product__zoom-mask');
    var stage = shell.closest('.mewepak-single-product__stage');
    var preview = stage ? stage.querySelector('[data-product-zoom-preview]') : null;
    var previewWrap = stage ? stage.querySelector('.mewepak-single-product__zoom-preview') : null;
    if (!image || !mask || !preview || !previewWrap || !window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var zoomScale = 2.4;
    var cursorOffset = 24;

    function resetZoom() {
      shell.classList.remove('is-zooming');
      previewWrap.style.opacity = '0';
      mask.style.left = '50%';
      mask.style.top = '50%';
      preview.style.transform = 'translate(0, 0) scale(' + zoomScale + ')';
      previewWrap.style.left = '0px';
      previewWrap.style.top = '0px';
    }

    shell.addEventListener('mouseenter', function () {
      shell.classList.add('is-zooming');
      previewWrap.style.opacity = '1';
      preview.setAttribute('src', image.getAttribute('src') || '');
    });

    shell.addEventListener('mousemove', function (event) {
      var rect = shell.getBoundingClientRect();
      var maskRect = mask.getBoundingClientRect();
      var maskWidth = maskRect.width || rect.width * 0.34;
      var maskHeight = maskRect.height || rect.width * 0.34;
      var halfW = maskWidth / 2;
      var halfH = maskHeight / 2;
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      var clampedX = Math.max(halfW, Math.min(rect.width - halfW, x));
      var clampedY = Math.max(halfH, Math.min(rect.height - halfH, y));
      var ratioX = rect.width > maskWidth ? (clampedX - halfW) / (rect.width - maskWidth) : 0;
      var ratioY = rect.height > maskHeight ? (clampedY - halfH) / (rect.height - maskHeight) : 0;
      var previewMaxX = preview.offsetWidth * (zoomScale - 1);
      var previewMaxY = preview.offsetHeight * (zoomScale - 1);
      var moveX = -previewMaxX * ratioX;
      var moveY = -previewMaxY * ratioY;
      var previewWidth = previewWrap.offsetWidth;
      var previewHeight = previewWrap.offsetHeight;
      var viewportWidth = window.innerWidth;
      var viewportHeight = window.innerHeight;
      var left = event.clientX + cursorOffset;
      var top = event.clientY - (previewHeight / 2);

      if (left + previewWidth > viewportWidth - 16) {
        left = event.clientX - previewWidth - cursorOffset;
      }
      left = Math.max(16, left);
      top = Math.max(16, Math.min(viewportHeight - previewHeight - 16, top));

      mask.style.left = clampedX + 'px';
      mask.style.top = clampedY + 'px';
      previewWrap.style.left = left + 'px';
      previewWrap.style.top = top + 'px';
      preview.style.transform = 'translate(' + moveX + 'px, ' + moveY + 'px) scale(' + zoomScale + ')';
    });

    shell.addEventListener('mouseleave', resetZoom);
    resetZoom();
  });

  // Form submissions (quote + newsletter) → Fluent Forms via admin-ajax
  var cfg = window.mewepakForms || null;
  if (cfg && cfg.ajaxUrl) {
    var showMsg = function (el, text, ok) {
      if (!el) return;
      el.textContent = text;
      el.classList.remove('hidden');
      el.classList.toggle('!text-red-600', !ok);
    };

    var submitForm = function (form, opts) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!opts.formId) { return; }
        var btn = form.querySelector('button[type="submit"]');
        var label = form.querySelector(opts.labelSel);
        var msg = form.querySelector(opts.msgSel);
        var original = label ? label.textContent : '';

        // Build Fluent's expected `data` payload as a URL-encoded query string.
        var pairs = [];
        opts.fields.forEach(function (f) {
          var input = form.querySelector('[name="' + f + '"]');
          pairs.push(encodeURIComponent(f) + '=' + encodeURIComponent(input ? input.value.trim() : ''));
        });
        var body = new FormData();
        body.append('action', 'fluentform_submit');
        body.append('form_id', opts.formId);
        body.append('data', pairs.join('&'));

        if (btn) { btn.disabled = true; }
        if (label) { label.textContent = opts.sending; }
        if (msg) { msg.classList.add('hidden'); }

        fetch(cfg.ajaxUrl, { method: 'POST', body: body, credentials: 'same-origin' })
          .then(function (res) { return res.json(); })
          .then(function (r) {
            if (r && r.success) {
              var m = (r.data && r.data.result && r.data.result.message) ? r.data.result.message : opts.success;
              showMsg(msg, m, true);
              form.reset();
            } else {
              var err = (r && r.data && r.data.errors) ? Object.keys(r.data.errors).map(function (k) {
                var v = r.data.errors[k];
                return (typeof v === 'object') ? Object.values(v)[0] : v;
              }).join(' ') : 'Something went wrong. Please try again.';
              showMsg(msg, err || 'Something went wrong. Please try again.', false);
            }
          })
          .catch(function () { showMsg(msg, 'Network error. Please try again.', false); })
          .finally(function () {
            if (btn) { btn.disabled = false; }
            if (label) { label.textContent = original; }
          });
      });
    };

    document.querySelectorAll('[data-mewepak-quote]').forEach(function (form) {
      submitForm(form, {
        formId: cfg.quoteFormId,
        fields: ['name', 'company', 'email', 'phone', 'product_type', 'quantity', 'details'],
        labelSel: '[data-quote-label]',
        msgSel: '[data-quote-message]',
        sending: 'Sending…',
        success: 'Thank you. Your quote request has been received — we respond within 24 hours.'
      });
    });

    document.querySelectorAll('[data-mewepak-subscribe]').forEach(function (form) {
      submitForm(form, {
        formId: cfg.newsFormId,
        fields: ['email'],
        labelSel: '[data-subscribe-label]',
        msgSel: '[data-subscribe-message]',
        sending: 'Sending…',
        success: "Thanks for subscribing. You'll hear from us soon."
      });
    });
  }
  // Product detail tabs (Features / Materials / Benefits / Markets)
  document.querySelectorAll('[data-product-tabs]').forEach(function (container) {
    var tabs   = container.querySelectorAll('[role="tab"]');
    var panels = container.querySelectorAll('[role="tabpanel"]');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var idx = tab.dataset.tab;

        tabs.forEach(function (t) {
          var on = t.dataset.tab === idx;
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.classList.toggle('is-active', on);
          t.classList.toggle('!text-[#0a1628]', on);
          t.classList.toggle('!text-gray-500', !on);
          t.classList.toggle('hover:!text-gray-700', !on);
        });

        panels.forEach(function (panel) {
          panel.classList.toggle('hidden', panel.dataset.panel !== idx);
        });
      });
    });
  });

  // Spec tabs (Technical / Materials / Finishing / Benefits / Custom)
  document.querySelectorAll('[data-spec-tabs]').forEach(function (container) {
    var tabs   = container.querySelectorAll('[data-spec-tab]');
    var panels = container.querySelectorAll('[data-spec-panel]');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var key = tab.dataset.specTab;

        tabs.forEach(function (t) {
          var on = t.dataset.specTab === key;
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.classList.toggle('is-active', on);
          t.classList.toggle('!text-[#0a1628]', on);
          t.classList.toggle('!text-gray-500', !on);
          t.classList.toggle('hover:!text-[#0a1628]', !on);
        });

        panels.forEach(function (panel) {
          panel.classList.toggle('hidden', panel.dataset.specPanel !== key);
        });
      });
    });
  });

})();
