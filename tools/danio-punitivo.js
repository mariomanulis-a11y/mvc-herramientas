/* ============================================================
   Daño Punitivo — Art. 52 bis Ley 24.240
   tools/danio-punitivo.js
   ============================================================ */

export function initDanioPunitivo(container) {

  const FACTORES = [
    { id: 'gs', label: 'Gravedad subjetiva',        pct: 20, opciones: [['Leve',0.25],['Media',0.5],['Grave',1.0]] },
    { id: 'ph', label: 'Política vs hecho aislado', pct: 10, opciones: [['Empleado único',0.25],['Grupo de empleados',0.5],['Política empresarial',1.0]] },
    { id: 'cp', label: 'Conducta posterior',         pct: 10, opciones: [['Colaborativa',0.1],['Errática',0.5],['Justificativa/Negatoria',1.0]] },
    { id: 'an', label: 'Antecedentes',               pct: 10, opciones: [['No disponibles',0.1],['Algunos reconocidos',0.5],['Muchos',1.0]] },
    { id: 'pm', label: 'Posición de mercado',        pct: 10, opciones: [['Competencia',0.1],['Oligopolio',0.5],['Monopolio',1.0]] },
    { id: 'da', label: 'Derecho afectado',           pct: 15, opciones: [['Leve',0.25],['Medio',0.5],['Grave',1.0]] },
    { id: 'al', label: 'Alcance del daño',           pct: 10, opciones: [['Caso puntual',0.25],['Grupo de usuarios',0.5],['Generalizado',1.0]] },
    { id: 'bo', label: 'Beneficio obtenido',         pct: 15, opciones: [['Nulo',0.1],['Bajo',0.25],['Medio',0.5],['Alto',1.0]] },
  ];

  const factoresHTML = FACTORES.map(f => `
    <div style="display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--color-border);">
      <div style="font-size:0.88rem;font-weight:600;">${f.label}</div>
      <select data-fid="${f.id}" style="min-width:200px;">
        ${f.opciones.map(([l,v]) => `<option value="${v}">${l}</option>`).join('')}
      </select>
      <div style="display:flex;align-items:center;gap:6px;">
        <input type="number" data-pid="${f.id}" value="${f.pct}" min="0" max="100" step="1" style="width:64px;text-align:right;">
        <span style="color:var(--color-muted);font-size:0.85rem;">%</span>
      </div>
    </div>`).join('');

  container.innerHTML = `
    <div class="tool-card">
      <h2>⚠️ Daño Punitivo — Art. 52 bis Ley 24.240</h2>

      <div class="form-row">
        <div class="field-group">
          <label>Carátula (opcional)</label>
          <input type="text" id="dp-caratula" placeholder="Opcional">
        </div>
        <div class="field-group">
          <label>Tamaño de empresa</label>
          <select id="dp-empresa">
            <option value="100">Pequeña (tope: 100 canastas)</option>
            <option value="750">Mediana (tope: 750 canastas)</option>
            <option value="2100">Grande (tope: 2100 canastas)</option>
          </select>
        </div>
        <div class="field-group">
          <label>Valor canasta básica total ($)</label>
          <input type="number" id="dp-canasta" value="400000" min="1" step="1000">
        </div>
      </div>

      <div style="margin:18px 0 8px;">
        <div style="display:grid;grid-template-columns:1fr auto auto;gap:10px;padding:6px 0;border-bottom:2px solid var(--color-accent);">
          <div style="font-size:0.72rem;color:var(--color-muted);text-transform:uppercase;font-weight:700;">Factor</div>
          <div style="font-size:0.72rem;color:var(--color-muted);text-transform:uppercase;font-weight:700;min-width:200px;">Nivel</div>
          <div style="font-size:0.72rem;color:var(--color-muted);text-transform:uppercase;font-weight:700;width:90px;text-align:right;">Ponderación</div>
        </div>
        ${factoresHTML}
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding:10px 14px;border-radius:8px;" id="dp-suma-wrap">
        <span style="font-size:0.85rem;">Suma de ponderaciones:</span>
        <span id="dp-suma" style="font-weight:700;font-size:1rem;"></span>
      </div>
    </div>

    <div class="tool-card">
      <h2>📊 Resultado en tiempo real</h2>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px;">
        <div class="display-box" style="text-align:center;">
          <div style="font-size:0.72rem;color:var(--color-muted);margin-bottom:4px;">Factor F (0–1)</div>
          <div id="dp-factor" style="font-size:1.4rem;font-weight:800;color:var(--color-accent);">—</div>
        </div>
        <div class="display-box" style="text-align:center;">
          <div style="font-size:0.72rem;color:var(--color-muted);margin-bottom:4px;">Tope máximo</div>
          <div id="dp-tope" style="font-size:1rem;font-weight:700;">—</div>
        </div>
        <div class="display-box" style="text-align:center;">
          <div style="font-size:0.72rem;color:var(--color-muted);margin-bottom:4px;">Multa estimada</div>
          <div id="dp-multa" style="font-size:1.4rem;font-weight:800;color:var(--color-accent);">—</div>
        </div>
      </div>

      <div class="btn-row">
        <button class="btn btn-success" id="dp-copiar">📋 Copiar resultado</button>
      </div>
      <div id="dp-toast" style="display:none;font-size:0.8rem;color:var(--color-success);margin-top:6px;">✓ Copiado al portapapeles</div>

      <div style="margin-top:16px;padding:12px;background:rgba(201,168,76,0.06);border-radius:8px;font-size:0.76rem;color:var(--color-muted);line-height:1.7;">
        Art. 52 bis Ley 24.240 (mod. Ley 26.361). Parámetros basados en la metodología del fallo Castelli (CNCom). El resultado es meramente orientativo. El tope se expresa en canastas básicas totales del INDEC.
      </div>
    </div>`;

  const getEl = id => container.querySelector('#' + id);
  const fmtPesos = n => '$\u00A0' + Math.round(n).toLocaleString('es-AR');

  function recalcular() {
    let suma = 0;
    FACTORES.forEach(f => {
      suma += parseFloat(container.querySelector(`[data-pid="${f.id}"]`).value) || 0;
    });

    const sumaEl   = getEl('dp-suma');
    const sumaWrap = getEl('dp-suma-wrap');
    sumaEl.textContent = suma.toFixed(1) + '%';
    const ok = Math.abs(suma - 100) < 0.05;
    sumaEl.style.color   = ok ? 'var(--color-success)' : 'var(--color-danger)';
    sumaWrap.style.background = ok ? 'rgba(46,204,113,0.07)' : 'rgba(231,76,60,0.07)';

    let F = 0;
    FACTORES.forEach(f => {
      const nivel = parseFloat(container.querySelector(`[data-fid="${f.id}"]`).value) || 0;
      const pct   = parseFloat(container.querySelector(`[data-pid="${f.id}"]`).value) || 0;
      F += nivel * (pct / 100);
    });

    const canastas  = parseInt(getEl('dp-empresa').value) || 100;
    const valCanasta = parseFloat(getEl('dp-canasta').value) || 400000;
    const tope  = canastas * valCanasta;
    const multa = F * tope;

    getEl('dp-factor').textContent = F.toFixed(4);
    getEl('dp-tope').textContent   = fmtPesos(tope) + ` (${canastas} canastas)`;
    getEl('dp-multa').textContent  = fmtPesos(multa);
  }

  container.querySelectorAll('select[data-fid], input[data-pid], #dp-empresa, #dp-canasta')
    .forEach(el => el.addEventListener('input', recalcular));

  getEl('dp-copiar').addEventListener('click', async () => {
    const caratula = getEl('dp-caratula').value || '—';
    const detalles = FACTORES.map(f => {
      const sel   = container.querySelector(`[data-fid="${f.id}"]`);
      const nivel = sel.options[sel.selectedIndex].text;
      const pct   = container.querySelector(`[data-pid="${f.id}"]`).value;
      return `  ${f.label}: ${nivel} (pond. ${pct}%)`;
    }).join('\n');
    const txt = `DAÑO PUNITIVO — Art. 52 bis Ley 24.240 — MVC ABOGADOS\n`
      + `Carátula: ${caratula}\n\nFactores evaluados:\n${detalles}\n\n`
      + `Factor F: ${getEl('dp-factor').textContent}\n`
      + `Tope: ${getEl('dp-tope').textContent}\n`
      + `Multa estimada: ${getEl('dp-multa').textContent}`;
    await navigator.clipboard.writeText(txt).catch(() => {});
    getEl('dp-toast').style.display = 'block';
    setTimeout(() => getEl('dp-toast').style.display = 'none', 2000);
  });

  recalcular();
}
