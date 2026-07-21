const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Pool de conexiones a MySQL.
 * Se usa un pool (en lugar de una conexión única) para soportar
 * múltiples peticiones concurrentes de forma eficiente.
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'ctr_user',
  password: process.env.DB_PASSWORD || 'ctr_password',
  database: process.env.DB_NAME || 'comparte_tu_ruta',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

/**
 * Verifica que la conexión a la base de datos esté disponible.
 * Se usa al iniciar el servidor para fallar rápido si la BD no responde.
 */
async function verificarConexion() {
  const conexion = await pool.getConnection();
  try {
    await conexion.query('SELECT 1');
    return true;
  } finally {
    conexion.release();
  }
}

module.exports = { pool, verificarConexion };
