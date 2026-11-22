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
  dimensions: { color: '#526970', dash: [] },
};

const round = value => Number(value.toFixed(6));
const extent = (n, low, high) => Number.isFinite(n) && n >= low && n <= high;
const rectangle = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];

const invalid = (message, ...fields) => new RangeError(message, { cause: fields });

export function buildDieline(options) {
  const { format, width, height, depth, seal, zipper, notch, valve, hole } = options;
  const { bleed = 3, safe = 3, zipperPosition = 25, notchPosition = 12, valvePosition = 62, holePosition = 12 } = options;
  if (!Object.hasOwn(formats, format)) throw invalid('Choose a supported pouch format.', 'format');
  if (!extent(width, 60, 450)) throw invalid('Enter a width of 60–450 mm or the equivalent in inches.', 'width');
  if (!extent(height, 90, 600)) throw invalid('Enter a height of 90–600 mm or the equivalent in inches.', 'height');
  if (!extent(seal, 3, 15)) throw invalid('Enter a seal margin of 3–15 mm or the equivalent in inches.', 'seal');
  if (!extent(bleed, 0, 8)) throw invalid('Enter a bleed of 0–8 mm or the equivalent in inches.', 'bleed');
  if (!extent(safe, 0, 10)) throw invalid('Enter an artwork inset of 0–10 mm or the equivalent in inches.', 'safe');
  const inset = seal + safe;
  const hasBase = format !== 'flat-pouch';
  if (hasBase && (!extent(depth, 20, 220) || depth <= 2 * inset || depth > width)) {
    throw invalid('Depth must be 20–220 mm, fit within the pouch width and leave room for the artwork inset.', 'depth');
  }
  const featureLimits = [
    [zipper, zipperPosition, seal + 3, height - inset - 7, 'Zipper', 'zipperPosition'],
    [notch, notchPosition, seal + 2, height - seal - 4, 'Tear notch', 'notchPosition'],
    [valve, valvePosition, seal + 6, height - inset - 6, 'Valve', 'valvePosition'],
    [hole, holePosition, seal + 3, height - seal - 4, 'Hang hole', 'holePosition'],
  ];
  for (const [enabled, value, min, max, name, input] of featureLimits) {
    if (enabled && !extent(value, min, max)) {
      throw invalid(name + ' position must be ' + min + '–' + max + ' mm from the top.', input);
    }
  }
  if (zipper && notch && notchPosition + 3 >= zipperPosition) {
    throw invalid('Place the tear notch at least 4 mm above the zipper.', 'notchPosition', 'zipperPosition');
  }
  if (zipper && valve && Math.abs(valvePosition - zipperPosition) < 7) {
    throw invalid('Leave at least 7 mm between the valve centre and zipper.', 'valvePosition', 'zipperPosition');
  }
  if (zipper && hole && Math.abs(holePosition - zipperPosition) < 5) {
    throw invalid('Leave at least 5 mm between the hang hole centre and zipper.', 'holePosition', 'zipperPosition');
  }
  if (hole && valve && Math.abs(holePosition - valvePosition) < 9) {
    throw invalid('Leave at least 9 mm between valve and hang hole centres.', 'holePosition', 'valvePosition');
  }

  const side = format === 'flat-bottom-pouch';
  const strokes = Object.fromEntries(Object.keys(layers).map(name => [name, []]));
  const labels = [];
  const panels = [];
  const add = (layer, points) => strokes[layer].push(points);
  function panel(name, x, y, w, h, artTop = inset) {
    if (bleed) add('bleed', rectangle(x - bleed, y - bleed, w + 2 * bleed, h + 2 * bleed));
    const outline = rectangle(x, y, w, h);
    const sealGuide = rectangle(x + seal, y + seal, w - 2 * seal, h - 2 * seal);
    add('cut', outline);
    add('seal', sealGuide);
    add('safe', rectangle(x + inset, y + artTop, w - 2 * inset, h - artTop - inset));
    panels.push({ outline, sealGuide });
    labels.push({ x, y: y - bleed - 3.5, text: name, size: 5 });
  }
  function dimension(x, y, length, vertical = false) {
    const point = (a, b) => vertical ? [x + b, y + a] : [x + a, y + b];
    add('dimensions', [[0, 0], [length, 0]].map(p => point(...p)));
    for (const [at, direction] of [[0, 1], [length, -1]]) {
      add('dimensions', [[at, -2.2], [at, 2.2]].map(p => point(...p)));
      add('dimensions', [[at + direction * 3, -1.5], [at, 0], [at + direction * 3, 1.5]].map(p => point(...p)));
    }
    const [textX, textY] = point(length / 2, vertical ? -3 : -2.5);
    labels.push({ x: textX, y: textY, rotate: vertical, centered: true, text: display(length) + ' mm', size: 4.6 });
  }
  const x = 31;
  const y = 48;
  const gap = 30;
  const step = width + gap;
  const artTop = Math.max(inset, zipper ? zipperPosition + 4 : 0);
  const baseY = y + height + 35;

  panel('FRONT', x, y, width, height, artTop);
  panel('BACK', x + step, y, width, height, artTop);
  dimension(x, y + height + 15, width);
  dimension(x - 15, y, height, true);
  if (hasBase) {
    panel(side ? 'BOTTOM PANEL' : 'BOTTOM GUSSET', x, baseY, width, depth);
    dimension(x - 15, baseY, depth, true);
    if (!side) add('fold', [[x, baseY + depth / 2], [x + width, baseY + depth / 2]]);
  }
  if (side) {
    const sideX = x + 2 * step;
    panel('SIDE A', sideX, y, depth, height);
    panel('SIDE B', sideX + depth + gap, y, depth, height);
    dimension(sideX, y + height + 15, depth);
    add('fold', [[sideX + depth / 2, y], [sideX + depth / 2, y + height]]);
    add('fold', [[sideX + depth + gap + depth / 2, y], [sideX + depth + gap + depth / 2, y + height]]);
  }
  for (const left of [x, x + step]) {
    if (zipper) {
      for (const offset of [0, 1.7]) {
        add('feature', [[left + seal, y + zipperPosition + offset], [left + width - seal, y + zipperPosition + offset]]);
      }
    }
    if (notch) add('feature', [[left, y + notchPosition - 2], [left + 2.5, y + notchPosition], [left, y + notchPosition + 2]]);
    if (hole) add('feature', circle(left + width / 2, y + holePosition, 3));
  }
  if (valve) {
    const valveX = x + step + width / 2;
    add('feature', circle(valveX, y + valvePosition, 5));
    add('feature', circle(valveX, y + valvePosition, 1.1));
  }

  const edge = 18;
  const endY = hasBase ? baseY + depth : y + height + 16;
  return {
    format, panels,
    width: x + 2 * width + gap + (side ? 2 * depth + 2 * gap : 0) + edge,
    height: endY + 22,
    strokes,
    labels: [
      { x: 12, y: 13, text: formats[format] + ' / Mewepak', size: 6.5 },
      { x: 12, y: 22, text: 'Design reference - prepress review required | 1:1 | millimetres', size: 4.1 },
      ...labels,
      { x, y: endY + 15, text: 'Seal ' + display(seal) + ' mm / Bleed ' + display(bleed) + ' mm / Artwork inset ' + display(safe) + ' mm', size: 4 },
    ],
  };
}

const display = n => Number(n.toFixed(2));
function circle(x, y, r) {
  return Array.from({ length: 33 }, (_, i) => {
    const theta = i * Math.PI / 16;
    return [x + r * Math.cos(theta), y + r * Math.sin(theta)];
  });
}

export function exportSvg(model, { preview = false } = {}) {
  const { width, height, strokes, labels } = model;
  const groups = Object.entries(layers).map(([id, { color, dash }]) => {
    const paths = strokes[id].map(points => '<polyline points="' +
      points.map(([x, y]) => round(x) + ',' + round(y)).join(' ') + '"/>').join('');
    return '<g id="' + id + '" fill="none" stroke="' + color + '" stroke-width=".55"' +
      (dash.length ? ' stroke-dasharray="' + dash.join(' ') + '"' : '') + '>' + paths + '</g>';
  }).join('');
  const text = labels.map(({ x, y, text, size, rotate, centered }) => {
    const angle = rotate ? ' transform="rotate(-90 ' + x + ' ' + y + ')"' : '';
    return '<text x="' + x + '" y="' + y + '" font-size="' + size + '"' + angle +
      (centered ? ' text-anchor="middle"' : '') + '>' + text + '</text>';
  }).join('');
  const fill = (points, color) => '<polygon fill="' + color + '" points="' + points.map(p => p.join(',')).join(' ') + '"/>';
  const sheet = preview ? '<rect width="100%" height="100%" fill="#fff"/>' +
    model.panels.map(({ outline, sealGuide }) => fill(outline, '#e2ece7') + fill(sealGuide, '#fff')).join('') : '';
  return '<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dimensioned pouch panels and guides" width="' +
    width + 'mm" height="' + height + 'mm" viewBox="0 0 ' + width + ' ' + height + '">' + sheet + groups +
    '<g id="annotations" fill="#334e57" font-family="Arial,sans-serif">' + text + '</g></svg>';
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
  for (const { x, y, text, size, rotate, centered } of model.labels) {
    const shift = centered ? text.length * size * .24 : 0;
    const origin = rotate ? [x, y + shift] : [x - shift, y];
    commands.push('BT /F1 ' + pt(size) + ' Tf ' + (rotate ? '0 1 -1 0 ' : '1 0 0 1 ') +
      position(origin) + ' Tm (' + text.replace(/[()\\]/g, '\\$&') + ') Tj ET');
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
