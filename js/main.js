/**
 * Channel 27 News & Entertainment
 * Vanilla JS — no frameworks
 */
(function () {
  'use strict';

  // ── Auto Date ──
  var dateEl = document.getElementById('topbar-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // ── Navbar Shadow on Scroll ──
  var navbar = document.querySelector('.main-navbar');
  function navShadow() {
    if (!navbar) return;
    navbar.style.boxShadow = window.scrollY > 10
      ? '0 2px 12px rgba(0,0,0,0.6)'
      : 'none';
  }
  window.addEventListener('scroll', navShadow);
  navShadow();

  // ── Smooth Scroll (offset for sticky navbar) ──
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href');
    if (id === '#') return;
    var target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    var offset = navbar ? navbar.offsetHeight + 10 : 60;
    var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: top, behavior: 'smooth' });

    // Close mobile offcanvas
    var offcanvas = document.getElementById('mobileNav');
    if (offcanvas && offcanvas.classList.contains('show')) {
      var bs = bootstrap.Offcanvas.getInstance(offcanvas);
      if (bs) bs.hide();
    }
  });

  // ── Ticker Pause on Hover ──
  var ticker = document.querySelector('.ticker-text');
  if (ticker) {
    ticker.addEventListener('mouseenter', function () { ticker.style.animationPlayState = 'paused'; });
    ticker.addEventListener('mouseleave', function () { ticker.style.animationPlayState = 'running'; });
  }

  // ── Active Nav Highlight ──
  var navLinks = document.querySelectorAll('.main-navbar .nav-link[href^="#"]');
  var sections = [];
  navLinks.forEach(function (l) {
    var el = document.querySelector(l.getAttribute('href'));
    if (el) sections.push({ link: l, el: el });
  });

  function updateActive() {
    var scrollPos = window.scrollY + 120;
    var current = '';
    sections.forEach(function (s) {
      if (scrollPos >= s.el.offsetTop) current = s.link.getAttribute('href');
    });
    navLinks.forEach(function (l) {
      l.classList.remove('active');
      if (l.getAttribute('href') === current) l.classList.add('active');
    });
  }
  window.addEventListener('scroll', updateActive);
  updateActive();

})();
