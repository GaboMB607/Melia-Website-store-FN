/* ==========================================================================
   Melia · Toast de confirmación
   ========================================================================== */
(function (Melia) {
  'use strict';

  const VISIBLE_MS = 3200;
  let toastEl = null;
  let textEl = null;
  let hideTimer = null;

  function init() {
    toastEl = Melia.utils.$('[data-toast]');
    textEl = toastEl && Melia.utils.$('[data-toast-text]', toastEl);
  }

  function show(message) {
    if (!toastEl || !textEl) return;
    textEl.textContent = message;
    toastEl.classList.add('is-visible');
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => toastEl.classList.remove('is-visible'), VISIBLE_MS);
  }

  Melia.toast = { init, show };
})(window.Melia = window.Melia || {});
