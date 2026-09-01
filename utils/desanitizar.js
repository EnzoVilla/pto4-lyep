// utils/desanitizar.js

/**
 * Reemplaza los tokens presentes en "textoConTokens" por sus valores
 * originales, usando el mapa generado por el middleware de sanitización.
 * Uso típico: reconstruir la respuesta de la IA antes de mostrarla al
 * usuario final, sin que el valor real haya sido enviado a la IA.
 */
function desanitizar(textoConTokens, substitutionMap) {
  let resultado = textoConTokens;
  for (const [token, valorOriginal] of Object.entries(substitutionMap || {})) {
    resultado = resultado.split(token).join(valorOriginal);
  }
  return resultado;
}

module.exports = desanitizar;
