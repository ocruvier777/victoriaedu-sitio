/* ==========================================================================
   VictoriaEDU — Tarjetas de producto
   Render compartido entre el landing (index) y la tienda, para que el estado
   de cada programa (disponible / próximamente) nunca se contradiga entre páginas.

   Dos modos:
   · resumida (portada)  → 4 puntos cortos + "Conoce más". Se ojea, no se lee.
   · detallada (tienda)  → la lista `incluye` completa + comprar / lista de espera.
   ========================================================================== */

(function () {
  'use strict';

  var esc = window.VicUI ? window.VicUI.escapar : function (s) { return s; };

  /* Los puntos cortos de la portada. Si un producto todavía no los tiene, se
     recortan de `incluye` para que la tarjeta nunca salga vacía. */
  function puntosDe(p) {
    return (p.puntos && p.puntos.length ? p.puntos : (p.incluye || [])).slice(0, 4);
  }

  function listaCheck(items) {
    if (!items.length) return '';
    return '<ul class="vic-lista-check">' + items.map(function (i) {
      return '<li>' + esc(i) + '</li>';
    }).join('') + '</ul>';
  }

  /* Los productos que todavía no existen NO enseñan precio.
     Antes salía el del catálogo rotulado "precio estimado", y un número puesto
     en la mesa es un número que alguien va a recordar: si el curso abre a otro
     precio, la conversación empieza con nosotros desdiciéndonos. Mejor decir
     que no está definido, que además es verdad.

     El precio sigue en CONFIG.CATALOGO —hace falta para ordenar y para el día
     que abran—, simplemente no se publica hasta que el producto exista. */
  /* Va por clases y no por estilos en línea a propósito: la misma tarjeta se
     pinta sobre papel blanco y sobre cristal oscuro, y un color escrito en el
     atributo `style` gana a cualquier regla de tema. Con clases, el contexto
     manda. */
  function precioHTML(p) {
    if (p.estado !== 'disponible') {
      return '<div class="vic-precio vic-precio--proximo">' +
        '<div class="vic-precio__num">Precio por definir</div>' +
        '<div class="vic-precio__nota">Te avisamos al abrir</div>' +
      '</div>';
    }
    return '<div class="vic-precio">' +
      '<div class="vic-precio__num">' + window.formatoMXN(p.precio) + '</div>' +
      '<div class="vic-precio__nota">pago único</div>' +
    '</div>';
  }

  /* --- Portada del programa ------------------------------------------------
     El catálogo puede traer, además de `imagen` (la que se usa hoy), dos
     variantes optimizadas opcionales: `imagenAvif` y `imagenWebp`. Cuando
     existan, la tarjeta las sirve por <picture> con degradación en cascada
     AVIF → WebP → la imagen de siempre. Mientras no existan, `<picture>` ni
     aparece y la tarjeta se pinta exactamente igual que antes: no hay forma
     de que este código deje un hueco roto por un archivo que falta.

     `width`/`height` van siempre, aunque el CSS luego mande: son lo que
     permite al navegador reservar el espacio antes de descargar nada, y sin
     eso la rejilla de programas da un salto al cargar (CLS).

     `prioritaria` marca la única portada que se carga sin `lazy`: la primera
     de la portada, que suele entrar en el primer scroll.
  ------------------------------------------------------------------------ */
  var PORTADA_W = 640;
  var PORTADA_H = 360;   /* 16:9, el mismo aspect-ratio que fija .vic-producto__img */

  function portadaHTML(p, opts) {
    var carga = opts && opts.prioritaria
      ? ' loading="eager" fetchpriority="high"'
      : ' loading="lazy" decoding="async"';

    var img = '<img src="' + esc(p.imagen) + '" alt="' + esc(p.imagenAlt) + '"' +
      ' width="' + PORTADA_W + '" height="' + PORTADA_H + '"' + carga + '>';

    if (!p.imagenAvif && !p.imagenWebp) return img;

    return '<picture>' +
      (p.imagenAvif ? '<source srcset="' + esc(p.imagenAvif) + '" type="image/avif">' : '') +
      (p.imagenWebp ? '<source srcset="' + esc(p.imagenWebp) + '" type="image/webp">' : '') +
      img +
    '</picture>';
  }

  /**
   * Devuelve el HTML de una tarjeta de producto.
   * @param {Object} p producto del CATALOGO
   * @param {{detallada?:boolean, prioritaria?:boolean, horizontal?:boolean}} [opts]
   *        detallada   = tienda; si no, portada.
   *        prioritaria = no aplicar lazy-load a la imagen.
   *        horizontal  = imagen a un lado y contenido al otro, en cristal;
   *                      es el formato del carrusel de la tienda.
   */
  function tarjetaProducto(p, opts) {
    opts = opts || {};
    var disponible = p.estado === 'disponible';

    var cuerpo, accion;

    if (opts.detallada) {
      // Tienda: aquí ya vino a comprar, así que se le enseña todo y el botón
      // es la compra directa.
      //
      // En el carrusel se usan los 4 `puntos` en vez de la lista larga. No es
      // por estética: en un riel todas las tarjetas miden lo que la más alta,
      // y con `incluye` el simulacro (siete líneas) dejaba a las otras dos con
      // un hueco enorme entre la lista y el precio. Con cuatro líneas parejas
      // las tres quedan del mismo alto, la ilustración de al lado se recorta
      // menos, y el detalle completo sigue a un clic en "Ver el programa".
      var lista = opts.horizontal ? puntosDe(p) : (p.incluye || []);
      cuerpo = '<p style="font-size:16px;line-height:1.6;margin:0 0 20px">' + esc(p.resumen) + '</p>' +
        listaCheck(lista);
      accion = disponible
        ? '<a class="vic-btn vic-btn--primary vic-btn--lg" href="' + esc(window.VicUI.urlComprar()) +
            '" data-metrica="comprar_clic" data-metrica-lugar="tienda">Comprar — ' + esc(window.VicUI.precioCorto(p.id)) + '</a>' +
          '<a class="vic-btn vic-btn--secondary vic-btn--lg" href="' + esc(window.VicUI.urlExamenGratis()) +
            '" data-metrica="examen_gratis_clic" data-metrica-lugar="tienda">Pruébalo gratis primero</a>' +
          (p.pagina ? '<a class="vic-producto__link" href="' + esc(p.pagina) + '">Ver el programa completo →</a>' : '')
        : '<button class="vic-btn vic-btn--secondary vic-btn--lg" type="button" data-lista-espera="' +
            esc(p.id) + '">Avísame cuando abra</button>';
    } else {
      // Portada: 4 puntos y un solo botón. Quien quiera el detalle entra.
      cuerpo = listaCheck(puntosDe(p));
      accion = disponible && p.pagina
        ? '<a class="vic-btn vic-btn--primary vic-btn--md" href="' + esc(p.pagina) + '">Conoce más</a>'
        : '<button class="vic-btn vic-btn--secondary vic-btn--md" type="button" data-detalle="' +
            esc(p.id) + '">Conoce más</button>';
    }

    var clases = 'vic-card vic-card--flush vic-card--hoverable vic-producto' +
      (disponible ? '' : ' vic-producto--proximo') +
      (opts.horizontal ? ' vic-producto--horizontal' : '');

    return '' +
      '<article class="' + clases + '" id="' + esc(p.slug) + '">' +
        '<div class="vic-producto__img">' +
          portadaHTML(p, opts) +
        '</div>' +
        '<div class="vic-producto__body">' +
          '<div class="vic-row" style="gap:10px;margin-bottom:14px">' +
            '<span class="vic-badge ' + esc(p.badge.clase) + '">' + esc(p.badge.texto) + '</span>' +
            '<span class="vic-producto__meta">' + esc(p.meta) + '</span>' +
          '</div>' +
          '<h3 style="font-size:24px;margin:0 0 14px">' + esc(p.nombre) + '</h3>' +
          cuerpo +
          '<div class="vic-producto__pie">' +
            precioHTML(p) +
            '<div class="vic-stack vic-producto__acciones">' + accion + '</div>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  /* --- Lista de espera para productos "próximamente" -----------------------
     Un "próximamente" sin captura de correo es un callejón sin salida: aquí sí
     deja señal de demanda, que es justo lo que sirve para priorizar. */
  function formularioEsperaHTML(p) {
    return '<form class="vic-stack" style="gap:16px" novalidate>' +
      '<label class="vic-field"><span class="vic-label">Nombre</span>' +
        '<input class="vic-input" type="text" name="nombre" placeholder="Ana Karen Martínez" autocomplete="name"></label>' +
      '<label class="vic-field"><span class="vic-label">Correo <span class="vic-req">*</span></span>' +
        '<input class="vic-input" type="email" name="correo" placeholder="tucorreo@ejemplo.com" autocomplete="email" required>' +
        '<span class="vic-error vic-hidden" data-error></span></label>' +
      '<label class="vic-field"><span class="vic-label">WhatsApp <span class="vic-muted" style="font-weight:400">(opcional)</span></span>' +
        '<input class="vic-input" type="tel" name="telefono" placeholder="55 0000 0000" autocomplete="tel"></label>' +
      '<button class="vic-btn vic-btn--primary vic-btn--lg vic-btn--block" type="submit">Apuntarme a la lista</button>' +
      '<p class="vic-hint" style="margin:0">Un solo correo cuando abra. Puedes darte de baja cuando quieras.</p>' +
    '</form>';
  }

  /* Cablea el formulario dentro de un modal ya abierto (handle de VicUI.modal). */
  function cablearEspera(m, p) {
    var form = m.caja.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var correo = form.elements.correo.value.trim();
      var err = form.querySelector('[data-error]');

      if (!window.VicUI.validarCorreo(correo)) {
        form.elements.correo.setAttribute('aria-invalid', 'true');
        err.textContent = 'Escribe un correo válido, por ejemplo nombre@dominio.com';
        err.classList.remove('vic-hidden');
        form.elements.correo.focus();
        return;
      }
      form.elements.correo.removeAttribute('aria-invalid');
      err.classList.add('vic-hidden');

      window.VicMetricas.evento('lead_enviado', { lugar: 'lista-espera', producto: p.id });
      window.VictoriaAPI.registrarLead({
        productoId: p.id,
        productoNombre: p.nombre,
        nombre: form.elements.nombre.value.trim(),
        correo: correo,
        telefono: form.elements.telefono.value.trim(),
        origen: 'lista-espera',
      }).then(function () {
        // El cierre del modal está delegado en el overlay, así que repintar la
        // caja entera no lo rompe: no hay que volver a cablear la X.
        m.caja.innerHTML =
          '<button class="vic-modal__cerrar" type="button" aria-label="Cerrar">✕</button>' +
          '<div style="text-align:center;padding:22px 0">' +
            '<div style="font-size:44px;line-height:1;margin-bottom:14px">✓</div>' +
            '<h3 style="font-size:24px;margin:0 0 10px;color:var(--vic-success)">Quedaste en la lista</h3>' +
            '<p style="font-size:15px;line-height:1.6;margin:0">Te escribimos a <strong>' + esc(correo) + '</strong> el día que abra ' + esc(p.nombre) + '.</p>' +
          '</div>';
        window.VicUI.toast('Te avisamos cuando abra');
      });
    });
  }

  function abrirListaEspera(productoId) {
    var p = window.getProducto(productoId);
    if (!p) return;

    var m = window.VicUI.modal(
      '<h3 style="font-size:24px;margin:0 0 8px">' + esc(p.nombre) + '</h3>' +
      '<p style="font-size:15px;line-height:1.6;margin:0 0 22px;color:var(--vic-text-body)">Déjanos tu correo y eres de los primeros en enterarte cuando abra, con el precio de lanzamiento.</p>' +
      formularioEsperaHTML(p),
      { titulo: p.nombre }
    );
    cablearEspera(m, p);
  }

  /* --- Detalle desde la portada -------------------------------------------
     El "Conoce más" de un programa sin página propia abre aquí: toda la
     información que la tarjeta se calló, y la lista de espera al final para
     que no sea un callejón sin salida. */
  function abrirDetalle(productoId) {
    var p = window.getProducto(productoId);
    if (!p) return;
    if (p.estado === 'disponible' && p.pagina) { location.href = p.pagina; return; }

    var m = window.VicUI.modal(
      '<div class="vic-row" style="gap:10px;margin-bottom:14px">' +
        '<span class="vic-badge ' + esc(p.badge.clase) + '">' + esc(p.badge.texto) + '</span>' +
        '<span style="font-size:14px;color:var(--vic-text-muted)">' + esc(p.meta) + '</span>' +
      '</div>' +
      '<h3 style="font-size:26px;margin:0 0 12px">' + esc(p.nombre) + '</h3>' +
      '<p style="font-size:16px;line-height:1.6;margin:0 0 22px">' + esc(p.resumen) + '</p>' +
      '<div style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--vic-text-muted);margin-bottom:12px">Qué incluye</div>' +
      listaCheck(p.incluye || []) +
      '<hr class="vic-divider" style="margin:8px 0 22px">' +
      '<div style="font-family:var(--vic-font-display);font-size:20px;font-weight:700;color:var(--vic-azul-profundo);margin-bottom:4px">' +
        window.formatoMXN(p.precio) + ' <span style="font-family:var(--vic-font-body);font-size:14px;font-weight:400;color:var(--vic-text-muted)">precio estimado</span>' +
      '</div>' +
      '<p style="font-size:15px;line-height:1.6;margin:0 0 20px">Todavía no abre. Déjanos tu correo y te avisamos, con el precio de lanzamiento.</p>' +
      formularioEsperaHTML(p),
      { titulo: p.nombre, ancho: '620px' }
    );
    cablearEspera(m, p);
  }

  /* Delegación global: los botones de las tarjetas abren su modal. */
  document.addEventListener('click', function (e) {
    var espera = e.target.closest('[data-lista-espera]');
    if (espera) { abrirListaEspera(espera.getAttribute('data-lista-espera')); return; }
    var detalle = e.target.closest('[data-detalle]');
    if (detalle) { abrirDetalle(detalle.getAttribute('data-detalle')); }
  });

  window.VicProductos = {
    tarjeta: tarjetaProducto,
    abrirListaEspera: abrirListaEspera,
    abrirDetalle: abrirDetalle,
  };
})();
