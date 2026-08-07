/* ==========================================================================
   VictoriaEDU — Capa de datos (VictoriaAPI)
   --------------------------------------------------------------------------
   PARA BRANDO:

   Este archivo es la ÚNICA frontera entre las vistas y la persistencia.
   Hoy todo vive en localStorage para que el mockup sea navegable de punta a
   punta sin servidor. Para conectar el back real no hay que tocar ninguna
   página: basta reimplementar los métodos de abajo con fetch().

   Todos los métodos son async y ya devuelven promesas, justamente para que el
   cambio a HTTP no altere el código que los consume.

   Contrato sugerido de endpoints:
     POST   /api/pedidos                      -> crearPedido(datos)
     GET    /api/pedidos/:folio               -> obtenerPedido(folio)
     GET    /api/pedidos                      -> listarPedidos()
     POST   /api/pedidos/:folio/comprobante   -> adjuntarComprobante(folio, file)
     PATCH  /api/pedidos/:folio               -> actualizarEstado(folio, estado, nota)
     POST   /api/leads                        -> registrarLead(datos)
     GET    /api/leads                        -> listarLeads()

   Estados de un pedido (máquina de estados):
     pendiente_pago       recién creado, el alumno aún no transfiere
     comprobante_recibido el alumno subió su comprobante, falta que validemos
     pagado               validado a mano; se libera el acceso
     rechazado            el comprobante no correspondía / no llegó el dinero
     cancelado            el alumno desistió o venció la ventana
   ========================================================================== */

(function () {
  'use strict';

  var LS = {
    pedidos: 'vic.pedidos',
    leads: 'vic.leads',
    borrador: 'vic.checkout.borrador',
    folioActual: 'vic.checkout.folio',
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

  /* Folio legible y corto: VE-A7K3Q2 — el alumno lo dicta por WhatsApp. */
  function generarFolio() {
    var alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin I, O, 0, 1
    var s = '';
    for (var i = 0; i < 6; i++) {
      s += alfabeto.charAt(Math.floor(Math.random() * alfabeto.length));
    }
    return 'VE-' + s;
  }

  /* Reduce la imagen del comprobante antes de guardarla: localStorage tiene
     ~5 MB y una foto de celular se los come sola. El back real no necesita
     esto (sube el archivo tal cual), por eso vive aquí y no en la vista. */
  function comprimirImagen(file, maxLado, calidad) {
    return new Promise(function (resolve, reject) {
      if (!file.type.startsWith('image/')) {
        // Un PDF no se puede redimensionar en canvas: se guarda la referencia.
        resolve({ dataUrl: null, nombre: file.name, tipo: file.type, peso: file.size });
        return;
      }
      var lector = new FileReader();
      lector.onerror = function () { reject(new Error('No se pudo leer el archivo')); };
      lector.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error('El archivo no es una imagen válida')); };
        img.onload = function () {
          var escala = Math.min(1, maxLado / Math.max(img.width, img.height));
          var w = Math.round(img.width * escala);
          var h = Math.round(img.height * escala);
          var canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve({
            dataUrl: canvas.toDataURL('image/jpeg', calidad),
            nombre: file.name,
            tipo: 'image/jpeg',
            peso: file.size,
          });
        };
        img.src = lector.result;
      };
      lector.readAsDataURL(file);
    });
  }

  /* ======================================================================== */

  var VictoriaAPI = {

    /* --- PEDIDOS ---------------------------------------------------------- */

    /**
     * Crea un pedido en estado 'pendiente_pago'.
     * @param {{productoId:string, nombre:string, correo:string, telefono:string,
     *          carrera?:string, metodoPago:string, monto:number}} datos
     * @returns {Promise<Object>} el pedido creado, con folio asignado
     */
    crearPedido: function (datos) {
      // TODO(Brando): return fetch('/api/pedidos', {method:'POST', body: JSON.stringify(datos)}).then(r => r.json());
      var pedidos = leer(LS.pedidos, []);
      var pedido = {
        folio: generarFolio(),
        productoId: datos.productoId,
        productoNombre: datos.productoNombre,
        nombre: datos.nombre,
        correo: datos.correo,
        telefono: datos.telefono || '',
        carrera: datos.carrera || '',
        metodoPago: datos.metodoPago,
        monto: datos.monto,
        moneda: 'MXN',
        estado: 'pendiente_pago',
        comprobante: null,
        nota: '',
        creado: new Date().toISOString(),
        actualizado: new Date().toISOString(),
      };
      pedidos.unshift(pedido);
      escribir(LS.pedidos, pedidos);
      escribir(LS.folioActual, pedido.folio);
      return Promise.resolve(pedido);
    },

    /** @returns {Promise<Object|null>} */
    obtenerPedido: function (folio) {
      // TODO(Brando): return fetch('/api/pedidos/' + folio).then(r => r.json());
      var p = leer(LS.pedidos, []).find(function (x) { return x.folio === folio; });
      return Promise.resolve(p || null);
    },

    /** @returns {Promise<Object[]>} más reciente primero */
    listarPedidos: function () {
      // TODO(Brando): return fetch('/api/pedidos').then(r => r.json());
      return Promise.resolve(leer(LS.pedidos, []));
    },

    /**
     * Adjunta el comprobante y mueve el pedido a 'comprobante_recibido'.
     * @param {string} folio
     * @param {File} file
     */
    adjuntarComprobante: function (folio, file) {
      // TODO(Brando): FormData + POST /api/pedidos/:folio/comprobante
      return comprimirImagen(file, 1400, 0.72).then(function (img) {
        var pedidos = leer(LS.pedidos, []);
        var i = pedidos.findIndex(function (x) { return x.folio === folio; });
        if (i === -1) throw new Error('Pedido no encontrado: ' + folio);
        pedidos[i].comprobante = {
          nombre: img.nombre,
          tipo: img.tipo,
          peso: img.peso,
          dataUrl: img.dataUrl,
          subido: new Date().toISOString(),
        };
        pedidos[i].estado = 'comprobante_recibido';
        pedidos[i].actualizado = new Date().toISOString();
        var ok = escribir(LS.pedidos, pedidos);
        if (!ok) {
          // El almacenamiento se llenó: conservamos el pedido sin la imagen.
          pedidos[i].comprobante.dataUrl = null;
          escribir(LS.pedidos, pedidos);
        }
        return pedidos[i];
      });
    },

    /**
     * Cambia el estado de un pedido. Lo usa el panel admin.
     * @param {string} folio
     * @param {'pendiente_pago'|'comprobante_recibido'|'pagado'|'rechazado'|'cancelado'} estado
     * @param {string} [nota]
     */
    actualizarEstado: function (folio, estado, nota) {
      // TODO(Brando): PATCH /api/pedidos/:folio {estado, nota}
      var pedidos = leer(LS.pedidos, []);
      var i = pedidos.findIndex(function (x) { return x.folio === folio; });
      if (i === -1) return Promise.reject(new Error('Pedido no encontrado: ' + folio));
      pedidos[i].estado = estado;
      if (typeof nota === 'string') pedidos[i].nota = nota;
      pedidos[i].actualizado = new Date().toISOString();
      escribir(LS.pedidos, pedidos);
      return Promise.resolve(pedidos[i]);
    },

    /* --- LEADS (lista de espera de productos 'proximamente') --------------- */

    registrarLead: function (datos) {
      // TODO(Brando): POST /api/leads
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
      // TODO(Brando): GET /api/leads
      return Promise.resolve(leer(LS.leads, []));
    },

    /* --- BORRADOR DE CHECKOUT (estado entre pantallas) --------------------- */
    /* Esto sí es propio del navegador y se queda aquí aunque llegue el back. */

    guardarBorrador: function (datos) {
      var actual = leer(LS.borrador, {});
      escribir(LS.borrador, Object.assign(actual, datos));
      return Promise.resolve(leer(LS.borrador, {}));
    },

    obtenerBorrador: function () {
      return Promise.resolve(leer(LS.borrador, {}));
    },

    limpiarBorrador: function () {
      localStorage.removeItem(LS.borrador);
      return Promise.resolve();
    },

    folioActual: function () {
      return leer(LS.folioActual, null);
    },

    /* --- Utilidades expuestas --------------------------------------------- */

    /** Semilla de pedidos de ejemplo para poder enseñar el panel admin lleno. */
    sembrarEjemplos: function () {
      var pedidos = leer(LS.pedidos, []);
      if (pedidos.some(function (p) { return p.demo; })) return Promise.resolve(pedidos);
      var hace = function (h) { return new Date(Date.now() - h * 3600e3).toISOString(); };
      var demo = [
        { folio: 'VE-K4M2XP', nombre: 'Ana Karen Martínez', correo: 'anakaren@ejemplo.com', telefono: '5512345678', carrera: 'ESIME Zacatenco', estado: 'comprobante_recibido', creado: hace(3) },
        { folio: 'VE-P9T7BR', nombre: 'Jesús Olvera', correo: 'jesus.olvera@ejemplo.com', telefono: '5598765432', carrera: 'UPIICSA', estado: 'pagado', creado: hace(26) },
        { folio: 'VE-H3W8LQ', nombre: 'Daniela Vega', correo: 'dani.vega@ejemplo.com', telefono: '5544332211', carrera: 'ESCOM', estado: 'pendiente_pago', creado: hace(1) },
        { folio: 'VE-R6N4ZK', nombre: 'Luis Ángel Ramírez', correo: 'luisangel@ejemplo.com', telefono: '5511223344', carrera: 'ESIA Zacatenco', estado: 'pagado', creado: hace(52) },
        { folio: 'VE-D2F5YV', nombre: 'Mariana Solís', correo: 'mariana.solis@ejemplo.com', telefono: '5566778899', carrera: 'ENCB', estado: 'rechazado', nota: 'El comprobante correspondía a otro depósito.', creado: hace(74) },
      ].map(function (d) {
        return Object.assign({
          productoId: 'simulacro-ipn-2026',
          productoNombre: 'Simulacro IPN 2026',
          metodoPago: 'transferencia',
          monto: 299, moneda: 'MXN',
          comprobante: d.estado === 'pendiente_pago' ? null : { nombre: 'comprobante.jpg', tipo: 'image/jpeg', peso: 184320, dataUrl: null, subido: d.creado },
          nota: d.nota || '',
          actualizado: d.creado,
          demo: true,
        }, d);
      });
      escribir(LS.pedidos, pedidos.concat(demo));
      return Promise.resolve(leer(LS.pedidos, []));
    },

    /** Borra todo. Útil para volver a grabar el demo desde cero. */
    reiniciar: function () {
      Object.keys(LS).forEach(function (k) { localStorage.removeItem(LS[k]); });
      return Promise.resolve();
    },

    /* Etiquetas legibles de cada estado, usadas por admin y confirmación. */
    ESTADOS: {
      pendiente_pago:       { texto: 'Pendiente de pago',   clase: 'vic-badge--neutral' },
      comprobante_recibido: { texto: 'Por revisar',         clase: 'vic-badge--warning' },
      pagado:               { texto: 'Pagado',              clase: 'vic-badge--success' },
      rechazado:            { texto: 'Rechazado',           clase: 'vic-badge--danger'  },
      cancelado:            { texto: 'Cancelado',           clase: 'vic-badge--neutral' },
    },
  };

  window.VictoriaAPI = VictoriaAPI;
})();
