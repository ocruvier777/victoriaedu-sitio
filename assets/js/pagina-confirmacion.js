/* ==========================================================================
   VictoriaEDU — Paso 3: confirmación
   Muestra el folio, los datos para transferir, la carga del comprobante y el
   botón de WhatsApp prellenado. Es la pantalla que sostiene la operación
   manual mientras Mercado Pago no está conectado.
   ========================================================================== */

(function () {
  'use strict';

  var esc = window.VicUI.escapar;
  var C = window.CONFIG;
  var host = document.getElementById('contenido');

  var folio = window.VicUI.parametro('folio') || window.VictoriaAPI.folioActual();

  if (!folio) { pintarNoEncontrado(); return; }

  window.VictoriaAPI.obtenerPedido(folio).then(function (pedido) {
    if (!pedido) { pintarNoEncontrado(); return; }
    pintar(pedido);
  });

  /* ---------------------------------------------------------------------- */

  function pintarNoEncontrado() {
    host.innerHTML =
      '<div class="vic-container--narrow" style="margin:0 auto">' +
        '<div class="vic-note vic-note--warning">' +
          '<strong>No encontramos ese folio.</strong><br>' +
          'Puede que el pedido se haya hecho en otro navegador o dispositivo. Escríbenos por WhatsApp con tu folio y lo buscamos.' +
        '</div>' +
        '<div class="vic-row" style="margin-top:22px">' +
          '<a class="vic-btn vic-btn--primary vic-btn--md" href="' +
            window.VicUI.enlaceWhatsApp('Hola, no encuentro mi folio de compra del Simulacro IPN 2026.') +
            '" target="_blank" rel="noopener">Escribir por WhatsApp</a>' +
          '<a class="vic-btn vic-btn--ghost vic-btn--md" href="tienda.html">Ver programas</a>' +
        '</div>' +
      '</div>';
  }

  function pintar(pedido) {
    var estado = window.VictoriaAPI.ESTADOS[pedido.estado] || window.VictoriaAPI.ESTADOS.pendiente_pago;

    var filas = [
      ['Beneficiario', C.banco.beneficiario],
      ['Banco', C.banco.institucion],
      ['CLABE interbancaria', C.banco.clabe],
      ['Monto exacto', window.formatoMXN(pedido.monto)],
      ['Concepto / referencia', pedido.folio],
    ];

    host.innerHTML =
      '<div class="vic-confirm">' +

        /* ---------- Columna principal ---------- */
        '<div>' +
          '<div class="vic-row" style="gap:14px;margin-bottom:18px">' +
            '<span class="vic-badge ' + estado.clase + '" id="estadoBadge">' + estado.texto + '</span>' +
            '<span class="vic-hint">Pedido creado el ' + window.VicUI.fechaLegible(pedido.creado) + '</span>' +
          '</div>' +

          '<h1 style="font-size:clamp(28px,3.2vw,38px);line-height:1.1;margin:0 0 12px">Ya casi. Falta tu transferencia.</h1>' +
          '<p class="vic-lead" style="margin:0 0 28px;max-width:56ch">Guarda este folio: es la referencia que nos permite reconocer tu pago y liberar tu acceso sin preguntarte nada.</p>' +

          '<div class="vic-row" style="gap:14px;margin-bottom:36px">' +
            '<span class="vic-folio">' + esc(pedido.folio) + '</span>' +
            '<button class="vic-copy" type="button" data-copiar="' + esc(pedido.folio) + '" style="padding:10px 14px;font-size:13px">Copiar folio</button>' +
          '</div>' +

          /* Paso A — transferir */
          '<div class="vic-card" style="margin-bottom:20px">' +
            '<div class="vic-row" style="gap:12px;margin-bottom:16px">' +
              '<span class="vic-paso__num" style="width:32px;height:32px;font-size:15px">1</span>' +
              '<h2 style="font-size:20px;margin:0">Haz la transferencia</h2>' +
            '</div>' +
            '<div class="vic-bank">' +
              filas.map(function (f) {
                var esFolio = f[0].indexOf('Concepto') === 0;
                return '<div class="vic-bank__row"' + (esFolio ? ' style="background:var(--vic-primary-softer);border-color:var(--vic-azul)"' : '') + '>' +
                  '<div style="min-width:0">' +
                    '<div class="vic-bank__key">' + esc(f[0]) + '</div>' +
                    '<div class="vic-bank__val">' + esc(f[1]) + '</div>' +
                  '</div>' +
                  '<button class="vic-copy" type="button" data-copiar="' + esc(f[1]) + '">Copiar</button>' +
                '</div>';
              }).join('') +
            '</div>' +
            '<div class="vic-note vic-note--warning" style="margin-top:18px;font-size:14px">' +
              '<strong>Escribe tu folio en el concepto.</strong> Si tu banco no deja poner concepto, no pasa nada: mándanoslo por WhatsApp en el paso 3.' +
            '</div>' +
          '</div>' +

          /* Paso B — comprobante */
          '<div class="vic-card" style="margin-bottom:20px">' +
            '<div class="vic-row" style="gap:12px;margin-bottom:16px">' +
              '<span class="vic-paso__num" style="width:32px;height:32px;font-size:15px">2</span>' +
              '<h2 style="font-size:20px;margin:0">Sube tu comprobante</h2>' +
            '</div>' +
            '<div id="zonaComprobante"></div>' +
          '</div>' +

          /* Paso C — avisar */
          '<div class="vic-card">' +
            '<div class="vic-row" style="gap:12px;margin-bottom:16px">' +
              '<span class="vic-paso__num" style="width:32px;height:32px;font-size:15px;background:var(--vic-burdeos)">3</span>' +
              '<h2 style="font-size:20px;margin:0">Avísanos por WhatsApp</h2>' +
            '</div>' +
            '<p style="font-size:15px;line-height:1.6;margin:0 0 20px">Este botón abre WhatsApp con tu folio y tus datos ya escritos. Es la vía más rápida: validamos y te liberamos el acceso el mismo día.</p>' +
            '<a class="vic-btn vic-btn--primary vic-btn--xl vic-btn--block" id="btnWhats" href="' +
              esc(window.VicUI.enlaceWhatsApp(window.VicUI.mensajePedido(pedido))) +
              '" target="_blank" rel="noopener">Avisar por WhatsApp</a>' +
            '<p class="vic-hint" style="margin:14px 0 0;text-align:center">O escríbenos a <a href="mailto:' + C.marca.correo + '?subject=' + encodeURIComponent('Comprobante ' + pedido.folio) + '">' + C.marca.correo + '</a></p>' +
          '</div>' +
        '</div>' +

        /* ---------- Columna lateral ---------- */
        '<aside>' +
          '<div class="vic-card vic-summary">' +
            '<h2 style="font-size:18px;margin:0 0 18px">Tu pedido</h2>' +
            '<div style="padding-bottom:16px;border-bottom:1px solid var(--vic-border)">' +
              '<div style="font-weight:700;color:var(--vic-azul-profundo);font-size:16px;line-height:1.3">' + esc(pedido.productoNombre) + '</div>' +
              '<div class="vic-hint" style="margin-top:4px">Folio ' + esc(pedido.folio) + '</div>' +
            '</div>' +
            '<div style="padding:16px 0;border-bottom:1px solid var(--vic-border);font-size:15px;line-height:1.6">' +
              '<div style="font-weight:600;color:var(--vic-text-strong)">' + esc(pedido.nombre) + '</div>' +
              '<div class="vic-muted">' + esc(pedido.correo) + '</div>' +
              '<div class="vic-muted">' + esc(pedido.telefono) + '</div>' +
            '</div>' +
            '<div class="vic-summary__total">' +
              '<span class="vic-muted">Total</span><strong>' + window.formatoMXN(pedido.monto) + '</strong>' +
            '</div>' +
            '<div class="vic-note vic-note--info" style="margin-top:22px;font-size:14px;padding:16px 18px">' +
              '<strong>¿Qué sigue?</strong> Revisamos las transferencias durante el día. En cuanto validamos la tuya te llega el correo con tu liga de acceso a <strong>' + esc(pedido.correo) + '</strong>.' +
            '</div>' +
          '</div>' +
        '</aside>' +
      '</div>';

    montarComprobante(pedido);
  }

  /* --- Carga del comprobante ---------------------------------------------- */
  function montarComprobante(pedido) {
    var zona = document.getElementById('zonaComprobante');

    if (pedido.comprobante) { pintarComprobanteCargado(zona, pedido); return; }

    zona.innerHTML =
      '<label class="vic-drop" id="drop">' +
        '<input type="file" id="archivo" accept="image/*,application/pdf" class="vic-sr-only">' +
        '<div style="font-size:34px;line-height:1;margin-bottom:12px">📄</div>' +
        '<div style="font-size:16px;font-weight:600;color:var(--vic-azul-profundo);margin-bottom:6px">Arrastra tu comprobante o toca para elegirlo</div>' +
        '<div class="vic-hint">Captura de pantalla o PDF de tu banco. Máximo 8 MB.</div>' +
      '</label>' +
      '<div class="vic-error vic-hidden" id="errArchivo" style="margin-top:12px"></div>';

    var drop = document.getElementById('drop');
    var input = document.getElementById('archivo');
    var err = document.getElementById('errArchivo');

    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('vic-drop--over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('vic-drop--over'); });
    });
    drop.addEventListener('drop', function (e) {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) procesar(e.dataTransfer.files[0]);
    });
    input.addEventListener('change', function () {
      if (input.files && input.files[0]) procesar(input.files[0]);
    });

    function procesar(file) {
      err.classList.add('vic-hidden');

      if (file.size > 8 * 1024 * 1024) {
        err.textContent = 'El archivo pesa más de 8 MB. Manda una captura en lugar del PDF completo.';
        err.classList.remove('vic-hidden');
        return;
      }
      var tipoOk = file.type.startsWith('image/') || file.type === 'application/pdf';
      if (!tipoOk) {
        err.textContent = 'Solo aceptamos imágenes (JPG, PNG) o PDF.';
        err.classList.remove('vic-hidden');
        return;
      }

      drop.innerHTML = '<div class="vic-hint">Subiendo…</div>';

      window.VictoriaAPI.adjuntarComprobante(pedido.folio, file).then(function (actualizado) {
        pintarComprobanteCargado(zona, actualizado);
        var badge = document.getElementById('estadoBadge');
        var e = window.VictoriaAPI.ESTADOS[actualizado.estado];
        if (badge && e) { badge.className = 'vic-badge ' + e.clase; badge.textContent = e.texto; }
        window.VicUI.toast('Comprobante recibido');
        // El aviso por WhatsApp es lo que realmente dispara la revisión.
        var btn = document.getElementById('btnWhats');
        if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }).catch(function (e) {
        console.error(e);
        montarComprobante(pedido);
        err.textContent = 'No se pudo procesar el archivo. Intenta con una captura de pantalla.';
        err.classList.remove('vic-hidden');
      });
    }
  }

  function pintarComprobanteCargado(zona, pedido) {
    var c = pedido.comprobante;
    zona.innerHTML =
      '<div class="vic-drop vic-drop--filled" style="cursor:default">' +
        (c.dataUrl
          ? '<img src="' + c.dataUrl + '" alt="Comprobante de pago" style="max-height:220px;border-radius:8px;display:block;margin:0 auto 14px">'
          : '<div style="font-size:34px;line-height:1;margin-bottom:12px">✓</div>') +
        '<div style="font-size:16px;font-weight:600;color:var(--vic-success-text);margin-bottom:6px">Comprobante recibido</div>' +
        '<div class="vic-hint">' + esc(c.nombre) + ' · subido el ' + window.VicUI.fechaLegible(c.subido) + '</div>' +
        '<button class="vic-btn vic-btn--ghost vic-btn--sm" type="button" id="cambiarComp" style="margin-top:14px">Cambiar comprobante</button>' +
      '</div>';

    document.getElementById('cambiarComp').addEventListener('click', function () {
      pedido.comprobante = null;
      montarComprobante(pedido);
    });
  }
})();
