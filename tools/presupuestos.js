// Generador de Presupuestos — MVC Abogados
// Presupuestos diferenciados por tipo de trámite, con honorarios configurables:
// monto único (fijo + variable) o por 3 etapas propias de cada materia,
// cálculo manual o automático (% sobre un monto base), y equivalente en Jus
// arancelario (Ley 14.967).
import { exportarPDF } from './exportar.js';

export function initPresupuestos(container) {

  // ── Valor del Jus arancelario (Ley 14.967) ──────────────────────────────────
  // Vigente desde el 01/08/2026: $ 53.232 (Res. SCBA RP 873/26).
  // La SCBA lo actualiza periódicamente (bimestral) — VERIFICAR VIGENCIA antes de
  // usar. El campo queda editable para no depender de un valor fijo en el código.
  const JUS_VALOR_DEFAULT = 53232;

  // ── Configuración de ramas ──────────────────────────────────────────────────
  const RAMAS = {
    sucesiones: {
      label: 'Sucesiones',
      subtipos: { ab_intestato: 'Ab Intestato', testamentaria: 'Testamentaria' },
      campos: ['causante', 'fecha_fallecimiento', 'cant_herederos', 'bienes_registrables', 'conflicto_herederos', 'jurisdiccion'],
      alcance: (sub) => sub === 'testamentaria'
        ? 'Protocolización del testamento; inicio del juicio sucesorio testamentario; obtención de la declaratoria de herederos / aprobación formal del testamento; inscripción registral de los bienes a nombre de los herederos.'
        : 'Inicio del juicio sucesorio ab intestato; obtención de la declaratoria de herederos; inscripción registral de los bienes a nombre de los herederos.',
      etapas: (sub) => [
        'Inicio del sucesorio y declaratoria de herederos',
        sub === 'testamentaria' ? 'Protocolización del testamento y trámite hasta quedar firme' : 'Inventario y avalúo de bienes (si corresponde)',
        'Inscripción registral y adjudicación final de los bienes',
      ],
      baseDesc: 'Monto del acervo hereditario / valor de los bienes a adjudicar',
    },
    laboral_demandada: {
      label: 'Laboral — Representación de la parte demandada (empleadora)',
      subtipos: { caba: 'CABA / Justicia Nacional del Trabajo', pba: 'Provincia de Buenos Aires' },
      campos: ['empresa_cliente', 'actor_reclamante', 'instancia', 'monto_reclamado', 'cant_rubros', 'prueba_pericial'],
      alcance: (sub) => sub === 'pba'
        ? 'Comparecencia a la instancia de mediación previa obligatoria; contestación de demanda; ofrecimiento y producción de prueba; asistencia a la audiencia de vista de causa; seguimiento de la causa hasta sentencia definitiva o acuerdo homologado.'
        : 'Contestación de demanda; ofrecimiento y producción de prueba; asistencia a audiencias; alegato; seguimiento de la causa hasta sentencia definitiva o acuerdo homologado.',
      etapas: (sub) => sub === 'pba'
        ? [
            'Mediación previa',
            'Contestación de demanda',
            'Audiencia de vista de causa',
          ]
        : [
            'Contestación de demanda y etapa probatoria',
            'Alegato y sentencia de primera instancia',
            'Instancia recursiva (Cámara de Apelaciones)',
          ],
      baseDesc: 'Monto reclamado / monto de sentencia o acuerdo',
    },
    danios: {
      label: 'Daños y Perjuicios',
      subtipos: { consumidor: 'Derecho del Consumidor', transito: 'Accidentes de Tránsito' },
      campos: ['reclamante_danio', 'demandado_danio', 'monto_estimado_danio', 'instancia_previa', 'aseguradora'],
      alcance: (sub) => sub === 'transito'
        ? 'Gestión de la instancia de mediación prejudicial obligatoria (Ley 26.589); inicio de la demanda por daños y perjuicios derivados del accidente de tránsito; producción de prueba; seguimiento hasta sentencia o acuerdo.'
        : 'Reclamo administrativo previo ante COPREC / autoridad de Defensa del Consumidor (si correspondiera); inicio de la demanda por daños y perjuicios; producción de prueba; seguimiento hasta sentencia o acuerdo.',
      etapas: (sub) => [
        sub === 'transito' ? 'Mediación prejudicial obligatoria (Ley 26.589) y preparación de la demanda' : 'Reclamo administrativo previo (COPREC / Def. del Consumidor) y preparación de la demanda',
        'Etapa probatoria hasta el llamado de autos para sentencia',
        'Sentencia / acuerdo homologatorio y ejecución',
      ],
      baseDesc: 'Monto estimado de la demanda / monto de sentencia o acuerdo',
    },
  };

  // ── Campos específicos por rama (id único por campo) ────────────────────────
  const CAMPOS_CONFIG = [
    { id: 'causante',            label: 'Causante (nombre del fallecido)',            tipo: 'text' },
    { id: 'fecha_fallecimiento', label: 'Fecha de fallecimiento',                     tipo: 'date',   opcional: true },
    { id: 'cant_herederos',      label: 'Cantidad de herederos',                      tipo: 'entero', opcional: true },
    { id: 'bienes_registrables', label: 'Bienes registrables',                        tipo: 'text',   opcional: true, placeholder: 'Inmuebles, automotores, otros' },
    { id: 'conflicto_herederos', label: '¿Existe conflicto entre herederos?',         tipo: 'checkbox' },
    { id: 'jurisdiccion',        label: 'Juzgado / jurisdicción (opcional)',          tipo: 'text',   opcional: true },

    { id: 'empresa_cliente',     label: 'Empresa (cliente)',                          tipo: 'text',   placeholder: 'Empresa S.A.' },
    { id: 'actor_reclamante',    label: 'Actor / reclamante (opcional)',              tipo: 'text',   opcional: true },
    { id: 'instancia',           label: 'Instancia',                                  tipo: 'select', opciones: ['SECLO / Conciliación previa', 'Primera instancia', 'Cámara de Apelaciones'] },
    { id: 'monto_reclamado',     label: 'Monto reclamado aprox. (opcional)',          tipo: 'number', opcional: true },
    { id: 'cant_rubros',         label: 'Cantidad de rubros reclamados (opcional)',   tipo: 'entero', opcional: true },
    { id: 'prueba_pericial',     label: 'Prueba pericial estimada (opcional)',        tipo: 'text',   opcional: true, placeholder: 'Contable, médica, ninguna' },

    { id: 'reclamante_danio',      label: 'Reclamante (cliente)',                       tipo: 'text', placeholder: 'Nombre y apellido' },
    { id: 'demandado_danio',       label: 'Demandado / contraparte (opcional)',         tipo: 'text', opcional: true },
    { id: 'monto_estimado_danio',  label: 'Monto estimado de la demanda (opcional)',    tipo: 'number', opcional: true },
    { id: 'instancia_previa',      label: '¿Instancia previa (COPREC / mediación) iniciada?', tipo: 'checkbox' },
    { id: 'aseguradora',           label: 'Aseguradora identificada (aplica a tránsito)', tipo: 'text', opcional: true },
  ];

  const CAMPO_BY_ID = Object.fromEntries(CAMPOS_CONFIG.map(c => [c.id, c]));

  const fmtMoney = n => '$ ' + (Number(n) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtJus   = n => (Number(n) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Jus';

  // ── HTML ─────────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Generador de Presupuestos</h2>
      <p class="tool-desc">Presupuestos profesionales diferenciados por tipo de trámite</p>

      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="pr-rama">Tipo de presupuesto</label>
          <select id="pr-rama">
            ${Object.entries(RAMAS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
          </select>
        </div>
        <div class="field-group" style="flex:1" id="pr-subtipo-wrap">
          <label for="pr-subtipo">Subtipo</label>
          <select id="pr-subtipo"></select>
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del cliente</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group">
          <label for="pr-cliente">Cliente (a quien se le presupuesta)</label>
          <input type="text" id="pr-cliente" placeholder="Nombre y apellido / razón social">
        </div>
        <div class="field-group">
          <label for="pr-cliente-doc">DNI / CUIT (opcional)</label>
          <input type="text" id="pr-cliente-doc" placeholder="20-12345678-9">
        </div>
        <div class="field-group" style="grid-column:1/-1">
          <label for="pr-cliente-contacto">Contacto — email / teléfono (opcional)</label>
          <input type="text" id="pr-cliente-contacto" placeholder="cliente@email.com / 11-1234-5678">
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del caso</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px" id="pr-campos-caso">
        ${renderCampos()}
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Alcance del servicio</div>
      <div class="field-group">
        <label for="pr-alcance">Descripción del servicio incluido (editable)</label>
        <textarea id="pr-alcance" rows="3"></textarea>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Honorarios</div>

      <div class="form-row">
        <div class="field-group">
          <label for="pr-honor-modalidad">Modalidad</label>
          <select id="pr-honor-modalidad">
            <option value="unico">Monto único (fijo + variable)</option>
            <option value="etapas">Por etapas (3 etapas de la materia)</option>
          </select>
        </div>
        <div class="field-group">
          <label for="pr-honor-calculo">Cálculo</label>
          <select id="pr-honor-calculo">
            <option value="manual">Manual (montos cargados a mano)</option>
            <option value="automatico">Automático (% s/ monto base)</option>
          </select>
        </div>
      </div>

      <div class="form-row" id="pr-honor-base-wrap">
        <div class="field-group" style="flex:2">
          <label for="pr-honor-base-desc">Base de referencia del variable</label>
          <input type="text" id="pr-honor-base-desc" placeholder="Monto de la sentencia, acuerdo o monto recuperado">
        </div>
        <div class="field-group">
          <label for="pr-honor-base-monto">Monto base ($) — solo cálculo automático</label>
          <input type="number" id="pr-honor-base-monto" min="0" step="0.01" placeholder="0.00">
        </div>
        <div class="field-group">
          <label for="pr-jus-valor">Valor del Jus arancelario ($)</label>
          <input type="number" id="pr-jus-valor" min="0" step="0.01" value="${JUS_VALOR_DEFAULT}">
        </div>
      </div>

      <div id="pr-honor-filas"></div>

      <div id="pr-honor-totales" class="info-box-local" style="background:var(--color-bg);border:1px solid var(--color-input-border);border-radius:8px;padding:12px 16px;margin-top:8px;font-size:.9rem"></div>

      <div class="field-group" style="margin-top:10px">
        <label for="pr-honor-aclaraciones">Aclaraciones / limitaciones sobre los honorarios (opcional)</label>
        <textarea id="pr-honor-aclaraciones" rows="2" placeholder="Ej: el componente variable es estimado y se determinará en forma definitiva conforme al resultado del proceso."></textarea>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px;margin-top:16px">
        <div class="field-group">
          <label for="pr-forma-pago">Forma de pago</label>
          <select id="pr-forma-pago">
            <option value="Contado">Contado</option>
            <option value="Cuotas">En cuotas</option>
            <option value="Contra resultado / gestión de cobro">Contra resultado / gestión de cobro</option>
            <option value="A convenir">A convenir</option>
          </select>
        </div>
        <div class="field-group">
          <label for="pr-validez">Validez del presupuesto (días)</label>
          <input type="number" id="pr-validez" min="1" step="1" value="30">
        </div>
        <div class="field-group" style="grid-column:1/-1">
          <label for="pr-gastos">Gastos y aranceles estimados (opcional)</label>
          <textarea id="pr-gastos" rows="2" placeholder="Tasa de justicia, sellado, publicación de edictos, peritos, etc. No incluidos en el honorario."></textarea>
        </div>
      </div>

      <div class="field-group" style="margin-top:8px">
        <label for="pr-observaciones">Observaciones / exclusiones (opcional)</label>
        <textarea id="pr-observaciones" rows="2" placeholder="Ej: no incluye instancia recursiva ante Cámara / Corte."></textarea>
      </div>

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:16px">
        <button class="btn btn-primary" id="pr-generar">Generar presupuesto</button>
        <button class="btn btn-ghost"   id="pr-limpiar">Limpiar</button>
      </div>

      <div id="pr-resultado" style="display:none;margin-top:24px">
        <label for="pr-texto" style="font-weight:600;display:block;margin-bottom:6px">Texto generado (editable)</label>
        <textarea id="pr-texto" rows="18" style="width:100%;resize:vertical;font-family:inherit;font-size:.9rem;padding:12px;border:1px solid var(--color-border);border-radius:6px;background:#ffffff;color:#1a1a1a;line-height:1.6"></textarea>
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px">
          <button class="btn btn-success" id="pr-copiar">📋 Copiar texto</button>
          <button class="btn btn-ghost"   id="pr-pdf">📄 Exportar PDF</button>
          <button class="btn btn-ghost"   id="pr-reset-texto">Restablecer</button>
        </div>
      </div>

      <p style="margin-top:24px;font-size:.78rem;color:var(--color-muted);border-top:1px solid var(--color-border);padding-top:12px">
        Valor del Jus sugerido a modo de referencia — verificar la última acordada/resolución de la SCBA antes de emitir el presupuesto.
      </p>
    </div>`;

  function renderCampos() {
    return CAMPOS_CONFIG.map(c => `
      <div class="field-group" id="pr-wrap-${c.id}">
        ${c.tipo === 'checkbox'
          ? `<div class="check-row"><input type="checkbox" id="pr-${c.id}"><label for="pr-${c.id}">${c.label}</label></div>`
          : `<label for="pr-${c.id}">${c.label}</label>
             ${c.tipo === 'select'
                ? `<select id="pr-${c.id}">${c.opciones.map(o => `<option value="${o}">${o}</option>`).join('')}</select>`
                : `<input type="${c.tipo === 'entero' ? 'number' : c.tipo}" id="pr-${c.id}" placeholder="${c.placeholder || ''}"${c.tipo === 'number' ? ' min="0" step="0.01"' : ''}${c.tipo === 'entero' ? ' min="0" step="1"' : ''}>`
             }`
        }
      </div>`).join('');
  }

  // ── Referencias ────────────────────────────────────────────────────────────
  const selRama        = container.querySelector('#pr-rama');
  const selSubtipo      = container.querySelector('#pr-subtipo');
  const wrapSubtipo     = container.querySelector('#pr-subtipo-wrap');
  const taAlcance       = container.querySelector('#pr-alcance');
  const selModalidad    = container.querySelector('#pr-honor-modalidad');
  const selCalculo      = container.querySelector('#pr-honor-calculo');
  const inpBaseDesc     = container.querySelector('#pr-honor-base-desc');
  const inpBaseMonto    = container.querySelector('#pr-honor-base-monto');
  const inpJusValor     = container.querySelector('#pr-jus-valor');
  const divFilas        = container.querySelector('#pr-honor-filas');
  const divTotales      = container.querySelector('#pr-honor-totales');
  const taHonorAclaraciones = container.querySelector('#pr-honor-aclaraciones');
  const divRes          = container.querySelector('#pr-resultado');
  const textarea        = container.querySelector('#pr-texto');
  const btnGen          = container.querySelector('#pr-generar');
  const btnLimp         = container.querySelector('#pr-limpiar');
  const btnCop          = container.querySelector('#pr-copiar');
  const btnReset        = container.querySelector('#pr-reset-texto');

  let ultimoTextoGenerado = '';
  let ultimoResultadoHonorarios = null;
  let alcanceTocadoManualmente = false;

  taAlcance.addEventListener('input', () => { alcanceTocadoManualmente = true; });

  // ── Actualizar subtipo + campos visibles + alcance por defecto ─────────────
  function actualizarRama() {
    const ramaKey = selRama.value;
    const rama = RAMAS[ramaKey];

    if (rama.subtipos) {
      wrapSubtipo.style.display = '';
      selSubtipo.innerHTML = Object.entries(rama.subtipos).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
    } else {
      wrapSubtipo.style.display = 'none';
      selSubtipo.innerHTML = '';
    }

    CAMPOS_CONFIG.forEach(c => {
      const wrap = container.querySelector(`#pr-wrap-${c.id}`);
      if (!wrap) return;
      wrap.style.display = rama.campos.includes(c.id) ? '' : 'none';
    });

    inpBaseDesc.value = rama.baseDesc;
    actualizarAlcance();
    renderFilasHonorarios();
  }

  function actualizarAlcance() {
    if (alcanceTocadoManualmente) return;
    const ramaKey = selRama.value;
    const rama = RAMAS[ramaKey];
    const subtipoKey = rama.subtipos ? selSubtipo.value : null;
    taAlcance.value = rama.alcance(subtipoKey);
  }

  selRama.addEventListener('change', () => { alcanceTocadoManualmente = false; actualizarRama(); });
  selSubtipo.addEventListener('change', () => { alcanceTocadoManualmente = false; actualizarAlcance(); renderFilasHonorarios(); });

  // ── Honorarios: filas dinámicas (1 o 3) ─────────────────────────────────────
  function etiquetasFilas() {
    const ramaKey = selRama.value;
    const rama = RAMAS[ramaKey];
    const subtipoKey = rama.subtipos ? selSubtipo.value : null;
    return selModalidad.value === 'etapas'
      ? rama.etapas(subtipoKey)
      : ['Honorarios profesionales'];
  }

  function renderFilasHonorarios() {
    const etiquetas = etiquetasFilas();
    divFilas.innerHTML = `
      <table style="width:100%;border-collapse:collapse;margin-top:8px">
        <thead>
          <tr>
            <th style="text-align:left;padding:6px 8px;font-size:.75rem;color:var(--color-muted);text-transform:uppercase;letter-spacing:.04em">${selModalidad.value === 'etapas' ? 'Etapa' : 'Concepto'}</th>
            <th style="text-align:right;padding:6px 8px;font-size:.75rem;color:var(--color-muted);text-transform:uppercase;letter-spacing:.04em">Fijo ($)</th>
            <th style="text-align:right;padding:6px 8px;font-size:.75rem;color:var(--color-muted);text-transform:uppercase;letter-spacing:.04em">Variable (%)</th>
            <th style="text-align:right;padding:6px 8px;font-size:.75rem;color:var(--color-muted);text-transform:uppercase;letter-spacing:.04em">Total línea</th>
            <th style="text-align:right;padding:6px 8px;font-size:.75rem;color:var(--color-muted);text-transform:uppercase;letter-spacing:.04em">≈ Jus</th>
          </tr>
        </thead>
        <tbody>
          ${etiquetas.map((label, i) => `
            <tr>
              <td style="padding:6px 8px;font-size:.85rem">${label}</td>
              <td style="padding:4px 8px"><input type="number" min="0" step="0.01" class="pr-honor-fijo" data-i="${i}" placeholder="0.00" style="text-align:right"></td>
              <td style="padding:4px 8px"><input type="number" min="0" step="0.01" class="pr-honor-var" data-i="${i}" placeholder="0" style="text-align:right"></td>
              <td style="padding:6px 8px;text-align:right" class="pr-honor-total" data-i="${i}">$ 0,00</td>
              <td style="padding:6px 8px;text-align:right;color:var(--color-accent)" class="pr-honor-jus" data-i="${i}">0,00 Jus</td>
            </tr>`).join('')}
        </tbody>
      </table>`;

    divFilas.querySelectorAll('.pr-honor-fijo, .pr-honor-var').forEach(el =>
      el.addEventListener('input', recalcHonorarios));
    recalcHonorarios();
  }

  function actualizarVisibilidadBase() {
    container.querySelector('#pr-honor-base-monto').closest('.field-group').style.opacity =
      selCalculo.value === 'automatico' ? '1' : '.5';
    inpBaseMonto.disabled = selCalculo.value !== 'automatico';
  }

  // Aclara si el TOTAL GENERAL ya incluye el componente variable o si éste
  // queda pendiente de determinar, para evitar que se confunda con el total final.
  function notaTotalGeneral(h) {
    const hayPct = h.filas.some(f => f.pct > 0);
    if (!hayPct) return null;
    const hayVariableCalculado = h.totalVariable != null && h.totalVariable > 0;
    return hayVariableCalculado
      ? 'El total general consignado incluye tanto el componente fijo como el componente variable calculado sobre la base de referencia indicada.'
      : 'El total general consignado corresponde únicamente al componente fijo. El componente variable (porcentaje sobre la base de referencia) se determinará y adicionará conforme al resultado del proceso.';
  }

  function recalcHonorarios() {
    const etiquetas = etiquetasFilas();
    const calculoAuto = selCalculo.value === 'automatico';
    const baseMonto = parseFloat(inpBaseMonto.value) || 0;
    const jusValor = parseFloat(inpJusValor.value) || 0;

    let totalFijo = 0, totalVariable = 0, totalGeneral = 0;
    const filas = [];

    etiquetas.forEach((label, i) => {
      const elFijo = divFilas.querySelector(`.pr-honor-fijo[data-i="${i}"]`);
      const elVar  = divFilas.querySelector(`.pr-honor-var[data-i="${i}"]`);
      const fijo   = parseFloat(elFijo?.value) || 0;
      const pct    = parseFloat(elVar?.value) || 0;

      let variableMonto = null;
      if (calculoAuto && baseMonto > 0 && pct > 0) variableMonto = baseMonto * (pct / 100);

      const totalLinea = fijo + (variableMonto || 0);
      const jusLinea = jusValor > 0 ? totalLinea / jusValor : 0;

      totalFijo += fijo;
      totalVariable += variableMonto || 0;
      totalGeneral += totalLinea;

      const elTotal = divFilas.querySelector(`.pr-honor-total[data-i="${i}"]`);
      const elJus   = divFilas.querySelector(`.pr-honor-jus[data-i="${i}"]`);
      if (elTotal) elTotal.textContent = fmtMoney(totalLinea);
      if (elJus)   elJus.textContent = jusValor > 0 ? fmtJus(jusLinea) : '—';

      filas.push({ label, fijo, pct, variableMonto, totalLinea, jusLinea: jusValor > 0 ? jusLinea : null });
    });

    const jusTotal = jusValor > 0 ? totalGeneral / jusValor : 0;

    const resultado = {
      modalidad: selModalidad.value,
      calculo: selCalculo.value,
      baseDesc: inpBaseDesc.value.trim(),
      baseMonto,
      jusValor,
      filas,
      totalFijo, totalVariable: calculoAuto && baseMonto > 0 ? totalVariable : null, totalGeneral,
      jusTotal: jusValor > 0 ? jusTotal : null,
    };
    const nota = notaTotalGeneral(resultado);

    divTotales.innerHTML = `
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <span>Total fijo: <strong>${fmtMoney(totalFijo)}</strong></span>
        <span>Total variable${calculoAuto && baseMonto > 0 ? '' : ' (a determinar)'}: <strong>${calculoAuto && baseMonto > 0 ? fmtMoney(totalVariable) : '—'}</strong></span>
        <span>Total general: <strong>${fmtMoney(totalGeneral)}</strong></span>
        <span>Equivalente: <strong style="color:var(--color-accent)">${jusValor > 0 ? fmtJus(jusTotal) : '—'}</strong></span>
      </div>
      ${nota ? `<div style="margin-top:8px;font-size:.78rem;color:var(--color-muted);font-style:italic">${nota}</div>` : ''}`;

    ultimoResultadoHonorarios = resultado;
  }

  selModalidad.addEventListener('change', renderFilasHonorarios);
  selCalculo.addEventListener('change', () => { actualizarVisibilidadBase(); recalcHonorarios(); });
  inpBaseMonto.addEventListener('input', recalcHonorarios);
  inpJusValor.addEventListener('input', recalcHonorarios);

  actualizarRama();
  actualizarVisibilidadBase();

  // ── Generar ──────────────────────────────────────────────────────────────────
  btnGen.addEventListener('click', () => {
    const ramaKey = selRama.value;
    const rama = RAMAS[ramaKey];
    const subtipoKey = rama.subtipos ? selSubtipo.value : null;
    const subtipoLabel = subtipoKey ? rama.subtipos[subtipoKey] : null;

    const elCliente = container.querySelector('#pr-cliente');
    elCliente.classList.remove('error');
    if (!elCliente.value.trim()) { elCliente.classList.add('error'); return; }

    const detalles = [];
    rama.campos.forEach(id => {
      const cfg = CAMPO_BY_ID[id];
      const el = container.querySelector(`#pr-${id}`);
      if (!el) return;
      let valor;
      if (cfg.tipo === 'checkbox') {
        valor = el.checked ? 'Sí' : 'No';
      } else {
        valor = el.value.trim();
        if (cfg.tipo === 'date' && valor) {
          const p = valor.split('-');
          if (p.length === 3) valor = `${p[2]}/${p[1]}/${p[0]}`;
        }
        if (cfg.tipo === 'number' && valor) valor = fmtMoney(valor);
        if (cfg.tipo === 'entero' && valor) valor = String(Math.trunc(Number(valor)) || valor);
      }
      if (valor === '' && cfg.opcional) return;
      detalles.push({ label: cfg.label.replace(/\s*\(opcional\)/i, ''), valor: valor || '—' });
    });

    const cliente         = elCliente.value.trim();
    const clienteDoc       = container.querySelector('#pr-cliente-doc').value.trim();
    const clienteContacto  = container.querySelector('#pr-cliente-contacto').value.trim();
    const alcance          = taAlcance.value.trim();
    const formaPago        = container.querySelector('#pr-forma-pago').value;
    const gastos           = container.querySelector('#pr-gastos').value.trim();
    const validez          = container.querySelector('#pr-validez').value || '30';
    const observaciones    = container.querySelector('#pr-observaciones').value.trim();
    const fechaHoy          = new Date().toLocaleDateString('es-AR');
    const h = ultimoResultadoHonorarios;

    const tituloTramite = subtipoLabel ? `${rama.label} — ${subtipoLabel}` : rama.label;

    const lineasHonorarios = h.filas.map(f => {
      const partes = [`  ${f.label}: ${fmtMoney(f.fijo)} fijo`];
      if (f.pct > 0) partes.push(`+ ${f.pct}% s/ ${h.baseDesc || 'base a definir'}${f.variableMonto != null ? ` (≈ ${fmtMoney(f.variableMonto)})` : ' (a determinar)'}`);
      partes.push(`= ${fmtMoney(f.totalLinea)}${f.jusLinea != null ? ` ≈ ${fmtJus(f.jusLinea)}` : ''}`);
      return partes.join(' ');
    });

    const notaTotal = notaTotalGeneral(h);
    const honorAclaraciones = taHonorAclaraciones.value.trim();

    const lineas = [
      `PRESUPUESTO — ${tituloTramite}`,
      `Fecha de emisión: ${fechaHoy}`,
      '',
      'CLIENTE',
      `Nombre / razón social: ${cliente}`,
      clienteDoc ? `DNI / CUIT: ${clienteDoc}` : null,
      clienteContacto ? `Contacto: ${clienteContacto}` : null,
      '',
      'DATOS DEL CASO',
      ...detalles.map(d => `${d.label}: ${d.valor}`),
      '',
      'ALCANCE DEL SERVICIO',
      alcance,
      '',
      'HONORARIOS' + (h.modalidad === 'etapas' ? ' — POR ETAPAS' : ''),
      ...lineasHonorarios,
      `TOTAL GENERAL: ${fmtMoney(h.totalGeneral)}${h.jusTotal != null ? ` (≈ ${fmtJus(h.jusTotal)} — valor Jus: ${fmtMoney(h.jusValor)})` : ''}`,
      notaTotal ? notaTotal : null,
      honorAclaraciones ? `Aclaraciones sobre los honorarios: ${honorAclaraciones}` : null,
      `Forma de pago: ${formaPago}`,
      gastos ? `Gastos y aranceles estimados (no incluidos en el honorario): ${gastos}` : null,
      '',
      `VALIDEZ DE ESTE PRESUPUESTO: ${validez} días corridos desde la fecha de emisión.`,
      observaciones ? '' : null,
      observaciones ? 'OBSERVACIONES' : null,
      observaciones ? observaciones : null,
    ].filter(l => l !== null);

    const texto = lineas.join('\n');
    ultimoTextoGenerado = texto;
    textarea.value = texto;
    divRes.style.display = 'block';
    textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    textarea.dataset.titulo = tituloTramite;
    textarea.dataset.cliente = cliente;
    textarea.dataset.clienteDoc = clienteDoc;
    textarea.dataset.clienteContacto = clienteContacto;
    textarea.dataset.detalles = JSON.stringify(detalles);
    textarea.dataset.honorarios = JSON.stringify(h);
    textarea.dataset.honorAclaraciones = honorAclaraciones;
    textarea.dataset.formaPago = formaPago;
    textarea.dataset.gastos = gastos;
    textarea.dataset.validez = validez;
    textarea.dataset.observaciones = observaciones;
  });

  btnLimp.addEventListener('click', () => {
    container.querySelector('#pr-cliente').value = '';
    container.querySelector('#pr-cliente').classList.remove('error');
    container.querySelector('#pr-cliente-doc').value = '';
    container.querySelector('#pr-cliente-contacto').value = '';
    CAMPOS_CONFIG.forEach(c => {
      const el = container.querySelector(`#pr-${c.id}`);
      if (!el) return;
      if (c.tipo === 'checkbox') el.checked = false; else el.value = '';
    });
    selModalidad.value = 'unico';
    selCalculo.value = 'manual';
    inpBaseMonto.value = '';
    inpJusValor.value = JUS_VALOR_DEFAULT;
    taHonorAclaraciones.value = '';
    container.querySelector('#pr-forma-pago').value = 'Contado';
    container.querySelector('#pr-gastos').value = '';
    container.querySelector('#pr-validez').value = '30';
    container.querySelector('#pr-observaciones').value = '';
    alcanceTocadoManualmente = false;
    actualizarRama();
    actualizarVisibilidadBase();
    divRes.style.display = 'none';
    textarea.value = '';
    ultimoTextoGenerado = '';
  });

  btnCop.addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      const orig = btnCop.textContent;
      btnCop.textContent = 'Copiado ✓';
      setTimeout(() => { btnCop.textContent = orig; }, 2000);
    }).catch(() => { prompt('Copie el texto:', texto); });
  });

  btnReset.addEventListener('click', () => {
    if (ultimoTextoGenerado) textarea.value = ultimoTextoGenerado;
  });

  container.querySelector('#pr-pdf').addEventListener('click', () => {
    if (!ultimoTextoGenerado) return;
    const detalles = JSON.parse(textarea.dataset.detalles || '[]');
    const h = JSON.parse(textarea.dataset.honorarios || '{}');

    const filasHtml = (h.filas || []).map(f => `
      <tr>
        <td>${esc(f.label)}</td>
        <td class="monto">${fmtMoney(f.fijo)}</td>
        <td class="monto">${f.pct > 0 ? f.pct + '%' + (f.variableMonto != null ? ' (' + fmtMoney(f.variableMonto) + ')' : ' (a determinar)') : '—'}</td>
        <td class="monto">${fmtMoney(f.totalLinea)}</td>
        <td class="monto">${f.jusLinea != null ? fmtJus(f.jusLinea) : '—'}</td>
      </tr>`).join('');

    const html = `
      <div class="info-box">
        <strong>Cliente:</strong> ${esc(textarea.dataset.cliente)}
        ${textarea.dataset.clienteDoc ? ` — DNI/CUIT: ${esc(textarea.dataset.clienteDoc)}` : ''}
        ${textarea.dataset.clienteContacto ? `<br><strong>Contacto:</strong> ${esc(textarea.dataset.clienteContacto)}` : ''}
      </div>

      <table>
        <thead><tr><th colspan="2">Datos del caso</th></tr></thead>
        <tbody>
          ${detalles.map(d => `<tr><td>${esc(d.label)}</td><td>${esc(d.valor)}</td></tr>`).join('')}
        </tbody>
      </table>

      <div class="info-box"><strong>Alcance del servicio:</strong><br>${esc(taAlcance.value).replace(/\n/g, '<br>')}</div>

      <table>
        <thead><tr><th>${h.modalidad === 'etapas' ? 'Etapa' : 'Concepto'}</th><th style="text-align:right">Fijo</th><th style="text-align:right">Variable</th><th style="text-align:right">Total línea</th><th style="text-align:right">≈ Jus</th></tr></thead>
        <tbody>
          ${filasHtml}
          <tr class="total-row"><td>TOTAL GENERAL</td><td></td><td></td><td class="monto">${fmtMoney(h.totalGeneral)}</td><td class="monto">${h.jusTotal != null ? fmtJus(h.jusTotal) : '—'}</td></tr>
        </tbody>
      </table>
      <p class="nota">Base de referencia del variable: ${esc(h.baseDesc || '—')}${h.baseMonto ? ` — Monto base utilizado: ${fmtMoney(h.baseMonto)}` : ''}. Valor del Jus considerado: ${fmtMoney(h.jusValor || 0)} (verificar vigencia).</p>
      ${notaTotalGeneral(h) ? `<p class="nota"><strong>${esc(notaTotalGeneral(h))}</strong></p>` : ''}
      ${textarea.dataset.honorAclaraciones ? `<div class="info-box"><strong>Aclaraciones sobre los honorarios:</strong><br>${esc(textarea.dataset.honorAclaraciones).replace(/\n/g, '<br>')}</div>` : ''}

      <table>
        <tbody>
          <tr><td>Forma de pago</td><td>${esc(textarea.dataset.formaPago)}</td></tr>
          ${textarea.dataset.gastos ? `<tr><td>Gastos y aranceles estimados</td><td>${esc(textarea.dataset.gastos)}</td></tr>` : ''}
          <tr><td>Validez del presupuesto</td><td>${esc(textarea.dataset.validez)} días corridos desde la fecha de emisión</td></tr>
        </tbody>
      </table>

      ${textarea.dataset.observaciones ? `<div class="info-box"><strong>Observaciones:</strong><br>${esc(textarea.dataset.observaciones).replace(/\n/g, '<br>')}</div>` : ''}
    `;
    exportarPDF(`Presupuesto — ${textarea.dataset.titulo}`, html, { footer: '' });
  });

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
