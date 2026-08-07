/* ==========================================================================
   VictoriaEDU — Guía del examen del IPN
   Todo lo que se pinta aquí sale de CONFIG (examen, convocatoria) y de los
   datos de cortes, para que actualizar un año no signifique tocar el HTML.
   ========================================================================== */

(function () {
  'use strict';

  var C = window.CONFIG;
  var esc = window.VicUI.escapar;
  var D = window.CORTES_IPN;

  /* --- Ficha rápida del examen -------------------------------------------- */
  (function ficha() {
    var host = document.getElementById('fichaExamen');
    if (!host) return;
    var e = C.examen;
    var segundos = Math.round(e.horas * 3600 / e.reactivos);

    var datos = [
      { n: e.reactivos, l: 'reactivos de opción múltiple' },
      { n: e.horas + ' h', l: 'de tiempo máximo efectivo' },
      { n: segundos + ' s', l: 'por pregunta, si las contestas todas' },
      { n: e.incluyeIngles ? 'Sí' : 'No', l: 'incluye sección de inglés' },
    ];
    host.innerHTML = datos.map(function (d) {
      return '<div class="vic-glass" style="padding:22px">' +
        '<div style="font-family:var(--vic-font-display);font-size:38px;font-weight:700;line-height:1;color:#fff" data-contador="' + esc(d.n) + '">' + esc(d.n) + '</div>' +
        '<div style="font-size:14px;line-height:1.4;color:rgba(255,255,255,.7);margin-top:8px">' + esc(d.l) + '</div>' +
      '</div>';
    }).join('');
  })();

  /* --- Áreas de conocimiento ----------------------------------------------
     El conteo de carreras y el rango de cortes salen de los datos reales,
     no de números escritos a mano que se quedan viejos.
  ------------------------------------------------------------------------ */
  (function areas() {
    var host = document.getElementById('areasGrid');
    if (!host || !D) return;

    var ejemplos = {
      ifm: 'Ingenierías, arquitectura, ciencias de datos, física y matemáticas.',
      cmb: 'Medicina, odontología, enfermería, nutrición, biología y químicos.',
      csa: 'Administración, contaduría, negocios, economía, turismo y trabajo social.',
    };
    var iconos = { ifm: 'ingenieria', cmb: 'verificado', csa: 'datos' };

    host.innerHTML = Object.keys(D.areas).map(function (k) {
      var lista = D.lista.filter(function (r) { return r.area === k; });
      var cortes = lista.map(function (r) { return r.c1; });
      var min = Math.min.apply(null, cortes), max = Math.max.apply(null, cortes);
      var alto = lista.reduce(function (a, b) { return b.c1 > a.c1 ? b : a; });

      return '<div class="vic-card vic-card--hoverable">' +
        '<span class="vic-icono" data-icono="' + iconos[k] + '" style="margin-bottom:16px"></span>' +
        '<h3 style="font-size:20px;margin:0 0 10px;line-height:1.25">' + esc(D.areas[k]) + '</h3>' +
        '<p style="font-size:15px;line-height:1.6;margin:0 0 18px">' + esc(ejemplos[k]) + '</p>' +
        '<div class="vic-stack" style="gap:8px;padding-top:16px;border-top:1px solid var(--vic-border);font-size:14px">' +
          '<div class="vic-spread"><span class="vic-muted">Carreras con datos</span><strong style="color:var(--vic-azul-profundo)">' + lista.length + '</strong></div>' +
          '<div class="vic-spread"><span class="vic-muted">Rango de cortes</span><strong style="color:var(--vic-azul-profundo)">' + min + ' – ' + max + '</strong></div>' +
          '<div class="vic-spread" style="gap:12px"><span class="vic-muted">La más demandada</span><span style="text-align:right;color:var(--vic-text-strong);font-weight:600">' + esc(alto.carrera) + '</span></div>' +
        '</div>' +
      '</div>';
    }).join('');
  })();

  /* --- Equipo necesario ---------------------------------------------------- */
  (function equipo() {
    var host = document.getElementById('listaEquipo');
    if (!host) return;
    host.innerHTML = C.convocatoria.equipo.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('');
  })();

  /* --- Resumen de la segunda vuelta ---------------------------------------- */
  (function segunda() {
    var host = document.getElementById('resumenSegunda');
    if (!host) return;
    var v = C.convocatoria;
    var parse = function (s) {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
      return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(s);
    };
    var fmt = function (s) {
      return parse(s).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    };
    var abierto = new Date() <= parse(v.prerregistroCierre);
    host.innerHTML = 'Es la segunda oportunidad del mismo ciclo, para quienes no quedaron en la primera. ' +
      (abierto
        ? 'Ahora mismo el prerregistro está <strong>abierto</strong> y cierra el ' + fmt(v.prerregistroCierre) + '.'
        : 'El prerregistro de este ciclo cerró el ' + fmt(v.prerregistroCierre) + '; los resultados salen el ' + fmt(v.resultados) + '.');
  })();

  /* --- Fuente -------------------------------------------------------------- */
  (function fuente() {
    var host = document.getElementById('fuenteIPN');
    if (!host) return;
    host.innerHTML = 'Datos verificados contra la convocatoria oficial del IPN, Nivel Superior modalidad escolarizada · ' +
      '<a href="' + esc(C.convocatoria.urlPortal) + '" target="_blank" rel="noopener" style="color:rgba(255,255,255,.85)">admision.ipn.mx</a>. ' +
      'El IPN puede modificar requisitos y fechas: verifica siempre en el portal oficial antes de tomar una decisión.';
  })();
})();
