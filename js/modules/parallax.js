/* ==========================================================================
   Melia · Parallax de la sección "Origen"
   1. Si el navegador soporta animaciones ligadas al scroll (CSS
      animation-timeline), animations.css hace todo el trabajo.
   2. Si no, este módulo mueve la imagen con requestAnimationFrame SOLO
      mientras la sección es visible (IntersectionObserver la enciende/apaga).
   ========================================================================== */
(function (Melia) {
  'use strict';

  const { $$, prefersReducedMotion } = Melia.utils;
  const RANGE = 0.1; // ±10% de la altura de la imagen (coincide con el keyframe CSS)

  function supportsScrollTimeline() {
    return window.CSS && CSS.supports('animation-timeline: view()');
  }

  function attach(media) {
    const section = media.parentElement;
    let frame = null;
    let lastTop = null;

    const update = () => {
      const rect = section.getBoundingClientRect();
      if (rect.top !== lastTop) {
        lastTop = rect.top;
        const viewport = window.innerHeight;
        // 0 cuando la sección empieza a entrar, 1 cuando termina de salir
        const progress = (viewport - rect.top) / (viewport + rect.height);
        const offset = (progress - 0.5) * 2 * RANGE * media.offsetHeight;
        media.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      }
      frame = window.requestAnimationFrame(update);
    };

    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && frame === null) {
        frame = window.requestAnimationFrame(update);
      } else if (!entry.isIntersecting && frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
    }).observe(section);
  }

  function init() {
    if (prefersReducedMotion() || supportsScrollTimeline()) return;
    $$('[data-parallax]').forEach(attach);
  }

  Melia.parallax = { init };
})(window.Melia = window.Melia || {});
