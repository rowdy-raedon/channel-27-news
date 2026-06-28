/* ============================================================================
   GET /api/auth/status
   Returns current auth state for the session cookie.
   Frontend calls this to know if user is connected.
   ========================================================================== */
export async function onRequest(context) {
  const { request, env } = context;
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/c27_session=([^;]+)/);
  const sessionId = match ? match[1] : null;

  if (!sessionId) {
    return Response.json({ authenticated: false });
  }

  try {
    const data = await env.C27_AUTH.get(`token:${sessionId}`, "json");

    if (!data || !data.pageId) {
      return Response.json({ authenticated: false });
    }

    return Response.json({
      authenticated: true,
      pageName: data.pageName,
      pageId: data.pageId,
    });
  } catch {
    return Response.json({ authenticated: false });
  }
}
