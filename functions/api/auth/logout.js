/* ============================================================================
   GET /api/auth/logout
   Clears the session cookie and deletes the KV entry.
   ========================================================================== */
export async function onRequest(context) {
  const { request, env } = context;
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/c27_session=([^;]+)/);
  const sessionId = match ? match[1] : null;

  if (sessionId) {
    try {
      await env.C27_AUTH.delete(`token:${sessionId}`);
    } catch {
      // KV delete failed — not critical, token expires naturally
    }
  }

  const response = Response.redirect("/?auth=logged-out", 302);
  response.headers.set(
    "Set-Cookie",
    "c27_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
  );
  return response;
}
