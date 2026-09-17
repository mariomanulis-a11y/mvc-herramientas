// medidas-bancarias.js — Generador de Medidas Cautelares y Urgentes en materia
// bancaria / consumidor financiero (MVC Abogados).
//
// Cubre dos supuestos de hecho recurrentes en la práctica del Estudio:
//   A) Ciberestafa bancaria (phishing / vishing / smishing / ingeniería social /
//      SIM swapping): terceros acceden sin autorización a homebanking o
//      billetera virtual, solicitan préstamos no consentidos y/o transfieren
//      fondos depositados.
//   B) Retención bancaria de haberes más allá del límite legal de
//      inembargabilidad de la cuenta sueldo (art. 2, Ley 26.704: hasta 3 veces
//      el promedio de haberes de los últimos 6 meses).
//
// Para cada supuesto se puede solicitar una de cinco vías procesales:
//   - Medida de no innovar (art. 230 CPCCN)
//   - Medida cautelar innovativa (art. 232 CPCCN)
//   - Medida autosatisfactiva / proceso urgente (con encuadre subsidiario en
//     innovativa, dado que la CSJN cuestiona la autonomía de la categoría)
//   - Aseguramiento de pruebas / prueba anticipada (art. 326 CPCCN)
//   - Incidente de levantamiento parcial de embargo (solo aplica al supuesto B)
//
// El generador produce el escrito de la MEDIDA URGENTE como pieza principal.
// Opcionalmente (checkbox) agrega un acápite "en subsidio" reservando/sumando
// la demanda de fondo. También permite generar, como documento aparte, el
// reclamo administrativo previo ante el BCRA / Defensa del Consumidor.
//
// Fuentes relevadas (ver conversación con el profesional): art. 230/232/326
// CPCCN; Ley 24.240 (arts. 1, 2, 3, 5, 40, 40 bis, 52 bis); Comunicación "A"
// 8280 BCRA (obligación de notificación de ciberincidentes, sin obligación de
// reintegro); Ley 26.704 (inembargabilidad de cuenta sueldo hasta 3x el
// promedio semestral); Dto. 484/87 reglamentario del art. 120 LCT (topes de
// embargabilidad de remuneraciones); jurisprudencia relevada de la Cámara
// Nacional Comercial y de fueros provinciales en casos de phishing/vishing
// bancario (2023-2026).

import { exportarPDF, exportarWord } from './exportar.js';

export function initMedidasBancarias(container) {

  // ── Letrados del Estudio (mismo array que el resto de los generadores) ──────
  const ABOGADOS = [
    { id: 'manulis',   nombre: 'Mario Martín Manulis',      genero: 'M', domicilioElectronico: '20271887931@notificaciones.scba.gov.ar', celular: '1153107794', matricula: 'T° 34 F° 69 CASI' },
    { id: 'velazquez', nombre: 'Soledad Celeste Velazquez', genero: 'F', domicilioElectronico: '27273872286@notificaciones.scba.gov.ar', celular: '1155781501', matricula: 'T° 36 F° 125 CASI' },
    { id: 'curbelo',   nombre: 'Yanina Daniela Curbelo',    genero: 'F', domicilioElectronico: '27268952867@notificaciones.scba.gov.ar', celular: '1149272774', matricula: 'T° 36 F° 90 CASI' },
    { id: 'poggi',     nombre: 'Camila Susana Poggi',       genero: 'F', domicilioElectronico: '27388231705@notificaciones.scba.gov.ar', celular: '1138224662', matricula: 'T° 55 F° 255 CASI' },
  ];
  const ABOGADOS_BY_ID = Object.fromEntries(ABOGADOS.map(a => [a.id, a]));
  const TODOS_ABOGADOS_TEXTO = 'los Dres./Dras. ' + ABOGADOS.map(a => `${a.nombre} (${a.matricula})`).join(' y/o ');

  const CARACTER_LETRADO = [
    { value: 'patrocinante', label: 'Letrado/a patrocinante' },
    { value: 'apoderado',    label: 'Apoderado/a' },
  ];

  // ── Supuestos de hecho ───────────────────────────────────────────────────────
  const SUPUESTOS = {
    ciberestafa: {
      label: 'Ciberestafa bancaria (phishing / vishing / smishing / ingeniería social)',
      medidasDisponibles: ['no_innovar', 'innovativa', 'autosatisfactiva', 'aseguramiento_pruebas'],
      medidaRecomendada: (d) => (d.mb_reclamo_previo_banco || d.mb_denuncia_penal) ? 'innovativa' : 'no_innovar',
    },
    embargo_excesivo: {
      label: 'Retención bancaria de haberes más allá del límite legal (cuenta sueldo)',
      medidasDisponibles: ['incidente_embargo', 'innovativa', 'autosatisfactiva', 'aseguramiento_pruebas', 'no_innovar'],
      medidaRecomendada: (d) => d.mb_expediente_conocido ? 'incidente_embargo' : 'innovativa',
    },
  };

  const MEDIDAS = {
    no_innovar: {
      label: 'Medida de no innovar (art. 230 CPCCN)',
      cuando: 'El perjuicio aún no se consumó (débito o retención no efectivizados): busca congelar la situación.',
    },
    innovativa: {
      label: 'Medida cautelar innovativa (art. 232 CPCCN)',
      cuando: 'El perjuicio ya se consumó (débito o retención ya efectivizados): busca revertirlo de inmediato.',
    },
    autosatisfactiva: {
      label: 'Medida autosatisfactiva / proceso urgente',
      cuando: 'Urgencia extrema con riesgo a la subsistencia. Se funda en subsidio como cautelar innovativa de tramitación urgente (ver advertencia en el escrito).',
    },
    aseguramiento_pruebas: {
      label: 'Aseguramiento de pruebas / prueba anticipada (art. 326 CPCCN)',
      cuando: 'Riesgo de pérdida o alteración de prueba (logs, capturas, IPs, metadatos) antes del proceso principal.',
    },
    incidente_embargo: {
      label: 'Incidente de levantamiento parcial de embargo',
      cuando: 'Se conoce el expediente donde se trabó el embargo: vía más directa y económica que una cautelar autónoma.',
    },
  };

  const MODALIDADES = {
    phishing:      'phishing (correo electrónico o sitio web apócrifo)',
    vishing:       'vishing (llamada telefónica suplantando a la entidad)',
    smishing:      'smishing (mensaje de texto/WhatsApp apócrifo)',
    sim_swapping:  'SIM swapping (duplicación fraudulenta de línea telefónica)',
    ingenieria_social: 'ingeniería social',
    otro:          'una maniobra de fraude informático',
  };

  // Salario Mínimo Vital y Móvil (SMVM) — vigente desde el 02/09/2026 (Resolución
  // 4/2026, Consejo Nacional del Empleo, la Productividad y el SMVM): $ 383.800.
  // El Consejo lo actualiza periódicamente — VERIFICAR VIGENCIA antes de usar.
  // El campo queda editable en el formulario para no depender de este valor fijo.
  const SMVM_DEFAULT = 383800;

  // Cálculo del tope de embargabilidad de remuneraciones — art. 1°, Dto. 484/87,
  // reglamentario de los arts. 120 y 147 de la Ley de Contrato de Trabajo:
  // - Hasta 1 SMVM: totalmente inembargable.
  // - Entre 1 y 2 SMVM: embargable el 10% del importe que exceda el SMVM.
  // - Más de 2 SMVM: embargable el 20% del importe que exceda el SMVM.
  // No aplica a deudas alimentarias (art. 147, LCT, in fine; art. 4°, Dto. 484/87).
  function calcularEmbargoDto48487(remuneracion, smvm) {
    if (!remuneracion || !smvm || remuneracion <= smvm) return 0;
    const excedente = remuneracion - smvm;
    const tasa = remuneracion <= 2 * smvm ? 0.10 : 0.20;
    return excedente * tasa;
  }

  const ELEMENTOS_PRESERVAR = [
    { id: 'capturas',   label: 'Capturas de pantalla de la operación cuestionada y de las notificaciones recibidas' },
    { id: 'logs',       label: 'Logs de acceso a homebanking/aplicación (fecha, hora, dirección IP)' },
    { id: 'metadatos',  label: 'Metadatos de correos electrónicos y/o mensajes de texto recibidos' },
    { id: 'llamadas',   label: 'Registro o grabación de llamadas telefónicas (si hubo vishing)' },
    { id: 'extractos',  label: 'Extractos bancarios y resúmenes de cuenta del período involucrado' },
    { id: 'denuncia',   label: 'Constancia de denuncia penal' },
  ];

  // ── Fundamentos de derecho — base común por medida ──────────────────────────
  const REQUISITOS_BASE = {
    no_innovar: 'Que la procedencia de la medida de no innovar requiere la concurrencia de los siguientes presupuestos, conforme el art. 230 del Código Procesal Civil y Comercial: a) que el derecho fuere verosímil; b) que existiere el peligro de que, si se mantuviera o alterara la situación de hecho o de derecho, la modificación pudiera influir en la sentencia o tornara su ejecución ineficaz o imposible; y c) que la cautela no pudiere obtenerse por medio de otra medida precautoria.',
    innovativa: 'Que la medida cautelar innovativa, contemplada en el art. 232 del Código Procesal Civil y Comercial, procede cuando concurren los siguientes presupuestos: a) verosimilitud del derecho (fumus boni iuris), sin que se requiera prueba plena sino la apariencia del derecho invocado; b) peligro en la demora (periculum in mora); y c) contracautela, en garantía de los eventuales daños que la medida pudiera ocasionar. A diferencia de la prohibición de innovar, que preserva el statu quo, la cautelar innovativa altera el estado de hecho o de derecho existente al momento de su dictado, revirtiendo los efectos de una situación ya consumada, cuando la urgencia del caso no admite aguardar el dictado de la sentencia definitiva.',
    autosatisfactiva: 'Que, sin perjuicio de que la Corte Suprema de Justicia de la Nación ha cuestionado la autonomía conceptual de la denominada "medida autosatisfactiva" por su tensión con el principio de bilateralidad y el derecho de defensa en juicio, la extrema urgencia que reviste el presente caso —en tanto se encuentra comprometida la subsistencia de la parte actora— habilita a encuadrar la petición, en subsidio, como una medida cautelar innovativa de tramitación urgente e inaudita parte, sujeta a posterior sustanciación y a la contracautela ofrecida, en resguardo del derecho de defensa de la contraria.',
    aseguramiento_pruebas: 'Que la producción de prueba anticipada, en los términos del art. 326 del Código Procesal Civil y Comercial, procede cuando existan razones justificadas para temer que la producción de determinada prueba pudiera resultar imposible o muy dificultosa en el período probatorio del proceso principal. Los elementos cuya preservación se solicita —registros informáticos, metadatos, logs de acceso y comunicaciones electrónicas— son por su naturaleza volátiles y susceptibles de ser sobrescritos, eliminados o alterados con el transcurso del tiempo, sea por el normal funcionamiento de los sistemas involucrados o por la política de retención de datos de los proveedores de servicios, lo que justifica su aseguramiento anticipado.',
    incidente_embargo: 'Que, conforme los principios de especialidad y economía procesal, el planteo de levantamiento parcial de un embargo trabado en exceso de los límites legales debe articularse por vía de incidente ante el mismo juzgado que lo ordenó (arts. 175 y ccdtes. y 203 y ccdtes. del Código Procesal Civil y Comercial), por tratarse de una cuestión accesoria vinculada al cumplimiento de la medida ya dispuesta en autos, sin necesidad de promover un proceso autónomo.',
  };

  function encuadreSupuesto(supuesto, d) {
    if (supuesto === 'ciberestafa') {
      return ' En el caso de autos, la verosimilitud del derecho surge de la denuncia penal formulada, de los extractos y constancias bancarias acompañadas, y de la ausencia de consentimiento de la parte actora para la operación cuestionada; el peligro en la demora surge de la afectación patrimonial ya producida y/o del riesgo cierto de que continúe devengándose el débito de cuotas sobre haberes de naturaleza alimentaria. La entidad demandada reviste la calidad de proveedora profesional de servicios financieros (arts. 1, 2 y 5, Ley 24.240), sobre quien pesa un deber de seguridad agravado respecto del sistema de banca electrónica que ella misma diseña, implementa y explota, y que —conforme los lineamientos de la Comunicación "A" 8280 del BCRA— se encuentra obligada a gestionar y reportar los ciberincidentes que afecten a sus clientes, sin perjuicio de que dicha normativa no releva a la entidad de su responsabilidad civil frente al usuario. La condición de consumidor de la parte actora impone, además, la aplicación del principio in dubio pro consumidor (art. 3, Ley 24.240) en la valoración de los extremos invocados.';
    }
    if (d && d.deuda_alimentaria) {
      return ' En el caso de autos, si bien la deuda que motivó el embargo reviste naturaleza alimentaria —motivo por el cual no resultan aplicables los límites de embargabilidad de la Ley 26.704 ni del Decreto 484/87, conforme la excepción expresamente prevista en el art. 147 in fine de la Ley de Contrato de Trabajo y en el art. 4° del Decreto 484/87—, la fijación y el mantenimiento de la cuota alimentaria deben en todo caso respetar el límite que permita la subsistencia del alimentante, conforme lo dispone el propio art. 147 de la Ley de Contrato de Trabajo. La verosimilitud del derecho surge de la desproporción entre el monto retenido y la capacidad de pago de la parte actora, y el peligro en la demora de la afectación actual a su subsistencia y a la de su grupo familiar conviviente.';
    }
    return ' En el caso de autos, la verosimilitud del derecho surge, en forma concurrente, de dos límites legales distintos: a) el límite de inembargabilidad del saldo de la cuenta sueldo establecido por el art. 2 de la Ley 26.704 —tres (3) veces el promedio de haberes de los últimos seis (6) meses—; y b) el límite de embargabilidad de remuneraciones establecido por los arts. 120 y 147 de la Ley de Contrato de Trabajo y su decreto reglamentario N° 484/87, conforme el cual la remuneración es inembargable hasta la concurrencia del Salario Mínimo Vital y Móvil, y solo el excedente resulta embargable en la proporción del diez por ciento (10%) —si la remuneración no supera el doble del SMVM— o del veinte por ciento (20%) —si lo supera— (art. 1°, Dto. 484/87). Ambos límites concurren en autos, y la retención cuestionada los excede en cualquiera de los dos encuadres. El peligro en la demora surge de la afectación actual a la disponibilidad de fondos de naturaleza alimentaria, indispensables para la subsistencia de la parte actora y su grupo familiar. Se deja expresa constancia de que estos límites no resultan aplicables si la deuda que originó el embargo fuera de naturaleza alimentaria (art. 147, LCT, in fine; art. 4°, Dto. 484/87), extremo que no se verifica en el presente caso.';
  }

  function objetoMedida(medida) {
    const objetos = {
      no_innovar: 'se decrete MEDIDA CAUTELAR DE NO INNOVAR',
      innovativa: 'se decrete MEDIDA CAUTELAR INNOVATIVA',
      autosatisfactiva: 'se decrete, con carácter urgente, la tutela solicitada',
      aseguramiento_pruebas: 'se decrete la producción de PRUEBA ANTICIPADA',
      incidente_embargo: 'se haga lugar al presente INCIDENTE DE LEVANTAMIENTO PARCIAL DE EMBARGO',
    };
    return objetos[medida];
  }

  function petitorioMedida(medida, supuesto, d, excedente) {
    const alimentaria = supuesto === 'embargo_excesivo' && d.deuda_alimentaria;
    const fundamentoEmbargo = '(art. 2, Ley 26.704; arts. 120 y 147, LCT, y art. 1°, Dto. 484/87)';
    switch (medida) {
      case 'no_innovar':
        if (supuesto === 'ciberestafa') {
          return `Se decrete la MEDIDA CAUTELAR DE NO INNOVAR, ordenando a ${d.demandado} que se abstenga de debitar, reclamar, informar en centrales de riesgo crediticio y/o ejecutar por cualquier vía la suma cuestionada${d.monto_prestamo ? ` y/o las cuotas del préstamo por $ ${fmt(d.monto_prestamo)}` : ''}, hasta tanto recaiga sentencia firme en el proceso principal a promoverse.`;
        }
        return alimentaria
          ? `Se decrete la MEDIDA CAUTELAR DE NO INNOVAR, ordenando a ${d.demandado} que se abstenga de incrementar la retención practicada sobre la cuenta de la actora por encima del monto que garantice su subsistencia (art. 147, LCT), hasta tanto se sustancie la vía pertinente de revisión de la cuota.`
          : `Se decrete la MEDIDA CAUTELAR DE NO INNOVAR, ordenando a ${d.demandado} que se abstenga de incrementar la retención practicada sobre la cuenta de la actora por encima de los límites legales de embargabilidad ${fundamentoEmbargo}, hasta tanto recaiga sentencia firme en el proceso principal a promoverse.`;
      case 'innovativa':
        if (supuesto === 'ciberestafa') {
          return `Se decrete la MEDIDA CAUTELAR INNOVATIVA, ordenando a ${d.demandado} que restituya a la actora la suma de $ ${fmt(d.monto_afectado)} indebidamente sustraída/debitada, se abstenga de reclamar y/o ejecutar el préstamo no solicitado, y cese en el reporte de la actora en centrales de riesgo crediticio, hasta tanto recaiga sentencia firme en el proceso principal a promoverse.`;
        }
        return alimentaria
          ? `Se decrete la MEDIDA CAUTELAR INNOVATIVA, ordenando la readecuación provisoria de la retención practicada por ${d.demandado} a un monto que garantice la subsistencia de la actora y su grupo familiar (art. 147, LCT), hasta tanto se sustancie la vía pertinente de reducción de cuota.`
          : `Se decrete la MEDIDA CAUTELAR INNOVATIVA, ordenando a ${d.demandado} que desafecte y restituya de inmediato la suma de $ ${fmt(excedente)}, retenida en exceso de los límites legales de embargabilidad ${fundamentoEmbargo}, reintegrándola a la cuenta de la actora, hasta tanto recaiga sentencia firme en el proceso principal a promoverse.`;
      case 'autosatisfactiva':
        if (supuesto === 'ciberestafa') {
          return `Se decrete, con carácter de urgente y, en subsidio, como medida cautelar innovativa de tramitación urgente, la orden a ${d.demandado} de restituir de manera inmediata la suma de $ ${fmt(d.monto_afectado)} y abstenerse de reclamar y/o ejecutar el préstamo no solicitado, habilitándose días y horas inhábiles (art. 153, CPCC) en atención a la urgencia invocada.`;
        }
        return alimentaria
          ? `Se decrete, con carácter de urgente y, en subsidio, como medida cautelar innovativa de tramitación urgente, la readecuación provisoria de la retención practicada a un monto que garantice la subsistencia de la actora y su grupo familiar (art. 147, LCT), habilitándose días y horas inhábiles (art. 153, CPCC) en atención a la urgencia invocada.`
          : `Se decrete, con carácter de urgente y, en subsidio, como medida cautelar innovativa de tramitación urgente, la orden a ${d.demandado} de desafectar y restituir de manera inmediata la suma de $ ${fmt(excedente)} retenida en exceso de los límites legales de embargabilidad ${fundamentoEmbargo}, habilitándose días y horas inhábiles (art. 153, CPCC) en atención a la urgencia invocada.`;
      case 'aseguramiento_pruebas':
        return `Se decrete la producción de PRUEBA ANTICIPADA (art. 326, CPCC), ordenando a ${d.demandado} y/o a los proveedores de servicios de comunicaciones que correspondan la preservación y posterior remisión de los elementos individualizados en el punto de prueba, bajo apercibimiento de lo dispuesto por el art. 388 del Código Civil y Comercial de la Nación.`;
      case 'incidente_embargo':
        return alimentaria
          ? `Se haga lugar al presente incidente y se ordene la readecuación de la retención trabada sobre la cuenta de titularidad de la actora en ${d.demandado} a un monto que garantice su subsistencia y la de su grupo familiar, conforme el art. 147 de la Ley de Contrato de Trabajo.`
          : `Se haga lugar al presente incidente y se ordene el LEVANTAMIENTO PARCIAL del embargo trabado sobre la cuenta de titularidad de la actora en ${d.demandado}, limitándolo al monto que resulte embargable conforme los límites legales ${fundamentoEmbargo}, ordenando la inmediata desafectación y restitución de la suma retenida en exceso ($ ${fmt(excedente)}).`;
      default:
        return '';
    }
  }

  function fmt(n) {
    const v = parseFloat(n);
    return isNaN(v) ? '0,00' : v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ── HTML ─────────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Generador de Medidas Cautelares y Urgentes — Bancario / Consumidor Financiero</h2>
      <p class="tool-desc">Ciberestafa bancaria y retención de haberes más allá del límite legal: no innovar, innovativa, autosatisfactiva, aseguramiento de pruebas e incidente de levantamiento de embargo.</p>

      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="mb-supuesto">Supuesto de hecho</label>
          <select id="mb-supuesto">
            ${Object.entries(SUPUESTOS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
          </select>
        </div>
        <div class="field-group" style="flex:1">
          <label for="mb-medida">Medida / vía procesal a solicitar</label>
          <select id="mb-medida"></select>
        </div>
      </div>
      <p id="mb-medida-hint" style="font-size:.78rem;color:var(--color-muted);margin:-6px 0 12px"></p>

      <div class="form-row">
        <div class="field-group">
          <label for="mb-abogado-select">Letrado/a interviniente</label>
          <select id="mb-abogado-select">${ABOGADOS.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('')}</select>
        </div>
        <div class="field-group">
          <label for="mb-caracter-letrado">Carácter</label>
          <select id="mb-caracter-letrado">${CARACTER_LETRADO.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}</select>
        </div>
        <div class="field-group">
          <label for="mb-matricula">Matrícula (opcional, autocompleta)</label>
          <input type="text" id="mb-matricula" placeholder="T° __ F° __">
        </div>
      </div>

      <div class="form-row">
        <div class="field-group" style="flex:2">
          <label for="mb-juzgado">Juzgado / Fuero competente</label>
          <input type="text" id="mb-juzgado" value="Juzgado de Primera Instancia en lo Civil y Comercial N° __ del Departamento Judicial de ___, Provincia de Buenos Aires">
        </div>
        <div class="field-group">
          <label for="mb-contracautela">Contracautela ofrecida</label>
          <input type="text" id="mb-contracautela" value="Caución juratoria">
        </div>
      </div>

      <div class="form-row">
        <div class="field-group"><label for="mb-domicilio-procesal">Domicilio procesal a constituir</label><input type="text" id="mb-domicilio-procesal" placeholder="Calle, altura, localidad"></div>
        <div class="field-group"><label for="mb-email-notificaciones">Domicilio electrónico (opcional, autocompleta con el del letrado)</label><input type="text" id="mb-email-notificaciones"></div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Partes</div>
      <div class="form-row">
        <div class="field-group"><label for="mb-actor">Actor / cliente (nombre y apellido)</label><input type="text" id="mb-actor"></div>
        <div class="field-group"><label for="mb-dni">DNI</label><input type="text" id="mb-dni"></div>
      </div>
      <div class="form-row">
        <div class="field-group" style="flex:2"><label for="mb-domicilio">Domicilio real del actor</label><input type="text" id="mb-domicilio"></div>
      </div>
      <div class="form-row">
        <div class="field-group" style="flex:2"><label for="mb-demandado">Entidad demandada (banco / billetera virtual)</label><input type="text" id="mb-demandado" placeholder="Banco ..., CUIT ..."></div>
        <div class="field-group" style="flex:2"><label for="mb-domicilio-demandado">Domicilio de la demandada</label><input type="text" id="mb-domicilio-demandado"></div>
      </div>

      <div id="mb-campos-ciberestafa" class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del hecho — Ciberestafa</div>
      <div id="mb-grupo-ciberestafa">
        <div class="form-row">
          <div class="field-group"><label for="mb-fecha-hecho">Fecha del hecho</label><input type="date" id="mb-fecha-hecho"></div>
          <div class="field-group"><label for="mb-modalidad">Modalidad</label>
            <select id="mb-modalidad">${Object.entries(MODALIDADES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select>
          </div>
          <div class="field-group"><label for="mb-monto-afectado">Monto afectado ($)</label><input type="number" id="mb-monto-afectado"></div>
        </div>
        <div class="field-group">
          <label for="mb-relato-hecho">Relato breve del hecho (opcional)</label>
          <textarea id="mb-relato-hecho" rows="3" placeholder="Cómo se produjo el engaño / acceso no autorizado"></textarea>
        </div>
        <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-weight:500;margin-top:6px;font-size:.85rem">
          <input type="checkbox" id="mb-prestamo-no-solicitado"> Se solicitó un préstamo no consentido
        </label>
        <div class="field-group" id="mb-wrap-monto-prestamo" style="display:none;margin-top:6px">
          <label for="mb-monto-prestamo">Monto del préstamo no solicitado ($)</label><input type="number" id="mb-monto-prestamo">
        </div>
        <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-weight:500;margin-top:6px;font-size:.85rem">
          <input type="checkbox" id="mb-denuncia-penal" checked> Se formuló denuncia penal
        </label>
        <div class="field-group" id="mb-wrap-datos-denuncia" style="margin-top:6px">
          <label for="mb-datos-denuncia">N° de IPP / dependencia interviniente (opcional)</label><input type="text" id="mb-datos-denuncia">
        </div>
        <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-weight:500;margin-top:6px;font-size:.85rem">
          <input type="checkbox" id="mb-reclamo-previo-banco"> Se efectuó reclamo previo ante la entidad
        </label>
        <div class="field-group" id="mb-wrap-fecha-reclamo" style="display:none;margin-top:6px">
          <label for="mb-fecha-reclamo-previo">Fecha del reclamo previo</label><input type="date" id="mb-fecha-reclamo-previo">
        </div>
      </div>

      <div id="mb-campos-embargo" class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del hecho — Retención de haberes</div>
      <div id="mb-grupo-embargo">
        <div class="form-row">
          <div class="field-group"><label for="mb-sueldo-promedio">Sueldo promedio últimos 6 meses ($)</label><input type="number" id="mb-sueldo-promedio"></div>
          <div class="field-group"><label for="mb-saldo-retenido">Saldo retenido en la cuenta ($)</label><input type="number" id="mb-saldo-retenido"></div>
        </div>
        <div class="form-row">
          <div class="field-group"><label for="mb-remuneracion-bruta">Remuneración bruta mensual (opcional, para el cálculo del Dto. 484/87)</label><input type="number" id="mb-remuneracion-bruta"></div>
          <div class="field-group"><label for="mb-smvm">SMVM vigente ($)</label><input type="number" id="mb-smvm" value="${SMVM_DEFAULT}"></div>
        </div>
        <p style="font-size:.72rem;color:var(--color-muted);margin:-6px 0 10px">SMVM de referencia: $ ${fmt(SMVM_DEFAULT)}, vigente desde el 02/09/2026 (Resolución 4/2026, Consejo Nacional del Empleo, la Productividad y el SMVM). Verificar actualización antes de presentar; el campo es editable.</p>
        <p id="mb-calculo-embargo" style="font-size:.82rem;color:var(--color-muted);margin:0 0 10px"></p>
        <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-weight:500;margin-top:6px;font-size:.85rem">
          <input type="checkbox" id="mb-deuda-alimentaria"> La deuda que originó el embargo es de naturaleza alimentaria (cuota de alimentos / litis expensas)
        </label>
        <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-weight:500;margin-top:6px;font-size:.85rem">
          <input type="checkbox" id="mb-expediente-conocido"> Se conoce el expediente de origen del embargo
        </label>
        <div class="form-row" id="mb-wrap-expediente" style="display:none;margin-top:6px">
          <div class="field-group"><label for="mb-nro-expediente">N° de expediente</label><input type="text" id="mb-nro-expediente"></div>
          <div class="field-group" style="flex:2"><label for="mb-juzgado-origen">Juzgado de origen</label><input type="text" id="mb-juzgado-origen"></div>
        </div>
        <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-weight:500;margin-top:6px;font-size:.85rem">
          <input type="checkbox" id="mb-cedula-notificada"> Se notificó cédula de embargo a la actora
        </label>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Prueba a preservar (aseguramiento de pruebas)</div>
      <div id="mb-elementos-preservar">
        ${ELEMENTOS_PRESERVAR.map(e => `
          <div class="check-row">
            <input type="checkbox" id="mb-el-${e.id}" checked>
            <label for="mb-el-${e.id}">${e.label}</label>
          </div>`).join('')}
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Demanda de fondo (opcional)</div>
      <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-weight:500;font-size:.85rem">
        <input type="checkbox" id="mb-sumar-fondo"> Sumar, en subsidio y en la misma presentación, la demanda de fondo
      </label>
      <div id="mb-wrap-fondo" style="display:none;margin-top:8px">
        <div class="form-row">
          <div class="field-group"><label for="mb-monto-fondo">Monto estimado de la demanda de fondo ($, opcional)</label><input type="number" id="mb-monto-fondo"></div>
        </div>
        <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-weight:500;font-size:.85rem">
          <input type="checkbox" id="mb-danio-punitivo"> Incluir pedido de daño punitivo (art. 52 bis, Ley 24.240)
        </label>
      </div>

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:20px">
        <button class="btn btn-primary" id="mb-generar">Generar escrito</button>
        <button class="btn btn-ghost"   id="mb-limpiar">Limpiar</button>
      </div>

      <div id="mb-resultado" style="display:none;margin-top:24px">
        <label for="mb-texto" style="font-weight:600;display:block;margin-bottom:6px">Texto generado (editable)</label>
        <textarea id="mb-texto" rows="24" style="width:100%;resize:vertical;font-family:inherit;font-size:.9rem;padding:12px;border:1px solid var(--color-border);border-radius:6px;background:#ffffff;color:#1a1a1a;line-height:1.6"></textarea>
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px">
          <button class="btn btn-success" id="mb-copiar">📋 Copiar texto</button>
          <button class="btn btn-ghost"   id="mb-pdf">📄 Exportar PDF</button>
          <button class="btn btn-ghost"   id="mb-word">📝 Exportar Word</button>
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:24px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Reclamo administrativo previo (documento aparte)</div>
      <p style="font-size:.78rem;color:var(--color-muted);margin:0 0 10px">Genera una nota independiente dirigida al BCRA (Usuarios Financieros) y/o Defensa del Consumidor, útil como antecedente probatorio de mora y agotamiento de vía. No sustituye la vía judicial.</p>
      <div style="display:flex;flex-wrap:wrap;gap:10px">
        <button class="btn btn-ghost" id="mb-reclamo-admin">📄 Exportar PDF</button>
        <button class="btn btn-ghost" id="mb-reclamo-admin-word">📝 Exportar Word</button>
      </div>

      <p style="margin-top:24px;font-size:.78rem;color:var(--color-muted);border-top:1px solid var(--color-border);padding-top:12px">
        Escrito orientativo. Verificar en cada caso el fuero/juzgado competente, la vigencia de los valores del Salario Mínimo Vital y Móvil, y la jurisprudencia del fuero de destino antes de su presentación.
      </p>
    </div>`;

  // ── Referencias ────────────────────────────────────────────────────────────
  const selSupuesto = container.querySelector('#mb-supuesto');
  const selMedida = container.querySelector('#mb-medida');
  const hintMedida = container.querySelector('#mb-medida-hint');
  const selAbogado = container.querySelector('#mb-abogado-select');
  const emailNotifInput = container.querySelector('#mb-email-notificaciones');
  const grupoCiberestafaTitle = container.querySelector('#mb-campos-ciberestafa');
  const grupoCiberestafa = container.querySelector('#mb-grupo-ciberestafa');
  const grupoEmbargoTitle = container.querySelector('#mb-campos-embargo');
  const grupoEmbargo = container.querySelector('#mb-grupo-embargo');
  const chkSumarFondo = container.querySelector('#mb-sumar-fondo');
  const wrapFondo = container.querySelector('#mb-wrap-fondo');
  const divRes = container.querySelector('#mb-resultado');
  const textarea = container.querySelector('#mb-texto');
  let ultimoTextoGenerado = '';

  function val(id) { const el = container.querySelector(`#${id}`); return el ? el.value.trim() : ''; }
  function fmtFecha(iso) {
    if (!iso) return '';
    const p = iso.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
  }

  function poblarMedidas() {
    const supuesto = SUPUESTOS[selSupuesto.value];
    selMedida.innerHTML = supuesto.medidasDisponibles.map(k => `<option value="${k}">${MEDIDAS[k].label}</option>`).join('');
    selMedida.value = supuesto.medidaRecomendada({});
    actualizarHintMedida();
  }
  function actualizarHintMedida() {
    hintMedida.textContent = MEDIDAS[selMedida.value]?.cuando || '';
  }
  function actualizarCamposSupuesto() {
    const esCiber = selSupuesto.value === 'ciberestafa';
    grupoCiberestafaTitle.style.display = esCiber ? '' : 'none';
    grupoCiberestafa.style.display = esCiber ? '' : 'none';
    grupoEmbargoTitle.style.display = esCiber ? 'none' : '';
    grupoEmbargo.style.display = esCiber ? 'none' : '';
  }
  function actualizarCalculoEmbargo() {
    const sp = parseFloat(val('mb-sueldo-promedio')) || 0;
    const sr = parseFloat(val('mb-saldo-retenido')) || 0;
    const rb = parseFloat(val('mb-remuneracion-bruta')) || 0;
    const smvm = parseFloat(val('mb-smvm')) || 0;
    const alimentaria = container.querySelector('#mb-deuda-alimentaria').checked;
    const limite = sp * 3;
    const excedente = Math.max(0, sr - limite);
    const embargoDto = calcularEmbargoDto48487(rb, smvm);

    const partes = [];
    if (alimentaria) {
      partes.push('Deuda alimentaria: NO resultan aplicables los límites de embargabilidad de la Ley 26.704 ni del Dto. 484/87 (art. 147, LCT, in fine; art. 4°, Dto. 484/87). La cuota debe fijarse en un monto que permita la subsistencia del alimentante.');
    } else {
      if (sp) partes.push(`Ley 26.704 (3x sueldo promedio): límite inembargable $ ${fmt(limite)}. Excedente retenido a reclamar: $ ${fmt(excedente)}.`);
      if (rb && smvm) partes.push(`Dto. 484/87 (tope por remuneración, arts. 120/147 LCT): sobre remuneración bruta de $ ${fmt(rb)} y SMVM de $ ${fmt(smvm)}, la proporción embargable es del ${rb <= 2 * smvm ? '10%' : '20%'} del excedente, es decir, un máximo embargable por período de $ ${fmt(embargoDto)}.`);
    }
    container.querySelector('#mb-calculo-embargo').textContent = partes.join(' ');
  }

  selSupuesto.addEventListener('change', () => { poblarMedidas(); actualizarCamposSupuesto(); });
  selMedida.addEventListener('change', actualizarHintMedida);
  poblarMedidas();
  actualizarCamposSupuesto();

  function actualizarAbogado() {
    const a = ABOGADOS_BY_ID[selAbogado.value];
    if (!a) return;
    emailNotifInput.value = a.domicilioElectronico;
    container.querySelector('#mb-matricula').value = a.matricula;
  }
  selAbogado.addEventListener('change', actualizarAbogado);
  actualizarAbogado();

  container.querySelector('#mb-prestamo-no-solicitado').addEventListener('change', (e) => {
    container.querySelector('#mb-wrap-monto-prestamo').style.display = e.target.checked ? '' : 'none';
  });
  container.querySelector('#mb-reclamo-previo-banco').addEventListener('change', (e) => {
    container.querySelector('#mb-wrap-fecha-reclamo').style.display = e.target.checked ? '' : 'none';
  });
  container.querySelector('#mb-expediente-conocido').addEventListener('change', (e) => {
    container.querySelector('#mb-wrap-expediente').style.display = e.target.checked ? '' : 'none';
  });
  ['mb-sueldo-promedio', 'mb-saldo-retenido', 'mb-remuneracion-bruta', 'mb-smvm'].forEach(id => {
    container.querySelector(`#${id}`).addEventListener('input', actualizarCalculoEmbargo);
  });
  container.querySelector('#mb-deuda-alimentaria').addEventListener('change', actualizarCalculoEmbargo);
  chkSumarFondo.addEventListener('change', (e) => {
    wrapFondo.style.display = e.target.checked ? '' : 'none';
  });

  // ── Generar escrito ──────────────────────────────────────────────────────────
  container.querySelector('#mb-generar').addEventListener('click', () => {
    const supuesto = selSupuesto.value;
    const medida = selMedida.value;

    const d = {
      actor: val('mb-actor') || '[ACTOR]',
      dni: val('mb-dni') || '[DNI]',
      domicilio: val('mb-domicilio') || '[DOMICILIO REAL]',
      demandado: val('mb-demandado') || '[ENTIDAD DEMANDADA]',
      domicilio_demandado: val('mb-domicilio-demandado') || '[DOMICILIO DE LA DEMANDADA]',
      fecha_hecho: fmtFecha(val('mb-fecha-hecho')) || '[FECHA]',
      modalidad: val('mb-modalidad'),
      relato_hecho: val('mb-relato-hecho'),
      monto_afectado: val('mb-monto-afectado') || '0',
      prestamo_no_solicitado: container.querySelector('#mb-prestamo-no-solicitado').checked,
      monto_prestamo: val('mb-monto-prestamo'),
      denuncia_penal: container.querySelector('#mb-denuncia-penal').checked,
      datos_denuncia: val('mb-datos-denuncia'),
      reclamo_previo_banco: container.querySelector('#mb-reclamo-previo-banco').checked,
      fecha_reclamo_previo: fmtFecha(val('mb-fecha-reclamo-previo')),
      sueldo_promedio: val('mb-sueldo-promedio') || '0',
      saldo_retenido: val('mb-saldo-retenido') || '0',
      remuneracion_bruta: val('mb-remuneracion-bruta') || '0',
      smvm: val('mb-smvm') || String(SMVM_DEFAULT),
      deuda_alimentaria: container.querySelector('#mb-deuda-alimentaria').checked,
      expediente_conocido: container.querySelector('#mb-expediente-conocido').checked,
      nro_expediente: val('mb-nro-expediente'),
      juzgado_origen: val('mb-juzgado-origen'),
      cedula_notificada: container.querySelector('#mb-cedula-notificada').checked,
    };

    const excedente = Math.max(0, (parseFloat(d.saldo_retenido) || 0) - 3 * (parseFloat(d.sueldo_promedio) || 0));

    const abogadoSel = ABOGADOS_BY_ID[selAbogado.value];
    const matricula = val('mb-matricula') || abogadoSel.matricula;
    const abogadoTexto = `${abogadoSel.nombre}, ${abogadoSel.genero === 'M' ? 'abogado' : 'abogada'} (${matricula})`;
    const caracterLetradoTexto = val('mb-caracter-letrado') === 'apoderado' ? 'apoderado/a' : 'patrocinante';
    const juzgado = val('mb-juzgado');
    const domicilioProcesal = val('mb-domicilio-procesal') || '[DOMICILIO PROCESAL A CONSTITUIR]';
    const emailNotif = emailNotifInput.value.trim() || abogadoSel.domicilioElectronico;
    const contracautela = val('mb-contracautela') || 'Caución juratoria';

    const hechos = supuesto === 'ciberestafa' ? hechosCiberestafa(d) : hechosEmbargoExcesivo(d, excedente);
    const derecho = REQUISITOS_BASE[medida] + encuadreSupuesto(supuesto, d);

    const elementosActivos = ELEMENTOS_PRESERVAR.filter(e => container.querySelector(`#mb-el-${e.id}`).checked);
    const pruebaTexto = medida === 'aseguramiento_pruebas'
      ? `Se ofrece como prueba a preservar, en los términos del art. 326 del CPCC: ${elementosActivos.map(e => e.label).join('; ')}.`
      : `Se acompaña la documental que obra en poder de la parte actora (extractos bancarios, capturas de pantalla, constancias de denuncia y demás elementos vinculados al hecho relatado), sin perjuicio de la que se ofrezca oportunamente en el proceso principal.`;

    const sumarFondo = chkSumarFondo.checked;
    const montoFondo = val('mb-monto-fondo');
    const danioPunitivo = container.querySelector('#mb-danio-punitivo').checked;

    const bloqueFondo = sumarFondo ? `

VI. DEMANDA DE FONDO (EN SUBSIDIO)
Que, en subsidio y en la misma presentación, vengo a promover demanda de fondo contra ${d.demandado}, dando por reproducidos los hechos y el derecho invocados en los acápites que anteceden, por ${supuesto === 'ciberestafa' ? 'nulidad de la operación cuestionada y daños y perjuicios' : 'daños y perjuicios derivados de la retención indebida'}, por la suma de $ ${montoFondo ? fmt(montoFondo) : '[A DETERMINAR]'} y/o lo que en más o en menos resulte de la prueba a producirse, con más sus intereses y costas.${danioPunitivo ? ' Reclamo asimismo el daño punitivo previsto en el art. 52 bis de la Ley 24.240, en atención a la gravedad de la conducta de la demandada.' : ''}` : '';

    const numeroPetitorioFondo = sumarFondo ? `
${danioPunitivo ? '7' : '6'}) Se tenga por promovida, en subsidio, la demanda de fondo contra ${d.demandado} por la suma reclamada, con más sus intereses y costas.` : '';

    const texto =
`SEÑOR JUEZ${juzgado ? ` — ${juzgado}` : ''}:

${abogadoTexto}, en mi carácter de ${caracterLetradoTexto} de ${d.actor}, DNI ${d.dni}, con domicilio real en ${d.domicilio}, constituyendo domicilio procesal en ${domicilioProcesal} y domicilio electrónico en ${emailNotif} (art. 40, CPCC de la Provincia de Buenos Aires), a V.S. respetuosamente me presento y digo:

I. OBJETO
Que vengo por el presente a solicitar que ${objetoMedida(medida)} contra ${d.demandado}, con domicilio en ${d.domicilio_demandado}, ${medida === 'incidente_embargo' ? 'en los términos de los arts. 175 y ccdtes. y 203 y ccdtes. del CPCC' : 'en forma autónoma y previa a la interposición de la demanda de fondo que oportunamente se promoverá, dentro del plazo del art. 207 del CPCC'}, con más costas, en virtud de los hechos y el derecho que a continuación se exponen.

II. HECHOS
${hechos}

III. EL DERECHO
${derecho}

IV. PRUEBA
${pruebaTexto}

V. PETITORIO
Por lo expuesto, a V.S. solicito:
1) Me tenga por presentado, por parte y por constituido el domicilio procesal indicado.
2) ${petitorioMedida(medida, supuesto, d, excedente)}
3) Se tenga por ofrecida la contracautela consistente en: ${contracautela}.
4) Se tenga presente la prueba ofrecida.
5) Se tengan presentes las autorizaciones conferidas a ${TODOS_ABOGADOS_TEXTO} para compulsar el expediente, tomar vista de las actuaciones, retirar y diligenciar cédulas, oficios, mandamientos, testimonios y copias.${numeroPetitorioFondo}

PROVEER DE CONFORMIDAD,
SERÁ JUSTICIA.${bloqueFondo}

──────────────────────────────────────────────
Recordatorios previos a la presentación (no forman parte del escrito):
- Verificar el fuero/juzgado competente según el domicilio de la demandada y las reglas de competencia aplicables (Comercial/Federal si la entidad tiene domicilio en CABA; Civil y Comercial si corresponde a la Provincia de Buenos Aires).
- Verificar la vigencia del Salario Mínimo Vital y Móvil y del valor de referencia utilizado en el cálculo del límite de embargabilidad, si corresponde.
- Confirmar si el juzgado de destino exige contracautela real en lugar de caución juratoria.${medida === 'autosatisfactiva' ? '\n- Evaluar, según el fuero de destino, si conviene encuadrar el pedido directamente como "medida autosatisfactiva" o mantener el encuadre subsidiario en cautelar innovativa (ver advertencia en el acápite de derecho).' : ''}`;

    ultimoTextoGenerado = texto;
    textarea.value = texto;
    divRes.style.display = 'block';
    textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    textarea.dataset.titulo = `${MEDIDAS[medida].label} — ${SUPUESTOS[supuesto].label}`;
  });

  function hechosCiberestafa(d) {
    const modalidadTexto = MODALIDADES[d.modalidad] || d.modalidad;
    return `Que la parte actora, ${d.actor}, DNI ${d.dni}, es titular de la cuenta/caja de ahorro y/o usuaria de la plataforma de banca electrónica de ${d.demandado}. Que con fecha ${d.fecha_hecho}, mediante una maniobra de ${modalidadTexto}, terceros no identificados accedieron sin autorización a dicha plataforma y/o obtuvieron por engaño datos y/o claves de acceso de la actora.${d.relato_hecho ? ` ${d.relato_hecho}.` : ''} Que como consecuencia de dicha maniobra${d.prestamo_no_solicitado ? ` se solicitó, sin consentimiento de la actora, un préstamo por la suma de $ ${fmt(d.monto_prestamo)}, y` : ''} se produjo una afectación patrimonial por la suma de $ ${fmt(d.monto_afectado)}, sin que mediara consentimiento, autorización ni orden alguna de la parte actora. Que la actora no realizó la operación cuestionada, no autorizó a terceros a realizarla en su nombre, y desconoce a los autores de la maniobra. ${d.denuncia_penal ? `Que la actora formuló denuncia penal por el hecho relatado${d.datos_denuncia ? ` (${d.datos_denuncia})` : ''}, acompañándose como documental la constancia respectiva.` : 'Que la actora se encuentra formulando la pertinente denuncia penal por el hecho relatado.'} ${d.reclamo_previo_banco ? `Que con fecha ${d.fecha_reclamo_previo || '[FECHA]'} la actora efectuó el reclamo pertinente ante la entidad demandada, sin obtener a la fecha una respuesta que restituya la situación patrimonial previa al hecho.` : 'Que la actora no ha obtenido de la entidad demandada una respuesta que restituya la situación patrimonial previa al hecho, pese a las gestiones informales realizadas.'} Que la demandada, en su carácter de entidad financiera profesional, reviste la calidad de proveedora en los términos de los arts. 1 y 2 de la Ley 24.240, y sobre ella pesa un deber de seguridad agravado respecto de los sistemas de banca electrónica que ella misma diseña, implementa y explota (arts. 5 y 40, Ley 24.240; art. 1757 y ccdtes., CCyC).`;
  }

  function hechosEmbargoExcesivo(d, excedente) {
    const sp = parseFloat(d.sueldo_promedio) || 0;
    const sr = parseFloat(d.saldo_retenido) || 0;
    const limite = sp * 3;
    const rb = parseFloat(d.remuneracion_bruta) || 0;
    const smvm = parseFloat(d.smvm) || 0;
    const embargoDto = calcularEmbargoDto48487(rb, smvm);

    const parrafoLimites = d.deuda_alimentaria
      ? `Que si bien la deuda que dio origen a la retención cuestionada reviste naturaleza alimentaria, circunstancia por la cual no resultan aplicables al caso los límites de embargabilidad de la Ley 26.704 ni del Decreto 484/87 (art. 147, LCT, in fine; art. 4°, Dto. 484/87), la cuota debe en todo caso ser fijada y mantenida dentro de un monto que permita la subsistencia de la actora, en su carácter de alimentante, conforme lo dispone el propio art. 147 de la Ley de Contrato de Trabajo.`
      : `Que dicha cuenta reviste el carácter de "cuenta sueldo" en los términos de la Ley 26.704, motivo por el cual resulta inembargable hasta el monto equivalente a tres (3) veces dicho promedio, es decir, hasta la suma de $ ${fmt(limite)}.${(rb && smvm) ? ` Que, asimismo, conforme los arts. 120 y 147 de la Ley de Contrato de Trabajo y su decreto reglamentario N° 484/87, la remuneración de la actora —de $ ${fmt(rb)} brutos mensuales— resulta inembargable hasta la concurrencia del Salario Mínimo Vital y Móvil (de $ ${fmt(smvm)}), siendo embargable únicamente el excedente en la proporción del ${rb <= 2 * smvm ? 'diez por ciento (10%)' : 'veinte por ciento (20%)'} (art. 1°, Dto. 484/87), lo que arroja un máximo embargable por período de $ ${fmt(embargoDto)}.` : ''} Que la retención cuestionada excede en autos los límites legales referidos, los que resultan de aplicación concurrente.`;

    return `Que la parte actora, ${d.actor}, DNI ${d.dni}, percibe sus haberes mediante acreditación en la cuenta sueldo que mantiene en ${d.demandado}, con un promedio de remuneración de los últimos seis (6) meses de $ ${fmt(sp)}. ${parrafoLimites} Que no obstante ello, la entidad demandada trabó y/o mantiene trabada una retención sobre el saldo de la cuenta por la suma de $ ${fmt(sr)}${!d.deuda_alimentaria ? `, superando el límite legal de inembargabilidad en la suma de $ ${fmt(excedente)}` : ''}. ${d.expediente_conocido ? `Que dicha retención fue ordenada en los autos en trámite ante ${d.juzgado_origen || '[JUZGADO DE ORIGEN]'}${d.nro_expediente ? ` (Expte. N° ${d.nro_expediente})` : ''}.` : 'Que la actora no ha podido individualizar el expediente y/o la orden judicial que habría dado origen a la retención cuestionada.'} ${d.cedula_notificada ? 'Que la retención le fue notificada mediante cédula, la cual se acompaña como documental.' : 'Que la retención no le fue notificada formalmente a la actora mediante cédula.'} Que la retención de una suma superior al límite legal afecta directamente la posibilidad de la actora de afrontar sus gastos de subsistencia y los de su grupo familiar.`;
  }

  container.querySelector('#mb-limpiar').addEventListener('click', () => {
    ['mb-actor', 'mb-dni', 'mb-domicilio', 'mb-demandado', 'mb-domicilio-demandado', 'mb-fecha-hecho', 'mb-relato-hecho', 'mb-monto-afectado', 'mb-monto-prestamo', 'mb-datos-denuncia', 'mb-fecha-reclamo-previo', 'mb-sueldo-promedio', 'mb-saldo-retenido', 'mb-remuneracion-bruta', 'mb-nro-expediente', 'mb-juzgado-origen', 'mb-domicilio-procesal', 'mb-monto-fondo'].forEach(id => {
      const el = container.querySelector(`#${id}`); if (el) el.value = '';
    });
    container.querySelector('#mb-juzgado').value = 'Juzgado de Primera Instancia en lo Civil y Comercial N° __ del Departamento Judicial de ___, Provincia de Buenos Aires';
    container.querySelector('#mb-contracautela').value = 'Caución juratoria';
    container.querySelector('#mb-smvm').value = SMVM_DEFAULT;
    container.querySelector('#mb-deuda-alimentaria').checked = false;
    container.querySelector('#mb-prestamo-no-solicitado').checked = false;
    container.querySelector('#mb-wrap-monto-prestamo').style.display = 'none';
    container.querySelector('#mb-denuncia-penal').checked = true;
    container.querySelector('#mb-reclamo-previo-banco').checked = false;
    container.querySelector('#mb-wrap-fecha-reclamo').style.display = 'none';
    container.querySelector('#mb-expediente-conocido').checked = false;
    container.querySelector('#mb-wrap-expediente').style.display = 'none';
    container.querySelector('#mb-cedula-notificada').checked = false;
    container.querySelector('#mb-calculo-embargo').textContent = '';
    ELEMENTOS_PRESERVAR.forEach(e => { container.querySelector(`#mb-el-${e.id}`).checked = true; });
    chkSumarFondo.checked = false;
    wrapFondo.style.display = 'none';
    container.querySelector('#mb-danio-punitivo').checked = false;
    selSupuesto.selectedIndex = 0;
    poblarMedidas();
    actualizarCamposSupuesto();
    selAbogado.selectedIndex = 0;
    actualizarAbogado();
    divRes.style.display = 'none';
    textarea.value = '';
    ultimoTextoGenerado = '';
  });

  container.querySelector('#mb-copiar').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const btn = container.querySelector('#mb-copiar');
    navigator.clipboard.writeText(texto).then(() => {
      const orig = btn.textContent;
      btn.textContent = 'Copiado ✓';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => { prompt('Copie el texto:', texto); });
  });

  container.querySelector('#mb-pdf').addEventListener('click', () => {
    if (!ultimoTextoGenerado) return;
    const html = `<div class="info-box" style="white-space:pre-wrap;font-family:inherit">${escHtml(textarea.value)}</div>`;
    exportarPDF(textarea.dataset.titulo || 'Medida Cautelar / Urgente', html);
  });
  container.querySelector('#mb-word').addEventListener('click', () => {
    if (!ultimoTextoGenerado) return;
    const html = textarea.value.split('\n').map(l => `<p>${escHtml(l) || '&nbsp;'}</p>`).join('');
    exportarWord(textarea.dataset.titulo || 'Medida Cautelar Bancaria', html);
  });

  // ── Reclamo administrativo previo (documento aparte) ───────────────────────
  function datosReclamoAdmin() {
    const supuesto = selSupuesto.value;
    const actor = val('mb-actor') || '[ACTOR]';
    const dni = val('mb-dni') || '[DNI]';
    const demandado = val('mb-demandado') || '[ENTIDAD]';
    const abogadoSel = ABOGADOS_BY_ID[selAbogado.value];
    const matricula = val('mb-matricula') || abogadoSel.matricula;

    const destinatario = supuesto === 'ciberestafa'
      ? 'Gerencia de Protección al Usuario de Servicios Financieros — Banco Central de la República Argentina (BCRA), y/o Autoridad de Aplicación de Defensa del Consumidor que corresponda'
      : 'Gerencia de Protección al Usuario de Servicios Financieros — Banco Central de la República Argentina (BCRA)';

    const cuerpo = supuesto === 'ciberestafa'
      ? `Me dirijo a Uds. en mi carácter de letrado ${val('mb-caracter-letrado') === 'apoderado' ? 'apoderado' : 'patrocinante'} de ${actor}, DNI ${dni}, a fin de formular RECLAMO ADMINISTRATIVO PREVIO contra ${demandado}, en virtud de haber sido mi mandante/patrocinada víctima de una maniobra de fraude informático (ciberestafa bancaria) que afectó fondos de su titularidad y/o dio lugar a la contratación no consentida de un préstamo, sin que la entidad haya restituido a la fecha la situación patrimonial previa al hecho. Se deja constancia de que, conforme la Comunicación "A" 8280 del BCRA, la entidad se encuentra obligada a gestionar y reportar los ciberincidentes que afecten a sus clientes, sin que ello la releve de su responsabilidad civil frente al usuario damnificado. Se solicita: 1) la restitución íntegra de los fondos afectados y/o la anulación del préstamo no consentido; 2) el cese de todo reporte de mi mandante/patrocinada en centrales de riesgo crediticio vinculado al hecho relatado; y 3) se informe el estado del trámite en un plazo no mayor a diez (10) días hábiles, bajo apercibimiento de iniciar las acciones judiciales que por derecho correspondan. Se acompaña la documentación respaldatoria del reclamo.`
      : `Me dirijo a Uds. en mi carácter de letrado ${val('mb-caracter-letrado') === 'apoderado' ? 'apoderado' : 'patrocinante'} de ${actor}, DNI ${dni}, a fin de formular RECLAMO ADMINISTRATIVO PREVIO contra ${demandado}, en virtud de haber retenido dicha entidad, sobre la cuenta sueldo de mi mandante/patrocinada, una suma que excede el límite legal de inembargabilidad establecido por el art. 2 de la Ley 26.704 (tres veces el promedio de haberes de los últimos seis meses). Se solicita: 1) la inmediata desafectación y restitución del monto retenido en exceso de dicho límite; 2) se informe la orden judicial y el expediente que habría dado origen a la retención, de existir; y 3) se informe el estado del trámite en un plazo no mayor a diez (10) días hábiles, bajo apercibimiento de iniciar las acciones judiciales que por derecho correspondan. Se acompaña la documentación respaldatoria del reclamo (recibos de sueldo y extractos bancarios del período involucrado).`;

    const firmaTexto = `${abogadoSel.nombre}, ${abogadoSel.genero === 'M' ? 'abogado' : 'abogada'} (${matricula})`;
    return { destinatario, cuerpo, firmaTexto };
  }

  container.querySelector('#mb-reclamo-admin').addEventListener('click', () => {
    const { destinatario, cuerpo, firmaTexto } = datosReclamoAdmin();
    const html = `
      <div class="info-box"><strong>Destinatario:</strong> ${escHtml(destinatario)}</div>
      <div class="info-box" style="white-space:pre-wrap">${escHtml(cuerpo)}</div>
      <p class="nota">${escHtml(firmaTexto)}</p>
    `;
    exportarPDF('Reclamo Administrativo Previo — BCRA / Defensa del Consumidor', html);
  });

  container.querySelector('#mb-reclamo-admin-word').addEventListener('click', () => {
    const { destinatario, cuerpo, firmaTexto } = datosReclamoAdmin();
    const html = `
      <p><strong>Destinatario:</strong> ${escHtml(destinatario)}</p>
      ${cuerpo.split('\n').map(l => `<p>${escHtml(l) || '&nbsp;'}</p>`).join('')}
      <p>${escHtml(firmaTexto)}</p>
    `;
    exportarWord('Reclamo Administrativo Previo — BCRA - Defensa del Consumidor', html);
  });

  function escHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── Prefill desde Minutas de Caso ────────────────────────────────────────
  (function prefillDesdeMinutas() {
    let payload;
    try { payload = JSON.parse(localStorage.getItem('mvc_prefill_medidas_bancarias') || 'null'); } catch { payload = null; }
    if (!payload || !payload.campos) return;

    const banner = document.createElement('div');
    banner.style.cssText = 'background:#e8f4ea;border:1px solid #7ab88a;border-radius:6px;padding:12px 14px;margin-bottom:16px;font-size:.85rem;color:#1f4d2c;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap';
    banner.innerHTML = `
      <span>📋 Hay datos de una minuta cargados el ${payload.fecha || ''} — ¿los cargamos en este formulario?</span>
      <span style="display:flex;gap:8px">
        <button class="btn btn-success" id="mb-prefill-cargar" type="button">Cargar</button>
        <button class="btn btn-ghost" id="mb-prefill-descartar" type="button">Descartar</button>
      </span>`;
    container.querySelector('.tool-card').insertBefore(banner, container.querySelector('.tool-card').children[1]);

    banner.querySelector('#mb-prefill-cargar').addEventListener('click', () => {
      if (payload.supuesto && SUPUESTOS[payload.supuesto]) {
        selSupuesto.value = payload.supuesto;
        poblarMedidas();
        actualizarCamposSupuesto();
      }
      if (payload.medida && MEDIDAS[payload.medida]) selMedida.value = payload.medida;
      actualizarHintMedida();
      Object.entries(payload.campos).forEach(([id, valor]) => {
        const el = container.querySelector(`#mb-${id}`);
        if (el && valor) el.value = valor;
      });
      if (payload.checks) {
        Object.entries(payload.checks).forEach(([id, valor]) => {
          const el = container.querySelector(`#mb-${id}`);
          if (el && valor) { el.checked = true; el.dispatchEvent(new Event('change')); }
        });
      }
      actualizarCalculoEmbargo();
      localStorage.removeItem('mvc_prefill_medidas_bancarias');
      banner.remove();
    });
    banner.querySelector('#mb-prefill-descartar').addEventListener('click', () => {
      localStorage.removeItem('mvc_prefill_medidas_bancarias');
      banner.remove();
    });
  })();
}
