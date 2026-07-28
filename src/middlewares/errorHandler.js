/**
 * Middleware centralizado de manejo de errores.
 * Convierte las excepciones lanzadas en los servicios/modelos en
 * respuestas HTTP consistentes, evitando repetir try/catch por ruta.
 *
 * Clasificación del código HTTP:
 * 1) Primero, por el TIPO de error (ErrorDeValidacion, ErrorNoEncontrado,
 *    ErrorNoAutorizado) — forma confiable que no depende del texto exacto
 *    del mensaje.
 * 2) Si el error es un Error genérico (código antiguo o de terceros que no
 *    usa las clases anteriores), se usa como respaldo una búsqueda de
 *    palabras clave en el mensaje.
 */
function manejadorDeErrores(err, req, res, _next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} ->`, err.message);

  let codigo;
  if (err.name === 'ErrorDeValidacion') {
    codigo = 400;
  } else if (err.name === 'ErrorNoEncontrado') {
    codigo = 404;
  } else if (err.name === 'ErrorNoAutorizado') {
    codigo = 401;
  } else {
    // Respaldo por palabras clave, solo para errores que no usan las clases
    // específicas (ver nota arriba).
    const mensajesDeValidacion = [
      'no tiene un formato válido', 'debe tener', 'debe ser', 'debe estar',
      'obligatorio', 'obligatorios', 'inválido', 'no pueden ser iguales',
      'ya existe', 'ya pasada', 'reserva activa',
    ];
    const mensajeEnMinuscula = (err.message || '').toLowerCase();
    const esErrorDeValidacion = mensajesDeValidacion.some((frag) => mensajeEnMinuscula.includes(frag));

    if (esErrorDeValidacion) {
      codigo = 400;
    } else if (mensajeEnMinuscula.includes('no encontrad')) {
      codigo = 404;
    } else if (mensajeEnMinuscula.includes('permisos') || mensajeEnMinuscula.includes('credenciales')) {
      codigo = 401;
    } else {
      codigo = 500;
    }
  }

  res.status(codigo).json({
    exito: false,
    mensaje: err.message || 'Error interno del servidor',
  });
}

/** Envuelve controladores async para propagar errores al middleware anterior */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { manejadorDeErrores, asyncHandler };
