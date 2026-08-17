# VictoriaEDU — sitio

Sitio estático: portada, catálogo, página de producto y tres páginas de contenido
sobre el examen del IPN.

En línea en **victoriaedu.com.mx** (no `victoriaedu.mx`: ese dominio no existe).
Se publica solo: cada push a `main` sale a producción.

**El sitio ya no cobra.** Es el escaparate. Todo lo que implica una cuenta
—guardar tu resultado, la revisión de respuestas, pagar— vive en la plataforma
(`campus.victoriaedu.com.mx`), que sí tiene base de datos y sesión. El botón principal
es **"Haz el examen gratis"** y manda directo al examen, sin registro de por
medio: la cuenta se pide al final, para enseñar la calificación.

**Para Brando: empieza por [HANDOFF-BRANDO.md](HANDOFF-BRANDO.md)** — la lista
corta de lo que falta de su lado, por orden de prioridad. El contrato completo
—URLs, ambientes, payloads y verificación— está en
**[INTEGRACION-PLATAFORMA.md](INTEGRACION-PLATAFORMA.md)**.

> **El examen gratis ya está abierto en producción; la compra no.** Mercado Pago
> sigue en sandbox, así que ese botón se ve marcado "Pronto" y abre un aviso con
> el WhatsApp. Son dos flags independientes en `config.js`; ver "El embudo".

### Las dos ramas

| Rama | Dónde | Plataforma |
|---|---|---|
| `main` | victoriaedu.com.mx (público) | producción: examen abierto, compra cerrada |
| `dev` | local o donde se despliegue | dev, con todo abierto para probar |

**Las dos ramas tienen el mismo código.** Lo que cambia es el host: el sitio
resuelve la plataforma y los flags a partir de él, no de la rama. Por eso `dev`
no acumula un diff que después haya que arrastrar a `main` — es una rama para
probar cambios del sitio, no una copia con otra configuración. Basta con
levantar `dev` en local (`python3 -m http.server 8000`) para tener el flujo
completo contra la plataforma de dev.

> El checkout propio (`checkout.html` → `pago.html` → `confirmacion.html`) se
> retiró: guardaba los pedidos en `localStorage`, o sea que se perdían al cambiar
> de navegador. Los archivos siguen ahí, convertidos en redirecciones, porque hay
> ligas compartidas apuntando a ellos. **Con la compra cerrada no redirigen**:
> se quedan con su texto y el botón abre el aviso, porque saltar a la plataforma
> para que ahí rebote a un login sin destino es el peor de los dos finales.

---

## Cómo verlo

Necesita servirse por HTTP (abrir con `file://` rompe las tipografías):

```bash
cd /home/ocruvier/landing
python3 -m http.server 8000
# abrir http://localhost:8000
```

> **Si ves la página sin estilos**, es caché del navegador. Los archivos llevan
> `?v=23` justo para evitarlo: al cambiar CSS o JS, **sube ese número en todos los
> `.html`** (o recarga con Ctrl+Shift+R).

**El `?v=` y `VERSION_SITIO` se suben juntos, y no es opcional.** El visitante que
ya estuvo aquí tiene el CSS anterior guardado; si la URL no cambia, el navegador
ni pregunta. Se publica HTML nuevo con estilos viejos, que es peor que no
publicar: el bloque nuevo sale sin sus reglas. Pasó con el carrusel de
fundadores, que se subió con el `?v=` de la versión anterior.

```bash
sed -i 's/?v=22/?v=23/g' *.html    # y sube VERSION_SITIO en config.js
```

`VERSION_SITIO` (`assets/js/config.js`) se imprime en el pie: es lo que se le
pregunta a quien reporte "se ve raro" para saber si está viendo caché vieja. Si
no acompaña al `?v=`, deja de servir para eso.

**En local ya apuntas a la plataforma de dev**, sin tocar nada: el ambiente se
resuelve por hostname y solo `victoriaedu.com.mx` habla con producción. Ver
"Los dos ambientes", más abajo.

Lista de espera: `http://localhost:8000/admin.html` — clave `victoria2026`.

---

## Páginas

| Archivo | Qué es |
|---|---|
| `index.html` | Landing madre: manifiesto, motor tecnológico, programas, método, equipo, resultados, captura de leads |
| `tienda.html` | Catálogo de los tres programas |
| `simulacro-ipn-2026.html` | Landing del simulacro: diagnóstico gratuito primero, oferta después. Recibe el tráfico pagado |
| `ipn.html` | Guía del examen: estructura, áreas, cómo se califica, equipo y calendario |
| `aciertos-ipn.html` | Cortes históricos del IPN en gráfica: 105 carreras, filtros y comparador contra tu puntaje |
| `convocatoria-ipn-segunda-vuelta.html` | Página SEO de la convocatoria de segunda vuelta: fechas, requisitos y equipo necesario |
| `404.html` | Página de error. El hosting tiene que servirla con código 404 real; ver "Publicación" |
| `admin.html` | Lista de espera capturada en este navegador |
| `checkout.html` · `pago.html` | Redirecciones a la plataforma (el checkout viejo) |
| `confirmacion.html` | Explica a dónde se fue la compra; no redirige, por si alguien llega con un folio `VE-` viejo |

El header y el footer no están duplicados en el HTML: los pinta `assets/js/ui.js`
para que haya un solo lugar donde tocarlos.

### El menú

Un solo árbol en `ui.js` (`NAV`), idéntico en las once páginas:

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
  páginas públicas, `"examen10"` ("Probar 10 reactivos gratis") en la landing del
  simulacro —que recibe pauta y necesita una promesa concreta—, `"comprar"` en el
  catálogo y `"ninguno"` en las páginas internas.

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
| Carrusel de programas | `.vic-catalogo` + `.vic-producto--horizontal` | Catálogo de la tienda |
| Diapositiva de fundador | `.vic-autor` dentro de `.vic-rail--ancho` | "Quiénes están detrás", en el simulacro |
| Ilustraciones de beneficio | `.benefit-illustration` | Las cuatro tarjetas de "Qué hacemos" |
| Iconos de marca | `data-icono="materia\|tutor\|progreso\|tecnologia"` | Reserva: los cuatro iconos siguen en `iconos.js` por si hay que volver atrás |
| Hueco de mascota | `.mascot-slot` + `data-mascota` | Bloque de diagnóstico gratuito |

**Portadas de programa.** Viven en `assets/brand/programas/*.webp`, son 1672×941
(16:9 exacto, el mismo que fija `.vic-producto__img`) y pesan entre 35 y 70 KB.
WebP es línea base en todos los navegadores vivos, así que se sirven directo
desde `imagen` en el catálogo. Si algún día hay variantes AVIF, se pone la ruta
en `imagenAvif` y la tarjeta pasa sola a `<picture>` con el WebP de respaldo.

Las tres llevan `width`/`height` para que el navegador reserve el espacio antes
de descargar nada. La primera de la portada se carga sin `lazy` porque entra
casi con el primer scroll; las otras dos sí van diferidas.

**Ilustraciones de beneficio.** En `assets/brand/beneficios/*.webp`, 1200×1200
con canal alfa. **Van sobre blanco y eso no es decorativo**: el arte se dibujó
contra blanco, así que al recortarle el fondo los píxeles del borde conservan
halo blanco. Sobre cualquier otro color ese halo se ve como dientes de sierra
alrededor de cada forma. `.vic-card` ya es blanco puro, así que se apoyan en él
sin costura y sin necesidad de caja.

Si algún día la tarjeta cambia de tono, la solución **no** es pintarles un
recuadro blanco detrás: hay que pedir las ilustraciones ya compuestas contra el
color nuevo.

**La 404 ya está conectada.** El sitio salió de Netlify y hoy lo sirve el mismo
nginx que la plataforma; comprobado: una ruta inexistente devuelve **código 404
real** y nuestra página, no la pantalla blanca de nginx. Lo que lo sostiene es
una línea en el server block, y si algún día se migra el hosting hay que
volver a ponerla:

```nginx
error_page 404 /404.html;
```

En el repo no hay ficheros de configuración de hosting, y **no conviene
crearlos**: una regla de redirección mal puesta convierte los 404 en 200 o rompe
rutas válidas. La configuración vive en el servidor, no aquí.

Lo que sí es fácil de romper: **`<base href="/">` en su `<head>`**. Una página de
error se sirve *en la URL pedida*, sin redirigir, así que en
`/guias/algo-que-no-existe` una ruta relativa como `assets/css/…` se resolvería
contra `/guias/` y no cargaría ni los estilos, ni el logo, ni los enlaces del
menú. Verificado sirviéndola desde una URL de cuatro niveles.

**Para portarla a la app**, se quita el `<header>` y la composición funciona
igual: nada más depende de él. Los valores para reconstruirla están en
INTEGRACION-PLATAFORMA.md.

**Vico.** `assets/brand/vico/vico-diagnostico.webp`, se activa desde
`CONFIG.mascota`. La pose pensativa de la 404 va en `CONFIG.mascotaPensando` y
**todavía no existe el archivo**: mientras siga en `null` la página se compone
con su decoración y no enseña ningún hueco. Lleva un medallón claro detrás (`.mascot-slot::before`) y esa
es la parte que importa: el cuerpo de Vico es azul marino y la banda donde vive
es azul profundo, así que sobre el fondo desnudo **la silueta se funde y se
pierde la cola entera**. Es un círculo y no un recuadro a propósito — un
rectángulo claro dentro de una banda de color se lee como parche o como imagen
que no cargó.

Para pintar una textura en una sección hay que envolverla con `.vic-lienzo`, que
crea el contexto de posicionamiento y sube el contenido por encima de la capa.

**El catálogo de la tienda es un carrusel** de tarjetas horizontales en cristal,
montado sobre `VicUI.rail()` — el mismo que ya movía testimonios y reels, sin
JavaScript nuevo. La banda es oscura por necesidad, no por gusto: el
glassmorphism es un desenfoque de lo que hay **detrás**, y sobre el blanco plano
que tenía la sección no se vería nada. Lleva las mismas manchas de color que la
banda de testimonios, que resolvía este mismo problema.

En el carrusel las tarjetas usan los 4 `puntos` y no la lista `incluye`: en un
riel todas miden lo que la más alta, y con siete líneas el simulacro dejaba a
las otras dos con un hueco enorme sobre el precio.

**Los tres fundadores también son un carrusel**, no tres columnas. La sección
"Quiénes están detrás" del simulacro presentaba a Óscar solo, con su retrato a
media página; al entrar Emiliano y Brando, en tres columnas cada cara se encogía
a un tercio de ancho — y la cara es justo lo que da confianza en una página de
venta. Con `.vic-rail--ancho` cada fundador recupera la composición original
(retrato grande + bio) y se pasan de uno en uno. Va sobre el mismo `VicUI.rail`
del catálogo, con las flechas colgadas del encabezado (`opts.navEn`).

Las tres tarjetas viven **en el HTML**, no en una cadena de JS: son texto
indexable, y la bio de una persona real no se genera desde una plantilla. Sin
JavaScript el riel se sigue arrastrando con el dedo.

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

El sitio no cobra: convence y entrega al alumno a la plataforma. **El peaje ya no
está en la puerta**: el examen gratis se contesta sin cuenta, y la cuenta se pide
para ver la calificación — cuando el alumno ya invirtió veinte minutos y le
cuesta menos registrarse.

```
victoriaedu.com.mx   "Haz el examen gratis"
      ↓
campus.victoriaedu.com.mx/gratis/PUB-IPN-2026-GRATIS ← 10 reactivos, SIN cuenta
      ↓  al entregar, la plataforma le guarda un claim de 48 h
/registro · /login · Google  →  /gratis/resultado   ← aciertos y porcentaje
      ↓  upsell
/paquetes/ipn-2026  →  "Pagar $199"  →  Mercado Pago  →  webhook  →  desbloqueado
```

Todos los CTAs salen por `VicUI.urlExamenGratis()` / `urlComprar()`
(`assets/js/ui.js`), que leen `CONFIG.plataforma`. En el HTML basta
`<a data-plataforma="examen">` o `="comprar"`, **sin `href`**: ninguna página
tiene el dominio escrito a mano, igual que con `data-wa`.

**El resultado gratis solo da aciertos y porcentaje.** Ni desglose por materia,
ni revisión de respuestas, ni explicaciones: eso viene con el simulacro
completo. El sitio lo prometía —era verdad del embudo anterior— y se corrigió en
las siete páginas donde aparecía. Si algún día el resultado gratis devuelve más,
se puede volver a prometer, pero después de que exista.

### Los dos ambientes, y por qué las ramas no divergen

| Host del sitio | Plataforma |
|---|---|
| `victoriaedu.com.mx` · `www.` | `campus.victoriaedu.com.mx` (producción) |
| localhost, previews, la rama `dev` | `dev-edu.victoriadev.com` |

Se resuelve **por hostname**, no por rama. Así `main` y `dev` son el mismo
código servido en dos lugares y un merge nunca pelea por la línea del dominio.
El default para hosts desconocidos es dev, que es el lado seguro: una preview
apuntando a producción mete alumnos de prueba en la base real. Si el host es
nuevo y sí es público, se agrega a `hostsProduccion`.

Como red de seguridad, **el pie imprime `· plataforma dev`** cuando el ambiente
no es producción. Si esa etiqueta aparece en victoriaedu.com.mx, hay un host
fuera de la lista.

### El examen gratis está abierto; la compra, no

`examenAbierto` está en `true` para producción: es el CTA del que vive la landing
del simulacro, que recibe tráfico pagado, y su flujo ya está publicado. Los CTAs
salen a `campus.victoriaedu.com.mx/gratis/PUB-IPN-2026-GRATIS`.

`compraAbierta` sigue en `false` porque Mercado Pago continúa en sandbox y sin
credenciales de producción: cobraría con dinero de mentiras. Ese botón **no se
esconde** —la página está escrita alrededor de él y quitarlo dejaría huecos—: se
marca "Pronto" y abre un aviso con el WhatsApp, que es el canal que sí contesta
hoy. En la landing del simulacro es el CTA secundario, "Quiero los 2 simulacros".

Se abren cambiando `false` por `true` en `CONFIG.plataforma.ambientes.produccion`.
Son dos flags independientes a propósito: el examen y la compra dependen de
cosas distintas. **Qué tiene que estar listo antes de abrir cada uno está en
[INTEGRACION-PLATAFORMA.md](INTEGRACION-PLATAFORMA.md)**.

### Medición

`assets/js/metricas.js` empuja eventos a `window.dataLayer` (lo que leen GTM, GA4 y
el Pixel de Meta) y a la consola si no hay pixel instalado. Es el enchufe, no la
analítica: el día que se instale un pixel, los eventos ya están fluyendo.

Se declara en el HTML con `data-metrica="nombre" data-metrica-lugar="dónde"`.
Eventos: `examen_gratis_clic`, `comprar_clic`, `lead_enviado`, y mientras los
botones sigan cerrados, `examen_gratis_cerrado`, `comprar_cerrado` y
`wa_desde_cerrado`. Los de cierre van aparte para no inflar el embudo con clics
que nunca salieron del sitio — y porque miden algo que si no, no sabríamos:
cuánta demanda se está quedando en la puerta.

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
- [ ] **`videoSimulacro`** — el recorrido en video del hero de
      `simulacro-ipn-2026.html`. En `null` mientras no exista: el hero enseña la
      portada de marca y al pulsarla sale un "Próximamente", sin huecos ni cajas
      vacías. Con URL, la portada pasa a ser la miniatura real del video y este
      **se reproduce en la misma caja**, sin ventana emergente. Se pega tal cual
      sale de la barra de direcciones —`watch?v=`, `youtu.be/`, `/shorts/`,
      Vimeo o un MP4 en `uploads/`— y `pagina-simulacro.js` la convierte.
      `videoSimulacroPortada` solo hace falta si el video NO es de YouTube o si
      se quiere un fotograma propio en vez del que eligió YouTube.
      **Nunca se pega la URL de otra pestaña**: un video ajeno carga y se
      reproduce sin dar ningún error, y nadie lo nota hasta que lo ve un alumno.
- [x] **`banco`** — se eliminó. Los datos bancarios vivían aquí para el checkout
      propio, con una CLABE de ejemplo que nadie podía pagar. El cobro ahora es de
      la plataforma, así que el sitio ya no publica ninguna cuenta.
- [x] **`plataforma`** — ya no hay un `base` que cambiar a mano: el ambiente se
      resuelve por hostname y hay uno de producción y uno de dev. Lo que sí hay
      que revisar es `hostsProduccion` si algún día se agrega un dominio público.
- [x] **`plataforma.examenGratis`** — es `PUB-IPN-2026-GRATIS` y **ya existe**:
      10 reactivos, sin timer, sacados de los dos simulacros de venta. Verificado
      en dev y en producción.
- [x] **`examenAbierto`** — en `true` para producción. La base es
      `campus.victoriaedu.com.mx` y los CTAs gratuitos salen a
      `/gratis/PUB-IPN-2026-GRATIS?origen=landing-examen-gratis`.
- [ ] **Abrir la compra.** `compraAbierta` sigue en `false` a propósito: Mercado
      Pago está en sandbox y sin credenciales de producción. Qué tiene que estar
      listo antes de ponerlo en `true` está en
      **[INTEGRACION-PLATAFORMA.md](INTEGRACION-PLATAFORMA.md)**, sección "Para
      poner esto en producción".
- [ ] **Precio $199** — el `precio` del catálogo tiene que coincidir **exacto** con
      `examenes.precio` **en la base de producción** o el backend rechaza todos los
      pagos con `monto_invalido`. Existe la migración que lo baja de $249 a $199;
      confirmar con Brando que ya corrió en prod.
- [ ] **Los dos correos de `marca`** — `hola@victoriaedu.mx` e
      `instituciones@victoriaedu.mx` están en un dominio que **no resuelve**. El
      sitio vive en `victoriaedu.com.mx`. Si el correo está en otro lado,
      verifica que esas cuentas reciben; si no, hay que cambiarlos. No se
      tocaron porque es decisión de ustedes.
- [ ] **`marca.telefono`** — hoy `+52 55 0000 0000`.
- [ ] **`admin.clave`** — la compuerta de `admin.html` es visual, no seguridad: la
      clave está en el JavaScript del sitio y cualquiera puede leerla. Solo protege
      la lista de espera, pero no metas ahí nada que no puedas enseñar.
- [x] **Testimonios: ya son reales.** Los del mockup eran inventados y se
      eliminaron. Los diez de **`CONFIG.testimonios`** vienen de **dos orígenes
      que no se mezclan**, y la diferencia manda cómo se pintan:
      - **Reseñas públicas de Facebook** a los cursos que Óscar dio en Oriéntate
        MX (cinco con nombre, más dos viejas anónimas). Se citan con nombre
        porque quien las escribió las publicó.
      - **Mensajes privados de WhatsApp** de los alumnos del curso de
        matemáticas de la segunda vuelta de Emiliano, agosto 2026. Un mensaje
        privado no es una reseña: nadie lo escribió para publicarse. Van **sin
        nombre, sin foto y sin captura** — la captura enseñaría número, grupo y
        foto de perfil.

      Todos se atribuyen al profesor **como profesor** — nunca como alumnos de
      VictoriaEDU, que sería falso — y el pie del carrusel distingue los dos
      orígenes: decir "antes de VictoriaEDU" de todos envejecía a los recientes.
      Reglas al editarlas: la cita no se reescribe (recorte con "…", sustitución
      entre [corchetes]); los anónimos llevan `anonimo: true` y se pintan sin
      monograma para que no compitan con los verificables.
      **Pendiente:** revisa tu contrato con Oriéntate MX por cláusulas de no
      competencia o no captación antes de publicar, y guarda el permiso por
      escrito de los cinco que aparecen con nombre.
- [ ] **TODO(Emiliano) — el "sí" de los tres de WhatsApp.** Pídeselo por escrito
      en el mismo chat ("¿te parece si publicamos esto en la página, sin tu
      nombre?") y guarda la captura de la respuesta. Si alguno autoriza aparecer
      con nombre, quítale el `anonimo` y ponlo; si alguno dice que no, se borra
      la entrada y ya. **Es bloqueante:** son alumnos de un grupo que está
      corriendo ahorita, no reseñas que ellos hicieran públicas.
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

## ⚠️ A dónde llegan los leads de los cursos que no han abierto

**Hoy: a ningún lado.** Es lo primero que hay que saber antes de mandar tráfico a
esos formularios.

`registrarLead()` (`assets/js/api.js`) guarda en el `localStorage` **del navegador
del visitante**. No hay servidor: no se envía nada y nadie del equipo lo ve. El
panel de `admin.html` los lista, pero solo los capturados en esa misma máquina y
ese mismo navegador — si el alumno lo dejó desde su celular, ahí no aparece.

Son tres formularios:

| Dónde | `origen` | Qué le prometemos al alumno |
|---|---|---|
| "Avísame cuando abra" — curso de matemáticas | `lista-espera` | Un correo cuando abra |
| "Avísame cuando abra" — curso de admisión | `lista-espera` | Un correo cuando abra |
| "Avísenme de cambios" — convocatoria | `convocatoria-segunda-vuelta` | Un correo si el IPN mueve fechas |

**Esas promesas hoy no se pueden cumplir**, y el texto del formulario las hace
explícitas ("Un solo correo cuando abra"). Es una decisión consciente mientras se
resuelve, no un descuido: se dejó así porque el arreglo de verdad —un
`POST /api/v1/leads` público en la plataforma— es del lado de Brando. El contrato
del endpoint está en **[INTEGRACION-PLATAFORMA.md](INTEGRACION-PLATAFORMA.md)**.

Es además la **única** parte de toda la integración que necesitaría CORS: el resto
de los saltos a la plataforma son links normales.

Mientras tanto, si de verdad hace falta capturar a esa gente, el canal que sí llega
es el WhatsApp del pie y del botón flotante.

---

## Para el back

**Casi nada.** El sitio no llama a ninguna API: todos los saltos a la plataforma son
links normales, así que no hace falta tocar CORS ni `FRONTEND_URL` — con la
excepción de los leads, arriba. Lo que sí falta del lado de la plataforma está en
**[INTEGRACION-PLATAFORMA.md](INTEGRACION-PLATAFORMA.md)**.

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
