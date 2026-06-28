/* ============================================================================
   CHANNEL 27 — components.js
   Reusable building blocks (icons, header, footer) injected on every page.
   Edit once here; it updates everywhere.
   ========================================================================== */
(function () {
  const CFG = window.C27_CONFIG;
  const FB = CFG.facebook;

  /* ---- SVG icon set (inline, no icon-font dependency) ---- */
  const ICON = {
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.14v13.72c0 .83.91 1.34 1.62.9l10.74-6.86a1.06 1.06 0 000-1.8L9.62 4.24A1.06 1.06 0 008 5.14z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3 6 9 6 9-6"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="m16 9 5.5-3v12L16 15z"/></svg>',
    photo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="m21 16-5-5L5 20"/></svg>',
    live: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M16.5 7.5a6 6 0 010 9M7.5 16.5a6 6 0 010-9M19.5 4.5a10 10 0 010 15M4.5 19.5a10 10 0 010-15"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
  };
  window.C27_ICON = ICON;

  /* Mark the active nav item based on the current page */
  const PAGE = document.body.dataset.page || "";

  const navItems = [
    { id: "home", label: "Home", href: "index.html" },
    { id: "about", label: "About", href: "about.html" },
    { id: "contact", label: "Contact", href: "contact.html" },
  ];

  const brandLockup = `
    <a class="brand" href="index.html" aria-label="${CFG.siteName} — home">
      <img src="assets/logo-sm.png" alt="Channel 27 logo" width="120" height="92">
      <span class="wordmark">
        <span class="n">NEWS</span>
        <span class="e">&amp; Entertainment</span>
      </span>
    </a>`;

  const watchLiveBtn = (cls) => `
    <a class="btn btn-gold-outline ${cls}" href="${FB.watchLiveUrl}" target="_blank" rel="noopener">
      <span class="live-dot" aria-hidden="true"></span>${ICON.play}<span>Watch Live</span>
    </a>`;

  /* ---- HEADER ---- */
  function header() {
    const links = navItems.map(n =>
      `<a href="${n.href}" class="${PAGE === n.id ? "active" : ""}"${PAGE === n.id ? ' aria-current="page"' : ""}>${n.label}</a>`
    ).join("");

    const mLinks = navItems.map(n =>
      `<a href="${n.href}" class="${PAGE === n.id ? "active" : ""}"${PAGE === n.id ? ' aria-current="page"' : ""}>${n.label}</a>`
    ).join("");

    return `
    <header class="site-header">
      <div class="container header-inner">
        ${brandLockup}
        <nav class="nav" aria-label="Primary">${links}</nav>
        <div class="header-actions">
          ${watchLiveBtn("watch-live-desktop")}
          <a class="icon-fb" href="${FB.fanPageUrl}" target="_blank" rel="noopener" aria-label="Channel 27 on Facebook">${ICON.facebook}</a>
          <button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <div class="mobile-menu" id="mobileMenu">
        <nav aria-label="Mobile">${mLinks}</nav>
        <div class="mm-actions">
          ${watchLiveBtn("")}
          <a class="btn btn-fb" href="${FB.fanPageUrl}" target="_blank" rel="noopener">${ICON.facebook}<span>Facebook Page</span></a>
        </div>
      </div>
    </header>`;
  }

  /* ---- FOOTER ---- */
  function footer() {
    const year = new Date().getFullYear();
    return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-top">
          <div class="footer-brand">
            ${brandLockup}
            <p>Channel 27 News &amp; Entertainment — bringing the community reliable news, engaging stories, and original programming, straight from our Facebook page.</p>
            <div class="fb-row">
              <a class="icon-fb" href="${FB.fanPageUrl}" target="_blank" rel="noopener" aria-label="Channel 27 on Facebook">${ICON.facebook}</a>
            </div>
          </div>
          <div class="footer-col">
            <h4>Explore</h4>
            <a href="index.html">Home</a>
            <a href="about.html">About</a>
            <a href="posts.html">All Posts</a>
            <a href="contact.html">Contact</a>
          </div>
          <div class="footer-col">
            <h4>More</h4>
            <a href="${FB.watchLiveUrl}" target="_blank" rel="noopener">Watch Live</a>
            <a href="${FB.fanPageUrl}" target="_blank" rel="noopener">Facebook Page</a>
            <a href="privacy.html">Privacy Policy</a>
            <a href="terms.html">Terms of Use</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; ${year} Channel 27 (Tyson Media). All Rights Reserved.</p>
          <div class="legal-mini">
            <a href="privacy.html">Privacy</a>
            <a href="terms.html">Terms</a>
            <a href="contact.html">Contact</a>
          </div>
        </div>
      </div>
    </footer>`;
  }

  /* ---- Inject ---- */
  function mount(id, html) {
    const el = document.getElementById(id);
    if (el) el.outerHTML = html;
  }
  document.addEventListener("DOMContentLoaded", function () {
    mount("site-header", header());
    mount("site-footer", footer());

    /* Mobile menu toggle */
    const burger = document.getElementById("hamburger");
    const menu = document.getElementById("mobileMenu");
    if (burger && menu) {
      const close = () => { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Open menu"); };
      burger.addEventListener("click", () => {
        const open = menu.classList.toggle("open");
        burger.setAttribute("aria-expanded", String(open));
        burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      });
      menu.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
      document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
      window.addEventListener("resize", () => { if (window.innerWidth > 900) close(); });
    }
  });
})();
