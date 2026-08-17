/* ==========================================================================
   VictoriaEDU — UI compartida
   Header, footer, navegación, animaciones de entrada y helpers.
   Header y footer se pintan desde aquí para no duplicar markup en 7 páginas.
   ========================================================================== */

(function () {
  'use strict';

  var C = window.CONFIG;

  /* --- Navegación ----------------------------------------------------------
     Un solo árbol para todo el sitio: el header se pinta desde aquí en todas
     las páginas, así que el menú no puede desincronizarse entre una y otra.

     Dos tipos de desplegable:
     · `mega`  → panel con las tarjetas de los programas (se llena del catálogo)
     · `hijos` → lista simple

     En ambos, el rótulo es un enlace de verdad: al hacer clic la primera vez
     abre el panel, y si vuelves a hacer clic, navega a su propia página.
  ------------------------------------------------------------------------ */
  var NAV = [
    { titulo: 'Inicio', href: 'index.html' },
    { titulo: 'Programas', href: 'tienda.html', mega: true },
    {
      titulo: 'IPN', href: 'ipn.html', hijos: [
        { titulo: 'Guía del examen IPN', href: 'ipn.html', desc: 'Estructura, materias, calificación y calendario' },
        { titulo: 'Aciertos por carrera', href: 'aciertos-ipn.html', desc: 'Cortes históricos de 105 carreras, en gráfica' },
        { titulo: 'Convocatoria segunda vuelta', href: 'convocatoria-ipn-segunda-vuelta.html', desc: 'Fechas, registro y requisitos' },
      ],
    },
    { titulo: 'Método', href: 'index.html#metodo' },
    { titulo: 'Equipo', href: 'index.html#equipo' },
  ];

  function paginaActual() {
    var p = location.pathname.split('/').pop();
    return p === '' ? 'index.html' : p;
  }

  /* Páginas que "pertenecen" a Programas, para marcar el rótulo como activo. */
  var PAGINAS_PROGRAMAS = ['tienda.html', 'simulacro-ipn-2026.html', 'checkout.html', 'pago.html', 'confirmacion.html'];

  var CHEVRON = '<svg class="vic-nav-item__chev" viewBox="0 0 24 24" width="14" height="14" fill="none" ' +
    'stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M6 9l6 6 6-6"/></svg>';

  /* --- Contenido de los paneles ------------------------------------------- */

  /* Mega panel: una tarjeta por programa, sacada del catálogo. Los que no
     están a la venta llevan su etiqueta y llevan a la tienda, no a un vacío. */
  function panelProgramas() {
    var tarjetas = (window.CATALOGO || []).map(function (p) {
      var disponible = p.estado === 'disponible';
      var destino = disponible && p.pagina ? p.pagina : 'tienda.html#' + p.slug;
      return '<a class="vic-mega__item" href="' + destino + '">' +
        '<span class="vic-mega__img"><img src="' + escapar(p.ilustracion || p.imagen) + '" alt="" loading="lazy"></span>' +
        '<span class="vic-mega__cuerpo">' +
          '<span class="vic-mega__tit">' + escapar(p.nombre) +
            '<span class="vic-badge ' + escapar(p.badge.clase) + '">' + escapar(p.badge.texto) + '</span>' +
          '</span>' +
          '<span class="vic-mega__desc">' + escapar(p.meta) + '</span>' +
          '<span class="vic-mega__precio">' + (disponible ? window.formatoMXN(p.precio) : 'Déjanos tu correo') + '</span>' +
        '</span>' +
      '</a>';
    }).join('');

    return '<div class="vic-mega">' +
      '<div class="vic-mega__grid">' + tarjetas + '</div>' +
      '<div class="vic-mega__pie">' +
        '<a href="tienda.html">Ver todos los programas y cómo comprar →</a>' +
        '<span>Hoy solo el simulacro está a la venta. Los cursos abren por generación.</span>' +
      '</div>' +
    '</div>';
  }

  function panelLista(hijos, actual) {
    return '<div class="vic-nav-lista">' + hijos.map(function (h) {
      return '<a href="' + h.href + '"' + (h.href === actual ? ' aria-current="page"' : '') + '>' +
        '<span class="vic-nav-lista__tit">' + escapar(h.titulo) + '</span>' +
        '<span class="vic-nav-lista__desc">' + escapar(h.desc) + '</span>' +
      '</a>';
    }).join('') + '</div>';
  }

  /* --- Header ------------------------------------------------------------- */
  function pintarHeader() {
    var host = document.querySelector('[data-vic-header]');
    if (!host) return;

    var actual = paginaActual();
    var cta = host.getAttribute('data-cta') || 'comprar';

    var enlaces = NAV.map(function (n, i) {
      var base = n.href.split('#')[0];
      var esActual = base === actual && (actual !== 'index.html' || n.href === 'index.html');

      if (!n.mega && !n.hijos) {
        return '<a href="' + n.href + '"' + (esActual ? ' aria-current="page"' : '') + '>' + n.titulo + '</a>';
      }

      var id = 'vicPanel' + i;
      var hijos = n.mega ? PAGINAS_PROGRAMAS : n.hijos.map(function (h) { return h.href; });
      var ramaActiva = hijos.indexOf(actual) !== -1;

      var panel = n.mega ? panelProgramas() : panelLista(n.hijos, actual);

      return '<div class="vic-nav-item' + (n.mega ? ' vic-nav-item--mega' : '') + '">' +
        '<a class="vic-nav-item__label" href="' + n.href + '" id="' + id + 'Btn" ' +
          'aria-haspopup="true" aria-expanded="false" aria-controls="' + id + '"' +
          (ramaActiva ? ' aria-current="true"' : '') + '>' + n.titulo + CHEVRON + '</a>' +
        '<div class="vic-nav-panel" id="' + id + '" aria-labelledby="' + id + 'Btn">' + panel + '</div>' +
      '</div>';
    }).join('');

    /* El CTA del navbar es "examen gratis", no "comprar": pedir dinero antes de
       demostrar algo es lo que estamos corrigiendo. `comprar` sigue existiendo
       para la página del producto, que es donde el alumno ya viene decidido. */
    /* Con `data-plataforma` en vez del href a mano: el header se pinta antes
       que `activarEnlacesPlataforma()`, así que este CTA pasa por la misma
       puerta que los del HTML y respeta el cierre del ambiente. */
    var botones = {
      examen:   '<a class="vic-btn vic-btn--primary vic-btn--md vic-navbar__cta" data-plataforma="examen" data-metrica="examen_gratis_clic" data-metrica-lugar="navbar">Haz el examen gratis</a>',
      /* Misma puerta que `examen`, otra etiqueta. La landing del simulacro
         recibe tráfico pagado y su promesa es concreta —diez reactivos, sin
         pagar—; el genérico "Haz el examen gratis" del resto del sitio no
         dice cuánto cuesta en tiempo y ahí sí importa. */
      examen10: '<a class="vic-btn vic-btn--primary vic-btn--md vic-navbar__cta" data-plataforma="examen" data-metrica="examen_gratis_clic" data-metrica-lugar="navbar">Probar 10 reactivos gratis</a>',
      comprar:  '<a class="vic-btn vic-btn--primary vic-btn--md vic-navbar__cta" data-plataforma="comprar" data-metrica="comprar_clic" data-metrica-lugar="navbar">2 exámenes por ' + precioCorto('simulacro-ipn-2026') + '</a>',
      programas:'<a class="vic-btn vic-btn--secondary vic-btn--md vic-navbar__cta" href="tienda.html">Ver programas</a>',
      ninguno:  '',
    };
    var boton = botones[cta] !== undefined ? botones[cta] : botones.examen;

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

    activarDesplegables(host, links, toggle);
  }

  /* --- Comportamiento de los desplegables -----------------------------------
     Escritorio: se abren al pasar el ratón. El primer clic en el rótulo abre
     el panel; el segundo deja pasar la navegación a su propia página.
     Móvil (sin hover): el rótulo funciona como acordeón y la navegación se
     hace desde los enlaces de dentro.
  ------------------------------------------------------------------------ */
  function activarDesplegables(host, links, toggle) {
    var items = Array.prototype.slice.call(host.querySelectorAll('.vic-nav-item'));
    if (!items.length) return;

    var hayHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
    var esAncho = function () { return window.innerWidth > 860; };

    function cerrarTodos(excepto) {
      items.forEach(function (it) {
        if (it === excepto) return;
        it.classList.remove('is-open');
        it.querySelector('.vic-nav-item__label').setAttribute('aria-expanded', 'false');
      });
    }

    function abrir(item, si) {
      item.classList.toggle('is-open', si);
      item.querySelector('.vic-nav-item__label').setAttribute('aria-expanded', String(si));
      if (si) cerrarTodos(item);
    }

    items.forEach(function (item) {
      var label = item.querySelector('.vic-nav-item__label');
      var temporizador;

      if (hayHover) {
        item.addEventListener('mouseenter', function () {
          if (!esAncho()) return;
          clearTimeout(temporizador);
          abrir(item, true);
        });
        item.addEventListener('mouseleave', function () {
          if (!esAncho()) return;
          // Pequeña gracia para que el puntero pueda cruzar el hueco al panel
          temporizador = setTimeout(function () { abrir(item, false); }, 180);
        });
      }

      label.addEventListener('click', function (e) {
        var abiertoYa = item.classList.contains('is-open');
        if (!abiertoYa) {
          // Primer clic: abre. La navegación se deja para el segundo.
          e.preventDefault();
          abrir(item, true);
        }
        // Si ya estaba abierto, no hacemos nada: el enlace navega solo.
      });

      // Foco por teclado dentro del panel: mantenerlo abierto
      item.addEventListener('focusin', function () { if (esAncho()) abrir(item, true); });
      item.addEventListener('focusout', function () {
        setTimeout(function () {
          if (esAncho() && !item.contains(document.activeElement)) abrir(item, false);
        }, 0);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      cerrarTodos(null);
      if (links.classList.contains('is-open')) {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      }
    });

    document.addEventListener('click', function (e) {
      if (!host.contains(e.target)) cerrarTodos(null);
    });

    // Al navegar desde cualquier enlace del menú, se cierra todo
    links.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a || a.classList.contains('vic-nav-item__label')) return;
      cerrarTodos(null);
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
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
          '<span>© ' + new Date().getFullYear() + ' ' + C.marca.razonSocial +
            ' · Hecho con <span style="color:#E2818F" aria-label="cariño" role="img">&#10084;</span> por ' +
            '<a href="https://victoriadev.com" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">VictoriaDEV</a>' +
            ' · <span class="vic-mono" style="opacity:.7">v' + (window.VERSION_SITIO || '—') +
              /* El ambiente se imprime SOLO cuando no es producción. Sirve
                 para lo que más miedo da de resolver el destino por hostname:
                 que un día la landing pública quede apuntando a dev y nadie
                 se entere. Si esta etiqueta aparece en victoriaedu.com.mx,
                 hay un host fuera de `hostsProduccion`. */
              (ambientePlataforma() === 'produccion' ? '' : ' · plataforma dev') +
            '</span></span>' +
          '<span>La preparación no garantiza admisión. Nuestros resultados se reportan por generación.</span>' +
          /* Deslinde del IPN. Va en el pie de TODAS las páginas y no solo en la
             del simulacro: el sitio entero habla del examen del Poli, cita su
             convocatoria y publica sus cortes, así que la confusión —creer que
             esto es una página oficial— se puede dar en cualquiera de ellas.
             `flex:1 0 100%` lo baja a su propio renglón dentro del pie: es un
             aviso, no una columna que compita con el copyright. */
          '<span style="flex:1 0 100%">Victoria EDU es una plataforma educativa independiente y no forma ' +
            'parte del Instituto Politécnico Nacional. Los simulacros son materiales de preparación académica.</span>' +
        '</div>' +
      '</div>';
  }

  /* --- Salto a la plataforma -----------------------------------------------
     Todos los CTAs de conversión del sitio salen por aquí. La gracia de tener
     un solo constructor es que el dominio y los parámetros de atribución viven
     en un lugar: si mañana la plataforma se muda a examen.victoriaedu.com.mx,
     se cambia `CONFIG.plataforma` y no hay que perseguir diez botones.

     `origen` → de dónde vino. Hoy la plataforma todavía NO lo persiste
                (INTEGRACION-PLATAFORMA.md, B5), así que viaja y se ignora. Se
                manda igual porque el día que lo lea es lo único que nos va a
                decir cuántos registros trae el sitio, y así no hay que volver
                a tocar ningún botón.

     Ya no se manda `next=`: el examen gratis se presenta sin cuenta y el
     desvío post-registro lo decide la plataforma con el claim pendiente.
  ------------------------------------------------------------------------ */

  /* Qué plataforma nos toca. Se decide por hostname para que las ramas main y
     dev del sitio sean el MISMO código: solo el host cambia. Cualquier host
     que no esté en la lista de producción cae en dev, que es el default
     seguro — un preview pegándole a producción ensucia la base real. */
  function ambientePlataforma() {
    var p = C.plataforma;
    var host = (window.location.hostname || '').toLowerCase();
    return (p.hostsProduccion || []).indexOf(host) !== -1 ? 'produccion' : 'dev';
  }

  function plataformaActual() {
    var p = C.plataforma;
    return p.ambientes[ambientePlataforma()];
  }

  function urlPlataforma(ruta, params) {
    var url = plataformaActual().base.replace(/\/+$/, '') + ruta;
    var query = new URLSearchParams(params || {}).toString();
    return query ? url + '?' + query : url;
  }

  /* El CTA primario del sitio. Aterriza DIRECTO en el examen, sin pasar por el
     registro: se contesta sin cuenta y la plataforma pide el correo hasta la
     calificación. Pedirlo antes era el peaje viejo. */
  function urlExamenGratis() {
    var p = C.plataforma;
    return urlPlataforma(p.rutas.gratis + p.examenGratis, {
      origen: 'landing-examen-gratis',
    });
  }

  /* Precio sin " MXN", para etiquetas de botón. Sale del catálogo, nunca
     escrito a mano: el precio del sitio tiene que coincidir EXACTO con el de
     la plataforma o el backend rechaza el pago (INTEGRACION-PLATAFORMA.md, B4). */
  function precioCorto(productoId) {
    var p = window.getProducto(productoId);
    return p ? '$' + Number(p.precio).toLocaleString('es-MX') : '';
  }

  /* El CTA de compra. Manda a la pantalla del paquete 2x1, que es donde vive
     el botón de pago (Mercado Pago Checkout Pro). Esa pantalla exige sesión:
     al visitante sin cuenta la plataforma lo desvía a /login. No es lo ideal
     —se pierde el destino, porque `next=` nunca se implementó— pero el camino
     que sí queremos que recorra es el otro: examen gratis, resultado, upsell.
     Ver INTEGRACION-PLATAFORMA.md, B3. */
  function urlComprar() {
    var p = C.plataforma;
    return urlPlataforma(p.rutas.paquete + p.paquete, {
      origen: 'landing-compra',
    });
  }

  /* --- WhatsApp ----------------------------------------------------------- */
  function enlaceWhatsApp(mensaje) {
    return 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(mensaje);
  }

  /* --- Enlaces de WhatsApp en el HTML --------------------------------------
     <a data-wa="mensaje">…</a> se completa desde aquí. Así el número vive solo
     en config.js y no hay que perseguirlo por diez archivos si cambia.
  ------------------------------------------------------------------------ */
  function activarEnlacesWhatsApp() {
    document.querySelectorAll('[data-wa]').forEach(function (a) {
      a.href = enlaceWhatsApp(a.getAttribute('data-wa') || 'Hola, quiero informes sobre VictoriaEDU.');
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  /* --- Enlaces a la plataforma en el HTML ----------------------------------
     Mismo truco que los de WhatsApp: <a data-plataforma="examen|comprar"> se
     completa desde aquí. Así ningún HTML tiene el dominio escrito a mano y
     mudarse de dominio sigue siendo un cambio de una línea en config.js.

     Y aquí se aplica el cierre. Cuando el ambiente tiene ese CTA en `false`,
     el enlace NO recibe href: se marca "Pronto" y al tocarlo explica por qué
     y ofrece WhatsApp, que es el canal que sí contesta hoy. Se hace así y no
     con `.vic-btn--disabled` porque esa clase apaga `pointer-events`, y un
     botón muerto que no dice nada convierte una visita en un abandono.

     Tampoco se esconde el botón. La página entera está escrita alrededor de
     "haz el examen gratis"; quitarlo dejaría huecos y párrafos hablando de un
     botón que no está. Mejor decir "pronto" y quedarse con el contacto.
  ------------------------------------------------------------------------ */
  function plataformaAbierta(cual) {
    var amb = plataformaActual();
    return cual === 'comprar' ? !!amb.compraAbierta : !!amb.examenAbierto;
  }

  /* El aviso del CTA cerrado. Una función y dos textos: lo que cambia entre el
     examen y la compra es la primera línea, no la estructura. */
  function avisoCerrado(cual) {
    var esCompra = cual === 'comprar';
    var wa = esCompra
      ? 'Hola, quiero comprar los simulacros del IPN. ¿Cómo le hago mientras abre el pago en línea?'
      : 'Hola, quiero presentar el examen gratis del IPN. ¿Me avisan cuando abra?';

    modal(
      '<div class="vic-stack" style="gap:16px">' +
        /* .vic-tag y no .vic-pill: la pastilla del hero es blanca sobre fondo
           oscuro, y dentro de este modal claro se vuelve invisible. */
        '<div><span class="vic-tag">Todavía no abre</span></div>' +
        '<h2 style="font-size:26px;line-height:1.2;margin:0">' +
          (esCompra ? 'El pago en línea abre en unos días.' : 'El examen gratis abre en unos días.') +
        '</h2>' +
        '<p style="font-size:16px;line-height:1.6;margin:0">' +
          (esCompra
            ? 'Estamos terminando de conectar el cobro en la plataforma. No queremos cobrarte por un lugar que todavía no te podemos entregar bien.'
            : 'Estamos terminando de conectarlo con la plataforma. Cuando abra son 10 reactivos reales del IPN y se contestan sin crear cuenta.') +
        '</p>' +
        '<p style="font-size:16px;line-height:1.6;margin:0">' +
          'Si tienes prisa, escríbenos por WhatsApp: ahí sí contestamos hoy.' +
        '</p>' +
        '<a class="vic-btn vic-btn--wa vic-btn--lg vic-btn--block" target="_blank" rel="noopener" href="' +
          escapar(enlaceWhatsApp(wa)) + '" data-metrica="wa_desde_cerrado" data-metrica-lugar="' +
          (esCompra ? 'aviso-compra' : 'aviso-examen') + '">' +
          'Escribirnos por WhatsApp' +
        '</a>' +
        '<a class="vic-btn vic-btn--secondary vic-btn--lg vic-btn--block" href="tienda.html">Ver los programas</a>' +
      '</div>',
      { titulo: esCompra ? 'El pago en línea abre en unos días' : 'El examen gratis abre en unos días', ancho: '460px' }
    );
  }

  /* Se puede llamar de nuevo cuando algo inyecta CTAs después de cargar (el
     popup, el navbar). La marca evita enganchar dos veces el mismo botón, que
     abriría dos avisos encimados. */
  function activarEnlacesPlataforma() {
    document.querySelectorAll('[data-plataforma]').forEach(function (a) {
      if (a.dataset.plataformaListo) return;
      a.dataset.plataformaListo = '1';

      var cual = a.getAttribute('data-plataforma') === 'comprar' ? 'comprar' : 'examen';

      if (plataformaAbierta(cual)) {
        a.href = cual === 'comprar' ? urlComprar() : urlExamenGratis();
        return;
      }

      /* Cerrado. Sin href no es un enlace, así que hay que devolverle el rol y
         el teclado a mano: un <a> sin href sale del orden de tabulación. */
      a.removeAttribute('href');
      a.setAttribute('role', 'button');
      a.setAttribute('tabindex', '0');
      a.setAttribute('aria-haspopup', 'dialog');

      /* El evento cambia de nombre: si el clic no sale del sitio, contarlo como
         `examen_gratis_clic` inflaría el embudo con gente que nunca llegó a la
         plataforma. Y medido aparte dice algo útil: cuánta demanda se está
         quedando en la puerta mientras esto sigue cerrado. */
      a.setAttribute('data-metrica', cual === 'comprar' ? 'comprar_cerrado' : 'examen_gratis_cerrado');

      /* La marca "Pronto" solo en los botones. En un enlace dentro de un
         párrafo, una pastilla a media frase se lee como error de maquetación;
         ahí basta con que el aviso salga al tocarlo. */
      if (a.classList.contains('vic-btn') && !a.querySelector('.vic-btn__pronto')) {
        a.classList.add('vic-btn--pronto');
        var marca = document.createElement('span');
        marca.className = 'vic-btn__pronto';
        marca.textContent = 'Pronto';
        a.appendChild(marca);
      }

      a.addEventListener('click', function (e) { e.preventDefault(); avisoCerrado(cual); });
      a.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        avisoCerrado(cual);
      });
    });
  }

  /* --- Hueco de mascota -----------------------------------------------------
     <div class="mascot-slot" data-mascota></div> se llena SOLO si
     CONFIG.mascota trae una ruta. Sin ella el contenedor se queda vacío y el
     CSS lo esconde (.mascot-slot { display:none } / :has(img) { display:block }),
     así que no hay imagen rota ni hueco reservado esperando un archivo.
  ------------------------------------------------------------------------ */
  function pintarMascota() {
    document.querySelectorAll('[data-mascota]').forEach(function (hueco) {
      /* data-mascota="pensando" busca CONFIG.mascotaPensando; sin valor, la
         mascota por defecto. Así una misma pieza sirve para varias poses sin
         duplicar código ni marcado. */
      var m = hueco.getAttribute('data-mascota') === 'pensando' ? C.mascotaPensando : C.mascota;
      if (!m || !m.src) return;
      hueco.innerHTML = '<img src="' + escapar(m.src) + '" alt="' + escapar(m.alt || '') + '"' +
        (m.ancho ? ' width="' + m.ancho + '"' : '') +
        (m.alto ? ' height="' + m.alto + '"' : '') +
        ' loading="lazy" decoding="async">';
    });
  }

  /* --- Botón flotante de WhatsApp ------------------------------------------
     El público entra desde el celular y decide en segundos: el contacto tiene
     que estar siempre a un pulgar de distancia, no enterrado en el footer.
     Se inyecta desde aquí por la misma razón que el header y el footer.
  ------------------------------------------------------------------------ */
  function pintarBotonWhatsApp() {
    var header = document.querySelector('[data-vic-header]');
    if (!header) return;
    // El embudo de compra y el panel interno se marcan con data-cta="ninguno".
    // Ahí el alumno está pagando: un botón flotante encima solo estorba.
    if (header.getAttribute('data-cta') === 'ninguno') return;
    if (document.querySelector('.vic-fab-wa')) return;

    var a = document.createElement('a');
    a.className = 'vic-fab-wa';
    a.href = enlaceWhatsApp('Hola, quiero informes sobre los programas de VictoriaEDU.');
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'Pedir informes por WhatsApp');
    a.innerHTML =
      '<span class="vic-fab-wa__ico" data-icono="whatsapp" data-icono-tam="24"></span>' +
      '<span class="vic-fab-wa__txt">Informes</span>';
    document.body.appendChild(a);
  }

  /* --- Modal ----------------------------------------------------------------
     Un solo modal para todo el sitio. Antes estaba escrito a mano tres veces
     (diploma, lista de espera y popup del simulacro) y cada copia cerraba de
     una forma distinta; con seis modales en la portada eso no se sostiene.

     Devuelve { caja, cerrar } para que quien lo abre pueda repintar el
     contenido —la lista de espera lo hace al enviar— sin volver a cablear nada:
     el cierre está delegado en el overlay, así que sobrevive a un innerHTML.
  ------------------------------------------------------------------------ */
  var FOCUSABLES = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

  function modal(contenido, opts) {
    opts = opts || {};

    var previo = document.activeElement;
    var overlay = document.createElement('div');
    overlay.className = 'vic-modal' + (opts.clase ? ' ' + opts.clase : '');
    overlay.innerHTML =
      '<div class="vic-modal__caja" role="dialog" aria-modal="true"' +
        (opts.titulo ? ' aria-label="' + escapar(opts.titulo) + '"' : '') +
        (opts.ancho ? ' style="max-width:' + opts.ancho + '"' : '') + '>' +
        '<button class="vic-modal__cerrar" type="button" aria-label="Cerrar">✕</button>' +
        contenido +
      '</div>';

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    var caja = overlay.querySelector('.vic-modal__caja');

    function cerrar() {
      if (!overlay.parentNode) return;
      overlay.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      // Devolver el foco a donde estaba: si no, el teclado vuelve al principio
      // de la página y quien navega sin ratón pierde el hilo.
      if (previo && previo.focus) previo.focus();
    }

    function onKey(e) {
      if (e.key === 'Escape') { cerrar(); return; }
      if (e.key !== 'Tab') return;
      // Encerrar el foco: mientras el modal está abierto, el resto de la página
      // es inerte para el ratón, así que también debe serlo para el tabulador.
      var f = Array.prototype.filter.call(caja.querySelectorAll(FOCUSABLES), function (el) {
        return el.offsetParent !== null;
      });
      if (!f.length) return;
      var primero = f[0], ultimo = f[f.length - 1];
      if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    }

    document.addEventListener('keydown', onKey);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.closest('.vic-modal__cerrar')) cerrar();
    });

    if (window.VicIconos) window.VicIconos.montar(overlay);

    // Foco al primer campo útil; si no hay, a la X.
    var inicial = caja.querySelector('input:not([type="hidden"]), textarea, select') ||
                  caja.querySelector('.vic-modal__cerrar');
    if (inicial) inicial.focus();

    return { overlay: overlay, caja: caja, cerrar: cerrar };
  }

  /* --- Carrusel horizontal --------------------------------------------------
     Se monta sobre un .vic-rail que ya tiene scroll y scroll-snap nativos: el
     dedo y la rueda funcionan sin JS. Esto solo añade las flechas, los puntos y
     el foco de teclado, y se retira solo si todo cabe sin desplazar.
  ------------------------------------------------------------------------ */
  function rail(track, opts) {
    if (!track) return;
    opts = opts || {};
    var wrap = track.closest('.vic-rail-wrap');
    if (!wrap) return;

    track.setAttribute('tabindex', '0');
    track.setAttribute('role', 'group');
    track.setAttribute('aria-label', opts.etiqueta || 'Carrusel');

    var nav = document.createElement('div');
    nav.className = 'vic-rail__nav';
    nav.innerHTML =
      '<span class="vic-rail__cuenta" aria-hidden="true"></span>' +
      '<button class="vic-rail__btn" type="button" data-ir="-1" aria-label="Anterior">' +
        '<span data-icono="flecha" data-icono-tam="18"></span></button>' +
      '<button class="vic-rail__btn" type="button" data-ir="1" aria-label="Siguiente">' +
        '<span data-icono="flecha" data-icono-tam="18"></span></button>';

    var puntos = document.createElement('div');
    puntos.className = 'vic-rail__dots';

    // opts.navEn permite colgar las flechas de la fila del encabezado en vez de
    // dejarlas solas sobre el carrusel, donde abrían un hueco muy grande.
    var hostNav = opts.navEn ? (typeof opts.navEn === 'string' ? document.querySelector(opts.navEn) : opts.navEn) : null;
    (hostNav || wrap).appendChild(nav);
    wrap.appendChild(puntos);
    if (window.VicIconos) window.VicIconos.montar(nav);

    var hijos = Array.prototype.slice.call(track.children);
    puntos.innerHTML = hijos.map(function (_, i) {
      return '<button class="vic-rail__dot" type="button" data-i="' + i + '" aria-label="Ir a ' + (i + 1) + '"></button>';
    }).join('');

    /* Posición de cada tarjeta, medida del DOM en vez de calculada.
       hijos[i].offsetLeft se mide desde el ancestro posicionado, no desde el
       track, así que hay que restar el origen: la diferencia sí es exacta y no
       depende del gap, del padding ni de redondeos. */
    function destino(i) { return hijos[i].offsetLeft - hijos[0].offsetLeft; }

    function indiceActual() {
      var x = track.scrollLeft, mejor = 0, dmin = Infinity;
      for (var i = 0; i < hijos.length; i++) {
        var d = Math.abs(destino(i) - x);
        if (d < dmin) { dmin = d; mejor = i; }
      }
      return mejor;
    }

    var contador = nav.querySelector('.vic-rail__cuenta');
    /* Índice al que vamos, no en el que estamos. scrollBy calcularía el salto
       desde la posición instantánea: al pulsar dos veces seguidas, el segundo
       salto partía de la mitad de la animación anterior y el error se
       acumulaba hasta dejar la tarjeta descuadrada. Con scrollTo absoluto no
       hay deriva posible. */
    var iObjetivo = 0;

    function pintarEstado() {
      var desplazable = track.scrollWidth - track.clientWidth > 4;
      wrap.classList.toggle('vic-rail-wrap--fijo', !desplazable);
      if (hostNav) hostNav.classList.toggle('vic-rail-wrap--fijo', !desplazable);
      nav.querySelector('[data-ir="-1"]').disabled = track.scrollLeft <= 2;
      nav.querySelector('[data-ir="1"]').disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;

      var actual = indiceActual();
      if (contador) contador.textContent = (actual + 1) + ' / ' + hijos.length;
      Array.prototype.forEach.call(puntos.children, function (d, i) {
        d.classList.toggle('is-on', i === actual);
        d.setAttribute('aria-current', i === actual ? 'true' : 'false');
      });
      /* La misma cuenta marca la tarjeta, no solo el punto: con el carrusel a
         media tarjeta hay que poder ver cuál es la que "cuenta". Es puramente
         visual, por eso va una clase y no un atributo ARIA — el orden real ya
         lo da el DOM. */
      hijos.forEach(function (el, i) { el.classList.toggle('is-actual', i === actual); });
    }

    function irA(i) {
      iObjetivo = Math.max(0, Math.min(hijos.length - 1, i));
      track.scrollTo({ left: destino(iObjetivo), behavior: 'smooth' });
    }
    function mover(dir) { irA(iObjetivo + dir); }

    nav.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ir]');
      if (!b) return;
      mover(parseInt(b.getAttribute('data-ir'), 10));
    });

    // Con el carrusel enfocado, las flechas del teclado avanzan de tarjeta en
    // tarjeta en vez de desplazar unos pocos píxeles.
    track.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      mover(e.key === 'ArrowRight' ? 1 : -1);
    });

    puntos.addEventListener('click', function (e) {
      var d = e.target.closest('[data-i]');
      if (!d) return;
      irA(parseInt(d.getAttribute('data-i'), 10));
    });

    /* Al arrastrar con el dedo el objetivo lo manda el usuario, no nosotros —
       pero solo cuando el desplazamiento se detiene. Sincronizar en cada evento
       de scroll pisaría el objetivo con una posición intermedia de la propia
       animación, que es justo el problema que acabamos de quitar. */
    var reposo;
    track.addEventListener('scroll', function () {
      pintarEstado();
      clearTimeout(reposo);
      reposo = setTimeout(function () { iObjetivo = indiceActual(); }, 140);
    }, { passive: true });

    window.addEventListener('resize', function () { pintarEstado(); iObjetivo = indiceActual(); });
    pintarEstado();
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
    pintarBotonWhatsApp();
    activarEnlacesWhatsApp();
    activarEnlacesPlataforma();
    pintarMascota();
    activarReveal();
    activarCopiar();
    activarContadores();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }

  window.VicUI = {
    urlPlataforma: urlPlataforma,
    urlExamenGratis: urlExamenGratis,
    urlComprar: urlComprar,
    ambientePlataforma: ambientePlataforma,
    plataformaAbierta: plataformaAbierta,
    precioCorto: precioCorto,
    enlaceWhatsApp: enlaceWhatsApp,
    activarEnlacesWhatsApp: activarEnlacesWhatsApp,
    activarEnlacesPlataforma: activarEnlacesPlataforma,
    modal: modal,
    rail: rail,
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
