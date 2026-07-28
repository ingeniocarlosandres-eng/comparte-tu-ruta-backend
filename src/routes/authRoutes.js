const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/AuthController');
const { validarCampos } = require('../middlewares/validators');

const router = Router();

router.post(
  '/registro',
  [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Debe ser un correo válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('telefono').notEmpty().withMessage('El teléfono es obligatorio'),
    body('barrio').notEmpty().withMessage('El barrio es obligatorio'),
  ],
  validarCampos,
  authController.registrar,
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Debe ser un correo válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  ],
  validarCampos,
  authController.iniciarSesion,
);

module.exports = router;
