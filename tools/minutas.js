// minutas.js — Generador de Minutas de Caso
// Planilla de intake para recolectar en forma ordenada los hechos y circunstancias
// particulares de un caso durante/después de la entrevista con el/la cliente, calcular
// los plazos críticos aplicables, y —opcionalmente— enviar los datos relevados al
// Generador de Demanda correspondiente para no volver a tipearlos.
import { exportarPDF } from './exportar.js';
import { calcularHabiles, calcularCorridos, calcularAnios, proximaHabil, esNoHabil, fmtFecha, diaSemana, motivoNoHabil } from './dias-habiles.js';

export function initMinutas(container) {

  const ABOGADOS = [
    { value: 'mario',   label: 'Mario Manulis' },
    { value: 'soledad', label: 'Soledad Velazquez' },
    { value: 'camila',  label: 'Camila Poggi' },
    { value: 'otro',    label: 'Otro/a' },
  ];

  const RAMAS = {
    despido:    { label: 'Despido / Derecho Laboral', destino: 'demanda-despido',    prefillKey: 'mvc_prefill_despido',    destinoLabel: 'Generador de Demanda por Despido' },
    consumidor: { label: 'Derecho del Consumidor',    destino: 'demanda-consumidor', prefillKey: 'mvc_prefill_consumidor', destinoLabel: 'Generador de Demanda por Consumidor' },
    amparo:     { label: 'Amparo de Salud',           destino: 'amparo-salud',       prefillKey: 'mvc_prefill_amparo',     destinoLabel: 'Generador de Amparo por Salud' },
    art:        { label: 'ART — Riesgos del Trabajo', destino: 'demanda-art',        prefillKey: 'mvc_prefill_art',        destinoLabel: 'Generador de Demanda ART' },
    sucesiones: { label: 'Sucesiones',                destino: 'escrito-sucesion',   prefillKey: 'mvc_prefill_sucesion',   destinoLabel: 'Generador de Escrito de Sucesión' },
    divorcio:   { label: 'Divorcio',                  destino: 'divorcio',           prefillKey: 'mvc_prefill_divorcio',   destinoLabel: 'Generador de Escrito de Divorcio' },
  };

  const SUCESIONES_SUBTIPOS = [
    { value: 'ab_intestato',  label: 'Ab Intestato' },
    { value: 'testamentaria', label: 'Testamentaria' },
  ];

  const DIVORCIO_SUBTIPOS = [
    { value: 'presentacion_conjunta',   label: 'Presentación conjunta (mutuo acuerdo, art. 437 CCCN)' },
    { value: 'presentacion_unilateral', label: 'Presentación unilateral (un solo cónyuge, art. 437 CCCN)' },
  ];

  const CAUSALES_DESPIDO = [
    { value: 'incausado',           label: 'Despido incausado (art. 245 LCT)' },
    { value: 'indirecto',           label: 'Despido indirecto (art. 246 LCT)' },
    { value: 'impugnacion_causa',   label: 'Impugnación de la causa invocada por el empleador (art. 242 LCT)' },
    { value: 'estabilidad_especial', label: 'Estabilidad especial (sindical / maternidad / matrimonio)' },
  ];

  const CONSUMIDOR_MATERIAS = [
    { value: 'consumidor_general',  label: 'Consumidor General' },
    { value: 'consumidor_bancario', label: 'Consumidor Bancario / Financiero' },
    { value: 'consumidor_seguros',  label: 'Consumidor de Seguros' },
  ];
  const CONSUMIDOR_TIPOS = {
    consumidor_general: [
      { value: 'incumplimiento_contractual', label: 'Incumplimiento contractual' },
      { value: 'rescision_restitucion',      label: 'Rescisión contractual con restitución de sumas' },
      { value: 'garantia_legal',             label: 'Garantía legal no honrada' },
      { value: 'trato_indigno',              label: 'Trato indigno / práctica abusiva' },
      { value: 'publicidad_enganosa',        label: 'Publicidad engañosa' },
    ],
    consumidor_bancario: [
      { value: 'phishing_estandar',              label: 'Estafa virtual / phishing' },
      { value: 'phishing_hipervulnerable',       label: 'Phishing — consumidor hipervulnerable' },
      { value: 'repeticion_comisiones',          label: 'Repetición de comisiones/cargos no autorizados' },
      { value: 'danos_cierre_cuenta',            label: 'Cierre de cuenta / Central de Deudores' },
      { value: 'impugnacion_credito_preaprobado', label: 'Crédito preaprobado sin verificación de identidad' },
      { value: 'impugnacion_tarjeta',            label: 'Consumos no reconocidos en tarjeta de crédito' },
    ],
    consumidor_seguros: [
      { value: 'seguro_silencio_aceptacion',    label: 'Silencio del asegurador — aceptación tácita' },
      { value: 'seguro_mora_pago',              label: 'Mora en el pago ya reconocido' },
      { value: 'seguro_impugnacion_rechazo',    label: 'Impugnación del rechazo de cobertura' },
      { value: 'seguro_caducidad_convencional', label: 'Impugnación de caducidad convencional' },
      { value: 'seguro_beneficiarios_vida',     label: 'Cobro a beneficiarios (vida / accidentes personales)' },
      { value: 'seguro_pluralidad_seguros',     label: 'Diferencia de liquidación (pluralidad de seguros)' },
    ],
  };

  const AMPARO_MATERIAS = [
    { value: 'obra_social_nacional',      label: 'Obra Social Nacional (Ley 23.660/23.661)' },
    { value: 'prepaga',                   label: 'Empresa de Medicina Prepaga (Ley 26.682)' },
    { value: 'obra_social_provincial',    label: 'Obra Social Provincial / IOMA' },
    { value: 'estado_nacional',           label: 'Estado Nacional (Min. Salud / SeNaDis / Incluir Salud / PAMI)' },
    { value: 'estado_provincial_municipal', label: 'Estado Provincial / Municipal' },
    { value: 'mutual',                    label: 'Mutual / Asociación Civil prestadora de servicios de salud' },
  ];

  const ART_TIPOS = [
    { value: 'apelacion_comision_medica',            label: 'Apelación del dictamen de Comisión Médica' },
    { value: 'accion_civil_art_4',                   label: 'Acción civil — opción art. 4, Ley 26.773' },
    { value: 'accion_contra_empleador_no_asegurado', label: 'Acción directa — empleador no asegurado' },
    { value: 'cobro_prestaciones_dinerarias',        label: 'Cobro de prestaciones dinerarias reconocidas' },
  ];

  const DOC_ITEMS = [
    { id: 'contrato',         label: 'Contrato / comprobante / recibo de sueldo' },
    { id: 'telegramas',       label: 'Telegramas / cartas documento' },
    { id: 'historia_clinica', label: 'Historia clínica / informes médicos' },
    { id: 'pericias',         label: 'Pericias / informes técnicos' },
    { id: 'otro',             label: 'Otro documento' },
  ];

  let ramaActual = Object.keys(RAMAS)[0];

  // ── Listas dinámicas (cronología, testigos, gestiones previas) ─────────
  const wrapCronologia = () => container.querySelector('#mn-cronologia-wrapper');
  const wrapTestigos   = () => container.querySelector('#mn-testigos-wrapper');
  const wrapGestiones  = () => container.querySelector('#mn-gestiones-wrapper');
  const wrapCoactores    = () => container.querySelector('#mn-coactores-wrapper');
  const wrapCodemandados = () => container.querySelector('#mn-codemandados-wrapper');
  let cronCount = 0, cronActivos = 0, testCount = 0, testActivos = 0, gesCount = 0, gesActivos = 0;
  const MAX_CRON = 15, MAX_TEST = 5, MAX_GES = 8;

  container.innerHTML = `
    <div class="tool-card">
      <h2>Generador de Minutas de Caso</h2>
      <p class="tool-desc">Intake ordenado de hechos, documentación y plazos críticos — previo a redactar la demanda</p>

      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="mn-rama">Tipo de caso</label>
          <select id="mn-rama">${Object.entries(RAMAS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}</select>
        </div>
        <div class="field-group" style="flex:1">
          <label for="mn-abogado">Abogado/a interviniente</label>
          <select id="mn-abogado">${ABOGADOS.map(a => `<option value="${a.value}">${a.label}</option>`).join('')}</select>
        </div>
        <div class="field-group" style="flex:1">
          <label for="mn-fecha_entrevista">Fecha de la entrevista</label>
          <input type="date" id="mn-fecha_entrevista">
        </div>
        <div class="field-group" style="flex:1">
          <label for="mn-legajo">N° de legajo interno (opcional)</label>
          <input type="text" id="mn-legajo">
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Parte consultante</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group"><label for="mn-cliente_nombre">Nombre completo</label><input type="text" id="mn-cliente_nombre" placeholder="Juan García"></div>
        <div class="field-group"><label for="mn-cliente_dni">DNI</label><input type="text" id="mn-cliente_dni" placeholder="12.345.678"></div>
        <div class="field-group"><label for="mn-cliente_cuil">CUIL (opcional)</label><input type="text" id="mn-cliente_cuil" placeholder="20-12345678-9"></div>
        <div class="field-group"><label for="mn-cliente_domicilio">Domicilio real</label><input type="text" id="mn-cliente_domicilio" placeholder="Calle 45 N° 850, La Plata"></div>
        <div class="field-group"><label for="mn-cliente_telefono">Teléfono</label><input type="text" id="mn-cliente_telefono"></div>
        <div class="field-group"><label for="mn-cliente_email">Email</label><input type="text" id="mn-cliente_email"></div>
        <div class="field-group"><label for="mn-cliente_edad">Edad</label><input type="number" id="mn-cliente_edad" min="0"></div>
        <div class="field-group"><label for="mn-cliente_estado_civil">Estado civil</label><input type="text" id="mn-cliente_estado_civil"></div>
        <div class="field-group"><label for="mn-cliente_nacionalidad">Nacionalidad</label><input type="text" id="mn-cliente_nacionalidad"></div>
        <div class="field-group"><label for="mn-cliente_profesion">Profesión</label><input type="text" id="mn-cliente_profesion"></div>
      </div>

      <div id="mn-bloque-coactores" style="margin-top:10px">
        <p style="font-weight:700;margin:0 0 6px">Coactores/as (opcional)</p>
        <div id="mn-coactores-wrapper" style="display:flex;flex-direction:column;gap:6px"></div>
        <div class="form-row" style="justify-content:flex-start;margin-top:6px">
          <button class="btn btn-ghost" id="mn-add-coactor" type="button">+ Agregar coactor/a (máx. 10)</button>
        </div>
      </div>

      <div id="mn-bloque-contraparte">
        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Contraparte</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
          <div class="field-group"><label for="mn-contraparte_nombre">Nombre / Razón social</label><input type="text" id="mn-contraparte_nombre"></div>
          <div class="field-group"><label for="mn-contraparte_cuit">CUIT (opcional)</label><input type="text" id="mn-contraparte_cuit"></div>
          <div class="field-group" style="grid-column:1/-1"><label for="mn-contraparte_domicilio">Domicilio</label><input type="text" id="mn-contraparte_domicilio"></div>
        </div>

        <div style="margin-top:10px">
          <p style="font-weight:700;margin:0 0 6px">Codemandados/as (opcional)</p>
          <div id="mn-codemandados-wrapper" style="display:flex;flex-direction:column;gap:6px"></div>
          <div class="form-row" style="justify-content:flex-start;margin-top:6px">
            <button class="btn btn-ghost" id="mn-add-codemandado" type="button">+ Agregar codemandado/a (máx. 10)</button>
          </div>
        </div>
      </div>

      <!-- ══ Bloques específicos por rama ══ -->
      <div id="mn-bloque-despido" class="mn-bloque-rama">
        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Despido — datos específicos</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
          <div class="field-group"><label for="mn-d_fecha_ingreso">Fecha de ingreso</label><input type="date" id="mn-d_fecha_ingreso"></div>
          <div class="field-group"><label for="mn-d_fecha_egreso">Fecha de egreso / despido</label><input type="date" id="mn-d_fecha_egreso"></div>
          <div class="field-group"><label for="mn-d_remuneracion">Remuneración mensual, normal y habitual</label><input type="number" id="mn-d_remuneracion" min="0" step="0.01"></div>
          <div class="field-group"><label for="mn-d_categoria">Categoría / tareas desempeñadas</label><input type="text" id="mn-d_categoria"></div>
          <div class="field-group"><label for="mn-d_jornada">Jornada</label><input type="text" id="mn-d_jornada"></div>
          <div class="field-group"><label for="mn-d_registrado">Registración</label>
            <select id="mn-d_registrado">
              <option value="registrada">Debidamente registrada</option>
              <option value="no_registrada">No registrada ("en negro")</option>
              <option value="deficiente">Registrada de forma deficiente</option>
            </select>
          </div>
          <div class="field-group"><label for="mn-d_causal">Causal invocada</label>
            <select id="mn-d_causal">${CAUSALES_DESPIDO.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}</select>
          </div>
          <div class="field-group"><label for="mn-d_forma_comunicacion">Forma de comunicación del distracto</label><input type="text" id="mn-d_forma_comunicacion" placeholder="telegrama colacionado N°..., o verbalmente"></div>
          <div class="field-group"><label for="mn-d_fecha_intimaciones">Fecha de intimación/es previa/s (opcional)</label><input type="date" id="mn-d_fecha_intimaciones"></div>
          <div class="field-group"><label for="mn-d_fecha_notificacion_causa">Fecha de notificación del despido con causa (opcional)</label><input type="date" id="mn-d_fecha_notificacion_causa"></div>
          <div class="field-group" style="grid-column:1/-1"><label for="mn-d_causa_invocada">Causa invocada por el empleador (si la hubo)</label><textarea id="mn-d_causa_invocada" rows="2"></textarea></div>
        </div>

        <div class="display-box" style="margin-top:14px">
          <strong>Plazo crítico — Prescripción de la acción (art. 256 LCT, 2 años corridos)</strong>
          <div class="form-row" style="margin-top:8px">
            <div class="field-group"><label for="mn-d_plazo_fecha">Fecha del distracto / último acto interruptivo</label><input type="date" id="mn-d_plazo_fecha"></div>
            <div class="field-group" style="align-self:flex-end"><button class="btn btn-ghost" id="mn-d_plazo_calc" type="button">Calcular vencimiento</button></div>
          </div>
          <div id="mn-d_plazo_resultado"></div>
        </div>
      </div>

      <div id="mn-bloque-consumidor" class="mn-bloque-rama" style="display:none">
        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Consumidor — datos específicos</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
          <div class="field-group"><label for="mn-c_materia">Materia</label>
            <select id="mn-c_materia">${CONSUMIDOR_MATERIAS.map(m => `<option value="${m.value}">${m.label}</option>`).join('')}</select>
          </div>
          <div class="field-group"><label for="mn-c_tipo">Tipo de reclamo</label><select id="mn-c_tipo"></select></div>
          <div class="field-group"><label for="mn-c_fecha_hecho">Fecha del hecho relevante</label><input type="date" id="mn-c_fecha_hecho"></div>
          <div class="field-group"><label for="mn-c_monto_reclamado">Monto reclamado (rubro principal)</label><input type="number" id="mn-c_monto_reclamado" min="0" step="0.01"></div>
          <div class="field-group"><label for="mn-c_producto_servicio">Producto o servicio (opcional)</label><input type="text" id="mn-c_producto_servicio"></div>
          <div class="field-group"><label for="mn-c_numero_poliza">N° de póliza (si corresponde)</label><input type="text" id="mn-c_numero_poliza"></div>
          <div class="field-group" style="grid-column:1/-1"><label for="mn-c_incumplimiento">Descripción del incumplimiento / hecho</label><textarea id="mn-c_incumplimiento" rows="2"></textarea></div>
        </div>

        <div class="display-box" style="margin-top:14px">
          <strong>Plazo crítico — Prescripción de la acción (art. 50 Ley 24.240, 3 años corridos)</strong>
          <div class="form-row" style="margin-top:8px">
            <div class="field-group"><label for="mn-c_plazo_fecha">Fecha del hecho o su conocimiento</label><input type="date" id="mn-c_plazo_fecha"></div>
            <div class="field-group" style="align-self:flex-end"><button class="btn btn-ghost" id="mn-c_plazo_calc" type="button">Calcular vencimiento</button></div>
          </div>
          <div id="mn-c_plazo_resultado"></div>
        </div>
      </div>

      <div id="mn-bloque-amparo" class="mn-bloque-rama" style="display:none">
        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Amparo de Salud — datos específicos</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
          <div class="field-group"><label for="mn-a_tipo_demandado">Tipo de demandado</label>
            <select id="mn-a_tipo_demandado">${AMPARO_MATERIAS.map(m => `<option value="${m.value}">${m.label}</option>`).join('')}</select>
          </div>
          <div class="field-group"><label for="mn-a_numero_afiliado">N° de afiliado (opcional)</label><input type="text" id="mn-a_numero_afiliado"></div>
          <div class="field-group"><label for="mn-a_medico_tratante">Médico/a tratante (opcional)</label><input type="text" id="mn-a_medico_tratante"></div>
          <div class="field-group"><label for="mn-a_fecha_prescripcion">Fecha de la prescripción médica (opcional)</label><input type="date" id="mn-a_fecha_prescripcion"></div>
          <div class="field-group"><label for="mn-a_fecha_solicitud">Fecha de solicitud a la demandada</label><input type="date" id="mn-a_fecha_solicitud"></div>
          <div class="field-group"><label for="mn-a_fecha_negativa">Fecha de la negativa/omisión</label><input type="date" id="mn-a_fecha_negativa"></div>
          <div class="field-group"><label for="mn-a_monto_tratamiento">Costo del tratamiento (opcional)</label><input type="number" id="mn-a_monto_tratamiento" min="0" step="0.01"></div>
          <div class="field-group" style="grid-column:1/-1"><label for="mn-a_diagnostico">Diagnóstico / enfermedad</label><textarea id="mn-a_diagnostico" rows="2"></textarea></div>
          <div class="field-group" style="grid-column:1/-1"><label for="mn-a_tratamiento">Tratamiento / prestación requerida</label><textarea id="mn-a_tratamiento" rows="2"></textarea></div>
          <div class="field-group" style="grid-column:1/-1"><label for="mn-a_forma_negativa">Fundamento invocado por la demandada (opcional)</label><textarea id="mn-a_forma_negativa" rows="2"></textarea></div>
          <div class="field-group" style="grid-column:1/-1"><label for="mn-a_riesgo_salud">Riesgo concreto para la salud (para la cautelar)</label><textarea id="mn-a_riesgo_salud" rows="2"></textarea></div>
        </div>

        <div class="display-box" style="margin-top:14px">
          <strong>Plazo crítico — Interposición del amparo (orientativo: 45 días hábiles — verificar fuero aplicable)</strong>
          <div class="form-row" style="margin-top:8px">
            <div class="field-group"><label for="mn-a_plazo_fecha">Fecha de la negativa/omisión</label><input type="date" id="mn-a_plazo_fecha"></div>
            <div class="field-group" style="align-self:flex-end">
              <label class="checkbox-label"><input type="checkbox" id="mn-a_plazo_feria" checked> Saltar feria judicial</label>
            </div>
            <div class="field-group" style="align-self:flex-end"><button class="btn btn-ghost" id="mn-a_plazo_calc" type="button">Calcular vencimiento</button></div>
          </div>
          <div id="mn-a_plazo_resultado"></div>
        </div>
      </div>

      <div id="mn-bloque-art" class="mn-bloque-rama" style="display:none">
        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">ART — datos específicos</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
          <div class="field-group"><label for="mn-art_nombre_art">ART interviniente</label><input type="text" id="mn-art_nombre_art"></div>
          <div class="field-group"><label for="mn-art_dom_art">Domicilio de la ART</label><input type="text" id="mn-art_dom_art"></div>
          <div class="field-group"><label for="mn-art_empleador_asegurado">¿Empleador asegurado al momento del hecho?</label>
            <select id="mn-art_empleador_asegurado"><option value="si">Sí</option><option value="no">No</option></select>
          </div>
          <div class="field-group"><label for="mn-art_tipo_contingencia">Tipo de contingencia</label>
            <select id="mn-art_tipo_contingencia">
              <option value="accidente de trabajo">Accidente de trabajo</option>
              <option value="accidente in itinere">Accidente in itinere</option>
              <option value="enfermedad profesional">Enfermedad profesional</option>
            </select>
          </div>
          <div class="field-group"><label for="mn-art_fecha_siniestro">Fecha del siniestro</label><input type="date" id="mn-art_fecha_siniestro"></div>
          <div class="field-group"><label for="mn-art_parte_cuerpo">Parte del cuerpo afectada (opcional)</label><input type="text" id="mn-art_parte_cuerpo"></div>
          <div class="field-group"><label for="mn-art_fecha_denuncia">Fecha de denuncia ante la ART (opcional)</label><input type="date" id="mn-art_fecha_denuncia"></div>
          <div class="field-group"><label for="mn-art_resultado_denuncia">Resultado de la denuncia (opcional)</label><input type="text" id="mn-art_resultado_denuncia" placeholder="aceptación, rechazo, silencio"></div>
          <div class="field-group"><label for="mn-art_monto_reclamado">Monto reclamado (opcional)</label><input type="number" id="mn-art_monto_reclamado" min="0" step="0.01"></div>
          <div class="field-group" style="grid-column:1/-1"><label for="mn-art_descripcion">Descripción del hecho</label><textarea id="mn-art_descripcion" rows="2"></textarea></div>
        </div>

        <div class="display-box" style="margin-top:14px">
          <strong>Comisión Médica jurisdiccional</strong>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px;margin-top:8px">
            <div class="field-group"><label for="mn-art_fecha_dictamen_cm">Fecha de notificación del dictamen</label><input type="date" id="mn-art_fecha_dictamen_cm"></div>
            <div class="field-group" style="grid-column:1/-1"><label for="mn-art_contenido_dictamen">Contenido del dictamen</label><textarea id="mn-art_contenido_dictamen" rows="2" placeholder="% de incapacidad, rechazo de cobertura, alta médica, etc."></textarea></div>
          </div>
        </div>

        <div style="display:block;background:#fdeaea;border:1px solid #d97a7a;border-radius:6px;padding:10px 14px;margin-top:14px;font-size:.85rem;line-height:1.6;color:#7a2020">
          ⚖️ Opción del art. 4, Ley 26.773 (excluyente e irrevocable):
          <select id="mn-art_opcion_ley26773" style="margin-top:6px">
            <option value="no_ejercida">Aún no ejercida</option>
            <option value="tarifada">Ejercida — vía tarifada (sistema LRT)</option>
            <option value="civil">Ejercida — vía civil (derecho común)</option>
          </select>
        </div>

        <div class="display-box" style="margin-top:14px">
          <strong>Plazo crítico — Apelación ante Comisión Médica</strong>
          <div class="form-row" style="margin-top:8px">
            <div class="field-group"><label for="mn-art_plazo_resolucion">Resolución SRT aplicable</label>
              <select id="mn-art_plazo_resolucion">
                <option value="5">Res. SRT 298/17 — 5 días hábiles</option>
                <option value="15">Res. SRT 179/15 — 15 días hábiles</option>
              </select>
            </div>
            <div class="field-group"><label for="mn-art_plazo_feria_label">&nbsp;</label>
              <label class="checkbox-label"><input type="checkbox" id="mn-art_plazo_feria" checked> Saltar feria judicial</label>
            </div>
            <div class="field-group" style="align-self:flex-end"><button class="btn btn-ghost" id="mn-art_plazo_calc_cm" type="button">Calcular vencimiento (usa fecha de dictamen de arriba)</button></div>
          </div>
          <div id="mn-art_plazo_resultado_cm"></div>
        </div>

        <div class="display-box" style="margin-top:14px">
          <strong>Plazo crítico — Prescripción de la acción (art. 44 Ley 24.557, 2 años corridos)</strong>
          <div class="form-row" style="margin-top:8px">
            <div class="field-group"><label for="mn-art_plazo_fecha_prescripcion">Fecha de cese de la relación laboral o de conocimiento de la incapacidad</label><input type="date" id="mn-art_plazo_fecha_prescripcion"></div>
            <div class="field-group" style="align-self:flex-end"><button class="btn btn-ghost" id="mn-art_plazo_calc_presc" type="button">Calcular vencimiento</button></div>
          </div>
          <div id="mn-art_plazo_resultado_presc"></div>
        </div>

        <div class="field-group" style="margin-top:10px">
          <label for="mn-art_tipo_sugerido">Tipo de presentación sugerido (para el Generador de Demanda ART)</label>
          <select id="mn-art_tipo_sugerido">${ART_TIPOS.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}</select>
        </div>
      </div>

      <div id="mn-bloque-sucesiones" class="mn-bloque-rama" style="display:none">
        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Sucesión — datos específicos</div>
        <div class="form-row">
          <div class="field-group" style="flex:1">
            <label for="mn-suc_subtipo">Tipo de sucesión</label>
            <select id="mn-suc_subtipo">${SUCESIONES_SUBTIPOS.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}</select>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
          <div class="field-group"><label for="mn-suc_causante_nombre">Nombre completo del/de la causante</label><input type="text" id="mn-suc_causante_nombre"></div>
          <div class="field-group"><label for="mn-suc_causante_dni">DNI del/de la causante (opcional)</label><input type="text" id="mn-suc_causante_dni"></div>
          <div class="field-group"><label for="mn-suc_fecha_fallecimiento">Fecha de fallecimiento</label><input type="date" id="mn-suc_fecha_fallecimiento"></div>
          <div class="field-group"><label for="mn-suc_lugar_fallecimiento">Lugar de fallecimiento (opcional)</label><input type="text" id="mn-suc_lugar_fallecimiento"></div>
          <div class="field-group" style="grid-column:1/-1"><label for="mn-suc_ultimo_domicilio">Último domicilio del/de la causante</label><input type="text" id="mn-suc_ultimo_domicilio"></div>
          <div class="field-group" style="grid-column:1/-1"><label for="mn-suc_bienes_registrables">Bienes registrables denunciados (opcional)</label><textarea id="mn-suc_bienes_registrables" rows="2"></textarea></div>
          <div class="field-group"><label for="mn-suc_jurisdiccion">Juzgado / jurisdicción (opcional)</label><input type="text" id="mn-suc_jurisdiccion"></div>
          <div class="field-group" style="align-self:flex-end">
            <label class="checkbox-label"><input type="checkbox" id="mn-suc_conflicto_herederos"> ¿Hay conflicto entre herederos?</label>
          </div>
        </div>

        <div id="mn-suc-bloque-testamento" style="display:none">
          <div class="display-box" style="margin-top:10px">
            <strong>Datos del testamento</strong>
            <div class="form-row" style="margin-top:8px">
              <div class="field-group"><label for="mn-suc_forma_testamento">Forma del testamento (art. 2462, CCCN)</label>
                <select id="mn-suc_forma_testamento">
                  <option value="ologrofo">Ológrafo</option>
                  <option value="acto_publico">Por acto público</option>
                </select>
              </div>
              <div class="field-group"><label for="mn-suc_fecha_testamento">Fecha de otorgamiento</label><input type="date" id="mn-suc_fecha_testamento"></div>
            </div>
            <div id="mn-suc-wrap-acto_publico" style="display:none">
              <div class="form-row">
                <div class="field-group"><label for="mn-suc_escribano">Escribano/a interviniente</label><input type="text" id="mn-suc_escribano"></div>
                <div class="field-group"><label for="mn-suc_registro_notarial">N° de Registro Notarial (opcional)</label><input type="text" id="mn-suc_registro_notarial"></div>
              </div>
            </div>
            <div id="mn-suc-wrap-ologrofo">
              <div class="form-row">
                <div class="field-group"><label for="mn-suc_testigo1_testamento">Testigo 1 (reconocimiento de firma y letra)</label><input type="text" id="mn-suc_testigo1_testamento"></div>
                <div class="field-group"><label for="mn-suc_testigo2_testamento">Testigo 2 (reconocimiento de firma y letra)</label><input type="text" id="mn-suc_testigo2_testamento"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Herederos denunciados</div>
        <div id="mn-suc-herederos-wrapper" style="display:flex;flex-direction:column;gap:6px"></div>
        <div class="form-row" style="justify-content:flex-start;margin-top:6px">
          <button class="btn btn-ghost" id="mn-add-suc-heredero" type="button">+ Agregar heredero/a (máx. 15)</button>
        </div>

        <div class="display-box" style="margin-top:14px">
          <strong>Administrador/a provisional (opcional)</strong>
          <div class="check-row" style="margin-top:8px">
            <input type="checkbox" id="mn-suc_administrador_check">
            <label for="mn-suc_administrador_check">Proponer administrador/a provisional</label>
          </div>
          <div class="field-group" id="mn-suc-wrap-administrador" style="display:none;margin-top:6px">
            <label for="mn-suc_administrador_nombre">Nombre y vínculo del/de la propuesto/a</label>
            <input type="text" id="mn-suc_administrador_nombre" placeholder="Ej: Juan García, hijo del causante">
          </div>
        </div>
      </div>

      <div id="mn-bloque-divorcio" class="mn-bloque-rama" style="display:none">
        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Divorcio — datos específicos (PBA)</div>
        <p style="font-size:.78rem;color:var(--color-muted);margin:-4px 0 10px">La parte consultante (nombre/DNI/domicilio cargados arriba) se toma como cónyuge 1. Contraparte/coactores no aplican a esta rama.</p>
        <div class="form-row">
          <div class="field-group" style="flex:1">
            <label for="mn-dv_subtipo">Tipo de presentación</label>
            <select id="mn-dv_subtipo">${DIVORCIO_SUBTIPOS.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}</select>
          </div>
        </div>

        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Cónyuge 2 / otro cónyuge</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
          <div class="field-group"><label for="mn-dv_conyuge2_nombre">Nombre completo</label><input type="text" id="mn-dv_conyuge2_nombre"></div>
          <div class="field-group"><label for="mn-dv_conyuge2_dni">DNI (opcional en presentación unilateral)</label><input type="text" id="mn-dv_conyuge2_dni"></div>
          <div class="field-group" style="grid-column:1/-1"><label for="mn-dv_conyuge2_domicilio">Domicilio real (a fines de notificación)</label><input type="text" id="mn-dv_conyuge2_domicilio"></div>
        </div>

        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Matrimonio</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
          <div class="field-group"><label for="mn-dv_fecha_matrimonio">Fecha de celebración</label><input type="date" id="mn-dv_fecha_matrimonio"></div>
          <div class="field-group"><label for="mn-dv_lugar_matrimonio">Lugar / Registro Civil (opcional)</label><input type="text" id="mn-dv_lugar_matrimonio"></div>
          <div class="field-group"><label for="mn-dv_acta_matrimonio">Acta N° / Tomo / Folio (opcional)</label><input type="text" id="mn-dv_acta_matrimonio"></div>
          <div class="field-group"><label for="mn-dv_ultimo_domicilio_conyugal">Último domicilio conyugal (competencia — art. 717 CCCN)</label><input type="text" id="mn-dv_ultimo_domicilio_conyugal"></div>
        </div>

        <div class="form-row">
          <div class="field-group" style="align-self:flex-end">
            <label class="checkbox-label"><input type="checkbox" id="mn-dv_conflicto_intereses"> ¿Conflicto de intereses entre los cónyuges respecto del convenio?</label>
          </div>
          <div class="field-group" id="mn-dv-wrap-otro-propone" style="align-self:flex-end;display:none">
            <label class="checkbox-label"><input type="checkbox" id="mn-dv_otro_conyuge_propone"> El otro cónyuge propondría su propio convenio (art. 438, 2° párr., CCCN)</label>
          </div>
        </div>

        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Hijos/as en común</div>
        <div id="mn-dv-hijos-wrapper" style="display:flex;flex-direction:column;gap:6px"></div>
        <div class="form-row" style="justify-content:flex-start;margin-top:6px">
          <button class="btn btn-ghost" id="mn-add-dv-hijo" type="button">+ Agregar hijo/a (máx. 10)</button>
        </div>
        <div class="field-group" style="margin-top:6px">
          <label class="checkbox-label"><input type="checkbox" id="mn-dv_hijo_capacidad_restringida"> Alguno de los hijos/as en común es mayor de edad con capacidad restringida (art. 658, CCCN)</label>
        </div>

        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Bienes gananciales a liquidar</div>
        <div id="mn-dv-bienes-wrapper" style="display:flex;flex-direction:column;gap:6px"></div>
        <div class="form-row" style="justify-content:flex-start;margin-top:6px">
          <button class="btn btn-ghost" id="mn-add-dv-bien" type="button">+ Agregar bien (máx. 15)</button>
        </div>

        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Convenio regulador — borrador (arts. 438/439, CCCN)</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
          <div class="field-group" style="grid-column:1/-1"><label for="mn-dv_vivienda_convenio">Atribución de la vivienda familiar (opcional)</label><textarea id="mn-dv_vivienda_convenio" rows="2"></textarea></div>
          <div class="field-group" style="grid-column:1/-1"><label for="mn-dv_compensacion_economica_detalle">Compensación económica (opcional)</label><textarea id="mn-dv_compensacion_economica_detalle" rows="2"></textarea></div>
          <div class="field-group" style="grid-column:1/-1"><label for="mn-dv_cuidado_personal">Cuidado personal de los hijos/as (si corresponde)</label><textarea id="mn-dv_cuidado_personal" rows="2"></textarea></div>
          <div class="field-group" style="grid-column:1/-1"><label for="mn-dv_regimen_comunicacion">Régimen de comunicación (si corresponde)</label><textarea id="mn-dv_regimen_comunicacion" rows="2"></textarea></div>
          <div class="field-group" style="grid-column:1/-1"><label for="mn-dv_alimentos_hijos">Cuota alimentaria a favor de los hijos/as (si corresponde)</label><textarea id="mn-dv_alimentos_hijos" rows="2"></textarea></div>
          <div class="field-group" style="grid-column:1/-1"><label for="mn-dv_otros_acuerdos">Otros acuerdos (opcional)</label><textarea id="mn-dv_otros_acuerdos" rows="2"></textarea></div>
        </div>
      </div>

      <!-- ══ Bloque común: cronología, documentación, testigos, gestiones, valoración ══ -->
      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:22px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Cronología de hechos</div>
      <div id="mn-cronologia-wrapper" style="display:flex;flex-direction:column;gap:6px"></div>
      <div class="form-row" style="justify-content:flex-start;margin-top:6px">
        <button class="btn btn-ghost" id="mn-add-cronologia" type="button">+ Agregar hecho (máx. 15)</button>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Documentación</div>
      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px">
        <p style="font-weight:700;margin:0 0 8px">Aportada por el/la cliente</p>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${DOC_ITEMS.map(p => `
            <div>
              <label style="display:flex;align-items:center;gap:10px;font-weight:400">
                <input type="checkbox" class="mn-doc-check" data-doc="${p.id}" style="width:auto"> ${p.label}
              </label>
              <input type="text" class="mn-doc-dato" data-doc-dato="${p.id}" placeholder="Detalle (fechas, N°, quién lo tiene)" style="display:none;margin-top:4px;width:100%" disabled>
            </div>`).join('')}
        </div>
      </div>
      <div class="field-group" style="margin-top:10px"><label for="mn-doc_pendiente">Documentación pendiente de gestionar</label><textarea id="mn-doc_pendiente" rows="2"></textarea></div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Testigos</div>
      <div id="mn-testigos-wrapper" style="display:flex;flex-direction:column;gap:6px"></div>
      <div class="form-row" style="justify-content:flex-start;margin-top:6px">
        <button class="btn btn-ghost" id="mn-add-testigo" type="button">+ Agregar testigo (máx. 5)</button>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Gestiones previas / reclamos extrajudiciales</div>
      <div id="mn-gestiones-wrapper" style="display:flex;flex-direction:column;gap:6px"></div>
      <div class="form-row" style="justify-content:flex-start;margin-top:6px">
        <button class="btn btn-ghost" id="mn-add-gestion" type="button">+ Agregar gestión (máx. 8)</button>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Valoración preliminar</div>
      <div class="field-group"><label for="mn-valoracion">Viabilidad, riesgos y estrategia sugerida</label><textarea id="mn-valoracion" rows="4"></textarea></div>

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:16px">
        <button class="btn btn-primary" id="mn-generar">Generar minuta</button>
        <button class="btn btn-ghost"   id="mn-limpiar">Limpiar</button>
      </div>

      <div id="mn-resultado" style="display:none;margin-top:24px">
        <label for="mn-texto" style="font-weight:600;display:block;margin-bottom:6px">Texto generado (editable)</label>
        <textarea id="mn-texto" rows="26" style="width:100%;resize:vertical;font-family:inherit;font-size:.88rem;padding:12px;border:1px solid var(--color-border);border-radius:6px;background:#ffffff;color:#1a1a1a;line-height:1.6"></textarea>
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px">
          <button class="btn btn-success" id="mn-copiar">📋 Copiar texto</button>
          <button class="btn btn-ghost"   id="mn-pdf">📄 Exportar PDF</button>
          <button class="btn btn-ghost"   id="mn-enviar">➡️ Enviar a Generador de Demanda</button>
        </div>
        <div id="mn-enviar-confirmacion" style="display:none;margin-top:10px"></div>
      </div>

      <p style="margin-top:24px;font-size:.78rem;color:var(--color-muted);border-top:1px solid var(--color-border);padding-top:12px">
        Documento de trabajo interno del Estudio. No constituye un escrito judicial ni asesoramiento legal.
      </p>
    </div>`;

  // ── Referencias generales ────────────────────────────────────────────────
  const selRama = container.querySelector('#mn-rama');
  const bloques = {
    despido: container.querySelector('#mn-bloque-despido'),
    consumidor: container.querySelector('#mn-bloque-consumidor'),
    amparo: container.querySelector('#mn-bloque-amparo'),
    art: container.querySelector('#mn-bloque-art'),
    sucesiones: container.querySelector('#mn-bloque-sucesiones'),
    divorcio: container.querySelector('#mn-bloque-divorcio'),
  };
  const bloqueContraparte = container.querySelector('#mn-bloque-contraparte');
  const bloqueCoactores = container.querySelector('#mn-bloque-coactores');
  const divRes = container.querySelector('#mn-resultado');
  const textarea = container.querySelector('#mn-texto');
  const divEnviarConf = container.querySelector('#mn-enviar-confirmacion');

  function val(id) { const el = container.querySelector(`#${id}`); return el ? el.value.trim() : ''; }
  function fmtFechaISO(iso) {
    if (!iso) return '';
    const p = iso.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
  }

  function actualizarBloqueRama() {
    ramaActual = selRama.value;
    Object.entries(bloques).forEach(([k, el]) => { el.style.display = k === ramaActual ? 'block' : 'none'; });
    const esRamaSinContraparte = ramaActual === 'sucesiones' || ramaActual === 'divorcio';
    bloqueContraparte.style.display = esRamaSinContraparte ? 'none' : 'block';
    bloqueCoactores.style.display = esRamaSinContraparte ? 'none' : 'block';
  }
  selRama.addEventListener('change', actualizarBloqueRama);
  actualizarBloqueRama();

  // ── Sucesiones: forma del testamento y administrador provisional ────────
  const selSucSubtipo = container.querySelector('#mn-suc_subtipo');
  const bloqueSucTestamento = container.querySelector('#mn-suc-bloque-testamento');
  const selSucFormaTestamento = container.querySelector('#mn-suc_forma_testamento');
  const wrapSucActoPublico = container.querySelector('#mn-suc-wrap-acto_publico');
  const wrapSucOlografo = container.querySelector('#mn-suc-wrap-ologrofo');
  const chkSucAdministrador = container.querySelector('#mn-suc_administrador_check');
  const wrapSucAdministrador = container.querySelector('#mn-suc-wrap-administrador');

  function actualizarBloqueTestamentoMinuta() {
    const esTestamentaria = selSucSubtipo.value === 'testamentaria';
    bloqueSucTestamento.style.display = esTestamentaria ? 'block' : 'none';
    const esOlografo = selSucFormaTestamento.value === 'ologrofo';
    wrapSucActoPublico.style.display = esOlografo ? 'none' : 'block';
    wrapSucOlografo.style.display = esOlografo ? 'block' : 'none';
  }
  selSucSubtipo.addEventListener('change', actualizarBloqueTestamentoMinuta);
  selSucFormaTestamento.addEventListener('change', actualizarBloqueTestamentoMinuta);
  actualizarBloqueTestamentoMinuta();

  chkSucAdministrador.addEventListener('change', () => { wrapSucAdministrador.style.display = chkSucAdministrador.checked ? 'block' : 'none'; });

  // ── Divorcio: variante unilateral ────────────────────────────────────────
  const selDvSubtipo = container.querySelector('#mn-dv_subtipo');
  const wrapDvOtroPropone = container.querySelector('#mn-dv-wrap-otro-propone');
  function actualizarDivorcioUnilateral() {
    const esUnilateral = selDvSubtipo.value === 'presentacion_unilateral';
    wrapDvOtroPropone.style.display = esUnilateral ? 'block' : 'none';
    if (!esUnilateral) container.querySelector('#mn-dv_otro_conyuge_propone').checked = false;
  }
  selDvSubtipo.addEventListener('change', actualizarDivorcioUnilateral);
  actualizarDivorcioUnilateral();

  // ── Consumidor: tipos dependientes de la materia ────────────────────────
  const selCMateria = container.querySelector('#mn-c_materia');
  const selCTipo = container.querySelector('#mn-c_tipo');
  function poblarTiposConsumidor() {
    const tipos = CONSUMIDOR_TIPOS[selCMateria.value] || [];
    selCTipo.innerHTML = tipos.map(t => `<option value="${t.value}">${t.label}</option>`).join('');
  }
  selCMateria.addEventListener('change', poblarTiposConsumidor);
  poblarTiposConsumidor();

  // ── Documentación: mostrar/ocultar detalle ──────────────────────────────
  container.querySelectorAll('.mn-doc-check').forEach(chk => {
    chk.addEventListener('change', () => {
      const input = container.querySelector(`[data-doc-dato="${chk.dataset.doc}"]`);
      if (input) { input.disabled = !chk.checked; input.style.display = chk.checked ? 'block' : 'none'; }
    });
  });

  // ── Listas dinámicas genéricas ───────────────────────────────────────────
  function crearFilaDinamica({ wrapper, prefix, campos, max, contadorRef }) {
    if (contadorRef.activos >= max) return;
    contadorRef.count++; contadorRef.activos++;
    const id = contadorRef.count;
    const div = document.createElement('div');
    div.className = 'form-row';
    div.id = `${prefix}-row-${id}`;
    div.innerHTML = campos.map(c => `<div class="field-group" style="flex:${c.flex || 1}">${
      c.tipo === 'date' ? `<input type="date" id="${prefix}-${c.id}-${id}" placeholder="${c.placeholder || ''}">`
      : c.tipo === 'textarea' ? `<textarea id="${prefix}-${c.id}-${id}" placeholder="${c.placeholder || ''}" rows="1" style="min-height:38px"></textarea>`
      : `<input type="text" id="${prefix}-${c.id}-${id}" placeholder="${c.placeholder || ''}">`
    }</div>`).join('') + `<div class="field-group" style="flex:0;align-self:flex-end"><button class="btn btn-ghost" type="button" data-remove="${id}">✕</button></div>`;
    wrapper.appendChild(div);
    div.querySelector('[data-remove]').addEventListener('click', () => { div.remove(); contadorRef.activos--; });
    return id;
  }

  const cronContador = { count: 0, activos: 0 };
  const CRON_CAMPOS = [
    { id: 'fecha', tipo: 'date', flex: 1 },
    { id: 'detalle', tipo: 'textarea', placeholder: 'Descripción del hecho', flex: 4 },
  ];
  container.querySelector('#mn-add-cronologia').addEventListener('click', () =>
    crearFilaDinamica({ wrapper: wrapCronologia(), prefix: 'mn-cron', campos: CRON_CAMPOS, max: MAX_CRON, contadorRef: cronContador }));

  const testContador = { count: 0, activos: 0 };
  const TEST_CAMPOS = [
    { id: 'nombre', tipo: 'text', placeholder: 'Nombre y apellidos completos', flex: 2 },
    { id: 'dni', tipo: 'text', placeholder: 'DNI', flex: 1 },
    { id: 'domicilio', tipo: 'text', placeholder: 'Domicilio', flex: 2 },
    { id: 'contacto', tipo: 'text', placeholder: 'Teléfono / email', flex: 1 },
    { id: 'declarar', tipo: 'text', placeholder: 'Qué puede declarar', flex: 2 },
  ];
  container.querySelector('#mn-add-testigo').addEventListener('click', () =>
    crearFilaDinamica({ wrapper: wrapTestigos(), prefix: 'mn-test', campos: TEST_CAMPOS, max: MAX_TEST, contadorRef: testContador }));

  const MAX_COACTORES = 10, MAX_CODEMANDADOS = 10;
  const coactoresContador = { count: 0, activos: 0 };
  const COACTOR_CAMPOS = [
    { id: 'nombre', tipo: 'text', placeholder: 'Nombre completo del/de la coactor/a', flex: 2 },
    { id: 'dni', tipo: 'text', placeholder: 'DNI', flex: 1 },
    { id: 'domicilio', tipo: 'text', placeholder: 'Domicilio real', flex: 2 },
  ];
  container.querySelector('#mn-add-coactor').addEventListener('click', () =>
    crearFilaDinamica({ wrapper: wrapCoactores(), prefix: 'mn-coactor', campos: COACTOR_CAMPOS, max: MAX_COACTORES, contadorRef: coactoresContador }));

  const codemandadosContador = { count: 0, activos: 0 };
  const CODEMANDADO_CAMPOS = [
    { id: 'nombre', tipo: 'text', placeholder: 'Nombre / razón social del/de la codemandado/a', flex: 2 },
    { id: 'domicilio', tipo: 'text', placeholder: 'Domicilio', flex: 2 },
    { id: 'cuit', tipo: 'text', placeholder: 'CUIT (opcional)', flex: 1 },
  ];
  container.querySelector('#mn-add-codemandado').addEventListener('click', () =>
    crearFilaDinamica({ wrapper: wrapCodemandados(), prefix: 'mn-codem', campos: CODEMANDADO_CAMPOS, max: MAX_CODEMANDADOS, contadorRef: codemandadosContador }));

  const gesContador = { count: 0, activos: 0 };
  const GES_CAMPOS = [
    { id: 'fecha', tipo: 'date', flex: 1 },
    { id: 'medio', tipo: 'text', placeholder: 'CD, telegrama, reclamo administrativo...', flex: 2 },
    { id: 'resultado', tipo: 'text', placeholder: 'Resultado obtenido', flex: 2 },
  ];
  container.querySelector('#mn-add-gestion').addEventListener('click', () =>
    crearFilaDinamica({ wrapper: wrapGestiones(), prefix: 'mn-ges', campos: GES_CAMPOS, max: MAX_GES, contadorRef: gesContador }));

  const wrapSucHerederos = () => container.querySelector('#mn-suc-herederos-wrapper');
  const sucHerederosContador = { count: 0, activos: 0 };
  const MAX_SUC_HEREDEROS = 15;
  const SUC_HEREDERO_CAMPOS = [
    { id: 'nombre', tipo: 'text', placeholder: 'Nombre y apellido', flex: 2 },
    { id: 'dni', tipo: 'text', placeholder: 'DNI', flex: 1 },
    { id: 'vinculo', tipo: 'text', placeholder: 'Vínculo (hijo/a, cónyuge...)', flex: 1 },
    { id: 'domicilio', tipo: 'text', placeholder: 'Domicilio real', flex: 2 },
  ];
  container.querySelector('#mn-add-suc-heredero').addEventListener('click', () =>
    crearFilaDinamica({ wrapper: wrapSucHerederos(), prefix: 'mn-suc-heredero', campos: SUC_HEREDERO_CAMPOS, max: MAX_SUC_HEREDEROS, contadorRef: sucHerederosContador }));

  const wrapDvHijos = () => container.querySelector('#mn-dv-hijos-wrapper');
  const dvHijosContador = { count: 0, activos: 0 };
  const MAX_DV_HIJOS = 10;
  const DV_HIJO_CAMPOS = [
    { id: 'nombre', tipo: 'text', placeholder: 'Nombre y apellido', flex: 2 },
    { id: 'fecha_nacimiento', tipo: 'date', flex: 1 },
    { id: 'dni', tipo: 'text', placeholder: 'DNI (opcional)', flex: 1 },
  ];
  container.querySelector('#mn-add-dv-hijo').addEventListener('click', () =>
    crearFilaDinamica({ wrapper: wrapDvHijos(), prefix: 'mn-dv-hijo', campos: DV_HIJO_CAMPOS, max: MAX_DV_HIJOS, contadorRef: dvHijosContador }));

  const wrapDvBienes = () => container.querySelector('#mn-dv-bienes-wrapper');
  const dvBienesContador = { count: 0, activos: 0 };
  const MAX_DV_BIENES = 15;
  const DV_BIEN_CAMPOS = [
    { id: 'descripcion', tipo: 'text', placeholder: 'Descripción del bien (inmueble, automotor, cuenta, etc.)', flex: 2 },
    { id: 'atribucion', tipo: 'text', placeholder: 'Atribución / forma de reparto propuesta', flex: 2 },
  ];
  container.querySelector('#mn-add-dv-bien').addEventListener('click', () =>
    crearFilaDinamica({ wrapper: wrapDvBienes(), prefix: 'mn-dv-bien', campos: DV_BIEN_CAMPOS, max: MAX_DV_BIENES, contadorRef: dvBienesContador }));

  function leerLista(wrapper, prefix, camposIds) {
    return Array.from(wrapper.querySelectorAll(`[id^="${prefix}-row-"]`)).map(row => {
      const id = row.id.replace(`${prefix}-row-`, '');
      const obj = {};
      camposIds.forEach(c => { obj[c] = container.querySelector(`#${prefix}-${c}-${id}`)?.value.trim() || ''; });
      return obj;
    }).filter(o => Object.values(o).some(v => v));
  }

  // ── Plazos críticos ──────────────────────────────────────────────────────
  function renderPlazo(divId, resultado, tipo, saltarFeria) {
    const div = container.querySelector(`#${divId}`);
    const { vencimiento } = resultado;
    const dow = diaSemana(vencimiento);
    const esNoH = tipo === 'habiles' ? esNoHabil(vencimiento, saltarFeria) : false;
    const proxHabil = esNoH ? proximaHabil(vencimiento, saltarFeria) : null;
    let html = `<div style="margin-top:10px;padding:10px 14px;background:var(--color-bg-alt,#fafafa);border:1px solid var(--color-border);border-radius:6px">
      <div style="font-size:.78rem;color:var(--color-muted)">Vencimiento</div>
      <div style="font-size:1.4rem;font-weight:700;color:var(--color-accent)">${fmtFecha(vencimiento)}</div>
      <div style="color:var(--color-muted)">${dow.charAt(0).toUpperCase() + dow.slice(1)}</div>`;
    if (esNoH && proxHabil) {
      html += `<div style="margin-top:8px;padding:8px 12px;background:#fff3cd;border:1px solid #ffc107;border-radius:6px;color:#856404;font-size:.85rem">
        ⚠️ Vence en ${dow} (${motivoNoHabil(vencimiento, saltarFeria)}). Próxima fecha hábil: <strong>${fmtFecha(proxHabil)}</strong></div>`;
    }
    html += `</div>`;
    div.innerHTML = html;
  }

  container.querySelector('#mn-d_plazo_calc').addEventListener('click', () => {
    const f = val('mn-d_plazo_fecha');
    if (!f) return;
    renderPlazo('mn-d_plazo_resultado', calcularAnios(new Date(f + 'T00:00:00'), 2), 'corridos');
  });

  container.querySelector('#mn-c_plazo_calc').addEventListener('click', () => {
    const f = val('mn-c_plazo_fecha');
    if (!f) return;
    renderPlazo('mn-c_plazo_resultado', calcularAnios(new Date(f + 'T00:00:00'), 3), 'corridos');
  });

  container.querySelector('#mn-a_plazo_calc').addEventListener('click', () => {
    const f = val('mn-a_plazo_fecha');
    if (!f) return;
    const saltarFeria = container.querySelector('#mn-a_plazo_feria').checked;
    renderPlazo('mn-a_plazo_resultado', calcularHabiles(new Date(f + 'T00:00:00'), 45, saltarFeria), 'habiles', saltarFeria);
  });

  container.querySelector('#mn-art_plazo_calc_cm').addEventListener('click', () => {
    const f = val('mn-art_fecha_dictamen_cm');
    if (!f) return;
    const dias = parseInt(val('mn-art_plazo_resolucion') || container.querySelector('#mn-art_plazo_resolucion').value, 10);
    const saltarFeria = container.querySelector('#mn-art_plazo_feria').checked;
    renderPlazo('mn-art_plazo_resultado_cm', calcularHabiles(new Date(f + 'T00:00:00'), dias, saltarFeria), 'habiles', saltarFeria);
  });

  container.querySelector('#mn-art_plazo_calc_presc').addEventListener('click', () => {
    const f = val('mn-art_plazo_fecha_prescripcion');
    if (!f) return;
    renderPlazo('mn-art_plazo_resultado_presc', calcularAnios(new Date(f + 'T00:00:00'), 2), 'corridos');
  });

  // ── Generar minuta ───────────────────────────────────────────────────────
  function bloqueRamaTexto() {
    if (ramaActual === 'despido') {
      return `DESPIDO — DATOS ESPECÍFICOS
Fecha de ingreso: ${fmtFechaISO(val('mn-d_fecha_ingreso')) || '-'}
Fecha de egreso: ${fmtFechaISO(val('mn-d_fecha_egreso')) || '-'}
Remuneración mensual: ${val('mn-d_remuneracion') || '-'}
Categoría / tareas: ${val('mn-d_categoria') || '-'}
Jornada: ${val('mn-d_jornada') || '-'}
Registración: ${container.querySelector('#mn-d_registrado').selectedOptions[0].textContent}
Causal invocada: ${container.querySelector('#mn-d_causal').selectedOptions[0].textContent}
Forma de comunicación: ${val('mn-d_forma_comunicacion') || '-'}
Fecha de intimación/es: ${fmtFechaISO(val('mn-d_fecha_intimaciones')) || '-'}
Fecha de notificación de la causa: ${fmtFechaISO(val('mn-d_fecha_notificacion_causa')) || '-'}
Causa invocada por el empleador: ${val('mn-d_causa_invocada') || '-'}`;
    }
    if (ramaActual === 'consumidor') {
      return `CONSUMIDOR — DATOS ESPECÍFICOS
Materia: ${container.querySelector('#mn-c_materia').selectedOptions[0].textContent}
Tipo de reclamo: ${container.querySelector('#mn-c_tipo').selectedOptions[0]?.textContent || '-'}
Fecha del hecho: ${fmtFechaISO(val('mn-c_fecha_hecho')) || '-'}
Monto reclamado: ${val('mn-c_monto_reclamado') || '-'}
Producto/servicio: ${val('mn-c_producto_servicio') || '-'}
N° de póliza: ${val('mn-c_numero_poliza') || '-'}
Descripción del incumplimiento: ${val('mn-c_incumplimiento') || '-'}`;
    }
    if (ramaActual === 'amparo') {
      return `AMPARO DE SALUD — DATOS ESPECÍFICOS
Tipo de demandado: ${container.querySelector('#mn-a_tipo_demandado').selectedOptions[0].textContent}
N° de afiliado: ${val('mn-a_numero_afiliado') || '-'}
Médico/a tratante: ${val('mn-a_medico_tratante') || '-'}
Fecha de prescripción médica: ${fmtFechaISO(val('mn-a_fecha_prescripcion')) || '-'}
Fecha de solicitud a la demandada: ${fmtFechaISO(val('mn-a_fecha_solicitud')) || '-'}
Fecha de la negativa/omisión: ${fmtFechaISO(val('mn-a_fecha_negativa')) || '-'}
Costo del tratamiento: ${val('mn-a_monto_tratamiento') || '-'}
Diagnóstico: ${val('mn-a_diagnostico') || '-'}
Tratamiento requerido: ${val('mn-a_tratamiento') || '-'}
Fundamento de la negativa: ${val('mn-a_forma_negativa') || '-'}
Riesgo para la salud: ${val('mn-a_riesgo_salud') || '-'}`;
    }
    if (ramaActual === 'art') {
      return `ART — DATOS ESPECÍFICOS
ART interviniente: ${val('mn-art_nombre_art') || '-'}
Domicilio de la ART: ${val('mn-art_dom_art') || '-'}
Empleador asegurado: ${container.querySelector('#mn-art_empleador_asegurado').selectedOptions[0].textContent}
Tipo de contingencia: ${container.querySelector('#mn-art_tipo_contingencia').selectedOptions[0].textContent}
Fecha del siniestro: ${fmtFechaISO(val('mn-art_fecha_siniestro')) || '-'}
Parte del cuerpo afectada: ${val('mn-art_parte_cuerpo') || '-'}
Fecha de denuncia ante la ART: ${fmtFechaISO(val('mn-art_fecha_denuncia')) || '-'}
Resultado de la denuncia: ${val('mn-art_resultado_denuncia') || '-'}
Monto reclamado: ${val('mn-art_monto_reclamado') || '-'}
Descripción del hecho: ${val('mn-art_descripcion') || '-'}
Fecha de notificación del dictamen de Comisión Médica: ${fmtFechaISO(val('mn-art_fecha_dictamen_cm')) || '-'}
Contenido del dictamen: ${val('mn-art_contenido_dictamen') || '-'}
Opción del art. 4, Ley 26.773: ${container.querySelector('#mn-art_opcion_ley26773').selectedOptions[0].textContent}`;
    }
    if (ramaActual === 'sucesiones') {
      const herederos = leerLista(wrapSucHerederos(), 'mn-suc-heredero', ['nombre', 'dni', 'vinculo', 'domicilio']);
      const herederosTexto = herederos.length
        ? herederos.map(h => `- ${h.nombre || '[NOMBRE]'} — DNI: ${h.dni || '-'} — Vínculo: ${h.vinculo || '-'} — Domicilio: ${h.domicilio || '-'}`).join('\n')
        : '- (sin herederos cargados)';
      const esTestamentaria = val('mn-suc_subtipo') === 'testamentaria';
      let bloqueTestamentoTexto = '';
      if (esTestamentaria) {
        const esOlografo = container.querySelector('#mn-suc_forma_testamento').value === 'ologrofo';
        bloqueTestamentoTexto = `
Forma del testamento: ${container.querySelector('#mn-suc_forma_testamento').selectedOptions[0].textContent}
Fecha de otorgamiento: ${fmtFechaISO(val('mn-suc_fecha_testamento')) || '-'}
${esOlografo
  ? `Testigo 1: ${val('mn-suc_testigo1_testamento') || '-'}\nTestigo 2: ${val('mn-suc_testigo2_testamento') || '-'}`
  : `Escribano/a interviniente: ${val('mn-suc_escribano') || '-'}\nN° de Registro Notarial: ${val('mn-suc_registro_notarial') || '-'}`}`;
      }
      return `SUCESIÓN — DATOS ESPECÍFICOS
Tipo de sucesión: ${container.querySelector('#mn-suc_subtipo').selectedOptions[0].textContent}
Causante: ${val('mn-suc_causante_nombre') || '-'}
DNI del causante: ${val('mn-suc_causante_dni') || '-'}
Fecha de fallecimiento: ${fmtFechaISO(val('mn-suc_fecha_fallecimiento')) || '-'}
Lugar de fallecimiento: ${val('mn-suc_lugar_fallecimiento') || '-'}
Último domicilio del causante: ${val('mn-suc_ultimo_domicilio') || '-'}
Bienes registrables denunciados: ${val('mn-suc_bienes_registrables') || '-'}
Juzgado / jurisdicción: ${val('mn-suc_jurisdiccion') || '-'}
¿Conflicto entre herederos?: ${container.querySelector('#mn-suc_conflicto_herederos').checked ? 'Sí' : 'No'}${bloqueTestamentoTexto}

Herederos denunciados:
${herederosTexto}

Administrador/a provisional propuesto/a: ${chkSucAdministrador.checked ? (val('mn-suc_administrador_nombre') || '(a designar)') : 'No se solicita'}`;
    }
    if (ramaActual === 'divorcio') {
      const esUnilateral = container.querySelector('#mn-dv_subtipo').value === 'presentacion_unilateral';
      const hijos = leerLista(wrapDvHijos(), 'mn-dv-hijo', ['nombre', 'fecha_nacimiento', 'dni']);
      const bienes = leerLista(wrapDvBienes(), 'mn-dv-bien', ['descripcion', 'atribucion']);
      const hijosTexto = hijos.length
        ? hijos.map(h => `- ${h.nombre || '[NOMBRE]'} — Fecha de nacimiento: ${fmtFechaISO(h.fecha_nacimiento) || '-'} — DNI: ${h.dni || '-'}`).join('\n')
        : '- (sin hijos/as en común denunciados)';
      const bienesTexto = bienes.length
        ? bienes.map(b => `- ${b.descripcion || '[BIEN]'} — Atribución propuesta: ${b.atribucion || '-'}`).join('\n')
        : '- (sin bienes gananciales denunciados)';
      return `DIVORCIO — DATOS ESPECÍFICOS
Tipo de presentación: ${container.querySelector('#mn-dv_subtipo').selectedOptions[0].textContent}
Cónyuge 1 (parte consultante): ${val('mn-cliente_nombre') || '-'} — DNI: ${val('mn-cliente_dni') || '-'} — Domicilio: ${val('mn-cliente_domicilio') || '-'}
Cónyuge 2 / otro cónyuge: ${val('mn-dv_conyuge2_nombre') || '-'} — DNI: ${val('mn-dv_conyuge2_dni') || '-'} — Domicilio: ${val('mn-dv_conyuge2_domicilio') || '-'}
Fecha de celebración del matrimonio: ${fmtFechaISO(val('mn-dv_fecha_matrimonio')) || '-'}
Lugar / Registro Civil: ${val('mn-dv_lugar_matrimonio') || '-'}
Acta N° / Tomo / Folio: ${val('mn-dv_acta_matrimonio') || '-'}
Último domicilio conyugal: ${val('mn-dv_ultimo_domicilio_conyugal') || '-'}
¿Conflicto de intereses entre los cónyuges?: ${container.querySelector('#mn-dv_conflicto_intereses').checked ? 'Sí' : 'No'}${esUnilateral ? `\nEl otro cónyuge propondría su propio convenio (art. 438, 2° párr., CCCN): ${container.querySelector('#mn-dv_otro_conyuge_propone').checked ? 'Sí' : 'No'}` : ''}

Hijos/as en común:
${hijosTexto}
¿Hijo/a mayor con capacidad restringida?: ${container.querySelector('#mn-dv_hijo_capacidad_restringida').checked ? 'Sí' : 'No'}

Bienes gananciales a liquidar:
${bienesTexto}

Convenio regulador — borrador:
Vivienda familiar: ${val('mn-dv_vivienda_convenio') || '-'}
Compensación económica: ${val('mn-dv_compensacion_economica_detalle') || '-'}
Cuidado personal: ${val('mn-dv_cuidado_personal') || '-'}
Régimen de comunicación: ${val('mn-dv_regimen_comunicacion') || '-'}
Cuota alimentaria: ${val('mn-dv_alimentos_hijos') || '-'}
Otros acuerdos: ${val('mn-dv_otros_acuerdos') || '-'}`;
    }
    return '';
  }

  container.querySelector('#mn-generar').addEventListener('click', () => {
    const cronologia = leerLista(wrapCronologia(), 'mn-cron', ['fecha', 'detalle']);
    const testigos = leerLista(wrapTestigos(), 'mn-test', ['nombre', 'dni', 'domicilio', 'contacto', 'declarar']);
    const gestiones = leerLista(wrapGestiones(), 'mn-ges', ['fecha', 'medio', 'resultado']);
    const coactores = leerLista(wrapCoactores(), 'mn-coactor', ['nombre', 'dni', 'domicilio']);
    const codemandados = leerLista(wrapCodemandados(), 'mn-codem', ['nombre', 'domicilio', 'cuit']);

    const docAportada = DOC_ITEMS.filter(p => container.querySelector(`[data-doc="${p.id}"]`).checked)
      .map(p => `- ${p.label}${(() => { const d = container.querySelector(`[data-doc-dato="${p.id}"]`)?.value.trim(); return d ? `: ${d}` : ''; })()}`)
      .join('\n');

    const cronologiaTexto = cronologia.length
      ? cronologia.map(c => `- ${fmtFechaISO(c.fecha) || '[FECHA]'}: ${c.detalle || '-'}`).join('\n')
      : '- (sin hechos cargados)';

    const testigosTexto = testigos.length
      ? testigos.map(t => `- ${t.nombre || '[NOMBRE]'} — DNI: ${t.dni || '-'} — Domicilio: ${t.domicilio || '-'} — Contacto: ${t.contacto || '-'} — Puede declarar: ${t.declarar || '-'}`).join('\n')
      : '- (sin testigos cargados)';

    const coactoresTexto = coactores.length
      ? coactores.map(c => `- ${c.nombre || '[NOMBRE]'} — DNI: ${c.dni || '-'} — Domicilio: ${c.domicilio || '-'}`).join('\n')
      : '- (sin coactores/as cargados)';

    const codemandadosTexto = codemandados.length
      ? codemandados.map(c => `- ${c.nombre || '[NOMBRE]'} — Domicilio: ${c.domicilio || '-'} — CUIT: ${c.cuit || '-'}`).join('\n')
      : '- (sin codemandados/as cargados)';

    const gestionesTexto = gestiones.length
      ? gestiones.map(g => `- ${fmtFechaISO(g.fecha) || '[FECHA]'} — ${g.medio || '-'} — Resultado: ${g.resultado || '-'}`).join('\n')
      : '- (sin gestiones previas cargadas)';

    const abogadoLabel = container.querySelector('#mn-abogado').selectedOptions[0].textContent;

    const texto =
`MINUTA DE CASO — ${RAMAS[ramaActual].label.toUpperCase()}

IDENTIFICACIÓN
Fecha de la entrevista: ${fmtFechaISO(val('mn-fecha_entrevista')) || '-'}
Abogado/a interviniente: ${abogadoLabel}
N° de legajo interno: ${val('mn-legajo') || '-'}

PARTE CONSULTANTE
Nombre: ${val('mn-cliente_nombre') || '-'}
DNI: ${val('mn-cliente_dni') || '-'}
CUIL: ${val('mn-cliente_cuil') || '-'}
Domicilio: ${val('mn-cliente_domicilio') || '-'}
Teléfono: ${val('mn-cliente_telefono') || '-'}
Email: ${val('mn-cliente_email') || '-'}
Edad: ${val('mn-cliente_edad') || '-'}
Estado civil: ${val('mn-cliente_estado_civil') || '-'}
Nacionalidad: ${val('mn-cliente_nacionalidad') || '-'}
Profesión: ${val('mn-cliente_profesion') || '-'}

COACTORES/AS
${coactoresTexto}

CONTRAPARTE
Nombre / Razón social: ${val('mn-contraparte_nombre') || '-'}
CUIT: ${val('mn-contraparte_cuit') || '-'}
Domicilio: ${val('mn-contraparte_domicilio') || '-'}

CODEMANDADOS/AS
${codemandadosTexto}

${bloqueRamaTexto()}

CRONOLOGÍA DE HECHOS
${cronologiaTexto}

DOCUMENTACIÓN APORTADA
${docAportada || '- (ninguna marcada)'}

DOCUMENTACIÓN PENDIENTE DE GESTIONAR
${val('mn-doc_pendiente') || '-'}

TESTIGOS
${testigosTexto}

GESTIONES PREVIAS / RECLAMOS EXTRAJUDICIALES
${gestionesTexto}

VALORACIÓN PRELIMINAR
${val('mn-valoracion') || '-'}

──────────────────────────────────────────────
Documento de trabajo interno del Estudio. No constituye un escrito judicial ni asesoramiento legal.`;

    textarea.value = texto;
    divRes.style.display = 'block';
    divEnviarConf.style.display = 'none';
    textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  container.querySelector('#mn-limpiar').addEventListener('click', () => {
    container.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], textarea').forEach(el => { el.value = ''; el.classList.remove('error'); });
    container.querySelectorAll('select').forEach(el => { el.selectedIndex = 0; });
    poblarTiposConsumidor();
    container.querySelectorAll('.mn-doc-check').forEach(c => c.checked = false);
    container.querySelectorAll('.mn-doc-dato').forEach(el => { el.disabled = true; el.style.display = 'none'; });
    wrapCronologia().innerHTML = ''; cronContador.count = 0; cronContador.activos = 0;
    wrapTestigos().innerHTML = ''; testContador.count = 0; testContador.activos = 0;
    wrapGestiones().innerHTML = ''; gesContador.count = 0; gesContador.activos = 0;
    wrapCoactores().innerHTML = ''; coactoresContador.count = 0; coactoresContador.activos = 0;
    wrapCodemandados().innerHTML = ''; codemandadosContador.count = 0; codemandadosContador.activos = 0;
    wrapSucHerederos().innerHTML = ''; sucHerederosContador.count = 0; sucHerederosContador.activos = 0;
    wrapDvHijos().innerHTML = ''; dvHijosContador.count = 0; dvHijosContador.activos = 0;
    wrapDvBienes().innerHTML = ''; dvBienesContador.count = 0; dvBienesContador.activos = 0;
    container.querySelector('#mn-d_plazo_resultado').innerHTML = '';
    container.querySelector('#mn-c_plazo_resultado').innerHTML = '';
    container.querySelector('#mn-a_plazo_resultado').innerHTML = '';
    container.querySelector('#mn-art_plazo_resultado_cm').innerHTML = '';
    container.querySelector('#mn-art_plazo_resultado_presc').innerHTML = '';
    container.querySelector('#mn-a_plazo_feria').checked = true;
    container.querySelector('#mn-art_plazo_feria').checked = true;
    chkSucAdministrador.checked = false;
    wrapSucAdministrador.style.display = 'none';
    actualizarBloqueTestamentoMinuta();
    actualizarDivorcioUnilateral();
    actualizarBloqueRama();
    divRes.style.display = 'none';
    divEnviarConf.style.display = 'none';
    textarea.value = '';
  });

  container.querySelector('#mn-copiar').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      const btn = container.querySelector('#mn-copiar');
      const orig = btn.textContent;
      btn.textContent = 'Copiado ✓';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => prompt('Copie el texto:', texto));
  });

  container.querySelector('#mn-pdf').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const lineas = texto.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    exportarPDF(`Minuta de caso — ${val('mn-cliente_nombre') || 'consultante'}`, `<div class="info-box" style="font-size:12px;line-height:1.7">${lineas}</div>`);
  });

  // ── Enviar a Generador de Demanda ────────────────────────────────────────
  function construirPayload() {
    const fecha = fmtFecha(new Date());
    const base = {
      fecha,
      campos: {
        nombre: val('mn-cliente_nombre'),
        dni: val('mn-cliente_dni'),
        domicilio: val('mn-cliente_domicilio'),
      },
    };

    // ── Coactores/codemandados/testigos/documentación: comunes a Despido,
    // Consumidor, Amparo de Salud y ART (Sucesiones usa su propio esquema
    // de herederos y no envía estos campos) ──────────────────────────────
    const extrasPartes = {
      coactores: leerLista(wrapCoactores(), 'mn-coactor', ['nombre', 'dni', 'domicilio']),
      codemandados: leerLista(wrapCodemandados(), 'mn-codem', ['nombre', 'domicilio', 'cuit']),
      testigos: leerLista(wrapTestigos(), 'mn-test', ['nombre', 'dni', 'domicilio', 'contacto', 'declarar']),
      documentacion: {
        items: DOC_ITEMS.filter(p => container.querySelector(`[data-doc="${p.id}"]`).checked).map(p => ({
          id: p.id,
          detalle: container.querySelector(`[data-doc-dato="${p.id}"]`)?.value.trim() || '',
        })),
      },
    };

    if (ramaActual === 'despido') {
      return {
        ...base,
        ...extrasPartes,
        campos: {
          actor_nombre: val('mn-cliente_nombre'),
          actor_dni: val('mn-cliente_dni'),
          actor_cuil: val('mn-cliente_cuil'),
          actor_domicilio_real: val('mn-cliente_domicilio'),
          actor_edad: val('mn-cliente_edad'),
          actor_estado_civil: val('mn-cliente_estado_civil'),
          actor_nacionalidad: val('mn-cliente_nacionalidad'),
          actor_profesion: val('mn-cliente_profesion'),
          empleador_nombre: val('mn-contraparte_nombre'),
          empleador_cuit: val('mn-contraparte_cuit'),
          empleador_domicilio: val('mn-contraparte_domicilio'),
          fecha_ingreso: val('mn-d_fecha_ingreso'),
          fecha_egreso: val('mn-d_fecha_egreso'),
          remuneracion_mensual: val('mn-d_remuneracion'),
          categoria_tareas: val('mn-d_categoria'),
          jornada: val('mn-d_jornada'),
          causa_invocada: val('mn-d_causa_invocada'),
          forma_comunicacion: val('mn-d_forma_comunicacion'),
          fecha_intimaciones: val('mn-d_fecha_intimaciones'),
          fecha_notificacion_causa: val('mn-d_fecha_notificacion_causa'),
        },
        selects: {
          registrado: val('mn-d_registrado') || container.querySelector('#mn-d_registrado').value,
          causal: val('mn-d_causal') || container.querySelector('#mn-d_causal').value,
        },
      };
    }
    if (ramaActual === 'consumidor') {
      return {
        ...base,
        ...extrasPartes,
        materia: selCMateria.value,
        tipo: selCTipo.value,
        campos: {
          nombre: val('mn-cliente_nombre'),
          dni: val('mn-cliente_dni'),
          domicilio: val('mn-cliente_domicilio'),
          razon_social: val('mn-contraparte_nombre'),
          cuit: val('mn-contraparte_cuit'),
          dom_destinatario: val('mn-contraparte_domicilio'),
          monto_reclamado: val('mn-c_monto_reclamado'),
          fecha_hecho: val('mn-c_fecha_hecho'),
          producto_servicio: val('mn-c_producto_servicio'),
          numero_poliza: val('mn-c_numero_poliza'),
          incumplimiento: val('mn-c_incumplimiento'),
        },
      };
    }
    if (ramaActual === 'amparo') {
      return {
        ...base,
        ...extrasPartes,
        materia: container.querySelector('#mn-a_tipo_demandado').value,
        campos: {
          nombre: val('mn-cliente_nombre'),
          dni: val('mn-cliente_dni'),
          domicilio: val('mn-cliente_domicilio'),
          edad: val('mn-cliente_edad'),
          razon_social: val('mn-contraparte_nombre'),
          dom_destinatario: val('mn-contraparte_domicilio'),
          numero_afiliado: val('mn-a_numero_afiliado'),
          diagnostico: val('mn-a_diagnostico'),
          tratamiento_prescripto: val('mn-a_tratamiento'),
          medico_tratante: val('mn-a_medico_tratante'),
          fecha_prescripcion: val('mn-a_fecha_prescripcion'),
          fecha_solicitud: val('mn-a_fecha_solicitud'),
          fecha_negativa: val('mn-a_fecha_negativa'),
          forma_negativa: val('mn-a_forma_negativa'),
          monto_tratamiento: val('mn-a_monto_tratamiento'),
          riesgo_salud: val('mn-a_riesgo_salud'),
        },
      };
    }
    if (ramaActual === 'art') {
      const tipoContingencia = container.querySelector('#mn-art_tipo_contingencia').selectedOptions[0].textContent;
      const descripcion = val('mn-art_descripcion');
      return {
        ...base,
        ...extrasPartes,
        materia: 'riesgos_trabajo',
        tipo: val('mn-art_tipo_sugerido') || container.querySelector('#mn-art_tipo_sugerido').value,
        empleadorAsegurado: container.querySelector('#mn-art_empleador_asegurado').value === 'si',
        opcionLey26773: container.querySelector('#mn-art_opcion_ley26773').value,
        campos: {
          nombre: val('mn-cliente_nombre'),
          dni: val('mn-cliente_dni'),
          domicilio: val('mn-cliente_domicilio'),
          art_nombre: val('mn-art_nombre_art'),
          dom_art: val('mn-art_dom_art'),
          empleador_nombre: val('mn-contraparte_nombre'),
          dom_empleador: val('mn-contraparte_domicilio'),
          fecha_siniestro: val('mn-art_fecha_siniestro'),
          descripcion_hecho: descripcion ? `Tipo de contingencia: ${tipoContingencia}. ${descripcion}` : `Tipo de contingencia: ${tipoContingencia}.`,
          parte_cuerpo: val('mn-art_parte_cuerpo'),
          fecha_denuncia: val('mn-art_fecha_denuncia'),
          monto_reclamado: val('mn-art_monto_reclamado'),
          fecha_dictamen: val('mn-art_fecha_dictamen_cm'),
          contenido_dictamen: val('mn-art_contenido_dictamen'),
        },
      };
    }
    if (ramaActual === 'sucesiones') {
      const herederos = leerLista(wrapSucHerederos(), 'mn-suc-heredero', ['nombre', 'dni', 'vinculo', 'domicilio']);
      return {
        ...base,
        subtipo: val('mn-suc_subtipo') || container.querySelector('#mn-suc_subtipo').value,
        campos: {
          causante_nombre: val('mn-suc_causante_nombre'),
          causante_dni: val('mn-suc_causante_dni'),
          fecha_fallecimiento: val('mn-suc_fecha_fallecimiento'),
          lugar_fallecimiento: val('mn-suc_lugar_fallecimiento'),
          ultimo_domicilio: val('mn-suc_ultimo_domicilio'),
          bienes_registrables: val('mn-suc_bienes_registrables'),
          forma_testamento: container.querySelector('#mn-suc_forma_testamento').value,
          fecha_testamento: val('mn-suc_fecha_testamento'),
          escribano: val('mn-suc_escribano'),
          registro_notarial: val('mn-suc_registro_notarial'),
          testigo1_testamento: val('mn-suc_testigo1_testamento'),
          testigo2_testamento: val('mn-suc_testigo2_testamento'),
          juzgado: val('mn-suc_jurisdiccion'),
          administrador_nombre: chkSucAdministrador.checked ? val('mn-suc_administrador_nombre') : '',
        },
        conflictoHerederos: container.querySelector('#mn-suc_conflicto_herederos').checked,
        administradorCheck: chkSucAdministrador.checked,
        herederos,
      };
    }
    if (ramaActual === 'divorcio') {
      const hijos = leerLista(wrapDvHijos(), 'mn-dv-hijo', ['nombre', 'fecha_nacimiento', 'dni']);
      const bienes = leerLista(wrapDvBienes(), 'mn-dv-bien', ['descripcion', 'atribucion']);
      return {
        ...base,
        subtipo: val('mn-dv_subtipo') || container.querySelector('#mn-dv_subtipo').value,
        campos: {
          conyuge1_nombre: val('mn-cliente_nombre'),
          conyuge1_dni: val('mn-cliente_dni'),
          conyuge1_domicilio: val('mn-cliente_domicilio'),
          conyuge2_nombre: val('mn-dv_conyuge2_nombre'),
          conyuge2_dni: val('mn-dv_conyuge2_dni'),
          conyuge2_domicilio: val('mn-dv_conyuge2_domicilio'),
          fecha_matrimonio: val('mn-dv_fecha_matrimonio'),
          lugar_matrimonio: val('mn-dv_lugar_matrimonio'),
          acta_matrimonio: val('mn-dv_acta_matrimonio'),
          ultimo_domicilio_conyugal: val('mn-dv_ultimo_domicilio_conyugal'),
          vivienda_convenio: val('mn-dv_vivienda_convenio'),
          compensacion_economica_detalle: val('mn-dv_compensacion_economica_detalle'),
          cuidado_personal: val('mn-dv_cuidado_personal'),
          regimen_comunicacion: val('mn-dv_regimen_comunicacion'),
          alimentos_hijos: val('mn-dv_alimentos_hijos'),
          otros_acuerdos: val('mn-dv_otros_acuerdos'),
        },
        conflictoIntereses: container.querySelector('#mn-dv_conflicto_intereses').checked,
        hijoCapacidadRestringida: container.querySelector('#mn-dv_hijo_capacidad_restringida').checked,
        otroConyugePropone: container.querySelector('#mn-dv_otro_conyuge_propone').checked,
        hijos,
        bienes,
      };
    }
    return base;
  }

  container.querySelector('#mn-enviar').addEventListener('click', () => {
    const payload = construirPayload();
    const rama = RAMAS[ramaActual];
    try {
      localStorage.setItem(rama.prefillKey, JSON.stringify(payload));
    } catch (e) {
      divEnviarConf.style.display = 'block';
      divEnviarConf.innerHTML = `<div class="display-box" style="color:#c00">No se pudieron guardar los datos (${e.message}).</div>`;
      return;
    }
    divEnviarConf.style.display = 'block';
    divEnviarConf.innerHTML = `<div class="display-box" style="background:#e8f4ea;border-color:#7ab88a">
      ✅ Datos enviados. Abrí el <strong>${rama.destinoLabel || `Generador de Demanda — ${rama.label}`}</strong> y aceptá el banner para cargarlos.
      <div style="margin-top:8px"><button class="btn btn-primary" id="mn-ir-a-demanda" type="button">Ir ahora</button></div>
    </div>`;
    container.querySelector('#mn-ir-a-demanda').addEventListener('click', () => { location.hash = rama.destino; });
  });
}
