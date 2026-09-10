// Generador de Escrito de Divorcio — Presentación Conjunta o Unilateral (Provincia de Buenos Aires)
// El divorcio se decreta judicialmente a petición de ambos cónyuges o de uno solo (art. 437, CCCN).
// Toda petición debe acompañarse de una propuesta que regule los efectos del divorcio (convenio
// regulador — art. 438, CCCN), cuyo contenido mínimo fija el art. 439, CCCN (atribución de la
// vivienda, distribución de los bienes, eventuales compensaciones económicas entre cónyuges y
// ejercicio de la responsabilidad parental). La falta de acuerdo sobre los efectos no impide el
// dictado de la sentencia de divorcio (art. 438, 2° párr., CCCN). Competencia: juez del último
// domicilio conyugal o del demandado, a elección del actor, o el de cualquiera de los cónyuges si
// la presentación es conjunta (art. 717, CCCN). En la Provincia de Buenos Aires el trámite ante los
// Juzgados de Familia se rige por el Libro VIII (Proceso de Familia) del Código Procesal Civil y
// Comercial, texto según Ley 13.634 (art. 15, Ley 13.634).
import { exportarPDF, exportarWord } from './exportar.js';
import { initGuardarMiExpediente } from './mi-expediente.js';

export function initDivorcio(container) {

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
    divorcio: {
      label: 'Divorcio',
      tipos: {
        presentacion_conjunta: {
          label: 'Presentación conjunta (mutuo acuerdo, art. 437, CCCN)',
          requiere: ['conyuge1_nombre', 'conyuge1_dni', 'conyuge1_domicilio', 'conyuge2_nombre', 'conyuge2_dni', 'conyuge2_domicilio', 'fecha_matrimonio', 'ultimo_domicilio_conyugal'],
          opcionales: ['lugar_matrimonio', 'acta_matrimonio'],
        },
        presentacion_unilateral: {
          label: 'Presentación unilateral (un solo cónyuge, art. 437, CCCN)',
          requiere: ['conyuge1_nombre', 'conyuge1_dni', 'conyuge1_domicilio', 'conyuge2_nombre', 'conyuge2_domicilio', 'fecha_matrimonio', 'ultimo_domicilio_conyugal'],
          opcionales: ['conyuge2_dni', 'lugar_matrimonio', 'acta_matrimonio'],
        },
      },
    },
  };

  // ── Campos (pool compartido) ─────────────────────────────────────────────
  const CAMPOS_CONFIG = [
    { id: 'conyuge1_nombre',    label: 'Nombre completo (cónyuge 1 — parte patrocinada)', placeholder: 'Juan García',   tipo: 'text', grupo: 'conyuges' },
    { id: 'conyuge1_dni',       label: 'DNI (cónyuge 1)',                                 placeholder: '12.345.678',     tipo: 'text', grupo: 'conyuges' },
    { id: 'conyuge1_domicilio', label: 'Domicilio real (cónyuge 1)',                       placeholder: 'Calle 45 N° 850, La Plata', tipo: 'text', grupo: 'conyuges' },
    { id: 'conyuge2_nombre',    label: 'Nombre completo (cónyuge 2 / otro cónyuge)',       placeholder: 'María Pérez',    tipo: 'text', grupo: 'conyuges' },
    { id: 'conyuge2_dni',       label: 'DNI (cónyuge 2 / otro cónyuge)',                   placeholder: '13.456.789',     tipo: 'text', grupo: 'conyuges' },
    { id: 'conyuge2_domicilio', label: 'Domicilio real (cónyuge 2 / a fines de notificación)', placeholder: 'Calle 50 N° 620, La Plata', tipo: 'text', grupo: 'conyuges' },

    { id: 'fecha_matrimonio',        label: 'Fecha de celebración del matrimonio',        placeholder: '', tipo: 'date', grupo: 'matrimonio' },
    { id: 'lugar_matrimonio',        label: 'Lugar / Registro Civil (opcional)',           placeholder: 'Registro Civil de La Plata', tipo: 'text', grupo: 'matrimonio' },
    { id: 'acta_matrimonio',         label: 'Acta N° / Tomo / Folio (opcional)',           placeholder: 'Acta N° 123, Año 2015', tipo: 'text', grupo: 'matrimonio' },
    { id: 'ultimo_domicilio_conyugal', label: 'Último domicilio conyugal (competencia — art. 717, CCCN)', placeholder: 'Calle 45 N° 850, La Plata', tipo: 'text', grupo: 'matrimonio' },

    { id: 'vivienda_convenio',           label: 'Atribución de la vivienda familiar (opcional)', placeholder: 'A falta de acuerdo específico, indicar si se mantiene, se atribuye a uno de los cónyuges o se vende', tipo: 'textarea', grupo: 'convenio' },
    { id: 'compensacion_economica_detalle', label: 'Detalle de la compensación económica (opcional)', placeholder: 'Monto, modalidad de pago (única vez, renta por plazo, usufructo, etc.) — art. 441, CCCN', tipo: 'textarea', grupo: 'convenio' },
    { id: 'cuidado_personal',           label: 'Cuidado personal de los hijos/as (si corresponde)', placeholder: 'Ej.: cuidado personal compartido indistinto, a cargo de ambos progenitores (arts. 648 y 650, CCCN)', tipo: 'textarea', grupo: 'convenio' },
    { id: 'regimen_comunicacion',       label: 'Régimen de comunicación con los hijos/as (si corresponde)', placeholder: 'Días, horarios, vacaciones, medios de contacto', tipo: 'textarea', grupo: 'convenio' },
    { id: 'alimentos_hijos',            label: 'Cuota alimentaria a favor de los hijos/as (si corresponde)', placeholder: 'Monto, porcentaje de ingresos, forma y fecha de pago', tipo: 'textarea', grupo: 'convenio' },
    { id: 'otros_acuerdos',             label: 'Otros acuerdos incluidos en el convenio (opcional)', placeholder: 'Obra social, gastos extraordinarios, seguros, etc.', tipo: 'textarea', grupo: 'convenio' },
  ];
  const CAMPOS_BY_ID = Object.fromEntries(CAMPOS_CONFIG.map(c => [c.id, c]));

  let materiaActual = Object.keys(MATERIAS)[0];

  // ── HTML ───────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Generador de Escrito de Divorcio</h2>
      <p class="tool-desc">Presentación conjunta o unilateral, con convenio regulador — Provincia de Buenos Aires</p>

      <div style="display:block;background:#fff3cd;border:1px solid #d9a441;border-radius:6px;padding:10px 14px;margin-bottom:16px;font-size:.82rem;line-height:1.6;color:#5a4408">
        ⚠️ Herramienta en versión inicial, pendiente de revisión final por el Estudio antes de su uso en un caso real. El trámite específico ante el Juzgado de Familia (ratificación personal, audiencias, plazos) puede variar según el Departamento Judicial y la acordada vigente: verificar antes de presentar. No incluye beneficio de litigar sin gastos.
      </div>

      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="dv-materia">Materia</label>
          <select id="dv-materia">
            ${Object.entries(MATERIAS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
          </select>
        </div>
        <div class="field-group" style="flex:2">
          <label for="dv-tipo">Tipo de presentación</label>
          <select id="dv-tipo"></select>
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Profesional actuante y trámite</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group">
          <label for="dv-abogado-select">Abogado/a actuante</label>
          <select id="dv-abogado-select">${ABOGADOS.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('')}</select>
        </div>
        <div class="field-group">
          <label for="dv-caracter-letrado">Carácter</label>
          <select id="dv-caracter-letrado">${CARACTER_LETRADO.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}</select>
        </div>
        <div class="field-group"><label for="dv-matricula">Matrícula (Tomo/Folio y Colegio)</label><input type="text" id="dv-matricula"></div>
      </div>
      <p id="dv-abogado-info" style="font-size:.78rem;color:var(--color-muted);margin:-6px 0 10px"></p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group"><label for="dv-juzgado">Juzgado de Familia / jurisdicción competente</label><input type="text" id="dv-juzgado" placeholder="Juzgado de Familia N° _ del Departamento Judicial de..."></div>
        <div class="field-group"><label for="dv-domicilio_procesal">Domicilio procesal a constituir (art. 40 CPCC)</label><input type="text" id="dv-domicilio_procesal"></div>
        <div class="field-group"><label for="dv-email_notificaciones">Domicilio electrónico (notificaciones SCBA)</label><input type="text" id="dv-email_notificaciones"></div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos de los cónyuges</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px" id="dv-grupo-conyuges"></div>
      <p id="dv-nota-conyuge2" style="font-size:.78rem;color:var(--color-muted);margin:-6px 0 10px"></p>
      <div class="check-row" id="dv-wrap-conflicto" style="margin-top:6px">
        <input type="checkbox" id="dv-conflicto_intereses">
        <label for="dv-conflicto_intereses">¿Existe conflicto de intereses entre los cónyuges respecto del convenio?</label>
      </div>
      <div class="check-row" id="dv-wrap-otro-propone" style="display:none;margin-top:6px">
        <input type="checkbox" id="dv-otro_conyuge_propone">
        <label for="dv-otro_conyuge_propone">El otro cónyuge acompañaría/presentaría una propuesta propia de convenio (art. 438, 2° párr., CCCN)</label>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del matrimonio</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px" id="dv-grupo-matrimonio"></div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Hijos/as en común (opcional)</div>
      <div id="dv-hijos-wrapper" style="display:flex;flex-direction:column;gap:6px"></div>
      <div class="form-row" style="justify-content:flex-start;margin-top:6px">
        <button class="btn btn-ghost" id="dv-add-hijo" type="button">+ Agregar hijo/a (máx. 10)</button>
      </div>
      <div class="check-row" style="margin-top:8px">
        <input type="checkbox" id="dv-hijo_capacidad_restringida">
        <label for="dv-hijo_capacidad_restringida">Alguno de los hijos/as en común es mayor de edad con capacidad restringida (art. 658, CCCN)</label>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Bienes gananciales a liquidar (opcional)</div>
      <div id="dv-bienes-wrapper" style="display:flex;flex-direction:column;gap:6px"></div>
      <div class="form-row" style="justify-content:flex-start;margin-top:6px">
        <button class="btn btn-ghost" id="dv-add-bien" type="button">+ Agregar bien (máx. 15)</button>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:18px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Convenio regulador (arts. 438 y 439, CCCN)</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px" id="dv-grupo-convenio"></div>
      <div class="check-row" style="margin-top:6px">
        <input type="checkbox" id="dv-compensacion_economica_check">
        <label for="dv-compensacion_economica_check">Se pacta compensación económica entre cónyuges (art. 441, CCCN)</label>
      </div>

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:16px">
        <button class="btn btn-primary" id="dv-generar">Generar escrito</button>
        <button class="btn btn-ghost"   id="dv-limpiar">Limpiar</button>
      </div>

      <div id="dv-resultado" style="display:none;margin-top:24px">
        <label for="dv-texto" style="font-weight:600;display:block;margin-bottom:6px">Texto generado (editable)</label>
        <textarea id="dv-texto" rows="26" style="width:100%;resize:vertical;font-family:inherit;font-size:.88rem;padding:12px;border:1px solid var(--color-border);border-radius:6px;background:#ffffff;color:#1a1a1a;line-height:1.6"></textarea>
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px">
          <button class="btn btn-success" id="dv-copiar">📋 Copiar texto</button>
          <button class="btn btn-ghost"   id="dv-guardar-me">💾 Guardar en Mi Expediente</button>
          <button class="btn btn-ghost"   id="dv-word">📝 Exportar Word (.doc editable)</button>
          <button class="btn btn-ghost"   id="dv-pdf">📄 Exportar PDF</button>
          <button class="btn btn-ghost"   id="dv-reset-texto">Restablecer</button>
          <button class="btn btn-ghost"   id="dv-enviar">➡️ Enviar a Generador de Presupuestos</button>
        </div>
        <div id="dv-enviar-confirmacion" style="display:none;margin-top:10px"></div>
      </div>

      <p style="margin-top:24px;font-size:.78rem;color:var(--color-muted);border-top:1px solid var(--color-border);padding-top:12px">
        Anteproyecto de escrito. Adaptar al caso concreto. No constituye asesoramiento legal.
      </p>
    </div>`;

  function renderCamposGrupo(grupo, ids) {
    return CAMPOS_CONFIG.filter(c => c.grupo === grupo && ids.includes(c.id)).map(c => `
      <div class="field-group" id="dv-wrap-${c.id}" style="${c.tipo === 'textarea' ? 'grid-column:1/-1' : ''}">
        <label for="dv-${c.id}">${c.label}</label>
        ${c.tipo === 'textarea'
          ? `<textarea id="dv-${c.id}" placeholder="${c.placeholder}" rows="2"></textarea>`
          : `<input type="${c.tipo}" id="dv-${c.id}" placeholder="${c.placeholder}">`
        }
      </div>`).join('');
  }

  // ── Referencias ──────────────────────────────────────────────────────────
  const selMateria  = container.querySelector('#dv-materia');
  const selTipo     = container.querySelector('#dv-tipo');
  const selAbogado  = container.querySelector('#dv-abogado-select');
  const abogadoInfo = container.querySelector('#dv-abogado-info');
  const inputEmailNotif = container.querySelector('#dv-email_notificaciones');
  const notaConyuge2 = container.querySelector('#dv-nota-conyuge2');
  const wrapOtroPropone = container.querySelector('#dv-wrap-otro-propone');
  const chkCompensacion = container.querySelector('#dv-compensacion_economica_check');
  const divRes      = container.querySelector('#dv-resultado');
  const textarea    = container.querySelector('#dv-texto');
  const divEnviarConf = container.querySelector('#dv-enviar-confirmacion');
  let ultimoTextoGenerado = '';

  function actualizarAbogado() {
    const a = ABOGADOS_BY_ID[selAbogado.value];
    if (!a) return;
    inputEmailNotif.value = a.domicilioElectronico;
    container.querySelector('#dv-matricula').value = a.matricula;
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
    container.querySelector('#dv-grupo-conyuges').innerHTML = renderCamposGrupo('conyuges', ids);
    container.querySelector('#dv-grupo-matrimonio').innerHTML = renderCamposGrupo('matrimonio', ids);
    container.querySelector('#dv-grupo-convenio').innerHTML = renderCamposGrupo('convenio', ['vivienda_convenio', 'compensacion_economica_detalle', 'cuidado_personal', 'regimen_comunicacion', 'alimentos_hijos', 'otros_acuerdos']);
  }

  function actualizarBloqueTipo() {
    const esUnilateral = selTipo.value === 'presentacion_unilateral';
    wrapOtroPropone.style.display = esUnilateral ? '' : 'none';
    if (!esUnilateral) container.querySelector('#dv-otro_conyuge_propone').checked = false;
    notaConyuge2.textContent = esUnilateral
      ? 'En la presentación unilateral, "cónyuge 2" es el/la otro/a cónyuge, a quien se dará traslado en el domicilio denunciado.'
      : 'En la presentación conjunta, ambos cónyuges se presentan y suscriben en conjunto.';
  }

  function actualizarCamposVisibles() {
    const materia = MATERIAS[materiaActual];
    const tipo = materia.tipos[selTipo.value];
    if (!tipo) return;
    const todos = [...tipo.requiere, ...tipo.opcionales];
    CAMPOS_CONFIG.forEach(c => {
      const wrap = container.querySelector(`#dv-wrap-${c.id}`);
      if (!wrap) return;
      if (c.grupo === 'convenio') { wrap.style.display = ''; return; }
      wrap.style.display = todos.includes(c.id) ? '' : 'none';
    });
    actualizarBloqueTipo();
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

  chkCompensacion.addEventListener('change', () => {
    const wrap = container.querySelector('#dv-wrap-compensacion_economica_detalle');
    if (wrap) wrap.style.display = chkCompensacion.checked ? '' : 'none';
  });

  // Inicialización
  actualizarAbogado();
  poblarTipos();
  renderizarCampos();
  actualizarCamposVisibles();
  chkCompensacion.dispatchEvent(new Event('change'));

  function val(id) { const el = container.querySelector(`#${id}`); return el ? el.value.trim() : ''; }
  function fmtFecha(iso) {
    if (!iso) return '';
    const p = iso.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
  }

  // ── Hijos/as en común: lista dinámica (máx. 10) ─────────────────────────
  const wrapHijos = container.querySelector('#dv-hijos-wrapper');
  const btnAddHijo = container.querySelector('#dv-add-hijo');
  const MAX_HIJOS = 10;
  let hijosCount = 0, hijosActivos = 0;

  function actualizarBotonHijo() {
    btnAddHijo.disabled = hijosActivos >= MAX_HIJOS;
    btnAddHijo.textContent = hijosActivos >= MAX_HIJOS ? 'Máximo de 10 hijos/as alcanzado' : '+ Agregar hijo/a (máx. 10)';
  }

  function agregarHijo(datos = {}) {
    if (hijosActivos >= MAX_HIJOS) return;
    hijosCount++; hijosActivos++;
    const id = hijosCount;
    const div = document.createElement('div');
    div.className = 'form-row';
    div.id = `dv-hijo-row-${id}`;
    div.innerHTML = `
      <div class="field-group" style="flex:2"><input type="text" id="dv-hijo-nombre-${id}" placeholder="Nombre y apellido" value="${(datos.nombre || '').replace(/"/g, '&quot;')}"></div>
      <div class="field-group" style="flex:1"><input type="date" id="dv-hijo-fecha_nacimiento-${id}" value="${(datos.fecha_nacimiento || '').replace(/"/g, '&quot;')}"></div>
      <div class="field-group" style="flex:1"><input type="text" id="dv-hijo-dni-${id}" placeholder="DNI (opcional)" value="${(datos.dni || '').replace(/"/g, '&quot;')}"></div>
      <div class="field-group" style="flex:0;align-self:flex-end"><button class="btn btn-ghost" type="button" data-remove-hijo="${id}">✕</button></div>`;
    wrapHijos.appendChild(div);
    div.querySelector('[data-remove-hijo]').addEventListener('click', () => { div.remove(); hijosActivos--; actualizarBotonHijo(); });
    actualizarBotonHijo();
    return id;
  }
  btnAddHijo.addEventListener('click', () => agregarHijo());

  function leerHijos() {
    return Array.from(wrapHijos.querySelectorAll('[id^="dv-hijo-row-"]')).map(row => {
      const id = row.id.replace('dv-hijo-row-', '');
      return {
        nombre: container.querySelector(`#dv-hijo-nombre-${id}`)?.value.trim() || '',
        fecha_nacimiento: container.querySelector(`#dv-hijo-fecha_nacimiento-${id}`)?.value.trim() || '',
        dni: container.querySelector(`#dv-hijo-dni-${id}`)?.value.trim() || '',
      };
    }).filter(h => h.nombre);
  }

  // ── Bienes gananciales a liquidar: lista dinámica (máx. 15) ─────────────
  const wrapBienes = container.querySelector('#dv-bienes-wrapper');
  const btnAddBien = container.querySelector('#dv-add-bien');
  const MAX_BIENES = 15;
  let bienesCount = 0, bienesActivos = 0;

  function actualizarBotonBien() {
    btnAddBien.disabled = bienesActivos >= MAX_BIENES;
    btnAddBien.textContent = bienesActivos >= MAX_BIENES ? 'Máximo de 15 bienes alcanzado' : '+ Agregar bien (máx. 15)';
  }

  function agregarBien(datos = {}) {
    if (bienesActivos >= MAX_BIENES) return;
    bienesCount++; bienesActivos++;
    const id = bienesCount;
    const div = document.createElement('div');
    div.className = 'form-row';
    div.id = `dv-bien-row-${id}`;
    div.innerHTML = `
      <div class="field-group" style="flex:3"><input type="text" id="dv-bien-descripcion-${id}" placeholder="Descripción del bien (inmueble, automotor, cuenta, etc.)" value="${(datos.descripcion || '').replace(/"/g, '&quot;')}"></div>
      <div class="field-group" style="flex:3"><input type="text" id="dv-bien-atribucion-${id}" placeholder="Atribución / forma de reparto acordada" value="${(datos.atribucion || '').replace(/"/g, '&quot;')}"></div>
      <div class="field-group" style="flex:0;align-self:flex-end"><button class="btn btn-ghost" type="button" data-remove-bien="${id}">✕</button></div>`;
    wrapBienes.appendChild(div);
    div.querySelector('[data-remove-bien]').addEventListener('click', () => { div.remove(); bienesActivos--; actualizarBotonBien(); });
    actualizarBotonBien();
    return id;
  }
  btnAddBien.addEventListener('click', () => agregarBien());

  function leerBienes() {
    return Array.from(wrapBienes.querySelectorAll('[id^="dv-bien-row-"]')).map(row => {
      const id = row.id.replace('dv-bien-row-', '');
      return {
        descripcion: container.querySelector(`#dv-bien-descripcion-${id}`)?.value.trim() || '',
        atribucion: container.querySelector(`#dv-bien-atribucion-${id}`)?.value.trim() || '',
      };
    }).filter(b => b.descripcion);
  }

  // ── Generar ──────────────────────────────────────────────────────────────
  container.querySelector('#dv-generar').addEventListener('click', () => {
    const materia = MATERIAS[materiaActual];
    const tipo = materia.tipos[selTipo.value];
    const esUnilateral = selTipo.value === 'presentacion_unilateral';

    CAMPOS_CONFIG.forEach(c => container.querySelector(`#dv-${c.id}`)?.classList.remove('error'));
    let ok = true;
    for (const id of tipo.requiere) {
      const el = container.querySelector(`#dv-${id}`);
      if (el && !el.value.trim()) { el.classList.add('error'); ok = false; }
    }
    if (!ok) return;

    const d = {};
    [...tipo.requiere, ...tipo.opcionales].forEach(id => {
      const el = container.querySelector(`#dv-${id}`);
      if (el) d[id] = el.value.trim();
    });
    ['vivienda_convenio', 'compensacion_economica_detalle', 'cuidado_personal', 'regimen_comunicacion', 'alimentos_hijos', 'otros_acuerdos'].forEach(id => {
      d[id] = val(`dv-${id}`);
    });
    Object.keys(d).forEach(k => {
      const cfg = CAMPOS_BY_ID[k];
      if (cfg && cfg.tipo === 'date' && d[k]) d[k] = fmtFecha(d[k]);
    });

    const abogadoSel = ABOGADOS_BY_ID[selAbogado.value];
    const matricula = val('dv-matricula') || 'T° __ F° __';
    const abogadoTexto = `${abogadoSel.nombre}, ${abogadoSel.genero === 'M' ? 'abogado' : 'abogada'} (${matricula})`;
    const caracterLetradoValor = val('dv-caracter-letrado');
    const caracterLetradoTexto = caracterLetradoValor === 'apoderado' ? 'apoderado/a' : 'patrocinante';
    const juzgado = val('dv-juzgado');
    const domicilioProcesal = val('dv-domicilio_procesal') || '[DOMICILIO PROCESAL A CONSTITUIR]';
    const emailNotif = val('dv-email_notificaciones') || abogadoSel.domicilioElectronico;

    const hijos = leerHijos();
    const bienes = leerBienes();
    const conflictoIntereses = container.querySelector('#dv-conflicto_intereses').checked;
    const capacidadRestringida = container.querySelector('#dv-hijo_capacidad_restringida').checked;
    const otroConyugePropone = esUnilateral && container.querySelector('#dv-otro_conyuge_propone').checked;
    const compensacionOn = chkCompensacion.checked;

    const letras = 'abcdefghijklmnopqrstuvwxyz';
    const hijosTexto = hijos.length
      ? joinConY(hijos.map(h => `${h.nombre}${h.fecha_nacimiento ? `, nacido/a el ${fmtFecha(h.fecha_nacimiento)}` : ''}${h.dni ? `, DNI ${h.dni}` : ''}`))
      : '';

    const bienesTexto = bienes.length
      ? bienes.map((b, i) => `${letras[i] || i + 1}) ${b.descripcion}${b.atribucion ? `: ${b.atribucion}` : ' [ATRIBUCIÓN A COMPLETAR]'}`).join('; ') + '.-'
      : 'Los cónyuges declaran no poseer bienes gananciales sujetos a liquidación, sin perjuicio de la que pudiera efectuarse por vía separada respecto de los que en el futuro se denunciaren.';

    // ── Presentación (encabezado) — varía según tipo ────────────────────────
    let presentacionTexto, objetoTexto, hechosTexto, petitorio;

    if (esUnilateral) {
      presentacionTexto = `${abogadoTexto}, en mi carácter de ${caracterLetradoTexto} de ${d.conyuge1_nombre}, DNI ${d.conyuge1_dni}, con domicilio real en ${d.conyuge1_domicilio}, constituyendo domicilio procesal en ${domicilioProcesal} y domicilio electrónico en ${emailNotif} (art. 40, CPCC de la Provincia de Buenos Aires), a V.S. respetuosamente me presento y digo:`;
      objetoTexto = `Que vengo por el presente, en los términos del art. 437 del Código Civil y Comercial de la Nación, a promover petición de divorcio vincular respecto de mi cónyuge ${d.conyuge2_nombre}${d.conyuge2_dni ? `, DNI ${d.conyuge2_dni}` : ''}, acompañando la propuesta que regula los efectos del divorcio (art. 438, CCCN), solicitando se corra el traslado pertinente y oportunamente se decrete el divorcio vincular, con homologación de la propuesta reguladora en cuanto por derecho corresponda.`;
      hechosTexto = `Que con fecha ${d.fecha_matrimonio} contrajeron matrimonio ${d.conyuge1_nombre} y ${d.conyuge2_nombre}${d.lugar_matrimonio ? ` ante el ${d.lugar_matrimonio}` : ''}${d.acta_matrimonio ? ` (${d.acta_matrimonio})` : ''}, habiendo tenido su último domicilio conyugal en ${d.ultimo_domicilio_conyugal}. Que ${hijosTexto ? `del matrimonio nacieron ${hijosTexto}` : 'no existen hijos/as en común'}. Que a la fecha no ha sido posible arribar a un acuerdo integral con mi cónyuge respecto de los efectos del divorcio, motivo por el cual se acompaña la propuesta que se detalla en el punto siguiente, sin perjuicio de la que aquél/aquella pudiera formular en los términos del art. 438, segundo párrafo, del CCCN.${otroConyugePropone ? ' Se tiene conocimiento de que el otro cónyuge presentaría, a su vez, una propuesta propia de convenio regulador, que deberá ser evaluada por V.S. juntamente con la aquí acompañada.' : ''}`;
      petitorio = [
        'Me tenga por presentado, por parte y por constituido el domicilio procesal indicado.',
        `Se tenga por promovida la petición de divorcio vincular respecto de ${d.conyuge2_nombre}.`,
        `Se corra el traslado que por derecho corresponda a ${d.conyuge2_nombre}, en el domicilio denunciado en ${d.conyuge2_domicilio}, a los fines del art. 438, segundo párrafo, del CCCN.`,
        'Se tenga por acompañada la propuesta que regula los efectos del divorcio, y oportunamente se la homologue en cuanto no medie oposición fundada, sin perjuicio de convocar a audiencia si no hubiera acuerdo sobre sus términos (art. 438, CCCN).',
      ];
    } else {
      presentacionTexto = `${abogadoTexto}, en mi carácter de ${caracterLetradoTexto} de ${d.conyuge1_nombre}, DNI ${d.conyuge1_dni}, con domicilio real en ${d.conyuge1_domicilio}, y de ${d.conyuge2_nombre}, DNI ${d.conyuge2_dni}, con domicilio real en ${d.conyuge2_domicilio}, constituyendo domicilio procesal en ${domicilioProcesal} y domicilio electrónico en ${emailNotif} (art. 40, CPCC de la Provincia de Buenos Aires), a V.S. respetuosamente nos presentamos y decimos:`;
      objetoTexto = `Que venimos por el presente, en los términos del art. 437 del Código Civil y Comercial de la Nación, a formular petición conjunta de divorcio vincular, acompañando la propuesta de convenio regulador que se detalla en el punto correspondiente (arts. 438 y 439, CCCN), solicitando se decrete el divorcio vincular y se homologue dicho convenio en cuanto por derecho corresponda.`;
      hechosTexto = `Que con fecha ${d.fecha_matrimonio} contrajimos matrimonio${d.lugar_matrimonio ? ` ante el ${d.lugar_matrimonio}` : ''}${d.acta_matrimonio ? ` (${d.acta_matrimonio})` : ''}, habiendo tenido nuestro último domicilio conyugal en ${d.ultimo_domicilio_conyugal}. Que ${hijosTexto ? `de nuestro matrimonio nacieron ${hijosTexto}` : 'no existen hijos/as en común'}. Que ambos cónyuges hemos arribado a un acuerdo respecto de los efectos del divorcio, cuyos términos se detallan en el convenio regulador que se acompaña en el punto siguiente.`;
      petitorio = [
        'Nos tenga por presentados, por parte y por constituido el domicilio procesal indicado.',
        'Se tenga por promovida la presente petición conjunta de divorcio vincular.',
        'Se tenga por acompañado el convenio regulador y, en su oportunidad, se lo homologue en cuanto por derecho corresponda (arts. 438 y 439, CCCN).',
      ];
    }

    // ── Convenio regulador (arts. 438 y 439, CCCN) ──────────────────────────
    const nConv = 'abcdefghijklmnopqrstuvwxyz';
    const itemsConvenio = [];
    itemsConvenio.push(`${nConv[0]}) Atribución de la vivienda familiar: ${d.vivienda_convenio || '[A COMPLETAR — art. 439 inc. a, CCCN]'}`);
    itemsConvenio.push(`${nConv[1]}) Distribución de los bienes gananciales: ${bienesTexto}`);
    itemsConvenio.push(`${nConv[2]}) Compensación económica (art. 441, CCCN): ${compensacionOn ? (d.compensacion_economica_detalle || '[A COMPLETAR]') : 'Las partes declaran no pactar compensación económica alguna, sin perjuicio del derecho de reclamarla dentro del plazo de caducidad de seis (6) meses computado desde el divorcio (art. 442, CCCN).'}`);
    if (hijos.length || capacidadRestringida) {
      itemsConvenio.push(`${nConv[3]}) Cuidado personal de los/as hijos/as (arts. 648 y 650, CCCN): ${d.cuidado_personal || '[A COMPLETAR]'}`);
      itemsConvenio.push(`${nConv[4]}) Régimen de comunicación (art. 652, CCCN): ${d.regimen_comunicacion || '[A COMPLETAR]'}`);
      itemsConvenio.push(`${nConv[5]}) Cuota alimentaria a favor de los/as hijos/as (arts. 658 y ss., CCCN): ${d.alimentos_hijos || '[A COMPLETAR]'}`);
    } else {
      itemsConvenio.push(`${nConv[3]}) Ejercicio de la responsabilidad parental: no corresponde, por no existir hijos/as menores de edad ni con capacidad restringida en común.`);
    }
    if (d.otros_acuerdos) {
      itemsConvenio.push(`${nConv[itemsConvenio.length]}) Otros acuerdos: ${d.otros_acuerdos}`);
    }
    const convenioTexto = itemsConvenio.join('\n');

    // ── Derecho ──────────────────────────────────────────────────────────────
    let derecho = `Fundo el presente en los arts. 435 inc. c), 437, 438, 439 y 441 del Código Civil y Comercial de la Nación, que regulan el divorcio y el contenido del convenio que debe acompañar la petición. La competencia de V.S. surge del art. 717 del CCCN, en tanto ${esUnilateral ? 'resulta competente el juez del último domicilio conyugal o el del demandado, a elección del actor' : 'la presentación es conjunta, resultando competente el juez del último domicilio conyugal o el de cualquiera de los cónyuges'}.`;
    if (esUnilateral) {
      derecho += ' Conforme el art. 438, segundo párrafo, del CCCN, la falta de acuerdo sobre los efectos del divorcio no suspende el dictado de la sentencia; en tal caso, las cuestiones pendientes deben tramitar por la vía prevista en la legislación local, correspondiendo a V.S. convocar a las partes a una audiencia si correspondiere.';
    }
    derecho += ' En materia procesal, resulta de aplicación el Libro VIII (Proceso de Familia) del Código Procesal Civil y Comercial de la Provincia de Buenos Aires, texto según la Ley 13.634 de Fuero de Familia (art. 15 y concordantes), sin perjuicio de las Acordadas y reglamentaciones vigentes en el Departamento Judicial interviniente.';

    // ── Prueba documental ────────────────────────────────────────────────────
    const bloquesPrueba = [];
    let nProb = 0;
    nProb++; bloquesPrueba.push(`${nProb}.- Partida de matrimonio de los cónyuges. Se acompaña y se peticiona se la tenga por parte integrante de la presente.`);
    nProb++; bloquesPrueba.push(`${nProb}.- Copia de DNI de ${esUnilateral ? 'la parte peticionante' : 'ambos cónyuges'}.`);
    if (hijos.length) { nProb++; bloquesPrueba.push(`${nProb}.- Partidas de nacimiento de los/as hijos/as en común.`); }
    if (bienes.length) { nProb++; bloquesPrueba.push(`${nProb}.- Título/s de los bienes gananciales denunciados a liquidar.`); }
    const pruebaTextoFinal = bloquesPrueba.join('\n\n');

    petitorio.push('Se tenga presente la prueba documental ofrecida.');
    petitorio.push(`Se tengan presentes las autorizaciones conferidas a ${TODOS_ABOGADOS_TEXTO} en el punto respectivo.`);
    petitorio.push('Oportunamente, se decrete el divorcio vincular de los cónyuges (art. 435 inc. c, CCCN).');
    const petitorioTexto = petitorio.map((p, i) => `${i + 1}) ${p}`).join('\n');

    const advertenciaConflicto = conflictoIntereses
      ? '\n\nADVERTENCIA: se marcó la existencia de conflicto de intereses entre los cónyuges respecto del convenio. Evaluar si corresponde que ambos sean patrocinados por este Estudio, o si alguno debe contar con patrocinio letrado separado, antes de presentar el escrito en los términos redactados.'
      : '';

    const texto =
`SEÑOR/A JUEZ/A DE FAMILIA${juzgado ? ` — ${juzgado}` : ''}:

${presentacionTexto}

I. OBJETO
${objetoTexto}

II. HECHOS
${hechosTexto}

III. CONVENIO REGULADOR (arts. 438 y 439, CCCN)
${convenioTexto}

IV. EL DERECHO
${derecho}

V. PRUEBA DOCUMENTAL
${pruebaTextoFinal}

VI. AUTORIZACIONES
Autorizo indistintamente a ${TODOS_ABOGADOS_TEXTO} a compulsar el expediente, tomar vista de las actuaciones, retirar y diligenciar cédulas, oficios, mandamientos, testimonios, copias y demás documentación, y a realizar cualquier otro trámite relacionado con las presentes actuaciones.

VII. PETITORIO
Por lo expuesto, a V.S. solicito:
${petitorioTexto}

PROVEER DE CONFORMIDAD,
SERÁ JUSTICIA.

──────────────────────────────────────────────
Recordatorios previos a la presentación (no forman parte del escrito):
- Verificar el Bono de Derecho Fijo (Ley 8480), salvo exención aplicable.
- Verificar la tasa de justicia aplicable (Código Fiscal — Ley Impositiva vigente) y la eventual procedencia del beneficio de litigar sin gastos.
- Verificar el Juzgado de Familia y Departamento Judicial competente según el último domicilio conyugal o el domicilio de cualquiera de los cónyuges (art. 717, CCCN).
- Verificar si el Departamento Judicial interviniente exige ratificación personal de él/los cónyuge/s ante el Juzgado (trámite habitual en los procesos de familia) antes de la homologación del convenio, y coordinar la agenda correspondiente.${esUnilateral ? '\n- Verificar el modo de notificación al otro cónyuge y el plazo que fije V.S. para expedirse sobre la propuesta acompañada (art. 438, 2° párr., CCCN).' : ''}${advertenciaConflicto}`;

    ultimoTextoGenerado = texto;
    textarea.value = texto;
    divRes.style.display = 'block';
    divEnviarConf.style.display = 'none';
    textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  container.querySelector('#dv-limpiar').addEventListener('click', () => {
    CAMPOS_CONFIG.forEach(c => { const el = container.querySelector(`#dv-${c.id}`); if (el) { el.value = ''; el.classList.remove('error'); } });
    container.querySelector('#dv-juzgado').value = '';
    container.querySelector('#dv-domicilio_procesal').value = '';
    container.querySelector('#dv-conflicto_intereses').checked = false;
    container.querySelector('#dv-hijo_capacidad_restringida').checked = false;
    container.querySelector('#dv-otro_conyuge_propone').checked = false;
    chkCompensacion.checked = false;
    chkCompensacion.dispatchEvent(new Event('change'));
    selAbogado.selectedIndex = 0;
    container.querySelector('#dv-caracter-letrado').selectedIndex = 0;
    selTipo.selectedIndex = 0;
    wrapHijos.innerHTML = '';
    hijosCount = 0; hijosActivos = 0;
    actualizarBotonHijo();
    wrapBienes.innerHTML = '';
    bienesCount = 0; bienesActivos = 0;
    actualizarBotonBien();
    actualizarAbogado();
    actualizarCamposVisibles();
    divRes.style.display = 'none';
    divEnviarConf.style.display = 'none';
    textarea.value = '';
    ultimoTextoGenerado = '';
  });

  container.querySelector('#dv-copiar').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      const btn = container.querySelector('#dv-copiar');
      const orig = btn.textContent;
      btn.textContent = 'Copiado ✓';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => prompt('Copie el texto:', texto));
  });

  container.querySelector('#dv-reset-texto').addEventListener('click', () => {
    if (ultimoTextoGenerado) textarea.value = ultimoTextoGenerado;
  });

  container.querySelector('#dv-word').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const htmlBody = texto.split('\n').map(linea => {
      if (!linea.trim()) return '<p>&nbsp;</p>';
      const negrita = /^(SEÑOR\/A JUEZ\/A|I\.|II\.|III\.|IV\.|V\.|VI\.|VII\.|PROVEER|SERÁ JUSTICIA|Recordatorios|ADVERTENCIA)/.test(linea.trim());
      const esc = linea.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<p style="margin:0 0 8pt 0;${negrita ? 'font-weight:bold;' : ''}">${esc}</p>`;
    }).join('\n');
    exportarWord(`Divorcio - ${val('dv-conyuge1_nombre') || 'conyuge 1'} y ${val('dv-conyuge2_nombre') || 'conyuge 2'}`, htmlBody);
  });

  container.querySelector('#dv-pdf').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const lineas = texto.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    exportarPDF(`Divorcio — ${val('dv-conyuge1_nombre') || 'conyuge 1'} y ${val('dv-conyuge2_nombre') || 'conyuge 2'}`, `<div class="info-box" style="font-size:12px;line-height:1.7">${lineas}</div>`);
  });

  initGuardarMiExpediente(container.querySelector('#dv-guardar-me'), {
    herramienta: 'divorcio',
    categoria: 'Escritos judiciales',
    textarea,
    obtenerMeta: () => ({
      titulo: `Divorcio (PBA) — ${MATERIAS[materiaActual].tipos[selTipo.value]?.label || ''} — ${val('dv-conyuge1_nombre') || 'cónyuge 1'} y ${val('dv-conyuge2_nombre') || 'cónyuge 2'}`,
      cliente: [val('dv-conyuge1_nombre'), val('dv-conyuge2_nombre')].filter(Boolean).join(' y '),
      rama: materiaActual,
      subtipo: selTipo.value,
    }),
  });

  // ── Enviar a Generador de Presupuestos ───────────────────────────────────
  container.querySelector('#dv-enviar').addEventListener('click', () => {
    const hijos = leerHijos();
    const bienes = leerBienes();
    const fecha = new Date().toLocaleDateString('es-AR');
    const payload = {
      fecha,
      rama: 'divorcio',
      subtipo: selTipo.value,
      campos: {
        conyuge1: val('dv-conyuge1_nombre'),
        conyuge2: val('dv-conyuge2_nombre'),
        fecha_matrimonio: val('dv-fecha_matrimonio'),
        cant_hijos: String(hijos.length),
        cant_bienes: String(bienes.length),
        jurisdiccion: val('dv-juzgado'),
      },
      conflictoIntereses: container.querySelector('#dv-conflicto_intereses').checked,
    };
    try {
      localStorage.setItem('mvc_prefill_presupuesto_divorcio', JSON.stringify(payload));
    } catch (e) {
      divEnviarConf.style.display = 'block';
      divEnviarConf.innerHTML = `<div class="display-box" style="color:#c00">No se pudieron guardar los datos (${e.message}).</div>`;
      return;
    }
    divEnviarConf.style.display = 'block';
    divEnviarConf.innerHTML = `<div class="display-box" style="background:#e8f4ea;border-color:#7ab88a">
      ✅ Datos enviados. Abrí el <strong>Generador de Presupuestos</strong> y aceptá el banner para cargarlos.
      <div style="margin-top:8px"><button class="btn btn-primary" id="dv-ir-a-presupuesto" type="button">Ir ahora</button></div>
    </div>`;
    container.querySelector('#dv-ir-a-presupuesto').addEventListener('click', () => { location.hash = 'presupuestos'; });
  });

  // ── Prefill desde Generador de Minutas ──────────────────────────────────
  (function detectarPrefill() {
    let payload;
    try { payload = JSON.parse(localStorage.getItem('mvc_prefill_divorcio') || 'null'); } catch { payload = null; }
    if (!payload || !payload.campos) return;

    const banner = document.createElement('div');
    banner.style.cssText = 'background:#e8f4ea;border:1px solid #7ab88a;border-radius:6px;padding:12px 14px;margin-bottom:16px;font-size:.85rem;color:#1f4d2c;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap';
    banner.innerHTML = `
      <span>📋 Hay datos de una minuta cargados el ${payload.fecha || ''} — ¿los cargamos en este formulario?</span>
      <span style="display:flex;gap:8px">
        <button class="btn btn-success" id="dv-prefill-cargar" type="button">Cargar</button>
        <button class="btn btn-ghost" id="dv-prefill-descartar" type="button">Descartar</button>
      </span>`;
    container.querySelector('.tool-card').insertBefore(banner, container.querySelector('.tool-card').children[1]);

    banner.querySelector('#dv-prefill-cargar').addEventListener('click', () => {
      if (payload.subtipo && MATERIAS.divorcio.tipos[payload.subtipo]) {
        selTipo.value = payload.subtipo;
        actualizarCamposVisibles();
      }
      Object.entries(payload.campos).forEach(([id, valor]) => {
        const el = container.querySelector(`#dv-${id}`);
        if (el && valor) el.value = valor;
      });
      if (payload.conflictoIntereses !== undefined) container.querySelector('#dv-conflicto_intereses').checked = !!payload.conflictoIntereses;
      if (payload.hijoCapacidadRestringida) container.querySelector('#dv-hijo_capacidad_restringida').checked = true;
      if (payload.otroConyugePropone) container.querySelector('#dv-otro_conyuge_propone').checked = true;
      if (Array.isArray(payload.hijos)) payload.hijos.forEach(h => agregarHijo(h));
      if (Array.isArray(payload.bienes)) payload.bienes.forEach(b => agregarBien(b));
      localStorage.removeItem('mvc_prefill_divorcio');
      banner.remove();
    });
    banner.querySelector('#dv-prefill-descartar').addEventListener('click', () => {
      localStorage.removeItem('mvc_prefill_divorcio');
      banner.remove();
    });
  })();
}
