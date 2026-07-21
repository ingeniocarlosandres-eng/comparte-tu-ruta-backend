const Ruta = require('../models/Ruta');
const rutaRepository = require('../repositories/RutaRepository');
const vehiculoRepository = require('../repositories/VehiculoRepository');

/**
 * RutaService
 * Módulo funcional principal: publicación, búsqueda, edición y
 * cancelación de rutas de carpooling. Aplica las reglas de negocio
 * del proyecto (máx. 4 puestos, rango de precio) a través del modelo Ruta.
 */
class RutaService {
  async publicarRuta(conductorId, datosRuta) {
    const vehiculo = await vehiculoRepository.buscarPorId(datosRuta.vehiculoId);
    if (!vehiculo || vehiculo.conductorId !== conductorId) {
      throw new Error('El vehículo indicado no pertenece a este conductor');
    }
    if (datosRuta.puestosDisponibles > vehiculo.capacidadMaxima) {
      throw new Error(`El vehículo solo tiene capacidad para ${vehiculo.capacidadMaxima} puestos`);
    }

    const ruta = new Ruta({
      conductorId,
      vehiculoId: datosRuta.vehiculoId,
      barrioOrigen: datosRuta.barrioOrigen,
      barrioDestino: datosRuta.barrioDestino,
      fechaSalida: datosRuta.fechaSalida,
      horaSalida: datosRuta.horaSalida,
      precioPorPuesto: datosRuta.precioPorPuesto,
      puestosDisponibles: datosRuta.puestosDisponibles,
      estado: 'activa'
    });

    return rutaRepository.crear(ruta);
  }

  async buscarRutas(filtros) {
    return rutaRepository.buscar(filtros);
  }

  async obtenerRutaPorId(id) {
    const ruta = await rutaRepository.buscarPorId(id);
    if (!ruta) throw new Error('Ruta no encontrada');
    return ruta;
  }

  async listarRutasDeConductor(conductorId) {
    return rutaRepository.listarPorConductor(conductorId);
  }

  async actualizarRuta(id, conductorId, cambios) {
    const ruta = await this.obtenerRutaPorId(id);
    if (ruta.conductorId !== conductorId) {
      throw new Error('No tiene permisos para editar esta ruta');
    }

    // Se reconstruye el objeto para reutilizar las validaciones del modelo
    const rutaActualizada = new Ruta({
      ...ruta,
      barrioOrigen: cambios.barrioOrigen ?? ruta.barrioOrigen,
      barrioDestino: cambios.barrioDestino ?? ruta.barrioDestino,
      fechaSalida: cambios.fechaSalida ?? ruta.fechaSalida,
      horaSalida: cambios.horaSalida ?? ruta.horaSalida,
      precioPorPuesto: cambios.precioPorPuesto ?? ruta.precioPorPuesto,
      puestosDisponibles: cambios.puestosDisponibles ?? ruta.puestosDisponibles,
      estado: cambios.estado ?? ruta.estado
    });

    return rutaRepository.actualizar(id, {
      barrio_origen: rutaActualizada.barrioOrigen,
      barrio_destino: rutaActualizada.barrioDestino,
      fecha_salida: rutaActualizada.fechaSalida,
      hora_salida: rutaActualizada.horaSalida,
      precio_por_puesto: rutaActualizada.precioPorPuesto,
      puestos_disponibles: rutaActualizada.puestosDisponibles,
      estado: rutaActualizada.estado
    });
  }

  async cancelarRuta(id, conductorId) {
    const ruta = await this.obtenerRutaPorId(id);
    if (ruta.conductorId !== conductorId) {
      throw new Error('No tiene permisos para cancelar esta ruta');
    }
    return rutaRepository.actualizar(id, { estado: 'cancelada' });
  }

  async eliminarRuta(id, conductorId) {
    const ruta = await this.obtenerRutaPorId(id);
    if (ruta.conductorId !== conductorId) {
      throw new Error('No tiene permisos para eliminar esta ruta');
    }
    return rutaRepository.eliminar(id);
  }
}

module.exports = new RutaService();
