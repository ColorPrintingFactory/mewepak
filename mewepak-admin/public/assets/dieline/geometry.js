export const formats = {
  'stand-up-pouch': 'Stand-up pouch',
  'flat-pouch': 'Flat pouch',
  'flat-bottom-pouch': 'Flat-bottom pouch',
};

const layers = {
  bleed: { color: '#a33f73', dash: [2, 1] },
  cut: { color: '#183a46', dash: [] },
  seal: { color: '#9b4c31', dash: [3, 1] },
  fold: { color: '#4958a6', dash: [4, 1, 1, 1] },
  safe: { color: '#168468', dash: [1, 1] },
  feature: { color: '#347b9f', dash: [] },
};

const round = value => Number(value.toFixed(6));
const extent = (n, low, high) => Number.isFinite(n) && n >= low && n <= high;
const rectangle = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];

export function buildDieline({ format, width, height, depth, seal, zipper, notch, valve, hole }) {
  if (!Object.hasOwn(formats, format)) throw new RangeError('Choose a supported pouch format.');
  if (!extent(width, 60, 450) || !extent(height, 90, 600)) {
    throw new RangeError('Enter a width of 60–450 mm and a height of 90–600 mm, or the equivalent in inches.');
  }
  if (!extent(seal, 3, 15) || 2 * (seal + 3) >= width) {
    throw new RangeError('Enter a seal margin of 3–15 mm, or the equivalent in inches.');
  }
  const hasBase = format !== 'flat-pouch';
  if (hasBase && (!extent(depth, 20, 220) || depth <= 2 * seal + 6 || depth > width)) {
    throw new RangeError('Enter a depth of 20–220 mm. It must fit within the pouch width and leave space between seals.');
  }
  const side = format === 'flat-bottom-pouch';
  const strokes = Object.fromEntries(Object.keys(layers).map(name => [name, []]));
  const labels = [];
  const add = (layer, points) => strokes[layer].push(points);
  const panel = (name, x, y, w, h, artTop = seal + 3) => {
    add('bleed', rectangle(x - 3, y - 3, w + 6, h + 6));
    add('cut', rectangle(x, y, w, h));
    add('seal', rectangle(x + seal, y + seal, w - 2 * seal, h - 2 * seal));
    add('safe', rectangle(x + seal + 3, y + artTop, w - 2 * (seal + 3), h - artTop - seal - 3));
    labels.push({ x, y: y - 5, text: name + ' / ' + round(w) + ' x ' + round(h) + ' mm' });
  };
  const x = 13;
  const y = 36;
  const step = width + 18;
  const zipperY = Math.max(23, seal + 12);
  const holeY = Math.max(9, seal + 4.5);
  const artTop = Math.max(seal + 3, zipper ? zipperY + 4 : 0, hole ? holeY + 8 : 0);

  panel('Front', x, y, width, height, artTop);
  panel('Back', x + step, y, width, height, artTop);
  if (hasBase) {
    panel(side ? 'Bottom panel' : 'Bottom gusset', x, y + height + 20, width, depth);
    if (!side) add('fold', [[x, y + height + 20 + depth / 2], [x + width, y + height + 20 + depth / 2]]);
  }
  if (side) {
    const sideX = x + 2 * step;
    panel('Side A', sideX, y, depth, height);
    panel('Side B', sideX + depth + 18, y, depth, height);
    add('fold', [[sideX + depth / 2, y], [sideX + depth / 2, y + height]]);
    add('fold', [[sideX + depth + 18 + depth / 2, y], [sideX + depth + 18 + depth / 2, y + height]]);
  }
  for (const left of [x, x + step]) {
    if (zipper) add('feature', [[left + seal, y + zipperY], [left + width - seal, y + zipperY]]);
    if (notch) add('feature', [[left, y + holeY], [left + 2.5, y + holeY + 2], [left, y + holeY + 4]]);
    if (hole) add('feature', circle(left + width / 2, y + holeY, 3));
  }
  if (valve) add('feature', circle(x + step + width / 2, y + Math.max(artTop + 12, height * .34), 5));

  return {
    format,
    width: Math.max(170, 2 * x + 2 * width + 18 + (side ? 2 * depth + 36 : 0)),
    height: y + height + (hasBase ? depth + 20 : 0) + 16,
    strokes,
    labels: [
      { x, y: 11, text: formats[format] + ' | Mewepak design reference' },
      { x, y: 19, text: 'Draft for prepress review / all dimensions in mm / scale 1:1' },
      ...labels,
    ],
  };
}

function circle(x, y, r) {
  return Array.from({ length: 33 }, (_, i) => {
    const theta = i * Math.PI / 16;
    return [x + r * Math.cos(theta), y + r * Math.sin(theta)];
  });
}

export function exportSvg(model) {
  const { width, height, strokes, labels } = model;
  const groups = Object.entries(layers).map(([id, { color, dash }]) => {
    const paths = strokes[id].map(points => '<polyline points="' +
      points.map(([x, y]) => round(x) + ',' + round(y)).join(' ') + '"/>').join('');
    return '<g id="' + id + '" fill="none" stroke="' + color + '" stroke-width=".55"' +
      (dash.length ? ' stroke-dasharray="' + dash.join(' ') + '"' : '') + '>' + paths + '</g>';
  }).join('');
  const text = labels.map(({ x, y, text }) => '<text x="' + x + '" y="' + y + '">' + text + '</text>').join('');
  return '<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pouch panels and guides" width="' +
    width + 'mm" height="' + height + 'mm" viewBox="0 0 ' + width + ' ' + height + '">' + groups +
    '<g id="annotations" fill="#334e57" font-family="Arial,sans-serif" font-size="4">' + text + '</g></svg>';
}

export function exportPdf(model) {
  const pt = mm => round(mm * 72 / 25.4);
  const position = ([x, y]) => pt(x) + ' ' + pt(model.height - y);
  const commands = [pt(.55) + ' w'];
  for (const [name, { color, dash }] of Object.entries(layers)) {
    const rgb = color.slice(1).match(/../g).map(part => round(parseInt(part, 16) / 255));
    commands.push(rgb.join(' ') + ' RG', '[' + dash.map(pt).join(' ') + '] 0 d');
    for (const points of model.strokes[name]) {
      commands.push(points.map((point, i) => position(point) + (i ? ' l' : ' m')).join(' ') + ' S');
    }
  }
  commands.push('0.2 0.31 0.34 rg');
  for (const { x, y, text } of model.labels) {
    commands.push('BT /F1 ' + pt(4) + ' Tf ' + position([x, y]) + ' Td (' + text.replace(/[()\\]/g, '\\$&') + ') Tj ET');
  }
  const stream = commands.join('\n') + '\n';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Count 1 /Kids [3 0 R] >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pt(model.width) + ' ' + pt(model.height) +
      '] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Length ' + stream.length + ' >>\nstream\n' + stream + 'endstream',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [];
  for (const [i, object] of objects.entries()) {
    offsets.push(String(pdf.length).padStart(10, '0') + ' 00000 n ');
    pdf += (i + 1) + ' 0 obj\n' + object + '\nendobj\n';
  }
  return pdf + 'xref\n0 6\n0000000000 65535 f \n' + offsets.join('\n') + '\ntrailer\n' +
    '<< /Size 6 /Root 1 0 R >>\nstartxref\n' + pdf.length + '\n%%EOF\n';
}
