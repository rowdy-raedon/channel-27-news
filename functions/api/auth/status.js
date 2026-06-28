/* ============================================================================
   GET /api/auth/status
   Returns current auth state for the session cookie.
   ========================================================================== */
import { json } from "../../lib/cors";

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  }

  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/c27_session=([^;]+)/);
  const sessionId = match ? match[1] : null;

  if (!sessionId) {
    return json({ authenticated: false });
  }

  try {
    const data = await env.C27_AUTH.get(`token:${sessionId}`, "json");
    if (!data || !data.pageId) {
      return json({ authenticated: false });
    }
    return json({ authenticated: true, pageName: data.pageName, pageId: data.pageId });
  } catch {
    return json({ authenticated: false });
  }
}
