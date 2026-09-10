// liquidacion-rubros-extra.js — Rubros adicionales compartidos por las calculadoras de
// Liquidación Laboral (LCT) y Liquidación Integral con Daños:
//   • Vacaciones no gozadas de períodos anteriores (distinta de la proporcional Art. 156,
//     que ambas calculadoras ya calculan automáticamente sobre el año de extinción).
//   • Haberes adeudados (salarios impagos).
//   • Otros rubros adeudados (lista abierta, ampliable).
//   • Diferencias salariales según CCT (opcional).
//   • Horas extra al 50% y al 100% (opcional) — la cantidad de horas se deriva de una
//     declaración de días trabajados y horas extra por día, en lugar de tipearse directamente.
// Se usa desde tools/liquidacion.js y tools/liquidacion-integral.js para no duplicar esta
// lógica en ambos archivos (que ya comparten casi la totalidad de las fórmulas LCT).

function fmt(n) {
  return '$ ' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function renderRubrosExtra(p) {
  return `
    <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:1.6rem 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Rubros adicionales (opcional)</div>

    <div class="form-row">
      <div class="field-group">
        <label for="${p}-vac-nogozadas">Días de vacaciones no gozadas (períodos anteriores)</label>
        <input type="number" id="${p}-vac-nogozadas" min="0" step="1" placeholder="Ej: 14">
        <span class="field-error" id="err-${p}-vac-nogozadas"></span>
      </div>
      <div class="field-group">
        <label for="${p}-haberes-adeudados">Haberes adeudados ($)</label>
        <input type="number" id="${p}-haberes-adeudados" min="0" step="0.01" placeholder="Ej: 150000">
        <span class="field-error" id="err-${p}-haberes-adeudados"></span>
      </div>
    </div>

    <div class="field-group" style="margin-top:.4rem">
      <label>Otros rubros adeudados</label>
      <p style="font-size:.78rem;color:var(--color-muted);margin:0 0 6px">Agregá cualquier otro rubro no contemplado arriba (comisiones, viáticos, reintegros, etc.).</p>
      <div id="${p}-otros-rubros-list" style="display:flex;flex-direction:column;gap:6px"></div>
      <button type="button" class="btn btn-ghost" id="${p}-otros-rubros-agregar" style="margin-top:8px;align-self:flex-start">+ Agregar rubro</button>
    </div>

    <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-weight:500;margin-top:1.2rem">
      <input type="checkbox" id="${p}-cct-check">
      Calcular diferencias salariales según CCT
    </label>
    <div id="${p}-cct-campos" style="display:none;padding:.7rem .9rem;background:rgba(255,255,255,.04);border-radius:6px;margin-top:.4rem">
      <div class="form-row">
        <div class="field-group">
          <label for="${p}-cct-rem-debida">Remuneración según escala CCT (debida) ($)</label>
          <input type="number" id="${p}-cct-rem-debida" min="0" step="0.01" placeholder="Ej: 600000">
          <span class="field-error" id="err-${p}-cct-rem-debida"></span>
        </div>
        <div class="field-group">
          <label for="${p}-cct-rem-abonada">Remuneración efectivamente abonada ($)</label>
          <input type="number" id="${p}-cct-rem-abonada" min="0" step="0.01" placeholder="Ej: 500000">
          <span class="field-error" id="err-${p}-cct-rem-abonada"></span>
        </div>
      </div>
      <div class="field-group">
        <label for="${p}-cct-meses">Meses del período reclamado</label>
        <input type="number" id="${p}-cct-meses" min="1" step="1" placeholder="Ej: 12">
        <span class="field-error" id="err-${p}-cct-meses"></span>
      </div>
    </div>

    <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-weight:500;margin-top:1.2rem">
      <input type="checkbox" id="${p}-he-check">
      Calcular horas extra al 50% y al 100% (Art. 201 LCT)
    </label>
    <div id="${p}-he-campos" style="display:none;padding:.7rem .9rem;background:rgba(255,255,255,.04);border-radius:6px;margin-top:.4rem">
      <p style="font-size:.78rem;color:var(--color-muted);margin:0 0 8px">Declará los días trabajados con horas extra y las horas extra por día — la cantidad total de horas extra se calcula automáticamente a partir de esa declaración. Valor hora por defecto: sueldo mensual / 200 (8 hs × 25 días), editable.</p>
      <div class="form-row">
        <div class="field-group">
          <label for="${p}-he-valorhora">Valor hora ($) — opcional</label>
          <input type="number" id="${p}-he-valorhora" min="0" step="0.01" placeholder="Se autocompleta con rem / 200">
        </div>
      </div>
      <div class="form-row">
        <div class="field-group">
          <label for="${p}-he50-dias">Días con horas extra al 50% <span style="font-weight:400;opacity:.7">(hábiles y sábados hasta las 13 hs)</span></label>
          <input type="number" id="${p}-he50-dias" min="0" step="1" placeholder="Ej: 20">
        </div>
        <div class="field-group">
          <label for="${p}-he50-horasxdia">Horas extra por día (50%)</label>
          <input type="number" id="${p}-he50-horasxdia" min="0" step="0.5" placeholder="Ej: 2">
        </div>
      </div>
      <div class="form-row">
        <div class="field-group">
          <label for="${p}-he100-dias">Días con horas extra al 100% <span style="font-weight:400;opacity:.7">(sábados después de las 13 hs, domingos y feriados)</span></label>
          <input type="number" id="${p}-he100-dias" min="0" step="1" placeholder="Ej: 4">
        </div>
        <div class="field-group">
          <label for="${p}-he100-horasxdia">Horas extra por día (100%)</label>
          <input type="number" id="${p}-he100-horasxdia" min="0" step="0.5" placeholder="Ej: 8">
        </div>
      </div>
      <span class="field-error" id="err-${p}-he50-dias"></span>
      <div id="${p}-he-resumen" style="font-size:.82rem;color:var(--color-muted);margin-top:.4rem"></div>
    </div>
  `;
}

function agregarOtroRubroRow(listEl) {
  const row = document.createElement('div');
  row.setAttribute('data-otro-row', '1');
  row.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap';
  row.innerHTML = `
    <input type="text" data-otro-label placeholder="Descripción del rubro (ej: comisiones adeudadas)" style="flex:2;min-width:200px">
    <input type="number" data-otro-monto min="0" step="0.01" placeholder="Monto $" style="flex:1;min-width:120px">
    <button type="button" class="btn btn-ghost" data-otro-quitar style="padding:6px 10px">✕</button>
  `;
  row.querySelector('[data-otro-quitar]').addEventListener('click', () => row.remove());
  listEl.appendChild(row);
}

export function wireRubrosExtra(container, p) {
  const cctCheck  = container.querySelector(`#${p}-cct-check`);
  const cctCampos = container.querySelector(`#${p}-cct-campos`);
  if (cctCheck && cctCampos) {
    cctCheck.addEventListener('change', () => { cctCampos.style.display = cctCheck.checked ? 'block' : 'none'; });
  }

  const heCheck  = container.querySelector(`#${p}-he-check`);
  const heCampos = container.querySelector(`#${p}-he-campos`);
  if (heCheck && heCampos) {
    heCheck.addEventListener('change', () => { heCampos.style.display = heCheck.checked ? 'block' : 'none'; });
  }

  const otrosList = container.querySelector(`#${p}-otros-rubros-list`);
  const otrosBtn  = container.querySelector(`#${p}-otros-rubros-agregar`);
  if (otrosBtn && otrosList) {
    otrosBtn.addEventListener('click', () => agregarOtroRubroRow(otrosList));
  }

  const he50Dias   = container.querySelector(`#${p}-he50-dias`);
  const he50Horas  = container.querySelector(`#${p}-he50-horasxdia`);
  const he100Dias  = container.querySelector(`#${p}-he100-dias`);
  const he100Horas = container.querySelector(`#${p}-he100-horasxdia`);
  const heResumen  = container.querySelector(`#${p}-he-resumen`);
  function actualizarResumenHE() {
    if (!heResumen) return;
    const h50  = (parseFloat(he50Dias  && he50Dias.value)  || 0) * (parseFloat(he50Horas  && he50Horas.value)  || 0);
    const h100 = (parseFloat(he100Dias && he100Dias.value) || 0) * (parseFloat(he100Horas && he100Horas.value) || 0);
    if (h50 === 0 && h100 === 0) { heResumen.textContent = ''; return; }
    heResumen.textContent = `Total declarado: ${h50} hora(s) extra al 50% + ${h100} hora(s) extra al 100% = ${h50 + h100} hora(s) extra en total.`;
  }
  [he50Dias, he50Horas, he100Dias, he100Horas].forEach(el => { if (el) el.addEventListener('input', actualizarResumenHE); });
}

// Lee y valida los campos renderizados por renderRubrosExtra(p), y devuelve
// { valid, conceptos } con el mismo shape { label, monto, base, fundamento, esDescuento }
// que ya usan liquidacion.js y liquidacion-integral.js en sus arrays de conceptos.
export function leerYValidarRubrosExtra(container, p, { rem, setError }) {
  let valid = true;
  const conceptos = [];
  const remBase = (typeof rem === 'number' && !isNaN(rem) && rem > 0) ? rem : 0;

  // ── Vacaciones no gozadas (períodos anteriores) ─────────────────────────
  const vacStr = container.querySelector(`#${p}-vac-nogozadas`).value;
  const vacDias = parseFloat(vacStr);
  if (vacStr && !isNaN(vacDias) && vacDias > 0) {
    const monto = (remBase / 25) * vacDias;
    conceptos.push({
      label: `Vacaciones no gozadas (períodos anteriores) — ${vacDias} día(s)`,
      monto,
      base: `(${fmt(remBase)} / 25) × ${vacDias} día(s)`,
      fundamento: 'Corresponde el pago de los días de vacaciones correspondientes a períodos anteriores no gozados ni compensados, en tanto no se encuentre acreditado su goce efectivo ni su pago (arts. 150, 154 y 156 LCT), sin perjuicio de la proporcional del art. 156 LCT correspondiente al año de extinción, que se liquida por separado.',
    });
  }

  // ── Haberes adeudados ────────────────────────────────────────────────────
  const haberesStr = container.querySelector(`#${p}-haberes-adeudados`).value;
  const haberes = parseFloat(haberesStr);
  if (haberesStr && !isNaN(haberes) && haberes > 0) {
    conceptos.push({
      label: 'Haberes adeudados',
      monto: haberes,
      base: 'Monto denunciado por el/la profesional',
      fundamento: 'Corresponde el pago de los salarios devengados y no abonados, en virtud del carácter alimentario de la remuneración y del principio de ajenidad del riesgo empresario (arts. 74 y 103 LCT).',
    });
  }

  // ── Otros rubros adeudados (lista abierta) ──────────────────────────────
  container.querySelectorAll(`#${p}-otros-rubros-list [data-otro-row]`).forEach(row => {
    const labelEl = row.querySelector('[data-otro-label]');
    const montoEl = row.querySelector('[data-otro-monto]');
    const label = labelEl ? labelEl.value.trim() : '';
    const montoStr = montoEl ? montoEl.value : '';
    const monto = parseFloat(montoStr);
    if (label && montoStr && !isNaN(monto) && monto > 0) {
      conceptos.push({
        label: `Otro rubro adeudado — ${label}`,
        monto,
        base: 'Monto denunciado por el/la profesional',
        fundamento: `Corresponde el pago del rubro "${label}", denunciado como adeudado por el/la profesional interviniente.`,
      });
    }
  });

  // ── Diferencias salariales según CCT (opcional) ─────────────────────────
  const cctCheck = container.querySelector(`#${p}-cct-check`).checked;
  if (cctCheck) {
    const remDebidaStr  = container.querySelector(`#${p}-cct-rem-debida`).value;
    const remAbonadaStr = container.querySelector(`#${p}-cct-rem-abonada`).value;
    const mesesStr       = container.querySelector(`#${p}-cct-meses`).value;
    const remDebida  = parseFloat(remDebidaStr);
    const remAbonada = parseFloat(remAbonadaStr);
    const meses       = parseFloat(mesesStr);

    let cctValid = true;
    if (!remDebidaStr || isNaN(remDebida) || remDebida <= 0) {
      setError(`${p}-cct-rem-debida`, `err-${p}-cct-rem-debida`, 'Ingresá la remuneración según CCT.');
      cctValid = false;
    }
    if (!remAbonadaStr || isNaN(remAbonada) || remAbonada < 0) {
      setError(`${p}-cct-rem-abonada`, `err-${p}-cct-rem-abonada`, 'Ingresá la remuneración abonada.');
      cctValid = false;
    }
    if (!mesesStr || isNaN(meses) || meses <= 0) {
      setError(`${p}-cct-meses`, `err-${p}-cct-meses`, 'Ingresá la cantidad de meses.');
      cctValid = false;
    }
    if (cctValid && remDebida <= remAbonada) {
      setError(`${p}-cct-rem-debida`, `err-${p}-cct-rem-debida`, 'Debe ser mayor a la remuneración abonada.');
      cctValid = false;
    }
    if (!cctValid) {
      valid = false;
    } else {
      const diferenciaMensual = remDebida - remAbonada;
      const monto = diferenciaMensual * meses;
      conceptos.push({
        label: 'Diferencias salariales según CCT',
        monto,
        base: `(${fmt(remDebida)} − ${fmt(remAbonada)}) × ${meses} mes(es)`,
        fundamento: 'Corresponde el pago de las diferencias salariales resultantes del incorrecto encuadre convencional o categorización del/de la trabajador/a, en tanto se le abonó una remuneración inferior a la prevista en el Convenio Colectivo de Trabajo aplicable a la actividad o categoría efectivamente desempeñada (art. 74 LCT y ccdtes. del CCT de aplicación).',
      });
    }
  }

  // ── Horas extra al 50% y al 100% (opcional) ─────────────────────────────
  const heCheck = container.querySelector(`#${p}-he-check`).checked;
  if (heCheck) {
    const valorHoraStr = container.querySelector(`#${p}-he-valorhora`).value;
    let valorHora = parseFloat(valorHoraStr);
    const valorHoraAuto = !valorHoraStr || isNaN(valorHora) || valorHora <= 0;
    if (valorHoraAuto) valorHora = remBase / 200;

    const dias50       = parseFloat(container.querySelector(`#${p}-he50-dias`).value)       || 0;
    const horasXDia50  = parseFloat(container.querySelector(`#${p}-he50-horasxdia`).value)  || 0;
    const dias100      = parseFloat(container.querySelector(`#${p}-he100-dias`).value)      || 0;
    const horasXDia100 = parseFloat(container.querySelector(`#${p}-he100-horasxdia`).value) || 0;

    const horas50  = dias50  * horasXDia50;
    const horas100 = dias100 * horasXDia100;

    if (horas50 <= 0 && horas100 <= 0) {
      setError(`${p}-he50-dias`, `err-${p}-he50-dias`, 'Declará al menos un día y una hora extra trabajados (50% o 100%).');
      valid = false;
    } else {
      const valorHoraNota = valorHoraAuto ? ' [valor hora = rem / 200]' : '';
      if (horas50 > 0) {
        const monto50 = horas50 * valorHora * 1.5;
        conceptos.push({
          label: `Horas extra al 50% — ${horas50} hora(s) (${dias50} día(s) × ${horasXDia50} hs/día)`,
          monto: monto50,
          base: `${horas50} hs × ${fmt(valorHora)}${valorHoraNota} × 150%`,
          fundamento: 'Corresponde el pago de las horas suplementarias trabajadas en exceso de la jornada legal en días hábiles y sábados hasta las 13 horas, con el recargo del cincuenta por ciento (50%) previsto en el art. 201 LCT.',
        });
      }
      if (horas100 > 0) {
        const monto100 = horas100 * valorHora * 2;
        conceptos.push({
          label: `Horas extra al 100% — ${horas100} hora(s) (${dias100} día(s) × ${horasXDia100} hs/día)`,
          monto: monto100,
          base: `${horas100} hs × ${fmt(valorHora)}${valorHoraNota} × 200%`,
          fundamento: 'Corresponde el pago de las horas suplementarias trabajadas en exceso de la jornada legal en sábados después de las 13 horas, domingos y días feriados, con el recargo del cien por ciento (100%) previsto en el art. 201 LCT.',
        });
      }
    }
  }

  return { valid, conceptos };
}
