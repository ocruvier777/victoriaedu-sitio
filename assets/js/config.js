/* ==========================================================================
   VictoriaEDU — Configuración de negocio y catálogo
   --------------------------------------------------------------------------
   ESTE ES EL ÚNICO ARCHIVO QUE HAY QUE TOCAR PARA OPERAR.
   Precios, datos bancarios, WhatsApp y estado de los productos viven aquí.
   ========================================================================== */

window.CONFIG = {
  marca: {
    nombre: 'VictoriaEDU',
    razonSocial: 'Victoria EDU S.A.S.',
    correo: 'hola@victoriaedu.mx',
    correoInstituciones: 'instituciones@victoriaedu.mx',
    telefono: '+52 55 0000 0000',
    ciudad: 'Ciudad de México, México',
  },

  /* --- WhatsApp -----------------------------------------------------------
     Formato internacional SIN "+", SIN espacios y SIN guiones.
     México: 52 + LADA + número. Ej. CDMX 55 1234 5678 -> '525512345678'
     TODO(operación): sustituir por el número real de atención antes de publicar.
  ------------------------------------------------------------------------ */
  whatsapp: '525500000000',

  /* --- Datos para transferencia SPEI ---------------------------------------
     TODO(operación): sustituir por los datos reales de la cuenta.
     La "referencia" que el alumno debe poner es su folio (VE-XXXXXX).
  ------------------------------------------------------------------------ */
  banco: {
    beneficiario: 'Victoria EDU S.A.S. de C.V.',
    institucion: 'BBVA México',
    clabe: '012180001234567895',
    cuenta: '0123456789',
    concepto: 'Simulacro IPN 2026',
  },

  /* --- Pasarelas de pago ---------------------------------------------------
     mercadopago.activo = false  -> se muestra como "Próximamente" y deshabilitado.
     Cuando Brando conecte el back, poner true y llenar publicKey.
  ------------------------------------------------------------------------ */
  pagos: {
    transferencia: {
      activo: true,
      etiqueta: 'Transferencia SPEI',
      descripcion: 'Pagas desde tu banca en línea. Revisamos y liberamos tu acceso el mismo día.',
      horasRevision: 24,
    },
    mercadopago: {
      activo: false,
      etiqueta: 'Tarjeta, OXXO y meses sin intereses',
      descripcion: 'Débito, crédito y efectivo en OXXO con acceso inmediato.',
      publicKey: '',       // TODO(Brando): APP_USR-...
      preferenceUrl: '',   // TODO(Brando): POST /api/pagos/mercadopago/preferencia
    },
  },

  /* --- Ventana de lanzamiento --------------------------------------------- */
  lanzamiento: {
    fecha: '2026-08-14T09:00:00-06:00',
    etiqueta: '14 de agosto de 2026',
  },

  /* --- Estructura del examen real del IPN ----------------------------------
     Verificado contra la convocatoria oficial de nivel superior, modalidad
     escolarizada (admision.ipn.mx), ciclo agosto 2026 – enero 2027:
     140 preguntas, máximo 3 horas efectivas, y el contenido va en español
     "exceptuando la sección que evaluará el conocimiento del idioma inglés".

     OJO: el diseño original del sitio decía 130 reactivos. Era incorrecto.
  ------------------------------------------------------------------------ */
  examen: {
    reactivos: 140,
    horas: 3,
    incluyeIngles: true,
    // Nuestro simulacro: dos mitades del examen real.
    simulacro: { partes: 2, reactivosPorParte: 70, minutosPorParte: 90 },
  },

  /* --- Convocatoria de segunda vuelta --------------------------------------
     Datos tomados de la convocatoria oficial del IPN, Nivel Superior,
     modalidad escolarizada, periodo febrero–julio 2027 (segundo proceso de
     admisión del ciclo 2026-2027):
     admision.ipn.mx/nse/convocatoria/index-272.html

     TODO(Óscar): esta página caduca. Cuando salga la convocatoria siguiente,
     actualiza estas fechas y el enlace. Si el prerregistro ya cerró, la página
     lo dice sola y cambia el CTA — no hace falta tocar nada más.
  ------------------------------------------------------------------------ */
  convocatoria: {
    nombre: 'Segunda vuelta IPN · periodo febrero–julio 2027',
    ciclo: '2026-2027',
    prerregistroInicio: '2026-07-15',
    prerregistroCierre: '2026-08-30T23:59:59-06:00',
    resultados: '2026-10-24',
    inicioClases: 'febrero de 2027',
    urlOficial: 'https://www.admision.ipn.mx/nse/convocatoria/index-272.html',
    urlPortal: 'https://www.admision.ipn.mx/',
    // El examen real: no es lo mismo que nuestro simulacro.
    equipo: [
      'Computadora de escritorio o laptop — no se permite celular ni tableta',
      'Cámara web de 480 a 720 píxeles',
      'Micrófono funcional',
      'Internet de mínimo 5 Mbps',
      'Chrome 87+ o Firefox 78+',
      '4 GB de RAM y 300 MB de almacenamiento libre',
    ],
  },

  /* --- Acceso al panel admin (SOLO MOCKUP) ---------------------------------
     Esto NO es seguridad: es una compuerta visual para poder enseñar el flujo.
     La autenticación real la implementa el back.
  ------------------------------------------------------------------------ */
  admin: { clave: 'victoria2026' },
};

/* ==========================================================================
   Catálogo
   --------------------------------------------------------------------------
   estado: 'disponible' | 'proximamente' | 'agotado'
   Solo los 'disponible' se pueden comprar; el resto captura lista de espera.
   ========================================================================== */
window.CATALOGO = [
  {
    id: 'simulacro-ipn-2026',
    slug: 'simulacro-ipn-2026',
    nombre: 'Simulacro IPN 2026',
    resumen: 'Dos exámenes de 70 reactivos con todas las materias del examen real, inglés incluido. Reporte por área y plan de estudio generado por IA y revisado por un profesor.',
    precio: 299,
    precioLista: null,
    moneda: 'MXN',
    estado: 'disponible',
    badge: { texto: 'Disponible', clase: 'vic-badge--solid' },
    meta: '2 exámenes · 70 reactivos c/u · 90 min c/u',
    pagina: 'simulacro-ipn-2026.html',
    imagen: 'https://images.unsplash.com/photo-1561089489-f13d5e730d72?auto=format&fit=crop&w=1200&q=80',
    imagenAlt: 'Alumnos resolviendo un simulacro',
    incluye: [
      'Dos exámenes de 70 reactivos: la mitad del examen real cada uno',
      'Todas las materias que evalúa el IPN, inglés incluido',
      '90 minutos cronometrados por examen, desde tu casa',
      'Reporte por área y por materia después de cada examen',
      'Plan de estudio semana por semana generado por IA',
      'Revisión de un profesor antes de enviarte el plan',
    ],
  },
  {
    id: 'curso-matematicas-ipn-2027',
    slug: 'curso-matematicas-ipn-2027',
    nombre: 'Curso de Matemáticas IPN 2027',
    resumen: 'De aritmética a cálculo diferencial, en el orden en que el examen lo pide. Clases en vivo dos veces por semana más práctica dirigida diaria.',
    precio: 3850,
    precioLista: null,
    moneda: 'MXN',
    estado: 'proximamente',
    badge: { texto: 'Próximamente', clase: 'vic-badge--warning' },
    meta: 'Arranca el 5 de octubre · 24 semanas',
    pagina: null,
    imagen: 'https://images.unsplash.com/photo-1453733190371-0a9bedd82893?auto=format&fit=crop&w=1200&q=80',
    imagenAlt: 'Ecuaciones en el pizarrón',
    incluye: [
      '48 clases en vivo con grabación',
      'Práctica diaria adaptativa',
      'Tutor IA 24/7 supervisado por profesor',
      'Tres simulacros parciales incluidos',
    ],
  },
  {
    id: 'curso-admision-ipn',
    slug: 'curso-admision-ipn',
    nombre: 'Curso de Admisión IPN',
    resumen: 'El programa completo de admisión: las cuatro áreas del examen, diagnóstico inicial, ruta personalizada y acompañamiento hasta el día de la prueba.',
    precio: 5900,
    precioLista: null,
    moneda: 'MXN',
    estado: 'proximamente',
    badge: { texto: 'Próximamente', clase: 'vic-badge--warning' },
    meta: 'Siguiente generación por confirmar',
    pagina: null,
    imagen: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    imagenAlt: 'Clase presencial con profesor frente al grupo',
    incluye: [
      'Las cuatro áreas del examen de admisión',
      'Diagnóstico de entrada y ruta personalizada',
      'Clases en vivo con profesores egresados del IPN',
      'Simulacros incluidos a lo largo del programa',
    ],
  },
];

/* Helpers de catálogo ------------------------------------------------------ */
window.getProducto = function (id) {
  return window.CATALOGO.find(function (p) { return p.id === id; }) || null;
};

window.formatoMXN = function (n) {
  return '$' + Number(n).toLocaleString('es-MX') + ' MXN';
};
