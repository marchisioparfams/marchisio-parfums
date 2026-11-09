/* =====================
   MARCHISIO PARFAMS · main.js v20261110
   ===================== */
(function () {
  'use strict';

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn('[MP] ' + name + ':', e); }
  }

  /* ---- SPLASH ---- */
  safe(function () {
    var el = document.getElementById('splash');
    if (!el) return;
    var t = setTimeout(function () { el.style.display = 'none'; }, 5200);
    el.addEventListener('animationend', function () {
      clearTimeout(t); el.style.display = 'none';
    });
  }, 'splash');

  /* ---- CURSOR ---- */
  safe(function () {
    var cur = document.getElementById('cursor');
    var lbl = document.getElementById('cursor-label');
    if (!cur || !lbl || window.matchMedia('(hover:none)').matches) return;
    var mx = 0, my = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });
    (function loop() {
      cx += (mx - cx) * 0.12; cy += (my - cy) * 0.12;
      cur.style.left = cx + 'px'; cur.style.top = cy + 'px';
      lbl.style.left = cx + 'px'; lbl.style.top = cy + 'px';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, .quiz-opt, .filtro, .marca-tab').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cur.classList.add('expand'); });
      el.addEventListener('mouseleave', function () { cur.classList.remove('expand'); });
    });
  }, 'cursor');

  /* ---- NAV SCROLL ---- */
  safe(function () {
    var nav = document.getElementById('nav');
    window.addEventListener('scroll', function () {
      nav.style.borderBottomColor = window.scrollY > 60 ? 'rgba(201,163,91,.3)' : 'rgba(201,163,91,.15)';
    }, { passive: true });
  }, 'nav-scroll');

  /* ---- BURGER ---- */
  safe(function () {
    var burger = document.getElementById('burger');
    var menu = document.getElementById('mobile-menu');
    if (!burger || !menu) return;
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }, 'burger');
  window.closeMobile = function () {
    var m = document.getElementById('mobile-menu');
    var b = document.getElementById('burger');
    if (m) m.classList.remove('open');
    if (b) b.classList.remove('open');
    document.body.style.overflow = '';
  };

  /* ---- REVEAL ---- */
  safe(function () {
    var els = document.querySelectorAll('.reveal');
    els.forEach(function (el) { el.classList.add('hidden-rev'); });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var delay = parseInt(e.target.getAttribute('data-delay') || 0);
        setTimeout(function () { e.target.classList.remove('hidden-rev'); }, delay);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.05 });
    els.forEach(function (el) { obs.observe(el); });
    setTimeout(function () {
      document.querySelectorAll('.hidden-rev').forEach(function (el) { el.classList.remove('hidden-rev'); });
    }, 6000);
  }, 'reveal');

  /* ---- FILTROS ---- */
  safe(function () {
    var btns = document.querySelectorAll('.filtro');
    var cards = document.querySelectorAll('.perfume-card');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var f = btn.getAttribute('data-filter');
        cards.forEach(function (c) {
          if (f === 'all' || ((' ' + (c.getAttribute('data-tags') || '') + ' ').indexOf(' ' + f + ' ') !== -1)) {
            c.classList.remove('hidden');
          } else {
            c.classList.add('hidden');
          }
        });
      });
    });
  }, 'filtros');

  /* ---- MARCAS TABS ---- */
  window.showMarcas = function (tab) {
    var ids = ['marcas-arabes', 'marcas-disenador', 'marcas-otros'];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.toggle('hidden-grid', id !== 'marcas-' + tab);
    });
    document.querySelectorAll('.marca-tab').forEach(function (btn, i) {
      btn.classList.toggle('active', ['arabes', 'disenador', 'otros'][i] === tab);
    });
  };

  /* ---- QUIZ ENGINE ---- */
  var CFG = window.MP_CONFIG || {};
  var WA_NUMBER = CFG.WHATSAPP || '5491156541022';
  var quizState = { step: 0, answers: {} };
  var TOTAL_STEPS = 6;

  /* Recomendaciones: sólo originales sellados (árabes, diseñador) y Body Splash VS */
  var SPLASH = {
    dulce:    { name: 'Victoria Secret Bare Vainilla', desc: 'Vainilla suave y envolvente sobre una base cremosa. Cálida, dulce y reconfortante.', fam: 'Bare Vainilla' },
    fresco:   { name: 'Victoria Secret Aqua Kiss', desc: 'Floral especiado con frescura acuática. Liviana y perfecta para todos los días.', fam: 'Aqua Kiss' },
    floral:   { name: 'Victoria Secret Pure Seduction', desc: 'Frutas rojas y jazmín fresco. El body splash favorito para el uso cotidiano.', fam: 'Pure Seduction' },
    oriental: { name: 'Victoria Secret Amber Romance', desc: 'Ámbar cálido, vainilla y musk. Sensual, envolvente y adictivo.', fam: 'Amber Romance' }
  };
  var ARABE = {
    dulce_f:  { name: 'Lattafa Yara', q: 'Yara', price: 'Desde $49.000', desc: 'Dulce, cremoso y femenino: orquídea, vainilla y frutas. Uno de los árabes más pedidos.' },
    dulce:    { name: 'Lattafa Khamrah', q: 'Khamrah', price: 'Desde $48.000', desc: 'Canela, dátiles y vainilla. Gourmand cálido de gran duración, muy popular en noches frías.' },
    oriental: { name: 'Lattafa Asad', q: 'Asad', price: 'Desde $48.000', desc: 'Especiado, amaderado y con carácter. Intenso y de mucha proyección.' },
    fresco:   { name: 'Armaf Odyssey Mandarin Sky', q: 'Mandarin', price: 'Desde $56.500', desc: 'Cítrico y fresco con fondo amaderado. Ideal para el día y el verano.' },
    floral:   { name: 'Lattafa Yara', q: 'Yara', price: 'Desde $49.000', desc: 'Floral, suave y delicado, con un toque dulce que enamora.' }
  };
  var DISENADOR = {
    masculino_fresco:   { name: 'Dior Sauvage', q: 'Sauvage', price: 'Desde $198.000', desc: 'El clásico fresco y especiado. Versátil para cualquier ocasión.' },
    masculino:          { name: 'Paco Rabanne 1 Million', q: 'One Million', price: 'Desde $124.000', desc: 'Dulce, especiado y llamativo. Pensado para las noches y las ocasiones especiales.' },
    femenino_fresco:    { name: 'Dolce & Gabbana Light Blue', q: 'Light Blue', price: 'Desde $156.000', desc: 'Cítrico y luminoso. Un clásico fresco para el verano y el día a día.' },
    femenino:           { name: 'Carolina Herrera Good Girl', q: 'Good Girl', price: 'Desde $185.000', desc: 'Dulce, floral y seductor. Un ícono de las noches y las ocasiones especiales.' },
    unisex:             { name: 'Los clásicos de diseñador', q: '', price: 'Desde $100.000', desc: 'Mirá todo el catálogo de diseñador y elegí el que más te guste.' }
  };

  function pickFormat(a) {
    if (a[4] && a[4] !== 'cualquiera') return a[4];
    if (a[5] === 'alto') return 'disenador';
    if (a[5] === 'medio') return 'arabe';
    return a[0] === 'femenino' ? 'splash' : 'arabe';
  }

  function buildRec(a) {
    var fmt = pickFormat(a), scent = a[3] || 'dulce', g = a[0];
    if (fmt === 'splash') {
      var sp = SPLASH[scent] || SPLASH.dulce;
      return { kind: 'splash', name: sp.name, desc: sp.desc, price: 'Body Splash 250 ml: $25.000', fam: sp.fam,
        wa: 'Hola!%20El%20buscador%20me%20recomend%C3%B3%20el%20' + encodeURIComponent(sp.name) + '.%20%C2%BFTienen%20disponible%3F' };
    }
    if (fmt === 'arabe') {
      var ar = (scent === 'dulce' && g === 'femenino') ? ARABE.dulce_f : (ARABE[scent] || ARABE.dulce);
      return { kind: 'catalog', name: ar.name, desc: ar.desc, price: ar.price, fam: ar.name,
        url: 'catalogo-completo.html?f=arabe&q=' + encodeURIComponent(ar.q) };
    }
    var key = g + (scent === 'fresco' ? '_fresco' : '');
    var di = DISENADOR[key] || DISENADOR[g] || DISENADOR.unisex;
    return { kind: 'catalog', name: di.name, desc: di.desc, price: di.price, fam: di.name,
      url: 'catalogo-completo.html?f=disenador' + (di.q ? '&q=' + encodeURIComponent(di.q) : '') };
  }
  var RECS = [];

  function getRecommendation(answers) { return buildRec(answers); }

  function showStep(n) {
    document.querySelectorAll('.quiz-step').forEach(function (el) { el.classList.remove('active'); });
    var target = document.getElementById(n === 'result' ? 'step-result' : 'step-' + n);
    if (target) target.classList.add('active');
    var pct = n === 'result' ? 100 : Math.round((n / TOTAL_STEPS) * 100);
    var bar = document.getElementById('quiz-progress-bar');
    var lbl = document.getElementById('quiz-step-label');
    if (bar) bar.style.width = pct + '%';
    if (lbl) lbl.textContent = n === 'result' ? '¡Listo!' : 'Paso ' + (n + 1) + ' de ' + TOTAL_STEPS;
  }

  window.quizAnswer = function (step, value) {
    quizState.answers[step] = value;
    if (step < TOTAL_STEPS - 1) {
      quizState.step = step + 1;
      showStep(quizState.step);
    } else {
      var rec = getRecommendation(quizState.answers);
      quizState.rec = rec;
      var iconEl = document.getElementById('quiz-result-icon');
      var titleEl = document.getElementById('quiz-result-title');
      var nameEl = document.getElementById('quiz-result-name');
      var descEl = document.getElementById('quiz-result-desc');
      var priceEl = document.getElementById('quiz-result-price');
      var waEl = document.getElementById('quiz-wa-link');
      var fragEl = document.getElementById('quiz-email-fragname');
      var capEl = document.getElementById('quiz-email-capture');
      if (nameEl) nameEl.textContent = rec.name;
      if (descEl) descEl.textContent = rec.desc;
      if (priceEl) priceEl.textContent = '💰 ' + rec.price;
      if (fragEl) fragEl.textContent = rec.name;
      if (capEl) { capEl.style.display = ''; }
      var cf = document.getElementById('quiz-email-confirm'); if (cf) cf.style.display = 'none';
      var er = document.getElementById('quiz-email-error'); if (er) er.style.display = 'none';
      if (titleEl) titleEl.textContent = 'Te recomendamos:';
      if (iconEl) iconEl.textContent = rec.kind === 'splash' ? '🌸' : '✨';
      if (waEl) {
        if (rec.kind === 'catalog') {
          waEl.href = rec.url; waEl.target = '_self'; waEl.textContent = 'Ver en el catálogo →';
        } else {
          waEl.href = 'https://wa.me/' + WA_NUMBER + '?text=' + rec.wa; waEl.target = '_blank'; waEl.textContent = 'Consultar por WhatsApp →';
        }
      }
      showStep('result');
    }
  };

  window.resetQuiz = function () {
    quizState = { step: 0, answers: {} };
    showStep(0);
  };

  /* ---- AVISO DE STOCK POR MAIL (después del resultado del buscador) ---- */
  window.submitQuizEmail = function () {
    var input = document.getElementById('quiz-email-input');
    var err = document.getElementById('quiz-email-error');
    var ok = document.getElementById('quiz-email-confirm');
    var email = ((input || {}).value || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { if (err) err.style.display = 'block'; return; }
    if (err) err.style.display = 'none';
    var frag = (quizState.rec && quizState.rec.name) || '';
    var a = quizState.answers || {};
    try {
      var list = JSON.parse(localStorage.getItem('mp_quiz_leads') || '[]');
      list.push({ email: email, fragancia: frag, respuestas: a, fecha: new Date().toISOString() });
      localStorage.setItem('mp_quiz_leads', JSON.stringify(list));
    } catch (e) {}
    function done() { if (ok) ok.style.display = 'block'; var row = document.querySelector('.quiz-email-row'); if (row) row.style.display = 'none'; }
    if (CFG.EMAIL_ENDPOINT) {
      fetch(CFG.EMAIL_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: email, fragancia: frag, respuestas: a }) }).then(done).catch(done);
    } else {
      var msg = 'Hola! Quiero que me avisen cuando haya stock de ' + frag + '. Mi mail: ' + email;
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
      done();
    }
  };

  /* ---- WHATSAPP FORM ---- */
  window.enviarWA = function () {
    var nombre = (document.getElementById('f-nombre') || {}).value || '';
    var formato = (document.getElementById('f-formato') || {}).value || '';
    var marca = (document.getElementById('f-marca') || {}).value || '';
    var fragancia = (document.getElementById('f-fragancia') || {}).value || '';
    var nota = (document.getElementById('f-nota') || {}).value || '';
    if (!nombre.trim()) { alert('Por favor ingresá tu nombre'); return; }
    var msg = '¡Hola! Te hago un pedido desde la web 🌸\n\n'
      + '👤 Nombre: ' + nombre + '\n'
      + '📦 Formato: ' + (formato || 'A confirmar') + '\n'
      + '🌸 Marca: ' + (marca || 'A confirmar') + '\n'
      + (fragancia ? '💎 Fragancia/Producto: ' + fragancia + '\n' : '')
      + (nota ? '📝 Nota: ' + nota : '');
    window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
  };

  /* ---- SMOOTH ANCHORS ---- */
  safe(function () {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        var t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        window.scrollTo({ top: t.offsetTop - 70, behavior: 'smooth' });
      });
    });
  }, 'anchors');

})();
