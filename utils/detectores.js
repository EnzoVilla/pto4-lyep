// utils/detectores.js

/**
 * ── EMAIL ──────────────────────────────────────────────────────────────
 * Detecta direcciones de correo con el formato usuario@dominio.tld
 * usuario: letras, números, puntos, %, +, -, _
 * dominio: letras, números, puntos y guiones
 * tld: 2 o más letras
 */
const REGEX_EMAIL = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/**
 * ── TARJETA DE CRÉDITO/DÉBITO ─────────────────────────────────────────
 * Detecta 16 dígitos agrupados de a 4, separados opcionalmente por
 * espacio o guión (formatos típicos: "4111 1111 1111 1111",
 * "4111-1111-1111-1111", "4111111111111111").
 * Se coloca ANTES que DNI/CUIT para no dejar "restos" numéricos sueltos.
 */
const REGEX_TARJETA = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;

/**
 * ── CUIT ARGENTINO ─────────────────────────────────────────────────────
 * Formato: XX-XXXXXXXX-X (2 dígitos, guión, 8 dígitos, guión, 1 dígito).
 * Los dos primeros dígitos corresponden a un tipo de persona/sociedad
 * habilitado por AFIP (20, 23, 24, 27, 30, 33, 34).
 * Se detecta ANTES que DNI, porque un CUIT contiene un DNI "adentro"
 * y de lo contrario el regex de DNI lo capturaría parcialmente.
 */
const REGEX_CUIT = /\b(20|2[3-4]|27|30|3[3-4])-?\d{8}-?\d\b/g;

/**
 * ── DNI ARGENTINO ──────────────────────────────────────────────────────
 * Formato: 7 u 8 dígitos, opcionalmente separados con puntos de miles
 * (30.123.456 o 30123456). Se ejecuta DESPUÉS de tarjeta y CUIT para
 * no capturar fragmentos de esos patrones.
 */
const REGEX_DNI = /\b\d{1,2}\.\d{3}\.\d{3}\b|\b\d{7,8}\b/g;

/**
 * ── NOMBRES PROPIOS (simplificación académica con RegEx) ──────────────
 * IMPORTANTE (ver sección 7 y 13 del documento): esto es una
 * simplificación. Detecta secuencias de 2 o más palabras que empiezan
 * con mayúscula ("Juan Pérez", "María José García"), lo cual es una
 * aproximación muy imperfecta a la tarea real de NER (produce falsos
 * positivos con inicios de oración, lugares, organizaciones, etc.).
 */
const REGEX_PERSONAS = /\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+\b/g;

function detectarEmail(texto) {
  return [...texto.matchAll(REGEX_EMAIL)].map((m) => m[0]);
}

function detectarTarjeta(texto) {
  return [...texto.matchAll(REGEX_TARJETA)].map((m) => m[0]);
}

function detectarCUIT(texto) {
  return [...texto.matchAll(REGEX_CUIT)].map((m) => m[0]);
}

function detectarDNI(texto) {
  return [...texto.matchAll(REGEX_DNI)].map((m) => m[0]);
}

/**
 * Detección de personas. Ver sección 7: en un sistema productivo esta
 * función debería delegar en un motor de NER real. Aquí se deja la
 * simplificación RegEx, pero la firma de la función es la misma que
 * tendría una implementación basada en NER, de forma que reemplazarla
 * no afecte al resto del middleware.
 */
function detectarPersonas(texto) {
  return [...texto.matchAll(REGEX_PERSONAS)].map((m) => m[0]);
}

module.exports = {
  detectarEmail,
  detectarTarjeta,
  detectarCUIT,
  detectarDNI,
  detectarPersonas,
};
