/* =====================
   MARCHISIO PARFUMS · main.js v20260605
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
          if (f === 'all' || (c.getAttribute('data-tags') || '').indexOf(f) !== -1) {
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
  var quizState = { step: 0, answers: {} };
  var TOTAL_STEPS = 6;

  var RECS = [
    {
      cond: function (a) { return a[3] === 'dulce' && a[0] === 'femenino'; },
      name: 'Lattafa Yara Candy', marca: 'Lattafa', formato: 'Tubito 35ml o Mini 50ml',
      desc: 'Dulce, frutal y adictivo. La fragancia perfecta para vos: rosa, frutas tropicales y caramelo. Proyección buena y duración envidiable.',
      price: 'Tubito 35ml: $8.000 · Mini 50ml: $20.000',
      wa: 'Hola!%20El%20quiz%20me%20recomendó%20el%20Lattafa%20Yara%20Candy.%20¿Qué%20opciones%20tienen%3F'
    },
    {
      cond: function (a) { return a[3] === 'dulce' && a[0] !== 'masculino'; },
      name: 'Lattafa Yara Rosa', marca: 'Lattafa', formato: 'Tubito 35ml o Mini 50ml',
      desc: 'La más querida del catálogo árabe. Rosa fresca, frutas tropicales y vainilla. Dulce sin empalagar, femenino y vibrante.',
      price: 'Tubito 35ml: $8.000 · Mini 50ml: $20.000',
      wa: 'Hola!%20El%20quiz%20me%20recomendó%20el%20Lattafa%20Yara%20Rosa.%20¿Qué%20opciones%20tienen%3F'
    },
    {
      cond: function (a) { return a[3] === 'oriental' && a[0] === 'masculino'; },
      name: 'Armaf Club de Nuit Intense Man', marca: 'Armaf', formato: 'Mini 30ml',
      desc: 'El clon de Aventus más aclamado. Fruta, ahumado, madera seca y cuero. Bestial proyección. El perfume que no pasa desapercibido.',
      price: 'Mini 30ml: $15.000',
      wa: 'Hola!%20El%20quiz%20me%20recomendó%20el%20Armaf%20Club%20de%20Nuit%20Intense%20Man.%20¿Qué%20opciones%20tienen%3F'
    },
    {
      cond: function (a) { return a[3] === 'oriental' && a[2] === 'especial'; },
      name: 'Lattafa Asad Negro', marca: 'Lattafa', formato: 'Mini 50ml',
      desc: 'Oud negro intenso, cuero y especias exóticas. Para las grandes ocasiones. Una presencia que llena el ambiente y se recuerda siempre.',
      price: 'Mini 50ml: $20.000',
      wa: 'Hola!%20El%20quiz%20me%20recomendó%20el%20Lattafa%20Asad%20Negro.%20¿Qué%20opciones%20tienen%3F'
    },
    {
      cond: function (a) { return a[3] === 'floral' && a[1] === 'teen'; },
      name: 'Victoria Secret Pure Seduction', marca: 'Victoria Secret', formato: 'Body Mist',
      desc: 'Frutas rojas y jazmín fresco. Alegre, joven y perfecta para el día a día. El body mist que se vuelve inseparable.',
      price: 'Body Mist: $18.415',
      wa: 'Hola!%20El%20quiz%20me%20recomendó%20el%20Victoria%20Secret%20Pure%20Seduction.%20¿Tienen%20disponible%3F'
    },
    {
      cond: function (a) { return a[3] === 'floral' && a[2] === 'noche'; },
      name: 'Afnan 9PM Black', marca: 'Afnan', formato: 'Mini 30ml',
      desc: 'Floral oscuro y nocturno. El 9PM Black tiene una profundidad especial con notas florales exóticas sobre especias cálidas. Para la noche que se extiende.',
      price: 'Mini 30ml: $15.000',
      wa: 'Hola!%20El%20quiz%20me%20recomendó%20el%20Afnan%209PM%20Black.%20¿Tienen%20disponible%3F'
    },
    {
      cond: function (a) { return a[3] === 'fresco' && a[0] === 'masculino'; },
      name: 'Armaf Odyssey Mandarin Sky', marca: 'Armaf', formato: 'Tubito 35ml',
      desc: 'Mandarina fresca explosiva sobre fondo amaderado. Energético, moderno y con proyección sorprendente. El favorito para el día a día masculino.',
      price: 'Tubito 35ml: $8.000',
      wa: 'Hola!%20El%20quiz%20me%20recomendó%20el%20Armaf%20Odyssey%20Mandarin%20Sky.%20¿Tienen%20disponible%3F'
    },
    {
      cond: function (a) { return a[3] === 'fresco'; },
      name: 'Lattafa Yara Tous Naranja', marca: 'Lattafa', formato: 'Mini 50ml',
      desc: 'Cítrico, vibrante y veraniego. Naranja fresca con corazón floral y base suave. Ideal para el calor y el uso diario.',
      price: 'Mini 50ml: $20.000',
      wa: 'Hola!%20El%20quiz%20me%20recomendó%20el%20Lattafa%20Yara%20Tous%20Naranja.%20¿Tienen%20disponible%3F'
    },
    {
      cond: function (a) { return a[5] === 'bajo'; },
      name: 'Lattafa Yara Moi Blanco', marca: 'Lattafa', formato: 'Tubito 35ml',
      desc: 'Floral suave y almizclado. Elegante, versátil y asequible. Una excelente introducción al mundo de las fragancias árabes.',
      price: 'Tubito 35ml: $8.000',
      wa: 'Hola!%20El%20quiz%20me%20recomendó%20el%20Lattafa%20Yara%20Moi%20Blanco.%20¿Tienen%20disponible%3F'
    },
    {
      cond: function () { return true; },
      name: 'Lattafa Badee Al Oud For Glory', marca: 'Lattafa', formato: 'Mini 30ml',
      desc: 'Oud negro profundo con rosa árabe. El bestseller definitivo. Elegante, intenso y con una proyección que se queda en la memoria.',
      price: 'Mini 30ml: $15.000',
      wa: 'Hola!%20El%20quiz%20me%20recomendó%20el%20Lattafa%20Badee%20Al%20Oud%20For%20Glory.%20¿Tienen%20disponible%3F'
    }
  ];

  function getRecommendation(answers) {
    for (var i = 0; i < RECS.length; i++) {
      if (RECS[i].cond(answers)) return RECS[i];
    }
    return RECS[RECS.length - 1];
  }

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
      var nameEl = document.getElementById('quiz-result-name');
      var descEl = document.getElementById('quiz-result-desc');
      var priceEl = document.getElementById('quiz-result-price');
      var waEl = document.getElementById('quiz-wa-link');
      if (nameEl) nameEl.textContent = rec.name;
      if (descEl) descEl.textContent = rec.desc;
      if (priceEl) priceEl.textContent = '💰 ' + rec.price;
      if (waEl) waEl.href = 'https://wa.me/5491112345678?text=' + rec.wa;
      showStep('result');
    }
  };

  window.resetQuiz = function () {
    quizState = { step: 0, answers: {} };
    showStep(0);
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
    window.open('https://wa.me/5491112345678?text=' + encodeURIComponent(msg), '_blank');
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
