/* ==========================================================================
   VictoriaEDU — Métricas del embudo
   --------------------------------------------------------------------------
   El sitio no tenía NADA de medición: ni Analytics, ni Pixel, ni un contador.
   Eso está bien mientras no gastes en tráfico; deja de estarlo en cuanto el
   negocio depende de un embudo de tres saltos que cruza a otro dominio.

   El problema concreto: el sitio y la plataforma son dos aplicaciones
   distintas. Cuando alguien da clic en "Haz el examen gratis" se va a
   edu.victoriadev.com y desde aquí ya no lo vemos. Sin registrar el clic,
   la única cifra disponible es "cuántos se registraron", sin denominador —
   no hay forma de saber si el embudo convierte mal o si simplemente nadie
   llegó al botón.

   Esto NO es analítica: es el enchufe donde se conecta la analítica. Empuja
   los eventos a window.dataLayer (que es lo que leen GTM, GA4 y el Pixel de
   Meta) y si no hay nadie escuchando, los escribe en la consola. El día que
   pongas un pixel, se pega el snippet en el <head> y los eventos ya están
   fluyendo: no hay que volver a tocar un solo botón.

   Uso declarativo, igual que data-wa y data-plataforma:
     <a data-metrica="examen_gratis_clic" data-metrica-lugar="hero">

   Eventos que emite hoy:
     examen_gratis_clic  → alguien salió al registro para el examen gratis
     comprar_clic        → alguien salió a la plataforma a comprar
     lead_enviado        → alguien dejó su correo en una lista de espera

   `lugar` dice DESDE DÓNDE salió (hero, navbar, popup, producto-final…), que
   es lo que permite saber qué CTA carga el embudo y cuál sobra.
   ========================================================================== */

(function () {
  'use strict';

  function evento(nombre, datos) {
    var payload = Object.assign({ event: nombre, sitio: 'victoriaedu-landing' }, datos || {});

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);

    /* Sin pixel instalado, dataLayer es un array que nadie lee. La consola es
       lo que permite verificar el embudo a mano antes de que exista medición
       de verdad. */
    if (!window.gtag && !window.fbq) {
      console.debug('[métrica]', nombre, payload);
    }
  }

  /* Delegación en document: los CTAs del navbar y del popup se inyectan por JS
     después de que este archivo corre, así que engancharlos uno por uno no
     funcionaría. Escuchando arriba, da igual cuándo aparezcan. */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-metrica]');
    if (!el) return;
    evento(el.getAttribute('data-metrica'), {
      lugar: el.getAttribute('data-metrica-lugar') || 'sin-lugar',
      destino: el.getAttribute('href') || '',
    });
  });

  window.VicMetricas = { evento: evento };
})();
