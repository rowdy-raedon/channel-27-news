/* ============================================================================
   GET /api/posts?limit=10&after=CURSOR
   Fetches Facebook Page posts via Graph API.

   Two modes (tried in order):
   1. Connected mode — user authenticated via OAuth, page token from KV
   2. Public mode   — uses app access token to fetch from any public page

   The frontend can also pass ?pageId=XXX to fetch from a specific page
   in public mode without being authenticated.
   ========================================================================== */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") || "10";
  const after = url.searchParams.get("after") || "";

  const fields = [
    "message",
    "created_time",
    "full_picture",
    "permalink_url",
    "attachments{media,subattachments,type,url,title,description}",
    "shares",
    "reactions.summary(true)",
    "comments.summary(true)",
    "type",
  ].join(",");

  /* ---- Mode 1: Authenticated user (owns the page) ---- */
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/c27_session=([^;]+)/);
  const sessionId = match ? match[1] : null;

  if (sessionId) {
    const sessionData = await env.C27_AUTH.get(`token:${sessionId}`, "json");
    if (sessionData && sessionData.pageId) {
      return fetchWithToken(sessionData.pageId, sessionData.pageAccessToken, limit, after, fields, sessionId, sessionData, env);
    }
  }

  /* ---- Mode 2: Public page (app access token) ---- */
  const pageId = url.searchParams.get("pageId") || "";
  const pageUrl = url.searchParams.get("pageUrl") || "";

  if (!pageId && !pageUrl) {
    return Response.json(
      { error: "no_page", message: "No Facebook Page configured. Connect a page or set pageId/pageUrl." },
      { status: 400 }
    );
  }

  try {
    // Resolve page URL to ID if needed
    let resolvedId = pageId;
    if (!resolvedId && pageUrl) {
      resolvedId = await resolvePageId(pageUrl, env);
      if (!resolvedId) {
        return Response.json(
          { error: "page_not_found", message: "Could not find Facebook Page: " + pageUrl },
          { status: 404 }
        );
      }
    }

    const appToken = `${env.FB_APP_ID}|${env.FB_APP_SECRET}`;
    return fetchPublicPosts(resolvedId, appToken, limit, after, fields);
  } catch (err) {
    return Response.json(
      { error: "fetch_failed", message: err.message },
      { status: 502 }
    );
  }
}

/* ------------------------------------------------------------------ *
 * Mode 1: Authenticated (owned page) with token refresh
 * ------------------------------------------------------------------ */
async function fetchWithToken(pageId, accessToken, limit, after, fields, sessionId, sessionData, env) {
  let fbUrl = `https://graph.facebook.com/v19.0/${pageId}/posts?` +
    `fields=${fields}&limit=${limit}&access_token=${accessToken}`;
  if (after) fbUrl += `&after=${after}`;

  try {
    const fbRes = await fetch(fbUrl);
    const fbData = await fbRes.json();

    // Token expired — try refresh
    if (fbData.error && fbData.error.code === 190) {
      const refreshUrl = "https://graph.facebook.com/v19.0/oauth/access_token?" +
        new URLSearchParams({
          grant_type: "fb_exchange_token",
          client_id: env.FB_APP_ID,
          client_secret: env.FB_APP_SECRET,
          fb_exchange_token: sessionData.accessToken,
        });

      const refreshRes = await fetch(refreshUrl);
      const refreshData = await refreshRes.json();

      if (refreshData.access_token) {
        sessionData.accessToken = refreshData.access_token;
        sessionData.pageAccessToken = refreshData.access_token;
        await env.C27_AUTH.put(`token:${sessionId}`, JSON.stringify(sessionData));

        fbUrl = fbUrl.replace(
          `access_token=${accessToken}`,
          `access_token=${refreshData.access_token}`
        );
        const retryRes = await fetch(fbUrl);
        return Response.json(normalizePosts(await retryRes.json()));
      }

      return Response.json(
        { error: "token_expired", message: "Please reconnect your Facebook Page." },
        { status: 401 }
      );
    }

    if (fbData.error) {
      return Response.json(
        { error: "facebook_api_error", message: fbData.error.message },
        { status: 502 }
      );
    }

    return Response.json(normalizePosts(fbData));
  } catch (err) {
    return Response.json(
      { error: "fetch_failed", message: err.message },
      { status: 502 }
    );
  }
}

/* ------------------------------------------------------------------ *
 * Mode 2: Public page (app access token — no user login needed)
 * ------------------------------------------------------------------ */
async function fetchPublicPosts(pageId, appToken, limit, after, fields) {
  let fbUrl = `https://graph.facebook.com/v19.0/${pageId}/posts?` +
    `fields=${fields}&limit=${limit}&access_token=${appToken}`;
  if (after) fbUrl += `&after=${after}`;

  const fbRes = await fetch(fbUrl);
  const fbData = await fbRes.json();

  if (fbData.error) {
    // Public pages may not expose all posts — return what we can
    return Response.json({
      posts: [],
      paging: null,
      notice: fbData.error.message || "This page may not allow public API access.",
    });
  }

  return Response.json(normalizePosts(fbData));
}

/* ------------------------------------------------------------------ *
 * Page URL → Page ID resolver
 * ------------------------------------------------------------------ */
async function resolvePageId(pageUrl, env) {
  // Extract handle/username from URL
  let handle = pageUrl;
  // Strip protocol + domain
  const m = pageUrl.match(/facebook\.com\/([^/?&#]+)/);
  if (m) handle = m[1];

  // Skip if it looks like a numeric ID already
  if (/^\d+$/.test(handle)) return handle;

  // Remove trailing slashes / query / hash
  handle = handle.split(/[/?#]/)[0];

  const appToken = `${env.FB_APP_ID}|${env.FB_APP_SECRET}`;
  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${handle}?fields=id&access_token=${appToken}`
    );
    const data = await res.json();
    return data.id || null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

function normalizePosts(fbData) {
  const posts = (fbData.data || []).map((p) => ({
    id: p.id,
    message: p.message || "",
    created_time: p.created_time,
    full_picture: p.full_picture || "",
    permalink_url: p.permalink_url || "",
    type: mapType(p.type, p.attachments),
    shares: p.shares ? p.shares.count || 0 : 0,
    reactions: p.reactions ? p.reactions.summary.total_count : 0,
    comments: p.comments ? p.comments.summary.total_count : 0,
    attachments: p.attachments || null,
  }));

  return {
    posts,
    paging: fbData.paging || null,
  };
}

function mapType(fbType, attachments) {
  if (fbType === "video" || fbType === "live_video") return "video";
  if (fbType === "photo") return "photo";
  const data = attachments && attachments.data;
  if (data && data[0]) {
    if (data[0].type === "video_inline") return "video";
    if (data[0].type === "album") return "photo";
  }
  return "status";
}
