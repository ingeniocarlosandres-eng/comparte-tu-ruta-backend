/**
 * recomendacion.service.js
 * -----------------------------------------------------------------------
 * Arma el historial real del pasajero (a partir de sus reservas
 * confirmadas) y las rutas activas, y delega el cálculo al módulo
 * de scoring puro.
 * -----------------------------------------------------------------------
 */

const rutaRepository = require('../rutas/ruta.repository');
const reservaRepository = require('../reservas/reserva.repository');
const { obtenerRecomendaciones } = require('./recomendacion.scoring');

/**
 * Construye el historial de "preferencias" del pasajero: por cada
 * reserva confirmada, trae la ruta asociada y extrae barrio/hora/precio.
 */
async function construirHistorial(pasajeroId) {
  const reservas = await reservaRepository.listarPorPasajero(pasajeroId);
  const confirmadas = reservas.filter((r) => r.estado === 'confirmada');

  const rutasDelHistorial = await Promise.all(
    confirmadas.map((r) => rutaRepository.buscarPorId(r.rutaId))
  );

  return rutasDelHistorial
    .filter((ruta) => ruta !== null) // por si alguna ruta fue eliminada
    .map((ruta) => ({
      barrioOrigen: ruta.barrioOrigen,
      barrioDestino: ruta.barrioDestino,
      horaSalida: ruta.horaSalida,
      precioPorPuesto: ruta.precioPorPuesto,
    }));
}

/**
 * Devuelve las rutas activas recomendadas para un pasajero, ordenadas
 * por afinidad.
 */
async function recomendarParaPasajero(pasajeroId, topN = 5) {
  const [historial, rutasActivas] = await Promise.all([
    construirHistorial(pasajeroId),
    rutaRepository.buscar(), // sin filtros = todas las rutas activas con cupo
  ]);

  const recomendaciones = obtenerRecomendaciones(rutasActivas, historial, topN);

  return {
    recomendaciones,
    meta: {
      historialUsado: historial.length,
      arranqueEnFrio: historial.length === 0,
      totalRutasActivas: rutasActivas.length,
    },
  };
}

module.exports = { recomendarParaPasajero, construirHistorial };