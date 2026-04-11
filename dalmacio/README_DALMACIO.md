# Dalmacio — Asistente Jurídico Inteligente
**Estudio Jurídico Manulis · San Isidro, Provincia de Buenos Aires**

---

## 1. Configurar la API Key

Dalmacio **nunca hardcodea** la API key. Al abrir la aplicación por primera vez, aparece un modal de configuración.

**Pasos:**
1. Abrí `index.html` en tu navegador.
2. El modal de configuración aparece automáticamente si no hay key guardada.
3. Ingresá tu API key de Anthropic (formato `sk-ant-api03-...`).
4. La key se guarda en `sessionStorage` del navegador — **no persiste al cerrar la pestaña**, lo que es una medida de seguridad intencional.

**Para obtener una API key:** https://console.anthropic.com

**Para reconfigurar:** hacé click en el ícono ⚙ en la esquina superior derecha.

> 🔒 La key se almacena localmente en tu navegador y nunca pasa por servidores intermedios. Las llamadas van directo a `api.anthropic.com`.

---

## 2. Integrar al sitio herramientas.mvcabogados.com.ar

### Opción A — Subpágina directa (recomendada)
1. Subí la carpeta `dalmacio/` a tu repositorio en la ruta `/dalmacio/`.
2. Accedé como `https://herramientas.mvcabogados.com.ar/dalmacio/`.
3. Agregá un link en el nav principal del sitio:
   ```html
   <a href="/dalmacio/" class="tool-card">
     <span class="tool-icon">⚖️</span>
     <span>Dalmacio — Asistente Jurídico</span>
   </a>
   ```

### Opción B — Iframe embebido
Podés embeber Dalmacio en una página existente:
```html
<iframe
  src="/dalmacio/"
  width="100%"
  height="800"
  frameborder="0"
  title="Dalmacio — Asistente Jurídico"
></iframe>
```

> **Nota CORS:** Las llamadas a la API de Anthropic desde el navegador requieren el header `anthropic-dangerous-direct-browser-access: true`, que ya está incluido en `dalmacio.js`. Esto es apropiado para entornos de uso interno/profesional controlado.

---

## 3. Estructura de archivos

```
dalmacio/
├── index.html              ← UI principal (abrir esto en el navegador)
├── dalmacio.js             ← Orquestador central + llamada a la API
├── config.js               ← Modelo, endpoint, parámetros globales
├── context.js              ← Gestión de casos en localStorage
├── modules/
│   ├── redaccion.js        ← Escritos judiciales (demandas, CDs, recursos...)
│   ├── analisis.js         ← Análisis jurídico de hechos
│   ├── estrategia.js       ← Hoja de ruta procesal
│   ├── normativa.js        ← Consulta de leyes y jurisprudencia
│   └── checklist.js        ← Checklists por tipo de acción
├── prompts/
│   ├── system_prompt.js    ← Identidad y reglas de Dalmacio
│   └── templates.js        ← Prompts estructurados por módulo
└── ui/
    ├── chat.js             ← Renderizado del chat
    ├── sidebar.js          ← Panel de gestión de casos
    └── export.js           ← Exportación .txt / .docx
```

---

## 4. Agregar un nuevo módulo

Para agregar, por ejemplo, un módulo de **Cálculo de Liquidación**:

### Paso 1 — Crear el archivo del módulo
```javascript
// modules/liquidacion.js
import { callApi } from "../dalmacio.js";

export async function calcularLiquidacion(userInput, caseContext, historialMensajes = []) {
  const prompt = `Calculá la liquidación final para el siguiente caso:\n\n${userInput}`;
  return await callApi(prompt, historialMensajes);
}
```

### Paso 2 — Registrar en el orquestador (`dalmacio.js`)
```javascript
// En los imports:
import { calcularLiquidacion } from "./modules/liquidacion.js";

// En el switch de handleUserInput():
case "liquidacion":
  respuesta = await calcularLiquidacion(userText, ctx, historialApi);
  break;
```

### Paso 3 — Agregar botón en la toolbar (`index.html`)
```html
<button class="toolbar__btn" id="btn-mod-liquidacion" title="Calcular liquidación">
  <span class="btn-icon">🧮</span>
  <span>Liquidación</span>
</button>
```

### Paso 4 — Registrar el botón en `setupModuleButtons()` (`dalmacio.js`)
```javascript
"btn-mod-liquidacion": "liquidacion",
```

### Paso 5 — Agregar el prompt de activación en `getModulePrompt()`
```javascript
liquidacion: "Módulo **Liquidación** activado. Indicame los datos del despido y calcularé los rubros.",
```

---

## 5. Roadmap sugerido

### Fase 2 — Base de datos jurídica
- **SAIJ API:** Integrar búsqueda de normativa y jurisprudencia en tiempo real via la API pública del Sistema Argentino de Información Jurídica (saij.gob.ar).
- **Microjuris:** Conectar via API para búsqueda de fallos verificados.

### Fase 3 — Autenticación y multiusuario
- Agregar autenticación con **Firebase Auth** (Google/email).
- Cada abogado del estudio tiene su propio espacio de casos.
- Los casos dejan de estar solo en `localStorage` y se sincronizan en la nube.

### Fase 4 — Persistencia en la nube
- Migrar el almacenamiento de casos de `localStorage` a **Firebase Firestore** o **Supabase**.
- Historial de conversaciones persistente entre dispositivos.
- Backup automático de casos.

### Fase 5 — Funcionalidades avanzadas
- **OCR de documentos:** Subir un telegrama o contrato y que Dalmacio lo analice.
- **Cálculo automático de liquidaciones:** Con valores actualizados de SMVYM y topes del art. 245.
- **Agenda procesal:** Generación automática de vencimientos en Google Calendar.
- **Generación de .docx formateado:** Escritos con membrete del estudio directamente descargables.

---

## 6. Consideraciones de seguridad

- La API key **nunca** se guarda en código fuente ni en `localStorage` (solo en `sessionStorage`, que se borra al cerrar la pestaña).
- Para uso en producción con múltiples usuarios, **se recomienda un backend proxy** que maneje la API key en el servidor (Node.js/Express con `process.env.ANTHROPIC_API_KEY`), evitando exponer la key al cliente.
- Los datos de casos se guardan en `localStorage` del navegador — son privados por dominio pero no están cifrados. Para datos sensibles en producción, usar cifrado o backend.

---

*Dalmacio v1.0.0 — Generado con Claude Code · Estudio Jurídico Manulis*
