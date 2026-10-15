/* ==========================================================================
   VictoriaEDU — Configuración de negocio y catálogo
   --------------------------------------------------------------------------
   ESTE ES EL ÚNICO ARCHIVO QUE HAY QUE TOCAR PARA OPERAR.
   Precios, datos bancarios, WhatsApp y estado de los productos viven aquí.
   ========================================================================== */

/* Versión del sitio. Se imprime en el pie, y ahí sirve para una cosa muy
   concreta: cuando alguien reporte "se ve raro", poder preguntarle qué versión
   trae y saber si está viendo caché vieja. Súbela cuando publiques. */
window.VERSION_SITIO = '1.9.0';

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

  /* --- Video del simulacro -------------------------------------------------
     El recorrido de 60 segundos que se enseña en el hero de la landing del
     simulacro. Misma regla que la mascota: `null` = todavía no existe, y el
     placeholder abre un modal que lo dice ("Próximamente"). NUNCA se pinta un
     reproductor vacío ni un iframe apuntando a nada.

     CUANDO EXISTA EL VIDEO, LA URL VA AQUÍ Y NO HAY QUE TOCAR NADA MÁS.
     Se pega TAL CUAL sale de la barra de direcciones: pagina-simulacro.js la
     convierte sola a la forma incrustable. Todas estas valen:

       YouTube → 'https://www.youtube.com/watch?v=CODIGO'   ← la de la barra
                 'https://youtu.be/CODIGO'
                 'https://www.youtube.com/embed/CODIGO'
       Vimeo   → 'https://vimeo.com/CODIGO'
       MP4     → 'uploads/simulacro-recorrido.mp4'

     Sin `autoplay` a propósito: el video se reproduce cuando el visitante lo
     pide, no cuando abre la página.

     OJO AL PEGARLA: comprueba que el código sea el del video de VictoriaEDU y
     no el de otra pestaña. Un iframe apuntando al video de otra empresa se ve
     perfectamente bien —carga, se reproduce— y nadie lo nota hasta que un
     alumno lo ve en el hero.

     El mecanismo está probado de punta a punta: se pegó una URL de prueba, se
     vio la miniatura en el hero y el video reproduciéndose en sitio, y se
     devolvió a `null`. Poner el definitivo es cambiar ESTA LÍNEA y nada más.

     TODO(Óscar): graba el recorrido y pon la URL aquí, en lugar del null.
  ------------------------------------------------------------------------ */
  videoSimulacro: 'https://youtu.be/fY0caXDm2i4',

  /* Portada del video: la imagen que se ve ANTES de darle play, en el hero.
     --------------------------------------------------------------------------
     `null` no significa "sin portada". Con YouTube se usa sola la miniatura del
     propio video, que es lo normal y no hay nada que hacer.

     Esta clave es para dos casos:

       1. El video NO es de YouTube. Vimeo no publica su miniatura en una URL
          predecible —haría falta llamar a su API— y un MP4 propio no tiene
          ninguna. Sin portada, el hero se queda con la caja de marca.
       2. Se quiere una portada propia: un fotograma elegido, con rótulo, en vez
          de la que YouTube escogió.

     Va una ruta local, no una URL externa: es la imagen más grande del hero de
     una página que recibe tráfico pagado, y no conviene que dependa de un
     tercero. 16:9, y que se entienda a 320px de ancho.

       videoSimulacroPortada: 'uploads/portada-simulacro.jpg',
  ------------------------------------------------------------------------ */
  videoSimulacroPortada: null,

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
     Todo lo que implique una cuenta —guardar tu resultado, la revisión de
     respuestas, pagar— vive en la plataforma, que sí tiene base de datos.

     EL EMBUDO CAMBIÓ (plataforma #75/#79/#80/#81/#82, ya en su rama main):
     el examen gratis ya NO exige cuenta para presentarse. Se contesta suelto
     en /gratis/{id}, y al entregarlo la plataforma guarda un `claim_token` de
     48 h en el navegador; la cuenta se pide para VER la calificación, que es
     donde el alumno ya invirtió veinte minutos y el registro le cuesta menos.

         clic → /gratis/PUB-IPN-2026-GRATIS → contesta → registro o Google
              → /gratis/resultado (aciertos y %) → upsell → /paquetes/ipn-2026

     Ya no se manda `next=`: nunca se implementó del lado de la plataforma y
     este flujo no lo necesita. El desvío post-registro lo decide la propia
     plataforma cuando ve el claim pendiente.

     AMBIENTES. La landing de producción habla SOLO con la plataforma de
     producción —el campus, campus.victoriaedu.com.mx—; cualquier otro host
     —localhost, una preview, la rama dev— habla con dev. Se resuelve por
     hostname a propósito, para que las ramas `main` y `dev` del sitio NO
     diverjan: son el mismo código servido en dos lugares, así que un merge
     nunca pelea por esta línea. El ambiente resuelto se imprime en el pie
     cuando NO es producción, para que una landing pública apuntando a dev se
     note a simple vista.

     `abierto` es lo que decide si el botón manda a la plataforma o abre el
     aviso de "todavía no". El EXAMEN GRATIS ya está abierto en producción: es
     el CTA del que vive la landing del simulacro, que recibe tráfico pagado.
     La COMPRA sigue cerrada porque Mercado Pago continúa en sandbox.

     Contrato completo, estado de cada pendiente y qué falta para producción:
     ver INTEGRACION-PLATAFORMA.md.
  ------------------------------------------------------------------------ */
  plataforma: {
    /* Los únicos hosts que hablan con la plataforma de producción. Todo lo
       demás cae en dev, que es el default seguro: un preview pegándole a
       producción mete alumnos de prueba en la base real. */
    hostsProduccion: ['victoriaedu.com.mx', 'www.victoriaedu.com.mx'],

    ambientes: {
      produccion: {
        base: 'https://campus.victoriaedu.com.mx',
        /* El examen gratis ya abrió: su flujo está publicado y es el CTA al
           que apunta la pauta de la landing del simulacro. La compra sigue
           cerrada porque Mercado Pago está en sandbox y sin credenciales en
           prod, así que cobraría con dinero de mentiras. */
        examenAbierto: true,
        compraAbierta: false,
      },
      dev: {
        base: 'https://dev-edu.victoriadev.com',
        examenAbierto: true,
        compraAbierta: true,
      },
    },

    /* id_publico del examen gratis. Son 10 reactivos sacados de los dos
       simulacros de venta (6 de V1 y 4 de V2), sin timer. */
    examenGratis: 'PUB-IPN-2026-GRATIS',
    /* Slug del paquete 2x1 de $199 (los dos simulacros). */
    paquete: 'ipn-2026',

    rutas: {
      gratis: '/gratis/',
      paquete: '/paquetes/',
      registro: '/registro',
      login: '/login',
      simulacros: '/simulacros',
    },
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

     ATRIBUCIÓN — hay DOS orígenes y no se mezclan:

     1. Óscar Cruz · reseñas PÚBLICAS de Facebook a los cursos que dio en
        Oriéntate MX. Son públicas, llevan nombre y se citan con él.
     2. Emiliano Ricardez · mensajes PRIVADOS (WhatsApp y DM) de los alumnos
        del curso de matemáticas de la segunda vuelta, agosto 2026. Un mensaje
        privado NO es una reseña pública: nadie lo escribió para publicarse.
        Por eso van sin nombre, sin foto y sin captura — solo la cita.

     TODO(Emiliano) ANTES DE PUBLICAR: pídele a cada uno un "sí" por escrito en
     el mismo chat ("¿te parece si publicamos esto en la página, sin tu
     nombre?") y guarda la captura de la respuesta. Si alguno autoriza aparecer
     con nombre, quítale el `anonimo` y ponlo. Si alguno dice que no, se borra
     la entrada y ya. No se publica ninguna captura de pantalla: el fondo de
     WhatsApp deja ver el número, el grupo y la foto de perfil.

     NINGUNO se presenta como alumno de VictoriaEDU cuando no lo es. El orden
     es deliberado: primero los verificables con nombre, luego los recientes.
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
    /* --- Curso de matemáticas de la segunda vuelta · Emiliano Ricardez -------
       Agosto de 2026, el grupo que está corriendo AHORITA. Van aquí, después
       de los verificables con nombre y antes de los viejos, porque son los
       únicos que hablan de una clase que el visitante todavía puede tomar.
       Se conservan las palabras del alumno; entre [corchetes] va lo nuestro y
       "…" marca lo que se recortó. Solo se añadieron comas y puntos donde el
       mensaje no los traía — de otro modo la cita se lee como un descuido
       nuestro, no como un mensaje escrito de prisa en el celular. */
    {
      cita: 'Una vez que entré a sus grupos de estudio me di cuenta [de] la facilidad con la que explica y, sobre todo, que nos facilita mucho la comprensión… En poco más de 1 mes que llevamos siento que he avanzado bastante.',
      nombre: 'Estudiante del curso de matemáticas',
      detalle: 'Grupo de Emiliano Ricardez · segunda vuelta IPN, agosto 2026',
      anonimo: true,
    },
    {
      cita: 'Estoy viendo las clases grabadas y qué chulada de enseñanza.',
      nombre: 'Estudiante del curso de matemáticas',
      detalle: 'Grupo de Emiliano Ricardez · segunda vuelta IPN, agosto 2026',
      anonimo: true,
    },
    {
      cita: 'Todavía no manejo bien la plataforma, pero aprendí. Muchas gracias, es muy bueno como profesor, estoy muy feliz.',
      nombre: 'Estudiante del curso de matemáticas',
      detalle: 'Grupo de Emiliano Ricardez · segunda vuelta IPN, agosto 2026',
      anonimo: true,
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

  /* --- Blog ----------------------------------------------------------------
     Índice de artículos. El blog existe para BÚSQUEDA: cada artículo ataca un
     tema que alguien teclea en Google mientras estudia ("qué es el MRU",
     "fórmulas de movimiento rectilíneo uniforme"), y de ahí lo invitamos a la
     plática. No es un diario de la empresa: si un artículo no responde una
     duda concreta del temario del IPN, no va.

     Los archivos viven PLANOS en la raíz (`blog-<slug>.html`), no en una
     carpeta `blog/`. Motivo: ui.js pinta el header con rutas relativas
     (`index.html`, `tienda.html`), y desde `/blog/x.html` esas rutas
     apuntarían a `/blog/index.html`. Mover todo a rutas absolutas rompería
     abrir el sitio con file://, que es como se revisa en local.

     Cada entrada:
       slug     → identificador; el archivo es `blog-<slug>.html`
       titulo   → el <h1> del artículo, tal cual
       resumen  → 1–2 líneas; se usa en la tarjeta del índice
       materia  → para agrupar y filtrar: Física, Matemáticas, Química…
       fecha    → ISO (YYYY-MM-DD). Ordena el índice, de más nuevo a más viejo
       minutos  → lectura estimada, redondeada
     Para publicar: se añade aquí y se crea el HTML. El índice se pinta solo.
  ------------------------------------------------------------------------ */
  blog: [
    {
      slug: 'movimiento-rectilineo-uniforme',
      titulo: 'Movimiento rectilíneo uniforme (MRU): fórmulas, gráficas y los errores que cuestan aciertos',
      resumen: 'Qué es el MRU, de dónde sale x = x₀ + vt, cómo se leen sus dos gráficas y las tres trampas con las que el examen tira a quien solo memorizó la fórmula.',
      materia: 'Física',
      fecha: '2026-10-12',
      minutos: 9,
    },
    {
      slug: 'leyes-de-newton',
      titulo: 'Las tres leyes de Newton: qué dice cada una, cuándo se usa y los errores clásicos',
      resumen: 'Inercia, F = ma y acción-reacción explicadas una por una, con diagramas de cuerpo libre, la diferencia entre masa y peso y cinco ejercicios del estilo que cae en el examen.',
      materia: 'Física',
      fecha: '2026-10-14',
      minutos: 11,
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

   TODO el catálogo manda a la plática: el embudo del ciclo IPN 2027 pasa por
   `platica.html` (sesión gratuita por Zoom donde se explican los paquetes
   y se apartan los $100 de reserva). Por eso los tres productos aquí tienen
   `pagina: 'platica.html'` y, en vez de un CTA de "comprar", abren la
   invitación. El simulacro se dejó fuera del array a propósito: la página
   `simulacro-ipn-2026.html` sigue en línea para enlaces viejos, pero ya no
   aparece en la tienda ni compite con el nuevo embudo.

   Las ilustraciones son 1672x941 (16:9 exacto, el mismo que fija
   .vic-producto__img). WebP es línea base en todos los navegadores vivos, así
   que se sirve directo. `alv-victoria.webp` todavía no existe —no hay portada
   del paquete ALV— y por eso `imagen: null`: la tarjeta pinta el fondo de
   marca sin imagen hasta que llegue el archivo final.
   ========================================================================== */
window.CATALOGO = [
  {
    id: 'ruta-al-poli-2027',
    slug: 'ruta-al-poli-2027',
    nombre: 'Ruta al Poli · IPN 2027',
    resumen: 'Matemáticas desde cero (oct–dic) y preparación integral IPN (ene–examen 2027): clases en vivo los fines de semana, grabaciones y simulacros, con los tres fundadores al frente.',
    precio: 3000,
    precioLista: null,
    moneda: 'MXN',
    estado: 'disponible',
    badge: { texto: 'Apartar en la plática', clase: 'vic-badge--solid' },
    meta: 'Inicia 31 oct 2026 · Hasta el examen IPN 2027',
    pagina: 'platica.html',
    imagen: 'assets/brand/programas/admision-ipn.webp',
    imagenAvif: null,
    imagenWebp: null,
    imagenAlt: 'Vico frente al pórtico del IPN con el letrero #IPNdeCorazón y una curva ascendente',
    puntos: [
      'Matemáticas + preparación IPN 2027',
      'Clases en vivo sábado y domingo',
      'Vico y simulacros incluidos',
      'Reserva tu lugar con $100',
    ],
    incluye: [
      'Etapa 1 — Matemáticas From Zero to Hero (oct–dic 2026): aritmética, álgebra, trigonometría, geometría y precálculo',
      'Etapa 2 — Preparación Integral IPN (ene 2027 al examen): todas las materias del área + simulacros',
      'Clases en vivo sábados y domingos de 8:00 a 11:00 am (CDMX), con grabaciones',
      'Asesorías gratuitas entre semana por la tarde',
      'Acceso al campus Victoria EDU con actividades y apoyo con Vico',
      'Profesores: Brando, Emiliano y Óscar — ingenieros del IPN',
      'Reservación con $100; liquidación antes del domingo 15 de noviembre de 2026',
    ],
  },
  {
    id: 'alv-victoria-2027',
    slug: 'alv-victoria-2027',
    nombre: 'ALV · A La Victoria',
    resumen: 'Todo lo de Ruta al Poli y, si no entras al IPN, repites ambos cursos cada ciclo hasta que te asignen tu aspirante — sin costo adicional.',
    precio: 4499,
    precioLista: null,
    moneda: 'MXN',
    estado: 'disponible',
    badge: { texto: 'Hasta que te quedes', clase: 'vic-badge--warning' },
    meta: 'Solo $1,499 más que Ruta al Poli',
    pagina: 'platica.html',
    imagen: null,
    imagenAvif: null,
    imagenWebp: null,
    imagenAlt: 'Portada del paquete ALV · A La Victoria (en preparación)',
    puntos: [
      'Todo lo de Ruta al Poli',
      'Repites ambos cursos cada ciclo',
      'Hasta que te asignen tu aspirante',
      'Sin costo adicional en siguientes convocatorias',
    ],
    incluye: [
      'Todo el contenido de Ruta al Poli',
      'Si no entras al IPN, repites ambos cursos cada ciclo hasta ingresar, sin costo adicional',
      'Mismo horario y mismos profesores: Brando, Emiliano y Óscar',
      'Reservación con $100; liquidación antes del 15 de noviembre de 2026',
    ],
  },
  {
    id: 'solo-matematicas-2026',
    slug: 'solo-matematicas-2026',
    nombre: 'Solo Matemáticas',
    resumen: 'Para quienes buscan regularizarse en matemáticas sin tomar la preparación IPN completa. Mismo contenido From Zero to Hero: aritmética, álgebra, trigonometría, geometría y precálculo.',
    precio: 700,
    precioLista: null,
    moneda: 'MXN',
    estado: 'disponible',
    badge: { texto: 'Regularización', clase: 'vic-badge--neutral' },
    meta: 'Oct–dic 2026 · Sin preparación IPN',
    pagina: 'platica.html',
    imagen: 'assets/brand/programas/matematicas-ipn.webp',
    imagenAvif: null,
    imagenWebp: null,
    imagenAlt: 'Vico en pose de triunfo con el letrero Matemáticas From Zero to Hero',
    puntos: [
      'Aritmética → precálculo',
      'Clases en vivo fin de semana',
      'Grabaciones incluidas',
      'Sin preparación IPN',
    ],
    incluye: [
      'Matemáticas From Zero to Hero completo (oct–dic 2026)',
      'Aritmética, álgebra, trigonometría, geometría y precálculo',
      'Clases en vivo sábados y domingos de 8:00 a 11:00 am (CDMX), con grabaciones',
      'Asesorías gratuitas entre semana por la tarde',
      'No incluye la etapa de preparación IPN de enero',
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
