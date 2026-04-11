/**
 * dalmacio.js — Orquestador central del agente jurídico Dalmacio
 * Estudio Jurídico Manulis — San Isidro, Provincia de Buenos Aires
 *
 * Coordina el flujo entre: UI ↔ Módulos ↔ API de Anthropic ↔ Contexto.
 * Es el punto de entrada principal de la aplicación.
 */

import { CONFIG, getApiKey, setApiKey } from "./config.js";
import { SYSTEM_PROMPT, buildCaseContextMessage } from "./prompts/system_prompt.js";
import {
  getCaseContext,
  appendToHistory,
  buildMessagesFromHistory
} from "./context.js";
import { initSidebar, loadCaseIntoForm, renderCaseList } from "./ui/sidebar.js";
import {
  appendMessage,
  updateMessage,
  clearChat,
  showError,
  showWelcome,
  setupChatInput,
  setChatInputDisabled
} from "./ui/chat.js";
import { exportTxt, exportDocx, suggestFilename } from "./ui/export.js";
import { redactar } from "./modules/redaccion.js";
import { analizar } from "./modules/analisis.js";
import { estrategia } from "./modules/estrategia.js";
import { normativa } from "./modules/normativa.js";
import { checklist } from "./modules/checklist.js";

// ─── Estado global del orquestador ─────────────────────────────────────────

/** Contexto del caso actualmente activo */
let activeCaseContext = null;

/** Último output generado (para exportación) */
let lastOutput = { content: "", modulo: "output" };

/** Módulo activo en la toolbar */
let activeModule = "chat";

// ─── Inicialización ─────────────────────────────────────────────────────────

/**
 * Punto de entrada principal. Se llama desde index.html al cargar la página.
 */
export function init() {
  // Verificar que la API key esté configurada
  checkApiKeySetup();

  // Inicializar el sidebar con callback de cambio de caso
  initSidebar(onCaseChange);

  // Inicializar el chat input
  setupChatInput(handleUserInput);

  // Configurar botones de módulos en la toolbar
  setupModuleButtons();

  // Configurar botón de exportación
  setupExportButton();

  // Configurar botón de limpiar chat
  setupClearButton();

  // Configurar el modal de API key
  setupApiKeyModal();

  // Mostrar bienvenida
  showWelcome(null);
}

// ─── Gestión de API key ─────────────────────────────────────────────────────

function checkApiKeySetup() {
  if (!getApiKey()) {
    // Mostrar el modal de configuración si no hay key
    setTimeout(() => showApiKeyModal(), 500);
  }
}

function showApiKeyModal() {
  const modal = document.getElementById("api-key-modal");
  if (modal) modal.classList.add("visible");
}

function hideApiKeyModal() {
  const modal = document.getElementById("api-key-modal");
  if (modal) modal.classList.remove("visible");
}

function setupApiKeyModal() {
  const modal = document.getElementById("api-key-modal");
  const input = document.getElementById("api-key-input");
  const saveBtn = document.getElementById("btn-save-api-key");
  const openBtn = document.getElementById("btn-open-api-config");

  if (saveBtn && input) {
    saveBtn.addEventListener("click", () => {
      const key = input.value.trim();
      if (key.startsWith("sk-ant-")) {
        setApiKey(key);
        input.value = "";
        hideApiKeyModal();
        showWelcome(activeCaseContext?.cliente || null);
      } else {
        input.classList.add("input--error");
        setTimeout(() => input.classList.remove("input--error"), 1500);
      }
    });
  }

  if (openBtn) {
    openBtn.addEventListener("click", showApiKeyModal);
  }

  // Cerrar modal con Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideApiKeyModal();
  });

  // Cerrar modal al hacer click fuera
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) hideApiKeyModal();
    });
  }
}

// ─── Cambio de caso activo ──────────────────────────────────────────────────

/**
 * Callback invocado por el sidebar cuando el caso activo cambia.
 * @param {Object|null} caseContext
 */
function onCaseChange(caseContext) {
  activeCaseContext = caseContext;

  if (caseContext) {
    clearChat();
    showWelcome(caseContext.cliente || caseContext.caseId);
  }
}

// ─── Módulos — Toolbar ──────────────────────────────────────────────────────

/**
 * Configura los botones de la toolbar para cada módulo.
 */
function setupModuleButtons() {
  const moduleMap = {
    "btn-mod-redactar":   "redaccion",
    "btn-mod-analizar":   "analisis",
    "btn-mod-estrategia": "estrategia",
    "btn-mod-normativa":  "normativa",
    "btn-mod-checklist":  "checklist"
  };

  for (const [btnId, mod] of Object.entries(moduleMap)) {
    const btn = document.getElementById(btnId);
    if (!btn) continue;

    btn.addEventListener("click", () => {
      setActiveModule(mod);
      // Mostrar prompt de contexto al usuario
      appendMessage("assistant", getModulePrompt(mod));
    });
  }
}

/**
 * Establece el módulo activo y actualiza la UI.
 * @param {string} mod
 */
function setActiveModule(mod) {
  activeModule = mod;

  // Actualizar estado visual de los botones
  document.querySelectorAll(".toolbar__btn").forEach(btn => btn.classList.remove("active"));
  const activeBtn = document.getElementById(`btn-mod-${mod}`);
  if (activeBtn) activeBtn.classList.add("active");

  // Actualizar el label del módulo activo
  const label = document.getElementById("active-module-label");
  if (label) label.textContent = getModuleLabel(mod);
}

/**
 * Retorna el texto de prompt que se muestra al activar un módulo.
 * @param {string} mod
 * @returns {string}
 */
function getModulePrompt(mod) {
  const prompts = {
    redaccion:  "Módulo **Redacción** activado. ¿Qué escrito necesitás? Indicame el tipo (demanda, carta documento, recurso, etc.) y las instrucciones específicas.",
    analisis:   "Módulo **Análisis** activado. Describí los hechos del caso o confirmá que analizo los hechos cargados en el contexto activo.",
    estrategia: "Módulo **Estrategia** activado. Indicame el objetivo del cliente y diseñaré la hoja de ruta procesal.",
    normativa:  "Módulo **Normativa** activado. ¿Qué ley, artículo o tema jurídico querés consultar?",
    checklist:  "Módulo **Checklist** activado. ¿Para qué tipo de acción legal necesitás el checklist? (ej: despido sin causa, accidente de trabajo, etc.)"
  };
  return prompts[mod] || "¿En qué puedo asistirte?";
}

function getModuleLabel(mod) {
  const labels = {
    chat:       "Chat libre",
    redaccion:  "Redacción",
    analisis:   "Análisis",
    estrategia: "Estrategia",
    normativa:  "Normativa",
    checklist:  "Checklist"
  };
  return labels[mod] || "Chat";
}

// ─── Manejo del input del usuario ───────────────────────────────────────────

/**
 * Procesa el texto ingresado por el usuario y lo envía al módulo correcto.
 * @param {string} userText
 */
async function handleUserInput(userText) {
  if (!userText?.trim()) return;

  // Verificar API key
  if (!getApiKey()) {
    showApiKeyModal();
    return;
  }

  // Mostrar el mensaje del usuario en el chat
  appendMessage("user", userText);

  // Deshabilitar input mientras se procesa
  setChatInputDisabled(true);

  // Mostrar indicador de carga
  const loadingMsg = appendMessage("assistant", "", true);

  try {
    // Guardar en historial del caso activo
    if (activeCaseContext?.caseId) {
      appendToHistory(activeCaseContext.caseId, "user", userText);
    }

    // Construir el historial para la API
    const ctx = activeCaseContext
      ? getCaseContext(activeCaseContext.caseId) || activeCaseContext
      : null;

    const contextMessage = ctx ? buildCaseContextMessage(ctx) : "";
    const historialApi = buildMessagesFromHistory(ctx, contextMessage);

    // Rutear al módulo correcto
    let respuesta;
    switch (activeModule) {
      case "redaccion":
        respuesta = await redactar(userText, ctx, historialApi);
        break;
      case "analisis":
        respuesta = await analizar(userText, ctx, historialApi);
        break;
      case "estrategia":
        respuesta = await estrategia(userText, ctx, historialApi);
        break;
      case "normativa":
        respuesta = await normativa(userText, ctx, historialApi);
        break;
      case "checklist":
        respuesta = await checklist(userText, ctx, historialApi);
        break;
      default:
        // Chat libre — llamada directa a la API
        respuesta = await callApi(userText, historialApi);
    }

    // Actualizar el mensaje de carga con la respuesta
    updateMessage(loadingMsg, respuesta);

    // Guardar respuesta en el historial del caso
    if (activeCaseContext?.caseId) {
      appendToHistory(activeCaseContext.caseId, "assistant", respuesta);
    }

    // Guardar para exportación
    lastOutput = {
      content: respuesta,
      modulo: activeModule
    };

  } catch (error) {
    console.error("[Dalmacio] Error al procesar mensaje:", error);
    if (loadingMsg) loadingMsg.remove();
    showError(getFriendlyError(error));
  } finally {
    setChatInputDisabled(false);
    // Foco de vuelta al input
    document.getElementById("chat-input")?.focus();
  }
}

// ─── Exportación ────────────────────────────────────────────────────────────

function setupExportButton() {
  const exportTxtBtn = document.getElementById("btn-export-txt");
  const exportDocxBtn = document.getElementById("btn-export-docx");

  if (exportTxtBtn) {
    exportTxtBtn.addEventListener("click", () => {
      if (!lastOutput.content) {
        showError("No hay contenido para exportar. Generá un documento primero.");
        return;
      }
      const filename = suggestFilename(activeCaseContext, lastOutput.modulo);
      exportTxt(lastOutput.content, filename);
    });
  }

  if (exportDocxBtn) {
    exportDocxBtn.addEventListener("click", async () => {
      if (!lastOutput.content) {
        showError("No hay contenido para exportar. Generá un documento primero.");
        return;
      }
      const filename = suggestFilename(activeCaseContext, lastOutput.modulo);
      await exportDocx(lastOutput.content, filename, activeCaseContext);
    });
  }
}

// ─── Limpiar chat ────────────────────────────────────────────────────────────

function setupClearButton() {
  const btn = document.getElementById("btn-clear-chat");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (confirm("¿Limpiar el historial de conversación visible? Los datos del caso se mantienen.")) {
      clearChat();
      showWelcome(activeCaseContext?.cliente || null);
    }
  });
}

// ─── Llamada a la API de Anthropic ──────────────────────────────────────────

/**
 * Realiza una llamada a la API de Anthropic Claude.
 * Función exportada para uso desde los módulos.
 *
 * @param {string} userMessage — mensaje del usuario a enviar
 * @param {Array} previousMessages — historial previo de mensajes [{ role, content }]
 * @returns {Promise<string>} — respuesta del modelo
 */
export async function callApi(userMessage, previousMessages = []) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API key no configurada. Hacé click en ⚙ para configurarla.");
  }

  // Construir el array de mensajes: historial + mensaje actual
  const messages = [
    ...previousMessages,
    { role: "user", content: userMessage }
  ];

  const requestBody = {
    model: CONFIG.MODEL,
    max_tokens: CONFIG.MAX_TOKENS,
    temperature: CONFIG.TEMPERATURE,
    system: SYSTEM_PROMPT,
    messages
  };

  const response = await fetch(CONFIG.API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": CONFIG.ANTHROPIC_VERSION,
      // Header requerido para llamadas desde el navegador (CORS)
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorBody?.error?.message || response.statusText);
  }

  const data = await response.json();

  // Extraer el texto de la respuesta
  const text = data?.content?.[0]?.text;
  if (!text) {
    throw new Error("La API no retornó contenido válido.");
  }

  return text;
}

// ─── Errores ─────────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

/**
 * Convierte un error técnico en un mensaje amigable para el usuario.
 * @param {Error} error
 * @returns {string}
 */
function getFriendlyError(error) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401: return "API key inválida. Verificá la configuración (⚙).";
      case 429: return "Límite de solicitudes alcanzado. Esperá un momento y reintentá.";
      case 500: return "Error en los servidores de Anthropic. Reintentá en unos minutos.";
      case 529: return "Los servidores de Anthropic están sobrecargados. Reintentá más tarde.";
      default:  return `Error de API (${error.status}): ${error.message}`;
    }
  }
  if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
    return "Error de conexión. Verificá tu acceso a internet.";
  }
  return error.message || "Ocurrió un error inesperado.";
}

// ─── Auto-inicio ─────────────────────────────────────────────────────────────

// Inicializar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
