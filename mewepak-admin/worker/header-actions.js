import homeCopy from './i18n/home.json' with { type: 'json' };

export const headerActionsAssets = '<link rel="stylesheet" href="/assets/header-actions.css?v=1">';

const escape = value => value.replace(/[&<>"']/g, char => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]
));

export function renderHeaderActions({
  quoteHref = '/inquiry/#quote-request', bookingHref = '/booking/', lang = 'en', variant,
} = {}) {
  const index = ['de', 'es', 'fr', 'ar'].indexOf(lang);
  const quote = 'Request a Quote';
  const booking = 'Book a Consultation';
  const className = 'mw-header-actions' + (variant ? ' mw-header-actions--' + variant : '');
  return `<div class="${className}">
    <a data-header-action="quote" href="${escape(quoteHref)}">${escape(homeCopy[quote][index] || quote)}</a>
    <a data-header-action="booking" href="${escape(bookingHref)}">${escape(homeCopy[booking][index] || booking)}</a>
  </div>`;
}
