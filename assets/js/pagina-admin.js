/* ==========================================================================
   VictoriaEDU — Panel interno (mockup)
   Réplica de la pantalla desde la que hoy validamos pagos a mano. Sirve como
   especificación visual del módulo de admin que irá dentro de la plataforma.
   ========================================================================== */

(function () {
  'use strict';

  var esc = window.VicUI.escapar;
  var API = window.VictoriaAPI;

  var filtroActivo = 'todos';
  var textoBusqueda = '';

  /* --- Compuerta ---------------------------------------------------------- */
  var LLAVE_SESION = 'vic.admin.abierto';

  function abrirPanel() {
    document.getElementById('compuerta').classList.add('vic-hidden');
    document.getElementById('panel').classList.remove('vic-hidden');
    refrescar();
  }

  if (sessionStorage.getItem(LLAVE_SESION) === '1') abrirPanel();

  document.getElementById('formClave').addEventListener('submit', function (e) {
    e.preventDefault();
    var form = e.target;
    var err = form.querySelector('[data-error]');
    if (form.elements.clave.value !== window.CONFIG.admin.clave) {
      err.textContent = 'Clave incorrecta.';
      err.classList.remove('vic-hidden');
      form.elements.clave.select();
      return;
    }
    sessionStorage.setItem(LLAVE_SESION, '1');
    abrirPanel();
  });

  /* --- Métricas ----------------------------------------------------------- */
  function pintarMetricas(pedidos) {
    var porRevisar = pedidos.filter(function (p) { return p.estado === 'comprobante_recibido'; });
    var pagados = pedidos.filter(function (p) { return p.estado === 'pagado'; });
    var pendientes = pedidos.filter(function (p) { return p.estado === 'pendiente_pago'; });
    var ingresos = pagados.reduce(function (s, p) { return s + p.monto; }, 0);

    var tarjetas = [
      { num: porRevisar.length, label: 'esperando tu revisión', alerta: porRevisar.length > 0 },
      { num: pendientes.length, label: 'sin transferir todavía' },
      { num: pagados.length, label: 'pagos validados' },
      { num: window.formatoMXN(ingresos), label: 'ingresos confirmados' },
    ];

    document.getElementById('metricas').innerHTML = tarjetas.map(function (t) {
      return '<div class="vic-stat"' + (t.alerta ? ' style="border-color:var(--vic-warning);background:var(--vic-warning-soft)"' : '') + '>' +
        '<div class="vic-stat__num"' + (t.alerta ? ' style="color:var(--vic-warning-text)"' : '') + '>' + esc(t.num) + '</div>' +
        '<div class="vic-stat__label">' + esc(t.label) + '</div>' +
      '</div>';
    }).join('');
  }

  /* --- Tabla de pedidos ---------------------------------------------------- */
  function pintarTabla(pedidos) {
    var lista = pedidos.filter(function (p) {
      if (filtroActivo !== 'todos' && p.estado !== filtroActivo) return false;
      if (!textoBusqueda) return true;
      var b = textoBusqueda.toLowerCase();
      return (p.folio + ' ' + p.nombre + ' ' + p.correo).toLowerCase().indexOf(b) !== -1;
    });

    var tbody = document.getElementById('tabla');

    if (!lista.length) {
      tbody.innerHTML =
        '<tr><td colspan="8" style="text-align:center;padding:48px 16px;color:var(--vic-text-muted)">' +
          'No hay pedidos con este filtro.' +
        '</td></tr>';
      return;
    }

    tbody.innerHTML = lista.map(function (p) {
      var e = API.ESTADOS[p.estado] || API.ESTADOS.pendiente_pago;

      var comprobante = p.comprobante
        ? (p.comprobante.dataUrl
            ? '<button class="vic-copy" type="button" data-ver="' + esc(p.folio) + '">Ver</button>'
            : '<span class="vic-hint">' + esc(p.comprobante.nombre) + '</span>')
        : '<span class="vic-hint">—</span>';

      // Solo tiene sentido aprobar/rechazar lo que aún no está resuelto.
      var acciones = (p.estado === 'comprobante_recibido' || p.estado === 'pendiente_pago')
        ? '<div class="vic-acciones">' +
            '<button class="vic-btn vic-btn--primary vic-btn--sm" data-aprobar="' + esc(p.folio) + '">Aprobar</button>' +
            '<button class="vic-btn vic-btn--ghost vic-btn--sm" data-rechazar="' + esc(p.folio) + '" style="color:var(--vic-danger-text)">Rechazar</button>' +
          '</div>'
        : '<button class="vic-btn vic-btn--ghost vic-btn--sm" data-reabrir="' + esc(p.folio) + '">Reabrir</button>';

      var whats = '<a class="vic-copy" style="text-decoration:none;display:inline-block" target="_blank" rel="noopener" href="' +
        esc(window.VicUI.enlaceWhatsApp('Hola ' + p.nombre.split(' ')[0] + ', te escribimos de VictoriaEDU sobre tu folio ' + p.folio + '.')) +
        '">WhatsApp</a>';

      return '<tr>' +
        '<td><span class="vic-mono" style="font-weight:700;color:var(--vic-azul-profundo)">' + esc(p.folio) + '</span></td>' +
        '<td><div style="font-weight:600;color:var(--vic-text-strong)">' + esc(p.nombre) + '</div>' +
            '<div class="vic-hint">' + esc(p.correo) + '</div>' +
            '<div class="vic-hint">' + esc(p.telefono) + ' ' + whats + '</div></td>' +
        '<td>' + esc(p.productoNombre) + (p.carrera ? '<div class="vic-hint">' + esc(p.carrera) + '</div>' : '') + '</td>' +
        '<td class="vic-mono">' + window.formatoMXN(p.monto) + '</td>' +
        '<td>' + comprobante + '</td>' +
        '<td><span class="vic-badge ' + e.clase + '">' + e.texto + '</span>' +
            (p.nota ? '<div class="vic-hint" style="margin-top:6px;max-width:180px">' + esc(p.nota) + '</div>' : '') + '</td>' +
        '<td class="vic-hint" style="white-space:nowrap">' + window.VicUI.fechaLegible(p.creado) + '</td>' +
        '<td>' + acciones + '</td>' +
      '</tr>';
    }).join('');
  }

  /* --- Lista de espera ----------------------------------------------------- */
  function pintarLeads(leads) {
    document.getElementById('conteoLeads').textContent =
      leads.length + (leads.length === 1 ? ' correo capturado' : ' correos capturados');

    var tbody = document.getElementById('tablaLeads');
    if (!leads.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px 16px;color:var(--vic-text-muted)">Todavía no hay registros.</td></tr>';
      return;
    }
    tbody.innerHTML = leads.map(function (l) {
      return '<tr>' +
        '<td style="font-weight:600;color:var(--vic-text-strong)">' + esc(l.correo) + '</td>' +
        '<td>' + esc(l.nombre || '—') + '</td>' +
        '<td>' + esc(l.telefono || '—') + '</td>' +
        '<td>' + esc(l.productoNombre || 'Diagnóstico gratuito') + '</td>' +
        '<td><span class="vic-badge vic-badge--neutral">' + esc(l.origen) + '</span></td>' +
        '<td class="vic-hint" style="white-space:nowrap">' + window.VicUI.fechaLegible(l.creado) + '</td>' +
      '</tr>';
    }).join('');
  }

  /* --- Refresco global ----------------------------------------------------- */
  function refrescar() {
    return Promise.all([API.listarPedidos(), API.listarLeads()]).then(function (r) {
      pintarMetricas(r[0]);
      pintarTabla(r[0]);
      pintarLeads(r[1]);
    });
  }

  /* --- Filtros y búsqueda -------------------------------------------------- */
  document.getElementById('filtros').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-filtro]');
    if (!btn) return;
    filtroActivo = btn.getAttribute('data-filtro');
    this.querySelectorAll('[data-filtro]').forEach(function (b) {
      b.className = 'vic-btn vic-btn--sm ' + (b === btn ? 'vic-btn--secondary' : 'vic-btn--ghost');
    });
    refrescar();
  });

  var timerBusqueda;
  document.getElementById('busqueda').addEventListener('input', function (e) {
    textoBusqueda = e.target.value.trim();
    clearTimeout(timerBusqueda);
    timerBusqueda = setTimeout(refrescar, 160);
  });

  /* --- Acciones sobre pedidos ---------------------------------------------- */
  document.getElementById('panel').addEventListener('click', function (e) {
    var aprobar = e.target.closest('[data-aprobar]');
    var rechazar = e.target.closest('[data-rechazar]');
    var reabrir = e.target.closest('[data-reabrir]');
    var ver = e.target.closest('[data-ver]');

    if (aprobar) {
      var folioA = aprobar.getAttribute('data-aprobar');
      API.actualizarEstado(folioA, 'pagado', '').then(function () {
        window.VicUI.toast('Pago validado · ' + folioA);
        refrescar();
      });
    }

    if (rechazar) {
      var folioR = rechazar.getAttribute('data-rechazar');
      var motivo = prompt('¿Por qué se rechaza ' + folioR + '?\n(Se guarda como nota interna.)', '');
      if (motivo === null) return;
      API.actualizarEstado(folioR, 'rechazado', motivo).then(function () {
        window.VicUI.toast('Pedido rechazado · ' + folioR);
        refrescar();
      });
    }

    if (reabrir) {
      var folioB = reabrir.getAttribute('data-reabrir');
      API.actualizarEstado(folioB, 'comprobante_recibido', '').then(function () {
        window.VicUI.toast('Pedido reabierto · ' + folioB);
        refrescar();
      });
    }

    if (ver) {
      API.obtenerPedido(ver.getAttribute('data-ver')).then(function (p) {
        if (!p || !p.comprobante || !p.comprobante.dataUrl) return;
        var overlay = document.createElement('div');
        overlay.className = 'vic-modal';
        overlay.innerHTML =
          '<div class="vic-modal__caja" style="max-width:560px">' +
            '<button class="vic-modal__cerrar" type="button" aria-label="Cerrar">✕</button>' +
            '<h3 style="font-size:20px;margin:0 0 4px">Comprobante ' + esc(p.folio) + '</h3>' +
            '<p class="vic-hint" style="margin:0 0 18px">' + esc(p.nombre) + ' · ' + window.formatoMXN(p.monto) + '</p>' +
            '<img src="' + p.comprobante.dataUrl + '" alt="Comprobante de pago" style="width:100%;border-radius:8px;display:block">' +
          '</div>';
        document.body.appendChild(overlay);
        var cerrar = function () { overlay.remove(); };
        overlay.querySelector('.vic-modal__cerrar').addEventListener('click', cerrar);
        overlay.addEventListener('click', function (ev) { if (ev.target === overlay) cerrar(); });
      });
    }
  });

  /* --- Utilidades del demo -------------------------------------------------- */
  document.getElementById('btnSembrar').addEventListener('click', function () {
    API.sembrarEjemplos().then(function () {
      window.VicUI.toast('Datos de ejemplo cargados');
      refrescar();
    });
  });

  document.getElementById('btnReiniciar').addEventListener('click', function () {
    if (!confirm('Esto borra todos los pedidos y correos guardados en este navegador. ¿Continuar?')) return;
    API.reiniciar().then(function () {
      window.VicUI.toast('Todo borrado');
      refrescar();
    });
  });
})();
