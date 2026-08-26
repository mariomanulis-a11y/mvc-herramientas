// Generador de Convenios de Honorarios — Provincia de Buenos Aires
// Base normativa: Ley 14.967 (honorarios de abogados y procuradores, PBA), sancionada 31/8/2017,
// que deroga el Decreto-Ley 8904/77. Arts. 3, 4, 5, 6, 7, 18, 54 y 58.
// Modelo de convenio alineado al formato utilizado actualmente por el Estudio MVC Abogados.
import { exportarPDF, exportarWord } from './exportar.js';

export function initConvenioHonorarios(container) {

  // ── Datos preestablecidos del Estudio (editables por si cambia la composición) ──
  const EMAIL_ESTUDIO = 'mvcabogadospilar@gmail.com';
  const ABOGADOS = [
    { id: 'manulis',    nombre: 'Mario Martín Manulis',       domicilioElectronico: '20271887931@notificaciones.scba.gov.ar', celular: '1153107794', matricula: 'T° 34 F° 69 CASI' },
    { id: 'velazquez',  nombre: 'Soledad Celeste Velazquez',  domicilioElectronico: '27273872286@notificaciones.scba.gov.ar', celular: '1155781501', matricula: 'T° 36 F° 125 CASI' },
    { id: 'curbelo',    nombre: 'Yanina Daniela Curbelo',     domicilioElectronico: '27268952867@notificaciones.scba.gov.ar', celular: '1149272774', matricula: 'T° 36 F° 90 CASI' },
    { id: 'poggi',      nombre: 'Camila Susana Poggi',        domicilioElectronico: '27388231705@notificaciones.scba.gov.ar', celular: '1138224662', matricula: 'T° 55 F° 255 CASI' },
  ];
  const ABOGADOS_BY_ID = Object.fromEntries(ABOGADOS.map(a => [a.id, a]));

  const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  const MATERIAS = [
    { value: 'general',      label: 'General (civil, comercial, contencioso-administrativo, etc.)', tope: 1/3, topeLabel: '33,33% (1/3)', art: 'art. 4, primer párrafo, Ley 14.967' },
    { value: 'previsional',  label: 'Previsional (jubilaciones y pensiones)',                        tope: 0.20, topeLabel: '20%', art: 'art. 3, penúltimo párrafo, Ley 14.967' },
    { value: 'laboral',      label: 'Laboral',                                                        tope: 0.20, topeLabel: '20%', art: 'art. 3, penúltimo párrafo, Ley 14.967' },
    { value: 'alimentario',  label: 'Alimentario (cuota alimentaria / derecho de familia)',           tope: 0.20, topeLabel: '20%', art: 'art. 3, penúltimo párrafo, Ley 14.967' },
  ];

  const MODALIDADES = [
    { value: 'monto_fijo',  label: 'Monto fijo y determinado' },
    { value: 'porcentaje',  label: 'Porcentaje sobre el resultado obtenido (pacto ordinario)' },
    { value: 'cuota_litis', label: 'Pacto de cuota litis (el/la profesional asume el riesgo y afronta los gastos y costas del proceso)' },
  ];

  // ── HTML ───────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Generador de Convenios de Honorarios</h2>
      <p class="tool-desc">Ley 14.967 (PBA) — Convenio de honorarios profesionales entre el/la profesional y el/la cliente. Modelo del Estudio.</p>

      <div class="info-box-inline" style="background:#fff8e1;border:1px solid #e0c88a;border-radius:6px;padding:10px 14px;margin-bottom:18px;font-size:.82rem;line-height:1.6;color:#5a4a1a">
        Los honorarios convenidos libremente (art. 3, Ley 14.967) están sujetos a topes legales según la modalidad y la materia: <strong>1/3 (33,33%)</strong> en pactos ordinarios (art. 4, 1° párr.), <strong>50%</strong> en pacto de cuota litis (art. 4, 3° párr.), y <strong>20%</strong> en asuntos previsionales, laborales o alimentarios <em>cualquiera sea la modalidad pactada</em> (art. 3, penúltimo párr.). El convenio es nulo si no lo suscribe un/a profesional matriculado/a en ejercicio, o si el honorario se fija en función del tiempo de duración del asunto, salvo trabajos extrajudiciales (art. 5). Para su plena eficacia y ejecutoriedad debe otorgarse por duplicado y registrarse dentro de los 15 días ante el Colegio de Abogados del Departamento Judicial (art. 18).
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Profesional/es interviniente/s</div>
      <div class="form-row" id="ch-abogados-wrapper" style="flex-wrap:wrap;gap:14px">
        ${ABOGADOS.map(a => `
          <label style="display:flex;align-items:center;gap:6px;font-weight:400;flex:1 1 220px">
            <input type="checkbox" class="ch-abogado-check" value="${a.id}"> ${a.nombre} (${a.matricula})
          </label>`).join('')}
      </div>
      <p style="font-size:.78rem;color:var(--color-muted);margin:2px 0 0">Seleccioná uno o más profesionales — pueden figurar en forma separada (individual) o conjunta en el mismo convenio.</p>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos del/de la cliente</div>
      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="ch-sexo">Tratamiento</label>
          <select id="ch-sexo">
            <option value="F">la Sra.</option>
            <option value="M">el Sr.</option>
          </select>
        </div>
        <div class="field-group" style="flex:2">
          <label for="ch-cliente-nombre">Nombre completo / razón social</label>
          <input type="text" id="ch-cliente-nombre" placeholder="Telma Elizabeth Ocampos">
        </div>
        <div class="field-group" style="flex:1">
          <label for="ch-cliente-dni">DNI / CUIT</label>
          <input type="text" id="ch-cliente-dni" placeholder="24.006.527">
        </div>
      </div>
      <div class="form-row">
        <div class="field-group" style="flex:2">
          <label for="ch-cliente-domicilio">Domicilio real</label>
          <input type="text" id="ch-cliente-domicilio" placeholder="calle Washington N° 1169, de la localidad de Pilar, Partido Del Pilar (B)">
        </div>
        <div class="field-group" style="flex:1">
          <label for="ch-cliente-email">Email de contacto (opcional)</label>
          <input type="email" id="ch-cliente-email" placeholder="cliente@email.com">
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Objeto de la gestión</div>
      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="ch-objeto">Descripción del asunto / gestión encomendada</label>
          <textarea id="ch-objeto" rows="2" placeholder="Reclamo por despido incausado contra Comercial XYZ S.A. — juicio laboral ante los Tribunales del Trabajo del Departamento Judicial de San Isidro"></textarea>
        </div>
      </div>
      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="ch-materia">Materia del asunto</label>
          <select id="ch-materia">
            ${MATERIAS.map(m => `<option value="${m.value}">${m.label}</option>`).join('')}
          </select>
        </div>
        <div class="field-group" style="flex:1">
          <label for="ch-depto-judicial">Departamento Judicial competente</label>
          <input type="text" id="ch-depto-judicial" placeholder="San Isidro">
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Modalidad de honorarios</div>
      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="ch-modalidad">Modalidad pactada</label>
          <select id="ch-modalidad">
            ${MODALIDADES.map(m => `<option value="${m.value}">${m.label}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row" id="ch-wrap-monto" style="display:none">
        <div class="field-group" style="flex:1">
          <label for="ch-monto-fijo">Monto fijo pactado ($)</label>
          <input type="number" id="ch-monto-fijo" min="0" step="0.01" placeholder="500000">
        </div>
      </div>
      <div class="form-row" id="ch-wrap-porcentaje" style="display:none">
        <div class="field-group" style="flex:1">
          <label for="ch-porcentaje">Porcentaje pactado (%)</label>
          <input type="number" id="ch-porcentaje" min="0" step="0.01" placeholder="30">
        </div>
        <div class="field-group" style="flex:2">
          <p id="ch-tope-info" style="font-size:.82rem;margin:0;padding-top:22px;color:var(--color-muted)"></p>
        </div>
      </div>
      <div id="ch-alerta-tope" style="display:none;background:#fdecea;border:1px solid #e0a89e;border-radius:6px;padding:10px 14px;margin:4px 0 12px;font-size:.82rem;line-height:1.6;color:#7a2e22">
        ⚠ El porcentaje pactado <strong id="ch-alerta-tope-val"></strong> supera el tope legal aplicable. El convenio igualmente puede otorgarse, pero el excedente sobre el tope resulta inoponible y no será exigible ni regulable judicialmente (arts. 3 y 4, Ley 14.967). Se recomienda ajustar el porcentaje o advertir expresamente al/a la cliente antes de la firma.
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Forma y plazo de pago</div>
      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="ch-forma-pago">Forma de pago</label>
          <select id="ch-forma-pago">
            <option value="contado">Al contado, en un solo pago</option>
            <option value="cuotas">En cuotas</option>
          </select>
        </div>
        <div class="field-group" id="ch-wrap-cuotas" style="flex:1;display:none">
          <label for="ch-cant-cuotas">Cantidad de cuotas</label>
          <input type="number" id="ch-cant-cuotas" min="2" step="1" placeholder="3">
        </div>
        <div class="field-group" style="flex:1">
          <label for="ch-anticipo">Anticipo a cuenta ($, opcional)</label>
          <input type="number" id="ch-anticipo" min="0" step="0.01" placeholder="0">
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Lugar y fecha del acto</div>
      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="ch-ciudad-acto">Ciudad</label>
          <input type="text" id="ch-ciudad-acto" placeholder="Pilar">
        </div>
        <div class="field-group" style="flex:1">
          <label for="ch-fecha">Fecha</label>
          <input type="date" id="ch-fecha">
        </div>
      </div>

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:8px">
        <button class="btn btn-primary" id="ch-generar">Generar convenio</button>
        <button class="btn btn-ghost"   id="ch-limpiar">Limpiar</button>
      </div>

      <div id="ch-resultado" style="display:none;margin-top:24px">
        <label for="ch-texto" style="font-weight:600;display:block;margin-bottom:6px">Texto generado (editable)</label>
        <textarea id="ch-texto" rows="28" style="width:100%;resize:vertical;font-family:inherit;font-size:.9rem;padding:12px;border:1px solid var(--color-border);border-radius:6px;background:#ffffff;color:#1a1a1a;line-height:1.6"></textarea>
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px">
          <button class="btn btn-success" id="ch-copiar">📋 Copiar texto</button>
          <button class="btn btn-ghost"   id="ch-pdf">📄 Exportar PDF</button>
          <button class="btn btn-ghost"   id="ch-word">📝 Exportar Word</button>
          <button class="btn btn-ghost"   id="ch-reset-texto">Restablecer</button>
        </div>
      </div>

      <p style="margin-top:24px;font-size:.78rem;color:var(--color-muted);border-top:1px solid var(--color-border);padding-top:12px">
        Texto orientativo, a adaptar al caso concreto. No constituye asesoramiento legal. Recordar otorgar el convenio por duplicado y registrarlo dentro de los 15 días ante el Colegio de Abogados del Departamento Judicial (art. 18, Ley 14.967).
      </p>
    </div>`;

  // ── Referencias ────────────────────────────────────────────────────────────
  const chkAbogados    = Array.from(container.querySelectorAll('.ch-abogado-check'));
  const selMateria      = container.querySelector('#ch-materia');
  const selModalidad    = container.querySelector('#ch-modalidad');
  const wrapMonto       = container.querySelector('#ch-wrap-monto');
  const wrapPorcentaje  = container.querySelector('#ch-wrap-porcentaje');
  const inpPorcentaje   = container.querySelector('#ch-porcentaje');
  const topeInfo        = container.querySelector('#ch-tope-info');
  const alertaTope      = container.querySelector('#ch-alerta-tope');
  const alertaTopeVal   = container.querySelector('#ch-alerta-tope-val');
  const selFormaPago    = container.querySelector('#ch-forma-pago');
  const wrapCuotas      = container.querySelector('#ch-wrap-cuotas');
  const divRes          = container.querySelector('#ch-resultado');
  const textarea        = container.querySelector('#ch-texto');
  const btnGen          = container.querySelector('#ch-generar');
  const btnLimp         = container.querySelector('#ch-limpiar');
  const btnCop          = container.querySelector('#ch-copiar');
  const btnReset        = container.querySelector('#ch-reset-texto');

  let ultimoTextoGenerado = '';

  function materiaActual() {
    return MATERIAS.find(m => m.value === selMateria.value) || MATERIAS[0];
  }

  function actualizarTope() {
    const materia = materiaActual();
    let tope, topeLabel, art;
    if (selModalidad.value === 'cuota_litis' && materia.value === 'general') {
      tope = 0.50; topeLabel = '50%'; art = 'art. 4, tercer párrafo, Ley 14.967 (pacto de cuota litis)';
    } else {
      tope = materia.tope; topeLabel = materia.topeLabel; art = materia.art;
    }
    topeInfo.textContent = `Tope legal aplicable: ${topeLabel} (${art}).`;

    const pactado = parseFloat(inpPorcentaje.value);
    if (selModalidad.value !== 'monto_fijo' && !isNaN(pactado) && pactado > tope * 100 + 0.001) {
      alertaTope.style.display = 'block';
      alertaTopeVal.textContent = `(${pactado}%)`;
    } else {
      alertaTope.style.display = 'none';
    }
    return { tope, topeLabel, art };
  }

  selMateria.addEventListener('change', actualizarTope);
  inpPorcentaje.addEventListener('input', actualizarTope);

  selModalidad.addEventListener('change', () => {
    const v = selModalidad.value;
    wrapMonto.style.display = v === 'monto_fijo' ? 'flex' : 'none';
    wrapPorcentaje.style.display = (v === 'porcentaje' || v === 'cuota_litis') ? 'flex' : 'none';
    if (v === 'monto_fijo') alertaTope.style.display = 'none';
    else actualizarTope();
  });

  selFormaPago.addEventListener('change', () => {
    wrapCuotas.style.display = selFormaPago.value === 'cuotas' ? 'flex' : 'none';
  });

  actualizarTope();

  function fmtFecha(iso) {
    if (!iso) return { dia: '[DÍA]', mes: '[MES]', anio: '[AÑO]' };
    const [y, m, d] = iso.split('-');
    return { dia: String(parseInt(d, 10)), mes: MESES[parseInt(m, 10) - 1], anio: y };
  }

  function fmtMoneda(n) {
    const num = parseFloat(n);
    if (isNaN(num)) return '$ 0,00';
    return '$ ' + num.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function listarProfesionales(seleccionados) {
    return seleccionados.map((a, i, arr) => {
      let conector = '';
      if (i > 0 && i === arr.length - 1) conector = arr.length > 2 ? ', y ' : ' y ';
      else if (i > 0) conector = ', ';
      return `${conector}Dr./Dra. ${a.nombre} (${a.matricula})`;
    }).join('');
  }

  // ── Generar ────────────────────────────────────────────────────────────────
  btnGen.addEventListener('click', () => {
    const camposReq = ['ch-cliente-nombre','ch-cliente-dni','ch-cliente-domicilio','ch-objeto','ch-depto-judicial','ch-ciudad-acto'];
    camposReq.forEach(id => container.querySelector(`#${id}`)?.classList.remove('error'));
    let ok = true;
    camposReq.forEach(id => {
      const el = container.querySelector(`#${id}`);
      if (el && !el.value.trim()) { el.classList.add('error'); ok = false; }
    });

    const seleccionadosIds = chkAbogados.filter(c => c.checked).map(c => c.value);
    if (seleccionadosIds.length === 0) {
      alert('Seleccioná al menos un/a profesional interviniente.');
      ok = false;
    }
    if (selModalidad.value !== 'monto_fijo' && !inpPorcentaje.value.trim()) {
      inpPorcentaje.classList.add('error'); ok = false;
    } else {
      inpPorcentaje.classList.remove('error');
    }
    if (selModalidad.value === 'monto_fijo') {
      const montoEl = container.querySelector('#ch-monto-fijo');
      if (!montoEl.value.trim()) { montoEl.classList.add('error'); ok = false; }
      else montoEl.classList.remove('error');
    }

    if (!ok) return;

    const seleccionados = seleccionadosIds.map(id => ABOGADOS_BY_ID[id]);
    const profesionalesTexto = listarProfesionales(seleccionados);
    const profesionalesSujeto = seleccionados.length > 1 ? 'los/las profesionales' : 'el/la profesional';
    const profesionalesPosesivo = seleccionados.length > 1 ? 'su parte' : 'su parte';

    const tratamiento = container.querySelector('#ch-sexo').value === 'F' ? 'la Sra.' : 'el Sr.';
    const clienteNombre = container.querySelector('#ch-cliente-nombre').value.trim().toUpperCase();
    const clienteDni    = container.querySelector('#ch-cliente-dni').value.trim();
    const clienteDom    = container.querySelector('#ch-cliente-domicilio').value.trim();
    const clienteEmail  = container.querySelector('#ch-cliente-email').value.trim();

    const objeto  = container.querySelector('#ch-objeto').value.trim();
    const materia = materiaActual();
    const deptoJudicial = container.querySelector('#ch-depto-judicial').value.trim();

    const { tope, topeLabel, art: artTope } = actualizarTope();
    const modalidad = selModalidad.value;

    let clausulaSegunda;
    if (modalidad === 'monto_fijo') {
      const monto = container.querySelector('#ch-monto-fijo').value.trim();
      clausulaSegunda = `Como retribución por la gestión profesional descripta en la cláusula PRIMERA, ${profesionalesSujeto} percibirá/n de ${tratamiento} ${clienteNombre} la suma fija y determinada de ${fmtMoneda(monto)} (pesos), conforme lo autoriza el art. 3, Ley 14.967, en su carácter de honorario libremente convenido.`;
    } else if (modalidad === 'porcentaje') {
      const pct = container.querySelector('#ch-porcentaje').value.trim();
      clausulaSegunda = `Como retribución por la gestión profesional descripta en la cláusula PRIMERA, ${profesionalesSujeto} percibirá/n en concepto de honorarios el ${pct}% (por ciento) de toda suma de dinero, bien o valor que ${tratamiento} ${clienteNombre} obtenga como resultado del asunto encomendado, ya sea por sentencia, transacción, conciliación o cualquier otro modo de conclusión del proceso, conforme lo autoriza el art. 3, Ley 14.967. Las partes dejan constancia de que el tope legal aplicable a la presente modalidad y materia es del ${topeLabel} (${artTope}), y que el excedente sobre dicho tope, de existir, resulta inoponible y no será exigible ni regulable judicialmente.`;
    } else {
      const pct = container.querySelector('#ch-porcentaje').value.trim();
      clausulaSegunda = `Las partes celebran el presente en carácter de PACTO DE CUOTA LITIS, por el cual ${profesionalesSujeto} asumirá/n el riesgo del proceso, afrontando los gastos y costas de su tramitación, y percibirá/n como única retribución el ${pct}% (por ciento) de toda suma de dinero, bien o valor que ${tratamiento} ${clienteNombre} obtenga como resultado del asunto encomendado, conforme lo autoriza el art. 4, tercer párrafo, Ley 14.967. Las partes dejan constancia de que el tope legal aplicable a la presente modalidad y materia es del ${topeLabel} (${artTope}), y que el excedente sobre dicho tope, de existir, resulta inoponible y no será exigible ni regulable judicialmente.`;
    }

    const formaPago = selFormaPago.value;
    const anticipo = parseFloat(container.querySelector('#ch-anticipo').value) || 0;
    let clausulaPago;
    if (formaPago === 'contado') {
      clausulaPago = `El honorario pactado en la cláusula SEGUNDA será abonado al contado, en un solo pago, dentro de los diez (10) días corridos de producido el hecho generador del derecho a su percepción (sentencia firme, transacción, conciliación, pago o cualquier otro modo de conclusión del asunto).`;
    } else {
      const cuotas = container.querySelector('#ch-cant-cuotas').value.trim() || '[N°]';
      clausulaPago = `El honorario pactado en la cláusula SEGUNDA será abonado en ${cuotas} (${cuotas}) cuotas iguales, mensuales y consecutivas, cuyo vencimiento comenzará a correr dentro de los diez (10) días corridos de producido el hecho generador del derecho a su percepción (sentencia firme, transacción, conciliación, pago o cualquier otro modo de conclusión del asunto).`;
    }
    const clausulaAnticipo = anticipo > 0
      ? ` ${tratamiento} ${clienteNombre} abona en este acto, en concepto de anticipo a cuenta de honorarios, la suma de ${fmtMoneda(anticipo)}, que ${profesionalesSujeto} recibe/n de conformidad y que será deducida del monto total adeudado.`
      : '';

    const fecha = fmtFecha(container.querySelector('#ch-fecha').value);
    const ciudadActo = container.querySelector('#ch-ciudad-acto').value.trim();

    const domicilioProfesionales = seleccionados.map(a => `domicilio electrónico ${a.domicilioElectronico}`).join(' y ');
    const emailClienteTexto = clienteEmail ? `, con domicilio electrónico de contacto en ${clienteEmail}` : '';

    const texto = `CONVENIO DE HONORARIOS PROFESIONALES
(Ley 14.967 — Provincia de Buenos Aires)

En la ciudad de ${ciudadActo}, a los ${fecha.dia} días del mes de ${fecha.mes} de ${fecha.anio}, entre ${profesionalesTexto}, en adelante "EL/LA PROFESIONAL", por una parte; y ${tratamiento} ${clienteNombre}, DNI ${clienteDni}, con domicilio real en ${clienteDom}${emailClienteTexto}, en adelante "EL/LA CLIENTE", por la otra; convienen en celebrar el presente CONVENIO DE HONORARIOS, sujeto a las siguientes cláusulas:

PRIMERA — OBJETO: EL/LA CLIENTE encomienda a EL/LA PROFESIONAL, quien acepta, el patrocinio y/o representación letrada en el siguiente asunto: ${objeto}. La materia del asunto se encuadra, a los fines de la Ley 14.967, como: ${materia.label}${deptoJudicial ? `, a tramitar ante los tribunales del Departamento Judicial de ${deptoJudicial}` : ''}.

SEGUNDA — HONORARIO BÁSICO: ${clausulaSegunda}

TERCERA — HONORARIOS A CARGO DE LA CONTRARIA: Los honorarios que resulten regulados judicialmente a cargo de la parte contraria, en caso de imposición de costas, son de exclusiva propiedad de EL/LA PROFESIONAL, quien podrá exigir su pago y ejecución directamente contra el obligado al pago, sin perjuicio del honorario convenido en la cláusula SEGUNDA, el cual subsiste en la medida en que no haya sido íntegramente cubierto por lo percibido de la contraria (art. 58, Ley 14.967).

CUARTA — REVOCACIÓN DEL MANDATO: La revocación del mandato y/o patrocinio no anula el presente convenio, el cual conserva plena vigencia, salvo que medie culpa de EL/LA PROFESIONAL judicialmente declarada. EL/LA CLIENTE solo podrá revocar el mandato mediando justa causa (art. 6, Ley 14.967).

QUINTA — RENUNCIA DEL PROFESIONAL: La renuncia de EL/LA PROFESIONAL sin justa causa anula el presente convenio de pleno derecho, sin perjuicio de su derecho a percibir honorarios por la tarea efectivamente cumplida hasta ese momento, regulados judicialmente conforme las pautas legales. Asimismo, el convenio se anula si EL/LA PROFESIONAL solicitara la regulación judicial anticipada de sus honorarios fuera de los supuestos legalmente previstos.

SEXTA — FUERZA MAYOR E IMPOSIBILIDAD SOBREVINIENTE: En caso de fuerza mayor o imposibilidad sobreviniente que impida la conclusión del asunto encomendado, EL/LA PROFESIONAL tendrá derecho a percibir honorarios proporcionales a la tarea efectivamente cumplida, a determinarse conforme las pautas y escalas de los arts. 21 a 53, Ley 14.967, según el tipo de proceso y la etapa procesal alcanzada.

SÉPTIMA — MORA Y TÍTULO EJECUTIVO: ${clausulaPago}${clausulaAnticipo} En caso de mora en el pago, EL/LA PROFESIONAL podrá optar, a su exclusivo criterio, por reclamar (a) el monto pactado expresado en Jus arancelarios más un interés del 12% (doce por ciento) anual, o (b) el monto regulado judicialmente convertido a moneda de curso legal más los intereses previstos en el art. 552 del Código Civil y Comercial de la Nación (art. 54, Ley 14.967). El presente convenio, una vez registrado conforme la cláusula OCTAVA, constituye título ejecutivo hábil para su cobro y no requiere de mediación previa obligatoria (art. 58, Ley 14.967).

OCTAVA — REGISTRO: El presente convenio se otorga en dos (2) ejemplares de un mismo tenor y a un solo efecto. Las partes se obligan a registrarlo dentro de los quince (15) días de su firma ante el Colegio de Abogados del Departamento Judicial de ${deptoJudicial || '[DEPARTAMENTO JUDICIAL]'}, como condición de su plena eficacia y ejecutoriedad (art. 18, Ley 14.967).

NOVENA — DOMICILIOS Y JURISDICCIÓN: A todos los efectos legales derivados del presente, las partes constituyen domicilio: EL/LA PROFESIONAL en ${domicilioProfesionales || '[DOMICILIO ELECTRÓNICO]'}, y EL/LA CLIENTE en el domicilio real denunciado en el encabezamiento${emailClienteTexto ? ' y en el domicilio electrónico allí indicado' : ''}, sometiéndose para cualquier controversia derivada del presente a la competencia de los tribunales ordinarios del Departamento Judicial de ${deptoJudicial || '[DEPARTAMENTO JUDICIAL]'}, con renuncia a cualquier otro fuero o jurisdicción que pudiera corresponder.

En prueba de conformidad, se firman dos (2) ejemplares de un mismo tenor y a un solo efecto, en el lugar y fecha indicados en el encabezamiento.-`;

    ultimoTextoGenerado = texto;
    textarea.value = texto;
    divRes.style.display = 'block';
    textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  btnLimp.addEventListener('click', () => {
    chkAbogados.forEach(c => { c.checked = false; });
    ['ch-cliente-nombre','ch-cliente-dni','ch-cliente-domicilio','ch-cliente-email','ch-objeto','ch-depto-judicial','ch-ciudad-acto','ch-monto-fijo','ch-porcentaje','ch-cant-cuotas','ch-anticipo'].forEach(id => {
      const el = container.querySelector(`#${id}`);
      if (el) { el.value = ''; el.classList.remove('error'); }
    });
    container.querySelector('#ch-sexo').value = 'F';
    selMateria.value = 'general';
    selModalidad.value = 'monto_fijo';
    wrapMonto.style.display = 'flex';
    wrapPorcentaje.style.display = 'none';
    alertaTope.style.display = 'none';
    selFormaPago.value = 'contado';
    wrapCuotas.style.display = 'none';
    container.querySelector('#ch-fecha').value = '';
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

  container.querySelector('#ch-pdf').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const html = `<div class="info-box" style="font-size:13px;line-height:1.9;white-space:pre-wrap">${texto.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
    exportarPDF('Convenio de Honorarios — Ley 14.967', html);
  });

  container.querySelector('#ch-word').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const clienteNombre = container.querySelector('#ch-cliente-nombre').value.trim() || 'cliente';
    const parrafos = texto.split('\n').map(l => `<p>${l.replace(/</g, '&lt;').replace(/>/g, '&gt;') || '&nbsp;'}</p>`).join('\n');
    exportarWord(`Convenio de Honorarios - ${clienteNombre}`, parrafos);
  });
}
