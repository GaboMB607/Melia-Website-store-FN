/* ==========================================================================
   Melia · Utilidades compartidas
   ========================================================================== */
(function (Melia) {
  'use strict';

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const priceFormatter = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
  let scrollLocks = 0;

  Melia.utils = {
    $: (selector, context = document) => context.querySelector(selector),
    $$: (selector, context = document) => Array.from(context.querySelectorAll(selector)),

    prefersReducedMotion: () => reducedMotionQuery.matches,
    hasFinePointer: () => finePointerQuery.matches,

    /** 12000 -> "$12.000" */
    formatPrice: (value) => '$' + priceFormatter.format(value),

    clamp: (value, min, max) => Math.min(Math.max(value, min), max),

    /** Bloquea el scroll de la página (modal / carrito) sin "salto" por la barra.
        Lleva la cuenta para que dos capas abiertas no se desbloqueen entre sí. */
    lockScroll() {
      if (scrollLocks++ > 0) return;
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar-w', scrollbar + 'px');
      document.documentElement.classList.add('is-locked');
    },
    unlockScroll() {
      if (scrollLocks === 0 || --scrollLocks > 0) return;
      document.documentElement.classList.remove('is-locked');
      document.documentElement.style.removeProperty('--scrollbar-w');
    },

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
