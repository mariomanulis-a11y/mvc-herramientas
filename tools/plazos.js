// Calculadora de Plazos Procesales — CPCC Buenos Aires
export function initPlazos(container) {
  // ── Feriados nacionales fijos (MM-DD) ──────────────────────────────────────
  const FERIADOS_FIJOS = new Set([
    '01-01', '03-24', '04-02', '05-01', '05-25',
    '06-17', '06-20', '07-09', '08-17', '10-12',
    '11-20', '12-08', '12-25'
  ]);

  // Lista de plazos acumulados en la sesión
  const sesionPlazos = [];

  // ── HTML ───────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Calculadora de Plazos Procesales</h2>
      <p class="tool-desc">CPCC Buenos Aires — días hábiles, corridos y meses</p>

      <div class="form-row">
        <div class="field-group">
          <label for="pl-tipo">Tipo de plazo</label>
          <select id="pl-tipo">
            <option value="habiles">Días hábiles judiciales</option>
            <option value="corridos">Días corridos</option>
            <option value="meses">Meses</option>
          </select>
        </div>
        <div class="field-group">
          <label for="pl-fecha">Fecha de inicio (acto / notificación)</label>
          <input type="date" id="pl-fecha">
        </div>
        <div class="field-group">
          <label for="pl-cantidad">Cantidad</label>
          <input type="number" id="pl-cantidad" min="1" step="1" placeholder="Ej: 30">
        </div>
      </div>

      <div class="form-row">
        <div class="field-group" style="flex:2">
          <label for="pl-descripcion">Descripción del plazo (opcional)</label>
          <input type="text" id="pl-descripcion" placeholder="Ej: Contestación de demanda">
        </div>
        <div class="field-group" id="feria-wrapper" style="display:flex;align-items:flex-end;padding-bottom:4px">
          <label class="checkbox-label">
            <input type="checkbox" id="pl-feria" checked>
            Saltar feria judicial
          </label>
        </div>
      </div>

      <div class="form-row" style="justify-content:flex-start;gap:12px">
        <button class="btn btn-primary" id="pl-calcular">Calcular</button>
        <button class="btn btn-ghost" id="pl-limpiar">Limpiar</button>
      </div>

      <div id="pl-resultado" style="display:none"></div>

      <div id="pl-sesion-wrapper" style="display:none;margin-top:32px">
        <h3>Plazos de la sesión</h3>
        <div id="pl-sesion-lista"></div>
        <button class="btn btn-ghost" id="pl-sesion-copiar" style="margin-top:10px">Copiar resumen</button>
      </div>
    </div>`;

  // ── Referencias ────────────────────────────────────────────────────────────
  const selTipo      = container.querySelector('#pl-tipo');
  const inFecha      = container.querySelector('#pl-fecha');
  const inCantidad   = container.querySelector('#pl-cantidad');
  const inDesc       = container.querySelector('#pl-descripcion');
  const chkFeria     = container.querySelector('#pl-feria');
  const feriaWrapper = container.querySelector('#feria-wrapper');
  const divResult    = container.querySelector('#pl-resultado');
  const sesionWrap   = container.querySelector('#pl-sesion-wrapper');
  const sesionLista  = container.querySelector('#pl-sesion-lista');
  const btnCalc      = container.querySelector('#pl-calcular');
  const btnLimp      = container.querySelector('#pl-limpiar');
  const btnCopiar    = container.querySelector('#pl-sesion-copiar');

  // Mostrar/ocultar opción feria según tipo
  selTipo.addEventListener('change', () => {
    feriaWrapper.style.display = selTipo.value === 'habiles' ? 'flex' : 'none';
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  function pad2(n) { return String(n).padStart(2, '0'); }
  function fmtFecha(d) {
    return `${pad2(d.getDate())}/${pad2(d.getMonth()+1)}/${d.getFullYear()}`;
  }
  function diaSemana(d) {
    return ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'][d.getDay()];
  }
  function mmdd(d) {
    return `${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
  }

  function esFeriadoFijo(d) {
    return FERIADOS_FIJOS.has(mmdd(d));
  }

  function enFeriaEnero(d) {
    return d.getMonth() === 0 && d.getDate() >= 1 && d.getDate() <= 31;
  }

  function enFeriaJulio(d) {
    return d.getMonth() === 6 && d.getDate() >= 1 && d.getDate() <= 15;
  }

  function esNoHabil(d, saltarFeria) {
    const dow = d.getDay();
    if (dow === 0 || dow === 6) return true;         // fin de semana
    if (esFeriadoFijo(d)) return true;               // feriado nacional
    if (saltarFeria && (enFeriaEnero(d) || enFeriaJulio(d))) return true;
    return false;
  }

  // Avanza un día
  function siguienteDia(d) {
    const r = new Date(d);
    r.setDate(r.getDate() + 1);
    return r;
  }

  // ── Cálculos principales ───────────────────────────────────────────────────
  function calcularHabiles(inicio, cantidad, saltarFeria) {
    const saltados = [];
    let actual = new Date(inicio);
    let contados = 0;

    // El plazo empieza a correr desde el día SIGUIENTE al acto/notificación
    actual = siguienteDia(actual);

    while (contados < cantidad) {
      if (esNoHabil(actual, saltarFeria)) {
        saltados.push({ fecha: new Date(actual), motivo: motivoNoHabil(actual, saltarFeria) });
      } else {
        contados++;
      }
      if (contados < cantidad) actual = siguienteDia(actual);
    }
    return { vencimiento: actual, saltados };
  }

  function motivoNoHabil(d, saltarFeria) {
    const dow = d.getDay();
    if (dow === 0) return 'domingo';
    if (dow === 6) return 'sábado';
    if (esFeriadoFijo(d)) return 'feriado nacional';
    if (saltarFeria && enFeriaEnero(d)) return 'feria judicial enero';
    if (saltarFeria && enFeriaJulio(d)) return 'feria judicial julio';
    return 'no hábil';
  }

  function calcularCorridos(inicio, cantidad) {
    const r = new Date(inicio);
    r.setDate(r.getDate() + cantidad);
    return { vencimiento: r, saltados: [] };
  }

  function calcularMeses(inicio, cantidad) {
    const r = new Date(inicio);
    const mesObjetivo = r.getMonth() + cantidad;
    r.setMonth(mesObjetivo);
    // Si el día no existe en el mes destino, retroceder al último día del mes
    if (r.getMonth() !== ((mesObjetivo % 12 + 12) % 12)) {
      r.setDate(0); // último día del mes anterior
    }
    return { vencimiento: r, saltados: [] };
  }

  // Próxima fecha hábil si vence en día no hábil
  function proximaHabil(d, saltarFeria) {
    let r = new Date(d);
    while (esNoHabil(r, saltarFeria)) {
      r = siguienteDia(r);
    }
    return r;
  }

  // ── Render resultado ───────────────────────────────────────────────────────
  function renderResultado(res, tipo, saltarFeria, cantidad, fechaInicioStr, desc) {
    const { vencimiento, saltados } = res;
    const dow = diaSemana(vencimiento);
    const sf = saltarFeria && tipo === 'habiles';
    const esNoH = esNoHabil(vencimiento, sf);
    const proxHabil = esNoH ? proximaHabil(vencimiento, sf) : null;

    let html = `<div class="display-box large" style="margin-top:24px">`;
    html += `<div style="font-size:.8rem;color:var(--color-muted);margin-bottom:4px">Fecha de vencimiento${desc ? ' — ' + desc : ''}</div>`;
    html += `<div style="font-size:2rem;font-weight:700;color:var(--color-accent)">${fmtFecha(vencimiento)}</div>`;
    html += `<div style="margin-top:4px;color:var(--color-muted)">${dow.charAt(0).toUpperCase() + dow.slice(1)}</div>`;

    if (esNoH && proxHabil) {
      html += `<div style="margin-top:12px;padding:10px 14px;background:var(--color-warning-bg,#fff3cd);border:1px solid var(--color-warning,#ffc107);border-radius:6px;color:var(--color-warning-text,#856404)">
        ⚠️ Vence en ${dow} (${motivoNoHabil(vencimiento, sf)}).
        Próxima fecha hábil: <strong>${fmtFecha(proxHabil)}</strong> (${diaSemana(proxHabil)})
      </div>`;
    }

    html += `</div>`;

    // Datos del cálculo
    html += `<div class="display-box" style="margin-top:12px;font-size:.9rem">
      <strong>Inicio:</strong> ${fechaInicioStr} &nbsp;|&nbsp;
      <strong>Tipo:</strong> ${tipo === 'habiles' ? 'Días hábiles' : tipo === 'corridos' ? 'Días corridos' : 'Meses'} &nbsp;|&nbsp;
      <strong>Cantidad:</strong> ${cantidad}${tipo === 'habiles' && saltarFeria ? ' (con feria)' : ''}
    </div>`;

    // Días saltados
    if (saltados.length > 0) {
      html += `<div class="display-box" style="margin-top:12px">
        <strong>Días salteados (${saltados.length}):</strong>
        <ul style="margin:8px 0 0;padding-left:20px;font-size:.85rem;color:var(--color-muted)">
          ${saltados.map(s => `<li>${fmtFecha(s.fecha)} — ${s.motivo}</li>`).join('')}
        </ul>
      </div>`;
    }

    // Botón agregar al resumen
    html += `<div style="margin-top:16px">
      <button class="btn btn-success" id="pl-agregar">Agregar al resumen</button>
    </div>`;

    divResult.innerHTML = html;
    divResult.style.display = 'block';

    // Guardar datos para el botón
    divResult._datos = {
      desc: desc || 'Sin descripción',
      tipo,
      cantidad,
      fechaInicio: fechaInicioStr,
      vencimiento: fmtFecha(vencimiento),
      dow,
      advertencia: esNoH ? `(vence en ${dow}; próxima hábil: ${fmtFecha(proxHabil)})` : ''
    };

    container.querySelector('#pl-agregar').addEventListener('click', agregarAlResumen);
  }

  function agregarAlResumen() {
    const d = divResult._datos;
    if (!d) return;
    sesionPlazos.push({ ...d });
    renderSesion();
    container.querySelector('#pl-agregar').textContent = 'Agregado ✓';
    container.querySelector('#pl-agregar').disabled = true;
  }

  function renderSesion() {
    if (sesionPlazos.length === 0) {
      sesionWrap.style.display = 'none';
      return;
    }
    sesionWrap.style.display = 'block';
    sesionLista.innerHTML = sesionPlazos.map((p, i) => `
      <div class="display-box" style="margin-bottom:8px;font-size:.9rem">
        <strong>${i+1}. ${p.desc}</strong><br>
        Inicio: ${p.fechaInicio} | ${p.cantidad} ${p.tipo} → Vence: <strong>${p.vencimiento}</strong> (${p.dow})
        ${p.advertencia ? `<br><span style="color:var(--color-warning,#856404)">${p.advertencia}</span>` : ''}
      </div>`).join('');
  }

  // ── Eventos ────────────────────────────────────────────────────────────────
  btnCalc.addEventListener('click', () => {
    // Validación
    let ok = true;
    [inFecha, inCantidad].forEach(el => el.classList.remove('error'));

    if (!inFecha.value) { inFecha.classList.add('error'); ok = false; }
    const cant = parseInt(inCantidad.value, 10);
    if (!inCantidad.value || isNaN(cant) || cant < 1) {
      inCantidad.classList.add('error'); ok = false;
    }
    if (!ok) return;

    const tipo = selTipo.value;
    const inicio = new Date(inFecha.value + 'T00:00:00');
    const saltarFeria = chkFeria.checked;
    const desc = inDesc.value.trim();

    let res;
    if (tipo === 'habiles')   res = calcularHabiles(inicio, cant, saltarFeria);
    else if (tipo === 'corridos') res = calcularCorridos(inicio, cant);
    else                     res = calcularMeses(inicio, cant);

    renderResultado(res, tipo, saltarFeria, cant, fmtFecha(inicio), desc);
  });

  btnLimp.addEventListener('click', () => {
    inFecha.value = '';
    inCantidad.value = '';
    inDesc.value = '';
    [inFecha, inCantidad].forEach(el => el.classList.remove('error'));
    divResult.style.display = 'none';
    divResult.innerHTML = '';
  });

  btnCopiar.addEventListener('click', () => {
    if (!sesionPlazos.length) return;
    const texto = sesionPlazos.map((p, i) =>
      `${i+1}. ${p.desc}\n   Inicio: ${p.fechaInicio} | ${p.cantidad} ${p.tipo} → Vence: ${p.vencimiento} (${p.dow})${p.advertencia ? '\n   ' + p.advertencia : ''}`
    ).join('\n\n');
    navigator.clipboard.writeText('PLAZOS PROCESALES\n\n' + texto).catch(() => {
      prompt('Copie el texto:', 'PLAZOS PROCESALES\n\n' + texto);
    });
  });
}
