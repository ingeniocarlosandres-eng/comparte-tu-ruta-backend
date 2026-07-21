const { Router } = require('express');
const reservaController = require('../controllers/ReservaController');
const { verificarToken } = require('../middlewares/authMiddleware');

const router = Router();

router.post('/', verificarToken, reservaController.solicitar);
router.get('/mias', verificarToken, reservaController.misReservas);
router.get('/ruta/:rutaId', verificarToken, reservaController.reservasDeRuta);
router.patch('/:id/confirmar', verificarToken, reservaController.confirmar);
router.patch('/:id/rechazar', verificarToken, reservaController.rechazar);

module.exports = router;
