/**
 * prompts/templates.js — User message templates por módulo
 * Estudio Jurídico Manulis — San Isidro, Provincia de Buenos Aires
 *
 * Cada función genera el prompt de usuario para un módulo específico,
 * combinando el contexto del caso con el input del usuario.
 */

/**
 * Template para el módulo de Redacción.
 * @param {string} tipoEscrito — tipo de documento a redactar
 * @param {string} instruccionesAdicionales — instrucciones del usuario
 * @param {Object} contexto — contexto del caso activo
 * @returns {string}
 */
export function templateRedaccion(tipoEscrito, instruccionesAdicionales, contexto) {
  const datosPartes = contexto
    ? `\nPartes: ${contexto.cliente} (parte actora/requirente) vs. contraparte a indicar.\nJuzgado: ${contexto.juzgado}\nExpediente: ${contexto.expediente}\nMateria: ${contexto.materia}`
    : "";

  return `Necesito que redactes el siguiente documento jurídico:

TIPO DE ESCRITO: ${tipoEscrito}
${datosPartes}

INSTRUCCIONES ESPECÍFICAS:
${instruccionesAdicionales}

Por favor incluí:
1. Encabezado formal completo con datos del tribunal y partes.
2. Hechos numerados y cronológicamente ordenados.
3. Derecho aplicable con citas normativas precisas.
4. Petitorio claro y detallado.
5. Lugar, fecha y espacio para firma del letrado.

Redactá el documento completo, listo para presentar (con el disclaimer correspondiente al final).`;
}

/**
 * Template para el módulo de Análisis.
 * @param {string} hechos — descripción de los hechos a analizar
 * @param {Object} contexto — contexto del caso activo
 * @returns {string}
 */
export function templateAnalisis(hechos, contexto) {
  const fueroPrincipal = contexto?.fuero || "a determinar";

  return `Analizá los siguientes hechos desde una perspectiva jurídica, considerando el fuero ${fueroPrincipal}:

HECHOS A ANALIZAR:
${hechos}

Por favor estructurá tu respuesta de la siguiente manera:

**Hechos jurídicamente relevantes**
[Identifica y jerarquiza los hechos con relevancia jurídica]

**Marco legal aplicable**
[Normas, artículos y leyes que aplican al caso]

**Posibles acciones legales**
[Lista cada acción posible con probabilidad de éxito estimada: ALTA / MEDIA / BAJA y fundamento]

**Plazos de prescripción aplicables**
[Identificá los plazos críticos con sus fuentes normativas]

**Riesgos y contingencias**
[Aspectos débiles del caso, riesgos procesales, contingencias a considerar]

Sé preciso con las citas normativas y advierte si hay jurisprudencia que deba verificarse.`;
}

/**
 * Template para el módulo de Estrategia.
 * @param {string} objetivo — objetivo del cliente / resultado deseado
 * @param {string} analisisPrevio — resultado del análisis previo (opcional)
 * @param {Object} contexto — contexto del caso activo
 * @returns {string}
 */
export function templateEstrategia(objetivo, analisisPrevio, contexto) {
  const materiaBase = contexto?.materia || "materia no especificada";

  return `Necesito que diseñes una estrategia procesal para el siguiente caso:

MATERIA: ${materiaBase}
OBJETIVO DEL CLIENTE: ${objetivo}

${analisisPrevio ? `ANÁLISIS PREVIO DEL CASO:\n${analisisPrevio}\n` : ""}

Por favor elaborá una hoja de ruta procesal que incluya:

1. **Vía recomendada** (judicial / extrajudicial / mediación previa — con justificación)
2. **Pasos cronológicos** numerados por orden de ejecución, indicando para cada uno:
   - Urgencia: INMEDIATA / CORTO PLAZO (30 días) / MEDIANO PLAZO
   - Organismo o juzgado ante el cual actuar
   - Documentación o requisitos previos
3. **Riesgos en cada etapa** del proceso
4. **Alternativas** si la vía principal falla
5. **Estimación de tiempos** de resolución (con rangos realistas para el fuero bonaerense)

Priorizá la eficiencia procesal y el control de riesgos.`;
}

/**
 * Template para el módulo de Normativa.
 * @param {string} consulta — ley, artículo o tema jurídico a consultar
 * @param {Object} contexto — contexto del caso activo
 * @returns {string}
 */
export function templateNormativa(consulta, contexto) {
  const aplicacionCaso = contexto
    ? `\nRelacioná la respuesta con el caso activo: ${contexto.materia} — ${contexto.cliente}.`
    : "";

  return `Necesito información jurídica sobre el siguiente tema:

CONSULTA: ${consulta}
${aplicacionCaso}

Por favor estructurá tu respuesta así:

**Norma / Fuente**
[Identificación completa de la ley, decreto o norma]

**Artículos relevantes**
[Transcripción o resumen fiel de los artículos aplicables — indicá si es resumen]

**Interpretación doctrinaria predominante**
[Corrientes de interpretación mayoritarias y minoritarias]

**Jurisprudencia relevante conocida**
[Fallos que conozcas con certeza. Si no tenés certeza de la existencia exacta de un fallo, indicalo y recomendá buscarlo en SAIJ / Microjuris / PJN]

**Aplicación al caso**
[Cómo aplica esta normativa concretamente al caso activo]

⚠️ Recordá advertir si la información puede estar desactualizada y recomendá verificación en fuentes oficiales.`;
}

/**
 * Template para el módulo de Checklist.
 * @param {string} tipoAccion — tipo de acción legal (despido, accidente, etc.)
 * @param {Object} contexto — contexto del caso activo
 * @returns {string}
 */
export function templateChecklist(tipoAccion, contexto) {
  const datosExtra = contexto
    ? `\nDatos del caso: ${contexto.materia} — Fuero: ${contexto.fuero} — Jurisdicción: ${contexto.jurisdiccion}`
    : "";

  return `Generá un checklist completo y accionable para el siguiente tipo de acción legal:

TIPO DE ACCIÓN: ${tipoAccion}
${datosExtra}

El checklist debe:
1. Estar ordenado cronológicamente (desde el momento del hecho hasta la resolución).
2. Indicar para cada ítem:
   - [ ] Acción concreta a realizar
   - Documentación a recopilar o presentar
   - Plazo crítico si aplica (con fundamento normativo)
   - Organismo o persona responsable de la acción
3. Incluir sección separada de "Documentación a reunir desde el inicio".
4. Incluir sección de "Plazos críticos — no vencer".
5. Estar adaptado al fuero y jurisdicción del caso cuando sea posible.

Sé específico y accionable. Priorizá los ítems más urgentes al inicio.`;
}

/**
 * Template para consultas libres (chat general).
 * Simplemente pasa el input del usuario sin estructurar.
 * @param {string} userInput
 * @returns {string}
 */
export function templateChat(userInput) {
  return userInput;
}
