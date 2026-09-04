// liquidacion-integral.js — Calculadora de Liquidación Integral con Daños
// Panel Legal — Integra en una sola herramienta:
//   1) Liquidación Laboral LCT (idéntica lógica y fórmulas que tools/liquidacion.js)
//   2) Daños y Perjuicios por Registración Deficiente y Mora en el Pago (idéntica lógica
//      que tools/ley25323.js), tomando automáticamente como base los conceptos ya
//      calculados en el punto 1 (Ind. Art. 245, Preaviso, Integración, SAC s/Preaviso) —
//      sin necesidad de volver a tipearlos.
//   3) Daños y Perjuicios por Empleo No Registrado / Subregistro (idéntica lógica que
//      tools/ley24013.js), con fecha de inicio real y remuneración real pre-completadas
//      desde el punto 1 (editables por si el caso concreto las requiere distintas).
// Las tres herramientas originales se mantienen publicadas de forma independiente en el
// sitio; esta calculadora combinada es un atajo para el caso de uso más habitual (liquidar
// y, en el mismo acto, evaluar los daños conexos) y no las reemplaza.
import { exportarPDF, exportarCSV } from './exportar.js';

export function initLiquidacionIntegral(container) {
  container.innerHTML = `
    <div class="tool-card">
      <h2 style="margin-bottom:.4rem;color:var(--color-accent)">Calculadora Liquidación Integral con Daños</h2>
      <p class="tool-desc" style="margin-bottom:1.2rem">Liquidación Laboral (LCT) + Daños por Registración Deficiente/Mora (ex Ley 25.323) + Daños por Empleo No Registrado/Subregistro (ex Ley 24.013), en un solo cálculo.</p>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:0 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">1. Datos de la relación laboral</div>

      <div class="form-row">
        <div class="field-group">
          <label for="lid-nombre">Nombre del trabajador</label>
          <input type="text" id="lid-nombre" placeholder="Ej: Juan Pérez" autocomplete="off">
        </div>
        <div class="field-group">
          <label for="lid-empleador">Empleador / Demandada</label>
          <input type="text" id="lid-empleador" placeholder="Ej: Empresa SA" autocomplete="off">
        </div>
      </div>

      <div class="form-row">
        <div class="field-group">
          <label for="lid-ingreso">Fecha de ingreso</label>
          <input type="date" id="lid-ingreso">
          <span class="field-error" id="err-lid-ingreso"></span>
        </div>
        <div class="field-group">
          <label for="lid-egreso">Fecha de egreso</label>
          <input type="date" id="lid-egreso">
          <span class="field-error" id="err-lid-egreso"></span>
        </div>
      </div>

      <div class="form-row">
        <div class="field-group">
          <label for="lid-rem">Mejor remuneración mensual normal y habitual ($)</label>
          <input type="number" id="lid-rem" min="0" step="0.01" placeholder="Ej: 500000">
          <span class="field-error" id="err-lid-rem"></span>
        </div>
        <div class="field-group">
          <label for="lid-causa">Causa del egreso</label>
          <select id="lid-causa">
            <option value="despido_sin_causa">Despido sin causa (Art. 245)</option>
            <option value="despido_indirecto">Despido indirecto (Art. 246)</option>
            <option value="renuncia">Renuncia</option>
            <option value="mutuo_acuerdo">Mutuo acuerdo o abandono recíproco tácito (Art. 241)</option>
            <option value="vencimiento_plazo">Vencimiento de plazo fijo (Art. 95)</option>
            <option value="fuerza_mayor">Fuerza mayor / falta de trabajo (Art. 247 — 50%)</option>
          </select>
        </div>
      </div>

      <div class="form-row" style="flex-direction:column;gap:0.6rem;">
        <label style="display:flex;align-items:center;gap:0.6rem;cursor:pointer;font-weight:500;">
          <input type="checkbox" id="lid-preaviso-recibido">
          El trabajador ya recibió preaviso (no se calcula indemnización sustitutiva)
        </label>
        <label style="display:flex;align-items:center;gap:0.6rem;cursor:pointer;font-weight:500;">
          <input type="checkbox" id="lid-sac-cobrado">
          Ya cobró el SAC del semestre en curso (no se incluye SAC proporcional)
        </label>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:1.6rem 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">2. Daño por registración deficiente y mora en el pago <span style="font-weight:400;text-transform:none;opacity:.75">(ex Ley 25.323)</span></div>

      <div style="padding:.8rem 1rem;background:rgba(255,200,50,.08);border-left:3px solid rgba(255,200,50,.45);border-radius:4px;font-size:.82rem;line-height:1.7;color:rgba(255,255,255,.75);margin-bottom:1rem;">
        <strong style="color:rgba(255,200,50,.95);">Encuadre normativo:</strong> el art. 55 del DNU 70/2023 (B.O. 21/12/2023) derogó la Ley 25.323 en su totalidad (arts. 1 y 2), derogación ratificada por la Ley 27.742 "Bases" (B.O. 8/7/2024, vigencia 9/7/2024, arts. 99-100). Existe ya aplicación judicial: STJ Corrientes, "Guastavino, Elisa G. c/ Corsal S.A. s/ despido", sent. 45 del 14/4/2026. Por definición del Estudio, estos rubros se reclaman como <strong>daño y perjuicio de derecho común</strong> (arts. 1716, 1717, 1738 y 1740 CCyC), utilizando las fórmulas de la ley derogada como pauta objetiva del quantum. Las bases de cálculo (Ind. 245, Preaviso, Integración, SAC s/Preaviso) se toman automáticamente del punto 1.<br><br>
        <strong style="color:rgba(255,200,50,.95);">Advertencia — cláusula de exclusividad art. 245 LCT:</strong> el art. 245 LCT (texto según art. 51, Ley 27.802) dispone que la indemnización por despido es "la única reparación procedente... incluidos los de naturaleza civil". Entendemos que no alcanza a estos rubros por tratarse de incumplimientos autónomos, pero es una cláusula sin desarrollo jurisprudencial propio: evaluar el riesgo interpretativo en cada caso.
      </div>

      <div style="display:flex;flex-direction:column;gap:.7rem;margin-bottom:.4rem;">
        <label style="display:flex;align-items:flex-start;gap:.6rem;cursor:pointer;padding:.7rem .9rem;background:rgba(201,168,76,.07);border-radius:8px;border:1px solid rgba(201,168,76,.18);">
          <input type="checkbox" id="lid-l25-art1" style="margin-top:3px;flex-shrink:0;">
          <span>
            <strong style="color:var(--color-accent);">Daño por falta o deficiente registración</strong><br>
            <span style="font-size:.82rem;color:rgba(255,255,255,.55);">Quantum ex art. 1, Ley 25.323 (derogado): Indemnización Art. 245 <strong>duplicada</strong> (+100%)</span>
          </span>
        </label>
        <label style="display:flex;align-items:flex-start;gap:.6rem;cursor:pointer;padding:.7rem .9rem;background:rgba(201,168,76,.07);border-radius:8px;border:1px solid rgba(201,168,76,.18);">
          <input type="checkbox" id="lid-l25-art2" style="margin-top:3px;flex-shrink:0;">
          <span>
            <strong style="color:var(--color-accent);">Daño por mora en el pago</strong> — requiere intimación fehaciente previa<br>
            <span style="font-size:.82rem;color:rgba(255,255,255,.55);">Quantum ex art. 2, Ley 25.323 (derogado): +50% sobre (Ind. 245 + Preaviso + Integración + SAC s/Preaviso)</span>
          </span>
        </label>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:1.6rem 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">3. Daño por empleo no registrado / subregistro <span style="font-weight:400;text-transform:none;opacity:.75">(ex arts. 8, 9 y 10, Ley 24.013)</span></div>

      <div style="padding:.8rem 1rem;background:rgba(255,200,50,.08);border-left:3px solid rgba(255,200,50,.45);border-radius:4px;font-size:.82rem;line-height:1.7;color:rgba(255,255,255,.75);margin-bottom:1rem;">
        <strong style="color:rgba(255,200,50,.95);">Encuadre normativo:</strong> los arts. 8, 9, 10 y 15 de la Ley 24.013 fueron derogados por los arts. 99-100 de la Ley 27.742 "Bases" (vigencia 9/7/2024) — el mismo paquete que derogó la Ley 25.323. Se reclaman como <strong>daño y perjuicio de derecho común</strong> (arts. 1716, 1717, 1738 y 1740 CCyC), usando el 25% de las remuneraciones devengadas (fórmula de los ex arts. 8, 9 y 10) como pauta objetiva.<br><br>
        <strong style="color:rgba(255,200,50,.95);">Requisitos formales:</strong> intimación fehaciente previa al empleador y a la ARCA (ex AFIP, art. 47 dec. 1043/2001, art. 52 LCT). El daño no procede si el empleador regularizó dentro de los 30 días de la intimación.
      </div>

      <div class="form-row">
        <div class="field-group">
          <label for="lid-l24-inicio-real">Fecha de inicio real de la relación (si difiere de la de ingreso del punto 1)</label>
          <input type="date" id="lid-l24-inicio-real" placeholder="Por defecto, la fecha de ingreso del punto 1">
        </div>
        <div class="field-group">
          <label for="lid-l24-telegrama">Fecha de envío de telegrama / intimación</label>
          <input type="date" id="lid-l24-telegrama">
          <span class="field-error" id="err-lid-l24-telegrama"></span>
        </div>
      </div>
      <div class="form-row">
        <div class="field-group">
          <label for="lid-l24-rem-real">Remuneración mensual real ($) (si difiere de la del punto 1)</label>
          <input type="number" id="lid-l24-rem-real" min="0" step="0.01" placeholder="Por defecto, la remuneración del punto 1">
        </div>
      </div>

      <div class="form-row" style="flex-direction:column;gap:.5rem;margin-top:.4rem;">
        <label style="display:flex;align-items:flex-start;gap:.6rem;cursor:pointer;">
          <input type="checkbox" id="lid-l24-art8" style="margin-top:2px;">
          <span><strong>Falta de registración</strong> — Relación laboral no registrada <span style="font-size:.82rem;color:rgba(255,255,255,.55);">(quantum ex art. 8, Ley 24.013: 25% de remuneraciones devengadas durante el período no registrado)</span></span>
        </label>

        <label style="display:flex;align-items:flex-start;gap:.6rem;cursor:pointer;">
          <input type="checkbox" id="lid-l24-art9" style="margin-top:2px;">
          <span><strong>Subregistro de fecha de ingreso</strong> — fecha consignada posterior a la real <span style="font-size:.82rem;color:rgba(255,255,255,.55);">(quantum ex art. 9, Ley 24.013)</span></span>
        </label>
        <div id="lid-l24-art9-campos" style="display:none;padding:.5rem .8rem;background:rgba(255,255,255,.04);border-radius:6px;margin-left:1.6rem;">
          <div class="field-group">
            <label for="lid-l24-art9-meses">Meses de diferencia entre fecha real y fecha registrada</label>
            <input type="number" id="lid-l24-art9-meses" min="0" step="1" placeholder="Ej: 6">
            <span class="field-error" id="err-lid-l24-art9-meses"></span>
          </div>
        </div>

        <label style="display:flex;align-items:flex-start;gap:.6rem;cursor:pointer;">
          <input type="checkbox" id="lid-l24-art10" style="margin-top:2px;">
          <span><strong>Subregistro de remuneración</strong> — remuneración consignada inferior a la real <span style="font-size:.82rem;color:rgba(255,255,255,.55);">(quantum ex art. 10, Ley 24.013)</span></span>
        </label>
        <div id="lid-l24-art10-campos" style="display:none;padding:.5rem .8rem;background:rgba(255,255,255,.04);border-radius:6px;margin-left:1.6rem;">
          <div class="field-group">
            <label for="lid-l24-rem-consignada">Remuneración consignada (la del recibo, menor) ($)</label>
            <input type="number" id="lid-l24-rem-consignada" min="0" step="0.01" placeholder="Ej: 300000">
            <span class="field-error" id="err-lid-l24-rem-consignada"></span>
          </div>
        </div>

        <label style="display:flex;align-items:flex-start;gap:.6rem;cursor:pointer;">
          <input type="checkbox" id="lid-l24-art11" style="margin-top:2px;">
          <span><strong>Obstaculización de la inspección laboral</strong> — duplica los montos de este punto 3 <span style="font-size:.82rem;color:rgba(255,255,255,.55);">(criterio ex art. 11, Ley 24.013)</span></span>
        </label>

        <label style="display:flex;align-items:flex-start;gap:.6rem;cursor:pointer;">
          <input type="checkbox" id="lid-l24-regularizo" style="margin-top:2px;">
          <span style="color:rgba(255,200,100,.9);"><strong>El empleador regularizó dentro de los 30 días</strong> de la intimación fehaciente (el daño de este punto 3 no procede)</span>
        </label>
      </div>

      <div style="margin-top:1.4rem;">
        <button class="btn btn-primary" id="lid-calcular">Calcular liquidación integral</button>
      </div>

      <div id="lid-resultado" style="margin-top:1.6rem;display:none;"></div>
    </div>
  `;

  if (!document.getElementById('lid-extra-styles')) {
    const st = document.createElement('style');
    st.id = 'lid-extra-styles';
    st.textContent = `
      .field-error { color: #e53935; font-size: 0.78rem; display:block; min-height:1rem; margin-top:2px; }
      input.error, select.error { border-color: #e53935 !important; box-shadow: 0 0 0 2px rgba(229,57,53,.18); }
      .lid-tabla { width:100%; border-collapse:collapse; margin-top:1rem; }
      .lid-tabla th { text-align:left; padding:0.5rem 0.7rem; background:var(--color-card,#1e2130); color:var(--color-accent,#c9a84c); font-size:0.82rem; text-transform:uppercase; letter-spacing:.04em; border-bottom:2px solid var(--color-accent,#c9a84c); }
      .lid-tabla td { padding:0.5rem 0.7rem; border-bottom:1px solid rgba(255,255,255,.07); font-size:0.95rem; }
      .lid-tabla tr:last-child td { border-bottom:none; }
      .lid-tabla .monto { text-align:right; font-variant-numeric:tabular-nums; }
      .lid-tabla .seccion-row td { font-weight:700;background:rgba(201,168,76,.13);color:var(--color-accent,#c9a84c);font-size:.82rem;text-transform:uppercase;letter-spacing:.05em;padding:.5rem .7rem; }
      .lid-tabla .subtotal-row td { font-weight:700; background:rgba(201,168,76,.10); color:var(--color-accent,#c9a84c); }
      .lid-tabla .total-row td { font-weight:800; background:rgba(201,168,76,.18); color:var(--color-accent,#c9a84c); font-size:1.08rem; border-top:2px solid var(--color-accent,#c9a84c); }
      .lid-total-grande { font-size:1.7rem; font-weight:800; color:var(--color-accent,#c9a84c); margin-top:1rem; text-align:right; }
      .lid-nota { font-size:0.8rem; color:rgba(255,255,255,.45); margin-top:.6rem; font-style:italic; }
      .lid-aviso-noprocede { background:rgba(229,57,53,.12);border-left:3px solid #e53935;padding:.7rem 1rem;border-radius:4px;color:#e57373;font-weight:600;font-size:.85rem;margin-top:.6rem; }
    `;
    document.head.appendChild(st);
  }

  const causaObjetos = {
    despido_sin_causa:  'Cobro de Haberes e Indemnizaciones por Despido',
    despido_indirecto:  'Cobro de Haberes e Indemnizaciones por Despido Indirecto',
    renuncia:           'Cobro de Haberes y Liquidación Final',
    mutuo_acuerdo:      'Cobro de Haberes — Extinción por Mutuo Acuerdo (Art. 241 LCT)',
    vencimiento_plazo:  'Cobro de Haberes — Vencimiento de Plazo Fijo (Art. 95 LCT)',
    fuerza_mayor:       'Cobro de Haberes — Fuerza Mayor / Falta de Trabajo (Art. 247 LCT)',
  };

  container.querySelector('#lid-l24-art9').addEventListener('change', function () {
    container.querySelector('#lid-l24-art9-campos').style.display = this.checked ? 'block' : 'none';
  });
  container.querySelector('#lid-l24-art10').addEventListener('change', function () {
    container.querySelector('#lid-l24-art10-campos').style.display = this.checked ? 'block' : 'none';
  });

  container.querySelector('#lid-calcular').addEventListener('click', calcular);

  function fmt(n) {
    return '$ ' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function clearErrors() {
    container.querySelectorAll('.field-error').forEach(e => e.textContent = '');
    container.querySelectorAll('input.error, select.error').forEach(e => e.classList.remove('error'));
  }

  function setError(fieldId, errId, msg) {
    const field = container.querySelector('#' + fieldId);
    const err   = container.querySelector('#' + errId);
    if (field) field.classList.add('error');
    if (err)   err.textContent = msg;
  }

  function calcular() {
    clearErrors();
    const resultDiv = container.querySelector('#lid-resultado');
    resultDiv.style.display = 'none';
    resultDiv.innerHTML = '';

    // ── 1. Datos básicos (idéntico a liquidacion.js) ────────────────────────
    const nombre    = container.querySelector('#lid-nombre').value.trim();
    const empleador = container.querySelector('#lid-empleador').value.trim();
    const ingresoStr = container.querySelector('#lid-ingreso').value;
    const egresoStr  = container.querySelector('#lid-egreso').value;
    const remStr     = container.querySelector('#lid-rem').value;
    const causa      = container.querySelector('#lid-causa').value;
    const praAvRecibido = container.querySelector('#lid-preaviso-recibido').checked;
    const sacCobrado    = container.querySelector('#lid-sac-cobrado').checked;

    let valid = true;

    if (!ingresoStr) { setError('lid-ingreso', 'err-lid-ingreso', 'Ingresá la fecha de ingreso.'); valid = false; }
    if (!egresoStr)  { setError('lid-egreso',  'err-lid-egreso',  'Ingresá la fecha de egreso.');  valid = false; }
    if (ingresoStr && egresoStr) {
      const fi = new Date(ingresoStr + 'T00:00:00');
      const fe = new Date(egresoStr  + 'T00:00:00');
      if (isNaN(fi.getTime())) { setError('lid-ingreso', 'err-lid-ingreso', 'Fecha inválida.'); valid = false; }
      if (isNaN(fe.getTime())) { setError('lid-egreso',  'err-lid-egreso',  'Fecha inválida.');  valid = false; }
      if (!isNaN(fi.getTime()) && !isNaN(fe.getTime()) && fi >= fe) {
        setError('lid-egreso', 'err-lid-egreso', 'La fecha de egreso debe ser posterior al ingreso.');
        valid = false;
      }
    }
    const rem = parseFloat(remStr);
    if (!remStr || isNaN(rem) || rem <= 0) {
      setError('lid-rem', 'err-lid-rem', 'Ingresá una remuneración válida mayor a 0.');
      valid = false;
    }

    // ── 2. Ley 25.323 — sin inputs propios (se derivan del punto 1) ─────────
    const l25art1 = container.querySelector('#lid-l25-art1').checked;
    const l25art2 = container.querySelector('#lid-l25-art2').checked;

    // ── 3. Ley 24.013 — inputs propios, con fallback al punto 1 ─────────────
    const l24InicioRealStr = container.querySelector('#lid-l24-inicio-real').value || ingresoStr;
    const l24TelegramaStr  = container.querySelector('#lid-l24-telegrama').value;
    const l24RemRealStr    = container.querySelector('#lid-l24-rem-real').value || remStr;
    const l24art8      = container.querySelector('#lid-l24-art8').checked;
    const l24art9      = container.querySelector('#lid-l24-art9').checked;
    const l24art10     = container.querySelector('#lid-l24-art10').checked;
    const l24art11     = container.querySelector('#lid-l24-art11').checked;
    const l24Regularizo = container.querySelector('#lid-l24-regularizo').checked;

    const l24BlockRequested = (l24art8 || l24art9 || l24art10) && !l24Regularizo;

    let mesesArt9 = 0, remConsignada = 0, l24RemReal = 0;

    if (l24BlockRequested) {
      if (!l24TelegramaStr) {
        setError('lid-l24-telegrama', 'err-lid-l24-telegrama', 'Ingresá la fecha del telegrama/intimación.');
        valid = false;
      } else if (l24InicioRealStr) {
        const fi = new Date(l24InicioRealStr + 'T00:00:00');
        const ft = new Date(l24TelegramaStr  + 'T00:00:00');
        if (isNaN(ft.getTime())) {
          setError('lid-l24-telegrama', 'err-lid-l24-telegrama', 'Fecha inválida.');
          valid = false;
        } else if (!isNaN(fi.getTime()) && fi >= ft) {
          setError('lid-l24-telegrama', 'err-lid-l24-telegrama', 'Debe ser posterior a la fecha de inicio real.');
          valid = false;
        }
      }

      l24RemReal = parseFloat(l24RemRealStr);
      if (!l24RemRealStr || isNaN(l24RemReal) || l24RemReal <= 0) {
        setError('lid-l24-telegrama', 'err-lid-l24-telegrama', 'Falta la remuneración real (punto 1 o campo propio de este bloque).');
        valid = false;
      }

      if (l24art9) {
        const v = parseFloat(container.querySelector('#lid-l24-art9-meses').value);
        if (isNaN(v) || v <= 0) {
          setError('lid-l24-art9-meses', 'err-lid-l24-art9-meses', 'Ingresá los meses de diferencia.');
          valid = false;
        } else {
          mesesArt9 = v;
        }
      }

      if (l24art10) {
        const v = parseFloat(container.querySelector('#lid-l24-rem-consignada').value);
        if (isNaN(v) || v <= 0) {
          setError('lid-l24-rem-consignada', 'err-lid-l24-rem-consignada', 'Ingresá la remuneración consignada.');
          valid = false;
        } else if (!isNaN(l24RemReal) && v >= l24RemReal) {
          setError('lid-l24-rem-consignada', 'err-lid-l24-rem-consignada', 'Debe ser menor a la remuneración real.');
          valid = false;
        } else {
          remConsignada = v;
        }
      }
    }

    if (!valid) return;

    const ingreso = new Date(ingresoStr + 'T00:00:00');
    const egreso  = new Date(egresoStr  + 'T00:00:00');

    // ══════════════════════════════════════════════════════════════════════
    // PUNTO 1 — LIQUIDACIÓN (fórmulas idénticas a liquidacion.js)
    // ══════════════════════════════════════════════════════════════════════

    // ── ANTIGÜEDAD ──────────────────────────────────────────────────────────
    let anosCompletos = egreso.getFullYear() - ingreso.getFullYear();
    let mesAjuste     = egreso.getMonth() - ingreso.getMonth();
    let diaAjuste     = egreso.getDate()  - ingreso.getDate();
    if (diaAjuste < 0) mesAjuste--;
    if (mesAjuste < 0) { anosCompletos--; mesAjuste += 12; }

    const egresoAnio  = egreso.getFullYear();
    const aniversario = new Date(egresoAnio - anosCompletos, ingreso.getMonth(), ingreso.getDate());
    let mesesFrac = (egreso.getFullYear() - aniversario.getFullYear()) * 12
                  + (egreso.getMonth()    - aniversario.getMonth());
    if (egreso.getDate() < aniversario.getDate()) mesesFrac--;
    if (mesesFrac < 0) mesesFrac = 0;

    const anosConFraccion = anosCompletos + (mesesFrac > 3 ? 1 : 0);
    const anosParaCalculo = Math.max(anosConFraccion, 1);

    // ── INDEMNIZACIÓN ART. 245 ───────────────────────────────────────────────
    let ind245 = 0, ind245Label = '', ind245Base = '', ind245Fundamento = '';
    if (causa === 'despido_sin_causa' || causa === 'despido_indirecto') {
      const formula = rem * anosParaCalculo;
      const minimo  = rem * 1;
      ind245 = Math.max(formula, minimo);
      const art = causa === 'despido_sin_causa' ? 'Art. 245 LCT' : 'Art. 246 / 245 LCT';
      ind245Label = `Indemnización por antigüedad (${art})`;
      ind245Base  = `${fmt(rem)} × ${anosParaCalculo} año(s)${formula < minimo ? ' [mínimo 1 remuneración aplicado]' : ''}`;
      ind245Fundamento = causa === 'despido_sin_causa'
        ? 'Procede en virtud de la extinción del contrato de trabajo por decisión unilateral del empleador sin invocación de justa causa (art. 245 LCT), que reconoce al trabajador el derecho a una indemnización equivalente a un (1) mes de sueldo por cada año de servicio o fracción mayor de tres (3) meses, calculada sobre la mejor remuneración mensual, normal y habitual, con un piso mínimo de un (1) mes de sueldo y sujeta al piso del 67% fijado por la doctrina "Vizzoti" (hoy codificado expresamente en el art. 245 LCT, texto según art. 51, Ley 27.802).'
        : 'Procede en virtud de haberse considerado el/la trabajador/a despedido/a por exclusiva culpa del empleador (art. 246 LCT), lo que genera el derecho a las mismas indemnizaciones derivadas del despido sin justa causa (art. 245 LCT), con igual metodología de cálculo y piso mínimo.';
    } else if (causa === 'fuerza_mayor') {
      const formula = rem * anosParaCalculo;
      const minimo  = rem * 1;
      const base245 = Math.max(formula, minimo);
      ind245 = base245 * 0.5;
      ind245Label = 'Indemnización fuerza mayor / falta de trabajo (Art. 247 LCT — 50%)';
      ind245Base  = `50% de ${fmt(base245)} (${fmt(rem)} × ${anosParaCalculo} año(s))`;
      ind245Fundamento = 'Procede la indemnización reducida (50% de la del art. 245 LCT) prevista en el art. 247 LCT para los casos de extinción por fuerza mayor o falta o disminución de trabajo no imputable al empleador, circunstancia cuya acreditación fehaciente queda a cargo de este último.';
    } else if (causa === 'vencimiento_plazo') {
      const formula = rem * anosParaCalculo;
      const minimo  = rem * 1;
      ind245 = Math.max(formula, minimo) * 0.5;
      ind245Label = 'Indemnización plazo fijo (Art. 95 LCT — 50% del art. 245)';
      ind245Base  = `50% de ${fmt(Math.max(rem * anosParaCalculo, rem * 1))}`;
      ind245Fundamento = 'Procede la indemnización reducida (50% de la del art. 245 LCT) prevista en el art. 95 LCT para la extinción de un contrato a plazo fijo por su vencimiento, en tanto el contrato hubiera tenido una duración superior a un (1) año y se hubiera cursado el preaviso previsto en el art. 94 LCT.';
    }

    // ── PREAVISO ART. 232 ────────────────────────────────────────────────────
    let preaviso = 0, preavisoLabel = '', preavisoBase = '', preavisoFundamento = '';
    const esRenuncia = causa === 'renuncia';

    if (!praAvRecibido) {
      const mesesTotales = anosCompletos * 12 + mesesFrac;
      const aplicaPreaviso = causa !== 'mutuo_acuerdo' && causa !== 'renuncia';
      if (esRenuncia) {
        preaviso      = -(rem / 30) * 15;
        preavisoLabel = 'Preaviso omitido por renuncia (Art. 231 LCT — 15 días, a descontar)';
        preavisoBase  = `(${fmt(rem)} / 30) × 15 días`;
        preavisoFundamento = 'Corresponde deducir el importe equivalente a los quince (15) días de preaviso que el/la trabajador/a debió otorgar al renunciar y no otorgó, conforme el art. 231 LCT.';
      } else if (aplicaPreaviso) {
        if (mesesTotales < 3) {
          preaviso      = (rem / 30) * 15;
          preavisoBase  = `(${fmt(rem)} / 30) × 15 días (antigüedad < 3 meses)`;
        } else if (anosCompletos < 5) {
          preaviso      = rem;
          preavisoBase  = `1 mes (${fmt(rem)}) — antigüedad 3 meses a 5 años`;
        } else {
          preaviso      = rem * 2;
          preavisoBase  = `2 meses (${fmt(rem * 2)}) — antigüedad > 5 años`;
        }
        preavisoLabel = `Indemnización sustitutiva de preaviso (Art. 232 LCT)`;
        preavisoFundamento = 'Procede en virtud de la falta de otorgamiento del preaviso previsto en los arts. 231 y 232 LCT, que impone a quien decide unilateralmente la extinción del contrato sin justa causa el deber de preavisar a la otra parte con la antelación legal; su omisión genera el derecho a una indemnización sustitutiva equivalente a los salarios correspondientes al plazo omitido.';
      }
    }

    // ── INTEGRACIÓN MES DE DESPIDO ART. 233 ─────────────────────────────────
    let integracion = 0, integracionBase = '';
    const aplicaIntegracion = !praAvRecibido
      && (causa === 'despido_sin_causa' || causa === 'despido_indirecto');

    if (aplicaIntegracion) {
      const ultimoDiaMes = new Date(egreso.getFullYear(), egreso.getMonth() + 1, 0).getDate();
      const diasRestantes = ultimoDiaMes - egreso.getDate();
      if (diasRestantes > 0) {
        integracion     = (rem / 30) * diasRestantes;
        integracionBase = `(${fmt(rem)} / 30) × ${diasRestantes} días restantes del mes`;
      }
    }

    // ── SAC SOBRE PREAVISO ───────────────────────────────────────────────────
    let sacPreaviso = 0, sacPreavisoBase = '';
    const preavisoPositivo = preaviso > 0;
    if (preavisoPositivo) {
      sacPreaviso     = preaviso / 12;
      sacPreavisoBase = `${fmt(preaviso)} / 12`;
    }

    // ── SAC PROPORCIONAL ─────────────────────────────────────────────────────
    let sacProp = 0, sacPropBase = '';
    if (!sacCobrado) {
      const mes = egreso.getMonth();
      const inicioSemestre = mes <= 5
        ? new Date(egreso.getFullYear(), 0, 1)
        : new Date(egreso.getFullYear(), 6, 1);
      const desdeEfectivo = ingreso > inicioSemestre ? ingreso : inicioSemestre;
      let mesesSem = (egreso.getFullYear() - desdeEfectivo.getFullYear()) * 12
                   + (egreso.getMonth() - desdeEfectivo.getMonth());
      if (egreso.getDate() >= desdeEfectivo.getDate()) mesesSem++;
      if (mesesSem < 0) mesesSem = 0;
      sacProp     = (rem / 12) * mesesSem;
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

    const vacProp     = (diasVac / 12) * mesesAnio * (rem / 25);
    const vacPropBase = `(${diasVac} días / 12) × ${mesesAnio} mes(es) × (${fmt(rem)} / 25)`;

    const conceptosLiq = [];
    if (ind245 > 0) conceptosLiq.push({ label: ind245Label, monto: ind245, base: ind245Base, fundamento: ind245Fundamento });
    if (preaviso !== 0 && preavisoLabel) conceptosLiq.push({ label: preavisoLabel, monto: preaviso, base: preavisoBase, esDescuento: preaviso < 0, fundamento: preavisoFundamento });
    if (aplicaIntegracion && integracion > 0) conceptosLiq.push({ label: 'Integración mes de despido (Art. 233 LCT)', monto: integracion, base: integracionBase, fundamento: 'Procede conforme el art. 233 LCT, que impone al empleador, cuando la extinción se produce sin otorgamiento de preaviso, abonar además una indemnización equivalente a los salarios correspondientes a los días faltantes hasta el último día del mes en que se produjo la extinción.' });
    if (preavisoPositivo && sacPreaviso > 0)  conceptosLiq.push({ label: 'SAC sobre preaviso', monto: sacPreaviso, base: sacPreavisoBase, fundamento: 'Procede en virtud del carácter remuneratorio del preaviso indemnizado (art. 232 LCT), que conforme doctrina y jurisprudencia mayoritaria incide en el cálculo del sueldo anual complementario (arts. 121 y ccdtes. LCT).' });
    if (!sacCobrado && sacProp > 0)           conceptosLiq.push({ label: 'SAC proporcional', monto: sacProp, base: sacPropBase, fundamento: 'Procede conforme el art. 123 LCT, que reconoce el derecho a percibir la parte proporcional del sueldo anual complementario correspondiente al semestre en que se produjo la extinción, calculada sobre el tiempo efectivamente trabajado en dicho semestre.' });
    if (vacProp > 0) conceptosLiq.push({ label: `Vacaciones proporcionales (Art. 156 LCT) — ${diasVac} días/año`, monto: vacProp, base: vacPropBase, fundamento: 'Procede conforme el art. 156 LCT, que reconoce al trabajador cuya relación se extingue sin haber gozado de las vacaciones que le correspondían el derecho a una indemnización sustitutiva, calculada en proporción al tiempo trabajado en el año, sobre la base de los días de descanso previstos según su antigüedad (art. 150 LCT).' });

    const totalLiq = conceptosLiq.reduce((acc, c) => acc + c.monto, 0);

    // ══════════════════════════════════════════════════════════════════════
    // PUNTO 2 — DAÑOS EX LEY 25.323 (bases derivadas automáticamente del pto. 1)
    // ══════════════════════════════════════════════════════════════════════
    const baseDanio25 = ind245 + Math.max(preaviso, 0) + integracion + sacPreaviso;
    const recargo1 = l25art1 ? ind245 * 1.00 : 0;
    const recargo2 = l25art2 ? baseDanio25 * 0.50 : 0;
    const total25323 = recargo1 + recargo2;

    // ══════════════════════════════════════════════════════════════════════
    // PUNTO 3 — DAÑOS EX LEY 24.013
    // ══════════════════════════════════════════════════════════════════════
    let multa8 = 0, multa8Base = '', multa9 = 0, multa9Base = '', multa10 = 0, multa10Base = '';
    let mesesNRDisplay = 0, inicioRealDate = null, telegramaDate = null;
    let total24013 = 0;

    if (l24BlockRequested) {
      inicioRealDate = new Date(l24InicioRealStr + 'T00:00:00');
      telegramaDate  = new Date(l24TelegramaStr  + 'T00:00:00');

      let mesesNR = (telegramaDate.getFullYear() - inicioRealDate.getFullYear()) * 12
                  + (telegramaDate.getMonth() - inicioRealDate.getMonth());
      if (telegramaDate.getDate() < inicioRealDate.getDate()) mesesNR--;
      if (mesesNR < 0) mesesNR = 0;
      mesesNRDisplay = mesesNR === 0 ? 1 : mesesNR;

      const mult = l24art11 ? 2 : 1;

      if (l24art8) {
        multa8     = l24RemReal * mesesNRDisplay * 0.25 * mult;
        multa8Base = `${fmt(l24RemReal)} × ${mesesNRDisplay} mes(es) × 25%${l24art11 ? ' × 2' : ''}`;
      }
      if (l24art9) {
        multa9     = l24RemReal * mesesArt9 * 0.25 * mult;
        multa9Base = `${fmt(l24RemReal)} × ${mesesArt9} mes(es) de diferencia × 25%${l24art11 ? ' × 2' : ''}`;
      }
      if (l24art10) {
        const difRem = l24RemReal - remConsignada;
        multa10     = difRem * mesesNRDisplay * 0.25 * mult;
        multa10Base = `(${fmt(l24RemReal)} − ${fmt(remConsignada)}) × ${mesesNRDisplay} mes(es) × 25%${l24art11 ? ' × 2' : ''}`;
      }
      total24013 = multa8 + multa9 + multa10;
    }

    const granTotal = totalLiq + total25323 + total24013;

    // ── RENDER ────────────────────────────────────────────────────────────────
    const causaTextos = {
      despido_sin_causa: 'Despido sin causa (Art. 245 LCT)',
      despido_indirecto: 'Despido indirecto (Art. 246 LCT)',
      renuncia: 'Renuncia',
      mutuo_acuerdo: 'Mutuo acuerdo (Art. 241 LCT)',
      vencimiento_plazo: 'Vencimiento de plazo fijo (Art. 95 LCT)',
      fuerza_mayor: 'Fuerza mayor / falta de trabajo (Art. 247 LCT)',
    };

    const hayDanios = l25art1 || l25art2 || l24BlockRequested;
    const autoCaratula = nombre && empleador
      ? `${nombre} c/ ${empleador} s/ ${causaObjetos[causa]}${hayDanios ? ' y Daños y Perjuicios' : ''}`
      : (nombre ? `${nombre} s/ ${causaObjetos[causa]}${hayDanios ? ' y Daños y Perjuicios' : ''}` : '');

    const antiguedadTexto = `${anosCompletos} año(s) y ${mesesFrac} mes(es)${mesesFrac > 3 ? ' → fracción computa como año adicional' : ''}`;

    let filasLiq = '';
    for (const c of conceptosLiq) {
      const montoStr = c.esDescuento ? `<span style="color:#e53935;">${fmt(c.monto)}</span>` : fmt(c.monto);
      filasLiq += `<tr><td>${c.label}</td><td class="monto">${montoStr}</td><td style="font-size:0.78rem;color:rgba(255,255,255,.45);">${c.base}</td></tr>`;
    }
    filasLiq += `<tr class="subtotal-row"><td>Subtotal liquidación</td><td class="monto">${fmt(totalLiq)}</td><td></td></tr>`;

    let filas25323 = '';
    if (l25art1 || l25art2) {
      if (l25art1) filas25323 += `<tr><td>Daño por falta/deficiente registración (ex art. 1 Ley 25.323 — Ind. 245 duplicada)</td><td class="monto">+ ${fmt(recargo1)}</td><td style="font-size:.78rem;color:rgba(255,255,255,.45);">${fmt(ind245)} × 100%</td></tr>`;
      if (l25art2) filas25323 += `<tr><td>Daño por mora en el pago (ex art. 2 Ley 25.323)</td><td class="monto">+ ${fmt(recargo2)}</td><td style="font-size:.78rem;color:rgba(255,255,255,.45);">${fmt(baseDanio25)} × 50%</td></tr>`;
      filas25323 += `<tr class="subtotal-row"><td>Subtotal daños ex Ley 25.323</td><td class="monto">${fmt(total25323)}</td><td></td></tr>`;
    }

    let filas24013 = '';
    let noProcede24013 = '';
    if (l24art8 || l24art9 || l24art10) {
      if (l24Regularizo) {
        noProcede24013 = `<div class="lid-aviso-noprocede">El empleador regularizó dentro de los 30 días de la intimación fehaciente: el daño ex Ley 24.013 no procede.</div>`;
      } else {
        if (l24art8)  filas24013 += `<tr><td>Daño por falta de registración (ex art. 8, Ley 24.013)${l24art11 ? ' (×2 obstaculización)' : ''}</td><td class="monto">+ ${fmt(multa8)}</td><td style="font-size:.78rem;color:rgba(255,255,255,.45);">${multa8Base}</td></tr>`;
        if (l24art9)  filas24013 += `<tr><td>Daño por subregistro de fecha de ingreso (ex art. 9, Ley 24.013)${l24art11 ? ' (×2 obstaculización)' : ''}</td><td class="monto">+ ${fmt(multa9)}</td><td style="font-size:.78rem;color:rgba(255,255,255,.45);">${multa9Base}</td></tr>`;
        if (l24art10) filas24013 += `<tr><td>Daño por subregistro de remuneración (ex art. 10, Ley 24.013)${l24art11 ? ' (×2 obstaculización)' : ''}</td><td class="monto">+ ${fmt(multa10)}</td><td style="font-size:.78rem;color:rgba(255,255,255,.45);">${multa10Base}</td></tr>`;
        filas24013 += `<tr class="subtotal-row"><td>Subtotal daños ex Ley 24.013${l24art11 ? ' (período no registrado ' + mesesNRDisplay + ' mes(es))' : ''}</td><td class="monto">${fmt(total24013)}</td><td></td></tr>`;
      }
    }

    const headerInfo = (nombre || empleador)
      ? `<div class="stats-row" style="margin-bottom:.8rem;">
           ${nombre   ? `<span class="stat-chip">${nombre}</span>`   : ''}
           ${empleador ? `<span class="stat-chip">${empleador}</span>` : ''}
         </div>`
      : '';

    const fundamentosTexto = [
      ...conceptosLiq.filter(c => c.fundamento).map(c => `${c.label}:\n${c.fundamento}`),
      (l25art1 || l25art2) ? `Daños y perjuicios (ex Ley 25.323):\nSe fundan como daño y perjuicio de derecho común (arts. 1716, 1717, 1738 y 1740 CCyC), en tanto la Ley 25.323 fue derogada por el art. 55 del DNU 70/2023, ratificado por la Ley 27.742 (vigencia 9/7/2024). Existe ya aplicación judicial en tal sentido: STJ Corrientes, "Guastavino, Elisa G. c/ Corsal S.A. s/ despido", sent. 45 del 14/4/2026. Se toman las fórmulas de los ex arts. 1 y 2 de dicha ley como pauta objetiva de cuantificación del daño. Evaluar el riesgo interpretativo de la cláusula de exclusividad del art. 245 LCT (texto según art. 51, Ley 27.802) en el caso concreto.` : '',
      (l24art8 || l24art9 || l24art10) && !l24Regularizo ? `Daños y perjuicios (ex Ley 24.013):\nSe fundan como daño y perjuicio de derecho común (arts. 1716, 1717, 1738 y 1740 CCyC), en tanto los arts. 8, 9, 10 y 15 de la Ley 24.013 fueron derogados por los arts. 99-100 de la Ley 27.742 (vigencia 9/7/2024). Se toma el 25% de las remuneraciones devengadas durante el período no registrado (fórmula de los ex arts. 8, 9 y 10) como pauta objetiva del daño. Se requiere intimación fehaciente previa al empleador y a la ARCA (ex AFIP, art. 47 dec. 1043/2001, art. 52 LCT).` : '',
    ].filter(Boolean).join('\n\n');

    resultDiv.innerHTML = `
      ${headerInfo}
      ${autoCaratula ? `<div style="font-size:.85rem;color:var(--color-muted);margin-bottom:.8rem;font-style:italic;">${autoCaratula}</div>` : ''}
      <div class="display-box" style="margin-bottom:1rem;">
        <strong>Causa:</strong> ${causaTextos[causa]}<br>
        <strong>Antigüedad:</strong> ${antiguedadTexto}<br>
        <strong>Período:</strong> ${ingreso.toLocaleDateString('es-AR')} → ${egreso.toLocaleDateString('es-AR')}
      </div>

      <table class="lid-tabla">
        <thead><tr><th>Concepto</th><th style="text-align:right;">Monto</th><th>Base de cálculo</th></tr></thead>
        <tbody>
          <tr class="seccion-row"><td colspan="3">1. Liquidación (LCT)</td></tr>
          ${filasLiq}
          ${filas25323 ? `<tr class="seccion-row"><td colspan="3">2. Daños — Registración deficiente y mora (ex Ley 25.323)</td></tr>${filas25323}` : ''}
          ${filas24013 ? `<tr class="seccion-row"><td colspan="3">3. Daños — Empleo no registrado / subregistro (ex Ley 24.013)</td></tr>${filas24013}` : ''}
          <tr class="total-row"><td>TOTAL GENERAL</td><td class="monto">${fmt(granTotal)}</td><td></td></tr>
        </tbody>
      </table>
      ${noProcede24013}

      <div class="lid-total-grande">${fmt(granTotal)}</div>

      <p class="lid-nota">* Valores calculados sobre la mejor remuneración mensual normal y habitual declarada. No incluye retenciones ni aportes. Esta calculadora no aplica el tope convencional del art. 245 LCT (3 veces el salario promedio del CCT); verificar manualmente el piso del 67% (doctrina "Vizzoti", hoy codificado en el art. 245 LCT, texto según art. 51, Ley 27.802).</p>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:1.4rem 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Fundamentos de procedencia de los rubros (texto editable)</div>
      <textarea id="lid-fundamentos" rows="12" style="width:100%;resize:vertical;font-family:inherit;font-size:.88rem;padding:12px;border:1px solid var(--color-border);border-radius:6px;background:#ffffff;color:#1a1a1a;line-height:1.6">${fundamentosTexto}</textarea>

      <div style="margin-top:1rem;display:flex;flex-wrap:wrap;gap:10px;">
        <button class="btn btn-ghost" id="lid-copiar">📋 Copiar resumen</button>
        <button class="btn btn-ghost" id="lid-pdf">📄 Exportar PDF</button>
        <button class="btn btn-ghost" id="lid-csv">📊 Exportar CSV</button>
      </div>
    `;
    resultDiv.style.display = 'block';

    // — Copiar resumen
    container.querySelector('#lid-copiar').addEventListener('click', () => {
      let texto = `CALCULADORA LIQUIDACIÓN INTEGRAL CON DAÑOS\n${'='.repeat(50)}\n`;
      if (nombre)      texto += `Trabajador:    ${nombre}\n`;
      if (empleador)   texto += `Empleador:     ${empleador}\n`;
      if (autoCaratula) texto += `Carátula:      ${autoCaratula}\n`;
      texto += `Causa:         ${causaTextos[causa]}\n`;
      texto += `Período:       ${ingreso.toLocaleDateString('es-AR')} → ${egreso.toLocaleDateString('es-AR')}\n`;
      texto += `Antigüedad:    ${antiguedadTexto}\n${'─'.repeat(50)}\n`;
      texto += `1. LIQUIDACIÓN (LCT)\n`;
      for (const c of conceptosLiq) texto += `  ${c.label.padEnd(46)} ${fmt(c.monto)}\n`;
      texto += `  Subtotal liquidación${' '.repeat(27)} ${fmt(totalLiq)}\n`;
      if (l25art1 || l25art2) {
        texto += `\n2. DAÑOS — REGISTRACIÓN DEFICIENTE Y MORA (ex Ley 25.323)\n`;
        if (l25art1) texto += `  Falta/deficiente registración (art. 1)${' '.repeat(8)} ${fmt(recargo1)}\n`;
        if (l25art2) texto += `  Mora en el pago (art. 2)${' '.repeat(23)} ${fmt(recargo2)}\n`;
        texto += `  Subtotal daños ex Ley 25.323${' '.repeat(19)} ${fmt(total25323)}\n`;
      }
      if (l24art8 || l24art9 || l24art10) {
        texto += `\n3. DAÑOS — EMPLEO NO REGISTRADO / SUBREGISTRO (ex Ley 24.013)\n`;
        if (l24Regularizo) {
          texto += `  No procede: el empleador regularizó dentro de los 30 días.\n`;
        } else {
          if (l24art8)  texto += `  Falta de registración (art. 8)${' '.repeat(16)} ${fmt(multa8)}\n`;
          if (l24art9)  texto += `  Subregistro fecha de ingreso (art. 9)${' '.repeat(10)} ${fmt(multa9)}\n`;
          if (l24art10) texto += `  Subregistro de remuneración (art. 10)${' '.repeat(10)} ${fmt(multa10)}\n`;
          texto += `  Subtotal daños ex Ley 24.013${' '.repeat(19)} ${fmt(total24013)}\n`;
        }
      }
      texto += `${'─'.repeat(50)}\nTOTAL GENERAL:${' '.repeat(34)} ${fmt(granTotal)}\n${'='.repeat(50)}\n`;
      const fundamentosTxt = container.querySelector('#lid-fundamentos')?.value.trim();
      if (fundamentosTxt) texto += `\nFUNDAMENTOS DE PROCEDENCIA\n${fundamentosTxt}\n`;
      navigator.clipboard.writeText(texto).then(() => {
        const btn = container.querySelector('#lid-copiar');
        btn.textContent = 'Copiado!';
        setTimeout(() => { btn.textContent = '📋 Copiar resumen'; }, 2000);
      });
    });

    // — Exportar PDF
    container.querySelector('#lid-pdf').addEventListener('click', () => {
      const seccionHtml = (titulo, filasHtml) => filasHtml
        ? `<tr class="total-row"><td colspan="3" style="background:#f5f0e0;font-weight:700">${titulo}</td></tr>${filasHtml}`
        : '';
      const tablaHtml = `
        ${seccionHtml('1. Liquidación (LCT)', filasLiq)}
        ${seccionHtml('2. Daños — Registración deficiente y mora (ex Ley 25.323)', filas25323)}
        ${seccionHtml('3. Daños — Empleo no registrado / subregistro (ex Ley 24.013)', filas24013)}
        <tr class="total-row"><td>TOTAL GENERAL</td><td class="monto">${fmt(granTotal)}</td><td></td></tr>`;
      const html = `
        ${autoCaratula ? `<div class="info-box"><strong>Carátula:</strong> ${autoCaratula}</div>` : ''}
        <div class="info-box">
          <strong>Causa:</strong> ${causaTextos[causa]}<br>
          <strong>Antigüedad:</strong> ${antiguedadTexto}<br>
          <strong>Período:</strong> ${ingreso.toLocaleDateString('es-AR')} → ${egreso.toLocaleDateString('es-AR')}<br>
          ${empleador ? `<strong>Empleador:</strong> ${empleador}<br>` : ''}
          ${nombre    ? `<strong>Trabajador:</strong> ${nombre}` : ''}
        </div>
        <table>
          <thead><tr><th>Concepto</th><th>Monto</th><th>Base de cálculo</th></tr></thead>
          <tbody>${tablaHtml}</tbody>
        </table>
        <div class="result-big">TOTAL GENERAL: ${fmt(granTotal)}</div>
        ${l24Regularizo && (l24art8 || l24art9 || l24art10) ? `<p class="nota">El daño ex Ley 24.013 no procede: el empleador regularizó dentro de los 30 días de la intimación fehaciente.</p>` : ''}
        <p class="nota">Valores calculados sobre la mejor remuneración mensual normal y habitual declarada. No incluye retenciones ni aportes. Verificar el piso del 67% (art. 245 LCT, texto según art. 51, Ley 27.802) si aplica tope convencional.</p>
        ${(() => {
          const fundamentosTxt = container.querySelector('#lid-fundamentos')?.value.trim();
          return fundamentosTxt ? `<div class="info-box"><strong>Fundamentos de procedencia de los rubros:</strong><br><br>${fundamentosTxt.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>` : '';
        })()}`;
      exportarPDF('Calculadora Liquidación Integral con Daños', html);
    });

    // — Exportar CSV
    container.querySelector('#lid-csv').addEventListener('click', () => {
      const csvFilas = [
        ['Sección', 'Concepto', 'Monto ($)', 'Base de cálculo'],
        ...conceptosLiq.map(c => ['Liquidación', c.label, c.monto.toFixed(2), c.base]),
        ['Liquidación', 'Subtotal liquidación', totalLiq.toFixed(2), ''],
      ];
      if (l25art1) csvFilas.push(['Ley 25.323', 'Falta/deficiente registración (art. 1)', recargo1.toFixed(2), `${ind245.toFixed(2)} × 100%`]);
      if (l25art2) csvFilas.push(['Ley 25.323', 'Mora en el pago (art. 2)', recargo2.toFixed(2), `${baseDanio25.toFixed(2)} × 50%`]);
      if (l25art1 || l25art2) csvFilas.push(['Ley 25.323', 'Subtotal daños ex Ley 25.323', total25323.toFixed(2), '']);
      if ((l24art8 || l24art9 || l24art10) && !l24Regularizo) {
        if (l24art8)  csvFilas.push(['Ley 24.013', 'Falta de registración (art. 8)', multa8.toFixed(2), multa8Base]);
        if (l24art9)  csvFilas.push(['Ley 24.013', 'Subregistro fecha de ingreso (art. 9)', multa9.toFixed(2), multa9Base]);
        if (l24art10) csvFilas.push(['Ley 24.013', 'Subregistro de remuneración (art. 10)', multa10.toFixed(2), multa10Base]);
        csvFilas.push(['Ley 24.013', 'Subtotal daños ex Ley 24.013', total24013.toFixed(2), '']);
      } else if ((l24art8 || l24art9 || l24art10) && l24Regularizo) {
        csvFilas.push(['Ley 24.013', 'No procede (regularización dentro de los 30 días)', '0.00', '']);
      }
      csvFilas.push(['', 'TOTAL GENERAL', granTotal.toFixed(2), '']);
      csvFilas.push(['', '', '', '']);
      csvFilas.push(['', 'Trabajador', nombre, '']);
      csvFilas.push(['', 'Empleador', empleador, '']);
      csvFilas.push(['', 'Carátula', autoCaratula, '']);
      csvFilas.push(['', 'Causa', causaTextos[causa], '']);
      csvFilas.push(['', 'Período', `${ingreso.toLocaleDateString('es-AR')} → ${egreso.toLocaleDateString('es-AR')}`, '']);
      csvFilas.push(['', 'Antigüedad', antiguedadTexto, '']);
      exportarCSV('LiquidacionIntegralConDanios' + (nombre ? '_' + nombre : ''), csvFilas);
    });
  }
}
