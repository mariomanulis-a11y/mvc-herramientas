// Generador de Carta Documento / Telegrama Laboral
import { exportarPDF, exportarCSV } from './exportar.js';

export function initCartaDocumento(container) {

  // ── Plantillas ─────────────────────────────────────────────────────────────
  const PLANTILLAS = {
    intim_registro: {
      label: 'Intimación registro laboral (Arts. 7-11 Ley 24.013)',
      requiere: ['nombre','dni','domicilio','razon_social','cuit','dom_empleador','fecha_ingreso'],
      opcionales: ['remuneracion'],
      generar: (d) => `Por medio de la presente, yo ${d.nombre}, DNI ${d.dni}, con domicilio en ${d.domicilio}, en mi carácter de trabajador/a en relación de dependencia de ${d.razon_social}, CUIT ${d.cuit}, con domicilio en ${d.dom_empleador}, intimo a Ud. en los términos del art. 11 de la ley 24.013 y art. 47 del dec. 1043/2001 para que en el plazo de TREINTA (30) días hábiles proceda a: 1) Registrar debidamente la relación laboral que me une a su empresa desde el día ${d.fecha_ingreso}; 2) Consignar mi remuneración real de ${d.remuneracion ? '$ ' + d.remuneracion + ' mensuales' : '[REMUNERACIÓN A COMPLETAR]'}. Bajo apercibimiento de las multas previstas en los arts. 8, 9 y 10 de la ley 24.013. Reservo acciones. Hago extensiva la presente notificación a la AFIP conforme art. 47 del decreto mencionado.`,
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
      generar: (d) => `Intimo a Ud. en los términos del art. 80 LCT y decreto 146/2001 para que en el plazo de TREINTA (30) días corridos me haga entrega del certificado de trabajo, certificado de servicios y aportes, y constancia de extinción de la relación laboral, bajo apercibimiento de reclamar la indemnización prevista en el art. 80 in fine LCT (equivalente a 3 meses de remuneración).`,
    },
    ley25323: {
      label: 'Intimación fehaciente Ley 25.323',
      requiere: ['razon_social','fecha_hecho'],
      opcionales: [],
      generar: (d) => `En los términos del art. 2 de la ley 25.323, intimo a Ud. para que en el plazo de veinticuatro (24) horas abone las indemnizaciones por despido previstas en los arts. 232, 233 y 245 de la LCT que se encuentran impagas desde el ${d.fecha_hecho}, bajo apercibimiento del recargo del CINCUENTA POR CIENTO (50%) sobre dichos conceptos.`,
    },
  };

  // ── Campos ─────────────────────────────────────────────────────────────────
  // id, label, placeholder, tipo (text|date|textarea), opcional
  const CAMPOS_CONFIG = [
    // Remitente
    { id: 'nombre',         label: 'Nombre completo (trabajador/a)',  placeholder: 'Juan García',          tipo: 'text',  grupo: 'remitente' },
    { id: 'dni',            label: 'DNI',                             placeholder: '12.345.678',            tipo: 'text',  grupo: 'remitente' },
    { id: 'domicilio',      label: 'Domicilio (trabajador/a)',        placeholder: 'Av. Corrientes 1234, Buenos Aires', tipo: 'text', grupo: 'remitente' },
    // Destinatario
    { id: 'razon_social',   label: 'Razón social / Nombre (empleador)', placeholder: 'Empresa S.A.',       tipo: 'text',  grupo: 'destinatario' },
    { id: 'cuit',           label: 'CUIT',                            placeholder: '30-12345678-9',         tipo: 'text',  grupo: 'destinatario' },
    { id: 'dom_empleador',  label: 'Domicilio (empleador)',           placeholder: 'Calle Falsa 123, CABA', tipo: 'text',  grupo: 'destinatario' },
    // Datos laborales
    { id: 'fecha_ingreso',  label: 'Fecha de ingreso',               placeholder: '',                      tipo: 'date',  grupo: 'laboral' },
    { id: 'categoria',      label: 'Categoría / puesto (opcional)',  placeholder: 'Operario especializado', tipo: 'text',  grupo: 'laboral', opcional: true },
    { id: 'remuneracion',   label: 'Remuneración mensual (opcional)', placeholder: '250000',                tipo: 'number', grupo: 'laboral', opcional: true },
    { id: 'fecha_hecho',    label: 'Fecha del hecho relevante',      placeholder: '',                      tipo: 'date',  grupo: 'laboral' },
    { id: 'mes_anio',       label: 'Mes/Año de haberes (opcional)',  placeholder: 'marzo 2025',             tipo: 'text',  grupo: 'laboral', opcional: true },
    { id: 'incumplimiento', label: 'Descripción del incumplimiento (opcional)', placeholder: 'la falta de pago de haberes correspondientes al mes…', tipo: 'text', grupo: 'laboral', opcional: true },
  ];

  // ── HTML ───────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Generador de Carta Documento / Telegrama Laboral</h2>
      <p class="tool-desc">Intimaciones laborales frecuentes — LCT · Ley 24.013 · Ley 25.323</p>

      <div class="form-row">
        <div class="field-group" style="flex:2">
          <label for="cd-tipo">Tipo de documento</label>
          <select id="cd-tipo">
            ${Object.entries(PLANTILLAS).map(([k,v]) =>
              `<option value="${k}">${v.label}</option>`).join('')}
          </select>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px" id="cd-campos-wrapper">

        <div>
          <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Remitente (trabajador/a)</div>
          ${renderCamposGrupo('remitente')}
        </div>

        <div>
          <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Destinatario (empleador)</div>
          ${renderCamposGrupo('destinatario')}
        </div>

        <div style="grid-column:1/-1">
          <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:16px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos laborales</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
            ${renderCamposGrupo('laboral')}
          </div>
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

  function renderCamposGrupo(grupo) {
    return CAMPOS_CONFIG.filter(c => c.grupo === grupo).map(c => `
      <div class="field-group" id="wrap-${c.id}">
        <label for="cd-${c.id}">${c.label}</label>
        ${c.tipo === 'textarea'
          ? `<textarea id="cd-${c.id}" placeholder="${c.placeholder}" rows="2"></textarea>`
          : `<input type="${c.tipo}" id="cd-${c.id}" placeholder="${c.placeholder}"${c.tipo === 'number' ? ' min="0" step="0.01"' : ''}>`
        }
      </div>`).join('');
  }

  // ── Referencias ────────────────────────────────────────────────────────────
  const selTipo  = container.querySelector('#cd-tipo');
  const divRes   = container.querySelector('#cd-resultado');
  const textarea = container.querySelector('#cd-texto');
  const btnGen   = container.querySelector('#cd-generar');
  const btnLimp  = container.querySelector('#cd-limpiar');
  const btnCop   = container.querySelector('#cd-copiar');
  const btnReset = container.querySelector('#cd-reset-texto');

  let ultimoTextoGenerado = '';

  // ── Visibilidad de campos según tipo ──────────────────────────────────────
  function actualizarCampos() {
    const tipo = selTipo.value;
    const plantilla = PLANTILLAS[tipo];
    const todos = [...plantilla.requiere, ...plantilla.opcionales];
    CAMPOS_CONFIG.forEach(c => {
      const wrap = container.querySelector(`#wrap-${c.id}`);
      if (!wrap) return;
      const visible = todos.includes(c.id);
      wrap.style.display = visible ? '' : 'none';
    });
  }

  selTipo.addEventListener('change', actualizarCampos);
  actualizarCampos();

  // ── Generar ────────────────────────────────────────────────────────────────
  btnGen.addEventListener('click', () => {
    const tipo = selTipo.value;
    const plantilla = PLANTILLAS[tipo];
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
    CAMPOS_CONFIG.forEach(c => {
      const el = container.querySelector(`#cd-${c.id}`);
      if (el) d[c.id] = el.value.trim();
    });

    // Formatear fecha si es date input
    ['fecha_ingreso','fecha_hecho'].forEach(k => {
      if (d[k]) {
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
    const tipo = selTipo.value;
    const plantilla = PLANTILLAS[tipo];
    const lineas = texto.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    const html = `
      <div class="info-box" style="font-size:13px;line-height:1.8">${lineas}</div>`;
    exportarPDF(plantilla.label, html);
  });
}
