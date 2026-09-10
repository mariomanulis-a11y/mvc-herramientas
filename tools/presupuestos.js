// Generador de Presupuestos — MVC Abogados
// Presupuestos diferenciados por tipo de trámite, con honorarios configurables:
// monto único (fijo + variable) o por 3 etapas propias de cada materia,
// cálculo manual o automático (% sobre un monto base), y equivalente en Jus
// arancelario (Ley 14.967).
import { exportarPDF } from './exportar.js';
import { initGuardarMiExpediente } from './mi-expediente.js';

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
        'Inicio y trámites previos',
        'Declaratoria de Herederos',
        'Inscripción y Partición',
      ],
      baseDesc: 'Monto del acervo hereditario / valor de los bienes a adjudicar',
      enfoque: (sub) => 'Su objetivo es asegurar la transmisión ordenada del patrimonio del causante a los herederos, evitando conflictos entre las partes y protegiendo el valor de los bienes hasta su adjudicación definitiva. Para lograrlo, nos encargamos de:',
      costoInaccion: (sub) => 'Mientras no se inicie y concluya el proceso sucesorio, los bienes registrables del causante permanecen inmovilizados: no pueden venderse, no pueden ofrecerse en garantía ni ser objeto de créditos hipotecarios, y su administración (cobro de alquileres, pago de expensas e impuestos) queda en una situación de hecho que expone a los herederos a reclamos de terceros. Cuanto más se demore el inicio del trámite, mayor es el riesgo de acumulación de deudas impagas sobre los bienes del acervo (impuestos, expensas, servicios) y de aparición de nuevos reclamantes o controversias entre herederos.',
      gastos: ['tasa_justicia', 'sobretasa_justicia', 'bono_ley_8480', 'itgb', 'sellados', 'edictos', 'inscripcion_registral', 'certificados_dominio', 'peritos'],
    },
    divorcio: {
      label: 'Divorcio (PBA)',
      subtipos: { presentacion_conjunta: 'Presentación Conjunta', presentacion_unilateral: 'Presentación Unilateral' },
      campos: ['conyuge1', 'conyuge2', 'fecha_matrimonio', 'cant_hijos', 'cant_bienes', 'conflicto_intereses_divorcio', 'jurisdiccion'],
      alcance: (sub) => sub === 'presentacion_unilateral'
        ? 'Redacción de la petición de divorcio vincular unilateral (art. 437, CCCN) y de la propuesta de convenio regulador (arts. 438 y 439, CCCN); presentación ante el Juzgado de Familia competente; seguimiento del traslado a la contraparte y de la homologación de los acuerdos alcanzados, o de la fijación de audiencia ante la falta de acuerdo (Libro VIII, CPCC de la Provincia de Buenos Aires, texto según Ley 13.634).'
        : 'Redacción de la petición conjunta de divorcio vincular (art. 437, CCCN) y del convenio regulador (arts. 438 y 439, CCCN) acordado entre ambos cónyuges; presentación ante el Juzgado de Familia competente; seguimiento hasta la sentencia de divorcio y la homologación del convenio (Libro VIII, CPCC de la Provincia de Buenos Aires, texto según Ley 13.634).',
      etapas: (sub) => sub === 'presentacion_unilateral'
        ? [
            'Redacción de la petición y de la propuesta de convenio regulador',
            'Presentación, traslado y eventual audiencia (art. 438, CCCN)',
            'Sentencia de divorcio y homologación del convenio',
          ]
        : [
            'Redacción de la petición conjunta y del convenio regulador',
            'Presentación ante el Juzgado de Familia',
            'Sentencia de divorcio y homologación del convenio',
          ],
      baseDesc: 'Monto de referencia (cuota alimentaria / compensación económica / bienes a liquidar)',
      enfoque: (sub) => 'Su objetivo es obtener la disolución del vínculo matrimonial y la regulación ordenada de sus efectos (vivienda, bienes, hijos/as, compensación económica) de la manera más eficiente y menos conflictiva posible. Para lograrlo, nos encargamos de:',
      costoInaccion: (sub) => sub === 'presentacion_unilateral'
        ? 'La falta de una presentación técnica adecuada expone a demoras evitables en el traslado y en la fijación de la audiencia prevista en el art. 438 del CCCN, y puede derivar en una propuesta de convenio regulador que no contemple adecuadamente todos los aspectos exigidos por el art. 439 del CCCN (vivienda, bienes, compensación económica, cuidado personal, régimen de comunicación y alimentos), generando revisiones y controversias posteriores.'
        : 'La falta de un convenio regulador completo y técnicamente preciso (art. 439, CCCN) puede dar lugar a controversias futuras entre los cónyuges sobre la vivienda, los bienes gananciales, el cuidado personal de los hijos/as o la cuota alimentaria, que podrían haberse evitado con una redacción clara desde el inicio.',
      gastos: ['tasa_justicia', 'sobretasa_justicia', 'bono_ley_8480', 'certificados_dominio', 'inscripcion_registral', 'peritos'],
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
      enfoque: (sub) => 'Su objetivo como empleador es resolver el conflicto laboral planteado minimizando la exposición económica y reputacional de la empresa, evitando que el paso del tiempo agrave la contingencia. Para lograrlo, nos encargamos de:',
      costoInaccion: (sub) => 'La falta de una defensa técnica oportuna expone a la empresa a que el reclamo prospere en su totalidad, monto que se incrementa además por los intereses devengados desde la mora hasta el efectivo pago (conforme la tasa que fije la Suprema Corte de la Provincia de Buenos Aires o el fuero interviniente) y, eventualmente, por sanciones conminatorias o multas procesales derivadas de incomparecencias o incumplimientos. Una defensa técnica adecuada, en cambio, permite explorar salidas conciliatorias tempranas y acotar la contingencia.',
      gastos: ['tasa_justicia', 'sobretasa_justicia', 'bono_ley_8480', 'peritos'],
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
      enfoque: (sub) => 'Su objetivo es obtener la reparación integral del daño sufrido de la manera más eficiente posible, evitando que el paso del tiempo perjudique la prueba disponible o el cobro efectivo de la indemnización. Para lograrlo, nos encargamos de:',
      costoInaccion: (sub) => 'El paso del tiempo juega en contra del reclamante: la prueba testimonial se deteriora, la documental puede extraviarse o volverse inaccesible, y corren los plazos de prescripción de la acción. A la vez, el eventual monto de condena se incrementa por los intereses devengados desde la fecha del hecho o la mora hasta el efectivo pago. Iniciar el reclamo a tiempo preserva la prueba disponible y maximiza el valor efectivamente recuperable.',
      gastos: ['tasa_justicia', 'sobretasa_justicia', 'bono_ley_8480', 'mediacion', 'peritos'],
    },
    amparo_salud: {
      label: 'Amparo de Salud con Medida Cautelar',
      campos: ['actor_amparo', 'demandado_amparo', 'prestacion_reclamada', 'urgencia_medica'],
      alcance: () => 'Interposición de la acción de amparo de salud con solicitud de medida cautelar de cobertura inmediata de la prestación requerida; seguimiento del trámite hasta la resolución de la cautelar y la sentencia definitiva de fondo.',
      etapas: () => [
        'Interposición del amparo y medida cautelar',
        'Contestación de la demandada y producción de prueba',
        'Sentencia definitiva y seguimiento del cumplimiento',
      ],
      baseDesc: 'Valor estimado de la prestación / tratamiento reclamado',
      enfoque: () => 'Su objetivo es obtener la cobertura de la prestación de salud requerida en el menor tiempo posible, dada la urgencia que habitualmente reviste este tipo de reclamos. Para lograrlo, nos encargamos de:',
      costoInaccion: () => 'La demora en judicializar un reclamo de cobertura de salud puede agravar el cuadro clínico del paciente y, en determinados casos, tornar irreversible el perjuicio, además de dificultar la reparación económica posterior. La vía del amparo con medida cautelar busca precisamente evitar esa demora, obteniendo una respuesta jurisdiccional en un plazo considerablemente menor al de un proceso ordinario.',
      gastos: ['tasa_justicia', 'sobretasa_justicia', 'bono_ley_8480', 'peritos'],
    },
    asesoramiento_pyme: {
      label: 'Asesoramiento Integral PYME (Laboral, RRHH, Compliance y Control Interno)',
      campos: ['empresa_cliente', 'rubro_pyme', 'cant_empleados_pyme'],
      alcance: () => 'Diagnóstico integral inicial de la empresa en materia laboral, de recursos humanos, compliance y control interno; elaboración de un plan de acción priorizado con plazos sugeridos; acompañamiento en la implementación de las medidas correctivas y preventivas identificadas; seguimiento y control periódico del grado de cumplimiento normativo e interno alcanzado.',
      etapas: () => [
        'Diagnóstico y relevamiento inicial',
        'Implementación del plan de acción',
        'Seguimiento y control periódico',
      ],
      baseDesc: 'Honorario mensual / abono por servicio de asesoramiento integral',
      enfoque: () => 'Su objetivo es contar con una gestión laboral, de recursos humanos y de control interno ordenada, que reduzca la exposición a contingencias (laborales, administrativas y reputacionales) y sostenga el cumplimiento normativo en el tiempo. Para lograrlo, nos encargamos de:',
      costoInaccion: () => 'La ausencia de un control preventivo en materia laboral, de recursos humanos y de compliance expone a la empresa a contingencias que se acumulan silenciosamente: relaciones laborales mal instrumentadas o no registradas, incumplimientos a normativa de higiene y seguridad, ausencia de canales de denuncia y códigos de ética exigibles en determinados regímenes, y debilidades de control interno que facilitan errores o irregularidades no detectadas a tiempo. Estas contingencias, cuando se detectan tardíamente (por ejemplo, ante una inspección, un reclamo laboral o una denuncia), resultan considerablemente más costosas de resolver que si se hubieran prevenido mediante un diagnóstico y un plan de acción oportunos.',
      gastos: ['terceros_pyme'],
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

    { id: 'conyuge1',            label: 'Cónyuge 1 (parte consultante / peticionante)', tipo: 'text' },
    { id: 'conyuge2',            label: 'Cónyuge 2 / otro cónyuge (opcional)',        tipo: 'text',   opcional: true },
    { id: 'fecha_matrimonio',    label: 'Fecha de celebración del matrimonio (opcional)', tipo: 'date', opcional: true },
    { id: 'cant_hijos',          label: 'Cantidad de hijos/as en común (opcional)',   tipo: 'entero', opcional: true },
    { id: 'cant_bienes',         label: 'Cantidad de bienes gananciales a liquidar (opcional)', tipo: 'entero', opcional: true },
    { id: 'conflicto_intereses_divorcio', label: '¿Existe conflicto de intereses entre los cónyuges?', tipo: 'checkbox' },

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

    { id: 'rubro_pyme',            label: 'Rubro / actividad de la empresa',            tipo: 'text',   opcional: true, placeholder: 'Comercio, industria, servicios, etc.' },
    { id: 'cant_empleados_pyme',   label: 'Cantidad de empleados',                      tipo: 'entero', opcional: true },

    { id: 'actor_amparo',          label: 'Actor / paciente',                           tipo: 'text', placeholder: 'Nombre y apellido' },
    { id: 'demandado_amparo',      label: 'Demandado (obra social / prepaga / Estado)', tipo: 'text', opcional: true, placeholder: 'Ej: OSDE, IOMA, Provincia de Buenos Aires' },
    { id: 'prestacion_reclamada',  label: 'Prestación / tratamiento reclamado',         tipo: 'text', opcional: true, placeholder: 'Medicación, cirugía, tratamiento, prótesis, etc.' },
    { id: 'urgencia_medica',       label: '¿Reviste urgencia médica actual?',           tipo: 'checkbox' },
  ];

  const CAMPO_BY_ID = Object.fromEntries(CAMPOS_CONFIG.map(c => [c.id, c]));

  // ── Gastos y aranceles habituales por rama (selector, siempre opcional) ─────
  // Lista orientativa según el tipo de proceso — no taxativa: el usuario puede
  // tildar los que correspondan y además agregar otros gastos no listados.
  const GASTOS_CONFIG = [
    { id: 'tasa_justicia',        label: 'Tasa de Justicia',                                    nota: 'Código Fiscal (Ley 10.397), actualizada anualmente por la Ley Impositiva provincial.' },
    { id: 'sobretasa_justicia',   label: 'Sobretasa de Justicia',                                nota: 'Aporte a la Caja de Previsión Social para Abogados de la Provincia de Buenos Aires, calculado sobre la Tasa de Justicia.' },
    { id: 'bono_ley_8480',        label: 'Bono de Derecho Fijo (Ley 8480)',                       nota: 'Aporte al Colegio de Abogados departamental, salvo exención aplicable.' },
    { id: 'itgb',                 label: 'ITGB — Impuesto a la Transmisión Gratuita de Bienes',   nota: 'Código Fiscal (Ley 10.397), aplicable si el acervo supera el mínimo no imponible vigente.' },
    { id: 'sellados',             label: 'Sellados de actuación',                                 nota: 'Actuaciones notariales, administrativas o registrales que requieran sellado.' },
    { id: 'edictos',              label: 'Publicación de edictos',                                nota: 'Diario Judicial / Boletín Oficial, según corresponda.' },
    { id: 'inscripcion_registral', label: 'Inscripción registral',                                nota: 'Registro de la Propiedad Inmueble / Automotor, según los bienes involucrados.' },
    { id: 'certificados_dominio', label: 'Certificados de dominio e inhibiciones',                nota: 'Solicitados ante el Registro de la Propiedad.' },
    { id: 'peritos',              label: 'Honorarios de peritos',                                 nota: 'Prueba pericial ofrecida (contable, médica, técnica, etc.), a cargo de la parte que la propone salvo distribución de costas.' },
    { id: 'mediacion',            label: 'Mediación prejudicial obligatoria',                     nota: 'Honorarios del mediador interviniente (Ley 13.951 / Ley 26.589, según fuero).' },
    { id: 'terceros_pyme',        label: 'Honorarios de terceros / proveedores externos',         nota: 'Auditorías, certificaciones u otros servicios contratados a terceros, si corresponde.' },
  ];
  const GASTOS_BY_ID = Object.fromEntries(GASTOS_CONFIG.map(g => [g.id, g]));

  // ── Equipo (para el apartado opcional "Profesionales intervinientes") ──────
  // Bios sintéticas, enfocadas en el ejercicio privado (se omite lo estatal/auditoría
  // por no ser relevante para el cliente que recibe el presupuesto).
  const EQUIPO = {
    mario:   { nombre: 'Mario Manulis',    bio: 'Derecho administrativo, derecho del consumidor, contratos y compliance corporativo.' },
    soledad: { nombre: 'Soledad Velazquez', bio: '25 años de trayectoria en derecho civil y laboral; contratos y negociación estratégica.' },
    camila:  { nombre: 'Camila Poggi',      bio: 'Derecho civil, sucesiones, contratos, familia, accidentes de tránsito y derecho del consumidor.' },
  };

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
      <div class="check-row">
        <input type="checkbox" id="pr-incluir-enfoque">
        <label for="pr-incluir-enfoque">Anteponer enfoque problema → solución (opcional)</label>
      </div>
      <div class="field-group" id="pr-enfoque-wrap" style="display:none;margin-bottom:10px">
        <label for="pr-enfoque">Texto de apertura — "Su objetivo" (editable)</label>
        <textarea id="pr-enfoque" rows="3"></textarea>
      </div>
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

      <div class="check-row" style="margin-top:10px">
        <input type="checkbox" id="pr-incluir-roi">
        <label for="pr-incluir-roi">Incluir relación honorario / monto en juego (opcional)</label>
      </div>
      <div id="pr-roi-nota" style="display:none;font-size:.78rem;color:var(--color-muted);margin-top:2px"></div>

      <div class="field-group" style="margin-top:10px">
        <label for="pr-honor-aclaraciones">Aclaraciones / limitaciones sobre los honorarios (opcional)</label>
        <textarea id="pr-honor-aclaraciones" rows="2" placeholder="Ej: el componente variable es estimado y se determinará en forma definitiva conforme al resultado del proceso."></textarea>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Valor agregado (opcional)</div>

      <div class="check-row">
        <input type="checkbox" id="pr-incluir-costo-inaccion">
        <label for="pr-incluir-costo-inaccion">Incluir apartado de costo de la inacción</label>
      </div>
      <div id="pr-costo-inaccion-wrap" style="display:none;margin:8px 0 10px">
        <div class="field-group">
          <label for="pr-costo-inaccion">Texto (editable)</label>
          <textarea id="pr-costo-inaccion" rows="4"></textarea>
        </div>
        <div class="form-row" id="pr-ci-numerico-wrap" style="display:none">
          <div class="field-group">
            <label for="pr-ci-meses">Meses estimados de demora</label>
            <input type="number" id="pr-ci-meses" min="0" step="1" placeholder="Ej: 12">
          </div>
          <div class="field-group">
            <label for="pr-ci-tasa">Tasa mensual estimada (%)</label>
            <input type="number" id="pr-ci-tasa" min="0" step="0.01" placeholder="Ej: 3.5 — verificar tasa vigente">
          </div>
        </div>
      </div>

      <div class="check-row">
        <input type="checkbox" id="pr-incluir-institucional">
        <label for="pr-incluir-institucional">Incluir "Por qué MVC Abogados" (opcional)</label>
      </div>
      <div class="field-group" id="pr-institucional-wrap" style="display:none;margin-top:6px">
        <label for="pr-institucional">Texto (editable)</label>
        <textarea id="pr-institucional" rows="3"></textarea>
      </div>

      <div class="check-row" style="margin-top:10px">
        <input type="checkbox" id="pr-incluir-equipo">
        <label for="pr-incluir-equipo">Incluir profesionales intervinientes (opcional)</label>
      </div>
      <div class="field-group" id="pr-equipo-wrap" style="display:none;margin:6px 0 10px">
        <div class="check-row" style="margin-bottom:4px">
          <input type="checkbox" class="pr-equipo-check" id="pr-equipo-mario" data-id="mario">
          <label for="pr-equipo-mario">Mario Manulis</label>
        </div>
        <div class="check-row" style="margin-bottom:4px">
          <input type="checkbox" class="pr-equipo-check" id="pr-equipo-soledad" data-id="soledad">
          <label for="pr-equipo-soledad">Soledad Velazquez</label>
        </div>
        <div class="check-row">
          <input type="checkbox" class="pr-equipo-check" id="pr-equipo-camila" data-id="camila">
          <label for="pr-equipo-camila">Camila Poggi</label>
        </div>
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
          <label>Gastos y aranceles estimados (opcional)</label>
          <p style="font-size:.78rem;color:var(--color-muted);margin:0 0 6px">Tildá los que correspondan a este proceso e indicá si están o no incluidos en el presupuesto. El listado es orientativo — podés agregar cualquier otro gasto no listado.</p>
          <div id="pr-gastos-selector" style="display:flex;flex-direction:column;gap:6px"></div>
          <div id="pr-gastos-custom" style="display:flex;flex-direction:column;gap:6px;margin-top:6px"></div>
          <button type="button" class="btn btn-ghost" id="pr-gasto-agregar" style="margin-top:8px;align-self:flex-start">+ Agregar otro gasto</button>
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
          <button class="btn btn-ghost"   id="pr-guardar-me">💾 Guardar en Mi Expediente</button>
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
  const chkEnfoque      = container.querySelector('#pr-incluir-enfoque');
  const wrapEnfoque     = container.querySelector('#pr-enfoque-wrap');
  const taEnfoque       = container.querySelector('#pr-enfoque');
  const chkRoi          = container.querySelector('#pr-incluir-roi');
  const divRoiNota      = container.querySelector('#pr-roi-nota');
  const chkCostoInaccion   = container.querySelector('#pr-incluir-costo-inaccion');
  const wrapCostoInaccion  = container.querySelector('#pr-costo-inaccion-wrap');
  const taCostoInaccion    = container.querySelector('#pr-costo-inaccion');
  const wrapCiNumerico     = container.querySelector('#pr-ci-numerico-wrap');
  const inpCiMeses         = container.querySelector('#pr-ci-meses');
  const inpCiTasa          = container.querySelector('#pr-ci-tasa');
  const chkInstitucional   = container.querySelector('#pr-incluir-institucional');
  const wrapInstitucional  = container.querySelector('#pr-institucional-wrap');
  const taInstitucional    = container.querySelector('#pr-institucional');
  const chkEquipo          = container.querySelector('#pr-incluir-equipo');
  const wrapEquipo         = container.querySelector('#pr-equipo-wrap');
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
  const divGastosSelector = container.querySelector('#pr-gastos-selector');
  const divGastosCustom   = container.querySelector('#pr-gastos-custom');
  const btnGastoAgregar   = container.querySelector('#pr-gasto-agregar');

  let ultimoTextoGenerado = '';
  let gastoCustomSeq = 0;
  let ultimoResultadoHonorarios = null;
  let alcanceTocadoManualmente = false;
  let enfoqueTocadoManualmente = false;
  let costoInaccionTocadoManualmente = false;

  taAlcance.addEventListener('input', () => { alcanceTocadoManualmente = true; });
  taEnfoque.addEventListener('input', () => { enfoqueTocadoManualmente = true; });
  taCostoInaccion.addEventListener('input', () => { costoInaccionTocadoManualmente = true; });

  // ── Gastos y aranceles: selector orientativo por rama + agregado libre ─────
  // Nunca es un listado cerrado: además de tildar los ítems sugeridos según el
  // proceso, el usuario puede sumar cualquier otro gasto no listado. Todo el
  // apartado es opcional — no incide si queda vacío.
  function renderGastosSelector() {
    const ramaKey = selRama.value;
    const rama = RAMAS[ramaKey];
    const ids = rama.gastos || [];
    if (!ids.length) {
      divGastosSelector.innerHTML = '';
      return;
    }
    divGastosSelector.innerHTML = ids.map(id => {
      const g = GASTOS_BY_ID[id];
      if (!g) return '';
      return `
        <div class="check-row pr-gasto-row" data-id="${g.id}" style="align-items:center;gap:8px;flex-wrap:wrap">
          <input type="checkbox" class="pr-gasto-check" id="pr-gasto-${g.id}" data-id="${g.id}">
          <label for="pr-gasto-${g.id}" style="flex:1;min-width:180px" title="${g.nota ? g.nota.replace(/"/g, '&quot;') : ''}">${g.label}</label>
          <select class="pr-gasto-incluido" data-id="${g.id}" style="display:none">
            <option value="no">No incluido en el presupuesto</option>
            <option value="si">Incluido en el presupuesto</option>
          </select>
        </div>`;
    }).join('');

    divGastosSelector.querySelectorAll('.pr-gasto-check').forEach(chk => {
      chk.addEventListener('change', () => {
        const sel = divGastosSelector.querySelector(`.pr-gasto-incluido[data-id="${chk.dataset.id}"]`);
        if (sel) sel.style.display = chk.checked ? '' : 'none';
      });
    });
  }

  function agregarGastoCustom() {
    const id = ++gastoCustomSeq;
    const row = document.createElement('div');
    row.className = 'check-row pr-gasto-custom-row';
    row.dataset.customId = String(id);
    row.style.cssText = 'align-items:center;gap:8px;flex-wrap:wrap';
    row.innerHTML = `
      <input type="text" class="pr-gasto-custom-label" data-id="${id}" placeholder="Nombre del gasto (Ej: honorarios de mediador)" style="flex:1;min-width:180px">
      <select class="pr-gasto-custom-incluido" data-id="${id}">
        <option value="no">No incluido en el presupuesto</option>
        <option value="si">Incluido en el presupuesto</option>
      </select>
      <button type="button" class="btn btn-ghost pr-gasto-custom-quitar" data-id="${id}" title="Quitar">✕</button>`;
    divGastosCustom.appendChild(row);
    row.querySelector('.pr-gasto-custom-quitar').addEventListener('click', () => row.remove());
  }

  btnGastoAgregar.addEventListener('click', agregarGastoCustom);

  // Devuelve los gastos tildados/agregados: {label, incluido, nota}[].
  function leerGastosSeleccionados() {
    const seleccionados = [];
    divGastosSelector.querySelectorAll('.pr-gasto-check:checked').forEach(chk => {
      const g = GASTOS_BY_ID[chk.dataset.id];
      if (!g) return;
      const sel = divGastosSelector.querySelector(`.pr-gasto-incluido[data-id="${chk.dataset.id}"]`);
      seleccionados.push({ label: g.label, incluido: sel ? sel.value === 'si' : false });
    });
    divGastosCustom.querySelectorAll('.pr-gasto-custom-row').forEach(row => {
      const label = row.querySelector('.pr-gasto-custom-label').value.trim();
      if (!label) return;
      const incluido = row.querySelector('.pr-gasto-custom-incluido').value === 'si';
      seleccionados.push({ label, incluido });
    });
    return seleccionados;
  }

  function limpiarGastos() {
    divGastosSelector.querySelectorAll('.pr-gasto-check').forEach(chk => { chk.checked = false; });
    divGastosSelector.querySelectorAll('.pr-gasto-incluido').forEach(sel => { sel.style.display = 'none'; sel.value = 'no'; });
    divGastosCustom.innerHTML = '';
    gastoCustomSeq = 0;
  }

  // Texto institucional fijo — no depende de la rama. Editable antes de generar.
  taInstitucional.value = 'MVC Abogados cuenta con más de 25 años de trayectoria en el ejercicio profesional, sustentada en un proceso de capacitación permanente del equipo y en el desarrollo de herramientas propias de LegalTech —como Mi Expediente—, que le permiten al cliente acceder a información actualizada y en tiempo real sobre el estado de su causa.';

  chkEnfoque.addEventListener('change', () => { wrapEnfoque.style.display = chkEnfoque.checked ? '' : 'none'; });
  chkCostoInaccion.addEventListener('change', () => { wrapCostoInaccion.style.display = chkCostoInaccion.checked ? '' : 'none'; });
  chkInstitucional.addEventListener('change', () => { wrapInstitucional.style.display = chkInstitucional.checked ? '' : 'none'; });
  chkEquipo.addEventListener('change', () => { wrapEquipo.style.display = chkEquipo.checked ? '' : 'none'; });
  chkRoi.addEventListener('change', actualizarNotaRoi);

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
    actualizarEnfoque();
    actualizarCostoInaccion();
    renderFilasHonorarios();
    renderGastosSelector();
  }

  function actualizarAlcance() {
    if (alcanceTocadoManualmente) return;
    const ramaKey = selRama.value;
    const rama = RAMAS[ramaKey];
    const subtipoKey = rama.subtipos ? selSubtipo.value : null;
    taAlcance.value = rama.alcance(subtipoKey);
  }

  function actualizarEnfoque() {
    if (enfoqueTocadoManualmente) return;
    const ramaKey = selRama.value;
    const rama = RAMAS[ramaKey];
    const subtipoKey = rama.subtipos ? selSubtipo.value : null;
    taEnfoque.value = rama.enfoque ? rama.enfoque(subtipoKey) : '';
  }

  // El costo de inacción admite una proyección numérica de intereses solo en las ramas
  // donde la demora efectivamente devenga intereses sobre un monto de condena/reclamo
  // (laboral y daños). En sucesiones el costo es cualitativo (bloqueo patrimonial).
  function actualizarCostoInaccion() {
    if (costoInaccionTocadoManualmente) return;
    const ramaKey = selRama.value;
    const rama = RAMAS[ramaKey];
    const subtipoKey = rama.subtipos ? selSubtipo.value : null;
    taCostoInaccion.value = rama.costoInaccion ? rama.costoInaccion(subtipoKey) : '';
    wrapCiNumerico.style.display = (ramaKey === 'laboral_demandada' || ramaKey === 'danios') ? '' : 'none';
  }

  function actualizarNotaRoi() {
    if (!chkRoi.checked) { divRoiNota.style.display = 'none'; return; }
    const baseMontoNum = parseFloat(inpBaseMonto.value) || 0;
    if (baseMontoNum <= 0) {
      divRoiNota.style.display = '';
      divRoiNota.textContent = 'Para calcular esta relación, cargá un Monto base en Honorarios (cálculo automático).';
    } else {
      divRoiNota.style.display = 'none';
    }
  }

  selRama.addEventListener('change', () => {
    alcanceTocadoManualmente = false;
    enfoqueTocadoManualmente = false;
    costoInaccionTocadoManualmente = false;
    actualizarRama();
  });
  selSubtipo.addEventListener('change', () => {
    alcanceTocadoManualmente = false;
    enfoqueTocadoManualmente = false;
    costoInaccionTocadoManualmente = false;
    actualizarAlcance();
    actualizarEnfoque();
    actualizarCostoInaccion();
    renderFilasHonorarios();
  });

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
  inpBaseMonto.addEventListener('input', () => { recalcHonorarios(); actualizarNotaRoi(); });
  inpJusValor.addEventListener('input', recalcHonorarios);

  actualizarRama();
  actualizarVisibilidadBase();
  actualizarNotaRoi();

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
    const gastosSeleccionados = leerGastosSeleccionados();
    const validez          = container.querySelector('#pr-validez').value || '30';
    const observaciones    = container.querySelector('#pr-observaciones').value.trim();
    const fechaHoy          = new Date().toLocaleDateString('es-AR');
    const h = ultimoResultadoHonorarios;

    const tituloTramite = subtipoLabel ? `${rama.label} — ${subtipoLabel}` : rama.label;

    // — Valor agregado (opcional): enfoque problema→solución, ROI del honorario,
    //   costo de la inacción e institucional. Cada bloque se omite si su checkbox
    //   no está tildado, y todo el texto queda editable antes de generar.
    const enfoqueTexto = chkEnfoque.checked ? taEnfoque.value.trim() : '';

    const baseMontoNum = parseFloat(inpBaseMonto.value) || 0;
    const roiPct = (chkRoi.checked && baseMontoNum > 0 && h.totalGeneral > 0)
      ? (h.totalGeneral / baseMontoNum * 100) : null;
    const roiLinea = roiPct != null
      ? `El honorario total representa aproximadamente el ${roiPct.toFixed(1)}% del monto en juego (${fmtMoney(baseMontoNum)}).`
      : '';

    const costoInaccionTexto = chkCostoInaccion.checked ? taCostoInaccion.value.trim() : '';
    const admiteNumericoCI = ramaKey === 'laboral_demandada' || ramaKey === 'danios';
    const ciMeses = parseFloat(inpCiMeses.value) || 0;
    const ciTasa  = parseFloat(inpCiTasa.value) || 0;
    const ciProyeccion = (chkCostoInaccion.checked && admiteNumericoCI && baseMontoNum > 0 && ciMeses > 0 && ciTasa > 0)
      ? baseMontoNum * (ciTasa / 100) * ciMeses : null;
    const ciProyeccionLinea = ciProyeccion != null
      ? `Solo en concepto de intereses, una demora estimada de ${ciMeses} mes(es) representaría un costo adicional aproximado de ${fmtMoney(ciProyeccion)} (estimación ilustrativa a tasa simple sobre el monto base; no vinculante — verificar la tasa vigente aplicable).`
      : '';

    const institucionalTexto = chkInstitucional.checked ? taInstitucional.value.trim() : '';

    const equipoSeleccionado = chkEquipo.checked
      ? Array.from(container.querySelectorAll('.pr-equipo-check:checked')).map(el => EQUIPO[el.dataset.id])
      : [];
    const equipoLineas = equipoSeleccionado.map(p => `• ${p.nombre} — ${p.bio}`);

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
      enfoqueTexto ? 'SU OBJETIVO' : null,
      enfoqueTexto ? enfoqueTexto : null,
      enfoqueTexto ? '' : null,
      'ALCANCE DEL SERVICIO',
      alcance,
      '',
      'HONORARIOS' + (h.modalidad === 'etapas' ? ' — POR ETAPAS' : ''),
      ...lineasHonorarios,
      `TOTAL GENERAL: ${fmtMoney(h.totalGeneral)}${h.jusTotal != null ? ` (≈ ${fmtJus(h.jusTotal)} — valor Jus: ${fmtMoney(h.jusValor)})` : ''}`,
      roiLinea ? roiLinea : null,
      notaTotal ? notaTotal : null,
      honorAclaraciones ? `Aclaraciones sobre los honorarios: ${honorAclaraciones}` : null,
      `Forma de pago: ${formaPago}`,
      gastosSeleccionados.length ? '' : null,
      gastosSeleccionados.length ? 'GASTOS Y ARANCELES ESTIMADOS' : null,
      ...gastosSeleccionados.map(g => `• ${g.label}: ${g.incluido ? 'Incluido en el presupuesto' : 'No incluido en el presupuesto'}`),
      costoInaccionTexto ? '' : null,
      costoInaccionTexto ? 'COSTO DE LA INACCIÓN' : null,
      costoInaccionTexto ? costoInaccionTexto : null,
      ciProyeccionLinea ? ciProyeccionLinea : null,
      institucionalTexto ? '' : null,
      institucionalTexto ? 'POR QUÉ MVC ABOGADOS' : null,
      institucionalTexto ? institucionalTexto : null,
      equipoLineas.length ? '' : null,
      equipoLineas.length ? 'PROFESIONALES INTERVINIENTES' : null,
      ...equipoLineas,
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
    textarea.dataset.gastosSeleccionados = JSON.stringify(gastosSeleccionados);
    textarea.dataset.validez = validez;
    textarea.dataset.observaciones = observaciones;
    textarea.dataset.enfoqueTexto = enfoqueTexto;
    textarea.dataset.roiLinea = roiLinea;
    textarea.dataset.costoInaccionTexto = costoInaccionTexto;
    textarea.dataset.ciProyeccionLinea = ciProyeccionLinea;
    textarea.dataset.institucionalTexto = institucionalTexto;
    textarea.dataset.equipoLineas = JSON.stringify(equipoLineas);
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
    limpiarGastos();
    container.querySelector('#pr-validez').value = '30';
    container.querySelector('#pr-observaciones').value = '';
    alcanceTocadoManualmente = false;
    enfoqueTocadoManualmente = false;
    costoInaccionTocadoManualmente = false;
    chkEnfoque.checked = false;
    wrapEnfoque.style.display = 'none';
    chkRoi.checked = false;
    divRoiNota.style.display = 'none';
    chkCostoInaccion.checked = false;
    wrapCostoInaccion.style.display = 'none';
    inpCiMeses.value = '';
    inpCiTasa.value = '';
    chkInstitucional.checked = false;
    wrapInstitucional.style.display = 'none';
    chkEquipo.checked = false;
    wrapEquipo.style.display = 'none';
    container.querySelectorAll('.pr-equipo-check').forEach(el => { el.checked = false; });
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

  initGuardarMiExpediente(container.querySelector('#pr-guardar-me'), {
    herramienta: 'presupuestos',
    categoria: 'Presupuestos',
    textarea,
    obtenerMeta: () => ({
      titulo: textarea.dataset.titulo,
      cliente: textarea.dataset.cliente,
      rama: selRama.value,
      subtipo: RAMAS[selRama.value].subtipos ? selSubtipo.value : null,
    }),
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

      ${textarea.dataset.enfoqueTexto ? `<div class="info-box"><strong>Su objetivo:</strong><br>${esc(textarea.dataset.enfoqueTexto).replace(/\n/g, '<br>')}</div>` : ''}

      <div class="info-box"><strong>Alcance del servicio:</strong><br>${esc(taAlcance.value).replace(/\n/g, '<br>')}</div>

      <table>
        <thead><tr><th>${h.modalidad === 'etapas' ? 'Etapa' : 'Concepto'}</th><th style="text-align:right">Fijo</th><th style="text-align:right">Variable</th><th style="text-align:right">Total línea</th><th style="text-align:right">≈ Jus</th></tr></thead>
        <tbody>
          ${filasHtml}
          <tr class="total-row"><td>TOTAL GENERAL</td><td></td><td></td><td class="monto">${fmtMoney(h.totalGeneral)}</td><td class="monto">${h.jusTotal != null ? fmtJus(h.jusTotal) : '—'}</td></tr>
        </tbody>
      </table>
      ${textarea.dataset.roiLinea ? `<p class="nota"><strong>${esc(textarea.dataset.roiLinea)}</strong></p>` : ''}
      <p class="nota">Base de referencia del variable: ${esc(h.baseDesc || '—')}${h.baseMonto ? ` — Monto base utilizado: ${fmtMoney(h.baseMonto)}` : ''}. Valor del Jus considerado: ${fmtMoney(h.jusValor || 0)} (verificar vigencia).</p>
      ${notaTotalGeneral(h) ? `<p class="nota"><strong>${esc(notaTotalGeneral(h))}</strong></p>` : ''}
      ${textarea.dataset.honorAclaraciones ? `<div class="info-box"><strong>Aclaraciones sobre los honorarios:</strong><br>${esc(textarea.dataset.honorAclaraciones).replace(/\n/g, '<br>')}</div>` : ''}

      <table>
        <tbody>
          <tr><td>Forma de pago</td><td>${esc(textarea.dataset.formaPago)}</td></tr>
          <tr><td>Validez del presupuesto</td><td>${esc(textarea.dataset.validez)} días corridos desde la fecha de emisión</td></tr>
        </tbody>
      </table>

      ${(() => {
        const gastosSeleccionados = JSON.parse(textarea.dataset.gastosSeleccionados || '[]');
        return gastosSeleccionados.length
          ? `<table>
               <thead><tr><th colspan="2">Gastos y aranceles estimados</th></tr></thead>
               <tbody>
                 ${gastosSeleccionados.map(g => `<tr><td>${esc(g.label)}</td><td>${g.incluido ? 'Incluido en el presupuesto' : 'No incluido en el presupuesto'}</td></tr>`).join('')}
               </tbody>
             </table>`
          : '';
      })()}

      ${textarea.dataset.costoInaccionTexto ? `<div class="info-box"><strong>Costo de la inacción:</strong><br>${esc(textarea.dataset.costoInaccionTexto).replace(/\n/g, '<br>')}${textarea.dataset.ciProyeccionLinea ? `<br><br>${esc(textarea.dataset.ciProyeccionLinea)}` : ''}</div>` : ''}

      ${textarea.dataset.institucionalTexto ? `<div class="info-box"><strong>Por qué MVC Abogados:</strong><br>${esc(textarea.dataset.institucionalTexto).replace(/\n/g, '<br>')}</div>` : ''}

      ${(() => {
        const equipoLineas = JSON.parse(textarea.dataset.equipoLineas || '[]');
        return equipoLineas.length
          ? `<div class="info-box"><strong>Profesionales intervinientes:</strong><br>${equipoLineas.map(esc).join('<br>')}</div>`
          : '';
      })()}

      ${textarea.dataset.observaciones ? `<div class="info-box"><strong>Observaciones:</strong><br>${esc(textarea.dataset.observaciones).replace(/\n/g, '<br>')}</div>` : ''}
    `;
    exportarPDF(`Presupuesto — ${textarea.dataset.titulo}`, html, { footer: '' });
  });

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── Prefill desde Diagnóstico Integral PYME ─────────────────────────────
  (function detectarPrefill() {
    let payload;
    try { payload = JSON.parse(localStorage.getItem('mvc_prefill_presupuesto_pyme') || 'null'); } catch { payload = null; }
    if (!payload || !payload.campos) return;
    const banner = document.createElement('div');
    banner.style.cssText = 'background:#e8f4ea;border:1px solid #7ab88a;border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:.9rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px';
    banner.innerHTML = `<span>📋 Hay datos de un Diagnóstico Integral PYME cargados el ${payload.fecha || ''} — ¿los cargamos en este presupuesto?</span>
      <span style="display:flex;gap:8px">
        <button class="btn btn-primary" id="pr-prefill-cargar" type="button">Cargar</button>
        <button class="btn btn-ghost" id="pr-prefill-descartar" type="button">Descartar</button>
      </span>`;
    container.querySelector('.tool-card').insertBefore(banner, container.querySelector('.tool-card').children[1]);

    banner.querySelector('#pr-prefill-cargar').addEventListener('click', () => {
      selRama.value = 'asesoramiento_pyme';
      alcanceTocadoManualmente = false;
      enfoqueTocadoManualmente = false;
      costoInaccionTocadoManualmente = false;
      selModalidad.value = 'unico';
      selCalculo.value = 'manual';
      actualizarRama();
      actualizarVisibilidadBase();

      Object.entries(payload.campos).forEach(([id, valor]) => {
        const el = container.querySelector(`#pr-${id}`);
        if (el && valor) el.value = valor;
      });

      if (payload.alcance) {
        taAlcance.value = payload.alcance;
        alcanceTocadoManualmente = true;
      }

      localStorage.removeItem('mvc_prefill_presupuesto_pyme');
      banner.remove();
    });
    banner.querySelector('#pr-prefill-descartar').addEventListener('click', () => {
      localStorage.removeItem('mvc_prefill_presupuesto_pyme');
      banner.remove();
    });
  })();

  // ── Prefill desde Generador de Escrito de Sucesión ──────────────────────
  (function detectarPrefillSucesion() {
    let payload;
    try { payload = JSON.parse(localStorage.getItem('mvc_prefill_presupuesto_sucesion') || 'null'); } catch { payload = null; }
    if (!payload || !payload.campos) return;
    const banner = document.createElement('div');
    banner.style.cssText = 'background:#e8f4ea;border:1px solid #7ab88a;border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:.9rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px';
    banner.innerHTML = `<span>📋 Hay datos de un Escrito de Sucesión cargados el ${payload.fecha || ''} — ¿los cargamos en este presupuesto?</span>
      <span style="display:flex;gap:8px">
        <button class="btn btn-primary" id="pr-prefill-sucesion-cargar" type="button">Cargar</button>
        <button class="btn btn-ghost" id="pr-prefill-sucesion-descartar" type="button">Descartar</button>
      </span>`;
    container.querySelector('.tool-card').insertBefore(banner, container.querySelector('.tool-card').children[1]);

    banner.querySelector('#pr-prefill-sucesion-cargar').addEventListener('click', () => {
      selRama.value = 'sucesiones';
      alcanceTocadoManualmente = false;
      enfoqueTocadoManualmente = false;
      costoInaccionTocadoManualmente = false;
      selModalidad.value = 'unico';
      selCalculo.value = 'manual';
      actualizarRama();
      actualizarVisibilidadBase();

      if (payload.subtipo && RAMAS.sucesiones.subtipos[payload.subtipo]) {
        selSubtipo.value = payload.subtipo;
        alcanceTocadoManualmente = false;
        enfoqueTocadoManualmente = false;
        costoInaccionTocadoManualmente = false;
        actualizarAlcance();
        actualizarEnfoque();
        actualizarCostoInaccion();
        renderFilasHonorarios();
      }

      Object.entries(payload.campos).forEach(([id, valor]) => {
        const el = container.querySelector(`#pr-${id}`);
        if (el && valor) el.value = valor;
      });

      if (payload.conflictoHerederos !== undefined) {
        const chk = container.querySelector('#pr-conflicto_herederos');
        if (chk) chk.checked = !!payload.conflictoHerederos;
      }

      localStorage.removeItem('mvc_prefill_presupuesto_sucesion');
      banner.remove();
    });
    banner.querySelector('#pr-prefill-sucesion-descartar').addEventListener('click', () => {
      localStorage.removeItem('mvc_prefill_presupuesto_sucesion');
      banner.remove();
    });
  })();

  // ── Prefill desde Generador de Escrito de Divorcio ──────────────────────
  (function detectarPrefillDivorcio() {
    let payload;
    try { payload = JSON.parse(localStorage.getItem('mvc_prefill_presupuesto_divorcio') || 'null'); } catch { payload = null; }
    if (!payload || !payload.campos) return;
    const banner = document.createElement('div');
    banner.style.cssText = 'background:#e8f4ea;border:1px solid #7ab88a;border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:.9rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px';
    banner.innerHTML = `<span>📋 Hay datos de un Escrito de Divorcio cargados el ${payload.fecha || ''} — ¿los cargamos en este presupuesto?</span>
      <span style="display:flex;gap:8px">
        <button class="btn btn-primary" id="pr-prefill-divorcio-cargar" type="button">Cargar</button>
        <button class="btn btn-ghost" id="pr-prefill-divorcio-descartar" type="button">Descartar</button>
      </span>`;
    container.querySelector('.tool-card').insertBefore(banner, container.querySelector('.tool-card').children[1]);

    banner.querySelector('#pr-prefill-divorcio-cargar').addEventListener('click', () => {
      selRama.value = 'divorcio';
      alcanceTocadoManualmente = false;
      enfoqueTocadoManualmente = false;
      costoInaccionTocadoManualmente = false;
      selModalidad.value = 'unico';
      selCalculo.value = 'manual';
      actualizarRama();
      actualizarVisibilidadBase();

      if (payload.subtipo && RAMAS.divorcio.subtipos[payload.subtipo]) {
        selSubtipo.value = payload.subtipo;
        alcanceTocadoManualmente = false;
        enfoqueTocadoManualmente = false;
        costoInaccionTocadoManualmente = false;
        actualizarAlcance();
        actualizarEnfoque();
        actualizarCostoInaccion();
        renderFilasHonorarios();
      }

      Object.entries(payload.campos).forEach(([id, valor]) => {
        const el = container.querySelector(`#pr-${id}`);
        if (el && valor) el.value = valor;
      });

      if (payload.conflictoIntereses !== undefined) {
        const chk = container.querySelector('#pr-conflicto_intereses_divorcio');
        if (chk) chk.checked = !!payload.conflictoIntereses;
      }

      localStorage.removeItem('mvc_prefill_presupuesto_divorcio');
      banner.remove();
    });
    banner.querySelector('#pr-prefill-divorcio-descartar').addEventListener('click', () => {
      localStorage.removeItem('mvc_prefill_presupuesto_divorcio');
      banner.remove();
    });
  })();
}
