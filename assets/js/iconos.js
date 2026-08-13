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
    /* Globo de conversación con auricular: WhatsApp. La marca oficial es de
       relleno; aquí va en trazo para no romper el lenguaje del resto. */
    whatsapp: '<path d="M20.5 11.7a8.5 8.5 0 01-12.6 7.5L3.5 20.5l1.4-4.3A8.5 8.5 0 1120.5 11.7z"/>' +
      '<path d="M9.3 8.6c.3-.1.6 0 .8.3l.8 1.3c.1.2.1.5 0 .7l-.5.7c.5 1 1.3 1.8 2.3 2.3l.7-.5c.2-.1.5-.2.7 0l1.3.8c.3.2.4.5.3.8-.3.8-1.1 1.3-1.9 1.1a7.6 7.6 0 01-5.6-5.6c-.2-.8.3-1.6 1.1-1.9z"/>',
    /* Triángulo: reproducir el reel */
    play: '<path d="M8.5 5.4l10.6 6.6-10.6 6.6z"/>',
    /* Flecha: navegación de los carruseles */
    flecha: '<path d="M5 12h13M12.5 6l6 6-6 6"/>',
    /* Instagram */
    instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="4.8"/><circle cx="12" cy="12" r="4"/><circle cx="17.1" cy="6.9" r=".9"/>',

    /* --- Los cuatro de "Qué hacemos" --------------------------------------
       Comparten viewBox, grosor y remates con el resto del set, y además
       entre ellos comparten una gramática propia: cada uno tiene al menos
       un corte diagonal en el ángulo del isotipo. Es lo que hace que las
       cuatro tarjetas se lean como una familia y no como cuatro iconos
       elegidos por separado.
    --------------------------------------------------------------------- */

    /* Capas apiladas: una materia sobre otra. La diagonal es la propia
       perspectiva de las hojas, no un adorno añadido. */
    materia: '<path d="M12 3.2L20.3 8 12 12.8 3.7 8z"/><path d="M4.4 12.3L12 16.7l7.6-4.4"/><path d="M4.4 16.2L12 20.6l7.6-4.4"/>',

    /* Globo de conversación con una V dentro: el tutor responde, y lo que
       responde lleva la marca. La esquina inferior derecha va cortada en
       diagonal en vez de redondeada. */
    tutor: '<path d="M20.5 14.2a2.8 2.8 0 01-2.8 2.8h-6.4L6.5 20.5V17a2.8 2.8 0 01-2.8-2.8V6.8A2.8 2.8 0 016.5 4h11.2a2.8 2.8 0 012.8 2.8z"/><path d="M9.4 8.4l2.7 5.1 2.7-5.1"/>',

    /* Ejes con tres nodos en ascenso: el dominio por tema, que es una curva
       viva y no un promedio. */
    progreso: '<path d="M4.2 3.6v16.2h16"/><path d="M7.6 16.4l3.6-4.2 3 2.4 4.6-6.2"/><circle cx="11.2" cy="12.2" r="1.5"/><circle cx="14.2" cy="14.6" r="1.5"/><circle cx="18.8" cy="8.4" r="1.5"/>',

    /* Chip con el núcleo cortado en diagonal: infraestructura propia, hecha
       en casa. Los pines dicen que está conectado a algo. */
    tecnologia: '<path d="M8.6 7.6h6.3a1.5 1.5 0 011.5 1.5v3.8l-3.4 3.5H9.1a1.5 1.5 0 01-1.5-1.5V9.1a1.5 1.5 0 011.5-1.5z"/><path d="M10.2 4.4v3.2M14 4.4v3.2M10.2 16.4v3.2M14 16.4v3.2M4.4 10.2h3.2M4.4 14h3.2M16.4 10.2h3.2M16.4 14h3.2"/>',
  };

  /**
   * @param {string} nombre  llave de TRAZOS
   * @param {number} [tam]   lado en px (24 por defecto)
   * @param {string} [titulo] nombre accesible. Por defecto NO se pone: la
   *   inmensa mayoría de estos iconos van junto a un título que ya dice lo
   *   mismo, y anunciarlo dos veces estorba a quien usa lector de pantalla.
   *   Solo se pasa cuando el icono es la única fuente de la información.
   */
  function svg(nombre, tam, titulo) {
    var d = TRAZOS[nombre];
    if (!d) return '';
    tam = tam || 24;
    var etiqueta = titulo
      ? 'role="img" aria-label="' + String(titulo).replace(/"/g, '&quot;') + '"'
      : 'aria-hidden="true"';
    return '<svg viewBox="0 0 24 24" width="' + tam + '" height="' + tam + '" fill="none" ' +
      'stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" ' +
      etiqueta + ' focusable="false">' + d + '</svg>';
  }

  function montar(raiz) {
    (raiz || document).querySelectorAll('[data-icono]').forEach(function (el) {
      if (el.firstElementChild) return;                 // ya montado
      var tam = parseInt(el.getAttribute('data-icono-tam'), 10) || 24;
      el.innerHTML = svg(el.getAttribute('data-icono'), tam, el.getAttribute('data-icono-titulo'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { montar(); });
  } else {
    montar();
  }

  window.VicIconos = { svg: svg, montar: montar, nombres: Object.keys(TRAZOS) };
})();
