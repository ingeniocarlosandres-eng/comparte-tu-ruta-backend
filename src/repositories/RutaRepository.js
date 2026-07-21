const { pool } = require('../config/database');
const Ruta = require('../models/Ruta');

/**
 * RutaRepository
 * Capa de acceso a datos para la tabla `rutas`. Incluye la lógica de
 * búsqueda por barrio de origen/destino y fecha, usada por el módulo
 * de búsqueda de rutas del frontend.
 */
class RutaRepository {
  static _mapRow(row) {
    if (!row) return null;
    return new Ruta({
      id: row.id,
      conductorId: row.conductor_id,
      vehiculoId: row.vehiculo_id,
      barrioOrigen: row.barrio_origen,
      barrioDestino: row.barrio_destino,
      fechaSalida: row.fecha_salida,
      horaSalida: row.hora_salida,
      precioPorPuesto: row.precio_por_puesto,
      puestosDisponibles: row.puestos_disponibles,
      estado: row.estado,
      creadoEn: row.creado_en
    });
  }

  async crear(ruta) {
    const [resultado] = await pool.query(
      `INSERT INTO rutas
        (conductor_id, vehiculo_id, barrio_origen, barrio_destino, fecha_salida, hora_salida, precio_por_puesto, puestos_disponibles, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ruta.conductorId, ruta.vehiculoId, ruta.barrioOrigen, ruta.barrioDestino,
        ruta.fechaSalida, ruta.horaSalida, ruta.precioPorPuesto, ruta.puestosDisponibles, ruta.estado
      ]
    );
    return this.buscarPorId(resultado.insertId);
  }

  async buscarPorId(id) {
    const [filas] = await pool.query('SELECT * FROM rutas WHERE id = ?', [id]);
    return RutaRepository._mapRow(filas[0]);
  }

  async listarPorConductor(conductorId) {
    const [filas] = await pool.query(
      'SELECT * FROM rutas WHERE conductor_id = ? ORDER BY fecha_salida DESC, hora_salida DESC',
      [conductorId]
    );
    return filas.map(RutaRepository._mapRow);
  }

  /**
   * Búsqueda de rutas activas por barrio de origen/destino y, opcionalmente, fecha.
   * Utilizada por el módulo de búsqueda de rutas del frontend.
   */
  async buscar({ barrioOrigen, barrioDestino, fecha } = {}) {
    let sql = "SELECT * FROM rutas WHERE estado = 'activa' AND puestos_disponibles > 0";
    const params = [];

    if (barrioOrigen) {
      sql += ' AND barrio_origen LIKE ?';
      params.push(`%${barrioOrigen}%`);
    }
    if (barrioDestino) {
      sql += ' AND barrio_destino LIKE ?';
      params.push(`%${barrioDestino}%`);
    }
    if (fecha) {
      sql += ' AND fecha_salida = ?';
      params.push(fecha);
    }
    sql += ' ORDER BY fecha_salida ASC, hora_salida ASC';

    const [filas] = await pool.query(sql, params);
    return filas.map(RutaRepository._mapRow);
  }

  async actualizar(id, cambios) {
    const camposPermitidos = [
      'barrio_origen', 'barrio_destino', 'fecha_salida', 'hora_salida',
      'precio_por_puesto', 'puestos_disponibles', 'estado'
    ];
    const asignaciones = [];
    const valores = [];

    for (const [clave, valor] of Object.entries(cambios)) {
      if (camposPermitidos.includes(clave)) {
        asignaciones.push(`${clave} = ?`);
        valores.push(valor);
      }
    }
    if (asignaciones.length === 0) return this.buscarPorId(id);

    valores.push(id);
    await pool.query(`UPDATE rutas SET ${asignaciones.join(', ')} WHERE id = ?`, valores);
    return this.buscarPorId(id);
  }

  async eliminar(id) {
    const [resultado] = await pool.query('DELETE FROM rutas WHERE id = ?', [id]);
    return resultado.affectedRows > 0;
  }
}

module.exports = new RutaRepository();
