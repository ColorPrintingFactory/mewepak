import { buildDieline, exportPdf, exportSvg, formats } from './geometry.js?v=2';

const form = document.querySelector('#dl-form');
const field = name => form.elements.namedItem(name);
const stage = document.querySelector('#dl-stage');
const view = document.querySelector('#dl-preview');
const empty = document.querySelector('#dl-empty');
const status = document.querySelector('#dl-error');
const dimensions = document.querySelector('#dl-dimensions');
const svgButton = document.querySelector('#dl-svg');
const pdfButton = document.querySelector('#dl-pdf');
const fitButton = document.querySelector('#dl-fit');
const zoomIn = document.querySelector('#dl-zoom-in');
const zoomOut = document.querySelector('#dl-zoom-out');
const quote = document.querySelector('#dl-quote');
const unitByName = { mm: 1, in: 25.4 };
const packFields = ['width', 'height', 'depth'];
const numericFields = [...packFields, 'seal', 'bleed', 'safe', 'zipperPosition', 'notchPosition', 'valvePosition', 'holePosition'];
const featureNames = [['zipper', 'zipper'], ['notch', 'tear notch'], ['valve', 'valve'], ['hole', 'hang hole']];
const presetSizes = {
  'stand-up-pouch': { small: [90, 145, 50], medium: [120, 200, 70], large: [190, 270, 95] },
  'flat-pouch': { small: [75, 105], medium: [110, 170], large: [160, 230] },
  'flat-bottom-pouch': { small: [90, 155, 55], medium: [130, 220, 75], large: [185, 280, 100] },
};
const defaultContext = '/inquiry/#quote-request';
const short = (number, precision = 3) => String(Number(number.toFixed(precision)));
const zoomStops = [1, 1.25, 1.5, 2, 2.5, 3];
let unit = field('unit').value;
let model;
let zoomIndex = 0;

function applyPreset() {
  const size = presetSizes[field('format').value][field('preset').value];
  if (!size) return;
  size.forEach((n, index) => { field(packFields[index]).value = short(n / unitByName[unit], 8); });
}

function sizePreview() {
  const zoom = zoomStops[zoomIndex];
  fitButton.textContent = zoomIndex ? Math.round(zoom * 100) + '%' : 'Fit';
  zoomOut.disabled = !model || zoomIndex === 0;
  zoomIn.disabled = !model || zoomIndex === zoomStops.length - 1;
  fitButton.disabled = !model || zoomIndex === 0;
  if (!model) return;
  const box = getComputedStyle(stage);
  const pad = parseFloat(box.paddingLeft) + parseFloat(box.paddingRight);
  const height = parseFloat(box.maxHeight) - parseFloat(box.paddingTop) - parseFloat(box.paddingBottom);
  const maxWidth = stage.clientWidth - pad - 2;
  const fit = Math.min(maxWidth, height * model.width / model.height);
  view.style.setProperty('--dl-zoom', Math.max(0, fit * zoom) + 'px');
}

function update() {
  const format = field('format').value;
  const hasDepth = format !== 'flat-pouch';
  document.querySelector('#dl-depth').hidden = !hasDepth;
  document.querySelector('#dl-depth-label').textContent = format === 'flat-bottom-pouch' ? 'Base depth' : 'Bottom gusset';
  const options = Object.fromEntries(numericFields.map(name =>
    [name, Number((field(name).valueAsNumber * unitByName[unit]).toFixed(6))]));
  for (const [key] of featureNames) {
    options[key] = field(key).checked;
    form.querySelector('[data-for-feature="' + key + '"]').hidden = !options[key];
  }
  for (const input of form.querySelectorAll('[aria-invalid]')) input.removeAttribute('aria-invalid');
  try {
    model = buildDieline({ format, ...options });
    status.hidden = true;
    view.innerHTML = exportSvg(model, { preview: true });
    dimensions.textContent = formats[format] + ' · ' + [options.width, options.height, ...(hasDepth ? [options.depth] : [])]
      .map(n => short(n / unitByName[unit])).join(' × ') + ' ' + unit;
    const measured = (name) => short(options[name] / unitByName[unit]);
    const features = featureNames.filter(([key]) => options[key]).map(([key, label]) =>
      label + ' ' + measured(key + 'Position') + ' ' + unit);
    const context = dimensions.textContent + ', seal ' + measured('seal') + ' ' + unit +
      (features.length ? ', ' + features.join(', ') : '');
    quote.href = '/inquiry/?' + new URLSearchParams({ format, service: 'prepress', product: context }) + '#quote-request';
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    model = null;
    view.replaceChildren();
    dimensions.textContent = '';
    quote.href = defaultContext;
    status.textContent = error.message;
    status.hidden = false;
    for (const name of error.cause || []) {
      const input = field(name);
      input?.setAttribute('aria-invalid', 'true');
      const details = input?.closest('details');
      if (details) details.open = true;
    }
  }
  empty.hidden = !!model;
  svgButton.disabled = pdfButton.disabled = !model;
  sizePreview();
}

form.addEventListener('input', ({ target }) => {
  const nextUnit = field('unit').value;
  if (nextUnit !== unit) {
    for (const name of numericFields) {
      const input = field(name);
      if (input.value !== '') input.value = short(input.valueAsNumber * unitByName[unit] / unitByName[nextUnit], 8);
    }
    unit = nextUnit;
  }
  if (packFields.includes(target.name)) field('preset').value = 'custom';
  if (target.name === 'preset' || target.name === 'format') {
    applyPreset();
    zoomIndex = 0;
    stage.scrollTo(0, 0);
  }
  update();
});
form.addEventListener('submit', event => event.preventDefault());
zoomOut.addEventListener('click', () => { zoomIndex--; sizePreview(); });
zoomIn.addEventListener('click', () => { zoomIndex++; sizePreview(); });
fitButton.addEventListener('click', () => { zoomIndex = 0; sizePreview(); stage.scrollTo(0, 0); });
window.addEventListener('resize', sizePreview);

function download(extension, mime, exportFile) {
  if (!model) return;
  const link = document.createElement('a');
  const url = URL.createObjectURL(new Blob([exportFile(model)], { type: mime }));
  link.href = url;
  link.download = 'mewepak-' + model.format + '-design-reference.' + extension;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

svgButton.addEventListener('click', () => download('svg', 'image/svg+xml', exportSvg));
pdfButton.addEventListener('click', () => download('pdf', 'application/pdf', exportPdf));
update();
