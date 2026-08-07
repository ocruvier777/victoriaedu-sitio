/* ==========================================================================
   VictoriaEDU — Mini gráfica de cortes
   Se monta sola en cualquier #miniCortes. Sigue las mismas reglas que la
   página completa: una sola serie, un solo hue, valor al extremo de la barra
   y escala sobre los 140 reactivos del examen real.
   ========================================================================== */

(function () {
  'use strict';

  var MAX = 140;   // reactivos del examen real (convocatoria oficial)

  /* Carreras que la gente reconoce por nombre — no las de corte más alto,
     que son de unidades foráneas y no le dicen nada a un aspirante de CDMX. */
  var DESTACADAS = [
    ['ESM', 'Médico Cirujano y Partero'],
    ['ESCOM', 'Ingeniería en Sistemas Computacionales'],
    ['ESIME Ticomán', 'Ingeniería Aeronáutica'],
    ['UPIICSA', 'Ingeniería Industrial'],
    ['ESIA Zacatenco', 'Ingeniería Civil'],
    ['ESIQIE', 'Ingeniería Química Industrial'],
  ];

  function montar() {
    var host = document.getElementById('miniCortes');
    if (!host || !window.CORTES_IPN || !window.VicUI) return;

    var esc = window.VicUI.escapar;

    var filas = DESTACADAS.map(function (d) {
      return window.CORTES_IPN.lista.find(function (r) {
        return r.escuela === d[0] && r.carrera === d[1];
      });
    }).filter(Boolean).sort(function (a, b) { return b.c1 - a.c1; });

    if (!filas.length) return;

    host.classList.add('vic-chart');
    host.innerHTML = filas.map(function (r) {
      var w = r.c1 / MAX * 100;
      var dentro = w > 82;
      return '<div class="vic-chart__fila">' +
        '<div class="vic-chart__etq">' +
          '<div class="vic-chart__carrera" title="' + esc(r.carrera) + '">' + esc(r.carrera) + '</div>' +
          '<div class="vic-chart__escuela">' + esc(r.escuela) + '</div>' +
        '</div>' +
        '<div class="vic-chart__plot">' +
          '<div class="vic-chart__fill" style="width:' + w + '%"></div>' +
          '<span class="vic-chart__valor' + (dentro ? ' vic-chart__valor--dentro' : '') + '" style="left:' +
            (dentro ? 'auto' : w + '%') + ';' + (dentro ? 'right:' + (100 - w) + '%' : '') + '">' + r.c1 + '</span>' +
        '</div>' +
      '</div>';
    }).join('') +
    '<div class="vic-chart__eje" style="margin-top:14px"><div></div>' +
      '<div class="vic-hint" style="font-size:12px">aciertos de corte en primera convocatoria, de ' + MAX + ' reactivos</div>' +
    '</div>';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
  else montar();
})();
