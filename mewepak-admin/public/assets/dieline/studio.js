import { buildDieline, exportPdf, exportSvg, formats } from './geometry.js?v=4';

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
const formatNote = document.querySelector('#dl-format-note');
const fitmentField = document.querySelector('#dl-fitment');
const featureOptions = form.querySelector('.dl-options');
const unitByName = { mm: 1, in: 25.4 };
const packFields = ['width', 'height', 'depth'];
const numericFields = [...packFields, 'seal', 'bleed', 'safe', 'zipperPosition', 'notchPosition', 'valvePosition', 'holePosition', 'fitmentOffset'];
const featureNames = [['zipper', 'zipper'], ['notch', 'tear notch'], ['valve', 'valve'], ['hole', 'hang hole']];
const presetIndex = { small: 0, medium: 1, large: 2 };
const defaultContext = '/inquiry/#quote-request';
const short = (number, precision = 3) => String(Number(number.toFixed(precision)));
const zoomStops = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5];
let unit = field('unit').value;
let model;
let zoomIndex = 0;

function applyPreset() {
  const spec = formats[field('format').value];
  const size = spec.sizes[presetIndex[field('preset').value]];
  if (!size) return;
  size.forEach((n, index) => { field(packFields[index]).value = short(n / unitByName[unit], 8); });
  const fitting = spec.fitment;
  if (fitting) field('fitmentOffset').value = short((fitting.offset ?? size[0] / 2) / unitByName[unit], 8);
}

function changeFormat() {
  const spec = formats[field('format').value];
  if (field('preset').value === 'custom') field('preset').value = 'medium';
  const repeat = spec.web === 'repeat';
  field('seal').value = short((spec.seal ?? 8) / unitByName[unit], 8);
  document.querySelector('#dl-width-label').textContent = repeat ? 'Web width' : 'Width';
  document.querySelector('#dl-height-label').textContent = repeat ? 'Print repeat length' : 'Height';
  document.querySelector('#dl-depth').hidden = !spec.depthLabel;
  document.querySelector('#dl-depth-label').textContent = spec.depthLabel ?? '';
  document.querySelector('#dl-features-title').textContent = spec.features.length || spec.fitment ? 'Features and guides' : 'Print guides';
  document.querySelector('#dl-position-help').hidden = !spec.features.length;
  featureOptions.hidden = !spec.features.length;
  fitmentField.hidden = !spec.fitment;
  fitmentField.firstElementChild.textContent = spec.fitment?.label ?? '';
  formatNote.textContent = spec.note ?? '';
  formatNote.hidden = !spec.note;
  applyPreset();
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
  const spec = formats[format];
  const options = Object.fromEntries(numericFields.map(name =>
    [name, Number((field(name).valueAsNumber * unitByName[unit]).toFixed(6))]));
  for (const [key] of featureNames) {
    const available = spec.features.includes(key);
    field(key).closest('label').hidden = field(key).disabled = !available;
    options[key] = available && field(key).checked;
    form.querySelector('[data-for-feature="' + key + '"]').hidden = !options[key];
  }
  for (const input of form.querySelectorAll('[aria-invalid]')) input.removeAttribute('aria-invalid');
  try {
    model = buildDieline({ format, ...options });
    status.hidden = true;
    view.innerHTML = exportSvg(model, { preview: true });
    dimensions.textContent = spec.name + ' · ' + [options.width, options.height, ...(spec.depthLabel ? [options.depth] : [])]
      .map(n => short(n / unitByName[unit])).join(' × ') + ' ' + unit;
    const measured = (name) => short(options[name] / unitByName[unit]);
    const features = featureNames.filter(([key]) => options[key]).map(([key, label]) =>
      label + ' ' + measured(key + 'Position') + ' ' + unit);
    if (spec.fitment) features.push(spec.fitment.label + ' ' + measured('fitmentOffset') + ' ' + unit);
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
    if (target.name === 'format') changeFormat();
    else applyPreset();
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
const requestedFormat = new URLSearchParams(location.search).get('format');
if (Object.hasOwn(formats, requestedFormat)) field('format').value = requestedFormat;
changeFormat();
update();
