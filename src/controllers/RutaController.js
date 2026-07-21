const rutaService = require('../services/RutaService');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * RutaController
 * Expone el CRUD de rutas y la búsqueda, usados por los módulos
 * "Gestión de rutas" (CRUD) y "Búsqueda de rutas" del frontend.
 */
class RutaController {
  publicar = asyncHandler(async (req, res) => {
    const ruta = await rutaService.publicarRuta(req.usuario.id, req.body);
    res.status(201).json({ exito: true, mensaje: 'Ruta publicada correctamente', ruta: ruta.toJSON() });
  });

  buscar = asyncHandler(async (req, res) => {
    const { origen, destino, fecha } = req.query;
    const rutas = await rutaService.buscarRutas({
      barrioOrigen: origen, barrioDestino: destino, fecha
    });
    res.status(200).json({ exito: true, total: rutas.length, rutas: rutas.map((r) => r.toJSON()) });
  });

  obtenerPorId = asyncHandler(async (req, res) => {
    const ruta = await rutaService.obtenerRutaPorId(req.params.id);
    res.status(200).json({ exito: true, ruta: ruta.toJSON() });
  });

  misRutas = asyncHandler(async (req, res) => {
    const rutas = await rutaService.listarRutasDeConductor(req.usuario.id);
    res.status(200).json({ exito: true, total: rutas.length, rutas: rutas.map((r) => r.toJSON()) });
  });

  actualizar = asyncHandler(async (req, res) => {
    const ruta = await rutaService.actualizarRuta(req.params.id, req.usuario.id, req.body);
    res.status(200).json({ exito: true, mensaje: 'Ruta actualizada correctamente', ruta: ruta.toJSON() });
  });

  cancelar = asyncHandler(async (req, res) => {
    const ruta = await rutaService.cancelarRuta(req.params.id, req.usuario.id);
    res.status(200).json({ exito: true, mensaje: 'Ruta cancelada correctamente', ruta: ruta.toJSON() });
  });

  eliminar = asyncHandler(async (req, res) => {
    await rutaService.eliminarRuta(req.params.id, req.usuario.id);
    res.status(200).json({ exito: true, mensaje: 'Ruta eliminada correctamente' });
  });
}

module.exports = new RutaController();
