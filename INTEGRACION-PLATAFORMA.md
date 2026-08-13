# Integración sitio → plataforma

**Para Brando.** Qué cambió en el sitio, qué falta del lado de la plataforma y en qué
orden. Todo lo del sitio ya está hecho y funcionando; lo de abajo es lo tuyo.

- **Sitio:** `ocruvier777/victoriaedu-sitio` (estático) · `victoriaedu.mx`
- **Plataforma:** `brandosanchezr/victoria-edu` rama `dev` · `edu.victoriadev.com`

---

## Por qué

El sitio pedía dinero antes de demostrar nada: el botón principal era "Comprar
simulacro — $299" y llevaba a un checkout propio. Ese checkout era de mentiras —
guardaba los pedidos en `localStorage`, así que se perdían al cambiar de navegador y
nadie más que ese alumno los veía.

Tú ya construiste el flujo real en la plataforma (issue #74): registro público con
auto-login, simulacros sueltos sin curso, comprobante y validación por admin. El sitio
lo estaba duplicando, peor.

Entonces: **el sitio deja de cobrar y se vuelve el escaparate.** El botón principal
ahora es "Haz el examen gratis" y todo lo que implique una cuenta —presentar, ver
respuestas, pagar— salta a la plataforma. El registro es el peaje: como el endpoint de
revisión ya es `require_role(["alumno"])`, no hay forma de ver las respuestas sin
cuenta. Eso era exactamente lo que queríamos y ya estaba construido.

```
victoriaedu.mx  "Haz el examen gratis"
      ↓
edu.victoriadev.com/registro?next=/examenes/SIM-IPN-2026-DEMO&origen=landing-examen-gratis
      ↓  crea cuenta → auto-login → redirige a next=
/examenes/SIM-IPN-2026-DEMO        ← 10 reactivos, precio 0, standalone
      ↓
/examenes/SIM-IPN-2026-DEMO/resultados/{intentoId}
      ↓  respuestas + explicaciones  ← esto es el premio por registrarse
/simulacros  →  "Comprar — $199"  →  comprobante  →  validas  →  desbloqueado
```

---

## Contrato de URLs

Esto es lo único que el sitio le pide a la plataforma. Vive en
`assets/js/config.js` → `CONFIG.plataforma`, y se construye en `assets/js/ui.js`
(`urlExamenGratis()` / `urlComprar()`).

| Parámetro | Valor | Qué esperamos |
|---|---|---|
| `next` | `/examenes/SIM-IPN-2026-DEMO` o `/simulacros` | A dónde mandar al alumno **después** de crear la cuenta |
| `origen` | `landing-examen-gratis` / `landing-compra` | De dónde vino, para poder atribuir |

Las dos URLs exactas que el sitio genera hoy:

```
https://edu.victoriadev.com/registro?next=%2Fexamenes%2FSIM-IPN-2026-DEMO&origen=landing-examen-gratis
https://edu.victoriadev.com/registro?next=%2Fsimulacros&origen=landing-compra
```

Los parámetros ya viajan. Hoy la plataforma los ignora y el alumno cae en `/dashboard`
—el embudo funciona a medias pero no se rompe—, así que puedes hacer B1…B4 en el orden
que quieras sin coordinarte conmigo.

Si cambias el `id_publico` del examen demo o el dominio, avísame: son dos líneas en
`config.js` del sitio y no hace falta tocar ningún botón.

---

## B1 · Crear el examen demo · **bloqueante**

10 reactivos, gratis, presentable sin curso.

```
id_publico:  SIM-IPN-2026-DEMO
tipo:        simulacro
precio:      0
standalone:  true
publicado:   true
duracion_min: 20
```

```bash
python -m scripts.import_examen_ipn seeds/ipn-2026/demo_10.json \
  "Diagnóstico IPN — 10 reactivos" --id-publico SIM-IPN-2026-DEMO \
  --curso IPN --precio 0 --duracion-min 20 --esperado 10
```

Luego agrega `"SIM-IPN-2026-DEMO"` a `SIMULACROS_OBJETIVO` en
`backend/scripts/mark_standalone_simulacros.py:37` y corre el script.

**La buena noticia:** no necesitas ninguna ruta pública nueva en FastAPI.
`_verificar_acceso_examen` (`backend/app/services/examen_service.py:24-58`) ya deja
pasar este caso tal cual está — `standalone` se salta el check de curso, y `precio > 0`
es falso, así que nunca llega a consultar `desbloqueos_simulacro`. Un alumno recién
registrado, con `cursos: []`, entra directo.

**Dos cosas de contenido, no de código:**

1. Los reactivos de `backend/seeds/ipn-2026/examen_1.json` tienen `"explicacion": null`.
   Si el demo hereda eso, el premio por registrarse es un número pelón y el embudo
   pierde su razón de ser — la promesa del sitio es literalmente "ves cada respuesta
   explicada". Las 10 explicaciones hay que escribirlas.
2. Esos 10 reactivos quedan quemados: cualquiera se registra y los ve. Mejor que no
   salgan de los 139 de V1/V2.

---

## B2 · Un renglón en el listado · **bloqueante**

`backend/app/services/examen_service.py:786`, dentro de `obtener_simulacros_sueltos`:

```python
# antes
desbloqueado = desbloqueos_map.get(eid) == "activo"
# después
desbloqueado = ex["precio"] <= 0 or desbloqueos_map.get(eid) == "activo"
```

El listado calcula `bloqueado` mirando **solo** `desbloqueos_simulacro`, sin considerar
el precio. El gate de acceso sí considera el precio (`examen_service.py:47`). Esa
diferencia hace que el demo aparezca en `/simulacros` con un botón **"Comprar — $0"**
aunque entrar por la liga directa funcione perfecto.

El deep link del sitio no pasa por el listado, así que el embudo funciona sin este fix.
Pero cualquiera que llegue a `/simulacros` por su cuenta ve el botón absurdo.

---

## B3 · Soportar `?next=` en registro y login · **bloqueante**

Hoy no se lee ni un query param en toda la app (lo confirmé con grep) y el destino
post-login está escrito a mano. Sin esto, el alumno que da clic en "examen gratis"
termina en `/dashboard` mirando un tablero vacío, sin el examen que le prometimos.

Cuatro puntos:

1. **`frontend/src/lib/auth.tsx:134-158`** — `login(correo, password, dest?)`. Usar
   `dest` en lugar del `/dashboard` fijo cuando venga.

   Valídalo antes de usarlo: solo rutas relativas del mismo origen —que empiece con `/`
   y **no** con `//`—. Si no cumple, ignóralo y usa el default. Sin ese guardarrail
   cualquiera puede mandar `?next=https://sitio-falso.com` y tienes un open redirect
   desde tu página de login, que es el peor lugar posible para tenerlo.

2. **`frontend/src/components/auth/RegistroForm.tsx:38`** — leer
   `useSearchParams().get("next")` y pasarlo al `login()` del auto-registro.

3. **`frontend/src/app/registro/page.tsx:16-18`** y **`login/page.tsx:15-19`** — el
   `router.push("/dashboard")` del caso "ya venía autenticado" también debe respetar
   `next`. Si no, el alumno que ya tiene sesión abierta en otra pestaña nunca llega al
   examen.

4. **Los links cruzados registro ↔ login** (`registro/page.tsx:51` y su gemelo) tienen
   que **conservar** `next` y `origen`. Es el caso más fácil de olvidar y pega justo al
   alumno que ya nos conoce: da clic en "¿Ya tienes cuenta? Inicia sesión", se pierden
   los parámetros y acaba en el dashboard.

---

## B4 · Precio a $199 · **bloqueante**

El sitio ya anuncia **$199** en todos lados (`CONFIG.CATALOGO` y la página del
producto). Necesito que `examenes.precio` de `SIM-IPN-2026-V1` y `SIM-IPN-2026-V2`
diga exactamente lo mismo.

No es cosmético: `desbloquear_simulacro` (`examen_service.py:618`) valida
`monto == examen["precio"]` exacto y devuelve `monto_invalido` si no coincide. Si la
base dice 249 y el sitio anuncia 199, **se rechazan todos los pagos**.

`import_examen_ipn.py:283` tiene `--precio` con default `249.0`, así que lo más probable
es que ese sea el valor que está hoy en Mongo. **Confírmame el valor real antes de que
publiquemos**, y si el precio acordado cambia, dime y lo muevo en el sitio — ahí está en
un solo lugar.

---

## B5 · Atribución · no bloqueante, pero es la única forma de medir

Sin esto no podemos saber cuántos registros trae el sitio. Y sin ese número no hay forma
de decidir si vale la pena gastar en tráfico.

- `origen: str = ""` en `RegistroPublico` (`backend/app/models/user.py:17-24`)
- Persistirlo en el documento de usuario (`backend/app/services/auth_service.py:74-87`)
- `RegistroForm` lo lee del query y lo manda en el body
- Mostrarlo en `/admin/usuarios`

El sitio ya manda `?origen=landing-examen-gratis` / `landing-compra`.

---

## B6 · Rate limit del registro · no bloqueante, pero explota en el peor momento

`registro-publico` permite **5 altas por IP por hora**
(`REGISTRO_PUBLICO_LIMITE`, `backend/app/routers/auth.py:115-133`).

Si Emiliano o Óscar meten esto en un live, o si un grupo de prepa lo abre desde el wifi
de la escuela, el sexto alumno se topa con un error. Todos salen por la misma IP. Súbelo
antes de mandarle tráfico.

---

## B7 · `/registro` en `publicPaths` · cosmético

`frontend/src/middleware.ts:4` → `const publicPaths = ["/login", "/registro"];`

Hoy el middleware siempre hace `NextResponse.next()`, así que no rompe nada. Vale la
pena por consistencia, antes de que alguien lo endurezca y se lleve el registro entre
las patas.

---

## Fuera de alcance — no toques esto

- **CORS / `FRONTEND_URL`.** No hace falta. Todos los saltos son links normales; el
  sitio nunca llama a tu API desde el navegador. Déjalo con un solo origen.
- **Login con Google.** No bloquea el embudo, hazlo cuando quieras. Solo que respete el
  mismo `?next=` de B3.
- **Pasarela de pago.** Sigue siendo comprobante + validación manual. No cambia nada.

---

## Pendiente sin dueño: leads

El sitio todavía captura correos en dos lugares que la plataforma no cubre: la lista de
espera de los productos `proximamente` (curso de matemáticas, curso de admisión) y los
avisos de cambios en la convocatoria. Es gente que **no puede registrarse** en la
plataforma porque todavía no hay nada que comprar.

Hoy eso vive en el `localStorage` del navegador de cada quien, o sea que en la práctica
se pierde. Se ve en `admin.html` pero solo en la máquina donde se capturó.

Lo que lo arreglaría es un `POST /api/v1/leads` público (correo + nombre + teléfono +
origen), con el mismo rate limit del registro. **Esto sí necesitaría CORS** para el
dominio del sitio. No es urgente y no bloquea nada — lo dejo anotado para cuando toque.

---

## Verificación

Cuando termines B1–B4, avísame y lo probamos juntos. Yo apunto el sitio a
`dev-edu.victoriadev.com` (una línea en `config.js`) y recorremos:

1. **Alumno nuevo** → clic en "examen gratis" → registro → **cae en el examen**, no en
   el dashboard → contesta → ve resultados con respuestas y explicaciones.
2. **Alumno con cuenta, deslogueado** → clic → "¿Ya tienes cuenta? Inicia sesión" →
   login → **cae en el examen** (este es el que se rompe si se pierden los params).
3. **Alumno ya logueado en otra pestaña** → clic → entra directo al examen.
4. **`/simulacros`** muestra "Presentar" en el demo, no "Comprar — $0".
5. **Compra real de prueba de $199** de punta a punta contra dev: que
   `desbloquear_simulacro` no responda `monto_invalido`.
6. **Móvil**, que es por donde va a llegar casi todo el tráfico.

---

## Lo que hay que decidir aparte (no es tuyo, es de los tres)

El sitio es `victoriaedu.mx` y la plataforma es `edu.victoriadev.com`. El alumno da clic
en "examen gratis" y salta a un dominio que no se parece a la marca, justo en el paso
donde le pedimos nombre, correo, teléfono y contraseña.

Eso pega exactamente donde nos duele: el argumento para hacer todo este cambio fue que
nadie da sus datos sin haber visto nada. Un dominio ajeno en el momento del registro
juega en contra de eso.

No bloquea el lanzamiento, pero la solución es barata: `examen.victoriaedu.mx` apuntando
al mismo nginx, o servir la plataforma bajo `victoriaedu.mx/app`. Config de nginx más un
certificado. Vale la pena antes de gastar el primer peso en tráfico.
