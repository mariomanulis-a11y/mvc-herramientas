/**
 * ui/users.js — Sistema de perfiles de usuario de Dalmacio
 * Estudio Jurídico Manulis — San Isidro, Provincia de Buenos Aires
 *
 * Permite que múltiples abogados del estudio usen Dalmacio
 * con sus propios casos y configuraciones independientes.
 *
 * Almacena en localStorage:
 *   dalmacio_users        → array de perfiles { id, name, initials, color }
 *   dalmacio_active_user  → id del usuario activo
 */

const USERS_KEY   = "dalmacio_users";
const ACTIVE_KEY  = "dalmacio_active_user";

const USER_COLORS = [
  "#c9a84c", "#4caf7a", "#5580ff", "#e05555",
  "#c055e0", "#55b8e0", "#e07a55", "#7ae055"
];

// ─── Helpers de ID e iniciales ────────────────────────────────────────────────

function genId() {
  return "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

export function getInitials(name) {
  return name.trim()
    .split(/\s+/)
    .map(w => w[0]?.toUpperCase() || "")
    .slice(0, 2)
    .join("");
}

// ─── CRUD de usuarios ─────────────────────────────────────────────────────────

export function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
  catch { return []; }
}

export function getActiveUser() {
  const id = localStorage.getItem(ACTIVE_KEY);
  return id ? (getUsers().find(u => u.id === id) || null) : null;
}

export function createUser(name) {
  const users = getUsers();
  const user = {
    id:        genId(),
    name,
    initials:  getInitials(name),
    color:     USER_COLORS[users.length % USER_COLORS.length],
    creadoEn:  new Date().toISOString()
  };
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  setActiveUser(user.id);
  return user;
}

export function setActiveUser(id) {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function deleteUser(id) {
  // Limpiar todos los casos de ese usuario
  const keysToDelete = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.includes("_" + id + "_")) keysToDelete.push(k);
  }
  keysToDelete.forEach(k => localStorage.removeItem(k));

  // Actualizar lista de usuarios
  const users = getUsers().filter(u => u.id !== id);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Activar otro usuario si era el activo
  if (localStorage.getItem(ACTIVE_KEY) === id) {
    const next = users[0];
    if (next) setActiveUser(next.id);
    else localStorage.removeItem(ACTIVE_KEY);
  }
}

// ─── Inicialización ───────────────────────────────────────────────────────────

/**
 * Inicializa el sistema de usuarios en la UI.
 * Si no hay usuario activo, muestra el modal de bienvenida.
 * @param {Function} onUserChange — callback(user) cuando cambia el usuario activo
 * @returns {Object|null} usuario activo actual
 */
export function initUsers(onUserChange) {
  setupUserModal(onUserChange);
  renderUserHeader(onUserChange);

  const active = getActiveUser();
  if (!active) {
    setTimeout(() => showUserModal(), 700);
  }
  return active;
}

// ─── Renderizado del header de usuario ───────────────────────────────────────

export function renderUserHeader(onUserChange) {
  const wrap = document.getElementById("user-avatar-wrap");
  if (!wrap) return;

  const user  = getActiveUser();
  const users = getUsers();

  if (!user) {
    wrap.innerHTML = `
      <button class="hbtn" id="btn-user-setup" title="Configurar perfil de usuario" aria-label="Configurar perfil">👤</button>
    `;
    wrap.querySelector("#btn-user-setup")?.addEventListener("click", showUserModal);
    return;
  }

  wrap.innerHTML = `
    <div class="user-avatar" style="background:${user.color}" title="${escapeHtml(user.name)}" id="btn-user-menu" tabindex="0" role="button" aria-label="Perfil: ${escapeHtml(user.name)}">
      ${escapeHtml(user.initials)}
    </div>
    <div class="user-dropdown" id="user-dropdown" aria-hidden="true"></div>
  `;

  const avatar   = wrap.querySelector("#btn-user-menu");
  const dropdown = wrap.querySelector("#user-dropdown");

  const toggle = (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains("open");
    dropdown.classList.toggle("open", !isOpen);
    dropdown.setAttribute("aria-hidden", isOpen ? "true" : "false");
    if (!isOpen) renderUserDropdown(dropdown, onUserChange);
  };

  avatar.addEventListener("click", toggle);
  avatar.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") toggle(e); });

  document.addEventListener("click", () => {
    dropdown.classList.remove("open");
    dropdown.setAttribute("aria-hidden", "true");
  });
}

function renderUserDropdown(dropdown, onUserChange) {
  const users  = getUsers();
  const active = getActiveUser();

  dropdown.innerHTML = `
    <div class="user-dropdown__header">Abogados del estudio</div>
    ${users.map(u => `
      <div class="user-dropdown__item ${u.id === active?.id ? "active" : ""}" data-uid="${u.id}">
        <span class="user-avatar user-avatar--sm" style="background:${u.color}">${escapeHtml(u.initials)}</span>
        <span class="user-dropdown__name">${escapeHtml(u.name)}</span>
        ${u.id === active?.id ? '<span class="user-dropdown__check">✓</span>' : ""}
      </div>
    `).join("")}
    <div class="user-dropdown__divider"></div>
    <div class="user-dropdown__item user-dropdown__add" id="dd-add-user">
      <span class="user-avatar user-avatar--sm" style="background:var(--bg4)">+</span>
      <span class="user-dropdown__name">Agregar abogado</span>
    </div>
  `;

  dropdown.querySelectorAll(".user-dropdown__item[data-uid]").forEach(item => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const uid = item.dataset.uid;
      if (uid !== active?.id) {
        setActiveUser(uid);
        renderUserHeader(onUserChange);
        onUserChange(getActiveUser());
      }
      dropdown.classList.remove("open");
    });
  });

  dropdown.querySelector("#dd-add-user")?.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.remove("open");
    showUserModal();
  });
}

// ─── Modal de usuario ─────────────────────────────────────────────────────────

export function showUserModal() {
  const modal = document.getElementById("user-modal");
  if (!modal) return;
  renderUserListInModal();
  modal.classList.add("visible");
}

export function hideUserModal() {
  document.getElementById("user-modal")?.classList.remove("visible");
}

function renderUserListInModal() {
  const list = document.getElementById("user-list");
  if (!list) return;
  const users  = getUsers();
  const active = getActiveUser();

  if (users.length === 0) {
    list.innerHTML = '<p class="user-list-empty">Ingresá el nombre del abogado para crear el primer perfil.</p>';
    return;
  }

  list.innerHTML = users.map(u => `
    <div class="user-list__item ${u.id === active?.id ? "active" : ""}">
      <span class="user-avatar user-avatar--sm" style="background:${u.color}">${escapeHtml(u.initials)}</span>
      <span class="user-list__name">${escapeHtml(u.name)}</span>
      <div class="user-list__actions">
        <button class="btn-icon-sm btn-select-user" data-uid="${u.id}" title="Seleccionar">
          ${u.id === active?.id ? "✓" : "→"}
        </button>
        ${users.length > 1 ? `<button class="btn-icon-sm btn-delete-user" data-uid="${u.id}" title="Eliminar perfil">✕</button>` : ""}
      </div>
    </div>
  `).join("");
}

function setupUserModal(onUserChange) {
  const modal    = document.getElementById("user-modal");
  const input    = document.getElementById("user-name-input");
  const btnSave  = document.getElementById("btn-save-user");
  const btnClose = document.getElementById("btn-close-user-modal");

  if (!modal) return;

  // Cerrar modal
  btnClose?.addEventListener("click", () => {
    if (getActiveUser()) hideUserModal();
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal && getActiveUser()) hideUserModal();
  });

  // Guardar nuevo usuario
  const doSave = () => {
    const name = input?.value?.trim();
    if (!name || name.length < 2) {
      input?.classList.add("input--error");
      setTimeout(() => input?.classList.remove("input--error"), 1500);
      return;
    }
    const user = createUser(name);
    if (input) input.value = "";
    renderUserHeader(onUserChange);
    renderUserListInModal();
    onUserChange(user);
    hideUserModal();
  };

  btnSave?.addEventListener("click", doSave);
  input?.addEventListener("keydown", (e) => { if (e.key === "Enter") doSave(); });

  // Delegación de eventos para la lista de usuarios
  const list = document.getElementById("user-list");
  list?.addEventListener("click", (e) => {
    const selectBtn = e.target.closest(".btn-select-user");
    const deleteBtn = e.target.closest(".btn-delete-user");

    if (selectBtn) {
      const uid = selectBtn.dataset.uid;
      setActiveUser(uid);
      renderUserHeader(onUserChange);
      renderUserListInModal();
      onUserChange(getActiveUser());
      hideUserModal();
    }

    if (deleteBtn) {
      const uid  = deleteBtn.dataset.uid;
      const user = getUsers().find(u => u.id === uid);
      if (user && confirm(`¿Eliminar el perfil de "${user.name}" y todos sus casos?`)) {
        deleteUser(uid);
        renderUserHeader(onUserChange);
        renderUserListInModal();
        onUserChange(getActiveUser());
      }
    }
  });
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function escapeHtml(text) {
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(String(text || "")));
  return d.innerHTML;
}
