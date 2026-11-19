// Representative mockups keyed to the storefront product categories.
const formats = [
  ['stand-up-pouch', 'Stand-up pouch', 3, 4],
  ['flat-bottom-pouch', 'Flat-bottom pouch', 3, 4],
  ['flat-pouch', 'Flat pouch', 5, 7],
  ['pinch-bottom-pouches', 'Pinch-bottom pouch', 3, 5],
  ['quad-seal-bag', 'Quad-seal bag', 3, 5],
  ['retort-pouch', 'Retort pouch', 6, 5],
  ['spout-pouch', 'Spout pouch', 3, 4],
  ['stand-up-pouch-tap', 'Stand-up pouch with tap', 3, 4],
  ['shaped-pouch', 'Shaped pouch', 3, 4],
  ['polybag', 'Polybag', 3, 4],
  ['bag-in-box', 'Bag-in-box', 4, 5],
  ['roll-stock-films', 'Printed roll stock', 4, 5],
];

export const studioModelUrl = '/assets/3d/doypack.glb?v=studio-1';
export const previewFormats = new Map(formats.map(([id, name, width, height], index) => {
  const roll = id === 'roll-stock-films';
  const base = '/assets/3d/formats/' + id;
  const [url, poster] = index
    ? [base + '.glb?v=studio-2', base + '.webp?v=studio-2']
    : [studioModelUrl, '/assets/3d/doypack-studio.webp'];
  return [id, {
    id, format: id, name, url, poster, ratio: [width, height],
    front: true, back: !roll, repeat: roll ? 3 : 1, mirror: !index,
  }];
}));
