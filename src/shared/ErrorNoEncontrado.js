/**
 * ErrorNoEncontrado
 * Hermano de ErrorDeValidacion, para que el middleware de manejo de errores
 * responda siempre con 404 de forma confiable, sin depender de palabras
 * clave del texto del mensaje.
 */
class ErrorNoEncontrado extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorNoEncontrado';
  }
}

module.exports = ErrorNoEncontrado;
