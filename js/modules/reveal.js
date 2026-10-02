/* ==========================================================================
   Melia · Fade-in-up al hacer scroll (IntersectionObserver)
   [data-reveal]      -> el elemento aparece subiendo
   [data-stagger]     -> sus hijos [data-reveal] entran en cascada
   [data-reveal-line] -> solo recibe .is-visible (p. ej. la línea del proceso)
   ========================================================================== */
(function (Melia) {
  'use strict';

  const { $$, prefersReducedMotion } = Melia.utils;
  const STAGGER_MS = 110;

  function init() {
    // Retardos en cascada para grupos (grid de productos, badges, pasos)
    $$('[data-stagger]').forEach((group) => {
      $$(':scope > [data-reveal]', group).forEach((item, index) => {
        item.style.setProperty('--reveal-delay', index * STAGGER_MS + 'ms');
      });
    });

    const targets = $$('[data-reveal], [data-reveal-line]');

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    targets.forEach((el) => observer.observe(el));
  }

  Melia.reveal = { init };
})(window.Melia = window.Melia || {});
