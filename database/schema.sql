-- ============================================================
-- Comparte Tu Ruta - Esquema de base de datos
-- Motor: MySQL / MariaDB
-- Autor: Andrés - Proyecto formativo SENA
-- ============================================================

CREATE DATABASE IF NOT EXISTS comparte_tu_ruta
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE comparte_tu_ruta;

-- ------------------------------------------------------------
-- Tabla: usuarios
-- Almacena tanto conductores como pasajeros de la plataforma
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  barrio VARCHAR(100) NOT NULL,
  tipo_usuario ENUM('conductor', 'pasajero', 'ambos') NOT NULL DEFAULT 'pasajero',
  estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: vehiculos
-- Un conductor puede registrar su(s) vehículo(s) privados
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehiculos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conductor_id INT NOT NULL,
  placa VARCHAR(10) NOT NULL UNIQUE,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  color VARCHAR(30) NOT NULL,
  capacidad_maxima TINYINT NOT NULL DEFAULT 4,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vehiculo_conductor FOREIGN KEY (conductor_id)
    REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT chk_capacidad_maxima CHECK (capacidad_maxima BETWEEN 1 AND 4)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: rutas
-- Publicación de rutas por parte de los conductores
-- Regla de negocio: máximo 4 puestos por ser vehículo privado
-- Regla de negocio: precio mínimo $3.000 COP, sin tope máximo
--   (aporte voluntario propio de un carpooling comunitario)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rutas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conductor_id INT NOT NULL,
  vehiculo_id INT NOT NULL,
  barrio_origen VARCHAR(100) NOT NULL,
  barrio_destino VARCHAR(100) NOT NULL,
  fecha_salida DATE NOT NULL,
  hora_salida TIME NOT NULL,
  precio_por_puesto DECIMAL(10,2) NOT NULL,
  puestos_disponibles TINYINT NOT NULL,
  estado ENUM('activa', 'completa', 'cancelada', 'finalizada') NOT NULL DEFAULT 'activa',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ruta_conductor FOREIGN KEY (conductor_id)
    REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_ruta_vehiculo FOREIGN KEY (vehiculo_id)
    REFERENCES vehiculos(id) ON DELETE CASCADE,
  CONSTRAINT chk_puestos_disponibles CHECK (puestos_disponibles BETWEEN 0 AND 4),
  CONSTRAINT chk_precio_rango CHECK (precio_por_puesto >= 3000)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabla: reservas
-- Solicitudes de puesto que hacen los pasajeros sobre una ruta
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ruta_id INT NOT NULL,
  pasajero_id INT NOT NULL,
  puestos_reservados TINYINT NOT NULL DEFAULT 1,
  estado ENUM('pendiente', 'confirmada', 'rechazada', 'cancelada') NOT NULL DEFAULT 'pendiente',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reserva_ruta FOREIGN KEY (ruta_id)
    REFERENCES rutas(id) ON DELETE CASCADE,
  CONSTRAINT fk_reserva_pasajero FOREIGN KEY (pasajero_id)
    REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT chk_puestos_reservados CHECK (puestos_reservados BETWEEN 1 AND 4)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Índices adicionales para optimizar búsquedas de rutas
-- ------------------------------------------------------------
CREATE INDEX idx_rutas_origen_destino ON rutas (barrio_origen, barrio_destino);
CREATE INDEX idx_rutas_fecha ON rutas (fecha_salida);
CREATE INDEX idx_reservas_ruta ON reservas (ruta_id);
