# Integración sitio → plataforma

**Para Brando y para Óscar.** Qué cambió, qué falta y qué hay que tocar el día que
la plataforma de producción esté lista.

- **Sitio:** `ocruvier777/victoriaedu-sitio` · rama `main` → **victoriaedu.com.mx** (en línea)
- **Plataforma:** `brandosanchezr/victoria-edu` · `edu.victoriadev.com` (prod) · `dev-edu.victoriadev.com` (dev)

> El dominio del sitio es **victoriaedu.com.mx**, no `victoriaedu.mx`. Ese
> segundo no existe: no resuelve. Estuvo escrito en los `canonical` de dos
> páginas y en este documento; ya se corrigió. Si vuelve a aparecer, es un
> error de copiar y pegar, no un dominio alterno.

---

## Estado a hoy (14 de agosto de 2026)

El embudo que describía la versión anterior de este documento —registro primero,
examen después, con `?next=`— **ya no es el que existe**. Brando lo resolvió de
otra forma, y mejor: el examen se presenta sin cuenta y la cuenta se pide para
ver la calificación. Este documento describe el que sí hay.

| # | Pendiente original | Estado |
|---|---|---|
| B1 | Crear el examen demo | ✅ **Hecho, con otro id.** Es `PUB-IPN-2026-GRATIS`, no `SIM-IPN-2026-DEMO` |
| B2 | "Comprar — $0" en el listado | ⚪ **Sin efecto.** El examen gratis ya no es un simulacro de $0 en `/simulacros`; vive aparte |
| B3 | Soportar `?next=` | ❌ **No se hizo, y ya casi no hace falta.** Ver abajo: solo estorba en el CTA de compra |
| B4 | Precio a $199 | ✅ **Hecho.** `migrate_precio_sim_ipn_199.py` baja V1/V2 de $249 a $199, y el paquete `ipn-2026` cuesta $199 |
| B5 | Atribución (`origen`) | ❌ **Pendiente.** Nadie lee ni guarda el parámetro |
| B6 | Rate limit del registro | ❌ **Pendiente**, y ahora pesa más: sigue en 5 altas por IP por hora |
| B7 | `/registro` en `publicPaths` | ⚪ Cosmético, sin cambio |

---

## El embudo que existe hoy

```
victoriaedu.com.mx   "Haz el examen gratis"
      ↓
edu.victoriadev.com/gratis/PUB-IPN-2026-GRATIS     ← SIN cuenta, 10 reactivos
      ↓  entrega → la plataforma guarda un claim_token de 48 h en su navegador
/registro  ·  /login  ·  o Google
      ↓  auth.tsx ve el claim pendiente y desvía solo
/gratis/resultado    → POST /intentos/reclamar → aciertos y porcentaje
      ↓  banner de upsell
/paquetes/ipn-2026   → "Pagar $199" → Mercado Pago Checkout Pro → webhook → acceso
```

**Por qué es mejor que el anterior.** El peaje ya no está en la puerta sino
después de veinte minutos de examen: cuando le pedimos el correo, el alumno ya
invirtió algo y el registro le cuesta menos. Y el sitio puede prometer algo que
casi nadie promete —"empiezas sin crear cuenta"— que es un argumento de venta,
no una limitación.

### Lo que el resultado gratis SÍ entrega

Solo tres números: **aciertos, total y porcentaje** (`reclamar_intento`,
`examen_service.py`). No hay desglose por materia, no hay revisión de respuestas
y no hay explicaciones.

**Esto obligó a corregir el sitio.** Prometía en siete lugares "ves cada
respuesta explicada" y "en qué materia lo pierdes", que era verdad del embudo
viejo y dejó de serlo. Ya está reescrito: el examen gratis da tu puntaje, y el
desglose, la revisión y el plan se anuncian como parte del simulacro completo.
Si algún día el resultado gratis devuelve más, se puede volver a prometer —
pero se promete **después** de que exista, no antes.

---

## Contrato de URLs

Vive en `assets/js/config.js` → `CONFIG.plataforma`, y se construye en
`assets/js/ui.js` (`urlExamenGratis()` / `urlComprar()`). Ningún HTML del sitio
tiene el dominio escrito a mano.

```
{base}/gratis/PUB-IPN-2026-GRATIS?origen=landing-examen-gratis
{base}/paquetes/ipn-2026?origen=landing-compra
```

`origen` viaja y **hoy se ignora** (B5). Se manda igual porque el día que la
plataforma lo persista, no habrá que tocar ningún botón del sitio.

**Si cambias `id_publico` del examen o el slug del paquete, avísame:** son dos
líneas en `config.js` y no hace falta tocar ningún botón ni ningún HTML.

### Ambientes: el sitio los decide por hostname

| Host del sitio | Plataforma con la que habla |
|---|---|
| `victoriaedu.com.mx`, `www.victoriaedu.com.mx` | `edu.victoriadev.com` (producción) |
| cualquier otro: localhost, previews, la rama dev | `dev-edu.victoriadev.com` |

Se hizo así para que las ramas `main` y `dev` del sitio **no diverjan**: son el
mismo código servido en dos lugares, así que un merge nunca pelea por la línea
del dominio. El default para hosts desconocidos es **dev**, que es el lado
seguro: una preview pegándole a producción mete alumnos de prueba en la base
real.

Como red de seguridad, el pie imprime `· plataforma dev` cuando el ambiente
resuelto no es producción. Si esa etiqueta aparece en victoriaedu.com.mx, hay un
host fuera de `hostsProduccion` y hay que agregarlo.

---

## ⚠️ Producción está CERRADA a propósito

En `victoriaedu.com.mx` los dos CTAs están apagados desde `config.js`:

```js
produccion: { base: '…', examenAbierto: false, compraAbierta: false }
```

Los botones no desaparecen —la página entera está escrita alrededor de ellos—:
se marcan **"Pronto"** y al tocarlos abren un aviso que explica y ofrece
WhatsApp, que es el canal que sí contesta hoy. Los clics se miden aparte
(`examen_gratis_cerrado`, `comprar_cerrado`, `wa_desde_cerrado`) para no inflar
el embudo con gente que nunca salió del sitio, y para saber cuánta demanda se
está quedando en la puerta.

Por qué cada uno:

- **El examen** porque el flujo `/gratis` → claim → resultado viene de la rama
  `dev` de la plataforma y la de producción todavía no lo da por terminado. La
  ruta ya responde 200 en prod, pero eso no es lo mismo que estar listo.
- **La compra** porque **Mercado Pago sigue en sandbox**: `mp_modo` viene con
  default `"sandbox"` y las credenciales no están puestas en uat/prod. Un botón
  de pago que cobra con dinero de mentiras es peor que un botón apagado.

---

## Para poner esto en producción

En orden. Los tres primeros son de Brando; el último es de un minuto y es del
sitio.

### 1 · Plataforma: publicar el flujo del examen gratis en producción

Que `main` de la plataforma quede desplegada en `edu.victoriadev.com` con:

- `/gratis/{examenId}` y `/gratis/resultado` sirviendo,
- `GET|POST /api/v1/public/examenes/…` y `POST /api/v1/intentos/reclamar` vivos,
- el examen `PUB-IPN-2026-GRATIS` creado en la base de **producción**
  (`python -m scripts.crear_examen_publico_gratis`, es idempotente),
- el paquete `ipn-2026` disponible en `GET /api/v1/paquetes/ipn-2026`.

Comprobación rápida, sin abrir el navegador:

```bash
curl -s https://edu.victoriadev.com/api/v1/public/examenes/PUB-IPN-2026-GRATIS \
  | head -c 200                       # debe traer preguntas, no 404
```

### 2 · Plataforma: Mercado Pago de sandbox a producción

- `MP_ACCESS_TOKEN` de producción y `MP_WEBHOOK_SECRET` en el `.env` de prod.
- `MP_MODO=produccion` (con `sandbox` se usa el `init_point` de pruebas).
- La `notification_url` del webhook apuntando al dominio de **producción**, y
  dada de alta en el panel de MP.
- **Una compra real de $199 de punta a punta** antes de anunciar nada. El
  entitlement se otorga por webhook, no en el navegador: si el webhook no llega,
  el alumno paga y no se le desbloquea nada, y eso se descubre con dinero de
  verdad o no se descubre.
- Confirmar que `examenes.precio` de `SIM-IPN-2026-V1` y `V2` dice **199** en la
  base de producción (correr `migrate_precio_sim_ipn_199.py` ahí). Si dice otra
  cosa, `desbloquear_simulacro` responde `monto_invalido` y **se rechazan todos
  los pagos**.

### 3 · Plataforma: subir el rate limit del registro (B6)

`REGISTRO_PUBLICO_LIMITE = 5` por IP por hora (`backend/app/routers/auth.py`).
Con el examen gratis abierto al público esto es poco: un salón entero sale por
la misma IP, y ahora **todos** tienen que registrarse para ver su calificación —
antes se registraba solo el que ya venía convencido. El sexto alumno del grupo
se topa con un 429 justo después de contestar veinte minutos de examen.

### 4 · Sitio: abrir los botones

Una línea por CTA en `assets/js/config.js`:

```js
produccion: { base: '…', examenAbierto: true, compraAbierta: true },
```

Y subir el `?v=` en los HTML más `VERSION_SITIO` (ver README). Se puede abrir
solo el examen y dejar la compra cerrada: son flags independientes a propósito,
porque el examen depende del punto 1 y la compra del punto 2.

**Antes de abrir, recorrer el flujo completo contra dev** (ver más abajo). El
sitio ya apunta a dev desde cualquier host que no sea victoriaedu.com.mx, así
que basta con levantarlo en local o desplegar la rama `dev`.

---

## Lo que sigue pendiente del lado de la plataforma

### B3 · `?next=` — ya solo estorba en el CTA de compra

El examen gratis ya no lo necesita. Pero el botón "2 exámenes por $199" del
sitio manda a `/paquetes/ipn-2026`, que es una pantalla autenticada: al
visitante sin sesión la plataforma lo rebota a `/login` **sin destino**, así que
después de entrar aterriza en el dashboard y tiene que volver a buscar el
paquete.

No es urgente —el camino que queremos que recorra es el otro: examen, resultado,
upsell— pero es el CTA que trae al que ya viene decidido a pagar, que es el más
caro de perder.

Cuando lo hagas, el guardarraíl de siempre: aceptar solo rutas relativas del
mismo origen (que empiece con `/` y **no** con `//`). Sin eso, `?next=https://sitio-falso.com`
es un open redirect desde tu página de login, que es el peor lugar posible.

### B5 · Atribución (`origen`)

Sin esto no sabemos cuántos registros trae el sitio, y sin ese número no hay
forma de decidir si vale la pena gastar en tráfico.

- `origen: str = ""` en `RegistroPublico` (`backend/app/models/user.py`)
- Persistirlo en el documento de usuario (`auth_service.py`)
- Que `RegistroForm` lo lea del query y lo mande en el body
- Mostrarlo en `/admin/usuarios`

Ojo: con el flujo nuevo el alumno llega a `/registro` **desde la plataforma**
(después del examen), no desde el sitio, así que el `origen` que manda la landing
se pierde en el camino. Para que la atribución sirva, el que tiene que viajar es
el del examen: guardarlo junto al intento anónimo y copiarlo al usuario en el
reclamo. Si no, todo el tráfico del sitio va a aparecer como directo.

### El endpoint de leads (`POST /api/v1/leads`)

Sin cambios: sigue sin existir y los correos de las listas de espera se siguen
guardando en el `localStorage` del visitante. Ver la sección del final.

---

## Verificación del flujo completo (contra dev)

El sitio ya apunta a dev desde cualquier host que no sea victoriaedu.com.mx: se
levanta en local (`python3 -m http.server 8000`) o se despliega la rama `dev`, y
no hay que cambiar ninguna configuración.

1. **Alumno nuevo, desde el celular** → "Haz el examen gratis" → cae directo en
   los 10 reactivos, **sin que le pidan nada**.
2. Contesta y entrega → le piden crear cuenta o entrar con Google.
3. Se registra → **cae en `/gratis/resultado` con su calificación**, no en el
   dashboard. (Aquí es donde se rompe si el claim no viaja.)
4. **Cierra el navegador antes de registrarse y vuelve después** → el claim vive
   48 h en `localStorage`: debe seguir pudiendo reclamarlo. Y pasadas las 48 h
   debe ver el mensaje de expirado, no un error.
5. **El mismo claim desde otra cuenta** → no debe revelar nada.
6. Banner de upsell → `/paquetes/ipn-2026` → **compra real de $199** de punta a
   punta: pago, webhook, y los dos simulacros desbloqueados.
7. **Sin cuenta, tocar "2 exámenes por $199"** → hoy aterriza en el dashboard
   después del login. Es B3; confirmar que al menos no se queda en blanco.

---

## Leads de los cursos que todavía no abren — a dónde llegan hoy

**Respuesta corta: a ningún lado.** Se guardan en el `localStorage` del navegador
**del propio visitante**. No hay servidor de por medio, no se envía nada, y nadie
del equipo los ve nunca.

`admin.html` los muestra, pero solo los que se capturaron en esa misma máquina y
ese mismo navegador. Si un alumno deja su correo desde su celular, ahí no aparece
— y si borra el caché, desaparecen también para él.

Esto importa porque el sitio **sí les promete algo**: el formulario dice *"Un solo
correo cuando abra"*. Esa promesa hoy no se puede cumplir.

| Dónde | `origen` | Qué prometemos |
|---|---|---|
| "Avísame cuando abra" — curso de matemáticas y curso de admisión | `lista-espera` | Un correo cuando abra la generación |
| "Avísenme de cambios" — convocatoria de segunda vuelta | `convocatoria-segunda-vuelta` | Un correo si el IPN mueve fechas |

Los tres viven en `assets/js/api.js` → `registrarLead()`, y el formulario está en
`assets/js/productos.js` y `assets/js/pagina-convocatoria.js`.

### Lo que hace falta de tu lado

Un `POST /api/v1/leads` público. Con eso el sitio deja de guardar en el navegador
y empieza a mandarlos de verdad.

```
POST /api/v1/leads          (sin auth, como registro-publico)
{ "correo": "...",          // obligatorio
  "nombre": "",             // opcional
  "telefono": "",           // opcional
  "origen": "lista-espera", // de dónde salió
  "producto": "curso-matematicas-ipn-2027" }   // opcional
```

Dos cosas que este endpoint sí necesita y el resto de la integración no:

- **Rate limit**, el mismo criterio que `registro-publico` (y ojo con B6).
- **CORS con el dominio del sitio.** Es la única parte de toda la integración
  donde el sitio llama a tu API desde el navegador; todo lo demás son links
  normales. Hoy `allow_origins=[settings.frontend_url]` acepta un solo origen,
  así que habría que admitir `https://victoriaedu.com.mx` además.

Mientras tanto, si de verdad hace falta capturar a esa gente, el canal que sí
llega es el WhatsApp del pie y del botón flotante.

---

## La 404, en el sitio y en la app

Hay una 404 diseñada y funcionando en el sitio (`404.html`). Va en dos sitios
distintos y cada uno pide algo diferente.

### En el sitio

nginx **no** sirve una página de error personalizada por su cuenta: sin esto
devuelve su pantalla blanca de "404 Not Found".

```nginx
error_page 404 /404.html;
```

Ojo con una cosa que ya está resuelta del lado del HTML y conviene no deshacer:
la página lleva `<base href="/">`. Una página de error se sirve **en la URL
pedida**, sin redirigir, así que en `/guias/algo-que-no-existe` las rutas
relativas se resolverían contra `/guias/` y no cargaría ni el CSS ni el logo.

### En la app

Next 14 App Router ya tiene su convención: **`frontend/src/app/not-found.tsx`**.
Ahí NO va el menú del sitio — la app tiene su propio layout, y el visitante
puede estar logueado.

| | Sitio | App |
|---|---|---|
| Menú superior | El del sitio | Ninguno, o el de la app |
| Botón principal | Volver al inicio | **Ir a mi dashboard** (`/dashboard`) |
| Botón secundario | Ver programas | **Ver mis simulacros** (`/simulacros`) |
| Enlace de ayuda | WhatsApp | El mismo WhatsApp |

Los textos que sí se conservan: eyebrow "RUTA NO ENCONTRADA", el 404, el
titular "Esta ruta no lleva a ninguna clase." y la descripción.

**Los valores del diseño**, por si lo reconstruyes con Tailwind y el design
system en vez de copiar el CSS:

```
fondo        #210A0F (guinda profundo)
panel        #FAF8F5 (blanco cálido), clip-path: polygon(26% 0, 100% 0, 100% 100%, 24% 100%, 0 52%)
404          Creato Display 800, blanco cálido, clamp(104px, 15vw, 216px), line-height .84
azul         #2C4D9D  ·  azul claro #8AA6D8  ·  guinda de las marcas #7A2233
ángulo de los cortes diagonales: 18deg (el del isotipo)
cuadrícula   24px fina + 120px mayor, blanco a .045 y .10 de opacidad
```

Dos detalles que costaron y evitarás repetir:

- Los cortes del "404" se hacen con `mask-image`, no pintando franjas encima:
  la máscara deja ver el fondo real y el corte encaja aunque debajo haya
  degradado. Y el periodo va en `em`, no en px — con px, en móvil el número
  sale cruzado por el doble de cortes y deja de leerse.
- La imagen de Vico es `assets/brand/vico/vico-pensando.webp` (1600×2000, con
  alfa). Va sobre el panel claro: sobre fondo oscuro su cuerpo azul marino se
  funde y se pierde la silueta.

---

## Fuera de alcance — no toques esto

- **CORS / `FRONTEND_URL`.** Solo hace falta para el endpoint de leads, cuando
  exista. Todos los demás saltos son links normales; el sitio nunca llama a tu
  API desde el navegador.
- **Login con Google.** Ya está y ya sirve en el flujo del examen gratis.

---

## Lo que hay que decidir aparte (no es de Brando, es de los tres)

El sitio es `victoriaedu.com.mx` y la plataforma es `edu.victoriadev.com`. El
alumno da clic en "examen gratis" y salta a un dominio que no se parece a la
marca — y con el flujo nuevo eso pasa **antes** de que le pidamos nada, así que
pega menos que antes. Pero cuando llega el momento de registrarse, sigue estando
en un dominio ajeno.

La solución es barata: `examen.victoriaedu.com.mx` apuntando al mismo nginx, o
servir la plataforma bajo `victoriaedu.com.mx/app`. Config de nginx más un
certificado. Vale la pena antes de gastar el primer peso en tráfico.

**Dos correos que hay que confirmar.** `CONFIG.marca` publica
`hola@victoriaedu.mx` e `instituciones@victoriaedu.mx`, en el dominio que no
resuelve. Si el correo vive en `victoriaedu.com.mx`, hay que cambiarlos; si vive
aparte, hay que verificar que esas cuentas reciben. No se tocaron porque es una
decisión de ustedes, no un typo evidente como los `canonical`.
