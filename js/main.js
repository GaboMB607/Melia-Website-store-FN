/* ==========================================================================
   Melia · Punto de entrada
   Inicia cada módulo de forma aislada: si uno falla, el resto sigue vivo.
   ========================================================================== */
(function (Melia) {
  'use strict';

  const MODULES = [
    'toast',
    'header',
    'reveal',
    'parallax',
    'effects',
    'cart',
    'modal',
    'cursor',
    'newsletter',
  ];

  MODULES.forEach((name) => {
    try {
      if (Melia[name] && typeof Melia[name].init === 'function') Melia[name].init();
    } catch (error) {
      console.error(`[Melia] No se pudo iniciar el módulo "${name}":`, error);
    }
  });

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})(window.Melia = window.Melia || {});
