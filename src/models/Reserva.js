/**
 * Modelo Reserva
 * Representa la solicitud de un pasajero para ocupar uno o más
 * puestos en una ruta publicada.
 */
class Reserva {
  static ESTADOS = ['pendiente', 'confirmada', 'rechazada', 'cancelada'];

  constructor({ id, rutaId, pasajeroId, puestosReservados, estado, creadoEn }) {
    this.id = id ?? null;
    this.rutaId = rutaId;
    this.pasajeroId = pasajeroId;
    this.puestosReservados = Number(puestosReservados ?? 1);
    this.estado = estado || 'pendiente';
    this.creadoEn = creadoEn ?? null;

    this.validar();
  }

  validar() {
    if (!this.rutaId || !this.pasajeroId) {
      throw new Error('La reserva requiere una ruta y un pasajero');
    }
    if (this.puestosReservados < 1 || this.puestosReservados > 4) {
      throw new Error('Los puestos reservados deben estar entre 1 y 4');
    }
    if (!Reserva.ESTADOS.includes(this.estado)) {
      throw new Error(`Estado inválido. Debe ser uno de: ${Reserva.ESTADOS.join(', ')}`);
    }
  }

  confirmar() {
    this.estado = 'confirmada';
  }

  cancelar() {
    this.estado = 'cancelada';
  }

  toJSON() {
    return {
      id: this.id,
      rutaId: this.rutaId,
      pasajeroId: this.pasajeroId,
      puestosReservados: this.puestosReservados,
      estado: this.estado,
      creadoEn: this.creadoEn
    };
  }
}

module.exports = Reserva;
