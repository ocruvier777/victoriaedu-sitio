/* ==========================================================================
   VictoriaEDU — Lista de espera (mockup)
   --------------------------------------------------------------------------
   Lo que había aquí administraba pagos: métricas de ingreso, filtros por
   estado, visor de comprobantes y botones de aprobar/rechazar. Todo eso vive
   ahora en la plataforma (/admin/pagos), con usuarios y permisos de verdad.

   Queda solo la lista de espera, que la plataforma no cubre.
   ========================================================================== */

(function () {
  'use strict';

  var esc = window.VicUI.escapar;
  var API = window.VictoriaAPI;

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

  /* --- Tabla -------------------------------------------------------------- */
  var ORIGENES = {
    'lista-espera': 'Lista de espera',
    'convocatoria-segunda-vuelta': 'Convocatoria',
  };

  function pintarLeads(leads) {
    var tbody = document.getElementById('tablaLeads');
    var conteo = document.getElementById('conteoLeads');

    conteo.textContent = leads.length === 1 ? '1 correo' : leads.length + ' correos';

    if (!leads.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px 0" class="vic-hint">' +
        'Nadie se ha apuntado todavía en este navegador.</td></tr>';
      return;
    }

    tbody.innerHTML = leads.map(function (l) {
      return '<tr>' +
        '<td class="vic-mono">' + esc(l.correo) + '</td>' +
        '<td>' + (esc(l.nombre) || '<span class="vic-hint">—</span>') + '</td>' +
        '<td>' + (esc(l.telefono) || '<span class="vic-hint">—</span>') + '</td>' +
        '<td>' + (esc(l.productoNombre) || '<span class="vic-hint">—</span>') + '</td>' +
        '<td>' + esc(ORIGENES[l.origen] || l.origen) + '</td>' +
        '<td>' + esc(window.VicUI.fechaLegible(l.creado)) + '</td>' +
      '</tr>';
    }).join('');
  }

  function refrescar() {
    return API.listarLeads().then(pintarLeads);
  }

  /* --- Acciones ----------------------------------------------------------- */
  /* Copiar los correos es la única razón práctica de que este panel exista:
     es cómo se arma el envío cuando por fin abre un producto. */
  document.getElementById('btnCopiar').addEventListener('click', function () {
    API.listarLeads().then(function (leads) {
      if (!leads.length) { window.VicUI.toast('No hay correos que copiar.'); return; }
      var texto = leads.map(function (l) { return l.correo; }).join(', ');
      navigator.clipboard.writeText(texto).then(function () {
        window.VicUI.toast(leads.length + ' correos copiados.');
      }, function () {
        window.VicUI.toast('No se pudieron copiar.');
      });
    });
  });

  document.getElementById('btnReiniciar').addEventListener('click', function () {
    if (!confirm('¿Borrar todos los correos guardados en este navegador? No se puede deshacer.')) return;
    API.reiniciar().then(refrescar);
  });
})();
