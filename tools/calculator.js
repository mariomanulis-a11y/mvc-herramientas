/* ============================================================
   Calculator Tool — tools/calculator.js
   ============================================================ */

export function initCalculator(container) {
  container.innerHTML = `
    <div class="tool-card">
      <h2>🧮 Calculadora</h2>

      <div class="calc-display-wrap">
        <div class="calc-expr" id="calc-expr">&nbsp;</div>
        <div class="display-box large" id="calc-display">0</div>
      </div>

      <div class="calc-grid">
        <!-- row 1 -->
        <button class="calc-btn clear" data-action="clear">C</button>
        <button class="calc-btn op"    data-action="sign">+/−</button>
        <button class="calc-btn op"    data-action="percent">%</button>
        <button class="calc-btn op"    data-op="÷">÷</button>

        <!-- row 2 -->
        <button class="calc-btn" data-digit="7">7</button>
        <button class="calc-btn" data-digit="8">8</button>
        <button class="calc-btn" data-digit="9">9</button>
        <button class="calc-btn op" data-op="×">×</button>

        <!-- row 3 -->
        <button class="calc-btn" data-digit="4">4</button>
        <button class="calc-btn" data-digit="5">5</button>
        <button class="calc-btn" data-digit="6">6</button>
        <button class="calc-btn op" data-op="−">−</button>

        <!-- row 4 -->
        <button class="calc-btn" data-digit="1">1</button>
        <button class="calc-btn" data-digit="2">2</button>
        <button class="calc-btn" data-digit="3">3</button>
        <button class="calc-btn op" data-op="+">+</button>

        <!-- row 5 -->
        <button class="calc-btn span2" data-digit="0">0</button>
        <button class="calc-btn" data-action="decimal">,</button>
        <button class="calc-btn eq"   data-action="equals">=</button>
      </div>
    </div>`;

  // ── State ──────────────────────────────────────────────────
  let current   = '0';
  let operand   = null;
  let operator  = null;
  let resetNext = false;

  const display = container.querySelector('#calc-display');
  const expr    = container.querySelector('#calc-expr');

  function updateDisplay(val) {
    // Limit display length
    const str = String(val);
    display.textContent = str.length > 14 ? parseFloat(val).toExponential(6) : str;
  }

  function compute(a, op, b) {
    a = parseFloat(a); b = parseFloat(b);
    switch (op) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? 'Error' : a / b;
      default:  return b;
    }
  }

  function roundResult(n) {
    if (typeof n !== 'number') return n;
    // Remove floating-point noise
    return parseFloat(n.toPrecision(12));
  }

  // ── Event delegation ──────────────────────────────────────
  container.querySelector('.calc-grid').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const digit  = btn.dataset.digit;
    const op     = btn.dataset.op;
    const action = btn.dataset.action;

    if (digit !== undefined) {
      if (current === '0' || resetNext) {
        current = digit === '0' && resetNext ? '0' : digit;
        resetNext = false;
      } else {
        if (current.length >= 15) return;
        current += digit;
      }
      updateDisplay(current);
    }

    if (action === 'decimal') {
      if (resetNext) { current = '0'; resetNext = false; }
      if (!current.includes('.')) {
        current += '.';
        updateDisplay(current);
      }
    }

    if (action === 'sign') {
      if (current !== '0') {
        current = current.startsWith('-') ? current.slice(1) : '-' + current;
        updateDisplay(current);
      }
    }

    if (action === 'percent') {
      current = String(roundResult(parseFloat(current) / 100));
      updateDisplay(current);
    }

    if (action === 'clear') {
      current = '0'; operand = null; operator = null; resetNext = false;
      expr.innerHTML = '&nbsp;';
      updateDisplay('0');
    }

    if (op) {
      if (operator && !resetNext) {
        const result = roundResult(compute(operand, operator, current));
        current = String(result === 'Error' ? 'Error' : result);
        updateDisplay(current);
      }
      operand = current;
      operator = op;
      resetNext = true;
      expr.textContent = `${operand} ${operator}`;
    }

    if (action === 'equals') {
      if (!operator) return;
      const result = roundResult(compute(operand, operator, current));
      expr.textContent = `${operand} ${operator} ${current} =`;
      current = String(result);
      updateDisplay(current);
      operator = null; operand = null; resetNext = true;
    }
  });

  // ── Keyboard support ──────────────────────────────────────
  function onKeyDown(e) {
    const map = {
      '0':'0','1':'1','2':'2','3':'3','4':'4',
      '5':'5','6':'6','7':'7','8':'8','9':'9',
    };
    if (map[e.key]) {
      container.querySelector(`[data-digit="${e.key}"]`)?.click();
    }
    const opMap = { '+':'+', '-':'−', '*':'×', '/':'÷' };
    if (opMap[e.key]) {
      container.querySelector(`[data-op="${opMap[e.key]}"]`)?.click();
    }
    if (e.key === 'Enter' || e.key === '=')  container.querySelector('[data-action="equals"]')?.click();
    if (e.key === 'Escape' || e.key === 'c') container.querySelector('[data-action="clear"]')?.click();
    if (e.key === '.' || e.key === ',')      container.querySelector('[data-action="decimal"]')?.click();
    if (e.key === 'Backspace') {
      if (current.length > 1) current = current.slice(0, -1);
      else current = '0';
      updateDisplay(current);
    }
  }

  document.addEventListener('keydown', onKeyDown);

  // Return cleanup so the main app can remove listeners on tool switch
  return () => document.removeEventListener('keydown', onKeyDown);
}
