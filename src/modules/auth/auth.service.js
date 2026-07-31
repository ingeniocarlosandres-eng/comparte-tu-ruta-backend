const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../usuarios/usuario.model');
const usuarioRepository = require('../usuarios/usuario.repository');

/**
 * AuthService
 * Contiene la lógica de negocio de registro, inicio de sesión y
 * generación de tokens JWT. Se apoya en UsuarioRepository para
 * la persistencia, respetando la separación de responsabilidades.
 */
class AuthService {
  async registrar({
    nombre, email, password, telefono, barrio, tipoUsuario,
  }) {
    const existente = await usuarioRepository.buscarPorEmail(email);
    if (existente) {
      throw new Error('Ya existe un usuario registrado con este correo electrónico');
    }
    if (!password || password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const usuario = new Usuario({
      nombre, email, passwordHash, telefono, barrio, tipoUsuario,
    });
    const usuarioCreado = await usuarioRepository.crear(usuario);

    return {
      usuario: usuarioCreado.toPublicJSON(),
      token: this._generarToken(usuarioCreado),
    };
  }

  async iniciarSesion({ email, password }) {
    const usuario = await usuarioRepository.buscarPorEmail(email);
    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }
    const coincide = await bcrypt.compare(password, usuario.passwordHash);
    if (!coincide) {
      throw new Error('Credenciales inválidas');
    }
    if (usuario.estado !== 'activo') {
      throw new Error('Esta cuenta se encuentra inactiva');
    }
    return {
      usuario: usuario.toPublicJSON(),
      token: this._generarToken(usuario),
    };
  }

  _generarToken(usuario) {
    return jwt.sign(
      { id: usuario.id, email: usuario.email, tipoUsuario: usuario.tipoUsuario },
      process.env.JWT_SECRET || 'clave_de_desarrollo',
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' },
    );
  }
}

module.exports = new AuthService();
