/**
 * WHOOP OAuth callback – runs as a Netlify serverless function.
 * Configure WHOOP redirect_uri as: https://YOUR-DOMAIN.com/auth/whoop/callback
 *
 * Required env vars in Netlify: WHOOP_CLIENT_ID, WHOOP_CLIENT_SECRET
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
        "<p>Start by clicking your app’s “Connect to WHOOP” (or similar) link, which sends you to WHOOP to sign in; after you approve, WHOOP will redirect here with a <code>code</code> parameter.</p>",
        hasParams ? `<p><small>Received query params: ${Object.keys(params).join(", ")}</small></p>` : "",
      ].join("\n"),
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

    // TODO: securely store tokenData.access_token and tokenData.refresh_token
    // (e.g. in a DB or Netlify env/store keyed by user/session)
    console.log("WHOOP token response (redact in production):", Object.keys(tokenData));

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
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
