const { Router } = require('express');
const rutaController = require('../controllers/RutaController');
const { verificarToken, soloConductores } = require('../middlewares/authMiddleware');

const router = Router();

// Búsqueda pública de rutas (módulo "Buscar rutas" del frontend)
router.get('/buscar', rutaController.buscar);
router.get('/:id', rutaController.obtenerPorId);

// Gestión de rutas del conductor (módulo CRUD "Gestión de rutas")
router.post('/', verificarToken, soloConductores, rutaController.publicar);
router.get('/', verificarToken, soloConductores, rutaController.misRutas);
router.put('/:id', verificarToken, soloConductores, rutaController.actualizar);
router.patch('/:id/cancelar', verificarToken, soloConductores, rutaController.cancelar);
router.delete('/:id', verificarToken, soloConductores, rutaController.eliminar);

module.exports = router;
