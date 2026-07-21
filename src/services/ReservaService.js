const Reserva = require('../models/Reserva');
const reservaRepository = require('../repositories/ReservaRepository');
const rutaRepository = require('../repositories/RutaRepository');

/**
 * ReservaService
 * Gestiona la solicitud y confirmación de puestos en una ruta,
 * garantizando que nunca se reserven más puestos de los disponibles.
 */
class ReservaService {
  async solicitarReserva(pasajeroId, { rutaId, puestosReservados }) {
    const ruta = await rutaRepository.buscarPorId(rutaId);
    if (!ruta) throw new Error('Ruta no encontrada');
    if (!ruta.tieneCupo()) throw new Error('La ruta no tiene puestos disponibles');
    if (ruta.conductorId === pasajeroId) {
      throw new Error('El conductor no puede reservar un puesto en su propia ruta');
    }

    const reserva = new Reserva({
      rutaId,
      pasajeroId,
      puestosReservados,
      estado: 'pendiente'
    });

    return reservaRepository.crear(reserva);
  }

  async confirmarReserva(reservaId, conductorId) {
    const reserva = await reservaRepository.buscarPorId(reservaId);
    if (!reserva) throw new Error('Reserva no encontrada');

    const ruta = await rutaRepository.buscarPorId(reserva.rutaId);
    if (ruta.conductorId !== conductorId) {
      throw new Error('No tiene permisos para confirmar esta reserva');
    }

    // La regla de negocio "no exceder los puestos disponibles" vive en el modelo Ruta
    ruta.reservarPuestos(reserva.puestosReservados);
    await rutaRepository.actualizar(ruta.id, {
      puestos_disponibles: ruta.puestosDisponibles,
      estado: ruta.estado
    });

    return reservaRepository.actualizarEstado(reservaId, 'confirmada');
  }

  async rechazarReserva(reservaId, conductorId) {
    const reserva = await reservaRepository.buscarPorId(reservaId);
    if (!reserva) throw new Error('Reserva no encontrada');

    const ruta = await rutaRepository.buscarPorId(reserva.rutaId);
    if (ruta.conductorId !== conductorId) {
      throw new Error('No tiene permisos para rechazar esta reserva');
    }
    return reservaRepository.actualizarEstado(reservaId, 'rechazada');
  }

  async listarReservasDePasajero(pasajeroId) {
    return reservaRepository.listarPorPasajero(pasajeroId);
  }

  async listarReservasDeRuta(rutaId) {
    return reservaRepository.listarPorRuta(rutaId);
  }
}

module.exports = new ReservaService();
