// liquidacion.js — Liquidación Laboral LCT (Ley 20744)
// Panel Legal — Herramienta de liquidación final

export function initLiquidacion(container) {
  container.innerHTML = `
    <div class="tool-card">
      <h2 style="margin-bottom:1.2rem;color:var(--color-accent)">Liquidación Laboral — LCT (Ley 20744)</h2>

      <div class="form-row">
        <div class="field-group">
          <label for="liq-nombre">Nombre del trabajador</label>
          <input type="text" id="liq-nombre" placeholder="Ej: Juan Pérez" autocomplete="off">
        </div>
        <div class="field-group">
          <label for="liq-caratula">Carátula / Expediente</label>
          <input type="text" id="liq-caratula" placeholder="Ej: Pérez c/ Empresa SA" autocomplete="off">
        </div>
      </div>

      <div class="form-row">
        <div class="field-group">
          <label for="liq-ingreso">Fecha de ingreso</label>
          <input type="date" id="liq-ingreso">
          <span class="field-error" id="err-liq-ingreso"></span>
        </div>
        <div class="field-group">
          <label for="liq-egreso">Fecha de egreso</label>
          <input type="date" id="liq-egreso">
          <span class="field-error" id="err-liq-egreso"></span>
        </div>
      </div>

      <div class="form-row">
        <div class="field-group">
          <label for="liq-rem">Mejor remuneración mensual normal y habitual ($)</label>
          <input type="number" id="liq-rem" min="0" step="0.01" placeholder="Ej: 500000">
          <span class="field-error" id="err-liq-rem"></span>
        </div>
        <div class="field-group">
          <label for="liq-causa">Causa del egreso</label>
          <select id="liq-causa">
            <option value="despido_sin_causa">Despido sin causa (Art. 245)</option>
            <option value="despido_indirecto">Despido indirecto (Art. 246)</option>
            <option value="renuncia">Renuncia</option>
            <option value="mutuo_acuerdo">Mutuo acuerdo (Art. 241)</option>
            <option value="vencimiento_plazo">Vencimiento de plazo fijo (Art. 95)</option>
            <option value="fuerza_mayor">Fuerza mayor / falta de trabajo (Art. 247 — 50%)</option>
          </select>
        </div>
      </div>

      <div class="form-row" style="flex-direction:column;gap:0.6rem;">
        <label style="display:flex;align-items:center;gap:0.6rem;cursor:pointer;font-weight:500;">
          <input type="checkbox" id="liq-preaviso-recibido">
          El trabajador ya recibió preaviso (no se calcula indemnización sustitutiva)
        </label>
        <label style="display:flex;align-items:center;gap:0.6rem;cursor:pointer;font-weight:500;">
          <input type="checkbox" id="liq-sac-cobrado">
          Ya cobró el SAC del semestre en curso (no se incluye SAC proporcional)
        </label>
      </div>

      <div style="margin-top:1.2rem;">
        <button class="btn btn-primary" id="liq-calcular">Calcular liquidación</button>
      </div>

      <div id="liq-resultado" style="margin-top:1.6rem;display:none;"></div>
    </div>
  `;

  // Estilos inline para errores y tabla (complementan el style.css del proyecto)
  if (!document.getElementById('liq-extra-styles')) {
    const st = document.createElement('style');
    st.id = 'liq-extra-styles';
    st.textContent = `
      .field-error { color: #e53935; font-size: 0.78rem; display:block; min-height:1rem; margin-top:2px; }
      input.error, select.error { border-color: #e53935 !important; box-shadow: 0 0 0 2px rgba(229,57,53,.18); }
      .liq-tabla { width:100%; border-collapse:collapse; margin-top:1rem; }
      .liq-tabla th { text-align:left; padding:0.5rem 0.7rem; background:var(--color-card,#1e2130); color:var(--color-accent,#7c8cf8); font-size:0.82rem; text-transform:uppercase; letter-spacing:.04em; border-bottom:2px solid var(--color-accent,#7c8cf8); }
      .liq-tabla td { padding:0.5rem 0.7rem; border-bottom:1px solid rgba(255,255,255,.07); font-size:0.95rem; }
      .liq-tabla tr:last-child td { border-bottom:none; }
      .liq-tabla .monto { text-align:right; font-variant-numeric:tabular-nums; }
      .liq-total-row td { font-weight:700; background:rgba(124,140,248,.10); color:var(--color-accent,#7c8cf8); font-size:1.05rem; }
      .liq-total-grande { font-size:1.6rem; font-weight:800; color:var(--color-accent,#7c8cf8); margin-top:1rem; text-align:right; }
      .liq-info-row td { font-size:0.8rem; color:rgba(255,255,255,.45); font-style:italic; }
      .liq-nota { font-size:0.8rem; color:rgba(255,255,255,.45); margin-top:.6rem; font-style:italic; }
    `;
    document.head.appendChild(st);
  }

  const btn = container.querySelector('#liq-calcular');
  btn.addEventListener('click', calcular);

  function fmt(n) {
    return '$ ' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function clearErrors() {
    container.querySelectorAll('.field-error').forEach(e => e.textContent = '');
    container.querySelectorAll('input.error, select.error').forEach(e => e.classList.remove('error'));
  }

  function setError(fieldId, errId, msg) {
    const field = container.querySelector('#' + fieldId);
    const err = container.querySelector('#' + errId);
    if (field) field.classList.add('error');
    if (err) err.textContent = msg;
  }

  function calcular() {
    clearErrors();
    const resultDiv = container.querySelector('#liq-resultado');
    resultDiv.style.display = 'none';
    resultDiv.innerHTML = '';

    const nombre    = container.querySelector('#liq-nombre').value.trim();
    const caratula  = container.querySelector('#liq-caratula').value.trim();
    const ingresoStr = container.querySelector('#liq-ingreso').value;
    const egresoStr  = container.querySelector('#liq-egreso').value;
    const remStr     = container.querySelector('#liq-rem').value;
    const causa      = container.querySelector('#liq-causa').value;
    const praAvRecibido = container.querySelector('#liq-preaviso-recibido').checked;
    const sacCobrado    = container.querySelector('#liq-sac-cobrado').checked;

    let valid = true;

    if (!ingresoStr) { setError('liq-ingreso', 'err-liq-ingreso', 'Ingresá la fecha de ingreso.'); valid = false; }
    if (!egresoStr)  { setError('liq-egreso',  'err-liq-egreso',  'Ingresá la fecha de egreso.');  valid = false; }
    if (ingresoStr && egresoStr) {
      const fi = new Date(ingresoStr + 'T00:00:00');
      const fe = new Date(egresoStr  + 'T00:00:00');
      if (isNaN(fi.getTime())) { setError('liq-ingreso', 'err-liq-ingreso', 'Fecha inválida.'); valid = false; }
      if (isNaN(fe.getTime())) { setError('liq-egreso',  'err-liq-egreso',  'Fecha inválida.');  valid = false; }
      if (!isNaN(fi.getTime()) && !isNaN(fe.getTime()) && fi >= fe) {
        setError('liq-egreso', 'err-liq-egreso', 'La fecha de egreso debe ser posterior al ingreso.');
        valid = false;
      }
    }
    const rem = parseFloat(remStr);
    if (!remStr || isNaN(rem) || rem <= 0) {
      setError('liq-rem', 'err-liq-rem', 'Ingresá una remuneración válida mayor a 0.');
      valid = false;
    }

    if (!valid) return;

    const ingreso = new Date(ingresoStr + 'T00:00:00');
    const egreso  = new Date(egresoStr  + 'T00:00:00');

    // ── ANTIGÜEDAD ──────────────────────────────────────────────────────────
    let anosCompletos = egreso.getFullYear() - ingreso.getFullYear();
    let mesAjuste     = egreso.getMonth() - ingreso.getMonth();
    let diaAjuste     = egreso.getDate()  - ingreso.getDate();
    if (diaAjuste < 0) mesAjuste--;
    if (mesAjuste < 0) { anosCompletos--; mesAjuste += 12; }

    // Fracción: si la fracción supera 3 meses completos, cuenta un año más
    const fraccionMeses = mesAjuste + (diaAjuste < 0 ? -1 : 0 >= 0 ? 0 : 0);
    // Re-cálculo limpio de meses de fracción
    const egresoAnio  = egreso.getFullYear();
    const egresoMes   = egreso.getMonth();
    const egresodia   = egreso.getDate();
    const aniversario = new Date(egresoAnio - anosCompletos, ingreso.getMonth(), ingreso.getDate());
    // Meses exactos de fracción desde el último aniversario
    let mesesFrac = (egreso.getFullYear() - aniversario.getFullYear()) * 12
                  + (egreso.getMonth()    - aniversario.getMonth());
    if (egreso.getDate() < aniversario.getDate()) mesesFrac--;
    if (mesesFrac < 0) mesesFrac = 0;

    const anosConFraccion = anosCompletos + (mesesFrac > 3 ? 1 : 0);
    const anosParaCalculo = Math.max(anosConFraccion, 1); // mínimo 1

    // ── INDEMNIZACIÓN ART. 245 ───────────────────────────────────────────────
    let ind245 = 0;
    let ind245Label = '';
    let ind245Base  = '';
    if (causa === 'despido_sin_causa' || causa === 'despido_indirecto') {
      const formula = rem * anosParaCalculo;
      const minimo  = rem * 2;
      ind245 = Math.max(formula, minimo);
      const art = causa === 'despido_sin_causa' ? 'Art. 245 LCT' : 'Art. 246 / 245 LCT';
      ind245Label = `Indemnización por antigüedad (${art})`;
      ind245Base  = `${fmt(rem)} × ${anosParaCalculo} año(s)${formula < minimo ? ' [mínimo 2 remuneraciones aplicado]' : ''}`;
    } else if (causa === 'fuerza_mayor') {
      const formula = rem * anosParaCalculo;
      const minimo  = rem * 2;
      const base245 = Math.max(formula, minimo);
      ind245 = base245 * 0.5;
      ind245Label = 'Indemnización fuerza mayor / falta de trabajo (Art. 247 LCT — 50%)';
      ind245Base  = `50% de ${fmt(base245)} (${fmt(rem)} × ${anosParaCalculo} año(s))`;
    } else if (causa === 'vencimiento_plazo') {
      const formula = rem * anosParaCalculo;
      const minimo  = rem * 2;
      ind245 = Math.max(formula, minimo) * 0.5;
      ind245Label = 'Indemnización plazo fijo (Art. 95 LCT — 50% del art. 245)';
      ind245Base  = `50% de ${fmt(Math.max(rem * anosParaCalculo, rem * 2))}`;
    }

    // ── PREAVISO ART. 232 ────────────────────────────────────────────────────
    let preaviso = 0;
    let preavisoLabel = '';
    let preavisoDias  = 0;
    let preavisoBase  = '';
    const aplicaPreaviso = !praAvRecibido && causa !== 'mutuo_acuerdo' && causa !== 'renuncia';
    const esRenuncia = causa === 'renuncia';

    if (!praAvRecibido) {
      const mesesTotales = anosCompletos * 12 + mesesFrac;
      if (esRenuncia) {
        preavisoDias  = 15;
        preaviso      = (rem / 30) * 15;
        preavisoLabel = 'Preaviso omitido por renuncia (Art. 231 LCT — 15 días, a descontar)';
        preavisoBase  = `(${fmt(rem)} / 30) × 15 días`;
        preaviso = -preaviso; // descuento
      } else if (aplicaPreaviso) {
        if (mesesTotales < 3) {
          preavisoDias  = 15;
          preaviso      = (rem / 30) * 15;
          preavisoBase  = `(${fmt(rem)} / 30) × 15 días (antigüedad < 3 meses)`;
        } else if (anosCompletos < 5) {
          preavisoDias  = 30;
          preaviso      = rem;
          preavisoBase  = `1 mes (${fmt(rem)}) — antigüedad 3 meses a 5 años`;
        } else {
          preavisoDias  = 60;
          preaviso      = rem * 2;
          preavisoBase  = `2 meses (${fmt(rem * 2)}) — antigüedad > 5 años`;
        }
        preavisoLabel = `Indemnización sustitutiva de preaviso (Art. 232 LCT)`;
      }
    }

    // ── INTEGRACIÓN MES DE DESPIDO ART. 233 ─────────────────────────────────
    let integracion = 0;
    let integracionBase = '';
    const aplicaIntegracion = !praAvRecibido
      && (causa === 'despido_sin_causa' || causa === 'despido_indirecto');

    if (aplicaIntegracion) {
      const ultimoDiaMes = new Date(egreso.getFullYear(), egreso.getMonth() + 1, 0).getDate();
      const diasRestantes = ultimoDiaMes - egreso.getDate();
      if (diasRestantes > 0) {
        integracion = (rem / 30) * diasRestantes;
        integracionBase = `(${fmt(rem)} / 30) × ${diasRestantes} días restantes del mes`;
      }
    }

    // ── SAC SOBRE PREAVISO ───────────────────────────────────────────────────
    let sacPreaviso = 0;
    let sacPreavisoBase = '';
    const preavisoPositivo = preaviso > 0;
    if (preavisoPositivo) {
      sacPreaviso = preaviso / 12;
      sacPreavisoBase = `${fmt(preaviso)} / 12`;
    }

    // ── SAC PROPORCIONAL ─────────────────────────────────────────────────────
    let sacProp = 0;
    let sacPropBase = '';
    if (!sacCobrado) {
      const mes = egreso.getMonth(); // 0-based
      let inicioSemestre;
      if (mes <= 5) {
        inicioSemestre = new Date(egreso.getFullYear(), 0, 1); // 1 enero
      } else {
        inicioSemestre = new Date(egreso.getFullYear(), 6, 1); // 1 julio
      }
      // Meses trabajados en el semestre (desde inicio semestre o ingreso, lo que sea posterior)
      const desdeEfectivo = ingreso > inicioSemestre ? ingreso : inicioSemestre;
      let mesesSem = (egreso.getFullYear() - desdeEfectivo.getFullYear()) * 12
                   + (egreso.getMonth() - desdeEfectivo.getMonth());
      if (egreso.getDate() >= desdeEfectivo.getDate()) mesesSem++;
      if (mesesSem < 0) mesesSem = 0;
      sacProp = (rem / 12) * mesesSem;
      const semNombre = mes <= 5 ? '1° semestre' : '2° semestre';
      sacPropBase = `(${fmt(rem)} / 12) × ${mesesSem} mes(es) — ${semNombre}`;
    }

    // ── VACACIONES PROPORCIONALES ART. 150 y 156 ────────────────────────────
    let diasVac = 14;
    if (anosCompletos >= 20)      diasVac = 35;
    else if (anosCompletos >= 10) diasVac = 28;
    else if (anosCompletos >= 5)  diasVac = 21;

    const inicioAnio = new Date(egreso.getFullYear(), 0, 1);
    const desdeVac   = ingreso > inicioAnio ? ingreso : inicioAnio;
    let mesesAnio = (egreso.getFullYear() - desdeVac.getFullYear()) * 12
                  + (egreso.getMonth() - desdeVac.getMonth());
    if (egreso.getDate() >= desdeVac.getDate()) mesesAnio++;
    if (mesesAnio < 0) mesesAnio = 0;
    if (mesesAnio > 12) mesesAnio = 12;

    const vacProp = (diasVac / 12) * mesesAnio * (rem / 25);
    const vacPropBase = `(${diasVac} días / 12) × ${mesesAnio} mes(es) × (${fmt(rem)} / 25)`;

    // ── ARMAR CONCEPTOS SEGÚN CAUSA ─────────────────────────────────────────
    const conceptos = [];

    if (ind245 > 0) {
      conceptos.push({
        label: ind245Label,
        monto: ind245,
        base:  ind245Base,
      });
    }

    if (preaviso !== 0 && preavisoLabel) {
      conceptos.push({
        label: preavisoLabel,
        monto: preaviso,
        base:  preavisoBase,
        esDescuento: preaviso < 0,
      });
    }

    if (aplicaIntegracion && integracion > 0) {
      conceptos.push({
        label: 'Integración mes de despido (Art. 233 LCT)',
        monto: integracion,
        base:  integracionBase,
      });
    }

    if (preavisoPositivo && sacPreaviso > 0) {
      conceptos.push({
        label: 'SAC sobre preaviso',
        monto: sacPreaviso,
        base:  sacPreavisoBase,
      });
    }

    if (!sacCobrado && sacProp > 0) {
      conceptos.push({
        label: 'SAC proporcional',
        monto: sacProp,
        base:  sacPropBase,
      });
    }

    if (vacProp > 0) {
      conceptos.push({
        label: `Vacaciones proporcionales (Art. 156 LCT) — ${diasVac} días/año`,
        monto: vacProp,
        base:  vacPropBase,
      });
    }

    const total = conceptos.reduce((acc, c) => acc + c.monto, 0);

    // ── RENDER ────────────────────────────────────────────────────────────────
    const causaTextos = {
      despido_sin_causa: 'Despido sin causa (Art. 245 LCT)',
      despido_indirecto: 'Despido indirecto (Art. 246 LCT)',
      renuncia: 'Renuncia',
      mutuo_acuerdo: 'Mutuo acuerdo (Art. 241 LCT)',
      vencimiento_plazo: 'Vencimiento de plazo fijo (Art. 95 LCT)',
      fuerza_mayor: 'Fuerza mayor / falta de trabajo (Art. 247 LCT)',
    };

    const antiguedadTexto = `${anosCompletos} año(s) y ${mesesFrac} mes(es)${mesesFrac > 3 ? ' → fracción computa como año adicional' : ''}`;

    let filas = '';
    for (const c of conceptos) {
      const montoStr = c.esDescuento
        ? `<span style="color:#e53935;">${fmt(c.monto)}</span>`
        : fmt(c.monto);
      filas += `
        <tr>
          <td>${c.label}</td>
          <td class="monto">${montoStr}</td>
          <td style="font-size:0.78rem;color:rgba(255,255,255,.45);">${c.base}</td>
        </tr>`;
    }

    const headerInfo = (nombre || caratula)
      ? `<div class="stats-row" style="margin-bottom:.8rem;">
           ${nombre   ? `<span class="stat-chip">${nombre}</span>`   : ''}
           ${caratula ? `<span class="stat-chip">${caratula}</span>` : ''}
         </div>`
      : '';

    resultDiv.innerHTML = `
      ${headerInfo}
      <div class="display-box" style="margin-bottom:1rem;">
        <strong>Causa:</strong> ${causaTextos[causa]}<br>
        <strong>Antigüedad:</strong> ${antiguedadTexto}<br>
        <strong>Período:</strong> ${ingreso.toLocaleDateString('es-AR')} → ${egreso.toLocaleDateString('es-AR')}
      </div>

      <table class="liq-tabla">
        <thead>
          <tr>
            <th>Concepto</th>
            <th style="text-align:right;">Monto</th>
            <th>Base de cálculo</th>
          </tr>
        </thead>
        <tbody>
          ${filas}
          <tr class="liq-total-row">
            <td>TOTAL LIQUIDACIÓN</td>
            <td class="monto">${fmt(total)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <div class="liq-total-grande">${fmt(total)}</div>

      <p class="liq-nota">* Valores calculados sobre la mejor remuneración mensual normal y habitual declarada. No incluye retenciones ni aportes. Verificar topes del art. 245 LCT si aplica convenio colectivo.</p>

      <div style="margin-top:1rem;">
        <button class="btn btn-ghost" id="liq-copiar">Copiar resumen</button>
      </div>
    `;
    resultDiv.style.display = 'block';

    container.querySelector('#liq-copiar').addEventListener('click', () => {
      let texto = `LIQUIDACIÓN LABORAL — LCT (Ley 20744)\n`;
      texto += `${'='.repeat(50)}\n`;
      if (nombre)   texto += `Trabajador: ${nombre}\n`;
      if (caratula) texto += `Carátula:   ${caratula}\n`;
      texto += `Causa:      ${causaTextos[causa]}\n`;
      texto += `Período:    ${ingreso.toLocaleDateString('es-AR')} → ${egreso.toLocaleDateString('es-AR')}\n`;
      texto += `Antigüedad: ${antiguedadTexto}\n`;
      texto += `${'─'.repeat(50)}\n`;
      for (const c of conceptos) {
        const signo = c.esDescuento ? '' : '';
        texto += `${c.label.padEnd(48)} ${fmt(c.monto)}\n`;
      }
      texto += `${'─'.repeat(50)}\n`;
      texto += `TOTAL:${' '.repeat(42)} ${fmt(total)}\n`;
      texto += `${'='.repeat(50)}\n`;
      navigator.clipboard.writeText(texto).then(() => {
        const btn = container.querySelector('#liq-copiar');
        btn.textContent = 'Copiado!';
        setTimeout(() => { btn.textContent = 'Copiar resumen'; }, 2000);
      });
    });
  }
}
