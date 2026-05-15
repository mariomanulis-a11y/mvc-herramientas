/**
 * context.js — Gestión de memoria por caso (localStorage)
 * Estudio Jurídico Manulis — San Isidro, Provincia de Buenos Aires
 *
 * Cada caso se almacena como un objeto JSON serializado bajo la clave
 * "dalmacio_case_{caseId}" en el localStorage del navegador.
 */

import { CONFIG } from "./config.js";

// ─── Usuario activo (inyectado por dalmacio.js al iniciar) ────────────────────
let _activeUserId = null;

/**
 * Establece el usuario activo para que todas las operaciones de casos
 * queden aisladas por abogado.
 * @param {string|null} userId
 */
export function setContextUser(userId) {
  _activeUserId = userId || null;
}

/** Retorna el prefijo de clave localStorage para el usuario activo. */
function getCaseKey(caseId) {
  const userSeg = _activeUserId ? _activeUserId + "_" : "";
  return CONFIG.CASE_PREFIX + userSeg + caseId;
}

/**
 * Estructura base de un caso vacío.
 * @param {string} caseId
 * @returns {Object}
 */
export function createEmptyCase(caseId) {
  return {
    caseId,
    cliente: "",
    expediente: "",
    juzgado: "",
    fuero: "laboral",         // "laboral" | "civil" | "comercial" | "consumidor" | "otro"
    jurisdiccion: "Departamento Judicial San Isidro",
    materia: "",
    hechos: "",
    historial: [],            // array de { role, content, timestamp }
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString()
  };
}

/**
 * Guarda o actualiza el contexto de un caso en localStorage.
 * @param {string} caseId
 * @param {Object} data — objeto con los campos del caso (parcial o completo)
 */
export function saveCaseContext(caseId, data) {
  const key = getCaseKey(caseId);
  const existing = getCaseContext(caseId) || createEmptyCase(caseId);
  const updated = {
    ...existing,
    ...data,
    caseId,                                           // asegurar que no se sobreescriba
    userId: _activeUserId || existing.userId || null, // etiquetar con el usuario activo
    actualizadoEn: new Date().toISOString()
  };
  localStorage.setItem(key, JSON.stringify(updated));
  return updated;
}

/**
 * Recupera y parsea el contexto de un caso desde localStorage.
 * Retorna null si el caso no existe.
 * @param {string} caseId
 * @returns {Object|null}
 */
export function getCaseContext(caseId) {
  const key = getCaseKey(caseId);
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error(`[Dalmacio] Error al parsear contexto del caso ${caseId}:`, e);
    return null;
  }
}

/**
 * Agrega un mensaje al historial de conversación del caso.
 * @param {string} caseId
 * @param {"user"|"assistant"} role
 * @param {string} content
 */
export function appendToHistory(caseId, role, content) {
  const ctx = getCaseContext(caseId);
  if (!ctx) {
    console.warn(`[Dalmacio] No se encontró el caso ${caseId} para agregar al historial.`);
    return;
  }
  ctx.historial.push({
    role,
    content,
    timestamp: new Date().toISOString()
  });
  saveCaseContext(caseId, ctx);
}

/**
 * Retorna todos los caseId guardados en localStorage.
 * @returns {string[]}
 */
export function listCases() {
  const ids = [];
  // Determinar el prefijo del usuario activo
  const userPrefix = _activeUserId
    ? CONFIG.CASE_PREFIX + _activeUserId + "_"
    : CONFIG.CASE_PREFIX;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    if (_activeUserId) {
      // Con usuario activo: mostrar solo sus casos
      if (key.startsWith(userPrefix)) {
        ids.push(key.replace(userPrefix, ""));
      }
    } else {
      // Sin usuario: mostrar todos los casos genéricos (sin segmento de userId)
      if (key.startsWith(CONFIG.CASE_PREFIX)) {
        const rest = key.replace(CONFIG.CASE_PREFIX, "");
        // Excluir claves que pertenecen a un usuario (contienen prefijo "u...+_")
        if (!/^u[a-z0-9]+_/.test(rest)) {
          ids.push(rest);
        }
      }
    }
  }
  return ids;
}

/**
 * Retorna todos los casos como objetos completos.
 * @returns {Object[]}
 */
export function getAllCases() {
  return listCases().map(id => getCaseContext(id)).filter(Boolean);
}

/**
 * Elimina un caso del localStorage.
 * @param {string} caseId
 */
export function clearCase(caseId) {
  const key = getCaseKey(caseId);
  localStorage.removeItem(key);
}

/**
 * Limpia el historial de conversación de un caso sin eliminar los datos del caso.
 * @param {string} caseId
 */
export function clearHistory(caseId) {
  const ctx = getCaseContext(caseId);
  if (!ctx) return;
  ctx.historial = [];
  saveCaseContext(caseId, ctx);
}

/**
 * Construye el array de mensajes para la API de Anthropic a partir del historial.
 * Incluye el contexto del caso como primer mensaje del usuario.
 * @param {Object} caseContext — contexto completo del caso
 * @param {string} contextMessage — mensaje de contexto generado por buildCaseContextMessage()
 * @returns {Array} — array de { role, content }
 */
export function buildMessagesFromHistory(caseContext, contextMessage) {
  const messages = [];

  // Primer mensaje: contexto del caso (inyectado como mensaje de usuario)
  if (contextMessage) {
    messages.push({
      role: "user",
      content: contextMessage
    });
    messages.push({
      role: "assistant",
      content: "Contexto del caso cargado correctamente. Estoy listo para asistirte en este expediente."
    });
  }

  // Historial de la conversación actual
  if (caseContext?.historial) {
    for (const entry of caseContext.historial) {
      messages.push({
        role: entry.role,
        content: entry.content
      });
    }
  }

  return messages;
}
