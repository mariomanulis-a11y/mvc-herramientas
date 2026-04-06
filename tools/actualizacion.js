// Calculadora de Actualización Monetaria — IPC / CER / RIPTE
import { exportarPDF, exportarCSV } from './exportar.js';

export function initActualizacion(container) {

  const INDICES = {
    ipc:   { label: 'IPC (Índice de Precios al Consumidor)',            id: '148.3_INIVELNAL_DICI_M_26', freq: 'mensual' },
    cer:   { label: 'CER (Coeficiente de Estabilización de Referencia)', id: '94.2_CD_D_0_0_10',          freq: 'diario'  },
    ripte: { label: 'RIPTE (Rem. Imponible Prom. Trab. Estables)',      id: '158.1_REPTE_0_0_5',         freq: 'mensual' },
  };

  // ── HTML ───────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Actualización Monetaria</h2>
      <p class="tool-desc">IPC · CER · RIPTE — datos en tiempo real del API del Ministerio de Hacienda</p>

      <div class="form-row">
        <div class="field-group" style="flex:2">
          <label for="act-caratula">Carátula (opcional)</label>
          <input type="text" id="act-caratula" placeholder="Ej: García c/ Empresa S.A.">
        </div>
      </div>

      <div class="form-row">
        <div class="field-group">
          <label for="act-monto">Monto original ($)</label>
          <input type="number" id="act-monto" min="0" step="0.01" placeholder="0,00">
        </div>
        <div class="field-group">
          <label for="act-desde">Fecha de inicio</label>
          <input type="date" id="act-desde">
        </div>
        <div class="field-group">
          <label for="act-hasta">Fecha de fin</label>
          <input type="date" id="act-hasta">
        </div>
      </div>

      <div class="form-row" style="flex-wrap:wrap;gap:20px">
        <div class="field-group" style="flex:none">
          <label style="display:block;margin-bottom:8px;font-weight:600">Índices a aplicar</label>
          <label class="checkbox-label"><input type="checkbox" id="chk-ipc" checked> IPC mensual</label><br>
          <label class="checkbox-label"><input type="checkbox" id="chk-cer"> CER diario</label><br>
          <label class="checkbox-label"><input type="checkbox" id="chk-ripte"> RIPTE mensual</label>
        </div>
      </div>

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:8px">
        <button class="btn btn-primary" id="act-calcular">Calcular</button>
        <button class="btn btn-ghost"   id="act-limpiar">Limpiar</button>
      </div>

      <div id="act-loading" style="display:none;margin-top:20px;color:var(--color-muted)">
        Consultando API del Ministerio de Hacienda…
      </div>

      <div id="act-resultado" style="display:none;margin-top:24px"></div>

      <p style="margin-top:24px;font-size:.78rem;color:var(--color-muted);border-top:1px solid var(--color-border);padding-top:12px">
        Los datos se obtienen en tiempo real del API del Ministerio de Hacienda.
        Puede haber demoras en la actualización de los índices más recientes.
      </p>
    </div>`;

  // ── Referencias ────────────────────────────────────────────────────────────
  const inCaratula = container.querySelector('#act-caratula');
  const inMonto    = container.querySelector('#act-monto');
  const inDesde    = container.querySelector('#act-desde');
  const inHasta    = container.querySelector('#act-hasta');
  const chkIpc     = container.querySelector('#chk-ipc');
  const chkCer     = container.querySelector('#chk-cer');
  const chkRipte   = container.querySelector('#chk-ripte');
  const btnCalc    = container.querySelector('#act-calcular');
  const btnLimp    = container.querySelector('#act-limpiar');
  const divLoad    = container.querySelector('#act-loading');
  const divRes     = container.querySelector('#act-resultado');

  // ── Helpers ────────────────────────────────────────────────────────────────
  function fmt(n) { return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function fmtCoef(n) { return n.toFixed(6); }

  function isoMes(dateStr) {
    // Devuelve YYYY-MM-01 (primer día del mes)
    return dateStr.substring(0, 7) + '-01';
  }

  async function fetchSerie(serieId, fechaDesde, fechaHasta) {
    // Para mensuales usamos primer día del mes; para diarios la fecha exacta
    const url = `https://apis.datos.gob.ar/series/api/series/?ids=${encodeURIComponent(serieId)}&start_date=${fechaDesde}&end_date=${fechaHasta}&format=json&limit=5000`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status} al consultar ${serieId}`);
    const json = await resp.json();
    if (!json.data || json.data.length === 0) throw new Error(`Sin datos para ${serieId} en el período solicitado.`);
    return json.data; // array de [fecha_iso, valor]
  }

  function valorMasCercano(data, fechaObj, anterior) {
    // data: [[fecha_str, valor], ...]
    // anterior=true => busca el último dato <= fecha; false => busca el primero >= fecha
    const ts = fechaObj.getTime();
    const parsed = data.map(([f, v]) => ({ t: new Date(f).getTime(), v })).filter(x => x.v !== null);
    if (parsed.length === 0) return null;
    if (anterior) {
      const candidatos = parsed.filter(x => x.t <= ts);
      if (candidatos.length === 0) return parsed[0].v;
      return candidatos[candidatos.length - 1].v;
    } else {
      const candidatos = parsed.filter(x => x.t >= ts);
      if (candidatos.length === 0) return parsed[parsed.length - 1].v;
      return candidatos[0].v;
    }
  }

  // ── Cálculo ────────────────────────────────────────────────────────────────
  btnCalc.addEventListener('click', async () => {
    // Validar
    let ok = true;
    [inMonto, inDesde, inHasta].forEach(el => el.classList.remove('error'));
    const monto = parseFloat(inMonto.value);
    if (!inMonto.value || isNaN(monto) || monto <= 0) { inMonto.classList.add('error'); ok = false; }
    if (!inDesde.value) { inDesde.classList.add('error'); ok = false; }
    if (!inHasta.value) { inHasta.classList.add('error'); ok = false; }
    if (ok && inDesde.value >= inHasta.value) {
      inDesde.classList.add('error'); inHasta.classList.add('error'); ok = false;
    }
    const seleccionados = [
      chkIpc.checked   ? 'ipc'   : null,
      chkCer.checked   ? 'cer'   : null,
      chkRipte.checked ? 'ripte' : null,
    ].filter(Boolean);
    if (!ok || seleccionados.length === 0) {
      if (seleccionados.length === 0) {
        divRes.innerHTML = `<div class="display-box" style="color:var(--color-danger,#dc3545)">Seleccioná al menos un índice.</div>`;
        divRes.style.display = 'block';
      }
      return;
    }

    divLoad.style.display = 'block';
    divRes.style.display = 'none';
    divRes.innerHTML = '';

    const fechaDesdeObj = new Date(inDesde.value + 'T00:00:00');
    const fechaHastaObj = new Date(inHasta.value + 'T00:00:00');
    // Para la API: pedimos un rango un poco más amplio para mensuales
    const apiDesde = isoMes(inDesde.value);
    const apiHasta = inHasta.value;

    const resultados = [];

    for (const key of seleccionados) {
      const idx = INDICES[key];
      try {
        const data = await fetchSerie(idx.id, apiDesde, apiHasta);
        const vInicio = valorMasCercano(data, fechaDesdeObj, true);
        const vFin    = valorMasCercano(data, fechaHastaObj, false);
        if (vInicio === null || vFin === null) throw new Error('No se encontraron valores para el período.');
        const coef = vFin / vInicio;
        const montoActualizado = monto * coef;
        resultados.push({ key, label: idx.label, vInicio, vFin, coef, montoActualizado, error: null });
      } catch (e) {
        resultados.push({ key, label: idx.label, vInicio: null, vFin: null, coef: null, montoActualizado: null, error: e.message });
      }
    }

    divLoad.style.display = 'none';

    // ── Render ─────────────────────────────────────────────────────────────
    const caratula = inCaratula.value.trim();
    let html = '';

    if (caratula) {
      html += `<div style="font-size:.9rem;color:var(--color-muted);margin-bottom:12px"><strong>Carátula:</strong> ${caratula}</div>`;
    }
    html += `<div style="font-size:.85rem;color:var(--color-muted);margin-bottom:16px">
      Monto original: <strong>$ ${fmt(monto)}</strong> &nbsp;|&nbsp;
      Período: <strong>${inDesde.value}</strong> → <strong>${inHasta.value}</strong>
    </div>`;

    const exitosos = resultados.filter(r => r.error === null);

    resultados.forEach(r => {
      if (r.error) {
        html += `<div class="display-box" style="margin-bottom:12px;border-left:4px solid var(--color-danger,#dc3545)">
          <strong>${r.label}</strong><br>
          <span style="color:var(--color-danger,#dc3545)">Error: ${r.error}</span>
        </div>`;
      } else {
        html += `<div class="display-box large" style="margin-bottom:12px">
          <div style="font-size:.8rem;color:var(--color-muted);margin-bottom:6px">${r.label}</div>
          <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:baseline">
            <div>
              <div style="font-size:.75rem;color:var(--color-muted)">Valor inicio</div>
              <div style="font-size:1rem;font-weight:600">${fmtCoef(r.vInicio)}</div>
            </div>
            <div style="color:var(--color-muted)">→</div>
            <div>
              <div style="font-size:.75rem;color:var(--color-muted)">Valor fin</div>
              <div style="font-size:1rem;font-weight:600">${fmtCoef(r.vFin)}</div>
            </div>
            <div style="color:var(--color-muted)">×</div>
            <div>
              <div style="font-size:.75rem;color:var(--color-muted)">Coeficiente</div>
              <div style="font-size:1rem;font-weight:600">${fmtCoef(r.coef)}</div>
            </div>
            <div style="color:var(--color-muted)">=</div>
            <div>
              <div style="font-size:.75rem;color:var(--color-muted)">Monto actualizado</div>
              <div style="font-size:1.5rem;font-weight:700;color:var(--color-accent)">$ ${fmt(r.montoActualizado)}</div>
            </div>
          </div>
        </div>`;
      }
    });

    // Promedio si hay 2+ exitosos
    if (exitosos.length >= 2) {
      const promedio = exitosos.reduce((sum, r) => sum + r.montoActualizado, 0) / exitosos.length;
      const promCoef = exitosos.reduce((sum, r) => sum + r.coef, 0) / exitosos.length;
      html += `<div class="display-box large" style="margin-top:8px;border:2px solid var(--color-accent)">
        <div style="font-size:.8rem;color:var(--color-muted);margin-bottom:4px">Promedio de ${exitosos.length} índices</div>
        <div style="display:flex;gap:20px;align-items:baseline;flex-wrap:wrap">
          <div>
            <span style="font-size:.8rem;color:var(--color-muted)">Coef. promedio: </span>
            <strong>${fmtCoef(promCoef)}</strong>
          </div>
          <div>
            <span style="font-size:.8rem;color:var(--color-muted)">Monto promedio: </span>
            <span style="font-size:1.7rem;font-weight:700;color:var(--color-accent)">$ ${fmt(promedio)}</span>
          </div>
        </div>
      </div>`;
    }

    // Botones exportar
    html += `<div style="margin-top:16px;display:flex;flex-wrap:wrap;gap:10px">
      <button class="btn btn-ghost" id="act-copiar-res">📋 Copiar resumen</button>
      <button class="btn btn-ghost" id="act-pdf-res">📄 Exportar PDF</button>
      <button class="btn btn-ghost" id="act-csv-res">📊 Exportar CSV</button>
    </div>`;

    divRes.innerHTML = html;
    divRes.style.display = 'block';

    // Construir texto para copiar
    const resumenTexto = buildResumenTexto(caratula, monto, inDesde.value, inHasta.value, resultados, exitosos);
    divRes._resumen = resumenTexto;

    container.querySelector('#act-copiar-res').addEventListener('click', () => {
      navigator.clipboard.writeText(divRes._resumen).catch(() => {
        prompt('Copie el texto:', divRes._resumen);
      });
    });

    // — Exportar PDF
    container.querySelector('#act-pdf-res').addEventListener('click', () => {
      const filasHtml = resultados.map(r => r.error
        ? `<tr style="color:#c00"><td>${r.label}</td><td colspan="4">ERROR: ${r.error}</td></tr>`
        : `<tr>
            <td>${r.label}</td>
            <td style="text-align:right">${fmtCoef(r.vInicio)}</td>
            <td style="text-align:right">${fmtCoef(r.vFin)}</td>
            <td style="text-align:right">${fmtCoef(r.coef)}</td>
            <td style="text-align:right;font-weight:700">$ ${fmt(r.montoActualizado)}</td>
           </tr>`
      ).join('');
      const promHtml = exitosos.length >= 2
        ? `<div class="result-big">Promedio: $ ${fmt(exitosos.reduce((s, r) => s + r.montoActualizado, 0) / exitosos.length)}</div>` : '';
      const html = `
        ${caratula ? `<div class="info-box"><strong>Carátula:</strong> ${caratula}</div>` : ''}
        <div class="info-box">
          <strong>Monto original:</strong> $ ${fmt(monto)}<br>
          <strong>Período:</strong> ${inDesde.value} → ${inHasta.value}
        </div>
        <table>
          <thead><tr><th>Índice</th><th>Valor inicio</th><th>Valor fin</th><th>Coeficiente</th><th>Monto actualizado</th></tr></thead>
          <tbody>${filasHtml}</tbody>
        </table>
        ${promHtml}`;
      exportarPDF('Actualización Monetaria', html);
    });

    // — Exportar CSV
    container.querySelector('#act-csv-res').addEventListener('click', () => {
      const csvFilas = [
        ['Índice', 'Valor inicio', 'Valor fin', 'Coeficiente', 'Monto actualizado ($)'],
        ...resultados.map(r => r.error
          ? [r.label, 'ERROR', r.error, '', '']
          : [r.label, fmtCoef(r.vInicio), fmtCoef(r.vFin), fmtCoef(r.coef), r.montoActualizado.toFixed(2)]
        ),
        ['', '', '', '', ''],
        ['Monto original ($)', monto.toFixed(2), '', '', ''],
        ['Período desde', inDesde.value, '', '', ''],
        ['Período hasta', inHasta.value, '', '', ''],
        ['Carátula', caratula, '', '', ''],
      ];
      if (exitosos.length >= 2) {
        const prom = exitosos.reduce((s, r) => s + r.montoActualizado, 0) / exitosos.length;
        csvFilas.push(['Promedio actualizado ($)', prom.toFixed(2), '', '', '']);
      }
      exportarCSV('Actualizacion_Monetaria', csvFilas);
    });
  });

  function buildResumenTexto(caratula, monto, desde, hasta, resultados, exitosos) {
    let t = 'ACTUALIZACIÓN MONETARIA\n';
    if (caratula) t += `Carátula: ${caratula}\n`;
    t += `Monto original: $ ${fmt(monto)}\n`;
    t += `Período: ${desde} → ${hasta}\n\n`;
    resultados.forEach(r => {
      if (r.error) {
        t += `${r.label}: ERROR — ${r.error}\n`;
      } else {
        t += `${r.label}\n  Coeficiente: ${fmtCoef(r.coef)}  |  Monto: $ ${fmt(r.montoActualizado)}\n`;
      }
    });
    if (exitosos.length >= 2) {
      const prom = exitosos.reduce((s, r) => s + r.montoActualizado, 0) / exitosos.length;
      t += `\nPromedio (${exitosos.length} índices): $ ${fmt(prom)}\n`;
    }
    return t;
  }

  btnLimp.addEventListener('click', () => {
    inCaratula.value = '';
    inMonto.value = '';
    inDesde.value = '';
    inHasta.value = '';
    [inMonto, inDesde, inHasta].forEach(el => el.classList.remove('error'));
    divRes.style.display = 'none';
    divRes.innerHTML = '';
    divLoad.style.display = 'none';
  });
}
