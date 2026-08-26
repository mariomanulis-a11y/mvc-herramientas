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

  const PRUEBAS = [
    { id: 'documental_recibos',    label: 'Documental — recibos de sueldo' },
    { id: 'documental_telegramas', label: 'Documental — telegramas / cartas documento cursadas' },
    { id: 'documental_contrato',   label: 'Documental — contrato de trabajo / legajo' },
    { id: 'testimonial',           label: 'Testimonial' },
    { id: 'pericial_contable',     label: 'Pericial contable' },
    { id: 'informativa',           label: 'Informativa (ARCA, ANSES, bancos, etc.)' },
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
          <label for="dd-abogado-select">Abogado/a patrocinante / apoderado/a</label>
          <select id="dd-abogado-select">
            ${ABOGADOS.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('')}
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

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del demandado (empleador) — art. 31 inc. b), Ley 15.057</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group"><label for="dd-empleador_nombre">Nombre / razón social</label><input type="text" id="dd-empleador_nombre" placeholder="Empresa S.A."></div>
        <div class="field-group"><label for="dd-empleador_domicilio">Domicilio</label><input type="text" id="dd-empleador_domicilio" placeholder="calle 456, localidad"></div>
        <div class="field-group"><label for="dd-empleador_cuit">CUIT (opcional, para prueba informativa)</label><input type="text" id="dd-empleador_cuit" placeholder="30-12345678-9"></div>
      </div>

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
      <div style="display:flex;flex-direction:column;gap:6px">
        ${PRUEBAS.map(p => `
          <label style="display:flex;align-items:center;gap:10px;font-weight:400">
            <input type="checkbox" class="dd-prueba-check" data-prueba="${p.id}" style="width:auto"> ${p.label}
          </label>`).join('')}
      </div>
      <div class="field-group" style="margin-top:8px"><label for="dd-prueba_otros">Otros medios de prueba (detallar)</label><textarea id="dd-prueba_otros" rows="2"></textarea></div>
      <div class="field-group">
        <label for="dd-archivos">Adjuntar archivos de referencia (recibos, telegramas, DNI, etc.)</label>
        <input type="file" id="dd-archivos" multiple>
        <p style="font-size:.75rem;color:var(--color-muted);margin-top:4px">
          Nota: esta herramienta no tiene servidor propio. Los archivos NO se suben ni se incrustan en el Word — solo se listan sus nombres en la sección de prueba documental, como recordatorio de qué acompañar físicamente/digitalmente ante el juzgado.
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
    const d = {
      abogado: `Dr./Dra. ${abogadoSel.nombre}, ${matricula}`,
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

    // Rubros
    let total = 0;
    const rubrosTexto = [];
    RUBROS.forEach(r => {
      const chk = container.querySelector(`[data-rubro="${r.id}"]`);
      if (chk.checked) {
        const monto = parseFloat(container.querySelector(`#dd-monto-${r.id}`).value) || 0;
        total += monto;
        const label = r.id === 'otro' && val('dd-otro_detalle') ? val('dd-otro_detalle') : r.label;
        rubrosTexto.push(`- ${label}: $ ${fmtMoneda(monto)}`);
      }
    });

    // Pruebas
    const pruebasTexto = [];
    PRUEBAS.forEach(p => {
      if (container.querySelector(`[data-prueba="${p.id}"]`).checked) pruebasTexto.push(p.label);
    });
    const archivos = Array.from(container.querySelector('#dd-archivos').files || []).map(f => f.name);

    const rubroActivo = (id) => container.querySelector(`[data-rubro="${id}"]`).checked;

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
      derecho += `. Los rubros de registración deficiente, mora en el pago y/o falta de entrega de certificados se fundan en la responsabilidad civil de derecho común (arts. 1716, 1717, 1738 y 1740 del Código Civil y Comercial de la Nación), tomando como pauta objetiva de cuantificación del daño las fórmulas que preveían los arts. 1 y 2 de la Ley 25.323 (derogada por art. 55, DNU 70/2023, B.O. 21/12/2023, ratificado por Ley 27.742, B.O. 8/7/2024), los arts. 8, 9, 10 y 15 de la Ley 24.013 (derogados por arts. 99-100, Ley 27.742) y el art. 45 de la Ley 25.345 (derogado por art. 99, Ley 27.742), normas hoy sin vigencia como sanción estatutaria pero cuyo quantum se invoca como medida objetiva y razonable del perjuicio sufrido`;
    }
    derecho += `. En cuanto a los requisitos formales de la presente, se estará a lo dispuesto por el art. 31 de la Ley 15.057 de Procedimiento Laboral de la Provincia de Buenos Aires, siendo de aplicación supletoria el Código Procesal Civil y Comercial de la Provincia de Buenos Aires conforme lo dispone el art. 89 de la citada ley.`;

    const totalTexto = fmtMoneda(total);

    const pruebaTextoFinal = [
      pruebasTexto.length ? pruebasTexto.map(p => `- ${p}`).join('\n') : '',
      d.prueba_otros ? `- ${d.prueba_otros}` : '',
      archivos.length ? `\nArchivos acompañados como referencia: ${archivos.join(', ')}` : '',
    ].filter(Boolean).join('\n');

    const texto =
`EXCMO. TRIBUNAL DEL TRABAJO${d.juzgado ? ` — ${d.juzgado}` : ''}:

${d.abogado}, en mi carácter de patrocinante/apoderado/a de ${d.actor_nombre}, DNI ${d.actor_dni}, con domicilio real en ${d.actor_domicilio_real}, constituyendo domicilio procesal en ${d.domicilio_procesal} y domicilio electrónico en ${d.email_notificaciones} (art. 40, CPCC de la Provincia de Buenos Aires, de aplicación supletoria conforme art. 89, Ley 15.057), a V.E. respetuosamente me presento y digo:

I. OBJETO
Que vengo por el presente a promover demanda laboral contra ${d.empleador_nombre}, con domicilio en ${d.empleador_domicilio}${d.empleador_cuit ? `, CUIT ${d.empleador_cuit}` : ''}, por cobro de la suma de $ ${totalTexto} (PESOS ${totalTexto}), o lo que en más o en menos resulte de la prueba a producirse en autos, con más sus intereses y costas, en virtud de los hechos y el derecho que a continuación se exponen.

II. HECHOS
Que ${d.actor_nombre}, DNI ${d.actor_dni}, de ${d.actor_edad || '[EDAD]'} años de edad, de nacionalidad ${d.actor_nacionalidad}, de estado civil ${d.actor_estado_civil || '[ESTADO CIVIL]'}, de profesión/oficio ${d.actor_profesion || '[PROFESIÓN U OFICIO]'}, ingresó a trabajar en relación de dependencia para la demandada con fecha ${d.fecha_ingreso}, desempeñando tareas de ${d.categoria_tareas}, cumpliendo una jornada de ${d.jornada}, percibiendo una remuneración mensual, normal y habitual de $ ${d.remuneracion_mensual ? fmtMoneda(parseFloat(d.remuneracion_mensual)) : '[MONTO]'}, ${registradoTexto}.

${hechosCausal}

III. EL DERECHO
${derecho}

IV. LIQUIDACIÓN
Practico liquidación de los rubros reclamados, sin perjuicio de su reajuste conforme la prueba a producirse:
${rubrosTexto.length ? rubrosTexto.join('\n') : '- [DETALLAR RUBROS Y MONTOS]'}
TOTAL RECLAMADO: $ ${totalTexto}

V. PRUEBA
${pruebaTextoFinal || '- [DETALLAR MEDIOS DE PRUEBA OFRECIDOS]'}

VI. BENEFICIO DE GRATUIDAD
Que en mi carácter de trabajador/a, invoco el beneficio de gratuidad previsto en el art. 27 de la Ley 15.057, solicitando se me exima del pago de tasas por servicios judiciales, así como de toda caución real o personal para el pago de costas, gastos, honorarios o por la responsabilidad derivada de eventuales medidas cautelares.

VII. PETITORIO
Por lo expuesto, a V.E. solicito:
1) Me tenga por presentado, por parte y por constituido el domicilio procesal indicado.
2) Se tenga por promovida la presente demanda laboral contra ${d.empleador_nombre}.
3) Se tenga presente la prueba ofrecida y se provea oportunamente su producción.
4) Se tenga presente el beneficio de gratuidad invocado (art. 27, Ley 15.057).
5) Oportunamente, se haga lugar a la demanda en todas sus partes, condenando a la parte demandada al pago de la suma reclamada de $ ${totalTexto}, o lo que en más o en menos resulte de la prueba producida, con más sus intereses y costas.

PROVEER DE CONFORMIDAD,
SERÁ JUSTICIA.

──────────────────────────────────────────────
Recordatorios previos a la presentación (no forman parte del escrito):
- Verificar y acompañar el Bono de Derecho Fijo (Ley 8480), salvo que corresponda su exención por patrocinio gratuito.
- Verificar la exención de tasa de justicia conforme el beneficio de gratuidad invocado (art. 27, Ley 15.057).
- Verificar el Juzgado del Trabajo y Departamento Judicial competente según el domicilio del demandado o el lugar de prestación de tareas.
- Cotejar la liquidación practicada con las herramientas "Liquidación LCT", "Daños — Empleo No Registrado" y "Daños — Registro y Mora" del sitio.${reclamaDanioDerogado ? `
- ADVERTENCIA: se reclaman rubros de daño y perjuicio (registración deficiente, mora en el pago y/o falta de certificados) fundados en pautas de leyes hoy derogadas (Ley 25.323, arts. 8/9/10/15 Ley 24.013, art. 45 Ley 25.345). El art. 245 LCT (texto según art. 51, Ley 27.802) dispone que la indemnización por despido es "la única reparación procedente frente a la extinción sin justa causa... incluidos los reclamos de naturaleza civil". Entendemos que esta cláusula no alcanza a estos rubros por tratarse de incumplimientos autónomos y no de la extinción en sí, pero es una norma sin desarrollo jurisprudencial propio (vigente desde marzo de 2026): evaluar este riesgo interpretativo antes de presentar.` : ''}`;

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
      const negrita = /^(EXCMO\. TRIBUNAL|I\.|II\.|III\.|IV\.|V\.|VI\.|VII\.|PROVEER|SERÁ JUSTICIA|TOTAL RECLAMADO|Recordatorios)/.test(linea.trim());
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
