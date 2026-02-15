/**
 * WHOOP OAuth callback – runs as a Netlify serverless function.
 * Configure WHOOP redirect_uri as: https://YOUR-DOMAIN.com/auth/whoop/callback
 *
 * Required env vars: WHOOP_CLIENT_ID, WHOOP_CLIENT_SECRET
 *
 * Optional: WHOOP_SUCCESS_REDIRECT_URL – after a successful token exchange, redirect
 * the user here with the token data in the URL hash (fragment), e.g.:
 *   https://blkcipher.xyz/whoop-connected.html
 * The whoop-connected page reads the hash, stores tokens in localStorage under "whoop_oauth", then clears the hash.
 *
 * WHOOP token response (from their token endpoint) includes:
 *   - access_token (string) – use as Bearer token for API requests
 *   - refresh_token (string) – present if you requested "offline" scope; use to get new access tokens
 *   - expires_in (number) – access token lifetime in seconds (e.g. 3600)
 *   - token_type (string) – "bearer"
 *   - scope (string) – granted scopes
 */

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const params = event.queryStringParameters || {};
  const code = params.code;
  const error = params.error;
  const errorDesc = params.error_description;

  if (error) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: [
        "<p><strong>WHOOP authorization did not complete.</strong></p>",
        `<p>Error: ${error}${errorDesc ? ` — ${decodeURIComponent(errorDesc)}` : ""}</p>`,
        "<p>You can try again by starting from your app’s “Connect to WHOOP” link.</p>",
      ].join("\n"),
    };
  }

  if (!code) {
    const hasParams = Object.keys(params).length > 0;
    return {
      statusCode: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: [
        "<p><strong>Missing code in callback.</strong></p>",
        "<p>This URL is for WHOOP to redirect to after you authorize. Do not open it directly.</p>",
        "<p>Start from: <a href=\"/auth/whoop/start\">Connect to WHOOP</a>.</p>",
        hasParams ? `<p><small>Received query params: ${Object.keys(params).join(", ")}</small></p>` : "",
      ].join("\n"),
    };
  }

  // CSRF check: state from WHOOP must match the cookie set by /auth/whoop/start
  const stateFromQuery = params.state;
  const cookieHeader = event.headers.cookie || event.headers.Cookie || "";
  const stateCookieMatch = cookieHeader.match(/whoop_oauth_state=([^;]+)/);
  const stateFromCookie = stateCookieMatch ? stateCookieMatch[1].trim() : null;
  if (!stateFromQuery || !stateFromCookie || stateFromQuery !== stateFromCookie) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: "<p><strong>Invalid or missing state.</strong> Please start from <a href=\"/auth/whoop/start\">Connect to WHOOP</a> (do not open the callback URL directly).</p>",
    };
  }

  const clientId = process.env.WHOOP_CLIENT_ID;
  const clientSecret = process.env.WHOOP_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error("WHOOP_CLIENT_ID or WHOOP_CLIENT_SECRET not set");
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: "<p>Server configuration error.</p>",
    };
  }

  // Must match the redirect_uri registered in WHOOP and used in the auth link
  const redirectUri = process.env.URL
    ? `${process.env.URL}/auth/whoop/callback`
    : "https://blkcipher.xyz/auth/whoop/callback";

  try {
    const tokenRes = await fetch("https://api.prod.whoop.com/oauth/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: String(code),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      console.error("WHOOP token error:", tokenData);
      return {
        statusCode: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: `<p>WHOOP returned an error. Check server logs.</p><pre>${JSON.stringify(tokenData, null, 2)}</pre>`,
      };
    }

    console.log("WHOOP token response (redact in production):", Object.keys(tokenData));

    // Clear the state cookie
    const clearCookie = "whoop_oauth_state=; Path=/; HttpOnly; Secure; Max-Age=0";

    // Optional: redirect to app with tokens in the URL fragment (app reads hash and clears it)
    const successRedirectUrl = process.env.WHOOP_SUCCESS_REDIRECT_URL;
    if (successRedirectUrl && successRedirectUrl.startsWith("https://")) {
      const fragment = new URLSearchParams({
        access_token: tokenData.access_token || "",
        refresh_token: tokenData.refresh_token || "",
        expires_in: String(tokenData.expires_in ?? ""),
        token_type: tokenData.token_type || "bearer",
        scope: tokenData.scope || "",
      }).toString();
      const location = `${successRedirectUrl.replace(/#.*$/, "")}#${fragment}`;
      return {
        statusCode: 302,
        headers: {
          Location: location,
          "Set-Cookie": clearCookie,
          "Cache-Control": "no-store",
        },
        body: "",
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Set-Cookie": clearCookie,
      },
      body: "<p>WHOOP connected successfully. You can close this tab.</p>",
    };
  } catch (e) {
    console.error("WHOOP callback error:", e);
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: "<p>OAuth callback failed.</p>",
    };
  }
};
