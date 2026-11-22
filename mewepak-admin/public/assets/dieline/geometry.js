const dryFeatures = ['zipper', 'notch', 'valve', 'hole'];

export const formats = {
  'stand-up-pouch': {
    name: 'Stand-up pouch', sizes: [[90, 145, 50], [120, 200, 70], [190, 270, 95]],
    base: 'BOTTOM GUSSET', depthLabel: 'Bottom gusset', features: dryFeatures,
  },
  'flat-pouch': {
    name: 'Flat pouch', sizes: [[75, 105], [110, 170], [160, 230]], features: dryFeatures,
  },
  'flat-bottom-pouch': {
    name: 'Flat-bottom pouch', sizes: [[90, 155, 55], [130, 220, 75], [185, 280, 100]],
    base: 'BOTTOM PANEL', depthLabel: 'Base depth', sides: true, features: dryFeatures,
  },
  'pinch-bottom-pouches': {
    name: 'Pinch-bottom pouch', sizes: [[110, 195, 55], [165, 270, 85], [230, 380, 115]],
    sides: true, depthLabel: 'Side gusset', pinch: true, features: dryFeatures,
    note: 'Includes side gussets and a fold-over base flap. Confirm the flap with prepress.',
  },
  'quad-seal-bag': {
    name: 'Quad-seal bag', sizes: [[90, 170, 50], [135, 230, 70], [200, 320, 95]],
    sides: true, depthLabel: 'Side gusset', quad: true, features: dryFeatures,
    note: 'Check panel widths and four corner seal positions with prepress.',
  },
  'retort-pouch': {
    name: 'Retort pouch', sizes: [[90, 120], [125, 170], [165, 225]],
    seal: 10, chamfer: 4, features: ['notch'],
    note: 'This flat retort layout uses an example seal margin. Confirm the required seal width with prepress.',
  },
  'shaped-pouch': {
    name: 'Shaped pouch', sizes: [[85, 125], [115, 170], [160, 225]],
    chamfer: 16, features: [],
    note: 'This example uses a clipped-corner outline. Share your actual contour with prepress for a custom die.',
  },
  'polybag': {
    name: 'Polybag', sizes: [[100, 155], [175, 240], [260, 360]],
    web: 'folded', features: [],
    note: 'Shows a side-sealed bag with a bottom fold and an open filling edge.',
  },
  'spout-pouch': {
    name: 'Spout pouch', sizes: [[80, 125, 50], [105, 160, 60], [145, 210, 80]],
    base: 'BOTTOM GUSSET', depthLabel: 'Bottom gusset', features: [],
    fitment: { name: 'Spout', label: 'Spout centre from left', axis: 'left' },
    note: 'Spout shown on the top seal. Confirm the neck and flange dimensions for your fitting.',
  },
  'stand-up-pouch-tap': {
    name: 'Stand-up pouch with tap', sizes: [[160, 220, 85], [225, 300, 110], [300, 400, 150]],
    base: 'BOTTOM GUSSET', depthLabel: 'Bottom gusset', features: [],
    fitment: { name: 'Tap', label: 'Tap centre from bottom', axis: 'bottom', offset: 38 },
    note: 'The tap is shown on the front panel. Confirm the required flange and bottom clearance.',
  },
  'bag-in-box': {
    name: 'Bag-in-box liner', sizes: [[245, 290], [355, 420], [480, 530]],
    maxWidth: 650, maxHeight: 750, seal: 12, features: [],
    fitment: { name: 'Fitment', label: 'Fitment centre from top', axis: 'top', offset: 48 },
    note: 'Shows the flexible liner. Confirm the carton opening and fitment alignment separately.',
  },
  'roll-stock-films': {
    name: 'Roll stock film', sizes: [[180, 120], [310, 180], [490, 260]],
    web: 'repeat', maxWidth: 1200, maxHeight: 800, seal: 10, features: [],
    note: 'Shows one print repeat. Confirm film direction, seal layout and registration with your filling line.',
  },
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

function clippedRectangle(x, y, w, h, clip) {
  if (clip <= 0) return rectangle(x, y, w, h);
  return [[x + clip, y], [x + w - clip, y], [x + w, y + clip], [x + w, y + h - clip],
    [x + w - clip, y + h], [x + clip, y + h], [x, y + h - clip], [x, y + clip], [x + clip, y]];
}

const invalid = (message, ...fields) => new RangeError(message, { cause: fields });

export function buildDieline(options) {
  const { format, width, height, depth, seal } = options;
  const { bleed = 3, safe = 3, zipperPosition = 25, notchPosition = 12, valvePosition = 62, holePosition = 12 } = options;
  if (!Object.hasOwn(formats, format)) throw invalid('Choose a supported packaging format.', 'format');
  const spec = formats[format];
  const isRepeat = spec.web === 'repeat';
  const maxWidth = spec.maxWidth ?? 450;
  const maxHeight = spec.maxHeight ?? 600;
  const minHeight = isRepeat ? 60 : 90;
  const enabled = key => spec.features.includes(key) && options[key];
  const zipper = enabled('zipper');
  const notch = enabled('notch');
  const valve = enabled('valve');
  const hole = enabled('hole');
  const fitmentOffset = options.fitmentOffset ?? spec.fitment?.offset ?? width / 2;
  if (!extent(width, 60, maxWidth)) throw invalid(`Enter a ${isRepeat ? 'web width' : 'width'} of 60–${maxWidth} mm or the equivalent in inches.`, 'width');
  if (!extent(height, minHeight, maxHeight)) throw invalid(`Enter a ${isRepeat ? 'print repeat' : 'height'} of ${minHeight}–${maxHeight} mm or the equivalent in inches.`, 'height');
  if (!extent(seal, 3, 15)) throw invalid('Enter a seal margin of 3–15 mm or the equivalent in inches.', 'seal');
  if (!extent(bleed, 0, 8)) throw invalid('Enter a bleed of 0–8 mm or the equivalent in inches.', 'bleed');
  if (!extent(safe, 0, 10)) throw invalid('Enter an artwork inset of 0–10 mm or the equivalent in inches.', 'safe');
  const inset = seal + safe;
  if (spec.depthLabel && (!extent(depth, 20, 220) || depth <= 2 * inset || depth > width)) {
    throw invalid('Depth must be 20–220 mm, fit within the pouch width and leave room for the artwork inset.', 'depth');
  }
  if (spec.fitment) {
    const limit = spec.fitment.axis === 'left' ? width : height;
    const clearance = seal + 10;
    if (!extent(fitmentOffset, clearance, limit - clearance)) {
      throw invalid(`${spec.fitment.label} must be ${display(clearance)}–${display(limit - clearance)} mm.`, 'fitmentOffset');
    }
  }
  const featureLimits = [
    [zipper, zipperPosition, seal + 3, height - inset - 7, 'Zipper', 'zipperPosition'],
    [notch, notchPosition, seal + 2, height - seal - 4, 'Tear notch', 'notchPosition'],
    [valve, valvePosition, seal + 6, height - inset - 6, 'Valve', 'valvePosition'],
    [hole, holePosition, seal + 3, height - seal - 4, 'Hang hole', 'holePosition'],
  ];
  for (const [enabled, value, min, max, name, input] of featureLimits) {
    if (enabled && !extent(value, min, max)) {
      throw invalid(name + ' position must be ' + display(min) + '–' + display(max) + ' mm from the top.', input);
    }
  }
  if (zipper && notch && zipperPosition - notchPosition < 4) {
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

  const strokes = Object.fromEntries(Object.keys(layers).map(name => [name, []]));
  const labels = [];
  const panels = [];
  const add = (layer, points) => strokes[layer].push(points);
  function panel(name, x, y, w, h, { artTop = inset, clip = 0, flap = 0 } = {}) {
    const shape = (padding, top = padding, bottom = padding) => {
      const corner = clip ? clip - (2 - Math.SQRT2) * padding : 0;
      return clippedRectangle(x + padding, y + top, w - 2 * padding, h - top - bottom, corner);
    };
    if (bleed) add('bleed', shape(-bleed, -bleed, -bleed - flap));
    const outline = shape(0, 0, -flap);
    const sealGuide = shape(seal);
    add('cut', outline);
    add('seal', sealGuide);
    add('safe', shape(inset, artTop));
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
  const y = spec.fitment?.axis === 'left' ? 65 : 48;
  const gap = 30;
  const step = width + gap;
  const artTop = Math.max(inset, zipper ? zipperPosition + 4 : 0);
  const baseY = y + height + 35;

  const flap = spec.pinch ? depth / 2 : 0;
  let right = x + step + width;
  let endY = y + height + flap + 16;
  if (spec.web === 'folded') {
    const foldY = y + height;
    const end = foldY + height;
    const outline = rectangle(x, y, width, height * 2);
    const sealGuide = rectangle(x + seal, y, width - 2 * seal, height * 2);
    if (bleed) add('bleed', rectangle(x - bleed, y - bleed, width + 2 * bleed, height * 2 + 2 * bleed));
    add('cut', outline);
    add('seal', [[x + seal, y], [x + seal, end]]);
    add('seal', [[x + width - seal, y], [x + width - seal, end]]);
    add('fold', [[x, foldY], [x + width, foldY]]);
    panels.push({ outline, sealGuide });
    for (const [top, name] of [[y, 'FRONT'], [foldY, 'BACK (ROTATE ARTWORK 180 DEG)']]) {
      add('safe', rectangle(x + inset, top + inset, width - 2 * inset, height - 2 * inset));
      labels.push({ x: x + width / 2, y: top + height / 2, text: name, centered: true, size: name === 'FRONT' ? 5 : 3.4 });
    }
    labels.push({ x, y: y - 11, text: 'OPEN FILL EDGE', size: 4 });
    labels.push({ x, y: end + 10, text: 'OPEN FILL EDGE', size: 4 });
    dimension(x, end + 21, width);
    dimension(x - 15, y, height, true);
    dimension(x - 15, foldY, height, true);
    right = x + width;
    endY = end + 24;
  } else if (isRepeat) {
    panel('PRINT REPEAT', x, y, width, height);
    for (const edge of [y, y + height]) add('fold', [[x, edge], [x + width, edge]]);
    const arrowX = x + width / 2;
    const arrowY = y + height / 2;
    add('feature', [[arrowX, arrowY - 9], [arrowX, arrowY + 9]]);
    add('feature', [[arrowX - 3, arrowY + 5], [arrowX, arrowY + 9], [arrowX + 3, arrowY + 5]]);
    labels.push({ x: arrowX, y: arrowY - 13, text: 'WEB DIRECTION', centered: true, size: 4.2 });
    dimension(x, y + height + 15, width);
    dimension(x - 15, y, height, true);
    right = x + width;
  } else {
    panel('FRONT', x, y, width, height, { artTop, clip: spec.chamfer, flap });
    panel('BACK', x + step, y, width, height, { artTop, clip: spec.chamfer });
    dimension(x, y + height + flap + 15, width);
    dimension(x - 15, y, height, true);
  }
  if (spec.pinch) {
    add('fold', [[x, y + height], [x + width, y + height]]);
    labels.push({ x: x + width / 2, y: y + height + flap / 2 + 1.5, text: 'PINCH FOLD FLAP', centered: true, size: 4.2 });
    dimension(x - 15, y + height, flap, true);
  }
  if (spec.base) {
    panel(spec.base, x, baseY, width, depth);
    dimension(x - 15, baseY, depth, true);
    if (!spec.sides) add('fold', [[x, baseY + depth / 2], [x + width, baseY + depth / 2]]);
    endY = baseY + depth;
  }
  if (spec.sides) {
    const sideX = x + 2 * step;
    const label = spec.base ? 'SIDE' : 'GUSSET';
    for (const [left, suffix] of [[sideX, 'A'], [sideX + depth + gap, 'B']]) {
      panel(label + ' ' + suffix, left, y, depth, height);
      add('fold', [[left + depth / 2, y], [left + depth / 2, y + height]]);
    }
    dimension(sideX, y + height + 15, depth);
    right = sideX + 2 * depth + gap;
  }
  if (spec.quad) {
    labels.push({ x, y: endY + 7, text: 'FOUR CORNER SEALS AT THE FRONT AND BACK PANEL EDGES', size: 4 });
    endY += 8;
  }
  if (spec.fitment?.axis === 'left') {
    for (const [left, offset] of [[x, fitmentOffset], [x + step, width - fitmentOffset]]) {
      const centre = left + offset;
      add('feature', rectangle(centre - 5, y - 14, 10, 9));
      add('feature', [[centre - 3, y - 5], [centre - 3, y + 3], [centre + 3, y + 3], [centre + 3, y - 5]]);
      labels.push({ x: centre, y: y - 17, text: 'SPOUT', centered: true, size: 4.2 });
    }
    dimension(x, y - 29, fitmentOffset);
  } else if (spec.fitment) {
    const axis = spec.fitment.axis;
    const fittingY = y + (axis === 'bottom' ? height - fitmentOffset : fitmentOffset);
    add('feature', circle(x + width / 2, fittingY, 9));
    add('feature', circle(x + width / 2, fittingY, 4));
    labels.push({ x: x + width / 2, y: fittingY - 12, text: spec.fitment.name.toUpperCase(), centered: true, size: 4.2 });
    dimension(x + width + 12, axis === 'bottom' ? fittingY : y, fitmentOffset, true);
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

  return {
    format, panels,
    width: Math.max(right + 18, 180),
    height: endY + 22,
    strokes,
    labels: [
      { x: 12, y: 13, text: spec.name + ' / Mewepak', size: 6.5 },
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
