/* ==========================================================================
   Melia · Utilidades compartidas
   ========================================================================== */
(function (Melia) {
  'use strict';

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const priceFormatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

  Melia.utils = {
    $: (selector, context = document) => context.querySelector(selector),
    $$: (selector, context = document) => Array.from(context.querySelectorAll(selector)),

    prefersReducedMotion: () => reducedMotionQuery.matches,
    hasFinePointer: () => finePointerQuery.matches,

    /** 12000 -> "$12.000" */
    formatPrice: (value) => '$' + priceFormatter.format(value),

    clamp: (value, min, max) => Math.min(Math.max(value, min), max),

    /** localStorage puede fallar (modo privado, almacenamiento bloqueado): nunca rompe la página */
    storage: {
      get(key, fallback) {
        try {
          const raw = window.localStorage.getItem(key);
          return raw ? JSON.parse(raw) : fallback;
        } catch (error) {
          return fallback;
        }
      },
      set(key, value) {
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
          /* sin persistencia: el carrito sigue funcionando en memoria */
        }
      },
    },
  };
})(window.Melia = window.Melia || {});
