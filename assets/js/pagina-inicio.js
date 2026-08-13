/* ==========================================================================
   VictoriaEDU — Lógica del landing (index.html)
   ========================================================================== */

(function () {
  'use strict';

  var esc = window.VicUI.escapar;
  var C = window.CONFIG;

  /* --- Programas: se pintan desde el catálogo ----------------------------- */
  var grid = document.getElementById('programasGrid');
  if (grid) {
    grid.innerHTML = window.CATALOGO.map(function (p) {
      return window.VicProductos.tarjeta(p, { detallada: false });
    }).join('');
  }

  /* --- Sparkline de mejora ------------------------------------------------
     Forma ilustrativa de la curva de avance típica, no una serie medida.
     TODO(Óscar): si tienes el avance real por generación, va aquí.
  ------------------------------------------------------------------------ */
  var spark = document.getElementById('sparkMejora');
  if (spark) {
    spark.innerHTML = window.VicUI.sparkline([58, 63, 71, 76, 84, 89, 96], { ancho: 84, alto: 30 });
  }

  /* --- "Conoce más" --------------------------------------------------------
     El botón lleva data-mas="clave" y el texto largo vive en un div oculto
     #mas-clave dentro del propio HTML. Se hace así, y no con cadenas en JS,
     para que el contenido siga siendo texto indexable y editable a mano.
  ------------------------------------------------------------------------ */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-mas]');
    if (!btn) return;
    var fuente = document.getElementById('mas-' + btn.getAttribute('data-mas'));
    if (!fuente) return;
    var titulo = fuente.querySelector('h3');
    window.VicUI.modal(fuente.innerHTML, {
      titulo: titulo ? titulo.textContent : 'Más información',
      ancho: '620px',
    });
  });

  /* --- Testimonios ---------------------------------------------------------
     Solo se pintan si CONFIG.testimonios trae citas reales y autorizadas. Con
     la lista vacía el bloque entero se queda oculto: es preferible una página
     sin testimonios a una con testimonios inventados.
  ------------------------------------------------------------------------ */
  function iniciales(t) {
    if (t.iniciales) return t.iniciales;
    return String(t.nombre || '?').split(/\s+/).slice(0, 2).map(function (p) {
      return p.charAt(0).toUpperCase();
    }).join('');
  }

  var testimonios = (C.testimonios || []).filter(function (t) { return t && t.cita; });
  var bloqueT = document.getElementById('testimoniosBloque');
  var railT = document.getElementById('testimoniosRail');

  if (bloqueT && railT && testimonios.length) {
    railT.innerHTML = testimonios.map(function (t) {
      // Los anónimos van sin monograma: unas iniciales inventadas sobre una
      // cita sin nombre fingen una identidad que no existe, y además los
      // igualarían visualmente con los que sí se pueden comprobar.
      var monograma = t.anonimo ? ''
        : '<span class="vic-monograma" aria-hidden="true">' + esc(iniciales(t)) + '</span>';
      // Rejilla de dos columnas: quién lo dijo | la cita. La cita ocupa el
      // ancho, que es lo que mantiene la tarjeta baja aunque el texto sea largo.
      return '<figure class="vic-testimonio' +
          (t.destacado ? ' vic-testimonio--destacado' : '') +
          (t.anonimo ? ' vic-testimonio--anonimo' : '') + '">' +
        '<figcaption class="vic-testimonio__quien">' +
          monograma +
          '<span class="vic-testimonio__nombre">' + esc(t.nombre) + '</span>' +
          '<span class="vic-testimonio__detalle">' + esc(t.detalle) + '</span>' +
        '</figcaption>' +
        '<blockquote class="vic-testimonio__cita">«' + esc(t.cita) + '»</blockquote>' +
      '</figure>';
    }).join('');
    bloqueT.classList.remove('vic-hidden');
    window.VicUI.rail(railT, {
      etiqueta: 'Testimonios de alumnos',
      navEn: '#testimoniosNav',
    });
  }

  /* --- Reels de Instagram --------------------------------------------------
     La tarjeta es portada + botón. El iframe de Instagram se crea solo cuando
     alguien da clic: si se incrustara de entrada, la portada arrastraría el
     script de Instagram en cada visita y en un celular eso se nota.
  ------------------------------------------------------------------------ */
  function urlEmbed(url) {
    // De https://www.instagram.com/reel/CODIGO/?utm=... a .../reel/CODIGO/embed/
    return String(url).split('?')[0].replace(/\/+$/, '') + '/embed/';
  }

  var redes = C.redes || {};
  var reels = (redes.reels || []).filter(function (r) { return r && r.url; });
  var seccionR = document.getElementById('reels');
  var railR = document.getElementById('reelsRail');

  if (seccionR && railR && reels.length) {
    railR.innerHTML = reels.map(function (r, i) {
      var portada = r.portada
        ? '<img src="' + esc(r.portada) + '" alt="" loading="lazy">'
        : '';
      return '<button class="vic-reel" type="button" data-reel="' + i + '" ' +
          'aria-label="Ver el video: ' + esc(r.titulo || 'reel de Instagram') + '">' +
          portada +
          '<span class="vic-reel__play" data-icono="play" data-icono-tam="26"></span>' +
          (r.titulo ? '<span class="vic-reel__tit">' + esc(r.titulo) + '</span>' : '') +
        '</button>';
    }).join('');

    var perfil = document.getElementById('igPerfil');
    if (perfil && redes.instagram) {
      perfil.href = 'https://www.instagram.com/' + encodeURIComponent(redes.instagram.replace(/^@/, '')) + '/';
    } else if (perfil) {
      perfil.classList.add('vic-hidden');
    }

    railR.addEventListener('click', function (e) {
      var b = e.target.closest('[data-reel]');
      if (!b) return;
      var r = reels[parseInt(b.getAttribute('data-reel'), 10)];
      if (!r) return;
      window.VicUI.modal(
        '<div class="vic-reel-embed">' +
          '<iframe src="' + esc(urlEmbed(r.url)) + '" title="' + esc(r.titulo || 'Reel de Instagram') + '" ' +
            'allowfullscreen scrolling="no" frameborder="0"></iframe>' +
        '</div>',
        { titulo: r.titulo || 'Reel de Instagram', ancho: '440px', clase: 'vic-modal--video' }
      );
    });

    seccionR.classList.remove('vic-hidden');
    window.VicUI.rail(railR, { etiqueta: 'Videos de Instagram' });
  }

  /* El bloque de cierre ya no captura correos: el "diagnóstico gratuito"
     prometía un PDF por correo que nunca existió. Ahora manda al examen gratis
     de la plataforma, que es esa misma promesa pero de verdad, y ahí el correo
     se captura en el registro —con base de datos detrás, no en localStorage. */
})();
