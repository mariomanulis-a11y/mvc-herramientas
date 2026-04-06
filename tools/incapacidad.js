// Calculadora de Indemnización por Incapacidad Física
// Fórmula de renta constante no perpetua (valor presente de renta futura)
import { exportarPDF, exportarCSV } from './exportar.js';

export function initIncapacidad(container) {

  const fmt = n => n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ─── HTML ─────────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Calculadora de Indemnización por Incapacidad Física</h2>
      <p class="tool-subtitle">Fórmula de renta constante no perpetua</p>

      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="inc-caratula">Carátula (opcional)</label>
          <input type="text" id="inc-caratula" placeholder="Apellido c/ Empresa s/ Daños...">
        </div>
      </div>

      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="inc-nombre">Nombre del damnificado (opcional)</label>
          <input type="text" id="inc-nombre" placeholder="Ej: Juan Pérez">
        </div>
      </div>

      <div class="form-row">
        <div class="field-group">
          <label for="inc-edad">Edad al momento del accidente/hecho</label>
          <input type="number" id="inc-edad" min="1" max="69" step="1" placeholder="Ej: 35">
          <span class="field-hint" style="font-size:.75rem;color:var(--color-text-muted,#888)">Entre 1 y 69 años</span>
        </div>
        <div class="field-group">
          <label for="inc-ingreso">Ingreso mensual acreditado ($)</label>
          <input type="number" id="inc-ingreso" min="0" step="0.01" placeholder="0.00">
        </div>
      </div>

      <div class="form-row">
        <div class="field-group">
          <label for="inc-incapacidad">Porcentaje de incapacidad (%)</label>
          <input type="number" id="inc-incapacidad" min="0.01" max="100" step="0.01" placeholder="Ej: 15">
        </div>
        <div class="field-group">
          <label for="inc-tasa">Tasa de descuento (%)</label>
          <input type="number" id="inc-tasa" min="0.01" max="30" step="0.01" value="4">
          <span class="field-hint" style="font-size:.75rem;color:var(--color-text-muted,#888)">Default 4% (uso jurisprudencial)</span>
        </div>
      </div>

      <div class="form-row" style="margin-top:1rem">
        <button class="btn btn-primary" id="inc-btn-calcular">Calcular</button>
        <button class="btn btn-ghost" id="inc-btn-limpiar">Limpiar</button>
      </div>

      <div id="inc-resultado" style="display:none; margin-top:1.5rem"></div>

      <p class="tool-nota" style="margin-top:1.5rem;font-size:.8rem;color:var(--color-text-muted,#888);font-style:italic;border-top:1px solid var(--color-border,#e5e7eb);padding-top:.75rem">
        Fórmula actuarial de renta constante no perpetua. La tasa del 4% es de uso jurisprudencial frecuente pero puede variar según el tribunal.
      </p>
    </div>
  `;

  // ─── Referencias ─────────────────────────────────────────────────────────────
  const elEdad       = container.querySelector('#inc-edad');
  const elIngreso    = container.querySelector('#inc-ingreso');
  const elIncap      = container.querySelector('#inc-incapacidad');
  const elTasa       = container.querySelector('#inc-tasa');
  const elResultado  = container.querySelector('#inc-resultado');

  const validarCampo = (el, cond) => {
    el.classList.toggle('error', !cond);
    return cond;
  };

  // ─── Calcular ────────────────────────────────────────────────────────────────
  const calcular = () => {
    const edad      = parseFloat(elEdad.value);
    const ingreso   = parseFloat(elIngreso.value);
    const incapPct  = parseFloat(elIncap.value);
    const tasaPct   = parseFloat(elTasa.value);

    let ok = true;
    ok = validarCampo(elEdad,    !isNaN(edad)    && edad >= 1    && edad <= 69)   && ok;
    ok = validarCampo(elIngreso, !isNaN(ingreso) && ingreso > 0)                  && ok;
    ok = validarCampo(elIncap,   !isNaN(incapPct) && incapPct > 0 && incapPct <= 100) && ok;
    ok = validarCampo(elTasa,    !isNaN(tasaPct) && tasaPct > 0 && tasaPct <= 30) && ok;
    if (!ok) return;

    // Fórmula
    // A = ingreso_mensual × 13 (anualizado con SAC)
    const A = ingreso * 13;

    // n = 70 - edad
    const n = 70 - edad;

    // i = tasa / 100
    const i = tasaPct / 100;

    // Factor = [(1+i)^n - 1] / [i × (1+i)^n]
    const potencia = Math.pow(1 + i, n);
    const factor = (potencia - 1) / (i * potencia);

    // Resultado antes de incapacidad
    const antesIncap = A * factor;

    // Resultado final
    const resultado = antesIncap * (incapPct / 100);

    // Info adicional
    const caratula = container.querySelector('#inc-caratula').value.trim();
    const nombre   = container.querySelector('#inc-nombre').value.trim();

    elResultado.style.display = 'block';
    elResultado.innerHTML = `
      ${caratula ? `<p style="font-style:italic;color:var(--color-text-muted,#888);margin-bottom:.5rem">${caratula}</p>` : ''}
      ${nombre   ? `<p style="font-weight:500;margin-bottom:.75rem">Damnificado: ${nombre}</p>` : ''}

      <div class="display-box" style="margin-bottom:1rem">
        <h3 style="margin-top:0">Desarrollo paso a paso</h3>

        <table style="width:100%;border-collapse:collapse;font-size:.9rem">
          <tbody>
            <tr>
              <td style="padding:.45rem .6rem;color:var(--color-text-muted,#888);width:55%">
                <strong>1. Ingreso anualizado (A = ingreso × 13)</strong>
              </td>
              <td style="padding:.45rem .6rem;text-align:right;font-weight:600">$ ${fmt(A)}</td>
            </tr>
            <tr style="background:var(--color-surface-2,#f7f7f7)">
              <td style="padding:.45rem .6rem;color:var(--color-text-muted,#888)">
                <strong>2. Años de vida laboral restante (n = 70 − ${edad})</strong>
              </td>
              <td style="padding:.45rem .6rem;text-align:right;font-weight:600">${n} años</td>
            </tr>
            <tr>
              <td style="padding:.45rem .6rem;color:var(--color-text-muted,#888)">
                <strong>3. Tasa de descuento aplicada (i)</strong>
              </td>
              <td style="padding:.45rem .6rem;text-align:right;font-weight:600">${tasaPct.toFixed(2)}%</td>
            </tr>
            <tr style="background:var(--color-surface-2,#f7f7f7)">
              <td style="padding:.45rem .6rem;color:var(--color-text-muted,#888)">
                <strong>4. Factor de descuento [(1+i)ⁿ−1] / [i×(1+i)ⁿ]</strong>
                <br><small style="font-size:.75rem">(1+${tasaPct/100})^${n} = ${potencia.toFixed(6)}</small>
              </td>
              <td style="padding:.45rem .6rem;text-align:right;font-weight:600">${factor.toFixed(6)}</td>
            </tr>
            <tr>
              <td style="padding:.45rem .6rem;color:var(--color-text-muted,#888)">
                <strong>5. Valor presente total (A × Factor) — antes de incapacidad</strong>
              </td>
              <td style="padding:.45rem .6rem;text-align:right;font-weight:600">$ ${fmt(antesIncap)}</td>
            </tr>
            <tr style="background:var(--color-surface-2,#f7f7f7)">
              <td style="padding:.45rem .6rem;color:var(--color-text-muted,#888)">
                <strong>6. Porcentaje de incapacidad aplicado</strong>
              </td>
              <td style="padding:.45rem .6rem;text-align:right;font-weight:600">${incapPct.toFixed(2)}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="display-box large" style="text-align:center;padding:1.5rem;margin-bottom:1rem">
        <div style="font-size:.9rem;color:var(--color-text-muted,#888);margin-bottom:.25rem">INDEMNIZACIÓN POR INCAPACIDAD</div>
        <div style="font-size:2rem;font-weight:700;color:var(--color-primary,#2563eb)">$ ${fmt(resultado)}</div>
        <div style="font-size:.8rem;margin-top:.35rem;color:var(--color-text-muted,#888)">
          Edad: ${edad} años | Incapacidad: ${incapPct.toFixed(2)}% | n=${n} años | i=${tasaPct.toFixed(2)}%
        </div>
      </div>

      <div class="form-row" style="flex-wrap:wrap;gap:10px">
        <button class="btn btn-success" id="inc-btn-copiar">📋 Copiar resumen</button>
        <button class="btn btn-ghost"   id="inc-btn-pdf">📄 Exportar PDF</button>
        <button class="btn btn-ghost"   id="inc-btn-csv">📊 Exportar CSV</button>
      </div>
    `;

    // — Exportar PDF
    container.querySelector('#inc-btn-pdf').addEventListener('click', () => {
      const html = `
        ${caratula ? `<div class="info-box"><strong>Carátula:</strong> ${caratula}</div>` : ''}
        ${nombre   ? `<div class="info-box"><strong>Damnificado:</strong> ${nombre}</div>` : ''}
        <table>
          <thead><tr><th>Paso</th><th>Descripción</th><th style="text-align:right">Valor</th></tr></thead>
          <tbody>
            <tr><td>1</td><td>Ingreso mensual</td><td class="monto">$ ${fmt(ingreso)}</td></tr>
            <tr><td>1</td><td>Ingreso anualizado (× 13)</td><td class="monto">$ ${fmt(A)}</td></tr>
            <tr><td>2</td><td>Vida laboral restante (n = 70 − ${edad})</td><td class="monto">${n} años</td></tr>
            <tr><td>3</td><td>Tasa de descuento (i)</td><td class="monto">${tasaPct.toFixed(2)}%</td></tr>
            <tr><td>4</td><td>Factor de descuento [(1+i)ⁿ−1] / [i×(1+i)ⁿ]</td><td class="monto">${factor.toFixed(6)}</td></tr>
            <tr><td>5</td><td>Valor presente total (A × Factor)</td><td class="monto">$ ${fmt(antesIncap)}</td></tr>
            <tr><td>6</td><td>Porcentaje de incapacidad</td><td class="monto">${incapPct.toFixed(2)}%</td></tr>
            <tr class="total-row"><td colspan="2">INDEMNIZACIÓN POR INCAPACIDAD</td><td class="monto">$ ${fmt(resultado)}</td></tr>
          </tbody>
        </table>
        <div class="result-big">$ ${fmt(resultado)}</div>`;
      exportarPDF('Indemnización por Incapacidad Física', html);
    });

    // — Exportar CSV
    container.querySelector('#inc-btn-csv').addEventListener('click', () => {
      const csvFilas = [
        ['Parámetro', 'Valor'],
        ['Edad', edad],
        ['Ingreso mensual ($)', ingreso.toFixed(2)],
        ['Ingreso anualizado × 13 ($)', A.toFixed(2)],
        ['Vida laboral restante n (años)', n],
        ['Tasa de descuento i (%)', tasaPct.toFixed(2)],
        ['Factor de descuento', factor.toFixed(6)],
        ['Valor presente total ($)', antesIncap.toFixed(2)],
        ['Porcentaje de incapacidad (%)', incapPct.toFixed(2)],
        ['INDEMNIZACIÓN ($)', resultado.toFixed(2)],
        ['', ''],
        ['Carátula', caratula],
        ['Damnificado', nombre],
      ];
      exportarCSV('Incapacidad' + (nombre ? '_' + nombre : ''), csvFilas);
    });

    // — Copiar resumen
    container.querySelector('#inc-btn-copiar').addEventListener('click', () => {
      const texto = [
        caratula ? `CARÁTULA: ${caratula}` : '',
        nombre   ? `DAMNIFICADO: ${nombre}` : '',
        '=== INDEMNIZACIÓN POR INCAPACIDAD — RENTA CONSTANTE NO PERPETUA ===',
        '',
        `1. Ingreso mensual acreditado:   $ ${fmt(ingreso)}`,
        `   Ingreso anualizado (× 13):    $ ${fmt(A)}`,
        `2. Edad: ${edad} años  →  Vida laboral restante (n): ${n} años`,
        `3. Tasa de descuento (i): ${tasaPct.toFixed(2)}%`,
        `4. Factor de descuento: ${factor.toFixed(6)}`,
        `   [(1+${tasaPct/100})^${n} − 1] / [${tasaPct/100} × (1+${tasaPct/100})^${n}]`,
        `5. Valor presente total:         $ ${fmt(antesIncap)}`,
        `6. Incapacidad (${incapPct.toFixed(2)}%):`,
        '',
        `INDEMNIZACIÓN: $ ${fmt(resultado)}`,
      ].filter(l => l !== null && l !== undefined).join('\n');

      navigator.clipboard.writeText(texto).then(() => {
        const btn = container.querySelector('#inc-btn-copiar');
        const original = btn.textContent;
        btn.textContent = 'Copiado!';
        setTimeout(() => { btn.textContent = original; }, 2000);
      });
    });
  };

  // ─── Limpiar ─────────────────────────────────────────────────────────────────
  const limpiar = () => {
    container.querySelector('#inc-caratula').value = '';
    container.querySelector('#inc-nombre').value = '';
    elEdad.value = '';
    elIngreso.value = '';
    elIncap.value = '';
    elTasa.value = '4';
    [elEdad, elIngreso, elIncap, elTasa].forEach(el => el.classList.remove('error'));
    elResultado.style.display = 'none';
    elResultado.innerHTML = '';
  };

  container.querySelector('#inc-btn-calcular').addEventListener('click', calcular);
  container.querySelector('#inc-btn-limpiar').addEventListener('click', limpiar);

  return () => {
    container.querySelector('#inc-btn-calcular').removeEventListener('click', calcular);
    container.querySelector('#inc-btn-limpiar').removeEventListener('click', limpiar);
  };
}
