/* ==========================================================================
   VictoriaEDU — Cortes del IPN
   --------------------------------------------------------------------------
   Decisiones de visualización, para que no se "arreglen" por accidente:

   · Las carreras son categorías nominales, no una escala. Por eso TODAS las
     barras llevan el mismo azul: pintarlas por su valor re-codificaría en
     color lo que el largo de la barra ya dice, y gastaría el único canal libre.
   · 1ª vs 2ª convocatoria es un "antes → después por elemento": eso es un
     dumbbell de un solo hue en dos tonos, validados como rampa ordinal.
   · Cuando el alumno escribe su puntaje, lo que separa alcanzable de no
     alcanzable es la AGRUPACIÓN y una etiqueta de texto, no el color.
   · Todo valor está también en la vista de tabla: el tooltip nunca es la
     única forma de leer un dato.
   ========================================================================== */

(function () {
  'use strict';

  var D = window.CORTES_IPN;
  var esc = window.VicUI.escapar;

  var MAX = 140;                                   // reactivos del examen real
  var MARCAS = [0, 35, 70, 105, 140];              // marcas del eje
  var vista = 'corte';

  var $ = function (id) { return document.getElementById(id); };
  var pct = function (v) { return (v / MAX * 100); };

  /* --- Poblar filtros ----------------------------------------------------- */
  Object.keys(D.areas).forEach(function (k) {
    $('fArea').insertAdjacentHTML('beforeend', '<option value="' + k + '">' + esc(D.areas[k]) + '</option>');
  });
  D.escuelas.forEach(function (e) {
    $('fEscuela').insertAdjacentHTML('beforeend', '<option value="' + esc(e) + '">' + esc(e) + '</option>');
  });

  /* --- Estado ------------------------------------------------------------- */
  function filtros() {
    var p = parseInt($('fPuntaje').value, 10);
    return {
      area: $('fArea').value,
      escuela: $('fEscuela').value,
      busca: $('fBusca').value.trim().toLowerCase(),
      puntaje: (isNaN(p) || p < 0) ? null : Math.min(p, MAX),
    };
  }

  function filtrar(f) {
    return D.lista.filter(function (r) {
      if (f.area && r.area !== f.area) return false;
      if (f.escuela && r.escuela !== f.escuela) return false;
      if (f.busca && (r.carrera + ' ' + r.escuela).toLowerCase().indexOf(f.busca) === -1) return false;
      return true;
    }).sort(function (a, b) { return b.c1 - a.c1; });
  }

  /* --- KPIs (el titular va como cifra, no como gráfica) ------------------- */
  function pintarKPIs() {
    var c1 = D.lista.map(function (r) { return r.c1; }).sort(function (a, b) { return a - b; });
    var mediana = c1[Math.floor(c1.length / 2)];
    var con2 = D.lista.filter(function (r) { return r.c2 != null; });
    var bajan = con2.filter(function (r) { return r.c2 < r.c1; }).length;

    var tarjetas = [
      { n: D.lista.length, l: 'carreras de nivel superior' },
      { n: mediana, l: 'aciertos de corte, mediana' },
      { n: Math.max.apply(null, c1), l: 'el corte más alto registrado' },
      { n: bajan + ' de ' + con2.length, l: 'carreras donde la 2ª convocatoria pidió menos' },
    ];
    $('kpis').innerHTML = tarjetas.map(function (t) {
      return '<div class="vic-glass" style="padding:22px">' +
        '<div style="font-family:var(--vic-font-display);font-size:38px;font-weight:700;line-height:1;color:#fff" data-contador="' + esc(t.n) + '">' + esc(t.n) + '</div>' +
        '<div style="font-size:14px;line-height:1.4;color:rgba(255,255,255,.7);margin-top:8px">' + esc(t.l) + '</div>' +
      '</div>';
    }).join('');
  }

  /* --- Piezas compartidas -------------------------------------------------- */
  function rejilla() {
    return '<div class="vic-chart__rejilla">' + MARCAS.slice(1).map(function (m) {
      return '<span class="vic-chart__linea" style="left:' + pct(m) + '%"></span>';
    }).join('') + '</div>';
  }

  function eje() {
    return '<div class="vic-chart__eje"><div></div><div class="vic-chart__eje-marcas">' +
      MARCAS.map(function (m) {
        return '<span class="vic-chart__eje-marca" style="left:' + pct(m) + '%">' + m + '</span>';
      }).join('') +
      '</div></div>' +
      '<div class="vic-chart__eje" style="margin-top:0;padding-top:0;border:0"><div></div>' +
      '<div class="vic-hint" style="font-size:12px">aciertos, de ' + MAX + ' reactivos</div></div>';
  }

  function etiqueta(r) {
    return '<div class="vic-chart__etq">' +
      '<div class="vic-chart__carrera" title="' + esc(r.carrera) + '">' + esc(r.carrera) + '</div>' +
      '<div class="vic-chart__escuela">' + esc(r.escuela) + '</div>' +
    '</div>';
  }

  /* Una barra. El valor va al extremo; si la barra es tan larga que la
     etiqueta no cabe fuera, se mete dentro en blanco (nunca se recorta). */
  function barra(r, opts) {
    opts = opts || {};
    var w = pct(r.c1);
    var dentro = w > 82;
    var extra = opts.delta != null
      ? '<span class="vic-chart__delta" style="position:absolute;left:' + w + '%;top:50%;transform:translateY(-50%);padding-left:' + (dentro ? 8 : 44) + 'px">te faltan ' + opts.delta + '</span>'
      : '';
    return '<div class="vic-chart__plot">' + rejilla() +
      '<div class="vic-chart__fill' + (opts.apagado ? ' vic-chart__fill--apagado' : '') + '" style="width:' + w + '%"></div>' +
      '<span class="vic-chart__valor' + (dentro ? ' vic-chart__valor--dentro' : '') + '" style="left:' + (dentro ? 'auto' : w + '%') + ';' + (dentro ? 'right:' + (100 - w) + '%' : '') + '">' + r.c1 + '</span>' +
      extra + opts.ref + '</div>';
  }

  function lineaRef(p) {
    if (p == null) return '';
    return '<span class="vic-chart__ref" style="left:' + pct(p) + '%"></span>';
  }

  function fila(r, contenido) {
    return '<div class="vic-chart__fila" data-carrera="' + esc(r.carrera) + '" data-escuela="' + esc(r.escuela) +
           '" data-c1="' + r.c1 + '" data-c2="' + (r.c2 == null ? '' : r.c2) + '">' +
           etiqueta(r) + contenido + '</div>';
  }

  /* --- Vista 1: corte por carrera ----------------------------------------- */
  function vistaCorte(datos, f) {
    var ref = lineaRef(f.puntaje);

    if (f.puntaje == null) {
      return datos.map(function (r) { return fila(r, barra(r, { ref: ref })); }).join('') + eje();
    }

    // Con puntaje: la separación es por GRUPO y por texto, no por color.
    var alcanza = datos.filter(function (r) { return f.puntaje >= r.c1; });
    var falta = datos.filter(function (r) { return f.puntaje < r.c1; });

    // El globo va dentro de la MISMA rejilla que las barras; si no, su
    // porcentaje se mide contra otro ancho y queda desalineado de la línea.
    var etqRef = '<div class="vic-chart__eje" style="margin:0 0 10px;padding:0;border:0">' +
      '<div></div><div style="position:relative;height:24px">' +
      '<span class="vic-chart__ref-etq" style="left:' + pct(f.puntaje) + '%;top:2px">tu puntaje: ' + f.puntaje + '</span>' +
      '</div></div>';

    var bloque = function (titulo, icono, lista, conDelta) {
      if (!lista.length) return '';
      return '<div class="vic-chart__grupo">' +
        '<div class="vic-chart__grupo-tit"><span aria-hidden="true">' + icono + '</span>' + titulo + ' (' + lista.length + ')</div>' +
        lista.map(function (r) {
          return fila(r, barra(r, { ref: ref, apagado: conDelta, delta: conDelta ? (r.c1 - f.puntaje) : null }));
        }).join('') +
      '</div>';
    };

    return etqRef +
      bloque('Con ese puntaje habrías alcanzado', '✓', alcanza, false) +
      bloque('Te habrían faltado aciertos', '✕', falta, true) +
      (datos.length ? eje() : '');
  }

  /* --- Vista 2: dumbbell 1ª vs 2ª ----------------------------------------- */
  function vistaConvocatorias(datos) {
    var con2 = datos.filter(function (r) { return r.c2 != null; });
    if (!con2.length) {
      return '<div class="vic-chart__vacio">Ninguna de las carreras filtradas abrió segunda convocatoria.</div>';
    }
    return con2.map(function (r) {
      var a = Math.min(r.c1, r.c2), b = Math.max(r.c1, r.c2);
      return fila(r,
        '<div class="vic-chart__plot">' + rejilla() +
          '<span class="vic-chart__conector" style="left:' + pct(a) + '%;width:' + (pct(b) - pct(a)) + '%"></span>' +
          '<span class="vic-chart__punto vic-chart__punto--c2" style="left:' + pct(r.c2) + '%"></span>' +
          '<span class="vic-chart__punto vic-chart__punto--c1" style="left:' + pct(r.c1) + '%"></span>' +
          // +12px libra el radio del punto (5.5px) y su anillo, para que el
          // fondo opaco de la etiqueta no se coma medio punto.
          '<span class="vic-chart__valor" style="left:calc(' + pct(b) + '% + 12px)">' + r.c1 + ' → ' + r.c2 + '</span>' +
        '</div>');
    }).join('') + eje();
  }

  /* --- Vista 3: tabla (el gemelo accesible de las gráficas) --------------- */
  function vistaTabla(datos) {
    return '<div class="vic-table-wrap"><table class="vic-table" style="min-width:640px">' +
      '<thead><tr><th>Escuela</th><th>Carrera</th><th>Área</th><th style="text-align:right">1ª convocatoria</th><th style="text-align:right">2ª convocatoria</th></tr></thead><tbody>' +
      datos.map(function (r) {
        return '<tr>' +
          '<td style="font-weight:600;color:var(--vic-text-strong);white-space:nowrap">' + esc(r.escuela) + '</td>' +
          '<td>' + esc(r.carrera) + '</td>' +
          '<td class="vic-hint">' + esc(D.areas[r.area]) + '</td>' +
          '<td class="vic-mono" style="text-align:right;font-weight:700">' + r.c1 + '</td>' +
          '<td class="vic-mono" style="text-align:right">' + (r.c2 == null ? '—' : r.c2) + '</td>' +
        '</tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* --- Leyenda ------------------------------------------------------------ */
  function pintarLeyenda(f) {
    var l = $('leyenda');
    if (vista === 'convocatorias') {
      // Dos series: la leyenda es obligatoria.
      l.innerHTML = '<div class="vic-chart__leyenda">' +
        '<span class="vic-chart__llave"><span class="vic-chart__swatch" style="background:var(--vic-azul-profundo)"></span>1ª convocatoria</span>' +
        '<span class="vic-chart__llave"><span class="vic-chart__swatch" style="background:var(--vic-primary-light)"></span>2ª convocatoria</span>' +
        '</div>';
    } else {
      // Con puntaje no hace falta leyenda: el globo sobre la línea de
      // referencia ya la etiqueta, y repetirla es ruido.
      // Una sola serie: sin caja de leyenda, el título ya dice qué se grafica.
      l.innerHTML = '';
    }
  }

  /* --- Resumen de lo filtrado --------------------------------------------- */
  function pintarResumen(f, datos) {
    var partes = ['<span><strong>' + datos.length + '</strong> ' +
      (datos.length === 1 ? 'carrera' : 'carreras')];
    if (f.area) partes[0] += ' · ' + esc(D.areas[f.area]);
    if (f.escuela) partes[0] += ' · ' + esc(f.escuela);
    if (f.busca) partes[0] += ' · "' + esc(f.busca) + '"';
    partes[0] += '</span>';

    if (f.puntaje != null) {
      var alcanza = datos.filter(function (r) { return f.puntaje >= r.c1; }).length;
      partes.push('<span class="vic-badge ' + (alcanza ? 'vic-badge--success' : 'vic-badge--neutral') + '">' +
        'alcanzas ' + alcanza + ' de ' + datos.length + '</span>');
    }
    $('resumenFiltro').innerHTML = partes.join('');

    // El botón de quitar puntaje solo existe cuando hay puntaje que quitar
    $('limpiarPuntaje').classList.toggle('vic-hidden', f.puntaje == null);
  }

  /* --- Render ------------------------------------------------------------- */
  function render() {
    var f = filtros();
    var datos = filtrar(f);

    pintarLeyenda(f);
    pintarResumen(f, datos);

    if (!datos.length) {
      $('grafica').innerHTML = '<div class="vic-chart__vacio">Ninguna carrera coincide con esos filtros.' +
        '<div style="margin-top:14px"><button class="vic-btn vic-btn--secondary vic-btn--sm" type="button" id="limpiarVacio">Limpiar filtros</button></div></div>';
      $('limpiarVacio').addEventListener('click', limpiarFiltros);
      return;
    }

    if (vista === 'tabla') $('grafica').innerHTML = vistaTabla(datos);
    else if (vista === 'convocatorias') $('grafica').innerHTML = vistaConvocatorias(datos);
    else $('grafica').innerHTML = vistaCorte(datos, f);
  }

  /* --- Fuente ------------------------------------------------------------- */
  (function pintarFuente() {
    var s = D.fuente;
    var partes = [s.texto];
    if (s.folio) partes.push('folio ' + s.folio);
    if (s.periodo) partes.push('convocatorias ' + s.periodo);
    $('fuente').textContent = partes.join(' · ');
  })();

  /* --- Tooltip ------------------------------------------------------------ */
  var tip = document.createElement('div');
  tip.className = 'vic-tip';
  tip.setAttribute('role', 'tooltip');
  document.body.appendChild(tip);

  $('grafica').addEventListener('mousemove', function (e) {
    var fila = e.target.closest('.vic-chart__fila');
    if (!fila) { tip.classList.remove('vic-tip--on'); return; }
    var c2 = fila.getAttribute('data-c2');
    tip.innerHTML = '<strong>' + esc(fila.getAttribute('data-carrera')) + '</strong>' +
      '<span>' + esc(fila.getAttribute('data-escuela')) + '</span>' +
      '<div style="margin-top:6px">1ª convocatoria: <strong style="display:inline">' + esc(fila.getAttribute('data-c1')) + ' aciertos</strong></div>' +
      (c2 ? '<div>2ª convocatoria: ' + esc(c2) + ' aciertos</div>' : '<div><span>sin segunda convocatoria</span></div>');
    tip.classList.add('vic-tip--on');
    var x = Math.min(e.clientX + 16, window.innerWidth - 280);
    tip.style.left = x + 'px';
    tip.style.top = Math.max(8, e.clientY - 60) + 'px';
  });
  $('grafica').addEventListener('mouseleave', function () { tip.classList.remove('vic-tip--on'); });

  /* --- Eventos ------------------------------------------------------------ */
  $('tabs').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-vista]');
    if (!btn) return;
    vista = btn.getAttribute('data-vista');
    this.querySelectorAll('[data-vista]').forEach(function (b) {
      var activo = b === btn;
      b.className = 'vic-btn vic-btn--sm ' + (activo ? 'vic-btn--secondary' : 'vic-btn--ghost');
      b.setAttribute('aria-selected', String(activo));
    });
    render();
  });

  var t;
  ['fArea', 'fEscuela', 'fBusca', 'fPuntaje'].forEach(function (id) {
    $(id).addEventListener('input', function () { clearTimeout(t); t = setTimeout(render, 140); });
  });

  function limpiarFiltros() {
    $('fArea').value = ''; $('fEscuela').value = ''; $('fBusca').value = '';
    render();
  }
  $('limpiarFiltros').addEventListener('click', limpiarFiltros);
  $('limpiarPuntaje').addEventListener('click', function () { $('fPuntaje').value = ''; render(); });

  pintarKPIs();
  render();
})();
