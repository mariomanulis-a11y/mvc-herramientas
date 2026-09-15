// testigos.js — Sección reutilizable "Testigos" (nombre y apellido, DNI, domicilio
// desglosado, celular, mail). La usan tools/documentacion.js (para armar el listado
// desde el estudio) y formulario-testigos.html (para que el cliente cargue los
// testigos desde su celular, sin backend: el formulario arma un mensaje de
// WhatsApp/mail que el cliente envía él mismo).
//
// El domicilio se pide desglosado (Calle, Altura, Barrio, Localidad, Partido,
// Provincia) en vez de un único campo de texto libre: la experiencia mostró que
// con un solo campo el cliente o el operador termina omitiendo algún dato (el
// texto "se pierde" dentro del campo). Cada parte tiene su propio campo visible.

const PROVINCIAS = [
  'Buenos Aires',
  'Ciudad Autónoma de Buenos Aires (CABA)',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego, Antártida e Islas del Atlántico Sur',
  'Tucumán',
];

export function renderTestigosSection(p, opts = {}) {
  const titulo = opts.titulo || 'Testigos (opcional)';
  const ayuda  = opts.ayuda  || 'Agregá los testigos que corresponda, con sus datos de contacto.';
  return `
    <div class="field-group" style="margin-top:14px">
      <label>${titulo}</label>
      <p style="font-size:.78rem;color:var(--color-muted);margin:0 0 8px">${ayuda}</p>
      <div id="${p}-testigos-list" style="display:flex;flex-direction:column;gap:10px"></div>
      <button type="button" class="btn btn-ghost" id="${p}-testigos-agregar" style="margin-top:8px;align-self:flex-start">+ Agregar testigo</button>
    </div>
  `;
}

function agregarTestigoRow(listEl, datos = {}) {
  const row = document.createElement('div');
  row.setAttribute('data-testigo-row', '1');
  row.style.cssText = 'display:flex;flex-direction:column;gap:6px;padding:10px;background:rgba(255,255,255,.04);border-radius:6px';
  const provinciaActual = datos.provincia || PROVINCIAS[0];
  row.innerHTML = `
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <input type="text" data-testigo-nombre placeholder="Nombre y apellido completo" style="flex:2;min-width:200px" value="${escAttr(datos.nombre)}">
      <input type="text" data-testigo-dni placeholder="DNI" style="flex:1;min-width:120px" value="${escAttr(datos.dni)}">
    </div>
    <div style="font-size:.72rem;color:var(--color-muted);margin-top:2px">Domicilio</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <input type="text" data-testigo-calle placeholder="Calle" style="flex:2;min-width:140px" value="${escAttr(datos.calle)}">
      <input type="text" data-testigo-altura placeholder="Altura" style="flex:1;min-width:90px" value="${escAttr(datos.altura)}">
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <input type="text" data-testigo-barrio placeholder="Barrio" style="flex:1;min-width:130px" value="${escAttr(datos.barrio)}">
      <input type="text" data-testigo-localidad placeholder="Localidad" style="flex:1;min-width:130px" value="${escAttr(datos.localidad)}">
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <input type="text" data-testigo-partido placeholder="Partido" style="flex:1;min-width:130px" value="${escAttr(datos.partido)}">
      <select data-testigo-provincia style="flex:1;min-width:170px">
        ${PROVINCIAS.map(prov => `<option value="${escAttr(prov)}"${prov === provinciaActual ? ' selected' : ''}>${escHtml(prov)}</option>`).join('')}
      </select>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <input type="text" data-testigo-celular placeholder="Teléfono celular" style="flex:1;min-width:150px" value="${escAttr(datos.celular)}">
      <input type="email" data-testigo-mail placeholder="Mail" style="flex:2;min-width:200px" value="${escAttr(datos.mail)}">
    </div>
    <button type="button" class="btn btn-ghost" data-testigo-quitar style="align-self:flex-end;padding:4px 10px">✕ Quitar testigo</button>
  `;
  row.querySelector('[data-testigo-quitar]').addEventListener('click', () => row.remove());
  listEl.appendChild(row);
  return row;
}

export function wireTestigosSection(container, p) {
  const list = container.querySelector(`#${p}-testigos-list`);
  const btn  = container.querySelector(`#${p}-testigos-agregar`);
  if (btn && list) btn.addEventListener('click', () => agregarTestigoRow(list));
  return {
    list,
    agregarFila: (datos) => agregarTestigoRow(list, datos),
    limpiar: () => { list.innerHTML = ''; },
  };
}

export function leerTestigos(container, p) {
  const testigos = [];
  container.querySelectorAll(`#${p}-testigos-list [data-testigo-row]`).forEach(row => {
    const nombre    = row.querySelector('[data-testigo-nombre]').value.trim();
    const dni       = row.querySelector('[data-testigo-dni]').value.trim();
    const calle     = row.querySelector('[data-testigo-calle]').value.trim();
    const altura    = row.querySelector('[data-testigo-altura]').value.trim();
    const barrio    = row.querySelector('[data-testigo-barrio]').value.trim();
    const localidad = row.querySelector('[data-testigo-localidad]').value.trim();
    const partido   = row.querySelector('[data-testigo-partido]').value.trim();
    const provincia = row.querySelector('[data-testigo-provincia]').value.trim();
    const celular   = row.querySelector('[data-testigo-celular]').value.trim();
    const mail      = row.querySelector('[data-testigo-mail]').value.trim();
    // La provincia siempre trae un valor (select con default) — no cuenta sola
    // para decidir si la fila tiene datos cargados.
    if (nombre || dni || calle || altura || barrio || localidad || partido || celular || mail) {
      testigos.push({ nombre, dni, calle, altura, barrio, localidad, partido, provincia, celular, mail });
    }
  });
  return testigos;
}

// Arma un renglón de domicilio legible a partir de las partes desglosadas,
// omitiendo las que falten. Se usa en la tabla del PDF/listado.
function formatearDomicilio(t) {
  const calleAltura = [t.calle, t.altura].filter(Boolean).join(' ');
  return [calleAltura, t.barrio, t.localidad, t.partido, t.provincia].filter(Boolean).join(', ') || '-';
}

// Formato fijo, pensado para poder "parsearlo" de vuelta (ver parsearTestigosTexto):
// se usa tanto para el mensaje de WhatsApp/mail que arma el cliente como para el
// texto que se pega en el generador de documentación. El domicilio se lista
// campo por campo (no como renglón único) para que no se pierda ningún dato.
export function formatearTestigosTexto(testigos) {
  return testigos.map((t, i) => (
    `Testigo ${i + 1}:\n` +
    `Nombre y apellido: ${t.nombre || '-'}\n` +
    `DNI: ${t.dni || '-'}\n` +
    `Calle: ${t.calle || '-'}\n` +
    `Altura: ${t.altura || '-'}\n` +
    `Barrio: ${t.barrio || '-'}\n` +
    `Localidad: ${t.localidad || '-'}\n` +
    `Partido: ${t.partido || '-'}\n` +
    `Provincia: ${t.provincia || '-'}\n` +
    `Celular: ${t.celular || '-'}\n` +
    `Mail: ${t.mail || '-'}`
  )).join('\n\n');
}

// Interpreta un texto con el formato de formatearTestigosTexto — por ejemplo, el que
// el cliente pegó desde el WhatsApp/mail que envió — y devuelve la lista de testigos.
export function parsearTestigosTexto(texto) {
  if (!texto || !texto.trim()) return [];
  const bloques = texto.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  const testigos = [];
  bloques.forEach(bloque => {
    const get = (campo) => {
      const m = bloque.match(new RegExp(campo.replace(/ /g, '\\s+') + '\\s*:\\s*(.*)', 'i'));
      const v = m ? m[1].trim() : '';
      return v === '-' ? '' : v;
    };
    const nombre    = get('Nombre y apellido');
    const dni       = get('DNI');
    const calle     = get('Calle');
    const altura    = get('Altura');
    const barrio    = get('Barrio');
    const localidad = get('Localidad');
    const partido   = get('Partido');
    const provincia = get('Provincia');
    const celular   = get('Celular');
    const mail      = get('Mail');
    if (nombre || dni || calle || altura || barrio || localidad || partido || celular || mail) {
      testigos.push({ nombre, dni, calle, altura, barrio, localidad, partido, provincia, celular, mail });
    }
  });
  return testigos;
}

export function renderTestigosTablaHtml(testigos) {
  const filas = testigos.map((t, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escHtml(t.nombre)}</td>
      <td>${escHtml(t.dni)}</td>
      <td>${escHtml(formatearDomicilio(t))}</td>
      <td>${escHtml(t.celular)}</td>
      <td>${escHtml(t.mail)}</td>
    </tr>`).join('');
  return `
    <table>
      <thead><tr><th>#</th><th>Nombre y apellido</th><th>DNI</th><th>Domicilio</th><th>Celular</th><th>Mail</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>`;
}

function escHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escAttr(s) {
  return escHtml(s).replace(/"/g, '&quot;');
}
