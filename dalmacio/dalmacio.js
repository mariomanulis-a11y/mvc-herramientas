/**
 * dalmacio.js — Orquestador central del agente jurídico Dalmacio
 * Estudio Jurídico Manulis — San Isidro, Provincia de Buenos Aires
 *
 * Coordina: UI ↔ Módulos ↔ API de Anthropic ↔ Contexto
 * Soporta: texto, archivos PDF/Word/imágenes, bases de datos externas
 */

import { CONFIG, getApiKey, setApiKey } from "./config.js";
import { SYSTEM_PROMPT, buildCaseContextMessage } from "./prompts/system_prompt.js";
import {
  getCaseContext,
  appendToHistory,
  buildMessagesFromHistory
} from "./context.js";
import { initSidebar, loadCaseIntoForm } from "./ui/sidebar.js";
import {
  appendMessage,
  updateMessage,
  clearChat,
  showError,
  showWelcome,
  setupChatInput,
  setChatInputDisabled,
  appendAttachmentChip,
  clearAttachmentChips
} from "./ui/chat.js";
import { exportTxt, exportDocx, suggestFilename } from "./ui/export.js";
import { redactar }   from "./modules/redaccion.js";
import { analizar }   from "./modules/analisis.js";
import { estrategia } from "./modules/estrategia.js";
import { normativa }  from "./modules/normativa.js";
import { checklist }  from "./modules/checklist.js";
import { procesarArchivo, formatearComoTexto } from "./modules/archivos.js";
import { buscarEnBaseDatos }  from "./modules/buscador.js";

// ─── Estado global ───────────────────────────────────────────────────────────

let activeCaseContext  = null;
let lastOutput         = { content: "", modulo: "output" };
let activeModule       = "chat";
/** Archivos adjuntos pendientes de enviar con el próximo mensaje */
let pendingAttachments = [];

// ─── Inicialización ──────────────────────────────────────────────────────────

export function init() {
  checkApiKeySetup();
  initSidebar(onCaseChange);
  setupChatInput(handleUserInput);
  setupModuleButtons();
  setupExportButton();
  setupClearButton();
  setupApiKeyModal();
  setupFileUpload();
  setupBuscadorPanel();
  showWelcome(null);
}

// ─── API Key ─────────────────────────────────────────────────────────────────

function checkApiKeySetup() {
  if (!getApiKey()) setTimeout(() => showApiKeyModal(), 400);
}

function showApiKeyModal() {
  document.getElementById("api-key-modal")?.classList.add("visible");
}

function hideApiKeyModal() {
  document.getElementById("api-key-modal")?.classList.remove("visible");
}

function setupApiKeyModal() {
  const input   = document.getElementById("api-key-input");
  const saveBtn = document.getElementById("btn-save-api-key");
  const openBtn = document.getElementById("btn-open-api-config");

  saveBtn?.addEventListener("click", () => {
    const key = input?.value?.trim();
    if (key?.startsWith("sk-ant-")) {
      setApiKey(key);
      if (input) input.value = "";
      hideApiKeyModal();
      showWelcome(activeCaseContext?.cliente || null);
    } else {
      input?.classList.add("input--error");
      setTimeout(() => input?.classList.remove("input--error"), 1500);
    }
  });

  openBtn?.addEventListener("click", showApiKeyModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideApiKeyModal();
  });

  document.getElementById("api-key-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "api-key-modal") hideApiKeyModal();
  });
}

// ─── Cambio de caso ──────────────────────────────────────────────────────────

function onCaseChange(caseContext) {
  activeCaseContext = caseContext;
  pendingAttachments = [];
  clearAttachmentChips();

  // Actualizar subheader
  const display = document.getElementById("chat-case-display");
  if (display) {
    display.textContent = caseContext
      ? `${caseContext.cliente || caseContext.caseId}  ·  ${caseContext.materia || ""}`.trim().replace(/·\s*$/, "")
      : "Sin caso activo";
  }

  if (caseContext) {
    clearChat();
    showWelcome(caseContext.cliente || caseContext.caseId);
  }
}

// ─── Módulos ─────────────────────────────────────────────────────────────────

function setupModuleButtons() {
  const moduleMap = {
    "btn-mod-redactar":   "redaccion",
    "btn-mod-analizar":   "analisis",
    "btn-mod-estrategia": "estrategia",
    "btn-mod-normativa":  "normativa",
    "btn-mod-checklist":  "checklist",
    "btn-mod-buscador":   "buscador"
  };

  for (const [btnId, mod] of Object.entries(moduleMap)) {
    document.getElementById(btnId)?.addEventListener("click", () => {
      setActiveModule(mod);
      // Para el buscador, mostrar/ocultar el panel lateral
      if (mod === "buscador") {
        document.getElementById("buscador-panel")?.classList.toggle("visible");
        return;
      }
      appendMessage("assistant", getModulePrompt(mod));
    });
  }
}

function setActiveModule(mod) {
  activeModule = mod;
  document.querySelectorAll(".toolbar__btn").forEach(b => b.classList.remove("active"));
  document.getElementById(`btn-mod-${mod}`)?.classList.add("active");
  const label = document.getElementById("active-module-label");
  if (label) label.textContent = getModuleLabel(mod);
}

function getModulePrompt(mod) {
  const prompts = {
    redaccion:  "Módulo **Redacción** activado. ¿Qué escrito necesitás? Podés adjuntar un archivo de referencia con el botón 📎.",
    analisis:   "Módulo **Análisis** activado. Describí los hechos o confirmá que analizo los del caso activo. También podés adjuntar documentos relevantes.",
    estrategia: "Módulo **Estrategia** activado. Indicame el objetivo del cliente.",
    normativa:  "Módulo **Normativa** activado. ¿Qué ley, artículo o tema jurídico querés consultar?",
    checklist:  "Módulo **Checklist** activado. ¿Para qué tipo de acción legal?"
  };
  return prompts[mod] || "¿En qué puedo asistirte?";
}

function getModuleLabel(mod) {
  const labels = {
    chat: "Chat libre", redaccion: "Redacción", analisis: "Análisis",
    estrategia: "Estrategia", normativa: "Normativa", checklist: "Checklist",
    buscador: "Bases de Datos"
  };
  return labels[mod] || "Chat";
}

// ─── Carga de archivos ───────────────────────────────────────────────────────

function setupFileUpload() {
  const fileInput  = document.getElementById("file-input");
  const fileBtn    = document.getElementById("btn-attach-file");
  const dropZone   = document.getElementById("chat-messages");

  // Botón de adjuntar
  fileBtn?.addEventListener("click", () => fileInput?.click());

  // Input oculto
  fileInput?.addEventListener("change", (e) => {
    handleFiles(Array.from(e.target.files));
    e.target.value = "";            // permitir re-seleccionar el mismo archivo
  });

  // Drag & drop sobre el área de mensajes
  dropZone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
  });

  dropZone?.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
  });

  dropZone?.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    const files = Array.from(e.dataTransfer.files);
    if (files.length) handleFiles(files);
  });
}

/**
 * Procesa los archivos seleccionados y los agrega a la cola de adjuntos.
 * @param {File[]} files
 */
async function handleFiles(files) {
  for (const file of files) {
    try {
      setChatInputDisabled(true);
      const loadingChip = appendAttachmentChip(file.name, null, true);

      const procesado = await procesarArchivo(file);

      pendingAttachments.push(procesado);
      loadingChip?.remove();
      appendAttachmentChip(
        file.name,
        procesado.type === 'imagen' ? procesado.previewUrl : null,
        false,
        () => removeAttachment(procesado)
      );
    } catch (err) {
      showError(err.message);
    } finally {
      setChatInputDisabled(false);
    }
  }
  document.getElementById("chat-input")?.focus();
}

/**
 * Elimina un adjunto de la cola.
 */
function removeAttachment(archivoProcesado) {
  const idx = pendingAttachments.indexOf(archivoProcesado);
  if (idx !== -1) pendingAttachments.splice(idx, 1);
}

// ─── Panel de buscador ───────────────────────────────────────────────────────

function setupBuscadorPanel() {
  const panel   = document.getElementById("buscador-panel");
  const input   = document.getElementById("buscador-input");
  const btnBusc = document.getElementById("btn-buscador-search");
  const btnClose= document.getElementById("btn-buscador-close");

  btnClose?.addEventListener("click", () => panel?.classList.remove("visible"));

  btnBusc?.addEventListener("click", () => {
    const q = input?.value?.trim();
    if (!q) return;
    panel?.classList.remove("visible");
    setActiveModule("buscador");
    handleUserInput(q);     // procesa como si fuera mensaje normal
  });

  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btnBusc?.click();
  });
}

// ─── Procesamiento del mensaje del usuario ───────────────────────────────────

async function handleUserInput(userText) {
  if (!userText?.trim() && pendingAttachments.length === 0) return;

  if (!getApiKey()) { showApiKeyModal(); return; }

  const texto = userText?.trim() || "(Analizá el/los documento(s) adjunto(s) en el contexto del caso activo)";

  // Mostrar mensaje del usuario con chips de adjuntos
  appendMessage("user", texto, false, pendingAttachments.map(a => ({
    name: a.filename,
    previewUrl: a.previewUrl || null
  })));

  setChatInputDisabled(true);
  const loadingMsg = appendMessage("assistant", "", true);

  // Copiar adjuntos actuales y limpiar la cola
  const attachments = [...pendingAttachments];
  pendingAttachments = [];
  clearAttachmentChips();

  try {
    if (activeCaseContext?.caseId) {
      appendToHistory(activeCaseContext.caseId, "user", texto);
    }

    const ctx = activeCaseContext
      ? getCaseContext(activeCaseContext.caseId) || activeCaseContext
      : null;

    const contextMessage = ctx ? buildCaseContextMessage(ctx) : "";
    const historialApi   = buildMessagesFromHistory(ctx, contextMessage);

    let respuesta;
    switch (activeModule) {
      case "redaccion":
        respuesta = await redactar(texto, ctx, historialApi, attachments);
        break;
      case "analisis":
        respuesta = await analizar(texto, ctx, historialApi, attachments);
        break;
      case "estrategia":
        respuesta = await estrategia(texto, ctx, historialApi);
        break;
      case "normativa":
        respuesta = await normativa(texto, ctx, historialApi);
        break;
      case "checklist":
        respuesta = await checklist(texto, ctx, historialApi);
        break;
      case "buscador":
        respuesta = await buscarEnBaseDatos(texto, ctx, historialApi);
        break;
      default:
        respuesta = await callApi(texto, historialApi, attachments);
    }

    updateMessage(loadingMsg, respuesta);

    if (activeCaseContext?.caseId) {
      appendToHistory(activeCaseContext.caseId, "assistant", respuesta);
    }

    lastOutput = { content: respuesta, modulo: activeModule };

  } catch (error) {
    console.error("[Dalmacio]", error);
    loadingMsg?.remove();
    showError(getFriendlyError(error));
  } finally {
    setChatInputDisabled(false);
    document.getElementById("chat-input")?.focus();
  }
}

// ─── Exportación ─────────────────────────────────────────────────────────────

function setupExportButton() {
  document.getElementById("btn-export-txt")?.addEventListener("click", () => {
    if (!lastOutput.content) { showError("No hay contenido para exportar."); return; }
    exportTxt(lastOutput.content, suggestFilename(activeCaseContext, lastOutput.modulo));
  });

  document.getElementById("btn-export-docx")?.addEventListener("click", async () => {
    if (!lastOutput.content) { showError("No hay contenido para exportar."); return; }
    await exportDocx(lastOutput.content, suggestFilename(activeCaseContext, lastOutput.modulo), activeCaseContext);
  });
}

// ─── Limpiar chat ─────────────────────────────────────────────────────────────

function setupClearButton() {
  document.getElementById("btn-clear-chat")?.addEventListener("click", () => {
    if (confirm("¿Limpiar el historial de conversación?")) {
      pendingAttachments = [];
      clearAttachmentChips();
      clearChat();
      showWelcome(activeCaseContext?.cliente || null);
    }
  });
}

// ─── API de Anthropic ─────────────────────────────────────────────────────────

/**
 * Llama a la API de Anthropic Claude con soporte multimodal (texto + imágenes).
 *
 * @param {string} userMessage
 * @param {Array}  previousMessages — historial [{ role, content }]
 * @param {Array}  attachments      — archivos procesados por archivos.js
 * @returns {Promise<string>}
 */
export async function callApi(userMessage, previousMessages = [], attachments = []) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API key no configurada. Hacé click en ⚙ para configurarla.");
  }

  // Construir el contenido del mensaje del usuario
  let userContent;

  if (attachments.length > 0) {
    // Mensaje multimodal: array de content blocks
    const blocks = [];

    for (const att of attachments) {
      if (att.type === "imagen") {
        // Bloque de imagen para visión de Claude
        blocks.push({
          type: "image",
          source: {
            type:       "base64",
            media_type: att.mimeType,
            data:       att.content
          }
        });
      } else if (att.type === "texto") {
        // Texto extraído (PDF/Word/TXT) como bloque de texto
        blocks.push({
          type: "text",
          text: formatearComoTexto(att)
        });
      }
    }

    // Agregar el mensaje del usuario al final
    blocks.push({ type: "text", text: userMessage });
    userContent = blocks;

  } else {
    userContent = userMessage;
  }

  const messages = [
    ...previousMessages,
    { role: "user", content: userContent }
  ];

  const body = {
    model:      CONFIG.MODEL,
    max_tokens: CONFIG.MAX_TOKENS,
    temperature:CONFIG.TEMPERATURE,
    system:     SYSTEM_PROMPT,
    messages
  };

  const MAX_RETRIES = 3;
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type":    "application/json",
        "x-api-key":       apiKey,
        "anthropic-version": CONFIG.ANTHROPIC_VERSION,
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify(body)
    });

    if (response.status === 429 && attempt < MAX_RETRIES) {
      // Retry-After header or exponential backoff: 5s, 10s, 20s
      const retryAfter = parseInt(response.headers.get("retry-after") || "0", 10);
      const waitMs = retryAfter > 0 ? retryAfter * 1000 : (5000 * Math.pow(2, attempt));
      await new Promise(r => setTimeout(r, waitMs));
      continue;
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new ApiError(response.status, err?.error?.message || response.statusText);
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text;
    if (!text) throw new Error("La API no retornó contenido válido.");
    return text;
  }

  throw lastError || new ApiError(429, "Límite de solicitudes alcanzado tras varios reintentos.");
}

// ─── Errores ──────────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

function getFriendlyError(error) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401: return "API key inválida. Verificá la configuración (⚙).";
      case 429: return "Límite de solicitudes de Anthropic alcanzado. Se reintentó automáticamente. Si el problema persiste, esperá unos minutos o considerá aumentar el tier de tu cuenta en console.anthropic.com.";
      case 500: return "Error en los servidores de Anthropic. Reintentá en unos minutos.";
      case 529: return "Servidores de Anthropic sobrecargados. Reintentá más tarde.";
      default:  return `Error de API (${error.status}): ${error.message}`;
    }
  }
  if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
    return "Error de conexión. Verificá tu acceso a internet.";
  }
  return error.message || "Ocurrió un error inesperado.";
}

// ─── Auto-inicio ──────────────────────────────────────────────────────────────

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
