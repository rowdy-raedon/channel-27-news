/* ============================================================================
   GET /api/auth/login
   Redirects user to Facebook OAuth dialog.
   ========================================================================== */
export async function onRequest(context) {
  const { env } = context;
  const appId = env.FB_APP_ID;
  const redirectUri = env.FB_REDIRECT_URI;

  if (!appId) {
    return new Response(JSON.stringify({ error: "Facebook App ID not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const state = crypto.randomUUID();
  const scope = "pages_read_engagement,pages_show_list,pages_read_user_content";
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    scope,
    response_type: "code",
  });

  const fbUrl = `https://www.facebook.com/v19.0/dialog/oauth?${params}`;
  return Response.redirect(fbUrl, 302);
}
