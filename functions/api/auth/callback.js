/* ============================================================================
   GET /api/auth/callback
   Facebook OAuth redirect handler. Exchanges code → token → stores in KV.
   ========================================================================== */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  const origin = url.origin;

  if (error || !code) {
    return Response.redirect(`${origin}/?auth=error&reason=${encodeURIComponent(errorDescription || error || "no_code")}`, 302);
  }

  const appId = env.FB_APP_ID;
  const appSecret = env.FB_APP_SECRET;
  const redirectUri = env.FB_REDIRECT_URI;

  try {
    // Step 1: Exchange code for user access token
    const tokenRes = await fetch(
      "https://graph.facebook.com/v19.0/oauth/access_token?" +
      new URLSearchParams({ client_id: appId, client_secret: appSecret, redirect_uri: redirectUri, code })
    );
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return Response.redirect(`${origin}/?auth=error&reason=${encodeURIComponent(tokenData.error.message)}`, 302);
    }

    const userToken = tokenData.access_token;

    // Step 2: Get user's Facebook Pages
    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${userToken}`);
    const pagesData = await pagesRes.json();

    if (pagesData.error || !pagesData.data || !pagesData.data.length) {
      return Response.redirect(`${origin}/?auth=error&reason=${encodeURIComponent("No Facebook Pages found. Create a Page first.")}`, 302);
    }

    // Step 3: Use first page
    const page = pagesData.data[0];

    // Step 4: Store in KV
    const sessionId = crypto.randomUUID();
    await env.C27_AUTH.put(`token:${sessionId}`, JSON.stringify({
      accessToken: userToken,
      pageId: page.id,
      pageName: page.name,
      pageAccessToken: page.access_token,
      createdAt: new Date().toISOString(),
    }), { expirationTtl: 7776000 });

    // Step 5: Set cookie + redirect
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${origin}/?auth=success`,
        "Set-Cookie": `c27_session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=7776000`,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return Response.redirect(`${origin}/?auth=error&reason=${encodeURIComponent(err.message)}`, 302);
  }
}
