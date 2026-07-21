require('dotenv').config();
const app = require('./app');
const { verificarConexion } = require('./config/database');

const PORT = process.env.PORT || 3000;

/**
 * Punto de entrada de la aplicación.
 * Verifica la conexión a la base de datos antes de aceptar peticiones,
 * para fallar rápido si la configuración de MySQL es incorrecta.
 */
async function iniciarServidor() {
  try {
    await verificarConexion();
    console.log('Conexión a la base de datos MySQL establecida correctamente.');

    app.listen(PORT, () => {
      console.log(`Servidor de Comparte Tu Ruta escuchando en el puerto ${PORT}`);
      console.log(`Endpoint de salud: http://localhost:${PORT}/api/salud`);
    });
  } catch (error) {
    console.error('No fue posible conectar a la base de datos:', error.message);
    process.exit(1);
  }
}

iniciarServidor();
