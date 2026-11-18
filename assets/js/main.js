/* ==========================================================================
   Le fils de Venise — mouvement
   GSAP + ScrollTrigger + Lenis (tous trois servis depuis assets/vendor).
   Principes : le contenu est lisible sans ce script ; le mouvement s’ajoute.
   Seuls transform / opacity / clip-path sont animés, sauf le tracé des traits.
   ========================================================================== */
(function () {
  'use strict';

  window.__fdv = true;
  var root = document.documentElement;

  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove('js', 'is-loading');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- Utilitaires ---------- */
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = gsap.utils.clamp;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var lenis = null;
  var menuOpen = false;

  /* Découpe un titre en mots ou en lettres masqués (texte accessible conservé via aria-label). */
  function split(el, mode) {
    if (el.dataset.splitDone) return $$(mode === 'chars' ? '.ci' : '.wi', el);
    var text = el.textContent.replace(/[ \t\n\r]+/g, ' ').trim();
    var inners = [];
    var frag = document.createDocumentFragment();
    if (/^H[1-6]$/.test(el.tagName)) el.setAttribute('aria-label', text); else el.setAttribute('aria-hidden', 'true');
    el.textContent = '';
    text.split(' ').forEach(function (word, i, arr) {
      var holder;
      if (mode === 'chars') {
        holder = document.createElement('span');
        holder.style.cssText = 'display:inline-block;white-space:nowrap';
        holder.setAttribute('aria-hidden', 'true');
        Array.from(word).forEach(function (ch) {
          var c = document.createElement('span'); c.className = 'c';
          var ci = document.createElement('span'); ci.className = 'ci'; ci.textContent = ch;
          c.appendChild(ci); holder.appendChild(c); inners.push(ci);
        });
      } else {
        holder = document.createElement('span'); holder.className = 'w';
        holder.setAttribute('aria-hidden', 'true');
        var wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = word;
        holder.appendChild(wi); inners.push(wi);
      }
      frag.appendChild(holder);
      if (i < arr.length - 1) frag.appendChild(document.createTextNode(' '));
    });
    el.appendChild(frag);
    el.dataset.splitDone = '1';
    el.style.visibility = 'visible';
    return inners;
  }

  /* ---------- Lenis (défilement doux) ---------- */
  function initLenis() {
    if (reduce || !window.Lenis) return;
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToTarget(target) {
    if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ---------- Horaires : statut en direct (heure de Paris) ---------- */
  var SCHEDULE = { 3: [600, 1260], 4: [600, 1260], 5: [600, 1260], 6: [510, 1200] }; // 0 = dimanche
  var DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var DAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function fmt(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return h + ' h' + (m ? ' ' + (m < 10 ? '0' + m : m) : '');
  }
  function parisNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Paris', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
      var o = {};
      parts.forEach(function (p) { o[p.type] = p.value; });
      return { day: DAY_INDEX[o.weekday], min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }
  function updateStatus() {
    var now = parisNow();
    var today = SCHEDULE[now.day];
    var open = false, text;
    if (today && now.min >= today[0] && now.min < today[1]) {
      open = true;
      text = 'Ouvert · ferme à ' + fmt(today[1]);
    } else if (today && now.min < today[0]) {
      text = 'Fermé · ouvre à ' + fmt(today[0]);
    } else {
      for (var k = 1; k <= 7; k++) {
        var d = (now.day + k) % 7;
        if (SCHEDULE[d]) {
          text = 'Fermé · rouvre ' + (k === 1 ? 'demain' : DAYS[d]) + ' à ' + fmt(SCHEDULE[d][0]);
          break;
        }
      }
    }
    $$('[data-status]').forEach(function (el) {
      el.classList.toggle('is-open', open);
      var t = $('[data-status-text]', el);
      if (t) t.textContent = text;
    });
    $$('[data-hours] li').forEach(function (li) {
      li.classList.toggle('is-today', parseInt(li.dataset.day, 10) === now.day);
    });
  }

  /* ---------- Navigation ---------- */
  function initNav() {
    var nav = $('[data-nav]');
    var last = 0;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        var y = self.scroll();
        nav.classList.toggle('is-solid', y > 40);
        var dy = y - last;
        if (Math.abs(dy) > 4) {
          if (dy > 0 && y > 480 && !menuOpen) nav.classList.add('is-hidden');
          else nav.classList.remove('is-hidden');
          last = y;
        }
      }
    });

    // lien actif selon la section visible
    $$('.nav__links .link').forEach(function (a) {
      var sec = $(a.getAttribute('href'));
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec, start: 'top 55%', end: 'bottom 55%',
        onToggle: function (self) { a.classList.toggle('is-active', self.isActive); }
      });
    });

    // bouton d’appel flottant (mobile) : visible après le hero, masqué près de l’appel à l’action
    var fab = $('.fab');
    if (fab) {
      var show = function () { fab.classList.add('is-visible'); };
      var hide = function () { fab.classList.remove('is-visible'); };
      ScrollTrigger.create({ trigger: '.hero', start: 'bottom 40%', onEnter: show, onLeaveBack: hide });
      ScrollTrigger.create({ trigger: '.cta', start: 'top 85%', end: 'max', onEnter: hide, onLeaveBack: show });
    }

    // barre de progression de lecture
    gsap.to('.progress i', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.2 } });
  }

  /* ---------- Menu plein écran ---------- */
  function initMenu() {
    var burger = $('.nav__burger'), menu = $('#menu');
    if (!burger || !menu) return;
    var links = $$('.menu__nav a span', menu);
    var foot = $('.menu__foot', menu);
    var shell = [$('main'), $('.footer'), $('.fab')].filter(Boolean);
    var tl;

    function setOpen(open) {
      menuOpen = open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      shell.forEach(function (el) { el.inert = open; });
      if (tl) tl.kill();
      if (open) {
        menu.inert = false;
        menu.classList.add('is-open');
        if (lenis) lenis.stop(); else root.style.overflow = 'hidden';
        $('.nav').classList.remove('is-hidden');
        if (reduce) { gsap.set(menu, { clearProps: 'clipPath' }); } else {
          tl = gsap.timeline();
          tl.fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut' })
            .fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.06 }, 0.25)
            .fromTo(foot, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out' }, 0.5);
        }
        var first = $('.menu__nav a', menu);
        if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 120);
      } else {
        menu.inert = true;
        if (lenis) lenis.start(); else root.style.overflow = '';
        if (reduce) { menu.classList.remove('is-open'); gsap.set(menu, { clearProps: 'clipPath' }); } else {
          tl = gsap.timeline({ onComplete: function () { menu.classList.remove('is-open'); gsap.set(menu, { clearProps: 'clipPath' }); } });
          tl.to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.6, ease: 'expo.inOut' });
        }
      }
    }
    burger.addEventListener('click', function () { setOpen(!menuOpen); if (!menuOpen) burger.focus(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuOpen) { setOpen(false); burger.focus(); }
    });
    window.matchMedia('(min-width: 1000px)').addEventListener('change', function (e) { if (e.matches && menuOpen) setOpen(false); });
    menu.__close = function () { if (menuOpen) setOpen(false); };
  }

  /* ---------- Ancres : défilement doux ---------- */
  function initAnchors() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id.length < 2) return;
        var t = $(id);
        if (!t) return;
        e.preventDefault();
        var menu = $('#menu');
        if (menu && menu.__close) menu.__close();
        setTimeout(function () {
          scrollToTarget(id === '#accueil' ? 0 : t);
          t.setAttribute('tabindex', '-1');
          t.focus({ preventScroll: true });
        }, menuOpen ? 350 : 0);
      });
    });
  }

  /* ---------- Micro-interactions (pointeur précis) ---------- */
  function magnetic(el) {
    var label = $('.btn__label', el);
    var x = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.55)' });
    var y = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.55)' });
    var lx = label && gsap.quickTo(label, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.55)' });
    var ly = label && gsap.quickTo(label, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.55)' });
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      x(dx * 0.28); y(dy * 0.34);
      if (lx) { lx(dx * 0.1); ly(dy * 0.14); }
    });
    el.addEventListener('pointerleave', function () { x(0); y(0); if (lx) { lx(0); ly(0); } });
  }

  function tilt(el, max) {
    max = max || 7;
    gsap.set(el, { transformPerspective: 900, transformOrigin: '50% 50%' });
    var rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' });
    var ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      rx((0.5 - py) * max * 2); ry((px - 0.5) * max * 2);
      el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      el.classList.add('is-hot');
    });
    el.addEventListener('pointerleave', function () { rx(0); ry(0); el.classList.remove('is-hot'); });
  }

  function initCursor() {
    var c = document.createElement('div');
    c.className = 'cursor';
    c.setAttribute('aria-hidden', 'true');
    document.body.appendChild(c);
    var xTo = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3' });
    var yTo = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3' });
    var shown = false;
    window.addEventListener('pointermove', function (e) {
      if (!shown) { shown = true; gsap.to(c, { opacity: 1, duration: 0.3 }); }
      xTo(e.clientX); yTo(e.clientY);
    }, { passive: true });
    document.addEventListener('pointerover', function (e) {
      var hit = e.target.closest && e.target.closest('a, button, [data-tilt], .panel');
      gsap.to(c, { scale: hit ? 1.7 : 1, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
    });
    document.documentElement.addEventListener('pointerleave', function () { gsap.to(c, { opacity: 0, duration: 0.2 }); shown = false; });
  }

  /* ---------- Marquee : vitesse et sens liés au défilement ---------- */
  function fillMarquee() {
    $$('[data-marquee]').forEach(function (row) {
      var track = $('.marquee__track', row);
      var group = $('.marquee__group', track);
      var w = group.offsetWidth || 1;
      var need = Math.ceil((window.innerWidth * 2.2) / w) + 1;
      while (track.children.length < need) {
        var clone = group.cloneNode(true);
        track.appendChild(clone);
      }
      row.__w = w;
    });
  }
  function initMarquee() {
    fillMarquee();
    var rows = $$('[data-marquee]').map(function (row) {
      return { row: row, track: $('.marquee__track', row), dir: parseFloat(row.dataset.marquee), x: 0 };
    });
    if (reduce) return;
    var vel = 0, smooth = 0, active = true;
    rows.forEach(function (s) { s.setX = gsap.quickSetter(s.track, 'x', 'px'); s.setSkew = gsap.quickSetter(s.row, 'skewX', 'deg'); });
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (self) { vel = self.getVelocity(); } });
    ScrollTrigger.create({ trigger: '.marquee', start: 'top bottom', end: 'bottom top', onToggle: function (self) { active = self.isActive; } });
    gsap.ticker.add(function () {
      if (!active) return;
      vel *= 0.92;
      smooth += (vel - smooth) * 0.1;
      var ratio = gsap.ticker.deltaRatio();
      var boost = clamp(-48, 48, smooth * 0.011);
      var skew = clamp(-5, 5, smooth * -0.0035);
      rows.forEach(function (s) {
        var w = s.row.__w;
        s.x += s.dir * (0.9 + boost) * ratio;
        if (s.x <= -w) s.x += w;
        if (s.x > 0) s.x -= w;
        s.setX(s.x);
        s.setSkew(skew);
      });
    });
  }

  /* ---------- Titres : une mise en scène par section ---------- */
  var HEADINGS = {
    'story-title': { from: { yPercent: 115 }, stagger: 0.06, duration: 1.2, trigger: '.story', start: 'top 62%' },
    'tarifs-title': { from: { yPercent: 115, rotation: 5 }, stagger: 0.07, duration: 1.3, trigger: '.tarifs', start: 'top 62%' },
    'gallery-title': { from: { yPercent: 115, rotation: 8 }, stagger: { each: 0.035, from: 'center' }, duration: 1.3 },
    'reviews-title': { from: { yPercent: -115 }, stagger: 0.07, duration: 1.2 },
    'cta-title': { from: { yPercent: 118 }, stagger: 0.1, duration: 1.6 },
    'where-title': { from: { yPercent: 115 }, stagger: 0.05, duration: 1.1 }
  };

  /* ---------- Intro : chargement + entrée du hero ---------- */
  function finishIntro() {
    root.classList.remove('is-loading');
    root.classList.add('is-ready');
    gsap.set('[data-hero-clip]', { clearProps: 'clipPath' });
    if (lenis) lenis.start();
    ScrollTrigger.refresh();
  }

  function runIntro() {
    var clip = $('[data-hero-clip]');
    var countEl = $('[data-loader-count]');
    var pre = $('[data-hero-pre]');
    var name = $('[data-hero-name]');
    var mirrors = $$('.hero__mirrors .mirror');
    var heroFade = $$('[data-hero-fade]');
    var badge = $('[data-hero-badge]');
    var traits = $$('.hero__traits path');
    var loaderTraits = $$('.loader__traits path');

    if (reduce) {
      finishIntro();
      return;
    }
    if (lenis) lenis.stop();

    var seen = false;
    try { seen = !!sessionStorage.getItem('fdv-seen'); sessionStorage.setItem('fdv-seen', '1'); } catch (e) { /* stockage indisponible */ }
    var dur = seen ? 0.9 : 1.9;

    $('#hero-title').setAttribute('aria-label', 'Le fils de Venise');
    var preWords = split(pre, 'words');
    var nameChars = split(name, 'chars');
    gsap.set(preWords, { yPercent: 120 });
    gsap.set(nameChars, { yPercent: 118 });
    gsap.set(heroFade, { y: 28, opacity: 0 });
    gsap.set(mirrors, { y: 160, opacity: 0, scale: 0.94 });
    gsap.set(badge, { scale: 0.6, opacity: 0, rotation: -40 });
    gsap.set(traits, { strokeDashoffset: 1 });
    gsap.set(loaderTraits, { strokeDashoffset: 1 });
    gsap.set($$('.loader__brand, .loader__count'), { opacity: 0, y: 24 });
    gsap.set('.hero__bg', { scale: 1.12 });
    gsap.set(clip, { clipPath: 'inset(42% 43% 38% 43% round 999px 999px 0px 0px)' });

    var counter = { v: 0 };
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: finishIntro });

    // 1. chargement : la fenêtre en arche s’agrandit pendant que le compteur monte
    tl.to($$('.loader__brand, .loader__count'), { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, 0)
      .to(loaderTraits, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut', stagger: 0.12 }, 0.05)
      .to(counter, { v: 100, duration: dur, ease: 'power2.inOut', onUpdate: function () { countEl.textContent = Math.round(counter.v); } }, 0)
      .to(clip, { clipPath: 'inset(24% 36% 20% 36% round 999px 999px 0px 0px)', duration: dur, ease: 'power2.inOut' }, 0)
      // 2. l’arche s’ouvre sur tout l’écran
      .addLabel('open', '>+0.15')
      .to($$('.loader__brand, .loader__count, .loader__traits'), { opacity: 0, y: -30, duration: 0.55, ease: 'power2.in', stagger: 0.04 }, 'open')
      .to(clip, { clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0px 0px)', duration: 1.35, ease: 'expo.inOut' }, 'open')
      .to('.hero__bg', { scale: 1, duration: 1.9, ease: 'expo.out' }, 'open')
      // 3. entrée du hero
      .to(nameChars, { yPercent: 0, duration: 1.4, ease: 'expo.out', stagger: 0.06 }, 'open+=0.55')
      .to(preWords, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, 'open+=0.75')
      .to(mirrors, { y: 0, opacity: 1, scale: 1, duration: 1.7, ease: 'expo.out', stagger: 0.12 }, 'open+=0.45')
      .to(heroFade, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.1 }, 'open+=0.95')
      .to(badge, { scale: 1, opacity: 1, rotation: 0, duration: 1.3, ease: 'expo.out' }, 'open+=1.1')
      .to(traits, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut', stagger: 0.14 }, 'open+=0.4');

    // libère le défilement dès que l’arche est ouverte (la fin de la timeline est décorative)
    tl.call(function () { root.classList.remove('is-loading'); root.classList.add('is-ready'); if (lenis) lenis.start(); ScrollTrigger.refresh(); }, null, 'open+=1.2');
  }

  /* ---------- Mise en scène par section ---------- */
  function initScenes() {
    var mm = gsap.matchMedia();

    mm.add({
      motion: '(prefers-reduced-motion: no-preference)',
      desktop: '(min-width: 900px) and (prefers-reduced-motion: no-preference)'
    }, function (ctx) {
      var motion = ctx.conditions.motion;
      var desktop = ctx.conditions.desktop;
      if (!motion) return;

      if (desktop) root.classList.add('fx-pin');

      /* Titres */
      $$('[data-split]').forEach(function (el) {
        var cfg = HEADINGS[el.id] || { from: { yPercent: 115 }, stagger: 0.06, duration: 1.2 };
        var inners = split(el, el.dataset.split);
        gsap.set(inners, Object.assign({}, cfg.from));
        gsap.to(inners, {
          yPercent: 0, rotation: 0, duration: cfg.duration, ease: 'expo.out', stagger: cfg.stagger,
          scrollTrigger: { trigger: cfg.trigger || el, start: cfg.start || 'top 86%', once: true }
        });
      });

      /* Hero : parallax multicouche au défilement */
      var heroTrigger = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('.hero__bg', { yPercent: 14, ease: 'none', scrollTrigger: heroTrigger });
      gsap.to('.hero__title', { yPercent: -14, ease: 'none', scrollTrigger: heroTrigger });
      gsap.to('.hero__lead', { y: -50, ease: 'none', scrollTrigger: heroTrigger });
      gsap.to('.hero__badge', { yPercent: -60, rotation: 40, ease: 'none', scrollTrigger: heroTrigger });
      $$('.hero__mirrors .mirror').forEach(function (m) {
        var d = parseFloat(m.dataset.depth) || 0.6;
        gsap.to(m, { yPercent: -26 * d, ease: 'none', scrollTrigger: heroTrigger });
      });

      /* Hero : parallax à la souris (les miroirs bougent dans leur cadre) */
      if (desktop && finePointer) {
        var glass = $$('.hero__mirrors .mirror').map(function (m) {
          var g = $('.mirror__glass', m);
          return { d: parseFloat(m.dataset.depth) || 0.6, x: gsap.quickTo(g, 'x', { duration: 1.1, ease: 'power3' }), y: gsap.quickTo(g, 'y', { duration: 1.1, ease: 'power3' }) };
        });
        var heroEl = $('.hero');
        heroEl.addEventListener('pointermove', function (e) {
          var nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
          glass.forEach(function (g) { g.x(-nx * 46 * g.d); g.y(-ny * 34 * g.d); });
        });
      }

      /* Savoir-faire : section épinglée, quatre étapes */
      if (desktop) {
        var steps = $$('.step');
        var N = steps.length;
        var bodies = steps.map(function (s) { return $('.step__body', s); });
        var glasses = steps.map(function (s) { return $('.mirror__glass', s); });
        var badges = steps.map(function (s) { return $('.step__n', s); });
        var imgs = glasses.map(function (g) { return $('img', g); });
        var ticks = $$('.story__ticks i');

        gsap.set(bodies.slice(1), { autoAlpha: 0, y: 40 });
        gsap.set(glasses.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });
        gsap.set(badges.slice(1), { autoAlpha: 0, scale: 0.6 });
        gsap.set(imgs, { scale: 1.18 });

        var story = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: '.story', start: 'top top',
            end: function () { return '+=' + Math.round(N * window.innerHeight * 0.85); },
            pin: '.story__stage', scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
            refreshPriority: 2,
            snap: { snapTo: 'labels', inertia: false, duration: { min: 0.25, max: 0.7 }, delay: 0.08, ease: 'power2.inOut' },
            onUpdate: function (self) {
              var idx = Math.min(N - 1, Math.round(self.progress * N - 0.15));
              ticks.forEach(function (t, i) { t.classList.toggle('is-on', i === Math.max(0, idx)); });
            }
          }
        });
        imgs.forEach(function (img, i) { story.fromTo(img, { scale: 1.18 }, { scale: 1.02, duration: 1 }, i); });
        story.addLabel('sStart', 0);
        for (var i = 0; i < N; i++) story.addLabel('s' + i, i + 0.5);
        story.addLabel('sEnd', N);
        for (var j = 1; j < N; j++) {
          (function (n) {
            story
              .to(bodies[n - 1], { autoAlpha: 0, y: -40, duration: 0.25, ease: 'power2.in' }, n - 0.32)
              .to(badges[n - 1], { autoAlpha: 0, scale: 0.6, duration: 0.2, ease: 'power2.in' }, n - 0.32)
              .fromTo(glasses[n], { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.42, ease: 'power2.inOut' }, n - 0.32)
              .fromTo(bodies[n], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, n - 0.06)
              .fromTo(badges[n], { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'back.out(2)' }, n - 0.02);
          })(j);
        }
        gsap.from('.story__fade', { scaleY: -0.2, transformOrigin: '50% 0%', ease: 'none', scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'top 30%', scrub: true } });
      } else {
        /* mobile : chaque étape se révèle toute seule */
        $$('.step').forEach(function (step) {
          var g = $('.mirror__glass', step), img = $('img', g), body = $('.step__body', step);
          gsap.fromTo(g, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: step, start: 'top 82%', once: true } });
          gsap.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: step, start: 'top 82%', once: true } });
          gsap.from(body, { y: 36, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: step, start: 'top 72%', once: true } });
        });
      }

      /* Tarifs : défilement horizontal piloté par le scroll vertical */
      var track = $('.tarifs__track');
      if (desktop && track) {
        var stage = $('.tarifs__stage');
        var rail = $('.rail__fill');
        var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
        var hTween = gsap.to(track, {
          x: function () { return -dist(); }, ease: 'none',
          scrollTrigger: {
            trigger: '.tarifs', start: 'top top', end: function () { return '+=' + dist(); },
            pin: stage, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 1,
            onUpdate: function (self) { rail.style.clipPath = 'inset(0 ' + (100 - self.progress * 100).toFixed(2) + '% 0 0)'; }
          }
        });
        var panels = $$('.panel', track);
        var early = [$('.tarifs__intro', track)];
        panels.forEach(function (p, i) {
          var rows = $$('li', p);
          var visibleAtStart = p.getBoundingClientRect().left < window.innerWidth * 0.95;
          if (visibleAtStart) {
            early.push(p);
          } else {
            gsap.fromTo(p, { y: 90, opacity: 0, rotation: 2 }, {
              y: 0, opacity: 1, rotation: 0, ease: 'power2.out',
              scrollTrigger: { trigger: p, containerAnimation: hTween, start: 'left 98%', end: 'left 62%', scrub: true }
            });
            gsap.from(rows, {
              opacity: 0, y: 16, stagger: 0.06, ease: 'power2.out',
              scrollTrigger: { trigger: p, containerAnimation: hTween, start: 'left 80%', end: 'left 40%', scrub: true }
            });
          }
        });
        gsap.from(early, { y: 70, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.tarifs', start: 'top 70%', once: true } });

        if (finePointer) panels.forEach(function (p) { tilt(p, 6); });
      } else if (track) {
        gsap.from($$('.panel', track), { y: 50, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: track, start: 'top 80%', once: true } });
      }

      /* Chiffres : compteurs */
      var figs = $('[data-figures]');
      if (figs) {
        var nums = $$('[data-count]', figs);
        nums.forEach(function (b) {
          var w = b.getBoundingClientRect().width;
          b.style.minWidth = Math.ceil(w) + 'px';
          b.style.textAlign = 'right';
          b.textContent = (b.dataset.prefix || '') + '0';
        });
        gsap.from(figs, { y: 60, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: figs, start: 'top 82%', once: true } });
        ScrollTrigger.create({
          trigger: figs, start: 'top 72%', once: true,
          onEnter: function () {
            nums.forEach(function (b, i) {
              var target = parseFloat(b.dataset.count), prefix = b.dataset.prefix || '', o = { v: 0 };
              gsap.to(o, { v: target, duration: 2.4, delay: 0.15 + i * 0.22, ease: 'power3.out', onUpdate: function () { b.textContent = prefix + Math.round(o.v); } });
              gsap.fromTo(b, { scale: 0.86 }, { scale: 1, duration: 1.1, delay: 0.15 + i * 0.22, ease: 'expo.out' });
            });
          }
        });
        gsap.to('.figures__comb', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.figures', start: 'top bottom', end: 'top 20%', scrub: true } });
      }

      /* Galerie */
      $$('.gallery__traits path').forEach(function (p) { gsap.set(p, { strokeDashoffset: 1 }); });
      gsap.to('.gallery__traits path', { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut', stagger: 0.15, scrollTrigger: { trigger: '.gallery', start: 'top 70%', once: true } });
      $$('.g').forEach(function (g) {
        var glassEl = $('.mirror__glass', g);
        var speed = parseFloat(g.dataset.speed) || 0;
        if (glassEl) {
          var img = $('img', glassEl);
          gsap.fromTo(glassEl, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.out', scrollTrigger: { trigger: g, start: 'top 88%', once: true } });
          gsap.fromTo(img, { yPercent: -7, scale: 1.16 }, { yPercent: 7, scale: 1.16, ease: 'none', scrollTrigger: { trigger: g, start: 'top bottom', end: 'bottom top', scrub: true } });
        } else {
          gsap.from(g, { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: g, start: 'top 90%', once: true } });
        }
        if (desktop && speed) {
          gsap.fromTo(g, { y: -speed * 9 }, { y: speed * 9, ease: 'none', scrollTrigger: { trigger: '.gallery__wall', start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
        }
        if (desktop && finePointer) { var t = $('[data-tilt]', g); if (t) tilt(t, 8); }
      });

      /* Appel à l’action : le cercle kaki s’ouvre depuis le bas */
      var ctaBg = $('.cta__bg');
      gsap.set(ctaBg, { clipPath: 'circle(0% at 50% 100%)' });
      gsap.to(ctaBg, { clipPath: 'circle(150% at 50% 100%)', ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top 78%', end: 'top 8%', scrub: true } });
      gsap.from('.cta__lead, .cta__actions > *', { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12, scrollTrigger: { trigger: '.cta__lead', start: 'top 88%', once: true } });
      gsap.from('.cta__arcade', { yPercent: -100, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'top 50%', scrub: true } });

      /* Nous trouver */
      gsap.fromTo('.where__map', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.where__visual', start: 'top 80%', once: true } });
      gsap.fromTo('.where__facade img', { scale: 1.3 }, { scale: 1, duration: 2.6, ease: 'power2.out', scrollTrigger: { trigger: '.where__facade', start: 'top 92%', once: true } });
      gsap.from('.where__facade', { y: 80, rotation: 6, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.where__facade', start: 'top 94%', once: true } });
      gsap.from('.where__addr p, .hours li, .where__actions > *', { y: 24, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: '.where__addr', start: 'top 85%', once: true } });
      if (desktop && finePointer) tilt($('.where__map'), 4);

      /* Pied de page : le nom se lève lettre par lettre */
      var big = $('.footer__big');
      var chars = split(big, 'chars');
      gsap.set(chars, { yPercent: 118 });
      gsap.to(chars, { yPercent: 0, duration: 1.5, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: '.footer__name', start: 'top 92%', once: true } });
      gsap.from('.footer__name > span:nth-child(2)', { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.footer__name', start: 'top 92%', once: true } });

      /* Boutons magnétiques et curseur */
      if (finePointer) {
        $$('.magnetic').forEach(magnetic);
      }

      return function () { root.classList.remove('fx-pin'); };
    });
  }

  /* ---------- Avis : carrousel ---------- */
  function initReviews() {
    var viewport = $('[data-viewport]'), track = $('[data-track]');
    if (!viewport || !track) return;
    var slides = $$('[data-review]'), dots = $$('[data-dot]');
    var prev = $('[data-prev]'), next = $('[data-next]'), playBtn = $('[data-play]');
    var bar = $('.reviews__bar i');
    var N = slides.length, idx = 0, playing = !reduce, hovering = false, inView = false;
    var barTween = null, W = 0;

    slides.forEach(function (s) {
      var len = s.textContent.length;
      s.dataset.len = len > 230 ? 'l' : len > 130 ? 'm' : 's';
    });

    function update() {
      slides.forEach(function (s, i) {
        var on = i === idx;
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
        s.inert = !on;
      });
      dots.forEach(function (d, i) { d.setAttribute('aria-current', i === idx ? 'true' : 'false'); });
    }
    function runBar() {
      if (barTween) barTween.kill();
      gsap.set(bar, { scaleX: 0 });
      if (!playing || reduce) return;
      barTween = gsap.to(bar, { scaleX: 1, duration: 8, ease: 'none', paused: !(inView && !hovering), onComplete: function () { go(idx + 1); } });
    }
    function go(i, fromDrag) {
      idx = (i + N) % N;
      update();
      if (reduce) {
        gsap.set(track, { xPercent: -100 * idx, x: 0 });
      } else {
        gsap.to(track, { xPercent: -100 * idx, x: 0, duration: fromDrag ? 0.8 : 1.15, ease: 'expo.out', overwrite: true });
        var s = slides[idx];
        gsap.fromTo($$('.review__q, blockquote, .review__by', s), { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.12, overwrite: true });
      }
      runBar();
    }
    function setPlaying(p) {
      playing = p;
      playBtn.setAttribute('aria-label', p ? 'Mettre le défilement en pause' : 'Relancer le défilement');
      $('use', playBtn).setAttribute('href', p ? '#i-pause' : '#i-play');
      runBar();
    }
    function sync() { if (barTween) barTween.paused(!(playing && inView && !hovering && !document.hidden)); }

    prev.addEventListener('click', function () { go(idx - 1); });
    next.addEventListener('click', function () { go(idx + 1); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); }); });
    playBtn.addEventListener('click', function () { setPlaying(!playing); });
    if (reduce) { playBtn.hidden = true; }

    var section = $('.reviews');
    section.addEventListener('pointerenter', function () { hovering = true; sync(); });
    section.addEventListener('pointerleave', function () { hovering = false; sync(); });
    section.addEventListener('focusin', function () { hovering = true; sync(); });
    section.addEventListener('focusout', function () { hovering = false; sync(); });
    document.addEventListener('visibilitychange', sync);
    ScrollTrigger.create({ trigger: section, start: 'top 80%', end: 'bottom 20%', onToggle: function (self) { inView = self.isActive; sync(); } });

    // glisser / balayer
    var startX = 0, dx = 0, dragging = false, startT = 0, pid = null;
    viewport.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true; startX = e.clientX; dx = 0; startT = performance.now(); pid = e.pointerId; W = viewport.clientWidth;
    });
    viewport.addEventListener('pointermove', function (e) {
      if (!dragging || e.pointerId !== pid) return;
      dx = e.clientX - startX;
      if (Math.abs(dx) > 6 && !viewport.classList.contains('is-drag')) { viewport.classList.add('is-drag'); try { viewport.setPointerCapture(pid); } catch (err) { /* ignore */ } }
      if (viewport.classList.contains('is-drag')) gsap.set(track, { x: dx * 0.9 });
    });
    function endDrag(e) {
      if (!dragging || (e && e.pointerId !== pid)) return;
      dragging = false;
      var wasDrag = viewport.classList.contains('is-drag');
      viewport.classList.remove('is-drag');
      if (!wasDrag) return;
      var v = Math.abs(dx) / Math.max(1, performance.now() - startT);
      if (Math.abs(dx) > W * 0.16 || v > 0.45) go(dx < 0 ? idx + 1 : idx - 1, true); else go(idx, true);
    }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    update();
    gsap.set(track, { xPercent: 0 });
    runBar();
  }

  /* ---------- Démarrage ---------- */
  function start() {
    try {
      initLenis();
      initNav();
      initMenu();
      initAnchors();
      updateStatus();
      setInterval(updateStatus, 60000);
      initMarquee();
      initReviews();
      if (finePointer && !reduce) initCursor();

      if (reduce) {
        $$('[data-split]').forEach(function (el) { el.style.visibility = 'visible'; });
      }
      initScenes();
      runIntro();
    } catch (err) {
      if (window.console) console.error(err);
      root.classList.remove('is-loading');
      $$('[data-split]').forEach(function (el) { el.style.visibility = 'visible'; });
      gsap.set('[data-hero-clip]', { clearProps: 'clipPath' });
    }
  }

  var heroImgs = $$('.hero__mirrors img');
  var ready = Promise.all([
    document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve(),
    Promise.all(heroImgs.map(function (img) { return img.decode ? img.decode().catch(function () {}) : Promise.resolve(); }))
  ]);
  var go = false;
  function begin() { if (go) return; go = true; start(); }
  ready.then(begin);
  setTimeout(begin, 3500);

  window.addEventListener('load', function () { setTimeout(function () { ScrollTrigger.refresh(); }, 200); });
  var rz;
  window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(fillMarquee, 250); });
})();
