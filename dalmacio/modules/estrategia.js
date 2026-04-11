/**
 * modules/estrategia.js — Módulo de Estrategia Procesal
 * Estudio Jurídico Manulis — San Isidro, Provincia de Buenos Aires
 *
 * Genera una hoja de ruta procesal paso a paso a partir del caso activo,
 * indicando urgencia, riesgos y alternativas en cada etapa.
 */

import { callApi } from "../dalmacio.js";
import { templateEstrategia } from "../prompts/templates.js";

/**
 * Genera una estrategia procesal para el caso activo.
 *
 * @param {string} userInput — objetivo del cliente o instrucción específica
 * @param {Object} caseContext — contexto del caso activo
 * @param {Array} historialMensajes — historial de la API para contexto
 * @returns {Promise<string>} — hoja de ruta procesal estructurada
 */
export async function estrategia(userInput, caseContext, historialMensajes = []) {
  // Extraer el objetivo del cliente del input o usar uno genérico
  const objetivo = userInput?.trim()
    ? userInput
    : "Maximizar la recuperación de créditos laborales / obtener la mejor resolución posible para el cliente.";

  // Construir el prompt para este módulo
  // El "análisis previo" puede provenir del último mensaje del asistente si lo hay
  const analisisPrevio = extraerAnalisisPrevio(historialMensajes);

  const promptUsuario = templateEstrategia(objetivo, analisisPrevio, caseContext);

  // Llamar a la API
  const respuesta = await callApi(promptUsuario, historialMensajes);
  return respuesta;
}

/**
 * Intenta extraer el último análisis generado del historial de mensajes.
 * Útil para que la estrategia tenga en cuenta el análisis previo.
 * @param {Array} historial
 * @returns {string|null}
 */
function extraerAnalisisPrevio(historial) {
  if (!historial || historial.length === 0) return null;

  // Buscar el último mensaje del asistente que parezca un análisis
  for (let i = historial.length - 1; i >= 0; i--) {
    const msg = historial[i];
    if (
      msg.role === "assistant" &&
      (msg.content.includes("Hechos relevantes") ||
       msg.content.includes("Marco legal") ||
       msg.content.includes("Posibles acciones"))
    ) {
      // Limitar a 1500 chars para no sobrecargar el prompt
      return msg.content.substring(0, 1500) + (msg.content.length > 1500 ? "..." : "");
    }
  }
  return null;
}
