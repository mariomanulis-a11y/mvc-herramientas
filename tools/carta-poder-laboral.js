// Generador de Carta Poder Laboral — Tribunales del Trabajo de la Provincia de Buenos Aires
// Base normativa: Art. 28, Ley 15.057 (Nuevo Procedimiento Laboral - Pcia. de Buenos Aires)
// Modelo alineado al formato utilizado actualmente por el Estudio MVC Abogados.
import { exportarPDF } from './exportar.js';

export function initCartaPoderLaboral(container) {

  // ── Datos preestablecidos del Estudio (editables por si cambia la composición) ──
  const APODERADOS_DEFAULT =
    'los Dres. Mario Martín Manulis (T° XXXIV F° 69 C.A.S.I) y/o Soledad Celeste Velázquez (T° XXXVI F° 125 C.A.S.I) y/o Yanina Daniela Curbelo (T° XXXVI F° 90 C.A.S.I) y/o Camila Susana Poggi (T° LV F° 255 C.A.S.I)';

  const FACULTADES_FIJAS =
    'los faculta para que representen ante las autoridades judiciales, con escritos, demandas, contrademandas, testigos y cuanta más pruebas y justificativos consideren necesarios; recuse con o sin causa; preste juramentos o cauciones juratorias; tache testigos; diga de nulidad; prorrogue o decline jurisdicción; asista a juicios y comparendos verbales; interponga toda clase de recursos y excepciones legales; pida embargos; desembargos; excepciones y sus levantamientos; solicite la venta de los bienes de los deudores; proponga o solicite nombramiento de martillero y toda clase de peritos; reconvenga o conteste reconvenciones; oponga y conteste excepciones; ponga y absuelva posiciones; interponga recursos y desista de ellos; inicie pedidos de quiebra; transe; concilie; desista; formule arreglos; conceda remisiones, quitas y esperas; de recibos y carta de pago; y asimismo para que practique cuantos más actos y gestiones fueren necesarios para el mejor desempeño de este mandato, que podrá sustituir.';

  const MATERIAS = [
    'DESPIDO', 'ACCIDENTE DE TRABAJO', 'ENFERMEDAD PROFESIONAL',
    'DIFERENCIAS SALARIALES E INDEMNIZATORIAS', 'COBRO DE HABERES',
    'EJECUCIÓN DE ACUERDO', 'OTRO (especificar)',
  ];

  const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  let demandadosCount = 0;

  // ── HTML ───────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Generador de Carta Poder Laboral — PBA</h2>
      <p class="tool-desc">Art. 28, Ley 15.057 — Tribunales del Trabajo de la Provincia de Buenos Aires. Modelo del Estudio.</p>

      <div class="info-box-inline" style="background:#fff8e1;border:1px solid #e0c88a;border-radius:6px;padding:10px 14px;margin-bottom:18px;font-size:.82rem;line-height:1.6;color:#5a4a1a">
        Instrumento válido, conforme art. 28 de la Ley 15.057, para representar al <strong>trabajador/a o sus derechohabientes</strong>. La firma se autentica ante escribano/a, funcionario/a judicial letrado/a habilitado/a o secretario/a del Tribunal/Juzgado del Trabajo interviniente — por eso se otorga y ratifica directamente en sede judicial.
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Tribunal</div>
      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="cp-ciudad-acto">Ciudad (encabezado del acta)</label>
          <input type="text" id="cp-ciudad-acto" placeholder="Pilar">
        </div>
        <div class="field-group" style="flex:1">
          <label for="cp-tribunal-nro">Tribunal/Juzgado del Trabajo N°</label>
          <input type="text" id="cp-tribunal-nro" placeholder="7">
        </div>
        <div class="field-group" style="flex:1">
          <label for="cp-depto-judicial">Departamento Judicial</label>
          <input type="text" id="cp-depto-judicial" placeholder="San Isidro">
        </div>
      </div>
      <div class="form-row">
        <div class="field-group" style="flex:2">
          <label for="cp-sede-tribunal">Sede del Tribunal (calle, altura y ciudad)</label>
          <input type="text" id="cp-sede-tribunal" placeholder="calle Nazarre N° 1030 de la ciudad de Del Pilar">
        </div>
        <div class="field-group" style="flex:1">
          <label for="cp-fecha">Fecha del acto</label>
          <input type="date" id="cp-fecha">
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del cliente (poderdante)</div>
      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="cp-sexo">Tratamiento</label>
          <select id="cp-sexo">
            <option value="F">la Sra.</option>
            <option value="M">el Sr.</option>
          </select>
        </div>
        <div class="field-group" style="flex:2">
          <label for="cp-nombre">Nombre completo</label>
          <input type="text" id="cp-nombre" placeholder="Telma Elizabeth Ocampos">
        </div>
        <div class="field-group" style="flex:1">
          <label for="cp-dni">DNI</label>
          <input type="text" id="cp-dni" placeholder="24.006.527">
        </div>
      </div>
      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="cp-nacionalidad">Nacionalidad</label>
          <input type="text" id="cp-nacionalidad" value="argentina">
        </div>
        <div class="field-group" style="flex:1">
          <label for="cp-ocupacion">Ocupación</label>
          <input type="text" id="cp-ocupacion" placeholder="empleada">
        </div>
        <div class="field-group" style="flex:1">
          <label for="cp-edad">Edad</label>
          <input type="number" id="cp-edad" min="0" step="1" placeholder="52">
        </div>
      </div>
      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="cp-domicilio">Domicilio completo</label>
          <input type="text" id="cp-domicilio" placeholder="calle Washington N° 1169, de la localidad de Pilar, Partido Del Pilar (B)">
        </div>
      </div>
      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label><input type="checkbox" id="cp-derechohabiente"> Actúa en carácter de derechohabiente (no como trabajador/a directo/a)</label>
        </div>
      </div>
      <div class="form-row" id="cp-wrap-vinculo" style="display:none">
        <div class="field-group" style="flex:1">
          <label for="cp-vinculo">Vínculo con el/la trabajador/a fallecido/a</label>
          <input type="text" id="cp-vinculo" placeholder="cónyuge / hijo/a / conviviente">
        </div>
        <div class="field-group" style="flex:1">
          <label for="cp-causante">Nombre del/de la trabajador/a fallecido/a</label>
          <input type="text" id="cp-causante" placeholder="Nombre y apellido">
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Materia del juicio</div>
      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="cp-caracter">Carácter</label>
          <select id="cp-caracter">
            <option value="actor">Actor (parte actora)</option>
            <option value="demandado">Demandado (parte demandada)</option>
          </select>
        </div>
        <div class="field-group" style="flex:1">
          <label for="cp-materia">Motivo / materia</label>
          <select id="cp-materia">
            ${MATERIAS.map(m => `<option value="${m}">${m}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row" id="cp-wrap-materia-otro" style="display:none">
        <div class="field-group" style="flex:1">
          <label for="cp-materia-otro">Especificar motivo</label>
          <input type="text" id="cp-materia-otro" placeholder="Ej: EXCLUSIÓN DE TUTELA SINDICAL">
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos de la/s demandada/s</div>
      <div id="cp-demandados-wrapper"></div>
      <div class="form-row" style="justify-content:flex-start;margin-top:4px">
        <button class="btn btn-ghost" id="cp-add-demandado" type="button">+ Agregar demandado/a</button>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Apoderados (preestablecido — editable)</div>
      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="cp-apoderados">Letrados/as apoderados/as</label>
          <textarea id="cp-apoderados" rows="2">${APODERADOS_DEFAULT}</textarea>
        </div>
      </div>

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:8px">
        <button class="btn btn-primary" id="cp-generar">Generar texto</button>
        <button class="btn btn-ghost"   id="cp-limpiar">Limpiar</button>
      </div>

      <div id="cp-resultado" style="display:none;margin-top:24px">
        <label for="cp-texto" style="font-weight:600;display:block;margin-bottom:6px">Texto generado (editable)</label>
        <textarea id="cp-texto" rows="16" style="width:100%;resize:vertical;font-family:inherit;font-size:.9rem;padding:12px;border:1px solid var(--color-border);border-radius:6px;background:#ffffff;color:#1a1a1a;line-height:1.6"></textarea>
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px">
          <button class="btn btn-success" id="cp-copiar">📋 Copiar texto</button>
          <button class="btn btn-ghost"   id="cp-pdf">📄 Exportar PDF</button>
          <button class="btn btn-ghost"   id="cp-reset-texto">Restablecer</button>
        </div>
      </div>

      <p style="margin-top:24px;font-size:.78rem;color:var(--color-muted);border-top:1px solid var(--color-border);padding-top:12px">
        Texto orientativo. Adaptar al caso concreto. No constituye asesoramiento legal.
      </p>
    </div>`;

  // ── Referencias ────────────────────────────────────────────────────────────
  const chkDerechohabiente = container.querySelector('#cp-derechohabiente');
  const wrapVinculo        = container.querySelector('#cp-wrap-vinculo');
  const selMateria         = container.querySelector('#cp-materia');
  const wrapMateriaOtro    = container.querySelector('#cp-wrap-materia-otro');
  const wrapDemandados     = container.querySelector('#cp-demandados-wrapper');
  const btnAddDemandado    = container.querySelector('#cp-add-demandado');
  const divRes             = container.querySelector('#cp-resultado');
  const textarea           = container.querySelector('#cp-texto');
  const btnGen             = container.querySelector('#cp-generar');
  const btnLimp            = container.querySelector('#cp-limpiar');
  const btnCop             = container.querySelector('#cp-copiar');
  const btnReset           = container.querySelector('#cp-reset-texto');

  let ultimoTextoGenerado = '';

  chkDerechohabiente.addEventListener('change', () => {
    wrapVinculo.style.display = chkDerechohabiente.checked ? 'flex' : 'none';
  });

  selMateria.addEventListener('change', () => {
    wrapMateriaOtro.style.display = selMateria.value === 'OTRO (especificar)' ? 'flex' : 'none';
  });

  function agregarDemandado(nombre = '', domicilio = '') {
    demandadosCount++;
    const id = demandadosCount;
    const div = document.createElement('div');
    div.className = 'form-row';
    div.id = `cp-demandado-row-${id}`;
    div.innerHTML = `
      <div class="field-group" style="flex:2">
        <label for="cp-dem-nombre-${id}">Nombre completo / razón social</label>
        <input type="text" id="cp-dem-nombre-${id}" placeholder="Empresa S.A. / Juan Pérez" value="${nombre}">
      </div>
      <div class="field-group" style="flex:2">
        <label for="cp-dem-domicilio-${id}">Domicilio completo</label>
        <input type="text" id="cp-dem-domicilio-${id}" placeholder="calle Dardo Rocha N° 2420, de la localidad de Pilar, Partido Del Pilar (B)" value="${domicilio}">
      </div>
      ${demandadosCount > 1 ? `<div class="field-group" style="flex:0;align-self:flex-end"><button class="btn btn-ghost" type="button" data-remove="${id}">✕</button></div>` : ''}
    `;
    wrapDemandados.appendChild(div);
    const btnRemove = div.querySelector('[data-remove]');
    if (btnRemove) {
      btnRemove.addEventListener('click', () => div.remove());
    }
  }
  agregarDemandado();
  btnAddDemandado.addEventListener('click', () => agregarDemandado());

  function fmtFechaActo(iso) {
    if (!iso) return { dia: '[DÍA]', mes: '[MES]', anio: '[AÑO]' };
    const [y, m, d] = iso.split('-');
    return { dia: String(parseInt(d, 10)), mes: MESES[parseInt(m, 10) - 1], anio: y };
  }

  // ── Generar ────────────────────────────────────────────────────────────────
  btnGen.addEventListener('click', () => {
    const camposReq = ['cp-ciudad-acto','cp-tribunal-nro','cp-depto-judicial','cp-sede-tribunal','cp-nombre','cp-dni','cp-nacionalidad','cp-ocupacion','cp-edad','cp-domicilio'];
    camposReq.forEach(id => container.querySelector(`#${id}`)?.classList.remove('error'));
    let ok = true;
    camposReq.forEach(id => {
      const el = container.querySelector(`#${id}`);
      if (el && !el.value.trim()) { el.classList.add('error'); ok = false; }
    });

    const demandadoRows = Array.from(wrapDemandados.querySelectorAll('[id^="cp-demandado-row-"]'));
    const demandados = demandadoRows.map(row => {
      const id = row.id.replace('cp-demandado-row-', '');
      const nombreEl = row.querySelector(`#cp-dem-nombre-${id}`);
      const domEl    = row.querySelector(`#cp-dem-domicilio-${id}`);
      nombreEl.classList.remove('error'); domEl.classList.remove('error');
      if (!nombreEl.value.trim()) { nombreEl.classList.add('error'); ok = false; }
      if (!domEl.value.trim())    { domEl.classList.add('error'); ok = false; }
      return { nombre: nombreEl.value.trim().toUpperCase(), domicilio: domEl.value.trim() };
    });

    if (!ok) return;

    const sexo   = container.querySelector('#cp-sexo').value;
    const tratamiento = sexo === 'F' ? 'la Sra.' : 'el Sr.';

    const ciudadActo   = container.querySelector('#cp-ciudad-acto').value.trim();
    const tribunalNro  = container.querySelector('#cp-tribunal-nro').value.trim();
    const deptoJudicial= container.querySelector('#cp-depto-judicial').value.trim();
    const sedeTribunal = container.querySelector('#cp-sede-tribunal').value.trim();
    const fecha        = fmtFechaActo(container.querySelector('#cp-fecha').value);

    const nombre       = container.querySelector('#cp-nombre').value.trim().toUpperCase();
    const dni          = container.querySelector('#cp-dni').value.trim();
    const nacionalidad = container.querySelector('#cp-nacionalidad').value.trim();
    const ocupacion    = container.querySelector('#cp-ocupacion').value.trim();
    const edad         = container.querySelector('#cp-edad').value.trim();
    const domicilio    = container.querySelector('#cp-domicilio').value.trim();

    const esDerechohabiente = chkDerechohabiente.checked;
    const vinculo  = container.querySelector('#cp-vinculo')?.value.trim();
    const causante = container.querySelector('#cp-causante')?.value.trim();
    const clausulaDerechohabiente = esDerechohabiente
      ? `, en su carácter de derechohabiente (${vinculo || '[VÍNCULO]'}) de ${(causante || '[CAUSANTE]').toUpperCase()}, trabajador/a fallecido/a,`
      : '';

    const caracter = container.querySelector('#cp-caracter').value === 'actor' ? 'actor' : 'demandado';
    let materia = selMateria.value;
    if (materia === 'OTRO (especificar)') {
      materia = (container.querySelector('#cp-materia-otro').value.trim() || '[MOTIVO]').toUpperCase();
    }

    const demandadosTexto = demandados.map((dd, i) => {
      let conector;
      if (i === 0) conector = '';
      else if (i === demandados.length - 1) conector = ', y contra ';
      else conector = ', contra ';
      return `${conector}${dd.nombre}, con domicilio en ${dd.domicilio}`;
    }).join('');

    const apoderados = container.querySelector('#cp-apoderados').value.trim();

    const texto = `CARTA PODER

En la Ciudad de ${ciudadActo}, a los ${fecha.dia} días del mes de ${fecha.mes} de ${fecha.anio}, comparece ante este Tribunal de Trabajo N° ${tribunalNro} del Departamento Judicial de ${deptoJudicial}, con sede en ${sedeTribunal}, ${tratamiento} ${nombre}, de nacionalidad ${nacionalidad}, ${ocupacion}, de ${edad} años de edad, con domicilio en ${domicilio}, quien justifica su identidad con D.N.I. ${dni}${clausulaDerechohabiente} y haciendo uso de la facultad que le confiere la ley provincial 15.057, otorga PODER ESPECIAL a favor de ${apoderados}, para que, en su nombre y representación intervenga, como ${caracter}, promueva y/o prosiga juicio por ${materia} contra ${demandadosTexto}. A tal efecto, ${FACULTADES_FIJAS} Con lo que terminó el acto, previa lectura y ratificación, la firma el compareciente por ante mí, que certifico.- Conste.-`;

    ultimoTextoGenerado = texto;
    textarea.value = texto;
    divRes.style.display = 'block';
    textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  btnLimp.addEventListener('click', () => {
    ['cp-ciudad-acto','cp-tribunal-nro','cp-depto-judicial','cp-sede-tribunal','cp-nombre','cp-dni','cp-edad','cp-domicilio','cp-vinculo','cp-causante','cp-materia-otro'].forEach(id => {
      const el = container.querySelector(`#${id}`);
      if (el) { el.value = ''; el.classList.remove('error'); }
    });
    container.querySelector('#cp-nacionalidad').value = 'argentina';
    container.querySelector('#cp-ocupacion').value = '';
    container.querySelector('#cp-fecha').value = '';
    container.querySelector('#cp-sexo').value = 'F';
    container.querySelector('#cp-caracter').value = 'actor';
    selMateria.value = MATERIAS[0];
    wrapMateriaOtro.style.display = 'none';
    chkDerechohabiente.checked = false;
    wrapVinculo.style.display = 'none';
    container.querySelector('#cp-apoderados').value = APODERADOS_DEFAULT;
    wrapDemandados.innerHTML = '';
    demandadosCount = 0;
    agregarDemandado();
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

  container.querySelector('#cp-pdf').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const html = `<div class="info-box" style="font-size:13px;line-height:1.9;white-space:pre-wrap">${texto.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
    exportarPDF('Carta Poder Laboral — Art. 28 Ley 15.057', html);
  });
}
