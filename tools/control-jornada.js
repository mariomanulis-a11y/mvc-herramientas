// control-jornada.js — Reglamento Interno de Control de Jornada y Registro de
// Horas Extraordinarias (Consultoría PYME)
// Instrumento normativo interno (no un cuestionario ni un checklist) para que la
// empresa formalice el control de jornada, en línea con los arts. 196 a 198 y 201
// LCT, la Ley 11.544 (Dec. Regl. 16.115/33) y el Decreto 484/2000 (topes de horas
// extraordinarias). Incluye acuse de recibo para su comunicación al personal.
import { exportarPDF, exportarWord } from './exportar.js';

export function initControlJornada(container) {

  const ABOGADOS = [
    { value: 'mario',   label: 'Mario Manulis' },
    { value: 'soledad', label: 'Soledad Velazquez' },
    { value: 'camila',  label: 'Camila Poggi' },
    { value: 'otro',    label: 'Otro/a' },
  ];

  const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const SISTEMAS = [
    { value: 'biometrico', label: 'Reloj biométrico (huella digital / facial)' },
    { value: 'planilla',   label: 'Planilla de firmas' },
    { value: 'app',        label: 'Aplicación digital / sistema de fichado electrónico' },
    { value: 'otro',       label: 'Otro (especificar)' },
  ];

  const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  // ── HTML ──────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Control de Jornada y Horario</h2>
      <p class="tool-desc">Reglamento interno para formalizar el control de jornada y el régimen de horas extraordinarias (LCT arts. 196 a 198 y 201; Ley 11.544; Dec. 484/2000)</p>

      <div id="cj-prefill-slot"></div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:8px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos de la empresa</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group"><label for="cj-empresa">Razón social</label><input type="text" id="cj-empresa" placeholder="Empresa S.A."></div>
        <div class="field-group"><label for="cj-cuit">CUIT</label><input type="text" id="cj-cuit" placeholder="30-12345678-9"></div>
        <div class="field-group" style="grid-column:1/-1"><label for="cj-domicilio">Domicilio</label><input type="text" id="cj-domicilio" placeholder="Calle 123, Pilar, Provincia de Buenos Aires"></div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Ámbito de aplicación</div>
      <div class="field-group">
        <label for="cj-ambito">Personal comprendido</label>
        <textarea id="cj-ambito" rows="2" placeholder="Todo el personal dependiente de la empresa, cualquiera sea su categoría o antigüedad."></textarea>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Jornada habitual</div>
      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="cj-modalidad">Modalidad</label>
          <select id="cj-modalidad">
            <option value="fija">Jornada fija</option>
            <option value="turnos">Turnos rotativos</option>
            <option value="mixta">Mixta (fija + turnos rotativos según puesto)</option>
          </select>
        </div>
      </div>
      <div id="cj-wrap-fija">
        <div class="field-group">
          <label>Días de la semana</label>
          <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:4px">
            ${DIAS.map((d, i) => `
              <label style="display:flex;align-items:center;gap:5px;font-weight:400;cursor:pointer">
                <input type="checkbox" class="cj-dia-check" value="${d}" style="width:auto" ${i < 5 ? 'checked' : ''}> ${d}
              </label>`).join('')}
          </div>
        </div>
        <div class="form-row">
          <div class="field-group"><label for="cj-hora-entrada">Hora de entrada</label><input type="time" id="cj-hora-entrada" value="09:00"></div>
          <div class="field-group"><label for="cj-hora-salida">Hora de salida</label><input type="time" id="cj-hora-salida" value="18:00"></div>
          <div class="field-group"><label for="cj-pausa">Pausa / almuerzo (minutos)</label><input type="number" id="cj-pausa" min="0" step="5" value="60"></div>
        </div>
      </div>
      <div id="cj-wrap-turnos" style="display:none">
        <div class="field-group">
          <label for="cj-turnos-desc">Descripción de los turnos</label>
          <textarea id="cj-turnos-desc" rows="3" placeholder="Ej: Turno mañana 06:00 a 14:00, turno tarde 14:00 a 22:00, turno noche 22:00 a 06:00, con rotación semanal según cronograma comunicado por el sector de RRHH."></textarea>
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Sistema de registro de asistencia</div>
      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="cj-sistema">Sistema utilizado</label>
          <select id="cj-sistema">
            ${SISTEMAS.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}
          </select>
        </div>
        <div class="field-group" style="flex:1" id="cj-wrap-sistema-otro">
          <label for="cj-sistema-otro">Especificar</label>
          <input type="text" id="cj-sistema-otro" placeholder="Ej: planilla papel con doble firma">
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Horas extraordinarias</div>
      <div class="form-row">
        <div class="field-group" style="flex:1"><label for="cj-autoriza">Quién autoriza</label><input type="text" id="cj-autoriza" value="la Gerencia / el sector de Recursos Humanos"></div>
        <div class="field-group" style="flex:1"><label for="cj-anticipacion">Anticipación requerida</label><input type="text" id="cj-anticipacion" value="24 horas"></div>
      </div>
      <div class="form-row">
        <div class="field-group" style="flex:1"><label for="cj-tope-mensual">Tope mensual (horas)</label><input type="number" id="cj-tope-mensual" min="0" step="1" value="30"></div>
        <div class="field-group" style="flex:1"><label for="cj-tope-anual">Tope anual (horas)</label><input type="number" id="cj-tope-anual" min="0" step="1" value="200"></div>
        <div class="field-group" style="flex:2"><label for="cj-cct">Convenio Colectivo de Trabajo aplicable (opcional)</label><input type="text" id="cj-cct" placeholder="Ej: CCT 130/75"></div>
      </div>
      <p style="font-size:.78rem;color:var(--color-muted);margin:2px 0 0">Topes de referencia conforme Decreto 484/2000 (30 hs. mensuales / 200 hs. anuales), sin perjuicio de las excepciones legales (exigencias excepcionales, autorización de la autoridad de aplicación o fuerza mayor) y de los límites que en su caso fije el CCT aplicable.</p>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del acto</div>
      <div class="form-row">
        <div class="field-group" style="flex:1"><label for="cj-ciudad">Ciudad</label><input type="text" id="cj-ciudad" placeholder="Pilar"></div>
        <div class="field-group" style="flex:1"><label for="cj-fecha">Fecha</label><input type="date" id="cj-fecha"></div>
        <div class="field-group" style="flex:1"><label for="cj-fecha-vigencia">Vigencia a partir del</label><input type="date" id="cj-fecha-vigencia"></div>
        <div class="field-group" style="flex:1"><label for="cj-abogado">Elaborado por</label>
          <select id="cj-abogado">${ABOGADOS.map(a => `<option value="${a.value}">${a.label}</option>`).join('')}</select>
        </div>
      </div>

      <div class="field-group">
        <label for="cj-observaciones">Observaciones adicionales (opcional)</label>
        <textarea id="cj-observaciones" rows="2"></textarea>
      </div>

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:8px">
        <button class="btn btn-primary" id="cj-generar">Generar reglamento</button>
        <button class="btn btn-ghost"   id="cj-limpiar">Limpiar</button>
      </div>

      <div id="cj-resultado" style="display:none;margin-top:24px">
        <label for="cj-texto" style="font-weight:600;display:block;margin-bottom:6px">Texto generado (editable)</label>
        <textarea id="cj-texto" rows="28" style="width:100%;resize:vertical;font-family:inherit;font-size:.9rem;padding:12px;border:1px solid var(--color-border);border-radius:6px;background:#ffffff;color:#1a1a1a;line-height:1.6"></textarea>
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px">
          <button class="btn btn-success" id="cj-copiar">📋 Copiar texto</button>
          <button class="btn btn-ghost"   id="cj-pdf">📄 Exportar PDF</button>
          <button class="btn btn-ghost"   id="cj-word">📝 Exportar Word</button>
          <button class="btn btn-ghost"   id="cj-reset-texto">Restablecer</button>
        </div>
      </div>

      <p style="margin-top:24px;font-size:.78rem;color:var(--color-muted);border-top:1px solid var(--color-border);padding-top:12px">
        Modelo orientativo, a adaptar al caso concreto y al Convenio Colectivo de Trabajo aplicable. No constituye asesoramiento legal definitivo.
      </p>
    </div>`;

  // ── Referencias ───────────────────────────────────────────────────────────
  const selModalidad   = container.querySelector('#cj-modalidad');
  const wrapFija        = container.querySelector('#cj-wrap-fija');
  const wrapTurnos       = container.querySelector('#cj-wrap-turnos');
  const selSistema      = container.querySelector('#cj-sistema');
  const wrapSistemaOtro = container.querySelector('#cj-wrap-sistema-otro');
  const divRes          = container.querySelector('#cj-resultado');
  const textarea        = container.querySelector('#cj-texto');

  let ultimoTextoGenerado = '';

  function val(id) { const el = container.querySelector(`#${id}`); return el ? el.value.trim() : ''; }
  function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function actualizarModalidad() {
    const v = selModalidad.value;
    wrapFija.style.display = (v === 'fija' || v === 'mixta') ? '' : 'none';
    wrapTurnos.style.display = (v === 'turnos' || v === 'mixta') ? '' : 'none';
  }
  selModalidad.addEventListener('change', actualizarModalidad);
  actualizarModalidad();

  function actualizarSistema() {
    wrapSistemaOtro.style.display = selSistema.value === 'otro' ? '' : 'none';
  }
  selSistema.addEventListener('change', actualizarSistema);
  actualizarSistema();

  function fmtFechaLarga(iso) {
    if (!iso) return '[FECHA]';
    const [y, m, d] = iso.split('-');
    return `${parseInt(d, 10)} de ${MESES[parseInt(m, 10) - 1]} de ${y}`;
  }
  function fmtFechaCorta(iso) {
    if (!iso) return '-';
    const p = iso.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
  }

  container.querySelector('#cj-generar').addEventListener('click', () => {
    const empresa = val('cj-empresa') || '[RAZÓN SOCIAL]';
    const cuit = val('cj-cuit') || '[CUIT]';
    const domicilio = val('cj-domicilio') || '[DOMICILIO]';
    const ambito = val('cj-ambito') || 'Todo el personal dependiente de la empresa, cualquiera sea su categoría o antigüedad.';
    const modalidad = selModalidad.value;

    const diasSeleccionados = Array.from(container.querySelectorAll('.cj-dia-check:checked')).map(el => el.value);
    const horaEntrada = val('cj-hora-entrada') || '-';
    const horaSalida = val('cj-hora-salida') || '-';
    const pausa = val('cj-pausa') || '0';
    const turnosDesc = val('cj-turnos-desc');

    let parrafoJornada = '';
    if (modalidad === 'fija' || modalidad === 'mixta') {
      parrafoJornada += `La jornada habitual de trabajo se desarrolla ${diasSeleccionados.length ? `los días ${diasSeleccionados.join(', ')}` : 'según el cronograma vigente'}, en el horario de ${horaEntrada} a ${horaSalida} horas, con una pausa de ${pausa} minutos destinada a descanso y refrigerio.`;
    }
    if (modalidad === 'turnos' || modalidad === 'mixta') {
      parrafoJornada += `${parrafoJornada ? ' Para el personal comprendido en el régimen de turnos rotativos: ' : ''}${turnosDesc || 'se establece un régimen de turnos rotativos, cuyo cronograma será comunicado periódicamente por el sector de Recursos Humanos.'}`;
    }

    const sistema = SISTEMAS.find(s => s.value === selSistema.value);
    const sistemaLabel = selSistema.value === 'otro' ? (val('cj-sistema-otro') || 'el sistema que la empresa determine') : sistema.label;

    const autoriza = val('cj-autoriza') || 'la Gerencia / el sector de Recursos Humanos';
    const anticipacion = val('cj-anticipacion') || '24 horas';
    const topeMensual = val('cj-tope-mensual') || '30';
    const topeAnual = val('cj-tope-anual') || '200';
    const cct = val('cj-cct');

    const ciudad = val('cj-ciudad') || '[CIUDAD]';
    const fecha = fmtFechaLarga(val('cj-fecha'));
    const fechaVigenciaLarga = fmtFechaLarga(val('cj-fecha-vigencia'));
    const abogadoLabel = container.querySelector('#cj-abogado').selectedOptions[0].textContent;
    const observaciones = val('cj-observaciones');

    const texto =
`REGLAMENTO INTERNO DE CONTROL DE JORNADA Y REGISTRO DE HORAS EXTRAORDINARIAS
${empresa} — CUIT ${cuit}

En la ciudad de ${ciudad}, a los ${fecha}, ${empresa} (CUIT ${cuit}), con domicilio en ${domicilio}, dicta el presente reglamento interno con el objeto de formalizar el control de la jornada laboral y el régimen de horas extraordinarias aplicable a su personal dependiente, en un todo de acuerdo con la Ley de Contrato de Trabajo (LCT), la Ley 11.544 y su Decreto Reglamentario 16.115/33, y el Decreto 484/2000.

ARTÍCULO 1° — OBJETO
El presente reglamento tiene por objeto establecer un sistema formal y auditable de control de la jornada laboral y del régimen de autorización, registro y liquidación de horas extraordinarias, en cumplimiento de los arts. 196 a 198 y 201 de la LCT.

ARTÍCULO 2° — ÁMBITO DE APLICACIÓN
${ambito}

ARTÍCULO 3° — JORNADA HABITUAL
${parrafoJornada}

ARTÍCULO 4° — SISTEMA DE REGISTRO DE ASISTENCIA
El control de la jornada se efectúa mediante ${sistemaLabel}. Todo el personal deberá registrar su ingreso y egreso de manera personal e intransferible, siendo pasible de sanción disciplinaria la adulteración del registro propio o ajeno.

ARTÍCULO 5° — HORAS EXTRAORDINARIAS
5.1. Autorización previa: toda hora de trabajo que exceda la jornada habitual establecida en el art. 3° deberá contar con autorización previa de ${autoriza}, solicitada con una anticipación no menor a ${anticipacion}. No se reconocerá ni abonará como hora extraordinaria el tiempo trabajado sin dicha autorización, sin perjuicio de las obligaciones legales que pudieran corresponder.
5.2. Límites legales: conforme el Decreto 484/2000, el total de horas extraordinarias no podrá exceder de ${topeMensual} horas mensuales ni de ${topeAnual} horas anuales, salvo las excepciones previstas por la normativa vigente (exigencias excepcionales de la economía nacional o de la empresa, autorización de la autoridad de aplicación, o fuerza mayor).${cct ? ` Sin perjuicio de ello, se estará a los límites y condiciones que en su caso establezca el Convenio Colectivo de Trabajo aplicable (${cct}).` : ''}
5.3. Recargos: las horas extraordinarias se liquidarán con los recargos previstos por el art. 201 de la LCT: 50% sobre el salario habitual en días hábiles, y 100% en días sábado después de las 13 horas, domingos y feriados.

ARTÍCULO 6° — INCUMPLIMIENTOS
El incumplimiento del presente reglamento por parte del personal —incluyendo la falta de registro de jornada, la adulteración de registros propios o ajenos, o la realización de horas extraordinarias sin la autorización prevista— podrá dar lugar a las sanciones disciplinarias que correspondan conforme la Ley de Contrato de Trabajo y, en su caso, el convenio colectivo aplicable.

ARTÍCULO 7° — VIGENCIA Y COMUNICACIÓN
El presente reglamento entra en vigencia a partir del ${fechaVigenciaLarga} y será comunicado a todo el personal comprendido, dejándose constancia de su recepción mediante el acuse que se agrega a continuación. Toda modificación futura deberá comunicarse por el mismo medio.
${observaciones ? `\nOBSERVACIONES\n${observaciones}\n` : ''}
──────────────────────────────────────────────
ACUSE DE RECIBO

El/la trabajador/a abajo firmante deja constancia de haber recibido copia del presente Reglamento Interno de Control de Jornada y Registro de Horas Extraordinarias, encontrándose en conocimiento de su contenido y obligado/a a su cumplimiento.

Apellido y Nombre: ____________________________
DNI: ____________________________
Firma: ____________________________          Fecha: ____ / ____ / ______

Elaborado por: ${abogadoLabel} — MVC Abogados
Fecha de emisión: ${fmtFechaCorta(val('cj-fecha'))}`;

    ultimoTextoGenerado = texto;
    textarea.value = texto;
    divRes.style.display = 'block';
    textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    textarea.dataset.empresa = empresa;
  });

  container.querySelector('#cj-limpiar').addEventListener('click', () => {
    container.querySelectorAll('input[type="text"], input[type="date"], input[type="time"], input[type="number"], textarea').forEach(el => {
      if (el.id === 'cj-hora-entrada') { el.value = '09:00'; return; }
      if (el.id === 'cj-hora-salida') { el.value = '18:00'; return; }
      if (el.id === 'cj-pausa') { el.value = '60'; return; }
      if (el.id === 'cj-tope-mensual') { el.value = '30'; return; }
      if (el.id === 'cj-tope-anual') { el.value = '200'; return; }
      if (el.id === 'cj-autoriza') { el.value = 'la Gerencia / el sector de Recursos Humanos'; return; }
      if (el.id === 'cj-anticipacion') { el.value = '24 horas'; return; }
      el.value = '';
    });
    container.querySelectorAll('.cj-dia-check').forEach((el, i) => { el.checked = i < 5; });
    selModalidad.value = 'fija';
    selSistema.value = 'biometrico';
    actualizarModalidad();
    actualizarSistema();
    container.querySelector('#cj-abogado').selectedIndex = 0;
    divRes.style.display = 'none';
    textarea.value = '';
    ultimoTextoGenerado = '';
  });

  container.querySelector('#cj-copiar').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      const btn = container.querySelector('#cj-copiar');
      const orig = btn.textContent;
      btn.textContent = 'Copiado ✓';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => prompt('Copie el texto:', texto));
  });

  container.querySelector('#cj-reset-texto').addEventListener('click', () => {
    if (ultimoTextoGenerado) textarea.value = ultimoTextoGenerado;
  });

  container.querySelector('#cj-pdf').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const lineas = esc(texto).replace(/\n/g, '<br>');
    exportarPDF(`Reglamento de Control de Jornada — ${textarea.dataset.empresa || 'empresa'}`, `<div class="info-box" style="font-size:12px;line-height:1.7">${lineas}</div>`);
  });

  container.querySelector('#cj-word').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const parrafos = esc(texto).split('\n').map(l => l.trim() === '' ? '<p>&nbsp;</p>' : `<p>${l}</p>`).join('\n');
    exportarWord(`Reglamento de Control de Jornada — ${textarea.dataset.empresa || 'empresa'}`, parrafos);
  });

  // ── Prefill desde Diagnóstico Integral PYME ─────────────────────────────
  (function detectarPrefill() {
    let payload;
    try { payload = JSON.parse(localStorage.getItem('mvc_prefill_control_jornada') || 'null'); } catch { payload = null; }
    if (!payload) return;
    const banner = document.createElement('div');
    banner.style.cssText = 'background:#e8f4ea;border:1px solid #7ab88a;border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:.9rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px';
    banner.innerHTML = `<span>📋 Hay datos de un Diagnóstico Integral PYME cargados el ${esc(payload.fecha || '')} — ¿cargamos los datos de la empresa?</span>
      <span style="display:flex;gap:8px">
        <button class="btn btn-primary" id="cj-prefill-cargar" type="button">Cargar</button>
        <button class="btn btn-ghost" id="cj-prefill-descartar" type="button">Descartar</button>
      </span>`;
    container.querySelector('#cj-prefill-slot').appendChild(banner);

    banner.querySelector('#cj-prefill-cargar').addEventListener('click', () => {
      if (payload.empresa) container.querySelector('#cj-empresa').value = payload.empresa;
      if (payload.cuit) container.querySelector('#cj-cuit').value = payload.cuit;
      localStorage.removeItem('mvc_prefill_control_jornada');
      banner.remove();
    });
    banner.querySelector('#cj-prefill-descartar').addEventListener('click', () => {
      localStorage.removeItem('mvc_prefill_control_jornada');
      banner.remove();
    });
  })();
}
