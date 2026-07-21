const { Router } = require('express');

const authRoutes = require('./authRoutes');
const rutaRoutes = require('./rutaRoutes');
const reservaRoutes = require('./reservaRoutes');
const vehiculoRoutes = require('./vehiculoRoutes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/rutas', rutaRoutes);
router.use('/reservas', reservaRoutes);
router.use('/vehiculos', vehiculoRoutes);

module.exports = router;
