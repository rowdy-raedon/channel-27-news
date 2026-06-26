/**
 * Channel 27 News & Entertainment
 */
(function () {
  'use strict';

  // ── Date ──
  var d = document.getElementById('topbar-date');
  if (d) {
    d.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // ── Navbar shadow ──
  var nav = document.querySelector('.main-navbar');
  function shadow() {
    if (!nav) return;
    nav.style.boxShadow = window.scrollY > 10 ? '0 2px 12px rgba(0,0,0,0.6)' : 'none';
  }
  window.addEventListener('scroll', shadow);
  shadow();

  // ── Smooth scroll ──
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id === '#') return;
    var t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    var o = nav ? nav.offsetHeight + 10 : 60;
    window.scrollTo({ top: t.getBoundingClientRect().top + pageYOffset - o, behavior: 'smooth' });
    // close offcanvas
    var oc = document.getElementById('mobileNav');
    if (oc && oc.classList.contains('show') && typeof bootstrap !== 'undefined') {
      var bs = bootstrap.Offcanvas.getInstance(oc);
      if (bs) bs.hide();
    }
  });

  // ── Ticker hover ──
  var tick = document.querySelector('.ticker-text');
  if (tick) {
    tick.addEventListener('mouseenter', function () { tick.style.animationPlayState = 'paused'; });
    tick.addEventListener('mouseleave', function () { tick.style.animationPlayState = 'running'; });
  }

  // ── Active nav ──
  var links = document.querySelectorAll('.main-navbar .nav-link[href^="#"]');
  var secs = [];
  links.forEach(function (l) {
    var el = document.querySelector(l.getAttribute('href'));
    if (el) secs.push({ l: l, el: el });
  });
  function active() {
    var pos = scrollY + 120, cur = '';
    secs.forEach(function (s) { if (pos >= s.el.offsetTop) cur = s.l.getAttribute('href'); });
    links.forEach(function (l) {
      l.classList.remove('active');
      if (l.getAttribute('href') === cur) l.classList.add('active');
    });
  }
  window.addEventListener('scroll', active);
  active();

  // ── FB SDK re-parse ──
  window.fbAsyncInit = function () {
    if (typeof FB !== 'undefined') {
      FB.init({ xfbml: true, version: 'v22.0' });
    }
  };

})();
