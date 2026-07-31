const authService = require('./auth.service');
const { asyncHandler } = require('../../middlewares/errorHandler');

/**
 * AuthController
 * Traduce las peticiones HTTP del módulo de autenticación
 * (correspondiente a pages/auth.html en el frontend) hacia el servicio.
 */
class AuthController {
  registrar = asyncHandler(async (req, res) => {
    const resultado = await authService.registrar(req.body);
    res.status(201).json({ exito: true, mensaje: 'Usuario registrado correctamente', ...resultado });
  });

  iniciarSesion = asyncHandler(async (req, res) => {
    const resultado = await authService.iniciarSesion(req.body);
    res.status(200).json({ exito: true, mensaje: 'Inicio de sesión exitoso', ...resultado });
  });
}

module.exports = new AuthController();
