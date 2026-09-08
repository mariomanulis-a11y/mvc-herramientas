// Generador de Escrito de Sucesión — Ab Intestato y Testamentaria (Provincia de Buenos Aires)
// No hay contraparte demandada: se promueve el juicio sucesorio a instancia de los
// herederos denunciados, solicitando la apertura del proceso y, oportunamente, la
// declaratoria de herederos (ab intestato) o la protocolización del testamento y la
// declaratoria (testamentaria). Competencia: juez del último domicilio del causante
// (art. 2336, CCCN). El CCCN solo admite dos formas testamentarias ordinarias —
// ológrafo y por acto público (art. 2462, CCCN)—; no se contempla el testamento
// cerrado, derogado por el Código Civil y Comercial.
import { exportarPDF, exportarWord } from './exportar.js';

export function initEscritoSucesion(container) {

  const EMAIL_ESTUDIO = 'mvcabogadospilar@gmail.com';
  const ABOGADOS = [
    { id: 'manulis',    nombre: 'Mario Martín Manulis',       genero: 'M', domicilioElectronico: '20271887931@notificaciones.scba.gov.ar', celular: '1153107794', matricula: 'T° 34 F° 69 CASI' },
    { id: 'velazquez',  nombre: 'Soledad Celeste Velazquez',  genero: 'F', domicilioElectronico: '27273872286@notificaciones.scba.gov.ar', celular: '1155781501', matricula: 'T° 36 F° 125 CASI' },
    { id: 'curbelo',    nombre: 'Yanina Daniela Curbelo',     genero: 'F', domicilioElectronico: '27268952867@notificaciones.scba.gov.ar', celular: '1149272774', matricula: 'T° 36 F° 90 CASI' },
    { id: 'poggi',      nombre: 'Camila Susana Poggi',        genero: 'F', domicilioElectronico: '27388231705@notificaciones.scba.gov.ar', celular: '1138224662', matricula: 'T° 55 F° 255 CASI' },
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

  // ── Materia y tipos ──────────────────────────────────────────────────────
  const MATERIAS = {
    sucesiones: {
      label: 'Sucesiones',
      tipos: {
        ab_intestato: {
          label: 'Ab Intestato',
          requiere: ['causante_nombre', 'fecha_fallecimiento', 'ultimo_domicilio'],
          opcionales: ['causante_dni', 'lugar_fallecimiento', 'bienes_registrables'],
          hechos: d => `Que con fecha ${d.fecha_fallecimiento} falleció ${d.causante_nombre}${d.causante_dni ? `, DNI ${d.causante_dni}` : ''}${d.lugar_fallecimiento ? `, en ${d.lugar_fallecimiento}` : ''}, sin que hasta la fecha se tenga conocimiento de la existencia de testamento, habiendo tenido su último domicilio en ${d.ultimo_domicilio}. Que las personas denunciadas en el punto siguiente revisten el carácter de herederos del causante conforme el orden sucesorio establecido por la ley.`,
          derecho: () => `Fundo el presente en los arts. 2277 (apertura de la sucesión), 2335 y 2336 (objeto y competencia del proceso sucesorio — corresponde al juez del último domicilio del causante) y 2424 y siguientes del Código Civil y Comercial de la Nación (órdenes hereditarios en la sucesión intestada), así como en los arts. 2337 y 2338 del mismo cuerpo legal en cuanto a la investidura de la calidad de heredero. En el plano procesal, resultan de aplicación los arts. 724 (requisitos de la iniciación), 725 (medidas preliminares y de seguridad), 734 (providencia de apertura y citación a los interesados) y 735 (declaratoria de herederos) del Código Procesal Civil y Comercial de la Provincia de Buenos Aires.`,
        },
        testamentaria: {
          label: 'Testamentaria',
          requiere: ['causante_nombre', 'fecha_fallecimiento', 'ultimo_domicilio', 'fecha_testamento'],
          opcionales: ['causante_dni', 'lugar_fallecimiento', 'bienes_registrables', 'escribano', 'registro_notarial', 'testigo1_testamento', 'testigo2_testamento'],
          hechos: d => {
            const formaTexto = d.formaTestamento === 'acto_publico' ? 'por acto público' : 'ológrafo';
            const escribanoTexto = d.formaTestamento === 'acto_publico'
              ? `, por ante el/la Escribano/a ${d.escribano || '[ESCRIBANO/A]'}${d.registro_notarial ? `, Registro Notarial N° ${d.registro_notarial}` : ''}`
              : '';
            return `Que con fecha ${d.fecha_fallecimiento} falleció ${d.causante_nombre}${d.causante_dni ? `, DNI ${d.causante_dni}` : ''}${d.lugar_fallecimiento ? `, en ${d.lugar_fallecimiento}` : ''}, habiendo tenido su último domicilio en ${d.ultimo_domicilio}. Que el/la causante otorgó testamento ${formaTexto} con fecha ${d.fecha_testamento}${escribanoTexto}, instituyendo como herederos a las personas que se denuncian en el punto siguiente.`;
          },
          derecho: d => {
            const comunes = `Fundo el presente en los arts. 2277 (apertura de la sucesión), 2335 y 2336 (objeto y competencia — juez del último domicilio del causante) y 2462 del Código Civil y Comercial de la Nación, que solo admite como formas testamentarias ordinarias el testamento ológrafo y el otorgado por acto público, así como en los arts. 2337 y 2338 del mismo cuerpo legal en cuanto a la investidura de la calidad de heredero.`;
            if (d.formaTestamento === 'acto_publico') {
              return `${comunes} El testamento fue otorgado por acto público conforme el art. 2479, CCCN, resultando aplicable el art. 724 del Código Procesal Civil y Comercial de la Provincia de Buenos Aires en cuanto impone dar intervención al Registro de Actos de Última Voluntad y requerir al escribano interviniente la remisión del testimonio del acto. Resultan asimismo de aplicación los arts. 725 (medidas preliminares y de seguridad) y 735 (declaratoria de herederos) del citado Código Procesal.`;
            }
            return `${comunes} El testamento ológrafo debe reunir los requisitos de los arts. 2477 y 2478, CCCN (integramente escrito, fechado y firmado de puño y letra del testador). En el plano procesal, resultan de aplicación los arts. 724 (requisitos de la iniciación, con intervención del Registro de Actos de Última Voluntad), 725 (medidas preliminares y de seguridad), 739 (reconocimiento de firma y letra del testador por dos testigos), 740 (protocolización) y 735 (declaratoria de herederos) del Código Procesal Civil y Comercial de la Provincia de Buenos Aires.`;
          },
        },
      },
    },
  };

  // ── Campos (pool compartido) ─────────────────────────────────────────────
  const CAMPOS_CONFIG = [
    { id: 'causante_nombre',    label: 'Nombre completo del/de la causante', placeholder: 'Juan García',              tipo: 'text',     grupo: 'causante' },
    { id: 'causante_dni',       label: 'DNI del/de la causante (opcional)',  placeholder: '12.345.678',               tipo: 'text',     grupo: 'causante' },
    { id: 'fecha_fallecimiento', label: 'Fecha de fallecimiento',           placeholder: '',                         tipo: 'date',     grupo: 'causante' },
    { id: 'lugar_fallecimiento', label: 'Lugar de fallecimiento (opcional)', placeholder: 'La Plata, Provincia de Buenos Aires', tipo: 'text', grupo: 'causante' },
    { id: 'ultimo_domicilio',   label: 'Último domicilio del/de la causante', placeholder: 'Calle 45 N° 850, La Plata', tipo: 'text',   grupo: 'causante' },
    { id: 'bienes_registrables', label: 'Bienes registrables denunciados (opcional)', placeholder: 'Inmuebles, automotores, otros', tipo: 'textarea', grupo: 'causante' },

    { id: 'fecha_testamento',   label: 'Fecha de otorgamiento del testamento', placeholder: '',                      tipo: 'date',     grupo: 'testamento' },
    { id: 'escribano',          label: 'Escribano/a interviniente',         placeholder: 'Dr./Dra. ...',             tipo: 'text',     grupo: 'testamento' },
    { id: 'registro_notarial',  label: 'N° de Registro Notarial (opcional)', placeholder: '15',                      tipo: 'text',     grupo: 'testamento' },
    { id: 'testigo1_testamento', label: 'Testigo 1 (reconocimiento de firma y letra — art. 739, CPCC)', placeholder: 'Nombre y apellido, DNI', tipo: 'text', grupo: 'testamento' },
    { id: 'testigo2_testamento', label: 'Testigo 2 (reconocimiento de firma y letra — art. 739, CPCC)', placeholder: 'Nombre y apellido, DNI', tipo: 'text', grupo: 'testamento' },
  ];
  const CAMPOS_BY_ID = Object.fromEntries(CAMPOS_CONFIG.map(c => [c.id, c]));

  let materiaActual = Object.keys(MATERIAS)[0];

  // ── HTML ───────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Generador de Escrito de Sucesión</h2>
      <p class="tool-desc">Ab Intestato y Testamentaria — promoción del juicio sucesorio (Provincia de Buenos Aires)</p>

      <div style="display:block;background:#fff3cd;border:1px solid #d9a441;border-radius:6px;padding:10px 14px;margin-bottom:16px;font-size:.82rem;line-height:1.6;color:#5a4408">
        ⚠️ Herramienta en versión inicial, pendiente de revisión final por el Estudio antes de su uso en un caso real. No incluye beneficio de litigar sin gastos ni sucesión extrajudicial (art. 733, CPCC) — evaluar caso por caso si corresponden. Verificar siempre la competencia territorial (último domicilio del causante, art. 2336, CCCN) antes de presentar.
      </div>

      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="suc-materia">Materia</label>
          <select id="suc-materia">
            ${Object.entries(MATERIAS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
          </select>
        </div>
        <div class="field-group" style="flex:2">
          <label for="suc-tipo">Tipo de sucesión</label>
          <select id="suc-tipo"></select>
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Profesional actuante y trámite</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group">
          <label for="suc-abogado-select">Abogado/a actuante</label>
          <select id="suc-abogado-select">${ABOGADOS.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('')}</select>
        </div>
        <div class="field-group">
          <label for="suc-caracter-letrado">Carácter</label>
          <select id="suc-caracter-letrado">${CARACTER_LETRADO.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}</select>
        </div>
        <div class="field-group"><label for="suc-matricula">Matrícula (Tomo/Folio y Colegio)</label><input type="text" id="suc-matricula"></div>
      </div>
      <p id="suc-abogado-info" style="font-size:.78rem;color:var(--color-muted);margin:-6px 0 10px"></p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group"><label for="suc-juzgado">Juzgado / jurisdicción competente</label><input type="text" id="suc-juzgado" placeholder="Juzgado de Paz Letrado / Civil y Comercial N° _ del Departamento Judicial de..."></div>
        <div class="field-group"><label for="suc-domicilio_procesal">Domicilio procesal a constituir (art. 40 CPCC)</label><input type="text" id="suc-domicilio_procesal"></div>
        <div class="field-group"><label for="suc-email_notificaciones">Domicilio electrónico (notificaciones SCBA)</label><input type="text" id="suc-email_notificaciones"></div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del/de la causante</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px" id="suc-grupo-causante"></div>

      <div id="suc-bloque-testamento" style="display:none">
        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del testamento</div>
        <div class="form-row">
          <div class="field-group" style="flex:1">
            <label for="suc-forma_testamento">Forma del testamento (art. 2462, CCCN)</label>
            <select id="suc-forma_testamento">
              <option value="ologrofo">Ológrafo</option>
              <option value="acto_publico">Por acto público</option>
            </select>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px" id="suc-grupo-testamento"></div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Herederos denunciados</div>
      <div id="suc-herederos-wrapper" style="display:flex;flex-direction:column;gap:6px"></div>
      <div class="form-row" style="justify-content:flex-start;margin-top:6px">
        <button class="btn btn-ghost" id="suc-add-heredero" type="button">+ Agregar heredero/a (máx. 15)</button>
      </div>
      <div class="check-row" style="margin-top:10px">
        <input type="checkbox" id="suc-conflicto_herederos">
        <label for="suc-conflicto_herederos">¿Existe conflicto entre los herederos?</label>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Administrador/a provisional (opcional)</div>
      <div class="check-row">
        <input type="checkbox" id="suc-administrador_check">
        <label for="suc-administrador_check">Solicitar designación de administrador/a provisional (art. 727, CPCC)</label>
      </div>
      <div class="field-group" id="suc-wrap-administrador" style="display:none;margin-top:6px">
        <label for="suc-administrador_nombre">Nombre y vínculo del/de la propuesto/a</label>
        <input type="text" id="suc-administrador_nombre" placeholder="Ej: Juan García, hijo del causante">
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Prueba documental</div>
      <div style="border:1px solid var(--color-border);border-radius:6px;padding:12px">
        <p style="margin:0 0 8px;font-size:.85rem;color:var(--color-muted)">Se ofrece siempre la prueba documental estándar del proceso sucesorio (partida de defunción, partidas que acreditan el vínculo de los herederos, DNI de los denunciados y, si corresponde, el testamento y el título de los bienes registrables). Completar los detalles que correspondan:</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
          <div class="field-group"><label for="suc-partida_defuncion">N° de partida de defunción (opcional)</label><input type="text" id="suc-partida_defuncion"></div>
          <div class="field-group" style="grid-column:1/-1"><label for="suc-partidas_vinculo">Detalle de partidas que acreditan el vínculo de los herederos (opcional)</label><textarea id="suc-partidas_vinculo" rows="2" placeholder="Partidas de nacimiento/matrimonio de cada heredero denunciado"></textarea></div>
          <div class="field-group" style="grid-column:1/-1"><label for="suc-prueba_otros">Otra prueba documental (opcional)</label><textarea id="suc-prueba_otros" rows="2"></textarea></div>
        </div>
      </div>

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:16px">
        <button class="btn btn-primary" id="suc-generar">Generar escrito</button>
        <button class="btn btn-ghost"   id="suc-limpiar">Limpiar</button>
      </div>

      <div id="suc-resultado" style="display:none;margin-top:24px">
        <label for="suc-texto" style="font-weight:600;display:block;margin-bottom:6px">Texto generado (editable)</label>
        <textarea id="suc-texto" rows="26" style="width:100%;resize:vertical;font-family:inherit;font-size:.88rem;padding:12px;border:1px solid var(--color-border);border-radius:6px;background:#ffffff;color:#1a1a1a;line-height:1.6"></textarea>
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px">
          <button class="btn btn-success" id="suc-copiar">📋 Copiar texto</button>
          <button class="btn btn-ghost"   id="suc-word">📝 Exportar Word (.doc editable)</button>
          <button class="btn btn-ghost"   id="suc-pdf">📄 Exportar PDF</button>
          <button class="btn btn-ghost"   id="suc-reset-texto">Restablecer</button>
          <button class="btn btn-ghost"   id="suc-enviar">➡️ Enviar a Generador de Presupuestos</button>
        </div>
        <div id="suc-enviar-confirmacion" style="display:none;margin-top:10px"></div>
      </div>

      <p style="margin-top:24px;font-size:.78rem;color:var(--color-muted);border-top:1px solid var(--color-border);padding-top:12px">
        Anteproyecto de escrito. Adaptar al caso concreto. No constituye asesoramiento legal.
      </p>
    </div>`;

  function renderCamposGrupo(grupo, ids) {
    return CAMPOS_CONFIG.filter(c => c.grupo === grupo && ids.includes(c.id)).map(c => `
      <div class="field-group" id="suc-wrap-${c.id}" style="${c.tipo === 'textarea' ? 'grid-column:1/-1' : ''}">
        <label for="suc-${c.id}">${c.label}</label>
        ${c.tipo === 'textarea'
          ? `<textarea id="suc-${c.id}" placeholder="${c.placeholder}" rows="2"></textarea>`
          : `<input type="${c.tipo}" id="suc-${c.id}" placeholder="${c.placeholder}">`
        }
      </div>`).join('');
  }

  // ── Referencias ──────────────────────────────────────────────────────────
  const selMateria  = container.querySelector('#suc-materia');
  const selTipo     = container.querySelector('#suc-tipo');
  const selAbogado  = container.querySelector('#suc-abogado-select');
  const abogadoInfo = container.querySelector('#suc-abogado-info');
  const inputEmailNotif = container.querySelector('#suc-email_notificaciones');
  const selFormaTestamento = container.querySelector('#suc-forma_testamento');
  const bloqueTestamento = container.querySelector('#suc-bloque-testamento');
  const chkAdministrador = container.querySelector('#suc-administrador_check');
  const wrapAdministrador = container.querySelector('#suc-wrap-administrador');
  const divRes      = container.querySelector('#suc-resultado');
  const textarea    = container.querySelector('#suc-texto');
  const divEnviarConf = container.querySelector('#suc-enviar-confirmacion');
  let ultimoTextoGenerado = '';

  function actualizarAbogado() {
    const a = ABOGADOS_BY_ID[selAbogado.value];
    if (!a) return;
    inputEmailNotif.value = a.domicilioElectronico;
    container.querySelector('#suc-matricula').value = a.matricula;
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
    container.querySelector('#suc-grupo-causante').innerHTML = renderCamposGrupo('causante', ids);
    container.querySelector('#suc-grupo-testamento').innerHTML = renderCamposGrupo('testamento', ids);
  }

  function actualizarBloqueTestamento() {
    const esTestamentaria = selTipo.value === 'testamentaria';
    bloqueTestamento.style.display = esTestamentaria ? 'block' : 'none';
    if (!esTestamentaria) return;
    const esOlografo = selFormaTestamento.value === 'ologrofo';
    const wrapEscribano = container.querySelector('#suc-wrap-escribano');
    const wrapRegistro = container.querySelector('#suc-wrap-registro_notarial');
    const wrapTest1 = container.querySelector('#suc-wrap-testigo1_testamento');
    const wrapTest2 = container.querySelector('#suc-wrap-testigo2_testamento');
    if (wrapEscribano) wrapEscribano.style.display = esOlografo ? 'none' : '';
    if (wrapRegistro) wrapRegistro.style.display = esOlografo ? 'none' : '';
    if (wrapTest1) wrapTest1.style.display = esOlografo ? '' : 'none';
    if (wrapTest2) wrapTest2.style.display = esOlografo ? '' : 'none';
  }
  selFormaTestamento.addEventListener('change', actualizarBloqueTestamento);

  function actualizarCamposVisibles() {
    const materia = MATERIAS[materiaActual];
    const tipo = materia.tipos[selTipo.value];
    if (!tipo) return;
    const todos = [...tipo.requiere, ...tipo.opcionales];
    CAMPOS_CONFIG.forEach(c => {
      const wrap = container.querySelector(`#suc-wrap-${c.id}`);
      if (!wrap) return;
      wrap.style.display = todos.includes(c.id) ? '' : 'none';
    });
    actualizarBloqueTestamento();
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

  chkAdministrador.addEventListener('change', () => { wrapAdministrador.style.display = chkAdministrador.checked ? '' : 'none'; });

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

  // ── Herederos: lista dinámica (máx. 15) ─────────────────────────────────
  const wrapHerederos = container.querySelector('#suc-herederos-wrapper');
  const btnAddHeredero = container.querySelector('#suc-add-heredero');
  const MAX_HEREDEROS = 15;
  let herederosCount = 0, herederosActivos = 0;

  function actualizarBotonHeredero() {
    btnAddHeredero.disabled = herederosActivos >= MAX_HEREDEROS;
    btnAddHeredero.textContent = herederosActivos >= MAX_HEREDEROS ? 'Máximo de 15 herederos alcanzado' : '+ Agregar heredero/a (máx. 15)';
  }

  function agregarHeredero(datos = {}) {
    if (herederosActivos >= MAX_HEREDEROS) return;
    herederosCount++; herederosActivos++;
    const id = herederosCount;
    const div = document.createElement('div');
    div.className = 'form-row';
    div.id = `suc-heredero-row-${id}`;
    div.innerHTML = `
      <div class="field-group" style="flex:2"><input type="text" id="suc-heredero-nombre-${id}" placeholder="Nombre y apellido" value="${(datos.nombre || '').replace(/"/g, '&quot;')}"></div>
      <div class="field-group" style="flex:1"><input type="text" id="suc-heredero-dni-${id}" placeholder="DNI" value="${(datos.dni || '').replace(/"/g, '&quot;')}"></div>
      <div class="field-group" style="flex:1"><input type="text" id="suc-heredero-vinculo-${id}" placeholder="Vínculo (hijo/a, cónyuge...)" value="${(datos.vinculo || '').replace(/"/g, '&quot;')}"></div>
      <div class="field-group" style="flex:2"><input type="text" id="suc-heredero-domicilio-${id}" placeholder="Domicilio real" value="${(datos.domicilio || '').replace(/"/g, '&quot;')}"></div>
      <div class="field-group" style="flex:0;align-self:flex-end"><button class="btn btn-ghost" type="button" data-remove-heredero="${id}">✕</button></div>`;
    wrapHerederos.appendChild(div);
    div.querySelector('[data-remove-heredero]').addEventListener('click', () => { div.remove(); herederosActivos--; actualizarBotonHeredero(); });
    actualizarBotonHeredero();
    return id;
  }
  btnAddHeredero.addEventListener('click', () => agregarHeredero());

  function leerHerederos() {
    return Array.from(wrapHerederos.querySelectorAll('[id^="suc-heredero-row-"]')).map(row => {
      const id = row.id.replace('suc-heredero-row-', '');
      return {
        nombre: container.querySelector(`#suc-heredero-nombre-${id}`)?.value.trim() || '',
        dni: container.querySelector(`#suc-heredero-dni-${id}`)?.value.trim() || '',
        vinculo: container.querySelector(`#suc-heredero-vinculo-${id}`)?.value.trim() || '',
        domicilio: container.querySelector(`#suc-heredero-domicilio-${id}`)?.value.trim() || '',
      };
    }).filter(h => h.nombre);
  }

  // ── Generar ──────────────────────────────────────────────────────────────
  container.querySelector('#suc-generar').addEventListener('click', () => {
    const materia = MATERIAS[materiaActual];
    const tipo = materia.tipos[selTipo.value];

    CAMPOS_CONFIG.forEach(c => container.querySelector(`#suc-${c.id}`)?.classList.remove('error'));
    let ok = true;
    for (const id of tipo.requiere) {
      const el = container.querySelector(`#suc-${id}`);
      if (el && !el.value.trim()) { el.classList.add('error'); ok = false; }
    }
    const esOlografo = selTipo.value === 'testamentaria' && selFormaTestamento.value === 'ologrofo';
    const esActoPublico = selTipo.value === 'testamentaria' && selFormaTestamento.value === 'acto_publico';
    if (esOlografo) {
      ['testigo1_testamento', 'testigo2_testamento'].forEach(id => {
        const el = container.querySelector(`#suc-${id}`);
        if (el && !el.value.trim()) { el.classList.add('error'); ok = false; }
      });
    }
    if (esActoPublico) {
      const el = container.querySelector('#suc-escribano');
      if (el && !el.value.trim()) { el.classList.add('error'); ok = false; }
    }
    const herederos = leerHerederos();
    if (!herederos.length) ok = false;
    if (!ok) return;

    const d = {};
    [...tipo.requiere, ...tipo.opcionales].forEach(id => {
      const el = container.querySelector(`#suc-${id}`);
      if (el) d[id] = el.value.trim();
    });
    Object.keys(d).forEach(k => {
      const cfg = CAMPOS_BY_ID[k];
      if (cfg && cfg.tipo === 'date' && d[k]) d[k] = fmtFecha(d[k]);
    });
    d.formaTestamento = selFormaTestamento.value;

    const abogadoSel = ABOGADOS_BY_ID[selAbogado.value];
    const matricula = val('suc-matricula') || 'T° __ F° __';
    const abogadoTexto = `${abogadoSel.nombre}, ${abogadoSel.genero === 'M' ? 'abogado' : 'abogada'} (${matricula})`;
    const caracterLetradoValor = val('suc-caracter-letrado');
    const caracterLetradoTexto = caracterLetradoValor === 'apoderado' ? 'apoderado/a' : 'patrocinante';
    const juzgado = val('suc-juzgado');
    const domicilioProcesal = val('suc-domicilio_procesal') || '[DOMICILIO PROCESAL A CONSTITUIR]';
    const emailNotif = val('suc-email_notificaciones') || abogadoSel.domicilioElectronico;

    const herederosTextoEncabezado = joinConY(herederos.map(h => `${h.nombre}, DNI ${h.dni || '[DNI]'}, con domicilio real en ${h.domicilio || '[DOMICILIO]'}`));
    const letrasHer = 'abcdefghijklmnopqrstuvwxyz';
    const herederosDetalle = herederos.map((h, i) => `${letrasHer[i] || i + 1}) ${h.nombre}, DNI ${h.dni || '[DNI]'}, en carácter de ${h.vinculo || '[VÍNCULO CON EL CAUSANTE]'}, con domicilio real en ${h.domicilio || '[DOMICILIO]'}`).join('; ') + '.-';

    const conflictoHerederos = container.querySelector('#suc-conflicto_herederos').checked;
    const administradorOn = chkAdministrador.checked;
    const administradorNombre = val('suc-administrador_nombre');

    const tipoLabelObjeto = tipo.label === 'Ab Intestato' ? 'ab intestato' : 'testamentario';

    // ── Prueba documental (siempre se ofrece; se completa con lo cargado) ──
    const partidaDefuncion = val('suc-partida_defuncion');
    const partidasVinculo = val('suc-partidas_vinculo');
    const pruebaOtros = val('suc-prueba_otros');
    const bloquesPrueba = [];
    let nProb = 0;
    nProb++;
    bloquesPrueba.push(`${nProb}.- Partida de defunción del/de la causante${partidaDefuncion ? `, N° ${partidaDefuncion}` : ''}. Se acompaña y se peticiona se la tenga por parte integrante de la presente.`);
    nProb++;
    bloquesPrueba.push(`${nProb}.- Partidas que acreditan el vínculo de los herederos denunciados con el/la causante${partidasVinculo ? `: ${partidasVinculo}` : ' (se acompañan las partidas de nacimiento/matrimonio correspondientes a cada heredero denunciado)'}.`);
    nProb++;
    bloquesPrueba.push(`${nProb}.- Copia de DNI de cada uno de los herederos denunciados.`);
    if (materiaActual === 'sucesiones' && selTipo.value === 'testamentaria') {
      nProb++;
      bloquesPrueba.push(`${nProb}.- Testamento del/de la causante${esActoPublico ? ' (testimonio a remitir por el/la escribano/a interviniente)' : ' (original a los fines de su protocolización)'}.`);
    }
    if (d.bienes_registrables) {
      nProb++;
      bloquesPrueba.push(`${nProb}.- Título/s de los bienes registrables denunciados: ${d.bienes_registrables}.`);
    }
    if (pruebaOtros) {
      nProb++;
      bloquesPrueba.push(`${nProb}.- Otra prueba documental: ${pruebaOtros}.`);
    }

    const hechosTipo = tipo.hechos(d);
    const derechoTipo = tipo.derecho(d);

    // ── Petitorio (varía según tipo, forma de testamento y administrador) ──
    const petitorio = [
      'Me tenga por presentado, por parte y por constituido el domicilio procesal indicado.',
      `Se tenga por promovido el juicio sucesorio ${tipoLabelObjeto} de ${d.causante_nombre}.`,
      'Se ordene la apertura del proceso sucesorio y se dicten las medidas preliminares y de seguridad que V.S. estime pertinentes (art. 725, CPCC).',
    ];
    if (esOlografo) {
      petitorio.push('Se fije audiencia a los fines del reconocimiento de la firma y letra del/de la testador/a por los testigos ofrecidos, y se disponga oportunamente la protocolización del testamento (arts. 739 y 740, CPCC).');
    }
    if (esActoPublico) {
      petitorio.push(`Se dé intervención al Registro de Actos de Última Voluntad y se requiera al/a la escribano/a interviniente${d.escribano ? ` (${d.escribano})` : ''} la remisión del testimonio del testamento (art. 724, CPCC).`);
    }
    if (administradorOn) {
      petitorio.push(`Se designe a ${administradorNombre || '[NOMBRE DEL/DE LA PROPUESTO/A]'} como administrador/a provisional de la sucesión (art. 727, CPCC).`);
    }
    petitorio.push('Se ordene la citación de los interesados en la forma prescripta por el art. 734, CPCC, en cuanto corresponda.');
    petitorio.push('Se tenga presente la prueba documental ofrecida.');
    petitorio.push(`Se tengan presentes las autorizaciones conferidas a ${TODOS_ABOGADOS_TEXTO} en el punto respectivo.`);
    petitorio.push('Oportunamente, se dicte declaratoria de herederos a favor de los denunciados (art. 735, CPCC).');
    const petitorioTexto = petitorio.map((p, i) => `${i + 1}) ${p}`).join('\n');

    const advertenciaConflicto = conflictoHerederos
      ? '\n\nADVERTENCIA: se marcó la existencia de conflicto entre los herederos. Verificar si corresponde que todos los denunciados sean representados por este Estudio, o si alguno reviste intereses contrapuestos que ameriten patrocinio separado, antes de presentar el escrito en los términos redactados.'
      : '';

    const texto =
`SEÑOR JUEZ${juzgado ? ` — ${juzgado}` : ''}:

${abogadoTexto}, en mi carácter de ${caracterLetradoTexto} de ${herederosTextoEncabezado || '[HEREDEROS A DENUNCIAR]'}, constituyendo domicilio procesal en ${domicilioProcesal} y domicilio electrónico en ${emailNotif} (art. 40, CPCC de la Provincia de Buenos Aires), a V.S. respetuosamente me presento y digo:

I. OBJETO
Que vengo por el presente a promover el juicio sucesorio ${tipoLabelObjeto} de ${d.causante_nombre}${d.causante_dni ? `, DNI ${d.causante_dni}` : ''}, fallecido/a con fecha ${d.fecha_fallecimiento}, solicitando se ordene la apertura del proceso sucesorio, se tenga por denunciados a los herederos que se detallan en el punto siguiente y oportunamente se dicte declaratoria de herederos a su favor.

II. HECHOS
${hechosTipo}

Se denuncian como herederos del/de la causante a las siguientes personas: ${herederosDetalle}

III. EL DERECHO
${derechoTipo}

IV. PRUEBA DOCUMENTAL
${bloquesPrueba.join('\n\n')}

V. AUTORIZACIONES
Autorizo indistintamente a ${TODOS_ABOGADOS_TEXTO} a compulsar el expediente, tomar vista de las actuaciones, retirar y diligenciar cédulas, oficios, mandamientos, testimonios, copias y demás documentación, y a realizar cualquier otro trámite relacionado con las presentes actuaciones.

VI. PETITORIO
Por lo expuesto, a V.S. solicito:
${petitorioTexto}

PROVEER DE CONFORMIDAD,
SERÁ JUSTICIA.

──────────────────────────────────────────────
Recordatorios previos a la presentación (no forman parte del escrito):
- Verificar el Bono de Derecho Fijo (Ley 8480), salvo exención aplicable.
- Verificar la competencia territorial (último domicilio del/de la causante, art. 2336, CCCN).
- El informe del Registro de Actos de Última Voluntad se requiere siempre al iniciar (art. 724, CPCC), aun en la sucesión ab intestato.${esOlografo ? '\n- Verificar disponibilidad de los dos testigos ofrecidos para la audiencia de reconocimiento de firma y letra (art. 739, CPCC).' : ''}${advertenciaConflicto}`;

    ultimoTextoGenerado = texto;
    textarea.value = texto;
    divRes.style.display = 'block';
    divEnviarConf.style.display = 'none';
    textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  container.querySelector('#suc-limpiar').addEventListener('click', () => {
    CAMPOS_CONFIG.forEach(c => { const el = container.querySelector(`#suc-${c.id}`); if (el) { el.value = ''; el.classList.remove('error'); } });
    container.querySelector('#suc-juzgado').value = '';
    container.querySelector('#suc-domicilio_procesal').value = '';
    container.querySelector('#suc-partida_defuncion').value = '';
    container.querySelector('#suc-partidas_vinculo').value = '';
    container.querySelector('#suc-prueba_otros').value = '';
    container.querySelector('#suc-conflicto_herederos').checked = false;
    chkAdministrador.checked = false;
    container.querySelector('#suc-administrador_nombre').value = '';
    wrapAdministrador.style.display = 'none';
    selFormaTestamento.selectedIndex = 0;
    selAbogado.selectedIndex = 0;
    container.querySelector('#suc-caracter-letrado').selectedIndex = 0;
    wrapHerederos.innerHTML = '';
    herederosCount = 0; herederosActivos = 0;
    actualizarBotonHeredero();
    actualizarAbogado();
    divRes.style.display = 'none';
    divEnviarConf.style.display = 'none';
    textarea.value = '';
    ultimoTextoGenerado = '';
  });

  container.querySelector('#suc-copiar').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      const btn = container.querySelector('#suc-copiar');
      const orig = btn.textContent;
      btn.textContent = 'Copiado ✓';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => prompt('Copie el texto:', texto));
  });

  container.querySelector('#suc-reset-texto').addEventListener('click', () => {
    if (ultimoTextoGenerado) textarea.value = ultimoTextoGenerado;
  });

  container.querySelector('#suc-word').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const htmlBody = texto.split('\n').map(linea => {
      if (!linea.trim()) return '<p>&nbsp;</p>';
      const negrita = /^(SEÑOR JUEZ|I\.|II\.|III\.|IV\.|V\.|VI\.|PROVEER|SERÁ JUSTICIA|Recordatorios|ADVERTENCIA)/.test(linea.trim());
      const esc = linea.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<p style="margin:0 0 8pt 0;${negrita ? 'font-weight:bold;' : ''}">${esc}</p>`;
    }).join('\n');
    exportarWord(`Sucesión - ${val('suc-causante_nombre') || 'causante'}`, htmlBody);
  });

  container.querySelector('#suc-pdf').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const lineas = texto.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    exportarPDF(`Sucesión — ${val('suc-causante_nombre') || 'causante'}`, `<div class="info-box" style="font-size:12px;line-height:1.7">${lineas}</div>`);
  });

  // ── Enviar a Generador de Presupuestos ───────────────────────────────────
  container.querySelector('#suc-enviar').addEventListener('click', () => {
    const herederos = leerHerederos();
    const fecha = new Date().toLocaleDateString('es-AR');
    const payload = {
      fecha,
      rama: 'sucesiones',
      subtipo: selTipo.value,
      campos: {
        causante: val('suc-causante_nombre'),
        fecha_fallecimiento: val('suc-fecha_fallecimiento'),
        cant_herederos: String(herederos.length),
        bienes_registrables: val('suc-bienes_registrables'),
        jurisdiccion: val('suc-juzgado'),
      },
      conflictoHerederos: container.querySelector('#suc-conflicto_herederos').checked,
    };
    try {
      localStorage.setItem('mvc_prefill_presupuesto_sucesion', JSON.stringify(payload));
    } catch (e) {
      divEnviarConf.style.display = 'block';
      divEnviarConf.innerHTML = `<div class="display-box" style="color:#c00">No se pudieron guardar los datos (${e.message}).</div>`;
      return;
    }
    divEnviarConf.style.display = 'block';
    divEnviarConf.innerHTML = `<div class="display-box" style="background:#e8f4ea;border-color:#7ab88a">
      ✅ Datos enviados. Abrí el <strong>Generador de Presupuestos</strong> y aceptá el banner para cargarlos.
      <div style="margin-top:8px"><button class="btn btn-primary" id="suc-ir-a-presupuesto" type="button">Ir ahora</button></div>
    </div>`;
    container.querySelector('#suc-ir-a-presupuesto').addEventListener('click', () => { location.hash = 'presupuestos'; });
  });

  // ── Prefill desde Generador de Minutas ──────────────────────────────────
  (function detectarPrefill() {
    let payload;
    try { payload = JSON.parse(localStorage.getItem('mvc_prefill_sucesion') || 'null'); } catch { payload = null; }
    if (!payload || !payload.campos) return;

    const banner = document.createElement('div');
    banner.style.cssText = 'background:#e8f4ea;border:1px solid #7ab88a;border-radius:6px;padding:12px 14px;margin-bottom:16px;font-size:.85rem;color:#1f4d2c;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap';
    banner.innerHTML = `
      <span>📋 Hay datos de una minuta cargados el ${payload.fecha || ''} — ¿los cargamos en este formulario?</span>
      <span style="display:flex;gap:8px">
        <button class="btn btn-success" id="suc-prefill-cargar" type="button">Cargar</button>
        <button class="btn btn-ghost" id="suc-prefill-descartar" type="button">Descartar</button>
      </span>`;
    container.querySelector('.tool-card').insertBefore(banner, container.querySelector('.tool-card').children[1]);

    banner.querySelector('#suc-prefill-cargar').addEventListener('click', () => {
      if (payload.subtipo && MATERIAS.sucesiones.tipos[payload.subtipo]) {
        selTipo.value = payload.subtipo;
        actualizarCamposVisibles();
      }
      Object.entries(payload.campos).forEach(([id, valor]) => {
        const el = container.querySelector(`#suc-${id}`);
        if (el && valor) el.value = valor;
      });
      if (payload.campos.forma_testamento) {
        selFormaTestamento.value = payload.campos.forma_testamento;
        actualizarBloqueTestamento();
      }
      if (payload.conflictoHerederos !== undefined) container.querySelector('#suc-conflicto_herederos').checked = !!payload.conflictoHerederos;
      if (payload.administradorCheck) {
        chkAdministrador.checked = true;
        wrapAdministrador.style.display = '';
      }
      if (Array.isArray(payload.herederos)) {
        payload.herederos.forEach(h => agregarHeredero(h));
      }
      localStorage.removeItem('mvc_prefill_sucesion');
      banner.remove();
    });
    banner.querySelector('#suc-prefill-descartar').addEventListener('click', () => {
      localStorage.removeItem('mvc_prefill_sucesion');
      banner.remove();
    });
  })();
}
