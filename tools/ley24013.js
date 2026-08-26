// ley24013.js — Daños y Perjuicios por Empleo No Registrado (ex arts. 8, 9 y 10, Ley 24.013)
// Panel Legal — Los arts. 8, 9, 10 y 15 de la Ley 24.013 fueron derogados por los arts. 99-100 de la
// Ley 27.742 "Bases" (B.O. 8/7/2024, vigencia 9/7/2024), en el mismo paquete normativo que derogó la
// Ley 25.323 (art. 55, DNU 70/2023, ratificado por la propia Ley 27.742). Por decisión del Estudio
// (26/8/2026), esta herramienta reclama estos rubros como daño y perjuicio de derecho común
// (arts. 1716, 1717, 1738 y 1740 CCyC), usando el 25% de las remuneraciones devengadas como pauta
// objetiva de cuantificación — idéntico criterio que en ley25323.js.
import { exportarPDF, exportarCSV } from './exportar.js';

export function initLey24013(container) {
  container.innerHTML = `
    <div class="tool-card">
      <h2 style="margin-bottom:.6rem;color:var(--color-accent)">Daños y Perjuicios por Empleo No Registrado <span style="font-weight:400;opacity:.7">(ex arts. 8, 9 y 10, Ley 24.013)</span></h2>

      <div style="padding:.8rem 1rem;background:rgba(255,200,50,.08);border-left:3px solid rgba(255,200,50,.45);border-radius:4px;font-size:.82rem;line-height:1.7;color:rgba(255,255,255,.75);margin-bottom:1.2rem;">
        <strong style="color:rgba(255,200,50,.95);">Encuadre normativo:</strong> los arts. 8, 9, 10 y 15 de la Ley 24.013 fueron derogados por los arts. 99-100 de la Ley 27.742 "Bases" (B.O. 8/7/2024, vigencia 9/7/2024) — el mismo paquete que derogó la Ley 25.323. Esta herramienta reclama los rubros de no registración/subregistro como <strong>daño y perjuicio de derecho común</strong> (arts. 1716, 1717, 1738 y 1740 CCyC), utilizando el 25% de las remuneraciones devengadas (fórmula de los ex arts. 8, 9 y 10) como pauta objetiva del daño.<br><br>
        <strong style="color:rgba(255,200,50,.95);">Nota de riesgo residual:</strong> que la derogación esté ratificada por una ley del Congreso no la inmuniza per se de un planteo de inconstitucionalidad por no regresividad — es terreno constitucional aún no saldado por la Corte Suprema. No asumir que el riesgo es menor solo por tratarse de una ley.
      </div>

      <div class="form-row">
        <div class="field-group">
          <label for="l24-empleador">Empleador / Demandada</label>
          <input type="text" id="l24-empleador" placeholder="Ej: Empresa SA" autocomplete="off">
        </div>
        <div class="field-group">
          <label for="l24-nombre">Nombre del trabajador</label>
          <input type="text" id="l24-nombre" placeholder="Ej: Juan Pérez" autocomplete="off">
        </div>
      </div>

      <div class="form-row">
        <div class="field-group">
          <label for="l24-inicio-real">Fecha de inicio real de la relación laboral</label>
          <input type="date" id="l24-inicio-real">
          <span class="field-error" id="err-l24-inicio-real"></span>
        </div>
        <div class="field-group">
          <label for="l24-telegrama">Fecha de envío de telegrama / intimación</label>
          <input type="date" id="l24-telegrama">
          <span class="field-error" id="err-l24-telegrama"></span>
        </div>
      </div>

      <div class="form-row">
        <div class="field-group">
          <label for="l24-rem">Remuneración mensual real ($)</label>
          <input type="number" id="l24-rem" min="0" step="0.01" placeholder="Ej: 500000">
          <span class="field-error" id="err-l24-rem"></span>
        </div>
      </div>

      <div class="form-row" style="flex-direction:column;gap:.5rem;margin-top:.4rem;">
        <p style="font-weight:600;margin:0 0 .4rem 0;color:var(--color-accent);">Rubros de daño y perjuicio reclamables:</p>

        <label style="display:flex;align-items:flex-start;gap:.6rem;cursor:pointer;">
          <input type="checkbox" id="l24-art8" style="margin-top:2px;">
          <span><strong>Falta de registración</strong> — Relación laboral no registrada <span style="font-size:.82rem;color:rgba(255,255,255,.55);">(quantum ex art. 8, Ley 24.013 — hoy derogado: 25% de remuneraciones devengadas durante el período no registrado)</span></span>
        </label>

        <label style="display:flex;align-items:flex-start;gap:.6rem;cursor:pointer;">
          <input type="checkbox" id="l24-art9" style="margin-top:2px;">
          <span><strong>Subregistro de fecha de ingreso</strong> — fecha consignada posterior a la real <span style="font-size:.82rem;color:rgba(255,255,255,.55);">(quantum ex art. 9, Ley 24.013 — hoy derogado)</span></span>
        </label>
        <div id="l24-art9-campos" style="display:none;padding:.5rem .8rem;background:rgba(255,255,255,.04);border-radius:6px;margin-left:1.6rem;">
          <div class="field-group">
            <label for="l24-art9-meses">Meses de diferencia entre fecha real y fecha registrada</label>
            <input type="number" id="l24-art9-meses" min="0" step="1" placeholder="Ej: 6">
            <span class="field-error" id="err-l24-art9-meses"></span>
          </div>
        </div>

        <label style="display:flex;align-items:flex-start;gap:.6rem;cursor:pointer;">
          <input type="checkbox" id="l24-art10" style="margin-top:2px;">
          <span><strong>Subregistro de remuneración</strong> — remuneración consignada inferior a la real <span style="font-size:.82rem;color:rgba(255,255,255,.55);">(quantum ex art. 10, Ley 24.013 — hoy derogado)</span></span>
        </label>
        <div id="l24-art10-campos" style="display:none;padding:.5rem .8rem;background:rgba(255,255,255,.04);border-radius:6px;margin-left:1.6rem;">
          <div class="field-group">
            <label for="l24-rem-consignada">Remuneración consignada (la del recibo, menor) ($)</label>
            <input type="number" id="l24-rem-consignada" min="0" step="0.01" placeholder="Ej: 300000">
            <span class="field-error" id="err-l24-rem-consignada"></span>
          </div>
        </div>

        <label style="display:flex;align-items:flex-start;gap:.6rem;cursor:pointer;">
          <input type="checkbox" id="l24-art11" style="margin-top:2px;">
          <span><strong>Obstaculización de la inspección laboral</strong> — duplica los montos seleccionados <span style="font-size:.82rem;color:rgba(255,255,255,.55);">(criterio ex art. 11, Ley 24.013)</span></span>
        </label>

        <label style="display:flex;align-items:flex-start;gap:.6rem;cursor:pointer;">
          <input type="checkbox" id="l24-regularizo" style="margin-top:2px;">
          <span style="color:rgba(255,200,100,.9);"><strong>El empleador regularizó dentro de los 30 días</strong> de la intimación fehaciente (el daño no procede)</span>
        </label>
      </div>

      <div style="margin-top:1.2rem;padding:.7rem 1rem;background:rgba(255,200,50,.07);border-left:3px solid rgba(255,200,50,.4);border-radius:4px;font-size:.82rem;line-height:1.6;color:rgba(255,255,255,.65);">
        <strong style="color:rgba(255,200,50,.9);">Requisitos formales:</strong><br>
        • Se requiere intimación fehaciente previa al empleador (criterio ex art. 11 Ley 24.013).<br>
        • Se requiere también intimación a la ARCA (Agencia de Recaudación y Control Aduanero, ex AFIP), conforme art. 47 dec. 1043/2001 y art. 52 LCT (texto según art. 20, Ley 27.802).<br>
        • El daño no procede si el empleador regularizó dentro de los 30 días de la intimación.
      </div>

      <div style="margin-top:1.2rem;">
        <button class="btn btn-primary" id="l24-calcular">Calcular</button>
      </div>

      <div id="l24-resultado" style="margin-top:1.6rem;display:none;"></div>
    </div>
  `;

  if (!document.getElementById('l24-extra-styles')) {
    const st = document.createElement('style');
    st.id = 'l24-extra-styles';
    st.textContent = `
      .field-error { color:#e53935;font-size:.78rem;display:block;min-height:1rem;margin-top:2px; }
      input.error,select.error { border-color:#e53935!important;box-shadow:0 0 0 2px rgba(229,57,53,.18); }
      .l24-tabla { width:100%;border-collapse:collapse;margin-top:1rem; }
      .l24-tabla th { text-align:left;padding:.5rem .7rem;background:var(--color-card,#1e2130);color:var(--color-accent,#c9a84c);font-size:.82rem;text-transform:uppercase;letter-spacing:.04em;border-bottom:2px solid var(--color-accent,#c9a84c); }
      .l24-tabla td { padding:.5rem .7rem;border-bottom:1px solid rgba(255,255,255,.07);font-size:.95rem; }
      .l24-tabla .monto { text-align:right;font-variant-numeric:tabular-nums; }
      .l24-tabla .total-row td { font-weight:700;background:rgba(201,168,76,.10);color:var(--color-accent,#c9a84c);font-size:1.05rem; }
      .l24-total-grande { font-size:1.6rem;font-weight:800;color:var(--color-accent,#c9a84c);margin-top:1rem;text-align:right; }
      .l24-aviso-noprocede { background:rgba(229,57,53,.12);border-left:3px solid #e53935;padding:.8rem 1rem;border-radius:4px;color:#e57373;font-weight:600; }
    `;
    document.head.appendChild(st);
  }

  container.querySelector('#l24-art9').addEventListener('change', function () {
    container.querySelector('#l24-art9-campos').style.display = this.checked ? 'block' : 'none';
  });
  container.querySelector('#l24-art10').addEventListener('change', function () {
    container.querySelector('#l24-art10-campos').style.display = this.checked ? 'block' : 'none';
  });

  container.querySelector('#l24-calcular').addEventListener('click', calcular);

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

  function calcular() {
    clearErrors();
    const resultDiv = container.querySelector('#l24-resultado');
    resultDiv.style.display = 'none';
    resultDiv.innerHTML = '';

    const empleador    = container.querySelector('#l24-empleador').value.trim();
    const nombre       = container.querySelector('#l24-nombre').value.trim();
    const inicioStr    = container.querySelector('#l24-inicio-real').value;
    const telegramStr  = container.querySelector('#l24-telegrama').value;
    const remStr       = container.querySelector('#l24-rem').value;
    const art8         = container.querySelector('#l24-art8').checked;
    const art9         = container.querySelector('#l24-art9').checked;
    const art10        = container.querySelector('#l24-art10').checked;
    const art11        = container.querySelector('#l24-art11').checked;
    const regularizo   = container.querySelector('#l24-regularizo').checked;

    // Auto-carátula
    const autoCaratula = nombre && empleador
      ? `${nombre} c/ ${empleador} s/ Cobro de Daños y Perjuicios por Empleo No Registrado (ex Ley 24.013)`
      : (nombre ? `${nombre} s/ Cobro de Daños y Perjuicios por Empleo No Registrado (ex Ley 24.013)` : '');

    let valid = true;

    if (!inicioStr)   { setError('l24-inicio-real', 'err-l24-inicio-real', 'Ingresá la fecha de inicio real.'); valid = false; }
    if (!telegramStr) { setError('l24-telegrama',   'err-l24-telegrama',   'Ingresá la fecha del telegrama.'); valid = false; }
    if (inicioStr && telegramStr) {
      const fi = new Date(inicioStr   + 'T00:00:00');
      const ft = new Date(telegramStr + 'T00:00:00');
      if (isNaN(fi.getTime())) { setError('l24-inicio-real', 'err-l24-inicio-real', 'Fecha inválida.'); valid = false; }
      if (isNaN(ft.getTime())) { setError('l24-telegrama',   'err-l24-telegrama',   'Fecha inválida.'); valid = false; }
      if (!isNaN(fi.getTime()) && !isNaN(ft.getTime()) && fi >= ft) {
        setError('l24-telegrama', 'err-l24-telegrama', 'La fecha del telegrama debe ser posterior al inicio.');
        valid = false;
      }
    }
    const rem = parseFloat(remStr);
    if (!remStr || isNaN(rem) || rem <= 0) {
      setError('l24-rem', 'err-l24-rem', 'Ingresá una remuneración válida mayor a 0.');
      valid = false;
    }

    let mesesArt9 = 0;
    if (art9) {
      const v = parseFloat(container.querySelector('#l24-art9-meses').value);
      if (isNaN(v) || v <= 0) {
        setError('l24-art9-meses', 'err-l24-art9-meses', 'Ingresá los meses de diferencia.');
        valid = false;
      } else {
        mesesArt9 = v;
      }
    }

    let remConsignada = 0;
    if (art10) {
      const v = parseFloat(container.querySelector('#l24-rem-consignada').value);
      if (isNaN(v) || v <= 0) {
        setError('l24-rem-consignada', 'err-l24-rem-consignada', 'Ingresá la remuneración consignada.');
        valid = false;
      } else if (v >= rem) {
        setError('l24-rem-consignada', 'err-l24-rem-consignada', 'Debe ser menor a la remuneración real.');
        valid = false;
      } else {
        remConsignada = v;
      }
    }

    if (!valid) return;

    const inicio    = new Date(inicioStr   + 'T00:00:00');
    const telegrama = new Date(telegramStr + 'T00:00:00');

    let mesesNR = (telegrama.getFullYear() - inicio.getFullYear()) * 12
                + (telegrama.getMonth() - inicio.getMonth());
    if (telegrama.getDate() < inicio.getDate()) mesesNR--;
    if (mesesNR < 0) mesesNR = 0;
    const mesesNRDisplay = mesesNR === 0 ? 1 : mesesNR;

    const mult = art11 ? 2 : 1;

    let multa8 = 0, multa8Base = '', multa8Label = '';
    if (art8) {
      multa8       = rem * mesesNRDisplay * 0.25 * mult;
      multa8Label  = `Daño por falta de registración (ex art. 8, Ley 24.013)${art11 ? ' (×2 obstaculización)' : ''}`;
      multa8Base   = `${fmt(rem)} × ${mesesNRDisplay} mes(es) × 25%${art11 ? ' × 2' : ''}`;
    }

    let multa9 = 0, multa9Base = '', multa9Label = '';
    if (art9) {
      multa9       = rem * mesesArt9 * 0.25 * mult;
      multa9Label  = `Daño por subregistro de fecha de ingreso (ex art. 9, Ley 24.013)${art11 ? ' (×2 obstaculización)' : ''}`;
      multa9Base   = `${fmt(rem)} × ${mesesArt9} mes(es) de diferencia × 25%${art11 ? ' × 2' : ''}`;
    }

    let multa10 = 0, multa10Base = '', multa10Label = '';
    if (art10) {
      const difRem  = rem - remConsignada;
      multa10       = difRem * mesesNRDisplay * 0.25 * mult;
      multa10Label  = `Daño por subregistro de remuneración (ex art. 10, Ley 24.013)${art11 ? ' (×2 obstaculización)' : ''}`;
      multa10Base   = `(${fmt(rem)} − ${fmt(remConsignada)}) × ${mesesNRDisplay} mes(es) × 25%${art11 ? ' × 2' : ''}`;
    }

    const total    = multa8 + multa9 + multa10;
    const conceptos = [
      { label: multa8Label,  monto: multa8,  base: multa8Base,  activo: art8 },
      { label: multa9Label,  monto: multa9,  base: multa9Base,  activo: art9 },
      { label: multa10Label, monto: multa10, base: multa10Base, activo: art10 },
    ];

    if (regularizo) {
      resultDiv.innerHTML = `
        <div class="l24-aviso-noprocede">
          El empleador regularizó la situación dentro de los 30 días de la intimación fehaciente.<br>
          El daño y perjuicio por no registración/subregistro (ex arts. 8, 9 y 10 Ley 24.013) <strong>no procede</strong>.
        </div>`;
      resultDiv.style.display = 'block';
      return;
    }

    if (!art8 && !art9 && !art10) {
      resultDiv.innerHTML = `<p style="color:rgba(255,255,255,.5);">Seleccioná al menos un rubro para calcular.</p>`;
      resultDiv.style.display = 'block';
      return;
    }

    const headerInfo = (nombre || empleador)
      ? `<div class="stats-row" style="margin-bottom:.8rem;">
           ${nombre   ? `<span class="stat-chip">${nombre}</span>`   : ''}
           ${empleador ? `<span class="stat-chip">${empleador}</span>` : ''}
         </div>`
      : '';

    let filas = '';
    for (const c of conceptos) {
      if (!c.activo) continue;
      filas += `
        <tr>
          <td>${c.label}</td>
          <td class="monto">${fmt(c.monto)}</td>
          <td style="font-size:.78rem;color:rgba(255,255,255,.45);">${c.base}</td>
        </tr>`;
    }

    resultDiv.innerHTML = `
      ${headerInfo}
      ${autoCaratula ? `<div style="font-size:.85rem;color:var(--color-muted);margin-bottom:.8rem;font-style:italic;">${autoCaratula}</div>` : ''}
      <div class="display-box" style="margin-bottom:1rem;">
        <strong>Período no registrado:</strong> ${inicio.toLocaleDateString('es-AR')} → ${telegrama.toLocaleDateString('es-AR')} (${mesesNRDisplay} mes(es))<br>
        <strong>Remuneración real:</strong> ${fmt(rem)}<br>
        ${art11 ? '<strong style="color:var(--color-accent);">Obstaculización de la inspección: todos los montos se duplican.</strong>' : ''}
      </div>

      <table class="l24-tabla">
        <thead>
          <tr>
            <th>Concepto</th>
            <th style="text-align:right;">Daño</th>
            <th>Base de cálculo</th>
          </tr>
        </thead>
        <tbody>
          ${filas}
          <tr class="total-row">
            <td>TOTAL DAÑOS Y PERJUICIOS</td>
            <td class="monto">${fmt(total)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <div class="l24-total-grande">${fmt(total)}</div>

      <div style="margin-top:1rem;padding:.7rem 1rem;background:rgba(255,200,50,.07);border-left:3px solid rgba(255,200,50,.4);border-radius:4px;font-size:.8rem;color:rgba(255,255,255,.55);line-height:1.7;">
        <strong style="color:rgba(255,200,50,.9);">Notas:</strong><br>
        • El daño no procede si el empleador regularizó dentro de los 30 días de la intimación fehaciente.<br>
        • Se requiere intimación previa al empleador y a la ARCA (Agencia de Recaudación y Control Aduanero, ex AFIP), conforme art. 47 dec. 1043/2001.<br>
        • Los tres rubros no son acumulables entre sí por el mismo período cuando encubren el mismo incumplimiento.<br>
        • Fundar como daño y perjuicio de derecho común (arts. 1716, 1717, 1738 y 1740 CCyC): los arts. 8, 9, 10 y 15 de la Ley 24.013 fueron derogados por los arts. 99-100 de la Ley 27.742 (vigencia 9/7/2024).
      </div>

      <div style="margin-top:1rem;display:flex;flex-wrap:wrap;gap:10px;">
        <button class="btn btn-ghost" id="l24-copiar">📋 Copiar resumen</button>
        <button class="btn btn-ghost" id="l24-pdf">📄 Exportar PDF</button>
        <button class="btn btn-ghost" id="l24-csv">📊 Exportar CSV</button>
      </div>
    `;
    resultDiv.style.display = 'block';

    // — Copiar resumen
    container.querySelector('#l24-copiar').addEventListener('click', () => {
      let texto = `DAÑOS Y PERJUICIOS POR EMPLEO NO REGISTRADO (ex Ley 24.013)\n`;
      texto += `${'='.repeat(50)}\n`;
      if (nombre)       texto += `Trabajador: ${nombre}\n`;
      if (empleador)    texto += `Empleador:  ${empleador}\n`;
      if (autoCaratula) texto += `Carátula:   ${autoCaratula}\n`;
      texto += `Período no registrado: ${inicio.toLocaleDateString('es-AR')} → ${telegrama.toLocaleDateString('es-AR')} (${mesesNRDisplay} mes(es))\n`;
      texto += `Remuneración real: ${fmt(rem)}\n`;
      if (art11) texto += `Obstaculización de inspección: ACTIVO (montos duplicados)\n`;
      texto += `${'─'.repeat(50)}\n`;
      for (const c of conceptos) {
        if (!c.activo) continue;
        texto += `${c.label.padEnd(44)} ${fmt(c.monto)}\n`;
      }
      texto += `${'─'.repeat(50)}\n`;
      texto += `TOTAL:${' '.repeat(38)} ${fmt(total)}\n`;
      texto += `${'='.repeat(50)}\n`;
      navigator.clipboard.writeText(texto).then(() => {
        const b = container.querySelector('#l24-copiar');
        b.textContent = 'Copiado!';
        setTimeout(() => { b.textContent = '📋 Copiar resumen'; }, 2000);
      });
    });

    // — Exportar PDF
    container.querySelector('#l24-pdf').addEventListener('click', () => {
      const filasHtml = conceptos.filter(c => c.activo).map(c => `
        <tr>
          <td>${c.label}</td>
          <td class="monto">${fmt(c.monto)}</td>
          <td style="font-size:11px;color:#777">${c.base}</td>
        </tr>`).join('') + `
        <tr class="total-row">
          <td>TOTAL DAÑOS Y PERJUICIOS</td>
          <td class="monto">${fmt(total)}</td>
          <td></td>
        </tr>`;
      const html = `
        ${autoCaratula ? `<div class="info-box"><strong>Carátula:</strong> ${autoCaratula}</div>` : ''}
        <div class="info-box">
          ${nombre   ? `<strong>Trabajador:</strong> ${nombre}<br>` : ''}
          ${empleador ? `<strong>Empleador:</strong> ${empleador}<br>` : ''}
          <strong>Período no registrado:</strong> ${inicio.toLocaleDateString('es-AR')} → ${telegrama.toLocaleDateString('es-AR')} (${mesesNRDisplay} mes(es))<br>
          <strong>Remuneración real:</strong> ${fmt(rem)}
          ${art11 ? '<br><strong>Obstaculización de inspección: montos duplicados</strong>' : ''}
        </div>
        <table>
          <thead><tr><th>Concepto</th><th>Daño</th><th>Base de cálculo</th></tr></thead>
          <tbody>${filasHtml}</tbody>
        </table>
        <div class="result-big">TOTAL: ${fmt(total)}</div>`;
      exportarPDF('Daños y Perjuicios por Empleo No Registrado (ex Ley 24.013)', html);
    });

    // — Exportar CSV
    container.querySelector('#l24-csv').addEventListener('click', () => {
      const csvFilas = [
        ['Concepto', 'Monto ($)', 'Base de cálculo'],
        ...conceptos.filter(c => c.activo).map(c => [c.label, c.monto.toFixed(2), c.base]),
        ['TOTAL', total.toFixed(2), ''],
        ['', '', ''],
        ['Trabajador', nombre, ''],
        ['Empleador', empleador, ''],
        ['Carátula', autoCaratula, ''],
        ['Remuneración real', rem.toFixed(2), ''],
        ['Período no registrado', `${inicio.toLocaleDateString('es-AR')} → ${telegrama.toLocaleDateString('es-AR')}`, `${mesesNRDisplay} mes(es)`],
      ];
      exportarCSV('Ley24013' + (nombre ? '_' + nombre : ''), csvFilas);
    });
  }
}
