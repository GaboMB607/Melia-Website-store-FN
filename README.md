# Melia · Landing page

Landing page para **Melia**, e-commerce premium de miel 100% natural.
HTML5, CSS3 y JavaScript vanilla, sin dependencias ni proceso de build.

## Cómo verla

- **Rápido:** abre `index.html` directamente en el navegador (funciona con `file://`).
- **Recomendado:** sírvela con un servidor local, por ejemplo la extensión *Live Server* de VS Code o:

  ```bash
  python -m http.server 8000
  ```

  y abre `http://localhost:8000`.

## Estructura

```
├── index.html
├── css/
│   ├── tokens.css       # colores de marca, tipografías, radios, sombras, z-index
│   ├── base.css         # reset, tipografía global y utilidades
│   ├── layout.css       # header con glassmorphism, menú móvil y footer
│   ├── components.css   # botones, tarjeta de producto, modal, cantidad, toast, cursor
│   ├── sections.css     # hero, trust badges, productos, origen, proceso, newsletter
│   └── animations.css   # fade-in-up, entrada del hero, parallax y keyframes
├── js/
│   ├── main.js          # inicia cada módulo de forma aislada
│   └── modules/
│       ├── utils.js          # helpers ($, formato de precio COP, localStorage seguro)
│       ├── products-data.js  # catálogo: nombres, precios, descripciones, notas
│       ├── header.js         # estado del header, menú móvil, enlace activo
│       ├── reveal.js         # animaciones al hacer scroll (IntersectionObserver)
│       ├── parallax.js       # parallax de "Origen" (respaldo JS)
│       ├── effects.js        # ripple y botón magnético
│       ├── cart.js           # carrito local + contador del header
│       ├── modal.js          # modal "Vista rápida" (<dialog>)
│       ├── cursor.js         # cursor personalizado
│       ├── toast.js          # mensajes de confirmación
│       └── newsletter.js     # formulario + estructura para EmailJS
└── assests/imagenes/
```

Los scripts son clásicos con `defer` (no módulos ES) para que la página funcione
también abriéndola como archivo local.

## Contenido editable

- **Productos y precios:** `js/modules/products-data.js` (el modal lee de aquí) y las
  tarjetas en `index.html`. Los precios vienen de las etiquetas de los frascos.
- **Textos:** directamente en `index.html`.
- **Colores y tipografías:** `css/tokens.css`.

## Fuentes de marca

`Adelia` (títulos) y `Ananda` (acentos) son fuentes caligráficas con licencia propia.
Hoy se cargan con `local()`, así que **solo se ven en equipos que las tienen instaladas**;
el resto de visitantes ve los respaldos *Cormorant Garamond* y *Allura* (Google Fonts).

Para que todos vean las fuentes de marca:

1. Confirma que la licencia permite uso web y comercial.
   - La versión instalada de Ananda es *Personal Use*: no permite uso comercial y
     reemplaza los números por una marca de agua.
2. Convierte los archivos a `.woff2` y guárdalos en `assests/fuentes/`.
3. Descomenta la línea `url(...)` de cada `@font-face` en `css/tokens.css`.

Reglas de uso en el diseño: las caligráficas nunca van en mayúsculas, sin `letter-spacing`
y nunca para números.

## Newsletter y EmailJS

El formulario de "Únete a la colmena" envía el correo con **EmailJS**:

- SDK oficial cargado desde el CDN en `index.html` (`@emailjs/browser@4`).
- Configuración (Public Key, Service ID y Template ID) en `EMAILJS_CONFIG`, dentro de
  `js/modules/newsletter.js`.
- Se envía `{ email: correo_del_usuario }`: en la plantilla de EmailJS usa la variable
  `{{email}}` (por ejemplo en el campo *To Email* para que el suscriptor reciba la bienvenida).
- Flujo: valida el correo, el botón cambia a "Enviando...", y al responder EmailJS limpia el
  formulario y muestra "¡Bienvenido a Melia! Revisa tu correo." debajo. Si falla, muestra un
  error bajo el campo y conserva el correo para reintentar.

La Public Key de EmailJS está pensada para ir en el código del navegador (no es secreta).
Para evitar abusos, revisa las opciones de seguridad de tu cuenta de EmailJS.

## Carrito

"Añadir" (tarjeta) y "Añadir al carrito" (modal) guardan `{ producto: cantidad }` en
`localStorage` y actualizan el contador del header. No hay checkout todavía:
`js/modules/cart.js` es el punto de conexión con una pasarela o tienda.

## Imágenes

- `logo_melia_horizontal.png`, `logo_melia_claro.png` y `favicon.png` se generaron a partir
  de `logo_melia.png` (fondo transparente, versión clara para fondos oscuros).
- `logo_animado_claro.gif` (footer) se generó a partir de `logo_animado.gif`: recortado a la
  abeja, con el fondo blanco cambiado por el marrón del footer (`#60441e`) y el marrón oscuro
  pasado a crema. `logo_animado_claro.png` es un cuadro estático que se muestra cuando el
  sistema tiene activado "reducir movimiento". Si cambias el color del footer, hay que
  regenerar el GIF con el nuevo fondo.
- `hero_bg.png` (1024×339) y `apicultor_bg.webp` (1024×227) son de baja resolución para
  ocupar toda la pantalla: conviene reemplazarlas por versiones de **2400 px de ancho o más**
  con el mismo nombre.

## Accesibilidad

- Respeta "reducir movimiento" del sistema: sin animaciones, parallax ni cursor personalizado.
- Modal con `<dialog>` nativo: foco atrapado, cierre con Esc, X o clic fuera; el foco vuelve
  a la tarjeta al cerrar.
- Contrastes de texto AA sobre crema y marrón, enlace "Saltar al contenido" y etiquetas reales
  en el formulario.
