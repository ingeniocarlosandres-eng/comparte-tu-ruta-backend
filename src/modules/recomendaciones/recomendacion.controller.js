/**
 * recomendacion.controller.js
 * -----------------------------------------------------------------------
 * Maneja la petición HTTP: valida los parámetros de entrada y traduce
 * el resultado del servicio a una respuesta JSON.
 * -----------------------------------------------------------------------
 */

const { recomendarParaPasajero } = require('./recomendacion.service');

async function obtener(req, res) {
  try {
    // req.usuario.id viene del middleware verificarToken, igual que en reserva.controller.js
    const pasajeroId = req.usuario.id;

    let topN = 5;
    if (req.query.limit !== undefined) {
      const parsed = Number(req.query.limit);
      if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 20) {
        return res.status(400).json({ error: "El parámetro 'limit' debe ser un entero entre 1 y 20." });
      }
      topN = parsed;
    }

    const resultado = await recomendarParaPasajero(pasajeroId, topN);
    return res.status(200).json(resultado);
  } catch (error) {
    console.error('Error en recomendacion.controller.obtener:', error);
    return res.status(500).json({ error: 'No fue posible generar recomendaciones.' });
  }
}

module.exports = { obtener };