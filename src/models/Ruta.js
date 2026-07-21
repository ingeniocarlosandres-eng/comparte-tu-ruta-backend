/**
 * Modelo Ruta
 * Representa un trayecto publicado por un conductor.
 *
 * Reglas de negocio del proyecto "Comparte Tu Ruta":
 *  - Máximo 4 puestos disponibles (vehículo particular).
 *  - Precio por puesto entre $3.000 y $100.000 COP.
 */
class Ruta {
  static PUESTOS_MAXIMOS = 4;
  static PRECIO_MINIMO = 3000;
  static PRECIO_MAXIMO = 100000;

  constructor({
    id, conductorId, vehiculoId, barrioOrigen, barrioDestino,
    fechaSalida, horaSalida, precioPorPuesto, puestosDisponibles,
    estado, creadoEn
  }) {
    this.id = id ?? null;
    this.conductorId = conductorId;
    this.vehiculoId = vehiculoId;
    this.barrioOrigen = barrioOrigen;
    this.barrioDestino = barrioDestino;
    this.fechaSalida = fechaSalida;
    this.horaSalida = horaSalida;
    this.precioPorPuesto = Number(precioPorPuesto);
    this.puestosDisponibles = Number(puestosDisponibles);
    this.estado = estado || 'activa';
    this.creadoEn = creadoEn ?? null;

    this.validar();
  }

  validar() {
    if (!this.conductorId || !this.vehiculoId) {
      throw new Error('La ruta requiere un conductor y un vehículo asociados');
    }
    if (!this.barrioOrigen || !this.barrioDestino) {
      throw new Error('El barrio de origen y destino son obligatorios');
    }
    if (this.barrioOrigen.trim().toLowerCase() === this.barrioDestino.trim().toLowerCase()) {
      throw new Error('El barrio de origen y destino no pueden ser iguales');
    }
    if (!this.fechaSalida || !this.horaSalida) {
      throw new Error('La fecha y hora de salida son obligatorias');
    }
    if (this.precioPorPuesto < Ruta.PRECIO_MINIMO || this.precioPorPuesto > Ruta.PRECIO_MAXIMO) {
      throw new Error(
        `El precio por puesto debe estar entre $${Ruta.PRECIO_MINIMO} y $${Ruta.PRECIO_MAXIMO} COP`
      );
    }
    if (this.puestosDisponibles < 0 || this.puestosDisponibles > Ruta.PUESTOS_MAXIMOS) {
      throw new Error(`Los puestos disponibles deben estar entre 0 y ${Ruta.PUESTOS_MAXIMOS}`);
    }
  }

  tieneCupo() {
    return this.estado === 'activa' && this.puestosDisponibles > 0;
  }

  /** Reduce el número de puestos disponibles al confirmar una reserva */
  reservarPuestos(cantidad) {
    if (cantidad <= 0) throw new Error('La cantidad reservada debe ser mayor a cero');
    if (cantidad > this.puestosDisponibles) {
      throw new Error('No hay suficientes puestos disponibles en esta ruta');
    }
    this.puestosDisponibles -= cantidad;
    if (this.puestosDisponibles === 0) this.estado = 'completa';
  }

  toJSON() {
    return {
      id: this.id,
      conductorId: this.conductorId,
      vehiculoId: this.vehiculoId,
      barrioOrigen: this.barrioOrigen,
      barrioDestino: this.barrioDestino,
      fechaSalida: this.fechaSalida,
      horaSalida: this.horaSalida,
      precioPorPuesto: this.precioPorPuesto,
      puestosDisponibles: this.puestosDisponibles,
      estado: this.estado,
      creadoEn: this.creadoEn
    };
  }
}

module.exports = Ruta;
