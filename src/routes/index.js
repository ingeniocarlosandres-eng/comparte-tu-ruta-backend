const { Router } = require('express');

const authRoutes = require('../modules/auth');
const rutaRoutes = require('../modules/rutas');
const reservaRoutes = require('../modules/reservas');
const vehiculoRoutes = require('../modules/vehiculos');

const router = Router();

router.use('/auth', authRoutes);
router.use('/rutas', rutaRoutes);
router.use('/reservas', reservaRoutes);
router.use('/vehiculos', vehiculoRoutes);

module.exports = router;
