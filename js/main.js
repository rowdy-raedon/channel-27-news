/* ============================================================================
   CHANNEL 27 — main.js
   Facebook integration engine + page behaviours.
   - Lazy-loads the Facebook SDK only when a feed scrolls into view.
   - Renders a card grid of real Facebook Embedded Posts when permalinks are
     configured (js/config.js → posts[]).
   - Falls back to the live Facebook Page Plugin (real timeline) when none are
     configured, so the feed is never empty and needs zero maintenance.
   - Provides loading (skeleton), empty, and error states throughout.
   ========================================================================== */
(function () {
  const CFG = window.C27_CONFIG;
  const FB_CFG = CFG.facebook;
  const ICON = window.C27_ICON;

  /* ------------------------------------------------------------------ *
   * Facebook SDK loader (lazy, once)
   * ------------------------------------------------------------------ */
  const SDK = {
    state: "idle", // idle | loading | ready | failed
    waiters: [],
    load() {
      if (this.state === "ready") return Promise.resolve(true);
      if (this.state === "failed") return Promise.resolve(false);
      if (this.state === "loading") return new Promise(res => this.waiters.push(res));
      this.state = "loading";

      if (!document.getElementById("fb-root")) {
        const root = document.createElement("div");
        root.id = "fb-root";
        document.body.prepend(root);
      }

      return new Promise(resolve => {
        this.waiters.push(resolve);
        const done = ok => {
          this.state = ok ? "ready" : "failed";
          this.waiters.forEach(w => w(ok));
          this.waiters = [];
        };

        const s = document.createElement("script");
        s.async = true; s.defer = true; s.crossOrigin = "anonymous";
        s.src = `https://connect.facebook.net/${FB_CFG.locale}/sdk.js#xfbml=1&version=${FB_CFG.graphVersion}`;
        s.onload = () => done(true);
        s.onerror = () => done(false);
        document.body.appendChild(s);

        // Safety timeout — if FB is blocked, fail gracefully.
        setTimeout(() => { if (this.state === "loading") done(false); }, 8000);
      });
    },
    parse(el) {
      if (window.FB && window.FB.XFBML) window.FB.XFBML.parse(el);
    },
  };

  /* ------------------------------------------------------------------ *
   * Markup helpers
   * ------------------------------------------------------------------ */
  function skeletonCard() {
    return `
      <article class="post-card skeleton" role="status" aria-label="Loading post">
        <span class="sk-badge">${ICON.facebook} Facebook</span>
        <div class="sk-head">
          <div class="sk sk-avatar"></div>
          <div style="flex:1">
            <div class="sk sk-line w60" style="margin-bottom:8px"></div>
            <div class="sk sk-line w40"></div>
          </div>
        </div>
        <div class="sk sk-line w90" style="margin-bottom:8px"></div>
        <div class="sk sk-line w60" style="margin-bottom:8px"></div>
        <div class="sk sk-media"></div>
        <div class="sk-foot">
          <div class="sk sk-pill"></div><div class="sk sk-pill"></div><div class="sk sk-pill"></div>
        </div>
      </article>`;
  }

  function embedCard(post) {
    const href = encodeURI(post.href);
    return `
      <article class="post-card" data-type="${post.type || "status"}">
        <div class="fb-frame">
          <div class="fb-post" data-href="${href}" data-width="500" data-lazy="true"></div>
        </div>
        <div class="card-skeleton">${skeletonInner()}</div>
        <a class="card-fallback" href="${href}" target="_blank" rel="noopener" hidden>
          ${ICON.facebook}<span>View this post on Facebook</span>${ICON.arrow}
        </a>
      </article>`;
  }

  function skeletonInner() {
    return `
      <div class="skeleton" style="position:absolute;inset:0">
        <span class="sk-badge">${ICON.facebook} Facebook</span>
        <div class="sk-head"><div class="sk sk-avatar"></div>
          <div style="flex:1"><div class="sk sk-line w60" style="margin-bottom:8px"></div><div class="sk sk-line w40"></div></div></div>
        <div class="sk sk-line w90" style="margin-bottom:8px"></div>
        <div class="sk sk-media"></div>
        <div class="sk-foot"><div class="sk sk-pill"></div><div class="sk sk-pill"></div><div class="sk sk-pill"></div></div>
      </div>`;
  }

  function livePagePlugin(height) {
    return `
      <div class="fb-live-frame">
        <div class="fb-live-label"><span class="live-dot" aria-hidden="true"></span>Live from our Facebook page</div>
        <div class="fb-page"
             data-href="${FB_CFG.fanPageUrl}"
             data-tabs="timeline"
             data-width="500"
             data-height="${height || 720}"
             data-small-header="false"
             data-adapt-container-width="true"
             data-hide-cover="false"
             data-show-facepile="true"></div>
        <noscript><a href="${FB_CFG.fanPageUrl}">See our Facebook timeline</a></noscript>
      </div>`;
  }

  function ownerHint() {
    return `
      <div class="owner-hint" data-owner-hint>
        ${ICON.info}
        <div>Showing the live Facebook timeline. To feature specific posts as cards
        (with filters), add their links to <code>posts</code> in <code>js/config.js</code>.</div>
      </div>`;
  }

  function errorState() {
    return `
      <div class="feed-state">
        <div class="ico">${ICON.alert}</div>
        <h3>Couldn't load the Facebook feed</h3>
        <p>The feed may be blocked by a browser extension or network. You can still see everything on our Facebook page.</p>
        <a class="btn btn-fb" href="${FB_CFG.fanPageUrl}" target="_blank" rel="noopener">${ICON.facebook}<span>Open Facebook Page</span></a>
      </div>`;
  }

  function emptyState(filterLabel) {
    return `
      <div class="feed-state">
        <div class="ico">${ICON.facebook}</div>
        <h3>No ${filterLabel} to show yet</h3>
        <p>Check back soon, or head over to our Facebook page for the latest.</p>
        <a class="btn btn-gold-outline" href="${FB_CFG.fanPageUrl}" target="_blank" rel="noopener">${ICON.facebook}<span>Visit Facebook Page</span></a>
      </div>`;
  }

  /* ------------------------------------------------------------------ *
   * Reveal real embeds: hide each card's skeleton when its iframe lands;
   * show a fallback link if it never renders.
   * ------------------------------------------------------------------ */
  function watchCard(card) {
    const skel = card.querySelector(".card-skeleton");
    const fallback = card.querySelector(".card-fallback");
    const host = card.querySelector(".fb-post");
    if (!host) return;

    let settled = false;
    const reveal = () => {
      if (settled) return; settled = true;
      if (skel) { skel.style.opacity = "0"; setTimeout(() => skel.remove(), 350); }
    };
    const fail = () => {
      if (settled) return; settled = true;
      if (skel) skel.remove();
      if (fallback) fallback.hidden = false;
      card.classList.add("embed-failed");
    };

    const obs = new MutationObserver(() => {
      if (host.querySelector("iframe")) { reveal(); obs.disconnect(); }
    });
    obs.observe(host, { childList: true, subtree: true });

    // Fallback if nothing rendered in time.
    setTimeout(() => { if (!settled) { host.querySelector("iframe") ? reveal() : fail(); obs.disconnect(); } }, 7000);
  }

  /* ------------------------------------------------------------------ *
   * Feed renderer
   * ------------------------------------------------------------------ */
  const PAGE_SIZE = 8;

  function buildFeed(host, opts) {
    opts = opts || {};

    // Check if user is authenticated — use dynamic API feed
    if (window.C27_AUTH) {
      const authState = window.C27_AUTH.getStatus();
      if (authState.authenticated && authState.pageId) {
        return buildDynamicFeed(host, opts);
      }
    }

    // If facebook page URL is configured, try public API mode
    const fanPageUrl = CFG.facebook && CFG.facebook.fanPageUrl;
    if (fanPageUrl && (CFG.auth && CFG.auth.appId)) {
      return buildDynamicFeed(host, Object.assign({}, opts, { pageUrl: fanPageUrl }));
    }

    const cols = opts.cols || 4;
    const filter = opts.filter || "all";
    const limit = opts.limit || null;

    let posts = (CFG.posts || []).slice();
    if (filter !== "all") {
      posts = posts.filter(p => (p.type || "status") === filter ||
        (filter === "video" && p.type === "live"));
    }

    // No configured posts → live page plugin (the real, zero-maintenance feed)
    if ((CFG.posts || []).length === 0) {
      host.classList.remove("feed-grid", "cols-3");
      host.innerHTML = (opts.showHint ? ownerHint() : "") + livePagePlugin(opts.pluginHeight);
      const filterBar = document.querySelector("[data-filterbar]");
      if (filterBar) filterBar.style.display = "none";
      const sortSel = document.querySelector("[data-sort]");
      if (sortSel) sortSel.closest(".select-wrap").style.display = "none";
      loadAndParse(host);
      return;
    }

    // Configured posts → real embedded-post card grid
    host.classList.add("feed-grid");
    host.classList.toggle("cols-3", cols === 3);

    if (posts.length === 0) { host.innerHTML = emptyState(labelFor(filter)); return; }

    const slice = limit ? posts.slice(0, limit) : posts.slice(0, host._shown || PAGE_SIZE);
    host._all = posts;
    host._shown = slice.length;
    host.innerHTML = slice.map(embedCard).join("");

    loadAndParse(host, () => host.querySelectorAll(".post-card").forEach(watchCard));
    updateLoadMore(host, limit);
  }

  /* ---- Dynamic feed: fetch posts from our API (authenticated or public) ---- */
  async function buildDynamicFeed(host, opts) {
    const cols = opts.cols || 4;
    const filter = opts.filter || "all";
    const limit = opts.limit || 8;

    // Show skeleton placeholders immediately
    host.classList.add("feed-grid");
    host.classList.toggle("cols-3", cols === 3);
    const skelCount = Math.min(limit, 4);
    host.innerHTML = Array.from({ length: skelCount }, skeletonCard).join("");

    try {
      const API_BASE = (CFG.auth && CFG.auth.apiBase) || "";
      var params = "limit=" + limit;
      if (opts.pageUrl) {
        params += "&pageUrl=" + encodeURIComponent(opts.pageUrl);
      }
      const url = API_BASE + "/api/posts?" + params;
      const res = await fetch(url, { credentials: "include" });

      if (!res.ok) {
        if (res.status === 401) {
          host.innerHTML = authExpiredState();
        } else {
          host.innerHTML = errorState();
        }
        return;
      }

      const data = await res.json();
      if (data.error) {
        if (data.error === "not_authenticated" || data.error === "session_expired") {
          host.innerHTML = authExpiredState();
        } else {
          host.innerHTML = errorState();
        }
        return;
      }

      let posts = data.posts || [];
      if (filter !== "all") {
        posts = posts.filter(function (p) {
          return p.type === filter || (filter === "video" && p.type === "live");
        });
      }

      if (posts.length === 0) {
        host.innerHTML = emptyState(labelFor(filter));
        return;
      }

      // Convert API posts to embed-compatible format
      const embedPosts = posts.map(function (p) {
        return { href: p.permalink_url, type: p.type };
      });

      host._all = embedPosts;
      host._shown = embedPosts.length;
      host._rawPaging = data.paging;
      host._dynamicFilter = filter;
      host._dynamicLimit = limit;
      host._dynamicPageUrl = opts.pageUrl || "";

      host.innerHTML = embedPosts.map(embedCard).join("");
      loadAndParse(host, function () {
        host.querySelectorAll(".post-card").forEach(watchCard);
      });
      updateDynamicLoadMore(host);
    } catch (e) {
      host.innerHTML = errorState();
    }
  }

  function authExpiredState() {
    return (
      '<div class="feed-state">' +
      '<div class="ico">' +
      (ICON.facebook || "") +
      "</div>" +
      "<h3>Session expired</h3>" +
      "<p>Your Facebook connection has expired. Reconnect to see your latest posts.</p>" +
      '<button class="btn btn-fb" onclick="C27_AUTH.login()">' +
      (ICON.facebook || "") +
      "<span>Reconnect Facebook Page</span>" +
      "</button>" +
      "</div>"
    );
  }

  function updateDynamicLoadMore(host) {
    const moreWrap = document.querySelector("[data-loadmore]");
    if (!moreWrap) return;
    const paging = host._rawPaging;
    if (paging && paging.next) {
      moreWrap.hidden = false;
      const btn = moreWrap.querySelector("button");
      btn.onclick = function () {
        loadMoreFromApi(host);
      };
    } else {
      moreWrap.hidden = true;
    }
  }

  async function loadMoreFromApi(host) {
    const paging = host._rawPaging;
    if (!paging || !paging.next) return;

    const moreWrap = document.querySelector("[data-loadmore]");
    if (moreWrap) moreWrap.hidden = true;

    try {
      const afterUrl = paging.cursors ? paging.cursors.after : "";
      if (!afterUrl) return;

      const API_BASE = (CFG.auth && CFG.auth.apiBase) || "";
      var params = "limit=" + (host._dynamicLimit || 8) + "&after=" + afterUrl;
      if (host._dynamicPageUrl) {
        params += "&pageUrl=" + encodeURIComponent(host._dynamicPageUrl);
      }
      const url = API_BASE + "/api/posts?" + params;
      const res = await fetch(url, { credentials: "include" });

      if (!res.ok) return;
      const data = await res.json();
      if (data.error) return;

      let posts = data.posts || [];
      const filter = host._dynamicFilter || "all";
      if (filter !== "all") {
        posts = posts.filter(function (p) {
          return p.type === filter || (filter === "video" && p.type === "live");
        });
      }

      const newEmbeds = posts.map(function (p) {
        return { href: p.permalink_url, type: p.type };
      });

      host._all = (host._all || []).concat(newEmbeds);
      host._shown = host._all.length;
      host._rawPaging = data.paging;

      // Append new cards to the DOM
      const frag = document.createElement("div");
      frag.innerHTML = newEmbeds.map(embedCard).join("");
      while (frag.firstChild) {
        host.appendChild(frag.firstChild);
      }

      loadAndParse(host, function () {
        host.querySelectorAll(".post-card").forEach(watchCard);
      });
      updateDynamicLoadMore(host);
    } catch (e) {
      // Keep existing content on error
      if (moreWrap) moreWrap.hidden = false;
    }
  }

  function labelFor(f) {
    return ({ all: "posts", video: "videos", photo: "photos", live: "live videos" })[f] || "posts";
  }

  function loadAndParse(host, after) {
    SDK.load().then(ok => {
      if (!ok) { host.innerHTML = errorState(); return; }
      SDK.parse(host);
      if (after) after();
    });
  }

  function updateLoadMore(host, limit) {
    const moreWrap = document.querySelector("[data-loadmore]");
    if (!moreWrap || limit) return;
    const all = host._all || [];
    if ((host._shown || 0) < all.length) {
      moreWrap.hidden = false;
      const btn = moreWrap.querySelector("button");
      btn.onclick = () => {
        host._shown = Math.min(all.length, (host._shown || PAGE_SIZE) + PAGE_SIZE);
        const next = all.slice(0, host._shown);
        host.innerHTML = next.map(embedCard).join("");
        loadAndParse(host, () => host.querySelectorAll(".post-card").forEach(watchCard));
        updateLoadMore(host, limit);
      };
    } else {
      moreWrap.hidden = true;
    }
  }

  /* Lazy trigger: only build the feed when it nears the viewport. */
  function lazyFeed(host, opts) {
    if (!host) return;
    // Initial skeletons so there is immediate visual feedback.
    if ((CFG.posts || []).length > 0) {
      host.classList.add("feed-grid");
      host.classList.toggle("cols-3", (opts.cols || 4) === 3);
      const n = opts.limit || 4;
      host.innerHTML = Array.from({ length: Math.min(n, (CFG.posts || []).length) }, skeletonCard).join("");
    } else {
      host.innerHTML = `<div class="fb-live-frame" style="min-height:320px;display:grid;place-items:center;color:var(--muted-2)">Loading feed…</div>`;
    }

    const io = new IntersectionObserver((entries, o) => {
      entries.forEach(e => { if (e.isIntersecting) { buildFeed(host, opts); o.disconnect(); } });
    }, { rootMargin: "300px" });
    io.observe(host);
  }

  /* ------------------------------------------------------------------ *
   * Filters (All-Posts page)
   * ------------------------------------------------------------------ */
  function initFilters(host) {
    const bar = document.querySelector("[data-filterbar]");
    if (!bar) return;
    bar.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        bar.querySelectorAll(".filter-btn").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
        btn.classList.add("active"); btn.setAttribute("aria-selected", "true");
        host._shown = PAGE_SIZE;
        buildFeed(host, { cols: 3, filter: btn.dataset.filter });
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Single post page
   * ------------------------------------------------------------------ */
  function initSinglePost() {
    const main = document.getElementById("single-embed");
    if (!main) return;
    const params = new URLSearchParams(location.search);
    let href = params.get("post");

    if (!href) {
      // No post specified — feature the most recent configured post, else the page.
      if ((CFG.posts || []).length) href = CFG.posts[0].href;
    }

    if (!href) {
      main.innerHTML = livePagePlugin(720);
      loadAndParse(main);
    } else {
      main.innerHTML = `
        <div class="fb-frame">
          <div class="fb-post" data-href="${encodeURI(href)}" data-width="680" data-show-text="true"></div>
        </div>
        <div class="card-skeleton">${skeletonInner()}</div>
        <a class="card-fallback" href="${encodeURI(href)}" target="_blank" rel="noopener" hidden>
          ${ICON.facebook}<span>View this post on Facebook</span>${ICON.arrow}</a>`;
      loadAndParse(main, () => watchCard(main));
    }

    // Recent posts sidebar (from configured posts; otherwise gentle prompt)
    const recent = document.getElementById("recent-list");
    if (recent) {
      const items = (CFG.posts || []).slice(0, 4);
      if (items.length) {
        recent.innerHTML = items.map((p, i) => `
          <a class="recent-item" href="post.html?post=${encodeURIComponent(p.href)}">
            <span class="ri-thumb">${p.type === "video" || p.type === "live" ? ICON.video : ICON.photo}</span>
            <span class="ri-text">Featured ${p.type || "post"} #${i + 1}<span>Channel 27 (Tyson Media)</span></span>
          </a>`).join("");
      } else {
        recent.innerHTML = `<p style="color:var(--muted);font-size:14px">Recent posts appear here once they’re featured. For now, browse everything on our <a href="${FB_CFG.fanPageUrl}" target="_blank" rel="noopener" style="color:var(--gold-bright)">Facebook page</a>.</p>`;
      }
    }
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    const homeFeed = document.getElementById("home-feed");
    if (homeFeed) lazyFeed(homeFeed, { cols: 4, limit: 4, pluginHeight: 640 });

    const allFeed = document.getElementById("all-feed");
    if (allFeed) {
      lazyFeed(allFeed, { cols: 3, filter: "all", showHint: true, pluginHeight: 760 });
      initFilters(allFeed);
    }

    initSinglePost();
  });

  window.C27 = { buildFeed, SDK };
})();
