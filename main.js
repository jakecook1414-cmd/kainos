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
      document.body.classList.remove('site-nav--menu-open');
    }

    if (toggle && menu) {
      function menuFocusables() {
        return Array.prototype.filter.call(
          menu.querySelectorAll('a[href], button:not([disabled])'),
          function (el) {
            return el.offsetWidth > 0 && el.offsetHeight > 0;
          }
        );
      }

      function focusFirstNavLink() {
        var items = menuFocusables();
        if (items.length) items[0].focus();
      }

      menu.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab' || !menu.classList.contains('is-open')) return;
        var items = menuFocusables();
        if (items.length === 0) return;
        var first = items[0];
        var last = items[items.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      });

      toggle.addEventListener('click', function () {
        var open = !menu.classList.contains('is-open');
        menu.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', open);
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.body.classList.toggle('site-nav--menu-open', open);
        if (open) {
          requestAnimationFrame(function () {
            requestAnimationFrame(focusFirstNavLink);
          });
        }
      });
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', closeMenu);
      });
      menu.querySelectorAll('button').forEach(function (btn) {
        btn.addEventListener('click', closeMenu);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('is-open')) {
          closeMenu();
          toggle.focus();
        }
      });

      if (window.matchMedia) {
        var mqWide = window.matchMedia('(min-width: 769px)');
        function onWideNav(e) {
          if (e.matches && menu.classList.contains('is-open')) closeMenu();
        }
        if (mqWide.addEventListener) mqWide.addEventListener('change', onWideNav);
        else mqWide.addListener(onWideNav);
      }
    }

    document.querySelectorAll('[data-scroll="waitlist"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        closeMenu();
        var target = document.getElementById('waitlist');
        if (target) {
          if (e && typeof e.preventDefault === 'function') e.preventDefault();
          target.scrollIntoView({
            behavior: prefersReduced ? 'auto' : 'smooth',
            block: 'start',
          });
        } else {
          if (e && typeof e.preventDefault === 'function') e.preventDefault();
          window.location.href = 'index.html?scrollTo=waitlist#waitlist';
        }
      });
    });

    function initKlaviyoGenerateLeadTracking() {
      var lastFire = 0;
      function fireGenerateLead(placement) {
        var now = Date.now();
        if (now - lastFire < 1200) return;
        lastFire = now;
        if (typeof window.gtag !== 'function') return;
        var label =
          placement === 'hero'
            ? 'Klaviyo Signup — Hero'
            : placement === 'footer'
              ? 'Klaviyo Signup — Footer'
              : 'Klaviyo Signup';
        window.gtag('event', 'generate_lead', {
          event_category: 'Waitlist',
          event_label: label,
          value: 1,
        });
      }

      document.addEventListener('klaviyoForms', function (e) {
        if (!e.detail) return;
        var type = String(e.detail.type || '');
        if (
          type === 'submit' ||
          type === 'subscribe' ||
          type === 'completed' ||
          type === 'success' ||
          type === 'redirectedToUrl' ||
          (e.detail.metaData &&
            String(e.detail.metaData.stepName || '').toLowerCase().indexOf('success') !== -1)
        ) {
          fireGenerateLead(null);
        }
      });

      function subtreeLooksLikeSuccess(root) {
        if (!root || !root.querySelectorAll) return false;
        var nodes = root.querySelectorAll(
          '[class*="success"], [class*="thank"], [class*="subscribed"], [data-testid*="success"], [aria-live="polite"]'
        );
        var i;
        for (i = 0; i < nodes.length; i++) {
          var t = (nodes[i].textContent || '').toLowerCase();
          if (
            /thank\s*you|you.re\s*(in|subscribed|on\s*the\s*list)|successfully\s*subscribed|check\s*your\s*email|you.re\s*all\s*set/.test(
              t
            )
          ) {
            return true;
          }
        }
        return false;
      }

      document.querySelectorAll('.klaviyo-form-V8hLfp').forEach(function (container) {
        var placement = container.getAttribute('data-waitlist-placement') || '';
        var obs = new MutationObserver(function () {
          if (subtreeLooksLikeSuccess(container)) fireGenerateLead(placement);
        });
        obs.observe(container, { childList: true, subtree: true, characterData: true });
      });
    }

    initKlaviyoGenerateLeadTracking();

    function initLandingScrollHints() {
      try {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('scrollTo') === 'waitlist';
        var h = window.location.hash === '#waitlist';
        if (!q && !h) return;
        var el = document.getElementById('waitlist');
        if (!el) return;
        var run = function () {
          el.scrollIntoView({
            behavior: prefersReduced ? 'auto' : 'smooth',
            block: 'start',
          });
        };
        requestAnimationFrame(function () {
          setTimeout(run, h ? 50 : 0);
        });
      } catch (e2) {}
    }

    initLandingScrollHints();

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

      var stars = [];
      var w = 0;
      var h = 0;
      var rafId = 0;
      var startTime = performance.now();

      function rand(min, max) {
        return min + Math.random() * (max - min);
      }

      function pushStars(count, layer, minR, maxR, minOp, maxOp, toneOrNull) {
        var i;
        var t;
        for (i = 0; i < count; i++) {
          t =
            toneOrNull === null
              ? Math.random() > 0.52
                ? 'cool'
                : 'cream'
              : toneOrNull;
          stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: rand(minR, maxR),
            base: rand(minOp, maxOp),
            phase: rand(0, Math.PI * 2),
            speed: rand(0.35, 1.05),
            layer: layer,
            tone: t,
            glow: layer === 2 && Math.random() < 0.35,
          });
        }
      }

      function layout() {
        resizeCanvasToSection(canvas, section);
        w = section.offsetWidth;
        h = section.offsetHeight;
        startTime = performance.now();
        stars = [];
        if (w < 2 || h < 2) return;

        var area = w * h;
        var nFar = Math.min(158, Math.max(80, Math.floor(area / 13500)));
        var nMid = Math.min(58, Math.max(24, Math.floor(area / 32000)));
        var nBright = Math.min(14, Math.max(5, Math.floor(area / 95000)));
        var maxStars = 228;
        if (nFar + nMid + nBright > maxStars) {
          var scale = maxStars / (nFar + nMid + nBright);
          nFar = Math.max(72, Math.floor(nFar * scale));
          nMid = Math.max(22, Math.floor(nMid * scale));
          nBright = Math.max(5, Math.floor(nBright * scale));
        }

        pushStars(nFar, 0, 0.28, 0.95, 0.12, 0.42, 'cool');
        pushStars(nMid, 1, 0.45, 1.35, 0.22, 0.62, null);
        pushStars(nBright, 2, 0.9, 2.15, 0.38, 0.92, 'cream');
      }

      function toneRgba(tone, alpha) {
        if (tone === 'cool') return 'rgba(188,210,242,' + alpha + ')';
        return 'rgba(245,240,232,' + alpha + ')';
      }

      function drawMilkyHaze() {
        var g = ctx.createLinearGradient(w * 0.08, h * 0.05, w * 0.92, h * 0.88);
        g.addColorStop(0, 'rgba(55, 75, 120, 0.07)');
        g.addColorStop(0.35, 'rgba(45, 62, 105, 0.05)');
        g.addColorStop(0.52, 'rgba(30, 45, 82, 0.06)');
        g.addColorStop(1, 'rgba(22, 33, 62, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);

        var wash = ctx.createRadialGradient(
          w * 0.42,
          h * 0.12,
          0,
          w * 0.5,
          h * 0.35,
          Math.max(w, h) * 0.72
        );
        wash.addColorStop(0, 'rgba(90, 108, 155, 0.045)');
        wash.addColorStop(0.5, 'rgba(60, 78, 120, 0.02)');
        wash.addColorStop(1, 'rgba(22, 33, 62, 0)');
        ctx.fillStyle = wash;
        ctx.fillRect(0, 0, w, h);
      }

      function twinkleFactor(star, tSeconds) {
        if (prefersCanvasReduced) return 1;
        var s1 = Math.sin(tSeconds * star.speed + star.phase);
        var s2 = Math.sin(tSeconds * star.speed * 0.47 + star.phase * 1.3);
        return 0.78 + 0.22 * (0.65 * s1 + 0.35 * s2);
      }

      function drawStar(star, tSeconds) {
        var tw = twinkleFactor(star, tSeconds);
        var alpha = Math.min(1, star.base * tw);

        if (star.glow && star.layer === 2) {
          ctx.shadowBlur = 6;
          ctx.shadowColor = toneRgba(star.tone, alpha * 0.45);
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = toneRgba(star.tone, alpha);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (star.layer === 2 && star.r > 1.15 && alpha > 0.45) {
          ctx.strokeStyle = toneRgba(star.tone, alpha * 0.22);
          ctx.lineWidth = 0.35;
          ctx.beginPath();
          ctx.moveTo(star.x - star.r * 2.2, star.y);
          ctx.lineTo(star.x + star.r * 2.2, star.y);
          ctx.moveTo(star.x, star.y - star.r * 2.2);
          ctx.lineTo(star.x, star.y + star.r * 2.2);
          ctx.stroke();
        }
      }

      function drawFrame() {
        var tSeconds = (performance.now() - startTime) / 1000;
        var L;
        var s;
        ctx.clearRect(0, 0, w, h);
        drawMilkyHaze();

        for (L = 0; L < 3; L++) {
          for (s = 0; s < stars.length; s++) {
            if (stars[s].layer === L) drawStar(stars[s], tSeconds);
          }
        }
      }

      function step() {
        if (window._kbHidden) {
          rafId = requestAnimationFrame(step);
          return;
        }
        drawFrame();
        rafId = requestAnimationFrame(step);
      }

      function drawStatic() {
        layout();
        drawFrame();
      }

      layout();

      var resizeDebounce = null;
      function scheduleHeroResize() {
        if (resizeDebounce) clearTimeout(resizeDebounce);
        resizeDebounce = setTimeout(function () {
          resizeDebounce = null;
          if (rafId) cancelAnimationFrame(rafId);
          layout();
          if (prefersCanvasReduced) drawFrame();
          else rafId = requestAnimationFrame(step);
        }, 140);
      }

      if (prefersCanvasReduced) {
        drawStatic();
        window.addEventListener('resize', scheduleHeroResize, { passive: true });
        return;
      }

      rafId = requestAnimationFrame(step);
      window.addEventListener('resize', scheduleHeroResize, { passive: true });
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
        if (window._kbHidden) { rafId = requestAnimationFrame(drawAnimated); return; }
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

/* Expose a global hidden flag; canvas step functions skip draws when true.
   Browsers already throttle background-tab RAF, but this stops the logic too. */
window._kbHidden = document.hidden;
document.addEventListener('visibilitychange', function () {
  window._kbHidden = document.hidden;
});
