(() => {
  const library = document.querySelector('[data-resource-library]');
  if (!library) return;

  const form = library.querySelector('form');
  const status = library.querySelector('[role="status"]');
  const empty = library.querySelector('.mwr-library-empty');
  const groups = Array.from(library.querySelectorAll('[data-resource-group]'), element => ({
    element,
    resources: Array.from(element.querySelectorAll('[data-resource-type]'), item => ({
      item,
      type: item.dataset.resourceType,
      text: `${element.querySelector('h3').textContent} ${item.textContent}`.toLowerCase(),
    })),
  }));

  function update() {
    const terms = form.elements.query.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const type = form.elements.type.value;
    let total = 0;
    for (const { element, resources } of groups) {
      let visible = 0;
      for (const resource of resources) {
        const matches = (!type || resource.type === type) && terms.every(term => resource.text.includes(term));
        resource.item.hidden = !matches;
        if (matches) visible++;
      }
      element.hidden = visible === 0;
      total += visible;
    }
    status.textContent = `${total} ${total === 1 ? 'resource' : 'resources'} found`;
    empty.hidden = total > 0;
  }

  form.addEventListener('input', update);
  form.addEventListener('submit', event => { event.preventDefault(); update(); });

  for (const anchor of document.querySelectorAll('a[href$="-resources"]')) {
    anchor.addEventListener('click', () => {
      form.reset();
      update();
    });
  }

  form.hidden = false;
  status.hidden = false;
  update();
})();
