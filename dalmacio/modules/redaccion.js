/**
 * modules/redaccion.js — Módulo de Redacción de Escritos Judiciales
 * Estudio Jurídico Manulis — San Isidro, Provincia de Buenos Aires
 *
 * Genera escritos judiciales y documentos legales formales con formato
 * argentino estándar. Soporta múltiples tipos de documentos.
 */

import { callApi } from "../dalmacio.js";
import { templateRedaccion } from "../prompts/templates.js";

/**
 * Tipos de escritos soportados por el módulo.
 * Usado para el selector de UI y para orientar al LLM.
 */
export const TIPOS_ESCRITO = [
  { value: "demanda_laboral",       label: "Demanda laboral" },
  { value: "demanda_civil",         label: "Demanda civil" },
  { value: "demanda_consumidor",    label: "Demanda — Defensa del consumidor" },
  { value: "contestacion",         label: "Contestación de demanda" },
  { value: "carta_documento",      label: "Carta documento" },
  { value: "recurso_apelacion",    label: "Recurso de apelación" },
  { value: "recurso_queja",        label: "Recurso de queja" },
  { value: "memorial",             label: "Memorial" },
  { value: "escrito_mediacion",    label: "Escrito de mediación previa" },
  { value: "liquidacion",          label: "Planilla de liquidación" },
  { value: "otro",                 label: "Otro (especificar en instrucciones)" }
];

/**
 * Genera un escrito judicial o documento legal.
 *
 * @param {string} userInput — instrucción del usuario (puede incluir tipo o ser libre)
 * @param {Object} caseContext — contexto del caso activo
 * @param {Array} historialMensajes — historial de la API (para contexto)
 * @returns {Promise<string>} — texto del escrito generado
 */
export async function redactar(userInput, caseContext, historialMensajes = []) {
  // Detectar tipo de escrito a partir del input o usar genérico
  const tipoDetectado = detectarTipoEscrito(userInput);

  // Construir el prompt del usuario para este módulo
  const promptUsuario = templateRedaccion(
    tipoDetectado,
    userInput,
    caseContext
  );

  // Llamar a la API con el prompt construido
  const respuesta = await callApi(promptUsuario, historialMensajes);
  return respuesta;
}

/**
 * Detecta el tipo de escrito a partir del texto libre del usuario.
 * Retorna un label descriptivo para orientar al LLM.
 * @param {string} input
 * @returns {string}
 */
function detectarTipoEscrito(input) {
  const lower = input.toLowerCase();

  if (lower.includes("carta documento") || lower.includes("cd ")) {
    return "Carta Documento";
  }
  if (lower.includes("demanda laboral") || lower.includes("fuero laboral")) {
    return "Demanda Laboral";
  }
  if (lower.includes("demanda civil")) {
    return "Demanda Civil";
  }
  if (lower.includes("demanda") && (lower.includes("consumidor") || lower.includes("24.240"))) {
    return "Demanda — Defensa del Consumidor (Ley 24.240)";
  }
  if (lower.includes("demanda")) {
    return "Demanda (precisar fuero según instrucciones)";
  }
  if (lower.includes("contestaci")) {
    return "Contestación de Demanda";
  }
  if (lower.includes("apelaci")) {
    return "Recurso de Apelación";
  }
  if (lower.includes("queja")) {
    return "Recurso de Queja";
  }
  if (lower.includes("memorial")) {
    return "Memorial";
  }
  if (lower.includes("mediaci")) {
    return "Escrito de Mediación Previa";
  }
  if (lower.includes("liquidaci")) {
    return "Planilla de Liquidación";
  }

  // Si no detecta, retorna el input original como tipo
  return `Escrito jurídico: ${input.substring(0, 80)}`;
}
