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

export const homeReviewsPreview = `
<section class="mw-section mw-reviews-preview" id="mw-customer-reviews" aria-labelledby="mw-customer-reviews-title">
  <div class="mw-inner">
    <div class="mw-review-panel">
      <div class="mw-review-copy">
        <p class="mw-eyebrow">Preview</p>
        <h2 class="mw-heading" id="mw-customer-reviews-title">Customer reviews</h2>
        <p class="mw-description">Customer feedback will appear here once it is approved for publication.</p>
      </div>
      <img src="/assets/media/packaging-guides/event-sample-meeting-pouch-print.webp" width="1200" height="800" alt="" loading="lazy" decoding="async">
    </div>
  </div>
</section>`;
