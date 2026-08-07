/* ==========================================================================
   VictoriaEDU — Tarjetas de producto
   Render compartido entre el landing (index) y la tienda, para que el estado
   de cada programa (disponible / próximamente) nunca se contradiga entre páginas.
   ========================================================================== */

(function () {
  'use strict';

  var esc = window.VicUI ? window.VicUI.escapar : function (s) { return s; };

  /**
   * Devuelve el HTML de una tarjeta de producto.
   * @param {Object} p producto del CATALOGO
   * @param {{detallada?:boolean}} [opts] detallada = incluye la lista "incluye"
   */
  function tarjetaProducto(p, opts) {
    opts = opts || {};
    var disponible = p.estado === 'disponible';

    var incluye = opts.detallada && p.incluye
      ? '<ul class="vic-lista-check">' + p.incluye.map(function (i) {
          return '<li>' + esc(i) + '</li>';
        }).join('') + '</ul>'
      : '';

    var precio = disponible
      ? '<div><div style="font-family:var(--vic-font-display);font-size:26px;font-weight:700;color:var(--vic-azul-profundo)">' +
          window.formatoMXN(p.precio) +
        '</div><div style="font-size:13px;color:var(--vic-text-muted)">pago único</div></div>'
      : '<div><div style="font-family:var(--vic-font-display);font-size:22px;font-weight:700;color:var(--vic-text-muted)">' +
          window.formatoMXN(p.precio) +
        '</div><div style="font-size:13px;color:var(--vic-text-muted)">precio estimado</div></div>';

    var accion = disponible
      ? '<a class="vic-btn vic-btn--primary vic-btn--lg" href="checkout.html?producto=' + encodeURIComponent(p.id) + '">Comprar ahora</a>'
      : '<button class="vic-btn vic-btn--secondary vic-btn--lg" type="button" data-lista-espera="' + esc(p.id) + '">Avísame cuando abra</button>';

    var enlaceDetalle = disponible && p.pagina
      ? '<a href="' + esc(p.pagina) + '" style="font-size:14px;font-weight:600">Ver el programa completo →</a>'
      : '';

    return '' +
      '<article class="vic-card vic-card--flush vic-card--hoverable vic-producto' + (disponible ? '' : ' vic-producto--proximo') + '" id="' + esc(p.slug) + '">' +
        '<div class="vic-producto__img">' +
          '<img src="' + esc(p.imagen) + '" alt="' + esc(p.imagenAlt) + '" loading="lazy">' +
        '</div>' +
        '<div class="vic-producto__body">' +
          '<div class="vic-row" style="gap:10px;margin-bottom:14px">' +
            '<span class="vic-badge ' + esc(p.badge.clase) + '">' + esc(p.badge.texto) + '</span>' +
            '<span style="font-size:14px;color:var(--vic-text-muted)">' + esc(p.meta) + '</span>' +
          '</div>' +
          '<h3 style="font-size:26px;margin:0 0 12px">' + esc(p.nombre) + '</h3>' +
          '<p style="font-size:16px;line-height:1.6;margin:0 0 20px">' + esc(p.resumen) + '</p>' +
          incluye +
          '<div class="vic-producto__pie">' +
            precio +
            '<div class="vic-stack" style="gap:8px;justify-items:end">' + accion + enlaceDetalle + '</div>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  /* --- Lista de espera para productos "próximamente" ----------------------- */
  /* Un "próximamente" sin captura de correo es un callejón sin salida: aquí sí
     deja señal de demanda, que es justo lo que sirve para priorizar. */
  function abrirListaEspera(productoId) {
    var p = window.getProducto(productoId);
    if (!p) return;

    var overlay = document.createElement('div');
    overlay.className = 'vic-modal';
    overlay.innerHTML =
      '<div class="vic-modal__caja" role="dialog" aria-modal="true" aria-labelledby="leTitulo">' +
        '<button class="vic-modal__cerrar" type="button" aria-label="Cerrar">✕</button>' +
        '<h3 id="leTitulo" style="font-size:24px;margin:0 0 8px">' + esc(p.nombre) + '</h3>' +
        '<p style="font-size:15px;line-height:1.6;margin:0 0 22px;color:var(--vic-text-body)">Déjanos tu correo y eres de los primeros en enterarte cuando abra, con el precio de lanzamiento.</p>' +
        '<form class="vic-stack" style="gap:16px" novalidate>' +
          '<label class="vic-field"><span class="vic-label">Nombre</span>' +
            '<input class="vic-input" type="text" name="nombre" placeholder="Ana Karen Martínez" autocomplete="name"></label>' +
          '<label class="vic-field"><span class="vic-label">Correo <span class="vic-req">*</span></span>' +
            '<input class="vic-input" type="email" name="correo" placeholder="tucorreo@ejemplo.com" autocomplete="email" required>' +
            '<span class="vic-error vic-hidden" data-error></span></label>' +
          '<label class="vic-field"><span class="vic-label">WhatsApp <span class="vic-muted" style="font-weight:400">(opcional)</span></span>' +
            '<input class="vic-input" type="tel" name="telefono" placeholder="55 0000 0000" autocomplete="tel"></label>' +
          '<button class="vic-btn vic-btn--primary vic-btn--lg vic-btn--block" type="submit">Apuntarme a la lista</button>' +
          '<p class="vic-hint" style="margin:0">Un solo correo cuando abra. Puedes darte de baja cuando quieras.</p>' +
        '</form>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    var input = overlay.querySelector('input[name="correo"]');
    if (input) input.focus();

    function cerrar() {
      overlay.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') cerrar(); }
    document.addEventListener('keydown', onKey);

    overlay.querySelector('.vic-modal__cerrar').addEventListener('click', cerrar);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) cerrar(); });

    overlay.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target;
      var correo = f.elements.correo.value.trim();
      var err = f.querySelector('[data-error]');
      if (!window.VicUI.validarCorreo(correo)) {
        f.elements.correo.setAttribute('aria-invalid', 'true');
        err.textContent = 'Escribe un correo válido, por ejemplo nombre@dominio.com';
        err.classList.remove('vic-hidden');
        f.elements.correo.focus();
        return;
      }
      f.elements.correo.removeAttribute('aria-invalid');
      err.classList.add('vic-hidden');

      window.VictoriaAPI.registrarLead({
        productoId: p.id,
        productoNombre: p.nombre,
        nombre: f.elements.nombre.value.trim(),
        correo: correo,
        telefono: f.elements.telefono.value.trim(),
        origen: 'lista-espera',
      }).then(function () {
        overlay.querySelector('.vic-modal__caja').innerHTML =
          '<button class="vic-modal__cerrar" type="button" aria-label="Cerrar">✕</button>' +
          '<div style="text-align:center;padding:22px 0">' +
            '<div style="font-size:44px;line-height:1;margin-bottom:14px">✓</div>' +
            '<h3 style="font-size:24px;margin:0 0 10px;color:var(--vic-success)">Quedaste en la lista</h3>' +
            '<p style="font-size:15px;line-height:1.6;margin:0">Te escribimos a <strong>' + esc(correo) + '</strong> el día que abra ' + esc(p.nombre) + '.</p>' +
          '</div>';
        overlay.querySelector('.vic-modal__cerrar').addEventListener('click', cerrar);
        window.VicUI.toast('Te avisamos cuando abra');
      });
    });
  }

  /* Delegación global: cualquier botón [data-lista-espera] abre el modal. */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-lista-espera]');
    if (!btn) return;
    abrirListaEspera(btn.getAttribute('data-lista-espera'));
  });

  window.VicProductos = {
    tarjeta: tarjetaProducto,
    abrirListaEspera: abrirListaEspera,
  };
})();
