/* ============================================================================
   GET /api/auth/callback
   Handles Facebook OAuth redirect.
   Exchanges authorization code → user token → page token → stores in KV.
   Sets HttpOnly session cookie.
   ========================================================================== */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  const appId = env.FB_APP_ID;
  const appSecret = env.FB_APP_SECRET;
  const redirectUri = env.FB_REDIRECT_URI;

  // User denied or Facebook returned an error
  if (error || !code) {
    const reason = errorDescription || error || "no_code";
    return Response.redirect(`/?auth=error&reason=${encodeURIComponent(reason)}`, 302);
  }

  try {
    // Step 1: Exchange code for short-lived user access token
    const tokenUrl = "https://graph.facebook.com/v19.0/oauth/access_token?" +
      new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: redirectUri,
        code,
      });

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return Response.redirect(
        `/?auth=error&reason=${encodeURIComponent(tokenData.error.message || "token_exchange_failed")}`,
        302
      );
    }

    const userAccessToken = tokenData.access_token;

    // Step 2: Get user's Facebook Pages
    const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();

    if (pagesData.error || !pagesData.data || pagesData.data.length === 0) {
      const reason = pagesData.error
        ? pagesData.error.message
        : "No Facebook Pages found on your account. Create a Page first.";
      return Response.redirect(`/?auth=error&reason=${encodeURIComponent(reason)}`, 302);
    }

    // Step 3: Use the first page (user can select later if multiple)
    const page = pagesData.data[0];
    const pageId = page.id;
    const pageName = page.name;
    const pageAccessToken = page.access_token;

    // Step 4: Generate session and store in KV
    const sessionId = crypto.randomUUID();
    const sessionData = {
      accessToken: userAccessToken,
      pageId,
      pageName,
      pageAccessToken,
      userId: tokenData.user_id || "",
      createdAt: new Date().toISOString(),
    };

    await env.C27_AUTH.put(`token:${sessionId}`, JSON.stringify(sessionData), {
      expirationTtl: 7776000, // 90 days
    });

    // Step 5: Set session cookie and redirect home
    const response = Response.redirect("/?auth=success", 302);
    response.headers.set(
      "Set-Cookie",
      `c27_session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=7776000`
    );
    return response;
  } catch (err) {
    return Response.redirect(
      `/?auth=error&reason=${encodeURIComponent(err.message || "unexpected_error")}`,
      302
    );
  }
}
