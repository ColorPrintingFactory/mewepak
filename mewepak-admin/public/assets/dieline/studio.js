import { buildDieline, exportPdf, exportSvg, formats } from './geometry.js';

const form = document.querySelector('#dl-form');
const field = name => form.elements.namedItem(name);
const view = document.querySelector('#dl-preview');
const status = document.querySelector('#dl-error');
const dimensions = document.querySelector('#dl-dimensions');
const svgButton = document.querySelector('#dl-svg');
const pdfButton = document.querySelector('#dl-pdf');
const quote = document.querySelector('#dl-quote');
const unitByName = { mm: 1, in: 25.4 };
const numericFields = ['width', 'height', 'depth', 'seal'];
const defaultContext = '/inquiry/#quote-request';
let unit = field('unit').value;
let model;

const short = number => String(Number(number.toFixed(3)));
function update() {
  const format = field('format').value;
  const hasDepth = format !== 'flat-pouch';
  document.querySelector('#dl-depth').hidden = !hasDepth;
  const options = Object.fromEntries(numericFields.map(name => [name, Number((field(name).valueAsNumber * unitByName[unit]).toFixed(6))]));
  for (const name of ['notch', 'zipper', 'valve', 'hole']) options[name] = field(name).checked;
  try {
    model = buildDieline({ format, ...options });
    status.hidden = true;
    view.innerHTML = exportSvg(model);
    dimensions.textContent = [options.width, options.height, ...(hasDepth ? [options.depth] : [])]
      .map(n => short(n / unitByName[unit])).join(' × ') + ' ' + unit;
    const featureNames = [['zipper', 'zipper'], ['notch', 'tear notch'], ['valve', 'valve'], ['hole', 'hang hole']];
    const features = featureNames.filter(([key]) => options[key]).map(([, label]) => label);
    const context = formats[format] + ' ' + dimensions.textContent + ', seal ' +
      short(options.seal / unitByName[unit]) + ' ' + unit + (features.length ? ', ' + features.join(', ') : '');
    const params = new URLSearchParams({ format, service: 'prepress', product: context });
    quote.href = '/inquiry/?' + params + '#quote-request';
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;
    model = null;
    view.replaceChildren();
    dimensions.textContent = '';
    quote.href = defaultContext;
    status.textContent = error.message;
    status.hidden = false;
  }
  svgButton.disabled = pdfButton.disabled = !model;
}

form.addEventListener('input', () => {
  const nextUnit = field('unit').value;
  if (nextUnit !== unit) {
    for (const name of numericFields) {
      const input = field(name);
      if (input.value !== '') {
        input.value = Number((input.valueAsNumber * unitByName[unit] / unitByName[nextUnit]).toFixed(8));
      }
    }
    unit = nextUnit;
  }
  update();
});
form.addEventListener('submit', event => event.preventDefault());

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
