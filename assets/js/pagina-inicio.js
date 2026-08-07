/* ==========================================================================
   VictoriaEDU — Lógica del landing (index.html)
   ========================================================================== */

(function () {
  'use strict';

  var esc = window.VicUI.escapar;

  /* --- Programas: se pintan desde el catálogo ----------------------------- */
  var grid = document.getElementById('programasGrid');
  if (grid) {
    grid.innerHTML = window.CATALOGO.map(function (p) {
      return window.VicProductos.tarjeta(p, { detallada: false });
    }).join('');
  }

  /* --- Sparkline de mejora ------------------------------------------------
     Forma ilustrativa de la curva de avance típica, no una serie medida.
     TODO(Óscar): si tienes el avance real por generación, va aquí.
  ------------------------------------------------------------------------ */
  var spark = document.getElementById('sparkMejora');
  if (spark) {
    spark.innerHTML = window.VicUI.sparkline([58, 63, 71, 76, 84, 89, 96], { ancho: 84, alto: 30 });
  }

  /* --- Diagnóstico gratuito ------------------------------------------------ */
  var form = document.getElementById('formDiagnostico');
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
        nombre: form.elements.nombre.value.trim(),
        correo: correo,
        origen: 'diagnostico-gratuito',
      }).then(function () {
        form.classList.add('vic-hidden');
        document.getElementById('okDiagnostico').classList.remove('vic-hidden');
      });
    });
  }

  /* --- Diploma: se abre en grande cuando exista la imagen ------------------ */
  var verDiploma = document.getElementById('verDiploma');
  if (verDiploma) {
    verDiploma.addEventListener('click', function () {
      var img = verDiploma.querySelector('img');
      if (!img) { window.VicUI.toast('El diploma todavía no se ha subido'); return; }
      var overlay = document.createElement('div');
      overlay.className = 'vic-modal';
      overlay.innerHTML =
        '<div class="vic-modal__caja" style="max-width:720px">' +
          '<button class="vic-modal__cerrar" type="button" aria-label="Cerrar">✕</button>' +
          '<h3 style="font-size:20px;margin:0 0 14px">Diplomado UNIR · IA generativa aplicada a la educación</h3>' +
          '<img src="' + img.getAttribute('src') + '" alt="' + esc(img.getAttribute('alt') || '') + '" style="width:100%;border-radius:8px;display:block">' +
        '</div>';
      document.body.appendChild(overlay);
      var cerrar = function () { overlay.remove(); };
      overlay.querySelector('.vic-modal__cerrar').addEventListener('click', cerrar);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) cerrar(); });
    });
  }
})();
