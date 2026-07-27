/**
 * ErrorNoEncontrado / ErrorNoAutorizado
 * Familia de errores específicos, hermanos de ErrorDeValidacion, para que
 * el middleware de manejo de errores responda con el código HTTP correcto
 * (404 / 401) de forma confiable, sin depender de palabras clave del texto.
 */
class ErrorNoEncontrado extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorNoEncontrado';
  }
}

class ErrorNoAutorizado extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorNoAutorizado';
  }
}

module.exports = { ErrorNoEncontrado, ErrorNoAutorizado };
