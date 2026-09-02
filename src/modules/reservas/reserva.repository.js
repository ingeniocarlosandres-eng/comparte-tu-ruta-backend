const { pool } = require('../../config/database');
const Reserva = require('./reserva.model');

/** Capa de acceso a datos para la tabla `reservas`. */
class ReservaRepository {
  static _mapRow(row) {
    if (!row) return null;
    return new Reserva({
      id: row.id,
      rutaId: row.ruta_id,
      pasajeroId: row.pasajero_id,
      puestosReservados: row.puestos_reservados,
      estado: row.estado,
      creadoEn: row.creado_en,
    });
  }

  async crear(reserva) {
    const [resultado] = await pool.query(
      `INSERT INTO reservas (ruta_id, pasajero_id, puestos_reservados, estado)
       VALUES (?, ?, ?, ?)`,
      [reserva.rutaId, reserva.pasajeroId, reserva.puestosReservados, reserva.estado],
    );
    return this.buscarPorId(resultado.insertId);
  }

  async buscarPorId(id) {
    const [filas] = await pool.query('SELECT * FROM reservas WHERE id = ?', [id]);
    return ReservaRepository._mapRow(filas[0]);
  }

  async listarPorRuta(rutaId) {
    const [filas] = await pool.query('SELECT * FROM reservas WHERE ruta_id = ?', [rutaId]);
    return filas.map(ReservaRepository._mapRow);
  }
  /**
 * Igual que listarPorRuta, pero enriquece cada reserva con los datos
 * básicos del pasajero (nombre, teléfono), mediante un JOIN con usuarios.
 * Se usa en la vista de "Solicitudes pendientes" del conductor.
 */
async listarPorRutaConPasajero(rutaId) {
  const [filas] = await pool.query(
    `SELECT r.*, u.nombre AS pasajero_nombre, u.telefono AS pasajero_telefono
     FROM reservas r
     JOIN usuarios u ON u.id = r.pasajero_id
     WHERE r.ruta_id = ?`,
    [rutaId],
  );
  return filas.map((fila) => ({
    ...ReservaRepository._mapRow(fila).toJSON(),
    pasajero: {
      nombre: fila.pasajero_nombre,
      telefono: fila.pasajero_telefono,
    },
  }));
}

  async listarPorPasajero(pasajeroId) {
    const [filas] = await pool.query(
      'SELECT * FROM reservas WHERE pasajero_id = ? ORDER BY creado_en DESC',
      [pasajeroId],
    );
    return filas.map(ReservaRepository._mapRow);
  }

  /**
   * Busca una reserva activa (pendiente o confirmada) del mismo pasajero
   * sobre la misma ruta. Se usa para evitar reservas duplicadas.
   */
  async buscarActivaPorRutaYPasajero(rutaId, pasajeroId) {
    const [filas] = await pool.query(
      `SELECT * FROM reservas
       WHERE ruta_id = ? AND pasajero_id = ? AND estado IN ('pendiente', 'confirmada')
       LIMIT 1`,
      [rutaId, pasajeroId],
    );
    return ReservaRepository._mapRow(filas[0]);
  }

  async actualizarEstado(id, estado) {
    await pool.query('UPDATE reservas SET estado = ? WHERE id = ?', [estado, id]);
    return this.buscarPorId(id);
  }
}

module.exports = new ReservaRepository();
