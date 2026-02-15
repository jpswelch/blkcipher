---
title: WHOOP connected
layout: page
---

<div id="whoop-status" class="whoop-connected-message">
  <p>Checking…</p>
</div>

<script>
(function () {
  var STORAGE_KEY = "whoop_oauth";
  var el = document.getElementById("whoop-status");

  function show(msg, isError) {
    if (!el) return;
    el.innerHTML = "<p>" + msg + "</p>";
    if (isError) el.classList.add("whoop-error");
  }

  var hash = window.location.hash;
  if (!hash || hash.length < 2) {
    show("No token data in the URL. Complete the connection from <a href=\"/auth/whoop/start\">Connect to WHOOP</a> first.", true);
    return;
  }

  try {
    var params = new URLSearchParams(hash.slice(1));
    var accessToken = params.get("access_token");
    var refreshToken = params.get("refresh_token") || "";
    var expiresIn = params.get("expires_in") || "";
    var tokenType = params.get("token_type") || "bearer";
    var scope = params.get("scope") || "";

    if (!accessToken) {
      show("Invalid token data received. Try <a href=\"/auth/whoop/start\">Connect to WHOOP</a> again.", true);
      return;
    }

    var payload = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn ? parseInt(expiresIn, 10) : null,
      token_type: tokenType,
      scope: scope,
      stored_at: Date.now(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      show("Tokens received but could not save (e.g. private browsing). You can still use this session.", true);
      clearHash();
      return;
    }

    clearHash();
    show("WHOOP connected. Tokens are stored. You can close this tab or continue using the app.");
  } catch (e) {
    show("Something went wrong. Try <a href=\"/auth/whoop/start\">Connect to WHOOP</a> again.", true);
  }

  function clearHash() {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }
})();
</script>
