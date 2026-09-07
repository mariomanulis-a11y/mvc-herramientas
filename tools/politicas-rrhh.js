// politicas-rrhh.js — Reglamento Interno de Políticas de Recursos Humanos y
// Compliance (Consultoría PYME)
// Instrumento normativo interno único y consolidado que formaliza, mediante
// capítulos independientes y seleccionables, las políticas de selección e
// inducción, licencias y beneficios, evaluación de desempeño, Código de Ética
// y canal de denuncias — puntos de plan de acción típicos del Diagnóstico
// Integral PYME (áreas RRHH y Compliance). Cada capítulo se puede incluir o
// excluir según lo que la empresa ya tenga formalizado.
import { exportarPDF, exportarWord } from './exportar.js';

export function initPoliticasRrhh(container) {

  const ABOGADOS = [
    { value: 'mario',   label: 'Mario Manulis' },
    { value: 'soledad', label: 'Soledad Velazquez' },
    { value: 'camila',  label: 'Camila Poggi' },
    { value: 'otro',    label: 'Otro/a' },
  ];

  const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  const CAPITULOS = [
    { id: 'seleccion',   label: 'Selección e Inducción de Personal' },
    { id: 'licencias',   label: 'Licencias y Beneficios' },
    { id: 'evaluacion',  label: 'Evaluación de Desempeño' },
    { id: 'etica',       label: 'Código de Ética y Conducta' },
    { id: 'denuncias',   label: 'Canal de Denuncias (Whistleblowing)' },
  ];

  const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

  const METODOLOGIAS = [
    { id: 'objetivos',    label: 'Evaluación por objetivos/metas cuantificables (OKR/KPI)',
      texto: 'evaluación por objetivos y metas cuantificables (OKR/KPI)' },
    { id: 'competencias', label: 'Evaluación por competencias (técnicas y blandas)',
      texto: 'evaluación por competencias técnicas y blandas' },
    { id: 'autoeval',     label: 'Autoevaluación previa del trabajador',
      texto: 'una autoevaluación previa por parte del trabajador' },
    { id: 'superior',     label: 'Evaluación a cargo del superior directo',
      texto: 'la evaluación a cargo del superior directo' },
    { id: '360',          label: 'Evaluación 360° (superiores, pares y colaboradores a cargo)',
      texto: 'una evaluación de tipo 360°, con intervención de superiores, pares y, en su caso, colaboradores a cargo' },
    { id: 'devolucion',   label: 'Instancia de devolución individual (feedback estructurado)',
      texto: 'una instancia de devolución individual (feedback estructurado) con el trabajador evaluado' },
    { id: 'planmejora',   label: 'Plan de mejora o desarrollo posterior a la evaluación',
      texto: 'la elaboración de un plan de mejora o desarrollo posterior a la evaluación' },
    { id: 'vinculacion',  label: 'Vinculación con incrementos salariales o promociones (no automática)',
      texto: 'la posibilidad de considerar sus resultados a los fines de incrementos salariales o promociones, sin que ello implique automaticidad alguna' },
  ];

  const ETICA_ITEMS = [
    { id: 'dadivas',              label: 'Prohibición de recibir dádivas, regalos o beneficios de proveedores/clientes',
      texto: 'la prohibición de recibir dádivas, regalos o beneficios de proveedores o clientes' },
    { id: 'conflicto_interes',    label: 'Política de conflictos de interés (deber de declarar vinculaciones)',
      texto: 'el deber de declarar situaciones de conflicto de interés derivadas de vinculaciones personales o económicas' },
    { id: 'confidencialidad',     label: 'Protocolo de confidencialidad de información de clientes y terceros',
      texto: 'un protocolo de confidencialidad respecto de la información de clientes y terceros' },
    { id: 'redes_sociales',       label: 'Uso de redes sociales y comunicaciones institucionales',
      texto: 'pautas de uso de redes sociales y comunicaciones institucionales' },
    { id: 'recursos_tecnologicos',label: 'Uso de recursos tecnológicos, correo corporativo y dispositivos',
      texto: 'pautas de uso de los recursos tecnológicos, el correo corporativo y los dispositivos provistos por la empresa' },
    { id: 'info_privilegiada',    label: 'Prohibición de uso de información privilegiada o reservada',
      texto: 'la prohibición de utilizar información privilegiada o reservada de la empresa en beneficio propio o de terceros' },
    { id: 'regalos_institucionales', label: 'Régimen de regalos institucionales (dar/recibir en nombre de la empresa)',
      texto: 'el régimen aplicable al otorgamiento o recepción de regalos institucionales en nombre de la empresa' },
    { id: 'vinculos_jerarquicos', label: 'Vínculos jerárquicos entre familiares o parejas (conflicto de interés)',
      texto: 'el deber de informar vínculos familiares o de pareja dentro de una misma línea jerárquica, a fin de prevenir conflictos de interés' },
  ];

  // ── HTML ──────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Reglamento de Políticas RRHH</h2>
      <p class="tool-desc">Reglamento interno único y consolidado — Selección, Licencias, Evaluación de Desempeño, Código de Ética y Canal de Denuncias</p>

      <div id="pr2-prefill-slot"></div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:8px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos de la empresa</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group"><label for="pr2-empresa">Razón social</label><input type="text" id="pr2-empresa" placeholder="Empresa S.A."></div>
        <div class="field-group"><label for="pr2-cuit">CUIT</label><input type="text" id="pr2-cuit" placeholder="30-12345678-9"></div>
        <div class="field-group" style="grid-column:1/-1"><label for="pr2-domicilio">Domicilio</label><input type="text" id="pr2-domicilio" placeholder="Calle 123, Pilar, Provincia de Buenos Aires"></div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Capítulos a incluir</div>
      <p style="font-size:.78rem;color:var(--color-muted);margin:0 0 8px">Destildá los capítulos que la empresa ya tenga formalizados por otro medio, o que no correspondan a su realidad operativa.</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px">
        ${CAPITULOS.map(c => `
          <label style="display:flex;align-items:center;gap:8px;font-weight:600;cursor:pointer">
            <input type="checkbox" class="pr2-cap-check" data-cap="${c.id}" checked style="width:auto"> ${c.label}
          </label>`).join('')}
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:20px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Selección e Inducción</div>
      <div class="field-group" id="pr2-wrap-seleccion">
        <label for="pr2-seleccion-responsable">Responsable del proceso de selección (opcional)</label>
        <input type="text" id="pr2-seleccion-responsable" placeholder="Ej: sector de Recursos Humanos">
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:20px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Licencias y Beneficios</div>
      <div class="field-group" id="pr2-wrap-licencias">
        <label for="pr2-beneficios">Beneficios adicionales que otorga la empresa, más allá de los mínimos legales (opcional)</label>
        <textarea id="pr2-beneficios" rows="2" placeholder="Ej: día de cumpleaños libre, medicina prepaga complementaria, flexibilidad horaria los viernes"></textarea>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:20px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Evaluación de Desempeño</div>
      <div id="pr2-wrap-evaluacion">
        <div class="form-row">
          <div class="field-group" style="flex:1">
            <label for="pr2-eval-periodicidad">Periodicidad</label>
            <select id="pr2-eval-periodicidad">
              <option value="anual">Anual</option>
              <option value="semestral">Semestral</option>
              <option value="trimestral">Trimestral</option>
            </select>
          </div>
        </div>
        <div class="field-group">
          <label>Metodología (tildá las que apliquen; opcional)</label>
          <div style="display:flex;flex-direction:column;gap:6px;margin:4px 0 10px">
            ${METODOLOGIAS.map(m => `
              <label style="display:flex;align-items:center;gap:8px;font-weight:400;cursor:pointer;font-size:.88rem">
                <input type="checkbox" class="pr2-metodo-check" data-item="${m.id}" style="width:auto"> ${esc(m.label)}
              </label>`).join('')}
          </div>
          <label for="pr2-eval-metodologia-otros">Otros aspectos de la metodología (opcional)</label>
          <textarea id="pr2-eval-metodologia-otros" rows="2" placeholder="Ej: ponderación específica por área, comité de calibración de resultados, etc."></textarea>
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:20px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Código de Ética y Conducta</div>
      <div class="field-group" id="pr2-wrap-etica">
        <label>Disposiciones adicionales, más allá de los principios y prohibiciones ya incluidos en el texto base (tildá las que apliquen; opcional)</label>
        <div style="display:flex;flex-direction:column;gap:6px;margin:4px 0 10px">
          ${ETICA_ITEMS.map(e => `
            <label style="display:flex;align-items:center;gap:8px;font-weight:400;cursor:pointer;font-size:.88rem">
              <input type="checkbox" class="pr2-etica-check" data-item="${e.id}" style="width:auto"> ${esc(e.label)}
            </label>`).join('')}
        </div>
        <label for="pr2-etica-otros">Otras disposiciones específicas de la actividad (opcional)</label>
        <textarea id="pr2-etica-otros" rows="2" placeholder="Ej: protocolo propio del sector, restricciones normativas específicas de la actividad"></textarea>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:20px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Canal de Denuncias</div>
      <div class="form-row" id="pr2-wrap-denuncias">
        <div class="field-group" style="flex:1">
          <label for="pr2-denuncias-modalidad">Vía de acceso</label>
          <select id="pr2-denuncias-modalidad">
            <option value="email">Casilla de correo electrónico dedicada</option>
            <option value="formulario">Formulario web</option>
            <option value="buzon">Buzón físico</option>
            <option value="mixto">Mixta (más de un medio)</option>
          </select>
        </div>
        <div class="field-group" style="flex:1">
          <label for="pr2-denuncias-contacto">Dato de contacto / vía concreta</label>
          <input type="text" id="pr2-denuncias-contacto" placeholder="Ej: denuncias@empresa.com">
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:20px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del acto</div>
      <div class="form-row">
        <div class="field-group" style="flex:1"><label for="pr2-ciudad">Ciudad</label><input type="text" id="pr2-ciudad" placeholder="Pilar"></div>
        <div class="field-group" style="flex:1"><label for="pr2-fecha">Fecha</label><input type="date" id="pr2-fecha"></div>
        <div class="field-group" style="flex:1"><label for="pr2-fecha-vigencia">Vigencia a partir del</label><input type="date" id="pr2-fecha-vigencia"></div>
        <div class="field-group" style="flex:1"><label for="pr2-abogado">Elaborado por</label>
          <select id="pr2-abogado">${ABOGADOS.map(a => `<option value="${a.value}">${a.label}</option>`).join('')}</select>
        </div>
      </div>

      <div class="field-group">
        <label for="pr2-observaciones">Observaciones adicionales (opcional)</label>
        <textarea id="pr2-observaciones" rows="2"></textarea>
      </div>

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:8px">
        <button class="btn btn-primary" id="pr2-generar">Generar reglamento</button>
        <button class="btn btn-ghost"   id="pr2-limpiar">Limpiar</button>
      </div>

      <div id="pr2-resultado" style="display:none;margin-top:24px">
        <label for="pr2-texto" style="font-weight:600;display:block;margin-bottom:6px">Texto generado (editable)</label>
        <textarea id="pr2-texto" rows="30" style="width:100%;resize:vertical;font-family:inherit;font-size:.9rem;padding:12px;border:1px solid var(--color-border);border-radius:6px;background:#ffffff;color:#1a1a1a;line-height:1.6"></textarea>
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px">
          <button class="btn btn-success" id="pr2-copiar">📋 Copiar texto</button>
          <button class="btn btn-ghost"   id="pr2-pdf">📄 Exportar PDF</button>
          <button class="btn btn-ghost"   id="pr2-word">📝 Exportar Word</button>
          <button class="btn btn-ghost"   id="pr2-reset-texto">Restablecer</button>
        </div>
        <div id="pr2-eval-bridge" style="display:none;margin-top:14px;padding-top:14px;border-top:1px solid var(--color-border)">
          <p style="font-size:.85rem;color:var(--color-muted);margin:0 0 8px">Se detectaron metodologías de evaluación de desempeño tildadas en este reglamento. Podés generar la ficha operativa correspondiente.</p>
          <button class="btn btn-ghost" id="pr2-enviar-formularios" type="button">📈 Enviar a Formularios de Evaluación de Desempeño</button>
          <div id="pr2-formularios-confirmacion" style="margin-top:8px"></div>
        </div>
      </div>

      <p style="margin-top:24px;font-size:.78rem;color:var(--color-muted);border-top:1px solid var(--color-border);padding-top:12px">
        Modelo orientativo, a adaptar al caso concreto y al Convenio Colectivo de Trabajo aplicable. No constituye asesoramiento legal definitivo.
      </p>
    </div>`;

  // ── Referencias ───────────────────────────────────────────────────────────
  const divRes = container.querySelector('#pr2-resultado');
  const textarea = container.querySelector('#pr2-texto');
  const capChecks = Object.fromEntries(CAPITULOS.map(c => [c.id, container.querySelector(`.pr2-cap-check[data-cap="${c.id}"]`)]));
  const wraps = {
    seleccion: container.querySelector('#pr2-wrap-seleccion'),
    licencias: container.querySelector('#pr2-wrap-licencias'),
    evaluacion: container.querySelector('#pr2-wrap-evaluacion'),
    etica: container.querySelector('#pr2-wrap-etica'),
    denuncias: container.querySelector('#pr2-wrap-denuncias'),
  };

  let ultimoTextoGenerado = '';

  function val(id) { const el = container.querySelector(`#${id}`); return el ? el.value.trim() : ''; }
  function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function listaProsa(items) {
    if (!items.length) return '';
    if (items.length === 1) return items[0];
    return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
  }

  CAPITULOS.forEach(c => {
    capChecks[c.id].addEventListener('change', () => {
      wraps[c.id].style.opacity = capChecks[c.id].checked ? '1' : '.4';
      wraps[c.id].querySelectorAll('input, select, textarea').forEach(el => { el.disabled = !capChecks[c.id].checked; });
    });
  });

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

  const MODALIDAD_LABEL = {
    email: 'una casilla de correo electrónico dedicada',
    formulario: 'un formulario web',
    buzon: 'un buzón físico',
    mixto: 'más de un medio (mixta)',
  };

  container.querySelector('#pr2-generar').addEventListener('click', () => {
    const empresa = val('pr2-empresa') || '[RAZÓN SOCIAL]';
    const cuit = val('pr2-cuit') || '[CUIT]';
    const domicilio = val('pr2-domicilio') || '[DOMICILIO]';
    const ciudad = val('pr2-ciudad') || '[CIUDAD]';
    const fecha = fmtFechaLarga(val('pr2-fecha'));
    const fechaVigenciaLarga = fmtFechaLarga(val('pr2-fecha-vigencia'));
    const abogadoLabel = container.querySelector('#pr2-abogado').selectedOptions[0].textContent;
    const observaciones = val('pr2-observaciones');

    const incluidos = CAPITULOS.filter(c => capChecks[c.id].checked);
    if (!incluidos.length) {
      alert('Tildá al menos un capítulo para generar el reglamento.');
      return;
    }

    const cuerpos = {
      seleccion: () => {
        const responsable = val('pr2-seleccion-responsable') || 'el sector de Recursos Humanos (o quien la Dirección designe)';
        return `La empresa formaliza su proceso de selección e inducción de personal conforme a los siguientes lineamientos:
1. Principios generales: el proceso de selección se rige por los principios de igualdad de oportunidades y no discriminación (Ley 23.592), y de confidencialidad en el tratamiento de los datos personales de los postulantes (Ley 25.326).
2. Etapas del proceso: publicación de la búsqueda, recepción y evaluación de postulaciones, entrevistas, verificación de antecedentes y referencias cuando corresponda, y decisión de contratación, a cargo de ${responsable}.
3. Inducción: todo nuevo ingreso recibirá, dentro de sus primeros días de trabajo, la documentación institucional pertinente, capacitación inicial sobre sus tareas, y copia del presente Reglamento y del Código de Ética y Conducta de la empresa, dejando constancia de su recepción.`;
      },
      licencias: () => {
        const beneficios = val('pr2-beneficios');
        return `El régimen de licencias y beneficios se rige, como mínimo, por lo establecido en la Ley de Contrato de Trabajo y en el Convenio Colectivo de Trabajo aplicable, en particular en materia de licencia por maternidad y paternidad (arts. 177 y 158 LCT), vacaciones (art. 150 LCT), licencia por enfermedad inculpable (art. 208 LCT), y demás licencias especiales (examen, matrimonio, fallecimiento de familiar, etc.).
Toda solicitud de licencia deberá formalizarse con la mayor anticipación posible ante el sector de Recursos Humanos, acompañando la documentación respaldatoria que corresponda (certificado médico, partida, turno, etc.).${beneficios ? `\nBeneficios adicionales otorgados por la empresa, por encima de los mínimos legales: ${beneficios}.` : ''}`;
      },
      evaluacion: () => {
        const periodicidad = container.querySelector('#pr2-eval-periodicidad').selectedOptions[0].textContent.toLowerCase();
        const metodosSel = METODOLOGIAS.filter(m => container.querySelector(`.pr2-metodo-check[data-item="${m.id}"]`).checked).map(m => m.texto);
        const otrosMetodo = val('pr2-eval-metodologia-otros');
        const metodologia = listaProsa(metodosSel) || 'evaluación de objetivos y competencias, con instancia de devolución individual a cargo del superior directo';
        return `La empresa implementa un proceso de evaluación de desempeño de periodicidad ${periodicidad}, con la siguiente metodología: ${metodologia}.${otrosMetodo ? `\nAsimismo, se aplican los siguientes aspectos particulares: ${otrosMetodo}.` : ''}
Los resultados de cada evaluación serán comunicados personalmente al trabajador evaluado, quien tendrá derecho a formular sus comentarios o descargo. Los resultados podrán ser considerados a los fines de capacitación, promoción o ajustes en las condiciones de trabajo, sin que ello implique por sí solo modificación alguna del contrato de trabajo sin el consentimiento del trabajador cuando la ley así lo exija.`;
      },
      etica: () => {
        const eticaSel = ETICA_ITEMS.filter(e => container.querySelector(`.pr2-etica-check[data-item="${e.id}"]`).checked).map(e => e.texto);
        const otrosEtica = val('pr2-etica-otros');
        const adicionalProsa = listaProsa(eticaSel);
        return `Todo el personal de la empresa, cualquiera sea su jerarquía, debe ajustar su conducta a los siguientes principios: legalidad, integridad, transparencia, respeto y trato digno hacia compañeros, clientes y proveedores, prevención de conflictos de interés, y confidencialidad de la información de la empresa y de terceros.
Se encuentran expresamente prohibidas las siguientes conductas: el ofrecimiento, solicitud o aceptación de sobornos, dádivas o comisiones indebidas; el fraude o la falsificación de documentación o registros; el acoso laboral y el acoso sexual o cualquier forma de violencia en el ámbito laboral (en línea con la Ley 26.485 y el Convenio N° 190 de la OIT, ratificado por Ley 27.580); y el uso indebido de los bienes, información o recursos de la empresa en beneficio propio o de terceros.${adicionalProsa ? `\nAsimismo, y en atención a la actividad específica de la empresa, resultan de aplicación las siguientes disposiciones: ${adicionalProsa}.` : ''}${otrosEtica ? `\nSe deja además constancia de lo siguiente: ${otrosEtica}.` : ''}
Todo incumplimiento a este Código deberá denunciarse por el canal de denuncias previsto en el presente Reglamento, y podrá dar lugar a las sanciones disciplinarias que correspondan conforme la Ley de Contrato de Trabajo.`;
      },
      denuncias: () => {
        const modalidad = container.querySelector('#pr2-denuncias-modalidad').value;
        const contacto = val('pr2-denuncias-contacto');
        return `La empresa pone a disposición de todo su personal un canal de denuncias confidencial para reportar incumplimientos al Código de Ética y Conducta o a la normativa aplicable, implementado a través de ${MODALIDAD_LABEL[modalidad]}${contacto ? ` (${contacto})` : ''}.
Toda denuncia se tramitará bajo estricta confidencialidad, garantizándose la protección del denunciante de buena fe frente a cualquier represalia. Recibida la denuncia, se dará inicio a una investigación interna en un plazo razonable, cuyo resultado será comunicado a las partes involucradas en la medida en que la confidencialidad del proceso lo permita, adoptándose las medidas correctivas o disciplinarias que correspondan.`;
      },
    };

    const capitulosTexto = incluidos.map((c, i) => {
      return `CAPÍTULO ${ROMANOS[i] || (i + 1)} — ${c.label.toUpperCase()}\n${cuerpos[c.id]()}`;
    }).join('\n\n');

    const texto =
`REGLAMENTO INTERNO DE POLÍTICAS DE RECURSOS HUMANOS Y COMPLIANCE
${empresa} — CUIT ${cuit}

En la ciudad de ${ciudad}, a los ${fecha}, ${empresa} (CUIT ${cuit}), con domicilio en ${domicilio}, dicta el presente reglamento interno con el objeto de formalizar las políticas de gestión de su personal que a continuación se detallan, aplicable a todo el personal dependiente de la empresa, cualquiera sea su categoría o antigüedad.

${capitulosTexto}

CAPÍTULO FINAL — VIGENCIA Y COMUNICACIÓN
El presente reglamento entra en vigencia a partir del ${fechaVigenciaLarga} y será comunicado a todo el personal comprendido, dejándose constancia de su recepción mediante el acuse que se agrega a continuación. Toda modificación futura deberá comunicarse por el mismo medio.
${observaciones ? `\nOBSERVACIONES\n${observaciones}\n` : ''}
──────────────────────────────────────────────
ACUSE DE RECIBO

El/la trabajador/a abajo firmante deja constancia de haber recibido copia del presente Reglamento Interno de Políticas de Recursos Humanos y Compliance, encontrándose en conocimiento de su contenido y obligado/a a su cumplimiento.

Apellido y Nombre: ____________________________
DNI: ____________________________
Firma: ____________________________          Fecha: ____ / ____ / ______

Elaborado por: ${abogadoLabel} — MVC Abogados
Fecha de emisión: ${fmtFechaCorta(val('pr2-fecha'))}`;

    ultimoTextoGenerado = texto;
    textarea.value = texto;
    divRes.style.display = 'block';
    textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    textarea.dataset.empresa = empresa;
    textarea.dataset.cuit = cuit;

    // Puente hacia Formularios de Evaluación de Desempeño: solo si el
    // capítulo de Evaluación está incluido y hay al menos una metodología
    // (objetivos, competencias, autoeval o 360) tildada.
    const bridge = container.querySelector('#pr2-eval-bridge');
    const metodosParaFormulario = ['objetivos', 'competencias', 'autoeval', '360'];
    const metodosDetectados = capChecks.evaluacion.checked
      ? metodosParaFormulario.filter(id => container.querySelector(`.pr2-metodo-check[data-item="${id}"]`).checked)
      : [];
    container.querySelector('#pr2-formularios-confirmacion').innerHTML = '';
    bridge.style.display = metodosDetectados.length ? 'block' : 'none';
    bridge.dataset.metodos = JSON.stringify(metodosDetectados);
  });

  container.querySelector('#pr2-enviar-formularios').addEventListener('click', () => {
    const bridge = container.querySelector('#pr2-eval-bridge');
    let metodos = [];
    try { metodos = JSON.parse(bridge.dataset.metodos || '[]'); } catch { metodos = []; }
    const payload = { fecha: fmtFechaCorta(val('pr2-fecha')) || new Date().toLocaleDateString('es-AR'), empresa: textarea.dataset.empresa, cuit: textarea.dataset.cuit, tipos: metodos };
    localStorage.setItem('mvc_prefill_formularios_evaluacion', JSON.stringify(payload));
    container.querySelector('#pr2-formularios-confirmacion').innerHTML = `
      <div class="display-box" style="padding:10px 14px">
        ✅ Datos enviados a Formularios de Evaluación de Desempeño.
        <button class="btn btn-ghost" id="pr2-ir-formularios" type="button" style="margin-left:8px">Ir ahora</button>
      </div>`;
    container.querySelector('#pr2-ir-formularios').addEventListener('click', () => { location.hash = 'formularios-evaluacion'; });
  });

  container.querySelector('#pr2-limpiar').addEventListener('click', () => {
    container.querySelectorAll('input[type="text"], input[type="date"], textarea').forEach(el => { el.value = ''; });
    container.querySelector('#pr2-eval-periodicidad').value = 'anual';
    container.querySelector('#pr2-denuncias-modalidad').value = 'email';
    container.querySelectorAll('.pr2-metodo-check, .pr2-etica-check').forEach(el => { el.checked = false; });
    CAPITULOS.forEach(c => {
      capChecks[c.id].checked = true;
      wraps[c.id].style.opacity = '1';
      wraps[c.id].querySelectorAll('input, select, textarea').forEach(el => { el.disabled = false; });
    });
    container.querySelector('#pr2-abogado').selectedIndex = 0;
    divRes.style.display = 'none';
    textarea.value = '';
    ultimoTextoGenerado = '';
    container.querySelector('#pr2-eval-bridge').style.display = 'none';
    container.querySelector('#pr2-formularios-confirmacion').innerHTML = '';
  });

  container.querySelector('#pr2-copiar').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      const btn = container.querySelector('#pr2-copiar');
      const orig = btn.textContent;
      btn.textContent = 'Copiado ✓';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => prompt('Copie el texto:', texto));
  });

  container.querySelector('#pr2-reset-texto').addEventListener('click', () => {
    if (ultimoTextoGenerado) textarea.value = ultimoTextoGenerado;
  });

  container.querySelector('#pr2-pdf').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const lineas = esc(texto).replace(/\n/g, '<br>');
    exportarPDF(`Reglamento de Políticas RRHH — ${textarea.dataset.empresa || 'empresa'}`, `<div class="info-box" style="font-size:12px;line-height:1.7">${lineas}</div>`);
  });

  container.querySelector('#pr2-word').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const parrafos = esc(texto).split('\n').map(l => l.trim() === '' ? '<p>&nbsp;</p>' : `<p>${l}</p>`).join('\n');
    exportarWord(`Reglamento de Políticas RRHH — ${textarea.dataset.empresa || 'empresa'}`, parrafos);
  });

  // ── Prefill desde Diagnóstico Integral PYME ─────────────────────────────
  (function detectarPrefill() {
    let payload;
    try { payload = JSON.parse(localStorage.getItem('mvc_prefill_politicas_rrhh') || 'null'); } catch { payload = null; }
    if (!payload) return;
    const banner = document.createElement('div');
    banner.style.cssText = 'background:#e8f4ea;border:1px solid #7ab88a;border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:.9rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px';
    banner.innerHTML = `<span>📋 Hay datos de un Diagnóstico Integral PYME cargados el ${esc(payload.fecha || '')} — ¿cargamos los datos de la empresa?</span>
      <span style="display:flex;gap:8px">
        <button class="btn btn-primary" id="pr2-prefill-cargar" type="button">Cargar</button>
        <button class="btn btn-ghost" id="pr2-prefill-descartar" type="button">Descartar</button>
      </span>`;
    container.querySelector('#pr2-prefill-slot').appendChild(banner);

    banner.querySelector('#pr2-prefill-cargar').addEventListener('click', () => {
      if (payload.empresa) container.querySelector('#pr2-empresa').value = payload.empresa;
      if (payload.cuit) container.querySelector('#pr2-cuit').value = payload.cuit;
      localStorage.removeItem('mvc_prefill_politicas_rrhh');
      banner.remove();
    });
    banner.querySelector('#pr2-prefill-descartar').addEventListener('click', () => {
      localStorage.removeItem('mvc_prefill_politicas_rrhh');
      banner.remove();
    });
  })();
}
