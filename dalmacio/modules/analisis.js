/**
 * modules/analisis.js — Módulo de Análisis Jurídico
 * Estudio Jurídico Manulis — San Isidro, Provincia de Buenos Aires
 *
 * Analiza hechos descriptos en lenguaje libre e identifica:
 * - Hechos jurídicamente relevantes
 * - Marco normativo aplicable
 * - Posibles acciones legales con probabilidad de éxito
 * - Plazos de prescripción
 * - Riesgos y contingencias procesales
 */

import { callApi } from "../dalmacio.js";
import { templateAnalisis } from "../prompts/templates.js";

/**
 * Analiza los hechos de un caso y genera un informe jurídico estructurado.
 *
 * @param {string} userInput — descripción libre de los hechos (puede ser el campo
 *                             "hechos" del caso o una consulta puntual)
 * @param {Object} caseContext — contexto del caso activo
 * @param {Array} historialMensajes — historial de la API para contexto
 * @returns {Promise<string>} — análisis jurídico estructurado
 */
export async function analizar(userInput, caseContext, historialMensajes = []) {
  // Si el usuario no ingresó hechos y hay hechos en el contexto, usarlos
  const hechosAAnalizar = userInput?.trim()
    ? userInput
    : caseContext?.hechos || "No se proporcionaron hechos para analizar.";

  // Construir el prompt para este módulo
  const promptUsuario = templateAnalisis(hechosAAnalizar, caseContext);

  // Llamar a la API
  const respuesta = await callApi(promptUsuario, historialMensajes);
  return respuesta;
}
