/* ==========================================================================
   VictoriaEDU — Paso 1 del checkout: datos del comprador
   Valida, guarda el borrador y manda al paso 2. No crea el pedido todavía:
   el pedido (y su folio) nace cuando el alumno elige método de pago.
   ========================================================================== */

(function () {
  'use strict';

  var esc = window.VicUI.escapar;

  /* --- Producto ----------------------------------------------------------- */
  var productoId = window.VicUI.parametro('producto') || 'simulacro-ipn-2026';
  var producto = window.getProducto(productoId);

  // Si el producto no existe o no está a la venta, no dejamos avanzar.
  if (!producto || producto.estado !== 'disponible') {
    document.querySelector('.vic-checkout').innerHTML =
      '<div class="vic-note vic-note--warning" style="grid-column:1/-1">' +
        '<strong>Ese programa todavía no está a la venta.</strong><br>' +
        'Revisa los programas abiertos o déjanos tu correo para avisarte cuando abra.' +
        '<div class="vic-row" style="margin-top:18px">' +
          '<a class="vic-btn vic-btn--primary vic-btn--md" href="tienda.html">Ver programas</a>' +
        '</div>' +
      '</div>';
    return;
  }

  /* --- Resumen ------------------------------------------------------------ */
  function pintarResumen() {
    document.getElementById('resumenContenido').innerHTML =
      '<div class="vic-row" style="gap:14px;align-items:flex-start;padding-bottom:18px;border-bottom:1px solid var(--vic-border)">' +
        '<div style="width:64px;height:64px;border-radius:10px;overflow:hidden;flex:none;background:var(--vic-bg-subtle)">' +
          '<img src="' + esc(producto.imagen) + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block">' +
        '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-weight:700;color:var(--vic-azul-profundo);font-size:16px;line-height:1.3">' + esc(producto.nombre) + '</div>' +
          '<div class="vic-hint" style="margin-top:4px">' + esc(producto.meta) + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="padding:14px 0">' +
        '<div class="vic-summary__line"><span class="vic-muted">Subtotal</span><span>' + window.formatoMXN(producto.precio) + '</span></div>' +
        '<div class="vic-summary__line"><span class="vic-muted">Envío</span><span>Digital — sin costo</span></div>' +
      '</div>' +
      '<div class="vic-summary__total">' +
        '<span class="vic-muted">Total</span><strong>' + window.formatoMXN(producto.precio) + '</strong>' +
      '</div>' +
      '<ul class="vic-lista-check" style="margin:22px 0 0;font-size:14px">' +
        producto.incluye.slice(0, 4).map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') +
      '</ul>';
  }
  pintarResumen();

  /* --- Prellenado si el alumno ya había empezado --------------------------- */
  var form = document.getElementById('formDatos');
  window.VictoriaAPI.obtenerBorrador().then(function (b) {
    if (!b) return;
    ['nombre', 'correo', 'telefono', 'carrera'].forEach(function (k) {
      var campo = form.elements[k];
      if (b[k] && campo) campo.value = b[k];
    });
  });

  /* --- Validación --------------------------------------------------------- */
  function mostrarError(campo, mensaje) {
    var el = form.querySelector('[data-error="' + campo + '"]');
    if (el) { el.textContent = mensaje; el.classList.remove('vic-hidden'); }
    var input = form.elements[campo];
    if (input && input.type !== 'checkbox') input.setAttribute('aria-invalid', 'true');
  }

  function limpiarErrores() {
    form.querySelectorAll('[data-error]').forEach(function (el) { el.classList.add('vic-hidden'); });
    form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
  }

  /* Acepta 10 dígitos nacionales; ignora espacios, guiones y paréntesis. */
  function telefonoValido(v) {
    return /^\d{10}$/.test(String(v).replace(/[\s()+-]/g, '').replace(/^52/, ''));
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    limpiarErrores();

    var datos = {
      nombre: form.elements.nombre.value.trim(),
      correo: form.elements.correo.value.trim(),
      telefono: form.elements.telefono.value.trim(),
      carrera: form.elements.carrera.value.trim(),
    };

    var primerError = null;
    if (datos.nombre.length < 3) {
      mostrarError('nombre', 'Escribe el nombre completo del alumno.');
      primerError = primerError || 'nombre';
    }
    if (!window.VicUI.validarCorreo(datos.correo)) {
      mostrarError('correo', 'Escribe un correo válido, por ejemplo nombre@dominio.com');
      primerError = primerError || 'correo';
    }
    if (!telefonoValido(datos.telefono)) {
      mostrarError('telefono', 'Escribe tu WhatsApp a 10 dígitos, por ejemplo 55 1234 5678.');
      primerError = primerError || 'telefono';
    }
    if (!form.elements.acepto.checked) {
      mostrarError('acepto', 'Necesitamos que aceptes el aviso de privacidad para continuar.');
      primerError = primerError || 'acepto';
    }

    if (primerError) {
      form.elements[primerError].focus();
      return;
    }

    datos.productoId = producto.id;
    datos.productoNombre = producto.nombre;
    datos.monto = producto.precio;

    window.VictoriaAPI.guardarBorrador(datos).then(function () {
      location.href = 'pago.html';
    });
  });
})();
