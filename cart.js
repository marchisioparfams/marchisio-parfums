/* =====================
   MARCHISIO PARFUMS · CARRITO / LISTA DE PEDIDO
   Persistencia en localStorage, compartido entre index.html y catalogo-completo.html
   ===================== */
(function () {
  'use strict';

  var WHATSAPP_NUMBER = '5491156541022';
  var STORAGE_KEY = 'mp_pedido_v1';

  function loadCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveCart(items) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) {}
  }

  var cart = loadCart();

  function findIndex(name) {
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].name === name) return i;
    }
    return -1;
  }

  function addItem(item) {
    var idx = findIndex(item.name);
    if (idx === -1) {
      cart.push(item);
    } else {
      cart[idx].qty = (cart[idx].qty || 1) + 1;
    }
    saveCart(cart);
    renderCart();
    return idx === -1;
  }

  function removeItem(name) {
    var idx = findIndex(name);
    if (idx !== -1) {
      cart.splice(idx, 1);
      saveCart(cart);
      renderCart();
    }
  }

  function clearCart() {
    cart = [];
    saveCart(cart);
    renderCart();
  }

  function buildWhatsAppLink() {
    if (!cart.length) return 'https://wa.me/' + WHATSAPP_NUMBER;
    var lines = ['Hola! Quiero consultar por estos productos:', ''];
    cart.forEach(function (it, i) {
      var qtyTxt = it.qty > 1 ? ' x' + it.qty : '';
      lines.push((i + 1) + '. ' + it.name + qtyTxt + ' - ' + it.priceLabel);
    });
    lines.push('');
    lines.push('Quedo a la espera de la confirmación. ¡Gracias!');
    var text = encodeURIComponent(lines.join('\n'));
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + text;
  }

  /* ---------- Build floating UI once DOM is ready ---------- */
  function injectUI() {
    if (document.getElementById('cart-fab')) return;

    var overlay = document.createElement('div');
    overlay.id = 'cart-overlay';
    document.body.appendChild(overlay);

    var fab = document.createElement('button');
    fab.id = 'cart-fab';
    fab.setAttribute('aria-label', 'Ver mi pedido');
    fab.innerHTML = '🛒<span class="cart-count" id="cart-count">0</span>';
    document.body.appendChild(fab);

    var panel = document.createElement('div');
    panel.id = 'cart-panel';
    panel.innerHTML =
      '<div class="cart-header">' +
        '<h3>Mi pedido</h3>' +
        '<button class="cart-close" id="cart-close-btn" aria-label="Cerrar">&times;</button>' +
      '</div>' +
      '<div class="cart-items" id="cart-items"></div>' +
      '<div class="cart-footer">' +
        '<div class="cart-total-row"><span>PRODUCTOS</span><span id="cart-total-count">0</span></div>' +
        '<a href="#" id="cart-send-btn" target="_blank" class="cart-send-btn">Enviar pedido por WhatsApp →</a>' +
        '<button class="cart-clear-btn" id="cart-clear-btn">Vaciar pedido</button>' +
      '</div>';
    document.body.appendChild(panel);

    function openPanel() { panel.classList.add('open'); overlay.classList.add('open'); }
    function closePanel() { panel.classList.remove('open'); overlay.classList.remove('open'); }

    fab.addEventListener('click', openPanel);
    overlay.addEventListener('click', closePanel);
    document.getElementById('cart-close-btn').addEventListener('click', closePanel);
    document.getElementById('cart-clear-btn').addEventListener('click', function () {
      if (confirm('¿Vaciar todo el pedido?')) clearCart();
    });

    renderCart();
  }

  function renderCart() {
    var fab = document.getElementById('cart-fab');
    var countEl = document.getElementById('cart-count');
    var itemsEl = document.getElementById('cart-items');
    var totalCountEl = document.getElementById('cart-total-count');
    var sendBtn = document.getElementById('cart-send-btn');
    if (!fab) return;

    var totalQty = cart.reduce(function (sum, it) { return sum + (it.qty || 1); }, 0);
    countEl.textContent = totalQty;
    fab.classList.toggle('empty', totalQty === 0);

    if (!cart.length) {
      itemsEl.innerHTML = '<p class="cart-empty-msg">Todavía no agregaste ninguna fragancia.<br>Tocá "Agregar al pedido" en las que te gusten.</p>';
    } else {
      itemsEl.innerHTML = cart.map(function (it) {
        var qtyTxt = it.qty > 1 ? ' <span style="opacity:.6">x' + it.qty + '</span>' : '';
        return '<div class="cart-item">' +
          '<div class="cart-item-info">' +
            '<div class="cart-item-name">' + escapeHtml(it.name) + qtyTxt + '</div>' +
            '<div class="cart-item-price">' + escapeHtml(it.priceLabel) + '</div>' +
          '</div>' +
          '<button class="cart-item-remove" data-name="' + escapeHtml(it.name) + '" aria-label="Quitar">&times;</button>' +
        '</div>';
      }).join('');

      Array.prototype.slice.call(itemsEl.querySelectorAll('.cart-item-remove')).forEach(function (btn) {
        btn.addEventListener('click', function () { removeItem(btn.getAttribute('data-name')); });
      });
    }

    totalCountEl.textContent = totalQty;
    sendBtn.href = buildWhatsAppLink();

    // sync "added" state on visible add-buttons
    Array.prototype.slice.call(document.querySelectorAll('.btn-add-pedido')).forEach(function (btn) {
      var name = btn.getAttribute('data-name');
      btn.classList.toggle('added', findIndex(name) !== -1);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------- Hook "Agregar al pedido" buttons on every card ---------- */
  function injectAddButtons() {
    var cards = document.querySelectorAll('.perfume-card');
    cards.forEach(function (card) {
      var footer = card.querySelector('.card-footer');
      if (!footer || footer.querySelector('.btn-add-pedido')) return;

      var nameEl = card.querySelector('.card-nombre');
      var marcaEl = card.querySelector('.card-marca');
      var priceEl = card.querySelector('.card-price');
      if (!nameEl || !priceEl) return;

      var fullName = (marcaEl ? marcaEl.textContent.trim() + ' — ' : '') + nameEl.textContent.trim();
      var priceLabel = priceEl.textContent.trim();

      var actions = document.createElement('div');
      actions.className = 'card-footer-actions';

      var existingLink = footer.querySelector('.btn-comprar');
      var addBtn = document.createElement('button');
      addBtn.className = 'btn-add-pedido';
      addBtn.type = 'button';
      addBtn.setAttribute('data-name', fullName);
      addBtn.textContent = '+ Agregar al pedido';

      addBtn.addEventListener('click', function () {
        addItem({ name: fullName, priceLabel: priceLabel, qty: 1 });
        addBtn.classList.add('added');
        setTimeout(function () { renderCart(); }, 0);
      });

      if (existingLink) {
        footer.removeChild(existingLink);
        actions.appendChild(existingLink);
      }
      actions.appendChild(addBtn);
      footer.appendChild(actions);
    });
  }

  function init() {
    injectUI();
    injectAddButtons();
    renderCart();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-scan for new cards whenever filters/pagination reveal more (catalogo-completo.html)
  window.MPCart = {
    rescan: injectAddButtons,
    render: renderCart
  };
})();
