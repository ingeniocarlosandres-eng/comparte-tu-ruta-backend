const vehiculoService = require('./vehiculo.service');
const { asyncHandler } = require('../../middlewares/errorHandler');

/** VehiculoController: registro de vehículos de los conductores. */
class VehiculoController {
  registrar = asyncHandler(async (req, res) => {
    const vehiculo = await vehiculoService.registrarVehiculo(req.usuario.id, req.body);
    res.status(201).json({ exito: true, mensaje: 'Vehículo registrado correctamente', vehiculo: vehiculo.toJSON() });
  });

  misVehiculos = asyncHandler(async (req, res) => {
    const vehiculos = await vehiculoService.listarVehiculosDeConductor(req.usuario.id);
    res.status(200).json({ exito: true, total: vehiculos.length, vehiculos: vehiculos.map((v) => v.toJSON()) });
  });
}

module.exports = new VehiculoController();
