/**
 * ErrorDeValidacion
 * Error específico para violaciones de reglas de negocio o de formato de
 * datos (por ejemplo: precio por debajo del mínimo, campos obligatorios
 * faltantes, formato de email inválido, reserva duplicada, etc.).
 *
 * Se usa en lugar de `new Error(...)` en los modelos y servicios cuando la
 * causa del fallo es un dato inválido enviado por el cliente, para que el
 * middleware de manejo de errores (errorHandler.js) pueda responder siempre
 * con el código HTTP 400 de forma confiable, sin depender de comparar
 * fragmentos de texto del mensaje (lo cual ya causó errores reales: un
 * mensaje nuevo que no coincidía exactamente con las palabras esperadas
 * terminaba respondiendo 500 en vez de 400).
 */
class ErrorDeValidacion extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorDeValidacion';
  }
}

module.exports = ErrorDeValidacion;
