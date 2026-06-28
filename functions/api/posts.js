/* ============================================================================
   GET /api/posts?limit=10&after=CURSOR&pageUrl=URL
   Fetches Facebook Page posts via Graph API.
   Mode 1: Authenticated (cookie → KV token)
   Mode 2: Public page (app access token, no login needed)
   ========================================================================== */
import { json } from "../lib/cors";

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  }

  const limit = url.searchParams.get("limit") || "10";
  const after = url.searchParams.get("after") || "";

  const fields = "message,created_time,full_picture,permalink_url,attachments{media,subattachments,type,url,title,description},shares,reactions.summary(true),comments.summary(true),type";

  /* Mode 1: Authenticated session */
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/c27_session=([^;]+)/);
  const sessionId = match ? match[1] : null;

  if (sessionId) {
    try {
      const data = await env.C27_AUTH.get(`token:${sessionId}`, "json");
      if (data && data.pageId) {
        return fetchPosts(data.pageId, data.pageAccessToken, limit, after, fields);
      }
    } catch { /* fall through to public mode */ }
  }

  /* Mode 2: Public page */
  const pageUrl = url.searchParams.get("pageUrl") || "";
  let pageId = url.searchParams.get("pageId") || "";

  if (!pageId && pageUrl) {
    pageId = await resolvePageId(pageUrl, env);
  }

  if (!pageId) {
    return json({ error: "no_page", message: "No page configured. Set facebook.fanPageUrl in config.js." }, 400);
  }

  const appToken = `${env.FB_APP_ID}|${env.FB_APP_SECRET}`;
  return fetchPublicPosts(pageId, appToken, limit, after, fields);
}

async function fetchPosts(pageId, token, limit, after, fields) {
  let fbUrl = `https://graph.facebook.com/v19.0/${pageId}/posts?fields=${fields}&limit=${limit}&access_token=${token}`;
  if (after) fbUrl += `&after=${after}`;

  const res = await fetch(fbUrl);
  const data = await res.json();
  if (data.error) {
    return json({ error: "facebook_api_error", message: data.error.message }, 502);
  }
  return json(normalize(data));
}

async function fetchPublicPosts(pageId, appToken, limit, after, fields) {
  let fbUrl = `https://graph.facebook.com/v19.0/${pageId}/posts?fields=${fields}&limit=${limit}&access_token=${appToken}`;
  if (after) fbUrl += `&after=${after}`;

  const res = await fetch(fbUrl);
  const data = await res.json();
  if (data.error) {
    return json({ posts: [], paging: null, notice: data.error.message });
  }
  return json(normalize(data));
}

async function resolvePageId(pageUrl, env) {
  let handle = pageUrl;
  const m = pageUrl.match(/facebook\.com\/([^/?&#]+)/);
  if (m) handle = m[1];
  if (/^\d+$/.test(handle)) return handle;
  handle = handle.split(/[/?#]/)[0];

  const appToken = `${env.FB_APP_ID}|${env.FB_APP_SECRET}`;
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${handle}?fields=id&access_token=${appToken}`);
    const data = await res.json();
    return data.id || null;
  } catch { return null; }
}

function normalize(fbData) {
  const posts = (fbData.data || []).map(p => ({
    id: p.id,
    message: p.message || "",
    created_time: p.created_time,
    full_picture: p.full_picture || "",
    permalink_url: p.permalink_url || "",
    type: mapType(p.type, p.attachments),
    shares: p.shares ? p.shares.count || 0 : 0,
    reactions: p.reactions ? p.reactions.summary.total_count : 0,
    comments: p.comments ? p.comments.summary.total_count : 0,
  }));
  return { posts, paging: fbData.paging || null };
}

function mapType(fbType, attachments) {
  if (fbType === "video" || fbType === "live_video") return "video";
  if (fbType === "photo") return "photo";
  const d = attachments && attachments.data;
  if (d && d[0]) {
    if (d[0].type === "video_inline") return "video";
    if (d[0].type === "album") return "photo";
  }
  return "status";
}
