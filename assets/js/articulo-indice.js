/* ==========================================================================
   VictoriaEDU — Índice del artículo
   Marca en .vic-articulo-indice cuál es la sección que se está leyendo.

   Usa IntersectionObserver con un rootMargin que recorta la ventana a una
   banda delgada cerca del borde superior: así la sección "activa" es la que
   acaba de pasar bajo el header, no cualquiera que asome por abajo.

   Si no hay índice, si no hay encabezados, o si el navegador no trae
   IntersectionObserver, no pasa nada: los enlaces del índice siguen siendo
   anclas normales y funcionan igual.
   ========================================================================== */

(function () {
  'use strict';

  var indice = document.querySelector('.vic-articulo-indice');
  if (!indice || !('IntersectionObserver' in window)) return;

  var enlaces = Array.prototype.slice.call(indice.querySelectorAll('a[href^="#"]'));
  if (!enlaces.length) return;

  var porId = {};
  var destinos = [];
  enlaces.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var seccion = document.getElementById(id);
    if (!seccion) return;
    porId[id] = a;
    destinos.push(seccion);
  });
  if (!destinos.length) return;

  var activo = null;
  function marcar(id) {
    if (id === activo) return;
    if (activo && porId[activo]) porId[activo].classList.remove('is-activo');
    if (porId[id]) porId[id].classList.add('is-activo');
    activo = id;
  }

  var visibles = {};
  var observer = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      visibles[e.target.id] = e.isIntersecting;
    });
    /* Con varias secciones dentro de la banda, gana la primera en orden de
       documento: es la que está más arriba, o sea la que se está leyendo. */
    for (var i = 0; i < destinos.length; i++) {
      if (visibles[destinos[i].id]) { marcar(destinos[i].id); return; }
    }
  }, { rootMargin: '-88px 0px -70% 0px', threshold: 0 });

  destinos.forEach(function (s) { observer.observe(s); });
})();
