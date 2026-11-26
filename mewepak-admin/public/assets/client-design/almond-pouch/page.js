(() => {
  const page = document.querySelector(".mw-almond-pouch");
  if (!page) return;
  const $ = (id) => document.getElementById(id);
  const productName = page.dataset.productName || page.querySelector("h1").innerText.replace(/\s+/g, " ").trim();
  const productType = page.dataset.productType || "Stand-up pouch";
  const defaultApplication = page.dataset.productApplication ?? $("form-application").value;
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

  const quoteForm = $("quote-form");
  const quoteDialog = $("quote-dialog");
  const waDialog = $("wa-dialog");
  const productUrl = new URL(location.pathname, location.origin).href;
  let enquiryProduct = productName;

  for (const link of quoteLinks) {
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      const { bagTitle, application, recommendEnquiry } = link.dataset;
      enquiryProduct = bagTitle || productName;
      quoteForm.elements.size.value = bagTitle ? "" : size;
      quoteForm.elements.finish.value = bagTitle ? "Please advise" : finish;
      quoteForm.elements.application.value =
        recommendEnquiry || application || defaultApplication;
      $("request-summary").textContent = [
        enquiryProduct,
        quoteForm.elements.size.value || "Size to discuss",
        quoteForm.elements.finish.value,
      ].join(" · ");
      $("form-status").textContent = "";
      quoteDialog.showModal();
      quoteDialog.scrollTop = 0;
    });
  }

  function quoteBrief() {
    const details = [
      ["Name", "name"],
      ["Email", "email"],
      ["Company", "company"],
      ["Delivery region", "country"],
      ["Quantity", "quantity"],
      ["Fill weight / size", "size"],
      ["Finish", "finish"],
      ["Application", "application"],
      ["Project details", "notes"],
    ].map(
      ([label, name]) =>
        `${label}: ${quoteForm.elements[name].value.trim() || "Not specified"}`,
    );
    return [
      "Hello MewePak,",
      "",
      `I would like to discuss ${enquiryProduct}.`,
      "",
      ...details,
      "",
      `Product reference: ${productUrl}`,
    ].join("\n");
  }

  async function copyBrief(text, status) {
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = "Copied. You can paste it into your message.";
    } catch {
      status.textContent =
        "Could not copy automatically. You can still open the prepared message.";
    }
  }

  quoteForm.addEventListener("formdata", ({ formData }) => {
    formData.set("company", formData.get("company").trim() || "Not supplied");
    formData.set("product_type", enquiryProduct === productName ? productType : "Stand-up pouch");
    formData.set("product_context", enquiryProduct);
    formData.set("details", quoteBrief());
  });
  $("copy-brief").addEventListener("click", () => {
    if (quoteForm.reportValidity()) copyBrief(quoteBrief(), $("form-status"));
  });

  for (const link of whatsappLinks) {
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      const message = [
        `Hello MewePak, I am interested in the ${productName}.`,
        `Preferred size: ${size || "To discuss"}`,
        `Preferred finish: ${finish}`,
        "Please help me review the material, packaging options, quantity and quote.",
        productUrl,
      ].join("\n");
      $("wa-message").textContent = message;
      const action = $("wa-link");
      action.href = whatsappNumber
        ? `https://wa.me/${whatsappNumber}?${new URLSearchParams({ text: message })}`
        : "/contact/";
      action.textContent = whatsappNumber ? "Open WhatsApp" : "Contact MewePak";
      $("wa-help").textContent = whatsappNumber
        ? "Review your enquiry, then open the MewePak chat in WhatsApp."
        : "Copy your message or contact the MewePak team directly.";
      $("wa-status").textContent = "";
      waDialog.showModal();
      waDialog.scrollTop = 0;
    });
  }
  $("copy-wa").addEventListener("click", () =>
    copyBrief($("wa-message").textContent, $("wa-status")),
  );

  function bindProductGallery() {
    const productImage = $("productimage");
    if (!productImage) return;
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
      const fit = style.objectFit === "contain" ? Math.min : Math.max;
      const scale = style.objectFit === "none" ? 1 : fit(
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
    const thumbnails = page.querySelectorAll("[data-image]");
    thumbnails.forEach((b) =>
      b.addEventListener("click", () => {
        productImage.src = b.dataset.imageSrc || b.querySelector("img").src;
        productImage.classList.toggle("is-window-detail", b.dataset.image === "detail");
        productImage.alt = b.dataset.imageAlt || b.querySelector("img").alt;
        $("artwork-label").textContent = b.dataset.imageLabel || b.getAttribute("aria-label");
        thumbnails.forEach((x) => x.setAttribute("aria-pressed", x === b));
        renderLens();
      }),
    );
  }
  bindProductGallery();

  page.querySelectorAll("[data-size]").forEach((b) =>
    b.addEventListener("click", () => {
      size = b.dataset.size;
      page
        .querySelectorAll("[data-size]")
        .forEach((x) => x.setAttribute("aria-pressed", x === b));
    }),
  );
  page.querySelectorAll("[data-finish]").forEach((b) =>
    b.addEventListener("click", () => {
      finish = b.dataset.finish;
      page
        .querySelectorAll("[data-finish]")
        .forEach((x) => x.setAttribute("aria-pressed", x === b));
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
  recUI();
  recStart();
})();
