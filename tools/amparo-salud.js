// Generador de Acción de Amparo por Derecho a la Salud con Medida Cautelar
// Fundamento transversal: art. 43 CN; Ley 16.986 (amparo); art. 230 y ccdtes. CPCCN (medida cautelar).
// Fuente de la sistematización de supuestos: Compendio de Jurisprudencia de la CSJN "Derecho a la
// Salud" (Secretaría de Jurisprudencia, 2025) y Casoteca "Derecho a la Salud" (Escuela de la Defensa
// Pública, MPD, dic. 2024).
//
// IMPORTANTE — herramienta en versión inicial: el trámite específico ante el fuero PROVINCIAL de la
// Provincia de Buenos Aires (Ley 13.928, Ley de Amparo de la Pcia. de Bs. As.) NO fue investigado en
// esta versión; el escrito se funda en el estándar nacional (Ley 16.986 y jurisprudencia de la CSJN).
// Cuando el caso tramite ante fuero provincial, VERIFICAR plazos y trámite de la Ley 13.928 antes de
// presentar. Del mismo modo, los fundamentos específicos de TRHA, salud mental, HIV, cannabis
// medicinal, trasplante, migrantes y ART se dejan enunciados a nivel de ley general: revisar artículos
// puntuales antes de presentar.
import { exportarPDF, exportarWord } from './exportar.js';

export function initAmparoSalud(container) {

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

  // ── Fundamento común (transversal a todas las materias) ────────────────
  const FUNDAMENTO_COMUN = `La tutela del derecho a la salud es una manda consagrada por la Constitución Nacional (arts. 42 y 75, inc. 22) y por los tratados internacionales con jerarquía constitucional (art. 12 del Pacto Internacional de Derechos Económicos, Sociales y Culturales; arts. 4 y 5 de la Convención Americana sobre Derechos Humanos), que implica la obligación impostergable del Estado y de los demás sujetos obligados de garantizarlo mediante acciones positivas (CSJN, Fallos: 345:549; 344:1557; 330:4160). El derecho a la salud, máxime cuando se trata de enfermedades graves, está íntimamente relacionado con el derecho a la vida, primer derecho de la persona humana reconocido por la Constitución Nacional (Fallos: 329:4918; 329:1638).`;

  const PROCEDENCIA_AMPARO = `La vía del amparo (art. 43, Constitución Nacional; Ley 16.986) resulta particularmente pertinente cuando se trata de la preservación de la salud y la integridad psicofísica, siendo el procedimiento judicial más simple y breve para tutelar real y verdaderamente los derechos consagrados en la Ley Fundamental (CSJN, Fallos: 336:2333; 329:2552). Frente a un grave problema de salud, no cabe extremar la aplicación del principio según el cual el amparo no procede cuando el afectado tiene a su alcance una vía administrativa u ordinaria a la cual acudir, pues los propios valores en juego y la urgencia normalmente presente en el caso se contraponen al ejercicio de soluciones de esa índole (Fallos: 330:4647; 332:1394). Corresponde a los jueces buscar soluciones que se avengan con la urgencia que conllevan las pretensiones vinculadas al derecho a la salud, encauzando los trámites por vías expeditivas y evitando que el rigor de las formas conduzca a la frustración de derechos que cuentan con tutela de orden constitucional (Fallos: 331:563; 329:4918).`;

  const CAUTELAR_ESTANDAR = `Como resulta de la naturaleza de las medidas cautelares, ellas no exigen el examen de certeza sobre la existencia del derecho pretendido, sino solo de su verosimilitud, bastando la comprobación de la apariencia o verosimilitud del derecho invocado y la posibilidad de que, ante la falta de tutela inmediata, se produzcan perjuicios irreparables (CSJN, Fallos: 326:4981; 326:4572; 324:2042). En materia de derecho a la salud, dicho estándar se atenúa aún más en atención a la gravedad e irreversibilidad del daño que la demora ocasionaría a la vida y la integridad física de la parte actora (Fallos: 334:1691; 326:2906).`;

  // ── Materias (demandado) y tipos (objeto de la pretensión) ─────────────

  function tipoMedicamentoAltoCosto(fundamentoEspecifico) {
    return {
      label: 'Cobertura de medicamento de alto costo / enfermedad poco frecuente',
      requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','diagnostico','tratamiento_prescripto','fecha_solicitud','fecha_negativa','riesgo_salud'],
      opcionales: ['numero_afiliado','edad','medico_tratante','fecha_prescripcion','forma_negativa','monto_tratamiento'],
      hechos: d => `Que la parte actora padece ${d.diagnostico}, por lo cual ${d.medico_tratante ? `su médico tratante, Dr./Dra. ${d.medico_tratante},` : 'el equipo médico tratante'} le prescribió${d.fecha_prescripcion ? ` con fecha ${d.fecha_prescripcion}` : ''} el siguiente tratamiento/medicación: ${d.tratamiento_prescripto}. Que con fecha ${d.fecha_solicitud} se solicitó a la demandada la cobertura integral de dicho tratamiento${d.monto_tratamiento ? `, cuyo costo asciende a $ ${d.monto_tratamiento}` : ''}, la cual fue denegada con fecha ${d.fecha_negativa}${d.forma_negativa ? `, invocando como fundamento: ${d.forma_negativa}` : ''}. Que la falta de cobertura pone en grave riesgo la salud y la vida de la parte actora, toda vez que ${d.riesgo_salud}.`,
      derecho: () => `${fundamentoEspecifico} Asimismo, la circunstancia de que un tratamiento no se encuentre expresamente excluido de la cobertura no autoriza a interpretar que ello importa su exclusión; el derecho a obtener conveniente y oportuna asistencia sanitaria se vería frustrado si se admitiera una referencia histórica al estado del conocimiento médico existente al momento de fijarse los términos de la cobertura, privando a la actora de los adelantos terapéuticos que incorpora el progreso científico (CSJN, Fallos: 337:471; 325:677).`,
    };
  }

  function tipoCoberturaNoPmo(fundamentoEspecifico) {
    return {
      label: 'Cobertura de práctica, cirugía o tratamiento no incluido en el PMO',
      requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','diagnostico','tratamiento_prescripto','fecha_solicitud','fecha_negativa','riesgo_salud'],
      opcionales: ['numero_afiliado','edad','medico_tratante','fecha_prescripcion','forma_negativa','monto_tratamiento'],
      hechos: d => `Que la parte actora padece ${d.diagnostico}, requiriendo la práctica/tratamiento consistente en ${d.tratamiento_prescripto}, prescripto${d.medico_tratante ? ` por su médico tratante, Dr./Dra. ${d.medico_tratante},` : ''}${d.fecha_prescripcion ? ` con fecha ${d.fecha_prescripcion}` : ''}. Que con fecha ${d.fecha_solicitud} se solicitó su cobertura a la demandada, quien la denegó con fecha ${d.fecha_negativa} invocando${d.forma_negativa ? ` que ${d.forma_negativa}` : ' que la prestación no se encuentra incluida en el Programa Médico Obligatorio (PMO)'}. Que la falta de cobertura pone en grave riesgo la salud de la parte actora, toda vez que ${d.riesgo_salud}.`,
      derecho: () => `${fundamentoEspecifico} Si bien los anexos del Programa Médico Obligatorio establecen una cobertura mínima, tales especificaciones resultan complementarias y subsidiarias, debiendo interpretarse en razonable armonía con el principio general de acceso a los bienes y servicios básicos para la conservación de la salud (CSJN, Fallos: S. 670. XLII, "Sánchez", 15/05/2007; 329:1638), sin que el enfoque restrictivo del PMO pueda vedar el acceso a una terapéutica más moderna y segura cuando ello somete al paciente a un mayor riesgo (Fallos: 337:471).`,
    };
  }

  function tipoDiscapacidad(fundamentoEspecifico) {
    return {
      label: 'Prestaciones por discapacidad (Ley 24.901)',
      requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','diagnostico','tratamiento_prescripto','fecha_solicitud','fecha_negativa','riesgo_salud'],
      opcionales: ['numero_afiliado','edad','certificado_discapacidad','fecha_prescripcion','forma_negativa'],
      hechos: d => `Que la parte actora${d.certificado_discapacidad ? `, titular del Certificado Único de Discapacidad ${d.certificado_discapacidad},` : ', persona con discapacidad,'} padece ${d.diagnostico}, requiriendo la prestación consistente en ${d.tratamiento_prescripto}. Que con fecha ${d.fecha_solicitud} se solicitó dicha prestación a la demandada, quien la denegó con fecha ${d.fecha_negativa}${d.forma_negativa ? `, argumentando que ${d.forma_negativa}` : ''}. Que la falta de la prestación requerida pone en grave riesgo la salud, la integración social y el desarrollo de la parte actora, toda vez que ${d.riesgo_salud}.`,
      derecho: () => `Fundo el presente en la Ley 24.901, que instituye un sistema de prestaciones básicas de atención integral a favor de las personas con discapacidad, así como en la Convención sobre los Derechos de las Personas con Discapacidad (ley 26.378, jerarquía constitucional conforme ley 27.044). ${fundamentoEspecifico} La protección y asistencia integral a la discapacidad constituye una política pública que no admite interpretaciones restrictivas que conduzcan a resultados regresivos en la satisfacción de los derechos fundamentales de las personas con discapacidad (CSJN, Fallos: 343:848; 327:2413).`,
    };
  }

  function tipoSaludMental() {
    return {
      label: 'Salud mental — tratamiento, internación o acompañamiento terapéutico (Ley 26.657)',
      requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','diagnostico','tratamiento_prescripto','fecha_solicitud','fecha_negativa','riesgo_salud'],
      opcionales: ['numero_afiliado','edad','medico_tratante','forma_negativa'],
      hechos: d => `Que la parte actora padece ${d.diagnostico}, requiriendo ${d.tratamiento_prescripto}${d.medico_tratante ? `, conforme lo prescripto por su profesional tratante, Dr./Dra. ${d.medico_tratante}` : ''}. Que con fecha ${d.fecha_solicitud} se solicitó la cobertura a la demandada, quien la denegó/discontinuó con fecha ${d.fecha_negativa}${d.forma_negativa ? `, invocando que ${d.forma_negativa}` : ''}. Que la interrupción del tratamiento agrava el cuadro de salud mental de la parte actora, toda vez que ${d.riesgo_salud}.`,
      derecho: () => `Fundo el presente en la Ley Nacional de Salud Mental N° 26.657 y su decreto reglamentario 603/2013, que reconocen a la salud mental como un proceso determinado por componentes históricos, socioeconómicos, culturales, biológicos y psicológicos, e imponen a los agentes del sistema de salud garantizar el acceso a un abordaje interdisciplinario, sin que la existencia de una afección preexistente pueda constituir per se causal de exclusión de cobertura o de rescisión contractual (art. 42, Ley 24.240, y ccdtes.). [Verificar articulado específico de la Ley 26.657 antes de presentar.]`,
    };
  }

  function tipoTrha() {
    return {
      label: 'Reproducción médicamente asistida (Ley 26.862)',
      requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','tratamiento_prescripto','fecha_solicitud','fecha_negativa','riesgo_salud'],
      opcionales: ['numero_afiliado','edad','medico_tratante','forma_negativa'],
      hechos: d => `Que la parte actora requiere el tratamiento de reproducción médicamente asistida consistente en ${d.tratamiento_prescripto}${d.medico_tratante ? `, prescripto por su médico tratante, Dr./Dra. ${d.medico_tratante}` : ''}. Que con fecha ${d.fecha_solicitud} se solicitó su cobertura a la demandada, quien la denegó con fecha ${d.fecha_negativa}${d.forma_negativa ? `, argumentando que ${d.forma_negativa}` : ''}. Que la demora en el acceso al tratamiento afecta el derecho reproductivo de la parte actora, toda vez que ${d.riesgo_salud}.`,
      derecho: () => `Fundo el presente en la Ley 26.862 de Reproducción Médicamente Asistida y su decreto reglamentario 956/2013, norma de orden público y de aplicación en todo el territorio de la República Argentina, que impone su cobertura a todos los prestadores del servicio de salud, tanto del ámbito público como de la seguridad social y privado (CSJN, Fallos: 346:1461). [Verificar articulado específico antes de presentar.]`,
    };
  }

  function tipoHiv() {
    return {
      label: 'HIV / SIDA — cobertura de tratamiento (Leyes 23.798 y 24.455)',
      requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','tratamiento_prescripto','fecha_solicitud','fecha_negativa','riesgo_salud'],
      opcionales: ['numero_afiliado','edad','medico_tratante','forma_negativa'],
      hechos: d => `Que la parte actora requiere ${d.tratamiento_prescripto} en el marco de su tratamiento por HIV/SIDA${d.medico_tratante ? `, conforme lo prescripto por su médico tratante, Dr./Dra. ${d.medico_tratante}` : ''}. Que con fecha ${d.fecha_solicitud} se solicitó su cobertura a la demandada, quien la denegó con fecha ${d.fecha_negativa}${d.forma_negativa ? `, argumentando que ${d.forma_negativa}` : ''}. Que la interrupción o falta de acceso al tratamiento pone en grave riesgo la salud de la parte actora, toda vez que ${d.riesgo_salud}.`,
      derecho: () => `Fundo el presente en la Ley 23.798, que declaró de interés nacional la lucha contra el Síndrome de Inmunodeficiencia Adquirida, y en las Leyes 24.455 y 24.754, que establecen la cobertura obligatoria de las prestaciones vinculadas al HIV a cargo de las obras sociales y de las empresas de medicina prepaga, respectivamente (CSJN, Fallos: 324:754, voto del juez Vázquez). La vía del amparo resulta particularmente apta para la tutela del derecho a la salud de las personas afectadas, dado que la falta de respeto de este derecho acarrea inexorablemente el deterioro de la calidad de vida (Fallos: 323:1339). [Verificar articulado específico antes de presentar.]`,
    };
  }

  function tipoCannabisMedicinal() {
    return {
      label: 'Cannabis medicinal (Ley 27.350)',
      requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','diagnostico','tratamiento_prescripto','fecha_solicitud','fecha_negativa','riesgo_salud'],
      opcionales: ['numero_afiliado','edad','medico_tratante','forma_negativa'],
      hechos: d => `Que la parte actora padece ${d.diagnostico}, para lo cual su médico tratante${d.medico_tratante ? `, Dr./Dra. ${d.medico_tratante},` : ''} le prescribió ${d.tratamiento_prescripto} en base a cannabis y sus derivados. Que con fecha ${d.fecha_solicitud} se solicitó su cobertura a la demandada, quien la denegó con fecha ${d.fecha_negativa}${d.forma_negativa ? `, argumentando que ${d.forma_negativa}` : ''}. Que la falta de cobertura pone en riesgo la salud de la parte actora, toda vez que ${d.riesgo_salud}.`,
      derecho: () => `Fundo el presente en la Ley 27.350, que establece el marco regulatorio para la investigación médica y científica del uso medicinal, terapéutico y/o paliativo de la planta de cannabis y sus derivados, y su decreto reglamentario 883/2020, que impone su cobertura a cargo de los agentes del Sistema Nacional del Seguro de Salud y de las entidades de medicina prepaga. [Verificar articulado específico antes de presentar.]`,
    };
  }

  function tipoTransplante() {
    return {
      label: 'Trasplante de órganos, tejidos o células',
      requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','diagnostico','tratamiento_prescripto','fecha_solicitud','fecha_negativa','riesgo_salud'],
      opcionales: ['numero_afiliado','edad','medico_tratante','forma_negativa'],
      hechos: d => `Que la parte actora padece ${d.diagnostico}, requiriendo ${d.tratamiento_prescripto} en el marco de un proceso de trasplante${d.medico_tratante ? `, conforme lo indicado por su médico tratante, Dr./Dra. ${d.medico_tratante}` : ''}. Que con fecha ${d.fecha_solicitud} se solicitó su cobertura a la demandada, quien la denegó con fecha ${d.fecha_negativa}${d.forma_negativa ? `, argumentando que ${d.forma_negativa}` : ''}. Que la demora pone en grave e inminente riesgo la vida de la parte actora, toda vez que ${d.riesgo_salud}.`,
      derecho: () => `Fundo el presente en la Ley 27.447 de Trasplante de Órganos, Tejidos y Células, y en el deber de cobertura integral de las prestaciones vinculadas a procesos de trasplante a cargo de obras sociales y entidades de medicina prepaga conforme el Programa Médico Obligatorio. [Verificar articulado específico antes de presentar.]`,
    };
  }

  function tipoTerceraEdad() {
    return {
      label: 'Persona mayor — cobertura o continuidad de prestaciones',
      requiere: ['nombre','dni','domicilio','edad','razon_social','dom_destinatario','tratamiento_prescripto','fecha_solicitud','fecha_negativa','riesgo_salud'],
      opcionales: ['numero_afiliado','diagnostico','medico_tratante','forma_negativa'],
      hechos: d => `Que la parte actora, de ${d.edad} años de edad,${d.diagnostico ? ` padece ${d.diagnostico} y` : ''} requiere ${d.tratamiento_prescripto}. Que con fecha ${d.fecha_solicitud} se solicitó su cobertura a la demandada, quien la denegó con fecha ${d.fecha_negativa}${d.forma_negativa ? `, argumentando que ${d.forma_negativa}` : ''}. Que la falta de cobertura afecta gravemente la salud y la calidad de vida de la parte actora en atención a su condición etaria, toda vez que ${d.riesgo_salud}.`,
      derecho: () => `Fundo el presente en la Convención Interamericana sobre Protección de los Derechos Humanos de las Personas Mayores, cuyos derechos a la vida, a vivir con dignidad en la vejez, a la salud y a la protección judicial efectiva se encuentran especialmente protegidos, siendo la vía del amparo particularmente pertinente cuando la peticionaria pertenece a dicho colectivo (CSJN, Fallos: 345:1174).`,
    };
  }

  function tipoIncompatibilidadCoberturas(fundamentoEspecifico) {
    return {
      label: 'Incompatibilidad o superposición de coberturas',
      requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','cobertura_actual','cobertura_pretendida','fecha_negativa','riesgo_salud'],
      opcionales: ['numero_afiliado','edad','certificado_discapacidad','diagnostico','forma_negativa'],
      hechos: d => `Que la parte actora${d.certificado_discapacidad ? `, titular del Certificado Único de Discapacidad ${d.certificado_discapacidad},` : ''} cuenta actualmente con la cobertura de ${d.cobertura_actual}, y requiere adicionalmente/alternativamente la cobertura de ${d.cobertura_pretendida}. Que la demandada le informó con fecha ${d.fecha_negativa} que ambas coberturas resultan incompatibles entre sí y que, para acceder a la segunda, debe renunciar a la primera${d.forma_negativa ? `, argumentando que ${d.forma_negativa}` : ''}. Que dicha exigencia coloca a la parte actora en la disyuntiva de privarse de prestaciones esenciales para su salud, toda vez que ${d.riesgo_salud}.`,
      derecho: () => `${fundamentoEspecifico} Ninguna norma reglamentaria de rango infralegal puede prevalecer sobre los principios y garantías consagrados en la Convención sobre los Derechos de las Personas con Discapacidad, ratificada con jerarquía constitucional (ley 27.044), en cuanto ello conduzca a limitar la cobertura de salud que la persona con discapacidad necesita y tiene legalmente asegurada (CSJN, Fallos: 343:848, disidencia del juez Rosatti).`,
    };
  }

  function tipoVacunacion() {
    return {
      label: 'Vacunación / calendario nacional de inmunización',
      requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','tratamiento_prescripto','fecha_solicitud','fecha_negativa','riesgo_salud'],
      opcionales: ['numero_afiliado','edad','forma_negativa'],
      hechos: d => `Que la parte actora requiere ${d.tratamiento_prescripto}, conforme el Calendario Nacional de Vacunación. Que con fecha ${d.fecha_solicitud} se solicitó su provisión/aplicación a la demandada, quien la denegó/omitió con fecha ${d.fecha_negativa}${d.forma_negativa ? `, argumentando que ${d.forma_negativa}` : ''}. Que dicha omisión pone en riesgo la salud de la parte actora, toda vez que ${d.riesgo_salud}.`,
      derecho: () => `El Estado Argentino ha asumido compromisos internacionales dirigidos a promover y facilitar las prestaciones de salud que requiere la minoridad y la población en general (art. 12 del Pacto Internacional de Derechos Económicos, Sociales y Culturales; art. VII de la Declaración Americana de los Derechos y Deberes del Hombre; art. 25.2 de la Declaración Universal de Derechos Humanos), no pudiendo desligarse válidamente de esos deberes (CSJN, Fallos: 335:888).`,
    };
  }

  // Tipos exclusivos de "prepaga"
  const TIPO_RESCISION_UNILATERAL = {
    label: 'Rescisión unilateral o negativa de renovación por preexistencia',
    requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','fecha_notificacion_rescision','motivo_invocado','riesgo_salud'],
    opcionales: ['numero_afiliado','edad','diagnostico','tratamiento_prescripto'],
    hechos: d => `Que la parte actora se encuentra afiliada a la demandada, quien con fecha ${d.fecha_notificacion_rescision} le notificó la rescisión unilateral del contrato / la negativa de renovación de la afiliación, invocando como fundamento: ${d.motivo_invocado}. Que dicha decisión${d.tratamiento_prescripto ? ` interrumpe el tratamiento consistente en ${d.tratamiento_prescripto}` : ' priva a la parte actora de la cobertura de salud'}${d.diagnostico ? ` que requiere en razón de padecer ${d.diagnostico}` : ''}, poniendo en grave riesgo su salud, toda vez que ${d.riesgo_salud}.`,
    derecho: () => `Fundo el presente en la Ley 26.682 de Marco Regulatorio de Medicina Prepaga, conforme a la cual las entidades de medicina prepaga tienen a su cargo una trascendental función social que excede el mero interés comercial, no pudiendo desconocer un contrato o invocar sus cláusulas para apartarse de las obligaciones impuestas por la ley, en tanto ello importaría contrariar su propio objeto, que es asegurar a los beneficiarios las coberturas tanto pactadas como legalmente establecidas (CSJN, Fallos: 330:3725). [Verificar el articulado específico de la Ley 26.682 sobre rescisión y preexistencias antes de presentar.]`,
  };

  const TIPO_AUMENTO_CUOTA = {
    label: 'Aumento desmedido de cuota (DNU 70/2023)',
    requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','monto_cuota_anterior','monto_cuota_nueva','fecha_notificacion_rescision','riesgo_salud'],
    opcionales: ['numero_afiliado','edad'],
    hechos: d => `Que la parte actora se encuentra afiliada a la demandada, abonando una cuota mensual de $ ${d.monto_cuota_anterior}. Que con fecha ${d.fecha_notificacion_rescision} la demandada le notificó un incremento de dicha cuota a la suma de $ ${d.monto_cuota_nueva}, invocando la desregulación dispuesta por el Decreto de Necesidad y Urgencia N° 70/2023, sin autorización previa de la Superintendencia de Servicios de Salud. Que dicho incremento resulta desproporcionado en relación con los ingresos de la parte actora y pone en riesgo la continuidad de su cobertura de salud, toda vez que ${d.riesgo_salud}.`,
    derecho: () => `Corresponde tener presente que, con anterioridad a la implementación del DNU 70/2023, la Superintendencia de Servicios de Salud tenía a su cargo la obligación de regular los incrementos en los planes de afiliación de las entidades de medicina prepaga, y que dicha desregulación ha sido cuestionada en numerosas medidas cautelares. [Verificar el estado actual de la jurisprudencia sobre el DNU 70/2023 y los eventuales acuerdos homologados en la materia antes de presentar, dado que se trata de un extremo especialmente cambiante.]`,
  };

  // Tipos exclusivos de "estado_provincial_municipal"
  const TIPO_MIGRANTES = {
    label: 'Migrantes sin cobertura — residencia precaria / arancelamiento provincial',
    requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','diagnostico','tratamiento_prescripto','fecha_negativa','riesgo_salud'],
    opcionales: ['situacion_migratoria','forma_negativa'],
    hechos: d => `Que la parte actora${d.situacion_migratoria ? `, ${d.situacion_migratoria},` : ', de nacionalidad extranjera,'} padece ${d.diagnostico}, requiriendo ${d.tratamiento_prescripto}. Que con fecha ${d.fecha_negativa} la demandada le negó/condicionó la atención y/o la provisión del tratamiento al pago de aranceles, invocando su situación migratoria${d.forma_negativa ? ` y que ${d.forma_negativa}` : ''}. Que la falta de acceso a la atención sanitaria pone en grave riesgo la salud de la parte actora, toda vez que ${d.riesgo_salud}.`,
    derecho: () => `Fundo el presente en el art. 8 de la Ley 25.871 de Migraciones, que garantiza a todo migrante, independientemente de su situación migratoria, el acceso igualitario a los servicios sociales, bienes públicos, salud, educación, justicia, trabajo y seguridad social, no pudiendo negársele o restringírsele en ningún caso el acceso al derecho a la salud. Asimismo, la Corte Interamericana de Derechos Humanos ha señalado el deber de los Estados de garantizar el acceso a la salud sin discriminación por razón del origen nacional o la condición migratoria (Corte IDH, casos "Nadege Dorzema y otros vs. República Dominicana"; "Niñas Yean y Bosico vs. República Dominicana"; "Cuscul Pivaral y otros vs. Guatemala"). [Verificar la normativa provincial específica de arancelamiento vigente antes de presentar.]`,
  };

  const TIPO_GERIATRICO = {
    label: 'Persona mayor institucionalizada — tutela en residencia geriátrica',
    requiere: ['nombre','dni','domicilio','edad','razon_social','dom_destinatario','tratamiento_prescripto','fecha_negativa','riesgo_salud'],
    opcionales: ['diagnostico','forma_negativa'],
    hechos: d => `Que la parte actora, de ${d.edad} años de edad, se encuentra alojada en una residencia geriátrica${d.diagnostico ? ` y padece ${d.diagnostico}` : ''}, requiriendo ${d.tratamiento_prescripto}. Que con fecha ${d.fecha_negativa} la demandada denegó u omitió dicha prestación${d.forma_negativa ? `, argumentando que ${d.forma_negativa}` : ''}. Que ello pone en grave riesgo la salud y la dignidad de la parte actora, toda vez que ${d.riesgo_salud}.`,
    derecho: () => `De las disposiciones de la Ley 14.263 de la Provincia de Buenos Aires y su decreto reglamentario 1190/2012 se desprende la responsabilidad primaria del Estado provincial y de la Municipalidad en cuya jurisdicción se encuentra ubicada la residencia geriátrica en orden a la tutela de los derechos a la vivienda y a la salud de las personas allí alojadas (CSJN, Fallos: 343:283).`,
  };

  // Tipos exclusivos de "art_riesgos_trabajo"
  function tipoCoberturaART(labelTexto) {
    return {
      label: labelTexto,
      requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','diagnostico','tratamiento_prescripto','fecha_solicitud','fecha_negativa','riesgo_salud'],
      opcionales: ['numero_afiliado','medico_tratante','forma_negativa'],
      hechos: d => `Que la parte actora sufrió un accidente de trabajo / enfermedad profesional que le ocasionó ${d.diagnostico}, requiriendo ${d.tratamiento_prescripto}${d.medico_tratante ? `, conforme lo indicado por el médico tratante, Dr./Dra. ${d.medico_tratante}` : ''}. Que con fecha ${d.fecha_solicitud} se solicitó la prestación a la Aseguradora de Riesgos del Trabajo demandada, quien la denegó con fecha ${d.fecha_negativa}${d.forma_negativa ? `, argumentando que ${d.forma_negativa}` : ''}. Que la falta de cobertura pone en riesgo la recuperación y la salud de la parte actora, toda vez que ${d.riesgo_salud}.`,
      derecho: () => `Fundo el presente en la Ley 24.557 de Riesgos del Trabajo (en especial, arts. 20 y 26 y ccdtes.) y en los decretos de necesidad y urgencia 367/2020, 39/2021, 266/2021, 345/2021 y 413/2021, en cuanto imponen a las Aseguradoras de Riesgos del Trabajo el deber de brindar las prestaciones en especie necesarias para la recuperación de la salud del trabajador siniestrado (CSJN, Fallos: 346:1196). [Verificar vigencia de los DNU citados y normativa reglamentaria actual antes de presentar.]`,
    };
  }

  const MATERIAS = {
    obra_social_nacional: {
      label: 'Obra Social Nacional (Ley 23.660/23.661)',
      encuadreDemandado: 'la obra social nacional demandada, en su carácter de agente del Sistema Nacional del Seguro de Salud (Leyes 23.660 y 23.661)',
      competenciaTexto: `Resulta competente la justicia federal para conocer en la presente causa, toda vez que la demandada reviste el carácter de agente del Sistema Nacional del Seguro de Salud y se encuentra sometida, en tal carácter, exclusivamente a la jurisdicción federal (art. 38, Ley 23.661; CSJN, Fallos: 329:4414; 320:1328).`,
      tipos: {
        medicamento_alto_costo: tipoMedicamentoAltoCosto(`Las obras sociales son entes de la seguridad social, a cuyo cargo se encuentra la administración de las prestaciones médico-asistenciales, prioritariamente destinadas a la cobertura de las contingencias vinculadas a la salud de sus afiliados y beneficiarios (CSJN, Fallos: 331:1262).`),
        cobertura_no_pmo: tipoCoberturaNoPmo(`El Programa Médico Obligatorio constituye el piso mínimo de cobertura exigible a las obras sociales comprendidas en el Sistema Nacional del Seguro de Salud (Leyes 23.660 y 23.661).`),
        discapacidad_ley24901: tipoDiscapacidad(`La ley 24.901 determina prestaciones de discapacidad respecto de las obras sociales comprendidas en las Leyes 23.660 y 23.661, con el alcance del concepto amplio "médico asistencial" (CSJN, Fallos: 330:3725).`),
        salud_mental: tipoSaludMental(),
        trha: tipoTrha(),
        hiv: tipoHiv(),
        cannabis_medicinal: tipoCannabisMedicinal(),
        transplante: tipoTransplante(),
        tercera_edad: tipoTerceraEdad(),
        incompatibilidad_coberturas: tipoIncompatibilidadCoberturas(`Fundo el presente en la Ley 24.901 y en el deber de coordinación entre los distintos sujetos obligados del sistema de salud, sin que la existencia de una prestación no contributiva pueda ser invocada para desconocer la cobertura médico-asistencial debida por la obra social.`),
        vacunacion: tipoVacunacion(),
      },
    },

    prepaga: {
      label: 'Empresa de Medicina Prepaga (Ley 26.682)',
      encuadreDemandado: 'la empresa de medicina prepaga demandada, sujeta al Marco Regulatorio de Medicina Prepaga (Ley 26.682)',
      competenciaTexto: `Resulta competente la justicia federal para conocer en la presente causa, toda vez que el litigio conduce al estudio del alcance de las obligaciones impuestas a las empresas de medicina prepaga por la Ley 26.682, norma de índole federal (CSJN, CSJ 1548/2024 "M. F.", 19/12/2024; 346:1461).`,
      tipos: {
        medicamento_alto_costo: tipoMedicamentoAltoCosto(`Por imperio del art. 1° de la Ley 24.754, las empresas de medicina prepaga deben cubrir, como mínimo, las mismas prestaciones obligatorias que resultan exigibles a las obras sociales (CSJN, Fallos: 330:3725).`),
        cobertura_no_pmo: tipoCoberturaNoPmo(`Las entidades de medicina prepaga deben cubrir en sus planes, como mínimo, las mismas prestaciones obligatorias dispuestas para las obras sociales (Leyes 23.660, 23.661 y 24.754), adquiriendo un compromiso social con sus usuarios que excede el mero interés comercial (CSJN, Fallos: 330:3725; 324:677).`),
        discapacidad_ley24901: tipoDiscapacidad(`En virtud de la Ley 24.754, las entidades de medicina prepaga deben cubrir también las prestaciones básicas que necesiten las personas con discapacidad afiliadas conforme lo dispuesto por la Ley 24.901.`),
        salud_mental: tipoSaludMental(),
        trha: tipoTrha(),
        hiv: tipoHiv(),
        cannabis_medicinal: tipoCannabisMedicinal(),
        transplante: tipoTransplante(),
        tercera_edad: tipoTerceraEdad(),
        incompatibilidad_coberturas: tipoIncompatibilidadCoberturas(`Fundo el presente en la Ley 26.682 y en el deber de la entidad de medicina prepaga de asegurar a sus beneficiarios las coberturas tanto pactadas como legalmente establecidas, sin que pueda invocar cláusulas contractuales para desconocer obligaciones impuestas por la ley.`),
        vacunacion: tipoVacunacion(),
        rescision_unilateral: TIPO_RESCISION_UNILATERAL,
        aumento_cuota_dnu70: TIPO_AUMENTO_CUOTA,
      },
    },

    obra_social_provincial: {
      label: 'Obra Social Provincial / IOMA',
      encuadreDemandado: 'el Instituto de Obra Médico Asistencial (IOMA) u obra social provincial demandada, entidad autárquica local no comprendida en el Sistema Nacional del Seguro de Salud',
      competenciaTexto: `Resulta competente la justicia ordinaria provincial para conocer en la presente causa, toda vez que la demandada es una entidad autárquica local que no se encuentra incluida dentro del Sistema Nacional del Seguro de Salud previsto por la Ley 23.661, ni inscripta en el Registro Nacional de Obras Sociales creado por la Ley 23.660 (CSJN, Fallos: 345:1496). [Advertencia: el trámite específico ante fuero provincial se rige por la Ley 13.928 de Amparo de la Provincia de Buenos Aires, no verificada en esta versión de la herramienta.]`,
      tipos: {
        medicamento_alto_costo: tipoMedicamentoAltoCosto(`Las obligaciones emergentes de las Leyes 23.661, 22.431 y 24.901, de la Constitución de la Provincia de Buenos Aires (arts. 12, inc. 1°, y 36, incs. 5° y 8°) y de la ley provincial 10.592 imponen a las autoridades locales el deber de articular un mecanismo eficaz para la entrega del medicamento con urgencia y continuidad (CSJN, Fallos: 328:1708).`),
        discapacidad_ley24901: tipoDiscapacidad(`La Constitución de la Provincia de Buenos Aires consagra el derecho a una protección integral de la discapacidad (arts. 36, incs. 5° y 8°, y 198), en consonancia con lo establecido por la Constitución Nacional.`),
        cobertura_no_pmo: tipoCoberturaNoPmo(`El régimen jurídico de IOMA impone a la entidad el deber de brindar cobertura integral y oportuna a sus afiliados, sin que pueda invocar limitaciones reglamentarias para desconocer el nivel de cobertura debido.`),
        salud_mental: tipoSaludMental(),
        tercera_edad: tipoTerceraEdad(),
      },
    },

    estado_nacional: {
      label: 'Estado Nacional (Min. Salud / SeNaDis / Incluir Salud / PAMI)',
      encuadreDemandado: 'el Estado Nacional, a través del organismo demandado, en su carácter de garante primario del sistema de salud',
      competenciaTexto: `Resulta competente la justicia federal para conocer en la presente causa, toda vez que se encuentra demandado el Estado Nacional o uno de sus organismos descentralizados, cuya actuación se inserta en el ámbito de fiscalización y control de la Administración Pública Nacional (CSJN, Fallos: 346:1241; 343:432).`,
      tipos: {
        medicamento_alto_costo: tipoMedicamentoAltoCosto(`No puede soslayarse la función rectora que ejerce el Estado Nacional en el campo de la salud por medio del Ministerio de Salud, para garantizar la regularidad de los tratamientos sanitarios coordinando sus acciones con los estados provinciales (CSJN, Fallos: 330:4160; 328:1708).`),
        discapacidad_ley24901: tipoDiscapacidad(`La Secretaría Nacional de Discapacidad (SeNaDis), organismo creado en el ámbito del Ministerio de Salud de la Nación por el Decreto de Necesidad y Urgencia N° 942/2025 como sucesor de la disuelta Agencia Nacional de Discapacidad (ANDIS), tiene a su cargo, a través del Programa Federal Incluir Salud, el financiamiento de prestaciones de salud a favor de personas con discapacidad titulares de pensiones no contributivas, no tratándose de una obra social sino de un programa que brinda prestaciones mediante convenios directos con prestadores y con las provincias. [Verificar, al momento de presentar, la vigencia de esta estructura orgánica y de la normativa de creación citada.]`),
        incompatibilidad_coberturas: tipoIncompatibilidadCoberturas(`El Programa Federal Incluir Salud (ex PROFE) y el Instituto Nacional de Servicios Sociales para Jubilados y Pensionados (PAMI, Ley 19.032) constituyen sistemas de cobertura distintos, cuya articulación no puede resolverse exigiendo a la persona con discapacidad la renuncia a prestaciones esenciales para su salud.`),
        vacunacion: tipoVacunacion(),
      },
    },

    estado_provincial_municipal: {
      label: 'Estado Provincial / Municipal (Min. Salud PBA, hospital público, municipio)',
      encuadreDemandado: 'el Estado de la Provincia de Buenos Aires y/o la Municipalidad demandada, en su carácter de responsable primario de la prestación de servicios de salud en su jurisdicción',
      competenciaTexto: `Resulta competente la justicia ordinaria provincial para conocer en la presente causa, en tanto se cuestionan hechos u omisiones de las autoridades provinciales o municipales en ejercicio de facultades no delegadas a la Nación (arts. 121 y 122, Constitución Nacional; CSJN, Fallos: 343:283). [Advertencia: el trámite específico ante fuero provincial se rige por la Ley 13.928 de Amparo de la Provincia de Buenos Aires, no verificada en esta versión de la herramienta.]`,
      tipos: {
        medicamento_alto_costo: tipoMedicamentoAltoCosto(`El hospital público es una consecuencia directa del imperativo constitucional que pone a cargo del Estado la función trascendental de la prestación de los servicios de salud en condiciones tales de garantizar la protección integral del ser humano (CSJN, Fallos: 329:2737).`),
        discapacidad_ley24901: tipoDiscapacidad(`Las obligaciones emergentes de las Leyes 23.661, 22.431 y 24.901, de la Constitución de la Provincia de Buenos Aires y de la ley provincial 10.592 imponen a las autoridades locales el deber de articular un mecanismo eficaz para garantizar la prestación con urgencia y continuidad (CSJN, Fallos: 328:1708).`),
        migrantes_sin_cobertura: TIPO_MIGRANTES,
        tercera_edad_geriatrico: TIPO_GERIATRICO,
        salud_mental: tipoSaludMental(),
      },
    },

    art_riesgos_trabajo: {
      label: 'ART — Aseguradora de Riesgos del Trabajo (Ley 24.557)',
      encuadreDemandado: 'la Aseguradora de Riesgos del Trabajo demandada',
      competenciaTexto: `La competencia para conocer en la presente causa corresponde, en principio, a la justicia ordinaria/laboral, en tanto la cuestión se vincula directamente con aspectos del derecho laboral común y se dirige contra un sujeto de derecho privado (CSJN, Fallos: 346:1196). [Verificar fuero según jurisdicción y naturaleza concreta del reclamo antes de presentar.]`,
      tipos: {
        cobertura_tratamiento_rehabilitacion: tipoCoberturaART('Cobertura de tratamiento o rehabilitación'),
        internacion: tipoCoberturaART('Cobertura de internación con cuidados'),
      },
    },

    mutual: {
      label: 'Mutual / Asociación Civil prestadora de servicios de salud',
      encuadreDemandado: 'la mutual/asociación civil demandada, prestadora de servicios de salud',
      competenciaTexto: `Resulta competente la justicia federal para conocer en la presente causa cuando el objeto del litigio conduce al estudio del alcance de las obligaciones impuestas a las mutuales por la Ley 26.682 (CSJN, FMP 19080/2022 "F., J. M.", 22/10/2024; 347:246).`,
      tipos: {
        medicamento_alto_costo: tipoMedicamentoAltoCosto(`La no adhesión de la mutual al sistema de las Leyes 23.660 y 23.661 no la exime de la carga de adoptar medidas razonables a su alcance para lograr el acceso pleno del amparista a los beneficios de la seguridad social, con el alcance integral que estatuye la normativa tutelar sobre la materia (CSJN, Fallos: 331:453).`),
        discapacidad_ley24901: tipoDiscapacidad(`En tanto la mutual demandada resulta alcanzada por las obligaciones impuestas a las entidades de medicina prepaga y mutuales por la Ley 26.682, corresponde estar a las obligaciones de cobertura de las prestaciones básicas que establece la Ley 24.901.`),
        cobertura_no_pmo: tipoCoberturaNoPmo(`La mutual demandada, en tanto presta servicios de salud a sus asociados, debe garantizar como mínimo el nivel de cobertura exigible conforme el Programa Médico Obligatorio.`),
      },
    },
  };

  // ── Campos (pool compartido) ───────────────────────────────────────────
  const CAMPOS_CONFIG = [
    { id: 'nombre',          label: 'Nombre completo (actor/a)',          placeholder: 'Juan García',                tipo: 'text',     grupo: 'actor' },
    { id: 'dni',             label: 'DNI',                                placeholder: '12.345.678',                  tipo: 'text',     grupo: 'actor' },
    { id: 'domicilio',       label: 'Domicilio real',                     placeholder: 'Calle 45 N° 850, La Plata',   tipo: 'text',     grupo: 'actor' },
    { id: 'edad',            label: 'Edad',                               placeholder: '35',                          tipo: 'number',   grupo: 'actor' },
    { id: 'certificado_discapacidad', label: 'CUD (N° y/o fecha, opcional)', placeholder: 'CUD N° 12345, vigente hasta 2027', tipo: 'text', grupo: 'actor' },
    { id: 'situacion_migratoria', label: 'Situación migratoria (opcional)', placeholder: 'nacionalidad boliviana, residencia precaria en trámite', tipo: 'text', grupo: 'actor' },

    { id: 'razon_social',    label: 'Nombre / Razón social (demandada)',  placeholder: 'Obra Social / Prepaga / Estado', tipo: 'text',  grupo: 'demandado' },
    { id: 'dom_destinatario',label: 'Domicilio (demandada)',              placeholder: 'Calle Falsa 123, La Plata',   tipo: 'text',     grupo: 'demandado' },
    { id: 'numero_afiliado', label: 'N° de afiliado (opcional)',          placeholder: '0000-1234567-8',              tipo: 'text',     grupo: 'demandado' },

    { id: 'diagnostico',     label: 'Diagnóstico / enfermedad',           placeholder: 'esclerosis múltiple',         tipo: 'textarea', grupo: 'hecho' },
    { id: 'tratamiento_prescripto', label: 'Tratamiento/prestación requerida', placeholder: 'medicación X, 1 ampolla mensual', tipo: 'textarea', grupo: 'hecho' },
    { id: 'medico_tratante', label: 'Médico/a tratante (opcional)',       placeholder: 'Dra. Pérez, MP 12345',        tipo: 'text',     grupo: 'hecho' },
    { id: 'fecha_prescripcion', label: 'Fecha de la prescripción médica (opcional)', placeholder: '', tipo: 'date',   grupo: 'hecho' },
    { id: 'fecha_solicitud', label: 'Fecha de solicitud a la demandada',  placeholder: '',                             tipo: 'date',     grupo: 'hecho' },
    { id: 'fecha_negativa',  label: 'Fecha de la negativa/omisión',       placeholder: '',                             tipo: 'date',     grupo: 'hecho' },
    { id: 'forma_negativa',  label: 'Fundamento invocado por la demandada (opcional)', placeholder: 'medicación experimental, no incluida en el PMO', tipo: 'textarea', grupo: 'hecho' },
    { id: 'monto_tratamiento', label: 'Costo del tratamiento (opcional)', placeholder: '500000',                       tipo: 'number',   grupo: 'hecho' },

    { id: 'fecha_notificacion_rescision', label: 'Fecha de notificación (rescisión / aumento)', placeholder: '', tipo: 'date', grupo: 'hecho' },
    { id: 'motivo_invocado', label: 'Motivo invocado por la demandada',   placeholder: 'preexistencia no declarada',   tipo: 'textarea', grupo: 'hecho' },
    { id: 'monto_cuota_anterior', label: 'Monto de cuota anterior',       placeholder: '74000',                        tipo: 'number',   grupo: 'hecho' },
    { id: 'monto_cuota_nueva', label: 'Monto de cuota nueva',             placeholder: '141000',                       tipo: 'number',   grupo: 'hecho' },
    { id: 'cobertura_actual', label: 'Cobertura actual',                  placeholder: 'Pensión No Contributiva por discapacidad', tipo: 'text', grupo: 'hecho' },
    { id: 'cobertura_pretendida', label: 'Cobertura pretendida',          placeholder: 'afiliación a PAMI',            tipo: 'text',     grupo: 'hecho' },

    { id: 'riesgo_salud',    label: 'Riesgo concreto para la salud (fundamento de la cautelar)', placeholder: 'la interrupción del tratamiento agravará su cuadro y generará daños irreversibles', tipo: 'textarea', grupo: 'cautelar' },
  ];
  const CAMPOS_BY_ID = Object.fromEntries(CAMPOS_CONFIG.map(c => [c.id, c]));

  // ── Prueba: documental e informativa (comunes a todas las materias) ────
  const DOCUMENTALES = [
    { id: 'historia_clinica', label: 'Historia clínica', pideDato: true,
      placeholder: 'Institución y período' },
    { id: 'prescripcion',     label: 'Prescripción médica / indicación del tratamiento', pideDato: true,
      placeholder: 'Fecha y profesional tratante' },
    { id: 'estudios',         label: 'Estudios complementarios / informes médicos', pideDato: true,
      placeholder: 'Tipo de estudio y fecha' },
    { id: 'negativa_escrita', label: 'Negativa/omisión de la demandada por escrito', pideDato: true,
      placeholder: 'Fecha y medio (nota, correo electrónico, resolución)' },
    { id: 'otro',             label: 'Otro documento', pideDato: true,
      placeholder: 'Detalle del documento' },
  ];

  const INFORMATIVAS = [
    { id: 'demandada', label: 'A la propia demandada (antecedentes del reclamo administrativo)', pideDato: false },
    { id: 'anmat',     label: 'ANMAT', pideDato: false },
    { id: 'min_salud', label: 'Ministerio de Salud (Nación/Provincia, según corresponda)', pideDato: false },
    { id: 'senadis',   label: 'Agencia Nacional de Discapacidad / SeNaDis', pideDato: false },
  ];

  let materiaActual = Object.keys(MATERIAS)[0];

  // ── HTML ─────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Generador de Acción de Amparo por Salud con Medida Cautelar</h2>
      <p class="tool-desc">Amparo (art. 43 CN; Ley 16.986) con medida cautelar integrada (art. 230 CPCCN) — 7 tipos de demandado</p>

      <div style="display:block;background:#fff3cd;border:1px solid #d9a441;border-radius:6px;padding:10px 14px;margin-bottom:16px;font-size:.82rem;line-height:1.6;color:#5a4408">
        ⚠️ Herramienta en versión inicial, pendiente de revisión final por el Estudio antes de su uso en un caso real. El trámite específico ante el fuero PROVINCIAL de la Provincia de Buenos Aires (Ley 13.928) no fue investigado en esta versión; el escrito se funda en el estándar nacional (Ley 16.986). Los fundamentos de TRHA, salud mental, HIV, cannabis medicinal, trasplante, migrantes, ART y DNU 70/2023 se dejan enunciados a nivel de ley general — verificar articulado específico antes de presentar.
      </div>

      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="am-materia">Demandado</label>
          <select id="am-materia">
            ${Object.entries(MATERIAS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
          </select>
        </div>
        <div class="field-group" style="flex:2">
          <label for="am-tipo">Objeto de la pretensión</label>
          <select id="am-tipo"></select>
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Profesional actuante y trámite</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group">
          <label for="am-abogado-select">Abogado/a actuante</label>
          <select id="am-abogado-select">${ABOGADOS.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('')}</select>
        </div>
        <div class="field-group">
          <label for="am-caracter-letrado">Carácter</label>
          <select id="am-caracter-letrado">${CARACTER_LETRADO.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}</select>
        </div>
        <div class="field-group"><label for="am-matricula">Matrícula (Tomo/Folio y Colegio)</label><input type="text" id="am-matricula"></div>
      </div>
      <p id="am-abogado-info" style="font-size:.78rem;color:var(--color-muted);margin:-6px 0 10px"></p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group"><label for="am-juzgado">Juzgado / Fuero competente</label><input type="text" id="am-juzgado" placeholder="Juzgado Federal N° _ de..."></div>
        <div class="field-group"><label for="am-domicilio_procesal">Domicilio procesal a constituir</label><input type="text" id="am-domicilio_procesal"></div>
        <div class="field-group"><label for="am-email_notificaciones">Domicilio electrónico (notificaciones)</label><input type="text" id="am-email_notificaciones"></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px" id="am-campos-wrapper">
        <div>
          <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del actor</div>
          <div id="am-grupo-actor"></div>
          <div id="am-actores-extra-wrapper" style="display:flex;flex-direction:column;gap:6px;margin-top:6px"></div>
          <button class="btn btn-ghost" id="am-add-actor" type="button" style="margin-top:4px">+ Agregar coactor/a</button>
        </div>
        <div>
          <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos de la demandada</div>
          <div id="am-grupo-demandado"></div>
          <div id="am-demandados-extra-wrapper" style="display:flex;flex-direction:column;gap:6px;margin-top:6px"></div>
          <button class="btn btn-ghost" id="am-add-demandado" type="button" style="margin-top:4px">+ Agregar codemandado/a</button>
        </div>
        <div style="grid-column:1/-1">
          <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del hecho</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px" id="am-grupo-hecho"></div>
        </div>
        <div style="grid-column:1/-1">
          <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Medida cautelar — fundamento del peligro en la demora</div>
          <div id="am-grupo-cautelar"></div>
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Prueba ofrecida</div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:8px">
        <p style="font-weight:700;margin:0 0 8px">1. Prueba Documental</p>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${DOCUMENTALES.map(p => `
            <div>
              <label style="display:flex;align-items:center;gap:10px;font-weight:400">
                <input type="checkbox" class="am-documental-check" data-documental="${p.id}" style="width:auto"> ${p.label}
              </label>
              ${p.pideDato ? `<input type="text" class="am-documental-dato" data-documental-dato="${p.id}" placeholder="${p.placeholder}" style="display:none;margin-top:4px;width:100%" disabled>` : ''}
            </div>`).join('')}
        </div>
      </div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:10px">
        <label style="display:flex;align-items:center;gap:10px;font-weight:700">
          <input type="checkbox" id="am-prueba-confesional" style="width:auto" checked> 2. Prueba Confesional
        </label>
        <div id="am-wrap-confesional" style="margin-top:8px">
          <div class="form-row" style="justify-content:flex-start">
            <button class="btn btn-ghost" id="am-sugerir-pliego" type="button">Sugerir pliego</button>
          </div>
          <textarea id="am-confesional_pliego" rows="5" style="width:100%;margin-top:6px" placeholder="a) ...que la parte actora padece ...; b) ...que se solicitó la cobertura con fecha ...; c) ...que la demandada denegó/omitió la prestación con fecha ...; d) Me reservo el derecho de ampliar."></textarea>
        </div>
      </div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:10px">
        <label style="display:flex;align-items:center;gap:10px;font-weight:700">
          <input type="checkbox" id="am-prueba-doc_demandada" style="width:auto"> 3. Documental en poder de la demandada
        </label>
        <div id="am-wrap-doc_demandada" style="margin-top:8px;display:none">
          <textarea id="am-doc_demandada_detalle" rows="3" style="width:100%" placeholder="Historia clínica en poder de la demandada, auditoría médica interna, dictámenes de la comisión evaluadora, legajo del afiliado, etc."></textarea>
        </div>
      </div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:10px">
        <label style="display:flex;align-items:center;gap:10px;font-weight:700">
          <input type="checkbox" id="am-prueba-testifical" style="width:auto"> 4. Prueba Testifical
        </label>
        <div id="am-wrap-testifical" style="margin-top:8px;display:none">
          <div id="am-testigos-wrapper" style="display:flex;flex-direction:column;gap:6px"></div>
          <div class="form-row" style="justify-content:flex-start;margin-top:6px">
            <button class="btn btn-ghost" id="am-add-testigo" type="button">+ Agregar testigo (máx. 5)</button>
          </div>
        </div>
      </div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:10px">
        <label style="display:flex;align-items:center;gap:10px;font-weight:700">
          <input type="checkbox" id="am-prueba-pericial" style="width:auto" checked> 5. Prueba Pericial Médica
        </label>
        <div id="am-wrap-pericial" style="margin-top:8px">
          <div class="form-row" style="justify-content:flex-start">
            <button class="btn btn-ghost" id="am-sugerir-pericial" type="button">Sugerir puntos de pericia</button>
          </div>
          <textarea id="am-pericial_puntos" rows="6" style="width:100%;margin-top:6px" placeholder="Puntos de pericia a informar por el/la perito médico/a."></textarea>
        </div>
      </div>

      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px;margin-top:10px">
        <p style="font-weight:700;margin:0 0 8px">6. Prueba Informativa</p>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${INFORMATIVAS.map(p => `
            <div>
              <label style="display:flex;align-items:center;gap:10px;font-weight:400">
                <input type="checkbox" class="am-informativa-check" data-informativa="${p.id}" style="width:auto"> ${p.label}
              </label>
              ${p.pideDato ? `<input type="text" class="am-informativa-dato" data-informativa-dato="${p.id}" placeholder="${p.placeholder}" style="display:none;margin-top:4px;width:100%" disabled>` : ''}
            </div>`).join('')}
        </div>
      </div>

      <div class="field-group" style="margin-top:10px"><label for="am-prueba_otros">Otros medios de prueba (detallar)</label><textarea id="am-prueba_otros" rows="2"></textarea></div>

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:16px">
        <button class="btn btn-primary" id="am-generar">Generar amparo</button>
        <button class="btn btn-ghost"   id="am-limpiar">Limpiar</button>
      </div>

      <div id="am-resultado" style="display:none;margin-top:24px">
        <label for="am-texto" style="font-weight:600;display:block;margin-bottom:6px">Texto generado (editable)</label>
        <textarea id="am-texto" rows="30" style="width:100%;resize:vertical;font-family:inherit;font-size:.88rem;padding:12px;border:1px solid var(--color-border);border-radius:6px;background:#ffffff;color:#1a1a1a;line-height:1.6"></textarea>
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px">
          <button class="btn btn-success" id="am-copiar">📋 Copiar texto</button>
          <button class="btn btn-ghost"   id="am-word">📝 Exportar Word (.doc editable)</button>
          <button class="btn btn-ghost"   id="am-pdf">📄 Exportar PDF</button>
          <button class="btn btn-ghost"   id="am-reset-texto">Restablecer</button>
        </div>
      </div>

      <p style="margin-top:24px;font-size:.78rem;color:var(--color-muted);border-top:1px solid var(--color-border);padding-top:12px">
        Anteproyecto de escrito judicial. Adaptar al caso concreto. No constituye asesoramiento legal.
      </p>
    </div>`;

  function renderCamposGrupo(grupo, ids) {
    return CAMPOS_CONFIG.filter(c => c.grupo === grupo && ids.includes(c.id)).map(c => `
      <div class="field-group" id="am-wrap-${c.id}">
        <label for="am-${c.id}">${c.label}</label>
        ${c.tipo === 'textarea'
          ? `<textarea id="am-${c.id}" placeholder="${c.placeholder}" rows="2"></textarea>`
          : `<input type="${c.tipo}" id="am-${c.id}" placeholder="${c.placeholder}"${c.tipo === 'number' ? ' min="0" step="0.01"' : ''}>`
        }
      </div>`).join('');
  }

  // ── Referencias ────────────────────────────────────────────────────────────
  const selMateria  = container.querySelector('#am-materia');
  const selTipo     = container.querySelector('#am-tipo');
  const selAbogado  = container.querySelector('#am-abogado-select');
  const abogadoInfo = container.querySelector('#am-abogado-info');
  const inputEmailNotif = container.querySelector('#am-email_notificaciones');
  const divRes      = container.querySelector('#am-resultado');
  const textarea    = container.querySelector('#am-texto');
  let ultimoTextoGenerado = '';

  const wrapActoresExtra = container.querySelector('#am-actores-extra-wrapper');
  const wrapDemandadosExtra = container.querySelector('#am-demandados-extra-wrapper');
  let actoresExtraCount = 0, demandadosExtraCount = 0;

  function agregarActorExtra() {
    actoresExtraCount++;
    const id = actoresExtraCount;
    const div = document.createElement('div');
    div.className = 'form-row';
    div.id = `am-actor-extra-row-${id}`;
    div.innerHTML = `
      <div class="field-group" style="flex:2"><input type="text" id="am-actor-extra-nombre-${id}" placeholder="Nombre completo del/de la coactor/a"></div>
      <div class="field-group" style="flex:1"><input type="text" id="am-actor-extra-dni-${id}" placeholder="DNI"></div>
      <div class="field-group" style="flex:2"><input type="text" id="am-actor-extra-domicilio-${id}" placeholder="Domicilio real"></div>
      <div class="field-group" style="flex:0;align-self:flex-end"><button class="btn btn-ghost" type="button" data-remove-actor="${id}">✕</button></div>`;
    wrapActoresExtra.appendChild(div);
    div.querySelector('[data-remove-actor]').addEventListener('click', () => div.remove());
  }

  function agregarDemandadoExtra() {
    demandadosExtraCount++;
    const id = demandadosExtraCount;
    const div = document.createElement('div');
    div.className = 'form-row';
    div.id = `am-demandado-extra-row-${id}`;
    div.innerHTML = `
      <div class="field-group" style="flex:2"><input type="text" id="am-demandado-extra-nombre-${id}" placeholder="Razón social / nombre del/de la codemandado/a"></div>
      <div class="field-group" style="flex:2"><input type="text" id="am-demandado-extra-domicilio-${id}" placeholder="Domicilio"></div>
      <div class="field-group" style="flex:1"><input type="text" id="am-demandado-extra-afiliado-${id}" placeholder="N° de afiliado (opcional)"></div>
      <div class="field-group" style="flex:0;align-self:flex-end"><button class="btn btn-ghost" type="button" data-remove-demandado="${id}">✕</button></div>`;
    wrapDemandadosExtra.appendChild(div);
    div.querySelector('[data-remove-demandado]').addEventListener('click', () => div.remove());
  }

  container.querySelector('#am-add-actor').addEventListener('click', agregarActorExtra);
  container.querySelector('#am-add-demandado').addEventListener('click', agregarDemandadoExtra);

  function leerActoresExtra() {
    return Array.from(wrapActoresExtra.querySelectorAll('[id^="am-actor-extra-row-"]')).map(row => {
      const id = row.id.replace('am-actor-extra-row-', '');
      return {
        nombre: container.querySelector(`#am-actor-extra-nombre-${id}`)?.value.trim() || '',
        dni: container.querySelector(`#am-actor-extra-dni-${id}`)?.value.trim() || '',
        domicilio: container.querySelector(`#am-actor-extra-domicilio-${id}`)?.value.trim() || '',
      };
    }).filter(a => a.nombre);
  }

  function leerDemandadosExtra() {
    return Array.from(wrapDemandadosExtra.querySelectorAll('[id^="am-demandado-extra-row-"]')).map(row => {
      const id = row.id.replace('am-demandado-extra-row-', '');
      return {
        nombre: container.querySelector(`#am-demandado-extra-nombre-${id}`)?.value.trim() || '',
        domicilio: container.querySelector(`#am-demandado-extra-domicilio-${id}`)?.value.trim() || '',
        afiliado: container.querySelector(`#am-demandado-extra-afiliado-${id}`)?.value.trim() || '',
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
  wireBloqueToggle('am-prueba-confesional', 'am-wrap-confesional');
  wireBloqueToggle('am-prueba-doc_demandada', 'am-wrap-doc_demandada');
  wireBloqueToggle('am-prueba-testifical', 'am-wrap-testifical');
  wireBloqueToggle('am-prueba-pericial', 'am-wrap-pericial');

  container.querySelectorAll('.am-documental-check').forEach(chk => {
    chk.addEventListener('change', () => {
      const input = container.querySelector(`[data-documental-dato="${chk.dataset.documental}"]`);
      if (input) { input.disabled = !chk.checked; input.style.display = chk.checked ? 'block' : 'none'; }
    });
  });
  container.querySelectorAll('.am-informativa-check').forEach(chk => {
    chk.addEventListener('change', () => {
      const input = container.querySelector(`[data-informativa-dato="${chk.dataset.informativa}"]`);
      if (input) { input.disabled = !chk.checked; input.style.display = chk.checked ? 'block' : 'none'; }
    });
  });

  // ── Prueba testifical: testigos dinámicos (máx. 5) ──────────────────────
  const wrapTestigos = container.querySelector('#am-testigos-wrapper');
  const btnAddTestigo = container.querySelector('#am-add-testigo');
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
    div.id = `am-testigo-row-${id}`;
    div.innerHTML = `
      <div class="field-group" style="flex:2"><input type="text" id="am-testigo-nombre-${id}" placeholder="Nombre y apellido"></div>
      <div class="field-group" style="flex:1"><input type="text" id="am-testigo-dni-${id}" placeholder="DNI"></div>
      <div class="field-group" style="flex:3"><input type="text" id="am-testigo-domicilio-${id}" placeholder="Domicilio: calle N°, localidad, partido, provincia"></div>
      <div class="field-group" style="flex:0;align-self:flex-end"><button class="btn btn-ghost" type="button" data-remove-testigo="${id}">✕</button></div>`;
    wrapTestigos.appendChild(div);
    div.querySelector('[data-remove-testigo]').addEventListener('click', () => { div.remove(); testigosActivos--; actualizarBotonTestigo(); });
    actualizarBotonTestigo();
  }
  btnAddTestigo.addEventListener('click', agregarTestigo);

  function leerTestigos() {
    return Array.from(wrapTestigos.querySelectorAll('[id^="am-testigo-row-"]')).map(row => {
      const id = row.id.replace('am-testigo-row-', '');
      return {
        nombre: container.querySelector(`#am-testigo-nombre-${id}`)?.value.trim() || '',
        dni: container.querySelector(`#am-testigo-dni-${id}`)?.value.trim() || '',
        domicilio: container.querySelector(`#am-testigo-domicilio-${id}`)?.value.trim() || '',
      };
    }).filter(t => t.nombre);
  }

  // ── Sugerencias editables: pliego de confesional y puntos de pericia ────
  container.querySelector('#am-sugerir-pliego').addEventListener('click', () => {
    const nombreActor = val('am-nombre') || 'la parte actora';
    const diagnostico = val('am-diagnostico') || '[DIAGNÓSTICO]';
    const tratamiento = val('am-tratamiento_prescripto') || '[TRATAMIENTO/PRESTACIÓN]';
    const fechaSolicitud = val('am-fecha_solicitud') ? fmtFecha(val('am-fecha_solicitud')) : '[FECHA DE SOLICITUD]';
    const fechaNegativa = val('am-fecha_negativa') ? fmtFecha(val('am-fecha_negativa')) : '[FECHA DE LA NEGATIVA/OMISIÓN]';
    container.querySelector('#am-confesional_pliego').value =
`Solicito se cite al representante legal de la demandada a absolver posiciones a tenor del siguiente interrogatorio, sin perjuicio del pliego que se acompañará oportunamente:
Jure que es cierto:
a) ...que ${nombreActor} padece ${diagnostico};
b) ...que ${nombreActor} requiere ${tratamiento};
c) ...que con fecha ${fechaSolicitud} se solicitó a la demandada la cobertura de dicha prestación;
d) ...que la demandada denegó u omitió pronunciarse sobre dicha solicitud con fecha ${fechaNegativa};
e) Me reservo el derecho de ampliar el presente interrogatorio.-`;
  });

  container.querySelector('#am-sugerir-pericial').addEventListener('click', () => {
    const nombreActor = val('am-nombre') || 'la parte actora';
    const diagnostico = val('am-diagnostico') || '[DIAGNÓSTICO]';
    const tratamiento = val('am-tratamiento_prescripto') || '[TRATAMIENTO/PRESTACIÓN]';
    container.querySelector('#am-pericial_puntos').value =
`Se designe Perito Médico/a único/a de oficio, especialista según la patología de autos, para que, previo examen de ${nombreActor} y de la historia clínica obrante en la causa, informe:
a) Diagnóstico actual de ${nombreActor} y su evolución;
b) Si el tratamiento/prestación consistente en ${tratamiento} resulta médicamente adecuado, necesario y no sustituible por alternativas de igual eficacia y menor costo;
c) Si la demora u omisión en su otorgamiento genera riesgo cierto de agravamiento del cuadro de salud y/o de daño irreversible;
d) Todo otro dato de interés que contribuya a la solución del pleito.`;
  });

  function fmtMoneda(n) { return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  function actualizarAbogado() {
    const a = ABOGADOS_BY_ID[selAbogado.value];
    if (!a) return;
    inputEmailNotif.value = a.domicilioElectronico;
    container.querySelector('#am-matricula').value = a.matricula;
    abogadoInfo.textContent = `Celular: ${a.celular}  ·  Email: ${EMAIL_ESTUDIO}`;
  }
  selAbogado.addEventListener('change', actualizarAbogado);

  function poblarTipos() {
    const materia = MATERIAS[materiaActual];
    selTipo.innerHTML = Object.entries(materia.tipos).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('');
  }

  function renderizarCampos() {
    const materia = MATERIAS[materiaActual];
    const idsUsados = new Set(['riesgo_salud']);
    Object.values(materia.tipos).forEach(t => [...t.requiere, ...t.opcionales].forEach(id => idsUsados.add(id)));
    const ids = Array.from(idsUsados);
    container.querySelector('#am-grupo-actor').innerHTML = renderCamposGrupo('actor', ids);
    container.querySelector('#am-grupo-demandado').innerHTML = renderCamposGrupo('demandado', ids);
    container.querySelector('#am-grupo-hecho').innerHTML = renderCamposGrupo('hecho', ids);
    container.querySelector('#am-grupo-cautelar').innerHTML = renderCamposGrupo('cautelar', ids);
  }

  function actualizarCamposVisibles() {
    const materia = MATERIAS[materiaActual];
    const tipo = materia.tipos[selTipo.value];
    if (!tipo) return;
    const todos = [...tipo.requiere, ...tipo.opcionales, 'riesgo_salud'];
    CAMPOS_CONFIG.forEach(c => {
      const wrap = container.querySelector(`#am-wrap-${c.id}`);
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
  container.querySelector('#am-generar').addEventListener('click', () => {
    const materia = MATERIAS[materiaActual];
    const tipo = materia.tipos[selTipo.value];
    const requeridos = [...tipo.requiere, 'riesgo_salud'];

    CAMPOS_CONFIG.forEach(c => container.querySelector(`#am-${c.id}`)?.classList.remove('error'));
    let ok = true;
    for (const id of requeridos) {
      const el = container.querySelector(`#am-${id}`);
      if (el && !el.value.trim()) { el.classList.add('error'); ok = false; }
    }
    if (!ok) return;

    const d = {};
    [...tipo.requiere, ...tipo.opcionales, 'riesgo_salud'].forEach(id => {
      const el = container.querySelector(`#am-${id}`);
      if (el) d[id] = el.value.trim();
    });
    Object.keys(d).forEach(k => {
      const cfg = CAMPOS_BY_ID[k];
      if (cfg && cfg.tipo === 'date' && d[k]) d[k] = fmtFecha(d[k]);
    });
    ['monto_tratamiento','monto_cuota_anterior','monto_cuota_nueva'].forEach(k => {
      if (d[k]) d[k] = fmtMoneda(parseFloat(d[k]));
    });

    const abogadoSel = ABOGADOS_BY_ID[selAbogado.value];
    const matricula = val('am-matricula') || 'T° __ F° __';
    const abogadoTexto = `Dr./Dra. ${abogadoSel.nombre}, ${matricula}`;
    const caracterLetradoValor = val('am-caracter-letrado');
    const caracterLetradoTexto = caracterLetradoValor === 'apoderado' ? 'apoderado/a' : 'patrocinante';
    const juzgado = val('am-juzgado');
    const domicilioProcesal = val('am-domicilio_procesal') || '[DOMICILIO PROCESAL A CONSTITUIR]';
    const emailNotif = val('am-email_notificaciones') || abogadoSel.domicilioElectronico;

    const actoresExtra = leerActoresExtra();
    const demandadosExtra = leerDemandadosExtra();
    const coactoresTexto = joinConY(actoresExtra.map(a => `${a.nombre}, DNI ${a.dni || '[DNI]'}${a.domicilio ? `, con domicilio real en ${a.domicilio}` : ''}`));
    const demandadosNombres = [d.razon_social, ...demandadosExtra.map(x => x.nombre)];
    const demandadosTextoObjeto = joinConY([
      `${d.razon_social}, con domicilio en ${d.dom_destinatario}${d.numero_afiliado ? ` (N° de afiliado ${d.numero_afiliado})` : ''}`,
      ...demandadosExtra.map(x => `${x.nombre}, con domicilio en ${x.domicilio || '[DOMICILIO]'}${x.afiliado ? ` (N° de afiliado ${x.afiliado})` : ''}`),
    ]);
    const demandadosTextoPetitorio = joinConY(demandadosNombres);

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
    if (container.querySelector('#am-prueba-confesional').checked) {
      nProb++;
      const pliego = val('am-confesional_pliego') || 'Solicito se cite al representante legal de la demandada a absolver posiciones a tenor del pliego que se acompañará oportunamente.';
      bloquesPrueba.push(`${nProb}.- Prueba Confesional: ${pliego}`);
    }

    // 3. Documental en poder de la demandada
    if (container.querySelector('#am-prueba-doc_demandada').checked) {
      nProb++;
      const detalleDD = val('am-doc_demandada_detalle') || '[DETALLAR DOCUMENTACIÓN EN PODER DE LA DEMANDADA]';
      bloquesPrueba.push(`${nProb}.- Documental en poder de la demandada: Denuncio como documental en poder de la demandada: ${detalleDD}. Peticiono se libre cédula a fin de que la presente en autos, bajo apercibimiento de ley.`);
    }

    // 4. Testifical
    if (container.querySelector('#am-prueba-testifical').checked) {
      nProb++;
      const testigos = leerTestigos();
      if (testigos.length) {
        const nomina = testigos.map((t, i) => `${letrasProb[i]}).- ${t.nombre}, DNI ${t.dni || '[DNI]'}, con domicilio en ${t.domicilio || '[DOMICILIO COMPLETO]'}`).join('; ');
        bloquesPrueba.push(`${nProb}.- Prueba Testifical: Solicito se cite a prestar declaración testimonial a las siguientes personas: ${nomina}.-`);
      } else {
        bloquesPrueba.push(`${nProb}.- Prueba Testifical: Solicito se cite a prestar declaración testimonial a las personas que se individualizarán oportunamente [COMPLETAR NÓMINA DE TESTIGOS Y DOMICILIOS].`);
      }
    }

    // 5. Pericial médica
    if (container.querySelector('#am-prueba-pericial').checked) {
      nProb++;
      const puntos = val('am-pericial_puntos') || 'Se designe Perito Médico/a de oficio para que informe sobre los extremos de la presente demanda [DETALLAR PUNTOS DE PERICIA].';
      bloquesPrueba.push(`${nProb}.- Prueba Pericial Médica: ${puntos}`);
    }

    // 6. Informativa
    const informativasActivas = INFORMATIVAS.filter(p => container.querySelector(`[data-informativa="${p.id}"]`).checked);
    if (informativasActivas.length) {
      nProb++;
      const nBloque = nProb;
      const subitems = informativasActivas.map((p, i) => {
        const n = `${nBloque}.${i + 1}`;
        if (p.id === 'demandada') {
          return `${n}.- Se libre Oficio a la propia demandada, a fin de que remita los antecedentes del reclamo administrativo efectuado por ${d.nombre || 'la parte actora'} y las constancias de su tratamiento.`;
        }
        if (p.id === 'anmat') {
          return `${n}.- Se libre Oficio a la Administración Nacional de Medicamentos, Alimentos y Tecnología Médica (ANMAT), a fin de que informe sobre el registro, aprobación y disponibilidad del tratamiento/medicación requerido.`;
        }
        if (p.id === 'min_salud') {
          return `${n}.- Se libre Oficio al Ministerio de Salud que corresponda según la jurisdicción, a fin de que informe sobre la existencia, eficacia y disponibilidad del tratamiento/prestación requerido.`;
        }
        if (p.id === 'senadis') {
          return `${n}.- Se libre Oficio a la Agencia Nacional de Discapacidad / Secretaría Nacional de Discapacidad (SeNaDis/ANDIS), a fin de que informe sobre los antecedentes vinculados a la cobertura reclamada.`;
        }
        return `${n}.- ${p.label}`;
      }).join('\n');
      bloquesPrueba.push(`${nProb}.- Prueba Informativa:\n${subitems}`);
    }

    if (val('am-prueba_otros')) { nProb++; bloquesPrueba.push(`${nProb}.- Otros medios de prueba: ${val('am-prueba_otros')}`); }

    const hechosTipo = tipo.hechos(d);
    const derechoTipo = tipo.derecho(d);

    const texto =
`SEÑOR JUEZ${juzgado ? ` — ${juzgado}` : ''}:

${abogadoTexto}, en mi carácter de ${caracterLetradoTexto} de ${d.nombre}, DNI ${d.dni}, con domicilio real en ${d.domicilio}${coactoresTexto ? `, y de ${coactoresTexto}` : ''}, constituyendo domicilio procesal en ${domicilioProcesal} y domicilio electrónico en ${emailNotif} (art. 40, CPCC), a V.S. respetuosamente me presento y digo:

I. OBJETO
Que vengo por el presente a promover ACCIÓN DE AMPARO (art. 43, Constitución Nacional; Ley 16.986) CON MEDIDA CAUTELAR contra ${demandadosTextoObjeto}, a fin de que se condene a la demandada a brindar la cobertura/prestación reclamada, por resultar la negativa/omisión de ${materia.encuadreDemandado} manifiestamente arbitraria e ilegítima y lesiva de los derechos constitucionales a la salud y a la vida de la parte actora, con más sus costas.

II. HECHOS
${hechosTipo}

III. PROCEDENCIA DE LA VÍA DEL AMPARO
${PROCEDENCIA_AMPARO}

IV. COMPETENCIA
${materia.competenciaTexto}

V. EL DERECHO
${FUNDAMENTO_COMUN} ${derechoTipo}

VI. MEDIDA CAUTELAR
Que atento la urgencia expuesta, solicito a V.S. el dictado de una medida cautelar innovativa/de no innovar, en los términos del art. 230 y ccdtes. del Código Procesal Civil y Comercial de la Nación, ordenando a la demandada que, en forma inmediata y hasta tanto recaiga sentencia definitiva, brinde la cobertura/prestación objeto de la presente. Fundo la procedencia de la cautelar en que se encuentra configurada la verosimilitud del derecho invocado conforme los fundamentos expuestos en el acápite V, así como el peligro en la demora, toda vez que ${d.riesgo_salud}. ${CAUTELAR_ESTANDAR} Ofrezco caución juratoria, atento el carácter alimentario de los derechos en juego.

VII. PRUEBA
${bloquesPrueba.length ? bloquesPrueba.join('\n\n') : '- [DETALLAR MEDIOS DE PRUEBA OFRECIDOS]'}

VIII. AUTORIZACIONES
Autorizo indistintamente a ${TODOS_ABOGADOS_TEXTO} a compulsar el expediente, tomar vista de las actuaciones, retirar y diligenciar cédulas, oficios, mandamientos, testimonios, copias y demás documentación, y a realizar cualquier otro trámite relacionado con las presentes actuaciones.

IX. PETITORIO
Por lo expuesto, a V.S. solicito:
1) Me tenga por presentado, por parte y por constituido el domicilio procesal indicado.
2) Se tenga por promovida la presente acción de amparo contra ${demandadosTextoPetitorio}.
3) Se dicte la medida cautelar solicitada en el acápite VI, con carácter urgente e inaudita parte.
4) Se tenga presente la prueba ofrecida y se provea oportunamente su producción.
5) Se tengan presentes las autorizaciones conferidas en el punto VIII.
6) Oportunamente, se haga lugar a la demanda en todas sus partes, condenando a la demandada a brindar la cobertura/prestación reclamada, con más sus costas.

PROVEER DE CONFORMIDAD,
SERÁ JUSTICIA.

──────────────────────────────────────────────
Recordatorios previos a la presentación (no forman parte del escrito):
- Verificar el Juzgado/Fuero competente conforme el sujeto demandado (federal o provincial) y, en su caso, la Ley 13.928 (Amparo PBA) si tramita ante fuero provincial — extremo no verificado en esta versión.
- Acompañar toda la documentación médica que acredite el diagnóstico, la prescripción y la negativa/omisión de la demandada.
- Verificar el articulado específico de la normativa citada en los supuestos marcados como pendientes de revisión (TRHA, salud mental, HIV, cannabis medicinal, trasplante, migrantes, ART, DNU 70/2023).
- Confirmar si corresponde el pago de tasa de justicia o si resulta aplicable alguna exención (beneficio de litigar sin gastos).${(actoresExtra.length || demandadosExtra.length) ? `
- LITISCONSORCIO: se cargaron ${actoresExtra.length} coactor/es y ${demandadosExtra.length} codemandado/s adicional/es. El relato de HECHOS, EL DERECHO y la MEDIDA CAUTELAR fueron redactados sobre los datos del actor y de la demandada principales — revisar y adaptar manualmente esos puntos si los coactores/codemandados tuvieran datos, diagnóstico o riesgo de salud propios.` : ''}`;

    ultimoTextoGenerado = texto;
    textarea.value = texto;
    divRes.style.display = 'block';
    textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  container.querySelector('#am-limpiar').addEventListener('click', () => {
    CAMPOS_CONFIG.forEach(c => { const el = container.querySelector(`#am-${c.id}`); if (el) { el.value = ''; el.classList.remove('error'); } });
    container.querySelector('#am-juzgado').value = '';
    container.querySelector('#am-domicilio_procesal').value = '';
    container.querySelector('#am-prueba_otros').value = '';
    selAbogado.selectedIndex = 0;
    container.querySelector('#am-caracter-letrado').selectedIndex = 0;
    wrapActoresExtra.innerHTML = '';
    wrapDemandadosExtra.innerHTML = '';
    actoresExtraCount = 0;
    demandadosExtraCount = 0;

    container.querySelectorAll('.am-documental-check, .am-informativa-check').forEach(c => c.checked = false);
    container.querySelectorAll('.am-documental-dato, .am-informativa-dato').forEach(el => { el.value = ''; el.disabled = true; el.style.display = 'none'; });
    container.querySelector('#am-confesional_pliego').value = '';
    container.querySelector('#am-doc_demandada_detalle').value = '';
    container.querySelector('#am-pericial_puntos').value = '';
    wrapTestigos.innerHTML = '';
    testigosCount = 0; testigosActivos = 0;
    actualizarBotonTestigo();
    container.querySelector('#am-prueba-confesional').checked = true;
    container.querySelector('#am-prueba-doc_demandada').checked = false;
    container.querySelector('#am-prueba-testifical').checked = false;
    container.querySelector('#am-prueba-pericial').checked = true;
    container.querySelector('#am-wrap-confesional').style.display = 'block';
    container.querySelector('#am-wrap-doc_demandada').style.display = 'none';
    container.querySelector('#am-wrap-testifical').style.display = 'none';
    container.querySelector('#am-wrap-pericial').style.display = 'block';
    actualizarAbogado();
    divRes.style.display = 'none';
    textarea.value = '';
    ultimoTextoGenerado = '';
  });

  container.querySelector('#am-copiar').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      const btn = container.querySelector('#am-copiar');
      const orig = btn.textContent;
      btn.textContent = 'Copiado ✓';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => prompt('Copie el texto:', texto));
  });

  container.querySelector('#am-reset-texto').addEventListener('click', () => {
    if (ultimoTextoGenerado) textarea.value = ultimoTextoGenerado;
  });

  container.querySelector('#am-word').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const htmlBody = texto.split('\n').map(linea => {
      if (!linea.trim()) return '<p>&nbsp;</p>';
      const negrita = /^(SEÑOR JUEZ|I\.|II\.|III\.|IV\.|V\.|VI\.|VII\.|VIII\.|IX\.|PROVEER|SERÁ JUSTICIA|Recordatorios)/.test(linea.trim());
      const esc = linea.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<p style="margin:0 0 8pt 0;${negrita ? 'font-weight:bold;' : ''}">${esc}</p>`;
    }).join('\n');
    exportarWord(`Amparo salud - ${val('am-nombre') || 'actor'} c. ${val('am-razon_social') || 'demandado'}`, htmlBody);
  });

  container.querySelector('#am-pdf').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const lineas = texto.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    exportarPDF(`Amparo salud — ${val('am-nombre') || 'actor'} c. ${val('am-razon_social') || 'demandado'}`, `<div class="info-box" style="font-size:12px;line-height:1.7">${lineas}</div>`);
  });
}
