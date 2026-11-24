const logo = '/assets/media/home-thumbs/mewepak-logo-420.webp';
const pouchMarks = {
  'prepress-proof.webp': ['proof'],
  'print-finishes.webp': ['print-left', 'print-centre', 'print-right'],
  'materials-workbench.webp': ['material'],
  'format-library.webp': ['library'],
};

export function brandedVisual(src, alt, caption, escape, { eager = false, className = '', expand = false, embeddedLogo = false } = {}) {
  const marks = embeddedLogo ? [] : pouchMarks[src.split('/').pop()] || [];
  const media = expand
    ? '<button class="mwp-visual__media image-magnifier" type="button" aria-pressed="false" aria-label="Zoom image of ' + escape(alt) + '">'
    : '<div class="mwp-visual__media">';
  return `<figure class="mwp-visual ${className}">
    ${media}
      <img class="mwp-visual__image" src="${escape(src)}" alt="${escape(alt)}" width="1200" height="800" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
      ${marks.map(mark => `<img class="mwp-visual__mark mwp-visual__mark--${mark}" src="${logo}" alt="" width="108" height="35" aria-hidden="true">`).join('')}
    ${expand ? '</button>' : '</div>'}
    <figcaption>${embeddedLogo ? '' : `<img src="${logo}" alt="Mewepak" width="108" height="35" loading="lazy" decoding="async">`}<span>${escape(caption)}</span>
      ${expand ? '<span>Hover or tap the image to zoom</span>' : ''}
    </figcaption>
  </figure>`;
}
