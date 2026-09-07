// formularios-evaluacion.js — Formularios de Evaluación de Desempeño
// (Consultoría PYME)
// Instrumento operativo (especie) del capítulo "Evaluación de Desempeño" del
// Reglamento de Políticas RRHH (género): mientras el Reglamento declara la
// política (qué metodología se usa, con qué periodicidad), este generador
// produce la ficha concreta que se completa por cada colaborador/a en cada
// ciclo de evaluación, según 4 alternativas metodológicas: por Objetivos
// (OKR/KPI), por Competencias, 360° y Autoevaluación simple. Admite dos
// modos: plantilla en blanco (para completar durante la entrevista) o ficha
// completada con datos concretos.
import { exportarPDF, exportarWord } from './exportar.js';

export function initFormulariosEvaluacion(container) {

  const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  const TIPOS = [
    { id: 'objetivos',      label: 'Evaluación por Objetivos (OKR/KPI)' },
    { id: 'competencias',   label: 'Evaluación por Competencias' },
    { id: 'trescientos60',  label: 'Evaluación 360°' },
    { id: 'autoeval',       label: 'Autoevaluación simple' },
  ];

  // Mapea los ids de metodología usados en politicas-rrhh.js (METODOLOGIAS)
  // a los tipos de formulario de este generador.
  const MAPA_METODO_A_TIPO = { objetivos: 'objetivos', competencias: 'competencias', '360': 'trescientos60', autoeval: 'autoeval' };

  const COMPETENCIAS_DEFAULT = ['Trabajo en equipo', 'Comunicación efectiva', 'Orientación a resultados', 'Compromiso y responsabilidad', 'Calidad de trabajo'];

  const ESCALA_TEXTO = '1 = Insatisfactorio   |   2 = Por debajo de lo esperado   |   3 = Cumple lo esperado   |   4 = Por encima de lo esperado   |   5 = Sobresaliente';

  const CAL_OPTIONS = [
    { value: '', label: '— Sin calificar —' },
    { value: '1', label: '1 - Insatisfactorio' },
    { value: '2', label: '2 - Por debajo de lo esperado' },
    { value: '3', label: '3 - Cumple lo esperado' },
    { value: '4', label: '4 - Por encima de lo esperado' },
    { value: '5', label: '5 - Sobresaliente' },
  ];

  const CAL_GLOBAL_OPTIONS = [
    { value: '', label: '— Sin calificar —' },
    { value: 'cumple', label: 'Cumple' },
    { value: 'parcial', label: 'Cumple parcialmente' },
    { value: 'no_cumple', label: 'No cumple' },
  ];

  const MAX_OBJ = 10, MAX_COMP = 12, MAX_360 = 10;

  // ── HTML ──────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Formularios de Evaluación de Desempeño</h2>
      <p class="tool-desc">Ficha operativa de evaluación de desempeño — el instrumento concreto a completar por evaluador/es, según la metodología elegida. Complementa al Reglamento de Políticas RRHH, que solo declara la política general.</p>

      <div id="fe-prefill-slot"></div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:8px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos de la empresa</div>
      <div class="form-row">
        <div class="field-group" style="flex:1"><label for="fe-empresa">Razón social</label><input type="text" id="fe-empresa" placeholder="Empresa S.A."></div>
        <div class="field-group" style="flex:1"><label for="fe-cuit">CUIT</label><input type="text" id="fe-cuit" placeholder="30-12345678-9"></div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del/de la colaborador/a evaluado/a</div>
      <div class="form-row">
        <div class="field-group" style="flex:2"><label for="fe-colaborador">Nombre y apellido</label><input type="text" id="fe-colaborador" placeholder="Juan Pérez"></div>
        <div class="field-group" style="flex:1"><label for="fe-puesto">Puesto / Cargo</label><input type="text" id="fe-puesto" placeholder="Analista contable"></div>
        <div class="field-group" style="flex:1"><label for="fe-area">Área / Sector</label><input type="text" id="fe-area" placeholder="Administración"></div>
      </div>
      <div class="form-row">
        <div class="field-group" style="flex:1"><label for="fe-periodo-desde">Período evaluado — desde</label><input type="date" id="fe-periodo-desde"></div>
        <div class="field-group" style="flex:1"><label for="fe-periodo-hasta">Período evaluado — hasta</label><input type="date" id="fe-periodo-hasta"></div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del/de la evaluador/a</div>
      <div class="form-row">
        <div class="field-group" style="flex:1"><label for="fe-evaluador-nombre">Nombre y apellido</label><input type="text" id="fe-evaluador-nombre" placeholder="María Gómez"></div>
        <div class="field-group" style="flex:1"><label for="fe-evaluador-cargo">Cargo</label><input type="text" id="fe-evaluador-cargo" placeholder="Jefe/a de Administración"></div>
        <div class="field-group" style="flex:1"><label for="fe-fecha">Fecha de la evaluación</label><input type="date" id="fe-fecha"></div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:20px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Modo de generación</div>
      <div class="field-group">
        <select id="fe-modo">
          <option value="blanco">Plantilla en blanco (para completar durante la entrevista)</option>
          <option value="completo">Ficha completada con datos concretos</option>
        </select>
        <p style="font-size:.78rem;color:var(--color-muted);margin:6px 0 0">En modo "plantilla en blanco", los renglones sin cargar se completan con líneas en blanco automáticamente. En modo "ficha completada", se usan los datos concretos que cargues abajo (los campos que dejes vacíos igual se completan en blanco).</p>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Tipo de formulario</div>
      <div class="field-group">
        <select id="fe-tipo">${TIPOS.map(t => `<option value="${t.id}">${t.label}</option>`).join('')}</select>
      </div>

      <!-- ══ Objetivos (OKR/KPI) ══ -->
      <div id="fe-wrap-objetivos">
        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:20px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Objetivos pactados</div>
        <div id="fe-obj-wrapper" style="display:flex;flex-direction:column;gap:6px"></div>
        <div class="form-row" style="justify-content:flex-start;margin-top:6px;gap:12px;flex-wrap:wrap">
          <button class="btn btn-ghost" id="fe-add-obj" type="button">+ Agregar objetivo (máx. ${MAX_OBJ})</button>
          <div class="field-group" style="flex:0 0 auto;margin:0">
            <label for="fe-obj-cantidad-blanco" style="font-size:.78rem">Renglones en blanco si no cargás objetivos</label>
            <input type="number" id="fe-obj-cantidad-blanco" min="1" max="15" value="5" style="width:80px">
          </div>
        </div>
        <div class="field-group" style="margin-top:10px">
          <label for="fe-obj-calificacion-global">Calificación global del período (opcional)</label>
          <select id="fe-obj-calificacion-global">${CAL_GLOBAL_OPTIONS.map(o => `<option value="${o.value}">${o.label}</option>`).join('')}</select>
        </div>
      </div>

      <!-- ══ Competencias ══ -->
      <div id="fe-wrap-competencias" style="display:none">
        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:20px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Competencias a evaluar</div>
        <p style="font-size:.78rem;color:var(--color-muted);margin:0 0 8px">Se precargó un set estándar de competencias. Quitá las que no apliquen y agregá las específicas del puesto.</p>
        <div id="fe-comp-wrapper" style="display:flex;flex-direction:column;gap:6px"></div>
        <div class="form-row" style="justify-content:flex-start;margin-top:6px">
          <button class="btn btn-ghost" id="fe-add-comp" type="button">+ Agregar competencia (máx. ${MAX_COMP})</button>
        </div>
      </div>

      <!-- ══ 360° ══ -->
      <div id="fe-wrap-360" style="display:none">
        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:20px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Evaluación 360°</div>
        <p style="font-size:.78rem;color:var(--color-muted);margin:0 0 8px">Independientemente del modo elegido, las secciones de calificación se entregan siempre en blanco: cada evaluador/a (colaborador/a, superior, pares y, en su caso, colaboradores a cargo) las completa de manera individual.</p>
        <label style="display:flex;align-items:center;gap:8px;font-weight:600;cursor:pointer;margin-bottom:10px">
          <input type="checkbox" id="fe-360-incluir-colaboradores" style="width:auto"> Incluir sección de evaluación por colaboradores a cargo
        </label>
        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:10px 0 8px;font-size:.78rem;text-transform:uppercase;letter-spacing:.05em">Competencias a evaluar en cada sección</div>
        <div id="fe-360-comp-wrapper" style="display:flex;flex-direction:column;gap:6px"></div>
        <div class="form-row" style="justify-content:flex-start;margin-top:6px">
          <button class="btn btn-ghost" id="fe-add-360-comp" type="button">+ Agregar competencia (máx. ${MAX_360})</button>
        </div>
      </div>

      <!-- ══ Autoevaluación simple ══ -->
      <div id="fe-wrap-autoeval" style="display:none">
        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:20px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Autoevaluación simple</div>
        <p style="font-size:.78rem;color:var(--color-muted);margin:0 0 8px">Preguntas guía a completar por el propio colaborador antes de la devolución (opcional; si se deja en blanco, se genera la línea para completar a mano).</p>
        <div class="field-group"><label for="fe-auto-q1">Principales logros durante el período evaluado</label><textarea id="fe-auto-q1" rows="2"></textarea></div>
        <div class="field-group"><label for="fe-auto-q2">Dificultades u obstáculos enfrentados</label><textarea id="fe-auto-q2" rows="2"></textarea></div>
        <div class="field-group"><label for="fe-auto-q3">Aspectos a mejorar o desarrollar</label><textarea id="fe-auto-q3" rows="2"></textarea></div>
        <div class="field-group"><label for="fe-auto-q4">Expectativas o necesidades de capacitación</label><textarea id="fe-auto-q4" rows="2"></textarea></div>
        <div class="field-group"><label for="fe-auto-q5">Comentarios adicionales</label><textarea id="fe-auto-q5" rows="2"></textarea></div>
      </div>

      <div class="field-group" style="margin-top:10px">
        <label for="fe-observaciones">Observaciones generales (opcional)</label>
        <textarea id="fe-observaciones" rows="2"></textarea>
      </div>

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:8px">
        <button class="btn btn-primary" id="fe-generar">Generar ficha</button>
        <button class="btn btn-ghost"   id="fe-limpiar">Limpiar</button>
      </div>

      <div id="fe-resultado" style="display:none;margin-top:24px">
        <label for="fe-texto" style="font-weight:600;display:block;margin-bottom:6px">Texto generado (editable)</label>
        <textarea id="fe-texto" rows="30" style="width:100%;resize:vertical;font-family:inherit;font-size:.9rem;padding:12px;border:1px solid var(--color-border);border-radius:6px;background:#ffffff;color:#1a1a1a;line-height:1.6"></textarea>
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px">
          <button class="btn btn-success" id="fe-copiar">📋 Copiar texto</button>
          <button class="btn btn-ghost"   id="fe-pdf">📄 Exportar PDF</button>
          <button class="btn btn-ghost"   id="fe-word">📝 Exportar Word</button>
          <button class="btn btn-ghost"   id="fe-reset-texto">Restablecer</button>
        </div>
      </div>

      <p style="margin-top:24px;font-size:.78rem;color:var(--color-muted);border-top:1px solid var(--color-border);padding-top:12px">
        Modelo orientativo, a adaptar al caso concreto y al Convenio Colectivo de Trabajo aplicable. No constituye asesoramiento legal definitivo.
      </p>
    </div>`;

  // ── Referencias y helpers ────────────────────────────────────────────────
  const divRes = container.querySelector('#fe-resultado');
  const textarea = container.querySelector('#fe-texto');
  let ultimoTextoGenerado = '';

  function val(id) { const el = container.querySelector(`#${id}`); return el ? el.value.trim() : ''; }
  function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function blanco(n) { return '_'.repeat(n); }
  function fmtFechaLarga(iso) {
    if (!iso) return '[FECHA]';
    const [y, m, d] = iso.split('-');
    return `${parseInt(d, 10)} de ${MESES[parseInt(m, 10) - 1]} de ${y}`;
  }
  function fmtFechaCorta(iso) {
    if (!iso) return '__ / __ / ____';
    const p = iso.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
  }

  const wrapObjetivos = container.querySelector('#fe-obj-wrapper');
  const wrapCompetencias = container.querySelector('#fe-comp-wrapper');
  const wrap360 = container.querySelector('#fe-360-comp-wrapper');

  // ── Filas dinámicas (objetivos, competencias, 360°) ─────────────────────
  function crearFila({ wrapper, prefix, campos, max, contadorRef }) {
    if (contadorRef.activos >= max) return;
    contadorRef.count++; contadorRef.activos++;
    const id = contadorRef.count;
    const div = document.createElement('div');
    div.className = 'form-row';
    div.id = `${prefix}-row-${id}`;
    div.innerHTML = campos.map(c => {
      const inputId = `${prefix}-${c.id}-${id}`;
      let campo;
      if (c.tipo === 'select') {
        campo = `<select id="${inputId}">${c.options.map(o => `<option value="${o.value}" ${o.value === (c.value || '') ? 'selected' : ''}>${o.label}</option>`).join('')}</select>`;
      } else if (c.tipo === 'textarea') {
        campo = `<textarea id="${inputId}" placeholder="${c.placeholder || ''}" rows="1" style="min-height:38px">${esc(c.value || '')}</textarea>`;
      } else {
        campo = `<input type="text" id="${inputId}" placeholder="${c.placeholder || ''}" value="${esc(c.value || '')}">`;
      }
      return `<div class="field-group" style="flex:${c.flex || 1}">${campo}</div>`;
    }).join('') + `<div class="field-group" style="flex:0;align-self:flex-end"><button class="btn btn-ghost" type="button" data-remove="${id}">✕</button></div>`;
    wrapper.appendChild(div);
    div.querySelector('[data-remove]').addEventListener('click', () => { div.remove(); contadorRef.activos--; });
    return id;
  }

  function leerFilas(wrapper, prefix, camposIds) {
    return Array.from(wrapper.querySelectorAll(`[id^="${prefix}-row-"]`)).map(row => {
      const id = row.id.replace(`${prefix}-row-`, '');
      const obj = {};
      camposIds.forEach(c => { obj[c] = container.querySelector(`#${prefix}-${c}-${id}`)?.value.trim() || ''; });
      return obj;
    }).filter(o => Object.values(o).some(v => v));
  }

  const objContador = { count: 0, activos: 0 };
  const OBJ_CAMPOS = [
    { id: 'objetivo',  tipo: 'textarea', placeholder: 'Objetivo / meta pactada', flex: 3 },
    { id: 'peso',      tipo: 'text',     placeholder: 'Peso %', flex: 1 },
    { id: 'indicador', tipo: 'text',     placeholder: 'Indicador de medición', flex: 2 },
    { id: 'resultado', tipo: 'text',     placeholder: 'Resultado logrado (dejar vacío si es plantilla)', flex: 2 },
  ];
  container.querySelector('#fe-add-obj').addEventListener('click', () =>
    crearFila({ wrapper: wrapObjetivos, prefix: 'fe-obj', campos: OBJ_CAMPOS, max: MAX_OBJ, contadorRef: objContador }));

  const compContador = { count: 0, activos: 0 };
  const COMP_CAMPOS = (nombre) => [
    { id: 'competencia', tipo: 'text',     placeholder: 'Competencia', flex: 2, value: nombre || '' },
    { id: 'descripcion', tipo: 'textarea', placeholder: 'Descripción (opcional)', flex: 3 },
    { id: 'calificacion', tipo: 'select',  flex: 1, options: CAL_OPTIONS },
  ];
  container.querySelector('#fe-add-comp').addEventListener('click', () =>
    crearFila({ wrapper: wrapCompetencias, prefix: 'fe-comp', campos: COMP_CAMPOS(), max: MAX_COMP, contadorRef: compContador }));

  const comp360Contador = { count: 0, activos: 0 };
  const COMP_360_CAMPOS = (nombre) => [
    { id: 'competencia', tipo: 'text', placeholder: 'Competencia', flex: 1, value: nombre || '' },
  ];
  container.querySelector('#fe-add-360-comp').addEventListener('click', () =>
    crearFila({ wrapper: wrap360, prefix: 'fe-360-comp', campos: COMP_360_CAMPOS(), max: MAX_360, contadorRef: comp360Contador }));

  function preseedCompetencias() {
    COMPETENCIAS_DEFAULT.forEach(nombre => crearFila({ wrapper: wrapCompetencias, prefix: 'fe-comp', campos: COMP_CAMPOS(nombre), max: MAX_COMP, contadorRef: compContador }));
  }
  function preseed360() {
    COMPETENCIAS_DEFAULT.forEach(nombre => crearFila({ wrapper: wrap360, prefix: 'fe-360-comp', campos: COMP_360_CAMPOS(nombre), max: MAX_360, contadorRef: comp360Contador }));
  }
  preseedCompetencias();
  preseed360();

  // ── Toggle de tipo de formulario ─────────────────────────────────────────
  const wraps = {
    objetivos: container.querySelector('#fe-wrap-objetivos'),
    competencias: container.querySelector('#fe-wrap-competencias'),
    trescientos60: container.querySelector('#fe-wrap-360'),
    autoeval: container.querySelector('#fe-wrap-autoeval'),
  };
  const selectTipo = container.querySelector('#fe-tipo');
  function actualizarWraps() {
    Object.entries(wraps).forEach(([id, el]) => { el.style.display = (selectTipo.value === id) ? 'block' : 'none'; });
  }
  selectTipo.addEventListener('change', actualizarWraps);
  actualizarWraps();

  // ── Generación ────────────────────────────────────────────────────────────
  const cuerpos = {
    objetivos: () => {
      let filas = leerFilas(wrapObjetivos, 'fe-obj', ['objetivo', 'peso', 'indicador', 'resultado']);
      if (!filas.length) {
        const cant = Math.min(parseInt(val('fe-obj-cantidad-blanco'), 10) || 5, 15);
        filas = Array.from({ length: cant }, () => ({ objetivo: '', peso: '', indicador: '', resultado: '' }));
      }
      const CAL_GLOBAL_LABEL = { cumple: 'Cumple', parcial: 'Cumple parcialmente', no_cumple: 'No cumple' };
      const calGlobal = container.querySelector('#fe-obj-calificacion-global').value;
      const filasTexto = filas.map((f, i) => {
        const objetivo = f.objetivo || blanco(50);
        const peso = f.peso ? `${f.peso}%` : blanco(4) + '%';
        const indicador = f.indicador || blanco(30);
        const resultado = f.resultado || blanco(30);
        return `${i + 1}. Objetivo: ${objetivo}\n   Peso relativo: ${peso}   |   Indicador de medición: ${indicador}\n   Resultado logrado: ${resultado}`;
      }).join('\n\n');
      return `La presente ficha evalúa el grado de cumplimiento de los objetivos pactados con el/la colaborador/a para el período indicado, conforme al siguiente detalle:\n\n${filasTexto}\n\nCalificación global del período: ${calGlobal ? CAL_GLOBAL_LABEL[calGlobal] : blanco(20)}\n\nObservaciones del/de la evaluador/a:\n${blanco(60)}`;
    },
    competencias: () => {
      const filas = leerFilas(wrapCompetencias, 'fe-comp', ['competencia', 'descripcion', 'calificacion']);
      const CAL_LABEL = Object.fromEntries(CAL_OPTIONS.filter(o => o.value).map(o => [o.value, o.label]));
      const filasTexto = filas.map(f => {
        const nombre = f.competencia || '(competencia sin especificar)';
        const desc = f.descripcion ? ` — ${f.descripcion}` : '';
        const cal = f.calificacion && CAL_LABEL[f.calificacion] ? CAL_LABEL[f.calificacion] : blanco(20);
        return `- ${nombre}${desc}\n   Calificación: ${cal}\n   Observaciones: ${blanco(50)}`;
      }).join('\n\n');
      return `La presente ficha evalúa al/a la colaborador/a en las siguientes competencias, conforme a la escala que se detalla a continuación:\n${ESCALA_TEXTO}\n\n${filasTexto || '(no se cargaron competencias a evaluar)'}`;
    },
    trescientos60: () => {
      const filas360 = leerFilas(wrap360, 'fe-360-comp', ['competencia']);
      const nombres = filas360.length ? filas360.map(f => f.competencia || '(competencia sin especificar)') : COMPETENCIAS_DEFAULT.slice();
      const incluirColab = container.querySelector('#fe-360-incluir-colaboradores').checked;
      const bloqueSeccion = (titulo) => {
        const items = nombres.map(n => `- ${n}\n   Calificación (1 a 5): ${blanco(4)}   Observaciones: ${blanco(50)}`).join('\n\n');
        return `${titulo}\n${items}`;
      };
      const secciones = [
        bloqueSeccion('AUTOEVALUACIÓN (a completar por el/la propio/a colaborador/a)'),
        bloqueSeccion('EVALUACIÓN DEL SUPERIOR DIRECTO'),
        bloqueSeccion('EVALUACIÓN DE PARES (promedio de al menos 2 pares, si corresponde)'),
      ];
      if (incluirColab) secciones.push(bloqueSeccion('EVALUACIÓN DE COLABORADORES A CARGO (promedio, si corresponde)'));
      return `La presente ficha implementa una evaluación de tipo 360°, combinando la perspectiva del propio/a colaborador/a, de su superior directo, de sus pares y, en su caso, de sus colaboradores a cargo, conforme a la escala que se detalla a continuación:\n${ESCALA_TEXTO}\n\nLas secciones siguientes se entregan en blanco para ser completadas por cada evaluador/a de manera independiente y, preferentemente, confidencial respecto de las demás.\n\n${secciones.join('\n\n')}\n\nSÍNTESIS INTEGRADORA (a completar por Recursos Humanos o el/la responsable del proceso, una vez recibidas todas las evaluaciones)\nPromedio general: ${blanco(4)}\nPrincipales coincidencias: ${blanco(50)}\nPrincipales brechas de percepción: ${blanco(50)}`;
    },
    autoeval: () => {
      const preguntas = [
        ['Principales logros durante el período evaluado', 'fe-auto-q1'],
        ['Dificultades u obstáculos enfrentados', 'fe-auto-q2'],
        ['Aspectos a mejorar o desarrollar', 'fe-auto-q3'],
        ['Expectativas o necesidades de capacitación', 'fe-auto-q4'],
        ['Comentarios adicionales', 'fe-auto-q5'],
      ];
      const bloque = preguntas.map(([titulo, id], i) => {
        const respuesta = val(id);
        return `${i + 1}. ${titulo}:\n${respuesta || blanco(60)}`;
      }).join('\n\n');
      return `La presente autoevaluación es completada por el/la propio/a colaborador/a en forma previa a la entrevista de devolución con su superior directo:\n\n${bloque}\n\nComentarios del/de la superior directo/a tras la devolución:\n${blanco(60)}`;
    },
  };

  container.querySelector('#fe-generar').addEventListener('click', () => {
    const empresa = val('fe-empresa') || '[RAZÓN SOCIAL]';
    const cuit = val('fe-cuit') || '[CUIT]';
    const colaborador = val('fe-colaborador') || '[NOMBRE DEL/DE LA COLABORADOR/A]';
    const puesto = val('fe-puesto') || '[PUESTO]';
    const area = val('fe-area') || '[ÁREA]';
    const periodoDesde = fmtFechaCorta(val('fe-periodo-desde'));
    const periodoHasta = fmtFechaCorta(val('fe-periodo-hasta'));
    const evaluadorNombre = val('fe-evaluador-nombre') || '[EVALUADOR/A]';
    const evaluadorCargo = val('fe-evaluador-cargo');
    const fechaEval = fmtFechaLarga(val('fe-fecha'));
    const modo = container.querySelector('#fe-modo').value;
    const tipo = selectTipo.value;
    const observaciones = val('fe-observaciones');

    const tipoLabel = TIPOS.find(t => t.id === tipo)?.label || '';
    const introModo = modo === 'blanco'
      ? 'El presente instrumento se entrega en blanco, para ser completado por el/los evaluador/es durante el proceso de evaluación correspondiente al período indicado.'
      : 'El presente instrumento refleja los datos y resultados de la evaluación correspondiente al período indicado.';

    const texto =
`FICHA DE EVALUACIÓN DE DESEMPEÑO — ${tipoLabel.toUpperCase()}
${empresa} — CUIT ${cuit}

Colaborador/a evaluado/a: ${colaborador}
Puesto/Cargo: ${puesto}    Área/Sector: ${area}
Período evaluado: ${periodoDesde} al ${periodoHasta}
Evaluador/a: ${evaluadorNombre}${evaluadorCargo ? ` (${evaluadorCargo})` : ''}
Fecha de la evaluación: ${fechaEval}

${introModo}

${cuerpos[tipo]()}
${observaciones ? `\nOBSERVACIONES GENERALES\n${observaciones}\n` : ''}
──────────────────────────────────────────────
CONFORMIDAD

El/la colaborador/a evaluado/a deja constancia de haber tomado conocimiento del contenido de la presente evaluación, sin que ello implique necesariamente su conformidad con el resultado, pudiendo dejar asentado su descargo en el espacio provisto a tal fin.

Descargo del/de la colaborador/a (opcional): ${blanco(50)}

Firma del/de la colaborador/a evaluado/a: ____________________________          Fecha: ____ / ____ / ______

Firma del/de la evaluador/a: ____________________________          Fecha: ____ / ____ / ______

Elaborado por: MVC Abogados
Fecha de emisión: ${fmtFechaCorta(val('fe-fecha'))}`;

    ultimoTextoGenerado = texto;
    textarea.value = texto;
    divRes.style.display = 'block';
    textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    textarea.dataset.empresa = empresa;
    textarea.dataset.tipoLabel = tipoLabel;
  });

  container.querySelector('#fe-limpiar').addEventListener('click', () => {
    container.querySelectorAll('input[type="text"], input[type="date"], input[type="number"], textarea').forEach(el => { el.value = ''; });
    container.querySelector('#fe-obj-cantidad-blanco').value = '5';
    container.querySelector('#fe-modo').value = 'blanco';
    container.querySelector('#fe-obj-calificacion-global').value = '';
    container.querySelector('#fe-360-incluir-colaboradores').checked = false;
    selectTipo.value = 'objetivos';
    actualizarWraps();

    wrapObjetivos.innerHTML = ''; objContador.count = 0; objContador.activos = 0;
    wrapCompetencias.innerHTML = ''; compContador.count = 0; compContador.activos = 0;
    wrap360.innerHTML = ''; comp360Contador.count = 0; comp360Contador.activos = 0;
    preseedCompetencias();
    preseed360();

    divRes.style.display = 'none';
    textarea.value = '';
    ultimoTextoGenerado = '';
  });

  container.querySelector('#fe-copiar').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      const btn = container.querySelector('#fe-copiar');
      const orig = btn.textContent;
      btn.textContent = 'Copiado ✓';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => prompt('Copie el texto:', texto));
  });

  container.querySelector('#fe-reset-texto').addEventListener('click', () => {
    if (ultimoTextoGenerado) textarea.value = ultimoTextoGenerado;
  });

  container.querySelector('#fe-pdf').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const lineas = esc(texto).replace(/\n/g, '<br>');
    exportarPDF(`Ficha de Evaluación de Desempeño — ${textarea.dataset.tipoLabel || ''} — ${textarea.dataset.empresa || 'empresa'}`, `<div class="info-box" style="font-size:12px;line-height:1.7">${lineas}</div>`);
  });

  container.querySelector('#fe-word').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const parrafos = esc(texto).split('\n').map(l => l.trim() === '' ? '<p>&nbsp;</p>' : `<p>${l}</p>`).join('\n');
    exportarWord(`Ficha de Evaluación de Desempeño — ${textarea.dataset.tipoLabel || ''} — ${textarea.dataset.empresa || 'empresa'}`, parrafos);
  });

  // ── Prefill desde Diagnóstico Integral PYME y/o Reglamento de Políticas RRHH ──
  (function detectarPrefill() {
    let payload;
    try { payload = JSON.parse(localStorage.getItem('mvc_prefill_formularios_evaluacion') || 'null'); } catch { payload = null; }
    if (!payload) return;

    const tiposDetectados = Array.isArray(payload.tipos) ? payload.tipos.map(m => MAPA_METODO_A_TIPO[m]).filter(Boolean) : [];
    const notaTipos = tiposDetectados.length
      ? ` Se detectaron estas metodologías tildadas en el Reglamento de Políticas RRHH: ${tiposDetectados.map(id => TIPOS.find(t => t.id === id)?.label).join(', ')}. Se precargará la primera; podés cambiar el tipo de formulario arriba para generar las demás.`
      : '';

    const banner = document.createElement('div');
    banner.style.cssText = 'background:#e8f4ea;border:1px solid #7ab88a;border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:.9rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px';
    banner.innerHTML = `<span>📋 Hay datos cargados el ${esc(payload.fecha || '')} — ¿cargamos los datos de la empresa?${esc(notaTipos)}</span>
      <span style="display:flex;gap:8px">
        <button class="btn btn-primary" id="fe-prefill-cargar" type="button">Cargar</button>
        <button class="btn btn-ghost" id="fe-prefill-descartar" type="button">Descartar</button>
      </span>`;
    container.querySelector('#fe-prefill-slot').appendChild(banner);

    banner.querySelector('#fe-prefill-cargar').addEventListener('click', () => {
      if (payload.empresa) container.querySelector('#fe-empresa').value = payload.empresa;
      if (payload.cuit) container.querySelector('#fe-cuit').value = payload.cuit;
      if (tiposDetectados.length) { selectTipo.value = tiposDetectados[0]; actualizarWraps(); }
      localStorage.removeItem('mvc_prefill_formularios_evaluacion');
      banner.remove();
    });
    banner.querySelector('#fe-prefill-descartar').addEventListener('click', () => {
      localStorage.removeItem('mvc_prefill_formularios_evaluacion');
      banner.remove();
    });
  })();
}
