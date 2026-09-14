// testigos.js — Sección reutilizable "Testigos" (nombre y apellido, DNI, domicilio,
// celular, mail). La usan tools/documentacion.js (para armar el listado desde el
// estudio) y formulario-testigos.html (para que el cliente cargue los testigos desde
// su celular, sin backend: el formulario arma un mensaje de WhatsApp/mail que el
// cliente envía él mismo). Deliberadamente simple: campos de texto libre, sin
// validación estricta de formato.

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
  row.innerHTML = `
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <input type="text" data-testigo-nombre placeholder="Nombre y apellido completo" style="flex:2;min-width:200px" value="${escAttr(datos.nombre)}">
      <input type="text" data-testigo-dni placeholder="DNI" style="flex:1;min-width:120px" value="${escAttr(datos.dni)}">
    </div>
    <input type="text" data-testigo-domicilio placeholder="Domicilio: calle, altura, barrio, localidad, partido, provincia" value="${escAttr(datos.domicilio)}">
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
    const domicilio = row.querySelector('[data-testigo-domicilio]').value.trim();
    const celular   = row.querySelector('[data-testigo-celular]').value.trim();
    const mail      = row.querySelector('[data-testigo-mail]').value.trim();
    if (nombre || dni || domicilio || celular || mail) {
      testigos.push({ nombre, dni, domicilio, celular, mail });
    }
  });
  return testigos;
}

// Formato fijo, pensado para poder "parsearlo" de vuelta (ver parsearTestigosTexto):
// se usa tanto para el mensaje de WhatsApp/mail que arma el cliente como para el
// texto que se pega en el generador de documentación.
export function formatearTestigosTexto(testigos) {
  return testigos.map((t, i) => (
    `Testigo ${i + 1}:\n` +
    `Nombre y apellido: ${t.nombre || '-'}\n` +
    `DNI: ${t.dni || '-'}\n` +
    `Domicilio: ${t.domicilio || '-'}\n` +
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
    const domicilio = get('Domicilio');
    const celular   = get('Celular');
    const mail      = get('Mail');
    if (nombre || dni || domicilio || celular || mail) {
      testigos.push({ nombre, dni, domicilio, celular, mail });
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
      <td>${escHtml(t.domicilio)}</td>
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
