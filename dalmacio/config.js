/**
 * config.js — Configuración global de Dalmacio
 * Estudio Jurídico Manulis — San Isidro, Provincia de Buenos Aires
 *
 * La API key NUNCA se hardcodea aquí. Se lee de:
 *   1. sessionStorage bajo la clave "dalmacio_api_key" (cargada por el usuario en UI)
 *   2. Si hay backend Node.js: process.env.ANTHROPIC_API_KEY
 */

export const CONFIG = {
  // Modelo Claude a utilizar
  MODEL: "claude-sonnet-4-20250514",

  // Endpoint de la API de Anthropic
  API_ENDPOINT: "https://api.anthropic.com/v1/messages",

  // Versión de la API (requerida en el header)
  ANTHROPIC_VERSION: "2023-06-01",

  // Tokens máximos en la respuesta
  MAX_TOKENS: 8192,

  // Temperatura (0 = determinístico, 1 = creativo)
  // Para redacción legal preferimos baja temperatura
  TEMPERATURE: 0.3,

  // Clave de sessionStorage donde se guarda la API key
  API_KEY_STORAGE: "dalmacio_api_key",

  // Prefijo de localStorage para contextos de caso
  CASE_PREFIX: "dalmacio_case_",

  // Versión del agente
  VERSION: "1.0.0",

  // Nombre del estudio (para encabezados y branding)
  ESTUDIO: "Estudio Jurídico Manulis",
  SEDE: "San Isidro, Provincia de Buenos Aires",

  // Caso demo precargado
  DEMO_CASE: {
    caseId: "demo-001",
    cliente: "Juan Pérez",
    expediente: "PL-XXXX-2025",
    juzgado: "Tribunal de Trabajo N°3 de San Isidro",
    fuero: "laboral",
    jurisdiccion: "Departamento Judicial San Isidro",
    materia: "Despido sin causa — Diferencias salariales — Horas extras",
    hechos: `Juan Pérez trabajó como operario en Empresa XYZ S.A. desde el 01/03/2018 hasta el 15/02/2025, fecha en que fue despedido sin causa mediante telegrama. Remuneración al despido: $850.000 mensuales. La empresa no abonó la liquidación final ni el certificado de trabajo. Trabajaba 10 horas diarias sin cobrar horas extras desde 2022.`,
    historial: []
  }
};

/**
 * Obtiene la API key del sessionStorage.
 * Retorna null si no está configurada.
 */
export function getApiKey() {
  return sessionStorage.getItem(CONFIG.API_KEY_STORAGE) || null;
}

/**
 * Guarda la API key en sessionStorage.
 * @param {string} key
 */
export function setApiKey(key) {
  sessionStorage.setItem(CONFIG.API_KEY_STORAGE, key.trim());
}

/**
 * Elimina la API key de sessionStorage.
 */
export function clearApiKey() {
  sessionStorage.removeItem(CONFIG.API_KEY_STORAGE);
}
