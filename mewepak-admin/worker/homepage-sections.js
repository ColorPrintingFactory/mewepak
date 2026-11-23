import { previewFormats } from './preview-formats.js';

const types = [
  ['stand-up-pouch', 'Stand Up Pouch'],
  ['flat-bottom-pouch', 'Flat Bottom Pouch'],
  ['flat-pouch', 'Flat Pouch'],
  ['quad-seal-bag', 'Quad Seal Bag'],
  ['spout-pouch', 'Spout Pouch'],
  ['stand-up-pouch-tap', 'Stand Up Pouch with Tap'],
  ['retort-pouch', 'Retort Pouch'],
  ['shaped-pouch', 'Shaped Pouch'],
  ['bag-in-box', 'Bag-In-Box'],
  ['roll-stock-films', 'Roll Stock Films'],
];

const directory = '/assets/client-design/format-icons';
const icon = (slug, style) => `<img class="mw-format-${style}" src="${directory}/${slug}-${style}.webp" alt="" width="219" height="210" loading="lazy" decoding="async">`;

export const homeFormatSection = `
<section class="mw-section mw-formats" id="mw-formats" aria-labelledby="mw-formats-title">
  <div class="mw-inner">
    <div class="mw-section-header">
      <div><h2 class="mw-heading" id="mw-formats-title">Choose your packaging format</h2></div>
      <a class="mw-text-action mw-formats-all" href="/products/"><span>Explore all packaging formats</span><span aria-hidden="true">↗</span></a>
    </div>
    <ul class="mw-format-grid">
      ${types.map(([slug, label]) => `
        <li>
          <a class="mw-format-card" href="/products/${slug}/">
            <span class="mw-format-art">${slug === 'roll-stock-films' ? '' : icon(slug, 'line')}${icon(slug, 'sample')}</span>
            <span class="mw-format-label">${label}</span>
          </a>
        </li>`).join('')}
    </ul>
  </div>
</section>`;

const sustainabilityPriorities = [
  ['Lightweighting',
    '<path d="M20 4C12 3 7 8 8 15c7 1 12-4 12-11ZM4 20l11-11M7 16l-2-3m6 0 4 1"/>'],
  ['Recycled content',
    '<path d="M10 4h4v6h4l-6 6-6-6h4zM4 16v4h16v-4"/>'],
  ['Design for recycling',
    '<path d="m9 6 2-3 2 3m-2-3 4 7M18 10l4 1-1 4m1-4-5 8M9 20H5v-4m0 4 4-8m1 8h5M4 12l2-3"/>'],
  ['Renewable materials',
    '<path d="M12 20v-8m0 3C7 15 4 12 4 7c5 0 8 3 8 8Zm0-3c0-5 3-8 8-8 0 5-3 8-8 8Z"/>'],
  ['Refill and reuse',
    '<path d="M8 8h8l2 4v8H6v-8l2-4Zm2 0V4h6l2 2M9 15h6"/>'],
  ['Product protection',
    '<path d="M12 22s7-4 7-10V5l-7-3-7 3v7c0 6 7 10 7 10Zm-3-11 2 2 4-4"/>'],
  ['Packaging footprint',
    '<path d="M3 20h18M6 16v-4m6 4V8m6 8V4M4 9l5-4"/>'],
];

export const homeSustainabilitySection = `
<section class="mw-section mw-home-sustainability" id="mw-sustainability" aria-labelledby="hy-r-heading">
  <div class="mw-inner">
    <div class="mw-sustainability-heading">
      <h2 class="mw-heading" id="hy-r-heading">Sustainable packaging options</h2>
      <a class="mw-sustainability-link" href="/sustainability/"><span>Explore sustainable packaging</span><span aria-hidden="true">↗</span></a>
    </div>
    <ul class="mw-sustainability-grid" tabindex="0" aria-labelledby="hy-r-heading">
      ${sustainabilityPriorities.map(([title, drawing]) => `
        <li>
          <span class="mw-sustainability-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${drawing}</svg>
          </span>
          <h3>${title}</h3>
        </li>`).join('')}
    </ul>
  </div>
</section>`;

const homePreviewModels = [...previewFormats.values()];

export const homePreviewSection = `
<section class="mw-section mw-home-preview" id="packaging-preview" data-home-preview aria-labelledby="mw-home-preview-title">
  <div class="mw-inner">
    <div class="mw-home-preview-heading">
      <div>
        <h2 class="mw-heading" id="mw-home-preview-title">See your packaging design in 3D</h2>
        <p>Choose a format, add your artwork and rotate the pack to check it from every angle.</p>
      </div>
      <label class="mw-preview-format">
        <span>Packaging format</span>
        <select data-packaging-select disabled>
          ${homePreviewModels.map(({ id, name }) => `<option value="${id}">${name}</option>`).join('')}
        </select>
      </label>
    </div>
    <div class="mewepak-3d-container" data-bg-color="#eff3f0" aria-label="Interactive 3D packaging preview"
      data-packaging-models='${JSON.stringify(homePreviewModels)}'>
      <img class="mewepak-3d-poster" src="${homePreviewModels[0].poster}" alt="Stand-up pouch" loading="lazy" decoding="async">
    </div>
    <div class="mw-home-preview-meta">
      <p>Your artwork stays in this browser tab.</p>
      <a class="mw-text-action" href="/3d-preview/#packaging-preview"><span>Open the full 3D preview</span><span aria-hidden="true">↗</span></a>
    </div>
  </div>
</section>`;

const reviewExamples = [
  {
    quote: 'Seeing the filled samples side by side made it easier to choose a pouch that sits well on the shelf and shows our artwork clearly.',
    role: 'Coffee packaging project',
    image: 'packaging-guides/event-sample-meeting-pouch-print.webp',
  },
  {
    quote: 'We compared matte and gloss samples under the same lighting before choosing a finish for our snack range.',
    role: 'Snack packaging project',
    image: 'packaging-guides/print-finishes.webp',
  },
  {
    quote: 'The format comparison helped us narrow down the pouch styles to two options we could trial on our filling line.',
    role: 'Pouch format project',
    image: 'packaging-guides/packaging-comparison-pouch-print.webp',
  },
  {
    quote: 'Having the prepress proof in front of us made it easier to catch a small artwork change before the print run.',
    role: 'Printed packaging project',
    image: 'packaging-guides/prepress-proof.webp',
  },
  {
    quote: 'We used the samples to check how the pouch handled after chilling, including how it opened and sealed.',
    role: 'Chilled food packaging project',
    image: 'blog-covers/choosing-packaging-for-frozen-chilled-foods.webp',
  },
];

export const homeReviewsPreview = `
<section class="mw-section mw-reviews-preview" id="mw-customer-reviews" aria-labelledby="mw-customer-reviews-title">
  <div class="mw-inner">
    <h2 class="mw-sr" id="mw-customer-reviews-title">Customer reviews</h2>
    <div class="mw-review-carousel">
      <div class="mw-review-slides" aria-live="polite" aria-atomic="true">
        ${reviewExamples.map(({ quote, role, image }, index) => `
          <div class="mw-review-slide" data-review-slide${index ? ' hidden' : ''}>
            <figure class="mw-review-copy">
              <p class="mw-eyebrow">Example testimonial</p>
              <blockquote><p>${quote}</p></blockquote>
              <figcaption>
                <strong>Sample buyer</strong>
                <span>${role}</span>
              </figcaption>
            </figure>
            <img src="/assets/media/${image}" width="1200" height="800" alt="" loading="lazy" decoding="async">
          </div>`).join('')}
      </div>
      <div class="mw-review-controls" data-review-controls hidden>
        <button type="button" class="mw-review-arrow mw-review-prev" data-review-step="-1" aria-label="Previous testimonial"></button>
        <div class="mw-review-dots" role="group" aria-label="Choose a testimonial">
          <span class="mw-sr" id="mw-review-page-label">Testimonial</span>
          ${reviewExamples.map((_, index) => `
            <button type="button" data-review-page="${index}" aria-labelledby="mw-review-page-label mw-review-page-${index}"${index ? '' : ' aria-current="true"'}>
              <span class="mw-sr" id="mw-review-page-${index}">${index + 1}</span>
            </button>`).join('')}
        </div>
        <button type="button" class="mw-review-arrow mw-review-next" data-review-step="1" aria-label="Next testimonial"></button>
      </div>
    </div>
  </div>
</section>`;
