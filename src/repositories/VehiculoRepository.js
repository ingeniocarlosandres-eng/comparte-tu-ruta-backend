const { pool } = require('../config/database');
const Vehiculo = require('../models/Vehiculo');

/** Capa de acceso a datos para la tabla `vehiculos`. */
class VehiculoRepository {
  static _mapRow(row) {
    if (!row) return null;
    return new Vehiculo({
      id: row.id,
      conductorId: row.conductor_id,
      placa: row.placa,
      marca: row.marca,
      modelo: row.modelo,
      color: row.color,
      capacidadMaxima: row.capacidad_maxima,
      creadoEn: row.creado_en
    });
  }

  async crear(vehiculo) {
    const [resultado] = await pool.query(
      `INSERT INTO vehiculos (conductor_id, placa, marca, modelo, color, capacidad_maxima)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [vehiculo.conductorId, vehiculo.placa, vehiculo.marca, vehiculo.modelo, vehiculo.color, vehiculo.capacidadMaxima]
    );
    return this.buscarPorId(resultado.insertId);
  }

  async buscarPorId(id) {
    const [filas] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [id]);
    return VehiculoRepository._mapRow(filas[0]);
  }

  async listarPorConductor(conductorId) {
    const [filas] = await pool.query('SELECT * FROM vehiculos WHERE conductor_id = ?', [conductorId]);
    return filas.map(VehiculoRepository._mapRow);
  }

  async eliminar(id) {
    const [resultado] = await pool.query('DELETE FROM vehiculos WHERE id = ?', [id]);
    return resultado.affectedRows > 0;
  }
}

module.exports = new VehiculoRepository();
