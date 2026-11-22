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
    features: [],
    note: 'The rounded shoulders show an example contour. Share your actual outline with prepress for a custom die.',
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

export const layers = {
  frame: { name: 'Sheet frame', color: '#a8b8bb', dash: [], weight: .3 },
  bleed: { name: 'Bleed', color: '#a33f73', dash: [2, 1.4], weight: .38 },
  cut: { name: 'Outline', color: '#183a46', dash: [], weight: .75 },
  seal: { name: 'Seal boundary', color: '#9b4c31', dash: [3, 1], weight: .48 },
  weld: { name: 'Seal detail', color: '#9b4c31', dash: [], weight: .33 },
  fold: { name: 'Fold / repeat', color: '#4958a6', dash: [4, 1, 1, 1], weight: .5 },
  center: { name: 'Centre / alignment', color: '#607981', dash: [5, 1, .8, 1], weight: .31 },
  safe: { name: 'Safe area', color: '#168468', dash: [1, 1], weight: .44 },
  feature: { name: 'Feature', color: '#347b9f', dash: [], weight: .47 },
  dimensions: { name: 'Dimension', color: '#526970', dash: [], weight: .34 },
};

const round = value => Number(value.toFixed(6));
const extent = (n, low, high) => Number.isFinite(n) && n >= low && n <= high;
const rectangle = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];

function clippedRectangle(x, y, w, h, clip) {
  if (clip <= 0) return rectangle(x, y, w, h);
  return [[x + clip, y], [x + w - clip, y], [x + w, y + clip], [x + w, y + h - clip],
    [x + w - clip, y + h], [x + clip, y + h], [x, y + h - clip], [x, y + clip], [x + clip, y]];
}

function roundedRectangle(x, y, w, h, topRadius, bottomRadius = topRadius) {
  const top = Math.max(0, Math.min(topRadius, w / 2, h / 2));
  const bottom = Math.max(0, Math.min(bottomRadius, w / 2, h / 2));
  const corners = [[x + w - top, y + top, top, -90], [x + w - bottom, y + h - bottom, bottom, 0],
    [x + bottom, y + h - bottom, bottom, 90], [x + top, y + top, top, 180]];
  const points = corners.flatMap(([cx, cy, radius, angle]) => arc(cx, cy, radius, angle, angle + 90));
  return [...points, points[0]];
}

function arc(x, y, radius, start, end, radiusY = radius) {
  if (!radius) return [[x, y]];
  return Array.from({ length: 13 }, (_, index) => {
    const a = (start + (end - start) * index / 12) * Math.PI / 180;
    return [x + radius * Math.cos(a), y + radiusY * Math.sin(a)];
  });
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
  function panel(name, x, y, w, h, { artTop = inset, clip = 0, flap = 0, radii, contour } = {}) {
    const shape = (padding, top = padding, bottom = padding) => {
      const corner = clip ? clip - (2 - Math.SQRT2) * padding : 0;
      const left = x + padding;
      const head = y + top;
      const span = w - 2 * padding;
      const length = h - top - bottom;
      if (contour === 'shoulder') {
        const shoulder = Math.min(span * .17, length * .24);
        const heel = Math.min(span * .10, length * .16);
        return [[left + shoulder, head], [left + span - shoulder, head],
          ...arc(left + span - shoulder, head + shoulder, shoulder, -90, 0).slice(1),
          ...arc(left + span - heel, head + length - heel, heel, 0, 90),
          ...arc(left + heel, head + length - heel, heel, 90, 180),
          ...arc(left + shoulder, head + shoulder, shoulder, 180, 270), [left + shoulder, head]];
      }
      if (radii) return roundedRectangle(left, head, span, length, radii[0] - padding, radii[1] - padding);
      return clippedRectangle(left, head, span, length, corner);
    };
    if (bleed) add('bleed', shape(-bleed, -bleed, -bleed - flap));
    const outline = shape(0, 0, -flap);
    const sealGuide = shape(seal);
    add('cut', outline);
    add('seal', sealGuide);
    add('safe', shape(inset, artTop));
    panels.push({ outline, sealGuide });
    labels.push({ x, y: y - bleed - 4, text: name, size: 5, strong: true });
  }
  function dimension(x, y, length, vertical = false, witness = 0) {
    const point = (a, b) => vertical ? [x + b, y + a] : [x + a, y + b];
    add('dimensions', [[0, 0], [length, 0]].map(p => point(...p)));
    const arrow = Math.min(2.8, length / 7);
    for (const [at, direction] of [[0, 1], [length, -1]]) {
      const from = witness ? witness - Math.sign(witness) * 2 : 2.2;
      add('dimensions', [[at, from], [at, witness > 0 ? -2.2 : 2.2]].map(p => point(...p)));
      add('dimensions', [[at + direction * arrow, -1.35], [at, 0], [at + direction * arrow, 1.35]].map(p => point(...p)));
    }
    const [textX, textY] = point(length / 2, vertical ? -3 : -2.5);
    labels.push({ x: textX, y: textY, rotate: vertical, centered: true, text: display(length) + ' mm', size: 4.6 });
  }
  function crosshair(x, y, extent) {
    add('center', [[x - extent, y], [x + extent, y]]);
    add('center', [[x, y - extent], [x, y + extent]]);
  }
  const x = 35;
  const y = spec.fitment?.axis === 'left' ? 81 : 59;
  const gap = 34;
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
    dimension(x, end + 21, width, false, -18);
    dimension(x - 16, y, height, true, 16);
    dimension(x - 16, foldY, height, true, 16);
    right = x + width;
    endY = end + 24;
  } else if (isRepeat) {
    labels.push({ x, y: y - 11, text: 'ONE PRINT REPEAT', size: 5, strong: true });
    for (const edge of [x, x + width]) add('cut', [[edge, y - 5], [edge, y + height + 5]]);
    for (const edge of [y, y + height]) add('fold', [[x, edge], [x + width, edge]]);
    for (const edge of [x + seal, x + width - seal]) add('seal', [[edge, y], [edge, y + height]]);
    add('safe', rectangle(x + inset, y + safe, width - 2 * inset, height - 2 * safe));
    if (bleed) add('bleed', rectangle(x - bleed, y - bleed, width + 2 * bleed, height + 2 * bleed));
    const arrowX = x + width / 2;
    const arrowY = y + height / 2;
    add('feature', [[arrowX, arrowY - 9], [arrowX, arrowY + 9]]);
    add('feature', [[arrowX - 3, arrowY + 5], [arrowX, arrowY + 9], [arrowX + 3, arrowY + 5]]);
    labels.push({ x: arrowX, y: arrowY - 13, text: 'WEB DIRECTION', centered: true, size: 4.2 });
    add('center', [[arrowX, y], [arrowX, arrowY - 20]]);
    add('center', [[arrowX, arrowY + 14], [arrowX, y + height]]);
    dimension(x, y + height + 15, width, false, -12);
    dimension(x - 16, y, height, true, 16);
    right = x + width;
  } else {
    const roundedBase = spec.base && !spec.sides;
    const radii = roundedBase ? [2, Math.min(depth * .30, width * .15)] : format === 'bag-in-box' ? [10, 10] : undefined;
    const contour = format === 'shaped-pouch' ? 'shoulder' : undefined;
    panel('A / FRONT PANEL', x, y, width, height, { artTop, clip: spec.chamfer, flap, radii, contour });
    panel('B / BACK PANEL', x + step, y, width, height, { artTop, clip: spec.chamfer, radii, contour });
    dimension(x, y + height + flap + 15, width, false, -15);
    dimension(x - 16, y, height, true, 16);
    if (roundedBase) {
      for (const left of [x, x + step]) {
        const half = width / 2 - seal;
        const rise = Math.max(3, Math.min(depth * .27, height * .22) - seal);
        const sealY = y + height - seal;
        add('weld', arc(left + width / 2, sealY, half, 180, 360, rise));
        add('center', [[left + width / 2, sealY - rise - 3], [left + width / 2, y + height + 3]]);
        labels.push({ x: left + width / 2, y: sealY - rise - 4, text: 'GUSSET SEAL GUIDE', centered: true, size: 3.5 });
      }
    }
  }
  if (spec.pinch) {
    add('fold', [[x, y + height], [x + width, y + height]]);
    labels.push({ x: x + width / 2, y: y + height + flap / 2 + 1.5, text: 'PINCH FOLD FLAP', centered: true, size: 4.2 });
    dimension(x - 16, y + height, flap, true, 16);
  }
  if (spec.base) {
    const radii = spec.sides ? undefined : [Math.min(8, depth * .16), Math.min(8, depth * .16)];
    panel('C / ' + spec.base, x, baseY, width, depth, { radii });
    dimension(x - 16, baseY, depth, true, 16);
    if (!spec.sides) {
      const midY = baseY + depth / 2;
      add('fold', [[x, midY], [x + width, midY]]);
      crosshair(x + width / 2, midY, 4);
      labels.push({ x: x + width / 2, y: midY - 5, text: 'CENTRE FOLD', size: 3.4, centered: true });
    }
    endY = baseY + depth;
  }
  if (spec.sides) {
    const sideX = x + 2 * step;
    const label = spec.base ? 'SIDE' : 'GUSSET';
    for (const [left, suffix] of [[sideX, 'A'], [sideX + depth + gap, 'B']]) {
      panel(label + ' ' + suffix, left, y, depth, height);
      const centre = left + depth / 2;
      add('fold', [[centre, y], [centre, y + height]]);
      labels.push({ x: centre - 3, y: y + height / 2, rotate: true, centered: true, text: 'CENTRE FOLD', size: 3.4 });
      if (spec.quad) {
        add('weld', [[left + seal / 2, y + seal], [left + seal / 2, y + height - seal]]);
        add('weld', [[left + depth - seal / 2, y + seal], [left + depth - seal / 2, y + height - seal]]);
      }
    }
    dimension(sideX, y + height + 15, depth, false, -15);
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
      add('weld', [[centre - 9, y + 1], [centre - 5, y + 5], [centre + 5, y + 5], [centre + 9, y + 1]]);
      add('center', [[centre, y - 15], [centre, y + 9]]);
      labels.push({ x: centre, y: y - 17, text: 'SPOUT', centered: true, size: 4.2 });
    }
    dimension(x, y - 29, fitmentOffset, false, 16);
  } else if (spec.fitment) {
    const axis = spec.fitment.axis;
    const fittingY = y + (axis === 'bottom' ? height - fitmentOffset : fitmentOffset);
    add('feature', circle(x + width / 2, fittingY, 9));
    add('feature', circle(x + width / 2, fittingY, 4));
    crosshair(x + width / 2, fittingY, 12);
    labels.push({ x: x + width / 2, y: fittingY - 15, text: spec.fitment.name.toUpperCase(), centered: true, size: 4.2 });
    dimension(x + width + 13, axis === 'bottom' ? fittingY : y, fitmentOffset, true, -13);
    add('center', [[x + width / 2 + 12, fittingY], [x + width + 13, fittingY]]);
  }
  for (const left of [x, x + step]) {
    if (zipper) {
      for (const offset of [0, 1.7]) {
        add('feature', [[left + seal, y + zipperPosition + offset], [left + width - seal, y + zipperPosition + offset]]);
      }
    }
    if (notch) add('feature', [[left, y + notchPosition - 2], [left + 2.5, y + notchPosition], [left, y + notchPosition + 2]]);
    if (hole) {
      const middle = left + width / 2;
      add('feature', circle(middle, y + holePosition, 3));
      crosshair(middle, y + holePosition, 5);
    }
  }
  if (valve) {
    const valveX = x + step + width / 2;
    add('feature', circle(valveX, y + valvePosition, 5));
    add('feature', circle(valveX, y + valvePosition, 1.1));
    crosshair(valveX, y + valvePosition, 7);
  }
  if (zipper) {
    const markX = x + width + 13;
    dimension(markX, y, zipperPosition, true, -13);
    add('center', [[x + width - seal, y + zipperPosition], [markX, y + zipperPosition]]);
  }

  const sheetWidth = Math.max(right + 18, 194);
  const footer = endY + 13;
  const sheetHeight = footer + 52;
  add('frame', rectangle(8, 7, sheetWidth - 16, sheetHeight - 14));
  for (const line of [36, footer, footer + 22]) add('frame', [[8, line], [sheetWidth - 8, line]]);
  const summaryX = sheetWidth / 2 + 5;
  const hardware = [
    [zipper, 'Zipper', zipperPosition, 'from top'],
    [notch, 'Notch', notchPosition, 'from top'],
    [hole, 'Hang hole', holePosition, 'from top'],
    [valve, 'Valve', valvePosition, 'from top'],
    [spec.fitment, spec.fitment?.name, fitmentOffset, 'from ' + spec.fitment?.axis],
  ];
  const hardwareLabels = hardware.filter(([active]) => active).map(([, name, offset, edge], index) => ({
    x: summaryX + (index % 2) * (sheetWidth / 4 - 1), y: footer + 12 + Math.floor(index / 2) * 5.3,
    text: `${name} ${display(offset)} mm ${edge}`, size: 2.75,
  }));
  if (hardwareLabels.length) {
    labels.push({ x: summaryX, y: footer + 6.4, text: 'FEATURE LOCATIONS', size: 3.2, strong: true }, ...hardwareLabels);
  }
  const legend = [['cut', 'Outline'], ['seal', 'Seal'], ['fold', 'Fold / repeat'], ['bleed', 'Bleed'],
    ['safe', 'Safe area'], ['feature', 'Feature'], ['center', 'Alignment'], ['dimensions', 'Dimension']];
  const legendSamples = legend.map(([layer, caption], index) => {
    const left = 13 + (index % 4) * ((sheetWidth - 27) / 4);
    const top = footer + 29.1 + Math.floor(index / 4) * 6;
    labels.push({ x: left + 10, y: top + 1, text: caption, size: 3.2 });
    return { layer, points: [[left, top], [left + 8, top]] };
  });
  return {
    format, panels,
    width: sheetWidth,
    height: sheetHeight,
    strokes, legendSamples,
    labels: [
      { x: 13, y: 15, text: 'MEWEPAK / FLEXIBLE PACKAGING', size: 3.3, strong: true },
      { x: 13, y: 24, text: spec.name, size: 6.8, strong: true },
      { x: 13, y: 31, text: 'Design reference - prepress review required', size: 3.7 },
      { x: sheetWidth - 44, y: 15, text: 'SCALE   1:1', size: 3.3, strong: true },
      { x: sheetWidth - 44, y: 21, text: 'UNITS   mm', size: 3.3 },
      ...labels,
      { x: 13, y: footer + 6.4, text: 'ARTWORK GUIDES', size: 3.2, strong: true },
      { x: 13, y: footer + 12, text: 'Seal ' + display(seal) + ' mm / Bleed ' + display(bleed) + ' mm / Inset ' + display(safe) + ' mm', size: 3.2 },
      { x: 13, y: footer + 19, text: 'Example profiles and fitments. Confirm with prepress.', size: 3 },
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
  const { width, height, strokes, labels, legendSamples } = model;
  const attrs = ({ color, dash, weight }) => 'fill="none" stroke="' + color + '" stroke-width="' + weight + '" stroke-linejoin="round"' +
    (dash.length ? ' stroke-dasharray="' + dash.join(' ') + '"' : '');
  const polyline = (points, attributes = '') => '<polyline ' + attributes + ' points="' +
    points.map(([x, y]) => round(x) + ',' + round(y)).join(' ') + '"/>';
  const groups = Object.entries(layers).map(([id, layer]) => '<g id="' + id + '" ' + attrs(layer) + '><title>' + layer.name + '</title>' +
    strokes[id].map(points => polyline(points)).join('') + '</g>').join('');
  const lineKey = '<g id="line-key">' + legendSamples.map(({ layer, points }) => polyline(points, attrs(layers[layer]))).join('') + '</g>';
  const text = labels.map(({ x, y, text, size, rotate, centered, strong }) => {
    const angle = rotate ? ' transform="rotate(-90 ' + x + ' ' + y + ')"' : '';
    return '<text x="' + x + '" y="' + y + '" font-size="' + size + '"' + angle +
      (centered ? ' text-anchor="middle"' : '') + (strong ? ' font-weight="700"' : '') + '>' + text + '</text>';
  }).join('');
  const fill = (points, color) => '<polygon fill="' + color + '" points="' + points.map(p => p.join(',')).join(' ') + '"/>';
  const sheet = preview ? '<rect width="100%" height="100%" fill="#fff"/>' +
    model.panels.map(({ outline, sealGuide }) => fill(outline, '#e2ece7') + fill(sealGuide, '#fff')).join('') : '';
  return '<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dimensioned pouch panels and guides" width="' +
    width + 'mm" height="' + height + 'mm" viewBox="0 0 ' + width + ' ' + height + '">' + sheet + groups + lineKey +
    '<g id="annotations" fill="#334e57" font-family="Arial,sans-serif">' + text + '</g></svg>';
}

export function exportPdf(model) {
  const pt = mm => round(mm * 72 / 25.4);
  const position = ([x, y]) => pt(x) + ' ' + pt(model.height - y);
  const commands = ['1 j'];
  for (const [name, { color, dash, weight }] of Object.entries(layers)) {
    const rgb = color.slice(1).match(/../g).map(part => round(parseInt(part, 16) / 255));
    commands.push(pt(weight) + ' w', rgb.join(' ') + ' RG', '[' + dash.map(pt).join(' ') + '] 0 d');
    for (const points of model.strokes[name]) {
      commands.push(points.map((point, i) => position(point) + (i ? ' l' : ' m')).join(' ') + ' S');
    }
    const sample = model.legendSamples.find(({ layer }) => layer === name);
    if (sample) commands.push(position(sample.points[0]) + ' m ' + position(sample.points[1]) + ' l S');
  }
  commands.push('0.2 0.31 0.34 rg');
  for (const { x, y, text, size, rotate, centered, strong } of model.labels) {
    const shift = centered ? text.length * size * .24 : 0;
    const origin = rotate ? [x, y + shift] : [x - shift, y];
    commands.push('BT ' + (strong ? '/F2 ' : '/F1 ') + pt(size) + ' Tf ' + (rotate ? '0 1 -1 0 ' : '1 0 0 1 ') +
      position(origin) + ' Tm (' + text.replace(/[()\\]/g, '\\$&') + ') Tj ET');
  }
  const stream = commands.join('\n') + '\n';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Count 1 /Kids [3 0 R] >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pt(model.width) + ' ' + pt(model.height) +
      '] /Resources << /Font << /F1 4 0 R /F2 6 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Length ' + stream.length + ' >>\nstream\n' + stream + 'endstream',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [];
  for (const [i, object] of objects.entries()) {
    offsets.push(String(pdf.length).padStart(10, '0') + ' 00000 n ');
    pdf += (i + 1) + ' 0 obj\n' + object + '\nendobj\n';
  }
  const objectCount = objects.length + 1;
  return pdf + 'xref\n0 ' + objectCount + '\n0000000000 65535 f \n' + offsets.join('\n') + '\ntrailer\n' +
    '<< /Size ' + objectCount + ' /Root 1 0 R >>\nstartxref\n' + pdf.length + '\n%%EOF\n';
}
