/**
 * Channel 27 News & Entertainment — Main JavaScript
 * Vanilla JS only — no jQuery, no frameworks
 */

(function () {
  'use strict';

  // ── Auto Date ──
  function setDate() {
    var el = document.getElementById('topbar-date');
    if (!el) return;
    el.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // ── Navbar Scroll Shadow ──
  function handleNavbarScroll() {
    var navbar = document.querySelector('.main-navbar');
    if (!navbar) return;
    if (window.scrollY > 10) {
      navbar.style.boxShadow = '0 2px 12px rgba(0,0,0,0.5)';
    } else {
      navbar.style.boxShadow = 'none';
    }
  }

  // ── Smooth Scroll for Anchor Links (offset for sticky navbar) ──
  function handleAnchorClicks() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var targetId = link.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      var navbarHeight = document.querySelector('.main-navbar')
        ? document.querySelector('.main-navbar').offsetHeight
        : 56;
      var top = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 10;
      window.scrollTo({ top: top, behavior: 'smooth' });

      // Close mobile offcanvas if open
      var offcanvas = document.getElementById('mobileNav');
      if (offcanvas && offcanvas.classList.contains('show')) {
        var bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
        if (bsOffcanvas) bsOffcanvas.hide();
      }
    });
  }

  // ── Active Nav Link Highlight on Scroll ──
  function updateActiveNavLink() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.main-navbar .nav-link[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    var scrollPos = window.scrollY + 100;
    var currentId = '';

    sections.forEach(function (section) {
      var top = section.offsetTop - 120;
      if (scrollPos >= top) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentId) {
        link.classList.add('active');
      }
    });
  }

  // ── Ticker Pause on Hover ──
  function setupTickerPause() {
    var tickerText = document.querySelector('.ticker-text');
    if (!tickerText) return;
    tickerText.addEventListener('mouseenter', function () {
      tickerText.style.animationPlayState = 'paused';
    });
    tickerText.addEventListener('mouseleave', function () {
      tickerText.style.animationPlayState = 'running';
    });
  }

  // ── Init ──
  function init() {
    setDate();
    setupTickerPause();

    window.addEventListener('scroll', function () {
      handleNavbarScroll();
      updateActiveNavLink();
    });

    handleNavbarScroll();
    handleAnchorClicks();
  }

  // Bootstrap must be loaded first — wait for it
  if (typeof bootstrap !== 'undefined') {
    init();
  } else {
    // If Bootstrap loads after us, defer init
    window.addEventListener('load', function () {
      if (typeof bootstrap !== 'undefined') {
        init();
      } else {
        // Fallback: init what we can without Bootstrap
        setDate();
        setupTickerPause();
        window.addEventListener('scroll', handleNavbarScroll);
        handleNavbarScroll();
        handleAnchorClicks();
      }
    });
  }

})();
