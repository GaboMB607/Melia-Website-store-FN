/* ==========================================================================
   Melia · Cursor personalizado
   Un anillo color miel que acompaña al cursor nativo (que nunca se oculta):
   - crece sobre enlaces y botones
   - se llena y muestra "Ver" sobre los frascos ([data-cursor="view"])
   Solo con ratón/trackpad y sin "reducir movimiento". El bucle de animación
   se detiene cuando el anillo alcanza al cursor.
   ========================================================================== */
(function (Melia) {
  'use strict';

  const { prefersReducedMotion, hasFinePointer } = Melia.utils;
  const EASE = 0.2;
  const INTERACTIVE = 'a, button, input, label, [role="button"]';

  function init() {
    if (prefersReducedMotion() || !hasFinePointer()) return;

    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = '<span class="cursor__ring"><span class="cursor__label">Ver</span></span>';
    document.body.appendChild(cursor);

    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let frame = null;

    const render = () => {
      pos.x += (target.x - pos.x) * EASE;
      pos.y += (target.y - pos.y) * EASE;
      cursor.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;

      const settled = Math.abs(target.x - pos.x) < 0.1 && Math.abs(target.y - pos.y) < 0.1;
      frame = settled ? null : window.requestAnimationFrame(render);
    };

    const wake = () => {
      if (frame === null) frame = window.requestAnimationFrame(render);
    };

    document.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      if (!cursor.classList.contains('is-visible')) {
        // primera aparición: sin "viaje" desde la esquina
        pos.x = event.clientX;
        pos.y = event.clientY;
        cursor.classList.add('is-visible');
      }
      target.x = event.clientX;
      target.y = event.clientY;
      wake();
    }, { passive: true });

    document.addEventListener('pointerover', (event) => {
      // sobre un frasco -> "Ver"; sobre su botón "Añadir" -> estado de enlace normal
      const isView = Boolean(event.target.closest('[data-cursor="view"]')) &&
        !event.target.closest('[data-add-to-cart]');
      const isLink = !isView && Boolean(event.target.closest(INTERACTIVE));
      cursor.classList.toggle('is-view', isView);
      cursor.classList.toggle('is-link', isLink);
    });

    document.addEventListener('pointerdown', () => cursor.classList.add('is-pressed'));
    document.addEventListener('pointerup', () => cursor.classList.remove('is-pressed'));
    document.documentElement.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
    window.addEventListener('blur', () => cursor.classList.remove('is-visible'));
  }

  Melia.cursor = { init };
})(window.Melia = window.Melia || {});
