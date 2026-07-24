/**
 * Middleware centralizado de manejo de errores.
 * Convierte las excepciones lanzadas en los servicios/modelos en
 * respuestas HTTP consistentes, evitando repetir try/catch por ruta.
 */
function manejadorDeErrores(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} ->`, err.message);

  const mensajesDeValidacion = [
    'no tiene un formato válido', 'debe tener', 'obligatorio', 'obligatorios',
    'inválido', 'no pueden ser iguales', 'debe estar entre', 'ya existe',
    'ya pasada', 'reserva activa'
  ];
  const mensajeEnMinuscula = (err.message || '').toLowerCase();
  const esErrorDeValidacion = mensajesDeValidacion.some((frag) => mensajeEnMinuscula.includes(frag));

  const codigo = esErrorDeValidacion ? 400
    : mensajeEnMinuscula.includes('no encontrad') ? 404
    : mensajeEnMinuscula.includes('permisos') || mensajeEnMinuscula.includes('credenciales') ? 401
    : 500;

  res.status(codigo).json({
    exito: false,
    mensaje: err.message || 'Error interno del servidor'
  });
}

/** Envuelve controladores async para propagar errores al middleware anterior */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { manejadorDeErrores, asyncHandler };
