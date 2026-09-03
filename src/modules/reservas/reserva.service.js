const Reserva = require('./reserva.model');
const ErrorDeValidacion = require('../../shared/ErrorDeValidacion');
const ErrorNoEncontrado = require('../../shared/ErrorNoEncontrado');
const ErrorNoAutorizado = require('../../shared/ErrorNoAutorizado');
const reservaRepository = require('./reserva.repository');
const rutaRepository = require('../rutas/ruta.repository');

/**
 * ReservaService
 * Gestiona la solicitud y confirmación de puestos en una ruta,
 * garantizando que nunca se reserven más puestos de los disponibles.
 *
 * Nota sobre HU-04 (ver REGLAS_NEGOCIO.md, sección 5): la historia de
 * usuario describe un descuento "provisional" del cupo al momento de
 * reservar. Esta implementación, por decisión de diseño documentada,
 * descuenta el cupo únicamente al CONFIRMAR la reserva (ver
 * confirmarReserva más abajo), no al solicitarla.
 */
class ReservaService {
  async solicitarReserva(pasajeroId, { rutaId, puestosReservados }) {
    const ruta = await rutaRepository.buscarPorId(rutaId);
    if (!ruta) throw new ErrorNoEncontrado('Ruta no encontrada');
    if (!ruta.tieneCupo()) throw new ErrorDeValidacion('La ruta no tiene puestos disponibles');
    if (ruta.conductorId === pasajeroId) {
      throw new ErrorDeValidacion('El conductor no puede reservar un puesto en su propia ruta');
    }

    // Regla de negocio: un mismo pasajero no puede tener dos reservas activas
    // (pendiente o confirmada) sobre la misma ruta.
    const reservaExistente = await reservaRepository.buscarActivaPorRutaYPasajero(rutaId, pasajeroId);
    if (reservaExistente) {
      throw new ErrorDeValidacion('Ya existe una reserva activa de este pasajero para esta ruta');
    }

    const reserva = new Reserva({
      rutaId,
      pasajeroId,
      puestosReservados,
      estado: 'pendiente',
    });

    return reservaRepository.crear(reserva);
  }

  async confirmarReserva(reservaId, conductorId) {
    const reserva = await reservaRepository.buscarPorId(reservaId);
    if (!reserva) throw new ErrorNoEncontrado('Reserva no encontrada');

    const ruta = await rutaRepository.buscarPorId(reserva.rutaId);
    if (ruta.conductorId !== conductorId) {
      throw new ErrorNoAutorizado('No tiene permisos para confirmar esta reserva');
    }

    // La regla de negocio "no exceder los puestos disponibles" vive en el modelo Ruta
    ruta.reservarPuestos(reserva.puestosReservados);
    await rutaRepository.actualizar(ruta.id, {
      puestos_disponibles: ruta.puestosDisponibles,
      estado: ruta.estado,
    });

    return reservaRepository.actualizarEstado(reservaId, 'confirmada');
  }

  async rechazarReserva(reservaId, conductorId) {
    const reserva = await reservaRepository.buscarPorId(reservaId);
    if (!reserva) throw new ErrorNoEncontrado('Reserva no encontrada');

    const ruta = await rutaRepository.buscarPorId(reserva.rutaId);
    if (ruta.conductorId !== conductorId) {
      throw new ErrorNoAutorizado('No tiene permisos para rechazar esta reserva');
    }
    return reservaRepository.actualizarEstado(reservaId, 'rechazada');
  }
  /**
   * Permite al propio pasajero cancelar su reserva, mientras esté
   * pendiente o confirmada y la ruta no haya salido todavía.
   * Si estaba confirmada, se devuelve el cupo a la ruta.
   */
  async cancelarReserva(reservaId, pasajeroId) {
    const reserva = await reservaRepository.buscarPorId(reservaId);
    if (!reserva) throw new ErrorNoEncontrado('Reserva no encontrada');
    if (reserva.pasajeroId !== pasajeroId) {
      throw new ErrorNoAutorizado('No tiene permisos para cancelar esta reserva');
    }
    if (!['pendiente', 'confirmada'].includes(reserva.estado)) {
      throw new ErrorDeValidacion('Esta reserva ya no se puede cancelar');
    }

    const ruta = await rutaRepository.buscarPorId(reserva.rutaId);
    const fechaHoraSalida = new Date(`${ruta.fechaSalida}T${ruta.horaSalida}`);
    if (fechaHoraSalida.getTime() <= Date.now()) {
      throw new ErrorDeValidacion('No se puede cancelar una reserva cuya ruta ya salió');
    }

    if (reserva.estado === 'confirmada') {
      ruta.liberarPuestos(reserva.puestosReservados);
      await rutaRepository.actualizar(ruta.id, {
        puestos_disponibles: ruta.puestosDisponibles,
        estado: ruta.estado,
      });
    }

    return reservaRepository.actualizarEstado(reservaId, 'cancelada');
  }
  async listarReservasDePasajero(pasajeroId) {
    return reservaRepository.listarPorPasajero(pasajeroId);
  }

 async listarReservasDeRuta(rutaId) {
  return reservaRepository.listarPorRutaConPasajero(rutaId);
}
}

module.exports = new ReservaService();
