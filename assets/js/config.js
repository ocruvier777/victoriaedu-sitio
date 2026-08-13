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

  /* --- Redes y reels -------------------------------------------------------
     El público es joven: un reel explica más que un párrafo. La sección de la
     portada se pinta SOLA a partir de esta lista y NO se pinta si está vacía,
     así que el sitio nunca enseña huecos.

     Cada reel necesita:
       url     → la del post de Instagram, tal cual sale de "Copiar enlace".
                 Sirve /reel/CODIGO/ y también /p/CODIGO/.
       portada → imagen vertical (9:16) en uploads/. Es lo único que carga la
                 página; el video de Instagram no se toca hasta que alguien da
                 clic. Sin portada la tarjeta se ve, pero gris.
       titulo  → 4-6 palabras. Es lo que se lee encima del video.

     TODO(Óscar): pega aquí tus reels y el @ de la cuenta.
  ------------------------------------------------------------------------ */
  redes: {
    instagram: '',        // ej. 'victoriaedu.mx' — sin la @
    reels: [
      // { url: 'https://www.instagram.com/reel/XXXXXXXXXXX/',
      //   portada: 'uploads/reel-1.jpg',
      //   titulo: 'Los 3 temas que más caen en el IPN' },
    ],
  },

  /* --- WhatsApp -----------------------------------------------------------
     Formato internacional SIN "+", SIN espacios y SIN guiones.
     México: 52 + 1 + LADA + número. El "1" es el prefijo de móvil que WhatsApp
     sigue aceptando para México; aquí va +52 1 56 3211 8930.
     Si algún día el enlace deja de abrir la conversación, quita el 1:
     '525632118930'. Es el único cambio necesario.
  ------------------------------------------------------------------------ */
  whatsapp: '5215632118930',

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

  /* --- Testimonios ---------------------------------------------------------
     REGLA DURA: aquí solo van citas REALES, de alumnos REALES, con permiso por
     escrito. Los del mockup original eran inventados y por eso se borraron; un
     testimonio falso en una página de educación no es adorno, es fraude.

     El carrusel de la portada se pinta SOLO a partir de esta lista y NO se
     pinta si está vacía. Mientras tanto la prueba social la cargan los
     contadores y la gráfica de cortes, que sí son verificables.

     Cada testimonio:
       cita      → textual. Al recortar se marca con "…"; al sustituir una
                   palabra, entre [corchetes]. Nunca se reescribe una cita.
       nombre    → como el alumno autorizó que aparezca.
       detalle   → quién le dio clase y cuándo.
       iniciales → 2 letras para el monograma.
       anonimo   → true en los que no llevan nombre: se pintan sin monograma,
                   más ligeros, para que no compitan con los verificables.
       destacado → true en uno solo: se pinta en oscuro y cierra el carrusel.

     ATRIBUCIÓN: son reseñas públicas de Facebook a los cursos que Óscar dio en
     Oriéntate MX. Se atribuyen a él como profesor, que es lo cierto. NO se
     presentan como alumnos de VictoriaEDU — eso sí sería falso. El orden es
     deliberado: primero los que llevan nombre y fecha comprobables.
  ------------------------------------------------------------------------ */
  testimonios: [
    {
      cita: 'Ojalá hubieran más profesores como Óscar, clases únicas y amenas. Aprendí a disfrutar las matemáticas.',
      nombre: 'Regina García',
      detalle: 'Alumna de Óscar Cruz · agosto 2024',
      iniciales: 'RG',
    },
    {
      cita: 'El curso de Matemáticas con el profe Oscar fue lo mejor que he visto de matemáticas. Muy fácil de comprender; temas tan complejos que los hace más dinámicos y fáciles de aprender… Sin duda lo volvería a tomar las veces que fueran.',
      nombre: 'Alejandro Romero',
      detalle: 'Alumno de Óscar Cruz · curso de matemáticas, agosto 2022',
      iniciales: 'AR',
    },
    {
      cita: 'El curso de Matemáticas con el profe Oscar es muy divertido y fácil de digerir porque enseña de una manera muy entretenida. Además, siempre te da consejos motivacionales para echarle ganas a la carrera. Lo recomiendo mucho.',
      nombre: 'Cristian Sánchez',
      detalle: 'Alumno de Óscar Cruz · curso de matemáticas, agosto 2022',
      iniciales: 'CS',
    },
    {
      cita: 'De los mejores cursos que puedes tomar para prepararse para los exámenes de admisión a las universidades, es bastante completo… no solo aprendes sino que también te diviertes cotorreando con el grupo y los maestros. 10/10.',
      nombre: 'Joel Mata Pecina',
      detalle: 'Alumno de Óscar Cruz · abril 2024',
      iniciales: 'JM',
    },
    {
      // [El curso de matemáticas] sustituye a "PREMAT", el nombre del programa
      // en Oriéntate MX. Va entre corchetes porque es una sustitución nuestra,
      // no lo que ella escribió.
      cita: '[El curso de matemáticas] con el profe Oscar fue lo mejor, sin duda es un curso accesible y con muy buen material. Lista para el curso de enero.',
      nombre: 'Ainara López J.',
      detalle: 'Alumna de Óscar Cruz · abril 2024',
      iniciales: 'AL',
    },
    {
      cita: 'Excelente manera de explicar los temas. En poco tiempo pude dominar temas que se me hacían difíciles.',
      nombre: 'Alumno del curso de Cálculo',
      detalle: '2023',
      anonimo: true,
    },
    {
      cita: 'Es como si hubiera tenido una venda en los ojos durante muchísimo tiempo que yo trataba de quitar pero no podía, y de repente me la quitan y ahora veo todo de una manera muy diferente… No quiero que se acabe el curso.',
      nombre: 'Alumna de Ingeniería Química',
      detalle: 'Curso de Cálculo, 2023',
      anonimo: true,
      destacado: true,
    },
  ],

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
    imagen: 'assets/img/prog-simulacro.svg',
    imagenAlt: 'Laptop mostrando un examen en línea con cronómetro',
    /* Los 4 puntos de la tarjeta. Cortos a propósito: en la portada se ojean,
       no se leen. La lista larga sigue siendo `incluye`. */
    puntos: [
      '2 exámenes como el real',
      '140 reactivos, inglés incluido',
      'Reporte por materia',
      'Plan de estudio con IA',
    ],
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
    imagen: 'assets/img/prog-matematicas.svg',
    imagenAlt: 'Pizarrón con la gráfica de una función',
    puntos: [
      'De aritmética a cálculo',
      '48 clases en vivo',
      'Práctica diaria adaptativa',
      'Tutor IA 24/7',
    ],
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
    imagen: 'assets/img/prog-admision.svg',
    imagenAlt: 'Lista del proceso de admisión junto a un edificio universitario',
    puntos: [
      'Las 4 áreas del examen',
      'Diagnóstico y ruta personal',
      'Profesores egresados del IPN',
      'Simulacros incluidos',
    ],
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
