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
