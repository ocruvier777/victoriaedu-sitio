/* ==========================================================================
   VictoriaEDU — Iconos
   --------------------------------------------------------------------------
   SVG en línea, trazo de 1.75, extremos redondeados. Mismo peso visual que las
   gráficas: la línea fina es el lenguaje de la marca, no el bloque relleno.

   Uso:  <span data-icono="datos"></span>
         <span data-icono="ia" data-icono-tam="20"></span>
   Se sustituyen solos al cargar la página. Desde JS: VicIconos.svg('datos').
   ========================================================================== */

(function () {
  'use strict';

  var TRAZOS = {
    /* Curva de conocimiento: lo que estima el DKT */
    dkt: '<path d="M3 18c3.5 0 4.5-9 8-9s4.5 6 8 6"/><circle cx="11" cy="9" r="1.6"/><circle cx="19" cy="15" r="1.6"/>',
    /* Barras: análisis de datos */
    datos: '<path d="M4 20V10M10 20V4M16 20v-7M22 20V7"/>',
    /* Chispa: IA */
    ia: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
    /* Llaves de código: ingeniería propia */
    ingenieria: '<path d="M8.5 7L3.5 12l5 5M15.5 7l5 5-5 5"/>',
    /* Nube: en línea */
    nube: '<path d="M7.5 18.5A4.5 4.5 0 016.9 9.6a5.6 5.6 0 0110.7-1.2A4 4 0 0117 18.5z"/>',
    /* Documento con barras: el reporte */
    reporte: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9.5 17v-3M12 17v-5M14.5 17v-2"/>',
    /* Reloj: tiempo cronometrado */
    reloj: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    /* Cuadrícula: áreas evaluadas */
    areas: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2"/>',
    /* Lista con marcas: los reactivos */
    reactivos: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M3.5 6l1.2 1.2L7 5M3.5 12l1.2 1.2L7 11M3.5 18l1.2 1.2L7 17"/>',
    /* Sello: credencial verificada */
    credencial: '<circle cx="12" cy="9.5" r="5.5"/><path d="M9.2 14.3L8 21l4-2 4 2-1.2-6.7"/><path d="M10 9.5l1.4 1.4 2.8-2.8"/>',
    /* Escudo con check */
    verificado: '<path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
  };

  function svg(nombre, tam) {
    var d = TRAZOS[nombre];
    if (!d) return '';
    tam = tam || 24;
    return '<svg viewBox="0 0 24 24" width="' + tam + '" height="' + tam + '" fill="none" ' +
      'stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false">' + d + '</svg>';
  }

  function montar(raiz) {
    (raiz || document).querySelectorAll('[data-icono]').forEach(function (el) {
      if (el.firstElementChild) return;                 // ya montado
      var tam = parseInt(el.getAttribute('data-icono-tam'), 10) || 24;
      el.innerHTML = svg(el.getAttribute('data-icono'), tam);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { montar(); });
  } else {
    montar();
  }

  window.VicIconos = { svg: svg, montar: montar, nombres: Object.keys(TRAZOS) };
})();
