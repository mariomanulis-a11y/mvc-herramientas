// Generador de Documentación Requerida — MVC Abogados
// Checklist editable (tildando opciones) para informarle al cliente qué
// documentación debe presentar, según el tipo de trámite.
import { exportarPDF } from './exportar.js';

export function initDocumentacion(container) {

  // ── Configuración de trámites y su checklist ────────────────────────────────
  const TRAMITES = {
    sucesion_ab_intestato: {
      label: 'Sucesiones — Ab Intestato',
      items: [
        'Partida de defunción del causante (original o copia certificada)',
        'DNI del causante (copia)',
        'DNI de todos los herederos (copia)',
        'Partidas de nacimiento de los herederos (para acreditar el vínculo)',
        'Partida de matrimonio del causante, si corresponde (cónyuge supérstite)',
        'Partidas de defunción de herederos premuertos, si corresponde representación',
        'Títulos de propiedad de inmuebles del causante',
        'Cédula verde / título de automotores del causante',
        'Últimas boletas de ABL / impuesto inmobiliario de los inmuebles',
        'Constancia de CUIT / CUIL de cada heredero',
        'Certificado de inhibiciones y de bienes del causante (puede gestionarlo el estudio)',
        'Poder especial, en caso de que algún heredero no pueda firmar personalmente',
      ],
    },
    sucesion_testamentaria: {
      label: 'Sucesiones — Testamentaria',
      items: [
        'Testamento (original o copia certificada, y datos del escribano/registro)',
        'Partida de defunción del causante (original o copia certificada)',
        'DNI del causante (copia)',
        'DNI de los herederos y/o legatarios instituidos (copia)',
        'Partidas de nacimiento / matrimonio que acrediten vínculo, si corresponde',
        'Títulos de propiedad de inmuebles del causante',
        'Cédula verde / título de automotores del causante',
        'Últimas boletas de ABL / impuesto inmobiliario de los inmuebles',
        'Constancia de CUIT / CUIL de cada heredero o legatario',
        'Certificado de inhibiciones y de bienes del causante (puede gestionarlo el estudio)',
        'Poder especial, en caso de que algún heredero no pueda firmar personalmente',
      ],
    },
    laboral_demandada: {
      label: 'Laboral — Representación de la parte demandada (empleadora)',
      items: [
        'Copia de la demanda y cédula de notificación recibida',
        'Contrato de trabajo y recibos de sueldo del período reclamado',
        'Legajo completo del trabajador/a',
        'Libro de sueldos y jornales — Art. 52 LCT (fotocopia certificada de las hojas pertinentes)',
        'Telegramas y cartas documento cruzadas con el/la trabajador/a',
        'Constancia de inscripción ante AFIP y de la relación laboral',
        'Certificado de cobertura de ART vigente al momento del hecho (si hay reclamo por accidente/enfermedad)',
        'Estatuto social y últimas actas de designación de autoridades (si el cliente es persona jurídica)',
        'DNI del representante legal',
        'Carta poder / poder para pleitos a favor del estudio',
      ],
    },
    danios_consumidor: {
      label: 'Daños y Perjuicios — Derecho del Consumidor',
      items: [
        'DNI del reclamante',
        'Factura o comprobante de compra del producto/servicio',
        'Contrato o presupuesto del servicio contratado',
        'Reclamos previos realizados a la empresa (mail, notas, número de reclamo)',
        'Respuesta de la empresa al reclamo, si la hubo',
        'Constancia de reclamo ante COPREC / Defensa del Consumidor, si se inició',
        'Fotografías o videos del producto o servicio defectuoso',
        'Presupuestos de reparación, reposición o del daño reclamado',
      ],
    },
    danios_transito: {
      label: 'Daños y Perjuicios — Accidentes de Tránsito',
      items: [
        'DNI del damnificado',
        'Denuncia policial o exposición civil del hecho',
        'Licencia de conducir (copia)',
        'Cédula verde y póliza de seguro del vehículo propio',
        'Datos de la póliza de seguro de la contraparte, si se conocen',
        'Fotografías del lugar del hecho y de los vehículos involucrados',
        'Presupuestos de reparación del vehículo',
        'Certificados médicos, estudios y constancias de tratamiento, si hay lesiones',
        'Datos de contacto de testigos del hecho, si los hay',
      ],
    },
  };

  // ── HTML ─────────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Generador de Documentación Requerida</h2>
      <p class="tool-desc">Checklist editable para informarle al cliente qué documentación debe presentar</p>

      <div class="form-row">
        <div class="field-group" style="flex:1">
          <label for="dc-tramite">Tipo de trámite</label>
          <select id="dc-tramite">
            ${Object.entries(TRAMITES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
          </select>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group">
          <label for="dc-cliente">Cliente (opcional)</label>
          <input type="text" id="dc-cliente" placeholder="Nombre y apellido / razón social">
        </div>
        <div class="field-group">
          <label for="dc-referencia">Referencia del caso / carátula (opcional)</label>
          <input type="text" id="dc-referencia" placeholder="Ej: Sucesión de Pedro Gómez">
        </div>
      </div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">
        Documentación — tildá lo que corresponda solicitar en este caso
      </div>
      <div style="display:flex;gap:14px;margin-bottom:10px">
        <button type="button" class="btn btn-ghost" id="dc-marcar-todo" style="font-size:.8rem;padding:6px 14px">Marcar todo</button>
        <button type="button" class="btn btn-ghost" id="dc-desmarcar-todo" style="font-size:.8rem;padding:6px 14px">Desmarcar todo</button>
      </div>
      <div id="dc-checklist"></div>

      <div class="field-group" style="margin-top:14px">
        <label for="dc-extra">Documentación adicional para este caso (opcional — un ítem por línea)</label>
        <textarea id="dc-extra" rows="3" placeholder="Ej: Constancia de CBU para transferencia de fondos"></textarea>
      </div>

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:16px">
        <button class="btn btn-primary" id="dc-generar">Generar listado</button>
        <button class="btn btn-ghost"   id="dc-limpiar">Limpiar</button>
      </div>

      <div id="dc-resultado" style="display:none;margin-top:24px">
        <label for="dc-texto" style="font-weight:600;display:block;margin-bottom:6px">Texto generado (editable)</label>
        <textarea id="dc-texto" rows="14" style="width:100%;resize:vertical;font-family:inherit;font-size:.9rem;padding:12px;border:1px solid var(--color-border);border-radius:6px;background:#ffffff;color:#1a1a1a;line-height:1.6"></textarea>
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px">
          <button class="btn btn-success" id="dc-copiar">📋 Copiar texto</button>
          <button class="btn btn-ghost"   id="dc-pdf">📄 Exportar PDF</button>
          <button class="btn btn-ghost"   id="dc-reset-texto">Restablecer</button>
        </div>
      </div>

      <p style="margin-top:24px;font-size:.78rem;color:var(--color-muted);border-top:1px solid var(--color-border);padding-top:12px">
        Listado orientativo. La documentación efectivamente necesaria puede variar según las particularidades de cada caso.
      </p>
    </div>`;

  // ── Referencias ────────────────────────────────────────────────────────────
  const selTramite   = container.querySelector('#dc-tramite');
  const divChecklist = container.querySelector('#dc-checklist');
  const taExtra       = container.querySelector('#dc-extra');
  const divRes        = container.querySelector('#dc-resultado');
  const textarea       = container.querySelector('#dc-texto');
  const btnGen         = container.querySelector('#dc-generar');
  const btnLimp        = container.querySelector('#dc-limpiar');
  const btnCop         = container.querySelector('#dc-copiar');
  const btnReset       = container.querySelector('#dc-reset-texto');
  const btnMarcarTodo   = container.querySelector('#dc-marcar-todo');
  const btnDesmarcarTodo = container.querySelector('#dc-desmarcar-todo');

  let ultimoTextoGenerado = '';

  function renderChecklist() {
    const tramite = TRAMITES[selTramite.value];
    divChecklist.innerHTML = tramite.items.map((texto, i) => `
      <div class="check-row">
        <input type="checkbox" id="dc-item-${i}" checked>
        <label for="dc-item-${i}">${texto}</label>
      </div>`).join('');
  }

  selTramite.addEventListener('change', renderChecklist);
  renderChecklist();

  btnMarcarTodo.addEventListener('click', () => {
    divChecklist.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = true);
  });
  btnDesmarcarTodo.addEventListener('click', () => {
    divChecklist.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);
  });

  // ── Generar ──────────────────────────────────────────────────────────────────
  btnGen.addEventListener('click', () => {
    const tramite = TRAMITES[selTramite.value];
    const cliente = container.querySelector('#dc-cliente').value.trim();
    const referencia = container.querySelector('#dc-referencia').value.trim();

    const seleccionados = tramite.items.filter((_, i) =>
      container.querySelector(`#dc-item-${i}`)?.checked);

    const extra = taExtra.value.split('\n').map(l => l.trim()).filter(Boolean);

    const todos = [...seleccionados, ...extra];

    if (todos.length === 0) {
      alert('Tildá al menos un ítem o cargá documentación adicional antes de generar el listado.');
      return;
    }

    const saludo = cliente ? `Estimado/a ${cliente}:` : 'Estimado/a:';

    const lineas = [
      saludo,
      '',
      `Para avanzar con su trámite${referencia ? ` (${referencia})` : ''} — ${tramite.label} —, le solicitamos nos envíe la siguiente documentación:`,
      '',
      ...todos.map((t, i) => `${i + 1}. ${t}`),
      '',
      'Ante cualquier consulta, quedamos a disposición.',
      '',
      'MVC Abogados',
    ];

    const texto = lineas.join('\n');
    ultimoTextoGenerado = texto;
    textarea.value = texto;
    divRes.style.display = 'block';
    textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    textarea.dataset.tramiteLabel = tramite.label;
    textarea.dataset.cliente = cliente;
    textarea.dataset.referencia = referencia;
    textarea.dataset.items = JSON.stringify(todos);
  });

  btnLimp.addEventListener('click', () => {
    container.querySelector('#dc-cliente').value = '';
    container.querySelector('#dc-referencia').value = '';
    taExtra.value = '';
    renderChecklist();
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
    }).catch(() => { prompt('Copie el texto:', texto); });
  });

  btnReset.addEventListener('click', () => {
    if (ultimoTextoGenerado) textarea.value = ultimoTextoGenerado;
  });

  container.querySelector('#dc-pdf').addEventListener('click', () => {
    if (!ultimoTextoGenerado) return;
    const items = JSON.parse(textarea.dataset.items || '[]');
    const cliente = textarea.dataset.cliente;
    const referencia = textarea.dataset.referencia;

    const html = `
      ${cliente || referencia ? `<div class="info-box">
        ${cliente ? `<strong>Cliente:</strong> ${esc(cliente)}<br>` : ''}
        ${referencia ? `<strong>Referencia:</strong> ${esc(referencia)}` : ''}
      </div>` : ''}
      <div class="info-box">
        Para avanzar con su trámite — <strong>${esc(textarea.dataset.tramiteLabel)}</strong> — le solicitamos nos envíe la siguiente documentación:
      </div>
      <table>
        <thead><tr><th style="width:36px">#</th><th>Documentación requerida</th></tr></thead>
        <tbody>
          ${items.map((t, i) => `<tr><td>${i + 1}</td><td>${esc(t)}</td></tr>`).join('')}
        </tbody>
      </table>
      <p class="nota">Ante cualquier consulta, quedamos a disposición.</p>
    `;
    exportarPDF(`Documentación requerida — ${textarea.dataset.tramiteLabel}`, html);
  });

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
