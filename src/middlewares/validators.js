const { validationResult } = require('express-validator');

/** Verifica los resultados de express-validator y corta la petición si hay errores */
function validarCampos(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      exito: false,
      mensaje: 'Error de validación en los datos enviados',
      errores: errores.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
    });
  }
  return next();
}

module.exports = { validarCampos };
