/**
 * ui/chat.js — Interfaz de conversación de Dalmacio
 * Estudio Jurídico Manulis — San Isidro, Provincia de Buenos Aires
 *
 * Maneja el renderizado del historial de chat, el indicador de carga
 * y las interacciones del usuario con el panel de conversación.
 */

/**
 * Agrega un mensaje al panel de chat.
 * @param {string} role — "user" | "assistant" | "system"
 * @param {string} content — contenido del mensaje (puede incluir Markdown)
 * @param {boolean} isStreaming — si es true, agrega un indicador de escritura
 * @returns {HTMLElement} — el elemento de mensaje creado
 */
export function appendMessage(role, content, isStreaming = false) {
  const chatMessages = document.getElementById("chat-messages");
  if (!chatMessages) return null;

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", `message--${role}`);

  // Avatar / label
  const avatar = document.createElement("div");
  avatar.classList.add("message__avatar");
  avatar.textContent = role === "user" ? "U" : role === "assistant" ? "D" : "⚙";
  messageDiv.appendChild(avatar);

  // Contenido
  const contentDiv = document.createElement("div");
  contentDiv.classList.add("message__content");

  if (isStreaming) {
    contentDiv.innerHTML = '<span class="typing-indicator"><span></span><span></span><span></span></span>';
  } else {
    // Renderizar Markdown si marked.js está disponible
    contentDiv.innerHTML = renderMarkdown(content);
  }

  messageDiv.appendChild(contentDiv);

  // Timestamp
  const timestamp = document.createElement("div");
  timestamp.classList.add("message__timestamp");
  timestamp.textContent = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  messageDiv.appendChild(timestamp);

  chatMessages.appendChild(messageDiv);

  // Auto-scroll al último mensaje
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return messageDiv;
}

/**
 * Reemplaza el contenido de un mensaje existente.
 * Usado para reemplazar el indicador de carga con la respuesta real.
 * @param {HTMLElement} messageEl — elemento del mensaje a actualizar
 * @param {string} content — contenido nuevo
 */
export function updateMessage(messageEl, content) {
  if (!messageEl) return;
  const contentDiv = messageEl.querySelector(".message__content");
  if (contentDiv) {
    contentDiv.innerHTML = renderMarkdown(content);
  }
  // Scroll al final
  const chatMessages = document.getElementById("chat-messages");
  if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Limpia todos los mensajes del panel de chat.
 */
export function clearChat() {
  const chatMessages = document.getElementById("chat-messages");
  if (chatMessages) chatMessages.innerHTML = "";
}

/**
 * Muestra un mensaje de error en el chat.
 * @param {string} errorText — texto del error
 */
export function showError(errorText) {
  const chatMessages = document.getElementById("chat-messages");
  if (!chatMessages) return;

  const errorDiv = document.createElement("div");
  errorDiv.classList.add("message", "message--error");
  errorDiv.innerHTML = `
    <div class="message__avatar">!</div>
    <div class="message__content">
      <strong>Error:</strong> ${escapeHtml(errorText)}
    </div>
  `;
  chatMessages.appendChild(errorDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Muestra un mensaje de bienvenida en el chat.
 * @param {string} caseName — nombre del caso activo (opcional)
 */
export function showWelcome(caseName) {
  clearChat();
  const welcome = caseName
    ? `Caso **${caseName}** cargado. ¿En qué puedo asistirte? Podés usar los botones de la barra superior para acceder a los módulos específicos, o escribirme directamente.`
    : `Bienvenido a **Dalmacio**, asistente jurídico del Estudio Jurídico Manulis.\n\nCreá o seleccioná un caso en el panel izquierdo para comenzar, o escribí tu consulta directamente.`;
  appendMessage("assistant", welcome);
}

/**
 * Renderiza Markdown usando marked.js si está disponible.
 * Si no está disponible, retorna el texto con saltos de línea básicos.
 * @param {string} text
 * @returns {string} — HTML
 */
function renderMarkdown(text) {
  if (typeof window !== "undefined" && window.marked) {
    try {
      return window.marked.parse(text);
    } catch (e) {
      console.warn("[Dalmacio] Error al renderizar Markdown:", e);
    }
  }
  // Fallback: escapar HTML y convertir saltos de línea
  return escapeHtml(text).replace(/\n/g, "<br>");
}

/**
 * Escapa caracteres HTML para prevenir XSS.
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

/**
 * Configura el textarea de input: envío con Enter (sin Shift).
 * @param {Function} onSubmit — función a llamar con el texto del usuario
 */
export function setupChatInput(onSubmit) {
  const textarea = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");

  if (!textarea || !sendBtn) return;

  // Enter = enviar, Shift+Enter = nueva línea
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const text = textarea.value.trim();
      if (text) {
        onSubmit(text);
        textarea.value = "";
        textarea.style.height = "auto";
      }
    }
  });

  // Auto-resize del textarea
  textarea.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  });

  // Botón de envío
  sendBtn.addEventListener("click", () => {
    const text = textarea.value.trim();
    if (text) {
      onSubmit(text);
      textarea.value = "";
      textarea.style.height = "auto";
    }
  });
}

/**
 * Deshabilita o habilita el input del chat.
 * @param {boolean} disabled
 */
export function setChatInputDisabled(disabled) {
  const textarea = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");
  if (textarea) textarea.disabled = disabled;
  if (sendBtn) sendBtn.disabled = disabled;
}
