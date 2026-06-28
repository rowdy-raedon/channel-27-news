/* ============================================================================
   Channel 27 — Pages Functions middleware
   CORS headers + security hardening for API routes.
   ========================================================================== */
export async function onRequest(context, next) {
  const response = await next();
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: response.headers });
  }
  return response;
}
