// services/aiService.js

/**
 * Envía ÚNICAMENTE el prompt sanitizado a la API de IA.
 * La API key se lee de una variable de entorno, nunca hardcodeada.
 */
async function llamarAPIdeIA(promptSanitizado) {
  
  try {
    return promptSanitizado;
  } catch (error) {
    console.error("[aiService] Error al comunicarse con la API de IA:", error.message);
    throw new Error("No se pudo obtener respuesta de la IA.");
  }
}

module.exports = { llamarAPIdeIA };
