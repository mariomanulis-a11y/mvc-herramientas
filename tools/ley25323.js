// ley25323.js — Calculadora Ley 25323 - Recargos Indemnizatorios
// Panel Legal — Herramienta de recargos sobre indemnizaciones
import { exportarPDF, exportarCSV } from './exportar.js';

export function initLey25323(container) {
  container.innerHTML = `
    <div class="tool-card">
      <h2 style="margin-bottom:1.2rem;color:var(--color-accent)">Ley 25323 — Recargos Indemnizatorios</h2>

      <div class="form-row">
        <div class="field-group">
          <label for="l25-empleador">Empleador / Demandada</label>
          <input type="text" id="l25-empleador" placeholder="Ej: Empresa SA" autocomplete="off">
        </div>
        <div class="field-group">
          <label for="l25-nombre">Nombre del trabajador</label>
          <input type="text" id="l25-nombre" placeholder="Ej: Juan Pérez" autocomplete="off">
        </div>
      </div>

      <p style="font-weight:600;margin:.8rem 0 .4rem 0;color:var(--color-accent);">Conceptos base (ingresar montos calculados):</p>

      <div class="form-row">
        <div class="field-group">
          <label for="l25-ind245">Indemnización Art. 245 LCT ($)</label>
          <input type="number" id="l25-ind245" min="0" step="0.01" placeholder="Ej: 1500000">
          <span class="field-error" id="err-l25-ind245"></span>
        </div>
        <div class="field-group">
          <label for="l25-preaviso">Preaviso (Art. 232 LCT) ($)</label>
          <input type="number" id="l25-preaviso" min="0" step="0.01" placeholder="Ej: 500000">
          <span class="field-error" id="err-l25-preaviso"></span>
        </div>
      </div>

      <div class="form-row">
        <div class="field-group">
          <label for="l25-integracion">Integración mes de despido (Art. 233 LCT) ($)</label>
          <input type="number" id="l25-integracion" min="0" step="0.01" placeholder="Ej: 100000">
          <span class="field-error" id="err-l25-integracion"></span>
        </div>
        <div class="field-group">
          <label for="l25-sacpreaviso">SAC sobre preaviso ($)</label>
          <input type="number" id="l25-sacpreaviso" min="0" step="0.01" placeholder="Ej: 41666">
          <span class="field-error" id="err-l25-sacpreaviso"></span>
        </div>
      </div>

      <p style="font-weight:600;margin:.8rem 0 .6rem 0;color:var(--color-accent);">Recargos aplicables:</p>

      <div style="display:flex;flex-direction:column;gap:.7rem;margin-bottom:1rem;">
        <label style="display:flex;align-items:flex-start;gap:.6rem;cursor:pointer;padding:.7rem .9rem;background:rgba(201,168,76,.07);border-radius:8px;border:1px solid rgba(201,168,76,.18);">
          <input type="checkbox" id="l25-art1" style="margin-top:3px;flex-shrink:0;">
          <span>
            <strong style="color:var(--color-accent);">Art. 1 Ley 25323</strong> — El trabajador estaba no registrado o la relación estaba registrada deficientemente<br>
            <span style="font-size:.82rem;color:rgba(255,255,255,.55);">+50% adicional sobre la indemnización Art. 245</span>
          </span>
        </label>

        <label style="display:flex;align-items:flex-start;gap:.6rem;cursor:pointer;padding:.7rem .9rem;background:rgba(201,168,76,.07);border-radius:8px;border:1px solid rgba(201,168,76,.18);">
          <input type="checkbox" id="l25-art2" style="margin-top:3px;flex-shrink:0;">
          <span>
            <strong style="color:var(--color-accent);">Art. 2 Ley 25323</strong> — El empleador no abonó en tiempo y forma las indemnizaciones tras intimación fehaciente<br>
            <span style="font-size:.82rem;color:rgba(255,255,255,.55);">+50% adicional sobre (Ind. 245 + Preaviso + Integración + SAC s/Preaviso)</span>
          </span>
        </label>
      </div>

      <div style="padding:.7rem 1rem;background:rgba(255,200,50,.07);border-left:3px solid rgba(255,200,50,.4);border-radius:4px;font-size:.82rem;line-height:1.7;color:rgba(255,255,255,.6);margin-bottom:1.2rem;">
        <strong style="color:rgba(255,200,50,.9);">Notas:</strong><br>
        • <strong>Art. 1:</strong> Procede cuando la relación no está registrada o lo está deficientemente. No es acumulable con las multas de la Ley 24013, salvo por el excedente que pudiera corresponder.<br>
        • <strong>Art. 2:</strong> Requiere intimación fehaciente previa del trabajador al empleador. El juez puede reducir o eximir el recargo si mediare causa justificada de la mora en el pago.
      </div>

      <div>
        <button class="btn btn-primary" id="l25-calcular">Calcular recargos</button>
      </div>

      <div id="l25-resultado" style="margin-top:1.6rem;display:none;"></div>
    </div>
  `;

  if (!document.getElementById('l25-extra-styles')) {
    const st = document.createElement('style');
    st.id = 'l25-extra-styles';
    st.textContent = `
      .field-error { color:#e53935;font-size:.78rem;display:block;min-height:1rem;margin-top:2px; }
      input.error { border-color:#e53935!important;box-shadow:0 0 0 2px rgba(229,57,53,.18); }
      .l25-tabla { width:100%;border-collapse:collapse;margin-top:1rem; }
      .l25-tabla th { text-align:left;padding:.5rem .7rem;background:var(--color-card,#1e2130);color:var(--color-accent,#c9a84c);font-size:.82rem;text-transform:uppercase;letter-spacing:.04em;border-bottom:2px solid var(--color-accent,#c9a84c); }
      .l25-tabla td { padding:.5rem .7rem;border-bottom:1px solid rgba(255,255,255,.07);font-size:.95rem; }
      .l25-tabla .monto { text-align:right;font-variant-numeric:tabular-nums; }
      .l25-tabla .seccion-row td { font-weight:600;background:rgba(201,168,76,.06);color:rgba(255,255,255,.7);font-size:.82rem;text-transform:uppercase;letter-spacing:.04em;padding:.35rem .7rem; }
      .l25-tabla .recargo-row td { color:var(--color-accent,#c9a84c);font-weight:600; }
      .l25-tabla .total-row td { font-weight:700;background:rgba(201,168,76,.14);color:var(--color-accent,#c9a84c);font-size:1.05rem;border-top:2px solid var(--color-accent,#c9a84c); }
      .l25-total-grande { font-size:1.6rem;font-weight:800;color:var(--color-accent,#c9a84c);margin-top:1rem;text-align:right; }
    `;
    document.head.appendChild(st);
  }

  container.querySelector('#l25-calcular').addEventListener('click', calcular);

  function fmt(n) {
    return '$ ' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function clearErrors() {
    container.querySelectorAll('.field-error').forEach(e => e.textContent = '');
    container.querySelectorAll('input.error').forEach(e => e.classList.remove('error'));
  }

  function setError(fieldId, errId, msg) {
    const f = container.querySelector('#' + fieldId);
    const e = container.querySelector('#' + errId);
    if (f) f.classList.add('error');
    if (e) e.textContent = msg;
  }

  function parseField(id, errId, label) {
    const val = container.querySelector('#' + id).value;
    if (val === '' || val === undefined) return { ok: true, val: 0 };
    const n = parseFloat(val);
    if (isNaN(n) || n < 0) {
      setError(id, errId, `${label}: ingresá un valor válido (≥ 0).`);
      return { ok: false, val: 0 };
    }
    return { ok: true, val: n };
  }

  function calcular() {
    clearErrors();
    const resultDiv = container.querySelector('#l25-resultado');
    resultDiv.style.display = 'none';
    resultDiv.innerHTML = '';

    const empleador = container.querySelector('#l25-empleador').value.trim();
    const nombre    = container.querySelector('#l25-nombre').value.trim();
    const art1      = container.querySelector('#l25-art1').checked;
    const art2      = container.querySelector('#l25-art2').checked;

    // Auto-carátula
    const autoCaratula = nombre && empleador
      ? `${nombre} c/ ${empleador} s/ Cobro de Recargos Ley 25323`
      : (nombre ? `${nombre} s/ Cobro de Recargos Ley 25323` : '');

    let valid = true;

    const r245    = parseField('l25-ind245',     'err-l25-ind245',     'Ind. Art. 245');
    const rPrav   = parseField('l25-preaviso',   'err-l25-preaviso',   'Preaviso');
    const rInteg  = parseField('l25-integracion','err-l25-integracion','Integración');
    const rSacPr  = parseField('l25-sacpreaviso','err-l25-sacpreaviso','SAC s/Preaviso');

    if (!r245.ok || !rPrav.ok || !rInteg.ok || !rSacPr.ok) valid = false;
    if (!valid) return;

    const ind245      = r245.val;
    const preaviso    = rPrav.val;
    const integracion = rInteg.val;
    const sacPreaviso = rSacPr.val;

    if (ind245 === 0 && preaviso === 0 && integracion === 0 && sacPreaviso === 0) {
      setError('l25-ind245', 'err-l25-ind245', 'Ingresá al menos un monto mayor a 0.');
      return;
    }

    const recargo1  = art1 ? ind245 * 0.50 : 0;
    const baseArt2  = ind245 + preaviso + integracion + sacPreaviso;
    const recargo2  = art2 ? baseArt2 * 0.50 : 0;
    const baseTotal = ind245 + preaviso + integracion + sacPreaviso;
    const total     = baseTotal + recargo1 + recargo2;

    const headerInfo = (nombre || empleador)
      ? `<div class="stats-row" style="margin-bottom:.8rem;">
           ${nombre   ? `<span class="stat-chip">${nombre}</span>`   : ''}
           ${empleador ? `<span class="stat-chip">${empleador}</span>` : ''}
         </div>`
      : '';

    const bases = [
      { label: 'Indemnización Art. 245 LCT',                monto: ind245,      activo: ind245 > 0 },
      { label: 'Preaviso (Art. 232 LCT)',                   monto: preaviso,    activo: preaviso > 0 },
      { label: 'Integración mes de despido (Art. 233 LCT)', monto: integracion, activo: integracion > 0 },
      { label: 'SAC sobre preaviso',                        monto: sacPreaviso, activo: sacPreaviso > 0 },
    ];

    let filas = '';
    filas += `<tr class="seccion-row"><td colspan="3">Conceptos base</td></tr>`;
    for (const b of bases) {
      if (!b.activo) continue;
      filas += `<tr><td>${b.label}</td><td class="monto">${fmt(b.monto)}</td><td></td></tr>`;
    }
    filas += `<tr style="opacity:.5"><td colspan="2" style="text-align:right;font-size:.85rem;padding:.3rem .7rem;">Subtotal base</td><td class="monto" style="text-align:right;font-size:.85rem;padding:.3rem .7rem;">${fmt(baseTotal)}</td></tr>`;

    if (art1 || art2) {
      filas += `<tr class="seccion-row"><td colspan="3">Recargos Ley 25323</td></tr>`;
      if (art1) filas += `<tr class="recargo-row"><td>Recargo Art. 1 Ley 25323 (+50% sobre Ind. 245)</td><td class="monto">+ ${fmt(recargo1)}</td><td style="font-size:.78rem;color:rgba(255,255,255,.45);">${fmt(ind245)} × 50%</td></tr>`;
      if (art2) filas += `<tr class="recargo-row"><td>Recargo Art. 2 Ley 25323 (+50% sobre base indemnizatoria)</td><td class="monto">+ ${fmt(recargo2)}</td><td style="font-size:.78rem;color:rgba(255,255,255,.45);">${fmt(baseArt2)} × 50%</td></tr>`;
    }
    filas += `<tr class="total-row"><td>TOTAL CON RECARGOS</td><td class="monto">${fmt(total)}</td><td></td></tr>`;

    resultDiv.innerHTML = `
      ${headerInfo}
      ${autoCaratula ? `<div style="font-size:.85rem;color:var(--color-muted);margin-bottom:.8rem;font-style:italic;">${autoCaratula}</div>` : ''}

      <table class="l25-tabla">
        <thead><tr><th>Concepto</th><th style="text-align:right;">Monto</th><th>Detalle</th></tr></thead>
        <tbody>${filas}</tbody>
      </table>

      <div class="l25-total-grande">${fmt(total)}</div>

      ${!art1 && !art2 ? `<p style="margin-top:.8rem;color:rgba(255,255,255,.45);font-size:.85rem;">No se seleccionaron recargos. El total equivale a la suma de los conceptos base.</p>` : ''}

      <div style="margin-top:1rem;padding:.7rem 1rem;background:rgba(255,200,50,.07);border-left:3px solid rgba(255,200,50,.4);border-radius:4px;font-size:.8rem;color:rgba(255,255,255,.55);line-height:1.7;">
        <strong style="color:rgba(255,200,50,.9);">Recordatorio:</strong><br>
        ${art1 ? '• <strong>Art. 1:</strong> No acumulable con multas Ley 24013, salvo por el excedente.<br>' : ''}
        ${art2 ? '• <strong>Art. 2:</strong> El juez puede reducir o eximir el recargo si el empleador acredita causa justificada de mora.<br>' : ''}
        • Los montos base ingresados deben provenir del cálculo de liquidación final conforme LCT.
      </div>

      <div style="margin-top:1rem;display:flex;flex-wrap:wrap;gap:10px;">
        <button class="btn btn-ghost" id="l25-copiar">📋 Copiar resumen</button>
        <button class="btn btn-ghost" id="l25-pdf">📄 Exportar PDF</button>
        <button class="btn btn-ghost" id="l25-csv">📊 Exportar CSV</button>
      </div>
    `;
    resultDiv.style.display = 'block';

    // — Copiar resumen
    container.querySelector('#l25-copiar').addEventListener('click', () => {
      let texto = `LEY 25323 — RECARGOS INDEMNIZATORIOS\n`;
      texto += `${'='.repeat(50)}\n`;
      if (nombre)       texto += `Trabajador: ${nombre}\n`;
      if (empleador)    texto += `Empleador:  ${empleador}\n`;
      if (autoCaratula) texto += `Carátula:   ${autoCaratula}\n`;
      texto += `${'─'.repeat(50)}\n`;
      texto += `CONCEPTOS BASE\n`;
      for (const b of bases) {
        if (!b.activo) continue;
        texto += `  ${b.label.padEnd(44)} ${fmt(b.monto)}\n`;
      }
      texto += `  Subtotal base${' '.repeat(31)} ${fmt(baseTotal)}\n`;
      if (art1 || art2) {
        texto += `\nRECARGOS LEY 25323\n`;
        if (art1) texto += `  Art. 1 — +50% sobre Ind. 245${' '.repeat(15)} ${fmt(recargo1)}\n`;
        if (art2) texto += `  Art. 2 — +50% sobre base indemn.${' '.repeat(10)} ${fmt(recargo2)}\n`;
      }
      texto += `${'─'.repeat(50)}\n`;
      texto += `TOTAL CON RECARGOS${' '.repeat(26)} ${fmt(total)}\n`;
      texto += `${'='.repeat(50)}\n`;
      navigator.clipboard.writeText(texto).then(() => {
        const b = container.querySelector('#l25-copiar');
        b.textContent = 'Copiado!';
        setTimeout(() => { b.textContent = '📋 Copiar resumen'; }, 2000);
      });
    });

    // — Exportar PDF
    container.querySelector('#l25-pdf').addEventListener('click', () => {
      const filasHtml = filas
        .replace(/class="seccion-row"/g, 'style="background:#f5f0e0;font-weight:700;font-size:11px;text-transform:uppercase"')
        .replace(/class="recargo-row"/g, 'style="color:#856404;font-weight:600"')
        .replace(/class="total-row"/g, 'class="total-row"');
      const html = `
        ${autoCaratula ? `<div class="info-box"><strong>Carátula:</strong> ${autoCaratula}</div>` : ''}
        ${nombre || empleador ? `<div class="info-box">${nombre ? `<strong>Trabajador:</strong> ${nombre}<br>` : ''}${empleador ? `<strong>Empleador:</strong> ${empleador}` : ''}</div>` : ''}
        <table>
          <thead><tr><th>Concepto</th><th>Monto</th><th>Detalle</th></tr></thead>
          <tbody>${filasHtml}</tbody>
        </table>
        <div class="result-big">TOTAL: ${fmt(total)}</div>`;
      exportarPDF('Ley 25323 — Recargos Indemnizatorios', html);
    });

    // — Exportar CSV
    container.querySelector('#l25-csv').addEventListener('click', () => {
      const csvFilas = [
        ['Concepto', 'Monto ($)', 'Tipo'],
        ...bases.filter(b => b.activo).map(b => [b.label, b.monto.toFixed(2), 'Base']),
        ['Subtotal base', baseTotal.toFixed(2), ''],
        ...(art1 ? [['Recargo Art. 1 (+50% sobre Ind. 245)', recargo1.toFixed(2), 'Recargo']] : []),
        ...(art2 ? [['Recargo Art. 2 (+50% sobre base indemn.)', recargo2.toFixed(2), 'Recargo']] : []),
        ['TOTAL CON RECARGOS', total.toFixed(2), ''],
        ['', '', ''],
        ['Trabajador', nombre, ''],
        ['Empleador', empleador, ''],
        ['Carátula', autoCaratula, ''],
      ];
      exportarCSV('Ley25323' + (nombre ? '_' + nombre : ''), csvFilas);
    });
  }
}
