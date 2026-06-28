/* ============================================================================
   GET /api/auth/login — Redirects to Facebook OAuth dialog.
   ========================================================================== */
import { redirect, json } from "../../lib/cors";

export async function onRequest(context) {
  const { env } = context;

  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const appId = env.FB_APP_ID;
  const redirectUri = env.FB_REDIRECT_URI;

  if (!appId || appId === "PLACEHOLDER_APP_ID") {
    return json({ error: "Facebook App ID not configured. Set FB_APP_ID in Cloudflare dashboard." }, 500);
  }

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    scope: "pages_read_engagement,pages_show_list,pages_read_user_content",
    response_type: "code",
  });

  return redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params}`);
}
