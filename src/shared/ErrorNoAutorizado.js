/**
 * ErrorNoAutorizado
 * Hermano de ErrorDeValidacion, para que el middleware de manejo de errores
 * responda siempre con 401 de forma confiable, sin depender de palabras
 * clave del texto del mensaje.
 */
class ErrorNoAutorizado extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorNoAutorizado';
  }
}

module.exports = ErrorNoAutorizado;
