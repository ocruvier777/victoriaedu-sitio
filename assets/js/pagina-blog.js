/* ==========================================================================
   VictoriaEDU — Blog
   Pinta dos cosas desde CONFIG.blog:

   · La rejilla del índice (`blog.html`), en #blogGrid.
   · La tira de "sigue leyendo" al pie de cada artículo, en #blogRelacionados.
     El artículo marca cuál es él con data-slug, para no listarse a sí mismo.

   Se carga en blog.html y en cada `blog-*.html`. Si no encuentra ninguno de
   los dos contenedores, no hace nada.
   ========================================================================== */

(function () {
  'use strict';

  var C = window.CONFIG || {};
  var ENTRADAS = (C.blog || []).filter(function (a) { return a && a.slug && a.titulo; });
  if (!ENTRADAS.length) return;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* "2026-10-12" → "12 oct 2026". Se construye a mano en vez de con
     toLocaleDateString porque `new Date('2026-10-12')` se interpreta en UTC y,
     al formatearse en un huso al oeste, retrocede un día. */
  var MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  function fechaCorta(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    if (!m) return '';
    return parseInt(m[3], 10) + ' ' + MESES[parseInt(m[2], 10) - 1] + ' ' + m[1];
  }

  function url(a) { return 'blog-' + a.slug + '.html'; }

  function tarjeta(a) {
    var meta = [];
    if (a.materia) meta.push('<span class="vic-blog-card__materia">' + esc(a.materia) + '</span>');
    if (a.fecha) meta.push('<span>' + esc(fechaCorta(a.fecha)) + '</span>');
    if (a.minutos) meta.push('<span>' + esc(a.minutos) + ' min</span>');

    return '<a class="vic-blog-card" href="' + esc(url(a)) + '">' +
      '<div class="vic-blog-card__meta">' + meta.join('<span aria-hidden="true">·</span>') + '</div>' +
      '<h3>' + esc(a.titulo) + '</h3>' +
      (a.resumen ? '<p>' + esc(a.resumen) + '</p>' : '') +
      '<span class="vic-blog-card__mas">Leer →</span>' +
    '</a>';
  }

  /* Más nuevo primero. Las entradas sin fecha caen al final en vez de romper
     la comparación. */
  function porFecha(a, b) { return String(b.fecha || '').localeCompare(String(a.fecha || '')); }

  var grid = document.getElementById('blogGrid');
  if (grid) {
    grid.innerHTML = ENTRADAS.slice().sort(porFecha).map(tarjeta).join('');
  }

  var relacionados = document.getElementById('blogRelacionados');
  if (relacionados) {
    var actual = relacionados.getAttribute('data-slug');
    /* Primero los de la misma materia: quien acaba de leer de cinemática
       sigue en física, no en química. */
    var yo = ENTRADAS.filter(function (a) { return a.slug === actual; })[0];
    var otros = ENTRADAS.filter(function (a) { return a.slug !== actual; }).sort(function (a, b) {
      if (yo && a.materia !== b.materia) {
        if (a.materia === yo.materia) return -1;
        if (b.materia === yo.materia) return 1;
      }
      return porFecha(a, b);
    }).slice(0, 3);

    if (otros.length) {
      relacionados.innerHTML = otros.map(tarjeta).join('');
    } else {
      /* Con un solo artículo publicado no hay nada que recomendar: se esconde
         la sección entera en vez de dejar un título sobre un hueco. */
      var seccion = relacionados.closest('[data-blog-relacionados-seccion]');
      if (seccion) seccion.classList.add('vic-hidden');
    }
  }
})();
