/**
 * Modelo Vehiculo
 * Representa el vehículo privado registrado por un conductor.
 * Regla de negocio: la capacidad máxima es de 4 puestos.
 */
class Vehiculo {
  static CAPACIDAD_MAXIMA_PERMITIDA = 4;

  constructor({
    id, conductorId, placa, marca, modelo, color, capacidadMaxima, creadoEn,
  }) {
    this.id = id ?? null;
    this.conductorId = conductorId;
    this.placa = (placa || '').toUpperCase().trim();
    this.marca = marca;
    this.modelo = modelo;
    this.color = color;
    this.capacidadMaxima = capacidadMaxima ?? Vehiculo.CAPACIDAD_MAXIMA_PERMITIDA;
    this.creadoEn = creadoEn ?? null;

    this.validar();
  }

  validar() {
    if (!this.conductorId) {
      throw new Error('El vehículo debe estar asociado a un conductor');
    }
    if (!/^[A-Z0-9]{5,7}$/.test(this.placa)) {
      throw new Error('La placa no tiene un formato válido');
    }
    if (!this.marca || !this.modelo) {
      throw new Error('La marca y el modelo son obligatorios');
    }
    if (this.capacidadMaxima < 1 || this.capacidadMaxima > Vehiculo.CAPACIDAD_MAXIMA_PERMITIDA) {
      throw new Error(`La capacidad debe estar entre 1 y ${Vehiculo.CAPACIDAD_MAXIMA_PERMITIDA} puestos`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      conductorId: this.conductorId,
      placa: this.placa,
      marca: this.marca,
      modelo: this.modelo,
      color: this.color,
      capacidadMaxima: this.capacidadMaxima,
      creadoEn: this.creadoEn,
    };
  }
}

module.exports = Vehiculo;
