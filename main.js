(function () {
  'use strict';

  var nav = document.getElementById('site-nav');
  function onNavScroll() {
    if (!nav) return;
    if (window.scrollY > 16) nav.classList.add('is-scrolled');
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
  }

})();
