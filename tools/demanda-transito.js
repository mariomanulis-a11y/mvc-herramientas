// Generador de Demanda de Daños y Perjuicios — Accidentes de Tránsito (PBA)
//
// Encuadre de responsabilidad: régimen objetivo por riesgo o vicio de la cosa
// (arts. 1757 y 1758, CCyC), aplicable a la circulación de vehículos por
// remisión del art. 1769, CCyC. Eximentes: hecho del damnificado, hecho de un
// tercero por quien no se debe responder, o caso fortuito (art. 1722, CCyC).
// Normativa de tránsito: Ley Nacional 24.449, vigente en el territorio de la
// Provincia de Buenos Aires por adhesión dispuesta por la Ley 13.927 y su
// Decreto reglamentario 532/09.
// Citación en garantía de la aseguradora: art. 118, Ley 17.418 (ley nacional,
// de aplicación uniforme). La oponibilidad de la franquicia al damnificado en
// siniestros de vehículos particulares (a diferencia del transporte público)
// fue admitida por la CSJN en "Buffoni" (8/4/2014) — se deja constancia como
// recordatorio profesional, no se incluye como argumento en el escrito.
// Mediación previa obligatoria: en la Provincia de Buenos Aires rige la Ley
// 13.951 (no la Ley 26.589, que es de aplicación en el ámbito de la Justicia
// Nacional/CABA) — los juicios de daños y perjuicios no están entre las
// excepciones taxativas de su art. 4°.
// Daño moral: art. 1741, CCyC. Cuantificación de la incapacidad sobreviniente:
// art. 1746, CCyC — la SCBA ("Vilar", 9/8/2022) desalienta la aplicación
// mecánica y excluyente de una única fórmula matemática, exigiendo ponderar
// las circunstancias particulares de la víctima; se remite, como valor
// meramente orientativo, a la Calculadora de Indemnización por Incapacidad
// del propio Estudio.
// Intereses/actualización: doctrina legal de la SCBA en constante evolución
// ("Barrios", 18/4/2024, y sus desarrollos posteriores según el Departamento
// Judicial interviniente) — no se fija una tasa numérica en el generador.
// Prescripción: 3 años (art. 2561, 2° párr., CCyC).
// Vía procesal: se adopta como default el trámite de juicio ordinario, que es
// el seguido en la práctica de los tribunales de la Provincia de Buenos Aires
// para este tipo de reclamos.
//
// Advertencia: los textos normativos se citan por número de artículo y
// concepto general, no en forma literal — cotejar el texto vigente antes de
// transcribirlo en una presentación judicial.

import { exportarPDF, exportarWord } from './exportar.js';

export function initDemandaTransito(container) {

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

  // ── Rubros indemnizatorios ───────────────────────────────────────────────
  const RUBROS = [
    { id: 'dano_emergente',           label: 'Daño emergente (reparación del vehículo, gastos médicos y de farmacia, traslados)', default: true,  pct: false },
    { id: 'lucro_cesante',            label: 'Lucro cesante (días de trabajo perdidos)',                                          default: false, pct: false },
    { id: 'incapacidad_sobreviniente', label: 'Incapacidad sobreviniente',                                                         default: false, pct: true, requiereLesiones: true },
    { id: 'dano_moral',               label: 'Daño moral (art. 1741, CCyC)',                                                      default: true,  pct: false },
    { id: 'privacion_uso',            label: 'Privación de uso del vehículo',                                                     default: false, pct: false },
    { id: 'desvalorizacion_venal',    label: 'Desvalorización venal del vehículo',                                                default: false, pct: false },
    { id: 'dano_psicologico',         label: 'Daño psicológico (condicionado a pericia que acredite incapacidad diferenciada)',   default: false, pct: true, requiereLesiones: true },
  ];

  function fmt(n) {
    const v = parseFloat(n);
    return isNaN(v) ? '0,00' : v.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ── HTML ─────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Generador de Demanda — Daños y Perjuicios por Accidente de Tránsito</h2>
      <p class="tool-desc">Responsabilidad objetiva por riesgo de la cosa (arts. 1757/1758/1769, CCyC), citación en garantía de la aseguradora y liquidación de rubros indemnizatorios — Provincia de Buenos Aires.</p>

      <div class="form-row">
        <div class="field-group">
          <label for="dt-abogado-select">Letrado/a interviniente</label>
          <select id="dt-abogado-select">${ABOGADOS.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('')}</select>
        </div>
        <div class="field-group">
          <label for="dt-caracter-letrado">Carácter</label>
          <select id="dt-caracter-letrado">${CARACTER_LETRADO.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}</select>
        </div>
        <div class="field-group">
          <label for="dt-matricula">Matrícula (autocompleta)</label>
          <input type="text" id="dt-matricula" placeholder="T° __ F° __">
        </div>
      </div>

      <div class="form-row">
        <div class="field-group" style="flex:2">
          <label for="dt-juzgado">Juzgado / Fuero competente</label>
          <input type="text" id="dt-juzgado" value="Juzgado de Primera Instancia en lo Civil y Comercial N° __ del Departamento Judicial de ___, Provincia de Buenos Aires">
        </div>
        <div class="field-group"><label for="dt-domicilio-procesal">Domicilio procesal a constituir</label><input type="text" id="dt-domicilio-procesal" placeholder="Calle, altura, localidad"></div>
        <div class="field-group"><label for="dt-email-notificaciones">Domicilio electrónico (autocompleta)</label><input type="text" id="dt-email-notificaciones"></div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Partes</div>
      <div class="form-row">
        <div class="field-group"><label for="dt-actor">Actor/a — damnificado/a</label><input type="text" id="dt-actor" placeholder="Nombre y apellido"></div>
        <div class="field-group"><label for="dt-actor-dni">DNI</label><input type="text" id="dt-actor-dni"></div>
        <div class="field-group" style="flex:2"><label for="dt-actor-domicilio">Domicilio real</label><input type="text" id="dt-actor-domicilio"></div>
      </div>
      <div class="field-group"><label for="dt-coactores">Coactores/as (opcional — cónyuge/familiares con daño propio, uno por línea)</label><textarea id="dt-coactores" rows="2"></textarea></div>

      <div class="form-row" style="margin-top:8px">
        <div class="field-group"><label for="dt-demandado-conductor">Demandado — conductor</label><input type="text" id="dt-demandado-conductor" placeholder="Nombre y apellido"></div>
        <div class="field-group"><label for="dt-demandado-titular">Titular registral del vehículo (si es distinto del conductor)</label><input type="text" id="dt-demandado-titular" placeholder="Dueño/guardián — art. 1758, CCyC"></div>
        <div class="field-group" style="flex:2"><label for="dt-demandado-domicilio">Domicilio del/de los demandado/s</label><input type="text" id="dt-demandado-domicilio"></div>
      </div>
      <div class="form-row">
        <div class="field-group"><label for="dt-aseguradora">Aseguradora a citar en garantía</label><input type="text" id="dt-aseguradora" placeholder="Compañía de Seguros S.A."></div>
        <div class="field-group"><label for="dt-poliza">N° de póliza (si se conoce)</label><input type="text" id="dt-poliza"></div>
        <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-weight:500;font-size:.85rem;margin-top:22px">
          <input type="checkbox" id="dt-citar-garantia" checked> Solicitar citación en garantía (art. 118, Ley 17.418)
        </label>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del hecho</div>
      <div class="form-row">
        <div class="field-group"><label for="dt-fecha-hecho">Fecha del hecho</label><input type="date" id="dt-fecha-hecho"></div>
        <div class="field-group"><label for="dt-hora-hecho">Hora aproximada</label><input type="time" id="dt-hora-hecho"></div>
        <div class="field-group" style="flex:2"><label for="dt-lugar-hecho">Lugar (calle/intersección, localidad, partido)</label><input type="text" id="dt-lugar-hecho"></div>
      </div>
      <div class="form-row">
        <div class="field-group"><label for="dt-vehiculo-actor">Vehículo del actor (marca/modelo/dominio)</label><input type="text" id="dt-vehiculo-actor"></div>
        <div class="field-group"><label for="dt-vehiculo-demandado">Vehículo del demandado (marca/modelo/dominio)</label><input type="text" id="dt-vehiculo-demandado"></div>
      </div>
      <div class="field-group">
        <label for="dt-relato-hecho">Relato / mecánica del accidente</label>
        <textarea id="dt-relato-hecho" rows="3" placeholder="Cómo se produjo la colisión, maniobras, señalización, etc."></textarea>
      </div>
      <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-weight:500;margin-top:6px;font-size:.85rem">
        <input type="checkbox" id="dt-prioridad-paso"> El demandado carecía de prioridad de paso y/o incurrió en una infracción de tránsito vinculada causalmente al hecho (Ley 24.449/13.927)
      </label>
      <div class="field-group" id="dt-wrap-infraccion" style="display:none;margin-top:6px">
        <label for="dt-detalle-infraccion">Detalle de la infracción / circunstancia de la prioridad de paso</label>
        <input type="text" id="dt-detalle-infraccion">
      </div>
      <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-weight:500;margin-top:6px;font-size:.85rem">
        <input type="checkbox" id="dt-denuncia" checked> Se formuló denuncia policial / exposición civil
      </label>
      <div class="field-group" id="dt-wrap-denuncia" style="margin-top:6px">
        <label for="dt-datos-denuncia">N° de actuación / dependencia interviniente (opcional)</label><input type="text" id="dt-datos-denuncia">
      </div>
      <div class="field-group"><label for="dt-testigos">Testigos del hecho (opcional, uno por línea — nombre y datos de contacto)</label><textarea id="dt-testigos" rows="2"></textarea></div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Lesiones personales</div>
      <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-weight:500;font-size:.85rem">
        <input type="checkbox" id="dt-hubo-lesiones"> Hubo lesiones personales (además de daños materiales)
      </label>
      <div id="dt-bloque-lesiones" style="display:none;margin-top:8px">
        <div class="field-group"><label for="dt-diagnostico">Diagnóstico / lesiones sufridas</label><textarea id="dt-diagnostico" rows="2"></textarea></div>
        <div class="field-group"><label for="dt-atencion-medica">Atención médica recibida</label><textarea id="dt-atencion-medica" rows="2"></textarea></div>
        <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-weight:500;margin-top:6px;font-size:.85rem">
          <input type="checkbox" id="dt-tratamiento-curso"> El tratamiento se encuentra en curso a la fecha
        </label>
      </div>
      <p style="font-size:.75rem;color:var(--color-muted);margin:10px 0 0">Este generador no contempla el régimen de legitimación específico del art. 1741, CCyC, para derechohabientes en caso de fallecimiento de la víctima — dicho supuesto requiere análisis particular.</p>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Mediación previa obligatoria (Ley 13.951)</div>
      <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-weight:500;font-size:.85rem">
        <input type="checkbox" id="dt-mediacion-cumplida" checked> Se cumplió la instancia de mediación previa sin arribarse a acuerdo
      </label>
      <div class="form-row" id="dt-wrap-mediacion" style="margin-top:6px">
        <div class="field-group"><label for="dt-fecha-cierre-mediacion">Fecha de cierre del acta de mediación</label><input type="date" id="dt-fecha-cierre-mediacion"></div>
      </div>
      <p style="font-size:.75rem;color:var(--color-muted);margin:0 0 10px">La mediación previa es condición de admisibilidad de la demanda en la Provincia de Buenos Aires (Ley 13.951) — no está entre las excepciones taxativas de su art. 4°.</p>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Rubros indemnizatorios</div>
      <div id="dt-rubros">
        ${RUBROS.map(r => `
          <div class="check-row" data-rubro="${r.id}" style="display:flex;align-items:center;gap:.6rem;margin-bottom:6px;flex-wrap:wrap">
            <input type="checkbox" id="dt-rubro-${r.id}" ${r.default ? 'checked' : ''}>
            <label for="dt-rubro-${r.id}" style="flex:1;min-width:220px;font-size:.85rem">${r.label}</label>
            ${r.pct ? `<input type="number" id="dt-rubro-${r.id}-pct" placeholder="% incap." style="width:100px" min="0" max="100" step="0.01">` : ''}
            <input type="number" id="dt-rubro-${r.id}-monto" placeholder="Monto $" style="width:150px" min="0" step="0.01">
          </div>`).join('')}
      </div>
      <p id="dt-total-rubros" style="font-weight:700;margin:8px 0 0"></p>
      <p style="font-size:.75rem;color:var(--color-muted);margin:6px 0 0">Incapacidad sobreviniente: valor sujeto al prudente arbitrio judicial (art. 1746, CCyC; SCBA, "Vilar", 9/8/2022) — usar la <em>Calculadora de Indemnización por Incapacidad</em> del Estudio solo como referencia orientativa, no vinculante.</p>

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:20px">
        <button class="btn btn-primary" id="dt-generar">Generar escrito</button>
        <button class="btn btn-ghost"   id="dt-limpiar">Limpiar</button>
      </div>

      <div id="dt-resultado" style="display:none;margin-top:24px">
        <label for="dt-texto" style="font-weight:600;display:block;margin-bottom:6px">Texto generado (editable)</label>
        <textarea id="dt-texto" rows="24" style="width:100%;resize:vertical;font-family:inherit;font-size:.9rem;padding:12px;border:1px solid var(--color-border);border-radius:6px;background:#ffffff;color:#1a1a1a;line-height:1.6"></textarea>
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px">
          <button class="btn btn-success" id="dt-copiar">📋 Copiar texto</button>
          <button class="btn btn-ghost"   id="dt-pdf">📄 Exportar PDF</button>
          <button class="btn btn-ghost"   id="dt-word">📝 Exportar Word</button>
        </div>
      </div>

      <p style="margin-top:24px;font-size:.78rem;color:var(--color-muted);border-top:1px solid var(--color-border);padding-top:12px">
        Escrito orientativo. Verificar en cada caso: el Departamento Judicial y juzgado competente; el cumplimiento de la mediación previa como condición de admisibilidad (Ley 13.951); que no haya operado el plazo de prescripción de tres años (art. 2561, CCyC) desde la fecha del hecho; el criterio de actualización e intereses vigente en el Departamento Judicial interviniente conforme la doctrina legal más reciente de la SCBA ("Barrios", 18/4/2024, y sus desarrollos posteriores); y la franquicia y el límite de cobertura de la póliza antes de estimar el monto efectivamente recuperable de la aseguradora citada en garantía (CSJN, "Buffoni", 8/4/2014, sobre oponibilidad de franquicias en vehículos particulares).
      </p>
    </div>`;

  // ── Referencias ────────────────────────────────────────────────────────
  const selAbogado = container.querySelector('#dt-abogado-select');
  const emailNotifInput = container.querySelector('#dt-email-notificaciones');
  const chkHuboLesiones = container.querySelector('#dt-hubo-lesiones');
  const bloqueLesiones = container.querySelector('#dt-bloque-lesiones');
  const chkMediacion = container.querySelector('#dt-mediacion-cumplida');
  const wrapMediacion = container.querySelector('#dt-wrap-mediacion');
  const chkCitarGarantia = container.querySelector('#dt-citar-garantia');
  const divRes = container.querySelector('#dt-resultado');
  const textarea = container.querySelector('#dt-texto');
  let ultimoTextoGenerado = '';

  function val(id) { const el = container.querySelector(`#${id}`); return el ? el.value.trim() : ''; }
  function fmtFecha(iso) {
    if (!iso) return '';
    const p = iso.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
  }

  function actualizarAbogado() {
    const a = ABOGADOS_BY_ID[selAbogado.value];
    if (!a) return;
    emailNotifInput.value = a.domicilioElectronico;
    container.querySelector('#dt-matricula').value = a.matricula;
  }
  selAbogado.addEventListener('change', actualizarAbogado);
  actualizarAbogado();

  container.querySelector('#dt-prioridad-paso').addEventListener('change', (e) => {
    container.querySelector('#dt-wrap-infraccion').style.display = e.target.checked ? '' : 'none';
  });
  container.querySelector('#dt-denuncia').addEventListener('change', (e) => {
    container.querySelector('#dt-wrap-denuncia').style.display = e.target.checked ? '' : 'none';
  });
  chkHuboLesiones.addEventListener('change', (e) => {
    bloqueLesiones.style.display = e.target.checked ? '' : 'none';
    RUBROS.filter(r => r.requiereLesiones).forEach(r => {
      const chk = container.querySelector(`#dt-rubro-${r.id}`);
      if (!e.target.checked) chk.checked = false;
    });
    actualizarTotalRubros();
  });
  chkMediacion.addEventListener('change', (e) => {
    wrapMediacion.style.display = e.target.checked ? '' : 'none';
  });

  function actualizarTotalRubros() {
    let total = 0;
    RUBROS.forEach(r => {
      const chk = container.querySelector(`#dt-rubro-${r.id}`);
      if (chk.checked) {
        const monto = parseFloat(val(`dt-rubro-${r.id}-monto`)) || 0;
        total += monto;
      }
    });
    container.querySelector('#dt-total-rubros').textContent = total > 0 ? `Total reclamado por rubros: $ ${fmt(total)}` : '';
  }
  RUBROS.forEach(r => {
    container.querySelector(`#dt-rubro-${r.id}`).addEventListener('change', actualizarTotalRubros);
    container.querySelector(`#dt-rubro-${r.id}-monto`).addEventListener('input', actualizarTotalRubros);
  });

  // ── Generar escrito ──────────────────────────────────────────────────────
  container.querySelector('#dt-generar').addEventListener('click', () => {
    const d = {
      actor: val('dt-actor') || '[ACTOR]',
      actorDni: val('dt-actor-dni') || '[DNI]',
      actorDomicilio: val('dt-actor-domicilio') || '[DOMICILIO REAL]',
      coactores: val('dt-coactores'),
      demandadoConductor: val('dt-demandado-conductor') || '[CONDUCTOR DEMANDADO]',
      demandadoTitular: val('dt-demandado-titular'),
      demandadoDomicilio: val('dt-demandado-domicilio') || '[DOMICILIO DEL/DE LOS DEMANDADO/S]',
      aseguradora: val('dt-aseguradora'),
      poliza: val('dt-poliza'),
      citarGarantia: chkCitarGarantia.checked,
      fechaHecho: fmtFecha(val('dt-fecha-hecho')) || '[FECHA]',
      horaHecho: val('dt-hora-hecho'),
      lugarHecho: val('dt-lugar-hecho') || '[LUGAR DEL HECHO]',
      vehiculoActor: val('dt-vehiculo-actor'),
      vehiculoDemandado: val('dt-vehiculo-demandado'),
      relatoHecho: val('dt-relato-hecho'),
      prioridadPaso: container.querySelector('#dt-prioridad-paso').checked,
      detalleInfraccion: val('dt-detalle-infraccion'),
      denuncia: container.querySelector('#dt-denuncia').checked,
      datosDenuncia: val('dt-datos-denuncia'),
      testigos: val('dt-testigos'),
      huboLesiones: chkHuboLesiones.checked,
      diagnostico: val('dt-diagnostico'),
      atencionMedica: val('dt-atencion-medica'),
      tratamientoCurso: container.querySelector('#dt-tratamiento-curso').checked,
      mediacionCumplida: chkMediacion.checked,
      fechaCierreMediacion: fmtFecha(val('dt-fecha-cierre-mediacion')),
    };

    const abogadoSel = ABOGADOS_BY_ID[selAbogado.value];
    const matricula = val('dt-matricula') || abogadoSel.matricula;
    const abogadoTexto = `${abogadoSel.nombre}, ${abogadoSel.genero === 'M' ? 'abogado' : 'abogada'} (${matricula})`;
    const caracterLetradoTexto = val('dt-caracter-letrado') === 'apoderado' ? 'apoderado/a' : 'patrocinante';
    const juzgado = val('dt-juzgado');
    const domicilioProcesal = val('dt-domicilio-procesal') || '[DOMICILIO PROCESAL A CONSTITUIR]';
    const emailNotif = emailNotifInput.value.trim() || abogadoSel.domicilioElectronico;

    const rubrosActivos = RUBROS.filter(r => container.querySelector(`#dt-rubro-${r.id}`).checked);
    let totalRubros = 0;
    const rubrosTexto = rubrosActivos.map((r, i) => {
      const monto = parseFloat(val(`dt-rubro-${r.id}-monto`)) || 0;
      totalRubros += monto;
      const pct = r.pct ? parseFloat(val(`dt-rubro-${r.id}-pct`)) || 0 : null;
      return `${i + 1}) ${r.label}${pct ? ` (${pct}% de incapacidad estimada)` : ''}: $ ${fmt(monto)}.`;
    }).join('\n');

    const hechos = hechosTransito(d);
    const derecho = derechoTransito(d);
    const petitorio = petitorioTransito(d, rubrosTexto, totalRubros);

    const coactoresTexto = d.coactores
      ? `, conjuntamente con ${d.coactores.split('\n').map(s => s.trim()).filter(Boolean).join(', ')}, en su carácter de damnificado/a directo/a por derecho propio (art. 1741, CCyC)`
      : '';

    const demandadosTexto = d.demandadoTitular
      ? `${d.demandadoConductor} y ${d.demandadoTitular}, en sus respectivos caracteres de conductor y de titular registral/guardián del vehículo interviniente (arts. 1757 y 1758, CCyC)`
      : d.demandadoConductor;

    const texto =
`SEÑOR JUEZ${juzgado ? ` — ${juzgado}` : ''}:

${abogadoTexto}, en mi carácter de ${caracterLetradoTexto} de ${d.actor}${coactoresTexto}, DNI ${d.actorDni}, con domicilio real en ${d.actorDomicilio}, constituyendo domicilio procesal en ${domicilioProcesal} y domicilio electrónico en ${emailNotif} (art. 40, CPCC de la Provincia de Buenos Aires), a V.S. respetuosamente me presento y digo:

I. OBJETO
Que vengo por el presente a promover demanda por daños y perjuicios contra ${demandadosTexto}, con domicilio en ${d.demandadoDomicilio}${d.citarGarantia && d.aseguradora ? `, con citación en garantía de ${d.aseguradora}${d.poliza ? ` (póliza N° ${d.poliza})` : ''} en los términos del art. 118 de la Ley 17.418` : ''}, por la suma de $ ${fmt(totalRubros)} o lo que en más o en menos resulte de la prueba a producirse, con más sus intereses y costas, por la vía y forma de juicio ordinario que por derecho corresponde (art. 319 y ccdtes., CPCC).

II. HECHOS
${hechos}

III. EL DERECHO
${derecho}

IV. PRUEBA
Se ofrece como prueba: a) documental, consistente en la denuncia policial/exposición civil, presupuestos y facturas de reparación, constancias médicas, y demás documentación que se acompaña o se individualiza en autos; b) testimonial, de los testigos presenciales del hecho; c) pericial mecánica, sobre los rodados intervinientes y la mecánica del accidente; d) pericial médica${d.huboLesiones ? ', sobre las lesiones sufridas por la parte actora y el porcentaje de incapacidad resultante' : ''}; e) informativa, a la aseguradora citada en garantía y a las reparticiones que correspondan; f) la que se ofrezca oportunamente.

V. PETITORIO
${petitorio}

PROVEER DE CONFORMIDAD,
SERÁ JUSTICIA.

──────────────────────────────────────────────
Recordatorios previos a la presentación (no forman parte del escrito):
- Verificar el Departamento Judicial y juzgado competente según el domicilio del demandado o el lugar del hecho.
- Verificar el cumplimiento de la mediación previa obligatoria (Ley 13.951) como condición de admisibilidad.
- Verificar que no haya operado el plazo de prescripción de tres (3) años desde la fecha del hecho (art. 2561, CCyC).
- Verificar el criterio de actualización e intereses vigente en el Departamento Judicial interviniente conforme la doctrina legal más reciente de la SCBA ("Barrios", 18/4/2024, y sus desarrollos posteriores).
- Verificar la franquicia y el límite de cobertura de la póliza antes de estimar el monto efectivamente recuperable de la aseguradora citada en garantía (CSJN, "Buffoni", 8/4/2014).
- Si hubiera fallecimiento de la víctima, este generador no contempla el régimen de legitimación específico del art. 1741, CCyC, para derechohabientes — requiere análisis particular.`;

    ultimoTextoGenerado = texto;
    textarea.value = texto;
    divRes.style.display = 'block';
    textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    textarea.dataset.titulo = 'Demanda de Daños y Perjuicios — Accidente de Tránsito';
  });

  function hechosTransito(d) {
    return `Que con fecha ${d.fechaHecho}${d.horaHecho ? `, siendo aproximadamente las ${d.horaHecho} horas` : ''}, en ${d.lugarHecho}, se produjo una colisión entre el vehículo${d.vehiculoActor ? ` ${d.vehiculoActor}` : ''} conducido por la parte actora y el vehículo${d.vehiculoDemandado ? ` ${d.vehiculoDemandado}` : ''} conducido por ${d.demandadoConductor}.${d.relatoHecho ? ` ${d.relatoHecho}.` : ''} ${d.prioridadPaso ? `Que el demandado carecía de prioridad de paso y/o incurrió en una infracción a las normas de tránsito vinculada causalmente al hecho${d.detalleInfraccion ? ` (${d.detalleInfraccion})` : ''}, conforme la Ley Nacional de Tránsito N° 24.449 y su normativa reglamentaria, vigente en el territorio de la Provincia de Buenos Aires por adhesión dispuesta por la Ley 13.927.` : 'Que la responsabilidad en la producción del hecho corresponde a la parte demandada, conforme se detallará en el acápite de derecho.'} ${d.denuncia ? `Que del hecho se formuló denuncia policial/exposición civil${d.datosDenuncia ? ` (${d.datosDenuncia})` : ''}, acompañándose la constancia respectiva.` : 'Que se encuentra en trámite la denuncia correspondiente del hecho relatado.'} ${d.testigos ? `Que presenciaron el hecho los siguientes testigos: ${d.testigos.split('\n').map(s => s.trim()).filter(Boolean).join('; ')}.` : ''} ${d.huboLesiones ? `Que como consecuencia del hecho la parte actora sufrió lesiones personales, a saber: ${d.diagnostico || '[DETALLAR LESIONES]'}, recibiendo la siguiente atención médica: ${d.atencionMedica || '[DETALLAR ATENCIÓN MÉDICA]'}.${d.tratamientoCurso ? ' El tratamiento correspondiente se encuentra en curso a la fecha de esta presentación.' : ''}` : 'Que el hecho ocasionó únicamente daños materiales en el vehículo de la parte actora, sin lesiones personales.'} ${d.mediacionCumplida ? `Que se ha dado cumplimiento a la instancia de mediación previa obligatoria prevista por la Ley 13.951${d.fechaCierreMediacion ? `, cuya acta fue labrada con fecha ${d.fechaCierreMediacion}` : ''}, sin arribarse a acuerdo entre las partes.` : 'Que se encuentra en trámite la instancia de mediación previa obligatoria prevista por la Ley 13.951, condición de admisibilidad de la presente demanda.'}`;
  }

  function derechoTransito(d) {
    return `Que la responsabilidad de la parte demandada encuadra en el régimen objetivo de responsabilidad por el riesgo o vicio de las cosas previsto por los arts. 1757 y 1758 del Código Civil y Comercial de la Nación, aplicable a los daños derivados de la circulación de vehículos por remisión del art. 1769 del mismo cuerpo legal, correspondiendo tanto al dueño como al guardián del rodado responder en forma concurrente. Que, tratándose de un factor de atribución objetivo, corresponde a la parte demandada acreditar la existencia de alguna de las eximentes previstas por el art. 1722, CCyC —hecho del damnificado, hecho de un tercero por quien no debe responder, o caso fortuito o fuerza mayor— para liberarse total o parcialmente de responsabilidad, no siendo suficiente a tal fin la mera acreditación de la ausencia de culpa. Resulta asimismo de aplicación la Ley Nacional de Tránsito N° 24.449 y su normativa reglamentaria, vigente en el territorio de la Provincia de Buenos Aires por adhesión dispuesta por la Ley 13.927 y su Decreto reglamentario N° 532/09, en cuanto fija las reglas de circulación, prioridad de paso y demás normas de conducta vial relevantes para la atribución causal del hecho.${d.citarGarantia ? ` Que, en virtud de lo dispuesto por el art. 118 de la Ley 17.418, corresponde citar en garantía a la aseguradora del vehículo demandado, quien queda obligada al pago de la indemnización dentro de los límites de la suma asegurada, sin perjuicio de las defensas que le sean oponibles conforme la póliza contratada.` : ''} Que los daños y perjuicios reclamados encuentran su fundamento en el principio de reparación plena (arts. 1740 y 1746, CCyC)${d.huboLesiones ? ', debiendo la indemnización por incapacidad sobreviniente ponderar las circunstancias particulares de la víctima —edad, ingresos, actividad, expectativa de vida útil— sin sujeción mecánica y excluyente a una única fórmula matemática, conforme la doctrina de la Suprema Corte de Justicia de la Provincia de Buenos Aires ("Vilar", 9/8/2022)' : ''}, y el daño moral en el art. 1741 del Código Civil y Comercial de la Nación.`;
  }

  function petitorioTransito(d, rubrosTexto, totalRubros) {
    return `Por lo expuesto, a V.S. solicito:
1) Me tenga por presentado, por parte y por constituido el domicilio procesal indicado.
2) Se tenga por promovida demanda por daños y perjuicios contra ${d.demandadoConductor}${d.demandadoTitular ? ` y ${d.demandadoTitular}` : ''}${d.citarGarantia && d.aseguradora ? `, con citación en garantía de ${d.aseguradora}${d.poliza ? ` (póliza N° ${d.poliza})` : ''}` : ''}, por los siguientes rubros:
${rubrosTexto || '[DETALLAR RUBROS RECLAMADOS Y SUS MONTOS]'}
   Total reclamado: $ ${fmt(totalRubros)}, o lo que en más o en menos resulte de la prueba a producirse.
3) Se tenga presente la prueba ofrecida.
4) Se condene a la parte demandada${d.citarGarantia && d.aseguradora ? ` y, en la medida del seguro, a la aseguradora citada en garantía,` : ''} al pago de las sumas reclamadas, con más sus intereses conforme la doctrina legal vigente de la Suprema Corte de Justicia de la Provincia de Buenos Aires en materia de actualización e intereses en juicios de daños y perjuicios, y con expresa imposición de costas.
5) Se tengan presentes las autorizaciones conferidas a ${TODOS_ABOGADOS_TEXTO} para compulsar el expediente, tomar vista de las actuaciones, retirar y diligenciar cédulas, oficios, mandamientos, testimonios y copias.`;
  }

  container.querySelector('#dt-limpiar').addEventListener('click', () => {
    ['dt-actor', 'dt-actor-dni', 'dt-actor-domicilio', 'dt-coactores', 'dt-demandado-conductor', 'dt-demandado-titular', 'dt-demandado-domicilio', 'dt-aseguradora', 'dt-poliza', 'dt-fecha-hecho', 'dt-hora-hecho', 'dt-lugar-hecho', 'dt-vehiculo-actor', 'dt-vehiculo-demandado', 'dt-relato-hecho', 'dt-detalle-infraccion', 'dt-datos-denuncia', 'dt-testigos', 'dt-diagnostico', 'dt-atencion-medica', 'dt-fecha-cierre-mediacion', 'dt-domicilio-procesal'].forEach(id => {
      const el = container.querySelector(`#${id}`); if (el) el.value = '';
    });
    container.querySelector('#dt-juzgado').value = 'Juzgado de Primera Instancia en lo Civil y Comercial N° __ del Departamento Judicial de ___, Provincia de Buenos Aires';
    container.querySelector('#dt-citar-garantia').checked = true;
    container.querySelector('#dt-prioridad-paso').checked = false;
    container.querySelector('#dt-wrap-infraccion').style.display = 'none';
    container.querySelector('#dt-denuncia').checked = true;
    container.querySelector('#dt-wrap-denuncia').style.display = '';
    chkHuboLesiones.checked = false;
    bloqueLesiones.style.display = 'none';
    container.querySelector('#dt-tratamiento-curso').checked = false;
    chkMediacion.checked = true;
    wrapMediacion.style.display = '';
    RUBROS.forEach(r => {
      container.querySelector(`#dt-rubro-${r.id}`).checked = r.default;
      container.querySelector(`#dt-rubro-${r.id}-monto`).value = '';
      if (r.pct) container.querySelector(`#dt-rubro-${r.id}-pct`).value = '';
    });
    actualizarTotalRubros();
    selAbogado.selectedIndex = 0;
    actualizarAbogado();
    divRes.style.display = 'none';
    textarea.value = '';
    ultimoTextoGenerado = '';
  });

  container.querySelector('#dt-copiar').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const btn = container.querySelector('#dt-copiar');
    navigator.clipboard.writeText(texto).then(() => {
      const orig = btn.textContent;
      btn.textContent = 'Copiado ✓';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => { prompt('Copie el texto:', texto); });
  });

  container.querySelector('#dt-pdf').addEventListener('click', () => {
    if (!ultimoTextoGenerado) return;
    const html = `<div class="info-box" style="white-space:pre-wrap;font-family:inherit">${escHtml(textarea.value)}</div>`;
    exportarPDF(textarea.dataset.titulo || 'Demanda de Daños y Perjuicios — Accidente de Tránsito', html);
  });
  container.querySelector('#dt-word').addEventListener('click', () => {
    if (!ultimoTextoGenerado) return;
    const html = textarea.value.split('\n').map(l => `<p>${escHtml(l) || '&nbsp;'}</p>`).join('');
    exportarWord(textarea.dataset.titulo || 'Demanda de Daños y Perjuicios — Accidente de Transito', html);
  });

  function escHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── Prefill desde Minutas de Caso ────────────────────────────────────────
  (function prefillDesdeMinutas() {
    let payload;
    try { payload = JSON.parse(localStorage.getItem('mvc_prefill_transito') || 'null'); } catch { payload = null; }
    if (!payload || !payload.campos) return;

    const banner = document.createElement('div');
    banner.style.cssText = 'background:#e8f4ea;border:1px solid #7ab88a;border-radius:6px;padding:12px 14px;margin-bottom:16px;font-size:.85rem;color:#1f4d2c;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap';
    banner.innerHTML = `
      <span>📋 Hay datos de una minuta cargados el ${payload.fecha || ''} — ¿los cargamos en este formulario?</span>
      <span style="display:flex;gap:8px">
        <button class="btn btn-success" id="dt-prefill-cargar" type="button">Cargar</button>
        <button class="btn btn-ghost" id="dt-prefill-descartar" type="button">Descartar</button>
      </span>`;
    container.querySelector('.tool-card').insertBefore(banner, container.querySelector('.tool-card').children[1]);

    banner.querySelector('#dt-prefill-cargar').addEventListener('click', () => {
      Object.entries(payload.campos).forEach(([id, valor]) => {
        const el = container.querySelector(`#dt-${id}`);
        if (el && valor) el.value = valor;
      });
      if (payload.checks) {
        Object.entries(payload.checks).forEach(([id, valor]) => {
          const el = container.querySelector(`#dt-${id}`);
          if (el && valor) { el.checked = true; el.dispatchEvent(new Event('change')); }
        });
      }
      if (Array.isArray(payload.testigos) && payload.testigos.length) {
        const testigosTexto = payload.testigos.map(t => `${t.nombre || ''}${t.contacto ? ` — ${t.contacto}` : ''}`).filter(Boolean).join('\n');
        if (testigosTexto) container.querySelector('#dt-testigos').value = testigosTexto;
      }
      if (Array.isArray(payload.coactores) && payload.coactores.length) {
        container.querySelector('#dt-coactores').value = payload.coactores.map(c => c.nombre).filter(Boolean).join('\n');
      }
      actualizarTotalRubros();
      localStorage.removeItem('mvc_prefill_transito');
      banner.remove();
    });
    banner.querySelector('#dt-prefill-descartar').addEventListener('click', () => {
      localStorage.removeItem('mvc_prefill_transito');
      banner.remove();
    });
  })();
}
