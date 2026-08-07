/* ==========================================================================
   VictoriaEDU — Paso 2 del checkout: método de pago
   Aquí nace el pedido con su folio. Mientras Mercado Pago no esté conectado,
   el único método habilitado es transferencia SPEI con validación manual.
   ========================================================================== */

(function () {
  'use strict';

  var esc = window.VicUI.escapar;
  var C = window.CONFIG;

  /* --- Recuperar el borrador ---------------------------------------------- */
  window.VictoriaAPI.obtenerBorrador().then(function (b) {
    // Sin datos del paso 1 no hay nada que cobrar: regresamos al inicio del flujo.
    if (!b || !b.correo || !b.productoId) {
      location.replace('checkout.html');
      return;
    }
    arrancar(b);
  });

  function arrancar(b) {
    var producto = window.getProducto(b.productoId);
    if (!producto) { location.replace('tienda.html'); return; }

    /* --- Resumen ---------------------------------------------------------- */
    document.getElementById('resumenPago').innerHTML =
      '<div style="padding-bottom:16px;border-bottom:1px solid var(--vic-border)">' +
        '<div style="font-weight:700;color:var(--vic-azul-profundo);font-size:16px;line-height:1.3">' + esc(producto.nombre) + '</div>' +
        '<div class="vic-hint" style="margin-top:4px">' + esc(producto.meta) + '</div>' +
      '</div>' +
      '<div style="padding:16px 0;border-bottom:1px solid var(--vic-border)">' +
        '<div class="vic-hint" style="text-transform:uppercase;letter-spacing:.06em;font-size:11px;font-weight:700;margin-bottom:10px">A nombre de</div>' +
        '<div style="font-size:15px;line-height:1.6">' +
          '<div style="font-weight:600;color:var(--vic-text-strong)">' + esc(b.nombre) + '</div>' +
          '<div class="vic-muted">' + esc(b.correo) + '</div>' +
          '<div class="vic-muted">' + esc(b.telefono) + '</div>' +
          (b.carrera ? '<div class="vic-muted">' + esc(b.carrera) + '</div>' : '') +
        '</div>' +
      '</div>' +
      '<div class="vic-summary__total">' +
        '<span class="vic-muted">Total a pagar</span><strong>' + window.formatoMXN(producto.precio) + '</strong>' +
      '</div>';

    /* --- Datos bancarios --------------------------------------------------- */
    var filas = [
      ['Beneficiario', C.banco.beneficiario],
      ['Banco', C.banco.institucion],
      ['CLABE interbancaria', C.banco.clabe],
      ['Monto exacto', window.formatoMXN(producto.precio)],
    ];
    document.getElementById('datosBanco').innerHTML = filas.map(function (f) {
      return '<div class="vic-bank__row">' +
        '<div style="min-width:0">' +
          '<div class="vic-bank__key">' + esc(f[0]) + '</div>' +
          '<div class="vic-bank__val">' + esc(f[1]) + '</div>' +
        '</div>' +
        '<button class="vic-copy" type="button" data-copiar="' + esc(f[1]) + '">Copiar</button>' +
      '</div>';
    }).join('');

    /* --- Mercado Pago: se habilita solo cuando exista back ----------------- */
    if (C.pagos.mercadopago.activo) {
      var card = document.getElementById('mpCard');
      card.classList.remove('vic-radio-card--disabled');
      card.querySelector('input').disabled = false;
      card.querySelector('.vic-badge').className = 'vic-badge vic-badge--success';
      card.querySelector('.vic-badge').textContent = 'Disponible';
    }

    /* --- Mostrar/ocultar instrucciones según el método --------------------- */
    var form = document.getElementById('formPago');
    var bloqueSpei = document.getElementById('bloqueSpei');
    form.addEventListener('change', function () {
      var metodo = form.elements.metodo.value;
      bloqueSpei.classList.toggle('vic-hidden', metodo !== 'transferencia');
      document.getElementById('btnGenerar').textContent =
        metodo === 'transferencia' ? 'Generar mi folio →' : 'Ir a pagar →';
    });

    /* --- Crear el pedido --------------------------------------------------- */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = document.getElementById('btnGenerar');
      btn.disabled = true;
      btn.textContent = 'Generando…';

      var metodo = form.elements.metodo.value;

      if (metodo === 'mercadopago') {
        // TODO(Brando): crear preferencia en el back y redirigir al checkout de MP.
        //   fetch(CONFIG.pagos.mercadopago.preferenceUrl, {...})
        //     .then(r => r.json()).then(p => location.href = p.init_point);
        window.VicUI.toast('Mercado Pago aún no está conectado');
        btn.disabled = false;
        btn.textContent = 'Ir a pagar →';
        return;
      }

      window.VictoriaAPI.crearPedido({
        productoId: producto.id,
        productoNombre: producto.nombre,
        nombre: b.nombre,
        correo: b.correo,
        telefono: b.telefono,
        carrera: b.carrera,
        metodoPago: metodo,
        monto: producto.precio,
      }).then(function (pedido) {
        return window.VictoriaAPI.limpiarBorrador().then(function () {
          location.href = 'confirmacion.html?folio=' + encodeURIComponent(pedido.folio);
        });
      }).catch(function (err) {
        console.error(err);
        window.VicUI.toast('No se pudo generar el folio. Intenta de nuevo.');
        btn.disabled = false;
        btn.textContent = 'Generar mi folio →';
      });
    });
  }
})();
