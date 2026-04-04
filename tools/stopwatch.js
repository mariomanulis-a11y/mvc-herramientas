/* ============================================================
   Stopwatch Tool — tools/stopwatch.js
   ============================================================ */

export function initStopwatch(container) {

  container.innerHTML = `
    <div class="tool-card">
      <h2>⏱ Cronómetro</h2>

      <div class="stopwatch-display" id="sw-display">
        00:00<span class="stopwatch-ms" id="sw-ms">.000</span>
      </div>

      <div class="btn-row" style="justify-content:center; margin-bottom:20px;">
        <button class="btn btn-primary"  id="sw-start">▶ Iniciar</button>
        <button class="btn btn-ghost"    id="sw-pause" disabled>⏸ Pausar</button>
        <button class="btn btn-ghost"    id="sw-lap"   disabled>🔁 Vuelta</button>
        <button class="btn btn-danger"   id="sw-reset">⏹ Reset</button>
      </div>

      <div id="sw-laps-wrap" style="display:none;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <label style="margin:0;"># Vueltas</label>
          <button class="btn btn-ghost" id="sw-clear-laps"
            style="padding:4px 12px;font-size:0.75rem;">Limpiar</button>
        </div>
        <div id="sw-laps-list"
          style="max-height:240px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;">
        </div>
      </div>
    </div>`;

  let startTime  = 0;
  let elapsed    = 0;
  let rafId      = null;
  let running    = false;
  let lapCount   = 0;
  let lastLapAt  = 0;

  const display  = container.querySelector('#sw-display');
  const msEl     = container.querySelector('#sw-ms');
  const btnStart = container.querySelector('#sw-start');
  const btnPause = container.querySelector('#sw-pause');
  const btnLap   = container.querySelector('#sw-lap');
  const btnReset = container.querySelector('#sw-reset');
  const lapsWrap = container.querySelector('#sw-laps-wrap');
  const lapsList = container.querySelector('#sw-laps-list');

  // ── Formatting ────────────────────────────────────────────
  function fmt(ms) {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const mil = ms % 1000;
    return {
      main: `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`,
      ms:   '.' + String(mil).padStart(3, '0')
    };
  }

  function render() {
    const total = running ? elapsed + (performance.now() - startTime) : elapsed;
    const { main, ms } = fmt(Math.floor(total));
    display.firstChild.textContent = main;
    msEl.textContent = ms;
  }

  function tick() {
    render();
    if (running) rafId = requestAnimationFrame(tick);
  }

  // ── Controls ──────────────────────────────────────────────
  btnStart.addEventListener('click', () => {
    startTime = performance.now();
    running   = true;
    lastLapAt = elapsed; // lap starts from current elapsed
    btnStart.disabled = true;
    btnPause.disabled = false;
    btnLap.disabled   = false;
    rafId = requestAnimationFrame(tick);
  });

  btnPause.addEventListener('click', () => {
    elapsed += performance.now() - startTime;
    running = false;
    cancelAnimationFrame(rafId);
    btnStart.textContent  = '▶ Continuar';
    btnStart.disabled     = false;
    btnPause.disabled     = true;
    btnLap.disabled       = true;
    render();
  });

  btnLap.addEventListener('click', () => {
    lapCount++;
    const total   = elapsed + (performance.now() - startTime);
    const lapTime = total - lastLapAt;
    lastLapAt = total;

    const { main, ms } = fmt(Math.floor(total));
    const { main: lMain, ms: lMs } = fmt(Math.floor(lapTime));
    lapsWrap.style.display = '';

    const div = document.createElement('div');
    div.style.cssText = `
      display:flex; justify-content:space-between; align-items:center;
      padding:8px 14px; background:var(--color-bg);
      border:1px solid var(--color-input-border); border-radius:8px;
      font-size:0.85rem;`;
    div.innerHTML = `
      <span style="color:var(--color-muted);">Vuelta ${lapCount}</span>
      <span style="font-family:monospace;color:var(--color-accent);">${lMain}${lMs}</span>
      <span style="font-family:monospace;color:var(--color-muted);font-size:0.76rem;">Total ${main}${ms}</span>`;
    lapsList.prepend(div);
  });

  btnReset.addEventListener('click', () => {
    running = false;
    cancelAnimationFrame(rafId);
    elapsed = 0; startTime = 0; lapCount = 0; lastLapAt = 0;

    btnStart.textContent = '▶ Iniciar';
    btnStart.disabled    = false;
    btnPause.disabled    = true;
    btnLap.disabled      = true;

    display.firstChild.textContent = '00:00';
    msEl.textContent = '.000';
  });

  container.querySelector('#sw-clear-laps').addEventListener('click', () => {
    lapsList.innerHTML = '';
    lapCount = 0;
    lapsWrap.style.display = 'none';
  });

  // Return cleanup
  return () => { running = false; cancelAnimationFrame(rafId); };
}
