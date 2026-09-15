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

  function encuadreSupuesto(supuesto) {
    if (supuesto === 'ciberestafa') {
      return ' En el caso de autos, la verosimilitud del derecho surge de la denuncia penal formulada, de los extractos y constancias bancarias acompañadas, y de la ausencia de consentimiento de la parte actora para la operación cuestionada; el peligro en la demora surge de la afectación patrimonial ya producida y/o del riesgo cierto de que continúe devengándose el débito de cuotas sobre haberes de naturaleza alimentaria. La entidad demandada reviste la calidad de proveedora profesional de servicios financieros (arts. 1, 2 y 5, Ley 24.240), sobre quien pesa un deber de seguridad agravado respecto del sistema de banca electrónica que ella misma diseña, implementa y explota, y que —conforme los lineamientos de la Comunicación "A" 8280 del BCRA— se encuentra obligada a gestionar y reportar los ciberincidentes que afecten a sus clientes, sin perjuicio de que dicha normativa no releva a la entidad de su responsabilidad civil frente al usuario. La condición de consumidor de la parte actora impone, además, la aplicación del principio in dubio pro consumidor (art. 3, Ley 24.240) en la valoración de los extremos invocados.';
    }
    return ' En el caso de autos, la verosimilitud del derecho surge del límite de inembargabilidad establecido por el art. 2 de la Ley 26.704 —tres (3) veces el promedio de haberes de los últimos seis (6) meses— y de la constancia de que el saldo retenido excede dicho límite; el peligro en la demora surge de la afectación actual a la disponibilidad de fondos de naturaleza alimentaria, indispensables para la subsistencia de la parte actora y su grupo familiar. Resulta asimismo de aplicación, en lo pertinente, el régimen de embargabilidad de remuneraciones del art. 120 de la Ley de Contrato de Trabajo y su decreto reglamentario N° 484/87, en cuanto fijan como tope el 10% o el 20% del excedente del Salario Mínimo Vital y Móvil según el tramo de que se trate.';
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
    switch (medida) {
      case 'no_innovar':
        return `Se decrete la MEDIDA CAUTELAR DE NO INNOVAR, ordenando a ${d.demandado} que se abstenga de debitar, reclamar, informar en centrales de riesgo crediticio y/o ejecutar por cualquier vía la suma cuestionada${d.monto_prestamo ? ` y/o las cuotas del préstamo por $ ${fmt(d.monto_prestamo)}` : ''}, hasta tanto recaiga sentencia firme en el proceso principal a promoverse.`;
      case 'innovativa':
        return supuesto === 'ciberestafa'
          ? `Se decrete la MEDIDA CAUTELAR INNOVATIVA, ordenando a ${d.demandado} que restituya a la actora la suma de $ ${fmt(d.monto_afectado)} indebidamente sustraída/debitada, se abstenga de reclamar y/o ejecutar el préstamo no solicitado, y cese en el reporte de la actora en centrales de riesgo crediticio, hasta tanto recaiga sentencia firme en el proceso principal a promoverse.`
          : `Se decrete la MEDIDA CAUTELAR INNOVATIVA, ordenando a ${d.demandado} que desafecte y restituya de inmediato la suma de $ ${fmt(excedente)}, retenida en exceso del límite legal de inembargabilidad (art. 2, Ley 26.704), reintegrándola a la cuenta de la actora, hasta tanto recaiga sentencia firme en el proceso principal a promoverse.`;
      case 'autosatisfactiva':
        return supuesto === 'ciberestafa'
          ? `Se decrete, con carácter de urgente y, en subsidio, como medida cautelar innovativa de tramitación urgente, la orden a ${d.demandado} de restituir de manera inmediata la suma de $ ${fmt(d.monto_afectado)} y abstenerse de reclamar y/o ejecutar el préstamo no solicitado, habilitándose días y horas inhábiles (art. 153, CPCC) en atención a la urgencia invocada.`
          : `Se decrete, con carácter de urgente y, en subsidio, como medida cautelar innovativa de tramitación urgente, la orden a ${d.demandado} de desafectar y restituir de manera inmediata la suma de $ ${fmt(excedente)} retenida en exceso del límite legal de inembargabilidad, habilitándose días y horas inhábiles (art. 153, CPCC) en atención a la urgencia invocada.`;
      case 'aseguramiento_pruebas':
        return `Se decrete la producción de PRUEBA ANTICIPADA (art. 326, CPCC), ordenando a ${d.demandado} y/o a los proveedores de servicios de comunicaciones que correspondan la preservación y posterior remisión de los elementos individualizados en el punto de prueba, bajo apercibimiento de lo dispuesto por el art. 388 del Código Civil y Comercial de la Nación.`;
      case 'incidente_embargo':
        return `Se haga lugar al presente incidente y se ordene el LEVANTAMIENTO PARCIAL del embargo trabado sobre la cuenta de titularidad de la actora en ${d.demandado}, limitándolo al monto que resulte embargable conforme el art. 2 de la Ley 26.704 (hasta 3 veces el promedio de haberes de los últimos 6 meses), ordenando la inmediata desafectación y restitución de la suma retenida en exceso ($ ${fmt(excedente)}).`;
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
        <p id="mb-calculo-embargo" style="font-size:.82rem;color:var(--color-muted);margin:0 0 10px"></p>
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
      <button class="btn btn-ghost" id="mb-reclamo-admin">📄 Generar reclamo administrativo (PDF)</button>

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
    const limite = sp * 3;
    const excedente = Math.max(0, sr - limite);
    container.querySelector('#mb-calculo-embargo').textContent = sp
      ? `Límite de inembargabilidad (art. 2, Ley 26.704 — 3x sueldo promedio): $ ${fmt(limite)}. Excedente retenido a reclamar: $ ${fmt(excedente)}.`
      : '';
  }

  selSupuesto.addEventListener('change', () => { poblarMedidas(); actualizarCamposSupuesto(); });
  selMedida.addEventListener('change', actualizarHintMedida);
  poblarMedidas();
  actualizarCamposSupuesto();

  selAbogado.addEventListener('change', () => {
    emailNotifInput.value = ABOGADOS_BY_ID[selAbogado.value].domicilioElectronico;
  });
  emailNotifInput.value = ABOGADOS_BY_ID[selAbogado.value].domicilioElectronico;

  container.querySelector('#mb-prestamo-no-solicitado').addEventListener('change', (e) => {
    container.querySelector('#mb-wrap-monto-prestamo').style.display = e.target.checked ? '' : 'none';
  });
  container.querySelector('#mb-reclamo-previo-banco').addEventListener('change', (e) => {
    container.querySelector('#mb-wrap-fecha-reclamo').style.display = e.target.checked ? '' : 'none';
  });
  container.querySelector('#mb-expediente-conocido').addEventListener('change', (e) => {
    container.querySelector('#mb-wrap-expediente').style.display = e.target.checked ? '' : 'none';
  });
  ['mb-sueldo-promedio', 'mb-saldo-retenido'].forEach(id => {
    container.querySelector(`#${id}`).addEventListener('input', actualizarCalculoEmbargo);
  });
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
    const derecho = REQUISITOS_BASE[medida] + encuadreSupuesto(supuesto);

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
    return `Que la parte actora, ${d.actor}, DNI ${d.dni}, percibe sus haberes mediante acreditación en la cuenta sueldo que mantiene en ${d.demandado}, con un promedio de remuneración de los últimos seis (6) meses de $ ${fmt(sp)}. Que dicha cuenta reviste el carácter de "cuenta sueldo" en los términos de la Ley 26.704, motivo por el cual resulta inembargable hasta el monto equivalente a tres (3) veces dicho promedio, es decir, hasta la suma de $ ${fmt(limite)}. Que no obstante ello, la entidad demandada trabó y/o mantiene trabada una retención sobre el saldo de la cuenta por la suma de $ ${fmt(sr)}, superando el límite legal de inembargabilidad en la suma de $ ${fmt(excedente)}. ${d.expediente_conocido ? `Que dicha retención fue ordenada en los autos en trámite ante ${d.juzgado_origen || '[JUZGADO DE ORIGEN]'}${d.nro_expediente ? ` (Expte. N° ${d.nro_expediente})` : ''}.` : 'Que la actora no ha podido individualizar el expediente y/o la orden judicial que habría dado origen a la retención cuestionada.'} ${d.cedula_notificada ? 'Que la retención le fue notificada mediante cédula, la cual se acompaña como documental.' : 'Que la retención no le fue notificada formalmente a la actora mediante cédula.'} Que la retención de una suma superior al límite legal afecta directamente la posibilidad de la actora de afrontar sus gastos de subsistencia y los de su grupo familiar.`;
  }

  container.querySelector('#mb-limpiar').addEventListener('click', () => {
    ['mb-actor', 'mb-dni', 'mb-domicilio', 'mb-demandado', 'mb-domicilio-demandado', 'mb-fecha-hecho', 'mb-relato-hecho', 'mb-monto-afectado', 'mb-monto-prestamo', 'mb-datos-denuncia', 'mb-fecha-reclamo-previo', 'mb-sueldo-promedio', 'mb-saldo-retenido', 'mb-nro-expediente', 'mb-juzgado-origen', 'mb-domicilio-procesal', 'mb-monto-fondo'].forEach(id => {
      const el = container.querySelector(`#${id}`); if (el) el.value = '';
    });
    container.querySelector('#mb-juzgado').value = 'Juzgado de Primera Instancia en lo Civil y Comercial N° __ del Departamento Judicial de ___, Provincia de Buenos Aires';
    container.querySelector('#mb-contracautela').value = 'Caución juratoria';
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
    emailNotifInput.value = ABOGADOS_BY_ID[selAbogado.value].domicilioElectronico;
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
  container.querySelector('#mb-reclamo-admin').addEventListener('click', () => {
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

    const html = `
      <div class="info-box"><strong>Destinatario:</strong> ${escHtml(destinatario)}</div>
      <div class="info-box" style="white-space:pre-wrap">${escHtml(cuerpo)}</div>
      <p class="nota">${escHtml(`${abogadoSel.nombre}, ${abogadoSel.genero === 'M' ? 'abogado' : 'abogada'} (${matricula})`)}</p>
    `;
    exportarPDF('Reclamo Administrativo Previo — BCRA / Defensa del Consumidor', html);
  });

  function escHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
