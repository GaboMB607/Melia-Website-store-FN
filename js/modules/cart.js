/* ==========================================================================
   Melia · Carrito (estado + contador del header)
   Guarda { idProducto: cantidad } en localStorage y avisa de cada cambio con
   el evento "melia:cart-change", que escucha el panel "Mi Carrito"
   (cart-drawer.js) para volver a dibujarse.
   ========================================================================== */
(function (Melia) {
  'use strict';

  const { $, $$, storage, clamp } = Melia.utils;
  const STORAGE_KEY = 'melia-cart';
  const MAX_PER_PRODUCT = 99;

  let items = {};
  let button = null;
  let countEl = null;
  let labelEl = null;

  function count() {
    return Object.values(items).reduce((total, qty) => total + qty, 0);
  }

  /** Líneas del carrito en el orden en que se añadieron: [{ product, qty, subtotal }] */
  function getItems() {
    return Object.entries(items)
      .filter(([id]) => Melia.products[id])
      .map(([id, qty]) => {
        const product = Melia.products[id];
        return { product, qty, subtotal: product.price * qty };
      });
  }

  function total() {
    return getItems().reduce((sum, line) => sum + line.subtotal, 0);
  }

  function renderBadge({ bump = false } = {}) {
    if (!button) return;
    const n = count();
    countEl.textContent = String(n);
    countEl.hidden = n === 0;
    labelEl.textContent =
      n === 0 ? 'Abrir carrito (vacío)' : `Abrir carrito, ${n} ${n === 1 ? 'producto' : 'productos'}`;

    if (bump) {
      button.classList.remove('is-bumping');
      void button.offsetWidth; // reinicia la animación
      button.classList.add('is-bumping');
    }
  }

  function commit({ bump = false } = {}) {
    storage.set(STORAGE_KEY, items);
    renderBadge({ bump });
    document.dispatchEvent(new CustomEvent('melia:cart-change', { detail: { count: count(), total: total() } }));
  }

  function add(productId, quantity = 1) {
    const product = Melia.products[productId];
    if (!product || quantity < 1) return false;

    items[productId] = Math.min((items[productId] || 0) + quantity, MAX_PER_PRODUCT);
    commit({ bump: true });

    const unidades = quantity === 1 ? 'un frasco' : `${quantity} frascos`;
    Melia.toast.show(`Añadiste ${unidades} de ${product.name} a tu carrito.`, {
      action: { label: 'Ver carrito', onClick: () => Melia.cartDrawer && Melia.cartDrawer.open() },
    });
    return true;
  }

  /** Cambia la cantidad de una línea; 0 la elimina */
  function setQty(productId, quantity) {
    if (!(productId in items)) return;
    const qty = clamp(Math.round(quantity) || 0, 0, MAX_PER_PRODUCT);
    if (qty === 0) delete items[productId];
    else items[productId] = qty;
    commit();
  }

  function remove(productId) {
    if (!(productId in items)) return;
    delete items[productId];
    commit();
  }

  /** Feedback visual en el botón que añadió el producto */
  function flashButton(btn, text = 'Añadido') {
    const label = $('.btn__label', btn);
    if (!label || btn.classList.contains('is-success')) return;
    const original = label.textContent;
    btn.classList.add('is-success');
    label.textContent = text;
    window.setTimeout(() => {
      btn.classList.remove('is-success');
      label.textContent = original;
    }, 1600);
  }

  function init() {
    button = $('[data-cart-open]');
    countEl = button && $('[data-cart-count]', button);
    labelEl = button && $('[data-cart-label]', button);

    const saved = storage.get(STORAGE_KEY, {});
    items = saved && typeof saved === 'object' ? saved : {};
    // descarta productos que ya no existan en el catálogo o cantidades inválidas
    Object.keys(items).forEach((id) => {
      if (!Melia.products[id] || !Number.isFinite(items[id]) || items[id] < 1) delete items[id];
    });
    renderBadge();

    // "Añadir" rápido desde la tarjeta (no abre el modal)
    $$('[data-add-to-cart]').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.stopPropagation();
        if (add(btn.dataset.addToCart, 1)) flashButton(btn);
      });
    });
  }

  Melia.cart = { init, add, setQty, remove, count, total, getItems, flashButton, MAX_PER_PRODUCT };
})(window.Melia = window.Melia || {});
