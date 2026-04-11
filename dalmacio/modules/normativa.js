/**
 * modules/normativa.js — Módulo de Consulta Normativa
 * Estudio Jurídico Manulis — San Isidro, Provincia de Buenos Aires
 *
 * Permite consultar leyes, artículos específicos o temas jurídicos.
 * Siempre advierte si la información puede estar desactualizada y
 * recomienda verificación en SAIJ / Microjuris / InfoJus.
 */

import { callApi } from "../dalmacio.js";
import { templateNormativa } from "../prompts/templates.js";

/**
 * Consultas rápidas predefinidas (accesos frecuentes en materia laboral).
 * Pueden mostrarse como botones de acceso rápido en la UI.
 */
export const CONSULTAS_RAPIDAS = [
  { label: "Art. 245 LCT — Indemnización por despido", query: "Artículo 245 LCT — fórmula de indemnización por despido sin causa" },
  { label: "Art. 232 LCT — Preaviso", query: "Artículo 232 LCT — preaviso y sus requisitos" },
  { label: "Art. 233 LCT — Integración mes de despido", query: "Artículo 233 LCT — integración del mes de despido" },
  { label: "Art. 80 LCT — Certificado de trabajo", query: "Artículo 80 LCT — multa por falta de entrega de certificado de trabajo" },
  { label: "Art. 132 bis LCT — Aportes retenidos", query: "Artículo 132 bis LCT — multa por retención de aportes" },
  { label: "Ley 25.323 — Doble indemnización", query: "Ley 25.323 — incremento indemnizatorio, artículos 1 y 2" },
  { label: "Ley 24.013 — Registración", query: "Ley 24.013 — artículos 8, 9 y 10 — multas por trabajo no registrado o deficientemente registrado" },
  { label: "Art. 256 LCT — Prescripción", query: "Artículo 256 LCT — plazo de prescripción de créditos laborales" },
  { label: "Art. 201 LCT — Horas extras", query: "Artículo 201 LCT — recargo por horas extras" },
  { label: "Fallo Vizzoti CSJN", query: "Fallo Vizzoti CSJN — límite al SMVYM en el cálculo del art. 245 LCT" }
];

/**
 * Consulta normativa sobre una ley, artículo o tema jurídico.
 *
 * @param {string} userInput — consulta del usuario (nombre de ley, artículo, tema)
 * @param {Object} caseContext — contexto del caso activo
 * @param {Array} historialMensajes — historial de la API para contexto
 * @returns {Promise<string>} — resumen normativo estructurado
 */
export async function normativa(userInput, caseContext, historialMensajes = []) {
  if (!userInput?.trim()) {
    return "Por favor, especificá la ley, artículo o tema jurídico que querés consultar.";
  }

  // Construir el prompt para este módulo
  const promptUsuario = templateNormativa(userInput, caseContext);

  // Llamar a la API
  const respuesta = await callApi(promptUsuario, historialMensajes);
  return respuesta;
}
