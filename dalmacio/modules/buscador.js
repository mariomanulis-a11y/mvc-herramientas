/**
 * modules/buscador.js — Conexión con bases de datos jurídicas externas
 * Estudio Jurídico Manulis — San Isidro, Provincia de Buenos Aires
 *
 * Estrategia (sitio estático, sin backend):
 *   1. Intenta consultar la API pública de SAIJ (puede fallar por CORS).
 *   2. Si falla, usa Claude como fuente de conocimiento.
 *   3. Siempre genera links directos a las bases de datos oficiales.
 *
 * Para búsqueda en tiempo real con resultados garantizados se requiere
 * un backend proxy (ver roadmap en README_DALMACIO.md).
 */

import { callApi } from "../dalmacio.js";
import { templateNormativa } from "../prompts/templates.js";

// ─── Bases de datos registradas ─────────────────────────────────────────────

export const BASES_DATOS = [
  {
    id:          "saij",
    nombre:      "SAIJ",
    descripcion: "Sistema Argentino de Información Jurídica — Legislación, doctrina y jurisprudencia",
    url:         "https://www.saij.gob.ar/search?q=",
    apiUrl:      "https://www.saij.gob.ar/buscador/list.json?q=",
    icono:       "🏛️",
    categorias:  ["legislacion", "jurisprudencia", "doctrina"]
  },
  {
    id:          "infojus",
    nombre:      "InfoJus",
    descripcion: "Doctrina jurídica — Portal del Ministerio de Justicia",
    url:         "https://www.infojus.gob.ar/search?q=",
    icono:       "📖",
    categorias:  ["doctrina"]
  },
  {
    id:          "csjn",
    nombre:      "CSJN — Fallos",
    descripcion: "Fallos de la Corte Suprema de Justicia de la Nación",
    url:         "https://sj.csjn.gov.ar/sj/sumaAnt.do?method=busqueda&toXml=1&texto=",
    icono:       "⚖️",
    categorias:  ["jurisprudencia"]
  },
  {
    id:          "scba",
    nombre:      "SCBA — JUBA",
    descripcion: "Jurisprudencia de la Suprema Corte de Buenos Aires",
    url:         "https://juba.scba.gov.ar/VerTextoCompleto.aspx?idFallo=",
    searchUrl:   "https://juba.scba.gov.ar/Busqueda.aspx?s=",
    icono:       "🏢",
    categorias:  ["jurisprudencia"]
  },
  {
    id:          "pjn",
    nombre:      "PJN — Consulta",
    descripcion: "Poder Judicial de la Nación — Consulta de expedientes y acordadas",
    url:         "https://www.pjn.gov.ar/Servicios/Consultas/",
    icono:       "🔍",
    categorias:  ["expedientes"]
  },
  {
    id:          "infoleg",
    nombre:      "InfoLEG",
    descripcion: "Centro de Documentación e Información — Legislación nacional vigente",
    url:         "http://www.infoleg.gob.ar/infolegInternet/buscar.do?buscar=",
    icono:       "📋",
    categorias:  ["legislacion"]
  }
];

// ─── Búsqueda principal ──────────────────────────────────────────────────────

/**
 * Realiza una búsqueda en bases de datos jurídicas.
 * Combina el conocimiento de Claude con links directos a fuentes oficiales.
 *
 * @param {string} query — término o frase de búsqueda
 * @param {Object} caseContext — contexto del caso activo
 * @param {Array} historialMensajes — historial de la API
 * @returns {Promise<string>} — respuesta con contenido + links
 */
export async function buscarEnBaseDatos(query, caseContext, historialMensajes = []) {
  if (!query?.trim()) {
    return "Por favor, ingresá un término de búsqueda (ej: 'art. 245 LCT', 'Vizzoti CSJN', 'Ley 24013').";
  }

  // Intentar SAIJ API (puede fallar por CORS en sitio estático)
  const resultadoSAIJ = await intentarSAIJ(query);

  // Generar links de búsqueda directa
  const linksMarkdown = generarLinksMarkdown(query);

  // Construir prompt enriquecido para Claude
  const promptEnriquecido =
    templateNormativa(query, caseContext) +
    `\n\nAdemás, al final de tu respuesta agregá esta sección EXACTAMENTE así:\n\n` +
    `---\n**🔍 Verificar en fuentes oficiales:**\n${linksMarkdown}`;

  // Obtener respuesta de Claude
  const respuestaClaude = await callApi(promptEnriquecido, historialMensajes);

  // Si SAIJ respondió, agregar al principio
  if (resultadoSAIJ) {
    return `**📡 Resultado de SAIJ:**\n${resultadoSAIJ}\n\n---\n\n${respuestaClaude}`;
  }

  return respuestaClaude;
}

/**
 * Genera los links de búsqueda en markdown para todas las bases de datos.
 * @param {string} query
 * @returns {string}
 */
export function generarLinksMarkdown(query) {
  const encoded = encodeURIComponent(query);
  return BASES_DATOS.map(db => {
    const url = (db.searchUrl || db.url) + encoded;
    return `- [${db.icono} **${db.nombre}**](${url}) — ${db.descripcion}`;
  }).join('\n');
}

/**
 * Genera HTML con botones de link para el panel de bases de datos.
 * @param {string} query
 * @returns {string}
 */
export function generarBotonesHTML(query) {
  const encoded = encodeURIComponent(query);
  return BASES_DATOS.map(db => {
    const url = (db.searchUrl || db.url) + encoded;
    return `<a href="${url}" target="_blank" rel="noopener" class="db-btn" title="${db.descripcion}">
      <span>${db.icono}</span> ${db.nombre}
    </a>`;
  }).join('');
}

// ─── Intento de API de SAIJ ──────────────────────────────────────────────────

/**
 * Intenta consultar la API pública de SAIJ.
 * Retorna un resumen de los resultados o null si falla (CORS esperado).
 *
 * @param {string} query
 * @returns {Promise<string|null>}
 */
async function intentarSAIJ(query) {
  try {
    const url = `https://www.saij.gob.ar/buscador/list.json?q=${encodeURIComponent(query)}&c=legislacion&l=3&o=0`;
    const resp = await fetch(url, {
      mode: 'cors',
      signal: AbortSignal.timeout(4000)   // timeout de 4 segundos
    });

    if (!resp.ok) return null;
    const data = await resp.json();

    if (!data?.result?.length) return null;

    // Formatear los primeros resultados
    return data.result
      .slice(0, 3)
      .map((item, i) =>
        `${i + 1}. **${item.titulo || item.title || 'Sin título'}**\n   ${item.resumen || item.summary || ''}`
      )
      .join('\n\n');

  } catch {
    // CORS, timeout, o red — fallo silencioso esperado
    return null;
  }
}
