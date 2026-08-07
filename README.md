# VictoriaEDU — sitio + e-commerce (mockup de flujos)

Sitio estático navegable que une las dos landings de Claude Design y agrega la
tienda, el checkout, la pasarela de pago y el panel de revisión manual.

**Qué es y qué no es.** Es un mockup funcional de los flujos: todo se puede
recorrer de punta a punta en el navegador, pero los datos viven en
`localStorage`, no en un servidor. La persistencia real la implementa Brando;
ver [Para el back](#para-el-back).

---

## Cómo verlo

Necesita servirse por HTTP (abrir con `file://` rompe las tipografías):

```bash
cd /home/ocruvier/landing
python3 -m http.server 8000
# abrir http://localhost:8000
```

> **Si ves la página sin estilos**, es caché del navegador. Los archivos llevan
> `?v=4` justo para evitarlo: al cambiar CSS o JS, **sube ese número en todos los
> `.html`** (o recarga con Ctrl+Shift+R).

Panel interno: `http://localhost:8000/admin.html` — clave `victoria2026`.
Ahí dentro, **Cargar datos de ejemplo** llena la tabla para poder enseñarlo.

---

## Páginas

| Archivo | Qué es |
|---|---|
| `index.html` | Landing madre: manifiesto, motor tecnológico, programas, método, equipo, resultados, captura de leads |
| `tienda.html` | Catálogo de los tres programas |
| `simulacro-ipn-2026.html` | Página de producto del simulacro, con cuenta regresiva |
| `checkout.html` | Paso 1 — datos del comprador |
| `pago.html` | Paso 2 — elección de método de pago |
| `confirmacion.html` | Paso 3 — folio, datos bancarios, comprobante y aviso por WhatsApp |
| `aciertos-ipn.html` | Cortes históricos del IPN en gráfica: 105 carreras, filtros y comparador contra tu puntaje |
| `convocatoria-ipn-segunda-vuelta.html` | Página SEO de la convocatoria de segunda vuelta: fechas, requisitos y equipo necesario |
| `admin.html` | Panel de revisión manual de pagos y lista de espera |

El header y el footer no están duplicados en el HTML: los pinta `assets/js/ui.js`
para que haya un solo lugar donde tocarlos.

---

## El flujo de compra

```
tienda / producto
      ↓
checkout.html    datos del alumno → se guarda un borrador
      ↓
pago.html        elige método → NACE el pedido con folio VE-XXXXXX
      ↓
confirmacion.html
      1. transfiere con el folio como concepto
      2. sube su comprobante
      3. nos avisa por WhatsApp (mensaje ya escrito con folio, nombre y monto)
      ↓
admin.html       aprobamos o rechazamos a mano
```

Estados de un pedido:

| Estado | Significa |
|---|---|
| `pendiente_pago` | Recién creado, todavía no transfiere |
| `comprobante_recibido` | Subió comprobante, falta que validemos |
| `pagado` | Validado a mano; se libera el acceso |
| `rechazado` | El comprobante no correspondía |
| `cancelado` | Desistió o venció la ventana |

---

## Antes de publicar

Todo lo que hay que tocar está en **`assets/js/config.js`**:

- [ ] **`whatsapp`** — hoy `525500000000`, un placeholder. Formato internacional
      sin `+`, sin espacios y sin guiones.
- [ ] **`banco`** — beneficiario, institución y CLABE son de ejemplo.
      **La CLABE que está ahí no es real: si se publica así, nadie puede pagar.**
- [ ] **`marca.telefono`** — hoy `+52 55 0000 0000`.
- [ ] **`admin.clave`** — la compuerta del panel es visual, no seguridad. No
      sirve para producción: la autenticación real va en el back.
- [ ] **Testimonios: ya no hay ninguno.** Los que venían del mockup eran
      inventados y se eliminaron — no podían publicarse. En `index.html` y en
      `simulacro-ipn-2026.html` quedó la plantilla comentada con la atribución
      correcta. Cuando tengas los de tus alumnos de OriéntateMX: atribúyelos a
      ti como profesor ahí ("Alumna de Óscar Cruz en OriéntateMX, 2024"), no a
      VictoriaEDU; consigue permiso por escrito de cada uno; y revisa tu
      contrato con OriéntateMX por cláusulas de no competencia o no captación.
- [ ] **Las cuatro cifras de trayectoria** (+1,200 alumnos, 8 de 10, +31, 9
      generaciones) están redactadas como historial docente tuyo, no como
      resultados de la empresa. Confirma cada una y anota de dónde sale.
- [ ] **El diploma UNIR.** `index.html` tiene el hueco listo con un `TODO`.
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

**`assets/js/api.js` es la única frontera entre las vistas y la persistencia.**
Todos sus métodos ya son `async` y devuelven promesas, precisamente para que
cambiar `localStorage` por `fetch` no obligue a tocar ninguna página.

Contrato sugerido:

| Método de `VictoriaAPI` | Endpoint |
|---|---|
| `crearPedido(datos)` | `POST /api/pedidos` |
| `obtenerPedido(folio)` | `GET /api/pedidos/:folio` |
| `listarPedidos()` | `GET /api/pedidos` |
| `adjuntarComprobante(folio, file)` | `POST /api/pedidos/:folio/comprobante` |
| `actualizarEstado(folio, estado, nota)` | `PATCH /api/pedidos/:folio` |
| `registrarLead(datos)` | `POST /api/leads` |
| `listarLeads()` | `GET /api/leads` |

Cada método tiene su `// TODO(Brando):` con la llamada equivalente.

Dos detalles que sí son del mockup y desaparecen con el back:

- `comprimirImagen()` reduce el comprobante antes de guardarlo porque
  `localStorage` tiene ~5 MB. El back recibe el archivo tal cual.
- `sembrarEjemplos()` y `reiniciar()` son utilidades de demo.

### Mercado Pago

Está deshabilitado a propósito y se muestra como "Próximamente". Para
encenderlo: poner `config.pagos.mercadopago.activo = true`, llenar `publicKey` y
`preferenceUrl`, y completar el `TODO(Brando)` de `assets/js/pagina-pago.js`
(crear la preferencia y redirigir a `init_point`). La tarjeta de método de pago
se habilita sola al leer la config.

---

## Estructura

```
index.html · tienda.html · simulacro-ipn-2026.html · aciertos-ipn.html
checkout.html · pago.html · confirmacion.html · admin.html
assets/
  css/victoria.css        design system completo (tokens + componentes + gráficas)
  fonts/                  Creato Display (4 pesos, auto-hospedada)
  js/
    config.js             ← negocio y catálogo: lo único que se toca para operar
    api.js                ← capa de datos: lo único que toca Brando
    datos-cortes.js       ← los 105 cortes del IPN y su fuente
    ui.js                 header, footer, navegación, WhatsApp, contadores, sparklines
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
