(function () {
  'use strict';

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    var nav = document.getElementById('site-nav');

    function onNavScroll() {
      if (!nav) return;
      if (window.scrollY > 60) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    }
    onNavScroll();
    window.addEventListener('scroll', onNavScroll, { passive: true });

    var prefersReduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var animated = document.querySelectorAll('[data-animate]');
    if (prefersReduced) {
      animated.forEach(function (el) {
        el.classList.add('is-visible');
      });
    } else if (typeof IntersectionObserver !== 'undefined') {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { root: null, rootMargin: '0px 0px -48px 0px', threshold: 0.08 }
      );
      animated.forEach(function (el) {
        io.observe(el);
      });
    } else {
      animated.forEach(function (el) {
        el.classList.add('is-visible');
      });
    }

    var toggle = document.querySelector('.nav-toggle');
    var menu = document.getElementById('nav-menu');

    function closeMenu() {
      if (!menu || !toggle) return;
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        var open = !menu.classList.contains('is-open');
        menu.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', open);
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      });
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', closeMenu);
      });
      menu.querySelectorAll('button').forEach(function (btn) {
        btn.addEventListener('click', closeMenu);
      });
    }

    document.querySelectorAll('[data-scroll="waitlist"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        closeMenu();
        var target = document.getElementById('waitlist');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.location.href = 'index.html#waitlist';
        }
      });
    });

    /* —— Home: IntersectionObserver animations (stats, cards, FAQ, CTA) + ingredient tap —— */
    var prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setFinalStat(el) {
      var t = parseFloat(el.getAttribute('data-target'), 10);
      var fmt = el.getAttribute('data-format');
      if (isNaN(t)) return;
      if (fmt === 'percent') el.textContent = Math.round(t) + '%';
      else el.textContent = String(Math.round(t));
    }

    function animateStat(el) {
      var target = parseFloat(el.getAttribute('data-target'), 10);
      var fmt = el.getAttribute('data-format');
      if (isNaN(target)) return;
      if (fmt !== 'percent' && target === 0) {
        el.textContent = '0';
        return;
      }
      var duration = 1500;
      var start = performance.now();
      function easeOutQuad(p) {
        return 1 - (1 - p) * (1 - p);
      }
      function frame(now) {
        var prog = Math.min(1, (now - start) / duration);
        var e = easeOutQuad(prog);
        var val = target * e;
        if (fmt === 'percent') el.textContent = Math.round(val) + '%';
        else el.textContent = String(Math.round(val));
        if (prog < 1) requestAnimationFrame(frame);
        else setFinalStat(el);
      }
      requestAnimationFrame(frame);
    }

    function initHomeScrollAnimations() {
      if (typeof IntersectionObserver === 'undefined') {
        document.querySelectorAll('.js-io-home-card').forEach(function (el) {
          el.classList.add('is-io-visible');
        });
        document.querySelectorAll('.js-io-disclosure').forEach(function (el) {
          el.classList.add('is-io-visible');
        });
        var ctaIn = document.querySelector('.js-io-cta-inner');
        if (ctaIn) ctaIn.classList.add('is-io-visible');
        document.querySelectorAll('.js-stat-num').forEach(setFinalStat);
        return;
      }

      var statsBar = document.querySelector('.stats-bar');
      if (statsBar) {
        var statsDone = false;
        var statsIo = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting || statsDone) return;
              statsDone = true;
              statsIo.disconnect();
              var nums = document.querySelectorAll('.js-stat-num');
              if (prefersReducedMotion) {
                nums.forEach(setFinalStat);
              } else {
                nums.forEach(animateStat);
              }
            });
          },
          { threshold: 0.15, rootMargin: '0px 0px -5% 0px' }
        );
        statsIo.observe(statsBar);
      }

      var homeDifferent = document.querySelector('.home-different');
      if (homeDifferent) {
        var homeIo = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return;
              var cards = entry.target.querySelectorAll('.js-io-home-card');
              cards.forEach(function (el, idx) {
                el.style.setProperty('--io-stagger', String(idx));
                if (prefersReducedMotion) el.classList.add('is-io-visible');
              });
              if (!prefersReducedMotion) {
                requestAnimationFrame(function () {
                  cards.forEach(function (el) {
                    el.classList.add('is-io-visible');
                  });
                });
              }
              homeIo.disconnect();
            });
          },
          { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
        );
        homeIo.observe(homeDifferent);
      }

      var discIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-io-visible');
            discIo.unobserve(entry.target);
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -5% 0px' }
      );
      document.querySelectorAll('.js-io-disclosure').forEach(function (el) {
        if (prefersReducedMotion) el.classList.add('is-io-visible');
        else discIo.observe(el);
      });

      var ctaBand = document.querySelector('.js-io-cta-band');
      var ctaInner = document.querySelector('.js-io-cta-inner');
      if (ctaBand && ctaInner) {
        if (prefersReducedMotion) {
          ctaInner.classList.add('is-io-visible');
        } else {
          var ctaIo = new IntersectionObserver(
            function (entries) {
              entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                ctaInner.classList.add('is-io-visible');
                ctaIo.disconnect();
              });
            },
            { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
          );
          ctaIo.observe(ctaBand);
        }
      }
    }

    initHomeScrollAnimations();

    document.querySelectorAll('.ingredient-card').forEach(function (card) {
      function isFinePointerHover() {
        return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      }
      card.addEventListener('click', function () {
        if (isFinePointerHover()) return;
        card.classList.toggle('is-flipped');
      });
      card.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        if (isFinePointerHover()) return;
        e.preventDefault();
        card.classList.toggle('is-flipped');
      });
    });

    /* In-page #waitlist links with data-scroll: avoid double navigation */
    document.querySelectorAll('a[data-scroll="waitlist"][href^="#"]').forEach(function (a) {
      a.addEventListener(
        'click',
        function (e) {
          e.preventDefault();
        },
        true
      );
    });

    /* —— Hero particle canvas, dot-grid canvases, nav scroll spy (index) —— */
    var prefersCanvasReduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resizeCanvasToSection(canvas, section) {
      if (!canvas || !section) return;
      var dpr = window.devicePixelRatio || 1;
      var w = section.offsetWidth;
      var h = section.offsetHeight;
      if (w === 0 || h === 0) return;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      var ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initHeroCanvas() {
      var canvas = document.getElementById('hero-canvas');
      var section = document.getElementById('waitlist');
      if (!canvas || !section) return;
      var ctx = canvas.getContext('2d');
      if (!ctx) return;

      var particles = [];
      var i;
      var w = 0;
      var h = 0;
      var rafId = 0;

      function rand(min, max) {
        return min + Math.random() * (max - min);
      }

      function layout() {
        resizeCanvasToSection(canvas, section);
        w = section.offsetWidth;
        h = section.offsetHeight;
        particles = [];
        for (i = 0; i < 60; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: rand(0.5, 2.5),
            vx: rand(-0.15, 0.15),
            vy: rand(-0.15, 0.15),
            opacity: rand(0.2, 0.7),
          });
        }
      }

      function wrap(p) {
        if (p.x < 0) p.x += w;
        else if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h;
        else if (p.y > h) p.y -= h;
      }

      function drawFrame() {
        var a;
        var b;
        var dx;
        var dy;
        var dist;
        var alpha;
        ctx.clearRect(0, 0, w, h);
        for (a = 0; a < particles.length; a++) {
          for (b = a + 1; b < particles.length; b++) {
            dx = particles[a].x - particles[b].x;
            dy = particles[a].y - particles[b].y;
            dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80 && dist > 0) {
              alpha = (1 - dist / 80) * 0.15;
              ctx.strokeStyle = 'rgba(245,240,232,' + alpha + ')';
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(particles[a].x, particles[a].y);
              ctx.lineTo(particles[b].x, particles[b].y);
              ctx.stroke();
            }
          }
        }
        for (a = 0; a < particles.length; a++) {
          ctx.fillStyle = 'rgba(245,240,232,' + particles[a].opacity + ')';
          ctx.beginPath();
          ctx.arc(particles[a].x, particles[a].y, particles[a].r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      function step() {
        var p;
        for (p = 0; p < particles.length; p++) {
          particles[p].x += particles[p].vx;
          particles[p].y += particles[p].vy;
          wrap(particles[p]);
        }
        drawFrame();
        rafId = requestAnimationFrame(step);
      }

      function drawStatic() {
        layout();
        drawFrame();
      }

      layout();

      if (prefersCanvasReduced) {
        drawStatic();
        window.addEventListener(
          'resize',
          function () {
            layout();
            drawFrame();
          },
          { passive: true }
        );
        return;
      }

      rafId = requestAnimationFrame(step);
      window.addEventListener(
        'resize',
        function () {
          if (rafId) cancelAnimationFrame(rafId);
          layout();
          rafId = requestAnimationFrame(step);
        },
        { passive: true }
      );
    }

    function initDotCanvas(id) {
      var canvas = document.getElementById(id);
      if (!canvas) return;
      var section = canvas.parentElement;
      if (!section) return;
      var ctx = canvas.getContext('2d');
      if (!ctx) return;

      var time = 0;
      var w = 0;
      var h = 0;
      var rafId = 0;

      function layout() {
        resizeCanvasToSection(canvas, section);
        w = section.offsetWidth;
        h = section.offsetHeight;
      }

      function drawStaticGrid() {
        var gx;
        var gy;
        var opacity = 0.08;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(245,240,232,' + opacity + ')';
        for (gx = 15; gx < w; gx += 30) {
          for (gy = 15; gy < h; gy += 30) {
            ctx.beginPath();
            ctx.arc(gx, gy, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      function drawAnimated() {
        var gx;
        var gy;
        var waveX;
        var d;
        var pulse;
        var opacity;
        time += 0.014;
        waveX = (time * 42) % (w + 140) - 70;
        ctx.clearRect(0, 0, w, h);
        for (gx = 15; gx < w; gx += 30) {
          for (gy = 15; gy < h; gy += 30) {
            d = Math.abs(gx - waveX);
            pulse = Math.exp(-(d * d) / (2 * 75 * 75));
            opacity = 0.04 + pulse * 0.14;
            ctx.fillStyle = 'rgba(245,240,232,' + opacity + ')';
            ctx.beginPath();
            ctx.arc(gx, gy, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        rafId = requestAnimationFrame(drawAnimated);
      }

      layout();

      if (prefersCanvasReduced) {
        drawStaticGrid();
        window.addEventListener(
          'resize',
          function () {
            layout();
            drawStaticGrid();
          },
          { passive: true }
        );
        return;
      }

      rafId = requestAnimationFrame(drawAnimated);
      window.addEventListener(
        'resize',
        function () {
          if (rafId) cancelAnimationFrame(rafId);
          layout();
          rafId = requestAnimationFrame(drawAnimated);
        },
        { passive: true }
      );
    }

    function initNavScrollSpy() {
      var sections = document.querySelectorAll('[data-nav-target]');
      if (!sections.length || typeof IntersectionObserver === 'undefined') return;

      var ratios = new Map();
      var thresholds = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

      function applyActive(target) {
        document.querySelectorAll('[data-nav-match]').forEach(function (el) {
          el.classList.toggle('active', el.getAttribute('data-nav-match') === target);
        });
      }

      function pickActive() {
        var bestT = null;
        var bestR = 0;
        sections.forEach(function (sec) {
          var r = ratios.get(sec) || 0;
          var t = sec.getAttribute('data-nav-target');
          if (r >= 0.4 && r > bestR) {
            bestR = r;
            bestT = t;
          }
        });
        applyActive(bestT);
      }

      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            ratios.set(entry.target, entry.intersectionRatio);
          });
          pickActive();
        },
        { root: null, rootMargin: '0px', threshold: thresholds }
      );

      sections.forEach(function (sec) {
        io.observe(sec);
      });
    }

    initHeroCanvas();
    initDotCanvas('science-canvas');
    initDotCanvas('cta-canvas');
    initNavScrollSpy();
  });
})();

const progressBar = document.getElementById('scroll-progress');
if (progressBar) {
  window.addEventListener(
    'scroll',
    () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct =
        scrollable <= 0 ? 0 : Math.min(100, (window.scrollY / scrollable) * 100);
      progressBar.style.width = pct + '%';
    },
    { passive: true }
  );
}
