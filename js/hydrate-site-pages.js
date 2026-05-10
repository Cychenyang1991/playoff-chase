/**
 * Hydrates static HTML from players.json → sitePages[filename].
 *
 * Requirements per page:
 *   <html data-site-page="your-page.html">
 *   <script src="js/site-config.js" ...>  (optional; defaults playersJsonUrl to players.json)
 *   <script src="js/hydrate-site-pages.js" defer></script>
 *
 * Bindings:
 *   data-json-field="seo.title"        → plain text / meta content
 *   data-json-html-field="hero.subHtml" → trusted innerHTML (site owner only)
 */
(function () {
  var pageKey = document.documentElement.getAttribute("data-site-page");
  if (!pageKey) return;

  function getPath(obj, path) {
    if (!obj || !path) return undefined;
    var parts = path.split(".");
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  /** Decode common entities from JSON that mirrored HTML (&amp; → &). */
  function decodeHtmlEntities(str) {
    if (str == null || str === "") return str;
    var ta = document.createElement("textarea");
    ta.innerHTML = String(str);
    return ta.value;
  }

  function applyText(el, val) {
    if (val == null || val === "") return;
    var tag = el.tagName && el.tagName.toLowerCase();
    var v = decodeHtmlEntities(String(val));
    if (tag === "meta") {
      el.setAttribute("content", v);
      return;
    }
    if (tag === "title") {
      el.textContent = v;
      return;
    }
    el.textContent = v;
  }

  function applyHtml(el, val) {
    if (val == null || val === "") return;
    el.innerHTML = String(val);
  }

  var cfg = window.NBA_SITE_CONFIG || {};
  var url = String(cfg.playersJsonUrl || "players.json").trim();

  fetch(url, { credentials: "same-origin" })
    .then(function (r) {
      if (!r.ok) throw new Error("players " + r.status);
      return r.json();
    })
    .then(function (data) {
      var page = (data.sitePages || {})[pageKey];
      if (!page) return;

      document.querySelectorAll("[data-json-field]").forEach(function (el) {
        var path = el.getAttribute("data-json-field");
        if (!path) return;
        applyText(el, getPath(page, path));
      });

      document.querySelectorAll("[data-json-html-field]").forEach(function (el) {
        var path = el.getAttribute("data-json-html-field");
        if (!path) return;
        applyHtml(el, getPath(page, path));
      });
    })
    .catch(function () {});
})();
