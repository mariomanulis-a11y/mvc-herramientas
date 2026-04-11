/**
 * ui/export.js — Exportación de documentos generados por Dalmacio
 * Estudio Jurídico Manulis — San Isidro, Provincia de Buenos Aires
 *
 * Soporta exportación a:
 * - .txt (siempre disponible, sin dependencias)
 * - .docx (requiere docx.js — carga dinámica si está disponible)
 */

/**
 * Exporta el contenido como archivo .txt.
 * @param {string} content — texto plano a exportar
 * @param {string} filename — nombre del archivo (sin extensión)
 */
export function exportTxt(content, filename = "dalmacio-output") {
  // Limpiar el HTML si el contenido viene renderizado
  const plainText = htmlToPlainText(content);

  const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, `${sanitizeFilename(filename)}.txt`);
}

/**
 * Exporta el contenido como archivo .docx usando docx.js.
 * Si docx.js no está disponible, cae silenciosamente a .txt.
 * @param {string} content — texto a exportar
 * @param {string} filename — nombre del archivo (sin extensión)
 * @param {Object} caseContext — contexto del caso (para metadatos)
 */
export async function exportDocx(content, filename = "dalmacio-output", caseContext = null) {
  // Verificar si docx.js está disponible (carga CDN opcional)
  if (typeof window !== "undefined" && window.docx) {
    try {
      await generateDocx(content, filename, caseContext);
      return;
    } catch (e) {
      console.warn("[Dalmacio] Error al generar .docx, fallback a .txt:", e);
    }
  }
  // Fallback a TXT
  exportTxt(content, filename);
}

/**
 * Genera el archivo .docx usando la librería docx.js.
 * @param {string} content
 * @param {string} filename
 * @param {Object} caseContext
 */
async function generateDocx(content, filename, caseContext) {
  const { Document, Paragraph, TextRun, HeadingLevel, Packer } = window.docx;

  const plainText = htmlToPlainText(content);
  const lines = plainText.split("\n");

  const paragraphs = [];

  // Encabezado del estudio
  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: "ESTUDIO JURÍDICO MANULIS", bold: true, size: 28 })],
      heading: HeadingLevel.HEADING_1
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [new TextRun({ text: "San Isidro, Provincia de Buenos Aires", size: 20, italics: true })]
    })
  );

  // Datos del caso si están disponibles
  if (caseContext) {
    paragraphs.push(new Paragraph({ children: [new TextRun({ text: "" })] })); // separador
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({ text: `Cliente: ${caseContext.cliente || "—"}  |  Expediente: ${caseContext.expediente || "—"}`, size: 18 })
      ]
    }));
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({ text: `Juzgado: ${caseContext.juzgado || "—"}  |  Materia: ${caseContext.materia || "—"}`, size: 18 })
      ]
    }));
  }

  // Separador
  paragraphs.push(new Paragraph({ children: [new TextRun({ text: "─".repeat(60) })] }));
  paragraphs.push(new Paragraph({ children: [new TextRun({ text: "" })] }));

  // Contenido principal
  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("# ")) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: trimmed.replace(/^#+\s*/, ""), bold: true, size: 26 })],
        heading: HeadingLevel.HEADING_1
      }));
    } else if (trimmed.startsWith("## ")) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: trimmed.replace(/^#+\s*/, ""), bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_2
      }));
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: trimmed.replace(/\*\*/g, ""), bold: true })]
      }));
    } else if (trimmed === "") {
      paragraphs.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
    } else {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: trimmed })]
      }));
    }
  }

  // Pie de página con timestamp
  paragraphs.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
  paragraphs.push(new Paragraph({
    children: [new TextRun({
      text: `Generado por Dalmacio — ${new Date().toLocaleString("es-AR")}`,
      size: 16,
      italics: true,
      color: "888888"
    })]
  }));

  const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
  const buffer = await Packer.toBlob(doc);
  downloadBlob(buffer, `${sanitizeFilename(filename)}.docx`);
}

/**
 * Descarga un Blob como archivo.
 * @param {Blob} blob
 * @param {string} filename
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Convierte HTML a texto plano eliminando etiquetas.
 * @param {string} html
 * @returns {string}
 */
function htmlToPlainText(html) {
  if (!html) return "";
  // Usar el DOM para extraer texto limpio
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  // Reemplazar <br> y <p> con saltos de línea antes de extraer texto
  tempDiv.querySelectorAll("br").forEach(br => br.replaceWith("\n"));
  tempDiv.querySelectorAll("p, div, h1, h2, h3, h4, li").forEach(el => {
    el.insertAdjacentText("afterend", "\n");
  });
  return tempDiv.textContent || tempDiv.innerText || "";
}

/**
 * Sanitiza el nombre de archivo para uso seguro en el sistema.
 * @param {string} name
 * @returns {string}
 */
function sanitizeFilename(name) {
  return name
    .replace(/[^a-zA-Z0-9_\-áéíóúÁÉÍÓÚñÑ\s]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 80);
}

/**
 * Retorna el nombre de archivo sugerido para el último output.
 * @param {Object} caseContext — contexto del caso activo
 * @param {string} modulo — nombre del módulo que generó el output
 * @returns {string}
 */
export function suggestFilename(caseContext, modulo = "output") {
  const fecha = new Date().toISOString().split("T")[0];
  const cliente = caseContext?.cliente?.split(" ")[0] || "caso";
  return `dalmacio_${modulo}_${cliente}_${fecha}`;
}
