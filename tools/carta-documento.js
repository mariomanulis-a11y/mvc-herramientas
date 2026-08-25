// Generador de Carta Documento / Telegrama — multi-materia
// Estructura de modelos inspirada en la sistemática clásica de Abatti-Rocca
// ("550 Modelos Usuales de Cartas Documento"), adaptada a la normativa vigente (2026).
import { exportarPDF, exportarCSV } from './exportar.js';

export function initCartaDocumento(container) {

  // ── Ramas / materias ──────────────────────────────────────────────────────
  const RAMAS_CD = {
    laboral: {
      label: 'Derecho Laboral',
      remitenteLabel: 'Remitente (trabajador/a)',
      destinatarioLabel: 'Destinatario (empleador)',
      detalleLabel: 'Datos laborales',
      revisionPendiente: false,
      plantillas: {
        intim_registro: {
          label: 'Intimación registro laboral (Arts. 7-11 Ley 24.013)',
          requiere: ['nombre','dni','domicilio','razon_social','cuit','dom_destinatario','fecha_ingreso'],
          opcionales: ['remuneracion'],
          generar: (d) => `Por medio de la presente, yo ${d.nombre}, DNI ${d.dni}, con domicilio en ${d.domicilio}, en mi carácter de trabajador/a en relación de dependencia de ${d.razon_social}, CUIT ${d.cuit}, con domicilio en ${d.dom_destinatario}, intimo a Ud. en los términos del art. 11 de la ley 24.013 y art. 47 del dec. 1043/2001 para que en el plazo de TREINTA (30) días hábiles proceda a: 1) Registrar debidamente la relación laboral que me une a su empresa desde el día ${d.fecha_ingreso}; 2) Consignar mi remuneración real de ${d.remuneracion ? '$ ' + d.remuneracion + ' mensuales' : '[REMUNERACIÓN A COMPLETAR]'}. Bajo apercibimiento de las multas previstas en los arts. 8, 9 y 10 de la ley 24.013. Reservo acciones. Hago extensiva la presente notificación a la AFIP conforme art. 47 del decreto mencionado.`,
        },
        intim_despido: {
          label: 'Notificación de despido indirecto (Art. 246 LCT)',
          requiere: ['nombre','dni','domicilio','razon_social'],
          opcionales: ['incumplimiento'],
          generar: (d) => `Por medio de la presente, yo ${d.nombre}, DNI ${d.dni}, con domicilio en ${d.domicilio}, me considero gravemente injuriado/a y despedido/a en forma indirecta con causa imputable a Ud. en los términos del art. 246 en función del art. 242 de la LCT, en virtud de ${d.incumplimiento ? d.incumplimiento : '[DESCRIBIR INCUMPLIMIENTO]'}. Intimo al pago de los rubros emergentes del distracto en el plazo del art. 128 LCT, bajo apercibimiento de aplicación de las multas del art. 2 ley 25.323. Reservo todo otro derecho.`,
        },
        telegrama_reserva: {
          label: 'Telegrama reserva de acciones (Art. 243 LCT)',
          requiere: ['razon_social','fecha_hecho'],
          opcionales: ['nombre'],
          generar: (d) => `Me dirijo a Ud. en mi carácter de trabajador/a dependiente de ${d.razon_social} a efectos de notificarle que con fecha ${d.fecha_hecho} he iniciado acciones laborales reclamando los conceptos derivados de la relación laboral. Reservo acciones. Notifico a AFIP.`,
        },
        intim_haberes: {
          label: 'Intimación pago de haberes',
          requiere: ['razon_social'],
          opcionales: ['mes_anio','remuneracion'],
          generar: (d) => `Intimo a Ud. por la presente al pago de haberes del mes de ${d.mes_anio ? d.mes_anio : '[MES/AÑO]'} por la suma de ${d.remuneracion ? '$ ' + d.remuneracion : '[MONTO]'} y/o los que correspondan, en el plazo de cuarenta y ocho (48) horas, bajo apercibimiento de considerarme en situación de despido indirecto con causa (art. 246 LCT) y reclamar las multas del art. 2 ley 25.323.`,
        },
        intim_certificados: {
          label: 'Intimación entrega de certificados (Art. 80 LCT)',
          requiere: ['razon_social'],
          opcionales: [],
          generar: () => `Intimo a Ud. en los términos del art. 80 LCT y decreto 146/2001 para que en el plazo de TREINTA (30) días corridos me haga entrega del certificado de trabajo, certificado de servicios y aportes, y constancia de extinción de la relación laboral, bajo apercibimiento de reclamar la indemnización prevista en el art. 80 in fine LCT (equivalente a 3 meses de remuneración).`,
        },
        ley25323: {
          label: 'Intimación fehaciente Ley 25.323',
          requiere: ['razon_social','fecha_hecho'],
          opcionales: [],
          generar: (d) => `En los términos del art. 2 de la ley 25.323, intimo a Ud. para que en el plazo de veinticuatro (24) horas abone las indemnizaciones por despido previstas en los arts. 232, 233 y 245 de la LCT que se encuentran impagas desde el ${d.fecha_hecho}, bajo apercibimiento del recargo del CINCUENTA POR CIENTO (50%) sobre dichos conceptos.`,
        },
      },
    },

    civil: {
      label: 'Civil — Contratos y Obligaciones',
      remitenteLabel: 'Remitente',
      destinatarioLabel: 'Destinatario',
      detalleLabel: 'Datos del contrato / obligación',
      revisionPendiente: true,
      plantillas: {
        civil_mora_pago: {
          label: 'Intimación de pago (obligación dineraria)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','monto_adeudado'],
          opcionales: ['fecha_hecho','objeto_obligacion'],
          generar: (d) => `Por medio de la presente, intimo a Ud. para que en el plazo de CINCO (5) días hábiles proceda a abonar la suma de $ ${d.monto_adeudado} en concepto de ${d.objeto_obligacion ? d.objeto_obligacion : 'obligación adeudada'}${d.fecha_hecho ? `, con más sus intereses moratorios desde el día ${d.fecha_hecho}` : ', con más sus intereses moratorios'}, bajo apercibimiento de iniciar las acciones legales que correspondan (arts. 886 y concs. del Código Civil y Comercial de la Nación) y de reclamar los daños y perjuicios ocasionados por su incumplimiento.`,
        },
        civil_resolucion_clausula: {
          label: 'Emplazamiento bajo apercibimiento de resolución (Art. 1088 CCCN)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','incumplimiento'],
          opcionales: [],
          generar: (d) => `Por medio de la presente, y en virtud del incumplimiento en que Ud. ha incurrido respecto de ${d.incumplimiento}, lo/a emplazo, en los términos del art. 1088 del Código Civil y Comercial de la Nación, para que en el plazo de QUINCE (15) días cumpla con las obligaciones a su cargo, bajo expreso apercibimiento de tener por resuelto el contrato de pleno derecho una vez vencido dicho plazo sin necesidad de otra manifestación de mi parte, con más los daños y perjuicios que dicho incumplimiento me ocasione.`,
        },
        civil_escrituracion: {
          label: 'Intimación de escrituración (boleto de compraventa)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','objeto_obligacion'],
          opcionales: ['fecha_hecho'],
          generar: (d) => `Por medio de la presente, en mi carácter de comprador/a del inmueble sito en ${d.objeto_obligacion}, conforme boleto de compraventa suscripto${d.fecha_hecho ? ` con fecha ${d.fecha_hecho}` : ''}, intimo a Ud. para que en el plazo de DIEZ (10) días hábiles proceda a otorgar la correspondiente escritura traslativa de dominio, en los términos del art. 1018 del Código Civil y Comercial de la Nación, bajo apercibimiento de solicitar judicialmente que la escrituración sea otorgada por el juez interviniente a su costa, con más los daños y perjuicios derivados de la demora.`,
        },
        civil_restitucion_comodato: {
          label: 'Reclamo de restitución de bien (comodato vencido)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','objeto_obligacion'],
          opcionales: [],
          generar: (d) => `Por medio de la presente, intimo a Ud. para que en el plazo de CINCO (5) días hábiles proceda a restituirme ${d.objeto_obligacion}, entregado/a en calidad de préstamo de uso (comodato), bajo apercibimiento de considerar configurada su tenencia indebida y de iniciar las acciones legales que correspondan, en los términos del art. 1536, inc. e), del Código Civil y Comercial de la Nación.`,
        },
        civil_constitucion_mora: {
          label: 'Constitución en mora y reserva de derechos (genérico)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','incumplimiento'],
          opcionales: [],
          generar: (d) => `Por medio de la presente, dejo a Ud. formalmente constituido/a en mora respecto de ${d.incumplimiento}, y me reservo el derecho de reclamar el cumplimiento forzado de la obligación y/o su resolución, con más los daños y perjuicios ocasionados, sin perjuicio de las acciones judiciales que en derecho correspondan.`,
        },
      },
    },

    consumidor: {
      label: 'Derecho del Consumidor',
      remitenteLabel: 'Consumidor/a',
      destinatarioLabel: 'Proveedor / Empresa',
      detalleLabel: 'Datos del consumo',
      revisionPendiente: true,
      plantillas: {
        cons_producto_defectuoso: {
          label: 'Reclamo por producto/servicio defectuoso (Art. 10 bis Ley 24.240)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','producto_servicio','incumplimiento'],
          opcionales: ['fecha_operacion'],
          generar: (d) => `Por medio de la presente, en mi carácter de consumidor/a del producto/servicio ${d.producto_servicio}, adquirido${d.fecha_operacion ? ` con fecha ${d.fecha_operacion}` : ''}, hago saber a Ud. que el mismo presenta el siguiente defecto/incumplimiento: ${d.incumplimiento}. En los términos del art. 10 bis de la Ley 24.240, exijo el cumplimiento de la prestación en el plazo de DIEZ (10) días hábiles, bajo apercibimiento de optar por la aceptación de otro producto o servicio equivalente, o por la resolución del contrato con restitución de las sumas abonadas, con más los daños y perjuicios que correspondan.`,
        },
        cons_garantia: {
          label: 'Intimación por garantía legal no honrada (Arts. 11 a 18 Ley 24.240)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','producto_servicio','fecha_operacion'],
          opcionales: [],
          generar: (d) => `Por medio de la presente, intimo a Ud. para que en el plazo de DIEZ (10) días hábiles proceda a hacer efectiva la garantía legal correspondiente al producto ${d.producto_servicio}, adquirido con fecha ${d.fecha_operacion}, reparándolo, sustituyéndolo o restituyendo las sumas abonadas, conforme lo dispuesto por los arts. 11 a 18 de la Ley 24.240, bajo apercibimiento de iniciar las acciones legales y administrativas que correspondan.`,
        },
        cons_rescision: {
          label: 'Rescisión de contrato de consumo con restitución de sumas',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','producto_servicio'],
          opcionales: ['incumplimiento'],
          generar: (d) => `Por medio de la presente, comunico a Ud. mi decisión de rescindir el contrato de consumo relativo a ${d.producto_servicio}, en los términos del art. 10 bis inc. c) de la Ley 24.240${d.incumplimiento ? `, en virtud de ${d.incumplimiento}` : ''}, e intimo a la restitución de las sumas abonadas en el plazo de DIEZ (10) días hábiles, bajo apercibimiento de iniciar las acciones judiciales y/o administrativas que correspondan.`,
        },
        cons_trato_indigno: {
          label: 'Reclamo por trato indigno / práctica abusiva (Art. 8 bis Ley 24.240)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','incumplimiento'],
          opcionales: [],
          generar: (d) => `Por medio de la presente, hago saber a Ud. que en su trato hacia mí, en mi carácter de consumidor/a, ha incurrido en ${d.incumplimiento}, lo cual constituye una infracción al deber de trato digno y equitativo previsto en el art. 8 bis de la Ley 24.240. Intimo a Ud. a cesar en dicha conducta en forma inmediata, bajo apercibimiento de efectuar la denuncia administrativa pertinente ante la autoridad de aplicación y de iniciar las acciones judiciales que correspondan, incluyendo el reclamo del daño punitivo previsto en el art. 52 bis de la citada ley.`,
        },
        cons_intimacion_previa_punitivo: {
          label: 'Intimación previa a demanda por daño punitivo (Art. 52 bis)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','incumplimiento'],
          opcionales: [],
          generar: (d) => `Por medio de la presente, y ante el incumplimiento de sus obligaciones legales y contractuales consistente en ${d.incumplimiento}, intimo a Ud. para que en el plazo de CINCO (5) días hábiles regularice su situación, bajo apercibimiento de iniciar las acciones judiciales correspondientes, en las que reclamaré, además de los daños y perjuicios sufridos, la aplicación de la multa civil (daño punitivo) prevista en el art. 52 bis de la Ley 24.240, en atención a la gravedad de su conducta.`,
        },
      },
    },

    locaciones: {
      label: 'Locaciones Urbanas',
      remitenteLabel: 'Remitente',
      destinatarioLabel: 'Destinatario',
      detalleLabel: 'Datos de la locación',
      revisionPendiente: true,
      plantillas: {
        loc_intimacion_pago: {
          label: 'Intimación de pago de alquileres adeudados',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','direccion_inmueble','monto_adeudado','periodo_adeudado'],
          opcionales: [],
          generar: (d) => `Por medio de la presente, en mi carácter de locador/a del inmueble sito en ${d.direccion_inmueble}, intimo a Ud. para que en el plazo de DIEZ (10) días corridos proceda a abonar la suma de $ ${d.monto_adeudado}, en concepto de alquileres adeudados correspondientes al/los período/s ${d.periodo_adeudado}, con más sus intereses moratorios, bajo apercibimiento de considerar resuelto el contrato de locación y de iniciar las acciones judiciales de desalojo y cobro de pesos que correspondan.`,
        },
        loc_rescision_anticipada: {
          label: 'Notificación de rescisión anticipada (por el/la locatario/a)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','direccion_inmueble','fecha_hecho'],
          opcionales: [],
          generar: (d) => `Por medio de la presente, en mi carácter de locatario/a del inmueble sito en ${d.direccion_inmueble}, notifico a Ud. mi decisión de rescindir anticipadamente el contrato de locación que nos vincula, conforme la facultad prevista en el Código Civil y Comercial de la Nación, procediendo a la restitución del inmueble con fecha ${d.fecha_hecho}, dejando constancia de que se hará efectivo el pago de la indemnización legal que pudiera corresponder según la antigüedad de la locación.`,
        },
        loc_restitucion_vencimiento: {
          label: 'Intimación de restitución del inmueble al vencimiento',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','direccion_inmueble','fecha_vencimiento_contrato'],
          opcionales: [],
          generar: (d) => `Por medio de la presente, hago saber a Ud. que el contrato de locación del inmueble sito en ${d.direccion_inmueble} se encuentra vencido desde el día ${d.fecha_vencimiento_contrato}, por lo que intimo a Ud. para que en el plazo de DIEZ (10) días corridos proceda a la restitución del inmueble libre de ocupantes y en buen estado de conservación, bajo apercibimiento de iniciar las acciones judiciales de desalojo que correspondan, con más el reclamo de los daños y perjuicios ocasionados por la ocupación indebida.`,
        },
        loc_reparaciones: {
          label: 'Reclamo de reparaciones a cargo del/de la locador/a',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','direccion_inmueble','incumplimiento'],
          opcionales: [],
          generar: (d) => `Por medio de la presente, en mi carácter de locatario/a del inmueble sito en ${d.direccion_inmueble}, intimo a Ud., en su carácter de locador/a, para que en el plazo de DIEZ (10) días hábiles proceda a efectuar las reparaciones necesarias respecto de ${d.incumplimiento}, las cuales resultan a su exclusivo cargo por tratarse de reparaciones que hacen a la aptitud de la cosa para su destino, bajo apercibimiento de realizarlas por mi cuenta y cargo y descontar su costo del canon locativo, sin perjuicio de las demás acciones legales que correspondan.`,
        },
        loc_expensas: {
          label: 'Reclamo de expensas o gastos comunes',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','direccion_inmueble','monto_adeudado','periodo_adeudado'],
          opcionales: [],
          generar: (d) => `Por medio de la presente, intimo a Ud. para que en el plazo de DIEZ (10) días hábiles proceda a abonar la suma de $ ${d.monto_adeudado} en concepto de expensas y/o gastos comunes correspondientes al inmueble sito en ${d.direccion_inmueble}, período/s ${d.periodo_adeudado}, bajo apercibimiento de iniciar las acciones judiciales de cobro que correspondan, con más sus intereses y costas.`,
        },
      },
    },

    familia_sucesiones_societario: {
      label: 'Sucesiones, Societario y Familia',
      remitenteLabel: 'Remitente',
      destinatarioLabel: 'Destinatario',
      detalleLabel: 'Datos del caso',
      revisionPendiente: true,
      plantillas: {
        suc_intimacion_particion: {
          label: '[Sucesiones] Intimación a coheredero/a — inicio de sucesión / partición',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario'],
          opcionales: ['incumplimiento'],
          generar: (d) => `Por medio de la presente, en mi carácter de coheredero/a del/de la causante ${d.incumplimiento ? d.incumplimiento : '[NOMBRE DEL/DE LA CAUSANTE]'}, intimo a Ud. para que en el plazo de DIEZ (10) días hábiles preste su conformidad para el inicio del juicio sucesorio y/o para la partición privada de los bienes que integran el acervo hereditario (art. 2369 del Código Civil y Comercial de la Nación), bajo apercibimiento de iniciar dichas actuaciones judicialmente sin su intervención.`,
        },
        soc_rendicion_cuentas: {
          label: '[Societario] Intimación de rendición de cuentas a socio/a administrador/a',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario'],
          opcionales: ['cargo_social'],
          generar: (d) => `Por medio de la presente, en mi carácter de socio/a${d.cargo_social ? ` (${d.cargo_social})` : ''}, intimo a Ud. para que en el plazo de DIEZ (10) días hábiles proceda a rendir cuentas documentadas de su gestión como administrador/a de la sociedad, conforme lo dispuesto por el art. 858 y concordantes del Código Civil y Comercial de la Nación y el art. 55 de la Ley General de Sociedades N° 19.550, bajo apercibimiento de iniciar las acciones judiciales que correspondan.`,
        },
        soc_exclusion: {
          label: '[Societario] Notificación de exclusión de socio/a (Art. 91 Ley 19.550)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','incumplimiento'],
          opcionales: [],
          generar: (d) => `Por medio de la presente, notifico a Ud. que, en virtud de ${d.incumplimiento}, se ha resuelto promover su exclusión como socio/a de la sociedad, en los términos del art. 91 de la Ley General de Sociedades N° 19.550, intimándolo/a a estar a derecho en las actuaciones que a tal efecto se inicien.`,
        },
        fam_alimentos: {
          label: '[Familia] Intimación de pago de cuota alimentaria adeudada',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','monto_cuota','periodo_adeudado'],
          opcionales: ['vinculo_familiar'],
          generar: (d) => `Por medio de la presente, en mi carácter de ${d.vinculo_familiar ? d.vinculo_familiar : 'progenitor/a conviviente'}, intimo a Ud. para que en el plazo de CINCO (5) días hábiles proceda a abonar la suma de $ ${d.monto_cuota} en concepto de cuota alimentaria adeudada correspondiente al/los período/s ${d.periodo_adeudado}, conforme lo dispuesto por los arts. 658 y concordantes del Código Civil y Comercial de la Nación, bajo apercibimiento de iniciar las acciones judiciales de cobro y de solicitar las medidas conminatorias y/o penales que correspondan (Ley 13.944).`,
        },
        fam_regimen_comunicacion: {
          label: '[Familia] Reclamo por incumplimiento del régimen de comunicación',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','incumplimiento'],
          opcionales: ['vinculo_familiar'],
          generar: (d) => `Por medio de la presente, intimo a Ud. para que dé estricto cumplimiento al régimen de comunicación vigente respecto de ${d.vinculo_familiar ? d.vinculo_familiar : '[NOMBRE DEL/DE LA NIÑO/A]'}, haciendo saber que ${d.incumplimiento}, bajo apercibimiento de solicitar judicialmente la fijación de astreintes y/o la modificación del régimen vigente, en los términos del art. 555 y concordantes del Código Civil y Comercial de la Nación.`,
        },
      },
    },

    bancario: {
      label: 'Consumidor Bancario / Financiero',
      remitenteLabel: 'Consumidor/a (usuario de servicios financieros)',
      destinatarioLabel: 'Entidad Financiera',
      detalleLabel: 'Datos de la operación bancaria',
      revisionPendiente: true,
      plantillas: {
        banc_comision_no_autorizada: {
          label: 'Reclamo por comisión/cargo no autorizado o no pactado (Secc. 2.3.2.2 y 2.3.5 PUSF)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','concepto_comision','monto_reclamado'],
          opcionales: ['fecha_resumen','numero_cuenta_producto'],
          generar: (d) => `Por medio de la presente, en mi carácter de usuario/a de servicios financieros${d.numero_cuenta_producto ? ` de la cuenta/producto N° ${d.numero_cuenta_producto}` : ''}, hago saber a Ud. que he detectado el débito de la suma de $ ${d.monto_reclamado} en concepto de ${d.concepto_comision}${d.fecha_resumen ? `, conforme resumen de fecha ${d.fecha_resumen}` : ''}, cargo que no fue expresa y previamente pactado ni autorizado por mi parte. En los términos de las Secciones 2.3.2.2 y 2.3.5 del Texto Ordenado de las normas del Banco Central de la República Argentina sobre "Protección de los Usuarios de Servicios Financieros", intimo a Ud. para que en el plazo de DIEZ (10) días hábiles proceda a la reversión íntegra del importe cuestionado, con más sus intereses, bajo apercibimiento de formular la denuncia pertinente ante el Banco Central de la República Argentina y de iniciar las acciones judiciales que correspondan.`,
        },
        banc_falta_respuesta_escalamiento: {
          label: 'Reclamo por falta de respuesta en plazo legal — aviso de escalamiento al BCRA (Secc. 3.1.6 y 4.2.1 PUSF)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','incumplimiento'],
          opcionales: ['numero_reclamo_previo','fecha_hecho'],
          generar: (d) => `Por medio de la presente, hago saber a Ud. que con fecha ${d.fecha_hecho ? d.fecha_hecho : '[FECHA DEL RECLAMO ORIGINAL]'}${d.numero_reclamo_previo ? ` (reclamo N° ${d.numero_reclamo_previo})` : ''} formulé reclamo respecto de ${d.incumplimiento}, sin haber obtenido respuesta fundada dentro del plazo previsto en la Sección 3.1.6 del Texto Ordenado de las normas del Banco Central de la República Argentina sobre "Protección de los Usuarios de Servicios Financieros". Intimo a Ud. para que en el plazo de CINCO (5) días hábiles brinde respuesta definitiva y resuelva el reclamo planteado, bajo apercibimiento de formalizar la denuncia correspondiente ante el Banco Central de la República Argentina (Secc. 4.2.1 PUSF) y de iniciar las acciones judiciales y/o administrativas que correspondan.`,
        },
        banc_aumento_comisiones_sin_aviso: {
          label: 'Reclamo por aumento de comisiones sin notificación previa de 60 días (Secc. 2.3.4 PUSF)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','concepto_comision'],
          opcionales: ['fecha_hecho','monto_reclamado'],
          generar: (d) => `Por medio de la presente, hago saber a Ud. que he tomado conocimiento del aumento aplicado a ${d.concepto_comision}${d.monto_reclamado ? `, actualmente por la suma de $ ${d.monto_reclamado}` : ''}, sin que se me haya cursado la notificación previa de SESENTA (60) días exigida por la Sección 2.3.4 del Texto Ordenado de las normas del Banco Central de la República Argentina sobre "Protección de los Usuarios de Servicios Financieros". En consecuencia, intimo a Ud. para que en el plazo de CINCO (5) días hábiles proceda a dejar sin efecto el aumento aplicado y a reintegrar las sumas percibidas en exceso, bajo apercibimiento de formular la denuncia pertinente ante el Banco Central de la República Argentina y de iniciar las acciones judiciales que correspondan.`,
        },
        banc_venta_atada: {
          label: 'Reclamo por venta atada de seguros u otros productos sin consentimiento (Secc. 2.3.12.2 y 2.3.2.2 PUSF)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','producto_servicio'],
          opcionales: ['monto_reclamado','fecha_operacion'],
          generar: (d) => `Por medio de la presente, hago saber a Ud. que he detectado la contratación de ${d.producto_servicio}${d.fecha_operacion ? `, con fecha ${d.fecha_operacion}` : ''}${d.monto_reclamado ? `, por la suma de $ ${d.monto_reclamado}` : ''}, sin mi consentimiento expreso e informado, en infracción a la prohibición de venta atada prevista en las Secciones 2.3.12.2 y 2.3.2.2 del Texto Ordenado de las normas del Banco Central de la República Argentina sobre "Protección de los Usuarios de Servicios Financieros" y al art. 8 bis de la Ley 24.240. Intimo a Ud. para que en el plazo de CINCO (5) días hábiles proceda a la baja del producto y a la restitución de las sumas debitadas por dicho concepto, bajo apercibimiento de formular la denuncia pertinente ante el Banco Central de la República Argentina y ante la autoridad de aplicación de defensa del consumidor, y de iniciar las acciones judiciales que correspondan, incluyendo el daño punitivo previsto en el art. 52 bis de la Ley 24.240.`,
        },
        banc_debito_no_reconocido: {
          label: 'Desconocimiento de débito/operación no reconocida — pedido de reversión (Secc. 2.3.5 PUSF + art. 53 Ley 24.240)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','monto_reclamado'],
          opcionales: ['fecha_hecho','numero_cuenta_producto'],
          generar: (d) => `Por medio de la presente, desconozco expresamente la operación/débito${d.numero_cuenta_producto ? ` registrado en la cuenta/producto N° ${d.numero_cuenta_producto}` : ''} por la suma de $ ${d.monto_reclamado}${d.fecha_hecho ? `, de fecha ${d.fecha_hecho}` : ''}, la cual no he realizado ni autorizado, pudiendo tratarse de una maniobra de fraude, phishing o clonación. En los términos de la Sección 2.3.5 del Texto Ordenado de las normas del Banco Central de la República Argentina sobre "Protección de los Usuarios de Servicios Financieros", y atento que corresponde a la entidad financiera acreditar la autoría y autenticidad de la operación cuestionada (art. 53 de la Ley 24.240), intimo a Ud. para que en el plazo de DIEZ (10) días hábiles proceda a la reversión íntegra del importe debitado, bajo apercibimiento de formular la denuncia pertinente ante el Banco Central de la República Argentina y de iniciar las acciones judiciales que correspondan.`,
        },
        banc_impugnacion_tarjeta: {
          label: 'Impugnación de consumos no reconocidos en resumen de tarjeta de crédito (Arts. 26 a 29 Ley 25.065)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','monto_reclamado'],
          opcionales: ['fecha_resumen','concepto_comision'],
          generar: (d) => `Por medio de la presente, en los términos de los arts. 26 a 29 de la Ley 25.065 de Tarjetas de Crédito, impugno fundadamente el consumo${d.concepto_comision ? ` correspondiente a ${d.concepto_comision}` : ''} por la suma de $ ${d.monto_reclamado}, incluido en el resumen${d.fecha_resumen ? ` de fecha ${d.fecha_resumen}` : ''}, por no reconocer su origen. Intimo a Ud. para que proceda conforme el procedimiento legal de impugnación, absteniéndose de exigir el pago de la suma cuestionada ni de sus intereses hasta tanto se expida fundadamente sobre la presente, bajo apercibimiento de formular la denuncia correspondiente ante el Banco Central de la República Argentina y de iniciar las acciones judiciales que correspondan.`,
        },
        banc_central_deudores: {
          label: 'Intimación por inclusión indebida en la Central de Deudores del BCRA — rectificación (Art. 16 Ley 25.326)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario'],
          opcionales: ['categoria_central_deudores','monto_reclamado'],
          generar: (d) => `Por medio de la presente, hago saber a Ud. que he sido incluido/a indebidamente en la Central de Deudores del Sistema Financiero del Banco Central de la República Argentina${d.categoria_central_deudores ? `, en la categoría/calificación "${d.categoria_central_deudores}"` : ''}${d.monto_reclamado ? `, por la suma de $ ${d.monto_reclamado}` : ''}, dato que resulta inexacto. En los términos del art. 16 de la Ley 25.326 de Protección de Datos Personales, intimo a Ud. para que en el plazo de CINCO (5) días hábiles proceda a la rectificación y/o supresión del dato inexacto informado, comunicando dicha rectificación al Banco Central de la República Argentina, bajo apercibimiento de iniciar la acción de protección de datos personales (hábeas data) prevista en la citada ley, sin perjuicio del reclamo de los daños y perjuicios ocasionados.`,
        },
        banc_cierre_cuenta: {
          label: 'Reclamo por cierre unilateral e injustificado de cuenta bancaria (Art. 8 bis Ley 24.240)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario'],
          opcionales: ['fecha_hecho','numero_cuenta_producto'],
          generar: (d) => `Por medio de la presente, hago saber a Ud. que con fecha ${d.fecha_hecho ? d.fecha_hecho : '[FECHA]'} he tomado conocimiento del cierre/baja unilateral de mi cuenta/producto${d.numero_cuenta_producto ? ` N° ${d.numero_cuenta_producto}` : ''}, sin que se me haya informado causa objetiva y razonable que lo justifique. Dicha conducta resulta violatoria del deber de trato digno y equitativo previsto en el art. 8 bis de la Ley 24.240. Intimo a Ud. para que en el plazo de CINCO (5) días hábiles informe fehacientemente los motivos del cierre y, en su caso, proceda a su reversión, bajo apercibimiento de formular la denuncia pertinente ante la autoridad de aplicación de defensa del consumidor y el Banco Central de la República Argentina, y de iniciar las acciones judiciales que correspondan, incluyendo el daño punitivo previsto en el art. 52 bis de la Ley 24.240.`,
        },
        banc_retencion_cajero: {
          label: 'Reclamo por retención de fondos/tarjeta en cajero automático sin entrega del dinero (Secc. 2.3.5 PUSF)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','monto_reclamado'],
          opcionales: ['datos_cajero'],
          generar: (d) => `Por medio de la presente, hago saber a Ud. que en oportunidad de operar en cajero automático${d.datos_cajero ? ` (${d.datos_cajero})` : ''}, el mismo retuvo mi tarjeta y/o no efectuó la entrega del efectivo por la suma de $ ${d.monto_reclamado}, no obstante lo cual la operación fue debitada de mi cuenta. En los términos de la Sección 2.3.5 del Texto Ordenado de las normas del Banco Central de la República Argentina sobre "Protección de los Usuarios de Servicios Financieros", intimo a Ud. para que en el plazo de CINCO (5) días hábiles proceda a la reversión íntegra del importe debitado y/o a la restitución del efectivo no entregado, bajo apercibimiento de formular la denuncia pertinente ante el Banco Central de la República Argentina y de iniciar las acciones judiciales que correspondan.`,
        },
        banc_credito_preaprobado_sin_verificacion: {
          label: 'Impugnación de crédito preaprobado acreditado sin verificación de identidad (Com. "A" 7319 BCRA)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','monto_reclamado'],
          opcionales: ['fecha_hecho'],
          generar: (d) => `Por medio de la presente, desconozco e impugno el préstamo/crédito preaprobado por la suma de $ ${d.monto_reclamado}${d.fecha_hecho ? `, acreditado en mi cuenta con fecha ${d.fecha_hecho}` : ''}, por cuanto dicha operación fue efectuada sin la verificación fehaciente de mi identidad mediante técnicas de identificación positiva ni la comunicación previa con ventana de CUARENTA Y OCHO (48) horas hábiles exigidas por la Comunicación "A" 7319 del Banco Central de la República Argentina. En consecuencia, intimo a Ud. para que en el plazo de CINCO (5) días hábiles proceda a dejar sin efecto el crédito cuestionado, cesar todo débito vinculado al mismo y reintegrar las sumas que hubieran sido percibidas en su consecuencia, bajo apercibimiento de formular la denuncia pertinente ante el Banco Central de la República Argentina y de iniciar las acciones judiciales que correspondan, incluyendo la nulidad del acto y el reclamo de los daños y perjuicios ocasionados.`,
        },
        banc_phishing_estandar: {
          label: 'Responsabilidad del Banco ante estafa virtual / phishing — reclamo íntegro (Arts. 5, 6, 40 y 52 bis Ley 24.240; Art. 1757 CCCN)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','monto_reclamado'],
          opcionales: ['fecha_hecho'],
          generar: (d) => `Por medio de la presente, hago saber a Ud. que con fecha ${d.fecha_hecho ? d.fecha_hecho : '[FECHA]'} fui víctima de una maniobra de phishing/ingeniería social por parte de terceros ajenos a mi voluntad, quienes lograron efectuar transferencias y/o operaciones no autorizadas por mi parte por la suma de $ ${d.monto_reclamado}, aprovechando vulnerabilidades del sistema de banca electrónica puesto a disposición por Ud. En su condición de proveedor y organizador de dicho sistema, Ud. responde objetivamente por las fallas de seguridad del servicio prestado, en los términos de los arts. 5, 6 y 40 de la Ley 24.240 y del art. 1757 del Código Civil y Comercial de la Nación (actividad riesgosa). Intimo a Ud. para que en el plazo de CINCO (5) días hábiles proceda a la reversión íntegra de las sumas debitadas/transferidas y, en su caso, a la anulación de todo crédito u operación derivada de dicha maniobra, bajo apercibimiento de formular la denuncia pertinente ante el Banco Central de la República Argentina y ante la autoridad de aplicación de defensa del consumidor, y de iniciar las acciones judiciales que correspondan, con más el daño moral y el daño punitivo previsto en el art. 52 bis de la Ley 24.240.`,
        },
        banc_phishing_hipervulnerable: {
          label: 'Responsabilidad agravada del Banco ante estafa virtual — consumidor hipervulnerable (Res. 139/2020; Art. 1725 CCCN)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','monto_reclamado'],
          opcionales: ['fecha_hecho'],
          generar: (d) => `Por medio de la presente, hago saber a Ud. que en mi condición de consumidor hipervulnerable (Resolución 139/2020 de la Secretaría de Comercio Interior), con fecha ${d.fecha_hecho ? d.fecha_hecho : '[FECHA]'} fui víctima de una maniobra de phishing/ingeniería social que derivó en operaciones y/o créditos no autorizados por mi parte por la suma de $ ${d.monto_reclamado}. Dicha entidad se encontraba especialmente obligada a extremar los recaudos de seguridad y a detectar la operatoria atípica en atención a mi condición particular, conforme el estándar agravado de responsabilidad profesional (art. 1725 del Código Civil y Comercial de la Nación) y el deber objetivo de seguridad previsto en los arts. 5, 6 y 40 de la Ley 24.240, sin que la eventual entrega de claves o datos de acceso mediante engaño resulte apta para interrumpir el nexo causal, por ser ello inherente a la modalidad delictiva empleada. Intimo a Ud. para que en el plazo de CINCO (5) días hábiles proceda a la reversión íntegra de las sumas debitadas/transferidas y a la anulación de todo crédito u operación derivada de dicha maniobra, asumiendo la totalidad de la responsabilidad por el hecho, bajo apercibimiento de formular la denuncia pertinente ante el Banco Central de la República Argentina y ante la autoridad de aplicación de defensa del consumidor, y de iniciar las acciones judiciales que correspondan, con más el daño moral y el daño punitivo previsto en el art. 52 bis de la Ley 24.240.`,
        },
      },
    },

    seguros: {
      label: 'Seguros — Consumidor de Seguros',
      remitenteLabel: 'Asegurado/a (consumidor de seguros)',
      destinatarioLabel: 'Compañía Aseguradora',
      detalleLabel: 'Datos de la póliza / siniestro',
      revisionPendiente: true,
      plantillas: {
        seg_silencio_aceptacion_tacita: {
          label: 'Intimación por silencio del asegurador — aceptación tácita del siniestro (Art. 56 Ley 17.418)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','numero_poliza','fecha_siniestro'],
          opcionales: ['numero_siniestro','ramo_seguro','monto_reclamado'],
          generar: (d) => `Por medio de la presente, en mi carácter de asegurado/a de la póliza N° ${d.numero_poliza}${d.ramo_seguro ? ` (seguro de ${d.ramo_seguro})` : ''}, hago saber a Ud. que habiendo denunciado en tiempo y forma el siniestro ocurrido el ${d.fecha_siniestro}${d.numero_siniestro ? ` (siniestro N° ${d.numero_siniestro})` : ''} y remitido la información complementaria requerida, ha transcurrido en exceso el plazo de TREINTA (30) días previsto en el art. 56 de la Ley 17.418 sin que Ud. se haya pronunciado sobre mi derecho. En consecuencia, dicho silencio importa la aceptación del siniestro en los términos de la norma citada, por lo que intimo a Ud. para que en el plazo de CINCO (5) días hábiles proceda a abonar${d.monto_reclamado ? ` la suma de $ ${d.monto_reclamado}` : ' la indemnización correspondiente'}, bajo apercibimiento de formular la denuncia pertinente ante la Superintendencia de Seguros de la Nación y de iniciar las acciones judiciales que correspondan, con más el reclamo del daño punitivo previsto en el art. 52 bis de la Ley 24.240, sin perjuicio de las demás normas que resulten aplicables.`,
        },
        seg_mora_pago_indemnizacion: {
          label: 'Intimación por mora en el pago de la indemnización ya fijada (Art. 49 Ley 17.418)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','numero_poliza','monto_reclamado'],
          opcionales: ['numero_siniestro','fecha_hecho'],
          generar: (d) => `Por medio de la presente, en mi carácter de asegurado/a de la póliza N° ${d.numero_poliza}${d.numero_siniestro ? `, siniestro N° ${d.numero_siniestro}` : ''}, hago saber a Ud. que habiéndose fijado el monto de la indemnización en la suma de $ ${d.monto_reclamado}${d.fecha_hecho ? ` con fecha ${d.fecha_hecho}` : ''}, ha transcurrido en exceso el plazo de QUINCE (15) días previsto en el art. 49 de la Ley 17.418 sin que Ud. haya efectuado el pago correspondiente. Intimo a Ud. para que en el plazo de CINCO (5) días hábiles proceda a abonar la suma adeudada, con más los intereses moratorios correspondientes, bajo apercibimiento de formular la denuncia pertinente ante la Superintendencia de Seguros de la Nación y de iniciar las acciones judiciales que correspondan, con más el reclamo del daño punitivo previsto en el art. 52 bis de la Ley 24.240, sin perjuicio de las demás normas que resulten aplicables.`,
        },
        seg_impugnacion_rechazo: {
          label: 'Impugnación de rechazo de cobertura — pedido de revisión fundada (Art. 56 Ley 17.418)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','numero_poliza','incumplimiento'],
          opcionales: ['numero_siniestro','fecha_siniestro','monto_reclamado'],
          generar: (d) => `Por medio de la presente, en mi carácter de asegurado/a de la póliza N° ${d.numero_poliza}${d.numero_siniestro ? `, siniestro N° ${d.numero_siniestro}` : ''}${d.fecha_siniestro ? ` de fecha ${d.fecha_siniestro}` : ''}, vengo a impugnar formalmente el rechazo de cobertura notificado por Ud., fundado en ${d.incumplimiento}, por resultar infundado y/o extemporáneo en los términos del art. 56 de la Ley 17.418, y por corresponder una interpretación restrictiva de las cláusulas limitativas de la cobertura en caso de duda. Intimo a Ud. para que en el plazo de DIEZ (10) días hábiles proceda a revisar su decisión y a reconocer el siniestro${d.monto_reclamado ? `, abonando la suma de $ ${d.monto_reclamado}` : ''}, bajo apercibimiento de formular la denuncia pertinente ante la Superintendencia de Seguros de la Nación y de iniciar las acciones judiciales que correspondan, con más el reclamo del daño punitivo previsto en el art. 52 bis de la Ley 24.240, sin perjuicio de las demás normas que resulten aplicables.`,
        },
        seg_reclamo_previo_ssn: {
          label: 'Reclamo previo a denuncia ante la SSN por incumplimiento normativo (Res. SSN 360/2024)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','numero_poliza','incumplimiento'],
          opcionales: ['numero_siniestro'],
          generar: (d) => `Por medio de la presente, en mi carácter de asegurado/a de la póliza N° ${d.numero_poliza}${d.numero_siniestro ? `, siniestro N° ${d.numero_siniestro}` : ''}, formulo reclamo formal respecto de ${d.incumplimiento}, intimando a Ud. para que en el plazo de QUINCE (15) días hábiles previsto en la Resolución SSN N° 360/2024 brinde respuesta fundada y dé solución al presente reclamo, bajo apercibimiento de formalizar la denuncia correspondiente ante la Superintendencia de Seguros de la Nación (Coordinación de Comunicación y Atención al Asegurado) y de iniciar las acciones judiciales que correspondan.`,
        },
        seg_impugnacion_franquicia_exclusion: {
          label: 'Impugnación de franquicia o exclusión de cobertura no oponible/abusiva',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','numero_poliza','incumplimiento'],
          opcionales: ['numero_siniestro','monto_reclamado'],
          generar: (d) => `Por medio de la presente, en mi carácter de asegurado/a de la póliza N° ${d.numero_poliza}${d.numero_siniestro ? `, siniestro N° ${d.numero_siniestro}` : ''}, impugno la aplicación de ${d.incumplimiento} invocada por Ud. para reducir y/o rechazar la cobertura, por no haberme sido debidamente informada al momento de la contratación y/o por resultar de aplicación abusiva o extensiva. Intimo a Ud. para que en el plazo de DIEZ (10) días hábiles proceda a dejar sin efecto dicha limitación y a reconocer el siniestro en su integridad${d.monto_reclamado ? `, abonando la suma de $ ${d.monto_reclamado}` : ''}, bajo apercibimiento de formular la denuncia pertinente ante la Superintendencia de Seguros de la Nación y de iniciar las acciones judiciales que correspondan.`,
        },
        seg_demora_vida_accidentes_beneficiarios: {
          label: 'Reclamo por demora/rechazo en seguro de vida o accidentes personales — pago a beneficiarios',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','numero_poliza'],
          opcionales: ['caracter_reclamante','monto_reclamado','fecha_siniestro'],
          generar: (d) => `Por medio de la presente, en mi carácter de ${d.caracter_reclamante ? d.caracter_reclamante : 'beneficiario/a'} de la póliza de seguro de vida/accidentes personales N° ${d.numero_poliza}${d.fecha_siniestro ? `, en virtud del siniestro ocurrido el ${d.fecha_siniestro}` : ''}, intimo a Ud. para que en el plazo de CINCO (5) días hábiles proceda al pago${d.monto_reclamado ? ` de la suma de $ ${d.monto_reclamado}` : ' de la indemnización correspondiente'}, conforme lo dispuesto por los arts. 49 y 56 de la Ley 17.418, bajo apercibimiento de formular la denuncia pertinente ante la Superintendencia de Seguros de la Nación y de iniciar las acciones judiciales que correspondan, con más el reclamo del daño punitivo previsto en el art. 52 bis de la Ley 24.240, sin perjuicio de las demás normas que resulten aplicables.`,
        },
        seg_impugnacion_caducidad_convencional: {
          label: 'Impugnación de caducidad convencional aplicada por incumplimiento de cargas (Art. 36 Ley 17.418)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','numero_poliza','incumplimiento'],
          opcionales: ['numero_siniestro'],
          generar: (d) => `Por medio de la presente, en mi carácter de asegurado/a de la póliza N° ${d.numero_poliza}${d.numero_siniestro ? `, siniestro N° ${d.numero_siniestro}` : ''}, impugno la caducidad convencional invocada por Ud. en virtud de ${d.incumplimiento}, por resultar desproporcionada respecto del incumplimiento imputado y contraria al principio de buena fe que rige el contrato de seguro (art. 36 de la Ley 17.418, en tanto la caducidad allí prevista requiere pacto expreso y proporcional). Intimo a Ud. para que en el plazo de DIEZ (10) días hábiles proceda a dejar sin efecto la caducidad declarada y a reconocer el siniestro, bajo apercibimiento de formular la denuncia pertinente ante la Superintendencia de Seguros de la Nación y de iniciar las acciones judiciales que correspondan.`,
        },
        seg_liquidacion_pluralidad_seguros: {
          label: 'Reclamo por liquidación incorrecta en pluralidad de seguros / sobreseguro (Art. 68 Ley 17.418)',
          requiere: ['nombre','dni','domicilio','razon_social','dom_destinatario','numero_poliza','monto_reclamado'],
          opcionales: ['numero_siniestro'],
          generar: (d) => `Por medio de la presente, en mi carácter de asegurado/a de la póliza N° ${d.numero_poliza}${d.numero_siniestro ? `, siniestro N° ${d.numero_siniestro}` : ''}, hago saber a Ud. que la liquidación practicada respecto de la indemnización correspondiente resulta incorrecta, por cuanto no se ha respetado la proporción que corresponde en virtud de la pluralidad de seguros vigentes sobre el mismo riesgo (art. 68 de la Ley 17.418), lo cual determina un perjuicio de $ ${d.monto_reclamado} en mi contra. Intimo a Ud. para que en el plazo de DIEZ (10) días hábiles proceda a rectificar la liquidación practicada y a abonar la diferencia adeudada, bajo apercibimiento de formular la denuncia pertinente ante la Superintendencia de Seguros de la Nación y de iniciar las acciones judiciales que correspondan.`,
        },
      },
    },
  };

  // ── Campos (pool compartido entre todas las materias) ────────────────────
  const CAMPOS_CONFIG = [
    // Remitente
    { id: 'nombre',          label: 'Nombre completo (remitente)',       placeholder: 'Juan García',          tipo: 'text',  grupo: 'remitente' },
    { id: 'dni',             label: 'DNI',                               placeholder: '12.345.678',            tipo: 'text',  grupo: 'remitente' },
    { id: 'domicilio',       label: 'Domicilio (remitente)',             placeholder: 'Av. Corrientes 1234, Buenos Aires', tipo: 'text', grupo: 'remitente' },
    // Destinatario
    { id: 'razon_social',    label: 'Nombre completo / Razón social (destinatario)', placeholder: 'Empresa S.A.', tipo: 'text', grupo: 'destinatario' },
    { id: 'cuit',            label: 'CUIT/CUIL (destinatario)',          placeholder: '30-12345678-9',          tipo: 'text',  grupo: 'destinatario' },
    { id: 'dom_destinatario',label: 'Domicilio (destinatario)',          placeholder: 'Calle Falsa 123, CABA',  tipo: 'text',  grupo: 'destinatario' },
    // Detalle — genéricos reutilizables
    { id: 'fecha_hecho',     label: 'Fecha del hecho relevante',         placeholder: '',                      tipo: 'date',  grupo: 'detalle' },
    { id: 'incumplimiento',  label: 'Descripción del incumplimiento / defecto', placeholder: 'la falta de pago correspondiente al mes…', tipo: 'text', grupo: 'detalle' },
    { id: 'objeto_obligacion', label: 'Objeto del contrato / obligación', placeholder: 'inmueble sito en Av. Siempreviva 742, La Plata', tipo: 'text', grupo: 'detalle' },
    { id: 'monto_adeudado',  label: 'Monto adeudado',                    placeholder: '250000',                 tipo: 'number', grupo: 'detalle' },
    // Detalle — laboral
    { id: 'fecha_ingreso',   label: 'Fecha de ingreso',                  placeholder: '',                      tipo: 'date',  grupo: 'detalle' },
    { id: 'categoria',       label: 'Categoría / puesto (opcional)',     placeholder: 'Operario especializado', tipo: 'text', grupo: 'detalle' },
    { id: 'remuneracion',    label: 'Remuneración mensual (opcional)',   placeholder: '250000',                 tipo: 'number', grupo: 'detalle' },
    { id: 'mes_anio',        label: 'Mes/Año de haberes (opcional)',     placeholder: 'marzo 2026',              tipo: 'text',  grupo: 'detalle' },
    // Detalle — consumidor
    { id: 'producto_servicio', label: 'Producto o servicio',             placeholder: 'notebook modelo X',       tipo: 'text',  grupo: 'detalle' },
    { id: 'fecha_operacion', label: 'Fecha de compra / contratación',    placeholder: '',                      tipo: 'date',  grupo: 'detalle' },
    // Detalle — locaciones
    { id: 'direccion_inmueble', label: 'Dirección del inmueble locado',  placeholder: 'calle Mitre 456, San Isidro', tipo: 'text', grupo: 'detalle' },
    { id: 'periodo_adeudado', label: 'Período adeudado',                 placeholder: 'marzo y abril de 2026',   tipo: 'text',  grupo: 'detalle' },
    { id: 'fecha_vencimiento_contrato', label: 'Fecha de vencimiento del contrato', placeholder: '', tipo: 'date', grupo: 'detalle' },
    // Detalle — familia / societario
    { id: 'vinculo_familiar', label: 'Vínculo / parentesco (opcional)',  placeholder: 'cónyuge / progenitor/a', tipo: 'text',  grupo: 'detalle' },
    { id: 'monto_cuota',     label: 'Monto de la cuota alimentaria',     placeholder: '150000',                 tipo: 'number', grupo: 'detalle' },
    { id: 'cargo_social',    label: 'Cargo / carácter en la sociedad (opcional)', placeholder: 'socio gerente', tipo: 'text', grupo: 'detalle' },
    // Detalle — bancario / financiero
    { id: 'concepto_comision', label: 'Concepto de la comisión/cargo cuestionado', placeholder: 'mantenimiento de cuenta',       tipo: 'text',   grupo: 'detalle' },
    { id: 'monto_reclamado', label: 'Monto reclamado / cuestionado',      placeholder: '85000',                  tipo: 'number', grupo: 'detalle' },
    { id: 'numero_cuenta_producto', label: 'Nro. de cuenta / tarjeta / producto (opcional)', placeholder: '0000-1234567-8', tipo: 'text', grupo: 'detalle' },
    { id: 'numero_reclamo_previo', label: 'Número de reclamo/ticket previo (opcional)', placeholder: 'REC-2026-000123', tipo: 'text', grupo: 'detalle' },
    { id: 'fecha_resumen',   label: 'Fecha del resumen que incluye el cargo/consumo', placeholder: '',           tipo: 'date',   grupo: 'detalle' },
    { id: 'datos_cajero',    label: 'Cajero automático — fecha, hora y sucursal (opcional)', placeholder: 'sucursal Microcentro, 15/03/2026, 18:40hs', tipo: 'text', grupo: 'detalle' },
    { id: 'categoria_central_deudores', label: 'Categoría/calificación informada (opcional)', placeholder: 'Situación 3', tipo: 'text', grupo: 'detalle' },
    // Detalle — seguros
    { id: 'numero_poliza',   label: 'Número de póliza',                   placeholder: '123.456.789',            tipo: 'text',   grupo: 'detalle' },
    { id: 'numero_siniestro', label: 'Número de siniestro (opcional)',    placeholder: 'SIN-2026-00123',         tipo: 'text',   grupo: 'detalle' },
    { id: 'fecha_siniestro', label: 'Fecha del siniestro',                placeholder: '',                       tipo: 'date',   grupo: 'detalle' },
    { id: 'ramo_seguro',     label: 'Ramo del seguro (opcional)',         placeholder: 'automotor / vida / hogar / ART', tipo: 'text', grupo: 'detalle' },
    { id: 'caracter_reclamante', label: 'Carácter invocado (opcional)',   placeholder: 'beneficiario/a, derechohabiente', tipo: 'text', grupo: 'detalle' },
  ];
  const CAMPOS_BY_ID = Object.fromEntries(CAMPOS_CONFIG.map(c => [c.id, c]));

  let materiaActual = Object.keys(RAMAS_CD)[0];

  // ── HTML ───────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Generador de Carta Documento / Telegrama</h2>
      <p class="tool-desc">Intimaciones y notificaciones frecuentes por materia — modelos orientativos</p>

      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="cd-materia">Materia</label>
          <select id="cd-materia">
            ${Object.entries(RAMAS_CD).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
          </select>
        </div>
        <div class="field-group" style="flex:2">
          <label for="cd-tipo">Tipo de documento</label>
          <select id="cd-tipo"></select>
        </div>
      </div>

      <div id="cd-aviso-revision" style="display:none;background:#fff3cd;border:1px solid #d9a441;border-radius:6px;padding:10px 14px;margin-bottom:8px;font-size:.82rem;line-height:1.6;color:#5a4408">
        ⚠️ Modelos de esta materia pendientes de revisión final por el Estudio. Las citas normativas fueron verificadas contra fuentes jurídicas confiables, pero aún no contra el texto oficial completo. Cotejar antes de utilizar en un caso real.
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px" id="cd-campos-wrapper">

        <div>
          <div class="form-section-title" id="cd-titulo-remitente" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em"></div>
          <div id="cd-grupo-remitente"></div>
        </div>

        <div>
          <div class="form-section-title" id="cd-titulo-destinatario" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em"></div>
          <div id="cd-grupo-destinatario"></div>
        </div>

        <div style="grid-column:1/-1">
          <div class="form-section-title" id="cd-titulo-detalle" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px" id="cd-grupo-detalle"></div>
        </div>

      </div>

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:8px">
        <button class="btn btn-primary" id="cd-generar">Generar texto</button>
        <button class="btn btn-ghost"   id="cd-limpiar">Limpiar</button>
      </div>

      <div id="cd-resultado" style="display:none;margin-top:24px">
        <label for="cd-texto" style="font-weight:600;display:block;margin-bottom:6px">Texto generado (editable)</label>
        <textarea id="cd-texto" rows="10" style="width:100%;resize:vertical;font-family:inherit;font-size:.9rem;padding:12px;border:1px solid var(--color-border);border-radius:6px;background:#ffffff;color:#1a1a1a;line-height:1.6"></textarea>
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px">
          <button class="btn btn-success" id="cd-copiar">📋 Copiar texto</button>
          <button class="btn btn-ghost"   id="cd-pdf">📄 Exportar PDF</button>
          <button class="btn btn-ghost"   id="cd-reset-texto">Restablecer</button>
        </div>
      </div>

      <p style="margin-top:24px;font-size:.78rem;color:var(--color-muted);border-top:1px solid var(--color-border);padding-top:12px">
        Texto orientativo. Adaptar al caso concreto. No constituye asesoramiento legal.
      </p>
    </div>`;

  function renderCamposGrupo(grupo, ids) {
    return CAMPOS_CONFIG.filter(c => c.grupo === grupo && ids.includes(c.id)).map(c => `
      <div class="field-group" id="wrap-${c.id}">
        <label for="cd-${c.id}">${c.label}</label>
        ${c.tipo === 'textarea'
          ? `<textarea id="cd-${c.id}" placeholder="${c.placeholder}" rows="2"></textarea>`
          : `<input type="${c.tipo}" id="cd-${c.id}" placeholder="${c.placeholder}"${c.tipo === 'number' ? ' min="0" step="0.01"' : ''}>`
        }
      </div>`).join('');
  }

  // ── Referencias ────────────────────────────────────────────────────────────
  const selMateria = container.querySelector('#cd-materia');
  const selTipo    = container.querySelector('#cd-tipo');
  const divRes     = container.querySelector('#cd-resultado');
  const textarea   = container.querySelector('#cd-texto');
  const btnGen     = container.querySelector('#cd-generar');
  const btnLimp    = container.querySelector('#cd-limpiar');
  const btnCop     = container.querySelector('#cd-copiar');
  const btnReset   = container.querySelector('#cd-reset-texto');

  let ultimoTextoGenerado = '';

  function poblarTipos() {
    const rama = RAMAS_CD[materiaActual];
    selTipo.innerHTML = Object.entries(rama.plantillas).map(([k, v]) =>
      `<option value="${k}">${v.label}</option>`).join('');
  }

  function renderizarCamposDeRama() {
    const rama = RAMAS_CD[materiaActual];
    container.querySelector('#cd-aviso-revision').style.display = rama.revisionPendiente ? 'block' : 'none';
    container.querySelector('#cd-titulo-remitente').textContent = rama.remitenteLabel;
    container.querySelector('#cd-titulo-destinatario').textContent = rama.destinatarioLabel;
    container.querySelector('#cd-titulo-detalle').textContent = rama.detalleLabel;

    // Todos los ids de campos usados por alguna plantilla de esta rama
    const idsUsados = new Set();
    Object.values(rama.plantillas).forEach(p => {
      [...p.requiere, ...p.opcionales].forEach(id => idsUsados.add(id));
    });
    const ids = Array.from(idsUsados);

    container.querySelector('#cd-grupo-remitente').innerHTML = renderCamposGrupo('remitente', ids);
    container.querySelector('#cd-grupo-destinatario').innerHTML = renderCamposGrupo('destinatario', ids);
    container.querySelector('#cd-grupo-detalle').innerHTML = renderCamposGrupo('detalle', ids);
  }

  // ── Visibilidad de campos según tipo ──────────────────────────────────────
  function actualizarCampos() {
    const rama = RAMAS_CD[materiaActual];
    const plantilla = rama.plantillas[selTipo.value];
    if (!plantilla) return;
    const todos = [...plantilla.requiere, ...plantilla.opcionales];
    CAMPOS_CONFIG.forEach(c => {
      const wrap = container.querySelector(`#wrap-${c.id}`);
      if (!wrap) return;
      wrap.style.display = todos.includes(c.id) ? '' : 'none';
    });
  }

  function onMateriaChange() {
    materiaActual = selMateria.value;
    poblarTipos();
    renderizarCamposDeRama();
    actualizarCampos();
    divRes.style.display = 'none';
    textarea.value = '';
    ultimoTextoGenerado = '';
  }

  selMateria.addEventListener('change', onMateriaChange);
  selTipo.addEventListener('change', actualizarCampos);

  // Inicialización
  poblarTipos();
  renderizarCamposDeRama();
  actualizarCampos();

  // ── Generar ────────────────────────────────────────────────────────────────
  btnGen.addEventListener('click', () => {
    const rama = RAMAS_CD[materiaActual];
    const plantilla = rama.plantillas[selTipo.value];
    CAMPOS_CONFIG.forEach(c => container.querySelector(`#cd-${c.id}`)?.classList.remove('error'));

    // Validar requeridos
    let ok = true;
    for (const id of plantilla.requiere) {
      const el = container.querySelector(`#cd-${id}`);
      if (!el) continue;
      if (!el.value.trim()) { el.classList.add('error'); ok = false; }
    }
    if (!ok) return;

    // Recolectar datos
    const d = {};
    [...plantilla.requiere, ...plantilla.opcionales].forEach(id => {
      const el = container.querySelector(`#cd-${id}`);
      if (el) d[id] = el.value.trim();
    });

    // Formatear fechas
    Object.keys(d).forEach(k => {
      const cfg = CAMPOS_BY_ID[k];
      if (cfg && cfg.tipo === 'date' && d[k]) {
        const parts = d[k].split('-');
        if (parts.length === 3) d[k] = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    });

    const texto = plantilla.generar(d);
    ultimoTextoGenerado = texto;
    textarea.value = texto;
    divRes.style.display = 'block';
    textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  btnLimp.addEventListener('click', () => {
    CAMPOS_CONFIG.forEach(c => {
      const el = container.querySelector(`#cd-${c.id}`);
      if (el) { el.value = ''; el.classList.remove('error'); }
    });
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
    }).catch(() => {
      prompt('Copie el texto:', texto);
    });
  });

  btnReset.addEventListener('click', () => {
    if (ultimoTextoGenerado) textarea.value = ultimoTextoGenerado;
  });

  container.querySelector('#cd-pdf').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const rama = RAMAS_CD[materiaActual];
    const plantilla = rama.plantillas[selTipo.value];
    const lineas = texto.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    const avisoHtml = rama.revisionPendiente
      ? `<p class="nota">⚠️ Modelo pendiente de revisión final por el Estudio. Cotejar las citas normativas antes de utilizar en un caso real.</p>`
      : '';
    const html = `<div class="info-box" style="font-size:13px;line-height:1.8">${lineas}</div>${avisoHtml}`;
    exportarPDF(plantilla.label.replace(/^\[.*?\]\s*/, ''), html);
  });
}
