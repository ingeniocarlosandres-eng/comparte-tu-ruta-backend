# Reglas de negocio — Comparte Tu Ruta

Este documento organiza las reglas de negocio implementadas en el backend y las
relaciona con las Historias de Usuario (HU) del documento de planeación del
proyecto (`Documento_Proyecto_ADSO_v1_0.pdf`). El objetivo es que cualquier
regla que exista en el código tenga un origen claro: o proviene directamente
de una HU, o es una extensión justificada que la complementa.

> **Nota:** el documento de planeación oficial (PDF) tiene inconsistencias ya
> identificadas (mezcla de app móvil/web, stack de backend contradictorio,
> alcance de pagos/calificaciones/geolocalización en tiempo real que aparece
> y desaparece según la sección) que se corregirán después de la primera
> revisión del instructor. Este archivo **no reemplaza ni modifica el PDF**;
> es un documento técnico complementario del backend para dejar trazabilidad
> mientras esa revisión ocurre.

---

## 1. Mapa general: Historia de Usuario → Reglas de negocio en el código

| HU | Nombre | Módulo del backend | Estado |
|---|---|---|---|
| HU-01 (A/B) | Registro de nuevos miembros | `AuthService.registrar` | ✅ Cubierta completa |
| HU-02 | Autenticación segura | `AuthService.iniciarSesion` | ✅ Cubierta completa |
| HU-03 | Creación y oferta de trayectos | `RutaService.publicarRuta` | ✅ Cubierta + 2 reglas adicionales |
| HU-04 | Búsqueda de viajes y reserva de asientos | `RutaService.buscarRutas` + `ReservaService` | ⚠️ Cubierta con una decisión de diseño distinta a la HU (ver sección 4) |
| HU-05, HU-06, HU-07 | Reservar Cupo / Gestionar Alertas / Calificar Servicio | — | ❌ Referenciadas en la tabla de trazabilidad RF↔HU del PDF, pero nunca redactadas en la sección 1.16. Pendiente de revisión con el instructor. |

---

## 2. HU-01 — Registro de nuevos miembros en la comunidad

**Como** un habitante de las afueras de Cali no registrado, **quiero** crear una
cuenta ingresando mis datos personales, **para** formar parte de la red
comunitaria de carpooling.

| Criterio de aceptación de la HU | Dónde se implementa | Estado |
|---|---|---|
| Escenario 1: registro exitoso con Nombre, Email válido, Celular, Rol, Contraseña segura | `Usuario.validar()` (formato de nombre, email, teléfono) + `AuthService.registrar()` (hash de contraseña con bcrypt) | ✅ |
| Escenario 2: correo ya registrado → mensaje de error específico | `AuthService.registrar()`: `"Ya existe un usuario registrado con este correo electrónico"` | ✅ |

**Extensión no explícita en la HU:** la contraseña debe tener mínimo 6
caracteres (`AuthService.registrar()`). La HU solo pide "contraseña segura"
sin definir la regla exacta — se tomó una decisión de implementación
razonable, pendiente de que el documento de planeación la formalice.

---

## 3. HU-02 — Autenticación segura en el sistema

**Como** miembro registrado, **quiero** ingresar con correo y contraseña,
**para** acceder al panel principal.

| Criterio de aceptación de la HU | Dónde se implementa | Estado |
|---|---|---|
| Escenario 1: login exitoso con credenciales válidas | `AuthService.iniciarSesion()` | ✅ |
| Escenario 2: error genérico sin indicar qué campo falló, por seguridad | `AuthService.iniciarSesion()`: siempre responde `"Credenciales inválidas"`, tanto si el correo no existe como si la contraseña es incorrecta | ✅ (coincide exactamente con la intención de seguridad de la HU) |

Sin extensiones adicionales — esta HU quedó cubierta tal cual fue redactada.

---

## 4. HU-03 — Creación y oferta de trayectos comunitarios

**Como** conductor con vehículo propio, **quiero** registrar una ruta con
origen, destino, hora, cupos y aporte sugerido, **para** que los pasajeros la
vean y soliciten viajar conmigo.

| Criterio de aceptación de la HU | Dónde se implementa | Estado |
|---|---|---|
| Escenario 1: publicar ruta con origen/destino, cupos (ej. 4) y hora → visible en tiempo real | `RutaService.publicarRuta()` + `RutaRepository.buscar()` | ✅ |

### Reglas adicionales implementadas, no explícitas en la HU

Estas reglas nacen del **diccionario de datos** (Tabla 14, clase `Ruta`, y
Tabla 12, clase `Conductor`) y de buen juicio sobre el dominio del problema,
pero **no están redactadas como criterios de aceptación** en la HU-03. Se
recomienda incorporarlas formalmente al documento de planeación:

1. **Máximo 4 puestos por ruta.** El diccionario de datos define
   `capacidadVehiculo: int, >0` (sin techo) y `cuposDisponibles: int, ≥0`
   (sin techo tampoco). El código endurece esta regla a un máximo de 4,
   coherente con que los vehículos son particulares. *(`Ruta.PUESTOS_MAXIMOS`,
   `Vehiculo.CAPACIDAD_MAXIMA_PERMITIDA`)*
2. **Precio entre $3.000 y $100.000 COP.** El diccionario de datos define
   `precioPorPasajero: double, ≥0` — sin rango superior ni inferior más allá
   de cero. El código añade el rango completo. *(`Ruta.PRECIO_MINIMO`,
   `Ruta.PRECIO_MAXIMO`)*
3. **No se puede publicar una ruta con fecha/hora de salida ya pasada.**
   No existe ningún criterio de aceptación en la HU-03 sobre esto — es una
   regla de sentido común para evitar datos inconsistentes.
   *(`RutaService.publicarRuta()`)*

---

## 5. HU-04 — Búsqueda de viajes y reserva de asientos

**Como** pasajero que necesita transportarse, **quiero** buscar rutas y
enviar una solicitud de reserva, **para** asegurar transporte colaborativo.

| Criterio de aceptación de la HU | Dónde se implementa | Estado |
|---|---|---|
| Escenario 1: buscar y reservar un cupo → notificación al conductor | `RutaService.buscarRutas()` + `ReservaService.solicitarReserva()` | ⚠️ Ver decisión de diseño abajo |

### Decisión de diseño documentada: momento del descuento de cupo

La HU-04 especifica textualmente:

> *"...el sistema descuenta **provisionalmente** un cupo de la oferta del
> conductor y envía una notificación automática de solicitud al mismo."*

Es decir, la HU espera que el cupo se reste **al momento de reservar**
(de forma provisional, reversible si el conductor rechaza).

**El backend implementa un comportamiento distinto:** el cupo solo se
descuenta cuando el conductor **confirma** la reserva
(`ReservaService.confirmarReserva()` → `Ruta.reservarPuestos()`). Mientras la
reserva está en estado `pendiente`, el cupo sigue apareciendo como
disponible para otros pasajeros.

**Justificación de la decisión (registrada, no oculta):**
- Evita dejar cupos "atrapados" indefinidamente si un conductor nunca
  responde a una solicitud pendiente.
- Simplifica el modelo de datos: no se necesita una lógica de "liberar cupo"
  al rechazar una reserva, porque nunca se restó en primer lugar.
- A cambio, introduce un riesgo distinto: dos pasajeros podrían solicitar el
  mismo cupo mientras ambas solicitudes están pendientes, y el conductor
  tendría que rechazar manualmente a uno de los dos al confirmar al primero.

Esta diferencia queda documentada aquí para que, en la revisión con el
instructor, se decida si el código se ajusta a la HU tal como está escrita,
o si la HU se actualiza para reflejar esta decisión de diseño.

### Regla adicional implementada, no explícita en la HU

**Un mismo pasajero no puede tener dos reservas activas (pendiente o
confirmada) sobre la misma ruta.** La HU-04 no contempla este caso — se
implementó como una regla de sentido común para evitar reservas duplicadas
por error o abuso. *(`ReservaService.solicitarReserva()`,
`ReservaRepository.buscarActivaPorRutaYPasajero()`)*

---

## 6. Reglas de negocio sin Historia de Usuario asociada

Estas reglas existen en el código pero no corresponden a ninguna HU
redactada (ni siquiera a las HU-05/06/07 mencionadas solo en la tabla de
trazabilidad). Se dejan aquí para que, si se redactan esas historias más
adelante, ya exista una base real de qué reglas cubrir:

| Regla | Dónde vive | Posible HU futura |
|---|---|---|
| Un conductor no puede reservar un puesto en su propia ruta | `ReservaService.solicitarReserva()` | Podría anexarse como Escenario 2 de HU-04 |
| El conductor solo puede confirmar/rechazar/editar/cancelar rutas y reservas propias | `RutaService`, `ReservaService` (validación de `conductorId`) | Correspondería a HU-05 (Reservar Cupo) o una nueva HU de gestión |
| Un vehículo no puede tener más puestos disponibles que su capacidad máxima registrada | `RutaService.publicarRuta()` | Extensión natural de HU-03 |

---

## 7. Resumen para la revisión con el instructor

1. Formalizar en el diccionario de datos (Tabla 14) el rango de precio
   ($3.000–$100.000) y el máximo de 4 cupos, hoy solo implícitos en el código.
2. Decidir si se redactan las HU-05, HU-06 y HU-07 (referenciadas en la
   tabla RF↔HU pero ausentes de la sección 1.16), o si se retiran de esa
   tabla mientras no exista alcance para pagos/calificaciones/alertas.
3. Resolver la diferencia entre la HU-04 (descuento provisional al reservar)
   y el comportamiento actual del backend (descuento al confirmar) — decidir
   si se ajusta el código o se actualiza la redacción de la HU.
