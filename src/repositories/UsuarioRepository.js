const { pool } = require('../config/database');
const Usuario = require('../models/Usuario');

/**
 * UsuarioRepository
 * Capa de acceso a datos: encapsula todas las consultas SQL relacionadas
 * con la tabla `usuarios`. Los servicios nunca escriben SQL directamente,
 * solo llaman a los métodos de este repositorio (separación de responsabilidades).
 */
class UsuarioRepository {
  static _mapRowToUsuario(row) {
    if (!row) return null;
    return new Usuario({
      id: row.id,
      nombre: row.nombre,
      email: row.email,
      passwordHash: row.password_hash,
      telefono: row.telefono,
      barrio: row.barrio,
      tipoUsuario: row.tipo_usuario,
      estado: row.estado,
      creadoEn: row.creado_en,
    });
  }

  async crear(usuario) {
    const [resultado] = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, telefono, barrio, tipo_usuario)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [usuario.nombre, usuario.email, usuario.passwordHash, usuario.telefono, usuario.barrio, usuario.tipoUsuario],
    );
    return this.buscarPorId(resultado.insertId);
  }

  async buscarPorId(id) {
    const [filas] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    return UsuarioRepository._mapRowToUsuario(filas[0]);
  }

  async buscarPorEmail(email) {
    const [filas] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return UsuarioRepository._mapRowToUsuario(filas[0]);
  }

  async listarTodos({ tipoUsuario } = {}) {
    let sql = 'SELECT * FROM usuarios';
    const params = [];
    if (tipoUsuario) {
      sql += ' WHERE tipo_usuario = ?';
      params.push(tipoUsuario);
    }
    sql += ' ORDER BY creado_en DESC';
    const [filas] = await pool.query(sql, params);
    return filas.map(UsuarioRepository._mapRowToUsuario);
  }

  async actualizar(id, cambios) {
    const camposPermitidos = ['nombre', 'telefono', 'barrio', 'tipo_usuario', 'estado'];
    const asignaciones = [];
    const valores = [];

    Object.entries(cambios)
      .filter(([clave]) => camposPermitidos.includes(clave))
      .forEach(([clave, valor]) => {
        asignaciones.push(`${clave} = ?`);
        valores.push(valor);
      });
    if (asignaciones.length === 0) return this.buscarPorId(id);

    valores.push(id);
    await pool.query(`UPDATE usuarios SET ${asignaciones.join(', ')} WHERE id = ?`, valores);
    return this.buscarPorId(id);
  }

  async eliminar(id) {
    const [resultado] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    return resultado.affectedRows > 0;
  }
}

module.exports = new UsuarioRepository();
