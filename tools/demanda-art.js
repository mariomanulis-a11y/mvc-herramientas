// Generador de Demanda / Recurso — ART (Riesgos del Trabajo, Ley 24.557 y Ley 26.773)
// Instancia previa obligatoria ante Comisión Médica jurisdiccional (Ley 27.348, art. 1;
// adhesión de la Provincia de Buenos Aires por Ley 14.997). El plazo de apelación del
// dictamen es de 5 o 15 días hábiles según la Resolución SRT vigente al momento del
// dictamen (Res. 298/17 vs. Res. 179/15) — verificar en cada caso. La opción del art. 4,
// Ley 26.773 entre la vía tarifada (LRT) y la vía civil es excluyente e irrevocable.
import { exportarPDF, exportarWord } from './exportar.js';

export function initDemandaArt(container) {

  const EMAIL_ESTUDIO = 'mvcabogadospilar@gmail.com';
  const ABOGADOS = [
    { id: 'manulis',    nombre: 'Mario Martín Manulis',       genero: 'M', domicilioElectronico: '20271887931@notificaciones.scba.gov.ar', celular: '1153107794', matricula: 'T° 34 F° 69 CASI' },
    { id: 'velazquez',  nombre: 'Soledad Celeste Velazquez',  genero: 'F', domicilioElectronico: '27273872286@notificaciones.scba.gov.ar', celular: '1155781501', matricula: 'T° 36 F° 125 CASI' },
    { id: 'curbelo',    nombre: 'Yanina Daniela Curbelo',     genero: 'F', domicilioElectronico: '27268952867@notificaciones.scba.gov.ar', celular: '1149272774', matricula: 'T° 36 F° 90 CASI' },
    { id: 'poggi',      nombre: 'Camila Susana Poggi',        genero: 'F', domicilioElectronico: '27388231705@notificaciones.scba.gov.ar', celular: '1138224662', matricula: 'T° 55 F° 255 CASI' },
  ];
  const ABOGADOS_BY_ID = Object.fromEntries(ABOGADOS.map(a => [a.id, a]));
  const TODOS_ABOGADOS_TEXTO = 'los Dres./Dras. ' + ABOGADOS.map(a => `${a.nombre} (${a.matricula})`).join(' y/o ');

  function joinConY(arr) {
    const items = arr.filter(Boolean);
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    return items.slice(0, -1).join(', ') + ' y ' + items[items.length - 1];
  }

  const CARACTER_LETRADO = [
    { value: 'patrocinante', label: 'Letrado/a patrocinante' },
    { value: 'apoderado',    label: 'Apoderado/a' },
  ];

  // ── Materia y tipos ──────────────────────────────────────────────────────
  const MATERIAS = {
    riesgos_trabajo: {
      label: 'Riesgos del Trabajo (Ley 24.557 y Ley 26.773)',
      encuadre: 'en el marco del régimen de la Ley 24.557 de Riesgos del Trabajo y sus modificatorias (Leyes 26.773 y 27.348)',
      tipos: {
        apelacion_comision_medica: {
          label: 'Apelación del dictamen de Comisión Médica jurisdiccional (art. 2, Ley 27.348)',
          requiere: ['nombre','dni','domicilio','art_nombre','dom_art','fecha_siniestro','fecha_dictamen','contenido_dictamen'],
          opcionales: ['descripcion_hecho','fundamento_apelacion','parte_cuerpo'],
          hechos: d => `Que con fecha ${d.fecha_siniestro} la parte actora sufrió ${d.descripcion_hecho ? d.descripcion_hecho : 'el accidente de trabajo/enfermedad profesional que se relata'}${d.parte_cuerpo ? `, afectando ${d.parte_cuerpo}` : ''}, hecho oportunamente denunciado ante ${d.art_nombre}. Que sustanciado el trámite ante la Comisión Médica jurisdiccional, ésta emitió con fecha ${d.fecha_dictamen} el dictamen que se recurre, cuyo contenido consistió en: ${d.contenido_dictamen}. Que dicho pronunciamiento resulta agraviante para el/la trabajador/a por los fundamentos que se exponen en el punto siguiente.`,
          derecho: d => `Fundo el presente recurso en el art. 2 y concordantes de la Ley 27.348, y en la Ley 14.997 de adhesión de la Provincia de Buenos Aires al Título I de dicha ley, en cuanto habilitan la revisión del dictamen de la Comisión Médica jurisdiccional. ${d.fundamento_apelacion ? d.fundamento_apelacion : 'El dictamen recurrido no evalúa correctamente el nexo causal y/o el grado de incapacidad determinado, correspondiendo su revocación.'} [Verificar el plazo de interposición aplicable —5 o 15 días hábiles administrativos— según la Resolución SRT vigente a la fecha de notificación del dictamen (Res. SRT 298/17 o Res. SRT 179/15, respectivamente).]`,
        },
        accion_civil_art_4: {
          label: 'Acción civil por opción del art. 4, Ley 26.773 (vía del derecho común)',
          requiere: ['nombre','dni','domicilio','art_nombre','dom_art','empleador_nombre','dom_empleador','fecha_siniestro','descripcion_hecho'],
          opcionales: ['parte_cuerpo','monto_reclamado'],
          hechos: d => `Que con fecha ${d.fecha_siniestro} la parte actora, en ocasión y a consecuencia de su relación laboral con ${d.empleador_nombre}, sufrió el siguiente hecho dañoso: ${d.descripcion_hecho}${d.parte_cuerpo ? `, resultando afectada/o ${d.parte_cuerpo}` : ''}. Que la parte actora ejerce en este acto, en forma expresa, excluyente e irrevocable, la opción prevista en el art. 4 de la Ley 26.773 por la vía de reparación integral del derecho común, con renuncia a la acción tarifada del sistema de la Ley 24.557.`,
          derecho: d => `Fundo el presente en los arts. 1749, 1757 y 1758 del Código Civil y Comercial de la Nación (responsabilidad civil objetiva y subjetiva) y en el art. 4 de la Ley 26.773, que habilita la opción excluyente por la vía de la reparación integral del derecho común contra el empleador y/o la Aseguradora de Riesgos del Trabajo, según corresponda.${d.monto_reclamado ? ` Se reclama la suma de $ ${d.monto_reclamado} en concepto de reparación integral, o lo que en más o en menos resulte de la prueba a producirse.` : ''}`,
        },
        accion_contra_empleador_no_asegurado: {
          label: 'Acción directa contra empleador no asegurado (art. 28, Ley 24.557)',
          requiere: ['nombre','dni','domicilio','empleador_nombre','dom_empleador','fecha_siniestro','descripcion_hecho'],
          opcionales: ['parte_cuerpo','monto_reclamado'],
          hechos: d => `Que con fecha ${d.fecha_siniestro} la parte actora, en ocasión y a consecuencia de su relación laboral con ${d.empleador_nombre}, sufrió el siguiente hecho dañoso: ${d.descripcion_hecho}${d.parte_cuerpo ? `, resultando afectada/o ${d.parte_cuerpo}` : ''}. Que a la fecha del hecho, la demandada no había contratado seguro de riesgos del trabajo, encontrándose en infracción al deber de afiliación obligatoria previsto en el art. 3 de la Ley 24.557.`,
          derecho: d => `Fundo el presente en el art. 28 de la Ley 24.557, en cuanto establece la responsabilidad directa del empleador no asegurado por las prestaciones de dicha ley, sin perjuicio de la eventual intervención del Fondo de Garantía de la Ley de Riesgos del Trabajo (art. 33, Ley 24.557) ante la insolvencia del empleador.${d.monto_reclamado ? ` Se reclama la suma de $ ${d.monto_reclamado}, o lo que en más o en menos resulte de la prueba a producirse.` : ''}`,
        },
        cobro_prestaciones_dinerarias: {
          label: 'Cobro de prestaciones dinerarias reconocidas y no abonadas',
          requiere: ['nombre','dni','domicilio','art_nombre','dom_art','fecha_dictamen','monto_reclamado'],
          opcionales: ['contenido_dictamen'],
          hechos: d => `Que mediante ${d.contenido_dictamen ? d.contenido_dictamen : 'dictamen/acuerdo de la Comisión Médica jurisdiccional'} de fecha ${d.fecha_dictamen}, se reconoció a favor de la parte actora el derecho a percibir prestaciones dinerarias por la suma de $ ${d.monto_reclamado}, suma que la demandada no ha abonado a la fecha de la presente, pese a los reclamos efectuados.`,
          derecho: () => `Fundo el presente en los arts. 11 y siguientes de la Ley 24.557, que regulan las prestaciones dinerarias del sistema, y en las normas generales sobre mora del deudor (art. 886 y ccdtes., Código Civil y Comercial de la Nación), correspondiendo el pago con más los intereses moratorios desde que cada suma es debida.`,
        },
      },
    },
  };

  // ── Prueba: documental e informativa ────────────────────────────────────
  const DOCUMENTALES = [
    { id: 'denuncia_siniestro', label: 'Formulario de denuncia del siniestro ante la ART', pideDato: true,
      placeholder: 'Fecha y N° de denuncia' },
    { id: 'dictamen_cm',    label: 'Dictamen de Comisión Médica jurisdiccional/Central', pideDato: true,
      placeholder: 'Fecha y N° de expediente' },
    { id: 'historia_clinica', label: 'Historia clínica / estudios e informes médicos', pideDato: true,
      placeholder: 'Detalle (institución, fechas)' },
    { id: 'recibos_sueldo', label: 'Recibos de sueldo', pideDato: false },
    { id: 'otro',        label: 'Otro documento', pideDato: true,
      placeholder: 'Detalle del documento' },
  ];

  const INFORMATIVAS = [
    { id: 'srt',   label: 'Superintendencia de Riesgos del Trabajo (SRT)', pideDato: false },
    { id: 'comision_medica', label: 'Comisión Médica jurisdiccional/Central interviniente', pideDato: true,
      placeholder: 'N° de expediente administrativo' },
    { id: 'afip',  label: 'ARCA / AFIP (relación laboral y aportes)', pideDato: false },
    { id: 'empleador_terceros', label: 'Empleador y/o terceros', pideDato: true,
      placeholder: 'Detalle a informar' },
  ];

  // ── Campos (pool compartido) ─────────────────────────────────────────────
  const CAMPOS_CONFIG = [
    { id: 'nombre',          label: 'Nombre completo (trabajador/a)',     placeholder: 'Juan García',            tipo: 'text',     grupo: 'actor' },
    { id: 'dni',             label: 'DNI',                                placeholder: '12.345.678',              tipo: 'text',     grupo: 'actor' },
    { id: 'domicilio',       label: 'Domicilio real',                     placeholder: 'Calle 45 N° 850, La Plata', tipo: 'text',   grupo: 'actor' },

    { id: 'art_nombre',      label: 'ART demandada (razón social)',       placeholder: 'Aseguradora de Riesgos del Trabajo S.A.', tipo: 'text', grupo: 'demandado' },
    { id: 'dom_art',         label: 'Domicilio de la ART',                placeholder: 'Av. Corrientes 1234, CABA', tipo: 'text',   grupo: 'demandado' },
    { id: 'empleador_nombre', label: 'Empleador (razón social)',          placeholder: 'Comercial del Sur S.A.',  tipo: 'text',     grupo: 'demandado' },
    { id: 'dom_empleador',   label: 'Domicilio del empleador',            placeholder: 'Calle Falsa 123, Pilar',  tipo: 'text',     grupo: 'demandado' },

    { id: 'fecha_siniestro', label: 'Fecha del siniestro (accidente/primera manifestación)', placeholder: '', tipo: 'date', grupo: 'hecho' },
    { id: 'descripcion_hecho', label: 'Descripción del hecho',            placeholder: 'mecánica del accidente o modo de contracción de la enfermedad profesional', tipo: 'textarea', grupo: 'hecho' },
    { id: 'parte_cuerpo',    label: 'Parte del cuerpo afectada (opcional)', placeholder: 'mano derecha, columna lumbar', tipo: 'text', grupo: 'hecho' },
    { id: 'fecha_denuncia',  label: 'Fecha de denuncia ante la ART (opcional)', placeholder: '', tipo: 'date', grupo: 'hecho' },
    { id: 'monto_reclamado', label: 'Monto reclamado (si corresponde)',   placeholder: '5000000',                 tipo: 'number',   grupo: 'hecho' },

    { id: 'fecha_dictamen',  label: 'Fecha de notificación del dictamen de Comisión Médica', placeholder: '', tipo: 'date', grupo: 'comision_medica' },
    { id: 'contenido_dictamen', label: 'Contenido del dictamen', placeholder: '% de incapacidad determinado, rechazo de cobertura, alta médica, etc.', tipo: 'textarea', grupo: 'comision_medica' },
    { id: 'fundamento_apelacion', label: 'Fundamento de la apelación (opcional)', placeholder: 'por qué el dictamen es erróneo o insuficiente', tipo: 'textarea', grupo: 'comision_medica' },
  ];
  const CAMPOS_BY_ID = Object.fromEntries(CAMPOS_CONFIG.map(c => [c.id, c]));

  let materiaActual = Object.keys(MATERIAS)[0];

  // ── HTML ───────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Generador de Demanda / Recurso — ART</h2>
      <p class="tool-desc">Ley 24.557 y Ley 26.773 — apelación de Comisión Médica, opción del art. 4, y acciones conexas</p>

      <div style="display:block;background:#fff3cd;border:1px solid #d9a441;border-radius:6px;padding:10px 14px;margin-bottom:16px;font-size:.82rem;line-height:1.6;color:#5a4408">
        ⚠️ Herramienta en versión inicial, pendiente de revisión final por el Estudio antes de su uso en un caso real. La instancia ante la Comisión Médica jurisdiccional es previa y obligatoria (Ley 27.348, adhesión de la Provincia de Buenos Aires por Ley 14.997). Verificar en cada caso el plazo de apelación aplicable (5 o 15 días hábiles, según Res. SRT 298/17 o 179/15) y el carácter excluyente e irrevocable de la opción del art. 4, Ley 26.773, antes de presentar.
      </div>

      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="dart-materia">Materia</label>
          <select id="dart-materia">
            ${Object.entries(MATERIAS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
          </select>
        </div>
        <div class="field-group" style="flex:2">
          <label for="dart-tipo">Tipo de presentación</label>
          <select id="dart-tipo"></select>
        </div>
      </div>

      <div style="display:block;background:#fdeaea;border:1px solid #d97a7a;border-radius:6px;padding:10px 14px;margin:4px 0 16px;font-size:.82rem;line-height:1.6;color:#7a2020">
        ⚖️ Opción del art. 4, Ley 26.773 (excluyente e irrevocable):
        <select id="dart-opcion-ley26773" style="margin-top:6px">
          <option value="no_ejercida">Aún no ejercida</option>
          <option value="tarifada">Ejercida — vía tarifada (sistema LRT)</option>
          <option value="civil">Ejercida — vía civil (derecho común)</option>
        </select>
        <div style="margin-top:6px">Una vez ejercida esta opción no puede modificarse. Confirmar con el/la cliente antes de avanzar con la presentación.</div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Profesional actuante y trámite</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group">
          <label for="dart-abogado-select">Abogado/a actuante</label>
          <select id="dart-abogado-select">${ABOGADOS.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('')}</select>
        </div>
        <div class="field-group">
          <label for="dart-caracter-letrado">Carácter</label>
          <select id="dart-caracter-letrado">${CARACTER_LETRADO.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}</select>
        </div>
        <div class="field-group"><label for="dart-matricula">Matrícula (Tomo/Folio y Colegio)</label><input type="text" id="dart-matricula"></div>
      </div>
      <p id="dart-abogado-info" style="font-size:.78rem;color:var(--color-muted);margin:-6px 0 10px"></p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group"><label for="dart-juzgado">Juzgado / Fuero competente</label><input type="text" id="dart-juzgado" placeholder="Juzgado del Trabajo / Comisión Médica Central del Departamento Judicial de..."></div>
        <div class="field-group"><label for="dart-domicilio_procesal">Domicilio procesal a constituir (art. 40 CPCC)</label><input type="text" id="dart-domicilio_procesal"></div>
        <div class="field-group"><label for="dart-email_notificaciones">Domicilio electrónico (notificaciones SCBA)</label><input type="text" id="dart-email_notificaciones"></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px" id="dart-campos-wrapper">
        <div>
          <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del/de la trabajador/a</div>
          <div id="dart-grupo-actor"></div>
          <p style="font-weight:700;margin:10px 0 6px;font-size:.85rem">Coactores/as (opcional)</p>
          <div id="dart-actores-extra-wrapper" style="display:flex;flex-direction:column;gap:6px"></div>
          <div class="form-row" style="justify-content:flex-start;margin-top:6px">
            <button class="btn btn-ghost" id="dart-add-actor" type="button">+ Agregar coactor/a</button>
          </div>
        </div>
        <div>
          <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos de la/s demandada/s</div>
          <div id="dart-grupo-demandado"></div>
          <label style="display:flex;align-items:center;gap:8px;font-weight:400;margin-top:6px">
            <input type="checkbox" id="dart-empleador_asegurado" style="width:auto" checked>
            El empleador tenía contratado seguro de riesgos del trabajo al momento del hecho
          </label>
          <p style="font-weight:700;margin:10px 0 6px;font-size:.85rem">Codemandados/as adicionales (opcional)</p>
          <div id="dart-demandados-extra-wrapper" style="display:flex;flex-direction:column;gap:6px"></div>
          <div class="form-row" style="justify-content:flex-start;margin-top:6px">
            <button class="btn btn-ghost" id="dart-add-demandado" type="button">+ Agregar codemandado/a</button>
          </div>
        </div>
        <div style="grid-column:1/-1">
          <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del hecho</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px" id="dart-grupo-hecho"></div>
        </div>
        <div style="grid-column:1/-1">
          <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Comisión Médica</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px" id="dart-grupo-comision_medica"></div>
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Prueba ofrecida</div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:8px">
        <p style="font-weight:700;margin:0 0 8px">1. Prueba Documental</p>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${DOCUMENTALES.map(p => `
            <div>
              <label style="display:flex;align-items:center;gap:10px;font-weight:400">
                <input type="checkbox" class="dart-documental-check" data-documental="${p.id}" style="width:auto"> ${p.label}
              </label>
              ${p.pideDato ? `<input type="text" class="dart-documental-dato" data-documental-dato="${p.id}" placeholder="${p.placeholder}" style="display:none;margin-top:4px;width:100%" disabled>` : ''}
            </div>`).join('')}
        </div>
      </div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:10px">
        <label style="display:flex;align-items:center;gap:10px;font-weight:700">
          <input type="checkbox" id="dart-prueba-testifical" style="width:auto"> 2. Prueba Testifical
        </label>
        <div id="dart-wrap-testifical" style="margin-top:8px;display:none">
          <div id="dart-testigos-wrapper" style="display:flex;flex-direction:column;gap:6px"></div>
          <div class="form-row" style="justify-content:flex-start;margin-top:6px">
            <button class="btn btn-ghost" id="dart-add-testigo" type="button">+ Agregar testigo (máx. 5)</button>
          </div>
        </div>
      </div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:10px">
        <p style="font-weight:700;margin:0 0 8px">3. Prueba Pericial</p>
        <label style="display:flex;align-items:center;gap:10px;font-weight:400">
          <input type="checkbox" id="dart-prueba-pericial_medica" style="width:auto" checked> Pericial médica
        </label>
        <div id="dart-wrap-pericial_medica" style="margin-top:6px">
          <div class="form-row" style="justify-content:flex-start">
            <button class="btn btn-ghost" id="dart-sugerir-pericial_medica" type="button">Sugerir puntos de pericia</button>
          </div>
          <textarea id="dart-pericial_medica_puntos" rows="4" style="width:100%;margin-top:6px"></textarea>
        </div>
      </div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:10px">
        <p style="font-weight:700;margin:0 0 8px">4. Prueba Informativa</p>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${INFORMATIVAS.map(p => `
            <div>
              <label style="display:flex;align-items:center;gap:10px;font-weight:400">
                <input type="checkbox" class="dart-informativa-check" data-informativa="${p.id}" style="width:auto"> ${p.label}
              </label>
              ${p.pideDato ? `<input type="text" class="dart-informativa-dato" data-informativa-dato="${p.id}" placeholder="${p.placeholder}" style="display:none;margin-top:4px;width:100%" disabled>` : ''}
            </div>`).join('')}
        </div>
      </div>

      <div class="field-group" style="margin-top:10px"><label for="dart-prueba_otros">Otros medios de prueba (detallar)</label><textarea id="dart-prueba_otros" rows="2"></textarea></div>

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:16px">
        <button class="btn btn-primary" id="dart-generar">Generar escrito</button>
        <button class="btn btn-ghost"   id="dart-limpiar">Limpiar</button>
      </div>

      <div id="dart-resultado" style="display:none;margin-top:24px">
        <label for="dart-texto" style="font-weight:600;display:block;margin-bottom:6px">Texto generado (editable)</label>
        <textarea id="dart-texto" rows="26" style="width:100%;resize:vertical;font-family:inherit;font-size:.88rem;padding:12px;border:1px solid var(--color-border);border-radius:6px;background:#ffffff;color:#1a1a1a;line-height:1.6"></textarea>
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px">
          <button class="btn btn-success" id="dart-copiar">📋 Copiar texto</button>
          <button class="btn btn-ghost"   id="dart-word">📝 Exportar Word (.doc editable)</button>
          <button class="btn btn-ghost"   id="dart-pdf">📄 Exportar PDF</button>
          <button class="btn btn-ghost"   id="dart-reset-texto">Restablecer</button>
        </div>
      </div>

      <p style="margin-top:24px;font-size:.78rem;color:var(--color-muted);border-top:1px solid var(--color-border);padding-top:12px">
        Anteproyecto de escrito. Adaptar al caso concreto. No constituye asesoramiento legal.
      </p>
    </div>`;

  function renderCamposGrupo(grupo, ids) {
    return CAMPOS_CONFIG.filter(c => c.grupo === grupo && ids.includes(c.id)).map(c => `
      <div class="field-group" id="dart-wrap-${c.id}">
        <label for="dart-${c.id}">${c.label}</label>
        ${c.tipo === 'textarea'
          ? `<textarea id="dart-${c.id}" placeholder="${c.placeholder}" rows="2"></textarea>`
          : `<input type="${c.tipo}" id="dart-${c.id}" placeholder="${c.placeholder}"${c.tipo === 'number' ? ' min="0" step="0.01"' : ''}>`
        }
      </div>`).join('');
  }

  // ── Referencias ──────────────────────────────────────────────────────────
  const selMateria  = container.querySelector('#dart-materia');
  const selTipo     = container.querySelector('#dart-tipo');
  const selAbogado  = container.querySelector('#dart-abogado-select');
  const abogadoInfo = container.querySelector('#dart-abogado-info');
  const inputEmailNotif = container.querySelector('#dart-email_notificaciones');
  const divRes      = container.querySelector('#dart-resultado');
  const textarea    = container.querySelector('#dart-texto');
  let ultimoTextoGenerado = '';

  function wireBloqueToggle(chkId, wrapId) {
    const chk = container.querySelector(`#${chkId}`);
    const wrap = container.querySelector(`#${wrapId}`);
    const actualizar = () => { wrap.style.display = chk.checked ? 'block' : 'none'; };
    chk.addEventListener('change', actualizar);
    actualizar();
  }
  wireBloqueToggle('dart-prueba-testifical', 'dart-wrap-testifical');
  wireBloqueToggle('dart-prueba-pericial_medica', 'dart-wrap-pericial_medica');

  container.querySelectorAll('.dart-documental-check').forEach(chk => {
    chk.addEventListener('change', () => {
      const input = container.querySelector(`[data-documental-dato="${chk.dataset.documental}"]`);
      if (input) { input.disabled = !chk.checked; input.style.display = chk.checked ? 'block' : 'none'; }
    });
  });
  container.querySelectorAll('.dart-informativa-check').forEach(chk => {
    chk.addEventListener('change', () => {
      const input = container.querySelector(`[data-informativa-dato="${chk.dataset.informativa}"]`);
      if (input) { input.disabled = !chk.checked; input.style.display = chk.checked ? 'block' : 'none'; }
    });
  });

  // ── Coactores/codemandados dinámicos ────────────────────────────────────
  const wrapActoresExtra = container.querySelector('#dart-actores-extra-wrapper');
  const wrapDemandadosExtra = container.querySelector('#dart-demandados-extra-wrapper');
  let actoresExtraCount = 0, demandadosExtraCount = 0;

  function agregarActorExtra(datos = {}) {
    actoresExtraCount++;
    const id = actoresExtraCount;
    const div = document.createElement('div');
    div.className = 'form-row';
    div.id = `dart-actor-extra-row-${id}`;
    div.innerHTML = `
      <div class="field-group" style="flex:2"><input type="text" id="dart-actor-extra-nombre-${id}" placeholder="Nombre completo del/de la coactor/a" value="${(datos.nombre || '').replace(/"/g, '&quot;')}"></div>
      <div class="field-group" style="flex:1"><input type="text" id="dart-actor-extra-dni-${id}" placeholder="DNI" value="${(datos.dni || '').replace(/"/g, '&quot;')}"></div>
      <div class="field-group" style="flex:2"><input type="text" id="dart-actor-extra-domicilio-${id}" placeholder="Domicilio real" value="${(datos.domicilio || '').replace(/"/g, '&quot;')}"></div>
      <div class="field-group" style="flex:0;align-self:flex-end"><button class="btn btn-ghost" type="button" data-remove-actor="${id}">✕</button></div>`;
    wrapActoresExtra.appendChild(div);
    div.querySelector('[data-remove-actor]').addEventListener('click', () => div.remove());
  }

  function agregarDemandadoExtra(datos = {}) {
    demandadosExtraCount++;
    const id = demandadosExtraCount;
    const div = document.createElement('div');
    div.className = 'form-row';
    div.id = `dart-demandado-extra-row-${id}`;
    div.innerHTML = `
      <div class="field-group" style="flex:2"><input type="text" id="dart-demandado-extra-nombre-${id}" placeholder="Razón social / nombre del/de la codemandado/a" value="${(datos.nombre || '').replace(/"/g, '&quot;')}"></div>
      <div class="field-group" style="flex:2"><input type="text" id="dart-demandado-extra-domicilio-${id}" placeholder="Domicilio" value="${(datos.domicilio || '').replace(/"/g, '&quot;')}"></div>
      <div class="field-group" style="flex:1"><input type="text" id="dart-demandado-extra-cuit-${id}" placeholder="CUIT (opcional)" value="${(datos.cuit || '').replace(/"/g, '&quot;')}"></div>
      <div class="field-group" style="flex:0;align-self:flex-end"><button class="btn btn-ghost" type="button" data-remove-demandado="${id}">✕</button></div>`;
    wrapDemandadosExtra.appendChild(div);
    div.querySelector('[data-remove-demandado]').addEventListener('click', () => div.remove());
  }

  container.querySelector('#dart-add-actor').addEventListener('click', () => agregarActorExtra());
  container.querySelector('#dart-add-demandado').addEventListener('click', () => agregarDemandadoExtra());

  function leerActoresExtra() {
    return Array.from(wrapActoresExtra.querySelectorAll('[id^="dart-actor-extra-row-"]')).map(row => {
      const id = row.id.replace('dart-actor-extra-row-', '');
      return {
        nombre: container.querySelector(`#dart-actor-extra-nombre-${id}`)?.value.trim() || '',
        dni: container.querySelector(`#dart-actor-extra-dni-${id}`)?.value.trim() || '',
        domicilio: container.querySelector(`#dart-actor-extra-domicilio-${id}`)?.value.trim() || '',
      };
    }).filter(a => a.nombre);
  }

  function leerDemandadosExtra() {
    return Array.from(wrapDemandadosExtra.querySelectorAll('[id^="dart-demandado-extra-row-"]')).map(row => {
      const id = row.id.replace('dart-demandado-extra-row-', '');
      return {
        nombre: container.querySelector(`#dart-demandado-extra-nombre-${id}`)?.value.trim() || '',
        domicilio: container.querySelector(`#dart-demandado-extra-domicilio-${id}`)?.value.trim() || '',
        cuit: container.querySelector(`#dart-demandado-extra-cuit-${id}`)?.value.trim() || '',
      };
    }).filter(x => x.nombre);
  }

  // ── Prueba testifical: testigos dinámicos (máx. 5) ────────────────────
  const wrapTestigos = container.querySelector('#dart-testigos-wrapper');
  const btnAddTestigo = container.querySelector('#dart-add-testigo');
  const MAX_TESTIGOS = 5;
  let testigosCount = 0, testigosActivos = 0;

  function actualizarBotonTestigo() {
    btnAddTestigo.disabled = testigosActivos >= MAX_TESTIGOS;
    btnAddTestigo.textContent = testigosActivos >= MAX_TESTIGOS ? 'Máximo de 5 testigos alcanzado' : '+ Agregar testigo (máx. 5)';
  }

  function agregarTestigo(datos = {}) {
    if (testigosActivos >= MAX_TESTIGOS) return;
    testigosCount++; testigosActivos++;
    const id = testigosCount;
    const div = document.createElement('div');
    div.className = 'form-row';
    div.id = `dart-testigo-row-${id}`;
    div.innerHTML = `
      <div class="field-group" style="flex:2"><input type="text" id="dart-testigo-nombre-${id}" placeholder="Nombre y apellido" value="${(datos.nombre || '').replace(/"/g, '&quot;')}"></div>
      <div class="field-group" style="flex:1"><input type="text" id="dart-testigo-dni-${id}" placeholder="DNI" value="${(datos.dni || '').replace(/"/g, '&quot;')}"></div>
      <div class="field-group" style="flex:3"><input type="text" id="dart-testigo-domicilio-${id}" placeholder="Domicilio: calle N°, localidad, partido, provincia" value="${(datos.domicilio || '').replace(/"/g, '&quot;')}"></div>
      <div class="field-group" style="flex:0;align-self:flex-end"><button class="btn btn-ghost" type="button" data-remove-testigo="${id}">✕</button></div>`;
    wrapTestigos.appendChild(div);
    div.querySelector('[data-remove-testigo]').addEventListener('click', () => { div.remove(); testigosActivos--; actualizarBotonTestigo(); });
    actualizarBotonTestigo();
  }
  btnAddTestigo.addEventListener('click', agregarTestigo);

  function leerTestigos() {
    return Array.from(wrapTestigos.querySelectorAll('[id^="dart-testigo-row-"]')).map(row => {
      const id = row.id.replace('dart-testigo-row-', '');
      return {
        nombre: container.querySelector(`#dart-testigo-nombre-${id}`)?.value.trim() || '',
        dni: container.querySelector(`#dart-testigo-dni-${id}`)?.value.trim() || '',
        domicilio: container.querySelector(`#dart-testigo-domicilio-${id}`)?.value.trim() || '',
      };
    }).filter(t => t.nombre);
  }

  container.querySelector('#dart-sugerir-pericial_medica').addEventListener('click', () => {
    container.querySelector('#dart-pericial_medica_puntos').value =
`Se designe Perito Médico/a único/a de oficio para que, previo examen del/de la actor/a y estudio de la historia clínica e informes obrantes en autos, informe:
a) Si las lesiones/patología que presenta el/la actor/a guardan relación de causalidad o concausalidad con las tareas desarrolladas y/o con el hecho denunciado;
b) El porcentaje de incapacidad laboral, parcial y permanente, que dichas lesiones/patología le ocasionan, conforme el baremo aplicable (Decreto 659/96 y modificatorias);
c) Si la incapacidad determinada por la Comisión Médica jurisdiccional se ajusta a los antecedentes médicos de la causa, o si corresponde su modificación.`;
  });

  function fmtMoneda(n) { return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  function actualizarAbogado() {
    const a = ABOGADOS_BY_ID[selAbogado.value];
    if (!a) return;
    inputEmailNotif.value = a.domicilioElectronico;
    container.querySelector('#dart-matricula').value = a.matricula;
    abogadoInfo.textContent = `Celular: ${a.celular}  ·  Email: ${EMAIL_ESTUDIO}`;
  }
  selAbogado.addEventListener('change', actualizarAbogado);

  function poblarTipos() {
    const materia = MATERIAS[materiaActual];
    selTipo.innerHTML = Object.entries(materia.tipos).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('');
  }

  function renderizarCampos() {
    const materia = MATERIAS[materiaActual];
    const idsUsados = new Set();
    Object.values(materia.tipos).forEach(t => [...t.requiere, ...t.opcionales].forEach(id => idsUsados.add(id)));
    const ids = Array.from(idsUsados);
    container.querySelector('#dart-grupo-actor').innerHTML = renderCamposGrupo('actor', ids);
    container.querySelector('#dart-grupo-demandado').innerHTML = renderCamposGrupo('demandado', ids);
    container.querySelector('#dart-grupo-hecho').innerHTML = renderCamposGrupo('hecho', ids);
    container.querySelector('#dart-grupo-comision_medica').innerHTML = renderCamposGrupo('comision_medica', ids);
  }

  function actualizarCamposVisibles() {
    const materia = MATERIAS[materiaActual];
    const tipo = materia.tipos[selTipo.value];
    if (!tipo) return;
    const todos = [...tipo.requiere, ...tipo.opcionales];
    CAMPOS_CONFIG.forEach(c => {
      const wrap = container.querySelector(`#dart-wrap-${c.id}`);
      if (!wrap) return;
      wrap.style.display = todos.includes(c.id) ? '' : 'none';
    });
  }

  function onMateriaChange() {
    materiaActual = selMateria.value;
    poblarTipos();
    renderizarCampos();
    actualizarCamposVisibles();
    divRes.style.display = 'none';
    textarea.value = '';
    ultimoTextoGenerado = '';
  }

  selMateria.addEventListener('change', onMateriaChange);
  selTipo.addEventListener('change', actualizarCamposVisibles);

  // Inicialización
  actualizarAbogado();
  poblarTipos();
  renderizarCampos();
  actualizarCamposVisibles();

  function val(id) { const el = container.querySelector(`#${id}`); return el ? el.value.trim() : ''; }
  function fmtFecha(iso) {
    if (!iso) return '';
    const p = iso.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
  }

  // ── Generar ──────────────────────────────────────────────────────────────
  container.querySelector('#dart-generar').addEventListener('click', () => {
    const materia = MATERIAS[materiaActual];
    const tipo = materia.tipos[selTipo.value];

    CAMPOS_CONFIG.forEach(c => container.querySelector(`#dart-${c.id}`)?.classList.remove('error'));
    let ok = true;
    for (const id of tipo.requiere) {
      const el = container.querySelector(`#dart-${id}`);
      if (el && !el.value.trim()) { el.classList.add('error'); ok = false; }
    }
    if (!ok) return;

    const d = {};
    [...tipo.requiere, ...tipo.opcionales].forEach(id => {
      const el = container.querySelector(`#dart-${id}`);
      if (el) d[id] = el.value.trim();
    });
    Object.keys(d).forEach(k => {
      const cfg = CAMPOS_BY_ID[k];
      if (cfg && cfg.tipo === 'date' && d[k]) d[k] = fmtFecha(d[k]);
    });

    const abogadoSel = ABOGADOS_BY_ID[selAbogado.value];
    const matricula = val('dart-matricula') || 'T° __ F° __';
    const abogadoTexto = `${abogadoSel.nombre}, ${abogadoSel.genero === 'M' ? 'abogado' : 'abogada'} (${matricula})`;
    const caracterLetradoValor = val('dart-caracter-letrado');
    const caracterLetradoTexto = caracterLetradoValor === 'apoderado' ? 'apoderado/a' : 'patrocinante';
    const juzgado = val('dart-juzgado');
    const domicilioProcesal = val('dart-domicilio_procesal') || '[DOMICILIO PROCESAL A CONSTITUIR]';
    const emailNotif = val('dart-email_notificaciones') || abogadoSel.domicilioElectronico;

    const empleadorAsegurado = container.querySelector('#dart-empleador_asegurado').checked;
    const opcionLey26773 = val('dart-opcion-ley26773') || container.querySelector('#dart-opcion-ley26773').value;

    const actoresExtra = leerActoresExtra();
    const demandadosExtra = leerDemandadosExtra();
    const coactoresTexto = joinConY(actoresExtra.map(a => `${a.nombre}, DNI ${a.dni || '[DNI]'}${a.domicilio ? `, con domicilio real en ${a.domicilio}` : ''}`));

    const demandadosTexto = [];
    if (d.art_nombre) demandadosTexto.push(`${d.art_nombre}, con domicilio en ${d.dom_art || '[DOMICILIO ART]'}`);
    if (d.empleador_nombre) demandadosTexto.push(`${d.empleador_nombre}, con domicilio en ${d.dom_empleador || '[DOMICILIO EMPLEADOR]'}`);
    demandadosExtra.forEach(x => demandadosTexto.push(`${x.nombre}, con domicilio en ${x.domicilio || '[DOMICILIO]'}${x.cuit ? `, CUIT ${x.cuit}` : ''}`));
    const demandadosTextoObjeto = joinConY(demandadosTexto);
    const demandadosNombres = [d.art_nombre, d.empleador_nombre, ...demandadosExtra.map(x => x.nombre)].filter(Boolean);
    const demandadosTextoPetitorio = joinConY(demandadosNombres);

    const totalTexto = d.monto_reclamado ? fmtMoneda(parseFloat(d.monto_reclamado) || 0) : '';

    // ── Prueba ───────────────────────────────────────────────────────────
    const bloquesPrueba = [];
    let nProb = 0;
    const letrasProb = 'abcdefghijklmnopqrstuvwxyz';

    const documentalesActivos = DOCUMENTALES.filter(p => container.querySelector(`[data-documental="${p.id}"]`).checked);
    if (documentalesActivos.length) {
      nProb++;
      const itemsDoc = documentalesActivos.map((p, i) => {
        const dato = p.pideDato ? (container.querySelector(`[data-documental-dato="${p.id}"]`)?.value.trim() || '[COMPLETAR DATO]') : '';
        return `${letrasProb[i]}) ${p.label}${dato ? `: ${dato}` : ''}`;
      }).join('; ');
      bloquesPrueba.push(`${nProb}.- Prueba Documental: Se acompaña la siguiente prueba documental: ${itemsDoc}. Se peticiona se la tenga por acompañada y por parte integrante de la presente, sin perjuicio de la que se ofrezca o produzca en el curso del proceso.`);
    }

    if (container.querySelector('#dart-prueba-testifical').checked) {
      nProb++;
      const testigos = leerTestigos();
      if (testigos.length) {
        const nomina = testigos.map((t, i) => `${letrasProb[i]}).- ${t.nombre}, DNI ${t.dni || '[DNI]'}, con domicilio en ${t.domicilio || '[DOMICILIO COMPLETO]'}`).join('; ');
        bloquesPrueba.push(`${nProb}.- Prueba Testifical: Solicito se cite a prestar declaración testimonial a las siguientes personas: ${nomina}.-`);
      } else {
        bloquesPrueba.push(`${nProb}.- Prueba Testifical: Solicito se cite a prestar declaración testimonial a las personas que se individualizarán oportunamente [COMPLETAR NÓMINA DE TESTIGOS Y DOMICILIOS].`);
      }
    }

    if (container.querySelector('#dart-prueba-pericial_medica').checked) {
      nProb++;
      const puntos = val('dart-pericial_medica_puntos') || 'Se designe Perito Médico/a de oficio para que informe sobre los extremos de la presente [DETALLAR PUNTOS DE PERICIA].';
      bloquesPrueba.push(`${nProb}.- Prueba Pericial: ${puntos}`);
    }

    const informativasActivas = INFORMATIVAS.filter(p => container.querySelector(`[data-informativa="${p.id}"]`).checked);
    if (informativasActivas.length) {
      nProb++;
      const nBloque = nProb;
      const subitems = informativasActivas.map((p, i) => {
        const n = `${nBloque}.${i + 1}`;
        if (p.id === 'srt') return `${n}.- Se libre Oficio a la Superintendencia de Riesgos del Trabajo (SRT), a fin de que informe sobre los antecedentes del siniestro y de la ART demandada.`;
        if (p.id === 'afip') return `${n}.- Se libre Oficio a la Agencia de Recaudación y Control Aduanero (ARCA), a fin de que informe sobre la relación laboral y los aportes correspondientes.`;
        const dato = container.querySelector(`[data-informativa-dato="${p.id}"]`)?.value.trim() || '[COMPLETAR DATO]';
        if (p.id === 'comision_medica') return `${n}.- Se libre Oficio a la Comisión Médica interviniente, expediente ${dato}, a fin de que remita copia certificada de sus actuaciones.`;
        return `${n}.- Se libre Oficio a fin de que informe: ${dato}.`;
      }).join('\n');
      bloquesPrueba.push(`${nProb}.- Prueba Informativa:\n${subitems}`);
    }

    if (val('dart-prueba_otros')) { nProb++; bloquesPrueba.push(`${nProb}.- Otros medios de prueba: ${val('dart-prueba_otros')}`); }

    const hechosTipo = tipo.hechos(d);
    const derechoTipo = tipo.derecho(d);

    const advertenciaAsegurado = !empleadorAsegurado
      ? '\n\nADVERTENCIA: el empleador no se encontraba asegurado al momento del hecho — evaluar acumular la acción directa contra el empleador (art. 28, Ley 24.557).'
      : '';
    const advertenciaOpcion = opcionLey26773 === 'no_ejercida'
      ? '\n\nADVERTENCIA: la opción excluyente del art. 4, Ley 26.773 (vía tarifada vs. vía civil) aún no fue ejercida por el/la cliente. Confirmarla antes de presentar, dado su carácter irrevocable.'
      : '';

    const texto =
`SEÑOR JUEZ${juzgado ? ` — ${juzgado}` : ''}:

${abogadoTexto}, en mi carácter de ${caracterLetradoTexto} de ${d.nombre}, DNI ${d.dni}, con domicilio real en ${d.domicilio}${coactoresTexto ? `, y de ${coactoresTexto}` : ''}, constituyendo domicilio procesal en ${domicilioProcesal} y domicilio electrónico en ${emailNotif} (art. 40, CPCC de la Provincia de Buenos Aires), a V.S. respetuosamente me presento y digo:

I. OBJETO
Que vengo por el presente a promover la presente acción contra ${demandadosTextoObjeto}, ${materia.encuadre}${totalTexto ? `, por cobro de la suma de $ ${totalTexto} (PESOS ${totalTexto}) y/o lo que en más o en menos resulte de la prueba a producirse` : ''}, con más sus intereses y costas, en virtud de los hechos y el derecho que a continuación se exponen.

II. HECHOS
${hechosTipo}

III. EL DERECHO
${derechoTipo}

IV. PRUEBA
${bloquesPrueba.length ? bloquesPrueba.join('\n\n') : '- [DETALLAR MEDIOS DE PRUEBA OFRECIDOS]'}

V. AUTORIZACIONES
Autorizo indistintamente a ${TODOS_ABOGADOS_TEXTO} a compulsar el expediente, tomar vista de las actuaciones, retirar y diligenciar cédulas, oficios, mandamientos, testimonios, copias y demás documentación, y a realizar cualquier otro trámite relacionado con las presentes actuaciones.

VI. PETITORIO
Por lo expuesto, a V.S. solicito:
1) Me tenga por presentado, por parte y por constituido el domicilio procesal indicado.
2) Se tenga por promovida la presente contra ${demandadosTextoPetitorio}.
3) Se tenga presente la prueba ofrecida y se provea oportunamente su producción.
4) Se tengan presentes las autorizaciones conferidas en el punto V.
5) Oportunamente, se haga lugar a la presente en todas sus partes${totalTexto ? `, condenando a la demandada al pago de la suma de $ ${totalTexto}, o lo que en más o en menos resulte de la prueba producida` : ''}, con más sus intereses y costas.

PROVEER DE CONFORMIDAD,
SERÁ JUSTICIA.

──────────────────────────────────────────────
Recordatorios previos a la presentación (no forman parte del escrito):
- Verificar el plazo de apelación aplicable al dictamen de Comisión Médica (5 o 15 días hábiles, según Res. SRT 298/17 o 179/15 vigente a la fecha de notificación).
- Verificar la instancia de la Comisión Médica Central antes de acceder a la vía judicial, salvo excepción aplicable.${advertenciaAsegurado}${advertenciaOpcion}${(actoresExtra.length || demandadosExtra.length) ? `
- LITISCONSORCIO: se cargaron ${actoresExtra.length} coactor/es y ${demandadosExtra.length} codemandado/s adicional/es. El relato de HECHOS y EL DERECHO fue redactado sobre los datos del/de la trabajador/a y de la/s demandada/s principal/es (ART/empleador) — revisar y adaptar manualmente esos puntos si los coactores/codemandados tuvieran datos o circunstancias propias.` : ''}`;

    ultimoTextoGenerado = texto;
    textarea.value = texto;
    divRes.style.display = 'block';
    textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  container.querySelector('#dart-limpiar').addEventListener('click', () => {
    CAMPOS_CONFIG.forEach(c => { const el = container.querySelector(`#dart-${c.id}`); if (el) { el.value = ''; el.classList.remove('error'); } });
    container.querySelector('#dart-juzgado').value = '';
    container.querySelector('#dart-domicilio_procesal').value = '';
    container.querySelector('#dart-prueba_otros').value = '';
    container.querySelector('#dart-opcion-ley26773').selectedIndex = 0;
    container.querySelector('#dart-empleador_asegurado').checked = true;
    selAbogado.selectedIndex = 0;
    container.querySelector('#dart-caracter-letrado').selectedIndex = 0;

    container.querySelectorAll('.dart-documental-check, .dart-informativa-check').forEach(c => c.checked = false);
    container.querySelectorAll('.dart-documental-dato, .dart-informativa-dato').forEach(el => { el.value = ''; el.disabled = true; el.style.display = 'none'; });
    container.querySelector('#dart-pericial_medica_puntos').value = '';
    wrapActoresExtra.innerHTML = '';
    wrapDemandadosExtra.innerHTML = '';
    actoresExtraCount = 0;
    demandadosExtraCount = 0;
    wrapTestigos.innerHTML = '';
    testigosCount = 0; testigosActivos = 0;
    actualizarBotonTestigo();
    container.querySelector('#dart-prueba-testifical').checked = false;
    container.querySelector('#dart-prueba-pericial_medica').checked = true;
    container.querySelector('#dart-wrap-testifical').style.display = 'none';
    container.querySelector('#dart-wrap-pericial_medica').style.display = 'block';
    actualizarAbogado();
    divRes.style.display = 'none';
    textarea.value = '';
    ultimoTextoGenerado = '';
  });

  container.querySelector('#dart-copiar').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      const btn = container.querySelector('#dart-copiar');
      const orig = btn.textContent;
      btn.textContent = 'Copiado ✓';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => prompt('Copie el texto:', texto));
  });

  container.querySelector('#dart-reset-texto').addEventListener('click', () => {
    if (ultimoTextoGenerado) textarea.value = ultimoTextoGenerado;
  });

  container.querySelector('#dart-word').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const htmlBody = texto.split('\n').map(linea => {
      if (!linea.trim()) return '<p>&nbsp;</p>';
      const negrita = /^(SEÑOR JUEZ|I\.|II\.|III\.|IV\.|V\.|VI\.|PROVEER|SERÁ JUSTICIA|Recordatorios|ADVERTENCIA)/.test(linea.trim());
      const esc = linea.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<p style="margin:0 0 8pt 0;${negrita ? 'font-weight:bold;' : ''}">${esc}</p>`;
    }).join('\n');
    exportarWord(`Demanda ART - ${val('dart-nombre') || 'actor'} c. ${val('dart-art_nombre') || 'demandado'}`, htmlBody);
  });

  container.querySelector('#dart-pdf').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const lineas = texto.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    exportarPDF(`Demanda ART — ${val('dart-nombre') || 'actor'} c. ${val('dart-art_nombre') || 'demandado'}`, `<div class="info-box" style="font-size:12px;line-height:1.7">${lineas}</div>`);
  });

  // ── Prefill desde Generador de Minutas ──────────────────────────────────
  (function detectarPrefill() {
    let payload;
    try { payload = JSON.parse(localStorage.getItem('mvc_prefill_art') || 'null'); } catch { payload = null; }
    if (!payload || !payload.campos) return;

    const banner = document.createElement('div');
    banner.style.cssText = 'background:#e8f4ea;border:1px solid #7ab88a;border-radius:6px;padding:12px 14px;margin-bottom:16px;font-size:.85rem;color:#1f4d2c;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap';
    banner.innerHTML = `
      <span>📋 Hay datos de una minuta cargados el ${payload.fecha || ''} — ¿los cargamos en este formulario?</span>
      <span style="display:flex;gap:8px">
        <button class="btn btn-success" id="dart-prefill-cargar" type="button">Cargar</button>
        <button class="btn btn-ghost" id="dart-prefill-descartar" type="button">Descartar</button>
      </span>`;
    container.querySelector('.tool-card').insertBefore(banner, container.querySelector('.tool-card').children[1]);

    banner.querySelector('#dart-prefill-cargar').addEventListener('click', () => {
      if (payload.materia && MATERIAS[payload.materia]) { selMateria.value = payload.materia; onMateriaChange(); }
      if (payload.tipo) { selTipo.value = payload.tipo; actualizarCamposVisibles(); }
      Object.entries(payload.campos).forEach(([id, valor]) => {
        const el = container.querySelector(`#dart-${id}`);
        if (el && valor) el.value = valor;
      });
      if (payload.empleadorAsegurado !== undefined) container.querySelector('#dart-empleador_asegurado').checked = !!payload.empleadorAsegurado;
      if (payload.opcionLey26773) container.querySelector('#dart-opcion-ley26773').value = payload.opcionLey26773;
      if (Array.isArray(payload.coactores)) payload.coactores.forEach(c => agregarActorExtra(c));
      if (Array.isArray(payload.codemandados)) payload.codemandados.forEach(dem => agregarDemandadoExtra(dem));
      if (Array.isArray(payload.testigos) && payload.testigos.length) {
        container.querySelector('#dart-prueba-testifical').checked = true;
        container.querySelector('#dart-wrap-testifical').style.display = 'block';
        payload.testigos.forEach(t => agregarTestigo(t));
      }
      if (payload.documentacion && Array.isArray(payload.documentacion.items)) {
        const marcarDocumental = (id, detalle) => {
          const chk = container.querySelector(`[data-documental="${id}"]`);
          if (!chk) return;
          if (!chk.checked) { chk.checked = true; chk.dispatchEvent(new Event('change')); }
          if (detalle) {
            const input = container.querySelector(`[data-documental-dato="${id}"]`);
            if (input) input.value = input.value ? `${input.value}; ${detalle}` : detalle;
          }
        };
        const otroDetalles = [];
        payload.documentacion.items.forEach(item => {
          switch (item.id) {
            case 'historia_clinica':
              marcarDocumental('historia_clinica', item.detalle);
              break;
            case 'contrato':
              marcarDocumental('recibos_sueldo', '');
              if (item.detalle) otroDetalles.push(`Contrato / comprobante / recibo de sueldo: ${item.detalle}`);
              break;
            case 'telegramas':
              otroDetalles.push(`Telegramas / cartas documento${item.detalle ? `: ${item.detalle}` : ''}`);
              break;
            case 'pericias':
              otroDetalles.push(`Pericias / informes técnicos${item.detalle ? `: ${item.detalle}` : ''}`);
              break;
            case 'otro':
              otroDetalles.push(item.detalle || 'Otro documento (ver minuta)');
              break;
          }
        });
        if (otroDetalles.length) marcarDocumental('otro', otroDetalles.join(' / '));
      }
      localStorage.removeItem('mvc_prefill_art');
      banner.remove();
    });
    banner.querySelector('#dart-prefill-descartar').addEventListener('click', () => {
      localStorage.removeItem('mvc_prefill_art');
      banner.remove();
    });
  })();
}
