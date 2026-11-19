const express = require('express');
const cors = require('cors');
const rutasApi = require('./routes');
const { manejadorDeErrores } = require('./middlewares/errorHandler');

/**
 * Configuración de la aplicación Express.
 * Arquitectura en capas: routes -> controllers -> services -> repositories -> models.
 */
const app = express();

const origenesPermitidos = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : true;
app.use(cors({ origin: origenesPermitidos }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint de salud, útil para verificar que el servicio está en línea
app.get('/api/salud', (req, res) => {
  res.status(200).json({ exito: true, mensaje: 'API de Comparte Tu Ruta funcionando correctamente' });
});

app.use('/api', rutasApi);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ exito: false, mensaje: 'Recurso no encontrado' });
});

// Manejador de errores centralizado (debe ir al final)
app.use(manejadorDeErrores);

module.exports = app;
