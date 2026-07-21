const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación: valida el token JWT enviado en el
 * encabezado Authorization y adjunta los datos del usuario a `req.usuario`.
 */
function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization;
  if (!encabezado || !encabezado.startsWith('Bearer ')) {
    return res.status(401).json({ exito: false, mensaje: 'Token de autenticación no proporcionado' });
  }

  const token = encabezado.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'clave_de_desarrollo');
    req.usuario = payload;
    next();
  } catch (error) {
    return res.status(401).json({ exito: false, mensaje: 'Token inválido o expirado' });
  }
}

/** Middleware para restringir rutas solo a conductores */
function soloConductores(req, res, next) {
  if (req.usuario?.tipoUsuario !== 'conductor' && req.usuario?.tipoUsuario !== 'ambos') {
    return res.status(403).json({ exito: false, mensaje: 'Esta acción requiere un perfil de conductor' });
  }
  next();
}

module.exports = { verificarToken, soloConductores };
