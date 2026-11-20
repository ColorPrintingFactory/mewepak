const logo = '/assets/media/home-thumbs/mewepak-logo-420.webp';
const pouchMarks = {
  'prepress-proof.webp': ['proof'],
  'print-finishes.webp': ['print-left', 'print-centre', 'print-right'],
  'materials-workbench.webp': ['material'],
  'format-library.webp': ['library'],
};

export function brandedVisual(src, alt, caption, escape, { eager = false, className = '', expand = false } = {}) {
  const marks = pouchMarks[src.split('/').pop()] || [];
  return `<figure class="mwp-visual ${className}">
    <div class="mwp-visual__media">
      <img class="mwp-visual__image" src="${escape(src)}" alt="${escape(alt)}" width="1200" height="800" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
      ${marks.map(mark => `<img class="mwp-visual__mark mwp-visual__mark--${mark}" src="${logo}" alt="" width="108" height="35" aria-hidden="true">`).join('')}
    </div>
    <figcaption><img src="${logo}" alt="Mewepak" width="108" height="35" loading="lazy" decoding="async"><span>${escape(caption)}</span>
      ${expand ? `<a href="${escape(src)}" target="_blank" rel="noopener">View larger <span aria-hidden="true">↗</span></a>` : ''}
    </figcaption>
  </figure>`;
}
