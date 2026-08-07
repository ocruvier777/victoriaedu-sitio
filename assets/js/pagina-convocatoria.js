/* ==========================================================================
   VictoriaEDU — Convocatoria de segunda vuelta
   La página se recalcula sola contra la fecha de hoy: si el prerregistro
   sigue abierto muestra la cuenta atrás, y si ya cerró lo dice y cambia el
   mensaje. Así no queda una página mintiendo por olvido.
   ========================================================================== */

(function () {
  'use strict';

  var C = window.CONFIG.convocatoria;
  var esc = window.VicUI.escapar;

  /* 'YYYY-MM-DD' se parsea como medianoche UTC y, al pasarlo a hora de México
     (UTC-6), retrocede un día: el 15 de julio se imprimiría como 14. Estas son
     fechas oficiales, así que se construyen en hora local a mano. */
  function parseFecha(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(v);
  }

  var fecha = function (iso) {
    return parseFecha(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  var hoy = new Date();
  var cierre = parseFecha(C.prerregistroCierre);
  var inicio = parseFecha(C.prerregistroInicio);
  var diasRestantes = Math.ceil((cierre - hoy) / 86400000);
  var abierto = hoy >= inicio && hoy <= cierre;

  /* --- Estado (banda del encabezado) -------------------------------------- */
  (function estado() {
    var host = document.getElementById('estadoConvocatoria');
    if (!host) return;

    if (abierto) {
      host.innerHTML =
        '<div class="vic-estado vic-estado--abierto">' +
          '<div>' +
            '<div class="vic-row" style="gap:10px;margin-bottom:8px">' +
              '<span class="vic-dot"></span>' +
              '<span style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7FE3B6">Prerregistro abierto</span>' +
            '</div>' +
            '<div style="font-family:var(--vic-font-display);font-size:clamp(24px,2.6vw,32px);font-weight:700;color:#fff;line-height:1.2">' +
              'Cierra el ' + fecha(C.prerregistroCierre) +
            '</div>' +
          '</div>' +
          '<div class="vic-estado__dias">' +
            '<div class="vic-estado__num" data-contador="' + diasRestantes + '">' + diasRestantes + '</div>' +
            '<div class="vic-estado__lbl">' + (diasRestantes === 1 ? 'día' : 'días') + ' para registrarte</div>' +
          '</div>' +
          '<a class="vic-btn vic-btn--primary vic-btn--lg" href="' + esc(C.urlPortal) + '" target="_blank" rel="noopener">Ir al registro oficial</a>' +
        '</div>';
    } else if (hoy > cierre) {
      host.innerHTML =
        '<div class="vic-estado vic-estado--cerrado">' +
          '<div>' +
            '<span style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.6)">Prerregistro cerrado</span>' +
            '<div style="font-family:var(--vic-font-display);font-size:clamp(22px,2.4vw,28px);font-weight:700;color:#fff;line-height:1.25;margin-top:8px">' +
              'Cerró el ' + fecha(C.prerregistroCierre) + '. Los resultados salen el ' + fecha(C.resultados) + '.' +
            '</div>' +
          '</div>' +
          '<a class="vic-btn vic-btn--secondary vic-btn--lg" href="' + esc(C.urlOficial) + '" target="_blank" rel="noopener">Ver la convocatoria</a>' +
        '</div>';
    } else {
      host.innerHTML =
        '<div class="vic-estado">' +
          '<div><span style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.6)">Próximamente</span>' +
          '<div style="font-family:var(--vic-font-display);font-size:clamp(22px,2.4vw,28px);font-weight:700;color:#fff;margin-top:8px">El prerregistro abre el ' + fecha(C.prerregistroInicio) + '</div></div>' +
        '</div>';
    }
  })();

  /* --- Línea de tiempo ----------------------------------------------------- */
  (function linea() {
    var host = document.getElementById('lineaTiempo');
    if (!host) return;

    var hitos = [
      { f: C.prerregistroInicio, t: 'Abre el prerregistro', d: 'Por etapas, según la primera letra de tu primer apellido.' },
      { f: C.prerregistroCierre, t: 'Cierra el prerregistro', d: 'Última fecha para quedar registrado. No hay prórroga.', clave: true },
      { f: null, t: 'Examen de admisión', d: 'Tu fecha y hora exactas vienen en tu Ficha de Examen. En línea, 140 preguntas, máximo tres horas.' },
      { f: C.resultados, t: 'Publicación de resultados', d: 'Se consultan en el portal de admisión del IPN.' },
      { f: null, t: 'Inicio de clases', d: 'Quienes resulten asignados empiezan en ' + C.inicioClases + '.' },
    ];

    host.className = 'vic-linea';
    host.innerHTML = hitos.map(function (h) {
      var pasado = h.f && parseFecha(h.f) < hoy;
      return '<div class="vic-linea__hito' + (pasado ? ' vic-linea__hito--pasado' : '') + (h.clave ? ' vic-linea__hito--clave' : '') + '">' +
        '<div class="vic-linea__punto"></div>' +
        '<div class="vic-linea__fecha">' + (h.f ? fecha(h.f) : 'Según tu ficha') + '</div>' +
        '<div class="vic-linea__titulo">' + esc(h.t) + '</div>' +
        '<div class="vic-linea__desc">' + esc(h.d) + '</div>' +
      '</div>';
    }).join('');
  })();

  /* --- Equipo necesario ---------------------------------------------------- */
  (function equipo() {
    var host = document.getElementById('listaEquipo');
    if (!host) return;
    host.innerHTML = C.equipo.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('');
  })();

  /* --- Fuente -------------------------------------------------------------- */
  (function fuente() {
    var host = document.getElementById('fuenteOficial');
    if (!host) return;
    host.innerHTML = 'Datos tomados de la convocatoria oficial del IPN, Nivel Superior modalidad escolarizada, periodo febrero–julio 2027 · ' +
      '<a href="' + esc(C.urlOficial) + '" target="_blank" rel="noopener" style="color:rgba(255,255,255,.85)">consultar la convocatoria</a>. ' +
      'Las fechas las fija el IPN y puede modificarlas: verifica siempre en el portal oficial antes de tomar una decisión.';
  })();

  /* --- Aviso de cambios ---------------------------------------------------- */
  var form = document.getElementById('formAviso');
  if (form) {
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
      window.VictoriaAPI.registrarLead({
        correo: correo,
        productoNombre: 'Avisos de la convocatoria',
        origen: 'convocatoria-segunda-vuelta',
      }).then(function () {
        form.classList.add('vic-hidden');
        document.getElementById('okAviso').classList.remove('vic-hidden');
      });
    });
  }
})();
