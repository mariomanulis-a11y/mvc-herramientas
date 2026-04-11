/**
 * ui/sidebar.js — Panel lateral de gestión de casos
 * Estudio Jurídico Manulis — San Isidro, Provincia de Buenos Aires
 *
 * Maneja el selector de casos, formulario de contexto, lista de casos
 * guardados y las operaciones de carga/eliminación de casos.
 */

import {
  saveCaseContext,
  getCaseContext,
  getAllCases,
  clearCase,
  createEmptyCase
} from "../context.js";
import { CONFIG } from "../config.js";

// Referencia al caso activo (compartida con dalmacio.js via callback)
let onCaseChange = null;

/**
 * Inicializa el sidebar con todos sus listeners y renderiza la lista de casos.
 * @param {Function} onCaseChangeCallback — se llama cuando el caso activo cambia
 */
export function initSidebar(onCaseChangeCallback) {
  onCaseChange = onCaseChangeCallback;

  setupNewCaseButton();
  setupCaseForm();
  setupLoadDemoButton();
  renderCaseList();
}

/**
 * Configura el botón "Nuevo caso".
 */
function setupNewCaseButton() {
  const btn = document.getElementById("btn-new-case");
  if (!btn) return;

  btn.addEventListener("click", () => {
    // Generar ID único basado en timestamp
    const newId = "caso-" + Date.now();
    const newCase = createEmptyCase(newId);
    saveCaseContext(newId, newCase);
    loadCaseIntoForm(newCase);
    renderCaseList();
    if (onCaseChange) onCaseChange(newCase);
  });
}

/**
 * Configura el formulario de edición del caso activo.
 * Guarda automáticamente al cambiar cualquier campo (debounced).
 */
function setupCaseForm() {
  const form = document.getElementById("case-form");
  if (!form) return;

  let saveTimer = null;

  // Guardar con debounce de 800ms al escribir en cualquier campo
  form.addEventListener("input", () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveCurrentFormCase();
    }, 800);
  });

  // Botón guardar explícito
  const saveBtn = document.getElementById("btn-save-case");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      saveCurrentFormCase();
      showSaveFeedback(saveBtn);
    });
  }
}

/**
 * Lee los valores del formulario y guarda el caso en localStorage.
 */
function saveCurrentFormCase() {
  const caseId = document.getElementById("case-id")?.value?.trim();
  if (!caseId) return;

  const data = {
    caseId,
    cliente: document.getElementById("case-cliente")?.value || "",
    expediente: document.getElementById("case-expediente")?.value || "",
    juzgado: document.getElementById("case-juzgado")?.value || "",
    fuero: document.getElementById("case-fuero")?.value || "laboral",
    jurisdiccion: document.getElementById("case-jurisdiccion")?.value || "",
    materia: document.getElementById("case-materia")?.value || "",
    hechos: document.getElementById("case-hechos")?.value || ""
  };

  // Preservar historial existente
  const existing = getCaseContext(caseId);
  if (existing?.historial) {
    data.historial = existing.historial;
  }

  const saved = saveCaseContext(caseId, data);
  renderCaseList();

  // Notificar al orquestador del cambio
  if (onCaseChange) onCaseChange(saved);
}

/**
 * Carga los datos de un caso en el formulario.
 * @param {Object} caseData
 */
export function loadCaseIntoForm(caseData) {
  if (!caseData) return;

  setValue("case-id", caseData.caseId || "");
  setValue("case-cliente", caseData.cliente || "");
  setValue("case-expediente", caseData.expediente || "");
  setValue("case-juzgado", caseData.juzgado || "");
  setValue("case-fuero", caseData.fuero || "laboral");
  setValue("case-jurisdiccion", caseData.jurisdiccion || "");
  setValue("case-materia", caseData.materia || "");
  setValue("case-hechos", caseData.hechos || "");

  // Actualizar el label del caso activo en el header del sidebar
  const activeLabel = document.getElementById("active-case-label");
  if (activeLabel) {
    activeLabel.textContent = caseData.cliente
      ? `${caseData.cliente} — ${caseData.caseId}`
      : caseData.caseId;
  }
}

/**
 * Renderiza la lista de casos guardados en el sidebar.
 */
export function renderCaseList() {
  const list = document.getElementById("case-list");
  if (!list) return;

  const cases = getAllCases();
  list.innerHTML = "";

  if (cases.length === 0) {
    list.innerHTML = '<li class="case-list__empty">No hay casos guardados.</li>';
    return;
  }

  // Ordenar por fecha de actualización (más reciente primero)
  cases.sort((a, b) =>
    new Date(b.actualizadoEn || 0) - new Date(a.actualizadoEn || 0)
  );

  for (const c of cases) {
    const li = document.createElement("li");
    li.classList.add("case-list__item");
    li.dataset.caseId = c.caseId;

    li.innerHTML = `
      <div class="case-list__info">
        <span class="case-list__name">${escapeHtml(c.cliente || c.caseId)}</span>
        <span class="case-list__meta">${escapeHtml(c.expediente || "")} · ${escapeHtml(c.fuero || "")}</span>
      </div>
      <div class="case-list__actions">
        <button class="btn-icon btn-load" title="Cargar caso" aria-label="Cargar caso">↗</button>
        <button class="btn-icon btn-delete" title="Eliminar caso" aria-label="Eliminar caso">✕</button>
      </div>
    `;

    // Botón cargar
    li.querySelector(".btn-load").addEventListener("click", () => {
      const ctx = getCaseContext(c.caseId);
      if (ctx) {
        loadCaseIntoForm(ctx);
        if (onCaseChange) onCaseChange(ctx);
        // Marcar como activo visualmente
        document.querySelectorAll(".case-list__item").forEach(el => el.classList.remove("active"));
        li.classList.add("active");
      }
    });

    // Botón eliminar
    li.querySelector(".btn-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`¿Eliminar el caso "${c.cliente || c.caseId}"? Esta acción no se puede deshacer.`)) {
        clearCase(c.caseId);
        renderCaseList();
        // Si el caso eliminado era el activo, limpiar el formulario
        const currentId = document.getElementById("case-id")?.value;
        if (currentId === c.caseId) {
          const form = document.getElementById("case-form");
          if (form) form.reset();
          if (onCaseChange) onCaseChange(null);
        }
      }
    });

    list.appendChild(li);
  }
}

/**
 * Configura el botón de carga del caso demo.
 */
function setupLoadDemoButton() {
  const btn = document.getElementById("btn-load-demo");
  if (!btn) return;

  btn.addEventListener("click", () => {
    // Guardar el caso demo si no existe
    const existing = getCaseContext(CONFIG.DEMO_CASE.caseId);
    if (!existing) {
      saveCaseContext(CONFIG.DEMO_CASE.caseId, CONFIG.DEMO_CASE);
    }
    const demo = getCaseContext(CONFIG.DEMO_CASE.caseId);
    loadCaseIntoForm(demo);
    renderCaseList();
    if (onCaseChange) onCaseChange(demo);
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(String(text)));
  return div.innerHTML;
}

function showSaveFeedback(btn) {
  const original = btn.textContent;
  btn.textContent = "✓ Guardado";
  btn.classList.add("btn--success");
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove("btn--success");
  }, 1500);
}
