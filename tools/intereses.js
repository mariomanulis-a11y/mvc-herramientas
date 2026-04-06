// Calculadora de Intereses Judiciales — Tasas BPBA (Provincia de Buenos Aires)
// Período 1: 6% anual (fallo Vera/doctrina civil)
// Período 2: Tasa pasiva digital plazo fijo 30 días BPBA
import { exportarPDF, exportarCSV } from './exportar.js';

export function initIntereses(container) {
  // ─── Tabla de tasas BPBA ────────────────────────────────────────────────────
  const TASAS_BPBA = [
    { desde: '2008-08-19', hasta: '2008-10-16', tasa: 12.00 },
    { desde: '2008-10-17', hasta: '2008-11-04', tasa: 15.00 },
    { desde: '2008-11-05', hasta: '2009-01-14', tasa: 17.50 },
    { desde: '2009-01-15', hasta: '2009-01-22', tasa: 15.75 },
    { desde: '2009-01-23', hasta: '2009-08-19', tasa: 14.50 },
    { desde: '2009-08-20', hasta: '2009-11-18', tasa: 14.00 },
    { desde: '2009-11-19', hasta: '2009-12-01', tasa: 12.00 },
    { desde: '2009-12-02', hasta: '2009-12-10', tasa: 11.00 },
    { desde: '2009-12-11', hasta: '2010-03-02', tasa:  9.50 },
    { desde: '2010-03-03', hasta: '2011-08-08', tasa: 10.00 },
    { desde: '2011-08-09', hasta: '2011-10-02', tasa: 10.50 },
    { desde: '2011-10-03', hasta: '2011-10-18', tasa: 12.00 },
    { desde: '2011-10-19', hasta: '2011-11-16', tasa: 14.00 },
    { desde: '2011-11-17', hasta: '2012-01-19', tasa: 16.00 },
    { desde: '2012-01-20', hasta: '2012-02-16', tasa: 15.50 },
    { desde: '2012-02-17', hasta: '2012-03-08', tasa: 14.50 },
    { desde: '2012-03-09', hasta: '2012-08-09', tasa: 14.00 },
    { desde: '2012-08-10', hasta: '2012-10-17', tasa: 14.75 },
    { desde: '2012-10-18', hasta: '2012-12-09', tasa: 15.00 },
    { desde: '2012-12-10', hasta: '2013-05-22', tasa: 15.50 },
    { desde: '2013-05-23', hasta: '2013-06-26', tasa: 15.75 },
    { desde: '2013-06-27', hasta: '2013-08-01', tasa: 16.00 },
    { desde: '2013-08-02', hasta: '2013-08-15', tasa: 16.25 },
    { desde: '2013-08-16', hasta: '2013-09-12', tasa: 17.00 },
    { desde: '2013-09-13', hasta: '2013-10-17', tasa: 17.50 },
    { desde: '2013-10-18', hasta: '2013-11-28', tasa: 17.75 },
    { desde: '2013-11-29', hasta: '2013-12-18', tasa: 18.10 },
    { desde: '2013-12-19', hasta: '2014-01-08', tasa: 18.60 },
    { desde: '2014-01-09', hasta: '2014-01-15', tasa: 19.50 },
    { desde: '2014-01-16', hasta: '2014-01-27', tasa: 20.00 },
    { desde: '2014-01-28', hasta: '2014-01-30', tasa: 21.00 },
    { desde: '2014-01-31', hasta: '2014-06-05', tasa: 23.75 },
    { desde: '2014-06-06', hasta: '2014-07-03', tasa: 23.25 },
    { desde: '2014-07-04', hasta: '2014-07-20', tasa: 23.00 },
    { desde: '2014-07-21', hasta: '2014-10-02', tasa: 22.25 },
    { desde: '2014-10-03', hasta: '2014-10-07', tasa: 20.50 },
    { desde: '2014-10-08', hasta: '2014-10-31', tasa: 22.89 },
    { desde: '2014-11-01', hasta: '2014-11-30', tasa: 23.32 },
    { desde: '2014-12-01', hasta: '2015-01-31', tasa: 23.37 },
    { desde: '2015-02-01', hasta: '2015-02-28', tasa: 23.35 },
    { desde: '2015-03-01', hasta: '2015-03-31', tasa: 23.30 },
    { desde: '2015-04-01', hasta: '2015-04-30', tasa: 23.06 },
    { desde: '2015-05-01', hasta: '2015-05-31', tasa: 22.83 },
    { desde: '2015-06-01', hasta: '2015-06-30', tasa: 22.76 },
    { desde: '2015-07-01', hasta: '2015-07-26', tasa: 22.59 },
    { desde: '2015-07-27', hasta: '2015-11-01', tasa: 23.58 },
    { desde: '2015-11-02', hasta: '2015-12-16', tasa: 26.32 },
    { desde: '2015-12-17', hasta: '2016-01-14', tasa: 30.00 },
    { desde: '2016-01-15', hasta: '2016-02-03', tasa: 27.00 },
    { desde: '2016-02-04', hasta: '2016-03-03', tasa: 25.25 },
    { desde: '2016-03-04', hasta: '2016-06-30', tasa: 27.00 },
    { desde: '2016-07-01', hasta: '2016-07-19', tasa: 25.00 },
    { desde: '2016-07-20', hasta: '2016-07-25', tasa: 24.00 },
    { desde: '2016-07-26', hasta: '2016-08-03', tasa: 23.50 },
    { desde: '2016-08-04', hasta: '2016-08-11', tasa: 22.50 },
    { desde: '2016-08-12', hasta: '2016-08-24', tasa: 22.00 },
    { desde: '2016-08-25', hasta: '2016-09-06', tasa: 21.25 },
    { desde: '2016-09-07', hasta: '2016-09-14', tasa: 20.75 },
    { desde: '2016-09-15', hasta: '2016-09-27', tasa: 20.25 },
    { desde: '2016-09-28', hasta: '2016-10-25', tasa: 20.00 },
    { desde: '2016-10-26', hasta: '2016-11-01', tasa: 19.50 },
    { desde: '2016-11-02', hasta: '2016-11-08', tasa: 19.00 },
    { desde: '2016-11-09', hasta: '2016-11-15', tasa: 18.75 },
    { desde: '2016-11-16', hasta: '2016-11-24', tasa: 18.50 },
    { desde: '2016-11-25', hasta: '2017-01-01', tasa: 18.00 },
    { desde: '2017-01-02', hasta: '2017-01-22', tasa: 17.75 },
    { desde: '2017-01-23', hasta: '2017-01-29', tasa: 17.50 },
    { desde: '2017-01-30', hasta: '2017-03-19', tasa: 17.25 },
    { desde: '2017-03-20', hasta: '2017-04-11', tasa: 17.00 },
    { desde: '2017-04-12', hasta: '2017-09-10', tasa: 16.75 },
    { desde: '2017-09-11', hasta: '2017-10-01', tasa: 17.25 },
    { desde: '2017-10-02', hasta: '2017-10-26', tasa: 18.00 },
    { desde: '2017-10-27', hasta: '2017-10-31', tasa: 18.50 },
    { desde: '2017-11-01', hasta: '2017-11-09', tasa: 19.50 },
    { desde: '2017-11-10', hasta: '2017-11-30', tasa: 21.00 },
    { desde: '2017-12-01', hasta: '2018-01-30', tasa: 22.50 },
    { desde: '2018-01-31', hasta: '2018-05-09', tasa: 22.00 },
    { desde: '2018-05-10', hasta: '2018-05-14', tasa: 24.00 },
    { desde: '2018-05-15', hasta: '2018-05-23', tasa: 26.00 },
    { desde: '2018-05-24', hasta: '2018-06-24', tasa: 27.00 },
    { desde: '2018-06-25', hasta: '2018-07-09', tasa: 30.00 },
    { desde: '2018-07-10', hasta: '2018-09-03', tasa: 32.00 },
    { desde: '2018-09-04', hasta: '2018-09-23', tasa: 37.00 },
    { desde: '2018-09-24', hasta: '2019-02-06', tasa: 42.00 },
    { desde: '2019-02-07', hasta: '2019-02-10', tasa: 38.50 },
    { desde: '2019-02-11', hasta: '2019-02-13', tasa: 35.00 },
    { desde: '2019-02-14', hasta: '2019-03-13', tasa: 32.00 },
    { desde: '2019-03-14', hasta: '2019-03-17', tasa: 34.00 },
    { desde: '2019-03-18', hasta: '2019-03-26', tasa: 36.00 },
    { desde: '2019-03-27', hasta: '2019-04-09', tasa: 39.00 },
    { desde: '2019-04-10', hasta: '2019-04-30', tasa: 41.00 },
    { desde: '2019-05-01', hasta: '2019-06-06', tasa: 43.00 },
    { desde: '2019-06-07', hasta: '2019-07-16', tasa: 46.00 },
    { desde: '2019-07-17', hasta: '2019-08-12', tasa: 44.00 },
    { desde: '2019-08-13', hasta: '2019-08-28', tasa: 48.00 },
    { desde: '2019-08-29', hasta: '2019-10-30', tasa: 53.00 },
    { desde: '2019-10-31', hasta: '2019-11-04', tasa: 50.00 },
    { desde: '2019-11-05', hasta: '2019-11-12', tasa: 46.00 },
    { desde: '2019-11-13', hasta: '2019-11-26', tasa: 44.50 },
    { desde: '2019-11-27', hasta: '2019-12-09', tasa: 43.00 },
    { desde: '2019-12-10', hasta: '2019-12-17', tasa: 41.00 },
    { desde: '2019-12-18', hasta: '2020-01-01', tasa: 40.00 },
    { desde: '2020-01-02', hasta: '2020-01-07', tasa: 38.00 },
    { desde: '2020-01-08', hasta: '2020-01-14', tasa: 36.50 },
    { desde: '2020-01-15', hasta: '2020-01-21', tasa: 35.00 },
    { desde: '2020-01-22', hasta: '2020-01-30', tasa: 34.00 },
    { desde: '2020-01-31', hasta: '2020-02-27', tasa: 33.00 },
    { desde: '2020-02-28', hasta: '2020-03-03', tasa: 31.00 },
    { desde: '2020-03-04', hasta: '2020-03-09', tasa: 29.00 },
    { desde: '2020-03-10', hasta: '2020-04-01', tasa: 28.00 },
    { desde: '2020-04-02', hasta: '2020-04-07', tasa: 27.00 },
    { desde: '2020-04-08', hasta: '2020-04-08', tasa: 25.00 },
    { desde: '2020-04-09', hasta: '2020-04-15', tasa: 22.00 },
    { desde: '2020-04-16', hasta: '2020-04-19', tasa: 20.00 },
    { desde: '2020-04-20', hasta: '2020-05-31', tasa: 26.60 },
    { desde: '2020-06-01', hasta: '2020-07-31', tasa: 30.02 },
    { desde: '2020-08-01', hasta: '2020-10-15', tasa: 33.06 },
    { desde: '2020-10-16', hasta: '2020-11-12', tasa: 34.00 },
    { desde: '2020-11-13', hasta: '2022-01-06', tasa: 37.00 },
    { desde: '2022-01-07', hasta: '2022-02-17', tasa: 39.00 },
    { desde: '2022-02-18', hasta: '2022-03-22', tasa: 41.50 },
    { desde: '2022-03-23', hasta: '2022-04-17', tasa: 43.50 },
    { desde: '2022-04-18', hasta: '2022-05-12', tasa: 46.00 },
    { desde: '2022-05-13', hasta: '2022-06-20', tasa: 48.00 },
    { desde: '2022-06-21', hasta: '2022-07-28', tasa: 53.00 },
    { desde: '2022-07-29', hasta: '2022-08-11', tasa: 61.00 },
    { desde: '2022-08-12', hasta: '2022-09-15', tasa: 69.50 },
    { desde: '2022-09-16', hasta: '2023-03-16', tasa: 75.00 },
    { desde: '2023-03-17', hasta: '2023-04-20', tasa: 78.00 },
    { desde: '2023-04-21', hasta: '2023-04-27', tasa: 81.00 },
    { desde: '2023-04-28', hasta: '2023-05-15', tasa: 91.00 },
    { desde: '2023-05-16', hasta: '2023-08-14', tasa: 97.00 },
    { desde: '2023-08-15', hasta: '2023-10-16', tasa: 118.00 },
    { desde: '2023-10-17', hasta: '2023-12-18', tasa: 133.00 },
    { desde: '2023-12-19', hasta: '2024-03-11', tasa: 110.00 },
    { desde: '2024-03-12', hasta: '2024-03-12', tasa:  75.00 },
    { desde: '2024-03-13', hasta: '2024-03-25', tasa:  70.00 },
    { desde: '2024-03-26', hasta: '2024-04-10', tasa:  50.00 },
    { desde: '2024-04-11', hasta: '2024-04-25', tasa:  60.00 },
    { desde: '2024-04-26', hasta: '2024-05-01', tasa:  50.00 },
    { desde: '2024-05-02', hasta: '2024-05-14', tasa:  40.00 },
    { desde: '2024-05-15', hasta: '2024-06-23', tasa:  30.00 },
    { desde: '2024-06-24', hasta: '2024-07-29', tasa:  33.00 },
    { desde: '2024-07-30', hasta: '2024-08-15', tasa:  35.00 },
    { desde: '2024-08-16', hasta: '2024-10-31', tasa:  36.50 },
    { desde: '2024-11-01', hasta: '2024-12-05', tasa:  33.50 },
    { desde: '2024-12-06', hasta: '2025-01-23', tasa:  30.50 },
    { desde: '2025-01-24', hasta: '2025-01-30', tasa:  29.50 },
    { desde: '2025-01-31', hasta: '2025-08-18', tasa:  38.50 },
    { desde: '2025-08-19', hasta: '2025-09-10', tasa:  47.50 },
    { desde: '2025-09-11', hasta: '2026-04-07', tasa:  51.00 },
  ];

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const parseDate = s => {
    if (!s) return null;
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const diffDays = (a, b) => {
    const ms = b - a;
    return Math.round(ms / 86400000);
  };

  const fmt = n => n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtDate = d => {
    if (!d) return '';
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Obtiene la tasa BPBA para una fecha dada
  const getTasaParaFecha = fecha => {
    const iso = fecha.toISOString().slice(0, 10);
    for (const t of TASAS_BPBA) {
      if (iso >= t.desde && iso <= t.hasta) return t.tasa;
    }
    // Fecha posterior al último registro
    return TASAS_BPBA[TASAS_BPBA.length - 1].tasa;
  };

  // Calcula sub-períodos BPBA entre dos fechas
  const calcularSubperiodosBPBA = (fechaInicio, fechaFin, capitalInicial) => {
    const subperiodos = [];
    let montoAcum = capitalInicial;
    let cursor = new Date(fechaInicio);

    while (cursor < fechaFin) {
      const isoHoy = cursor.toISOString().slice(0, 10);
      // Determinar hasta dónde aplica esta tasa
      let tasaActual = null;
      let finTasa = null;

      for (const t of TASAS_BPBA) {
        if (isoHoy >= t.desde && isoHoy <= t.hasta) {
          tasaActual = t.tasa;
          finTasa = parseDate(t.hasta);
          break;
        }
      }

      if (tasaActual === null) {
        // Fuera del rango superior: usar última tasa
        tasaActual = TASAS_BPBA[TASAS_BPBA.length - 1].tasa;
        finTasa = new Date(fechaFin);
      }

      // El sub-período termina en el mínimo entre fin de tasa y fecha de pago
      const finSubperiodo = new Date(Math.min(
        new Date(finTasa.getFullYear(), finTasa.getMonth(), finTasa.getDate() + 1).getTime(),
        fechaFin.getTime()
      ));

      const dias = diffDays(cursor, finSubperiodo);
      if (dias <= 0) break;

      const tasaDiaria = tasaActual / 100 / 365;
      const interesSub = montoAcum * tasaDiaria * dias;

      subperiodos.push({
        desde: new Date(cursor),
        hasta: new Date(finSubperiodo.getTime() - 86400000), // último día incluido
        tasa: tasaActual,
        dias,
        montoBase: montoAcum,
        interes: interesSub,
      });

      montoAcum += interesSub;
      cursor = new Date(finSubperiodo);
    }

    return { subperiodos, montoFinal: montoAcum };
  };

  // ─── HTML ─────────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Calculadora de Intereses Judiciales</h2>
      <p class="tool-subtitle">Tasas BPBA — Provincia de Buenos Aires</p>

      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="int-caratula">Carátula (opcional)</label>
          <input type="text" id="int-caratula" placeholder="Apellido c/ Empresa s/ Daños...">
        </div>
      </div>

      <div class="form-row">
        <div class="field-group">
          <label for="int-capital">Capital base ($)</label>
          <input type="number" id="int-capital" min="0" step="0.01" placeholder="0.00">
        </div>
      </div>

      <div class="form-row">
        <div class="field-group">
          <label for="int-fecha-hecho">Fecha hecho dañoso / mora</label>
          <input type="date" id="int-fecha-hecho">
        </div>
        <div class="field-group">
          <label for="int-fecha-det">Fecha determinación / sentencia</label>
          <input type="date" id="int-fecha-det">
        </div>
        <div class="field-group">
          <label for="int-fecha-pago">Fecha de pago / liquidación</label>
          <input type="date" id="int-fecha-pago">
        </div>
      </div>

      <div class="form-row" style="margin-top:1rem">
        <button class="btn btn-primary" id="int-btn-calcular">Calcular</button>
        <button class="btn btn-ghost" id="int-btn-limpiar">Limpiar</button>
      </div>

      <div id="int-resultado" style="display:none; margin-top:1.5rem"></div>
    </div>
  `;

  // ─── Referencias ─────────────────────────────────────────────────────────────
  const elCapital    = container.querySelector('#int-capital');
  const elFechaHecho = container.querySelector('#int-fecha-hecho');
  const elFechaDet   = container.querySelector('#int-fecha-det');
  const elFechaPago  = container.querySelector('#int-fecha-pago');
  const elResultado  = container.querySelector('#int-resultado');

  // ─── Validación visual ───────────────────────────────────────────────────────
  const validarCampo = (el, cond) => {
    el.classList.toggle('error', !cond);
    return cond;
  };

  // ─── Calcular ────────────────────────────────────────────────────────────────
  const calcular = () => {
    const capital    = parseFloat(elCapital.value);
    const fechaHecho = parseDate(elFechaHecho.value);
    const fechaDet   = parseDate(elFechaDet.value);
    const fechaPago  = parseDate(elFechaPago.value);

    let ok = true;
    ok = validarCampo(elCapital, !isNaN(capital) && capital > 0) && ok;
    ok = validarCampo(elFechaHecho, !!fechaHecho) && ok;
    ok = validarCampo(elFechaDet, !!fechaDet && fechaDet > fechaHecho) && ok;
    ok = validarCampo(elFechaPago, !!fechaPago && fechaPago >= fechaDet) && ok;
    if (!ok) return;

    // Período 1: 6% anual
    const diasP1 = diffDays(fechaHecho, fechaDet);
    const interesP1 = capital * 0.06 * (diasP1 / 365);
    const montoCapitalizado = capital + interesP1;

    // Período 2: BPBA
    const { subperiodos, montoFinal } = calcularSubperiodosBPBA(fechaDet, fechaPago, montoCapitalizado);
    const interesP2 = montoFinal - montoCapitalizado;
    const totalReclamar = capital + interesP1 + interesP2;

    // Carátula
    const caratula = container.querySelector('#int-caratula').value.trim();

    // ── Tabla sub-períodos ──
    const filasTabla = subperiodos.map(sp => `
      <tr>
        <td>${fmtDate(sp.desde)} — ${fmtDate(sp.hasta)}</td>
        <td style="text-align:center">${sp.tasa.toFixed(2)}%</td>
        <td style="text-align:center">${sp.dias}</td>
        <td style="text-align:right">$ ${fmt(sp.montoBase)}</td>
        <td style="text-align:right">$ ${fmt(sp.interes)}</td>
      </tr>
    `).join('');

    elResultado.style.display = 'block';
    elResultado.innerHTML = `
      ${caratula ? `<p style="font-style:italic;color:var(--color-text-muted,#888);margin-bottom:.75rem">${caratula}</p>` : ''}

      <div class="display-box" style="margin-bottom:1rem">
        <h3 style="margin-top:0">Período 1 — 6% anual (fallo Vera)</h3>
        <p>Capital original: <strong>$ ${fmt(capital)}</strong></p>
        <p>Desde: ${fmtDate(fechaHecho)} &nbsp;→&nbsp; Hasta: ${fmtDate(fechaDet)}</p>
        <p>Días: <strong>${diasP1}</strong></p>
        <p>Intereses período 1: <strong>$ ${fmt(interesP1)}</strong></p>
        <p>Monto capitalizado al inicio del Período 2: <strong>$ ${fmt(montoCapitalizado)}</strong></p>
      </div>

      <div class="display-box" style="margin-bottom:1rem">
        <h3 style="margin-top:0">Período 2 — Tasa pasiva digital BPBA</h3>
        <p>Desde: ${fmtDate(fechaDet)} &nbsp;→&nbsp; Hasta: ${fmtDate(fechaPago)}</p>
        <div style="overflow-x:auto;margin-top:.75rem">
          <table style="width:100%;border-collapse:collapse;font-size:.875rem">
            <thead>
              <tr style="background:var(--color-card,#162030)">
                <th style="text-align:left;padding:.4rem .6rem;color:var(--color-accent,#c9a84c);border-bottom:2px solid var(--color-accent,#c9a84c);font-size:.8rem;text-transform:uppercase;letter-spacing:.04em">Sub-período</th>
                <th style="padding:.4rem .6rem;color:var(--color-accent,#c9a84c);border-bottom:2px solid var(--color-accent,#c9a84c);font-size:.8rem;text-transform:uppercase;letter-spacing:.04em">Tasa anual</th>
                <th style="padding:.4rem .6rem;color:var(--color-accent,#c9a84c);border-bottom:2px solid var(--color-accent,#c9a84c);font-size:.8rem;text-transform:uppercase;letter-spacing:.04em">Días</th>
                <th style="text-align:right;padding:.4rem .6rem;color:var(--color-accent,#c9a84c);border-bottom:2px solid var(--color-accent,#c9a84c);font-size:.8rem;text-transform:uppercase;letter-spacing:.04em">Monto base</th>
                <th style="text-align:right;padding:.4rem .6rem;color:var(--color-accent,#c9a84c);border-bottom:2px solid var(--color-accent,#c9a84c);font-size:.8rem;text-transform:uppercase;letter-spacing:.04em">Interés</th>
              </tr>
            </thead>
            <tbody>${filasTabla}</tbody>
          </table>
        </div>
        <p style="margin-top:.75rem">Total intereses período 2: <strong>$ ${fmt(interesP2)}</strong></p>
      </div>

      <div class="display-box large" style="text-align:center;padding:1.5rem;margin-bottom:1rem">
        <div style="font-size:.9rem;color:var(--color-text-muted,#888);margin-bottom:.25rem">TOTAL A RECLAMAR</div>
        <div style="font-size:2rem;font-weight:700;color:var(--color-primary,#2563eb)">$ ${fmt(totalReclamar)}</div>
        <div style="font-size:.8rem;margin-top:.25rem;color:var(--color-text-muted,#888)">
          Capital $ ${fmt(capital)} + Int. P1 $ ${fmt(interesP1)} + Int. P2 $ ${fmt(interesP2)}
        </div>
      </div>

      <div class="form-row" style="flex-wrap:wrap;gap:10px">
        <button class="btn btn-success" id="int-btn-copiar">📋 Copiar resumen</button>
        <button class="btn btn-ghost"   id="int-btn-pdf">📄 Exportar PDF</button>
        <button class="btn btn-ghost"   id="int-btn-csv">📊 Exportar CSV</button>
      </div>
    `;

    // — Exportar PDF
    container.querySelector('#int-btn-pdf').addEventListener('click', () => {
      const filasHtml = subperiodos.map(sp => `
        <tr>
          <td>${fmtDate(sp.desde)} — ${fmtDate(sp.hasta)}</td>
          <td style="text-align:center">${sp.tasa.toFixed(2)}%</td>
          <td style="text-align:center">${sp.dias}</td>
          <td class="monto">$ ${fmt(sp.montoBase)}</td>
          <td class="monto">$ ${fmt(sp.interes)}</td>
        </tr>`).join('');
      const html = `
        ${caratula ? `<div class="info-box"><strong>Carátula:</strong> ${caratula}</div>` : ''}
        <div class="info-box">
          <strong>Capital original:</strong> $ ${fmt(capital)}<br>
          <strong>Período 1 (6% anual, fallo Vera):</strong> ${fmtDate(fechaHecho)} → ${fmtDate(fechaDet)} (${diasP1} días)<br>
          <strong>Intereses Período 1:</strong> $ ${fmt(interesP1)}<br>
          <strong>Monto capitalizado:</strong> $ ${fmt(montoCapitalizado)}
        </div>
        <p style="font-weight:700;margin:14px 0 6px">Período 2 — Tasa pasiva digital BPBA</p>
        <table>
          <thead><tr>
            <th>Sub-período</th><th>Tasa anual</th><th>Días</th><th>Monto base</th><th>Interés</th>
          </tr></thead>
          <tbody>${filasHtml}</tbody>
        </table>
        <div class="info-box"><strong>Intereses Período 2:</strong> $ ${fmt(interesP2)}</div>
        <div class="result-big">TOTAL: $ ${fmt(totalReclamar)}</div>`;
      exportarPDF('Liquidación de Intereses Judiciales — BPBA', html);
    });

    // — Exportar CSV
    container.querySelector('#int-btn-csv').addEventListener('click', () => {
      const filas = [
        ['Sub-período (desde)', 'Sub-período (hasta)', 'Tasa anual (%)', 'Días', 'Monto base ($)', 'Interés ($)'],
        ...subperiodos.map(sp => [
          fmtDate(sp.desde), fmtDate(sp.hasta),
          sp.tasa.toFixed(2), sp.dias,
          sp.montoBase.toFixed(2), sp.interes.toFixed(2),
        ]),
        ['', '', '', '', 'Capital original', capital.toFixed(2)],
        ['', '', '', '', 'Intereses P1 (6% anual)', interesP1.toFixed(2)],
        ['', '', '', '', 'Intereses P2 (BPBA)', interesP2.toFixed(2)],
        ['', '', '', '', 'TOTAL', totalReclamar.toFixed(2)],
      ];
      exportarCSV('Intereses_BPBA' + (caratula ? '_' + caratula : ''), filas);
    });

    // — Copiar resumen
    container.querySelector('#int-btn-copiar').addEventListener('click', () => {
      const lineasTabla = subperiodos.map(sp =>
        `  ${fmtDate(sp.desde)} – ${fmtDate(sp.hasta)} | ${sp.tasa.toFixed(2)}% anual | ${sp.dias} días | $ ${fmt(sp.interes)}`
      ).join('\n');

      const texto = [
        caratula ? `CARÁTULA: ${caratula}` : '',
        '=== LIQUIDACIÓN DE INTERESES — BPBA ===',
        '',
        'PERÍODO 1 — 6% anual (fallo Vera)',
        `  Capital original:        $ ${fmt(capital)}`,
        `  Desde: ${fmtDate(fechaHecho)}  Hasta: ${fmtDate(fechaDet)}`,
        `  Días: ${diasP1}`,
        `  Intereses período 1:     $ ${fmt(interesP1)}`,
        `  Monto capitalizado:      $ ${fmt(montoCapitalizado)}`,
        '',
        'PERÍODO 2 — Tasa pasiva digital BPBA',
        `  Desde: ${fmtDate(fechaDet)}  Hasta: ${fmtDate(fechaPago)}`,
        lineasTabla,
        `  Total intereses período 2: $ ${fmt(interesP2)}`,
        '',
        `TOTAL A RECLAMAR: $ ${fmt(totalReclamar)}`,
      ].filter(l => l !== null && l !== undefined && !(l === '' && caratula === '')).join('\n');

      navigator.clipboard.writeText(texto).then(() => {
        const btn = container.querySelector('#int-btn-copiar');
        const original = btn.textContent;
        btn.textContent = 'Copiado!';
        setTimeout(() => { btn.textContent = original; }, 2000);
      });
    });
  };

  // ─── Limpiar ─────────────────────────────────────────────────────────────────
  const limpiar = () => {
    container.querySelector('#int-caratula').value = '';
    elCapital.value = '';
    elFechaHecho.value = '';
    elFechaDet.value = '';
    elFechaPago.value = '';
    [elCapital, elFechaHecho, elFechaDet, elFechaPago].forEach(el => el.classList.remove('error'));
    elResultado.style.display = 'none';
    elResultado.innerHTML = '';
  };

  container.querySelector('#int-btn-calcular').addEventListener('click', calcular);
  container.querySelector('#int-btn-limpiar').addEventListener('click', limpiar);

  return () => {
    container.querySelector('#int-btn-calcular').removeEventListener('click', calcular);
    container.querySelector('#int-btn-limpiar').removeEventListener('click', limpiar);
  };
}
