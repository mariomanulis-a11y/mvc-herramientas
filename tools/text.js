/* ============================================================
   Text Utilities Tool — tools/text.js
   ============================================================ */

export function initText(container) {

  container.innerHTML = `
    <div class="tool-card">
      <h2>📝 Utilidades de Texto</h2>

      <div class="stats-row" id="text-stats">
        <div class="stat-chip">Caracteres: <span id="stat-chars">0</span></div>
        <div class="stat-chip">Sin espacios: <span id="stat-chars-ns">0</span></div>
        <div class="stat-chip">Palabras: <span id="stat-words">0</span></div>
        <div class="stat-chip">Líneas: <span id="stat-lines">0</span></div>
        <div class="stat-chip">Oraciones: <span id="stat-sentences">0</span></div>
        <div class="stat-chip">Párrafos: <span id="stat-paragraphs">0</span></div>
      </div>

      <textarea id="text-input" rows="6"
        placeholder="Escribí o pegá tu texto aquí..."></textarea>

      <div class="btn-row" style="margin-top:12px;flex-wrap:wrap;">
        <button class="btn btn-primary" id="btn-upper">MAYÚSCULAS</button>
        <button class="btn btn-primary" id="btn-lower">minúsculas</button>
        <button class="btn btn-ghost"  id="btn-title">Título</button>
        <button class="btn btn-ghost"  id="btn-sentence">Oración</button>
        <button class="btn btn-ghost"  id="btn-alt">AlTeRnAdO</button>
        <button class="btn btn-ghost"  id="btn-reverse">Invertir</button>
        <button class="btn btn-ghost"  id="btn-trim">Limpiar espacios</button>
        <button class="btn btn-ghost"  id="btn-dedup">Quitar duplicados</button>
        <button class="btn btn-danger" id="btn-clear-text">Limpiar</button>
      </div>

      <div style="margin-top:16px; display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
        <button class="btn btn-success" id="btn-copy-text">📋 Copiar resultado</button>
        <div id="text-copy-toast"
          style="display:none;font-size:0.8rem;color:var(--color-success);">
          ✓ Copiado
        </div>
      </div>
    </div>

    <div class="tool-card">
      <h2>🔍 Buscar y Reemplazar</h2>
      <div class="form-row">
        <div class="field-group">
          <label>Buscar</label>
          <input type="text" id="sr-find" placeholder="Texto a buscar">
        </div>
        <div class="field-group">
          <label>Reemplazar con</label>
          <input type="text" id="sr-replace" placeholder="Reemplazo (vacío = eliminar)">
        </div>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" id="btn-replace">Reemplazar todo</button>
        <div class="check-row" style="margin:0;">
          <input type="checkbox" id="sr-case">
          <label for="sr-case" style="color:var(--color-muted);font-size:0.82rem;">
            Distinguir mayúsculas
          </label>
        </div>
      </div>
      <div id="sr-feedback" style="font-size:0.8rem;color:var(--color-muted);margin-top:8px;"></div>
    </div>`;

  const textarea = container.querySelector('#text-input');

  // ── Stats ─────────────────────────────────────────────────
  function updateStats() {
    const t = textarea.value;
    container.querySelector('#stat-chars').textContent       = t.length;
    container.querySelector('#stat-chars-ns').textContent    = t.replace(/ /g, '').length;
    container.querySelector('#stat-words').textContent       = t.trim() ? t.trim().split(/\s+/).length : 0;
    container.querySelector('#stat-lines').textContent       = t ? t.split('\n').length : 0;
    container.querySelector('#stat-sentences').textContent   = (t.match(/[.!?]+/g) || []).length;
    container.querySelector('#stat-paragraphs').textContent  = t.trim() ? t.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
  }

  textarea.addEventListener('input', updateStats);
  updateStats();

  // ── Transformations ───────────────────────────────────────
  function transform(fn) {
    textarea.value = fn(textarea.value);
    updateStats();
  }

  function toTitle(str) {
    return str.toLowerCase().replace(/(?:^|\s)\S/g, c => c.toUpperCase());
  }

  function toSentence(str) {
    return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
  }

  function toAlternate(str) {
    let i = 0;
    return str.replace(/[a-zA-Z]/g, c => (i++ % 2 === 0 ? c.toUpperCase() : c.toLowerCase()));
  }

  function trimSpaces(str) {
    return str.replace(/[^\S\n]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  }

  function deduplicate(str) {
    const lines = str.split('\n');
    const seen = new Set();
    return lines.filter(l => {
      if (seen.has(l)) return false;
      seen.add(l); return true;
    }).join('\n');
  }

  container.querySelector('#btn-upper').addEventListener('click',   () => transform(s => s.toUpperCase()));
  container.querySelector('#btn-lower').addEventListener('click',   () => transform(s => s.toLowerCase()));
  container.querySelector('#btn-title').addEventListener('click',   () => transform(toTitle));
  container.querySelector('#btn-sentence').addEventListener('click',() => transform(toSentence));
  container.querySelector('#btn-alt').addEventListener('click',     () => transform(toAlternate));
  container.querySelector('#btn-reverse').addEventListener('click', () => transform(s => s.split('').reverse().join('')));
  container.querySelector('#btn-trim').addEventListener('click',    () => transform(trimSpaces));
  container.querySelector('#btn-dedup').addEventListener('click',   () => transform(deduplicate));

  container.querySelector('#btn-clear-text').addEventListener('click', () => {
    textarea.value = '';
    updateStats();
  });

  // ── Copy ──────────────────────────────────────────────────
  container.querySelector('#btn-copy-text').addEventListener('click', async () => {
    if (!textarea.value) return;
    await navigator.clipboard.writeText(textarea.value).catch(() => {});
    const toast = container.querySelector('#text-copy-toast');
    toast.style.display = 'inline';
    setTimeout(() => (toast.style.display = 'none'), 2000);
  });

  // ── Find & Replace ────────────────────────────────────────
  container.querySelector('#btn-replace').addEventListener('click', () => {
    const find    = container.querySelector('#sr-find').value;
    const replace = container.querySelector('#sr-replace').value;
    const cs      = container.querySelector('#sr-case').checked;
    const fb      = container.querySelector('#sr-feedback');

    if (!find) { fb.textContent = '⚠ Ingresá el texto a buscar.'; return; }

    const flags  = cs ? 'g' : 'gi';
    let regex;
    try { regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags); }
    catch { fb.textContent = '⚠ Expresión inválida.'; return; }

    const matches = (textarea.value.match(regex) || []).length;
    textarea.value = textarea.value.replace(regex, replace);
    fb.textContent = matches ? `✓ ${matches} reemplazo(s) realizados.` : '⚠ Sin coincidencias.';
    fb.style.color = matches ? 'var(--color-success)' : 'var(--color-muted)';
    updateStats();
  });
}
