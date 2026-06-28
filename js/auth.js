/* ============================================================================
   CHANNEL 27 — auth.js
   Facebook Page OAuth login state manager.
   - Checks auth status on page load via /api/auth/status
   - Renders "Connect Page" button or "Connected as X" badge in #auth-slot
   - Exposes window.C27_AUTH = { login, logout, onAuthChange, getStatus }
   - Listener system so main.js can react to auth changes
   ========================================================================== */
(function () {
  const CFG = window.C27_CONFIG;
  const AUTH = CFG.auth || {};
  const API = AUTH.apiBase || "";
  const ICON = window.C27_ICON;

  /* ---- SVG icons (inline to avoid icon-font dependency) ---- */
  const SVG = {
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/></svg>',
    disconnect: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  };

  /* ---- State ---- */
  var state = {
    authenticated: false,
    pageName: "",
    pageId: "",
    loading: true,
    error: null,
  };

  var listeners = [];

  function notify() {
    var snap = Object.assign({}, state);
    listeners.forEach(function (fn) { fn(snap); });
  }

  /* ---- API calls ---- */
  function checkStatus() {
    fetch(API + "/api/auth/status", { credentials: "include" })
      .then(function (res) {
        if (!res.ok) throw new Error("Status check failed");
        return res.json();
      })
      .then(function (data) {
        state.authenticated = !!data.authenticated;
        state.pageName = data.pageName || "";
        state.pageId = data.pageId || "";
        state.loading = false;
        state.error = null;
        renderAuthSlot();
        notify();
      })
      .catch(function (err) {
        state.authenticated = false;
        state.loading = false;
        state.error = err.message;
        renderAuthSlot();
        notify();
      });
  }

  /* ---- Public API ---- */
  function login() {
    window.location.href = API + "/api/auth/login";
  }

  function logout() {
    window.location.href = API + "/api/auth/logout";
  }

  function onAuthChange(fn) {
    listeners.push(fn);
    // If already loaded, fire immediately
    if (!state.loading) {
      fn(Object.assign({}, state));
    }
  }

  function getStatus() {
    return Object.assign({}, state);
  }

  window.C27_AUTH = {
    login: login,
    logout: logout,
    onAuthChange: onAuthChange,
    getStatus: getStatus,
  };

  /* ---- Render ---- */
  function renderAuthSlot() {
    var slots = document.querySelectorAll("#auth-slot, #auth-slot-mobile");
    if (!slots.length) return;

    var authenticatedHTML;
    var unauthenticatedHTML;

    if (!AUTH.appId || !AUTH.showConnectButton) {
      authenticatedHTML = "";
      unauthenticatedHTML = "";
    } else if (state.loading) {
      authenticatedHTML = unauthenticatedHTML =
        '<span class="auth-skel" aria-busy="true" style="width:130px;height:34px;border-radius:999px;display:inline-block;background:var(--muted-3);animation:pulse 1.5s ease-in-out infinite"></span>';
    } else if (state.authenticated) {
      var badge =
        '<span class="auth-badge" title="Connected Facebook Page">' +
        SVG.facebook +
        '<span class="auth-badge-name">' +
        esc(state.pageName) +
        "</span>" +
        "</span>" +
        '<button class="auth-btn-disconnect" onclick="C27_AUTH.logout()" title="Disconnect Facebook Page" aria-label="Disconnect Facebook Page">' +
        SVG.disconnect +
        "</button>";
      authenticatedHTML = badge;
      unauthenticatedHTML = "";
    } else {
      authenticatedHTML = "";
      unauthenticatedHTML =
        '<button class="auth-btn-connect" onclick="C27_AUTH.login()">' +
        SVG.facebook +
        "<span>Connect Page</span>" +
        "</button>";
    }

    slots.forEach(function (slot) {
      slot.innerHTML = state.authenticated ? authenticatedHTML : unauthenticatedHTML;
    });
  }

  /* ---- Utilities ---- */
  function esc(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ---- Boot ---- */
  document.addEventListener("DOMContentLoaded", function () {
    checkStatus();
  });
})();
