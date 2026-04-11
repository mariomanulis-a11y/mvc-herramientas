/**
 * ui/chat.js — Interfaz de conversación de Dalmacio
 * Estudio Jurídico Manulis — San Isidro, Provincia de Buenos Aires
 *
 * Maneja: mensajes, indicador de carga, adjuntos (chips), drag & drop.
 */

// ─── Mensajes ─────────────────────────────────────────────────────────────────

/**
 * Agrega un mensaje al panel de chat.
 * @param {"user"|"assistant"|"system"|"error"} role
 * @param {string} content
 * @param {boolean} isLoading — muestra el indicador de escritura
 * @param {Array}  attachmentPreviews — [{ name, previewUrl }] para el mensaje del usuario
 * @returns {HTMLElement}
 */
export function appendMessage(role, content, isLoading = false, attachmentPreviews = []) {
  const container = document.getElementById("chat-messages");
  if (!container) return null;

  const wrap = document.createElement("div");
  wrap.classList.add("message", `message--${role}`);

  // Avatar
  const avatar = document.createElement("div");
  avatar.classList.add("message__avatar");
  avatar.textContent = role === "user" ? "U" : role === "assistant" ? "D" : "!";
  wrap.appendChild(avatar);

  // Cuerpo
  const body = document.createElement("div");
  body.classList.add("message__body");

  // Chips de adjuntos (solo para mensajes del usuario)
  if (attachmentPreviews?.length) {
    const chips = document.createElement("div");
    chips.classList.add("message__attachments");
    for (const att of attachmentPreviews) {
      chips.appendChild(buildAttachmentBadge(att.name, att.previewUrl));
    }
    body.appendChild(chips);
  }

  // Contenido del mensaje
  const contentDiv = document.createElement("div");
  contentDiv.classList.add("message__content");

  if (isLoading) {
    contentDiv.innerHTML =
      '<span class="typing-indicator"><span></span><span></span><span></span></span>';
  } else if (content) {
    contentDiv.innerHTML = renderMarkdown(content);
  }

  body.appendChild(contentDiv);
  wrap.appendChild(body);

  // Timestamp
  const ts = document.createElement("div");
  ts.classList.add("message__timestamp");
  ts.textContent = new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit", minute: "2-digit"
  });
  wrap.appendChild(ts);

  container.appendChild(wrap);
  container.scrollTop = container.scrollHeight;
  return wrap;
}

/**
 * Reemplaza el contenido de un mensaje (ej: loading → respuesta real).
 */
export function updateMessage(el, content) {
  if (!el) return;
  const div = el.querySelector(".message__content");
  if (div) div.innerHTML = renderMarkdown(content);
  const container = document.getElementById("chat-messages");
  if (container) container.scrollTop = container.scrollHeight;
}

/** Limpia el historial visible del chat. */
export function clearChat() {
  const container = document.getElementById("chat-messages");
  if (container) container.innerHTML = "";
}

/** Muestra un mensaje de error en el chat. */
export function showError(text) {
  appendMessage("error", `**Error:** ${escapeHtml(text)}`);
}

/** Mensaje de bienvenida. */
export function showWelcome(caseName) {
  clearChat();
  const msg = caseName
    ? `Caso **${caseName}** cargado. Usá los botones de la barra superior o escribime directamente.\n\nPodés adjuntar archivos (PDF, Word, imágenes) con el botón **📎**.`
    : `Bienvenido a **Dalmacio**, asistente jurídico del Estudio Jurídico Manulis.\n\nCreá o seleccioná un caso en el panel izquierdo para comenzar.\n\nSoporta adjuntos: PDF · Word · Imágenes · Documentos escaneados.`;
  appendMessage("assistant", msg);
}

// ─── Chips de adjuntos pendientes (debajo del input) ─────────────────────────

/**
 * Agrega un chip de archivo adjunto al área de preview del input.
 * @param {string}   filename
 * @param {string}   previewUrl — Data URL de imagen (opcional)
 * @param {boolean}  isLoading
 * @param {Function} onRemove  — callback al hacer click en ✕
 * @returns {HTMLElement} el chip creado
 */
export function appendAttachmentChip(filename, previewUrl, isLoading, onRemove) {
  const area = document.getElementById("attachment-chips");
  if (!area) return null;

  area.style.display = "flex";

  const chip = document.createElement("div");
  chip.classList.add("attachment-chip");
  if (isLoading) chip.classList.add("attachment-chip--loading");

  // Miniatura de imagen
  if (previewUrl) {
    const img = document.createElement("img");
    img.src = previewUrl;
    img.alt = filename;
    img.classList.add("attachment-chip__thumb");
    chip.appendChild(img);
  } else {
    const icon = document.createElement("span");
    icon.classList.add("attachment-chip__icon");
    icon.textContent = getFileIcon(filename);
    chip.appendChild(icon);
  }

  // Nombre truncado
  const name = document.createElement("span");
  name.classList.add("attachment-chip__name");
  name.textContent = truncate(filename, 22);
  name.title = filename;
  chip.appendChild(name);

  // Spinner o botón de eliminar
  if (isLoading) {
    const spinner = document.createElement("span");
    spinner.classList.add("attachment-chip__spinner");
    chip.appendChild(spinner);
  } else if (onRemove) {
    const close = document.createElement("button");
    close.classList.add("attachment-chip__remove");
    close.textContent = "✕";
    close.title = "Quitar adjunto";
    close.addEventListener("click", () => {
      chip.remove();
      onRemove();
      // Ocultar el área si quedó vacía
      if (!area.children.length) area.style.display = "none";
    });
    chip.appendChild(close);
  }

  area.appendChild(chip);
  return chip;
}

/** Limpia todos los chips de adjuntos pendientes. */
export function clearAttachmentChips() {
  const area = document.getElementById("attachment-chips");
  if (area) {
    area.innerHTML = "";
    area.style.display = "none";
  }
}

// ─── Input del chat ───────────────────────────────────────────────────────────

export function setupChatInput(onSubmit) {
  const textarea = document.getElementById("chat-input");
  const sendBtn  = document.getElementById("send-btn");

  const submit = () => {
    const text = textarea?.value?.trim();
    if (text) {
      onSubmit(text);
      textarea.value = "";
      if (textarea) textarea.style.height = "auto";
    }
  };

  textarea?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  });

  textarea?.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  });

  sendBtn?.addEventListener("click", submit);
}

export function setChatInputDisabled(disabled) {
  const textarea = document.getElementById("chat-input");
  const sendBtn  = document.getElementById("send-btn");
  const fileBtn  = document.getElementById("btn-attach-file");
  if (textarea) textarea.disabled = disabled;
  if (sendBtn)  sendBtn.disabled  = disabled;
  if (fileBtn)  fileBtn.disabled  = disabled;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderMarkdown(text) {
  if (typeof window !== "undefined" && window.marked) {
    try { return window.marked.parse(text); } catch {}
  }
  return escapeHtml(text).replace(/\n/g, "<br>");
}

function escapeHtml(text) {
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(String(text)));
  return d.innerHTML;
}

function truncate(str, max) {
  if (str.length <= max) return str;
  const ext = str.includes(".") ? "." + str.split(".").pop() : "";
  return str.substring(0, max - ext.length - 1) + "…" + ext;
}

function getFileIcon(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  const icons = {
    pdf: "📄", docx: "📝", doc: "📝", txt: "📃",
    jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️",
    webp: "🖼️", bmp: "🖼️", tiff: "🖼️"
  };
  return icons[ext] || "📎";
}

function buildAttachmentBadge(name, previewUrl) {
  const badge = document.createElement("div");
  badge.classList.add("attachment-badge");

  if (previewUrl) {
    const img = document.createElement("img");
    img.src = previewUrl;
    img.alt = name;
    img.classList.add("attachment-badge__thumb");
    badge.appendChild(img);
  }

  const label = document.createElement("span");
  label.textContent = getFileIcon(name) + " " + truncate(name, 25);
  label.title = name;
  badge.appendChild(label);
  return badge;
}
