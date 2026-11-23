(() => {
  const shopHeader = document.querySelector(".wp-site-blocks > header");
  const emailLink = shopHeader?.querySelector('a[href^="mailto:"]');
  const whatsappLink = shopHeader?.querySelector('a[href^="https://wa.me/"]');
  const config = {
    email:
      emailLink?.getAttribute("href").slice(7).split("?")[0] ||
      "sales@mewepak.com",
    whatsapp:
      whatsappLink
        ?.getAttribute("href")
        .replace(/^https:\/\/wa\.me\//, "")
        .split("?")[0] || "",
    originalUrl:
      location.origin +
      "/products/stand-up-pouch/premium-almonds-window-stand-up-pouch/",
  };
  const $ = (id) => document.getElementById(id);
  let size = "100g",
    finish = "Matte",
    application = "Premium almonds";
  const images = {
    original: "/assets/client-design/almond-pouch/almond-pouch-original.webp",
    alternate: "/assets/client-design/almond-pouch/almond-pouch-alternate.webp",
    detail: "/assets/client-design/almond-pouch/almond-pouch-original.webp",
  };
  const productName = "Premium Almonds Window Stand-Up Pouch";
  let enquiryProduct = productName;
  let currentImage = "original";
  document.querySelectorAll("[data-size]").forEach((b) =>
    b.addEventListener("click", () => {
      size = b.dataset.size;
      document
        .querySelectorAll("[data-size]")
        .forEach((x) => x.setAttribute("aria-pressed", x === b));
    }),
  );
  document.querySelectorAll("[data-finish]").forEach((b) =>
    b.addEventListener("click", () => {
      finish = b.dataset.finish;
      document
        .querySelectorAll("[data-finish]")
        .forEach((x) => x.setAttribute("aria-pressed", x === b));
    }),
  );
  document.querySelectorAll("[data-image]").forEach((b) =>
    b.addEventListener("click", () => {
      currentImage = b.dataset.image;
      $("productimage").src = images[currentImage];
      $("productimage").classList.toggle(
        "is-window-detail",
        currentImage === "detail",
      );
      $("productimage").alt =
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
    }),
  );
  $("zoom").addEventListener("click", () => {
    $("large-image").src = images[currentImage];
    $("image-dialog").showModal();
  });
  function quote(app, selectedProduct = productName) {
    enquiryProduct = selectedProduct;
    application = app || "Premium almonds";
    $("request-summary").textContent =
      enquiryProduct +
      " · " +
      (selectedProduct === productName ? size : "Size to discuss") +
      " · " +
      finish;
    $("form-size").value = size;
    $("form-finish").value = finish;
    $("form-application").value = application;
    $("form-status").textContent = "";
    $("quote-dialog").showModal();
  }
  document
    .querySelectorAll("[data-quote]")
    .forEach((b) => b.addEventListener("click", () => quote()));
  document
    .querySelectorAll("[data-application]")
    .forEach((b) =>
      b.addEventListener("click", () => quote(b.dataset.application)),
    );
  function brief() {
    const d = new FormData($("quote-form"));
    return (
      "Hello MewePak,\n\nI would like to discuss " +
      enquiryProduct +
      ".\n\n" +
      [
        ["Name", "name"],
        ["Email", "email"],
        ["Company", "company"],
        ["Delivery region", "country"],
        ["Quantity", "quantity"],
        ["Fill weight / size", "size"],
        ["Finish", "finish"],
        ["Application", "application"],
        ["Project details", "notes"],
      ]
        .map(([a, b]) => a + ": " + (d.get(b) || "Not specified"))
        .join("\n") +
      "\n\nProduct reference: " +
      config.originalUrl
    );
  }
  $("quote-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const url =
      "mailto:" +
      config.email +
      "?subject=" +
      encodeURIComponent("Quote enquiry: " + enquiryProduct) +
      "&body=" +
      encodeURIComponent(brief());
    window.location.href = url;
    $("form-status").textContent =
      "Your email draft is ready to open. If your email app does not open, use Copy Brief and email " +
      config.email +
      ".";
  });
  async function copy(text, status) {
    try {
      await navigator.clipboard.writeText(text);
      $(status).textContent = "Copied. You can paste it into your message.";
    } catch (e) {
      $(status).textContent =
        "Automatic copy is unavailable here. Select the message text to copy it manually.";
    }
  }
  $("copy-brief").addEventListener("click", () => copy(brief(), "form-status"));
  function whatsapp() {
    const message =
      "Hello MewePak, I am interested in the " +
      productName +
      ".\nPreferred size: " +
      size +
      "\nPreferred finish: " +
      finish +
      "\nPlease help me review the material, window, quantity and quote.\n" +
      config.originalUrl;
    $("wa-message").textContent = message;
    const number = (config.whatsapp || "").replace(/\D/g, "");
    $("wa-link").href =
      "https://wa.me/" +
      (number ? number : "") +
      "?text=" +
      encodeURIComponent(message);
    $("wa-help").textContent = number
      ? "Review your enquiry, then open the MewePak chat in WhatsApp."
      : "Select your MewePak contact in WhatsApp to send this enquiry.";
    $("wa-status").textContent = "";
    $("wa-dialog").showModal();
  }
  document
    .querySelectorAll("[data-whatsapp]")
    .forEach((b) => b.addEventListener("click", whatsapp));
  $("copy-wa").addEventListener("click", () =>
    copy($("wa-message").textContent, "wa-status"),
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
  document.querySelectorAll(".section-nav a").forEach((a) =>
    a.addEventListener("click", () => {
      document
        .querySelectorAll(".section-nav a")
        .forEach((x) => x.classList.toggle("active", x === a));
    }),
  );

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
  document.querySelectorAll("[data-recommend-enquiry]").forEach((button) =>
    button.addEventListener("click", () => {
      quote(button.dataset.recommendEnquiry, button.dataset.bagTitle);
      document.getElementById("form-size").value = "";
    }),
  );
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
