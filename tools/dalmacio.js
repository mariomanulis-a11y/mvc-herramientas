/**
 * tools/dalmacio.js — Wrapper de integración de Dalmacio en MVC Herramientas
 * Carga el asistente jurídico en un iframe que ocupa el panel principal.
 */

export function initDalmacio(container) {
  container.innerHTML = `
    <div style="
      position: relative;
      width: 100%;
      height: calc(100vh - 52px);
      overflow: hidden;
    ">
      <iframe
        src="./dalmacio/index.html"
        title="Dalmacio — Asistente Jurídico"
        style="
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        "
        allow="clipboard-write"
      ></iframe>
    </div>
  `;

  // Sin cleanup necesario: el iframe se destruye cuando el container se vacía
  return null;
}
