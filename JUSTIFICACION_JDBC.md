# Justificación técnica: conexión a base de datos con `mysql2` (Node.js) en lugar de JDBC

## Contexto

El instrumento de evaluación de la evidencia **GA7-220501096-AA2-EV01** (Codificación
de módulos del software) incluye como indicador de logro:

> *"Realiza conexiones con bases de datos utilizando JDBC."*

Este documento explica por qué el backend de **Comparte Tu Ruta** no usa JDBC
literalmente, qué se usó en su lugar, y por qué esa elección cumple el mismo
propósito técnico que pide el criterio.

## ¿Qué es JDBC y por qué no aplica aquí?

**JDBC (Java Database Connectivity)** es la API estándar de **Java** para
conectar una aplicación con una base de datos relacional. Es exclusiva del
ecosistema Java/JVM (Java, Kotlin, Scala) — no existe una versión de JDBC
para Node.js, Python, PHP u otros lenguajes, de la misma forma que no existe
una versión de `mysql2` (la librería que sí usamos) para Java.

El backend de este proyecto está construido íntegramente en **Node.js con
Express.js**, una decisión tomada desde el planteamiento inicial del
proyecto (ver `package.json`, `src/server.js`). Como el proyecto no usa Java
en ningún punto de la pila tecnológica, no hay una forma correcta de "usar
JDBC" sin cambiar de lenguaje de programación por completo.

## ¿Qué se usó en su lugar, y por qué es equivalente?

Se usó **`mysql2`** (específicamente `mysql2/promise`), el driver oficial de
conexión a MySQL para Node.js. Cumple exactamente el mismo rol que JDBC
cumpliría en una aplicación Java: es la capa que traduce entre el código de
la aplicación y el protocolo de comunicación de MySQL.

| Responsabilidad que pide el criterio | Cómo la resuelve JDBC (Java) | Cómo la resuelve `mysql2` (Node.js, este proyecto) |
|---|---|---|
| Establecer conexión con el motor de base de datos | `DriverManager.getConnection(...)` | `mysql2.createPool({...})` — ver `src/config/database.js` |
| Reutilizar conexiones eficientemente (pool) | `DataSource` / connection pool (HikariCP, etc.) | Pool de conexiones nativo de `mysql2` (`connectionLimit: 10`) |
| Ejecutar consultas parametrizadas (prevenir inyección SQL) | `PreparedStatement` con `?` como placeholders | Consultas parametrizadas de `mysql2` con `?` como placeholders — ver cualquier método de los `Repository` (ej. `UsuarioRepository.buscarPorEmail`) |
| Mapear resultados de la base de datos a objetos del dominio | `ResultSet` recorrido manualmente o con un ORM | Filas devueltas por `mysql2` mapeadas a instancias de los modelos (`Usuario`, `Ruta`, etc.) en cada `Repository` |
| Manejo de errores de conexión/consulta | `SQLException` | Excepciones nativas de JavaScript, capturadas y traducidas a respuestas HTTP en `errorHandler.js` |

En otras palabras: **la responsabilidad funcional que evalúa este criterio
(conectarse a la base de datos de forma segura y eficiente) está cubierta**;
lo que cambia es el nombre de la herramienta, porque cambia el lenguaje de
programación del proyecto.

## Evidencia en el código

- `src/config/database.js` — configuración del pool de conexiones.
- `src/repositories/*.js` — todas las consultas SQL parametrizadas (nunca se
  concatena texto del usuario directamente en el SQL, previniendo inyección
  SQL, que es la misma preocupación de seguridad que resuelve `PreparedStatement`
  en JDBC).
- `package.json` — dependencia `"mysql2": "^3.11.0"`.

## Recomendación

Se sugiere plantear esta situación directamente con el instructor **antes**
de la evaluación formal, por dos razones:

1. Para que el criterio se evalúe por su **propósito** (conexión segura y
   eficiente a la base de datos) y no por el nombre literal de una tecnología
   que no aplica al stack elegido para el proyecto.
2. Porque esta misma inconsistencia ya se había detectado antes en el
   documento de planeación (`Documento_Proyecto_ADSO`), donde partes del
   contenido original parecían asumir un backend en Java/Spring Boot. Vale la
   pena resolver esa ambigüedad de una vez a nivel de todo el proyecto, no
   solo de este instrumento puntual.
