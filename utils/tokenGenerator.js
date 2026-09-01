// utils/tokenGenerator.js

/**
 * Crea un "contexto de sanitización" nuevo para una request.
 * Contiene:
 *  - counters: cuántos tokens de cada tipo se generaron (DNI_1, DNI_2, ...)
 *  - valueToToken: para reutilizar el mismo token si el mismo valor se repite
 *  - map: mapa final token -> valor original (nunca se envía a la IA)
 */
function crearContextoSanitizacion() {
  return {
    counters: {},
    valueToToken: new Map(),
    map: {},
  };
}

/**
 * Devuelve el token correspondiente a "valorOriginal" para el tipo "tipo"
 * (por ejemplo tipo = "DNI", "CUIT", "EMAIL", "TARJETA", "USUARIO").
 * Si el valor ya fue tokenizado antes en esta misma request, reutiliza
 * el token existente (requisito RF-08: evitar duplicación innecesaria).
 */
function obtenerOTupleToken(tipo, valorOriginal, contexto) {
  const clave = `${tipo}:${valorOriginal}`;

  if (contexto.valueToToken.has(clave)) {
    return contexto.valueToToken.get(clave);
  }

  contexto.counters[tipo] = (contexto.counters[tipo] || 0) + 1;
  const token = `[${tipo}_${contexto.counters[tipo]}]`;

  contexto.valueToToken.set(clave, token);
  contexto.map[token] = valorOriginal;

  return token;
}

module.exports = { crearContextoSanitizacion, obtenerOTupleToken };
