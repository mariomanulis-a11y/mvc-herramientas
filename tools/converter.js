/* ============================================================
   Unit Converter Tool — tools/converter.js
   ============================================================ */

export function initConverter(container) {

  const categories = {
    Longitud: {
      units: ['Metros', 'Kilómetros', 'Centímetros', 'Milímetros', 'Millas', 'Pies', 'Pulgadas', 'Yardas'],
      // factor to convert TO meters
      toBase: {
        'Metros': 1, 'Kilómetros': 1000, 'Centímetros': 0.01,
        'Milímetros': 0.001, 'Millas': 1609.344, 'Pies': 0.3048,
        'Pulgadas': 0.0254, 'Yardas': 0.9144
      }
    },
    Masa: {
      units: ['Kilogramos', 'Gramos', 'Miligramos', 'Toneladas', 'Libras', 'Onzas'],
      toBase: {
        'Kilogramos': 1, 'Gramos': 0.001, 'Miligramos': 0.000001,
        'Toneladas': 1000, 'Libras': 0.453592, 'Onzas': 0.0283495
      }
    },
    Temperatura: {
      units: ['Celsius', 'Fahrenheit', 'Kelvin'],
      toBase: null // special handling
    }
  };

  function buildOptions(units) {
    return units.map(u => `<option value="${u}">${u}</option>`).join('');
  }

  function buildCategoryTabs() {
    return Object.keys(categories).map(k =>
      `<button class="btn btn-ghost cat-tab" data-cat="${k}">${k}</button>`
    ).join('');
  }

  container.innerHTML = `
    <div class="tool-card">
      <h2>⚖️ Conversor de Unidades</h2>

      <div class="btn-row" style="margin-bottom:20px;" id="cat-tabs">
        ${buildCategoryTabs()}
      </div>

      <div class="form-row">
        <div class="field-group">
          <label>Valor</label>
          <input type="number" id="conv-value" placeholder="Ingresá el valor" step="any">
        </div>
        <div class="field-group">
          <label>Desde</label>
          <select id="conv-from"></select>
        </div>
        <div class="field-group">
          <label>Hacia</label>
          <select id="conv-to"></select>
        </div>
      </div>

      <button class="btn btn-primary" id="conv-btn">Convertir</button>

      <div class="conv-result" id="conv-result" style="display:none"></div>
      <div style="font-size:0.78rem; color:var(--color-muted); margin-top:4px;" id="conv-formula"></div>
    </div>`;

  let currentCat = 'Longitud';

  function setCategory(cat) {
    currentCat = cat;
    const { units } = categories[cat];
    const fromSel = container.querySelector('#conv-from');
    const toSel   = container.querySelector('#conv-to');
    fromSel.innerHTML = buildOptions(units);
    toSel.innerHTML   = buildOptions(units);
    if (units.length > 1) toSel.selectedIndex = 1;
    container.querySelectorAll('.cat-tab').forEach(b => {
      b.classList.toggle('btn-primary', b.dataset.cat === cat);
      b.classList.toggle('btn-ghost',   b.dataset.cat !== cat);
    });
    container.querySelector('#conv-result').style.display = 'none';
    container.querySelector('#conv-formula').textContent = '';
  }

  function convertTemp(val, from, to) {
    let celsius;
    if (from === 'Celsius')     celsius = val;
    if (from === 'Fahrenheit')  celsius = (val - 32) * 5 / 9;
    if (from === 'Kelvin')      celsius = val - 273.15;

    if (to === 'Celsius')       return celsius;
    if (to === 'Fahrenheit')    return celsius * 9 / 5 + 32;
    if (to === 'Kelvin')        return celsius + 273.15;
  }

  function doConvert() {
    const valInput = container.querySelector('#conv-value');
    const val = parseFloat(valInput.value);

    valInput.classList.remove('error');

    if (isNaN(val)) {
      valInput.classList.add('error');
      valInput.focus();
      return;
    }

    const from = container.querySelector('#conv-from').value;
    const to   = container.querySelector('#conv-to').value;

    let result;

    if (currentCat === 'Temperatura') {
      result = convertTemp(val, from, to);
    } else {
      const { toBase } = categories[currentCat];
      result = val * toBase[from] / toBase[to];
    }

    // Nice formatting
    const formatted = Math.abs(result) < 0.0001 || Math.abs(result) >= 1e9
      ? result.toExponential(6)
      : parseFloat(result.toPrecision(10)).toLocaleString('es-AR', { maximumFractionDigits: 8 });

    const resEl  = container.querySelector('#conv-result');
    const frmEl  = container.querySelector('#conv-formula');
    resEl.style.display = '';
    resEl.textContent = `${val} ${from} = ${formatted} ${to}`;
    frmEl.textContent = from === to ? '✓ Misma unidad' : `Fórmula: ${val} ${from} × factor → ${to}`;
  }

  // ── Events ────────────────────────────────────────────────
  container.querySelector('#cat-tabs').addEventListener('click', e => {
    const tab = e.target.closest('.cat-tab');
    if (tab) setCategory(tab.dataset.cat);
  });

  container.querySelector('#conv-btn').addEventListener('click', doConvert);

  container.querySelector('#conv-value').addEventListener('keydown', e => {
    if (e.key === 'Enter') doConvert();
  });

  // Block non-numeric input (allow: digits, dot, minus, backspace, arrows, delete)
  container.querySelector('#conv-value').addEventListener('keypress', e => {
    if (!/[\d.\-]/.test(e.key)) e.preventDefault();
  });

  setCategory('Longitud');
}
