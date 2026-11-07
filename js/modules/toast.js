/* ==========================================================================
   Melia · Toast de confirmación
   show(mensaje, { action: { label, onClick } }) añade un botón opcional
   (p. ej. "Ver carrito" tras añadir un producto).
   ========================================================================== */
(function (Melia) {
  'use strict';

  const VISIBLE_MS = 3200;
  const VISIBLE_WITH_ACTION_MS = 5000; // más tiempo para alcanzar el botón
  let toastEl = null;
  let textEl = null;
  let actionEl = null;
  let onAction = null;
  let hideTimer = null;

  function hide() {
    if (toastEl) toastEl.classList.remove('is-visible');
  }

  function init() {
    toastEl = Melia.utils.$('[data-toast]');
    if (!toastEl) return;
    textEl = Melia.utils.$('[data-toast-text]', toastEl);
    actionEl = Melia.utils.$('[data-toast-action]', toastEl);

    if (actionEl) {
      actionEl.addEventListener('click', () => {
        hide();
        if (typeof onAction === 'function') onAction();
      });
    }

    // mientras el cursor o el foco están en el toast, no se oculta
    toastEl.addEventListener('pointerenter', () => window.clearTimeout(hideTimer));
    toastEl.addEventListener('focusin', () => window.clearTimeout(hideTimer));
    toastEl.addEventListener('pointerleave', () => {
      hideTimer = window.setTimeout(hide, 1500);
    });
  }

  function show(message, { action } = {}) {
    if (!toastEl || !textEl) return;
    textEl.textContent = message;

    onAction = action ? action.onClick : null;
    if (actionEl) {
      actionEl.hidden = !action;
      if (action) actionEl.textContent = action.label;
    }

    toastEl.classList.add('is-visible');
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(hide, action ? VISIBLE_WITH_ACTION_MS : VISIBLE_MS);
  }

  Melia.toast = { init, show, hide };
})(window.Melia = window.Melia || {});
