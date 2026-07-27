/**
 * Modelo Ruta
 * Representa un trayecto publicado por un conductor.
 *
 * Reglas de negocio del proyecto "Comparte Tu Ruta":
 *  - Máximo 4 puestos disponibles (vehículo particular).
 *  - Precio por puesto: mínimo $3.000 COP, sin tope máximo (aporte
 *    voluntario propio de un carpooling comunitario; ver REGLAS_NEGOCIO.md
 *    y Documento_Proyecto_ADSO v1.6, Tabla 16).
 */
const ErrorDeValidacion = require('../utils/ErrorDeValidacion');

class Ruta {
  static PUESTOS_MAXIMOS = 4;
  static PRECIO_MINIMO = 3000;

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
      throw new ErrorDeValidacion('La ruta requiere un conductor y un vehículo asociados');
    }
    if (!this.barrioOrigen || !this.barrioDestino) {
      throw new ErrorDeValidacion('El barrio de origen y destino son obligatorios');
    }
    if (this.barrioOrigen.trim().toLowerCase() === this.barrioDestino.trim().toLowerCase()) {
      throw new ErrorDeValidacion('El barrio de origen y destino no pueden ser iguales');
    }
    if (!this.fechaSalida || !this.horaSalida) {
      throw new ErrorDeValidacion('La fecha y hora de salida son obligatorias');
    }
    if (this.precioPorPuesto < Ruta.PRECIO_MINIMO) {
      throw new ErrorDeValidacion(
        `El precio por puesto debe ser de al menos $${Ruta.PRECIO_MINIMO} COP`
      );
    }
    if (this.puestosDisponibles < 0 || this.puestosDisponibles > Ruta.PUESTOS_MAXIMOS) {
      throw new ErrorDeValidacion(`Los puestos disponibles deben estar entre 0 y ${Ruta.PUESTOS_MAXIMOS}`);
    }
  }

  tieneCupo() {
    return this.estado === 'activa' && this.puestosDisponibles > 0;
  }

  /** Reduce el número de puestos disponibles al confirmar una reserva */
  reservarPuestos(cantidad) {
    if (cantidad <= 0) throw new ErrorDeValidacion('La cantidad reservada debe ser mayor a cero');
    if (cantidad > this.puestosDisponibles) {
      throw new ErrorDeValidacion('No hay suficientes puestos disponibles en esta ruta');
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
