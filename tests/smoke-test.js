/**
 * Prueba de humo (smoke test) del API de Comparte Tu Ruta.
 * Ejecuta un flujo completo: registro -> vehículo -> ruta -> búsqueda ->
 * reserva -> confirmación, y valida las reglas de negocio del proyecto.
 *
 * Uso: npm test  (requiere que el servidor esté corriendo con `npm start`)
 */
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000/api';

async function solicitar(ruta, opciones = {}) {
  const respuesta = await fetch(`${BASE_URL}${ruta}`, {
    ...opciones,
    headers: { 'Content-Type': 'application/json', ...(opciones.headers || {}) }
  });
  return { status: respuesta.status, cuerpo: await respuesta.json() };
}

function afirmar(condicion, mensaje) {
  if (!condicion) throw new Error(`FALLO: ${mensaje}`);
  console.log(`OK: ${mensaje}`);
}

async function ejecutarPruebas() {
  const sufijo = Date.now();

  const conductor = await solicitar('/auth/registro', {
    method: 'POST',
    body: JSON.stringify({
      nombre: 'Conductor de Prueba', email: `conductor${sufijo}@correo.com`,
      password: 'clave123', telefono: '3001112233', barrio: 'Terrón Colorado', tipoUsuario: 'conductor'
    })
  });
  afirmar(conductor.status === 201, 'Registro de conductor responde 201');
  const tokenConductor = conductor.cuerpo.token;

  const vehiculo = await solicitar('/vehiculos', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenConductor}` },
    body: JSON.stringify({ placa: `TST${String(sufijo % 1000).padStart(3, '0')}`, marca: 'Renault', modelo: 'Logan', color: 'Blanco', capacidadMaxima: 4 })
  });
  afirmar(vehiculo.status === 201, 'Registro de vehículo responde 201');

  const rutaInvalida = await solicitar('/rutas', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenConductor}` },
    body: JSON.stringify({
      vehiculoId: vehiculo.cuerpo.vehiculo.id, barrioOrigen: 'Floralia', barrioDestino: 'Ciudad Córdoba',
      fechaSalida: '2026-08-01', horaSalida: '07:00:00', precioPorPuesto: 2000, puestosDisponibles: 2
    })
  });
  afirmar(rutaInvalida.status === 400, 'Rechaza precio por debajo del mínimo de $3.000 COP');

  const rutaPrecioAlto = await solicitar('/rutas', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenConductor}` },
    body: JSON.stringify({
      vehiculoId: vehiculo.cuerpo.vehiculo.id, barrioOrigen: 'Floralia', barrioDestino: 'Ciudad Córdoba',
      fechaSalida: '2026-08-01', horaSalida: '07:00:00', precioPorPuesto: 500000, puestosDisponibles: 2
    })
  });
  afirmar(rutaPrecioAlto.status === 201, 'Acepta un aporte alto sin tope máximo (regla de negocio corregida)');

  const rutaFechaPasada = await solicitar('/rutas', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenConductor}` },
    body: JSON.stringify({
      vehiculoId: vehiculo.cuerpo.vehiculo.id, barrioOrigen: 'Floralia', barrioDestino: 'Ciudad Córdoba',
      fechaSalida: '2020-01-01', horaSalida: '07:00:00', precioPorPuesto: 4000, puestosDisponibles: 2
    })
  });
  afirmar(rutaFechaPasada.status === 400, 'Rechaza la publicación de una ruta con fecha ya pasada');

  const ruta = await solicitar('/rutas', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenConductor}` },
    body: JSON.stringify({
      vehiculoId: vehiculo.cuerpo.vehiculo.id, barrioOrigen: 'Floralia', barrioDestino: 'Ciudad Córdoba',
      fechaSalida: '2026-08-01', horaSalida: '07:00:00', precioPorPuesto: 4000, puestosDisponibles: 2
    })
  });
  afirmar(ruta.status === 201, 'Publicación de ruta responde 201');

  const busqueda = await solicitar('/rutas/buscar?origen=Floralia&destino=Ciudad');
  afirmar(busqueda.cuerpo.total >= 1, 'La búsqueda de rutas encuentra la ruta publicada');

  const pasajero = await solicitar('/auth/registro', {
    method: 'POST',
    body: JSON.stringify({
      nombre: 'Pasajero de Prueba', email: `pasajero${sufijo}@correo.com`,
      password: 'clave123', telefono: '3004445566', barrio: 'Ciudad Córdoba', tipoUsuario: 'pasajero'
    })
  });
  const tokenPasajero = pasajero.cuerpo.token;

  const reserva = await solicitar('/reservas', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenPasajero}` },
    body: JSON.stringify({ rutaId: ruta.cuerpo.ruta.id, puestosReservados: 2 })
  });
  afirmar(reserva.status === 201, 'Solicitud de reserva responde 201');

  const reservaDuplicada = await solicitar('/reservas', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenPasajero}` },
    body: JSON.stringify({ rutaId: ruta.cuerpo.ruta.id, puestosReservados: 1 })
  });
  afirmar(reservaDuplicada.status === 400, 'Rechaza una segunda reserva del mismo pasajero sobre la misma ruta');

  const confirmacion = await solicitar(`/reservas/${reserva.cuerpo.reserva.id}/confirmar`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenConductor}` }
  });
  afirmar(confirmacion.cuerpo.reserva.estado === 'confirmada', 'El conductor confirma la reserva');

  const rutaActualizada = await solicitar(`/rutas/${ruta.cuerpo.ruta.id}`);
  afirmar(rutaActualizada.cuerpo.ruta.puestosDisponibles === 0, 'Los puestos disponibles se descuentan tras confirmar');

  console.log('\nTodas las pruebas de humo pasaron correctamente.');
}

ejecutarPruebas().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
