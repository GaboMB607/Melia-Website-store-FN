/* ==========================================================================
   Melia · Panel "Mi Carrito" (drawer lateral)
   - Se abre con el botón del carrito del header o con "Ver carrito" del aviso
   - Lista cada producto con nombre, precio unitario, cantidad editable,
     subtotal y botón para eliminar
   - "Finalizar compra" abre WhatsApp con el resumen del pedido
   - "Seguir comprando", la X, Esc o un clic fuera lo cierran
   Usa <dialog> nativo (foco atrapado y capa superior), como la vista rápida.
   ========================================================================== */
(function (Melia) {
  'use strict';

  const { $, formatPrice, prefersReducedMotion, lockScroll, unlockScroll } = Melia.utils;

  /* Número de WhatsApp que recibe los pedidos: indicativo de país + número, sin
     "+", espacios ni guiones (por ejemplo '573001234567').
     Vacío: WhatsApp se abre con el pedido ya escrito y el cliente elige a quién
     enviarlo. Así no se publica ningún número mientras la web es de prueba.
     Ojo: cualquier número que pongas aquí será visible para quien vea la página. */
  const WHATSAPP_NUMBER = '573057137592'; // +57 305 713 7592

  let dialog = null;
  let panel = null;
  let list = null;
  let emptyState = null;
  let foot = null;
  let totalEl = null;
  let summaryEl = null;
  let checkoutLink = null;
  let openButton = null;
  let lastTrigger = null;
  let pointerDownOnBackdrop = false;
  let closeTimer = null;
  let afterClose = null;

  /* ---------- Pedido para WhatsApp ---------- */
  function buildOrderMessage() {
    const lines = Melia.cart.getItems().map(({ product, qty, subtotal }) =>
      `• ${qty} x ${product.name} (${product.type}) - ${formatPrice(subtotal)}`
    );
    return [
      '¡Hola, Melia! Quiero hacer este pedido:',
      '',
      ...lines,
      '',
      `Total: ${formatPrice(Melia.cart.total())} COP`,
      '',
      '¿Me confirman disponibilidad, envío y forma de pago? Gracias.',
    ].join('\n');
  }

  function whatsappUrl() {
    // sin número, wa.me/?text= abre WhatsApp y deja elegir el chat
    const base = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : 'https://wa.me/';
    return `${base}?text=${encodeURIComponent(buildOrderMessage())}`;
  }

  /* ---------- Dibujo de la lista ---------- */
  function icon(name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#${name}`);
    svg.appendChild(use);
    return svg;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function lineItem({ product, qty, subtotal }) {
    const li = el('li', 'cart-item');
    li.dataset.id = product.id;

    const media = el('span', 'cart-item__media');
    const img = el('img');
    img.src = product.image;
    img.alt = '';
    img.width = 60;
    img.height = 84;
    img.decoding = 'async';
    media.appendChild(img);

    const info = el('div', 'cart-item__info');
    info.append(
      el('p', 'cart-item__name', product.name),
      el('p', 'cart-item__meta', product.type)
    );
    const unit = el('p', 'cart-item__unit');
    unit.append(el('span', 'sr-only', 'Precio unitario: '), `${formatPrice(product.price)} c/u`);
    info.appendChild(unit);

    const row = el('div', 'cart-item__row');
    const qtyGroup = el('div', 'qty qty--sm');
    qtyGroup.setAttribute('role', 'group');
    qtyGroup.setAttribute('aria-label', `Cantidad de ${product.name}`);

    const minus = el('button', 'qty__btn');
    minus.type = 'button';
    minus.dataset.action = 'decrease';
    minus.setAttribute('aria-label', `Quitar una unidad de ${product.name}`);
    minus.disabled = qty <= 1;
    minus.appendChild(icon('i-minus'));

    const value = el('span', 'qty__value', String(qty));

    const plus = el('button', 'qty__btn');
    plus.type = 'button';
    plus.dataset.action = 'increase';
    plus.setAttribute('aria-label', `Añadir una unidad de ${product.name}`);
    plus.disabled = qty >= Melia.cart.MAX_PER_PRODUCT;
    plus.appendChild(icon('i-plus'));

    qtyGroup.append(minus, value, plus);
    row.append(qtyGroup, el('p', 'cart-item__subtotal', formatPrice(subtotal)));
    info.appendChild(row);

    const remove = el('button', 'cart-item__remove');
    remove.type = 'button';
    remove.dataset.action = 'remove';
    remove.setAttribute('aria-label', `Eliminar ${product.name} del carrito`);
    remove.appendChild(icon('i-trash'));

    li.append(media, info, remove);
    return li;
  }

  function render() {
    if (!dialog) return;

    // recordar qué botón tenía el foco para devolverlo tras redibujar
    const active = document.activeElement;
    const focusKey = active && list.contains(active) && active.dataset.action
      ? { id: active.closest('.cart-item').dataset.id, action: active.dataset.action }
      : null;

    const lines = Melia.cart.getItems();
    const count = Melia.cart.count();

    list.replaceChildren(...lines.map(lineItem));
    emptyState.hidden = lines.length > 0;
    foot.hidden = lines.length === 0;
    summaryEl.textContent = count === 0 ? '' : `${count} ${count === 1 ? 'producto' : 'productos'}`;
    totalEl.textContent = formatPrice(Melia.cart.total());
    checkoutLink.href = lines.length ? whatsappUrl() : '#';

    if (focusKey) {
      const target = list.querySelector(`.cart-item[data-id="${focusKey.id}"] [data-action="${focusKey.action}"]`);
      if (target && !target.disabled) target.focus();
      else if (target) target.closest('.cart-item').querySelector('[data-action="remove"]').focus();
    }
  }

  /* ---------- Acciones de cada línea ---------- */
  function removeLine(item) {
    const id = item.dataset.id;
    const next = item.nextElementSibling || item.previousElementSibling;
    const nextId = next && next.dataset.id;

    const done = () => {
      Melia.cart.remove(id);
      // el foco pasa a la línea vecina, o al botón de la tienda si quedó vacío
      const target = nextId
        ? list.querySelector(`.cart-item[data-id="${nextId}"] [data-action="remove"]`)
        : $('[data-cart-browse]', dialog);
      if (target) target.focus();
    };

    if (prefersReducedMotion()) {
      done();
      return;
    }
    item.classList.add('is-removing');
    window.setTimeout(done, 260);
  }

  function handleListClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    const item = button.closest('.cart-item');
    const id = item.dataset.id;
    const line = Melia.cart.getItems().find((l) => l.product.id === id);
    if (!line) return;

    if (button.dataset.action === 'increase') Melia.cart.setQty(id, line.qty + 1);
    if (button.dataset.action === 'decrease') Melia.cart.setQty(id, Math.max(1, line.qty - 1));
    if (button.dataset.action === 'remove') removeLine(item);
  }

  /* ---------- Abrir / cerrar ---------- */
  function open(trigger) {
    if (!dialog || dialog.open) return;
    window.clearTimeout(closeTimer);
    dialog.classList.remove('is-closing');
    lastTrigger = trigger instanceof HTMLElement ? trigger : openButton;
    render();
    lockScroll();
    dialog.showModal();
    if (openButton) openButton.setAttribute('aria-expanded', 'true');
  }

  function finishClose() {
    window.clearTimeout(closeTimer);
    dialog.classList.remove('is-closing');
    if (dialog.open) dialog.close();
  }

  function close(callback) {
    if (!dialog || !dialog.open || dialog.classList.contains('is-closing')) return;
    afterClose = typeof callback === 'function' ? callback : null;

    if (prefersReducedMotion()) {
      finishClose();
      return;
    }
    dialog.classList.add('is-closing');
    const onEnd = (event) => {
      if (event.target !== panel) return;
      panel.removeEventListener('animationend', onEnd);
      finishClose();
    };
    panel.addEventListener('animationend', onEnd);
    closeTimer = window.setTimeout(() => {
      panel.removeEventListener('animationend', onEnd);
      finishClose();
    }, 450);
  }

  function init() {
    dialog = $('[data-cart-drawer]');
    if (!dialog) return;

    panel = $('.drawer__panel', dialog);
    list = $('[data-cart-list]', dialog);
    emptyState = $('[data-cart-empty]', dialog);
    foot = $('[data-cart-foot]', dialog);
    totalEl = $('[data-cart-total]', dialog);
    summaryEl = $('[data-cart-summary]', dialog);
    checkoutLink = $('[data-cart-checkout]', dialog);
    openButton = $('[data-cart-open]');

    render();
    document.addEventListener('melia:cart-change', render);

    if (openButton) openButton.addEventListener('click', () => open(openButton));

    list.addEventListener('click', handleListClick);
    $('[data-cart-close]', dialog).addEventListener('click', () => close());
    $('[data-cart-continue]', dialog).addEventListener('click', () => close());

    // "Ver la tienda" (carrito vacío): cierra y baja hasta los productos
    $('[data-cart-browse]', dialog).addEventListener('click', (event) => {
      event.preventDefault();
      close(() => {
        const section = document.getElementById('productos');
        if (section) section.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      });
    });

    // por si el carrito cambió en otra pestaña justo antes de pulsar
    checkoutLink.addEventListener('click', (event) => {
      if (!Melia.cart.count()) {
        event.preventDefault();
        return;
      }
      checkoutLink.href = whatsappUrl();
    });

    // clic fuera del panel (solo si el clic empezó y terminó fuera)
    dialog.addEventListener('pointerdown', (event) => {
      pointerDownOnBackdrop = event.target === dialog;
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog && pointerDownOnBackdrop) close();
      pointerDownOnBackdrop = false;
    });

    // Esc: se intercepta para animar la salida
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      close();
    });

    dialog.addEventListener('close', () => {
      unlockScroll();
      if (openButton) openButton.setAttribute('aria-expanded', 'false');
      if (lastTrigger && typeof lastTrigger.focus === 'function') {
        lastTrigger.focus({ preventScroll: true });
      }
      const callback = afterClose;
      afterClose = null;
      if (callback) callback();
    });
  }

  Melia.cartDrawer = { init, open, close };
})(window.Melia = window.Melia || {});
