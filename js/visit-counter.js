/**
 * Page Views API — https://page-views-api.ratneshc.com/docs/getting-started
 * No API key; CORS-friendly for static hosts (e.g. GitHub Pages).
 * github.io project sites: one counter per repo (first path segment).
 */
(function () {
  var PV = "https://page-views-api.ratneshc.com/api/v1";

  function visitScope() {
    var host = (location.hostname || "").replace(/^www\./, "").toLowerCase();
    if (!host || host === "127.0.0.1") host = "local-preview";

    var pathname = location.pathname || "/";
    pathname = pathname.replace(/\/{2,}/g, "/");
    var normalized = pathname.replace(/\/index\.html?$/i, "/");
    if (normalized.length > 1 && normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }

    if (host.indexOf("github.io") !== -1) {
      var parts = normalized.split("/").filter(function (s) {
        return s && s.toLowerCase() !== "index.html";
      });
      if (parts.length === 0) {
        return { site: host, path: "/" };
      }
      return { site: host, path: "/" + parts[0] };
    }

    return { site: host, path: "/" };
  }

  function queryString(scope) {
    return (
      "site=" +
      encodeURIComponent(scope.site) +
      "&path=" +
      encodeURIComponent(scope.path)
    );
  }

  function renderViews(scope) {
    var el = document.getElementById("visit-count");
    if (!el) return;

    fetch(PV + "/views?" + queryString(scope), {
      method: "GET",
      mode: "cors",
      credentials: "omit"
    })
      .then(function (r) {
        if (!r.ok) throw new Error("views " + r.status);
        return r.json();
      })
      .then(function (data) {
        var n = data && typeof data.views === "number" ? data.views : 0;
        el.textContent = String(Math.max(0, Math.floor(n)));
      })
      .catch(function () {
        el.textContent = "—";
      });
  }

  var scope = visitScope();
  var trackUrl = PV + "/track?" + queryString(scope);

  fetch(trackUrl, {
    method: "GET",
    mode: "cors",
    credentials: "omit",
    keepalive: true
  })
    .catch(function () {})
    .finally(function () {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
          renderViews(scope);
        });
      } else {
        renderViews(scope);
      }
    });
})();
