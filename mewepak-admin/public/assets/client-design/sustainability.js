
(() => {
  const root = document.querySelector('.sustainability-page');
  if (!root) return;

  const form = root.querySelector('#su-lca-form');
  if (!form) return;
  const error = root.querySelector('#su-lca-error');
  const stages = ['materials', 'converting', 'freight', 'end'];
  const stageNames = ['Materials', 'Converting', 'Freight', 'End of life'];
  const exportButtons = Array.from(root.querySelectorAll('[data-export]'));
  let basis = 'order';
  let model = null;
  let edited = false;

  function format(value) {
    return new Intl.NumberFormat('en', {
      maximumFractionDigits: Math.abs(value) < 10 ? 2 : 1,
    }).format(value);
  }

  function setText(selector, value) {
    const element = root.querySelector(selector);
    if (element) element.textContent = value;
  }

  function scenario(prefix, count) {
    const mass = count * form.elements[prefix + 'Mass'].valueAsNumber / 1000;
    const factors = stages.map(stage => form.elements[prefix + stage].valueAsNumber);
    const values = factors.map(factor => mass * factor);
    return {mass, factors, values, total: values.reduce((sum, value) => sum + value, 0)};
  }

  function drawBar(selector, values, max) {
    const bar = root.querySelector(selector);
    if (!bar) return;
    bar.replaceChildren();
    values.forEach((value, index) => {
      const segment = document.createElement('span');
      segment.className = 'su-key-' + stages[index];
      segment.style.width = (max > 0 ? value / max * 100 : 0) + '%';
      bar.append(segment);
    });
  }

  function updateDashboard() {
    if (!model) return;
    const scale = basis === 'thousand' ? 1000 / model.count : 1;
    const base = model.base;
    const proposed = model.proposed;
    const difference = base.total - proposed.total;
    const massDifference = base.mass - proposed.mass;
    const amount = basis === 'thousand' ? '1,000 packs' : format(model.count) + ' packs';
    setText('#su-scenario-label', (edited ? 'Your scenario' : 'Example scenario') + ' · ' + amount);
    setText('#su-metric-emissions', format(proposed.total * scale));
    setText('#su-metric-difference', format(Math.abs(difference * scale)) + (difference > 0 ? ' lower' : difference < 0 ? ' higher' : ' change'));
    setText('#su-metric-percentage', base.total > 0
      ? format(Math.abs(difference / base.total * 100)) + '% ' + (difference >= 0 ? 'below' : 'above') + ' the baseline'
      : 'Percentage comparison needs a positive baseline');
    setText('#su-metric-mass', format(proposed.mass * scale));
    setText('#su-metric-mass-change', format(Math.abs(massDifference * scale)) + (massDifference > 0 ? ' lighter' : massDifference < 0 ? ' heavier' : ' change'));
    setText('#su-base-total', format(base.total * scale) + ' kg CO₂e');
    setText('#su-proposed-total', format(proposed.total * scale) + ' kg CO₂e');
    const max = Math.max(base.total, proposed.total);
    drawBar('#su-base-bar', base.values, max);
    drawBar('#su-proposed-bar', proposed.values, max);
  }

  function update() {
    const invalid = Array.from(form.querySelectorAll('input[type="number"]')).find(
      input => !input.validity.valid || !Number.isFinite(input.valueAsNumber)
    );
    error.hidden = !invalid;
    exportButtons.forEach(button => { button.disabled = Boolean(invalid); });
    if (invalid) {
      error.textContent = 'Check ' + invalid.dataset.label.toLowerCase() + '. ' + (invalid.validationMessage || 'Enter a valid number.');
      model = null;
      setText('#su-scenario-label', 'Check the LCA input');
      for (const selector of ['#su-metric-emissions', '#su-metric-difference', '#su-metric-percentage', '#su-metric-mass', '#su-metric-mass-change', '#su-base-total', '#su-proposed-total', '#su-table-base', '#su-table-proposed']) {
        setText(selector, '—');
      }
      setText('#su-comparison-summary', 'Update the input to see the comparison.');
      root.querySelector('#su-stage-rows').replaceChildren();
      drawBar('#su-base-bar', [], 0);
      drawBar('#su-proposed-bar', [], 0);
      return;
    }
    const count = form.elements.volume.valueAsNumber;
    model = {count, base: scenario('base', count), proposed: scenario('proposed', count)};
    const table = root.querySelector('#su-stage-rows');
    table.replaceChildren();
    stages.forEach((stage, index) => {
      const tr = document.createElement('tr');
      const title = document.createElement('th');
      title.scope = 'row';
      title.textContent = stageNames[index];
      tr.append(title);
      for (const value of [model.base.values[index], model.proposed.values[index]]) {
        const td = document.createElement('td');
        td.textContent = format(value);
        tr.append(td);
      }
      table.append(tr);
    });
    setText('#su-table-base', format(model.base.total));
    setText('#su-table-proposed', format(model.proposed.total));
    setText('#su-comparison-summary', 'Comparison for ' + format(count) + ' equivalent filled packs. Review pack performance, boundaries and input data before using the results in a project decision.');
    updateDashboard();
  }

  function csvCell(value) {
    const raw = typeof value === 'number' ? String(value) : String(value ?? '').replace(/^(\s*[=+@-])/, "'$1");
    return '"' + raw.replaceAll('"', '""') + '"';
  }

  function exportScenario() {
    update();
    if (!model) return;
    const rows = [
      ['MewePak packaging screening LCA scenario'],
      ['Prepared', new Date().toISOString()],
      ['Inputs', edited ? 'User-edited scenario' : 'Illustrative example'],
      ['Packs compared', model.count],
      ['Source and assumptions', form.elements.source.value],
      ['Boundary', 'Packaging materials, converting, freight and end of life. Gross emissions.'],
      ['Further study', 'Filling, product losses, consumer use and other environmental impacts.'],
      [],
      ['Input', 'Baseline', 'Proposed', 'Unit'],
      ['Pack weight', form.elements.baseMass.valueAsNumber, form.elements.proposedMass.valueAsNumber, 'g per pack'],
      ...stages.map((stage, index) => [stageNames[index] + ' factor', model.base.factors[index], model.proposed.factors[index], 'kg CO2e per kg finished packaging']),
      [],
      ['Result', 'Baseline', 'Proposed', 'Unit'],
      ['Packaging mass', model.base.mass, model.proposed.mass, 'kg'],
      ...stages.map((stage, index) => [stageNames[index], model.base.values[index], model.proposed.values[index], 'kg CO2e']),
      ['Total climate impact', model.base.total, model.proposed.total, 'kg CO2e'],
      ['Emissions difference, baseline minus proposed', model.base.total - model.proposed.total, '', 'kg CO2e'],
      ['Mass difference, baseline minus proposed', model.base.mass - model.proposed.mass, '', 'kg'],
    ];
    const csv = '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Mewepak_LCA_Scenario.csv';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  form.addEventListener('input', () => { edited = true; update(); });
  form.addEventListener('submit', event => { event.preventDefault(); update(); });
  form.addEventListener('reset', () => {
    edited = false;
    setTimeout(update, 0);
  });
  exportButtons.forEach(button => button.addEventListener('click', exportScenario));
  root.querySelectorAll('[data-basis]').forEach(button => {
    button.addEventListener('click', () => {
      basis = button.dataset.basis;
      root.querySelectorAll('[data-basis]').forEach(other => {
        other.setAttribute('aria-pressed', String(other === button));
      });
      updateDashboard();
    });
  });

  root.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      let count = 0;
      root.querySelectorAll('[data-material]').forEach(card => {
        const matches = button.dataset.filter === 'all' || card.dataset.material === button.dataset.filter;
        card.hidden = !matches;
        if (matches) count += 1;
      });
      root.querySelectorAll('[data-filter]').forEach(other => {
        other.setAttribute('aria-pressed', String(other === button));
      });
      setText('#su-material-count', count + (count === 1 ? ' example' : ' examples') + ' to explore');
    });
  });
  update();
  root.querySelectorAll('[data-enhanced]').forEach(element => { element.hidden = false; });
})();

(() => {
  const root = document.querySelector('.sustainability-page');
  const track = root && root.querySelector('#su-benefit-track');
  if (!track) return;
  const prev = root.querySelector('[data-benefit-prev]');
  const next = root.querySelector('[data-benefit-next]');
  const status = root.querySelector('#su-benefit-status');
  const cards = Array.from(track.children);
  function sync() {
    const max = track.scrollWidth - track.clientWidth;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    const first = Math.min(cards.length - 1, Math.round(track.scrollLeft / step));
    const visible = Math.max(1, Math.round((track.clientWidth + 20) / step));
    status.textContent = 'Considerations ' + (first + 1) + '–' + Math.min(cards.length, first + visible) + ' of ' + cards.length;
  }
  function move(direction) {
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    track.scrollBy({left:direction * step, behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  }
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('scroll', sync, {passive:true});
  if (typeof ResizeObserver === 'function') new ResizeObserver(sync).observe(track);
  else window.addEventListener('resize', sync);
  sync();
})();

