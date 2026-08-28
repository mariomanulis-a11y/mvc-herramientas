// Generador de Demanda por Consumidor — Provincia de Buenos Aires
// Trámite sumarísimo (art. 53, Ley 24.240) — competencia dejada como campo libre,
// dado que los arts. 23 (2° párr.) y 30 de la Ley 13.133 (que fijaban trámite y
// competencia específicos) se encuentran vetados por decreto de promulgación parcial.
// Beneficio de justicia gratuita: art. 25, Ley 13.133 (vigente, sin observaciones).
// Materias: Consumidor General, Consumidor Bancario/Financiero y Consumidor de
// Seguros (en esta última, la Ley 17.418 rige como ley especial; la LDC y su
// daño punitivo del art. 52 bis se invocan solo subsidiariamente).
import { exportarPDF, exportarWord } from './exportar.js';

export function initDemandaConsumidor(container) {

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

  const CARACTER_LETRADO = [
    { value: 'patrocinante', label: 'Letrado/a patrocinante' },
    { value: 'apoderado',    label: 'Apoderado/a' },
  ];

  // ── Materias y tipos de demanda ────────────────────────────────────────
  const MATERIAS = {
    consumidor_general: {
      label: 'Consumidor General',
      encuadre: 'en el marco de una relación de consumo en los términos de los arts. 1, 2 y 3 de la Ley 24.240',
      tipos: {
        incumplimiento_contractual: {
          label: 'Incumplimiento contractual (art. 10 bis LDC)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','producto_servicio','incumplimiento'],
          opcionales: ['fecha_operacion'],
          hechos: d => `Que con fecha ${d.fecha_operacion || '[FECHA]'} la parte actora adquirió/contrató ${d.producto_servicio} de la demandada. Que la demandada incurrió en incumplimiento de sus obligaciones, consistente en ${d.incumplimiento}, pese a los reclamos efectuados extrajudicialmente, sin obtener respuesta satisfactoria.`,
          derecho: () => `Fundo el presente en los arts. 10 bis de la Ley 24.240, en cuanto consagra el derecho del consumidor a exigir el cumplimiento forzado de la prestación, y en el art. 42 de la Constitución Nacional.`,
        },
        rescision_restitucion: {
          label: 'Rescisión contractual con restitución de sumas (art. 10 bis inc. c LDC)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','producto_servicio','monto_reclamado'],
          opcionales: ['incumplimiento'],
          hechos: d => `Que la parte actora contrató ${d.producto_servicio} con la demandada, contrato que rescindió/resolvió en virtud de ${d.incumplimiento || 'el incumplimiento de la demandada'}, sin que ésta haya restituido las sumas abonadas, ascendentes a $ ${d.monto_reclamado}.`,
          derecho: () => `Fundo el presente en el art. 10 bis, inc. c), de la Ley 24.240, que faculta al consumidor a resolver el contrato con derecho a la restitución de lo pagado, sin perjuicio de los daños y perjuicios que correspondan.`,
        },
        garantia_legal: {
          label: 'Garantía legal no honrada (arts. 11 a 18 LDC)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','producto_servicio','fecha_operacion'],
          opcionales: ['incumplimiento'],
          hechos: d => `Que la parte actora adquirió el producto/servicio ${d.producto_servicio} con fecha ${d.fecha_operacion}, el cual presentó los siguientes defectos: ${d.incumplimiento || '[DESCRIBIR DEFECTOS]'}. Que pese a los reclamos efectuados, la demandada no hizo efectiva la garantía legal correspondiente.`,
          derecho: () => `Fundo el presente en los arts. 11 a 18 de la Ley 24.240 (garantía legal), que imponen al proveedor la obligación de reparar, sustituir o restituir las sumas abonadas ante los defectos de la cosa o servicio.`,
        },
        trato_indigno: {
          label: 'Trato indigno / práctica abusiva (art. 8 bis LDC)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','incumplimiento'],
          opcionales: [],
          hechos: d => `Que en su trato hacia la parte actora, en su carácter de consumidor/a, la demandada incurrió en ${d.incumplimiento}, lo que constituye una infracción al deber de trato digno y equitativo.`,
          derecho: () => `Fundo el presente en el art. 8 bis de la Ley 24.240, que impone a los proveedores el deber de garantizar condiciones de atención y trato digno y equitativo a los consumidores, y en el art. 42 de la Constitución Nacional.`,
        },
        publicidad_enganosa: {
          label: 'Publicidad engañosa (arts. 8 y 9 LDC; arts. 9 y 10 Ley 22.802)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','producto_servicio','incumplimiento'],
          opcionales: ['fecha_operacion'],
          hechos: d => `Que la demandada difundió publicidad respecto de ${d.producto_servicio} consistente en ${d.incumplimiento}, la cual indujo a la parte actora a contratar${d.fecha_operacion ? ` con fecha ${d.fecha_operacion}` : ''}, resultando dicha publicidad falsa, engañosa o con omisión de datos esenciales.`,
          derecho: () => `Fundo el presente en los arts. 8 y 9 de la Ley 24.240, y en los arts. 9 y 10 de la Ley 22.802 de Lealtad Comercial, en cuanto prohíben la publicidad que induzca a error, engaño o confusión, siendo dicha publicidad vinculante para el proveedor.`,
        },
      },
    },

    consumidor_bancario: {
      label: 'Consumidor Bancario / Financiero',
      encuadre: 'en el marco de una relación de consumo financiera en los términos de los arts. 1, 2 y 3 de la Ley 24.240',
      tipos: {
        phishing_estandar: {
          label: 'Responsabilidad del Banco ante estafa virtual / phishing (arts. 5, 6, 40 LDC; art. 1757 CCCN)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','monto_reclamado'],
          opcionales: ['fecha_hecho'],
          hechos: d => `Que con fecha ${d.fecha_hecho || '[FECHA]'} la parte actora fue víctima de una maniobra de phishing/ingeniería social por parte de terceros ajenos a su voluntad, quienes lograron efectuar transferencias y/o operaciones no autorizadas por la suma de $ ${d.monto_reclamado}, aprovechando vulnerabilidades del sistema de banca electrónica puesto a disposición por la demandada.`,
          derecho: () => `Fundo el presente en los arts. 5, 6 y 40 de la Ley 24.240 (deber objetivo de seguridad) y en el art. 1757 del Código Civil y Comercial de la Nación (actividad riesgosa), por cuanto la demandada, en su condición de proveedora y organizadora del sistema de banca electrónica, responde objetivamente por las fallas de seguridad del servicio prestado.`,
        },
        phishing_hipervulnerable: {
          label: 'Responsabilidad agravada del Banco — consumidor hipervulnerable (art. 1725 CCCN; Res. 139/2020)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','monto_reclamado'],
          opcionales: ['fecha_hecho'],
          hechos: d => `Que la parte actora reviste la condición de consumidor hipervulnerable (Resolución 139/2020, Secretaría de Comercio Interior), y que con fecha ${d.fecha_hecho || '[FECHA]'} fue víctima de una maniobra de phishing/ingeniería social que derivó en operaciones y/o créditos no autorizados por la suma de $ ${d.monto_reclamado}, sin que la demandada detectara la operatoria atípica ni extremara los recaudos de seguridad exigibles en atención a dicha condición.`,
          derecho: () => `Fundo el presente en el art. 1725 del Código Civil y Comercial de la Nación (estándar agravado de responsabilidad profesional) y en los arts. 5, 6 y 40 de la Ley 24.240, sin que la eventual entrega de claves o datos de acceso mediante engaño resulte apta para interrumpir el nexo causal, por ser ello inherente a la modalidad delictiva empleada.`,
        },
        repeticion_comisiones: {
          label: 'Repetición de comisiones/cargos no autorizados (art. 40 LDC; art. 1796 CCCN)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','concepto_comision','monto_reclamado'],
          opcionales: ['numero_cuenta_producto'],
          hechos: d => `Que la demandada debitó de la cuenta/producto${d.numero_cuenta_producto ? ` N° ${d.numero_cuenta_producto}` : ''} de la parte actora la suma de $ ${d.monto_reclamado} en concepto de ${d.concepto_comision}, cargo no pactado ni autorizado, pese a los reclamos efectuados extrajudicialmente.`,
          derecho: () => `Fundo el presente en el art. 40 de la Ley 24.240 y en el art. 1796, inc. a), del Código Civil y Comercial de la Nación, por tratarse de un pago sin causa que genera el derecho a su repetición.`,
        },
        danos_cierre_cuenta: {
          label: 'Daños por cierre de cuenta / inclusión indebida en Central de Deudores (art. 8 bis LDC; Ley 25.326)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario'],
          opcionales: ['numero_cuenta_producto','categoria_central_deudores','monto_reclamado'],
          hechos: d => `Que la demandada procedió al cierre/baja unilateral de la cuenta/producto${d.numero_cuenta_producto ? ` N° ${d.numero_cuenta_producto}` : ''} de la parte actora sin informar causa objetiva y razonable${d.categoria_central_deudores ? `, e informó a la Central de Deudores del BCRA la categoría/calificación "${d.categoria_central_deudores}", dato que resulta inexacto` : ''}, causándole los daños que se reclaman.`,
          derecho: d => `Fundo el presente en el art. 8 bis de la Ley 24.240 (trato digno)${d.categoria_central_deudores ? ', y en el art. 16 de la Ley 25.326 de Protección de Datos Personales' : ''}.`,
        },
        impugnacion_credito_preaprobado: {
          label: 'Impugnación de crédito preaprobado sin verificación de identidad (Com. "A" 7319 BCRA)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','monto_reclamado'],
          opcionales: ['fecha_hecho'],
          hechos: d => `Que la demandada acreditó en la cuenta de la parte actora un préstamo/crédito preaprobado por la suma de $ ${d.monto_reclamado}${d.fecha_hecho ? `, con fecha ${d.fecha_hecho}` : ''}, sin cumplir con la verificación fehaciente de identidad mediante técnicas de identificación positiva ni con la comunicación previa con ventana de cuarenta y ocho (48) horas hábiles exigidas por la normativa del Banco Central de la República Argentina.`,
          derecho: () => `Fundo el presente en la Comunicación "A" 7319 del BCRA y en los arts. 5, 6 y 40 de la Ley 24.240, solicitando la nulidad de la operación cuestionada.`,
        },
        impugnacion_tarjeta: {
          label: 'Impugnación de consumos no reconocidos en tarjeta de crédito (arts. 26 a 29 Ley 25.065)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','monto_reclamado'],
          opcionales: ['fecha_resumen','concepto_comision'],
          hechos: d => `Que la parte actora impugnó fundadamente ante la demandada el consumo${d.concepto_comision ? ` correspondiente a ${d.concepto_comision}` : ''} por la suma de $ ${d.monto_reclamado}, incluido en el resumen${d.fecha_resumen ? ` de fecha ${d.fecha_resumen}` : ''}, por no reconocer su origen, sin que la demandada haya dado cumplimiento al procedimiento legal de impugnación ni cesado en su cobro.`,
          derecho: () => `Fundo el presente en los arts. 26 a 29 de la Ley 25.065 de Tarjetas de Crédito.`,
        },
      },
    },

    consumidor_seguros: {
      label: 'Consumidor de Seguros',
      encuadre: 'en el marco de un contrato de seguro regido por la Ley 17.418, resultando aplicables subsidiariamente los principios de la Ley 24.240 en cuanto no se opongan a dicha ley especial',
      tipos: {
        seguro_silencio_aceptacion: {
          label: 'Cobro por silencio del asegurador — aceptación tácita (art. 56 Ley 17.418)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','numero_poliza','fecha_siniestro'],
          opcionales: ['numero_siniestro','monto_reclamado'],
          hechos: d => `Que la parte actora, en su carácter de asegurado/a de la póliza N° ${d.numero_poliza}, denunció en tiempo y forma el siniestro ocurrido el ${d.fecha_siniestro}${d.numero_siniestro ? ` (siniestro N° ${d.numero_siniestro})` : ''}, habiendo transcurrido en exceso el plazo de treinta (30) días previsto en el art. 56 de la Ley 17.418 sin que la demandada se pronunciara sobre su derecho, por lo que dicho silencio importa la aceptación del siniestro.`,
          derecho: () => `Fundo el presente, principalmente, en el art. 56 de la Ley 17.418 de Seguros.`,
        },
        seguro_mora_pago: {
          label: 'Cobro por mora en el pago ya reconocido (art. 49 Ley 17.418)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','numero_poliza','monto_reclamado'],
          opcionales: ['numero_siniestro'],
          hechos: d => `Que fijado el monto de la indemnización correspondiente a la póliza N° ${d.numero_poliza}${d.numero_siniestro ? `, siniestro N° ${d.numero_siniestro}` : ''}, en la suma de $ ${d.monto_reclamado}, ha transcurrido en exceso el plazo de quince (15) días previsto en el art. 49 de la Ley 17.418 sin que la demandada haya efectuado el pago correspondiente.`,
          derecho: () => `Fundo el presente, principalmente, en el art. 49 de la Ley 17.418 de Seguros.`,
        },
        seguro_impugnacion_rechazo: {
          label: 'Impugnación judicial del rechazo de cobertura (art. 56 Ley 17.418)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','numero_poliza','incumplimiento'],
          opcionales: ['numero_siniestro','monto_reclamado'],
          hechos: d => `Que la demandada rechazó la cobertura del siniestro correspondiente a la póliza N° ${d.numero_poliza}${d.numero_siniestro ? `, siniestro N° ${d.numero_siniestro}` : ''}, invocando ${d.incumplimiento}, rechazo que se impugna por resultar infundado y/o extemporáneo, correspondiendo una interpretación restrictiva de las cláusulas limitativas de cobertura.`,
          derecho: () => `Fundo el presente, principalmente, en el art. 56 de la Ley 17.418 de Seguros.`,
        },
        seguro_caducidad_convencional: {
          label: 'Impugnación de caducidad convencional (art. 36 Ley 17.418)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','numero_poliza','incumplimiento'],
          opcionales: ['numero_siniestro'],
          hechos: d => `Que la demandada declaró la caducidad convencional de los derechos de la parte actora respecto de la póliza N° ${d.numero_poliza}${d.numero_siniestro ? `, siniestro N° ${d.numero_siniestro}` : ''}, en virtud de ${d.incumplimiento}, caducidad que se impugna por resultar desproporcionada y contraria al principio de buena fe que rige el contrato de seguro.`,
          derecho: () => `Fundo el presente en el art. 36 de la Ley 17.418 de Seguros.`,
        },
        seguro_beneficiarios_vida: {
          label: 'Cobro a beneficiarios — seguro de vida / accidentes personales (arts. 49 y 56 Ley 17.418)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','numero_poliza'],
          opcionales: ['caracter_reclamante','monto_reclamado','fecha_siniestro'],
          hechos: d => `Que la parte actora, en su carácter de ${d.caracter_reclamante || 'beneficiario/a'} de la póliza de seguro de vida/accidentes personales N° ${d.numero_poliza}${d.fecha_siniestro ? `, en virtud del siniestro ocurrido el ${d.fecha_siniestro}` : ''}, reclama el pago${d.monto_reclamado ? ` de la suma de $ ${d.monto_reclamado}` : ' de la indemnización correspondiente'}, sin que la demandada haya dado cumplimiento a su obligación.`,
          derecho: () => `Fundo el presente en los arts. 49 y 56 de la Ley 17.418 de Seguros.`,
        },
        seguro_pluralidad_seguros: {
          label: 'Diferencia de liquidación en pluralidad de seguros (art. 68 Ley 17.418)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','numero_poliza','monto_reclamado'],
          opcionales: ['numero_siniestro'],
          hechos: d => `Que la liquidación practicada por la demandada respecto de la póliza N° ${d.numero_poliza}${d.numero_siniestro ? `, siniestro N° ${d.numero_siniestro}` : ''} resulta incorrecta, por no haberse respetado la proporción correspondiente en virtud de la pluralidad de seguros vigentes sobre el mismo riesgo, generando una diferencia a favor de la parte actora de $ ${d.monto_reclamado}.`,
          derecho: () => `Fundo el presente en el art. 68 de la Ley 17.418 de Seguros.`,
        },
      },
    },
  };

  // ── Prueba: documental e informativa (comunes a las tres materias) ─────
  const DOCUMENTALES = [
    { id: 'contrato_comprobante', label: 'Contrato, comprobante de compra/contratación, factura o resumen', pideDato: true,
      placeholder: 'Detalle (N° de contrato/comprobante y fecha)' },
    { id: 'telegramas',  label: 'Telegramas / cartas documento cursadas', pideDato: true,
      placeholder: 'Detalle (fechas y N° de telegramas/CD)' },
    { id: 'poliza',      label: 'Póliza de seguro (si corresponde a la materia)', pideDato: true,
      placeholder: 'N° de póliza y compañía aseguradora' },
    { id: 'otro',        label: 'Otro documento', pideDato: true,
      placeholder: 'Detalle del documento' },
  ];

  const INFORMATIVAS = [
    { id: 'arca',    label: 'ARCA / AFIP', pideDato: false },
    { id: 'bcra',    label: 'Banco Central de la República Argentina (BCRA)', pideDato: false },
    { id: 'ssn',     label: 'Superintendencia de Seguros de la Nación (SSN)', pideDato: false },
    { id: 'bancos',  label: 'Entidad/es bancaria/s o financiera/s', pideDato: true,
      placeholder: 'Entidad/es a oficiar' },
  ];

  // ── Campos (pool compartido) ───────────────────────────────────────────
  const CAMPOS_CONFIG = [
    { id: 'nombre',          label: 'Nombre completo (consumidor/a)',    placeholder: 'Juan García',          tipo: 'text',  grupo: 'remitente' },
    { id: 'dni',             label: 'DNI',                               placeholder: '12.345.678',            tipo: 'text',  grupo: 'remitente' },
    { id: 'domicilio',       label: 'Domicilio real',                    placeholder: 'Av. Corrientes 1234, Buenos Aires', tipo: 'text', grupo: 'remitente' },
    { id: 'razon_social',    label: 'Nombre / Razón social (demandada)', placeholder: 'Empresa S.A.',          tipo: 'text',  grupo: 'destinatario' },
    { id: 'cuit',            label: 'CUIT (opcional)',                   placeholder: '30-12345678-9',          tipo: 'text',  grupo: 'destinatario' },
    { id: 'dom_destinatario',label: 'Domicilio (demandada)',             placeholder: 'Calle Falsa 123, CABA',  tipo: 'text',  grupo: 'destinatario' },
    { id: 'fecha_hecho',     label: 'Fecha del hecho relevante',         placeholder: '',                      tipo: 'date',  grupo: 'detalle' },
    { id: 'incumplimiento',  label: 'Descripción del incumplimiento / hecho', placeholder: 'detallar el hecho', tipo: 'textarea', grupo: 'detalle' },
    { id: 'producto_servicio', label: 'Producto o servicio',             placeholder: 'notebook modelo X',       tipo: 'text',  grupo: 'detalle' },
    { id: 'fecha_operacion', label: 'Fecha de compra / contratación',    placeholder: '',                      tipo: 'date',  grupo: 'detalle' },
    { id: 'monto_reclamado', label: 'Monto reclamado (rubro principal)', placeholder: '500000',                 tipo: 'number', grupo: 'detalle' },
    { id: 'concepto_comision', label: 'Concepto de la comisión/cargo cuestionado', placeholder: 'mantenimiento de cuenta', tipo: 'text', grupo: 'detalle' },
    { id: 'numero_cuenta_producto', label: 'Nro. de cuenta / tarjeta / producto (opcional)', placeholder: '0000-1234567-8', tipo: 'text', grupo: 'detalle' },
    { id: 'categoria_central_deudores', label: 'Categoría/calificación informada (opcional)', placeholder: 'Situación 3', tipo: 'text', grupo: 'detalle' },
    { id: 'fecha_resumen',   label: 'Fecha del resumen que incluye el cargo/consumo', placeholder: '',           tipo: 'date',   grupo: 'detalle' },
    { id: 'numero_poliza',   label: 'Número de póliza',                  placeholder: '123.456.789',            tipo: 'text',   grupo: 'detalle' },
    { id: 'numero_siniestro', label: 'Número de siniestro (opcional)',   placeholder: 'SIN-2026-00123',         tipo: 'text',   grupo: 'detalle' },
    { id: 'fecha_siniestro', label: 'Fecha del siniestro',               placeholder: '',                       tipo: 'date',   grupo: 'detalle' },
    { id: 'caracter_reclamante', label: 'Carácter invocado (opcional)',  placeholder: 'beneficiario/a, derechohabiente', tipo: 'text', grupo: 'detalle' },
  ];
  const CAMPOS_BY_ID = Object.fromEntries(CAMPOS_CONFIG.map(c => [c.id, c]));

  let materiaActual = Object.keys(MATERIAS)[0];

  // ── HTML ─────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Generador de Demanda por Consumidor — PBA</h2>
      <p class="tool-desc">Trámite sumarísimo (art. 53, Ley 24.240) — Consumidor General, Bancario/Financiero y de Seguros</p>

      <div style="display:block;background:#fff3cd;border:1px solid #d9a441;border-radius:6px;padding:10px 14px;margin-bottom:16px;font-size:.82rem;line-height:1.6;color:#5a4408">
        ⚠️ Herramienta en versión inicial, pendiente de revisión final por el Estudio antes de su uso en un caso real. La competencia se dejó como campo libre: los arts. 23 (2° párr.) y 30 de la Ley 13.133 —que fijaban trámite y competencia específicos— se encuentran vetados por decreto de promulgación parcial; se funda en el trámite sumarísimo del art. 53 de la Ley 24.240. Verificar Bono Ley 8480 y particularidades del caso antes de presentar.
      </div>

      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="dcons-materia">Materia</label>
          <select id="dcons-materia">
            ${Object.entries(MATERIAS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
          </select>
        </div>
        <div class="field-group" style="flex:2">
          <label for="dcons-tipo">Tipo de demanda</label>
          <select id="dcons-tipo"></select>
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Profesional actuante y trámite</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group">
          <label for="dcons-abogado-select">Abogado/a actuante</label>
          <select id="dcons-abogado-select">${ABOGADOS.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('')}</select>
        </div>
        <div class="field-group">
          <label for="dcons-caracter-letrado">Carácter</label>
          <select id="dcons-caracter-letrado">${CARACTER_LETRADO.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}</select>
        </div>
        <div class="field-group"><label for="dcons-matricula">Matrícula (Tomo/Folio y Colegio)</label><input type="text" id="dcons-matricula"></div>
      </div>
      <p id="dcons-abogado-info" style="font-size:.78rem;color:var(--color-muted);margin:-6px 0 10px"></p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group"><label for="dcons-juzgado">Juzgado / Fuero competente</label><input type="text" id="dcons-juzgado" placeholder="Juzgado de Paz Letrado / Civil y Comercial N° _ del Departamento Judicial de..."></div>
        <div class="field-group"><label for="dcons-domicilio_procesal">Domicilio procesal a constituir (art. 40 CPCC)</label><input type="text" id="dcons-domicilio_procesal"></div>
        <div class="field-group"><label for="dcons-email_notificaciones">Domicilio electrónico (notificaciones SCBA)</label><input type="text" id="dcons-email_notificaciones"></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px" id="dcons-campos-wrapper">
        <div>
          <div class="form-section-title" id="dcons-titulo-remitente" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del actor (consumidor/a)</div>
          <div id="dcons-grupo-remitente"></div>
          <div id="dcons-actores-extra-wrapper" style="display:flex;flex-direction:column;gap:6px;margin-top:6px"></div>
          <button class="btn btn-ghost" id="dcons-add-actor" type="button" style="margin-top:4px">+ Agregar coactor/a</button>
        </div>
        <div>
          <div class="form-section-title" id="dcons-titulo-destinatario" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos de la demandada</div>
          <div id="dcons-grupo-destinatario"></div>
          <div id="dcons-demandados-extra-wrapper" style="display:flex;flex-direction:column;gap:6px;margin-top:6px"></div>
          <button class="btn btn-ghost" id="dcons-add-demandado" type="button" style="margin-top:4px">+ Agregar codemandado/a</button>
        </div>
        <div style="grid-column:1/-1">
          <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del hecho</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px" id="dcons-grupo-detalle"></div>
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Rubros adicionales (daño punitivo transversal a todas las materias)</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <div style="display:flex;align-items:center;gap:10px">
          <input type="checkbox" id="dcons-rubro-dano_moral" style="width:auto">
          <label style="flex:1;font-weight:400;margin:0" for="dcons-monto-dano_moral">Daño moral</label>
          <input type="number" min="0" step="0.01" id="dcons-monto-dano_moral" placeholder="0.00" style="width:160px" disabled>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <input type="checkbox" id="dcons-rubro-dano_punitivo" style="width:auto">
          <label style="flex:1;font-weight:400;margin:0" for="dcons-monto-dano_punitivo">Daño punitivo (art. 52 bis, Ley 24.240 — dejar vacío para diferir a criterio de V.S.)</label>
          <input type="number" min="0" step="0.01" id="dcons-monto-dano_punitivo" placeholder="0.00" style="width:160px" disabled>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <input type="checkbox" id="dcons-rubro-gastos_previos" style="width:auto">
          <label style="flex:1;font-weight:400;margin:0" for="dcons-monto-gastos_previos">Gastos de gestiones/intimaciones previas</label>
          <input type="number" min="0" step="0.01" id="dcons-monto-gastos_previos" placeholder="0.00" style="width:160px" disabled>
        </div>
      </div>
      <div style="text-align:right;margin-top:10px;font-weight:700;color:var(--color-accent)">Total reclamado: $ <span id="dcons-total">0,00</span></div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Prueba ofrecida</div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:8px">
        <p style="font-weight:700;margin:0 0 8px">1. Prueba Documental</p>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${DOCUMENTALES.map(p => `
            <div>
              <label style="display:flex;align-items:center;gap:10px;font-weight:400">
                <input type="checkbox" class="dcons-documental-check" data-documental="${p.id}" style="width:auto"> ${p.label}
              </label>
              ${p.pideDato ? `<input type="text" class="dcons-documental-dato" data-documental-dato="${p.id}" placeholder="${p.placeholder}" style="display:none;margin-top:4px;width:100%" disabled>` : ''}
            </div>`).join('')}
        </div>
      </div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:10px">
        <label style="display:flex;align-items:center;gap:10px;font-weight:700">
          <input type="checkbox" id="dcons-prueba-confesional" style="width:auto" checked> 2. Prueba Confesional
        </label>
        <div id="dcons-wrap-confesional" style="margin-top:8px">
          <div class="form-row" style="justify-content:flex-start">
            <button class="btn btn-ghost" id="dcons-sugerir-pliego" type="button">Sugerir pliego</button>
          </div>
          <textarea id="dcons-confesional_pliego" rows="5" style="width:100%;margin-top:6px" placeholder="a) ...que la parte actora contrató/adquirió ...; b) ...que la demandada incurrió en ...; c) ...que la parte actora efectuó reclamos previos sin obtener respuesta; d) Me reservo el derecho de ampliar."></textarea>
        </div>
      </div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:10px">
        <label style="display:flex;align-items:center;gap:10px;font-weight:700">
          <input type="checkbox" id="dcons-prueba-doc_demandada" style="width:auto"> 3. Documental en poder de la demandada
        </label>
        <div id="dcons-wrap-doc_demandada" style="margin-top:8px;display:none">
          <textarea id="dcons-doc_demandada_detalle" rows="3" style="width:100%" placeholder="Grabaciones de llamadas, legajo del cliente, políticas internas, condiciones generales, registros de reclamos, etc."></textarea>
        </div>
      </div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:10px">
        <label style="display:flex;align-items:center;gap:10px;font-weight:700">
          <input type="checkbox" id="dcons-prueba-testifical" style="width:auto"> 4. Prueba Testifical
        </label>
        <div id="dcons-wrap-testifical" style="margin-top:8px;display:none">
          <div id="dcons-testigos-wrapper" style="display:flex;flex-direction:column;gap:6px"></div>
          <div class="form-row" style="justify-content:flex-start;margin-top:6px">
            <button class="btn btn-ghost" id="dcons-add-testigo" type="button">+ Agregar testigo (máx. 5)</button>
          </div>
        </div>
      </div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:10px">
        <p style="font-weight:700;margin:0 0 8px">5. Prueba Pericial</p>
        <label style="display:flex;align-items:center;gap:10px;font-weight:400">
          <input type="checkbox" id="dcons-prueba-pericial_contable" style="width:auto"> Pericial contable
        </label>
        <div id="dcons-wrap-pericial_contable" style="margin-top:6px;display:none">
          <div class="form-row" style="justify-content:flex-start">
            <button class="btn btn-ghost" id="dcons-sugerir-pericial_contable" type="button">Sugerir puntos de pericia</button>
          </div>
          <textarea id="dcons-pericial_contable_puntos" rows="4" style="width:100%;margin-top:6px"></textarea>
        </div>
        <label style="display:flex;align-items:center;gap:10px;font-weight:400;margin-top:10px">
          <input type="checkbox" id="dcons-prueba-pericial_informatica" style="width:auto"> Pericial informática (fraudes / canales electrónicos)
        </label>
        <div id="dcons-wrap-pericial_informatica" style="margin-top:6px;display:none">
          <div class="form-row" style="justify-content:flex-start">
            <button class="btn btn-ghost" id="dcons-sugerir-pericial_informatica" type="button">Sugerir puntos de pericia</button>
          </div>
          <textarea id="dcons-pericial_informatica_puntos" rows="4" style="width:100%;margin-top:6px"></textarea>
        </div>
      </div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:10px">
        <p style="font-weight:700;margin:0 0 8px">6. Prueba Informativa</p>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${INFORMATIVAS.map(p => `
            <div>
              <label style="display:flex;align-items:center;gap:10px;font-weight:400">
                <input type="checkbox" class="dcons-informativa-check" data-informativa="${p.id}" style="width:auto"> ${p.label}
              </label>
              ${p.pideDato ? `<input type="text" class="dcons-informativa-dato" data-informativa-dato="${p.id}" placeholder="${p.placeholder}" style="display:none;margin-top:4px;width:100%" disabled>` : ''}
            </div>`).join('')}
        </div>
      </div>

      <div class="field-group" style="margin-top:10px"><label for="dcons-prueba_otros">Otros medios de prueba (detallar)</label><textarea id="dcons-prueba_otros" rows="2"></textarea></div>

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:16px">
        <button class="btn btn-primary" id="dcons-generar">Generar demanda</button>
        <button class="btn btn-ghost"   id="dcons-limpiar">Limpiar</button>
      </div>

      <div id="dcons-resultado" style="display:none;margin-top:24px">
        <label for="dcons-texto" style="font-weight:600;display:block;margin-bottom:6px">Texto generado (editable)</label>
        <textarea id="dcons-texto" rows="26" style="width:100%;resize:vertical;font-family:inherit;font-size:.88rem;padding:12px;border:1px solid var(--color-border);border-radius:6px;background:#ffffff;color:#1a1a1a;line-height:1.6"></textarea>
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px">
          <button class="btn btn-success" id="dcons-copiar">📋 Copiar texto</button>
          <button class="btn btn-ghost"   id="dcons-word">📝 Exportar Word (.doc editable)</button>
          <button class="btn btn-ghost"   id="dcons-pdf">📄 Exportar PDF</button>
          <button class="btn btn-ghost"   id="dcons-reset-texto">Restablecer</button>
        </div>
      </div>

      <p style="margin-top:24px;font-size:.78rem;color:var(--color-muted);border-top:1px solid var(--color-border);padding-top:12px">
        Anteproyecto de escrito judicial. Adaptar al caso concreto. No constituye asesoramiento legal.
      </p>
    </div>`;

  function renderCamposGrupo(grupo, ids) {
    return CAMPOS_CONFIG.filter(c => c.grupo === grupo && ids.includes(c.id)).map(c => `
      <div class="field-group" id="dcons-wrap-${c.id}">
        <label for="dcons-${c.id}">${c.label}</label>
        ${c.tipo === 'textarea'
          ? `<textarea id="dcons-${c.id}" placeholder="${c.placeholder}" rows="2"></textarea>`
          : `<input type="${c.tipo}" id="dcons-${c.id}" placeholder="${c.placeholder}"${c.tipo === 'number' ? ' min="0" step="0.01"' : ''}>`
        }
      </div>`).join('');
  }

  // ── Referencias ────────────────────────────────────────────────────────────
  const selMateria  = container.querySelector('#dcons-materia');
  const selTipo     = container.querySelector('#dcons-tipo');
  const selAbogado  = container.querySelector('#dcons-abogado-select');
  const abogadoInfo = container.querySelector('#dcons-abogado-info');
  const inputEmailNotif = container.querySelector('#dcons-email_notificaciones');
  const divRes      = container.querySelector('#dcons-resultado');
  const textarea    = container.querySelector('#dcons-texto');
  const totalSpan   = container.querySelector('#dcons-total');
  let ultimoTextoGenerado = '';

  const wrapActoresExtra = container.querySelector('#dcons-actores-extra-wrapper');
  const wrapDemandadosExtra = container.querySelector('#dcons-demandados-extra-wrapper');
  let actoresExtraCount = 0, demandadosExtraCount = 0;

  function agregarActorExtra() {
    actoresExtraCount++;
    const id = actoresExtraCount;
    const div = document.createElement('div');
    div.className = 'form-row';
    div.id = `dcons-actor-extra-row-${id}`;
    div.innerHTML = `
      <div class="field-group" style="flex:2"><input type="text" id="dcons-actor-extra-nombre-${id}" placeholder="Nombre completo del/de la coactor/a"></div>
      <div class="field-group" style="flex:1"><input type="text" id="dcons-actor-extra-dni-${id}" placeholder="DNI"></div>
      <div class="field-group" style="flex:2"><input type="text" id="dcons-actor-extra-domicilio-${id}" placeholder="Domicilio real"></div>
      <div class="field-group" style="flex:0;align-self:flex-end"><button class="btn btn-ghost" type="button" data-remove-actor="${id}">✕</button></div>`;
    wrapActoresExtra.appendChild(div);
    div.querySelector('[data-remove-actor]').addEventListener('click', () => div.remove());
  }

  function agregarDemandadoExtra() {
    demandadosExtraCount++;
    const id = demandadosExtraCount;
    const div = document.createElement('div');
    div.className = 'form-row';
    div.id = `dcons-demandado-extra-row-${id}`;
    div.innerHTML = `
      <div class="field-group" style="flex:2"><input type="text" id="dcons-demandado-extra-nombre-${id}" placeholder="Razón social / nombre del/de la codemandado/a"></div>
      <div class="field-group" style="flex:2"><input type="text" id="dcons-demandado-extra-domicilio-${id}" placeholder="Domicilio"></div>
      <div class="field-group" style="flex:1"><input type="text" id="dcons-demandado-extra-cuit-${id}" placeholder="CUIT (opcional)"></div>
      <div class="field-group" style="flex:0;align-self:flex-end"><button class="btn btn-ghost" type="button" data-remove-demandado="${id}">✕</button></div>`;
    wrapDemandadosExtra.appendChild(div);
    div.querySelector('[data-remove-demandado]').addEventListener('click', () => div.remove());
  }

  container.querySelector('#dcons-add-actor').addEventListener('click', agregarActorExtra);
  container.querySelector('#dcons-add-demandado').addEventListener('click', agregarDemandadoExtra);

  function leerActoresExtra() {
    return Array.from(wrapActoresExtra.querySelectorAll('[id^="dcons-actor-extra-row-"]')).map(row => {
      const id = row.id.replace('dcons-actor-extra-row-', '');
      return {
        nombre: container.querySelector(`#dcons-actor-extra-nombre-${id}`)?.value.trim() || '',
        dni: container.querySelector(`#dcons-actor-extra-dni-${id}`)?.value.trim() || '',
        domicilio: container.querySelector(`#dcons-actor-extra-domicilio-${id}`)?.value.trim() || '',
      };
    }).filter(a => a.nombre);
  }

  function leerDemandadosExtra() {
    return Array.from(wrapDemandadosExtra.querySelectorAll('[id^="dcons-demandado-extra-row-"]')).map(row => {
      const id = row.id.replace('dcons-demandado-extra-row-', '');
      return {
        nombre: container.querySelector(`#dcons-demandado-extra-nombre-${id}`)?.value.trim() || '',
        domicilio: container.querySelector(`#dcons-demandado-extra-domicilio-${id}`)?.value.trim() || '',
        cuit: container.querySelector(`#dcons-demandado-extra-cuit-${id}`)?.value.trim() || '',
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
  wireBloqueToggle('dcons-prueba-confesional', 'dcons-wrap-confesional');
  wireBloqueToggle('dcons-prueba-doc_demandada', 'dcons-wrap-doc_demandada');
  wireBloqueToggle('dcons-prueba-testifical', 'dcons-wrap-testifical');
  wireBloqueToggle('dcons-prueba-pericial_contable', 'dcons-wrap-pericial_contable');
  wireBloqueToggle('dcons-prueba-pericial_informatica', 'dcons-wrap-pericial_informatica');

  container.querySelectorAll('.dcons-documental-check').forEach(chk => {
    chk.addEventListener('change', () => {
      const input = container.querySelector(`[data-documental-dato="${chk.dataset.documental}"]`);
      if (input) { input.disabled = !chk.checked; input.style.display = chk.checked ? 'block' : 'none'; }
    });
  });
  container.querySelectorAll('.dcons-informativa-check').forEach(chk => {
    chk.addEventListener('change', () => {
      const input = container.querySelector(`[data-informativa-dato="${chk.dataset.informativa}"]`);
      if (input) { input.disabled = !chk.checked; input.style.display = chk.checked ? 'block' : 'none'; }
    });
  });

  // ── Prueba testifical: testigos dinámicos (máx. 5) ──────────────────────
  const wrapTestigos = container.querySelector('#dcons-testigos-wrapper');
  const btnAddTestigo = container.querySelector('#dcons-add-testigo');
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
    div.id = `dcons-testigo-row-${id}`;
    div.innerHTML = `
      <div class="field-group" style="flex:2"><input type="text" id="dcons-testigo-nombre-${id}" placeholder="Nombre y apellido"></div>
      <div class="field-group" style="flex:1"><input type="text" id="dcons-testigo-dni-${id}" placeholder="DNI"></div>
      <div class="field-group" style="flex:3"><input type="text" id="dcons-testigo-domicilio-${id}" placeholder="Domicilio: calle N°, localidad, partido, provincia"></div>
      <div class="field-group" style="flex:0;align-self:flex-end"><button class="btn btn-ghost" type="button" data-remove-testigo="${id}">✕</button></div>`;
    wrapTestigos.appendChild(div);
    div.querySelector('[data-remove-testigo]').addEventListener('click', () => { div.remove(); testigosActivos--; actualizarBotonTestigo(); });
    actualizarBotonTestigo();
  }
  btnAddTestigo.addEventListener('click', agregarTestigo);

  function leerTestigos() {
    return Array.from(wrapTestigos.querySelectorAll('[id^="dcons-testigo-row-"]')).map(row => {
      const id = row.id.replace('dcons-testigo-row-', '');
      return {
        nombre: container.querySelector(`#dcons-testigo-nombre-${id}`)?.value.trim() || '',
        dni: container.querySelector(`#dcons-testigo-dni-${id}`)?.value.trim() || '',
        domicilio: container.querySelector(`#dcons-testigo-domicilio-${id}`)?.value.trim() || '',
      };
    }).filter(t => t.nombre);
  }

  // ── Sugerencias editables: pliego de confesional y puntos de pericia ────
  container.querySelector('#dcons-sugerir-pliego').addEventListener('click', () => {
    const nombreActor = val('dcons-nombre') || 'la parte actora';
    const producto = val('dcons-producto_servicio') || '[PRODUCTO/SERVICIO]';
    const fecha = val('dcons-fecha_operacion') ? fmtFecha(val('dcons-fecha_operacion')) : '[FECHA DE LA OPERACIÓN]';
    container.querySelector('#dcons-confesional_pliego').value =
`Solicito se cite al representante legal de la demandada a absolver posiciones a tenor del siguiente interrogatorio, sin perjuicio del pliego que se acompañará oportunamente:
Jure que es cierto:
a) ...que ${nombreActor} contrató/adquirió ${producto} con la demandada, con fecha ${fecha};
b) ...que la demandada incurrió en el incumplimiento relatado en el punto II de la presente;
c) ...que la parte actora efectuó reclamos previos a la demandada sin obtener respuesta satisfactoria;
d) Me reservo el derecho de ampliar el presente interrogatorio.-`;
  });

  container.querySelector('#dcons-sugerir-pericial_contable').addEventListener('click', () => {
    const nombreActor = val('dcons-nombre') || 'la parte actora';
    container.querySelector('#dcons-pericial_contable_puntos').value =
`Se designe Perito Contador/a único/a de oficio para que, previo estudio de la documentación contable e impositiva de la demandada, informe:
a) Los movimientos, débitos, créditos y/o liquidaciones cuestionados en la presente demanda, con indicación de fechas e importes;
b) Si los cargos/comisiones/consumos cuestionados se encuentran pactados y/o autorizados por ${nombreActor}, y en su caso, la fuente contractual;
c) Practique liquidación de los rubros reclamados conforme las pautas expuestas en el punto IV.`;
  });

  container.querySelector('#dcons-sugerir-pericial_informatica').addEventListener('click', () => {
    container.querySelector('#dcons-pericial_informatica_puntos').value =
`Se designe Perito Informático/a único/a de oficio para que informe:
a) El origen, autenticidad y trazabilidad de las operaciones y/o comunicaciones electrónicas cuestionadas en la presente demanda (IP, dispositivo, geolocalización, horarios);
b) Las medidas de seguridad, autenticación y monitoreo de operaciones atípicas implementadas por la demandada al momento del hecho;
c) Si existieron alertas de seguridad que debieron activarse y no lo hicieron, conforme los estándares vigentes en la materia.`;
  });

  function fmtMoneda(n) { return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  function actualizarAbogado() {
    const a = ABOGADOS_BY_ID[selAbogado.value];
    if (!a) return;
    inputEmailNotif.value = a.domicilioElectronico;
    container.querySelector('#dcons-matricula').value = a.matricula;
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
    container.querySelector('#dcons-grupo-remitente').innerHTML = renderCamposGrupo('remitente', ids);
    container.querySelector('#dcons-grupo-destinatario').innerHTML = renderCamposGrupo('destinatario', ids);
    container.querySelector('#dcons-grupo-detalle').innerHTML = renderCamposGrupo('detalle', ids);
  }

  function actualizarCamposVisibles() {
    const materia = MATERIAS[materiaActual];
    const tipo = materia.tipos[selTipo.value];
    if (!tipo) return;
    const todos = [...tipo.requiere, ...tipo.opcionales];
    CAMPOS_CONFIG.forEach(c => {
      const wrap = container.querySelector(`#dcons-wrap-${c.id}`);
      if (!wrap) return;
      wrap.style.display = todos.includes(c.id) ? '' : 'none';
    });
  }

  function actualizarTotal() {
    let total = parseFloat(container.querySelector('#dcons-monto_reclamado')?.value) || 0;
    ['dano_moral', 'dano_punitivo', 'gastos_previos'].forEach(id => {
      const chk = container.querySelector(`#dcons-rubro-${id}`);
      const monto = container.querySelector(`#dcons-monto-${id}`);
      monto.disabled = !chk.checked;
      if (chk.checked) total += parseFloat(monto.value) || 0;
    });
    totalSpan.textContent = fmtMoneda(total);
  }

  function onMateriaChange() {
    materiaActual = selMateria.value;
    poblarTipos();
    renderizarCampos();
    actualizarCamposVisibles();
    actualizarTotal();
    divRes.style.display = 'none';
    textarea.value = '';
    ultimoTextoGenerado = '';
  }

  selMateria.addEventListener('change', onMateriaChange);
  selTipo.addEventListener('change', () => { actualizarCamposVisibles(); actualizarTotal(); });
  container.querySelectorAll('#dcons-rubro-dano_moral, #dcons-rubro-dano_punitivo, #dcons-rubro-gastos_previos').forEach(chk => chk.addEventListener('change', actualizarTotal));
  container.querySelectorAll('#dcons-monto-dano_moral, #dcons-monto-dano_punitivo, #dcons-monto-gastos_previos').forEach(inp => inp.addEventListener('input', actualizarTotal));

  // Inicialización
  actualizarAbogado();
  poblarTipos();
  renderizarCampos();
  actualizarCamposVisibles();
  actualizarTotal();
  container.querySelector('#dcons-grupo-detalle').addEventListener('input', actualizarTotal);

  function val(id) { const el = container.querySelector(`#${id}`); return el ? el.value.trim() : ''; }
  function fmtFecha(iso) {
    if (!iso) return '';
    const p = iso.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
  }

  // ── Generar ──────────────────────────────────────────────────────────────
  container.querySelector('#dcons-generar').addEventListener('click', () => {
    const materia = MATERIAS[materiaActual];
    const tipo = materia.tipos[selTipo.value];

    CAMPOS_CONFIG.forEach(c => container.querySelector(`#dcons-${c.id}`)?.classList.remove('error'));
    let ok = true;
    for (const id of tipo.requiere) {
      const el = container.querySelector(`#dcons-${id}`);
      if (el && !el.value.trim()) { el.classList.add('error'); ok = false; }
    }
    if (!ok) return;

    const d = {};
    [...tipo.requiere, ...tipo.opcionales].forEach(id => {
      const el = container.querySelector(`#dcons-${id}`);
      if (el) d[id] = el.value.trim();
    });
    Object.keys(d).forEach(k => {
      const cfg = CAMPOS_BY_ID[k];
      if (cfg && cfg.tipo === 'date' && d[k]) d[k] = fmtFecha(d[k]);
    });

    const abogadoSel = ABOGADOS_BY_ID[selAbogado.value];
    const matricula = val('dcons-matricula') || 'T° __ F° __';
    const abogadoTexto = `Dr./Dra. ${abogadoSel.nombre}, ${matricula}`;
    const caracterLetradoValor = val('dcons-caracter-letrado');
    const caracterLetradoTexto = caracterLetradoValor === 'apoderado' ? 'apoderado/a' : 'patrocinante';
    const juzgado = val('dcons-juzgado');
    const domicilioProcesal = val('dcons-domicilio_procesal') || '[DOMICILIO PROCESAL A CONSTITUIR]';
    const emailNotif = val('dcons-email_notificaciones') || abogadoSel.domicilioElectronico;

    const actoresExtra = leerActoresExtra();
    const demandadosExtra = leerDemandadosExtra();
    const coactoresTexto = joinConY(actoresExtra.map(a => `${a.nombre}, DNI ${a.dni || '[DNI]'}${a.domicilio ? `, con domicilio real en ${a.domicilio}` : ''}`));
    const demandadosNombres = [d.razon_social, ...demandadosExtra.map(x => x.nombre)];
    const demandadosTextoObjeto = joinConY([
      `${d.razon_social}, con domicilio en ${d.dom_destinatario}${d.cuit ? `, CUIT ${d.cuit}` : ''}`,
      ...demandadosExtra.map(x => `${x.nombre}, con domicilio en ${x.domicilio || '[DOMICILIO]'}${x.cuit ? `, CUIT ${x.cuit}` : ''}`),
    ]);
    const demandadosTextoPetitorio = joinConY(demandadosNombres);

    // Rubros
    let total = parseFloat(d.monto_reclamado) || 0;
    const rubrosTexto = [];
    if (d.monto_reclamado) rubrosTexto.push(`- Rubro principal reclamado: $ ${fmtMoneda(parseFloat(d.monto_reclamado))}`);
    let derechoPunitivo = '';
    if (container.querySelector('#dcons-rubro-dano_moral').checked) {
      const m = parseFloat(container.querySelector('#dcons-monto-dano_moral').value) || 0;
      total += m;
      rubrosTexto.push(`- Daño moral: $ ${fmtMoneda(m)}`);
    }
    if (container.querySelector('#dcons-rubro-dano_punitivo').checked) {
      const m = parseFloat(container.querySelector('#dcons-monto-dano_punitivo').value) || 0;
      total += m;
      rubrosTexto.push(`- Daño punitivo (art. 52 bis, Ley 24.240): ${m ? '$ ' + fmtMoneda(m) : 'a determinar por V.S. conforme la gravedad de la conducta'}`);
      derechoPunitivo = materiaActual === 'consumidor_seguros'
        ? ` Subsidiariamente, y sin perjuicio de la prevalencia de la Ley 17.418 como norma especial en la materia, reclamo el daño punitivo previsto en el art. 52 bis de la Ley 24.240.`
        : ` Reclamo asimismo el daño punitivo previsto en el art. 52 bis de la Ley 24.240, en atención a la gravedad de la conducta de la demandada.`;
    }
    if (container.querySelector('#dcons-rubro-gastos_previos').checked) {
      const m = parseFloat(container.querySelector('#dcons-monto-gastos_previos').value) || 0;
      total += m;
      rubrosTexto.push(`- Gastos de gestiones/intimaciones previas: $ ${fmtMoneda(m)}`);
    }

    // ── Prueba — bloques numerados según la estructura del Estudio ─────────
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
    if (container.querySelector('#dcons-prueba-confesional').checked) {
      nProb++;
      const pliego = val('dcons-confesional_pliego') || 'Solicito se cite al representante legal de la demandada a absolver posiciones a tenor del pliego que se acompañará oportunamente.';
      bloquesPrueba.push(`${nProb}.- Prueba Confesional: ${pliego}`);
    }

    // 3. Documental en poder de la demandada
    if (container.querySelector('#dcons-prueba-doc_demandada').checked) {
      nProb++;
      const detalleDD = val('dcons-doc_demandada_detalle') || '[DETALLAR DOCUMENTACIÓN EN PODER DE LA DEMANDADA]';
      bloquesPrueba.push(`${nProb}.- Documental en poder de la demandada: Denuncio como documental en poder de la demandada: ${detalleDD}. Peticiono se libre cédula a fin de que la presente en autos, bajo apercibimiento de ley (arts. 385 y ccdtes., CPCC de la Provincia de Buenos Aires).`);
    }

    // 4. Testifical
    if (container.querySelector('#dcons-prueba-testifical').checked) {
      nProb++;
      const testigos = leerTestigos();
      if (testigos.length) {
        const nomina = testigos.map((t, i) => `${letrasProb[i]}).- ${t.nombre}, DNI ${t.dni || '[DNI]'}, con domicilio en ${t.domicilio || '[DOMICILIO COMPLETO]'}`).join('; ');
        bloquesPrueba.push(`${nProb}.- Prueba Testifical: Solicito se cite a prestar declaración testimonial a las siguientes personas: ${nomina}.-`);
      } else {
        bloquesPrueba.push(`${nProb}.- Prueba Testifical: Solicito se cite a prestar declaración testimonial a las personas que se individualizarán oportunamente [COMPLETAR NÓMINA DE TESTIGOS Y DOMICILIOS].`);
      }
    }

    // 5. Pericial (contable / informática)
    const periciaContableOn = container.querySelector('#dcons-prueba-pericial_contable').checked;
    const periciaInformaticaOn = container.querySelector('#dcons-prueba-pericial_informatica').checked;
    if (periciaContableOn || periciaInformaticaOn) {
      nProb++;
      const subPericia = [];
      if (periciaContableOn) subPericia.push(val('dcons-pericial_contable_puntos') || 'Se designe Perito Contador/a de oficio para que informe sobre los extremos de la presente demanda [DETALLAR PUNTOS DE PERICIA].');
      if (periciaInformaticaOn) subPericia.push(val('dcons-pericial_informatica_puntos') || 'Se designe Perito Informático/a de oficio para que informe sobre los extremos de la presente demanda [DETALLAR PUNTOS DE PERICIA].');
      bloquesPrueba.push(`${nProb}.- Prueba Pericial: ${subPericia.join('\n\n')}`);
    }

    // 6. Informativa
    const informativasActivas = INFORMATIVAS.filter(p => container.querySelector(`[data-informativa="${p.id}"]`).checked);
    if (informativasActivas.length) {
      nProb++;
      const nBloque = nProb;
      const subitems = informativasActivas.map((p, i) => {
        const n = `${nBloque}.${i + 1}`;
        if (p.id === 'arca') {
          return `${n}.- Se libre Oficio a la Agencia de Recaudación y Control Aduanero (ARCA), a fin de que informe sobre los extremos impositivos vinculados a la relación de consumo objeto de autos.`;
        }
        if (p.id === 'bcra') {
          return `${n}.- Se libre Oficio al Banco Central de la República Argentina (BCRA), a fin de que informe sobre la normativa aplicable y/o los antecedentes vinculados a la operatoria cuestionada.`;
        }
        if (p.id === 'ssn') {
          return `${n}.- Se libre Oficio a la Superintendencia de Seguros de la Nación (SSN), a fin de que informe sobre los antecedentes de la póliza y/o de la compañía aseguradora demandada vinculados a los hechos de autos.`;
        }
        if (p.id === 'bancos') {
          const entidad = container.querySelector('[data-informativa-dato="bancos"]')?.value.trim() || '[ENTIDAD/ES A OFICIAR]';
          return `${n}.- Se libre Oficio a ${entidad}, a fin de que informe sobre los movimientos, acreditaciones y/o débitos vinculados a la operatoria cuestionada, y todo otro dato de interés para la causa.`;
        }
        return `${n}.- ${p.label}`;
      }).join('\n');
      bloquesPrueba.push(`${nProb}.- Prueba Informativa:\n${subitems}`);
    }

    if (val('dcons-prueba_otros')) { nProb++; bloquesPrueba.push(`${nProb}.- Otros medios de prueba: ${val('dcons-prueba_otros')}`); }

    const totalTexto = fmtMoneda(total);
    const hechosTipo = tipo.hechos(d);
    const derechoTipo = tipo.derecho(d) + derechoPunitivo;

    const texto =
`SEÑOR JUEZ${juzgado ? ` — ${juzgado}` : ''}:

${abogadoTexto}, en mi carácter de ${caracterLetradoTexto} de ${d.nombre}, DNI ${d.dni}, con domicilio real en ${d.domicilio}${coactoresTexto ? `, y de ${coactoresTexto}` : ''}, constituyendo domicilio procesal en ${domicilioProcesal} y domicilio electrónico en ${emailNotif} (art. 40, CPCC de la Provincia de Buenos Aires), a V.S. respetuosamente me presento y digo:

I. OBJETO
Que vengo por el presente a promover demanda por trámite sumarísimo (art. 53, Ley 24.240) contra ${demandadosTextoObjeto}, ${materia.encuadre}, por cobro de la suma de $ ${totalTexto} (PESOS ${totalTexto}) y/o lo que en más o en menos resulte de la prueba a producirse, con más sus intereses y costas, en virtud de los hechos y el derecho que a continuación se exponen.

II. HECHOS
${hechosTipo}

III. EL DERECHO
${derechoTipo} Asimismo, resulta de aplicación el art. 53 de la Ley 24.240, que establece el trámite sumarísimo para las acciones judiciales derivadas de la presente ley, y el art. 25 de la Ley 13.133 en cuanto al beneficio de justicia gratuita.

IV. LIQUIDACIÓN
${rubrosTexto.length ? rubrosTexto.join('\n') : '- [DETALLAR RUBROS Y MONTOS]'}
TOTAL RECLAMADO: $ ${totalTexto}

V. PRUEBA
${bloquesPrueba.length ? bloquesPrueba.join('\n\n') : '- [DETALLAR MEDIOS DE PRUEBA OFRECIDOS]'}

VI. BENEFICIO DE JUSTICIA GRATUITA
Que en mi carácter de consumidor/a, invoco el beneficio de justicia gratuita previsto en el art. 25 de la Ley 13.133 y en el art. 53, tercer párrafo, de la Ley 24.240, solicitando se me exima del pago de tasas, contribuciones u otra imposición económica.

VII. AUTORIZACIONES
Autorizo indistintamente a ${TODOS_ABOGADOS_TEXTO} a compulsar el expediente, tomar vista de las actuaciones, retirar y diligenciar cédulas, oficios, mandamientos, testimonios, copias y demás documentación, y a realizar cualquier otro trámite relacionado con las presentes actuaciones.

VIII. PETITORIO
Por lo expuesto, a V.S. solicito:
1) Me tenga por presentado, por parte y por constituido el domicilio procesal indicado.
2) Se tenga por promovida la presente demanda por trámite sumarísimo contra ${demandadosTextoPetitorio}.
3) Se tenga presente la prueba ofrecida y se provea oportunamente su producción.
4) Se tenga presente el beneficio de justicia gratuita invocado (art. 25, Ley 13.133).
5) Se tengan presentes las autorizaciones conferidas en el punto VII.
6) Oportunamente, se haga lugar a la demanda en todas sus partes, condenando a la demandada al pago de la suma reclamada de $ ${totalTexto}, o lo que en más o en menos resulte de la prueba producida, con más sus intereses y costas.

PROVEER DE CONFORMIDAD,
SERÁ JUSTICIA.

──────────────────────────────────────────────
Recordatorios previos a la presentación (no forman parte del escrito):
- Verificar y acompañar el Bono de Derecho Fijo (Ley 8480), salvo exención aplicable.
- Confirmar el Juzgado/Fuero competente según el monto reclamado (Juzgado de Paz Letrado o Civil y Comercial) y el domicilio de la demandada.
- Verificar el cumplimiento de la mediación prejudicial obligatoria (Ley 13.951), previa a la radicación de la demanda, salvo que se invoque una excepción aplicable.${(actoresExtra.length || demandadosExtra.length) ? `
- LITISCONSORCIO: se cargaron ${actoresExtra.length} coactor/es y ${demandadosExtra.length} codemandado/s adicional/es. El relato de HECHOS, EL DERECHO y la LIQUIDACIÓN fueron redactados sobre los datos del actor y de la demandada principales — revisar y adaptar manualmente esos puntos si los coactores/codemandados tuvieran datos, hechos o rubros propios.` : ''}`;

    ultimoTextoGenerado = texto;
    textarea.value = texto;
    divRes.style.display = 'block';
    textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  container.querySelector('#dcons-limpiar').addEventListener('click', () => {
    CAMPOS_CONFIG.forEach(c => { const el = container.querySelector(`#dcons-${c.id}`); if (el) { el.value = ''; el.classList.remove('error'); } });
    container.querySelector('#dcons-juzgado').value = '';
    container.querySelector('#dcons-prueba_otros').value = '';
    ['dano_moral', 'dano_punitivo', 'gastos_previos'].forEach(id => {
      container.querySelector(`#dcons-rubro-${id}`).checked = false;
      container.querySelector(`#dcons-monto-${id}`).value = '';
    });
    selAbogado.selectedIndex = 0;
    container.querySelector('#dcons-caracter-letrado').selectedIndex = 0;
    wrapActoresExtra.innerHTML = '';
    wrapDemandadosExtra.innerHTML = '';
    actoresExtraCount = 0;
    demandadosExtraCount = 0;

    container.querySelectorAll('.dcons-documental-check, .dcons-informativa-check').forEach(c => c.checked = false);
    container.querySelectorAll('.dcons-documental-dato, .dcons-informativa-dato').forEach(el => { el.value = ''; el.disabled = true; el.style.display = 'none'; });
    container.querySelector('#dcons-confesional_pliego').value = '';
    container.querySelector('#dcons-doc_demandada_detalle').value = '';
    container.querySelector('#dcons-pericial_contable_puntos').value = '';
    container.querySelector('#dcons-pericial_informatica_puntos').value = '';
    wrapTestigos.innerHTML = '';
    testigosCount = 0; testigosActivos = 0;
    actualizarBotonTestigo();
    container.querySelector('#dcons-prueba-confesional').checked = true;
    container.querySelector('#dcons-prueba-doc_demandada').checked = false;
    container.querySelector('#dcons-prueba-testifical').checked = false;
    container.querySelector('#dcons-prueba-pericial_contable').checked = false;
    container.querySelector('#dcons-prueba-pericial_informatica').checked = false;
    container.querySelector('#dcons-wrap-confesional').style.display = 'block';
    container.querySelector('#dcons-wrap-doc_demandada').style.display = 'none';
    container.querySelector('#dcons-wrap-testifical').style.display = 'none';
    container.querySelector('#dcons-wrap-pericial_contable').style.display = 'none';
    container.querySelector('#dcons-wrap-pericial_informatica').style.display = 'none';
    actualizarAbogado();
    actualizarTotal();
    divRes.style.display = 'none';
    textarea.value = '';
    ultimoTextoGenerado = '';
  });

  container.querySelector('#dcons-copiar').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      const btn = container.querySelector('#dcons-copiar');
      const orig = btn.textContent;
      btn.textContent = 'Copiado ✓';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => prompt('Copie el texto:', texto));
  });

  container.querySelector('#dcons-reset-texto').addEventListener('click', () => {
    if (ultimoTextoGenerado) textarea.value = ultimoTextoGenerado;
  });

  container.querySelector('#dcons-word').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const htmlBody = texto.split('\n').map(linea => {
      if (!linea.trim()) return '<p>&nbsp;</p>';
      const negrita = /^(SEÑOR JUEZ|I\.|II\.|III\.|IV\.|V\.|VI\.|VII\.|VIII\.|PROVEER|SERÁ JUSTICIA|TOTAL RECLAMADO|Recordatorios)/.test(linea.trim());
      const esc = linea.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<p style="margin:0 0 8pt 0;${negrita ? 'font-weight:bold;' : ''}">${esc}</p>`;
    }).join('\n');
    exportarWord(`Demanda consumidor - ${val('dcons-nombre') || 'actor'} c. ${val('dcons-razon_social') || 'demandado'}`, htmlBody);
  });

  container.querySelector('#dcons-pdf').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const lineas = texto.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    exportarPDF(`Demanda consumidor — ${val('dcons-nombre') || 'actor'} c. ${val('dcons-razon_social') || 'demandado'}`, `<div class="info-box" style="font-size:12px;line-height:1.7">${lineas}</div>`);
  });
}
