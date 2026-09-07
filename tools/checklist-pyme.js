// checklist-pyme.js — Checklist de Verificación Documental PYME
// Instrumento de verificación documental independiente (Laboral, RRHH, Compliance
// y Control Interno). A diferencia del Diagnóstico Integral PYME —que releva la
// autopercepción del cliente sobre 16 puntos generales (género)—, este checklist
// desglosa cada área en los documentos y registros puntuales a pedir y cotejar
// (especie), para que la verificación sea propia del profesional y no una
// repetición de las respuestas del cliente. El puente con el Diagnóstico traslada
// únicamente los datos de la empresa y el nivel de riesgo por área (a modo de
// prioridad de revisión), sin precargar el resultado de ningún ítem.
import { exportarPDF } from './exportar.js';

export function initChecklistPyme(container) {

  const ABOGADOS = [
    { value: 'mario',   label: 'Mario Manulis' },
    { value: 'soledad', label: 'Soledad Velazquez' },
    { value: 'camila',  label: 'Camila Poggi' },
    { value: 'otro',    label: 'Otro/a' },
  ];

  const AREAS = {
    laboral:         { label: 'Laboral' },
    rrhh:            { label: 'Recursos Humanos' },
    compliance:      { label: 'Compliance' },
    control_interno: { label: 'Control Interno' },
  };

  // ── Ítems del checklist — documentos y registros puntuales a verificar ─────
  const ITEMS = [
    { id: 'l1',  area: 'laboral', texto: 'DNI y datos personales completos de cada trabajador en el legajo' },
    { id: 'l2',  area: 'laboral', texto: 'Contrato de trabajo por escrito o telegrama / constancia de alta laboral' },
    { id: 'l3',  area: 'laboral', texto: 'Constancia de alta temprana ante ARCA (ex AFIP)' },
    { id: 'l4',  area: 'laboral', texto: 'Formulario 931 y comprobante de pago de cargas sociales del último período' },
    { id: 'l5',  area: 'laboral', texto: 'Recibos de sueldo firmados (últimos 12 meses)' },
    { id: 'l6',  area: 'laboral', texto: 'Certificado de cobertura de ART vigente con nómina actualizada' },
    { id: 'l7',  area: 'laboral', texto: 'Exámenes preocupacionales y periódicos (constancia médica)' },
    { id: 'l8',  area: 'laboral', texto: 'Libro de sueldos y jornales — art. 52 LCT (rubricado y actualizado)' },
    { id: 'l9',  area: 'laboral', texto: 'Registro de control de jornada (planillas, reloj biométrico, sistema de fichado)' },
    { id: 'l10', area: 'laboral', texto: 'Registro y liquidación de horas extra' },
    { id: 'l11', area: 'laboral', texto: 'Listado de causas judiciales laborales en trámite (carátula, juzgado, monto, estado procesal)' },
    { id: 'l12', area: 'laboral', texto: 'Copias de telegramas / cartas documento laborales cruzadas (intimaciones, despidos, reclamos)' },

    { id: 'r1', area: 'rrhh', texto: 'Manual o instructivo del proceso de selección de personal' },
    { id: 'r2', area: 'rrhh', texto: 'Registro de entrevistas / evaluación de postulantes' },
    { id: 'r3', area: 'rrhh', texto: 'Programa de inducción para nuevos ingresos' },
    { id: 'r4', area: 'rrhh', texto: 'Reglamento de licencias y beneficios (texto escrito vigente)' },
    { id: 'r5', area: 'rrhh', texto: 'Constancia de comunicación del reglamento al personal (recibo firmado, mail, cartelera)' },
    { id: 'r6', area: 'rrhh', texto: 'Formularios / registros de evaluación de desempeño de los últimos períodos' },

    { id: 'co1', area: 'compliance', texto: 'Código de Ética / Conducta (texto vigente)' },
    { id: 'co2', area: 'compliance', texto: 'Constancia de adhesión firmada por el personal al Código de Ética' },
    { id: 'co3', area: 'compliance', texto: 'Procedimiento / protocolo escrito del canal de denuncias' },
    { id: 'co4', area: 'compliance', texto: 'Registro de denuncias recibidas y su tratamiento (si las hubo)' },
    { id: 'co5', area: 'compliance', texto: 'Habilitación municipal / provincial vigente' },
    { id: 'co6', area: 'compliance', texto: 'Matrícula, registro o habilitación sectorial específica de la actividad' },
    { id: 'co7', area: 'compliance', texto: 'Constancia de inscripción (o de exclusión) como sujeto obligado ante la UIF (Ley 25.246)' },
    { id: 'co8', area: 'compliance', texto: 'Manual de prevención de lavado de activos y designación de oficial de cumplimiento, si corresponde' },

    { id: 'ci1', area: 'control_interno', texto: 'Organigrama o cuadro de funciones que evidencie segregación entre solicitud, aprobación y pago' },
    { id: 'ci2', area: 'control_interno', texto: 'Extractos bancarios de los últimos 3 meses' },
    { id: 'ci3', area: 'control_interno', texto: 'Conciliaciones bancarias / contables de los últimos 3 meses' },
    { id: 'ci4', area: 'control_interno', texto: 'Registros contables actualizados (libro diario / mayor)' },
    { id: 'ci5', area: 'control_interno', texto: 'Cuadro de niveles de autorización de gastos (montos y firmantes)' },
    { id: 'ci6', area: 'control_interno', texto: 'Comprobantes de aprobación de gastos relevantes del último período' },
  ];

  const ESTADOS = [
    { value: 'verificado', label: 'Verificado' },
    { value: 'falta',      label: 'Falta / pendiente' },
    { value: 'na',         label: 'No aplica' },
  ];

  // ── HTML ──────────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="tool-card">
      <h2>Checklist de Verificación Documental PYME</h2>
      <p class="tool-desc">Laboral, Recursos Humanos, Compliance y Control Interno — verificación puntual de documentación y registros</p>

      <div id="cp-prefill-slot"></div>

      <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:8px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">Datos de la empresa</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div class="field-group"><label for="cp-empresa">Razón social</label><input type="text" id="cp-empresa" placeholder="Empresa S.A."></div>
        <div class="field-group"><label for="cp-cuit">CUIT (opcional)</label><input type="text" id="cp-cuit" placeholder="30-12345678-9"></div>
        <div class="field-group"><label for="cp-rubro">Rubro / actividad</label><input type="text" id="cp-rubro" placeholder="Comercio, industria, servicios..."></div>
        <div class="field-group"><label for="cp-fecha">Fecha de verificación</label><input type="date" id="cp-fecha"></div>
        <div class="field-group"><label for="cp-abogado">Abogado/a que realiza la verificación</label>
          <select id="cp-abogado">${ABOGADOS.map(a => `<option value="${a.value}">${a.label}</option>`).join('')}</select>
        </div>
      </div>

      ${Object.entries(AREAS).map(([areaKey, area]) => `
        <div class="form-section-title" style="font-weight:700;color:var(--color-accent);margin:20px 0 8px;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em">${area.label}</div>
        ${ITEMS.filter(it => it.area === areaKey).map(it => `
          <div class="display-box" style="margin-bottom:10px" data-item="${it.id}">
            <p style="font-weight:600;margin:0 0 8px">${it.texto}</p>
            <div style="display:flex;flex-wrap:wrap;gap:14px;margin-bottom:8px">
              ${ESTADOS.map(e => `
                <label style="display:flex;align-items:center;gap:6px;font-weight:400;cursor:pointer">
                  <input type="radio" name="cp-${it.id}" value="${e.value}" style="width:auto">
                  <span>${e.label}</span>
                </label>`).join('')}
            </div>
            <div class="field-group" style="margin:0">
              <label for="cp-obs-${it.id}" style="font-size:.78rem;font-weight:400">Observaciones / respaldo (archivo, fecha, etc.)</label>
              <input type="text" id="cp-obs-${it.id}" placeholder="Ej: recibos de sueldo agosto/2026 — carpeta compartida">
            </div>
          </div>`).join('')}
      `).join('')}

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:8px">
        <button class="btn btn-primary" id="cp-calcular">Calcular estado documental</button>
        <button class="btn btn-ghost"   id="cp-limpiar">Limpiar</button>
      </div>

      <div id="cp-resumen" style="display:none;margin-top:20px"></div>

      <div class="form-row" style="justify-content:flex-start;gap:12px;margin-top:16px">
        <button class="btn btn-primary" id="cp-generar" style="display:none">Generar informe</button>
      </div>

      <div id="cp-resultado" style="display:none;margin-top:24px">
        <label for="cp-texto" style="font-weight:600;display:block;margin-bottom:6px">Informe generado (editable)</label>
        <textarea id="cp-texto" rows="26" style="width:100%;resize:vertical;font-family:inherit;font-size:.88rem;padding:12px;border:1px solid var(--color-border);border-radius:6px;background:#ffffff;color:#1a1a1a;line-height:1.6"></textarea>
        <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:10px">
          <button class="btn btn-success" id="cp-copiar">📋 Copiar texto</button>
          <button class="btn btn-ghost"   id="cp-pdf">📄 Exportar PDF</button>
        </div>
      </div>

      <p style="margin-top:24px;font-size:.78rem;color:var(--color-muted);border-top:1px solid var(--color-border);padding-top:12px">
        Checklist orientativo de verificación documental. No constituye una auditoría ni un dictamen legal definitivo — cada ítem debe cotejarse contra la documentación real de la empresa.
      </p>
    </div>`;

  // ── Referencias ───────────────────────────────────────────────────────────
  const divResumen = container.querySelector('#cp-resumen');
  const btnGenerar = container.querySelector('#cp-generar');
  const divRes = container.querySelector('#cp-resultado');
  const textarea = container.querySelector('#cp-texto');

  function val(id) { const el = container.querySelector(`#${id}`); return el ? el.value.trim() : ''; }
  function fmtFechaISO(iso) {
    if (!iso) return '';
    const p = iso.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
  }
  function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  let ultimoResumen = null;

  function leerEstados() {
    const estados = {};
    ITEMS.forEach(it => {
      const checked = container.querySelector(`input[name="cp-${it.id}"]:checked`);
      estados[it.id] = checked ? checked.value : null;
    });
    return estados;
  }

  function nivelDe(pct) {
    if (pct >= 90) return { nivel: 'Completo', color: '#1f7a3d', bg: '#e8f4ea', borde: '#7ab88a' };
    if (pct >= 60) return { nivel: 'Parcial', color: '#856404', bg: '#fff3cd', borde: '#ffc107' };
    return { nivel: 'Incompleto', color: '#7a2020', bg: '#fdeaea', borde: '#d97a7a' };
  }

  // ── Gráficos SVG (pantalla + PDF opcional) ──────────────────────────────
  function construirBarrasSvg(filas) {
    const rowH = 40, barMaxW = 240, barX = 150, chartWidth = barX + barMaxW + 50, chartHeight = filas.length * rowH + 10;
    let inner = '';
    filas.forEach((f, i) => {
      const y = 10 + i * rowH;
      const barW = Math.max(2, (f.pct / 100) * barMaxW);
      inner += `<text x="0" y="${y + 18}" font-family="Arial, sans-serif" font-size="12" fill="#1a1a1a">${esc(f.label)}</text>`;
      inner += `<rect x="${barX}" y="${y + 4}" width="${barMaxW}" height="20" rx="4" fill="#eee"/>`;
      inner += `<rect x="${barX}" y="${y + 4}" width="${barW}" height="20" rx="4" fill="${f.color}"/>`;
      inner += `<text x="${barX + barMaxW + 10}" y="${y + 18}" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="${f.color}">${f.pct.toFixed(0)}%</text>`;
    });
    return `<div><div style="font-weight:700;font-size:12px;margin-bottom:8px;color:#1a1a1a">Cumplimiento por área</div>
      <svg width="${chartWidth}" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}" xmlns="http://www.w3.org/2000/svg">${inner}</svg></div>`;
  }

  function construirDonaSvg(pctGlobal, nivel) {
    const size = 160, r = 60, cx = size / 2, cy = size / 2, grosor = 18;
    const circunferencia = 2 * Math.PI * r;
    const progreso = (Math.max(0, Math.min(100, pctGlobal)) / 100) * circunferencia;
    return `<div><div style="font-weight:700;font-size:12px;margin-bottom:8px;color:#1a1a1a">Estado global</div>
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#eee" stroke-width="${grosor}"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${nivel.color}" stroke-width="${grosor}" stroke-dasharray="${progreso} ${circunferencia}" stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"/>
        <text x="${cx}" y="${cy + 7}" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="800" fill="${nivel.color}">${pctGlobal.toFixed(0)}%</text>
      </svg>
      <div style="text-align:center;font-size:11px;color:${nivel.color};font-weight:700;margin-top:2px">${esc(nivel.nivel)}</div>
    </div>`;
  }

  function construirRadarSvg(filas) {
    const width = 380, height = 320, cx = width / 2, cy = height / 2, rMax = 80;
    const n = filas.length;
    const angleFor = i => (Math.PI * 2 * i / n) - Math.PI / 2;
    const puntoEn = (i, frac) => {
      const a = angleFor(i);
      return [cx + Math.cos(a) * rMax * frac, cy + Math.sin(a) * rMax * frac];
    };
    let grid = '';
    [0.25, 0.5, 0.75, 1].forEach(frac => {
      const pts = filas.map((_, i) => puntoEn(i, frac).join(',')).join(' ');
      grid += `<polygon points="${pts}" fill="none" stroke="#ddd" stroke-width="1"/>`;
    });
    let axes = '';
    filas.forEach((f, i) => {
      const a = angleFor(i);
      const cosA = Math.cos(a), sinA = Math.sin(a);
      const [x, y] = puntoEn(i, 1);
      const [lx, ly] = puntoEn(i, 1.22);
      const anchor = Math.abs(cosA) < 0.3 ? 'middle' : (cosA > 0 ? 'start' : 'end');
      const dy = sinA < -0.3 ? -2 : (sinA > 0.3 ? 10 : 4);
      axes += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#ddd" stroke-width="1"/>`;
      axes += `<text x="${lx}" y="${ly + dy}" text-anchor="${anchor}" font-family="Arial, sans-serif" font-size="11" fill="#1a1a1a">${esc(f.labelCorto || f.label)}</text>`;
    });
    const dataPts = filas.map((f, i) => puntoEn(i, Math.max(0.03, f.pct / 100)).join(',')).join(' ');
    const dataShape = `<polygon points="${dataPts}" fill="#c9a84c" fill-opacity="0.35" stroke="#c9a84c" stroke-width="2"/>`;
    const dots = filas.map((f, i) => { const [x, y] = puntoEn(i, Math.max(0.03, f.pct / 100)); return `<circle cx="${x}" cy="${y}" r="3.5" fill="${f.color}"/>`; }).join('');
    return `<div><div style="font-weight:700;font-size:12px;margin-bottom:8px;color:#1a1a1a">Perfil comparativo por área</div>
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${grid}${axes}${dataShape}${dots}</svg></div>`;
  }

  const RADAR_LABEL_CORTO = { laboral: 'Laboral', rrhh: 'RRHH', compliance: 'Compliance', control_interno: 'Ctrl. Interno' };

  function construirGraficosHtml(porArea, pctGlobal) {
    const filas = Object.entries(AREAS).map(([areaKey, area]) => {
      const a = porArea[areaKey];
      const n = nivelDe(a.pct);
      return { label: area.label, labelCorto: RADAR_LABEL_CORTO[areaKey] || area.label, pct: a.pct, color: n.color };
    });
    const nGlobal = nivelDe(pctGlobal);
    return `<div style="background:#ffffff;border:1px solid #e5e5e5;border-radius:8px;padding:16px 20px">
      <div style="display:flex;flex-wrap:wrap;gap:28px;align-items:flex-start">
        ${construirBarrasSvg(filas)}
        ${construirDonaSvg(pctGlobal, nGlobal)}
      </div>
      <div style="margin-top:18px">${construirRadarSvg(filas)}</div>
    </div>`;
  }

  container.querySelector('#cp-calcular').addEventListener('click', () => {
    const estados = leerEstados();
    const sinResponder = ITEMS.filter(it => !estados[it.id]);
    if (sinResponder.length) {
      divResumen.style.display = 'block';
      divResumen.innerHTML = `<div class="display-box" style="border-color:#d97a7a;color:#7a2020">
        Faltan clasificar ${sinResponder.length} ítem(s) para calcular el estado documental.
      </div>`;
      btnGenerar.style.display = 'none';
      return;
    }

    const porArea = {};
    let totalVerificado = 0, totalFalta = 0, totalAplicable = 0;
    Object.keys(AREAS).forEach(areaKey => {
      const itemsArea = ITEMS.filter(it => it.area === areaKey);
      let verificado = 0, falta = 0, na = 0;
      itemsArea.forEach(it => {
        const e = estados[it.id];
        if (e === 'verificado') verificado++;
        else if (e === 'falta') falta++;
        else na++;
      });
      const aplicable = itemsArea.length - na;
      const pct = aplicable > 0 ? (verificado / aplicable * 100) : 0;
      porArea[areaKey] = { verificado, falta, na, aplicable, total: itemsArea.length, pct };
      totalVerificado += verificado;
      totalFalta += falta;
      totalAplicable += aplicable;
    });
    const pctGlobal = totalAplicable > 0 ? (totalVerificado / totalAplicable * 100) : 0;

    ultimoResumen = { estados, porArea, pctGlobal, totalVerificado, totalFalta, totalAplicable };

    const filasAreas = Object.entries(AREAS).map(([areaKey, area]) => {
      const a = porArea[areaKey];
      const n = nivelDe(a.pct);
      return `<tr>
        <td style="padding:6px 10px">${area.label}</td>
        <td style="padding:6px 10px;text-align:right">${a.verificado}/${a.aplicable}${a.na ? ` (${a.na} no aplica)` : ''}</td>
        <td style="padding:6px 10px;text-align:right">${a.aplicable > 0 ? a.pct.toFixed(0) + '%' : '—'}</td>
        <td style="padding:6px 10px;text-align:center"><span style="background:${n.bg};color:${n.color};border:1px solid ${n.borde};border-radius:4px;padding:2px 10px;font-weight:700">${n.nivel}</span></td>
      </tr>`;
    }).join('');

    const nGlobal = nivelDe(pctGlobal);
    divResumen.style.display = 'block';
    divResumen.innerHTML = `
      <div class="display-box">
        <strong>Estado documental por área</strong>
        <table style="width:100%;border-collapse:collapse;margin-top:8px">
          <thead><tr>
            <th style="text-align:left;padding:6px 10px;font-size:.75rem;color:var(--color-muted);text-transform:uppercase">Área</th>
            <th style="text-align:right;padding:6px 10px;font-size:.75rem;color:var(--color-muted);text-transform:uppercase">Verificado</th>
            <th style="text-align:right;padding:6px 10px;font-size:.75rem;color:var(--color-muted);text-transform:uppercase">%</th>
            <th style="text-align:center;padding:6px 10px;font-size:.75rem;color:var(--color-muted);text-transform:uppercase">Estado</th>
          </tr></thead>
          <tbody>${filasAreas}</tbody>
        </table>
        <div style="margin-top:14px;padding:10px 14px;background:${nGlobal.bg};border:1px solid ${nGlobal.borde};border-radius:6px;color:${nGlobal.color}">
          <strong>Estado global: ${pctGlobal.toFixed(0)}% — ${nGlobal.nivel}</strong>${totalFalta ? ` — ${totalFalta} ítem(s) pendiente(s)` : ''}
        </div>
      </div>
      <div class="display-box" style="margin-top:14px">
        <label style="display:flex;align-items:center;gap:8px;font-weight:600;cursor:pointer;margin-bottom:14px">
          <input type="checkbox" id="cp-incluir-graficos" checked style="width:auto"> Incluir estos gráficos en el PDF
        </label>
        ${construirGraficosHtml(porArea, pctGlobal)}
      </div>`;

    btnGenerar.style.display = '';
    divResumen.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  container.querySelector('#cp-limpiar').addEventListener('click', () => {
    container.querySelectorAll('input[type="text"], input[type="date"]').forEach(el => el.value = '');
    container.querySelectorAll('input[type="radio"]').forEach(el => el.checked = false);
    container.querySelector('#cp-abogado').selectedIndex = 0;
    divResumen.style.display = 'none';
    divResumen.innerHTML = '';
    btnGenerar.style.display = 'none';
    ultimoResumen = null;
    divRes.style.display = 'none';
    textarea.value = '';
  });

  // ── Generar informe ───────────────────────────────────────────────────────
  btnGenerar.addEventListener('click', () => {
    if (!ultimoResumen) return;
    const abogadoLabel = container.querySelector('#cp-abogado').selectedOptions[0].textContent;

    const tablaAreas = Object.entries(AREAS).map(([areaKey, area]) => {
      const a = ultimoResumen.porArea[areaKey];
      return `${area.label}: ${a.verificado}/${a.aplicable} verificado(s)${a.na ? ` (${a.na} no aplica)` : ''} (${a.aplicable > 0 ? a.pct.toFixed(0) + '%' : '—'}) — ${nivelDe(a.pct).nivel}`;
    }).join('\n');

    const detalleItems = ITEMS.map(it => {
      const estado = ultimoResumen.estados[it.id];
      const estadoLabel = ESTADOS.find(e => e.value === estado)?.label || '-';
      const obs = val(`cp-obs-${it.id}`);
      return `- ${it.texto}\n  Estado: ${estadoLabel}${obs ? `\n  Observaciones: ${obs}` : ''}`;
    }).join('\n');

    const texto =
`CHECKLIST DE VERIFICACIÓN DOCUMENTAL PYME
${val('cp-empresa') || '-'}

DATOS DE LA EMPRESA
Razón social: ${val('cp-empresa') || '-'}
CUIT: ${val('cp-cuit') || '-'}
Rubro / actividad: ${val('cp-rubro') || '-'}
Fecha de verificación: ${fmtFechaISO(val('cp-fecha')) || '-'}
Abogado/a interviniente: ${abogadoLabel}

ESTADO DOCUMENTAL POR ÁREA
${tablaAreas}

ESTADO GLOBAL: ${ultimoResumen.pctGlobal.toFixed(0)}% — ${nivelDe(ultimoResumen.pctGlobal).nivel}${ultimoResumen.totalFalta ? ` — ${ultimoResumen.totalFalta} ítem(s) pendiente(s)` : ''}

DETALLE POR ÍTEM
${detalleItems}

──────────────────────────────────────────────
Checklist orientativo de verificación documental en base a la documentación efectivamente cotejada. No constituye una auditoría ni un dictamen legal definitivo.`;

    textarea.value = texto;
    divRes.style.display = 'block';
    textarea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  container.querySelector('#cp-copiar').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    navigator.clipboard.writeText(texto).then(() => {
      const btn = container.querySelector('#cp-copiar');
      const orig = btn.textContent;
      btn.textContent = 'Copiado ✓';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }).catch(() => prompt('Copie el texto:', texto));
  });

  container.querySelector('#cp-pdf').addEventListener('click', () => {
    const texto = textarea.value;
    if (!texto) return;
    const lineas = texto.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    const incluirGraficos = container.querySelector('#cp-incluir-graficos');
    const graficosHtml = (incluirGraficos && incluirGraficos.checked && ultimoResumen)
      ? `<div style="margin-top:22px;page-break-inside:avoid">
          <div style="font-weight:700;font-size:13px;margin-bottom:10px;color:#1a1a1a">GRÁFICOS — ESTADO DOCUMENTAL</div>
          ${construirGraficosHtml(ultimoResumen.porArea, ultimoResumen.pctGlobal)}
        </div>`
      : '';
    exportarPDF(`Checklist de Verificación Documental PYME — ${val('cp-empresa') || 'empresa'}`, `<div class="info-box" style="font-size:12px;line-height:1.7">${lineas}</div>${graficosHtml}`);
  });

  // ── Prefill desde Diagnóstico Integral PYME ─────────────────────────────
  // Traslada únicamente los datos de la empresa y el nivel de riesgo por área
  // (a modo de prioridad de revisión). Ningún ítem del checklist se precarga:
  // la verificación documental es independiente de la autopercepción del
  // cliente relevada en el Diagnóstico.
  (function detectarPrefill() {
    let payload;
    try { payload = JSON.parse(localStorage.getItem('mvc_prefill_checklist_pyme') || 'null'); } catch { payload = null; }
    if (!payload) return;

    const AREA_LABEL = { laboral: 'Laboral', rrhh: 'Recursos Humanos', compliance: 'Compliance', control_interno: 'Control Interno' };
    const areasTexto = Object.entries(payload.areas || {})
      .sort((a, b) => a[1].pct - b[1].pct)
      .map(([areaKey, a]) => `${AREA_LABEL[areaKey] || areaKey}: ${a.pct.toFixed(0)}% (${a.nivel})`)
      .join(' · ');

    const banner = document.createElement('div');
    banner.style.cssText = 'background:#e8f4ea;border:1px solid #7ab88a;border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:.9rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px';
    banner.innerHTML = `<span>📋 Hay un Diagnóstico Integral PYME cargado el ${esc(payload.fecha || '')}${areasTexto ? ` — Resultado por área: ${esc(areasTexto)}` : ''}. ¿Cargamos los datos de la empresa? (las áreas con menor % ameritan prioridad de verificación)</span>
      <span style="display:flex;gap:8px">
        <button class="btn btn-primary" id="cp-prefill-cargar" type="button">Cargar datos</button>
        <button class="btn btn-ghost" id="cp-prefill-descartar" type="button">Descartar</button>
      </span>`;
    container.querySelector('#cp-prefill-slot').appendChild(banner);

    banner.querySelector('#cp-prefill-cargar').addEventListener('click', () => {
      if (payload.empresa) container.querySelector('#cp-empresa').value = payload.empresa;
      if (payload.cuit) container.querySelector('#cp-cuit').value = payload.cuit;
      if (payload.rubro) container.querySelector('#cp-rubro').value = payload.rubro;
      localStorage.removeItem('mvc_prefill_checklist_pyme');
      banner.remove();
    });
    banner.querySelector('#cp-prefill-descartar').addEventListener('click', () => {
      localStorage.removeItem('mvc_prefill_checklist_pyme');
      banner.remove();
    });
  })();
}
