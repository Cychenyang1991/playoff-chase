/**
 * Loads Giscus when js/site-config.js has giscusRepo + giscusRepoId + giscusCategoryId set.
 * @see https://giscus.app
 */
(function () {
  var cfg = window.NBA_SITE_CONFIG || {};
  var repo = String(cfg.giscusRepo || "").trim();
  var repoId = String(cfg.giscusRepoId || "").trim();
  var category = String(cfg.giscusCategory || "Announcements").trim();
  var categoryId = String(cfg.giscusCategoryId || "").trim();
  var hint = document.getElementById("giscus-setup-hint");
  var anchor = document.getElementById("giscus-anchor");

  if (!repo || !repoId || !categoryId) {
    return;
  }

  if (hint) {
    hint.setAttribute("hidden", "");
  }

  var frame = document.createElement("div");
  frame.className = "giscus";
  if (anchor) {
    anchor.appendChild(frame);
  } else {
    document.body.appendChild(frame);
  }

  var s = document.createElement("script");
  s.src = "https://giscus.app/client.js";
  s.async = true;
  s.crossOrigin = "anonymous";
  s.setAttribute("data-repo", repo);
  s.setAttribute("data-repo-id", repoId);
  s.setAttribute("data-category", category);
  s.setAttribute("data-category-id", categoryId);
  s.setAttribute("data-mapping", cfg.giscusMapping || "pathname");
  s.setAttribute("data-strict", "0");
  s.setAttribute("data-reactions-enabled", "1");
  s.setAttribute("data-emit-metadata", "0");
  s.setAttribute("data-input-position", "bottom");
  s.setAttribute("data-theme", cfg.giscusTheme || "noborder_dark");
  s.setAttribute("data-lang", cfg.giscusLang || "en");

  (anchor || document.body).appendChild(s);
})();
