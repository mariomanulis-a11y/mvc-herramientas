/* ============================================================
   Password Generator Tool — tools/password.js
   ============================================================ */

export function initPassword(container) {

  const CHARS = {
    upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower:   'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?'
  };

  container.innerHTML = `
    <div class="tool-card">
      <h2>🔐 Generador de Contraseñas</h2>

      <div class="password-output" style="margin-bottom:10px;">
        <div class="display-box" id="pwd-output" style="font-family:monospace;letter-spacing:0.06em;">
          —
        </div>
        <button class="btn btn-ghost" id="pwd-copy" title="Copiar">📋</button>
      </div>

      <div class="strength-bar-wrap">
        <div class="strength-bar-bg">
          <div class="strength-bar" id="pwd-strength-bar" style="width:0%;background:var(--color-muted)"></div>
        </div>
        <div class="strength-label" id="pwd-strength-label" style="color:var(--color-muted)">—</div>
      </div>

      <div style="margin: 20px 0 10px;">
        <label>Longitud: <span id="pwd-len-label">16</span> caracteres</label>
        <input type="range" id="pwd-length" min="6" max="64" value="16">
      </div>

      <div style="margin-bottom:16px;">
        <div class="check-row">
          <input type="checkbox" id="opt-upper" checked>
          <label for="opt-upper">Mayúsculas (A–Z)</label>
        </div>
        <div class="check-row">
          <input type="checkbox" id="opt-lower" checked>
          <label for="opt-lower">Minúsculas (a–z)</label>
        </div>
        <div class="check-row">
          <input type="checkbox" id="opt-numbers" checked>
          <label for="opt-numbers">Números (0–9)</label>
        </div>
        <div class="check-row">
          <input type="checkbox" id="opt-symbols">
          <label for="opt-symbols">Símbolos (!@#$…)</label>
        </div>
        <div class="check-row">
          <input type="checkbox" id="opt-exclude-ambiguous">
          <label for="opt-exclude-ambiguous">Excluir caracteres ambiguos (0, O, l, 1, I)</label>
        </div>
      </div>

      <div class="btn-row">
        <button class="btn btn-primary" id="pwd-generate">Generar Contraseña</button>
        <button class="btn btn-ghost"   id="pwd-generate-batch">Generar 5</button>
      </div>

      <div id="pwd-batch" style="margin-top:16px;display:none;">
        <label style="margin-bottom:8px;">Lote de contraseñas</label>
        <div id="pwd-batch-list" style="display:flex;flex-direction:column;gap:6px;"></div>
      </div>

      <div id="pwd-copy-toast"
        style="margin-top:10px;display:none;font-size:0.8rem;color:var(--color-success);">
        ✓ Copiado al portapapeles
      </div>
    </div>`;

  // ── Helpers ───────────────────────────────────────────────
  function buildCharset() {
    let set = '';
    if (container.querySelector('#opt-upper').checked)   set += CHARS.upper;
    if (container.querySelector('#opt-lower').checked)   set += CHARS.lower;
    if (container.querySelector('#opt-numbers').checked) set += CHARS.numbers;
    if (container.querySelector('#opt-symbols').checked) set += CHARS.symbols;

    if (container.querySelector('#opt-exclude-ambiguous').checked) {
      set = set.replace(/[0Ol1I]/g, '');
    }

    return set;
  }

  function generate() {
    const charset = buildCharset();
    if (!charset) return '⚠ Seleccioná al menos una opción';

    const len = parseInt(container.querySelector('#pwd-length').value);
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    return Array.from(arr, n => charset[n % charset.length]).join('');
  }

  function calcStrength(pwd) {
    let score = 0;
    if (pwd.length >= 8)  score++;
    if (pwd.length >= 12) score++;
    if (pwd.length >= 20) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { pct: 20,  label: 'Muy débil', color: '#e74c3c' };
    if (score <= 3) return { pct: 40,  label: 'Débil',     color: '#e67e22' };
    if (score <= 4) return { pct: 60,  label: 'Moderada',  color: '#f1c40f' };
    if (score <= 5) return { pct: 80,  label: 'Fuerte',    color: '#2ecc71' };
    return             { pct: 100, label: 'Muy fuerte', color: '#27ae60' };
  }

  function setMain(pwd) {
    const out = container.querySelector('#pwd-output');
    out.textContent = pwd;

    if (pwd.startsWith('⚠')) return;

    const { pct, label, color } = calcStrength(pwd);
    const bar = container.querySelector('#pwd-strength-bar');
    bar.style.width = pct + '%';
    bar.style.background = color;
    container.querySelector('#pwd-strength-label').textContent = label;
    container.querySelector('#pwd-strength-label').style.color = color;
  }

  function showToast() {
    const toast = container.querySelector('#pwd-copy-toast');
    toast.style.display = 'block';
    setTimeout(() => (toast.style.display = 'none'), 2000);
  }

  // ── Events ────────────────────────────────────────────────
  container.querySelector('#pwd-length').addEventListener('input', e => {
    container.querySelector('#pwd-len-label').textContent = e.target.value;
  });

  container.querySelector('#pwd-generate').addEventListener('click', () => {
    container.querySelector('#pwd-batch').style.display = 'none';
    setMain(generate());
  });

  container.querySelector('#pwd-generate-batch').addEventListener('click', () => {
    const batch = container.querySelector('#pwd-batch');
    const list  = container.querySelector('#pwd-batch-list');
    batch.style.display = '';
    list.innerHTML = Array.from({ length: 5 }, () => {
      const pwd = generate();
      return `<div style="display:flex;align-items:center;gap:8px;">
        <div class="display-box" style="flex:1;font-family:monospace;font-size:0.85rem;padding:8px 12px;">${pwd}</div>
        <button class="btn btn-ghost" style="padding:7px 12px;" data-copy="${pwd}">📋</button>
      </div>`;
    }).join('');
  });

  container.querySelector('#pwd-copy').addEventListener('click', async () => {
    const val = container.querySelector('#pwd-output').textContent;
    if (!val || val === '—') return;
    await navigator.clipboard.writeText(val).catch(() => {});
    showToast();
  });

  // Batch copy delegation
  container.querySelector('#pwd-batch-list').addEventListener('click', async e => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    await navigator.clipboard.writeText(btn.dataset.copy).catch(() => {});
    showToast();
  });

  // Auto-generate on load
  setMain(generate());
}
