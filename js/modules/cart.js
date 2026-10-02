/* ==========================================================================
   Melia · Carrito (estado local + contador del header)
   Guarda { idProducto: cantidad } en localStorage. Cuando exista un checkout
   real, este es el único módulo que hay que conectar.
   ========================================================================== */
(function (Melia) {
  'use strict';

  const { $, $$, storage } = Melia.utils;
  const STORAGE_KEY = 'melia-cart';
  const MAX_PER_PRODUCT = 99;

  let items = {};
  let indicator = null;
  let countEl = null;
  let labelEl = null;

  function count() {
    return Object.values(items).reduce((total, qty) => total + qty, 0);
  }

  function render({ bump = false } = {}) {
    if (!indicator) return;
    const total = count();
    countEl.textContent = String(total);
    countEl.hidden = total === 0;
    labelEl.textContent =
      total === 0 ? 'Carrito vacío' : `Carrito: ${total} ${total === 1 ? 'producto' : 'productos'}`;

    if (bump) {
      indicator.classList.remove('is-bumping');
      void indicator.offsetWidth; // reinicia la animación
      indicator.classList.add('is-bumping');
    }
  }

  function add(productId, quantity = 1) {
    const product = Melia.products[productId];
    if (!product || quantity < 1) return false;

    items[productId] = Math.min((items[productId] || 0) + quantity, MAX_PER_PRODUCT);
    storage.set(STORAGE_KEY, items);
    render({ bump: true });

    const unidades = quantity === 1 ? 'un frasco' : `${quantity} frascos`;
    Melia.toast.show(`Añadiste ${unidades} de ${product.name} a tu carrito.`);
    return true;
  }

  /** Feedback visual en el botón que añadió el producto */
  function flashButton(button, text = 'Añadido') {
    const label = $('.btn__label', button);
    if (!label || button.classList.contains('is-success')) return;
    const original = label.textContent;
    button.classList.add('is-success');
    label.textContent = text;
    window.setTimeout(() => {
      button.classList.remove('is-success');
      label.textContent = original;
    }, 1600);
  }

  function init() {
    indicator = $('[data-cart-indicator]');
    countEl = indicator && $('[data-cart-count]', indicator);
    labelEl = indicator && $('[data-cart-label]', indicator);

    const saved = storage.get(STORAGE_KEY, {});
    items = saved && typeof saved === 'object' ? saved : {};
    // descarta productos que ya no existan en el catálogo
    Object.keys(items).forEach((id) => {
      if (!Melia.products[id] || !Number.isFinite(items[id])) delete items[id];
    });
    render();

    // "Añadir" rápido desde la tarjeta (no abre el modal)
    $$('[data-add-to-cart]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        if (add(button.dataset.addToCart, 1)) flashButton(button);
      });
    });
  }

  Melia.cart = { init, add, count, flashButton };
})(window.Melia = window.Melia || {});
