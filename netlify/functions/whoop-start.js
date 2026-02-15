/**
 * WHOOP OAuth start – redirects to WHOOP with a valid state (8+ chars required).
 * Use this as your "Connect to WHOOP" link: https://YOUR-DOMAIN.com/auth/whoop/start
 *
 * Required env vars: WHOOP_CLIENT_ID
 * Optional: WHOOP_SCOPE (default: "read:recovery read:profile offline")
 */

const crypto = require("crypto");

const AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
const STATE_COOKIE = "whoop_oauth_state";
const STATE_MAX_AGE = 600; // 10 minutes

function getRedirectUri(envUrl) {
  return envUrl ? `${envUrl}/auth/whoop/callback` : "https://blkcipher.xyz/auth/whoop/callback";
}

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const clientId = process.env.WHOOP_CLIENT_ID;
  if (!clientId) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: "<p>WHOOP_CLIENT_ID is not set.</p>",
    };
  }

  // WHOOP requires state to be at least 8 characters
  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = getRedirectUri(process.env.URL);
  const scope = process.env.WHOOP_SCOPE || "read:recovery read:profile offline";

  const authParams = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope,
  });

  const location = `${AUTH_URL}?${authParams.toString()}`;

  // Set cookie so callback can verify state (CSRF). Clear on callback.
  const setCookie = [
    `${STATE_COOKIE}=${state}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${STATE_MAX_AGE}`,
  ].join("; ");

  return {
    statusCode: 302,
    headers: {
      Location: location,
      "Set-Cookie": setCookie,
      "Cache-Control": "no-store",
    },
    body: "",
  };
};
