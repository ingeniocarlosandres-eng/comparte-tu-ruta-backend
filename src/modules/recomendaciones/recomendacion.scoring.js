/**
 * recomendacion.scoring.js
 * -----------------------------------------------------------------------
 * Algoritmo de puntaje de RouteMatch. No depende de la base de datos:
 * recibe arreglos de objetos ya armados y devuelve resultados. Esto lo
 * hace fácil de probar de forma aislada.
 *
 * Pesos: barrio 50 % | horario 25 % | precio 25 %
 * -----------------------------------------------------------------------
 */

const WEIGHTS = { barrio: 50, hora: 25, precio: 25 };
const MAX_DIFERENCIA_MINUTOS = 180;
const PUNTAJE_ARRANQUE_FRIO = 50;

function aMinutos(horaTexto) {
  // acepta "HH:MM" o "HH:MM:SS"
  const [h, m] = horaTexto.split(':').map(Number);
  return h * 60 + m;
}

function promedio(numeros) {
  return numeros.reduce((a, b) => a + b, 0) / numeros.length;
}

function puntajeBarrio(ruta, historial) {
  const exactas = historial.filter(
    (h) => h.barrioOrigen === ruta.barrioOrigen && h.barrioDestino === ruta.barrioDestino
  ).length;
  if (exactas > 0) return 1;

  const parciales = historial.filter(
    (h) => h.barrioOrigen === ruta.barrioOrigen || h.barrioDestino === ruta.barrioDestino
  ).length;
  if (parciales > 0) return 0.6;

  return 0;
}

function puntajeHora(ruta, historial) {
  const diferencias = historial.map((h) =>
    Math.abs(aMinutos(h.horaSalida) - aMinutos(ruta.horaSalida))
  );
  const diferenciaPromedio = promedio(diferencias);
  const acotada = Math.min(diferenciaPromedio, MAX_DIFERENCIA_MINUTOS);
  return 1 - acotada / MAX_DIFERENCIA_MINUTOS;
}

function puntajePrecio(ruta, historial) {
  const precioPromedio = promedio(historial.map((h) => h.precioPorPuesto));
  if (precioPromedio === 0) return 0.5;
  const diferencia = Math.abs(ruta.precioPorPuesto - precioPromedio);
  const acotada = Math.min(diferencia, precioPromedio);
  return 1 - acotada / precioPromedio;
}

function calcularPuntajeAfinidad(ruta, historial) {
  if (!historial || historial.length === 0) {
    return PUNTAJE_ARRANQUE_FRIO;
  }
  const b = puntajeBarrio(ruta, historial);
  const h = puntajeHora(ruta, historial);
  const p = puntajePrecio(ruta, historial);
  const bruto = b * WEIGHTS.barrio + h * WEIGHTS.hora + p * WEIGHTS.precio;
  return Math.round(bruto);
}

function obtenerRecomendaciones(rutas, historial, topN = 5) {
  const puntuadas = rutas.map((ruta) => ({
    ...ruta,
    puntajeAfinidad: calcularPuntajeAfinidad(ruta, historial),
  }));
  puntuadas.sort((a, b) => b.puntajeAfinidad - a.puntajeAfinidad);
  return puntuadas.slice(0, topN);
}

module.exports = { calcularPuntajeAfinidad, obtenerRecomendaciones };