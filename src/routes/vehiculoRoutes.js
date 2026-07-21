const { Router } = require('express');
const vehiculoController = require('../controllers/VehiculoController');
const { verificarToken, soloConductores } = require('../middlewares/authMiddleware');

const router = Router();

router.post('/', verificarToken, soloConductores, vehiculoController.registrar);
router.get('/', verificarToken, soloConductores, vehiculoController.misVehiculos);

module.exports = router;
