/* ==========================================================================
   Melia · Modal "Vista rápida" (lightbox de producto)
   Usa <dialog> nativo: foco atrapado, Esc y capa superior incluidos.
   Se cierra con la X, con Esc o haciendo clic fuera del panel.
   ========================================================================== */
(function (Melia) {
  'use strict';

  const { $, $$, formatPrice, clamp, prefersReducedMotion } = Melia.utils;
  const MIN_QTY = 1;
  const MAX_QTY = 10;

  let dialog = null;
  let panel = null;
  let fields = {};
  let qtyInput = null;
  let addButton = null;
  let current = null;
  let lastTrigger = null;
  let pointerDownOnBackdrop = false;
  let closeTimer = null;

  /* ---------- Bloqueo de scroll sin "salto" por la barra de desplazamiento ---------- */
  function lockScroll() {
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--scrollbar-w', scrollbar + 'px');
    document.documentElement.classList.add('is-locked');
  }

  function unlockScroll() {
    document.documentElement.classList.remove('is-locked');
    document.documentElement.style.removeProperty('--scrollbar-w');
  }

  /* ---------- Contenido ---------- */
  function fill(product) {
    fields.image.src = product.image;
    fields.image.alt = product.alt;
    fields.type.textContent = product.type;
    fields.name.textContent = product.name;
    fields.price.textContent = formatPrice(product.price);
    fields.description.textContent = product.description;
    fields.pairing.textContent = product.pairing;
    fields.notes.replaceChildren(
      ...product.notes.map((note) => {
        const li = document.createElement('li');
        li.textContent = note;
        return li;
      })
    );
  }

  function getQty() {
    const value = parseInt(qtyInput.value, 10);
    return clamp(Number.isNaN(value) ? MIN_QTY : value, MIN_QTY, MAX_QTY);
  }

  function setQty(value) {
    const qty = clamp(value, MIN_QTY, MAX_QTY);
    qtyInput.value = String(qty);
    $('[data-qty-step="-1"]', dialog).disabled = qty <= MIN_QTY;
    $('[data-qty-step="1"]', dialog).disabled = qty >= MAX_QTY;
    if (current) fields.total.textContent = formatPrice(current.price * qty);
  }

  /* ---------- Abrir / cerrar ---------- */
  function open(productId, trigger) {
    const product = Melia.products[productId];
    if (!dialog || !product) return;

    window.clearTimeout(closeTimer);
    dialog.classList.remove('is-closing');
    current = product;
    lastTrigger = trigger || document.activeElement;

    fill(product);
    setQty(MIN_QTY);
    addButton.classList.remove('is-success');
    addButton.disabled = false;
    $('.btn__label', addButton).textContent = 'Añadir al carrito';

    lockScroll();
    if (!dialog.open) dialog.showModal();
    panel.scrollTop = 0;
  }

  function finishClose() {
    window.clearTimeout(closeTimer);
    dialog.classList.remove('is-closing');
    if (dialog.open) dialog.close();
  }

  function close() {
    if (!dialog || !dialog.open || dialog.classList.contains('is-closing')) return;

    if (prefersReducedMotion()) {
      finishClose();
      return;
    }

    dialog.classList.add('is-closing');
    const onEnd = (event) => {
      if (event.target !== panel) return; // ignora animaciones de hijos (ripple, frasco)
      panel.removeEventListener('animationend', onEnd);
      finishClose();
    };
    panel.addEventListener('animationend', onEnd);
    closeTimer = window.setTimeout(() => {
      panel.removeEventListener('animationend', onEnd);
      finishClose();
    }, 450); // red de seguridad
  }

  function handleAdd() {
    if (!current || addButton.disabled) return;
    const added = Melia.cart.add(current.id, getQty());
    if (!added) return;

    addButton.disabled = true;
    Melia.cart.flashButton(addButton, '¡Añadido al carrito!');
    window.setTimeout(close, 900);
  }

  /* ---------- Init ---------- */
  function init() {
    dialog = $('[data-quick-view]');
    if (!dialog) return;

    panel = $('.modal__panel', dialog);
    qtyInput = $('[data-qty-input]', dialog);
    addButton = $('[data-modal-add]', dialog);
    $$('[data-qv]', dialog).forEach((el) => {
      fields[el.dataset.qv] = el;
    });

    // Tarjetas de producto: clic en cualquier parte de la tarjeta (excepto "Añadir")
    $$('[data-product]').forEach((card) => {
      card.addEventListener('click', (event) => {
        if (event.target.closest('[data-add-to-cart]')) return;
        open(card.dataset.product, $('.product-card__view', card));
      });
    });

    // Enlaces del footer que abren un producto directamente
    $$('[data-open-product]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        open(link.dataset.openProduct, link);
      });
    });

    // Cerrar: botón X
    $('[data-modal-close]', dialog).addEventListener('click', close);

    // Cerrar: clic fuera del panel (solo si el clic empezó y terminó fuera)
    dialog.addEventListener('pointerdown', (event) => {
      pointerDownOnBackdrop = event.target === dialog;
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog && pointerDownOnBackdrop) close();
      pointerDownOnBackdrop = false;
    });

    // Cerrar: Esc (se intercepta para animar la salida)
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      close();
    });

    // Al cerrarse por cualquier vía: liberar scroll y devolver el foco
    dialog.addEventListener('close', () => {
      unlockScroll();
      current = null;
      if (lastTrigger && typeof lastTrigger.focus === 'function') {
        lastTrigger.focus({ preventScroll: true });
      }
    });

    // Cantidad
    $$('[data-qty-step]', dialog).forEach((button) => {
      button.addEventListener('click', () => setQty(getQty() + Number(button.dataset.qtyStep)));
    });
    qtyInput.addEventListener('change', () => setQty(getQty()));
    qtyInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        setQty(getQty());
      }
    });

    addButton.addEventListener('click', handleAdd);
  }

  Melia.modal = { init, open, close };
})(window.Melia = window.Melia || {});
