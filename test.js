// test.js — Test local del middleware de sanitización (no requiere API key)

const {
  detectarEmail,
  detectarTarjeta,
  detectarCUIT,
  detectarDNI,
  detectarPersonas,
} = require("./utils/detectores");
const {
  crearContextoSanitizacion,
  obtenerOTupleToken,
} = require("./utils/tokenGenerator");
const desanitizar = require("./utils/desanitizar");

// Simular el flujo completo del middleware
function simularSanitizacion(prompt) {
  const contexto = crearContextoSanitizacion();

  function reemplazarValores(texto, valores, tipo) {
    const unicos = [...new Set(valores)].sort((a, b) => b.length - a.length);
    let resultado = texto;
    for (const valor of unicos) {
      const token = obtenerOTupleToken(tipo, valor, contexto);
      const valorEscapado = valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      resultado = resultado.replace(new RegExp(valorEscapado, "g"), token);
    }
    return resultado;
  }

  let textoSanitizado = prompt;

  textoSanitizado = reemplazarValores(textoSanitizado, detectarEmail(textoSanitizado), "EMAIL");
  textoSanitizado = reemplazarValores(textoSanitizado, detectarTarjeta(textoSanitizado), "TARJETA");
  textoSanitizado = reemplazarValores(textoSanitizado, detectarCUIT(textoSanitizado), "CUIT");
  textoSanitizado = reemplazarValores(textoSanitizado, detectarDNI(textoSanitizado), "DNI");
  textoSanitizado = reemplazarValores(textoSanitizado, detectarPersonas(textoSanitizado), "USUARIO");

  return { textoSanitizado, mapa: contexto.map };
}

// ── Test principal ──────────────────────────────────────────────────────
console.log("═══════════════════════════════════════════════════════════");
console.log("  TEST DEL MIDDLEWARE DE SANITIZACIÓN DE DATOS PERSONALES");
console.log("═══════════════════════════════════════════════════════════\n");

const promptOriginal = `Hola, soy Juan Pérez. Mi DNI es 30123456 y mi correo es juan.perez@gmail.com.
Mi CUIT es 20-30123456-7 y mi tarjeta es 4111 1111 1111 1111.
Juan Pérez vive en Salta.`;

console.log("📝 PROMPT ORIGINAL:");
console.log("───────────────────");
console.log(promptOriginal);
console.log();

const { textoSanitizado, mapa } = simularSanitizacion(promptOriginal);

console.log("🔒 PROMPT SANITIZADO (lo que recibiría la IA):");
console.log("───────────────────────────────────────────────");
console.log(textoSanitizado);
console.log();

console.log("🗺️  MAPA DE SUSTITUCIONES (solo en el servidor):");
console.log("─────────────────────────────────────────────────");
console.log(JSON.stringify(mapa, null, 2));
console.log();

// Simular respuesta de IA y desanitización
const respuestaIASimulada = "Hola [USUARIO_1], he recibido tus datos. Tu [DNI_1] está registrado correctamente.";
const respuestaDesanitizada = desanitizar(respuestaIASimulada, mapa);

console.log("🤖 RESPUESTA SIMULADA DE LA IA (con tokens):");
console.log("─────────────────────────────────────────────");
console.log(respuestaIASimulada);
console.log();

console.log("✅ RESPUESTA DESANITIZADA (lo que ve el usuario):");
console.log("──────────────────────────────────────────────────");
console.log(respuestaDesanitizada);
console.log();

// ── Verificaciones ──────────────────────────────────────────────────────
let errores = 0;

function verificar(condicion, descripcion) {
  if (condicion) {
    console.log(`  ✅ ${descripcion}`);
  } else {
    console.log(`  ❌ ${descripcion}`);
    errores++;
  }
}

console.log("🧪 VERIFICACIONES:");
console.log("───────────────────");

verificar(!textoSanitizado.includes("Juan Pérez"), "Nombre reemplazado");
verificar(!textoSanitizado.includes("30123456"), "DNI reemplazado");
verificar(!textoSanitizado.includes("juan.perez@gmail.com"), "Email reemplazado");
verificar(!textoSanitizado.includes("20-30123456-7"), "CUIT reemplazado");
verificar(!textoSanitizado.includes("4111 1111 1111 1111"), "Tarjeta reemplazada");

verificar(textoSanitizado.includes("[USUARIO_1]"), "Token USUARIO_1 presente");
verificar(textoSanitizado.includes("[DNI_1]"), "Token DNI_1 presente");
verificar(textoSanitizado.includes("[EMAIL_1]"), "Token EMAIL_1 presente");
verificar(textoSanitizado.includes("[CUIT_1]"), "Token CUIT_1 presente");
verificar(textoSanitizado.includes("[TARJETA_1]"), "Token TARJETA_1 presente");

// Verificar reutilización de token (Juan Pérez aparece 2 veces)
const ocurrencias = (textoSanitizado.match(/\[USUARIO_1\]/g) || []).length;
verificar(ocurrencias === 2, `Token USUARIO_1 reutilizado (aparece ${ocurrencias} veces)`);

// Verificar desanitización
verificar(respuestaDesanitizada.includes("Juan Pérez"), "Desanitización restaura nombre");
verificar(respuestaDesanitizada.includes("30123456"), "Desanitización restaura DNI");

verificar(mapa["[EMAIL_1]"] === "juan.perez@gmail.com", "Mapa contiene email correcto");
verificar(mapa["[TARJETA_1]"] === "4111 1111 1111 1111", "Mapa contiene tarjeta correcta");
verificar(mapa["[CUIT_1]"] === "20-30123456-7", "Mapa contiene CUIT correcto");

console.log();
if (errores === 0) {
  console.log("🎉 TODAS LAS VERIFICACIONES PASARON CORRECTAMENTE");
} else {
  console.log(`⚠️  ${errores} verificación(es) fallaron`);
}
console.log();
