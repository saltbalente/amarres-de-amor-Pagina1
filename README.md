# amarres-de-amor-Pagina1 — «Amarres de Amor Efectivos» · versión «Hilo rojo»

Sitio **estático e independiente** (HTML + CSS + JS, sin dependencias ni build). Es la nueva versión
de la landing de `saltbalente/amarres-amorosos`: misma arquitectura de página y mismas promesas del
negocio, con **diseño nuevo**, **textos reescritos**, **fotos del banco de imágenes** y la **medición,
el número y el tracker de la landing `brujosyvidentes`** (`consulta-espiritual.tuconsultagratis.online/brujosyvidentes/`,
carpeta `brujosyvidentes/` de `saltbalente/maestro-sebastian-landing`).

```bash
python3 -m http.server 8080   # y abrir http://localhost:8080/
```

---

## 1. Medición y contacto (copiados de `brujosyvidentes`)

| | Valor |
|---|---|
| **WhatsApp** | `14802439808` → se muestra como +1 (480) 243-9808 |
| **Llamadas** | ninguna: la web de referencia las retiró («sin teléfono, llamadas retiradas») |
| **Google Tag Manager** | `GTM-T4BCC6P` — snippet al principio de `<head>` y `<noscript>` tras `<body>` |
| **gtag.js** | carga `AW-11495571750` y hace `config` de `AW-11495571750` y `AW-16892054054` |
| **wa-tracker.js** | `https://googleads.mkinnovador.com/wa-tracker.js` con `data-sendto="AW-11495571750/CqKaCOfGuM4cEKaCwukq,AW-16892054054/PJRCCIXxos4cEKaU4fY-"` |

Igual que en la referencia, **las conversiones de Google Ads las dispara solo `wa-tracker.js`**;
`script.js` no las repite, así que un clic cuenta una vez por cuenta.

`script.js` publica en `dataLayer` (lo lee GTM) los mismos eventos que la web de referencia, más el
del diagnóstico:

| Evento | Cuándo | Datos |
|---|---|---|
| `pagina_lista` | al cargar | `pagina: "amarres-de-amor"` |
| `wa_click` | clic en cualquier enlace `wa.me` | `origen` (= `data-origen`: `hero`, `dolor`, `diagnostico`, `serv-pasion`, `barra-movil`, `geobar`…) y `ciudad` si viene de la barra de ubicación |
| `diagnostico_completado` | al terminar el quiz | `diagnostico_trabajo` |
| `geobar_vista` | cuando aparece la barra de ubicación del tracker | `ciudad` |

### El número vive en los enlaces

No hay `data-wa` en el `<body>`: **el número se lee de los propios `href="https://wa.me/14802439808"`**.
Así la herramienta «Cambiar número de WhatsApp» del dashboard (que reescribe los `wa.me/…` y el número
visible dentro de esos enlaces) cambia toda la página de una vez y nada queda apuntando al número
viejo. Cada enlace lleva su mensaje en `data-wa-text`; `script.js` le añade `?text=` y lo vuelve a
componer en `pointerdown`, antes del clic, para que el tracker lea el mensaje final. Sin JavaScript
todos los botones siguen abriendo el chat.

### Barra de ubicación del tracker

En móvil, `wa-tracker.js` monta un `#wa-geo-bar` con la ciudad del visitante. Como en la referencia,
`script.js` lo detecta y lo reviste con el estilo de esta página (vino, oro rosa, corazón con hilo)
y pone su botón de WhatsApp fuera del Shadow DOM para que el tracker y el `wa_click` lo cuenten. La
cabecera baja lo que mida la barra (`--geobar-h`).

## 2. Diseño · sistema «Hilo rojo»

| | |
|---|---|
| **Fondos** | vino casi negro (`--ink #0c0306`, `--wine`, `--velvet`) con resplandores de vela |
| **Acentos** | hilo rojo (`--thread #ff2e4d`), oro rosa en degradado (`--rg`), verde WhatsApp solo en los botones de acción |
| **Display** | Fraunces (serif óptica variable; las cursivas van en oro rosa) |
| **Texto** | Manrope |
| **Motivos** | el **hilo rojo** que «ata» la página (lazo alrededor del hero, adorno con nudo bajo cada título que se dibuja al aparecer, línea que une los pasos del proceso y los nudos del diagnóstico), **marcos en arco** para las fotos, tarjetas de vidrio con filete, grano de película, brasas, sello giratorio |

Las fuentes van **alojadas en el propio sitio** (`fonts/`, licencia SIL OFL): una petición menos a
terceros y mejor LCP. Todo el movimiento se apaga con `prefers-reduced-motion: reduce`.

## 3. Secciones

| # | Sección | Qué cambia respecto a la versión anterior |
|---|---|---|
| 1 | Cabecera fija | Indicador «En línea», barra de progreso roja, menú desplegable en móvil |
| 2 | Hero | H1 con la palabra clave, prueba social (4.9 · 14.200 casos), sello de pago. A la derecha, foto en arco rodeada por el hilo rojo y una **vista previa del chat** de WhatsApp que muestra lo fácil que es empezar |
| 3 | Barra de confianza | 37 años · 14.200+ · 3–9 días · 4.9★ con contador animado |
| 4 | «¿Te reconoces…?» | Las seis escenas como **notificaciones de madrugada** (hora + «visto»), y el giro «Tú no quieres dejarlo ir» con foto |
| 5 | Diagnóstico en 3 toques | Nudos 1-2-3 unidos por el hilo, resultado con llamas de fuerza; el mensaje de WhatsApp se compone solo |
| 6 | Los amarres | 7 trabajos con foto, plazo sobre la imagen y CTA propio. El «Amarre de Amor» va destacado a doble ancho («El más pedido») + tarjeta «¿Tu caso no está?» |
| 7 | Cómo funciona | 4 pasos unidos por el hilo; el 4.º, en oro: pagas al ver resultados |
| 8 | El altar | Banda a sangre con el altar en forma de corazón y texto en tarjeta de vidrio |
| 9 | Garantía | Foto en arco con **sello giratorio** «Pagas al ver resultados · Consulta gratis» y cuatro compromisos |
| 10 | Testimonios | Carrusel con puntos, etiqueta de resultado y **monogramas** (no se muestran fotos de clientes) |
| 11 | El maestro | Foto de velas de unión, capitular, datos clave y firma |
| 12 | Comentarios | Muro de 16 comentarios plegado a 4, con «me gusta» y formulario |
| 13 | Preguntas | Encabezado fijo a la izquierda + acordeón de 8 preguntas (también en `FAQPage`) |
| 14 | Cierre | «No dejes que pase otra noche así», CTA grande y número visible |
| 15 | Pie | Aviso legal (`.pol-enlaces`), descargo y número |
| — | Flotantes | Botón de WhatsApp con burbuja en escritorio; barra fija en móvil que se esconde al llegar al cierre |

## 4. Copy

Se conservan las promesas y cifras del negocio (37 años, 14.200 casos, 3 a 9 días, 4.9, consulta
gratis, precio cerrado antes de empezar, pagas al ver resultados, nunca trabajos para hacer daño) y se
reescriben los textos para que sean más directos y concretos. Los **testimonios y comentarios se
mantienen tal cual**: son palabras de clientes y no se «mejoran». Cada CTA lleva su propio mensaje
prellenado según el punto de la página en el que se pulsó.

## 5. SEO

- `<title>`, `<h1>` y los `<h2>` contienen **amarres de amor** / **amarres amorosos**.
- `JSON-LD` con `ProfessionalService` + `LocalBusiness`, catálogo de servicios, `AggregateRating` y
  `FAQPage` (las ocho preguntas, idénticas al texto visible).
- Open Graph y Twitter Card. `alt` descriptivo en cada foto, `width`/`height` en todas, `loading="lazy"`
  salvo la del hero (precargada con `fetchpriority="high"`).
- **Sin `canonical`**: la versión anterior apuntaba a `amarresdeamorfuertesyefectivos.com`; si esta
  página se publica en otro dominio, añadir su propia URL canónica en `<head>`.

## 6. Imágenes (banco `googleads.mkinnovador.com/image-bank`)

Todas salen del banco (`public/banco/` de `google-ads-dashboard`), recortadas a la proporción en que
se muestran y recomprimidas en WebP (de 8 a 83 KB cada una).

| Archivo | Original del banco | Dónde |
|---|---|---|
| `hero-pareja-velas.webp` | `pareja-romantica-con-velas-esotericas.webp` | Hero (arco) y Open Graph |
| `noche-sin-respuesta.webp` | `mujer-afligida-por-amor-perdido.webp` | Giro de la sección de dolor |
| `lectura-cartas.webp` | `manos-con-cartas-de-tarot-y-velas.webp` | Fondo del diagnóstico |
| `amarre-hilo-rojo.webp` | `amarre-de-amor-con-fotos-y-velas.webp` | Amarre de Amor |
| `regreso-luna.webp` | `vela-roja-y-beso-bajo-la-luna.webp` | Regreso del Ser Amado |
| `separacion-terceros.webp` | `ritual-esoterico-con-velas-de-figura.webp` | Separación de Terceros |
| `endulzamiento-corazones.webp` | `velas-corazones-carta-amor-esoterico.webp` | Endulzamiento |
| `pasion-vela.webp` | `pareja-romantica-con-velas-y-rosas.webp` | Amarre de Pasión |
| `compromiso-propuesta.webp` | `propuesta-de-amor-con-velas-rituales.webp` | Amarre de Compromiso |
| `limpieza-hierbas.webp` | `ritual-esoterico-con-hierbas-y-velas-2.webp` | Limpieza y Desamarre |
| `nombres-a-la-vela.webp` | `manos-escribiendo-con-luz-de-vela.webp` | Proceso |
| `altar-corazon.webp` | `altar-mistico-con-velas-en-forma-de-corazon.webp` | Banda del altar |
| `vela-corazon-manos.webp` | `manos-sosteniendo-vela-corazon-encendida.webp` | Garantía |
| `pareja-corazon-luz.webp` | `pareja-forma-corazon-de-luz.webp` | Testimonios |
| `velas-unidas.webp` | `velas-rojas-unidas-en-ritual.webp` | El maestro |
| `velas-rojas.webp` | `velas-rojas-encendidas-en-fila.webp` | Fondo del cierre |

Se descartaron las del banco con marca de agua o texto incrustado (p. ej. «Conjured Moon», «POW*»)
y las de calaveras o Baphomet, que no encajan con un amarre de amor.

## 7. Archivos

```
index.html      portada
styles.css      sistema de diseño completo (también lo usa el aviso legal)
script.js       WhatsApp, medición, menú, revelados, contadores, diagnóstico, carrusel,
                comentarios, acordeón y barra de ubicación del tracker
politicas.html  aviso legal y condiciones (con el número y los servicios externos de esta versión)
politicas.css   estilos del aviso legal
fonts/          Fraunces (normal e itálica) y Manrope, woff2 latín, SIL Open Font License
assets/         fotos .webp del banco de imágenes
```
