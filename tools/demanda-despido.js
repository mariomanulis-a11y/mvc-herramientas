// Generador de Demanda Laboral por Despido — Provincia de Buenos Aires
// Conforme Ley 15.057 (Procedimiento Laboral PBA) y, supletoriamente, el
// Código Procesal Civil y Comercial de la Provincia de Buenos Aires (art. 89, Ley 15.057).
// Alcance v1: despido incausado, despido indirecto, impugnación de causa invocada
// por el empleador, y estabilidades especiales (sindical / maternidad / matrimonio).
import { exportarPDF, exportarWord } from './exportar.js';

export function initDemandaDespido(container) {

  const EMAIL_ESTUDIO = 'mvcabogadospilar@gmail.com';
  const ABOGADOS = [
    { id: 'manulis',    nombre: 'Mario Martín Manulis',       domicilioElectronico: '20271887931@notificaciones.scba.gov.ar', celular: '1153107794', matricula: 'T° 34 F° 69 CASI' },
    { id: 'velazquez',  nombre: 'Soledad Celeste Velazquez',  domicilioElectronico: '27273872286@notificaciones.scba.gov.ar', celular: '1155781501', matricula: 'T° 36 F° 125 CASI' },
    { id: 'curbelo',    nombre: 'Yanina Daniela Curbelo',     domicilioElectronico: '27268952867@notificaciones.scba.gov.ar', celular: '1149272774', matricula: 'T° 36 F° 90 CASI' },
    { id: 'poggi',      nombre: 'Camila Susana Poggi',        domicilioElectronico: '27388231705@notificaciones.scba.gov.ar', celular: '1138224662', matricula: 'T° 55 F° 255 CASI' },
  ];
  const ABOGADOS_BY_ID = Object.fromEntries(ABOGADOS.map(a => [a.id, a]));
  const TODOS_ABOGADOS_TEXTO = 'los Dres./Dras. ' + ABOGADOS.map(a => `${a.nombre} (${a.matricula})`).join(' y/o ');

  function joinConY(arr) {
    const items = arr.filter(Boolean);
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    return items.slice(0, -1).join(', ') + ' y ' + items[items.length - 1];
  }

  // ── Utilidades de fecha para la justificación de rubros de la liquidación ──
  const MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  function parseISODate(iso) {
    if (!iso) return null;
    const f = new Date(iso + 'T00:00:00');
    return isNaN(f.getTime()) ? null : f;
  }

  function calcularAntiguedad(isoIngreso, isoCese) {
    const ing = parseISODate(isoIngreso);
    const egr = parseISODate(isoCese);
    if (!ing || !egr || egr <= ing) return null;
    let años = egr.getFullYear() - ing.getFullYear();
    let meses = egr.getMonth() - ing.getMonth();
    let dias = egr.getDate() - ing.getDate();
    if (dias < 0) meses--;
    if (meses < 0) { años--; meses += 12; }
    return { años, meses, totalDias: Math.round((egr - ing) / 86400000) };
  }

  function añosComputablesLCT(ant) {
    if (!ant) return null;
    let n = ant.años;
    if (ant.meses > 3) n += 1; // fracción mayor a tres meses computa como año entero (art. 245, LCT)
    return Math.max(n, 1);
  }

  function diasRestantesMes(iso) {
    const f = parseISODate(iso);
    if (!f) return null;
    const ultimoDia = new Date(f.getFullYear(), f.getMonth() + 1, 0).getDate();
    return { restantes: ultimoDia - f.getDate(), mes: MESES_ES[f.getMonth()], anio: f.getFullYear() };
  }

  function semestreInfo(iso) {
    const f = parseISODate(iso);
    if (!f) return null;
    return { numero: (f.getMonth() + 1) <= 6 ? 'primer' : 'segundo', anio: f.getFullYear() };
  }

  const CARACTER_LETRADO = [
    { value: 'patrocinante', label: 'Letrado/a patrocinante' },
    { value: 'apoderado',    label: 'Apoderado/a' },
  ];

  const CAUSALES = [
    { value: 'incausado',          label: 'Despido incausado (art. 245 LCT)' },
    { value: 'indirecto',          label: 'Despido indirecto (art. 246 LCT)' },
    { value: 'impugnacion_causa',  label: 'Impugnación de la causa invocada por el empleador (art. 242 LCT)' },
    { value: 'estabilidad_especial', label: 'Estabilidad especial (sindical / maternidad / matrimonio)' },
  ];

  const TIPOS_ESTABILIDAD = [
    { value: 'sindical',    label: 'Tutela sindical (arts. 47 y 52, Ley 23.551)' },
    { value: 'maternidad',  label: 'Protección de la maternidad (arts. 177, 178 y 182 LCT)' },
    { value: 'matrimonio',  label: 'Protección por matrimonio (arts. 181 y 182 LCT)' },
  ];

  const RUBROS = [
    { id: 'preaviso',            label: 'Preaviso (art. 232 LCT)' },
    { id: 'integracion',         label: 'Integración mes de despido (art. 233 LCT)' },
    { id: 'indemnizacion_antiguedad', label: 'Indemnización por antigüedad (art. 245 LCT)' },
    { id: 'sac_proporcional',    label: 'SAC proporcional' },
    { id: 'vacaciones',          label: 'Vacaciones no gozadas' },
    { id: 'salarios_adeudados',  label: 'Salarios adeudados' },
    { id: 'ley25323_art1',       label: 'Daño y perjuicio por registración deficiente/omitida (quantum ex art. 1, Ley 25.323 — derogado)' },
    { id: 'ley25323_art2',       label: 'Daño y perjuicio por falta de pago en término (quantum ex art. 2, Ley 25.323 — derogado)' },
    { id: 'art80_lct',           label: 'Daño y perjuicio por falta de entrega de certificados (quantum ex art. 45, Ley 25.345 — derogado)' },
    { id: 'ley24013',            label: 'Daño y perjuicio por no registración/subregistro (quantum ex arts. 8, 9, 10 y/o 15, Ley 24.013 — derogados)' },
    { id: 'indemnizacion_especial_estabilidad', label: 'Indemnización especial por estabilidad (art. 182 LCT / Ley 23.551, según corresponda)' },
    { id: 'dano_moral',          label: 'Daño moral (opcional)' },
    { id: 'otro',                label: 'Otro concepto (detallar)' },
  ];

  const DOCUMENTALES = [
    { id: 'recibos',     label: 'Recibos de sueldo', pideDato: true,
      placeholder: 'Períodos (ej.: enero 2024 a octubre 2026)' },
    { id: 'telegramas',  label: 'Telegramas / cartas documento cursadas', pideDato: true,
      placeholder: 'Detalle (fechas y N° de telegramas/CD)' },
    { id: 'contrato',    label: 'Contrato de trabajo / legajo', pideDato: false },
    { id: 'otro',        label: 'Otro documento', pideDato: true,
      placeholder: 'Detalle del documento' },
  ];

  const INFORMATIVAS = [
    { id: 'arca',    label: 'ARCA (registración y aportes)', pideDato: false },
    { id: 'bancos',  label: 'Entidad/es bancaria/s o financiera/s', pideDato: true,
      placeholder: 'Entidad/es a oficiar' },
    { id: 'correo',  label: 'Correo Oficial de la República Argentina (autenticidad de piezas postales)', pideDato: false },
  ];

  container.innerHTML = `
    <div class="tool-card">
      <h2>Generador de Demanda Laboral por Despido — PBA</h2>
      <p class="tool-desc">Conforme Ley 15.057 (Procedimiento Laboral) y CPCC de la Provincia de Buenos Aires (aplicación supletoria, art. 89)</p>

      <div id="dd-aviso-revision" style="display:block;background:#fff3cd;border:1px solid #d9a441;border-radius:6px;padding:10px 14px;margin-bottom:16px;font-size:.82rem;line-height:1.6;color:#5a4408">
        ⚠️ Herramienta en versión inicial, pendiente de revisión final por el Estudio antes de su uso en un caso real. Las citas normativas fueron verificadas contra fuentes oficiales (Ley 15.057, LCT, Ley 23.551, CPCC PBA) y actualizadas conforme la Ley 27.802 (B.O. 6/3/2026) y la Ley 27.742 (B.O. 8/7/2024), pero el escrito generado es un ANTEPROYECTO: revisar domicilio procesal, Bono de Derecho Fijo (Ley 8480) y particularidades del caso antes de presentar.
      </div>

      <div class="field-group">
        <label for="dd-causal">Causal del reclamo</label>
        <select id="dd-causal">
          ${CAUSALES.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}
        </select>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Profesional actuante y trámite</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group">
          <label for="dd-abogado-select">Abogado/a actuante</label>
          <select id="dd-abogado-select">
            ${ABOGADOS.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('')}
          </select>
        </div>
        <div class="field-group">
          <label for="dd-caracter-letrado">Carácter</label>
          <select id="dd-caracter-letrado">
            ${CARACTER_LETRADO.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}
          </select>
        </div>
        <div class="field-group"><label for="dd-matricula">Matrícula (Tomo/Folio y Colegio)</label><input type="text" id="dd-matricula" placeholder="T° __ F° __ CALZ / CASI"></div>
      </div>
      <p id="dd-abogado-info" style="font-size:.78rem;color:var(--color-muted);margin:-6px 0 10px"></p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group"><label for="dd-juzgado">Juzgado del Trabajo / Departamento Judicial</label><input type="text" id="dd-juzgado" placeholder="Juzgado del Trabajo N° _ del Departamento Judicial de La Plata"></div>
        <div class="field-group"><label for="dd-domicilio_procesal">Domicilio procesal a constituir (art. 40 CPCC)</label><input type="text" id="dd-domicilio_procesal" placeholder="calle y número, ciudad asiento del juzgado"></div>
        <div class="field-group"><label for="dd-email_notificaciones">Domicilio electrónico (notificaciones SCBA)</label><input type="text" id="dd-email_notificaciones"></div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del actor (trabajador/a) — art. 31 inc. a), Ley 15.057</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group"><label for="dd-actor_nombre">Nombre completo</label><input type="text" id="dd-actor_nombre" placeholder="Juan García"></div>
        <div class="field-group"><label for="dd-actor_dni">DNI</label><input type="text" id="dd-actor_dni" placeholder="12.345.678"></div>
        <div class="field-group"><label for="dd-actor_domicilio_real">Domicilio real</label><input type="text" id="dd-actor_domicilio_real" placeholder="calle 123, localidad"></div>
        <div class="field-group"><label for="dd-actor_edad">Edad</label><input type="number" id="dd-actor_edad" min="0"></div>
        <div class="field-group"><label for="dd-actor_nacionalidad">Nacionalidad</label><input type="text" id="dd-actor_nacionalidad" placeholder="argentina"></div>
        <div class="field-group"><label for="dd-actor_estado_civil">Estado civil</label><input type="text" id="dd-actor_estado_civil" placeholder="soltero/a, casado/a, etc."></div>
        <div class="field-group"><label for="dd-actor_profesion">Profesión / oficio</label><input type="text" id="dd-actor_profesion" placeholder="operario/a, administrativo/a, etc."></div>
      </div>
      <div id="dd-actores-extra-wrapper" style="display:flex;flex-direction:column;gap:6px;margin-top:8px"></div>
      <div class="form-row" style="justify-content:flex-start;margin-top:4px">
        <button class="btn btn-ghost" id="dd-add-actor" type="button">+ Agregar coactor/a</button>
      </div>
      <p style="font-size:.75rem;color:var(--color-muted);margin-top:4px">Los coactores agregados se listan en el encabezamiento y en el objeto de la demanda. El relato de hechos y la liquidación siguen los datos laborales del actor principal cargado arriba — ajustar manualmente si cada coactor tuviera antigüedad/remuneración propias.</p>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del demandado (empleador) — art. 31 inc. b), Ley 15.057</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group"><label for="dd-empleador_nombre">Nombre / razón social</label><input type="text" id="dd-empleador_nombre" placeholder="Empresa S.A."></div>
        <div class="field-group"><label for="dd-empleador_domicilio">Domicilio</label><input type="text" id="dd-empleador_domicilio" placeholder="calle 456, localidad"></div>
        <div class="field-group"><label for="dd-empleador_cuit">CUIT (opcional, para prueba informativa)</label><input type="text" id="dd-empleador_cuit" placeholder="30-12345678-9"></div>
      </div>
      <div id="dd-demandados-extra-wrapper" style="display:flex;flex-direction:column;gap:6px;margin-top:8px"></div>
      <div class="form-row" style="justify-content:flex-start;margin-top:4px">
        <button class="btn btn-ghost" id="dd-add-demandado" type="button">+ Agregar codemandado/a</button>
      </div>
      <p style="font-size:.75rem;color:var(--color-muted);margin-top:4px">Los codemandados agregados se listan en el encabezamiento y en el objeto de la demanda. El relato de hechos y la liquidación siguen los datos del demandado principal cargado arriba — ajustar manualmente si cada codemandado tuviera responsabilidad o datos propios.</p>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Relación laboral</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group"><label for="dd-fecha_ingreso">Fecha de ingreso</label><input type="date" id="dd-fecha_ingreso"></div>
        <div class="field-group"><label for="dd-fecha_egreso">Fecha de egreso / cese</label><input type="date" id="dd-fecha_egreso"></div>
        <div class="field-group"><label for="dd-categoria_tareas">Categoría / tareas desempeñadas</label><input type="text" id="dd-categoria_tareas" placeholder="operario especializado, CCT aplicable"></div>
        <div class="field-group"><label for="dd-jornada">Jornada</label><input type="text" id="dd-jornada" placeholder="completa, de lunes a viernes de 8 a 17 hs"></div>
        <div class="field-group"><label for="dd-remuneracion_mensual">Remuneración mensual, normal y habitual</label><input type="number" id="dd-remuneracion_mensual" min="0" step="0.01"></div>
        <div class="field-group"><label for="dd-registrado">Registración</label>
          <select id="dd-registrado">
            <option value="registrada">Debidamente registrada</option>
            <option value="no_registrada">No registrada ("en negro")</option>
            <option value="deficiente">Registrada de forma deficiente (fecha/monto incorrectos)</option>
          </select>
        </div>
      </div>

      <div id="dd-bloque-incausado" class="dd-bloque-causal" style="display:none">
        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del despido incausado</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
          <div class="field-group"><label for="dd-fecha_despido">Fecha del despido</label><input type="date" id="dd-fecha_despido"></div>
          <div class="field-group"><label for="dd-forma_comunicacion">Forma de comunicación</label><input type="text" id="dd-forma_comunicacion" placeholder="telegrama colacionado N°..., o verbalmente"></div>
        </div>
      </div>

      <div id="dd-bloque-indirecto" class="dd-bloque-causal" style="display:none">
        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del despido indirecto</div>
        <div class="field-group"><label for="dd-relato_incumplimiento">Incumplimiento/s patronal/es que motivaron la decisión</label><textarea id="dd-relato_incumplimiento" rows="2" placeholder="falta de pago de haberes, falta de registración, etc."></textarea></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
          <div class="field-group"><label for="dd-fecha_intimaciones">Fecha de la/s intimación/es previa/s</label><input type="date" id="dd-fecha_intimaciones"></div>
          <div class="field-group"><label for="dd-fecha_autodespido">Fecha en que se consideró despedido/a</label><input type="date" id="dd-fecha_autodespido"></div>
        </div>
      </div>

      <div id="dd-bloque-impugnacion" class="dd-bloque-causal" style="display:none">
        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos de la impugnación de causa</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
          <div class="field-group"><label for="dd-fecha_notificacion_causa">Fecha de notificación del despido con causa</label><input type="date" id="dd-fecha_notificacion_causa"></div>
        </div>
        <div class="field-group"><label for="dd-causa_invocada">Causa invocada por el empleador</label><textarea id="dd-causa_invocada" rows="2" placeholder="transcribir o resumir la causa invocada en la comunicación del despido"></textarea></div>
        <div class="field-group"><label for="dd-motivos_improcedencia">Motivos de improcedencia de la causa</label><textarea id="dd-motivos_improcedencia" rows="2" placeholder="por qué la causa invocada no reúne entidad, proporcionalidad y/o contemporaneidad"></textarea></div>
      </div>

      <div id="dd-bloque-estabilidad" class="dd-bloque-causal" style="display:none">
        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos de la estabilidad especial</div>
        <div class="field-group">
          <label for="dd-tipo_estabilidad">Tipo de estabilidad invocada</label>
          <select id="dd-tipo_estabilidad">${TIPOS_ESTABILIDAD.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}</select>
        </div>
        <div class="field-group"><label for="dd-fundamento_estabilidad">Fundamento fáctico de la estabilidad</label><textarea id="dd-fundamento_estabilidad" rows="2" placeholder="fecha de postulación/elección como delegado/a; fecha de notificación de embarazo; fecha de matrimonio y notificación al empleador; etc."></textarea></div>
        <label style="display:flex;align-items:center;gap:8px;font-weight:400;margin-top:6px">
          <input type="checkbox" id="dd-via_administrativa_agotada" style="width:auto">
          Se agotó una instancia administrativa previa vinculada a la estabilidad invocada (art. 31 inc. i, Ley 15.057)
        </label>
        <div class="field-group" style="margin-top:8px"><label for="dd-via_administrativa_detalle">Detalle de dicha instancia (si corresponde)</label><input type="text" id="dd-via_administrativa_detalle" placeholder="expediente, organismo, fecha"></div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Rubros reclamados y liquidación — art. 31 incs. c) y f), Ley 15.057</div>
      <div id="dd-rubros" style="display:flex;flex-direction:column;gap:6px">
        ${RUBROS.map(r => `
          <div style="display:flex;align-items:center;gap:10px">
            <input type="checkbox" class="dd-rubro-check" data-rubro="${r.id}" style="width:auto">
            <label style="flex:1;font-weight:400;margin:0" for="dd-monto-${r.id}">${r.label}</label>
            <input type="number" min="0" step="0.01" class="dd-rubro-monto" id="dd-monto-${r.id}" placeholder="0.00" style="width:160px" disabled>
          </div>`).join('')}
        <div class="field-group" id="dd-wrap-otro_detalle" style="display:none;margin-top:6px"><label for="dd-otro_detalle">Detalle del "otro concepto"</label><input type="text" id="dd-otro_detalle"></div>
      </div>
      <div style="text-align:right;margin-top:10px;font-weight:700;color:var(--color-accent)">Total reclamado: $ <span id="dd-total">0,00</span></div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Prueba ofrecida — art. 31 inc. g), Ley 15.057</div>
      <div class="field-group"><label for="dd-actor_cuil">CUIL del actor (para oficios a ARCA / organismos de la Seguridad Social)</label><input type="text" id="dd-actor_cuil" placeholder="20-12345678-9"></div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:8px">
        <p style="font-weight:700;margin:0 0 8px">1. Prueba Documental</p>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${DOCUMENTALES.map(p => `
            <div>
              <label style="display:flex;align-items:center;gap:10px;font-weight:400">
                <input type="checkbox" class="dd-documental-check" data-documental="${p.id}" style="width:auto"> ${p.label}
              </label>
              ${p.pideDato ? `<input type="text" class="dd-documental-dato" data-documental-dato="${p.id}" placeholder="${p.placeholder}" style="display:none;margin-top:4px;width:100%" disabled>` : ''}
            </div>`).join('')}
        </div>
      </div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:10px">
        <label style="display:flex;align-items:center;gap:10px;font-weight:700">
          <input type="checkbox" id="dd-prueba-confesional" style="width:auto" checked> 2. Prueba Confesional
        </label>
        <div id="dd-wrap-confesional" style="margin-top:8px">
          <div class="form-row" style="justify-content:flex-start">
            <button class="btn btn-ghost" id="dd-sugerir-pliego" type="button">Sugerir pliego</button>
          </div>
          <textarea id="dd-confesional_pliego" rows="5" style="width:100%;margin-top:6px" placeholder="a) ...que el actor trabajó a las órdenes de la demandada en relación de dependencia laboral; b) ...que ingresó el .../.../....; c) ...que se desempeñaba como ...; d) ...que percibía una remuneración de $ ... mensuales; e) Me reservo el derecho de ampliar."></textarea>
        </div>
      </div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:10px">
        <label style="display:flex;align-items:center;gap:10px;font-weight:700">
          <input type="checkbox" id="dd-prueba-doc_demandada" style="width:auto"> 3. Documental en poder de la demandada
        </label>
        <div id="dd-wrap-doc_demandada" style="margin-top:8px;display:none">
          <textarea id="dd-doc_demandada_detalle" rows="3" style="width:100%" placeholder="Libro especial art. 52 LCT, legajo personal, planillas horarias, recibos originales, registros de CARGOS SRL u otro tercero, etc."></textarea>
        </div>
      </div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:10px">
        <label style="display:flex;align-items:center;gap:10px;font-weight:700">
          <input type="checkbox" id="dd-prueba-testifical" style="width:auto"> 4. Prueba Testifical
        </label>
        <div id="dd-wrap-testifical" style="margin-top:8px;display:none">
          <div id="dd-testigos-wrapper" style="display:flex;flex-direction:column;gap:6px"></div>
          <div class="form-row" style="justify-content:flex-start;margin-top:6px">
            <button class="btn btn-ghost" id="dd-add-testigo" type="button">+ Agregar testigo (máx. 5)</button>
          </div>
        </div>
      </div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:10px">
        <label style="display:flex;align-items:center;gap:10px;font-weight:700">
          <input type="checkbox" id="dd-prueba-pericial" style="width:auto" checked> 5. Prueba Pericial Contable
        </label>
        <div id="dd-wrap-pericial" style="margin-top:8px">
          <div class="form-row" style="justify-content:flex-start">
            <button class="btn btn-ghost" id="dd-sugerir-pericial" type="button">Sugerir puntos de pericia</button>
          </div>
          <textarea id="dd-pericial_puntos" rows="6" style="width:100%;margin-top:6px" placeholder="Puntos de pericia a informar por el/la perito contador/a."></textarea>
        </div>
      </div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:10px">
        <p style="font-weight:700;margin:0 0 8px">6. Prueba Informativa</p>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${INFORMATIVAS.map(p => `
            <div>
              <label style="display:flex;align-items:center;gap:10px;font-weight:400">
                <input type="checkbox" class="dd-informativa-check" data-informativa="${p.id}" style="width:auto"> ${p.label}
              </label>
              ${p.pideDato ? `<input type="text" class="dd-informativa-dato" data-informativa-dato="${p.id}" placeholder="${p.placeholder}" style="display:none;margin-top:4px;width:100%" disabled>` : ''}
            </div>`).join('')}
        </div>
      </div>

      <div class="field-group" style="margin-top:10px"><label for="dd-prueba_otros">Otros medios de prueba (detallar)</label><textarea id="dd-prueba_otros" rows="2"></textarea></div>
      <div class="field-group">
        <label for="dd-archivos">Adjuntar archivos de referencia (recibos, telegramas, DNI, etc.)</label>
        <input type="file" id="dd-archivos" multiple>
        <p style="font-size:.75rem;color:var(--color-muted);margin-top:4px">
          Nota: esta herramienta no tiene servidor propio. Los archivos NO se suben ni se incrustan en el Word — solo se listan sus nombres en la sección de prueba, como recordatorio de qué acompañar físicamente/digitalmente ante el juzgado.
        </p>
      </div>

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:16px">
        <button class="btn btn-primary" id="dd-generar">Generar demanda</button>
        <button class="btn btn-ghost"   id="dd-limpiar">Limpiar</button>
      </div>

      <div id="dd-resultado" style="display:none;margin-top:24px">
        <label for="dd-texto" style="font-weight:600;display:block;margin-bottom:6px">Texto generado (editable)</label>
        <textarea id="dd-texto" rows="26" style="width:100%;resize:vertical;font-family:inherit;font-size:.88rem;padding:12px;border:1px solid var(--color-border);border-radius:6px;background:#ffffff;color:#1a1a1a;line-height:1.6"></textarea>
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px">
          <button class="btn btn-success" id="dd-copiar">📋 Copiar texto</button>
          <button class="btn btn-ghost"   id="dd-word">📝 Exportar Word (.doc editable)</button>
          <button class="btn btn-ghost"   id="dd-pdf">📄 Exportar PDF</button>
          <button class="btn btn-ghost"   id="dd-reset-texto">Restablecer</button>
        </div>
      </div>

      <p style="margin-top:24px;font-size:.78rem;color:var(--color-muted);border-top:1px solid var(--color-border);padding-top:12px">
        Anteproyecto de escrito judicial. Adaptar al caso concreto, verificar domicilio procesal, Bono Ley 8480 y tasa de justicia. No constituye asesoramiento legal.
      </p>
    </div>`;

  // ── Referencias ──────────────────────────────────────────────────────────
  const selCausal   = container.querySelector('#dd-causal');
  const selAbogado  = container.querySelector('#dd-abogado-select');
  const abogadoInfo = container.querySelector('#dd-abogado-info');
  const inputEmailNotif = container.querySelector('#dd-email_notificaciones');
  const divRes      = container.querySelector('#dd-resultado');
  const textarea    = container.querySelector('#dd-texto');
  const totalSpan   = container.querySelector('#dd-total');
  const chkOtroRubro = container.querySelector('[data-rubro="otro"]');
  const wrapOtroDet  = container.querySelector('#dd-wrap-otro_detalle');
  let ultimoTextoGenerado = '';

  const wrapActoresExtra = container.querySelector('#dd-actores-extra-wrapper');
  const wrapDemandadosExtra = container.querySelector('#dd-demandados-extra-wrapper');
  let actoresExtraCount = 0, demandadosExtraCount = 0;

  function agregarActorExtra() {
    actoresExtraCount++;
    const id = actoresExtraCount;
    const div = document.createElement('div');
    div.className = 'form-row';
    div.id = `dd-actor-extra-row-${id}`;
    div.innerHTML = `
      <div class="field-group" style="flex:2"><input type="text" id="dd-actor-extra-nombre-${id}" placeholder="Nombre completo del/de la coactor/a"></div>
      <div class="field-group" style="flex:1"><input type="text" id="dd-actor-extra-dni-${id}" placeholder="DNI"></div>
      <div class="field-group" style="flex:2"><input type="text" id="dd-actor-extra-domicilio-${id}" placeholder="Domicilio real"></div>
      <div class="field-group" style="flex:0;align-self:flex-end"><button class="btn btn-ghost" type="button" data-remove-actor="${id}">✕</button></div>`;
    wrapActoresExtra.appendChild(div);
    div.querySelector('[data-remove-actor]').addEventListener('click', () => div.remove());
  }

  function agregarDemandadoExtra() {
    demandadosExtraCount++;
    const id = demandadosExtraCount;
    const div = document.createElement('div');
    div.className = 'form-row';
    div.id = `dd-demandado-extra-row-${id}`;
    div.innerHTML = `
      <div class="field-group" style="flex:2"><input type="text" id="dd-demandado-extra-nombre-${id}" placeholder="Nombre / razón social del/de la codemandado/a"></div>
      <div class="field-group" style="flex:2"><input type="text" id="dd-demandado-extra-domicilio-${id}" placeholder="Domicilio"></div>
      <div class="field-group" style="flex:1"><input type="text" id="dd-demandado-extra-cuit-${id}" placeholder="CUIT (opcional)"></div>
      <div class="field-group" style="flex:0;align-self:flex-end"><button class="btn btn-ghost" type="button" data-remove-demandado="${id}">✕</button></div>`;
    wrapDemandadosExtra.appendChild(div);
    div.querySelector('[data-remove-demandado]').addEventListener('click', () => div.remove());
  }

  container.querySelector('#dd-add-actor').addEventListener('click', agregarActorExtra);
  container.querySelector('#dd-add-demandado').addEventListener('click', agregarDemandadoExtra);

  function leerActoresExtra() {
    return Array.from(wrapActoresExtra.querySelectorAll('[id^="dd-actor-extra-row-"]')).map(row => {
      const id = row.id.replace('dd-actor-extra-row-', '');
      return {
        nombre: container.querySelector(`#dd-actor-extra-nombre-${id}`)?.value.trim() || '',
        dni: container.querySelector(`#dd-actor-extra-dni-${id}`)?.value.trim() || '',
        domicilio: container.querySelector(`#dd-actor-extra-domicilio-${id}`)?.value.trim() || '',
      };
    }).filter(a => a.nombre);
  }

  function leerDemandadosExtra() {
    return Array.from(wrapDemandadosExtra.querySelectorAll('[id^="dd-demandado-extra-row-"]')).map(row => {
      const id = row.id.replace('dd-demandado-extra-row-', '');
      return {
        nombre: container.querySelector(`#dd-demandado-extra-nombre-${id}`)?.value.trim() || '',
        domicilio: container.querySelector(`#dd-demandado-extra-domicilio-${id}`)?.value.trim() || '',
        cuit: container.querySelector(`#dd-demandado-extra-cuit-${id}`)?.value.trim() || '',
      };
    }).filter(x => x.nombre);
  }

  // ── Prueba: toggles de bloque y detalle por ítem ────────────────────────
  function wireBloqueToggle(chkId, wrapId) {
    const chk = container.querySelector(`#${chkId}`);
    const wrap = container.querySelector(`#${wrapId}`);
    const actualizar = () => { wrap.style.display = chk.checked ? 'block' : 'none'; };
    chk.addEventListener('change', actualizar);
    actualizar();
  }
  wireBloqueToggle('dd-prueba-confesional', 'dd-wrap-confesional');
  wireBloqueToggle('dd-prueba-doc_demandada', 'dd-wrap-doc_demandada');
  wireBloqueToggle('dd-prueba-testifical', 'dd-wrap-testifical');
  wireBloqueToggle('dd-prueba-pericial', 'dd-wrap-pericial');

  container.querySelectorAll('.dd-documental-check').forEach(chk => {
    chk.addEventListener('change', () => {
      const input = container.querySelector(`[data-documental-dato="${chk.dataset.documental}"]`);
      if (input) { input.disabled = !chk.checked; input.style.display = chk.checked ? 'block' : 'none'; }
    });
  });
  container.querySelectorAll('.dd-informativa-check').forEach(chk => {
    chk.addEventListener('change', () => {
      const input = container.querySelector(`[data-informativa-dato="${chk.dataset.informativa}"]`);
      if (input) { input.disabled = !chk.checked; input.style.display = chk.checked ? 'block' : 'none'; }
    });
  });

  // ── Prueba testifical: testigos dinámicos (máx. 5) ──────────────────────
  const wrapTestigos = container.querySelector('#dd-testigos-wrapper');
  const btnAddTestigo = container.querySelector('#dd-add-testigo');
  const MAX_TESTIGOS = 5;
  let testigosCount = 0, testigosActivos = 0;

  function actualizarBotonTestigo() {
    btnAddTestigo.disabled = testigosActivos >= MAX_TESTIGOS;
    btnAddTestigo.textContent = testigosActivos >= MAX_TESTIGOS ? 'Máximo de 5 testigos alcanzado' : '+ Agregar testigo (máx. 5)';
  }

  function agregarTestigo() {
    if (testigosActivos >= MAX_TESTIGOS) return;
    testigosCount++; testigosActivos++;
    const id = testigosCount;
    const div = document.createElement('div');
    div.className = 'form-row';
    div.id = `dd-testigo-row-${id}`;
    div.innerHTML = `
      <div class="field-group" style="flex:2"><input type="text" id="dd-testigo-nombre-${id}" placeholder="Nombre y apellido"></div>
      <div class="field-group" style="flex:1"><input type="text" id="dd-testigo-dni-${id}" placeholder="DNI"></div>
      <div class="field-group" style="flex:3"><input type="text" id="dd-testigo-domicilio-${id}" placeholder="Domicilio: calle N°, localidad, partido, provincia"></div>
      <div class="field-group" style="flex:0;align-self:flex-end"><button class="btn btn-ghost" type="button" data-remove-testigo="${id}">✕</button></div>`;
    wrapTestigos.appendChild(div);
    div.querySelector('[data-remove-testigo]').addEventListener('click', () => { div.remove(); testigosActivos--; actualizarBotonTestigo(); });
    actualizarBotonTestigo();
  }
  btnAddTestigo.addEventListener('click', agregarTestigo);

  function leerTestigos() {
    return Array.from(wrapTestigos.querySelectorAll('[id^="dd-testigo-row-"]')).map(row => {
      const id = row.id.replace('dd-testigo-row-', '');
      return {
        nombre: container.querySelector(`#dd-testigo-nombre-${id}`)?.value.trim() || '',
        dni: container.querySelector(`#dd-testigo-dni-${id}`)?.value.trim() || '',
        domicilio: container.querySelector(`#dd-testigo-domicilio-${id}`)?.value.trim() || '',
      };
    }).filter(t => t.nombre);
  }

  // ── Sugerencias editables: pliego de confesional y puntos de pericia ────
  container.querySelector('#dd-sugerir-pliego').addEventListener('click', () => {
    const fecha = val('dd-fecha_ingreso') ? fmtFecha(val('dd-fecha_ingreso')) : '[FECHA DE INGRESO]';
    const categoria = val('dd-categoria_tareas') || '[CATEGORÍA Y TAREAS]';
    const remuneracion = val('dd-remuneracion_mensual') ? `$ ${fmtMoneda(parseFloat(val('dd-remuneracion_mensual')))}` : '[MONTO]';
    const nombreActor = val('dd-actor_nombre') || 'el/la actor/a';
    container.querySelector('#dd-confesional_pliego').value =
`Solicito se cite al representante legal de la demandada a absolver posiciones a tenor del siguiente interrogatorio, sin perjuicio del pliego que se acompañará oportunamente:
Jure que es cierto:
a) ...que ${nombreActor} trabajó a las órdenes de la demandada en relación de dependencia laboral;
b) ...que ingresó a trabajar el día ${fecha};
c) ...que se desempeñaba como ${categoria};
d) ...que percibía una remuneración de ${remuneracion} mensuales;
e) Me reservo el derecho de ampliar el presente interrogatorio.-`;
  });

  container.querySelector('#dd-sugerir-pericial').addEventListener('click', () => {
    const nombreActor = val('dd-actor_nombre') || 'el/la actor/a';
    container.querySelector('#dd-pericial_puntos').value =
`Se designe Perito Contador/a único/a de oficio para que, previo estudio de la documentación laboral, contable e impositiva de la demandada, informe:
a) Si la demandada lleva en legal forma el libro especial a que se refiere el art. 52 de la LCT; en caso afirmativo, si se encuentra rubricado, en qué fecha y a nombre de quién;
b) Fechas de ingreso y egreso de ${nombreActor}, informando asimismo si existen registros de la prestación de servicios a través de terceros (agencias, contratistas o empresas vinculadas);
c) Categoría laboral, tareas desempeñadas y horario cumplido por ${nombreActor};
d) Haberes percibidos por ${nombreActor} durante toda la relación laboral, mes a mes, discriminando lo correspondiente a salario básico, premios, horas extras y demás rubros remuneratorios;
e) Practique liquidación de los rubros reclamados en la presente demanda, conforme las pautas expuestas en el punto IV y los arts. 245 y ccdtes. de la LCT.`;
  });

  function actualizarAbogado() {
    const a = ABOGADOS_BY_ID[selAbogado.value];
    if (!a) return;
    inputEmailNotif.value = a.domicilioElectronico;
    container.querySelector('#dd-matricula').value = a.matricula;
    abogadoInfo.textContent = `Celular: ${a.celular}  ·  Email: ${EMAIL_ESTUDIO}`;
  }
  selAbogado.addEventListener('change', actualizarAbogado);
  actualizarAbogado();

  function fmtMoneda(n) {
    return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function actualizarBloqueCausal() {
    container.querySelectorAll('.dd-bloque-causal').forEach(b => b.style.display = 'none');
    const map = { incausado: '#dd-bloque-incausado', indirecto: '#dd-bloque-indirecto', impugnacion_causa: '#dd-bloque-impugnacion', estabilidad_especial: '#dd-bloque-estabilidad' };
    const sel = map[selCausal.value];
    if (sel) container.querySelector(sel).style.display = 'block';
  }

  function actualizarTotal() {
    let total = 0;
    container.querySelectorAll('.dd-rubro-check').forEach(chk => {
      const monto = container.querySelector(`#dd-monto-${chk.dataset.rubro}`);
      monto.disabled = !chk.checked;
      if (chk.checked) total += parseFloat(monto.value) || 0;
    });
    totalSpan.textContent = fmtMoneda(total);
    wrapOtroDet.style.display = chkOtroRubro.checked ? 'block' : 'none';
  }

  selCausal.addEventListener('change', actualizarBloqueCausal);
  container.querySelectorAll('.dd-rubro-check').forEach(chk => chk.addEventListener('change', actualizarTotal));
  container.querySelectorAll('.dd-rubro-monto').forEach(inp => inp.addEventListener('input', actualizarTotal));
  actualizarBloqueCausal();
  actualizarTotal();

  function val(id) { const el = container.querySelector(`#${id}`); return el ? el.value.trim() : ''; }
  function fmtFecha(iso) {
    if (!iso) return '';
    const p = iso.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
  }

  // ── Generar ──────────────────────────────────────────────────────────────
  container.querySelector('#dd-generar').addEventListener('click', () => {
    // Validación mínima
    const requeridos = ['dd-actor_nombre', 'dd-actor_dni', 'dd-empleador_nombre', 'dd-fecha_ingreso'];
    let ok = true;
    requeridos.forEach(id => {
      const el = container.querySelector(`#${id}`);
      el.classList.remove('error');
      if (!el.value.trim()) { el.classList.add('error'); ok = false; }
    });
    if (!ok) return;

    const causal = selCausal.value;

    const abogadoSel = ABOGADOS_BY_ID[selAbogado.value];
    const matricula = val('dd-matricula') || 'T° __ F° __';
    const caracterLetradoValor = val('dd-caracter-letrado') || 'patrocinante';
    const caracterLetradoTexto = caracterLetradoValor === 'apoderado' ? 'apoderado/a' : 'patrocinante';
    const d = {
      abogado: `Dr./Dra. ${abogadoSel.nombre}, ${matricula}`,
      caracter_letrado: caracterLetradoTexto,
      juzgado: val('dd-juzgado'),
      domicilio_procesal: val('dd-domicilio_procesal') || '[DOMICILIO PROCESAL A CONSTITUIR]',
      email_notificaciones: val('dd-email_notificaciones') || abogadoSel.domicilioElectronico,
      actor_nombre: val('dd-actor_nombre'), actor_dni: val('dd-actor_dni'),
      actor_domicilio_real: val('dd-actor_domicilio_real') || '[DOMICILIO REAL]',
      actor_edad: val('dd-actor_edad'), actor_nacionalidad: val('dd-actor_nacionalidad') || 'argentina',
      actor_estado_civil: val('dd-actor_estado_civil'), actor_profesion: val('dd-actor_profesion'),
      empleador_nombre: val('dd-empleador_nombre'),
      empleador_domicilio: val('dd-empleador_domicilio') || '[DOMICILIO DEL DEMANDADO]',
      empleador_cuit: val('dd-empleador_cuit'),
      fecha_ingreso: fmtFecha(val('dd-fecha_ingreso')), fecha_egreso: fmtFecha(val('dd-fecha_egreso')),
      categoria_tareas: val('dd-categoria_tareas') || '[CATEGORÍA Y TAREAS]',
      jornada: val('dd-jornada') || '[JORNADA]',
      remuneracion_mensual: val('dd-remuneracion_mensual'),
      registrado: val('dd-registrado'),
      fecha_despido: fmtFecha(val('dd-fecha_despido')), forma_comunicacion: val('dd-forma_comunicacion'),
      relato_incumplimiento: val('dd-relato_incumplimiento') || '[DESCRIBIR INCUMPLIMIENTO/S PATRONAL/ES]',
      fecha_intimaciones: fmtFecha(val('dd-fecha_intimaciones')), fecha_autodespido: fmtFecha(val('dd-fecha_autodespido')),
      fecha_notificacion_causa: fmtFecha(val('dd-fecha_notificacion_causa')),
      causa_invocada: val('dd-causa_invocada') || '[TRANSCRIBIR CAUSA INVOCADA]',
      motivos_improcedencia: val('dd-motivos_improcedencia') || '[DESARROLLAR MOTIVOS DE IMPROCEDENCIA]',
      tipo_estabilidad: val('dd-tipo_estabilidad'),
      fundamento_estabilidad: val('dd-fundamento_estabilidad') || '[FUNDAMENTO FÁCTICO DE LA ESTABILIDAD]',
      via_administrativa_agotada: container.querySelector('#dd-via_administrativa_agotada').checked,
      via_administrativa_detalle: val('dd-via_administrativa_detalle'),
      prueba_otros: val('dd-prueba_otros'),
    };

    // ── Datos de contexto para la justificación de cada rubro ──────────────
    const isoIngreso = val('dd-fecha_ingreso');
    const isoCese = val('dd-fecha_egreso') || val('dd-fecha_despido') || val('dd-fecha_autodespido') || val('dd-fecha_notificacion_causa') || '';
    const antiguedad = calcularAntiguedad(isoIngreso, isoCese);
    const añosComp = añosComputablesLCT(antiguedad);
    const remuneracionNum = parseFloat(val('dd-remuneracion_mensual')) || 0;
    const infoIntegracion = diasRestantesMes(isoCese);
    const infoSemestre = semestreInfo(isoCese);
    const tipoEstabilidadSel = val('dd-tipo_estabilidad');

    function justificarRubro(id, monto) {
      const m = fmtMoneda(monto);
      switch (id) {
        case 'indemnizacion_antiguedad': {
          const antTexto = añosComp ? `${añosComp} año${añosComp === 1 ? '' : 's'}` : '[antigüedad a determinar conforme prueba]';
          const baseConSac = remuneracionNum * (13 / 12);
          const baseTexto = remuneracionNum
            ? `$ ${fmtMoneda(baseConSac)} (mejor remuneración mensual, normal y habitual de $ ${fmtMoneda(remuneracionNum)}, con más la incidencia del Sueldo Anual Complementario)`
            : '[BASE DE CÁLCULO A DETERMINAR]';
          return `Indemnización por antigüedad (art. 245, LCT): corresponde el pago de la indemnización por despido prevista en el art. 245 de la Ley de Contrato de Trabajo, equivalente a un mes de la mejor remuneración mensual, normal y habitual devengada durante el último año de prestación de servicios (o durante el tiempo de servicio, si éste fuera menor), con más la incidencia del Sueldo Anual Complementario sobre dicha base, conforme la doctrina de la Suprema Corte de Justicia de la Provincia de Buenos Aires [CITAR PRECEDENTE SCBA — no resulta de aplicación en esta jurisdicción el Plenario N° 322 "Tulosai" de la CNAT, que rige solo en el fuero nacional/CABA], por cada año de antigüedad o fracción mayor de tres meses. Con una antigüedad computable de ${antTexto} y una base de cálculo de ${baseTexto}, se reclama por este concepto la suma de $ ${m}.`;
        }
        case 'preaviso': {
          let mesesTexto, antTexto;
          if (antiguedad) {
            mesesTexto = antiguedad.años > 5 ? 'dos (2) meses' : 'un (1) mes';
            antTexto = `${antiguedad.años} año${antiguedad.años === 1 ? '' : 's'} y ${antiguedad.meses} mes${antiguedad.meses === 1 ? '' : 'es'}`;
          } else {
            mesesTexto = 'un (1) mes o dos (2) meses, según la antigüedad que en definitiva se acredite';
            antTexto = '[antigüedad a verificar conforme documentación]';
          }
          return `Preaviso (arts. 231 y 232, LCT): la demandada omitió otorgar el preaviso de ley, por lo que corresponde el pago de la indemnización sustitutiva equivalente a ${mesesTexto} de remuneración, en virtud de la antigüedad acreditada (${antTexto} de servicio, art. 231, LCT), con más la incidencia proporcional del Sueldo Anual Complementario sobre dicho concepto (art. 233, LCT). Se reclama por este rubro la suma de $ ${m}.`;
        }
        case 'integracion': {
          if (infoIntegracion && infoIntegracion.restantes > 0) {
            return `Integración del mes de despido (art. 233, LCT): el distracto se produjo restando ${infoIntegracion.restantes} día${infoIntegracion.restantes === 1 ? '' : 's'} para la finalización del mes de ${infoIntegracion.mes} de ${infoIntegracion.anio}; en consecuencia, se reclama la integración del mes de despido equivalente a dicho lapso, con más la incidencia del Sueldo Anual Complementario (art. 233, LCT), por la suma de $ ${m}.`;
          }
          if (infoIntegracion) {
            return `Integración del mes de despido (art. 233, LCT): sin perjuicio de que el distracto se produjo el último día del mes de ${infoIntegracion.mes} de ${infoIntegracion.anio} — supuesto en el cual, en principio, no correspondería este rubro conforme el art. 233, LCT —, se lo reclama a todo evento por la suma de $ ${m}, sujeto a lo que en definitiva surja de la prueba a producirse.`;
          }
          return `Integración del mes de despido (art. 233, LCT): se reclama la integración del mes de despido conforme el art. 233 de la LCT, por la suma de $ ${m}.`;
        }
        case 'sac_proporcional': {
          if (infoSemestre) {
            return `Sueldo Anual Complementario proporcional (art. 123, LCT): habiéndose producido el cese en el ${infoSemestre.numero} semestre del año ${infoSemestre.anio}, se reclama el Sueldo Anual Complementario proporcional al tiempo trabajado en dicho semestre, calculado sobre el cincuenta por ciento (50%) de la mayor remuneración mensual, normal y habitual devengada en el período (art. 123, LCT), por la suma de $ ${m}.`;
          }
          return `Sueldo Anual Complementario proporcional (art. 123, LCT): se reclama el Sueldo Anual Complementario proporcional al tiempo trabajado en el semestre respectivo, por la suma de $ ${m}.`;
        }
        case 'vacaciones': {
          const anioVac = infoIntegracion ? infoIntegracion.anio : (infoSemestre ? infoSemestre.anio : '[AÑO]');
          return `Vacaciones proporcionales no gozadas (arts. 150, 153 y 156, LCT): se reclama el pago de las vacaciones proporcionales correspondientes al año ${anioVac}, no gozadas ni abonadas a la fecha del distracto, calculadas en base a un día de descanso por cada veinte (20) días de trabajo efectivo (art. 153, LCT), con más la incidencia del Sueldo Anual Complementario (art. 156, LCT), por la suma de $ ${m}.`;
        }
        case 'salarios_adeudados':
          return `Salarios adeudados: se reclama el pago de las remuneraciones devengadas y no abonadas por la demandada, correspondientes a los períodos que se acreditarán en la etapa probatoria, por la suma de $ ${m}.`;
        case 'ley25323_art1': {
          const tipoRegistro = d.registrado === 'no_registrada' ? 'no registrada ("en negro")' : d.registrado === 'deficiente' ? 'registrada en forma deficiente (fecha de ingreso y/o remuneración consignadas por debajo de la real)' : 'irregularmente registrada';
          return `Daño y perjuicio por registración deficiente u omitida: la relación laboral fue ${tipoRegistro}, incumplimiento que — conforme los fundamentos desarrollados en el punto III — configura una fuente autónoma de responsabilidad civil que afecta además los aportes previsionales de la parte actora en perjuicio de su futura jubilación. A fin de cuantificar este daño, se solicita se lo gradúe en el equivalente al doble de las indemnizaciones de los arts. 232, 233 y 245 de la LCT (pauta objetiva ex art. 1, Ley 25.323, hoy derogado) y/o lo que V.E. considere una justa recomposición del perjuicio sufrido, reclamándose por este concepto la suma de $ ${m}.`;
        }
        case 'ley25323_art2':
          return `Daño y perjuicio por falta de pago en término de las indemnizaciones: la demora imputable a la demandada en el pago de las indemnizaciones derivadas de la ruptura del vínculo excede el simple retraso compensable con el interés moratorio, en tanto dichas acreencias revisten carácter alimentario (arts. 103, 116 y ccdtes., LCT) y su percepción oportuna resulta indispensable para que la parte actora pueda afrontar sus necesidades básicas hasta su reinserción laboral (art. 19, CN; arts. 1708 y ss., CCCN; cfr. Ossola, Responsabilidad civil, 2ª ed., Abeledo-Perrot, 2024, p. 367). A fin de cuantificar este daño, se solicita se lo gradúe en el cincuenta por ciento (50%) de las indemnizaciones de los arts. 232, 233 y 245 de la LCT (pauta objetiva ex art. 2, Ley 25.323, hoy derogado) y/o lo que V.E. considere una justa recomposición del perjuicio sufrido, reclamándose por este concepto la suma de $ ${m}.`;
        case 'art80_lct':
          return `Daño y perjuicio por falta de entrega de certificados de trabajo: el incumplimiento de la demandada a su obligación de entregar el certificado de trabajo con los datos reales de la relación laboral (art. 80, LCT; art. 1° de la Ley 24.576) le genera a la parte actora la imposibilidad de acreditar su calificación profesional y experiencia frente a futuros empleadores, configurando un daño cierto y una pérdida de chance que no requieren prueba específica por hallarse la confección y entrega del certificado en cabeza exclusiva de la patronal (arts. 1737, 1738 y 1739, CCCN; SCBA, causa L. 105.726, "Mac Garrell, Esteban c/ Atento Holding Telecomunicaciones y ots. s/ Despido"; CNAT, Sala VI, Expte. N° 10785/00, "Sequeira, Pedro c/ Fomec S.A. s/ despido"). A fin de cuantificar este daño, se solicita se lo gradúe en el equivalente a tres (3) remuneraciones percibidas por la parte actora (pauta objetiva ex art. 45, Ley 25.345, hoy derogado) y/o lo que V.E. considere una justa recomposición del perjuicio sufrido, reclamándose por este concepto la suma de $ ${m}.`;
        case 'ley24013': {
          const tipoRegistro2 = d.registrado === 'no_registrada' ? 'no registrada' : d.registrado === 'deficiente' ? 'registrada en forma deficiente' : 'irregularmente registrada';
          return `Daño y perjuicio por no registración o registración deficiente (Ley 24.013): sin perjuicio del rubro anterior, y en tanto la relación fue ${tipoRegistro2}, se reclama asimismo — con idéntico fundamento de derecho común expuesto en el punto III — la suma de $ ${m}, tomando como pauta objetiva de cuantificación las multas que preveían los arts. 8, 9, 10 y/o 15 de la Ley 24.013 (hoy derogados) y/o lo que V.E. considere una justa recomposición del perjuicio sufrido.`;
        }
        case 'indemnizacion_especial_estabilidad': {
          const fundamento = tipoEstabilidadSel === 'sindical'
            ? 'el art. 52 de la Ley 23.551, con más los salarios caídos hasta la efectiva reinstalación o hasta que la parte actora opte por la indemnización'
            : 'el art. 182 de la LCT, equivalente a trece (13) veces la remuneración mensual, normal y habitual';
          return `Indemnización especial por estabilidad: en virtud de la protección especial invocada en el punto II, corresponde el pago de la indemnización agravada prevista en ${fundamento}, por la suma de $ ${m}.`;
        }
        case 'dano_moral':
          return `Daño moral: se reclama la reparación del daño moral sufrido por mi mandante a raíz del obrar antijurídico de la demandada, en los términos de los arts. 1737, 1738 y 1741 del Código Civil y Comercial de la Nación, por la suma de $ ${m}.`;
        case 'otro': {
          const detalle = val('dd-otro_detalle');
          return detalle
            ? `${detalle}: se reclama por este concepto la suma de $ ${m}.`
            : `Otro concepto reclamado: se reclama la suma de $ ${m}, cuyo detalle y fundamento se desarrollará conforme el caso concreto.`;
        }
        default:
          return `Se reclama la suma de $ ${m}.`;
      }
    }

    // Rubros — liquidación con justificación desarrollada de cada concepto
    let total = 0;
    const rubrosTexto = [];
    let nRubro = 0;
    RUBROS.forEach(r => {
      const chk = container.querySelector(`[data-rubro="${r.id}"]`);
      if (chk.checked) {
        const monto = parseFloat(container.querySelector(`#dd-monto-${r.id}`).value) || 0;
        total += monto;
        nRubro++;
        rubrosTexto.push(`${nRubro}.- ${justificarRubro(r.id, monto)}`);
      }
    });

    const rubroActivo = (id) => container.querySelector(`[data-rubro="${id}"]`).checked;

    const actoresExtra = leerActoresExtra();
    const demandadosExtra = leerDemandadosExtra();
    const coactoresTexto = joinConY(actoresExtra.map(a => `${a.nombre}, DNI ${a.dni || '[DNI]'}${a.domicilio ? `, con domicilio real en ${a.domicilio}` : ''}`));
    const demandadosNombres = [d.empleador_nombre, ...demandadosExtra.map(x => x.nombre)];
    const demandadosTextoObjeto = joinConY([
      `${d.empleador_nombre}, con domicilio en ${d.empleador_domicilio}${d.empleador_cuit ? `, CUIT ${d.empleador_cuit}` : ''}`,
      ...demandadosExtra.map(x => `${x.nombre}, con domicilio en ${x.domicilio || '[DOMICILIO]'}${x.cuit ? `, CUIT ${x.cuit}` : ''}`),
    ]);
    const demandadosTextoPetitorio = joinConY(demandadosNombres);

    // ── Hechos según causal ──────────────────────────────────────────────
    const registradoTexto = {
      registrada: 'encontrándose la relación debidamente registrada',
      no_registrada: 'sin encontrarse la relación laboral registrada, conforme lo dispuesto por la Ley 24.013',
      deficiente: 'encontrándose la relación registrada en forma deficiente (fecha de ingreso y/o remuneración consignadas por debajo de la real), conforme lo dispuesto por la Ley 24.013',
    }[d.registrado] || 'conforme surge de la documentación que se acompaña';

    let hechosCausal = '';
    if (causal === 'incausado') {
      hechosCausal = `Que con fecha ${d.fecha_despido || '[FECHA DEL DESPIDO]'}, la parte demandada procedió a despedir a mi mandante${d.forma_comunicacion ? `, mediante ${d.forma_comunicacion}` : ''}, sin invocar causa alguna que lo justificara, colocando a mi mandante en situación de despido incausado y generando su derecho a percibir las indemnizaciones previstas en los arts. 232, 233 y 245 de la Ley de Contrato de Trabajo N° 20.744 (t.o. 1976).`;
    } else if (causal === 'indirecto') {
      hechosCausal = `Que en virtud de ${d.relato_incumplimiento}, mi mandante cursó a la demandada la/s intimación/es fehaciente/s de fecha ${d.fecha_intimaciones || '[FECHA DE INTIMACIÓN]'} (documental que se acompaña), sin que la accionada regularizara su situación. Ante la persistencia del incumplimiento, mi mandante se consideró despedido/a por exclusiva culpa de la demandada con fecha ${d.fecha_autodespido || '[FECHA DE AUTODESPIDO]'}, en los términos del art. 246 de la LCT, generando su derecho a percibir las indemnizaciones de los arts. 232, 233 y 245 de dicho cuerpo legal.`;
    } else if (causal === 'impugnacion_causa') {
      hechosCausal = `Que con fecha ${d.fecha_notificacion_causa || '[FECHA]'}, la demandada notificó a mi mandante su despido, invocando como causa: "${d.causa_invocada}". Que dicha causa se impugna expresamente por resultar improcedente, por cuanto ${d.motivos_improcedencia}, no reuniendo la entidad, proporcionalidad y contemporaneidad exigidas por el art. 242 de la LCT para justificar la extinción del vínculo con justa causa, por lo que corresponde estar a las indemnizaciones de los arts. 232, 233 y 245 de la LCT.`;
    } else if (causal === 'estabilidad_especial') {
      const fundNormativo = { sindical: 'arts. 47 y 52 de la Ley 23.551 de Asociaciones Sindicales', maternidad: 'arts. 177, 178 y 182 de la LCT', matrimonio: 'arts. 181 y 182 de la LCT' }[d.tipo_estabilidad];
      hechosCausal = `Que mi mandante gozaba de estabilidad especial en razón de ${d.fundamento_estabilidad}, circunstancia que la demandada conocía o debía conocer, encontrándose amparado/a por ${fundNormativo}. No obstante ello, la demandada procedió a su despido${d.fecha_despido ? ` con fecha ${d.fecha_despido}` : ''} sin observar el procedimiento y/o los recaudos legales correspondientes.${d.via_administrativa_agotada ? ` Se deja constancia de haberse agotado la instancia administrativa previa vinculada (${d.via_administrativa_detalle || 'ver documental adjunta'}), en los términos del art. 31 inc. i) de la Ley 15.057.` : ''}`;
    }

    // ── Derecho dinámico ─────────────────────────────────────────────────
    let derecho = `Fundo el presente en lo dispuesto por los arts. 232, 233 y 245 de la Ley de Contrato de Trabajo N° 20.744 (t.o. 1976)`;
    if (causal === 'indirecto') derecho += `, en función del art. 246 de la LCT`;
    if (causal === 'impugnacion_causa') derecho += `, y en la improcedencia de la causa invocada a la luz del art. 242 de la LCT`;
    if (causal === 'estabilidad_especial') {
      const extra = { sindical: 'los arts. 47 y 52 de la Ley 23.551', maternidad: 'los arts. 177, 178 y 182 de la LCT', matrimonio: 'los arts. 181 y 182 de la LCT' }[d.tipo_estabilidad];
      derecho += `, y ${extra}`;
    }
    const reclamaDanioDerogado = rubroActivo('ley25323_art1') || rubroActivo('ley25323_art2') || rubroActivo('art80_lct') || rubroActivo('ley24013');
    if (reclamaDanioDerogado) {
      derecho += `. En cuanto a los daños y perjuicios reclamados por registración deficiente u omitida, mora en el pago y/o falta de entrega de certificados de trabajo, cabe destacar que la indemnización tarifada del art. 245 de la LCT no repara cabal y completamente todos los daños padecidos por la parte actora, en particular aquellos cuyo origen es el incumplimiento de las obligaciones registrales y documentales que la legislación laboral pone en cabeza del empleador (arts. 7, 8, 9, 10, 52 y ccdtes., LCT; arts. 7 y 12, Ley 24.013). La eliminación de las denominadas "multas" laborales de los arts. 8, 9, 10 y 15 de la Ley 24.013, del art. 45 de la Ley 25.345 y de los arts. 1 y 2 de la Ley 25.323 (arts. 99, 100 y 55, Ley 27.742/DNU 70/2023) no elimina la obligación de reparar el daño causado, que subsiste con fundamento en el derecho común, quedando habilitada su reclamación con sustento en los arts. 1716, 1717, 1722, 1737, 1738, 1739, 1740 y 1741 del Código Civil y Comercial de la Nación (cfr. Ackerman, "Algunas posibles consecuencias de la eliminación o cambio de destino de las mal llamadas multas de las Leyes 24.013 y 25.323 y del artículo 80 de la Ley de Contrato de Trabajo", Revista de Derecho Laboral. Actualidad, n° 2018-I, Rubinzal-Culzoni, p. 119, esp. p. 122). Las fórmulas que preveían dichas normas hoy derogadas se invocan, en cada caso, como pauta objetiva y razonable de cuantificación del daño, sin perjuicio de que V.E. fije el monto que considere una justa recomposición del perjuicio sufrido`;
    }
    derecho += `. En cuanto a los requisitos formales de la presente, se estará a lo dispuesto por el art. 31 de la Ley 15.057 de Procedimiento Laboral de la Provincia de Buenos Aires, siendo de aplicación supletoria el Código Procesal Civil y Comercial de la Provincia de Buenos Aires conforme lo dispone el art. 89 de la citada ley.`;

    const totalTexto = fmtMoneda(total);

    // ── Prueba — bloques numerados según la estructura del Estudio ─────────
    const archivos = Array.from(container.querySelector('#dd-archivos').files || []).map(f => f.name);
    const bloquesPrueba = [];
    let nProb = 0;
    const letrasProb = 'abcdefghijklmnopqrstuvwxyz';

    // 1. Documental
    const documentalesActivos = DOCUMENTALES.filter(p => container.querySelector(`[data-documental="${p.id}"]`).checked);
    if (documentalesActivos.length) {
      nProb++;
      const itemsDoc = documentalesActivos.map((p, i) => {
        const dato = p.pideDato ? (container.querySelector(`[data-documental-dato="${p.id}"]`)?.value.trim() || '[COMPLETAR DATO]') : '';
        return `${letrasProb[i]}) ${p.label}${dato ? `: ${dato}` : ''}`;
      }).join('; ');
      bloquesPrueba.push(`${nProb}.- Prueba Documental: Se acompaña la siguiente prueba documental: ${itemsDoc}. Se peticiona se la tenga por acompañada y por parte integrante de la presente, sin perjuicio de la que se ofrezca o produzca en el curso del proceso.`);
    }

    // 2. Confesional
    if (container.querySelector('#dd-prueba-confesional').checked) {
      nProb++;
      const pliego = val('dd-confesional_pliego') || 'Solicito se cite al representante legal de la demandada a absolver posiciones a tenor del pliego que se acompañará oportunamente.';
      bloquesPrueba.push(`${nProb}.- Prueba Confesional: ${pliego}`);
    }

    // 3. Documental en poder de la demandada
    if (container.querySelector('#dd-prueba-doc_demandada').checked) {
      nProb++;
      const detalleDD = val('dd-doc_demandada_detalle') || '[DETALLAR DOCUMENTACIÓN EN PODER DE LA DEMANDADA]';
      bloquesPrueba.push(`${nProb}.- Documental en poder de la demandada: Denuncio como documental en poder de la demandada: ${detalleDD}. Peticiono se libre cédula a fin de que la presente en autos, bajo apercibimiento de ley (arts. 385 y ccdtes., CPCC de la Provincia de Buenos Aires, de aplicación supletoria conforme art. 89, Ley 15.057).`);
    }

    // 4. Testifical
    if (container.querySelector('#dd-prueba-testifical').checked) {
      nProb++;
      const testigos = leerTestigos();
      if (testigos.length) {
        const nomina = testigos.map((t, i) => `${letrasProb[i]}).- ${t.nombre}, DNI ${t.dni || '[DNI]'}, con domicilio en ${t.domicilio || '[DOMICILIO COMPLETO]'}`).join('; ');
        bloquesPrueba.push(`${nProb}.- Prueba Testifical: Solicito se cite a prestar declaración testimonial a las siguientes personas: ${nomina}.-`);
      } else {
        bloquesPrueba.push(`${nProb}.- Prueba Testifical: Solicito se cite a prestar declaración testimonial a las personas que se individualizarán oportunamente [COMPLETAR NÓMINA DE TESTIGOS Y DOMICILIOS].`);
      }
    }

    // 5. Pericial contable
    if (container.querySelector('#dd-prueba-pericial').checked) {
      nProb++;
      const puntos = val('dd-pericial_puntos') || 'Se designe Perito Contador/a de oficio para que informe sobre los extremos de la presente demanda [DETALLAR PUNTOS DE PERICIA].';
      bloquesPrueba.push(`${nProb}.- Prueba Pericial Contable: ${puntos}`);
    }

    // 6. Informativa
    const informativasActivas = INFORMATIVAS.filter(p => container.querySelector(`[data-informativa="${p.id}"]`).checked);
    if (informativasActivas.length) {
      nProb++;
      const nBloque = nProb;
      const subitems = informativasActivas.map((p, i) => {
        const n = `${nBloque}.${i + 1}`;
        if (p.id === 'arca') {
          const cuil = val('dd-actor_cuil') || '[CUIL DEL ACTOR]';
          return `${n}.- Se libre Oficio a la Agencia de Recaudación y Control Aduanero (ARCA), a fin de que informe: a) si ${d.actor_nombre || 'el/la actor/a'}, CUIL ${cuil}, estuvo registrado/a como empleado/a de ${d.empleador_nombre || 'la demandada'}; b) en su caso, fechas de alta y baja de la relación laboral; c) si la demandada efectuó los aportes y contribuciones a los Organismos de la Seguridad Social durante el período comprendido entre el ${d.fecha_ingreso || '[FECHA DE INGRESO]'} y el ${d.fecha_egreso || '[FECHA DE EGRESO]'}.`;
        }
        if (p.id === 'bancos') {
          const entidad = container.querySelector('[data-informativa-dato="bancos"]')?.value.trim() || '[ENTIDAD/ES A OFICIAR]';
          return `${n}.- Se libre Oficio a ${entidad}, a fin de que informe sobre la acreditación de haberes a nombre de ${d.actor_nombre || 'el/la actor/a'} durante la relación laboral, y todo otro dato de interés para la causa.`;
        }
        if (p.id === 'correo') {
          return `${n}.- Se libre Oficio al Correo Oficial de la República Argentina S.A., a fin de que informe, para el caso de desconocimiento de las piezas postales acompañadas, sobre la autenticidad de su contenido y las fechas de envío y recepción.`;
        }
        return `${n}.- ${p.label}`;
      }).join('\n');
      bloquesPrueba.push(`${nProb}.- Prueba Informativa:\n${subitems}`);
    }

    if (archivos.length) { nProb++; bloquesPrueba.push(`${nProb}.- Documental adjunta como referencia: ${archivos.join(', ')}.`); }
    if (d.prueba_otros) { nProb++; bloquesPrueba.push(`${nProb}.- Otros medios de prueba: ${d.prueba_otros}`); }

    const pruebaTextoFinal = bloquesPrueba.join('\n\n');

    const texto =
`EXCMO. TRIBUNAL DEL TRABAJO${d.juzgado ? ` — ${d.juzgado}` : ''}:

${d.abogado}, en mi carácter de ${d.caracter_letrado} de ${d.actor_nombre}, DNI ${d.actor_dni}, con domicilio real en ${d.actor_domicilio_real}${coactoresTexto ? `, y de ${coactoresTexto}` : ''}, constituyendo domicilio procesal en ${d.domicilio_procesal} y domicilio electrónico en ${d.email_notificaciones} (art. 40, CPCC de la Provincia de Buenos Aires, de aplicación supletoria conforme art. 89, Ley 15.057), a V.E. respetuosamente me presento y digo:

I. OBJETO
Que vengo por el presente a promover demanda laboral contra ${demandadosTextoObjeto}, por cobro de la suma de $ ${totalTexto} (PESOS ${totalTexto}), o lo que en más o en menos resulte de la prueba a producirse en autos, con más sus intereses y costas, en virtud de los hechos y el derecho que a continuación se exponen.

II. HECHOS
Que ${d.actor_nombre}, DNI ${d.actor_dni}, de ${d.actor_edad || '[EDAD]'} años de edad, de nacionalidad ${d.actor_nacionalidad}, de estado civil ${d.actor_estado_civil || '[ESTADO CIVIL]'}, de profesión/oficio ${d.actor_profesion || '[PROFESIÓN U OFICIO]'}, ingresó a trabajar en relación de dependencia para la demandada con fecha ${d.fecha_ingreso}, desempeñando tareas de ${d.categoria_tareas}, cumpliendo una jornada de ${d.jornada}, percibiendo una remuneración mensual, normal y habitual de $ ${d.remuneracion_mensual ? fmtMoneda(parseFloat(d.remuneracion_mensual)) : '[MONTO]'}, ${registradoTexto}.

${hechosCausal}

III. EL DERECHO
${derecho}

IV. LIQUIDACIÓN
Que en virtud de lo expuesto, se practica a continuación la liquidación de los rubros indemnizatorios y sus diferencias, sin perjuicio de su reajuste conforme la prueba a producirse:

${rubrosTexto.length ? rubrosTexto.join('\n\n') : '- [DETALLAR RUBROS Y MONTOS]'}

TOTAL RECLAMADO: $ ${totalTexto}

V. PRUEBA
${pruebaTextoFinal || '- [DETALLAR MEDIOS DE PRUEBA OFRECIDOS]'}

VI. BENEFICIO DE GRATUIDAD
Que en mi carácter de trabajador/a, invoco el beneficio de gratuidad previsto en el art. 27 de la Ley 15.057, solicitando se me exima del pago de tasas por servicios judiciales, así como de toda caución real o personal para el pago de costas, gastos, honorarios o por la responsabilidad derivada de eventuales medidas cautelares.

VII. AUTORIZACIONES
Autorizo indistintamente a ${TODOS_ABOGADOS_TEXTO} a compulsar el expediente, tomar vista de las actuaciones, retirar y diligenciar cédulas, oficios, mandamientos, testimonios, copias y demás documentación, y a realizar cualquier otro trámite relacionado con las presentes actuaciones.

VIII. PETITORIO
Por lo expuesto, a V.E. solicito:
1) Me tenga por presentado, por parte y por constituido el domicilio procesal indicado.
2) Se tenga por promovida la presente demanda laboral contra ${demandadosTextoPetitorio}.
3) Se tenga presente la prueba ofrecida y se provea oportunamente su producción.
4) Se tenga presente el beneficio de gratuidad invocado (art. 27, Ley 15.057).
5) Se tengan presentes las autorizaciones conferidas en el punto VII.
6) Oportunamente, se haga lugar a la demanda en todas sus partes, condenando a la parte demandada al pago de la suma reclamada de $ ${totalTexto}, o lo que en más o en menos resulte de la prueba producida, con más sus intereses y costas.

PROVEER DE CONFORMIDAD,
SERÁ JUSTICIA.

──────────────────────────────────────────────
Recordatorios previos a la presentación (no forman parte del escrito):
- Verificar y acompañar el Bono de Derecho Fijo (Ley 8480), salvo que corresponda su exención por patrocinio gratuito.
- Verificar la exención de tasa de justicia conforme el beneficio de gratuidad invocado (art. 27, Ley 15.057).
- Verificar el Juzgado del Trabajo y Departamento Judicial competente según el domicilio del demandado o el lugar de prestación de tareas.
- Cotejar la liquidación practicada con las herramientas "Liquidación LCT", "Daños — Empleo No Registrado" y "Daños — Registro y Mora" del sitio.${reclamaDanioDerogado ? `
- ADVERTENCIA: se reclaman rubros de daño y perjuicio (registración deficiente, mora en el pago y/o falta de certificados) fundados en pautas de leyes hoy derogadas (Ley 25.323, arts. 8/9/10/15 Ley 24.013, art. 45 Ley 25.345). El art. 245 LCT (texto según art. 51, Ley 27.802) dispone que la indemnización por despido es "la única reparación procedente frente a la extinción sin justa causa... incluidos los reclamos de naturaleza civil". Entendemos que esta cláusula no alcanza a estos rubros por tratarse de incumplimientos autónomos y no de la extinción en sí, pero es una norma sin desarrollo jurisprudencial propio (vigente desde marzo de 2026): evaluar este riesgo interpretativo antes de presentar.
- Las citas de doctrina y jurisprudencia incorporadas en la justificación de los rubros de daño (Ackerman, Ossola, SCBA "Mac Garrell", CNAT "Sequeira") son un modelo orientativo: verificar su vigencia y pertinencia, y completar el relato con los datos fácticos del caso (intimaciones cursadas, fechas, medio y N° de telegrama/CD, etc.) antes de presentar.` : ''}${(actoresExtra.length || demandadosExtra.length) ? `
- LITISCONSORCIO: se cargaron ${actoresExtra.length} coactor/es y ${demandadosExtra.length} codemandado/s adicional/es. El relato de HECHOS, EL DERECHO y la LIQUIDACIÓN fueron redactados sobre los datos del actor y del demandado principales — revisar y adaptar manualmente esos puntos si los coactores/codemandados tuvieran datos, antigüedad, remuneración o rubros propios.` : ''}`;

    ultimoTextoGenerado = texto;
    textarea.value = texto;
    divRes.style.display = 'block';
    textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  container.querySelector('#dd-limpiar').addEventListener('click', () => {
    container.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], textarea').forEach(el => { el.value = ''; });
    container.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
    container.querySelector('#dd-registrado').selectedIndex = 0;
    selAbogado.selectedIndex = 0;
    container.querySelector('#dd-caracter-letrado').selectedIndex = 0;
    wrapActoresExtra.innerHTML = '';
    wrapDemandadosExtra.innerHTML = '';
    actoresExtraCount = 0;
    demandadosExtraCount = 0;
    wrapTestigos.innerHTML = '';
    testigosCount = 0; testigosActivos = 0;
    actualizarBotonTestigo();
    container.querySelector('#dd-prueba-confesional').checked = true;
    container.querySelector('#dd-prueba-pericial').checked = true;
    container.querySelectorAll('.dd-documental-dato, .dd-informativa-dato').forEach(el => { el.disabled = true; el.style.display = 'none'; });
    container.querySelector('#dd-wrap-confesional').style.display = 'block';
    container.querySelector('#dd-wrap-doc_demandada').style.display = 'none';
    container.querySelector('#dd-wrap-testifical').style.display = 'none';
    container.querySelector('#dd-wrap-pericial').style.display = 'block';
    actualizarAbogado();
    actualizarTotal();
    divRes.style.display = 'none';
    textarea.value = '';
    ultimoTextoGenerado = '';
  });

  container.querySelector('#dd-copiar').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      const btn = container.querySelector('#dd-copiar');
      const orig = btn.textContent;
      btn.textContent = 'Copiado ✓';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => prompt('Copie el texto:', texto));
  });

  container.querySelector('#dd-reset-texto').addEventListener('click', () => {
    if (ultimoTextoGenerado) textarea.value = ultimoTextoGenerado;
  });

  container.querySelector('#dd-word').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const htmlBody = texto.split('\n').map(linea => {
      if (!linea.trim()) return '<p>&nbsp;</p>';
      const negrita = /^(EXCMO\. TRIBUNAL|I\.|II\.|III\.|IV\.|V\.|VI\.|VII\.|VIII\.|PROVEER|SERÁ JUSTICIA|TOTAL RECLAMADO|Recordatorios)/.test(linea.trim());
      const esc = linea.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<p style="margin:0 0 8pt 0;${negrita ? 'font-weight:bold;' : ''}">${esc}</p>`;
    }).join('\n');
    exportarWord(`Demanda laboral - ${val('dd-actor_nombre') || 'actor'} c. ${val('dd-empleador_nombre') || 'demandado'}`, htmlBody);
  });

  container.querySelector('#dd-pdf').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const lineas = texto.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    exportarPDF(`Demanda laboral — ${val('dd-actor_nombre') || 'actor'} c. ${val('dd-empleador_nombre') || 'demandado'}`, `<div class="info-box" style="font-size:12px;line-height:1.7">${lineas}</div>`);
  });
}
