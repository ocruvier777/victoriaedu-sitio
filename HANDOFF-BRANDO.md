# Handoff → Brando

**Qué es esto:** la lista corta de lo que necesito de tu lado para que el embudo
del sitio funcione de punta a punta. El contrato completo —URLs, ambientes,
payloads, verificación— está en **[INTEGRACION-PLATAFORMA.md](INTEGRACION-PLATAFORMA.md)**;
esto es el "empieza por aquí".

**Fecha:** 17 de agosto de 2026 · **Versión del sitio:** 1.8.1 · **Rama:** `main`

---

## 1 · Lo que cambió en el sitio (ya está en producción)

| Qué | Detalle |
|---|---|
| **La landing del simulacro se reescribió** | `simulacro-ipn-2026.html` dejó de vender de entrada. Ahora el objetivo es el **diagnóstico gratuito de 10 reactivos**; los dos simulacros por $199 quedan como segundo paso. Es la página que recibe el tráfico pagado. |
| **La plataforma se mudó al campus** | La base de producción pasó de `edu.victoriadev.com` —que **ya no resuelve**— a `campus.victoriaedu.com.mx`. |
| **`examenAbierto: true`** | Los CTA gratuitos ya salen de verdad, no abren el aviso de "Pronto". |
| **`compraAbierta: false`** | Sigue cerrado. Mercado Pago está en sandbox. |
| **El sitio salió de Netlify** | Hoy lo sirve el mismo nginx que la plataforma. La 404 ya responde con código 404 real. |
| **Se borró el código muerto del checkout viejo** | Ver §4. |

Los CTA gratuitos del sitio apuntan exactamente a:

```
https://campus.victoriaedu.com.mx/gratis/PUB-IPN-2026-GRATIS?origen=landing-examen-gratis
```

---

## 2 · Lo primero: confirmar que el campus responde

**No pude verificarlo yo.** La red desde la que trabajo tiene un FortiGate
haciendo inspección TLS y su Web Filter devuelve 403 en ese dominio, así que
todas mis comprobaciones se quedaron en la puerta. El DNS sí resuelve
(Cloudflare, `172.67.131.68`).

Esto importa porque **antes** el botón estaba cerrado y abría un aviso con
WhatsApp; **ahora** es un enlace real. Si el campus no responde, el alumno se
topa con un error en vez de un aviso — es peor que antes.

Comprueba estos tres, desde fuera de la red de la oficina:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://campus.victoriaedu.com.mx/gratis/PUB-IPN-2026-GRATIS
curl -s -o /dev/null -w "%{http_code}\n" https://campus.victoriaedu.com.mx/api/v1/public/examenes/PUB-IPN-2026-GRATIS
curl -s -o /dev/null -w "%{http_code}\n" https://campus.victoriaedu.com.mx/paquetes/ipn-2026
```

**Criterio de aceptación:** los dos primeros en 200 y sirviendo el examen de
verdad (no un 404 ni un rebote a login). El tercero puede rebotar a `/login`:
esa pantalla sí exige sesión y es el pendiente B3 de abajo.

Y el recorrido completo a mano, desde un celular con datos:
`victoriaedu.com.mx/simulacro-ipn-2026.html` → "Hacer mi diagnóstico gratis" →
contestar → registro → ver la calificación.

---

## 3 · Pendientes tuyos, por orden de lo que cuesta perderlos

### 3.1 · Rate limit del registro (B6) — **el más caro**

Sigue en **5 altas por IP por hora**. Con el flujo nuevo el alumno se registra
*después* de invertir veinte minutos contestando: si ahí se topa con un 429,
perdiste al que más lejos había llegado. Y una prepa entera sale por la misma IP.

**Aceptación:** que 30 registros seguidos desde una IP no devuelvan 429.

### 3.2 · Atribución del `origen` (B5)

Sin esto no sabemos cuántos registros trae el sitio, y sin denominador no se
puede decidir si vale la pena pagar tráfico. La landing ya manda
`?origen=landing-examen-gratis` y hoy se ignora.

**Ojo con dónde engancharlo:** en el flujo nuevo el alumno llega a `/registro`
**desde la plataforma**, no desde el sitio, así que el `origen` de la landing se
pierde en el camino. Hay que guardarlo junto al **intento anónimo** y copiarlo al
usuario en el reclamo. Si lo enganchas solo en `/registro`, todo el tráfico del
sitio va a aparecer como directo. Detalle en INTEGRACION-PLATAFORMA.md § B5.

**Aceptación:** un alumno que entra por la landing aparece en `/admin/usuarios`
con `origen = landing-examen-gratis`.

### 3.3 · `?next=` en el CTA de compra (B3)

"Quiero los 2 simulacros" manda a `/paquetes/ipn-2026`, que exige sesión: al
visitante sin cuenta lo rebotas a `/login` **sin destino**, y acaba en el
dashboard buscando el paquete otra vez. Es el CTA del que ya viene decidido a
pagar — el más caro de perder.

**Guardarraíl obligatorio:** aceptar solo rutas relativas del mismo origen (que
empiece con `/` y **no** con `//`). Sin eso es un open redirect desde tu pantalla
de login, que es el peor sitio donde tenerlo.

### 3.4 · Mercado Pago fuera de sandbox

Es lo que bloquea `compraAbierta`. Cuando esté, se cambia una línea en
`assets/js/config.js` y el botón deja de decir "Pronto".

### 3.5 · `POST /api/v1/leads` — el que no existe

Las listas de espera de los cursos que todavía no abren (`index.html`,
`tienda.html`, la página de convocatoria) guardan el correo en el
**`localStorage` del visitante**. O sea: solo existen en ese navegador y nadie
del equipo los ve nunca. Se pierden todos.

Es gente que **no puede registrarse en la plataforma** porque todavía no hay nada
que comprar, así que no lo cubre ningún endpoint existente.

Con un `POST` público que acepte `{ nombre, correo, telefono, productoId, origen }`
el sitio deja de fingir. Mientras no exista, `assets/js/api.js` y `admin.html`
son un parche que dice la verdad en sus comentarios, pero sigue siendo un parche.

---

## 4 · Qué se borró del sitio, para que no lo busques

El sitio ya no cobra nada. Todo lo del checkout propio se retiró:

- **CSS:** el stepper (`.vic-steps`, `.vic-step*`), el resumen (`.vic-summary`,
  `.vic-summary__line`), las rejillas (`.vic-checkout`, `.vic-confirm`), los datos
  bancarios (`.vic-bank*`), el folio (`.vic-folio`), la zona de subir comprobante
  (`.vic-drop*`), las opciones de pago (`.vic-radio-card*`) y las acciones de la
  tabla de comprobantes (`.vic-acciones`).
- **CSS huérfano de rediseños viejos:** la cuenta regresiva (`.vic-cd*`), las
  tarjetas de "dolor" (`.vic-dolor`), la tarjeta de credencial (`.vic-credencial*`),
  los placeholders de escaneo (`.vic-scan*`) y `.vic-num-chip`.
- **JS:** la maquinaria de la cuenta regresiva en `ui.js` (`activarCuentaRegresiva`,
  `data-vence`, `data-cr`, `data-dias-restantes`) y `CONFIG.lanzamiento`, que ya no
  los usaba ninguna página.
- **`api.js`** dejó de cargarse en tres páginas que no lo usaban.

De 41 clases CSS sin uso quedan 8, y son a propósito: `vic-sr-only` (accesibilidad),
`vic-center`, `vic-textarea`, `vic-badge--danger`, `vic-note--success` y tres
variantes de la piel de marca. Son vocabulario del design system, no restos.

**Lo que NO se borró y no conviene borrar:**

- `checkout.html` y `pago.html` — son puentes a la plataforma. Hay ligas
  compartidas apuntando ahí.
- `confirmacion.html` — explica a dónde se fue la compra, para quien llegue con
  un folio `VE-` viejo. No redirige a propósito.
- `admin.html` + `api.js` — la lista de espera. Vive hasta que exista §3.5.

---

## 5 · Bug conocido que no toqué

**El panel desplegable de "IPN" empuja la página a lo ancho** en las páginas que
llevan `data-cta="ninguno"` (`confirmacion.html` y `admin.html`), alrededor de
los 1280px: sin el botón del CTA el menú se corre a la derecha y el panel, que
está anclado con `left: 0` y mide 320px, se sale de la ventana. Da scroll
horizontal.

Es **preexistente** —medido contra el commit anterior, sale idéntico— y solo
afecta a dos páginas internas con `noindex`. No lo arreglé aquí porque el
remedio es cambiar el anclaje del panel en el header **compartido por las once
páginas**, y eso no cabe en un commit de limpieza. Se arregla en
`assets/css/victoria.css`, en la regla
`.vic-nav-item:not(.vic-nav-item--mega) > .vic-nav-panel`.

---

## 6 · Cómo se toca el sitio, en dos reglas

1. **Todo lo operable vive en `assets/js/config.js`.** Precios, WhatsApp, el
   dominio de la plataforma, los flags de apertura, el video del hero. Ningún
   HTML tiene un dominio escrito a mano: los CTA usan `data-plataforma="examen"`
   o `"comprar"` y `ui.js` los completa. Si la plataforma se muda otra vez, es
   una línea.

2. **El `?v=` y `VERSION_SITIO` se suben JUNTOS al publicar.** Van hoy en `v=23`
   y `1.8.1`. Si cambias CSS o JS y no los subes, el visitante recurrente recibe
   HTML nuevo con estilos viejos. El pie imprime la versión: es lo que se le
   pregunta a quien reporte "se ve raro".

```bash
sed -i 's/?v=23/?v=24/g' *.html    # y sube VERSION_SITIO en config.js
```

---

## 7 · Fuera de tu alcance

No hace falta que toques nada de esto; está listo o es decisión de otro:

- El **video del hero** de la landing. `CONFIG.videoSimulacro` está en `null` a
  propósito hasta que Óscar grabe el recorrido; el hero enseña una portada de
  marca, nunca un hueco. Poner el video es cambiar esa línea.
- Los **testimonios**. Solo van citas reales y autorizadas; ver el comentario de
  `CONFIG.testimonios`.
- La **404**. Ya está conectada y devuelve código 404 real.
