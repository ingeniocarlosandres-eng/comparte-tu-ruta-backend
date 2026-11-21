const { pool } = require('../../config/database');
const Ruta = require('./ruta.model');

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
      creadoEn: row.creado_en,
    });
  }

  async crear(ruta) {
    const [resultado] = await pool.query(
      `INSERT INTO rutas
        (conductor_id, vehiculo_id, barrio_origen, barrio_destino, fecha_salida, hora_salida, precio_por_puesto, puestos_disponibles, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ruta.conductorId, ruta.vehiculoId, ruta.barrioOrigen, ruta.barrioDestino,
        ruta.fechaSalida, ruta.horaSalida, ruta.precioPorPuesto, ruta.puestosDisponibles, ruta.estado,
      ],
    );
    return this.buscarPorId(resultado.insertId);
  }

  async buscarPorId(id) {
    const [filas] = await pool.query('SELECT * FROM rutas WHERE id = ?', [id]);
    return RutaRepository._mapRow(filas[0]);
  }
  /**
 * Igual que buscarPorId, pero enriquece la ruta con los datos del
 * vehículo y del conductor (nombre, teléfono, marca, placa).
 * Se usa en la vista "Mis reservas" del pasajero, para que pueda
 * ver con quién y en qué vehículo va a viajar.
 */
async buscarPorIdConDetalle(id) {
  const [filas] = await pool.query(
    `SELECT r.*,
            v.marca AS vehiculo_marca, v.placa AS vehiculo_placa, v.color AS vehiculo_color,
            u.nombre AS conductor_nombre, u.telefono AS conductor_telefono
     FROM rutas r
     JOIN vehiculos v ON v.id = r.vehiculo_id
     JOIN usuarios u ON u.id = r.conductor_id
     WHERE r.id = ?`,
    [id],
  );
  const fila = filas[0];
  if (!fila) return null;
  return {
    ...RutaRepository._mapRow(fila).toJSON(),
    vehiculo: {
      marca: fila.vehiculo_marca,
      placa: fila.vehiculo_placa,
      color: fila.vehiculo_color,
    },
    conductor: {
      nombre: fila.conductor_nombre,
      telefono: fila.conductor_telefono,
    },
  };
}

  async listarPorConductor(conductorId) {
    const [filas] = await pool.query(
      'SELECT * FROM rutas WHERE conductor_id = ? ORDER BY fecha_salida DESC, hora_salida DESC',
      [conductorId],
    );
    return filas.map(RutaRepository._mapRow);
  }

  /**
   * Búsqueda de rutas activas por barrio de origen/destino y, opcionalmente, fecha.
   * Utilizada por el módulo de búsqueda de rutas del frontend.
   */
  async buscar({ barrioOrigen, barrioDestino, fecha } = {}) {
       // Hora de Colombia (UTC-5): el servidor en la nube trabaja en UTC
    const ahoraColombia = new Date(Date.now() - 5 * 60 * 60 * 1000);
    const hoy = ahoraColombia.toISOString().slice(0, 10);
    const horaActual = ahoraColombia.toISOString().slice(11, 19);
    let sql = "SELECT * FROM rutas WHERE estado = 'activa' AND puestos_disponibles > 0"
      + ' AND (fecha_salida > ? OR (fecha_salida = ? AND hora_salida > ?))';
    const params = [hoy, hoy, horaActual];

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
      'precio_por_puesto', 'puestos_disponibles', 'estado',
    ];
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
    await pool.query(`UPDATE rutas SET ${asignaciones.join(', ')} WHERE id = ?`, valores);
    return this.buscarPorId(id);
  }

  async eliminar(id) {
    const [resultado] = await pool.query('DELETE FROM rutas WHERE id = ?', [id]);
    return resultado.affectedRows > 0;
  }
}

module.exports = new RutaRepository();
