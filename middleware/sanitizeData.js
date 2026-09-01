// middleware/sanitizeData.js
const {
  detectarEmail,
  detectarTarjeta,
  detectarCUIT,
  detectarDNI,
  detectarPersonas,
} = require("../utils/detectores");
const {
  crearContextoSanitizacion,
  obtenerOTupleToken,
} = require("../utils/tokenGenerator");

/**
 * Reemplaza en "texto" todas las ocurrencias de "valores" (array de
   * strings encontrados por un detector) por su token correspondiente,
      * reutilizando tokens para valores repetidos (RF-08).
          */
function reemplazarValores(texto, valores, tipo, contexto) {
  // Se ordenan de más largo a más corto para evitar reemplazos parciales
  // cuando un valor es substring de otro (por ejemplo nombres compuestos).
  const unicos = [...new Set(valores)].sort((a, b) => b.length - a.length);

  let resultado = texto;
  for (const valor of unicos) {
    const token = obtenerOTupleToken(tipo, valor, contexto);
    // Escapar caracteres especiales de RegEx antes de usar el valor
    // como patrón de búsqueda.
    const valorEscapado = valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    resultado = resultado.replace(new RegExp(valorEscapado, "g"), token);
  }
  return resultado;
}

/**
 * Middleware principal de sanitización.
   * Requisitos cubiertos: RF-01, RF-02, RF-03, RF-05, RF-06, RF-07, RF-08,
      * RT-03, RT-04.
          */
function sanitizeData(req, res, next) {
  try {
    const prompt = req.body && req.body.prompt;

    // Manejo de errores: prompt inexistente o vacío (sin loguear el
    // contenido, para no filtrar datos personales en logs).
    if (prompt === undefined || prompt === null) {
      return res.status(400).json({ error: "El campo 'prompt' es requerido." });
    }
    if (typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ error: "El campo 'prompt' no puede estar vacío." });
    }

    const contexto = crearContextoSanitizacion();
    let textoSanitizado = prompt;

    // Orden de detección: email y tarjeta primero (patrones más
    // específicos), luego CUIT, luego DNI, y por último personas.
    // Esto evita que un patrón "genérico" (como el de DNI) capture
    // fragmentos de un patrón más específico (como CUIT o tarjeta).
    textoSanitizado = reemplazarValores(
      textoSanitizado,
      detectarEmail(textoSanitizado),
      "EMAIL",
      contexto
    );
    textoSanitizado = reemplazarValores(
      textoSanitizado,
      detectarTarjeta(textoSanitizado),
      "TARJETA",
      contexto
    );
    textoSanitizado = reemplazarValores(
      textoSanitizado,
      detectarCUIT(textoSanitizado),
      "CUIT",
      contexto
    );
    textoSanitizado = reemplazarValores(
      textoSanitizado,
      detectarDNI(textoSanitizado),
      "DNI",
      contexto
    );
    textoSanitizado = reemplazarValores(
      textoSanitizado,
      detectarPersonas(textoSanitizado),
      "USUARIO",
      contexto
    );

    // El texto original NUNCA se adjunta a req para ser reenviado; solo
    // viaja el texto sanitizado y el mapa (que se usa server-side).
    req.sanitizedPrompt = textoSanitizado;
    req.substitutionMap = contexto.map; // { "[DNI_1]": "30123456", ... }

    // Log seguro: nunca se imprime el prompt original ni el mapa.
    console.log(
      `[sanitizeData] Prompt sanitizado. Entidades detectadas: ${Object.keys(contexto.map).length
      }`
    );

    return next();
  } catch (error) {
    // Nunca exponer datos personales en el mensaje de error.
    console.error("[sanitizeData] Error durante la sanitización:", error.message);
    return res.status(500).json({ error: "Error al procesar la solicitud." });
  }
}

module.exports = sanitizeData;