const Vehiculo = require('../models/Vehiculo');
const vehiculoRepository = require('../repositories/VehiculoRepository');

/** Registro y consulta de vehículos de los conductores. */
class VehiculoService {
  async registrarVehiculo(conductorId, datos) {
    const vehiculo = new Vehiculo({ conductorId, ...datos });
    return vehiculoRepository.crear(vehiculo);
  }

  async listarVehiculosDeConductor(conductorId) {
    return vehiculoRepository.listarPorConductor(conductorId);
  }
}

module.exports = new VehiculoService();
