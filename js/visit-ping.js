(function () {
  var PV = "https://page-views-api.ratneshc.com/api/v1/track";

  function siteId() {
    var h = location.hostname;
    if (!h || h === "localhost" || h === "127.0.0.1") {
      return "nba-milestones-local";
    }
    return h.replace(/^www\./i, "").toLowerCase();
  }

  var url = PV + "?site=" + encodeURIComponent(siteId()) + "&path=" + encodeURIComponent("/");
  fetch(url, { method: "GET", mode: "cors", credentials: "omit", keepalive: true }).catch(
    function () {}
  );
})();
