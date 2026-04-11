/**
 * modules/archivos.js — Procesamiento de archivos adjuntos
 * Estudio Jurídico Manulis — San Isidro, Provincia de Buenos Aires
 *
 * Soporta:
 *   - PDF (.pdf)     → extracción de texto con PDF.js
 *   - Word (.docx)   → extracción de texto con mammoth.js
 *   - Texto (.txt)   → lectura directa
 *   - Imágenes (.jpg, .png, .gif, .webp, .bmp) → base64 para visión de Claude
 *
 * Para documentos escaneados (imágenes sin texto extraíble), Claude
 * procesa la imagen directamente con su capacidad de visión (OCR implícito).
 */

/** Tipos de archivo soportados, mapeados a su método de procesamiento */
export const TIPOS_SOPORTADOS = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'docx',
  'text/plain': 'texto',
  'image/jpeg': 'imagen',
  'image/jpg':  'imagen',
  'image/png':  'imagen',
  'image/gif':  'imagen',
  'image/webp': 'imagen',
  'image/bmp':  'imagen',
  'image/tiff': 'imagen',
};

/** Extensiones soportadas (fallback cuando el browser no informa el MIME) */
const EXTENSIONES = {
  pdf: 'pdf', docx: 'docx', doc: 'docx', txt: 'texto',
  jpg: 'imagen', jpeg: 'imagen', png: 'imagen',
  gif: 'imagen', webp: 'imagen', bmp: 'imagen', tiff: 'imagen'
};

/** Tamaño máximo permitido por archivo */
export const MAX_MB = 15;

/**
 * Procesa un File y devuelve un objeto listo para enviar a la API.
 *
 * @param {File} file
 * @returns {Promise<{
 *   type: 'texto'|'imagen',
 *   content: string,        // texto extraído o base64
 *   filename: string,
 *   mimeType: string,
 *   previewUrl?: string,    // Data URL para imagen (solo type === 'imagen')
 *   pages?: number          // para PDFs
 * }>}
 */
export async function procesarArchivo(file) {
  const tipo = getTipo(file);

  if (!tipo) {
    throw new Error(
      `Tipo de archivo no soportado: ${file.name}\n` +
      `Formatos aceptados: PDF, Word (.docx), TXT, JPG, PNG, GIF, WEBP`
    );
  }

  if (file.size > MAX_MB * 1024 * 1024) {
    throw new Error(`"${file.name}" supera el límite de ${MAX_MB} MB.`);
  }

  switch (tipo) {
    case 'pdf':    return await procesarPdf(file);
    case 'docx':   return await procesarDocx(file);
    case 'texto':  return await procesarTexto(file);
    case 'imagen': return await procesarImagen(file);
  }
}

/**
 * Determina el tipo de procesamiento a partir del MIME type o extensión.
 */
function getTipo(file) {
  if (TIPOS_SOPORTADOS[file.type]) return TIPOS_SOPORTADOS[file.type];
  const ext = file.name.split('.').pop()?.toLowerCase();
  return EXTENSIONES[ext] || null;
}

// ─── Procesadores ───────────────────────────────────────────────────────────

async function procesarPdf(file) {
  if (!window.pdfjsLib) {
    throw new Error('PDF.js no cargado. Recargá la página.');
  }

  const buffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
  const totalPaginas = pdf.numPages;
  let textoCompleto = '';

  for (let i = 1; i <= totalPaginas; i++) {
    const page = await pdf.getPage(i);
    const contenido = await page.getTextContent();
    const textoPagina = contenido.items
      .map(item => item.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (textoPagina) {
      textoCompleto += `[Página ${i}/${totalPaginas}]\n${textoPagina}\n\n`;
    }
  }

  if (!textoCompleto.trim()) {
    throw new Error(
      `"${file.name}" no contiene texto extraíble (posiblemente es un PDF escaneado). ` +
      `Subí el documento como imagen (.jpg, .png) para que Dalmacio lo lea con visión.`
    );
  }

  return {
    type: 'texto',
    content: textoCompleto.trim(),
    filename: file.name,
    mimeType: 'application/pdf',
    pages: totalPaginas
  };
}

async function procesarDocx(file) {
  if (!window.mammoth) {
    throw new Error('Mammoth.js no cargado. Recargá la página.');
  }

  const buffer = await file.arrayBuffer();
  const resultado = await window.mammoth.extractRawText({ arrayBuffer: buffer });

  if (!resultado.value?.trim()) {
    throw new Error(`"${file.name}" está vacío o no contiene texto extraíble.`);
  }

  return {
    type: 'texto',
    content: resultado.value.trim(),
    filename: file.name,
    mimeType: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
}

async function procesarTexto(file) {
  const texto = await file.text();
  if (!texto.trim()) {
    throw new Error(`"${file.name}" está vacío.`);
  }
  return {
    type: 'texto',
    content: texto.trim(),
    filename: file.name,
    mimeType: 'text/plain'
  };
}

async function procesarImagen(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      // La API espera solo el dato base64, sin el prefijo "data:image/...;base64,"
      const base64 = dataUrl.split(',')[1];
      // Normalizar MIME type (algunos browsers reportan 'image/jpg' no estándar)
      const mimeType = file.type === 'image/jpg' ? 'image/jpeg' : (file.type || 'image/jpeg');

      resolve({
        type: 'imagen',
        content: base64,
        filename: file.name,
        mimeType,
        previewUrl: dataUrl      // Para mostrar miniatura en el chat
      });
    };
    reader.onerror = () => reject(new Error(`No se pudo leer la imagen: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

/**
 * Formatea un archivo procesado como bloque de texto para incluir en el prompt.
 * Usado para archivos de tipo 'texto' (PDF, Word, TXT).
 * @param {Object} archivoProcessado
 * @returns {string}
 */
export function formatearComoTexto(archivoProcesado) {
  const { filename, content, pages } = archivoProcesado;
  const infoExtra = pages ? ` (${pages} páginas)` : '';
  return `\n\n═══ DOCUMENTO ADJUNTO: ${filename}${infoExtra} ═══\n${content}\n═══ FIN DEL DOCUMENTO ═══\n`;
}
