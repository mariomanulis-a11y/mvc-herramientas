// diagnostico-pyme.js — Diagnóstico Integral PYME (Laboral, RRHH, Compliance y Control Interno)
// Cuestionario tipo test (14 preguntas, 4 áreas) que produce un semáforo de riesgo por
// área y un plan de acción editable, con envío opcional al Generador de Presupuestos
// para convertir el plan de acción en una propuesta económica.
import { exportarPDF } from './exportar.js';

export function initDiagnosticoPyme(container) {

  const ABOGADOS = [
    { value: 'mario',   label: 'Mario Manulis' },
    { value: 'soledad', label: 'Soledad Velazquez' },
    { value: 'camila',  label: 'Camila Poggi' },
    { value: 'otro',    label: 'Otro/a' },
  ];

  const AREAS = {
    laboral:         { label: 'Laboral' },
    rrhh:            { label: 'Recursos Humanos' },
    compliance:      { label: 'Compliance' },
    control_interno: { label: 'Control Interno' },
  };

  // ── Cuestionario ──────────────────────────────────────────────────────────
  // Cada pregunta tiene 3 opciones con puntaje 2 (cumple) / 1 (parcial) / 0 (no cumple).
  const QUESTIONS = [
    { id: 'q1', area: 'laboral', texto: '¿Todo el personal se encuentra debidamente registrado (art. 7 y sgtes., Ley 24.013)?', opciones: [
      { score: 2, label: 'Sí, el 100% del personal está registrado' },
      { score: 1, label: 'Parcialmente — hay personal con registración deficiente' },
      { score: 0, label: 'No, hay personal no registrado' },
    ]},
    { id: 'q2', area: 'laboral', texto: '¿La totalidad del personal cuenta con cobertura de ART vigente?', opciones: [
      { score: 2, label: 'Sí, el 100% está cubierto' },
      { score: 1, label: 'Parcialmente — faltan altas o hay demoras' },
      { score: 0, label: 'No, no hay cobertura de ART' },
    ]},
    { id: 'q3', area: 'laboral', texto: '¿Los legajos del personal (contratos, recibos, exámenes preocupacionales, Libro art. 52 LCT) están completos y actualizados?', opciones: [
      { score: 2, label: 'Sí, completos y actualizados' },
      { score: 1, label: 'Parcialmente — hay documentación faltante o desactualizada' },
      { score: 0, label: 'No existen legajos organizados' },
    ]},
    { id: 'q4', area: 'laboral', texto: '¿Existe un control formal de jornada y de horas extra?', opciones: [
      { score: 2, label: 'Sí, con sistema de control auditable' },
      { score: 1, label: 'Control informal, sin sistema' },
      { score: 0, label: 'No hay control de jornada ni de horas extra' },
    ]},
    { id: 'q5', area: 'rrhh', texto: '¿Los procesos de selección e inducción de personal están formalizados?', opciones: [
      { score: 2, label: 'Sí, formalizados y documentados' },
      { score: 1, label: 'Existen pero de manera informal' },
      { score: 0, label: 'No hay proceso formal' },
    ]},
    { id: 'q6', area: 'rrhh', texto: '¿Las políticas de licencias y beneficios están escritas y comunicadas al personal?', opciones: [
      { score: 2, label: 'Sí, escritas y comunicadas' },
      { score: 1, label: 'Se comunican solo verbalmente' },
      { score: 0, label: 'No hay políticas definidas' },
    ]},
    { id: 'q7', area: 'rrhh', texto: '¿Se realizan evaluaciones de desempeño en forma periódica?', opciones: [
      { score: 2, label: 'Sí, en forma periódica' },
      { score: 1, label: 'Se hacen de manera esporádica' },
      { score: 0, label: 'No se realizan' },
    ]},
    { id: 'q8', area: 'compliance', texto: '¿Existe un Código de Ética / Conducta vigente y aplicado?', opciones: [
      { score: 2, label: 'Sí, vigente y efectivamente aplicado' },
      { score: 1, label: 'Existe pero no se aplica en la práctica' },
      { score: 0, label: 'No existe' },
    ]},
    { id: 'q9', area: 'compliance', texto: '¿Cuenta con un canal de denuncias (whistleblowing) implementado?', opciones: [
      { score: 2, label: 'Sí, formalizado y confidencial' },
      { score: 1, label: 'Existe algo informal (ej. hablar con un superior)' },
      { score: 0, label: 'No existe ningún canal' },
    ]},
    { id: 'q10', area: 'compliance', texto: '¿Las habilitaciones y registros sectoriales requeridos para la actividad están al día?', opciones: [
      { score: 2, label: 'Sí, todos vigentes' },
      { score: 1, label: 'Parcialmente — alguno vencido o pendiente de renovación' },
      { score: 0, label: 'No, están vencidos o se desconoce su estado' },
    ]},
    { id: 'q11', area: 'compliance', texto: '¿Cuenta con programa de prevención de lavado de activos, si la actividad la constituye en sujeto obligado ante la UIF (Ley 25.246)?', opciones: [
      { score: 2, label: 'Sí, programa vigente y actualizado' },
      { score: 1, label: 'Es sujeto obligado pero el programa está desactualizado o incompleto' },
      { score: 0, label: 'Es o podría ser sujeto obligado y no tiene programa (o no lo sabe)' },
    ]},
    { id: 'q12', area: 'control_interno', texto: '¿Existe segregación de funciones en el circuito de pagos y compras?', opciones: [
      { score: 2, label: 'Sí, funciones separadas entre distintas personas' },
      { score: 1, label: 'Segregación parcial' },
      { score: 0, label: 'No, una sola persona controla todo el circuito' },
    ]},
    { id: 'q13', area: 'control_interno', texto: '¿Se realizan conciliaciones bancarias/contables periódicas?', opciones: [
      { score: 2, label: 'Sí, mensuales' },
      { score: 1, label: 'Esporádicas' },
      { score: 0, label: 'No se realizan' },
    ]},
    { id: 'q14', area: 'control_interno', texto: '¿Existe un circuito formal de aprobación de gastos con niveles de autorización?', opciones: [
      { score: 2, label: 'Sí, formalizado por escrito' },
      { score: 1, label: 'Existe pero de manera informal' },
      { score: 0, label: 'No existe ningún circuito de aprobación' },
    ]},
  ];
  const QUESTION_BY_ID = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));

  // ── Catálogo de acciones sugeridas por pregunta, según el puntaje obtenido ──
  const ACCIONES = {
    q1: {
      0: { texto: 'Regularizar la registración del personal no registrado (art. 7 y sgtes., Ley 24.013), evaluando los regímenes de regularización vigentes.', prioridad: 'alta', plazo: '30 días' },
      1: { texto: 'Auditar los legajos con registración deficiente y regularizar diferencias salariales u horarias no reflejadas.', prioridad: 'media', plazo: '60 días' },
    },
    q2: {
      0: { texto: 'Contratar cobertura de ART para la totalidad del personal en forma inmediata (Ley 24.557) — la falta de cobertura genera responsabilidad directa del empleador.', prioridad: 'alta', plazo: '15 días' },
      1: { texto: 'Verificar la nómina asegurada ante la ART y regularizar las altas faltantes.', prioridad: 'media', plazo: '30 días' },
    },
    q3: {
      0: { texto: 'Reconstruir los legajos del personal (contratos, recibos, exámenes preocupacionales, Libro art. 52 LCT) para reducir el riesgo probatorio ante una eventual contingencia.', prioridad: 'alta', plazo: '60 días' },
      1: { texto: 'Completar y actualizar la documentación faltante en los legajos existentes.', prioridad: 'media', plazo: '60 días' },
    },
    q4: {
      0: { texto: 'Implementar un sistema de control horario y de registro de horas extra (Ley 11.544) para evitar contingencias por pago insuficiente.', prioridad: 'media', plazo: '60 días' },
      1: { texto: 'Formalizar el control de horas extra ya existente con un sistema auditable.', prioridad: 'baja', plazo: '90 días' },
    },
    q5: {
      0: { texto: 'Diseñar un proceso formal de selección e inducción de personal, con checklist de documentación a solicitar al ingreso.', prioridad: 'baja', plazo: '90 días' },
      1: { texto: 'Documentar por escrito el proceso de selección e inducción actualmente informal.', prioridad: 'baja', plazo: '90 días' },
    },
    q6: {
      0: { texto: 'Redactar y comunicar formalmente las políticas de licencias y beneficios (reglamento interno).', prioridad: 'media', plazo: '60 días' },
      1: { texto: 'Formalizar por escrito las políticas de licencias actualmente comunicadas solo verbalmente.', prioridad: 'baja', plazo: '90 días' },
    },
    q7: {
      0: { texto: 'Implementar un sistema de evaluación de desempeño periódico, vinculado a políticas de capacitación y promoción.', prioridad: 'baja', plazo: '90 días' },
      1: { texto: 'Formalizar la periodicidad de las evaluaciones de desempeño existentes.', prioridad: 'baja', plazo: '90 días' },
    },
    q8: {
      0: { texto: 'Redactar e implementar un Código de Ética y Conducta, con difusión y adhesión formal del personal.', prioridad: 'media', plazo: '60 días' },
      1: { texto: 'Reforzar la aplicación efectiva del Código de Ética existente (capacitación y seguimiento).', prioridad: 'baja', plazo: '90 días' },
    },
    q9: {
      0: { texto: 'Implementar un canal de denuncias (whistleblowing) confidencial, con protocolo de investigación interna.', prioridad: 'media', plazo: '60 días' },
      1: { texto: 'Formalizar el canal de denuncias informal existente, garantizando confidencialidad y protección al denunciante.', prioridad: 'baja', plazo: '90 días' },
    },
    q10: {
      0: { texto: 'Relevar y regularizar en forma urgente las habilitaciones y registros sectoriales vencidos o faltantes.', prioridad: 'alta', plazo: '30 días' },
      1: { texto: 'Elaborar un cronograma de vencimientos de habilitaciones y registros para evitar caducidades futuras.', prioridad: 'media', plazo: '60 días' },
    },
    q11: {
      0: { texto: 'Evaluar la condición de sujeto obligado ante la UIF (Ley 25.246) e implementar el programa de prevención de lavado de activos si correspondiera (oficial de cumplimiento, manual, reporte de operaciones sospechosas).', prioridad: 'alta', plazo: '60 días' },
      1: { texto: 'Actualizar el programa de prevención de lavado de activos existente conforme la normativa vigente de la UIF.', prioridad: 'media', plazo: '90 días' },
    },
    q12: {
      0: { texto: 'Redefinir el circuito de pagos y compras para segregar las funciones de solicitud, aprobación y pago entre distintas personas.', prioridad: 'alta', plazo: '60 días' },
      1: { texto: 'Reforzar los controles cruzados existentes en el circuito de pagos y compras.', prioridad: 'media', plazo: '90 días' },
    },
    q13: {
      0: { texto: 'Implementar conciliaciones bancarias y contables mensuales como control básico de control interno.', prioridad: 'media', plazo: '30 días' },
      1: { texto: 'Formalizar la periodicidad de las conciliaciones actualmente esporádicas.', prioridad: 'baja', plazo: '60 días' },
    },
    q14: {
      0: { texto: 'Diseñar un circuito formal de aprobación de gastos con niveles de autorización según monto.', prioridad: 'media', plazo: '60 días' },
      1: { texto: 'Formalizar por escrito los niveles de aprobación de gastos actualmente informales.', prioridad: 'baja', plazo: '90 días' },
    },
  };

  function nivelDe(pct) {
    if (pct >= 75) return { nivel: 'Verde', color: '#1f7a3d', bg: '#e8f4ea', borde: '#7ab88a' };
    if (pct >= 40) return { nivel: 'Amarillo', color: '#856404', bg: '#fff3cd', borde: '#ffc107' };
    return { nivel: 'Rojo', color: '#7a2020', bg: '#fdeaea', borde: '#d97a7a' };
  }

  let planCount = 0, planActivos = 0;
  const sugeridasAgregadas = new Set();
  const MAX_PLAN = 30;

  // ── HTML ──────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Diagnóstico Integral PYME</h2>
      <p class="tool-desc">Laboral, Recursos Humanos, Compliance y Control Interno — diagnóstico y plan de acción</p>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:8px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos de la empresa</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group"><label for="dp-empresa">Razón social</label><input type="text" id="dp-empresa" placeholder="Empresa S.A."></div>
        <div class="field-group"><label for="dp-cuit">CUIT (opcional)</label><input type="text" id="dp-cuit" placeholder="30-12345678-9"></div>
        <div class="field-group"><label for="dp-rubro">Rubro / actividad</label><input type="text" id="dp-rubro" placeholder="Comercio, industria, servicios..."></div>
        <div class="field-group"><label for="dp-empleados">Cantidad de empleados</label><input type="number" id="dp-empleados" min="0" step="1"></div>
        <div class="field-group"><label for="dp-forma-societaria">Forma societaria (opcional)</label><input type="text" id="dp-forma-societaria" placeholder="S.A., S.R.L., unipersonal..."></div>
        <div class="field-group"><label for="dp-contacto">Contacto (opcional)</label><input type="text" id="dp-contacto" placeholder="email / teléfono"></div>
        <div class="field-group"><label for="dp-fecha">Fecha del diagnóstico</label><input type="date" id="dp-fecha"></div>
        <div class="field-group"><label for="dp-abogado">Abogado/a que realiza el diagnóstico</label>
          <select id="dp-abogado">${ABOGADOS.map(a => `<option value="${a.value}">${a.label}</option>`).join('')}</select>
        </div>
      </div>

      ${Object.entries(AREAS).map(([areaKey, area]) => `
        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:20px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">${area.label}</div>
        ${QUESTIONS.filter(q => q.area === areaKey).map(q => `
          <div class="display-box" style="margin-bottom:10px">
            <p style="font-weight:600;margin:0 0 8px">${q.texto}</p>
            <div style="display:flex;flex-direction:column;gap:6px">
              ${q.opciones.map((o, i) => `
                <label style="display:flex;align-items:flex-start;gap:8px;font-weight:400;cursor:pointer">
                  <input type="radio" name="dp-${q.id}" value="${o.score}" style="width:auto;margin-top:3px" ${i === 0 ? '' : ''}>
                  <span>${o.label}</span>
                </label>`).join('')}
            </div>
          </div>`).join('')}
      `).join('')}

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:8px">
        <button class="btn btn-primary" id="dp-calcular">Calcular diagnóstico</button>
        <button class="btn btn-ghost"   id="dp-limpiar">Limpiar</button>
      </div>

      <div id="dp-diagnostico-resultado" style="display:none;margin-top:20px"></div>

      <div id="dp-plan-wrap" style="display:none">
        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:20px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Plan de acción</div>
        <div class="form-row" style="justify-content:flex-start;gap:12px;margin-bottom:10px">
          <button class="btn btn-ghost" id="dp-sugerir-plan" type="button">Sugerir líneas según el diagnóstico</button>
        </div>
        <div id="dp-plan-wrapper" style="display:flex;flex-direction:column;gap:8px"></div>
        <div class="form-row" style="justify-content:flex-start;margin-top:8px">
          <button class="btn btn-ghost" id="dp-add-plan" type="button">+ Agregar línea manual (máx. 30)</button>
        </div>

        <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:16px">
          <button class="btn btn-primary" id="dp-generar">Generar informe</button>
        </div>
      </div>

      <div id="dp-resultado" style="display:none;margin-top:24px">
        <label for="dp-texto" style="font-weight:600;display:block;margin-bottom:6px">Informe generado (editable)</label>
        <textarea id="dp-texto" rows="26" style="width:100%;resize:vertical;font-family:inherit;font-size:.88rem;padding:12px;border:1px solid var(--color-border);border-radius:6px;background:#ffffff;color:#1a1a1a;line-height:1.6"></textarea>
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px">
          <button class="btn btn-success" id="dp-copiar">📋 Copiar texto</button>
          <button class="btn btn-ghost"   id="dp-pdf">📄 Exportar PDF</button>
          <button class="btn btn-ghost"   id="dp-enviar">➡️ Enviar a Generador de Presupuestos</button>
        </div>
        <div id="dp-enviar-confirmacion" style="display:none;margin-top:10px"></div>
      </div>

      <p style="margin-top:24px;font-size:.78rem;color:var(--color-muted);border-top:1px solid var(--color-border);padding-top:12px">
        Diagnóstico orientativo en base a las respuestas cargadas. No constituye una auditoría ni un dictamen legal definitivo — verificar cada punto con la documentación real de la empresa.
      </p>
    </div>`;

  // ── Referencias ───────────────────────────────────────────────────────────
  const divDiagResultado = container.querySelector('#dp-diagnostico-resultado');
  const divPlanWrap = container.querySelector('#dp-plan-wrap');
  const wrapPlan = container.querySelector('#dp-plan-wrapper');
  const divRes = container.querySelector('#dp-resultado');
  const textarea = container.querySelector('#dp-texto');
  const divEnviarConf = container.querySelector('#dp-enviar-confirmacion');

  function val(id) { const el = container.querySelector(`#${id}`); return el ? el.value.trim() : ''; }
  function fmtFechaISO(iso) {
    if (!iso) return '';
    const p = iso.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
  }

  let ultimoDiagnostico = null;

  function leerRespuestas() {
    const respuestas = {};
    QUESTIONS.forEach(q => {
      const checked = container.querySelector(`input[name="dp-${q.id}"]:checked`);
      respuestas[q.id] = checked ? parseInt(checked.value, 10) : null;
    });
    return respuestas;
  }

  container.querySelector('#dp-calcular').addEventListener('click', () => {
    const respuestas = leerRespuestas();
    const sinResponder = QUESTIONS.filter(q => respuestas[q.id] === null);
    if (sinResponder.length) {
      divDiagResultado.style.display = 'block';
      divDiagResultado.innerHTML = `<div class="display-box" style="border-color:#d97a7a;color:#7a2020">
        Faltan responder ${sinResponder.length} pregunta(s) para calcular el diagnóstico.
      </div>`;
      divPlanWrap.style.display = 'none';
      return;
    }

    const porArea = {};
    let totalPuntos = 0, totalMax = 0;
    Object.keys(AREAS).forEach(areaKey => {
      const preguntasArea = QUESTIONS.filter(q => q.area === areaKey);
      const puntos = preguntasArea.reduce((acc, q) => acc + respuestas[q.id], 0);
      const max = preguntasArea.length * 2;
      const pct = max > 0 ? (puntos / max * 100) : 0;
      porArea[areaKey] = { puntos, max, pct };
      totalPuntos += puntos;
      totalMax += max;
    });
    const pctGlobal = totalMax > 0 ? (totalPuntos / totalMax * 100) : 0;

    ultimoDiagnostico = { respuestas, porArea, pctGlobal };

    const filasAreas = Object.entries(AREAS).map(([areaKey, area]) => {
      const a = porArea[areaKey];
      const n = nivelDe(a.pct);
      return `<tr>
        <td style="padding:6px 10px">${area.label}</td>
        <td style="padding:6px 10px;text-align:right">${a.puntos}/${a.max}</td>
        <td style="padding:6px 10px;text-align:right">${a.pct.toFixed(0)}%</td>
        <td style="padding:6px 10px;text-align:center"><span style="background:${n.bg};color:${n.color};border:1px solid ${n.borde};border-radius:4px;padding:2px 10px;font-weight:700">${n.nivel}</span></td>
      </tr>`;
    }).join('');

    const nGlobal = nivelDe(pctGlobal);
    divDiagResultado.style.display = 'block';
    divDiagResultado.innerHTML = `
      <div class="display-box">
        <strong>Diagnóstico por área</strong>
        <table style="width:100%;border-collapse:collapse;margin-top:8px">
          <thead><tr>
            <th style="text-align:left;padding:6px 10px;font-size:.75rem;color:var(--color-muted);text-transform:uppercase">Área</th>
            <th style="text-align:right;padding:6px 10px;font-size:.75rem;color:var(--color-muted);text-transform:uppercase">Puntaje</th>
            <th style="text-align:right;padding:6px 10px;font-size:.75rem;color:var(--color-muted);text-transform:uppercase">%</th>
            <th style="text-align:center;padding:6px 10px;font-size:.75rem;color:var(--color-muted);text-transform:uppercase">Nivel</th>
          </tr></thead>
          <tbody>${filasAreas}</tbody>
        </table>
        <div style="margin-top:14px;padding:10px 14px;background:${nGlobal.bg};border:1px solid ${nGlobal.borde};border-radius:6px;color:${nGlobal.color}">
          <strong>Score global: ${pctGlobal.toFixed(0)}% — Nivel ${nGlobal.nivel}</strong>
        </div>
      </div>`;

    divPlanWrap.style.display = 'block';
    divPlanWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // ── Plan de acción: lista dinámica ───────────────────────────────────────
  function crearFilaPlan({ accion = '', prioridad = 'media', plazo = '', responsable = '' } = {}) {
    if (planActivos >= MAX_PLAN) return;
    planCount++; planActivos++;
    const id = planCount;
    const div = document.createElement('div');
    div.className = 'display-box';
    div.id = `dp-plan-row-${id}`;
    div.innerHTML = `
      <div class="form-row">
        <div class="field-group" style="flex:4">
          <label>Acción</label>
          <textarea id="dp-plan-accion-${id}" rows="2" style="width:100%">${accion.replace(/</g, '&lt;')}</textarea>
        </div>
        <div class="field-group" style="flex:1">
          <label>Prioridad</label>
          <select id="dp-plan-prioridad-${id}">
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
        <div class="field-group" style="flex:1">
          <label>Plazo</label>
          <input type="text" id="dp-plan-plazo-${id}" placeholder="30 días" value="${plazo}">
        </div>
        <div class="field-group" style="flex:1">
          <label>Responsable</label>
          <select id="dp-plan-responsable-${id}">
            <option value="">Sin asignar</option>
            ${ABOGADOS.map(a => `<option value="${a.value}">${a.label}</option>`).join('')}
          </select>
        </div>
        <div class="field-group" style="flex:0;align-self:flex-end"><button class="btn btn-ghost" type="button" data-remove="${id}">✕</button></div>
      </div>`;
    wrapPlan.appendChild(div);
    container.querySelector(`#dp-plan-prioridad-${id}`).value = prioridad;
    if (responsable) container.querySelector(`#dp-plan-responsable-${id}`).value = responsable;
    div.querySelector('[data-remove]').addEventListener('click', () => { div.remove(); planActivos--; });
    return id;
  }

  container.querySelector('#dp-add-plan').addEventListener('click', () => crearFilaPlan());

  container.querySelector('#dp-sugerir-plan').addEventListener('click', () => {
    if (!ultimoDiagnostico) return;
    QUESTIONS.forEach(q => {
      const score = ultimoDiagnostico.respuestas[q.id];
      if (score === 2) return; // cumple, no requiere acción
      if (sugeridasAgregadas.has(q.id)) return;
      const accion = ACCIONES[q.id] && ACCIONES[q.id][score];
      if (!accion) return;
      crearFilaPlan({ accion: accion.texto, prioridad: accion.prioridad, plazo: accion.plazo });
      sugeridasAgregadas.add(q.id);
    });
  });

  function leerPlan() {
    return Array.from(wrapPlan.querySelectorAll('[id^="dp-plan-row-"]')).map(row => {
      const id = row.id.replace('dp-plan-row-', '');
      return {
        accion: container.querySelector(`#dp-plan-accion-${id}`)?.value.trim() || '',
        prioridad: container.querySelector(`#dp-plan-prioridad-${id}`)?.value || 'media',
        plazo: container.querySelector(`#dp-plan-plazo-${id}`)?.value.trim() || '',
        responsable: container.querySelector(`#dp-plan-responsable-${id}`)?.value || '',
      };
    }).filter(p => p.accion);
  }

  function responsableLabel(value) {
    const a = ABOGADOS.find(x => x.value === value);
    return a ? a.label : 'Sin asignar';
  }

  // ── Generar informe ───────────────────────────────────────────────────────
  container.querySelector('#dp-generar').addEventListener('click', () => {
    if (!ultimoDiagnostico) return;
    const plan = leerPlan();
    const abogadoLabel = container.querySelector('#dp-abogado').selectedOptions[0].textContent;

    const tablaAreas = Object.entries(AREAS).map(([areaKey, area]) => {
      const a = ultimoDiagnostico.porArea[areaKey];
      const n = nivelDe(a.pct);
      return `${area.label}: ${a.puntos}/${a.max} (${a.pct.toFixed(0)}%) — Nivel ${n.nivel}`;
    }).join('\n');

    const nGlobal = nivelDe(ultimoDiagnostico.pctGlobal);

    const planTexto = plan.length
      ? plan.map((p, i) => `${i + 1}. [${p.prioridad.toUpperCase()}] ${p.accion} — Plazo sugerido: ${p.plazo || 'a definir'} — Responsable: ${responsableLabel(p.responsable)}`).join('\n')
      : '- (sin líneas cargadas)';

    const detallePreguntas = QUESTIONS.map(q => {
      const score = ultimoDiagnostico.respuestas[q.id];
      const opcion = q.opciones.find(o => o.score === score);
      return `- ${q.texto}\n  Respuesta: ${opcion ? opcion.label : '-'}`;
    }).join('\n');

    const texto =
`DIAGNÓSTICO INTEGRAL PYME
${val('dp-empresa') || '-'}

DATOS DE LA EMPRESA
Razón social: ${val('dp-empresa') || '-'}
CUIT: ${val('dp-cuit') || '-'}
Rubro / actividad: ${val('dp-rubro') || '-'}
Cantidad de empleados: ${val('dp-empleados') || '-'}
Forma societaria: ${val('dp-forma-societaria') || '-'}
Contacto: ${val('dp-contacto') || '-'}
Fecha del diagnóstico: ${fmtFechaISO(val('dp-fecha')) || '-'}
Abogado/a interviniente: ${abogadoLabel}

DIAGNÓSTICO POR ÁREA
${tablaAreas}

SCORE GLOBAL: ${ultimoDiagnostico.pctGlobal.toFixed(0)}% — Nivel ${nGlobal.nivel}

DETALLE DE RESPUESTAS
${detallePreguntas}

PLAN DE ACCIÓN
${planTexto}

──────────────────────────────────────────────
Diagnóstico orientativo en base a las respuestas cargadas por la empresa/el/la cliente. No constituye una auditoría ni un dictamen legal definitivo.`;

    textarea.value = texto;
    divRes.style.display = 'block';
    divEnviarConf.style.display = 'none';
    textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  container.querySelector('#dp-limpiar').addEventListener('click', () => {
    container.querySelectorAll('input[type="text"], input[type="number"], input[type="date"]').forEach(el => el.value = '');
    container.querySelectorAll('input[type="radio"]').forEach(el => el.checked = false);
    container.querySelector('#dp-abogado').selectedIndex = 0;
    divDiagResultado.style.display = 'none';
    divDiagResultado.innerHTML = '';
    divPlanWrap.style.display = 'none';
    wrapPlan.innerHTML = '';
    planCount = 0; planActivos = 0;
    sugeridasAgregadas.clear();
    ultimoDiagnostico = null;
    divRes.style.display = 'none';
    divEnviarConf.style.display = 'none';
    textarea.value = '';
  });

  container.querySelector('#dp-copiar').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      const btn = container.querySelector('#dp-copiar');
      const orig = btn.textContent;
      btn.textContent = 'Copiado ✓';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => prompt('Copie el texto:', texto));
  });

  container.querySelector('#dp-pdf').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const lineas = texto.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    exportarPDF(`Diagnóstico Integral PYME — ${val('dp-empresa') || 'empresa'}`, `<div class="info-box" style="font-size:12px;line-height:1.7">${lineas}</div>`);
  });

  // ── Enviar a Generador de Presupuestos ───────────────────────────────────
  container.querySelector('#dp-enviar').addEventListener('click', () => {
    if (!ultimoDiagnostico) return;
    const plan = leerPlan();
    const fecha = new Date().toLocaleDateString('es-AR');

    const alcanceTexto = plan.length
      ? `Servicio de asesoramiento integral en materia laboral, de recursos humanos, compliance y control interno, sobre la base del diagnóstico realizado con fecha ${fecha}. El plan de trabajo comprende:\n` +
        plan.map((p, i) => `${i + 1}. [${p.prioridad.toUpperCase()}] ${p.accion} (plazo sugerido: ${p.plazo || 'a definir'})`).join('\n')
      : `Servicio de asesoramiento integral en materia laboral, de recursos humanos, compliance y control interno, sobre la base del diagnóstico realizado con fecha ${fecha}.`;

    const payload = {
      fecha,
      rama: 'asesoramiento_pyme',
      campos: {
        empresa_cliente: val('dp-empresa'),
        rubro_pyme: val('dp-rubro'),
        cant_empleados_pyme: val('dp-empleados'),
      },
      alcance: alcanceTexto,
    };

    try {
      localStorage.setItem('mvc_prefill_presupuesto_pyme', JSON.stringify(payload));
    } catch (e) {
      divEnviarConf.style.display = 'block';
      divEnviarConf.innerHTML = `<div class="display-box" style="color:#c00">No se pudieron guardar los datos (${e.message}).</div>`;
      return;
    }
    divEnviarConf.style.display = 'block';
    divEnviarConf.innerHTML = `<div class="display-box" style="background:#e8f4ea;border-color:#7ab88a">
      ✅ Datos enviados. Abrí el <strong>Generador de Presupuestos</strong> y aceptá el banner para cargarlos.
      <div style="margin-top:8px"><button class="btn btn-primary" id="dp-ir-a-presupuesto" type="button">Ir ahora</button></div>
    </div>`;
    container.querySelector('#dp-ir-a-presupuesto').addEventListener('click', () => { location.hash = 'presupuestos'; });
  });
}
