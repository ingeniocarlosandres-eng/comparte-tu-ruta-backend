/**
 * recomendacion.routes.js
 * -----------------------------------------------------------------------
 * GET /api/recomendaciones?limit=5
 * Devuelve las rutas activas recomendadas para el pasajero autenticado,
 * ordenadas por afinidad con su historial de reservas confirmadas.
 * -----------------------------------------------------------------------
 */

const { Router } = require('express');
const { verificarToken } = require('../../middlewares/authMiddleware');
const recomendacionController = require('./recomendacion.controller');

const router = Router();

router.get('/', verificarToken, recomendacionController.obtener);

module.exports = router;