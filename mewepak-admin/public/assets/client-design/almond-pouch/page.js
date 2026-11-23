(() => {
  const page = document.querySelector(".mw-almond-pouch");
  const $ = (id) => document.getElementById(id);
  const productName = "Premium Almonds Window Stand-Up Pouch";
  const quoteLinks = page.querySelectorAll(
    "[data-quote], [data-application], [data-recommend-enquiry]",
  );
  const whatsappLinks = page.querySelectorAll("[data-whatsapp]");
  const whatsappNumber = document
    .querySelector('.wp-site-blocks > header a[href^="https://wa.me/"]')
    ?.getAttribute("href")
    .match(/^https:\/\/wa\.me\/([1-9]\d{5,14})(?:[?#]|$)/)?.[1];
  let size = page.querySelector('[data-size][aria-pressed="true"]').dataset
    .size;
  let finish = page.querySelector('[data-finish][aria-pressed="true"]').dataset
    .finish;

  function updateEnquiryLinks() {
    for (const link of quoteLinks) {
      const { bagTitle, application, recommendEnquiry } = link.dataset;
      const query = new URLSearchParams({
        format: "stand-up-pouch",
        product: bagTitle || productName,
      });
      if (!bagTitle) {
        query.set("size", size);
        query.set(
          "finish",
          finish === "Soft-touch matte" ? "Soft touch" : finish,
        );
      }
      const use = recommendEnquiry || application;
      if (use) query.set("application", use);
      link.href = "/inquiry/?" + query + "#quote-request";
    }
    if (!whatsappNumber) return;
    const productUrl = new URL(location.pathname, location.origin).href;
    const message = [
      `Hello MewePak, I am interested in the ${productName}.`,
      `Preferred size: ${size}`,
      `Preferred finish: ${finish}`,
      "Please help me review the material, window, quantity and quote.",
      productUrl,
    ].join("\n");
    const url = `https://wa.me/${whatsappNumber}?${new URLSearchParams({ text: message })}`;
    for (const link of whatsappLinks) {
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  }

  if (!whatsappNumber) {
    for (const link of whatsappLinks)
      link.querySelector("span").textContent = "Contact MewePak";
  }
  updateEnquiryLinks();
  const images = {
    original: "/assets/client-design/almond-pouch/almond-pouch-original.webp",
    alternate: "/assets/client-design/almond-pouch/almond-pouch-alternate.webp",
    detail: "/assets/client-design/almond-pouch/almond-pouch-original.webp",
  };
  const productImage = $("productimage");
  const photo = productImage.parentElement;
  const lens = $("product-lens");
  const zoom = $("zoom");
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  let pinned = false;
  let hovered = false;
  let focal = [0.5, 0.5];

  function renderLens() {
    lens.hidden =
      !(pinned || hovered) ||
      !productImage.complete ||
      !productImage.naturalWidth;
    if (lens.hidden) return;

    const width = photo.clientWidth;
    const height = photo.clientHeight;
    const style = getComputedStyle(productImage);
    const scale =
      style.objectFit === "none"
        ? 1
        : Math.max(
            width / productImage.naturalWidth,
            height / productImage.naturalHeight,
          );
    const [positionX, positionY] = style.objectPosition
      .split(" ")
      .map((value) => parseFloat(value) / 100);
    const renderedWidth = productImage.naturalWidth * scale;
    const renderedHeight = productImage.naturalHeight * scale;
    const [x, y] = [focal[0] * width, focal[1] * height];
    const imageX = x - (width - renderedWidth) * positionX;
    const imageY = y - (height - renderedHeight) * positionY;
    const diameter = lens.offsetWidth;
    const half = diameter / 2;
    const magnification = 2.25;
    const zoomWidth = renderedWidth * magnification;
    const zoomHeight = renderedHeight * magnification;

    lens.style.left = `${clamp(x - half, 0, width - diameter)}px`;
    lens.style.top = `${clamp(y - half, 0, height - diameter)}px`;
    lens.style.backgroundImage = `url("${productImage.src}")`;
    lens.style.backgroundSize = `${zoomWidth}px ${zoomHeight}px`;
    lens.style.backgroundPosition = `${clamp(half - imageX * magnification, diameter - zoomWidth, 0)}px ${clamp(half - imageY * magnification, diameter - zoomHeight, 0)}px`;
  }

  function trackPointer(event) {
    const bounds = photo.getBoundingClientRect();
    focal = [
      clamp(
        (event.clientX - bounds.left - photo.clientLeft) / photo.clientWidth,
        0,
        1,
      ),
      clamp(
        (event.clientY - bounds.top - photo.clientTop) / photo.clientHeight,
        0,
        1,
      ),
    ];
    renderLens();
  }

  photo.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    hovered = !zoom.contains(event.target);
    if (hovered) trackPointer(event);
    else renderLens();
  });
  photo.addEventListener("pointerleave", () => {
    hovered = false;
    renderLens();
  });
  photo.addEventListener("pointerdown", (event) => {
    if (pinned && event.pointerType === "touch" && !zoom.contains(event.target))
      trackPointer(event);
  });
  zoom.addEventListener("click", () => {
    pinned = !pinned;
    zoom.setAttribute("aria-pressed", String(pinned));
    focal = [0.5, 0.5];
    renderLens();
  });
  zoom.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && pinned) {
      pinned = hovered = false;
      zoom.setAttribute("aria-pressed", "false");
      renderLens();
      return;
    }
    const direction = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }[event.key];
    if (!pinned || !direction) return;
    event.preventDefault();
    focal = focal.map((value, index) =>
      clamp(value + direction[index] * 0.1, 0, 1),
    );
    renderLens();
  });
  productImage.addEventListener("load", renderLens);
  productImage.addEventListener("error", renderLens);
  window.addEventListener("resize", renderLens);
  document.querySelectorAll("[data-size]").forEach((b) =>
    b.addEventListener("click", () => {
      size = b.dataset.size;
      updateEnquiryLinks();
      document
        .querySelectorAll("[data-size]")
        .forEach((x) => x.setAttribute("aria-pressed", x === b));
    }),
  );
  document.querySelectorAll("[data-finish]").forEach((b) =>
    b.addEventListener("click", () => {
      finish = b.dataset.finish;
      updateEnquiryLinks();
      document
        .querySelectorAll("[data-finish]")
        .forEach((x) => x.setAttribute("aria-pressed", x === b));
    }),
  );
  document.querySelectorAll("[data-image]").forEach((b) =>
    b.addEventListener("click", () => {
      const currentImage = b.dataset.image;
      productImage.src = images[currentImage];
      productImage.classList.toggle(
        "is-window-detail",
        currentImage === "detail",
      );
      productImage.alt =
        currentImage === "alternate"
          ? "Supplied alternate almond pouch artwork, front and back"
          : currentImage === "detail"
            ? "Close-up of the transparent almond window"
            : "Original cream and maroon almond pouch artwork, front and back";
      $("artwork-label").textContent =
        currentImage === "alternate"
          ? "Alternate supplied artwork"
          : currentImage === "detail"
            ? "Original artwork · Window detail"
            : "Original artwork · Front & back";
      document
        .querySelectorAll("[data-image]")
        .forEach((x) => x.setAttribute("aria-pressed", x === b));
      renderLens();
    }),
  );
  document
    .querySelectorAll("[data-close]")
    .forEach((b) =>
      b.addEventListener("click", () => b.closest("dialog").close()),
    );
  document.querySelectorAll(".mw-almond-pouch dialog").forEach((d) =>
    d.addEventListener("click", (e) => {
      if (e.target === d) {
        const r = d.getBoundingClientRect();
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        )
          d.close();
      }
    }),
  );
  const sectionLinks = page.querySelectorAll(".section-nav a");
  function syncSectionNav() {
    const current =
      [...sectionLinks].find((link) => link.hash === location.hash) ||
      sectionLinks[0];
    for (const link of sectionLinks) {
      link.classList.toggle("active", link === current);
      if (link === current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  }
  window.addEventListener("hashchange", syncSectionNav);
  syncSectionNav();

  const recommendTrack = document.getElementById("recommend-track");
  const recommendCards = [
    ...recommendTrack.querySelectorAll(".recommend-card"),
  ];
  const recMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let recIndex = 0,
    recPaused = recMotion.matches,
    recHover = false,
    recTimer;
  function recVisible() {
    return Math.max(
      1,
      Math.round(
        (recommendTrack.clientWidth + 20) /
          (recommendCards[0].getBoundingClientRect().width + 20),
      ),
    );
  }
  function recMax() {
    return Math.max(0, recommendCards.length - recVisible());
  }
  function recUI() {
    document.getElementById("recommend-status").textContent =
      `Showing ${recIndex + 1}–${Math.min(recIndex + recVisible(), recommendCards.length)} of ${recommendCards.length} recommended bags`;
    document.getElementById("rec-toggle").textContent = recPaused
      ? "Play slideshow"
      : "Pause slideshow";
    document
      .getElementById("rec-toggle")
      .setAttribute("aria-pressed", String(recPaused));
  }
  function recGo(index) {
    recIndex = (index + recMax() + 1) % (recMax() + 1);
    recommendTrack.scrollTo({
      left: recommendCards[recIndex].offsetLeft - recommendCards[0].offsetLeft,
      behavior: recMotion.matches ? "auto" : "smooth",
    });
    recUI();
  }
  function recStart() {
    clearInterval(recTimer);
    if (!recPaused)
      recTimer = setInterval(() => {
        if (
          !recHover &&
          !recommendTrack.contains(document.activeElement) &&
          !document.hidden &&
          !document.querySelector("dialog[open]")
        )
          recGo(recIndex + 1);
      }, 6000);
  }
  document.getElementById("rec-prev").addEventListener("click", () => {
    recGo(recIndex - 1);
    recStart();
  });
  document.getElementById("rec-next").addEventListener("click", () => {
    recGo(recIndex + 1);
    recStart();
  });
  document.getElementById("rec-toggle").addEventListener("click", () => {
    recPaused = !recPaused;
    recUI();
    recStart();
  });
  recommendTrack.addEventListener("mouseenter", () => (recHover = true));
  recommendTrack.addEventListener("mouseleave", () => (recHover = false));
  let recScrollTimer;
  recommendTrack.addEventListener(
    "scroll",
    () => {
      clearTimeout(recScrollTimer);
      recScrollTimer = setTimeout(() => {
        recIndex = Math.min(
          recMax(),
          Math.round(
            recommendTrack.scrollLeft /
              (recommendCards[0].getBoundingClientRect().width + 20),
          ),
        );
        recUI();
      }, 120);
    },
    { passive: true },
  );
  window.addEventListener("resize", () => {
    recIndex = Math.min(recIndex, recMax());
    recGo(recIndex);
  });
  recMotion.addEventListener("change", () => {
    if (recMotion.matches) {
      recPaused = true;
      recUI();
      recStart();
    }
  });
  document.querySelectorAll("[data-recommend-preview]").forEach((button) =>
    button.addEventListener("click", () => {
      const img = button.querySelector("img");
      document.getElementById("recommend-large-image").src = img.src;
      document.getElementById("recommend-large-image").alt = img.alt;
      document.getElementById("recommend-preview-title").textContent =
        button.dataset.recommendPreview;
      document.getElementById("recommend-preview").showModal();
    }),
  );
  recUI();
  recStart();
})();
