/* ==========================================================================
   VictoriaEDU — Landing del Simulacro IPN 2026
   --------------------------------------------------------------------------
   Dos piezas, ninguna imprescindible: si este archivo no carga, la página
   sigue leyéndose y todos sus CTA siguen funcionando.

     1. VideoSimulacroPlaceholder — la portada del video del hero.
     2. El carrusel de los tres fundadores.

   ¿DÓNDE VA LA URL DEL VIDEO? En `assets/js/config.js`, en `CONFIG.videoSimulacro`.
   Aquí NO se escribe ninguna URL a mano: mientras esa clave sea `null` el
   placeholder abre un modal de "Próximamente", y en cuanto tenga valor el mismo
   clic abre el reproductor. No hay que tocar ni este archivo ni el HTML.
   ========================================================================== */

(function () {
  'use strict';

  var C = window.CONFIG || {};
  var UI = window.VicUI;
  if (!UI) return;

  var esc = UI.escapar;

  /* ==========================================================================
     1 · VideoSimulacroPlaceholder
     --------------------------------------------------------------------------
     El marcado de la portada vive en el HTML, no aquí: es texto que describe el
     producto y tiene que existir aunque el JavaScript falle o tarde. Esto le
     añade dos cosas: la miniatura real del video y la reproducción en sitio.

     EL VIDEO SE REPRODUCE DENTRO DE LA MISMA CAJA, no en un modal. Al pulsar,
     el reproductor sustituye al botón y hereda su 16:9. El único modal que
     queda es el de "todavía no hay video", donde no hay nada que reproducir.

     Sigue sin precargarse nada: la portada es una imagen, y el <iframe> o el
     <video> no se crean hasta que alguien pulsa. Es la misma regla que ya sigue
     .vic-reel en la portada del sitio.
     ========================================================================== */

  /* Normaliza lo que sea que venga en CONFIG.videoSimulacro.
     --------------------------------------------------------------------------
     Existe por un motivo concreto: la URL que YouTube enseña en la barra de
     direcciones —`youtube.com/watch?v=CODIGO`— NO se puede incrustar. YouTube
     responde a esa ruta con `X-Frame-Options`, así que el <iframe> se queda en
     negro con "video no disponible" y no hay ningún error en consola que lo
     explique. Es exactamente la URL que uno copia sin pensar, así que en vez de
     pedir que el que la pegue se acuerde de convertirla, se convierte aquí.

     Se aceptan: watch?v=, youtu.be/, /shorts/, /live/, /embed/ ya hecha,
     vimeo.com/ID, player.vimeo.com/video/ID, y archivos propios. */
  function fuenteVideo(url) {
    var u = String(url).trim();

    // Archivo propio en uploads/: se sirve tal cual, con <video>
    if (/\.(mp4|webm|ogv)(\?|#|$)/i.test(u)) return { proveedor: 'archivo', id: null, src: u };

    var yt = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
    if (yt) return { proveedor: 'youtube', id: yt[1], src: 'https://www.youtube.com/embed/' + yt[1] };

    var vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vm) return { proveedor: 'vimeo', id: vm[1], src: 'https://player.vimeo.com/video/' + vm[1] };

    // Cualquier otro proveedor: se confía en que ya venga en forma incrustable.
    return { proveedor: 'otro', id: null, src: u };
  }

  /* De dónde sale la miniatura.
     --------------------------------------------------------------------------
     `CONFIG.videoSimulacroPortada` manda siempre: es una imagen propia en
     uploads/ y evita pedirle nada a un tercero. Si no la hay, YouTube publica
     la suya en una URL predecible y se usa esa.

     Vimeo NO tiene URL de miniatura predecible —hace falta llamar a su API— y
     no vamos a añadir una petición a un servicio externo por una imagen: si el
     video es de Vimeo, se queda la caja de marca hasta que alguien ponga una
     portada propia. Con un MP4 pasa lo mismo, salvo que ahí basta con exportar
     un fotograma. */
  function portadaDe(v) {
    if (C.videoSimulacroPortada) return C.videoSimulacroPortada;
    if (v.proveedor === 'youtube') return 'https://i.ytimg.com/vi/' + v.id + '/maxresdefault.jpg';
    return null;
  }

  /* El reproductor. Lleva `autoplay` A PROPÓSITO y no contradice la regla de
     "sin autoplay": esa regla es sobre la CARGA de la página. Aquí el video se
     crea en respuesta a un clic, o sea que arrancar es exactamente lo que la
     persona acaba de pedir. Obligarla a pulsar play dos veces sería un error. */
  function reproductor(v) {
    if (v.proveedor === 'archivo') {
      return '<video controls autoplay playsinline src="' + esc(v.src) + '">' +
        'Tu navegador no puede reproducir este video. ' +
        '<a href="' + esc(v.src) + '">Descárgalo aquí</a>.' +
      '</video>';
    }

    // rel=0 evita cerrar con recomendaciones de otros canales; playsinline
    // impide que iOS se lo lleve a pantalla completa por su cuenta.
    var sep = v.src.indexOf('?') === -1 ? '?' : '&';
    return '<iframe src="' + esc(v.src + sep + 'autoplay=1&rel=0&playsinline=1') + '" ' +
      'title="Conoce cómo funciona el simulacro IPN 2026" ' +
      'allow="autoplay; encrypted-media; picture-in-picture; fullscreen" ' +
      'allowfullscreen></iframe>';
  }

  /* Todavía no hay video. Se dice con esas palabras en vez de dejar el botón
     muerto: un control que no responde se lee como una página rota, y quien
     llegó hasta aquí vino de un anuncio. El aviso reencamina al diagnóstico,
     que es lo que sí se puede hacer hoy. */
  function avisoProximamente() {
    return '<div class="vic-stack" style="gap:16px">' +
      '<div><span class="vic-tag">Próximamente</span></div>' +
      '<h2 style="font-size:24px;line-height:1.22;margin:0">Próximamente: recorrido completo del simulacro</h2>' +
      '<p style="font-size:16px;line-height:1.6;margin:0">' +
        'Estamos grabando el video que te enseña la plataforma por dentro: cómo se ve un reactivo, ' +
        'cómo corre el cronómetro y cómo llega tu reporte.' +
      '</p>' +
      '<p style="font-size:16px;line-height:1.6;margin:0">' +
        'Mientras tanto, la forma más rápida de conocerlo es contestarlo: son 10 reactivos y no cuesta nada.' +
      '</p>' +
      '<a class="vic-btn vic-btn--primary vic-btn--lg vic-btn--block" data-plataforma="examen" ' +
        'data-metrica="examen_gratis_clic" data-metrica-lugar="simulacro-modal-video">' +
        'Hacer mi diagnóstico gratis' +
      '</a>' +
    '</div>';
  }

  /* Pinta la miniatura por detrás del texto de la portada. */
  function montarPortada(caja, disparador, v) {
    var src = portadaDe(v);
    if (!src) return;

    var img = new Image();
    img.className = 'vic-video-ph__portada';
    img.alt = '';                       // decorativa: el <button> ya se anuncia
    img.setAttribute('aria-hidden', 'true');
    img.decoding = 'async';

    /* maxresdefault no existe para todos los videos —YouTube solo la genera si
       el original venía en HD— y cuando falta devuelve un 404, no una imagen.
       hqdefault sí existe siempre. El reintento va antes del `src` para no
       perderse el error si la imagen está en caché. */
    if (v.proveedor === 'youtube' && !C.videoSimulacroPortada) {
      img.addEventListener('error', function reintento() {
        img.removeEventListener('error', reintento);
        img.src = 'https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg';
      });
    }

    img.src = src;
    disparador.insertBefore(img, disparador.firstChild);
    caja.classList.add('vic-video-ph--conportada');
  }

  /* Sustituye la portada por el reproductor, en la misma caja. */
  function reproducirEnSitio(caja, v) {
    var marco = document.createElement('div');
    marco.className = 'vic-video-ph__marco';
    marco.innerHTML = reproductor(v);

    caja.innerHTML = '';
    caja.appendChild(marco);
    caja.classList.add('vic-video-ph--reproduciendo');
    caja.classList.remove('vic-video-ph--conportada');

    /* El foco estaba en el botón que acabamos de borrar. Sin esto se cae al
       principio del documento y quien navega con teclado pierde el hilo justo
       al empezar el video. */
    var reproductorEl = marco.firstElementChild;
    if (reproductorEl) {
      reproductorEl.setAttribute('tabindex', '-1');
      reproductorEl.focus({ preventScroll: true });
    }
  }

  function montarVideo() {
    var caja = document.querySelector('[data-video-simulacro]');
    if (!caja) return;
    var disparador = caja.querySelector('.vic-video-ph__disparador');
    if (!disparador) return;

    var url = C.videoSimulacro;
    var v = url ? fuenteVideo(url) : null;

    if (v) montarPortada(caja, disparador, v);

    disparador.addEventListener('click', function () {
      if (v) { reproducirEnSitio(caja, v); return; }

      /* Sin video no hay nada que reproducir en sitio, así que aquí —y solo
         aquí— sigue teniendo sentido un aviso emergente. */
      UI.modal(avisoProximamente(), {
        titulo: 'Próximamente: recorrido completo del simulacro',
        ancho: '460px',
      });

      /* El CTA del aviso se inyecta después de que corrió el arranque de ui.js,
         así que hay que pasarle la puerta de la plataforma otra vez. La función
         es idempotente: marca los enlaces que ya enganchó. */
      UI.activarEnlacesPlataforma();
    });
  }

  /* ==========================================================================
     2 · Carrusel de los tres fundadores
     --------------------------------------------------------------------------
     Las tarjetas ya están en el HTML —son texto indexable y una bio de una
     persona real no se genera desde JS—; esto solo les añade flechas, puntos y
     teclado. Sin JS el riel sigue arrastrándose con el dedo, que es como lo va a
     usar la mayoría.
     ========================================================================== */
  function montarAutores() {
    var riel = document.getElementById('autoresRail');
    if (!riel) return;
    UI.rail(riel, { etiqueta: 'Fundadores de VictoriaEDU', navEn: '#autoresNav' });
  }

  function iniciar() {
    montarVideo();
    montarAutores();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
