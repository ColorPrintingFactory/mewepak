const clamp = (number, min, max) => Math.min(max, Math.max(min, number));
const directions = {
  ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
};

for (const button of document.querySelectorAll('.image-magnifier')) {
  const image = button.querySelector('img');
  const lens = document.createElement('span');
  lens.className = 'image-magnifier-lens';
  lens.hidden = true;
  lens.setAttribute('aria-hidden', 'true');
  button.append(lens);
  let hover = false;
  let pinned = false;
  let focus = [0.5, 0.5];

  function render() {
    lens.hidden = !(hover || pinned) || !image.complete || !image.naturalWidth || !button.clientWidth;
    if (lens.hidden) return;
    const width = button.clientWidth;
    const height = button.clientHeight;
    const fit = getComputedStyle(image).objectFit === 'cover' ? Math.max : Math.min;
    const scale = fit(width / image.naturalWidth, height / image.naturalHeight);
    const displayedWidth = image.naturalWidth * scale;
    const displayedHeight = image.naturalHeight * scale;
    const [x, y] = [focus[0] * width, focus[1] * height];
    const radius = lens.offsetWidth / 2;
    const magnification = 2.5;
    lens.style.left = clamp(x - radius, 0, width - radius * 2) + 'px';
    lens.style.top = clamp(y - radius, 0, height - radius * 2) + 'px';
    lens.style.backgroundImage = `url("${button.dataset.zoomSource || image.currentSrc || image.src}")`;
    lens.style.backgroundSize = `${displayedWidth * magnification}px ${displayedHeight * magnification}px`;
    lens.style.backgroundPosition = `${radius - (x - (width - displayedWidth) / 2) * magnification}px ${radius - (y - (height - displayedHeight) / 2) * magnification}px`;
  }

  function point(event) {
    const bounds = button.getBoundingClientRect();
    focus = [
      clamp((event.clientX - bounds.left) / bounds.width, 0, 1),
      clamp((event.clientY - bounds.top) / bounds.height, 0, 1),
    ];
  }

  button.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    hover = true;
    point(event);
    render();
  });
  button.addEventListener('pointerleave', () => {
    hover = false;
    render();
  });
  button.addEventListener('click', (event) => {
    pinned = !pinned;
    if (pinned) {
      if (event.detail) point(event);
      else focus = [0.5, 0.5];
    } else hover = false;
    button.setAttribute('aria-pressed', String(pinned));
    render();
  });
  button.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && (pinned || hover)) {
      pinned = hover = false;
      button.setAttribute('aria-pressed', 'false');
      render();
      return;
    }
    if (!pinned || !Object.hasOwn(directions, event.key)) return;
    event.preventDefault();
    focus = focus.map((value, i) => clamp(value + directions[event.key][i] * 0.1, 0, 1));
    render();
  });
  image.addEventListener('load', render);
  window.addEventListener('resize', render);
}
