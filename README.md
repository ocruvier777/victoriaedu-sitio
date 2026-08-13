# VictoriaEDU — sitio

Sitio estático: portada, catálogo, página de producto y tres páginas de contenido
sobre el examen del IPN.

**El sitio ya no cobra.** Es el escaparate. Todo lo que implica una cuenta
—presentar el examen, ver respuestas, pagar— vive en la plataforma
(`edu.victoriadev.com`), que sí tiene base de datos, sesión y validación de
comprobante. El botón principal es **"Haz el examen gratis"** y salta al registro
de la plataforma con un `next=` que lo deja en el examen demo.

El flujo completo, qué falta del lado de la plataforma y las instrucciones para
Brando están en **[INTEGRACION-PLATAFORMA.md](INTEGRACION-PLATAFORMA.md)**.

> El checkout propio (`checkout.html` → `pago.html` → `confirmacion.html`) se
> retiró: guardaba los pedidos en `localStorage`, o sea que se perdían al cambiar
> de navegador. Los archivos siguen ahí, convertidos en redirecciones, porque hay
> ligas compartidas apuntando a ellos.

---

## Cómo verlo

Necesita servirse por HTTP (abrir con `file://` rompe las tipografías):

```bash
cd /home/ocruvier/landing
python3 -m http.server 8000
# abrir http://localhost:8000
```

> **Si ves la página sin estilos**, es caché del navegador. Los archivos llevan
> `?v=6` justo para evitarlo: al cambiar CSS o JS, **sube ese número en todos los
> `.html`** (o recarga con Ctrl+Shift+R).

Para probar contra el ambiente de desarrollo de la plataforma, cambia
`CONFIG.plataforma.base` a `https://dev-edu.victoriadev.com` en
`assets/js/config.js`. Es lo único que hay que tocar.

Lista de espera: `http://localhost:8000/admin.html` — clave `victoria2026`.

---

## Páginas

| Archivo | Qué es |
|---|---|
| `index.html` | Landing madre: manifiesto, motor tecnológico, programas, método, equipo, resultados, captura de leads |
| `tienda.html` | Catálogo de los tres programas |
| `simulacro-ipn-2026.html` | Página de producto del simulacro, con cuenta regresiva |
| `ipn.html` | Guía del examen: estructura, áreas, cómo se califica, equipo y calendario |
| `aciertos-ipn.html` | Cortes históricos del IPN en gráfica: 105 carreras, filtros y comparador contra tu puntaje |
| `convocatoria-ipn-segunda-vuelta.html` | Página SEO de la convocatoria de segunda vuelta: fechas, requisitos y equipo necesario |
| `admin.html` | Lista de espera capturada en este navegador |
| `checkout.html` · `pago.html` | Redirecciones a la plataforma (el checkout viejo) |
| `confirmacion.html` | Explica a dónde se fue la compra; no redirige, por si alguien llega con un folio `VE-` viejo |

El header y el footer no están duplicados en el HTML: los pinta `assets/js/ui.js`
para que haya un solo lugar donde tocarlos.

### El menú

Un solo árbol en `ui.js` (`NAV`), idéntico en las diez páginas — está verificado
en la batería de pruebas, que compara la firma del menú de cada una:

```
Inicio · Programas ▾ · IPN ▾ · Método · Equipo · [CTA]
```

- **Programas** abre un mega panel con una tarjeta por programa, sacada del
  catálogo. Los que no están a la venta llevan a la tienda con su ancla, nunca a
  un vacío. El rótulo es un enlace real a `tienda.html`.
- **IPN** agrupa las tres páginas de contenido (guía, aciertos, convocatoria);
  antes eran dos entradas sueltas hablando de lo mismo.
- **Cómo se abre:** en escritorio, al pasar el ratón; el clic navega a la página
  del rótulo. En táctil no hay hover, así que el primer toque abre el acordeón y
  el segundo navega. También responde a teclado y se cierra con Escape.
- El CTA es lo único que varía: `data-cta="examen"` ("Haz el examen gratis") en las
  páginas públicas, `"comprar"` en la página del producto —donde el alumno ya viene
  decidido— y `"ninguno"` en las páginas internas.

### La portada

Está escrita para un público joven que decide en segundos y desde el celular:
**siete secciones**, ninguna con muros de texto, y contacto siempre a la vista.

| Sección | Qué hace |
|---|---|
| Hero | Qué es, para quién y dos botones. La bajada son 22 palabras. |
| Qué hacemos + equipo | Cuatro tarjetas de una línea y tres caras. |
| Programas | Tarjeta con imagen, 4 viñetas y "Conoce más". |
| Método | Los cinco pasos, ≤12 palabras cada uno. |
| Resultados | Contadores y la gráfica de cortes. |
| Prueba social | Cita gigante + carrusel de testimonios en cristal. |
| En video | Reels de Instagram. |
| Cierre | Diagnóstico gratis + WhatsApp. |

La banda de prueba social (`.vic-social`) es la única con **glassmorphism**, y
lleva su propio fondo por una razón técnica: el cristal no es un color, es un
desenfoque de lo que hay detrás. Las manchas de color de `.vic-social::before`
son ese "detrás" — sobre un fondo plano las tarjetas se verían como rectángulos
grises. Si algún día se cambia el fondo de la sección, hay que revisarlas. Los
navegadores sin `backdrop-filter` caen a un `@supports` que sube la opacidad:
se pierde el cristal, no la legibilidad.

Tres reglas que conviene no romper al editarla:

- **El texto largo no se borra, se esconde.** Cada "Conoce más" abre un modal
  cuyo contenido vive en un `<div class="vic-hidden" id="mas-CLAVE">` del propio
  `index.html`, junto al botón `data-mas="CLAVE"`. Va en HTML y no en una cadena
  de JS para que siga siendo texto indexable y editable a mano.
- **Las secciones sin contenido no se pintan.** Testimonios y reels salen de
  `CONFIG.testimonios` y `CONFIG.redes.reels`; con la lista vacía el bloque se
  queda con su `vic-hidden`. Nunca hay un hueco ni un placeholder en producción.
- **Instagram no se carga hasta el clic.** La tarjeta del reel es una portada;
  el `<iframe>` se crea al abrir el modal. Incrustarlo de entrada metería el
  script de Instagram en cada visita, y eso sí se nota en un celular.

### Piezas compartidas nuevas (`ui.js`)

- `VicUI.modal(html, opts)` — el único modal del sitio: Escape, clic en el
  fondo, bloqueo de scroll, foco encerrado y devuelto al botón que lo abrió.
  Devuelve `{ caja, cerrar }`; el cierre está **delegado en el overlay**, así
  que repintar `caja.innerHTML` no lo rompe. Antes había tres copias a mano.
- `VicUI.rail(track, opts)` — carrusel sobre un `.vic-rail` dentro de un
  `.vic-rail-wrap`. El desplazamiento y el enganche son CSS nativo; esto solo
  añade flechas y contador "3 / 7" (escritorio), puntos (móvil) y flechas de
  teclado, y se retira solo si todo cabe sin desplazar. Con `opts.navEn` las
  flechas cuelgan de otra fila —la del encabezado— en vez de quedarse solas
  encima del carrusel, que abría un hueco enorme.
- Modificadores del carrusel: `.vic-rail--ancho` es **una tarjeta por vista**
  (`grid-auto-columns: 100%`, con `scroll-snap-stop: always` para que un
  manotazo no se salte tres); `.vic-rail--reels` va estrecho, para 9:16.
- **Botón flotante de WhatsApp**, inyectado en todas las páginas salvo las de
  `data-cta="ninguno"`. En el HTML, cualquier `<a data-wa="mensaje">` recibe su
  `href` desde `CONFIG.whatsapp`: el número vive en un solo sitio.
- `popup-simulacro.js` **no** se migró al modal compartido: usa `.vic-popup`,
  que es otro componente (entrada animada y bookkeeping de 7 días), no una
  cuarta copia del mismo.

---

## El sistema gráfico

`assets/css/victoria.css` es el design system (tokens, botones, tarjetas,
rejillas). `assets/css/victoria-marca.css` va **después** y solo añade la piel:
texturas, geometría de la V, rutas, separadores y microinteracciones. Si se
borra ese segundo archivo, el sitio sigue funcionando y siendo legible — es la
prueba de que es piel y no estructura.

Todo color, ángulo, grosor y duración sale del bloque de tokens que abre el
archivo. No hay valores de marca escritos a mano más abajo.

| Pieza | Clase | Dónde se usa |
|---|---|---|
| Fragmentos V | `.v-pattern` + `-subtle` / `-medium` / `-dark` | `-subtle` en secciones claras · `-medium` solo en tarjetas · `-dark` en fondos de color |
| Cuaderno Victoria | `.academic-grid` + `--claro` / `--oscuro` | Claro en "Qué hacemos"; el oscuro está integrado en `.vic-blueprint` (hero y método) |
| Separadores | `.section-divider--*` | Las 6 páginas públicas, 16 en total |
| Ruta del método | `.vic-ruta` | Recorre los cinco pasos; vertical en móvil |
| Iconos de marca | `data-icono="materia\|tutor\|progreso\|tecnologia"` | Las cuatro tarjetas de "Qué hacemos" |
| Hueco de mascota | `.mascot-slot` + `data-mascota` | Bloque de diagnóstico gratuito |

**Portadas de programa.** Viven en `assets/brand/programas/*.webp`, son 1672×941
(16:9 exacto, el mismo que fija `.vic-producto__img`) y pesan entre 35 y 70 KB.
WebP es línea base en todos los navegadores vivos, así que se sirven directo
desde `imagen` en el catálogo. Si algún día hay variantes AVIF, se pone la ruta
en `imagenAvif` y la tarjeta pasa sola a `<picture>` con el WebP de respaldo.

Las tres llevan `width`/`height` para que el navegador reserve el espacio antes
de descargar nada. La primera de la portada se carga sin `lazy` porque entra
casi con el primer scroll; las otras dos sí van diferidas.

Para pintar una textura en una sección hay que envolverla con `.vic-lienzo`, que
crea el contexto de posicionamiento y sube el contenido por encima de la capa.

**Dos cosas que conviene no "arreglar" a ojo:**

- **Las opacidades de trama no son intercambiables.** Lo que se ve no es la
  opacidad, es el contraste contra el fondo: un 5% de blanco sobre guinda
  profundo casi no se nota, y ese mismo 5% sobre el azul institucional grita.
  Por eso la variante oscura va más baja que la clara, al revés de lo que
  sugeriría el número. Están calibradas mirándolas.
- **La variante `-medium` es para tarjetas, no para secciones.** En un área
  grande se lee como papel tapiz y le pelea la atención al contenido.

Las rutas se dibujan al entrar en viewport enganchadas a `[data-reveal].is-visible`,
la clase que ya pone el observer de `ui.js`: **no hay JavaScript nuevo**. Con
`prefers-reduced-motion` quedan dibujadas en su estado final, no a medias.

---

## El embudo

El sitio no cobra: convence y entrega al alumno a la plataforma. El registro es el
peaje, y es a propósito — las respuestas y explicaciones del examen solo se ven con
cuenta, así que ahí es donde se captura al alumno, con base de datos detrás.

```
victoriaedu.mx   "Haz el examen gratis"
      ↓
edu.victoriadev.com/registro?next=/examenes/SIM-IPN-2026-DEMO&origen=landing-examen-gratis
      ↓  crea cuenta → auto-login → aterriza en el examen
10 reactivos gratis  →  resultados con respuestas explicadas
      ↓
/simulacros  →  "Comprar — $199"  →  comprobante  →  validación  →  desbloqueado
```

Todos los CTAs salen por `VicUI.urlExamenGratis()` / `urlComprar()`
(`assets/js/ui.js`), que leen `CONFIG.plataforma`. En el HTML basta
`<a data-plataforma="examen">` o `="comprar"`: ninguna página tiene el dominio
escrito a mano, igual que con `data-wa`.

**Lo que falta del lado de la plataforma** —el examen demo, el soporte de `next=`,
el precio a $199— está en **[INTEGRACION-PLATAFORMA.md](INTEGRACION-PLATAFORMA.md)**.
Mientras Brando no haga esos cambios el embudo funciona a medias: el alumno se
registra bien, pero aterriza en su dashboard en vez de en el examen.

### Medición

`assets/js/metricas.js` empuja eventos a `window.dataLayer` (lo que leen GTM, GA4 y
el Pixel de Meta) y a la consola si no hay pixel instalado. Es el enchufe, no la
analítica: el día que se instale un pixel, los eventos ya están fluyendo.

Se declara en el HTML con `data-metrica="nombre" data-metrica-lugar="dónde"`.
Eventos: `examen_gratis_clic`, `comprar_clic`, `lead_enviado`.

El `lugar` importa: como el embudo cruza a otro dominio, es lo único que permite
saber qué CTA carga el embudo y cuál sobra.

---

## Antes de publicar

Todo lo que hay que tocar está en **`assets/js/config.js`**:

- [x] **`whatsapp`** — ya es el número real: `5215632118930` (+52 1 56 3211 8930).
      Formato internacional sin `+`, sin espacios y sin guiones. Es el CTA
      principal del sitio (hero, botón flotante y cierre), así que conviene
      probarlo desde un celular de verdad. Si algún día deja de abrir la
      conversación, quita el `1`: `525632118930`.
- [ ] **`redes`** — pega el `@` de Instagram y los reels. La sección "En video"
      de la portada **no se pinta** mientras `redes.reels` esté vacío.
- [x] **`banco`** — se eliminó. Los datos bancarios vivían aquí para el checkout
      propio, con una CLABE de ejemplo que nadie podía pagar. El cobro ahora es de
      la plataforma, así que el sitio ya no publica ninguna cuenta.
- [ ] **`plataforma.base`** — apunta a producción (`edu.victoriadev.com`). Para
      probar contra dev, cámbialo a `dev-edu.victoriadev.com`. **No publiques
      apuntando a dev.**
- [ ] **`plataforma.examenGratis`** — hoy `SIM-IPN-2026-DEMO`. Ese examen todavía
      no existe: lo tiene que crear Brando (ver INTEGRACION-PLATAFORMA.md, B1).
      **Hasta entonces el CTA principal lleva a un examen que no está.**
- [ ] **Precio $199** — el `precio` del catálogo tiene que coincidir **exacto** con
      `examenes.precio` de la plataforma o el backend rechaza todos los pagos con
      `monto_invalido`. Confirmar con Brando antes de publicar.
- [ ] **`marca.telefono`** — hoy `+52 55 0000 0000`.
- [ ] **`admin.clave`** — la compuerta de `admin.html` es visual, no seguridad: la
      clave está en el JavaScript del sitio y cualquiera puede leerla. Solo protege
      la lista de espera, pero no metas ahí nada que no puedas enseñar.
- [x] **Testimonios: ya son reales.** Los del mockup eran inventados y se
      eliminaron. Los siete que hay ahora en **`CONFIG.testimonios`** son
      reseñas públicas de Facebook a los cursos que Óscar dio en Oriéntate MX,
      atribuidas a él **como profesor** — nunca como alumnos de VictoriaEDU,
      que sería falso. Reglas al editarlas: la cita no se reescribe (recorte con
      "…", sustitución entre [corchetes]); los anónimos llevan `anonimo: true` y
      se pintan sin monograma para que no compitan con los verificables.
      **Pendiente:** revisa tu contrato con Oriéntate MX por cláusulas de no
      competencia o no captación antes de publicar, y guarda el permiso por
      escrito de los cinco que aparecen con nombre.
- [ ] **Ainara vs. "Andy López".** La selección traía una reseña de "Andy López"
      cortada a media frase; la captura que llegó es de **Ainara López Joachin**
      y sí está completa. Se publicó la de Ainara. Si son dos reseñas distintas,
      hace falta el texto completo de la otra: una cita que empieza con "…" no
      se publica.
- [ ] **Las cuatro cifras de trayectoria** (+1,200 alumnos, 8 de 10, +31, 9
      generaciones) están redactadas como historial docente tuyo, no como
      resultados de la empresa. Confirma cada una y anota de dónde sale.
- [ ] **El diploma UNIR.** El hueco con el `TODO` está en `index.html`, dentro
      del bloque `#mas-tecnologia` (el que abre el "Conoce más" de *Tecnología
      propia*).
      Sube la imagen **ya tapada**: sin folio, sin número de certificado, sin
      firma y sin QR. Un escaneo íntegro es el material para falsificarlo. Si la
      UNIR te dio liga pública de verificación, úsala: convence más que un JPG.
- [ ] **La fuente de los cortes** (`assets/js/datos-cortes.js`). Ver la sección
      siguiente: no está verificada y le falta el periodo.
- [ ] El sparkline de "+31 aciertos de mejora" es una forma ilustrativa, no una
      serie medida. Si tienes el avance real por generación, va en
      `assets/js/pagina-inicio.js`.
- [ ] Aviso de privacidad, términos y política de reembolso apuntan a `#`.

### El examen real: 140 reactivos, no 130

El diseño original decía 130 reactivos. **Es incorrecto.** La convocatoria
oficial de nivel superior dice *"conteste las 140 preguntas del examen"*, con un
máximo de tres horas efectivas, y que el contenido va en español *"exceptuando
la sección que evaluará el conocimiento del idioma inglés"*. Todo el sitio y la
escala de las gráficas están corregidos a 140 (`CONFIG.examen`).

Dos consecuencias:

- **Nuestro producto son dos exámenes de 70 reactivos** — la mitad del examen
  real cada uno, con todas sus materias, y 90 minutos cada uno (la mitad de las
  tres horas). Definido en `CONFIG.examen.simulacro`.
- **Los cortes históricos pueden ser de un año con otro total.** Si esos datos
  corresponden a una convocatoria de 130 reactivos, la escala de 140 los
  representa un poco cortos. Otra razón para meter tu propia solicitud.

**El examen real no se puede hacer en celular ni tableta**: el IPN exige
computadora de escritorio o laptop con cámara y micrófono. Está en la página de
segunda vuelta porque casi ningún blog lo menciona y es de las cosas que tumban
gente el día del examen.

### Los cortes del IPN

`assets/js/datos-cortes.js` trae 105 carreras con su puntaje de corte en 1ª y
2ª convocatoria. Tres cosas antes de publicar:

1. **La fuente no está verificada.** Los números circulan atribuidos a una
   solicitud de transparencia al IPN (folio 330021824003627); no pudimos
   comprobar ese folio de forma independiente. La página ya no lo advierte al
   visitante (lo quitaste a propósito), así que la responsabilidad de
   comprobarlo queda de este lado.
2. **Falta el periodo.** Sin año, el dato orienta pero no sirve para decidir.
   Complétalo en `fuente.periodo`.
3. **Lo que de verdad conviene:** mete tu propia solicitud a la Plataforma
   Nacional de Transparencia. Es gratis, tarda unos días, y te devuelve datos
   con tu folio y tu fecha. Hoy esa tabla la tienen todos los cursos de
   admisión; con solicitud propia deja de ser "según un blog".

**La advertencia de que el IPN no fija un mínimo no se quita.** El corte lo
define el último admitido, a posteriori. Si la página promete "necesitas 96 para
ESIME", está haciendo una afirmación que el propio Poli no hace.

### Decisiones que conviene revisar

- **Preventa.** La página del simulacro vende hoy y dice que el examen se
  habilita el 14 de agosto de 2026 (`config.lanzamiento.fecha`). Se eligió así
  porque el diseño original tenía cuenta regresiva a esa fecha pero ustedes
  quieren cobrar ya. Si en realidad el acceso es inmediato, hay que cambiar el
  encuadre del hero, del FAQ y del CTA final.
- **Cursos en "Próximamente".** Los dos cursos aparecen en el catálogo con
  captura de correo en lugar de botón de compra. Un "próximamente" sin captura
  sería un callejón sin salida; así queda registro de demanda en el panel.
  Los precios ($3,850 y $5,900) son los del diseño original — confirmarlos.

---

## Para el back

**Casi nada.** El sitio no llama a ninguna API: todos los saltos a la plataforma son
links normales, así que no hace falta tocar CORS ni `FRONTEND_URL`. Lo que sí falta
del lado de la plataforma está en
**[INTEGRACION-PLATAFORMA.md](INTEGRACION-PLATAFORMA.md)**.

Lo único que queda en `assets/js/api.js` es la captura de leads: la lista de espera
de los productos `proximamente` y los avisos de la convocatoria. Es gente que **no
puede registrarse** en la plataforma porque todavía no hay nada que comprar.

Eso sigue viviendo en `localStorage`, lo que en la práctica significa que se pierde
—solo se ve en el navegador donde se capturó—. Arreglarlo pide un
`POST /api/v1/leads` público en la plataforma, y ese sí necesitaría CORS. No es
urgente y no bloquea el embudo; está anotado en INTEGRACION-PLATAFORMA.md.

---

## Estructura

```
index.html · tienda.html · simulacro-ipn-2026.html · ipn.html
aciertos-ipn.html · convocatoria-ipn-segunda-vuelta.html
checkout.html · pago.html · confirmacion.html   ← redirecciones a la plataforma
admin.html                                      ← lista de espera
INTEGRACION-PLATAFORMA.md                       ← contrato con la plataforma
assets/
  css/victoria.css        design system completo (tokens + componentes + gráficas)
  fonts/                  Creato Display (4 pesos, auto-hospedada)
  js/
    config.js             ← negocio, catálogo y CONFIG.plataforma: lo único que se toca para operar
    api.js                captura de leads (lista de espera)
    metricas.js           eventos del embudo → dataLayer
    datos-cortes.js       los 105 cortes del IPN y su fuente
    ui.js                 header, footer, navegación, URLs de plataforma, WhatsApp, contadores
    iconos.js             set de SVG en línea (<span data-icono="datos"></span>)
    productos.js          tarjetas de producto y modal de lista de espera
    mini-cortes.js        mini gráfica de cortes (inicio y simulacro)
    pagina-*.js           lógica por página
uploads/                  logo (2 variantes) y fotos del equipo
```

### La página de segunda vuelta

`convocatoria-ipn-segunda-vuelta.html` se alimenta de `CONFIG.convocatoria` y
**se recalcula sola contra la fecha de hoy**: si el prerregistro está abierto
muestra los días que faltan; si ya cerró, cambia el mensaje y el CTA. No queda
una página mintiendo por olvido.

Datos verificados contra la convocatoria oficial (Nivel Superior escolarizada,
periodo febrero–julio 2027): prerregistro del 15 de julio al 30 de agosto de
2026, resultados el 24 de octubre de 2026, sin promedio mínimo.

**TODO(Óscar): esta página caduca.** Cuando salga la convocatoria siguiente,
actualiza `CONFIG.convocatoria` — fechas, enlace y ciclo. Es lo único que hay
que tocar.

### El popup

`popup-simulacro.js` va solo en las dos páginas de contenido (cortes y
convocatoria), nunca en las de compra. Aparece al 35% de scroll o a los 25 s —
lo que ocurra primero— y **una vez cada 7 días por navegador**. Se usa
`localStorage`, no `sessionStorage`: este último es por pestaña, así que el
mismo visitante lo volvería a ver con solo abrir otra.

### Reglas de las gráficas

No son decorativas y no conviene "arreglarlas" a ojo:

- **Las barras de corte llevan todas el mismo azul.** Las carreras son
  categorías nominales, no una escala: pintarlas por su valor re-codificaría en
  color lo que el largo de la barra ya dice, y gastaría el único canal libre.
- **1ª vs 2ª convocatoria es un dumbbell** de un solo hue en dos tonos
  (`#223A74` / `#6C8AC7`), validados como rampa ordinal — monotonía de
  luminosidad, separación entre pasos y extremo claro a 3.35:1 sobre la
  superficie.
- **Cuando el alumno escribe su puntaje**, lo que separa alcanzable de no
  alcanzable es la **agrupación y una etiqueta de texto**, no el color: nunca
  se codifica un estado solo con color.
- **Toda gráfica tiene su gemelo en tabla** ("Ver tabla"): el tooltip mejora la
  lectura, nunca es la única forma de leer un valor.
- Rejilla en hairline sólida, extremo del dato redondeado a 4px, valor al
  extremo de la barra, y fondo del color de la superficie bajo cada valor para
  que la línea de referencia no lo tape.

**Tipografías.** Creato Display se auto-hospeda porque no está en ningún CDN
público. Inter y JetBrains Mono se cargan desde Google Fonts; sin internet el
sitio cae a la pila de sistema y se ve digno, pero no idéntico.

**Ilustraciones.** Los programas ya no usan fotos de stock: `assets/img/*.svg`
son dibujos de marca hechos a medida. La del simulacro muestra una laptop con el
examen —cronómetro, opciones y barra de avance— porque el examen del IPN es en
línea y **no se puede presentar desde celular**. Al ser SVG pesan unos 2 KB, se
ven nítidos en cualquier pantalla y no dependen de ningún servidor externo.

**Logo.** Hay dos variantes. `victoriaedu_logo_transparent.png` es el original,
para fondos claros. `victoriaedu_logo_light.png` es una versión invertida que se
generó porque el wordmark original (azul `#223A74`) daba 1.7:1 sobre el navbar
oscuro — ilegible. La invertida da 18.8:1. Es la que usan header y footer.

---

## Qué se verificó

- Flujo de compra completo en jsdom (37 aserciones) y en Chromium real:
  validaciones, generación de folio, carga de comprobante, aprobación en admin.
- Sin errores de consola en ninguna de las 8 páginas.
- Sin desbordamiento horizontal a 1440 px ni a 390 px.
- Contraste de todo el texto contra WCAG AA en las 8 páginas.
- Paleta de las gráficas validada con el verificador de la guía de dataviz
  (rampa ordinal + contraste de marcas ≥ 3:1 sobre la superficie).

Defectos encontrados y corregidos en el camino, por si reaparecen:

1. La tarjeta blanca del CTA final del simulacro heredaba el color de texto de
   la sección oscura: título y viñetas eran **blancos sobre blanco**. Se acotó
   con `.vic-panel-claro`.
2. La zona de subir comprobante es un `<label>` sin `display:block`, así que el
   borde punteado se fragmentaba en línea.
3. El gris `--vic-gris-tecnico` del design system (`#81817F`) da 3.9:1 sobre
   blanco, por debajo de AA para texto pequeño. Se agregó `--vic-text-muted`
   (`#5F5F5D`, 6.4:1) para texto; el gris de marca se conserva para bordes.
4. El wordmark del logo (azul `#223A74`) daba **1.7:1** sobre el navbar oscuro
   — ilegible. Se generó `uploads/victoriaedu_logo_light.png`, versión invertida
   a 18.8:1, y se recortó el relleno transparente del PNG original (el contenido
   ocupaba solo el 85% del lienzo, así que a 46 px se veía diminuto).
5. Dos de las fotos del equipo llegaron truncadas por el límite de 256 KiB del
   MCP de Claude Design (84% y 88% decodificados). Se recortaron al mayor
   rectángulo 4:5 válido — que es justo la proporción con la que las muestra el
   diseño — y se recomprimieron. Si tienes los originales, mejor sustitúyelas.
6. `.vic-rail` llevaba `scroll-snap-type` en el contenedor pero le faltaba
   `scroll-snap-align` en los hijos, que es donde va la propiedad. El enganche
   nunca funcionó desde que se escribió el componente.
7. **El carrusel se descuadraba al pulsar rápido.** Las flechas usaban
   `scrollBy`, que es relativo a la posición **instantánea**: si pulsabas otra
   vez antes de que terminara el desplazamiento suave, el segundo salto partía
   de la mitad de la animación y el error se acumulaba. Seis clics seguidos
   dejaban la tarjeta a medio camino entre dos posiciones — y con una tarjeta
   por vista, eso se ve como una tarjeta cortada. Ahora se usa `scrollTo` a la
   posición absoluta de la tarjeta destino, medida del DOM
   (`hijos[i].offsetLeft`), y un índice objetivo propio que solo se
   resincroniza cuando el desplazamiento se detiene. Está cubierto con una
   prueba que simula animaciones a medio terminar.
