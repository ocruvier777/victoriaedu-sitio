/* ==========================================================================
   VictoriaEDU — Capa de datos (VictoriaAPI)
   --------------------------------------------------------------------------
   Aquí ya NO hay pedidos, folios ni comprobantes.

   El sitio dejó de cobrar: todo lo que implica una cuenta —presentar el
   examen, ver respuestas, pagar— vive en la plataforma (edu.victoriadev.com),
   que sí tiene base de datos, sesión y validación de comprobante por un admin.
   Lo que había aquí guardaba pedidos en localStorage, o sea: se perdían al
   cambiar de navegador y solo los veía ese alumno. Ver INTEGRACION-PLATAFORMA.md.

   Lo único que sobrevive es la captura de leads, porque cubre un caso que la
   plataforma no tiene: avisarle a alguien cuando abra un producto que TODAVÍA
   no existe (los 'proximamente' del catálogo) o cuando cambie la convocatoria.
   Esa gente no puede registrarse en la plataforma porque no hay nada que
   comprar todavía.

   Sigue viviendo en localStorage y sigue siendo una solución a medias: los
   leads solo existen en el navegador de quien los dejó, y se ven desde
   admin.html en esa misma máquina. Para que sirvan de verdad hace falta que
   la plataforma exponga un POST público de leads.
   ========================================================================== */

(function () {
  'use strict';

  var LS = {
    leads: 'vic.leads',
  };

  /* --- utilidades de almacenamiento --------------------------------------- */
  function leer(clave, porDefecto) {
    try {
      var raw = localStorage.getItem(clave);
      return raw ? JSON.parse(raw) : porDefecto;
    } catch (e) {
      console.warn('VictoriaAPI: no se pudo leer ' + clave, e);
      return porDefecto;
    }
  }

  function escribir(clave, valor) {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (e) {
      console.warn('VictoriaAPI: no se pudo escribir ' + clave, e);
      return false;
    }
  }

  var VictoriaAPI = {
    /* --- LEADS -------------------------------------------------------------
       origen: 'lista-espera' | 'convocatoria-segunda-vuelta'
    ---------------------------------------------------------------------- */

    registrarLead: function (datos) {
      var leads = leer(LS.leads, []);
      var lead = {
        id: 'L-' + Date.now().toString(36).toUpperCase(),
        productoId: datos.productoId || '',
        productoNombre: datos.productoNombre || '',
        nombre: datos.nombre || '',
        correo: datos.correo,
        telefono: datos.telefono || '',
        origen: datos.origen || 'sitio',
        creado: new Date().toISOString(),
      };
      leads.unshift(lead);
      escribir(LS.leads, leads);
      return Promise.resolve(lead);
    },

    listarLeads: function () {
      return Promise.resolve(leer(LS.leads, []));
    },

    /** Borra los leads guardados. Útil para volver a grabar un demo. */
    reiniciar: function () {
      Object.keys(LS).forEach(function (k) { localStorage.removeItem(LS[k]); });
      return Promise.resolve();
    },
  };

  window.VictoriaAPI = VictoriaAPI;
})();
