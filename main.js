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
  });
})();
