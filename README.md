# Comparte Tu Ruta — Backend

API REST para **Comparte Tu Ruta**, una plataforma de carpooling comunitario pensada para conectar conductores y pasajeros de los barrios periféricos de **Cali, Valle del Cauca**, facilitando el uso compartido de vehículos particulares en trayectos cortos entre barrios.

Este repositorio contiene el **backend** del proyecto. El frontend (HTML5, CSS3 y JavaScript vanilla) se desarrolla en un repositorio/carpeta independiente y consume esta API.

## Descripción del proyecto

En barrios como Poblado Campestre, Juanchito, Floralia, Terrón Colorado, Ciudad Córdoba o Charco Azul, la oferta de transporte público formal es limitada. Comparte Tu Ruta busca que los conductores que ya recorren esas rutas ofrezcan sus puestos disponibles a otros vecinos, a un costo justo y accesible.

**Reglas de negocio principales:**
- Cada vehículo es privado, por lo tanto cada ruta admite **máximo 4 puestos disponibles**.
- El precio por puesto debe ser de **mínimo $3.000 COP, sin tope máximo** (aporte voluntario propio de un carpooling comunitario).
- No se puede **publicar una ruta con fecha u hora de salida ya pasada**.
- Un mismo pasajero **no puede tener dos reservas activas** (pendiente o confirmada) sobre la misma ruta.
- Se usan nombres reales de barrios de Cali para la búsqueda de rutas.

## Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| Lenguaje / entorno | Node.js |
| Framework backend | Express.js |
| Base de datos | MySQL (probado también sobre MariaDB) |
| Driver de base de datos | `mysql2/promise` |
| Autenticación | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` para hash de contraseñas |
| Validación de datos | `express-validator` |
| Control de versiones | Git |
| Frontend (consumidor de esta API) | HTML5, CSS3, JavaScript vanilla (Material Design 3, WCAG 2.1 AA) |

> **Nota:** el proyecto usa `mysql2` como driver de conexión a base de datos, no JDBC (que es exclusivo de Java). Ver [`JUSTIFICACION_JDBC.md`](./JUSTIFICACION_JDBC.md) para la explicación completa de por qué son funcionalmente equivalentes.

## Arquitectura del proyecto

El backend está organizado en una **arquitectura en capas**, que separa responsabilidades y facilita el mantenimiento y las pruebas:

```
Cliente (frontend)
      │
      ▼
   Routes         → definición de endpoints y middlewares por ruta
      │
      ▼
 Controllers      → traducen la petición HTTP a una llamada de servicio
      │
      ▼
  Services        → contienen las reglas de negocio del proyecto
      │
      ▼
Repositories       → acceso a datos (consultas SQL con mysql2)
      │
      ▼
   Models         → clases con POO: encapsulación y validación de dominio
      │
      ▼
  MySQL (persistencia)
```

### Estructura de carpetas

```
comparte-tu-ruta-backend/
├── database/
│   └── schema.sql              # Esquema de la base de datos (DDL)
├── src/
│   ├── config/
│   │   └── database.js         # Pool de conexiones MySQL
│   ├── models/                 # Clases POO: Usuario, Vehiculo, Ruta, Reserva
│   ├── repositories/           # Acceso a datos por entidad
│   ├── services/                # Lógica de negocio (AuthService, RutaService, ReservaService, VehiculoService)
│   ├── controllers/            # Controladores HTTP
│   ├── middlewares/            # Autenticación JWT, validación y manejo de errores
│   ├── routes/                 # Definición de endpoints por módulo
│   ├── app.js                  # Configuración de Express
│   └── server.js               # Punto de entrada de la aplicación
├── tests/
│   └── smoke-test.js           # Prueba de humo del flujo completo de la API
├── .env.example
├── .gitignore
└── package.json
```

## Módulos desarrollados

1. **Autenticación (`/api/auth`)**: registro e inicio de sesión de conductores y pasajeros, con contraseñas cifradas (bcrypt) y sesión basada en JWT.
2. **Gestión de vehículos (`/api/vehiculos`)**: registro y consulta de los vehículos del conductor, con capacidad máxima de 4 puestos.
3. **Gestión de rutas (`/api/rutas`)**: CRUD completo de rutas — publicar, listar, actualizar, cancelar y eliminar — aplicando las reglas de negocio de precio y cupos.
4. **Búsqueda de rutas (`/api/rutas/buscar`)**: búsqueda pública por barrio de origen, destino y fecha.
5. **Reservas (`/api/reservas`)**: solicitud de puestos por parte de los pasajeros, y confirmación/rechazo por parte del conductor, con descuento automático de cupos disponibles.

## Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd comparte-tu-ruta-backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con las credenciales de tu base de datos MySQL

# 4. Crear la base de datos y las tablas
mysql -u root -p < database/schema.sql

# 5. Iniciar el servidor
npm start
# o en modo desarrollo con recarga automática:
npm run dev

# 6. Ejecutar las pruebas de humo (con el servidor corriendo)
npm test
```

El servidor queda disponible en `http://localhost:3000`, con un endpoint de verificación en `GET /api/salud`.

## Principales endpoints

| Método | Endpoint | Descripción | Requiere token |
|---|---|---|---|
| POST | `/api/auth/registro` | Registra un usuario (conductor o pasajero) | No |
| POST | `/api/auth/login` | Inicia sesión y devuelve un JWT | No |
| POST | `/api/vehiculos` | Registra un vehículo del conductor | Sí (conductor) |
| POST | `/api/rutas` | Publica una nueva ruta | Sí (conductor) |
| GET | `/api/rutas/buscar` | Busca rutas activas por barrio y fecha | No |
| PUT | `/api/rutas/:id` | Actualiza una ruta propia | Sí (conductor) |
| PATCH | `/api/rutas/:id/cancelar` | Cancela una ruta propia | Sí (conductor) |
| DELETE | `/api/rutas/:id` | Elimina una ruta propia | Sí (conductor) |
| POST | `/api/reservas` | Solicita puestos en una ruta | Sí (pasajero) |
| PATCH | `/api/reservas/:id/confirmar` | Confirma una reserva | Sí (conductor) |
| PATCH | `/api/reservas/:id/rechazar` | Rechaza una reserva | Sí (conductor) |

## Estándar de codificación

El proyecto sigue el **Airbnb JavaScript Style Guide** (variante `airbnb-base`,
para proyectos Node.js sin framework de frontend), aplicado y verificado
automáticamente con **ESLint**.

```bash
npm run lint
```

Ese comando revisa todo el código en `src/` y `tests/` contra las reglas
definidas en `.eslintrc.json`. Algunas reglas del estándar original se
ajustaron deliberadamente al contexto del proyecto (documentado como
comentario en el propio archivo de configuración), por ejemplo:

- `no-underscore-dangle`: se permite el prefijo `_` en métodos privados de
  mapeo de los repositorios (ej. `_mapRow`), convención habitual para
  distinguir métodos internos de la API pública de una clase.
- `class-methods-use-this`: desactivada, porque los modelos (`Usuario`,
  `Ruta`, etc.) tienen métodos de instancia que no siempre necesitan leer
  `this` (ej. validaciones que solo dependen de los parámetros recibidos).

## Control de versiones

El proyecto sigue la convención de commits ya establecida en el equipo:

- `feat:` nueva funcionalidad
- `fix:` corrección de errores
- `style:` cambios de formato o estilo que no afectan la lógica
- `docs:` cambios en documentación
- `test:` adición o corrección de pruebas

## Autor

Andrés — Aprendiz SENA, Desarrollo de Software.
