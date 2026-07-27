# Reglas de negocio — Comparte Tu Ruta

Este documento organiza las reglas de negocio implementadas en el backend y las
relaciona con las Historias de Usuario (HU) del documento de planeación del
proyecto (`Documento_Proyecto_ADSO_v1_6.docx`, corregido). El objetivo es que
cualquier regla que exista en el código tenga un origen claro y trazable a una
historia de usuario formal.

> **Historial de este documento:** la primera versión (basada en
> `Documento_Proyecto_ADSO_v1_0.pdf`) identificó varias reglas implementadas en
> el código que no tenían respaldo explícito en ninguna HU, y una inconsistencia
> real entre la Tabla 3 (RF) y la Tabla 5 (CU) del documento original. Esas
> observaciones motivaron una corrección formal del documento de planeación
> (versión 1.6), que ya resolvió la mayoría de esos pendientes. Este archivo
> se actualizó para reflejar esa corrección.

---

## 1. Mapa general: Historia de Usuario → Reglas de negocio en el código

| HU | Nombre | Módulo del backend | Estado |
|---|---|---|---|
| HU-01 (A/B) | Registro de nuevos miembros | `AuthService.registrar` | ✅ Cubierta completa |
| HU-02 | Autenticación segura | `AuthService.iniciarSesion` | ✅ Cubierta completa |
| HU-03 | Creación y oferta de trayectos | `RutaService.publicarRuta` | ✅ Cubierta completa |
| HU-04 | Búsqueda de rutas disponibles | `RutaService.buscarRutas` | ✅ Cubierta completa |
| HU-05 | Solicitud y reserva de cupo | `ReservaService.solicitarReserva` | ✅ Cubierta, con una decisión de diseño documentada (ver sección 5) |
| HU-06 | Gestión de solicitudes de reserva por el conductor | `ReservaService.confirmarReserva` / `rechazarReserva` | ✅ Cubierta completa |
| HU-07 | Notificaciones automáticas | — | Fuera de alcance de la versión actual (documento v1.6) |
| HU-08 | Calificación mutua | — | Fuera de alcance del proyecto (documento v1.6, sección 1.7) |

---

## 2. HU-01 — Registro de nuevos miembros en la comunidad

**Como** un habitante de las afueras de Cali no registrado, **quiero** crear una
cuenta ingresando mis datos personales, **para** formar parte de la red
comunitaria de carpooling.

| Criterio de aceptación de la HU | Dónde se implementa | Estado |
|---|---|---|
| Escenario 1: registro exitoso con Nombre, Email válido, Celular, Rol, Contraseña segura | `Usuario.validar()` (formato de nombre, email, teléfono) + `AuthService.registrar()` (hash de contraseña con bcrypt) | ✅ |
| Escenario 2: correo ya registrado → mensaje de error específico | `AuthService.registrar()`: `"Ya existe un usuario registrado con este correo electrónico"` | ✅ |

**Nota de implementación:** la contraseña debe tener mínimo 6 caracteres
(`AuthService.registrar()`). La HU pide "contraseña segura" sin fijar un
número exacto de caracteres; se tomó 6 como un mínimo razonable para el
alcance de este proyecto formativo.

---

## 3. HU-02 — Autenticación segura en el sistema

**Como** miembro registrado, **quiero** ingresar con correo y contraseña,
**para** acceder al panel principal.

| Criterio de aceptación de la HU | Dónde se implementa | Estado |
|---|---|---|
| Escenario 1: login exitoso con credenciales válidas | `AuthService.iniciarSesion()` | ✅ |
| Escenario 2: error genérico sin indicar qué campo falló, por seguridad | `AuthService.iniciarSesion()`: siempre responde `"Credenciales inválidas"`, tanto si el correo no existe como si la contraseña es incorrecta | ✅ |

Sin extensiones adicionales — esta HU quedó cubierta tal cual fue redactada.

---

## 4. HU-03 — Creación y oferta de trayectos comunitarios

**Como** conductor con vehículo propio, **quiero** registrar una ruta con
origen, destino, hora, cupos y aporte sugerido, **para** que los pasajeros la
vean y soliciten viajar conmigo.

| Criterio de aceptación de la HU | Dónde se implementa | Estado |
|---|---|---|
| Escenario 1: publicar ruta con origen/destino, cupos (máx. 4) y aporte sugerido (mín. $3.000 COP, sin tope) → visible en tiempo real | `RutaService.publicarRuta()` + `RutaRepository.buscar()` | ✅ |
| Escenario 2 (nuevo en v1.6): rechazar aporte por debajo de $3.000 COP o fecha/hora ya pasada | `Ruta.validar()` (precio) + `RutaService.publicarRuta()` (fecha) | ✅ |

### Reglas de negocio formalizadas en el documento v1.6

1. **Máximo 4 puestos por ruta.** Formalizado en la Tabla 16 (diccionario de
   datos de `Ruta`, campo `cuposDisponibles`: "Entre 0 y 4"), coherente con
   que los vehículos son particulares.
   *(`Ruta.PUESTOS_MAXIMOS`, `Vehiculo.CAPACIDAD_MAXIMA_PERMITIDA`)*
2. **Precio mínimo $3.000 COP, sin tope máximo.** Formalizado en la Tabla 16
   (campo `precioPorPasajero`: "Mínimo $3.000 COP, sin tope máximo"). Este es
   el ajuste más reciente: la versión anterior del código y del documento
   fijaban un tope superior de $100.000 COP, que no reflejaba la realidad de
   un carpooling comunitario, donde el aporte es voluntario y puede variar
   según distancia, combustible o contexto del trayecto sin un límite fijo.
   *(`Ruta.PRECIO_MINIMO`; ya no existe `Ruta.PRECIO_MAXIMO`)*
3. **No se puede publicar una ruta con fecha/hora de salida ya pasada.**
   Añadido como Escenario 2 de HU-03 en la corrección v1.6.
   *(`RutaService.publicarRuta()`)*

---

## 5. HU-04 — Búsqueda de rutas disponibles

**Como** pasajero que necesita transportarse, **quiero** buscar rutas activas
filtrando por barrio de origen, destino y fecha, **para** encontrar opciones
de transporte antes de decidir cuál reservar.

| Criterio de aceptación de la HU | Dónde se implementa | Estado |
|---|---|---|
| Escenario 1: buscar por barrio y/o fecha → lista de rutas activas con cupo | `RutaService.buscarRutas()` + `RutaRepository.buscar()` | ✅ |

Esta historia se separó de la reserva de cupo (antes mezcladas en una sola
HU-04) en la corrección v1.6, para que cada capacidad del sistema tenga su
propia historia y su propio caso de uso (CU-04 búsqueda, CU-05 reserva).

---

## 6. HU-05 — Solicitud y reserva de cupo

**Como** pasajero que ya encontró una ruta, **quiero** enviar una solicitud de
reserva indicando cuántos puestos necesito, **para** asegurar mi transporte
una vez el conductor la confirme.

| Criterio de aceptación de la HU | Dónde se implementa | Estado |
|---|---|---|
| Escenario 1: solicitar reserva → queda "pendiente", cupo visible hasta confirmación | `ReservaService.solicitarReserva()` | ✅ (ver decisión de diseño abajo) |
| Escenario 2 (nuevo en v1.6): rechazar segunda solicitud del mismo pasajero sobre la misma ruta | `ReservaService.solicitarReserva()` + `ReservaRepository.buscarActivaPorRutaYPasajero()` | ✅ |

### Decisión de diseño documentada: momento del descuento de cupo

La redacción original de esta historia (antes parte de la HU-04) describía
que el cupo se descuenta **"provisionalmente"** al momento de reservar. El
backend implementa un comportamiento distinto: el cupo solo se descuenta
cuando el conductor **confirma** la reserva (`ReservaService.confirmarReserva()`
→ `Ruta.reservarPuestos()`). Mientras la reserva está en estado `pendiente`,
el cupo sigue apareciendo como disponible para otros pasajeros.

**Justificación de la decisión (registrada, no oculta; ya reflejada también en
el documento v1.6 como una nota bajo la Tabla 10):**
- Evita dejar cupos "atrapados" indefinidamente si un conductor nunca
  responde a una solicitud pendiente.
- Simplifica el modelo de datos: no se necesita lógica de "liberar cupo" al
  rechazar una reserva, porque nunca se restó en primer lugar.
- A cambio, dos pasajeros podrían solicitar el mismo cupo mientras ambas
  solicitudes están pendientes; el conductor solo puede confirmar una.

Esta es una decisión de diseño consciente y documentada en ambos lugares
(código y planeación), no una inconsistencia pendiente de resolver.

---

## 7. HU-06 — Gestión de solicitudes de reserva por el conductor

**Como** conductor que publicó una ruta, **quiero** ver las solicitudes
pendientes y decidir si las confirmo o las rechazo, **para** controlar quién
viaja en mi vehículo.

| Criterio de aceptación de la HU | Dónde se implementa | Estado |
|---|---|---|
| Escenario 1: confirmar solicitud → descuenta cupo, marca "confirmada" | `ReservaService.confirmarReserva()` → `Ruta.reservarPuestos()` | ✅ |
| Escenario 2: rechazar solicitud → marca "rechazada", no afecta cupos | `ReservaService.rechazarReserva()` | ✅ |

Esta historia se agregó en la corrección v1.6: existía la funcionalidad en el
backend desde antes, pero no tenía una HU formal asociada (RF-06 apuntaba
incorrectamente a esta función cuando en realidad correspondía a
notificaciones). Ahora tiene su propio RF-08, CU-08 y HU-06.

---

## 8. HU-07 y HU-08 — Fuera de alcance

- **HU-07 (Notificaciones automáticas):** el backend no implementa un sistema
  de notificaciones push. Documentada en v1.6 como trabajo futuro.
- **HU-08 (Calificación mutua):** excluida explícitamente del alcance del
  proyecto desde la sección 1.7 del documento de planeación. La versión
  anterior tenía una referencia contradictoria ("HU-05 Futura") que ya se
  corrigió en v1.6.

Ninguna de las dos tiene código asociado en el backend, ni se espera que lo
tenga en esta versión del proyecto.

---

## 9. Reglas de negocio sin Historia de Usuario asociada

Estas reglas existen en el código como parte natural de la implementación,
sin ser un criterio de aceptación explícito de ninguna HU:

| Regla | Dónde vive | Justificación |
|---|---|---|
| Un conductor no puede reservar un puesto en su propia ruta | `ReservaService.solicitarReserva()` | Regla de sentido común no contemplada en HU-05 |
| El conductor solo puede confirmar/rechazar/editar/cancelar rutas y reservas propias | `RutaService`, `ReservaService` (validación de `conductorId`) | Control de acceso implícito en HU-03 y HU-06 |
| Un vehículo no puede ofrecer más puestos que su capacidad máxima registrada | `RutaService.publicarRuta()` | Extensión natural de HU-03 |

---

## 10. Pendientes que quedan fuera de esta corrección

La corrección v1.6 del documento se limitó, a propósito, a Historias de
Usuario, Casos de Uso y Reglas de Negocio. Quedan identificados (no
resueltos) los siguientes desajustes en otras secciones del documento:

1. El diagrama de clases y el diccionario de datos siguen usando
   `SolicitudRuta` como nombre de la entidad; el backend la implementa como
   `Reserva` en todos sus artefactos (modelo, tabla, servicio, controlador,
   rutas).
2. El diagrama de clases modela `Conductor`/`Pasajero` como herencia de
   `Usuario`; el backend usa composición por rol (`Usuario.tipoUsuario`), no
   herencia.
3. No existe una entidad `Vehiculo` en el modelo de dominio del documento,
   pese a que el backend la implementa como tabla independiente.
4. La arquitectura y el diagrama de despliegue siguen mostrando
   `ControladorPagos`, `ControladorNotificaciones`, Google Maps API y
   Firebase Cloud Messaging como si fueran parte activa del sistema, sin la
   nota de "fuera de alcance" que sí se aplicó a HU-07/HU-08.
5. Los mockups documentados (login, registro) son una fracción del frontend
   real, que ya tiene 5 páginas funcionales.
