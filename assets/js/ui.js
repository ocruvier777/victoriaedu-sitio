/* ==========================================================================
   VictoriaEDU — UI compartida
   Header, footer, navegación, animaciones de entrada y helpers.
   Header y footer se pintan desde aquí para no duplicar markup en 7 páginas.
   ========================================================================== */

(function () {
  'use strict';

  var C = window.CONFIG;

  /* --- Navegación --------------------------------------------------------- */
  var NAV = [
    { href: 'index.html',                titulo: 'Inicio' },
    { href: 'index.html#metodo',         titulo: 'Método' },
    { href: 'tienda.html',               titulo: 'Programas' },
    { href: 'simulacro-ipn-2026.html',   titulo: 'Simulacro IPN' },
    { href: 'aciertos-ipn.html',         titulo: 'Aciertos IPN' },
    { href: 'convocatoria-ipn-segunda-vuelta.html', titulo: 'Segunda vuelta' },
  ];

  function paginaActual() {
    var p = location.pathname.split('/').pop();
    return p === '' ? 'index.html' : p;
  }

  /* --- Header ------------------------------------------------------------- */
  function pintarHeader() {
    var host = document.querySelector('[data-vic-header]');
    if (!host) return;

    var actual = paginaActual();
    var cta = host.getAttribute('data-cta') || 'comprar';

    var enlaces = NAV.map(function (n) {
      var base = n.href.split('#')[0];
      var esActual = base === actual && (actual !== 'index.html' || n.href === 'index.html');
      return '<a href="' + n.href + '"' + (esActual ? ' aria-current="page"' : '') + '>' + n.titulo + '</a>';
    }).join('');

    var botones = {
      comprar:  '<a class="vic-btn vic-btn--primary vic-btn--md vic-navbar__cta" href="checkout.html?producto=simulacro-ipn-2026">Comprar simulacro — $299</a>',
      programas:'<a class="vic-btn vic-btn--secondary vic-btn--md vic-navbar__cta" href="tienda.html">Ver programas</a>',
      ninguno:  '',
    };
    var boton = botones[cta] !== undefined ? botones[cta] : botones.comprar;

    host.className = 'vic-navbar';
    host.innerHTML =
      '<nav class="vic-navbar__inner" aria-label="Principal">' +
        '<a class="vic-navbar__logo" href="index.html" aria-label="VictoriaEDU — inicio">' +
          '<img src="uploads/victoriaedu_logo_light.png" alt="VictoriaEDU">' +
        '</a>' +
        '<div style="flex:1"></div>' +
        '<div class="vic-navbar__links" id="vicNavLinks">' + enlaces + boton + '</div>' +
        boton +
        '<button class="vic-navbar__toggle" type="button" aria-expanded="false" aria-controls="vicNavLinks" aria-label="Abrir menú">☰</button>' +
      '</nav>';

    var toggle = host.querySelector('.vic-navbar__toggle');
    var links = host.querySelector('#vicNavLinks');
    toggle.addEventListener('click', function () {
      var abierto = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(abierto));
      toggle.textContent = abierto ? '✕' : '☰';
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      }
    });
  }

  /* --- Footer ------------------------------------------------------------- */
  function pintarFooter() {
    var host = document.querySelector('[data-vic-footer]');
    if (!host) return;

    host.className = 'vic-footer';
    host.innerHTML =
      '<div class="vic-container">' +
        '<div class="vic-footer__grid">' +
          '<div>' +
            '<img src="uploads/victoriaedu_logo_light.png" alt="VictoriaEDU" style="height:64px;width:auto;display:block;margin-bottom:20px">' +
            '<p style="font-size:15px;line-height:1.6;margin:0 0 16px;max-width:38ch">' +
              C.marca.razonSocial + ' — ecosistema de aprendizaje para estudiantes en México: las materias de tu carrera, con profesores reales y tutor IA. Desarrollado por VictoriaDEV.' +
            '</p>' +
            '<div class="vic-mono" style="font-size:12px;line-height:1.7;color:rgba(255,255,255,.5)">' + C.marca.ciudad + '</div>' +
          '</div>' +
          '<div>' +
            '<div class="vic-footer__title">Programas</div>' +
            '<div class="vic-footer__links">' +
              '<a href="tienda.html">Todos los programas</a>' +
              '<a href="simulacro-ipn-2026.html">Simulacro IPN 2026</a>' +
              '<a href="tienda.html#curso-matematicas-ipn-2027">Curso de Matemáticas 2027</a>' +
              '<a href="aciertos-ipn.html">Aciertos para entrar al IPN</a>' +
              '<a href="convocatoria-ipn-segunda-vuelta.html">Convocatoria segunda vuelta</a>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<div class="vic-footer__title">Contacto</div>' +
            '<div class="vic-footer__links">' +
              '<a href="mailto:' + C.marca.correo + '">' + C.marca.correo + '</a>' +
              '<a href="mailto:' + C.marca.correoInstituciones + '">' + C.marca.correoInstituciones + '</a>' +
              '<a href="' + enlaceWhatsApp('Hola, tengo una duda sobre los programas de VictoriaEDU.') + '" target="_blank" rel="noopener">WhatsApp</a>' +
            '</div>' +
          '</div>' +
          '<div>' +
            '<div class="vic-footer__title">Legal</div>' +
            '<div class="vic-footer__links">' +
              '<a href="#">Aviso de privacidad</a>' +
              '<a href="#">Términos y condiciones</a>' +
              '<a href="#">Política de reembolso</a>' +
              '<a href="admin.html">Panel interno</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="vic-footer__bottom">' +
          '<span>© 2026 ' + C.marca.razonSocial + ' · Desarrollado por VictoriaDEV — made with <span style="color:#E2818F">&#10084;</span></span>' +
          '<span>La preparación no garantiza admisión. Nuestros resultados se reportan por generación.</span>' +
        '</div>' +
      '</div>';
  }

  /* --- WhatsApp ----------------------------------------------------------- */
  function enlaceWhatsApp(mensaje) {
    return 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(mensaje);
  }

  /* Mensaje prellenado con los datos del pedido — es la vía por la que el
     alumno nos avisa mientras MercadoPago no esté conectado. */
  function mensajePedido(pedido) {
    return [
      'Hola VictoriaEDU, acabo de hacer mi transferencia.',
      '',
      'Folio: ' + pedido.folio,
      'Nombre: ' + pedido.nombre,
      'Correo: ' + pedido.correo,
      'Programa: ' + pedido.productoNombre,
      'Monto: ' + window.formatoMXN(pedido.monto),
      '',
      'Adjunto mi comprobante.',
    ].join('\n');
  }

  /* --- Animación de entrada ----------------------------------------------- */
  function activarReveal() {
    var nodos = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    var barras = Array.prototype.slice.call(document.querySelectorAll('[data-grow]'));
    var mostrar = function (el) { el.classList.add('is-visible'); };
    var llenar = function (el) { el.style.width = el.getAttribute('data-grow') + '%'; };

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      nodos.forEach(mostrar); barras.forEach(llenar);
      return;
    }

    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target;
        t.hasAttribute('data-grow') ? llenar(t) : mostrar(t);
        io.unobserve(t);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    nodos.concat(barras).forEach(function (el) { io.observe(el); });
    // Red de seguridad: si algo queda fuera del observer, se muestra igual.
    setTimeout(function () { nodos.forEach(mostrar); barras.forEach(llenar); }, 4000);
  }

  /* --- Contadores animados -------------------------------------------------
     Anima el primer número que encuentre en el texto y conserva lo demás,
     para que "8 de 10", "+1,200" o "78 de 88" funcionen igual.
  ------------------------------------------------------------------------ */
  function activarContadores() {
    var nodos = Array.prototype.slice.call(document.querySelectorAll('[data-contador]'));
    if (!nodos.length) return;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var animar = function (el) {
      var texto = el.getAttribute('data-contador') || el.textContent;
      var m = texto.match(/([+-]?[\d,]+)/);
      if (!m) return;
      var destino = parseInt(m[1].replace(/,/g, ''), 10);
      if (isNaN(destino)) return;
      var signo = /^\+/.test(m[1]) ? '+' : '';
      var pinta = function (v) {
        el.textContent = texto.replace(m[1], signo + v.toLocaleString('es-MX'));
      };
      if (reduce) { pinta(destino); return; }

      var inicio = performance.now(), dur = 1100;
      var paso = function (t) {
        var p = Math.min(1, (t - inicio) / dur);
        // easing suave al final: el número "aterriza" en vez de frenar de golpe
        pinta(Math.round(destino * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(paso);
      };
      el.textContent = texto.replace(m[1], signo + '0');
      requestAnimationFrame(paso);
    };

    if (reduce || !('IntersectionObserver' in window)) { nodos.forEach(animar); return; }
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        animar(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    nodos.forEach(function (el) { io.observe(el); });
  }

  /* --- Sparkline -----------------------------------------------------------
     Línea de 2px con punto final: el mismo lenguaje que las gráficas grandes.
  ------------------------------------------------------------------------ */
  function sparkline(valores, opts) {
    opts = opts || {};
    var w = opts.ancho || 96, h = opts.alto || 28, pad = 3;
    var min = Math.min.apply(null, valores), max = Math.max.apply(null, valores);
    var rango = (max - min) || 1;
    var puntos = valores.map(function (v, i) {
      return [
        pad + i * (w - pad * 2) / (valores.length - 1),
        h - pad - ((v - min) / rango) * (h - pad * 2),
      ];
    });
    var d = puntos.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    var fin = puntos[puntos.length - 1];
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" fill="none" aria-hidden="true" focusable="false" style="display:block">' +
      '<path d="' + d + '" stroke="' + (opts.color || 'var(--vic-primary-light)') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="' + fin[0].toFixed(1) + '" cy="' + fin[1].toFixed(1) + '" r="3.5" fill="' + (opts.acento || 'var(--vic-azul)') + '"/>' +
      '</svg>';
  }

  /* --- Toast -------------------------------------------------------------- */
  var toastTimer;
  function toast(mensaje) {
    var el = document.querySelector('.vic-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'vic-toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = mensaje;
    requestAnimationFrame(function () { el.classList.add('vic-toast--on'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('vic-toast--on'); }, 2600);
  }

  /* --- Copiar al portapapeles --------------------------------------------- */
  function activarCopiar() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-copiar]');
      if (!btn) return;
      var texto = btn.getAttribute('data-copiar');
      var listo = function () {
        var original = btn.textContent;
        btn.textContent = 'Copiado';
        btn.classList.add('vic-copy--ok');
        toast('Copiado al portapapeles');
        setTimeout(function () { btn.textContent = original; btn.classList.remove('vic-copy--ok'); }, 1800);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(texto).then(listo).catch(function () { copiarFallback(texto, listo); });
      } else {
        copiarFallback(texto, listo);
      }
    });
  }

  function copiarFallback(texto, listo) {
    var ta = document.createElement('textarea');
    ta.value = texto;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); listo(); } catch (e) { toast('Copia manualmente: ' + texto); }
    document.body.removeChild(ta);
  }

  /* --- Cuenta regresiva --------------------------------------------------- */
  function activarCuentaRegresiva() {
    var host = document.querySelector('[data-cuenta-regresiva]');
    if (!host) return;
    var objetivo = new Date(C.lanzamiento.fecha).getTime();
    var campos = {
      d: host.querySelector('[data-cr="d"]'), h: host.querySelector('[data-cr="h"]'),
      m: host.querySelector('[data-cr="m"]'), s: host.querySelector('[data-cr="s"]'),
    };
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var tick = function () {
      var d = Math.max(0, objetivo - Date.now());
      if (campos.d) campos.d.textContent = pad(Math.floor(d / 86400000));
      if (campos.h) campos.h.textContent = pad(Math.floor(d / 3600000) % 24);
      if (campos.m) campos.m.textContent = pad(Math.floor(d / 60000) % 60);
      if (campos.s) campos.s.textContent = pad(Math.floor(d / 1000) % 60);
      document.querySelectorAll('[data-dias-restantes]').forEach(function (el) {
        el.textContent = Math.floor(d / 86400000);
      });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* --- Utilidades varias --------------------------------------------------- */
  function parametro(nombre) {
    return new URLSearchParams(location.search).get(nombre);
  }

  function fechaLegible(iso) {
    try {
      return new Date(iso).toLocaleString('es-MX', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch (e) { return iso; }
  }

  function escapar(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function validarCorreo(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());
  }

  /* --- Arranque ----------------------------------------------------------- */
  function iniciar() {
    pintarHeader();
    pintarFooter();
    activarReveal();
    activarCopiar();
    activarCuentaRegresiva();
    activarContadores();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

  window.VicUI = {
    enlaceWhatsApp: enlaceWhatsApp,
    mensajePedido: mensajePedido,
    toast: toast,
    parametro: parametro,
    fechaLegible: fechaLegible,
    escapar: escapar,
    validarCorreo: validarCorreo,
    activarReveal: activarReveal,
    activarContadores: activarContadores,
    sparkline: sparkline,
  };
})();
