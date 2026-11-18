
(() => {
  const root = document.querySelector('.about-premium-page');
  if (!root) return;

  const controls = root.querySelector('[data-journey-controls]');
  const tabs = Array.from(root.querySelectorAll('[data-journey-tab]'));
  const panels = Array.from(root.querySelectorAll('[data-journey-panel]'));

  function activate(index, moveFocus = false) {
    tabs.forEach((tab, position) => {
      const selected = position === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[position].hidden = !selected;
      panels[position].setAttribute('role', 'tabpanel');
      panels[position].setAttribute('aria-labelledby', tab.id);
    });
    if (moveFocus) tabs[index].focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index));
    tab.addEventListener('keydown', event => {
      const destinations = {
        ArrowRight: (index + 1) % tabs.length,
        ArrowLeft: (index + tabs.length - 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      };
      if (!(event.key in destinations)) return;
      event.preventDefault();
      activate(destinations[event.key], true);
    });
  });
  activate(0);
  controls.hidden = false;
})();

