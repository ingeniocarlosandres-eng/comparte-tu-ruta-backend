const reservaService = require('./reserva.service');
const { asyncHandler } = require('../../middlewares/errorHandler');

/** ReservaController: solicitud y gestión de reservas de puestos. */
class ReservaController {
  solicitar = asyncHandler(async (req, res) => {
    const reserva = await reservaService.solicitarReserva(req.usuario.id, req.body);
    res.status(201).json({ exito: true, mensaje: 'Reserva solicitada correctamente', reserva: reserva.toJSON() });
  });

  confirmar = asyncHandler(async (req, res) => {
    const reserva = await reservaService.confirmarReserva(req.params.id, req.usuario.id);
    res.status(200).json({ exito: true, mensaje: 'Reserva confirmada correctamente', reserva: reserva.toJSON() });
  });

  rechazar = asyncHandler(async (req, res) => {
    const reserva = await reservaService.rechazarReserva(req.params.id, req.usuario.id);
    res.status(200).json({ exito: true, mensaje: 'Reserva rechazada', reserva: reserva.toJSON() });
  });
  cancelar = asyncHandler(async (req, res) => {
    const reserva = await reservaService.cancelarReserva(req.params.id, req.usuario.id);
    res.status(200).json({ exito: true, mensaje: 'Reserva cancelada correctamente', reserva: reserva.toJSON() });
  });
  misReservas = asyncHandler(async (req, res) => {
    const reservas = await reservaService.listarReservasDePasajero(req.usuario.id);
    res.status(200).json({ exito: true, total: reservas.length, reservas: reservas.map((r) => r.toJSON()) });
  });

  reservasDeRuta = asyncHandler(async (req, res) => {
  const reservas = await reservaService.listarReservasDeRuta(req.params.rutaId);
  res.status(200).json({ exito: true, total: reservas.length, reservas });
});
}

module.exports = new ReservaController();
