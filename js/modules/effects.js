/* ==========================================================================
   Melia · Micro-interacciones
   - Ripple: onda que nace en el punto exacto del clic  [data-ripple]
   - Magnético: el botón se inclina hacia el cursor      [data-magnetic]
   ========================================================================== */
(function (Melia) {
  'use strict';

  const { $$, prefersReducedMotion, hasFinePointer } = Melia.utils;

  const MAGNET_STRENGTH = 0.25; // cuánto sigue el botón al cursor
  const LABEL_STRENGTH = 0.08;  // el texto se mueve un poco más: sensación de profundidad
  const MAX_SHIFT = 10;         // px (botón)
  const MAX_LABEL_SHIFT = 4;    // px (texto, adicional al botón)

  function spawnRipple(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.2;
    const ripple = document.createElement('span');

    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = event.clientX - rect.left - size / 2 + 'px';
    ripple.style.top = event.clientY - rect.top - size / 2 + 'px';

    button.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }

  function attachMagnet(button) {
    let frame = null;

    const move = (event) => {
      const rect = button.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const limit = (value, max) => Math.max(-max, Math.min(max, value)).toFixed(2) + 'px';

      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        button.style.setProperty('--mx', limit(dx * MAGNET_STRENGTH, MAX_SHIFT));
        button.style.setProperty('--my', limit(dy * MAGNET_STRENGTH, MAX_SHIFT));
        button.style.setProperty('--lx', limit(dx * LABEL_STRENGTH, MAX_LABEL_SHIFT));
        button.style.setProperty('--ly', limit(dy * LABEL_STRENGTH, MAX_LABEL_SHIFT));
      });
    };

    const reset = () => {
      window.cancelAnimationFrame(frame);
      button.classList.remove('is-magnet-active');
      ['--mx', '--my', '--lx', '--ly'].forEach((prop) => button.style.removeProperty(prop));
    };

    button.addEventListener('pointerenter', () => button.classList.add('is-magnet-active'));
    button.addEventListener('pointermove', move);
    button.addEventListener('pointerleave', reset);
    button.addEventListener('blur', reset);
  }

  function init() {
    $$('[data-ripple]').forEach((button) => button.addEventListener('pointerdown', spawnRipple));

    if (prefersReducedMotion() || !hasFinePointer()) return;
    $$('[data-magnetic]').forEach(attachMagnet);
  }

  Melia.effects = { init };
})(window.Melia = window.Melia || {});
