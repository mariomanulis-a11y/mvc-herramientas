// dias-habiles.js — Utilidades compartidas de cómputo de plazos (días hábiles/corridos)
// Extraído de la lógica de tools/plazos.js para reutilizar en tools/minutas.js y tools/demanda-art.js.
// No modifica plazos.js (que mantiene su propia copia ya probada en producción).

export const FERIADOS_FIJOS = new Set([
  '01-01', '03-24', '04-02', '05-01', '05-25',
  '06-17', '06-20', '07-09', '08-17', '10-12',
  '11-20', '12-08', '12-25'
]);

export function pad2(n) { return String(n).padStart(2, '0'); }

export function fmtFecha(d) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function diaSemana(d) {
  return ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][d.getDay()];
}

function mmdd(d) {
  return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function esFeriadoFijo(d) {
  return FERIADOS_FIJOS.has(mmdd(d));
}

export function enFeriaEnero(d) {
  return d.getMonth() === 0 && d.getDate() >= 1 && d.getDate() <= 31;
}

export function enFeriaJulio(d) {
  return d.getMonth() === 6 && d.getDate() >= 1 && d.getDate() <= 15;
}

export function esNoHabil(d, saltarFeria) {
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return true;         // fin de semana
  if (esFeriadoFijo(d)) return true;               // feriado nacional
  if (saltarFeria && (enFeriaEnero(d) || enFeriaJulio(d))) return true;
  return false;
}

export function motivoNoHabil(d, saltarFeria) {
  const dow = d.getDay();
  if (dow === 0) return 'domingo';
  if (dow === 6) return 'sábado';
  if (esFeriadoFijo(d)) return 'feriado nacional';
  if (saltarFeria && enFeriaEnero(d)) return 'feria judicial enero';
  if (saltarFeria && enFeriaJulio(d)) return 'feria judicial julio';
  return 'no hábil';
}

export function siguienteDia(d) {
  const r = new Date(d);
  r.setDate(r.getDate() + 1);
  return r;
}

// El plazo empieza a correr desde el día SIGUIENTE al acto/notificación
export function calcularHabiles(inicio, cantidad, saltarFeria) {
  const saltados = [];
  let actual = new Date(inicio);
  let contados = 0;

  actual = siguienteDia(actual);

  while (contados < cantidad) {
    if (esNoHabil(actual, saltarFeria)) {
      saltados.push({ fecha: new Date(actual), motivo: motivoNoHabil(actual, saltarFeria) });
    } else {
      contados++;
    }
    if (contados < cantidad) actual = siguienteDia(actual);
  }
  return { vencimiento: actual, saltados };
}

export function calcularCorridos(inicio, cantidad) {
  const r = new Date(inicio);
  r.setDate(r.getDate() + cantidad);
  return { vencimiento: r, saltados: [] };
}

export function calcularAnios(inicio, cantidadAnios) {
  const r = new Date(inicio);
  r.setFullYear(r.getFullYear() + cantidadAnios);
  return { vencimiento: r, saltados: [] };
}

// Próxima fecha hábil si vence en día no hábil
export function proximaHabil(d, saltarFeria) {
  let r = new Date(d);
  while (esNoHabil(r, saltarFeria)) {
    r = siguienteDia(r);
  }
  return r;
}
