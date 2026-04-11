/**
 * modules/checklist.js — Módulo de Generación de Checklists
 * Estudio Jurídico Manulis — San Isidro, Provincia de Buenos Aires
 *
 * Genera checklists accionables por tipo de acción legal, ordenados
 * cronológicamente con plazos críticos y documentación requerida.
 */

import { callApi } from "../dalmacio.js";
import { templateChecklist } from "../prompts/templates.js";

/**
 * Tipos de acciones legales predefinidas para el selector de UI.
 */
export const TIPOS_ACCION = [
  { value: "despido_sin_causa",    label: "Despido sin causa (LCT)" },
  { value: "despido_indirecto",    label: "Despido indirecto" },
  { value: "accidente_trabajo",    label: "Accidente de trabajo / enfermedad profesional" },
  { value: "horas_extras",         label: "Reclamo de horas extras" },
  { value: "trabajo_no_registrado",label: "Trabajo no registrado (Ley 24.013)" },
  { value: "reclamo_consumidor",   label: "Reclamo de consumidor (Ley 24.240)" },
  { value: "accidente_transito",   label: "Accidente de tránsito (daños y perjuicios)" },
  { value: "cobro_deuda",          label: "Cobro de deuda civil / comercial" },
  { value: "mediacion_previa",     label: "Mediación prejudicial obligatoria" },
  { value: "embargo_preventivo",   label: "Medida cautelar / embargo preventivo" },
  { value: "certificado_trabajo",  label: "Multa art. 80 LCT — certificado de trabajo" },
  { value: "otro",                 label: "Otro (especificar)" }
];

/**
 * Genera un checklist accionable para el tipo de acción legal indicado.
 *
 * @param {string} userInput — tipo de acción o descripción libre
 * @param {Object} caseContext — contexto del caso activo
 * @param {Array} historialMensajes — historial de la API para contexto
 * @returns {Promise<string>} — checklist estructurado y accionable
 */
export async function checklist(userInput, caseContext, historialMensajes = []) {
  // Determinar el tipo de acción: puede venir del selector o del texto libre
  const tipoAccion = userInput?.trim()
    ? userInput
    : inferirTipoAccion(caseContext);

  // Construir el prompt para este módulo
  const promptUsuario = templateChecklist(tipoAccion, caseContext);

  // Llamar a la API
  const respuesta = await callApi(promptUsuario, historialMensajes);
  return respuesta;
}

/**
 * Infiere el tipo de acción a partir del contexto del caso.
 * @param {Object} caseContext
 * @returns {string}
 */
function inferirTipoAccion(caseContext) {
  if (!caseContext?.materia) {
    return "Acción laboral general (especificar tipo)";
  }
  const materia = caseContext.materia.toLowerCase();

  if (materia.includes("despido sin causa")) return "Despido sin causa (LCT art. 245)";
  if (materia.includes("despido indirecto")) return "Despido indirecto";
  if (materia.includes("accidente")) return "Accidente de trabajo / Ley de Riesgos del Trabajo";
  if (materia.includes("horas extras")) return "Reclamo de horas extras (art. 201 LCT)";
  if (materia.includes("consumidor")) return "Reclamo de consumidor (Ley 24.240)";
  if (materia.includes("daños")) return "Daños y perjuicios";

  // Retornar la materia tal como está
  return caseContext.materia;
}
