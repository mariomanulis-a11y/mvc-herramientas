// exportar.js — Utilidades de exportación PDF y CSV para MVC Abogados

const WA_NUMERO = '1144496992';
const WA_URL    = `https://wa.me/54${WA_NUMERO}`;

/**
 * Abre una ventana nueva con el contenido listo para imprimir / Guardar como PDF.
 * @param {string} titulo  Título del documento
 * @param {string} htmlBody Contenido HTML interno (ya escapado si corresponde)
 */
export function exportarPDF(titulo, htmlBody) {
  const win = window.open('', '_blank', 'width=900,height=750');
  if (!win) {
    alert('El navegador bloqueó la ventana emergente. Permití popups para esta página e intentá de nuevo.');
    return;
  }
  win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${escHtml(titulo)} — MVC Abogados</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #1a1a1a; background: #fff; margin: 0; padding: 28px 32px; }
    .mvc-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #c9a84c; padding-bottom: 14px; margin-bottom: 22px; }
    .mvc-logo  { font-size: 22px; font-weight: 800; letter-spacing: -.5px; color: #1a1a1a; line-height: 1.1; }
    .mvc-logo span { color: #c9a84c; }
    .mvc-sub   { font-size: 10px; color: #666; margin-top: 4px; }
    .mvc-contact { font-size: 11px; color: #555; text-align: right; line-height: 1.9; }
    .mvc-contact a { color: #c9a84c; text-decoration: none; }
    h1.titulo  { font-size: 17px; margin: 0 0 18px 0; color: #1a1a1a; font-weight: 700; border-left: 4px solid #c9a84c; padding-left: 10px; }
    table      { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
    th         { background: #f5f0e0; border: 1px solid #ddd; padding: 6px 9px; text-align: left; font-weight: 700; color: #1a1a1a; }
    td         { border: 1px solid #ddd; padding: 6px 9px; color: #1a1a1a; }
    .monto     { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .total-row { font-weight: 700; background: #fff8e1; }
    .info-box  { background: #fafafa; border: 1px solid #ddd; border-radius: 4px; padding: 10px 12px; margin: 10px 0; font-size: 12px; line-height: 1.7; color: #333; }
    .result-big { font-size: 26px; font-weight: 800; color: #c9a84c; text-align: center; padding: 14px; border: 2px solid #c9a84c; border-radius: 6px; margin: 14px 0; }
    .nota      { font-size: 10px; color: #888; font-style: italic; margin-top: 6px; }
    .mvc-footer { margin-top: 22px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 10px; color: #aaa; }
    .btn-impr  { display: inline-block; padding: 10px 26px; background: #c9a84c; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: 700; }
    @media print { .no-print { display: none !important; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="mvc-header">
    <div>
      <div class="mvc-logo">MVC <span>ABOGADOS</span></div>
      <div class="mvc-sub">Herramientas para la práctica profesional de la abogacía Bonaerense</div>
    </div>
    <div class="mvc-contact">
      WhatsApp: <a href="${WA_URL}">${WA_NUMERO}</a><br>
      Provincia de Buenos Aires, Argentina
    </div>
  </div>
  <h1 class="titulo">${escHtml(titulo)}</h1>
  ${htmlBody}
  <div class="mvc-footer">Resultado meramente orientativo. No constituye asesoramiento legal. — MVC Abogados</div>
  <div class="no-print" style="text-align:center;margin-top:18px">
    <button class="btn-impr" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>
  </div>
</body>
</html>`);
  win.document.close();
}

/**
 * Descarga un archivo CSV con los datos.
 * @param {string}   nombre  Nombre base del archivo (sin extensión)
 * @param {string[][]} filas  Array de arrays de strings; la primera fila se usa como encabezado
 */
export function exportarCSV(nombre, filas) {
  const BOM = '\uFEFF';
  const csv = filas
    .map(fila => fila.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  const blob    = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url     = URL.createObjectURL(blob);
  const anchor  = document.createElement('a');
  anchor.href   = url;
  anchor.download = (nombre.replace(/[^\w\s\-áéíóúÁÉÍÓÚñÑ]/g, '') || 'exportacion').trim().replace(/\s+/g, '_') + '.csv';
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => { document.body.removeChild(anchor); URL.revokeObjectURL(url); }, 150);
}

/** Escapa caracteres HTML básicos */
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
