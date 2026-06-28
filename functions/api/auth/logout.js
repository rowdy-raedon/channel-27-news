/* ============================================================================
   GET /api/auth/logout — Clears session cookie + KV entry.
   ========================================================================== */
export async function onRequest(context) {
  const { request, env } = context;
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/c27_session=([^;]+)/);
  const sessionId = match ? match[1] : null;

  if (sessionId) {
    try { await env.C27_AUTH.delete(`token:${sessionId}`); } catch { /* ok */ }
  }

  const redirectUrl = new URL(request.url).origin + "/?auth=logged-out";
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectUrl,
      "Set-Cookie": "c27_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
