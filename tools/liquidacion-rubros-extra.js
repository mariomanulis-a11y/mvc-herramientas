// liquidacion-rubros-extra.js — Rubros adicionales compartidos por las calculadoras de
// Liquidación Laboral (LCT) y Liquidación Integral con Daños:
//   • Vacaciones no gozadas de períodos anteriores (distinta de la proporcional Art. 156,
//     que ambas calculadoras ya calculan automáticamente sobre el año de extinción).
//   • Haberes adeudados (salarios impagos).
//   • Otros rubros adeudados (lista abierta, ampliable).
//   • Diferencias salariales según CCT, mes a mes (hasta 24 meses, cada uno con su propio
//     selector de mes/año), con la opción de incluir el detalle completo en la exportación
//     de la liquidación o solo el total, y un export propio e independiente del detalle.
//   • Horas extra al 50% y al 100% (Art. 201 LCT), calculadas a partir de una "semana tipo"
//     (días de la semana tildados con horario de entrada/salida) multiplicada por la cantidad
//     de semanas del período reclamado, más feriados trabajados cargados aparte. El cálculo
//     respeta el doble tope de la Ley 11.544 (8 hs diarias o 48 semanales, arts. 196/197 LCT)
//     para el recargo del 50%, y aplica el 100% sin tope a partir de la primera hora en sábado
//     después de las 13 hs, domingo y feriados (arts. 201 y 204 LCT).
// Se usa desde tools/liquidacion.js y tools/liquidacion-integral.js para no duplicar esta
// lógica en ambos archivos (que ya comparten casi la totalidad de las fórmulas LCT).
import { exportarPDF, exportarCSV } from './exportar.js';

const DIAS_SEMANA = [
  { key: 'lun', label: 'Lunes' },
  { key: 'mar', label: 'Martes' },
  { key: 'mie', label: 'Miércoles' },
  { key: 'jue', label: 'Jueves' },
  { key: 'vie', label: 'Viernes' },
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' },
];
const DIAS_COMUNES = ['lun', 'mar', 'mie', 'jue', 'vie'];
const CORTE_SABADO_MIN = 13 * 60;
const NOMBRES_MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MAX_MESES_CCT = 24;

function fmt(n) {
  return '$ ' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function round2(n) {
  return Math.round(n * 100) / 100;
}
function formatearMes(mesStr) {
  if (!mesStr) return '';
  const [y, m] = mesStr.split('-').map(Number);
  return `${NOMBRES_MES[m - 1]}-${y}`;
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
      <p style="font-size:.78rem;color:var(--color-muted);margin:0 0 8px">Cargá mes por mes (hasta ${MAX_MESES_CCT} meses, no necesariamente consecutivos) la remuneración que correspondía según el CCT y la efectivamente abonada.</p>
      <div id="${p}-cct-meses-list" style="display:flex;flex-direction:column;gap:8px"></div>
      <span class="field-error" id="err-${p}-cct-meses-list"></span>
      <button type="button" class="btn btn-ghost" id="${p}-cct-meses-agregar" style="margin-top:8px;align-self:flex-start">+ Agregar mes</button>
      <div id="${p}-cct-resumen" style="font-size:.82rem;color:var(--color-muted);margin-top:.5rem"></div>

      <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-weight:500;margin-top:1rem;font-size:.85rem">
        <input type="checkbox" id="${p}-cct-incluir-detalle" checked>
        Incluir el detalle mes a mes en el PDF/CSV de la liquidación (si se destilda, ahí solo figura el total)
      </label>
      <p style="font-size:.76rem;color:var(--color-muted);margin:.3rem 0 0">El detalle completo siempre se puede exportar aparte, con los botones que aparecen junto al resultado.</p>
    </div>

    <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-weight:500;margin-top:1.2rem">
      <input type="checkbox" id="${p}-he-check">
      Calcular horas extra al 50% y al 100% (Art. 201 LCT)
    </label>
    <div id="${p}-he-campos" style="display:none;padding:.7rem .9rem;background:rgba(255,255,255,.04);border-radius:6px;margin-top:.4rem">
      <p style="font-size:.78rem;color:var(--color-muted);margin:0 0 8px">Declará una semana tipo (la jornada habitual reclamada): tildá los días trabajados y su horario. El sistema calcula el excedente sobre la jornada legal (arts. 196/197 LCT y Ley 11.544 — 8 hs diarias o 48 semanales, lo que se alcance primero) al 50%, separa automáticamente el sábado antes/después de las 13 hs, computa el domingo íntegro al 100%, y multiplica todo por la cantidad de semanas del período. Los feriados trabajados se cargan aparte y no se multiplican.</p>

      <div class="form-row">
        <div class="field-group">
          <label for="${p}-he-jornada-diaria">Jornada normal diaria (hs)</label>
          <input type="number" id="${p}-he-jornada-diaria" min="0" step="0.5" value="8">
        </div>
        <div class="field-group">
          <label for="${p}-he-jornada-semanal">Jornada normal semanal (hs)</label>
          <input type="number" id="${p}-he-jornada-semanal" min="0" step="0.5" value="48">
        </div>
      </div>
      <div class="form-row">
        <div class="field-group">
          <label for="${p}-he-semanas">Cantidad de semanas del período reclamado</label>
          <input type="number" id="${p}-he-semanas" min="0" step="1" placeholder="Ej: 52">
          <span class="field-error" id="err-${p}-he-semanas"></span>
        </div>
        <div class="field-group">
          <label for="${p}-he-valorhora">Valor hora ($) — opcional</label>
          <input type="number" id="${p}-he-valorhora" min="0" step="0.01" placeholder="Se autocompleta con rem / 200">
        </div>
      </div>

      <div id="${p}-he-dias-grid" style="display:flex;flex-direction:column;gap:6px;margin-top:.6rem">
        ${DIAS_SEMANA.map(d => `
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <label style="display:flex;align-items:center;gap:.4rem;cursor:pointer;min-width:110px;font-weight:500">
              <input type="checkbox" id="${p}-he-dia-${d.key}-check">
              ${d.label}
            </label>
            <input type="time" id="${p}-he-dia-${d.key}-desde" disabled style="max-width:110px">
            <span style="opacity:.6">a</span>
            <input type="time" id="${p}-he-dia-${d.key}-hasta" disabled style="max-width:110px">
            ${d.key === 'sab' ? '<span style="font-size:.72rem;color:var(--color-muted)">(se separa solo antes / después de las 13 hs)</span>' : ''}
            ${d.key === 'dom' ? '<span style="font-size:.72rem;color:var(--color-muted)">(100% completo)</span>' : ''}
          </div>
        `).join('')}
      </div>
      <span class="field-error" id="err-${p}-he-dias"></span>

      <div class="field-group" style="margin-top:.8rem">
        <label>Feriados trabajados durante el período (opcional, siempre al 100%, no se multiplican por la cantidad de semanas)</label>
        <div id="${p}-he-feriados-list" style="display:flex;flex-direction:column;gap:6px"></div>
        <button type="button" class="btn btn-ghost" id="${p}-he-feriados-agregar" style="margin-top:8px;align-self:flex-start">+ Agregar feriado trabajado</button>
      </div>

      <div id="${p}-he-resumen" style="font-size:.82rem;color:var(--color-muted);margin-top:.6rem"></div>
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

function agregarFeriadoRow(listEl, onChange) {
  const row = document.createElement('div');
  row.setAttribute('data-feriado-row', '1');
  row.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap';
  row.innerHTML = `
    <input type="date" data-feriado-fecha style="max-width:160px" title="Fecha del feriado (opcional)">
    <input type="number" data-feriado-horas min="0" step="0.5" placeholder="Horas trabajadas" style="max-width:160px">
    <button type="button" class="btn btn-ghost" data-feriado-quitar style="padding:6px 10px">✕</button>
  `;
  row.querySelector('[data-feriado-quitar]').addEventListener('click', () => { row.remove(); onChange(); });
  row.querySelector('[data-feriado-horas]').addEventListener('input', onChange);
  listEl.appendChild(row);
}

function agregarMesCCTRow(listEl, agregarBtn) {
  const filasActuales = listEl.querySelectorAll('[data-cct-row]').length;
  if (filasActuales >= MAX_MESES_CCT) return;
  const row = document.createElement('div');
  row.setAttribute('data-cct-row', '1');
  row.style.cssText = 'display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap;padding:.4rem;background:rgba(255,255,255,.03);border-radius:6px';
  row.innerHTML = `
    <div class="field-group" style="flex:1;min-width:130px;margin:0">
      <label style="font-size:.72rem">Mes</label>
      <input type="month" data-cct-mes>
    </div>
    <div class="field-group" style="flex:1;min-width:150px;margin:0">
      <label style="font-size:.72rem">Remuneración CCT ($)</label>
      <input type="number" data-cct-rem-cct min="0" step="0.01" placeholder="Ej: 600000">
    </div>
    <div class="field-group" style="flex:1;min-width:150px;margin:0">
      <label style="font-size:.72rem">Remuneración abonada ($)</label>
      <input type="number" data-cct-rem-abonada min="0" step="0.01" placeholder="Ej: 500000">
    </div>
    <button type="button" class="btn btn-ghost" data-cct-quitar style="padding:6px 10px;margin-top:18px">✕</button>
    <span class="field-error" data-cct-row-error style="flex-basis:100%"></span>
  `;
  row.querySelector('[data-cct-quitar]').addEventListener('click', () => {
    row.remove();
    if (agregarBtn) agregarBtn.disabled = listEl.querySelectorAll('[data-cct-row]').length >= MAX_MESES_CCT;
  });
  listEl.appendChild(row);
  if (agregarBtn) agregarBtn.disabled = listEl.querySelectorAll('[data-cct-row]').length >= MAX_MESES_CCT;
}

function parseHora(str) {
  if (!str) return null;
  const partes = str.split(':').map(Number);
  if (partes.length < 2 || isNaN(partes[0]) || isNaN(partes[1])) return null;
  return partes[0] * 60 + partes[1];
}

function leerHorarioDia(container, p, key) {
  const chk = container.querySelector(`#${p}-he-dia-${key}-check`);
  if (!chk || !chk.checked) return null;
  const desdeStr = container.querySelector(`#${p}-he-dia-${key}-desde`).value;
  const hastaStr = container.querySelector(`#${p}-he-dia-${key}-hasta`).value;
  if (!desdeStr || !hastaStr) return { error: true };
  const desdeMin = parseHora(desdeStr);
  const hastaMin = parseHora(hastaStr);
  if (desdeMin === null || hastaMin === null || hastaMin <= desdeMin) return { error: true };
  return { desdeMin, hastaMin, horas: (hastaMin - desdeMin) / 60 };
}

function calcularHorasExtraSemana(container, p) {
  let horasComunSemana = 0;
  let diasComunesTrabajados = 0;
  let horas100PorSemana = 0;
  let hayError = false;

  DIAS_COMUNES.forEach(key => {
    const d = leerHorarioDia(container, p, key);
    if (d && d.error) hayError = true;
    else if (d) { horasComunSemana += d.horas; diasComunesTrabajados++; }
  });

  const sab = leerHorarioDia(container, p, 'sab');
  if (sab && sab.error) {
    hayError = true;
  } else if (sab) {
    if (sab.hastaMin <= CORTE_SABADO_MIN) {
      horasComunSemana += sab.horas; diasComunesTrabajados++;
    } else if (sab.desdeMin >= CORTE_SABADO_MIN) {
      horas100PorSemana += sab.horas;
    } else {
      horasComunSemana += (CORTE_SABADO_MIN - sab.desdeMin) / 60;
      horas100PorSemana += (sab.hastaMin - CORTE_SABADO_MIN) / 60;
      diasComunesTrabajados++;
    }
  }

  const dom = leerHorarioDia(container, p, 'dom');
  if (dom && dom.error) hayError = true;
  else if (dom) horas100PorSemana += dom.horas;

  return { horasComunSemana, diasComunesTrabajados, horas100PorSemana, hayError };
}

function calcularExtrasTotales(container, p) {
  const semana = calcularHorasExtraSemana(container, p);
  const jornadaDiaria = parseFloat(container.querySelector(`#${p}-he-jornada-diaria`).value) || 8;
  const jornadaSemanal = parseFloat(container.querySelector(`#${p}-he-jornada-semanal`).value) || 48;
  const tope = Math.min(semana.diasComunesTrabajados * jornadaDiaria, jornadaSemanal);
  const horas50PorSemana = Math.max(0, semana.horasComunSemana - tope);
  const semanas = parseFloat(container.querySelector(`#${p}-he-semanas`).value) || 0;

  let horasFeriados = 0;
  container.querySelectorAll(`#${p}-he-feriados-list [data-feriado-row]`).forEach(row => {
    const h = parseFloat(row.querySelector('[data-feriado-horas]').value);
    if (!isNaN(h) && h > 0) horasFeriados += h;
  });

  const horas50Total = horas50PorSemana * semanas;
  const horas100Total = semana.horas100PorSemana * semanas + horasFeriados;

  return { ...semana, jornadaDiaria, jornadaSemanal, tope, horas50PorSemana, semanas, horasFeriados, horas50Total, horas100Total };
}

function leerFilasCCT(container, p) {
  const filas = [];
  container.querySelectorAll(`#${p}-cct-meses-list [data-cct-row]`).forEach(row => {
    const mesEl = row.querySelector('[data-cct-mes]');
    const ccTel = row.querySelector('[data-cct-rem-cct]');
    const abEl  = row.querySelector('[data-cct-rem-abonada]');
    const errEl = row.querySelector('[data-cct-row-error]');
    if (errEl) errEl.textContent = '';
    row.querySelectorAll('input').forEach(i => i.classList.remove('error'));

    const mes = mesEl.value;
    const remCCTStr = ccTel.value;
    const remAbStr  = abEl.value;
    const intentado = mes || remCCTStr || remAbStr;
    if (!intentado) return;

    const remCCT = parseFloat(remCCTStr);
    const remAb  = parseFloat(remAbStr);
    let error = '';
    if (!mes) error = 'Falta el mes.';
    else if (!remCCTStr || isNaN(remCCT) || remCCT <= 0) error = 'Falta la remuneración según CCT.';
    else if (!remAbStr || isNaN(remAb) || remAb < 0) error = 'Falta la remuneración abonada.';
    else if (remCCT <= remAb) error = 'La remuneración CCT debe ser mayor a la abonada.';

    if (error) {
      if (errEl) errEl.textContent = error;
      mesEl.classList.toggle('error', !mes);
      ccTel.classList.toggle('error', !remCCTStr || isNaN(remCCT) || remCCT <= 0 || (!isNaN(remAb) && remCCT <= remAb));
      abEl.classList.toggle('error', !remAbStr || isNaN(remAb) || remAb < 0);
      filas.push({ error });
    } else {
      filas.push({ mes, remCCT, remAb, diferencia: remCCT - remAb });
    }
  });
  return filas;
}

export function wireRubrosExtra(container, p) {
  // Otros rubros adeudados
  const otrosList = container.querySelector(`#${p}-otros-rubros-list`);
  const otrosBtn  = container.querySelector(`#${p}-otros-rubros-agregar`);
  if (otrosBtn && otrosList) {
    otrosBtn.addEventListener('click', () => agregarOtroRubroRow(otrosList));
  }

  // Diferencias CCT
  const cctCheck  = container.querySelector(`#${p}-cct-check`);
  const cctCampos = container.querySelector(`#${p}-cct-campos`);
  const cctList   = container.querySelector(`#${p}-cct-meses-list`);
  const cctAgregarBtn = container.querySelector(`#${p}-cct-meses-agregar`);
  if (cctCheck && cctCampos) {
    cctCheck.addEventListener('change', () => { cctCampos.style.display = cctCheck.checked ? 'block' : 'none'; });
  }
  if (cctAgregarBtn && cctList) {
    cctAgregarBtn.addEventListener('click', () => agregarMesCCTRow(cctList, cctAgregarBtn));
    // Primera fila lista para usar apenas se tilda el checkbox.
    if (cctCheck) {
      cctCheck.addEventListener('change', () => {
        if (cctCheck.checked && cctList.querySelectorAll('[data-cct-row]').length === 0) {
          agregarMesCCTRow(cctList, cctAgregarBtn);
        }
      });
    }
  }

  // Horas extra
  const heCheck  = container.querySelector(`#${p}-he-check`);
  const heCampos = container.querySelector(`#${p}-he-campos`);
  if (heCheck && heCampos) {
    heCheck.addEventListener('change', () => { heCampos.style.display = heCheck.checked ? 'block' : 'none'; });
  }

  const heResumen = container.querySelector(`#${p}-he-resumen`);
  function actualizarResumenHE() {
    if (!heResumen) return;
    const datos = calcularExtrasTotales(container, p);
    if (datos.hayError) {
      heResumen.textContent = 'Revisá los horarios: la salida debe ser posterior a la entrada en cada día tildado.';
      return;
    }
    if (datos.horasComunSemana === 0 && datos.horas100PorSemana === 0 && datos.horasFeriados === 0) {
      heResumen.textContent = '';
      return;
    }
    const partes = [];
    partes.push(`Semana tipo: ${round2(datos.horasComunSemana)} hs en tramo común (tope aplicado: ${round2(datos.tope)} hs) → ${round2(datos.horas50PorSemana)} hs extra al 50% y ${round2(datos.horas100PorSemana)} hs extra al 100% por semana.`);
    if (datos.semanas > 0) {
      partes.push(`× ${datos.semanas} semana(s) = ${round2(datos.horas50Total)} hs al 50% y ${round2(datos.horas100PorSemana * datos.semanas)} hs al 100% en el período.`);
    } else {
      partes.push('Falta indicar la cantidad de semanas del período para totalizar.');
    }
    if (datos.horasFeriados > 0) partes.push(`+ ${round2(datos.horasFeriados)} hs de feriados trabajados (100%, sin multiplicar).`);
    partes.push(`Total: ${round2(datos.horas50Total)} hs al 50% + ${round2(datos.horas100Total)} hs al 100%.`);
    heResumen.textContent = partes.join(' ');
  }

  DIAS_SEMANA.forEach(d => {
    const chk    = container.querySelector(`#${p}-he-dia-${d.key}-check`);
    const desde  = container.querySelector(`#${p}-he-dia-${d.key}-desde`);
    const hasta  = container.querySelector(`#${p}-he-dia-${d.key}-hasta`);
    if (!chk) return;
    chk.addEventListener('change', () => {
      desde.disabled = !chk.checked;
      hasta.disabled = !chk.checked;
      actualizarResumenHE();
    });
    desde.addEventListener('input', actualizarResumenHE);
    hasta.addEventListener('input', actualizarResumenHE);
  });

  ['he-jornada-diaria', 'he-jornada-semanal', 'he-semanas'].forEach(id => {
    const el = container.querySelector(`#${p}-${id}`);
    if (el) el.addEventListener('input', actualizarResumenHE);
  });

  const feriadosList = container.querySelector(`#${p}-he-feriados-list`);
  const feriadosBtn  = container.querySelector(`#${p}-he-feriados-agregar`);
  if (feriadosBtn && feriadosList) {
    feriadosBtn.addEventListener('click', () => agregarFeriadoRow(feriadosList, actualizarResumenHE));
  }
}

// Lee y valida los campos renderizados por renderRubrosExtra(p), y devuelve
// { valid, conceptos, cctDetalle, cctIncluirDetalle } — conceptos con el mismo shape
// { label, monto, base, fundamento, esDescuento } que ya usan liquidacion.js y
// liquidacion-integral.js en sus arrays de conceptos. cctDetalle es la lista de meses
// válidos cargados (para el export separado), independientemente de si el detalle se
// incluye o no en el export principal (cctIncluirDetalle).
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

  // ── Diferencias salariales según CCT, mes a mes (hasta 24 meses) ────────
  const cctCheck = container.querySelector(`#${p}-cct-check`).checked;
  let cctDetalle = [];
  let cctIncluirDetalle = true;
  if (cctCheck) {
    const filas = leerFilasCCT(container, p);
    const filasError = filas.filter(f => f.error);
    const filasOk = filas.filter(f => !f.error);

    if (filasError.length > 0) {
      setError(`${p}-cct-meses-list`, `err-${p}-cct-meses-list`, 'Revisá los meses cargados: hay filas incompletas o inconsistentes (marcadas en rojo).');
      valid = false;
    } else if (filasOk.length === 0) {
      setError(`${p}-cct-meses-list`, `err-${p}-cct-meses-list`, 'Agregá al menos un mes con ambas remuneraciones.');
      valid = false;
    } else {
      cctDetalle = filasOk;
      cctIncluirDetalle = container.querySelector(`#${p}-cct-incluir-detalle`).checked;
      const fundamentoCCT = 'Corresponde el pago de las diferencias salariales resultantes del incorrecto encuadre convencional o categorización del/de la trabajador/a, calculadas mes a mes como la diferencia entre la remuneración prevista en el Convenio Colectivo de Trabajo aplicable y la efectivamente abonada (art. 74 LCT y ccdtes. del CCT de aplicación).';

      if (cctIncluirDetalle) {
        filasOk.forEach((f, i) => {
          conceptos.push({
            label: `Diferencia salarial CCT — ${formatearMes(f.mes)}`,
            monto: f.diferencia,
            base: `${fmt(f.remCCT)} − ${fmt(f.remAb)}`,
            fundamento: i === 0 ? fundamentoCCT : undefined,
          });
        });
      } else {
        const totalCCT = filasOk.reduce((acc, f) => acc + f.diferencia, 0);
        conceptos.push({
          label: `Diferencias salariales según CCT — total de ${filasOk.length} mes(es)`,
          monto: totalCCT,
          base: `Suma de diferencias mensuales de ${filasOk.length} mes(es) — detalle exportable por separado`,
          fundamento: fundamentoCCT,
        });
      }
    }
  }

  // ── Horas extra al 50% y al 100% (semana tipo × cantidad de semanas) ────
  const heCheck = container.querySelector(`#${p}-he-check`).checked;
  if (heCheck) {
    const datos = calcularExtrasTotales(container, p);
    if (datos.hayError) {
      setError(`${p}-he-dias`, `err-${p}-he-dias`, 'Revisá los horarios cargados: la hora de salida debe ser posterior a la de entrada en cada día tildado.');
      valid = false;
    } else if (datos.horasComunSemana === 0 && datos.horas100PorSemana === 0 && datos.horasFeriados === 0) {
      setError(`${p}-he-dias`, `err-${p}-he-dias`, 'Tildá al menos un día trabajado (con su horario) o cargá un feriado trabajado.');
      valid = false;
    } else if ((datos.horas50PorSemana > 0 || datos.horas100PorSemana > 0) && (!datos.semanas || datos.semanas <= 0)) {
      setError(`${p}-he-semanas`, `err-${p}-he-semanas`, 'Ingresá la cantidad de semanas del período reclamado.');
      valid = false;
    } else {
      const valorHoraStr = container.querySelector(`#${p}-he-valorhora`).value;
      let valorHora = parseFloat(valorHoraStr);
      const valorHoraAuto = !valorHoraStr || isNaN(valorHora) || valorHora <= 0;
      if (valorHoraAuto) valorHora = remBase / 200;
      const valorHoraNota = valorHoraAuto ? ' [valor hora = rem / 200]' : '';

      if (datos.horas50Total > 0) {
        conceptos.push({
          label: `Horas extra al 50% — ${round2(datos.horas50Total)} hora(s) (semana tipo: ${round2(datos.horas50PorSemana)} hs × ${datos.semanas} semana(s))`,
          monto: datos.horas50Total * valorHora * 1.5,
          base: `${round2(datos.horas50Total)} hs × ${fmt(valorHora)}${valorHoraNota} × 150%`,
          fundamento: `Corresponde el pago de las horas suplementarias trabajadas en exceso de la jornada legal (arts. 196 y 197 LCT, y Ley 11.544 — ${datos.jornadaDiaria} hs diarias o ${datos.jornadaSemanal} hs semanales, lo que se alcance primero) en días comunes, incluido el sábado hasta las 13 horas, con el recargo del cincuenta por ciento (50%) previsto en el art. 201 LCT.`,
        });
      }
      if (datos.horas100Total > 0) {
        const detalleFeriados = datos.horasFeriados > 0 ? ` + ${round2(datos.horasFeriados)} hs de feriados trabajados` : '';
        conceptos.push({
          label: `Horas extra al 100% — ${round2(datos.horas100Total)} hora(s) (semana tipo: ${round2(datos.horas100PorSemana)} hs × ${datos.semanas} semana(s)${detalleFeriados})`,
          monto: datos.horas100Total * valorHora * 2,
          base: `${round2(datos.horas100Total)} hs × ${fmt(valorHora)}${valorHoraNota} × 200%`,
          fundamento: 'Corresponde el pago de las horas trabajadas en sábado después de las 13 horas, domingo y feriados, con el recargo del cien por ciento (100%) previsto en el art. 201 LCT, en tanto se trata de tiempo cuya prestación se encuentra prohibida por el art. 204 LCT (salvo excepciones del art. 203), por lo que reviste carácter suplementario desde la primera hora, sin necesidad de superar la jornada legal.',
        });
      }
    }
  }

  return { valid, conceptos, cctDetalle, cctIncluirDetalle };
}

// Exportación independiente del detalle de diferencias CCT (siempre completo, más allá
// de si se incluyó o no en el export principal de la liquidación).
export function exportarDetalleCCTPDF(tituloHerramienta, nombreTrabajador, cctDetalle) {
  const total = cctDetalle.reduce((acc, f) => acc + f.diferencia, 0);
  const filasHtml = cctDetalle.map(f => `
    <tr>
      <td>${formatearMes(f.mes)}</td>
      <td class="monto">${fmt(f.remCCT)}</td>
      <td class="monto">${fmt(f.remAb)}</td>
      <td class="monto">${fmt(f.diferencia)}</td>
    </tr>`).join('');
  const html = `
    ${nombreTrabajador ? `<div class="info-box"><strong>Trabajador:</strong> ${nombreTrabajador}</div>` : ''}
    <table>
      <thead><tr><th>Mes</th><th>Remuneración CCT</th><th>Remuneración abonada</th><th>Diferencia</th></tr></thead>
      <tbody>
        ${filasHtml}
        <tr class="total-row"><td>TOTAL</td><td></td><td></td><td class="monto">${fmt(total)}</td></tr>
      </tbody>
    </table>
    <div class="result-big">TOTAL DIFERENCIAS CCT: ${fmt(total)}</div>`;
  exportarPDF(`Detalle de diferencias salariales según CCT — ${tituloHerramienta}`, html);
}

export function exportarDetalleCCTCSV(nombreBase, cctDetalle) {
  const total = cctDetalle.reduce((acc, f) => acc + f.diferencia, 0);
  const filas = [
    ['Mes', 'Remuneración CCT ($)', 'Remuneración abonada ($)', 'Diferencia ($)'],
    ...cctDetalle.map(f => [formatearMes(f.mes), f.remCCT.toFixed(2), f.remAb.toFixed(2), f.diferencia.toFixed(2)]),
    ['TOTAL', '', '', total.toFixed(2)],
  ];
  exportarCSV(nombreBase, filas);
}
