/* ==========================================================================
   VictoriaEDU — Popup de conversión
   Va solo en las páginas de contenido (cortes y convocatoria): son las que
   traen tráfico de búsqueda y las que necesitan una salida hacia el producto.
   NO va en las páginas de compra — ahí estorbaría.

   Reglas:
   · Una vez cada 7 días, no una vez por pestaña. sessionStorage no sirve aquí:
     es por pestaña, así que el mismo visitante lo volvería a ver al abrir otra.
   · Espera a que haya leído algo (35% de scroll) o 25 s. Un popup inmediato
     interrumpe antes de dar valor y se cierra sin leerse.
   · Se puede cerrar con Escape, con la ✕ y con "Seguir leyendo".
   · Respeta prefers-reduced-motion.
   ========================================================================== */

(function () {
  'use strict';

  var LLAVE = 'vic.popup.simulacro';
  var ESPERA_MS = 25000;
  var SCROLL_MIN = 0.35;
  var DESCANSO_MS = 7 * 24 * 3600 * 1000;   // 7 días

  function vistoRecientemente() {
    try {
      var t = parseInt(localStorage.getItem(LLAVE), 10);
      return !isNaN(t) && (Date.now() - t) < DESCANSO_MS;
    } catch (e) { return false; }   // modo privado: mejor mostrarlo que fallar
  }

  if (vistoRecientemente()) return;

  var mostrado = false;
  var temporizador;

  function marcarVisto() {
    try { localStorage.setItem(LLAVE, String(Date.now())); } catch (e) { /* modo privado */ }
  }

  function cerrar(overlay) {
    overlay.classList.remove('vic-popup--on');
    document.removeEventListener('keydown', onKey);
    setTimeout(function () { overlay.remove(); }, 200);
    marcarVisto();
  }

  var onKey;

  function mostrar() {
    if (mostrado) return;
    mostrado = true;
    clearTimeout(temporizador);
    window.removeEventListener('scroll', onScroll);

    var p = window.getProducto ? window.getProducto('simulacro-ipn-2026') : null;
    if (!p || p.estado !== 'disponible') { marcarVisto(); return; }

    var overlay = document.createElement('div');
    overlay.className = 'vic-popup';
    overlay.innerHTML =
      '<div class="vic-popup__caja" role="dialog" aria-modal="true" aria-labelledby="popupTitulo">' +
        '<button class="vic-modal__cerrar" type="button" aria-label="Cerrar">✕</button>' +
        '<div class="vic-popup__cinta">Gratis · 10 reactivos</div>' +
        '<h2 id="popupTitulo" style="font-size:26px;line-height:1.2;margin:0 0 12px">Ya sabes cuánto pide tu carrera. ¿Sabes cuánto sacas tú?</h2>' +
        '<p style="font-size:16px;line-height:1.6;margin:0 0 20px">Contesta 10 reactivos reales del examen del IPN y mira tu resultado con las respuestas explicadas una por una. No cuesta nada.</p>' +
        '<ul class="vic-lista-check" style="margin:0 0 24px;font-size:15px">' +
          '<li>10 reactivos como los del examen real</li>' +
          '<li>Tu puntaje y en qué materia lo pierdes</li>' +
          '<li>Cada respuesta explicada, no solo la palomita</li>' +
        '</ul>' +
        '<div class="vic-popup__acciones">' +
          '<a class="vic-btn vic-btn--primary vic-btn--lg" href="' + window.VicUI.urlExamenGratis() + '" data-metrica="examen_gratis_clic" data-metrica-lugar="popup">Haz el examen gratis</a>' +
          '<button class="vic-btn vic-btn--ghost vic-btn--lg" type="button" data-seguir>Seguir leyendo</button>' +
        '</div>' +
        '<p style="font-size:13px;line-height:1.5;margin:14px 0 0;opacity:.7">Creas tu cuenta y lo presentas al instante.</p>' +
      '</div>';

    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('vic-popup--on'); });

    onKey = function (e) { if (e.key === 'Escape') cerrar(overlay); };
    document.addEventListener('keydown', onKey);

    overlay.querySelector('.vic-modal__cerrar').addEventListener('click', function () { cerrar(overlay); });
    overlay.querySelector('[data-seguir]').addEventListener('click', function () { cerrar(overlay); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) cerrar(overlay); });
    // Comprar también cuenta como visto: no debe reaparecer al volver atrás.
    overlay.querySelector('a').addEventListener('click', marcarVisto);

    var foco = overlay.querySelector('a');
    if (foco) foco.focus();
  }

  function onScroll() {
    var alto = document.documentElement.scrollHeight - window.innerHeight;
    if (alto > 0 && window.scrollY / alto >= SCROLL_MIN) mostrar();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  temporizador = setTimeout(mostrar, ESPERA_MS);
})();
