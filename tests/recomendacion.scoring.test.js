/**
 * Pruebas del módulo de puntaje de RouteMatch (recomendacion.scoring.js).
 * A diferencia de smoke-test.js, estas pruebas no requieren que el
 * servidor ni la base de datos estén corriendo: validan la lógica pura
 * del algoritmo de afinidad con datos en memoria.
 *
 * Uso: npm run test:scoring
 */
const { calcularPuntajeAfinidad, obtenerRecomendaciones } = require('../src/modules/recomendaciones/recomendacion.scoring');

function afirmar(condicion, mensaje) {
  if (!condicion) throw new Error(`FALLO: ${mensaje}`);
  console.log(`OK: ${mensaje}`);
}

function ejecutarPruebas() {
  const historial = [
    { barrioOrigen: 'Floralia', barrioDestino: 'Poblado Campestre', horaSalida: '07:00', precioPorPuesto: 4000 },
    { barrioOrigen: 'Floralia', barrioDestino: 'Poblado Campestre', horaSalida: '07:15', precioPorPuesto: 4300 },
  ];

  const rutaAfin = {
    id: 1, barrioOrigen: 'Floralia', barrioDestino: 'Poblado Campestre',
    horaSalida: '07:05', precioPorPuesto: 4200, puestosDisponibles: 2,
  };
  const puntajeAfin = calcularPuntajeAfinidad(rutaAfin, historial);
  afirmar(puntajeAfin > 85, `Ruta con barrio, hora y precio afines obtiene puntaje alto (obtuvo ${puntajeAfin})`);

  const rutaLejana = {
    id: 2, barrioOrigen: 'Charco Azul', barrioDestino: 'Ciudad Córdoba',
    horaSalida: '20:00', precioPorPuesto: 9000, puestosDisponibles: 1,
  };
  const puntajeLejano = calcularPuntajeAfinidad(rutaLejana, historial);
  afirmar(puntajeLejano < 40, `Ruta sin coincidencias y hora muy distinta obtiene puntaje bajo (obtuvo ${puntajeLejano})`);

  const rutaParcial = {
    id: 3, barrioOrigen: 'Floralia', barrioDestino: 'Charco Azul',
    horaSalida: '07:10', precioPorPuesto: 4200, puestosDisponibles: 2,
  };
  const rutaSinCoincidencia = {
    id: 4, barrioOrigen: 'Juanchito', barrioDestino: 'Charco Azul',
    horaSalida: '07:10', precioPorPuesto: 4200, puestosDisponibles: 2,
  };
  const puntajeParcial = calcularPuntajeAfinidad(rutaParcial, historial);
  const puntajeSinCoincidencia = calcularPuntajeAfinidad(rutaSinCoincidencia, historial);
  afirmar(
    puntajeParcial > puntajeSinCoincidencia,
    `Coincidencia parcial de barrio (${puntajeParcial}) puntúa más que ninguna coincidencia (${puntajeSinCoincidencia})`,
  );

  const rutaCualquiera = {
    id: 5, barrioOrigen: 'Cualquiera', barrioDestino: 'Otro',
    horaSalida: '10:00', precioPorPuesto: 5000, puestosDisponibles: 1,
  };
  const puntajeArranqueFrio = calcularPuntajeAfinidad(rutaCualquiera, []);
  afirmar(puntajeArranqueFrio === 50, `Sin historial (arranque en frío), la ruta recibe el puntaje neutro 50 (obtuvo ${puntajeArranqueFrio})`);

  const muchasRutas = Array.from({ length: 10 }, (_, i) => ({
    id: 100 + i, barrioOrigen: 'Floralia', barrioDestino: 'Charco Azul',
    horaSalida: '07:00', precioPorPuesto: 4000, puestosDisponibles: 1,
  }));
  const recomendaciones = obtenerRecomendaciones(muchasRutas, historial, 3);
  afirmar(recomendaciones.length === 3, `obtenerRecomendaciones respeta el límite topN (devolvió ${recomendaciones.length})`);

  const listaVacia = obtenerRecomendaciones([], historial, 5);
  afirmar(listaVacia.length === 0, 'obtenerRecomendaciones con una lista vacía de rutas devuelve una lista vacía');

  console.log('\nTodas las pruebas del módulo de scoring pasaron correctamente.');
}

try {
  ejecutarPruebas();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}