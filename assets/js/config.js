/* ==========================================================================
   VictoriaEDU — Configuración de negocio y catálogo
   --------------------------------------------------------------------------
   ESTE ES EL ÚNICO ARCHIVO QUE HAY QUE TOCAR PARA OPERAR.
   Precios, datos bancarios, WhatsApp y estado de los productos viven aquí.
   ========================================================================== */

/* Versión del sitio. Se imprime en el pie, y ahí sirve para una cosa muy
   concreta: cuando alguien reporte "se ve raro", poder preguntarle qué versión
   trae y saber si está viendo caché vieja. Súbela cuando publiques. */
window.VERSION_SITIO = '1.5.0';

window.CONFIG = {
  /* --- Mascota (Vico) ------------------------------------------------------
     null = no se pinta NADA. Ni caja, ni marco, ni silueta gris: un
     placeholder genérico en producción se lee como sitio a medio terminar,
     que es peor que no tener mascota.

     Cuando exista el archivo, se pone la ruta aquí y aparece sola en el
     bloque de diagnóstico gratuito. Ruta acordada:
       mascota: { src: 'assets/brand/vico/vico-diagnostico.webp',
                  alt: 'Vico, la mascota de VictoriaEDU, con una libreta',
                  ancho: 420, alto: 520 }
     `alt` describe a la mascota; si algún día se usa como puro adorno, se
     deja en cadena vacía y el lector de pantalla la salta.
  ------------------------------------------------------------------------ */
  mascota: {
    src: 'assets/brand/vico/vico-diagnostico.webp',
    alt: 'Vico, la mascota de VictoriaEDU, junto a un tablero con el resultado de un diagnóstico',
    ancho: 1600,
    alto: 2000,
  },

  /* Vico en pose pensativa, para la página 404. Misma regla que arriba:
     null = no se pinta nada, ni caja ni placeholder. */
  mascotaPensando: {
    src: 'assets/brand/vico/vico-pensando.webp',
    alt: 'Vico observa confundido una ruta de aprendizaje interrumpida',
    ancho: 1600,
    alto: 2000,
  },

  marca: {
    nombre: 'VictoriaEDU',
    razonSocial: 'Victoria EDU S.A.S. de C.V.',
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

  /* --- Plataforma ----------------------------------------------------------
     El sitio ya NO cobra ni entrega nada por su cuenta: es el escaparate.
     Todo lo que implique una cuenta —presentar el examen, ver respuestas,
     pagar— vive en la plataforma, que sí tiene base de datos y sesión.

     El embudo es: clic → registro → examen gratis → resultados → compra.
     El registro es el peaje, y es a propósito: las respuestas y explicaciones
     solo se ven con cuenta, así que ahí es donde capturamos al alumno.

     examenGratis → id_publico del simulacro demo (precio 0) en la plataforma.
                    Si Brando lo publica con otro id, se cambia AQUÍ y ya.
     base         → sin diagonal final.

     Para probar contra el ambiente de desarrollo, cambia `base` por
     'https://dev-edu.victoriadev.com' y no toques nada más.
     Contrato completo y pendientes del lado de la plataforma:
     ver INTEGRACION-PLATAFORMA.md.
  ------------------------------------------------------------------------ */
  plataforma: {
    base: 'https://edu.victoriadev.com',
    examenGratis: 'SIM-IPN-2026-DEMO',
    rutas: {
      registro: '/registro',
      login: '/login',
      simulacros: '/simulacros',
      examen: '/examenes/',
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
    resumen: 'Dos exámenes por el precio de uno: cada uno vale $199 y te llevas los dos. Más el taller de ejercicios en vivo de cada fin de semana hasta el día del examen, de regalo.',
    /* El paquete son DOS exámenes y cada uno vale $199 por separado: $398 de
       lista, $199 a pagar. Ese es el 2x1 y por eso `precioLista` sí lleva
       número aquí — es un precio real de venta unitaria, no un número inflado
       para tachar. Si algún día se deja de vender el examen suelto a $199,
       este 398 hay que quitarlo: un precio tachado que nunca existió es
       publicidad engañosa, no un descuento.

       TODO(Óscar): definir hasta cuándo corre el 2x1. Una promoción sin
       vigencia declarada no se puede cerrar después sin quedar mal con quien
       la vio. Si es permanente, mejor decirlo así de claro. */
    precio: 199,
    precioLista: 398,
    moneda: 'MXN',
    estado: 'disponible',
    badge: { texto: '2x1 · Disponible', clase: 'vic-badge--solid' },
    meta: '2 exámenes · 70 reactivos c/u · 90 min c/u',
    pagina: 'simulacro-ipn-2026.html',
    /* imagen        → la que se sirve. SIEMPRE tiene que existir.
       imagenAvif    → variante AVIF, opcional. En cuanto exista el archivo se
       pone aquí la ruta y la tarjeta empieza a servirlo por <picture>, con el
       WebP de abajo como respaldo. Mientras esté en null no se emite ningún
       <source> y no hay forma de que quede una imagen rota.

       Las ilustraciones son 1672x941 (16:9 exacto, el mismo que fija
       .vic-producto__img) y pesan entre 35 y 70 KB. WebP es línea base en
       todos los navegadores vivos, así que se sirve directo y no hace falta
       arrastrar las SVG como respaldo. */
    imagen: 'assets/brand/programas/simulacro-ipn.webp',
    imagenAvif: null,   // 'assets/brand/programas/simulacro-ipn.avif'
    imagenWebp: null,   // ya es `imagen`; se usa solo si algún día hay AVIF
    imagenAlt: 'Tableta con un examen de opción múltiple, un cronómetro y una tarjeta de resultados',
    /* Los 4 puntos de la tarjeta. Cortos a propósito: en la portada se ojean,
       no se leen. La lista larga sigue siendo `incluye`. */
    puntos: [
      '2 exámenes por el precio de uno',
      '140 reactivos, inglés incluido',
      'Taller en vivo de regalo',
      'Reporte por materia y plan con IA',
    ],
    incluye: [
      'Dos exámenes por el precio de uno: $199 cada uno por separado, los dos por $199',
      'Dos exámenes de 70 reactivos: la mitad del examen real cada uno',
      'Todas las materias que evalúa el IPN, inglés incluido',
      '90 minutos cronometrados por examen, desde tu casa',
      'Taller de ejercicios en vivo cada fin de semana hasta el día del examen, dentro de la plataforma y sin costo extra',
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
    imagen: 'assets/brand/programas/matematicas-ipn.webp',
    imagenAvif: null,   // 'assets/brand/programas/matematicas-ipn.avif'
    imagenWebp: null,   // ya es `imagen`; se usa solo si algún día hay AVIF
    imagenAlt: 'Tres láminas que avanzan de las figuras básicas a la geometría con compás y de ahí a una curva creciente en papel milimétrico',
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
    /* "Hasta que te quedes": se paga UNA vez y, si no alcanzas lugar, sigues
       en el curso en la siguiente convocatoria sin volver a pagar.

       Ojo con cómo está redactado: promete que NO se vuelve a cobrar, no
       promete la admisión. Son cosas distintas y el sitio no puede prometer
       la segunda — el pie de página dice justamente "la preparación no
       garantiza admisión", y ese aviso se queda.

       TODO(Óscar): antes de publicarlo hay que fijar las condiciones por
       escrito: cuántas convocatorias cubre, qué se exige para conservar el
       beneficio (asistencia, entregas) y qué pasa si el alumno se ausenta.
       Sin eso, la promesa es imposible de sostener en una reclamación. */
    resumen: 'El programa completo de admisión: las cuatro áreas del examen, diagnóstico inicial, ruta personalizada y acompañamiento hasta el día de la prueba. Pagas una sola vez: si no te quedas, sigues en el curso sin volver a pagar.',
    precio: 5900,
    precioLista: null,
    moneda: 'MXN',
    estado: 'proximamente',
    badge: { texto: 'Próximamente', clase: 'vic-badge--warning' },
    meta: 'Siguiente generación por confirmar',
    pagina: null,
    imagen: 'assets/brand/programas/admision-ipn.webp',
    imagenAvif: null,   // 'assets/brand/programas/admision-ipn.avif'
    imagenWebp: null,   // ya es `imagen`; se usa solo si algún día hay AVIF
    imagenAlt: 'Tres rutas con nodos que convergen y suben hacia el arco de entrada de una escuela',
    puntos: [
      'Pago único hasta que te quedes',
      'Las 4 áreas del examen',
      'Diagnóstico y ruta personal',
      'Profesores egresados del IPN',
    ],
    incluye: [
      'Pago único: si no alcanzas lugar, sigues en el curso la siguiente convocatoria sin volver a pagar',
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
