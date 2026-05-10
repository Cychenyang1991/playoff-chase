/**
 * Optional live totals from Ball Don't Lie NBA API (requires free API key).
 * Docs: https://docs.balldontlie.io/
 *
 * Milestones can include:
 *   "live": { "stat": "pts", "baseline": 8000 }
 * Player can include:
 *   "liveProfile": { "balldontliePlayerId": 123, "postseasonSeasons": [2025] }
 *
 * Display current = baseline + sum(stat) across listed playoff seasons for that player.
 * Set baseline to (career total before those seasons) so it stays accurate as playoffs progress.
 */
(function () {
  var STAT_FIELDS = ["pts", "ast", "reb", "fg3m", "fgm", "ftm", "stl", "blk"];

  function emptySums() {
    var o = {};
    STAT_FIELDS.forEach(function (k) {
      o[k] = 0;
    });
    return o;
  }

  function addStatRow(sums, row) {
    STAT_FIELDS.forEach(function (k) {
      var v = row[k];
      sums[k] += typeof v === "number" && !isNaN(v) ? v : 0;
    });
  }

  function buildStatsUrl(baseUrl, playerId, seasons, cursor) {
    var u = new URL((baseUrl || "https://api.balldontlie.io/v1").replace(/\/$/, "") + "/stats");
    u.searchParams.append("player_ids[]", String(playerId));
    u.searchParams.append("postseason", "true");
    u.searchParams.set("per_page", "100");
    seasons.forEach(function (s) {
      u.searchParams.append("seasons[]", String(s));
    });
    if (cursor != null) u.searchParams.set("cursor", String(cursor));
    return u.toString();
  }

  function fetchAllPlayoffSums(apiKey, baseUrl, playerId, seasons) {
    var sums = emptySums();
    if (!apiKey || !playerId || !seasons || !seasons.length) {
      return Promise.resolve(sums);
    }
    var cursor = null;

    function next() {
      var url = buildStatsUrl(baseUrl, playerId, seasons, cursor);
      return fetch(url, {
        headers: { Authorization: apiKey },
        credentials: "omit"
      }).then(function (r) {
        if (!r.ok) {
          return { data: [], meta: {} };
        }
        return r.json();
      });
    }

    function loop() {
      return next().then(function (body) {
        var rows = (body && body.data) || [];
        rows.forEach(function (row) {
          addStatRow(sums, row);
        });
        var nc = body && body.meta && body.meta.next_cursor;
        if (nc != null && nc !== "" && rows.length) {
          cursor = nc;
          return loop();
        }
        return sums;
      });
    }

    return loop();
  }

  function applySumsToPlayer(player, sums) {
    if (!player.milestones) return;
    player.milestones.forEach(function (m) {
      if (!m || !m.live || !m.live.stat) return;
      var stat = m.live.stat;
      if (typeof sums[stat] !== "number") return;
      var base = typeof m.live.baseline === "number" ? m.live.baseline : 0;
      m.current = Math.round(base + sums[stat]);
    });
  }

  window.NBALive = {
    /**
     * Mutates players in place: fills milestone.current from API when liveProfile + key exist.
     */
    enrich: function (players, meta) {
      var cfg = window.NBA_SITE_CONFIG || {};
      var key = (cfg.balldontlieApiKey || "").trim();
      var baseUrl = (cfg.balldontlieBaseUrl || "https://api.balldontlie.io/v1").replace(/\/$/, "");
      if (!key || !players || !players.length) {
        return Promise.resolve();
      }
      var defaultSeasons =
        (meta && meta.postseasonSeasons) ||
        (cfg.balldontliePostseasonSeasons && cfg.balldontliePostseasonSeasons.slice()) ||
        [2025];

      var tasks = players.map(function (p) {
        var lp = p.liveProfile;
        if (!lp || typeof lp.balldontliePlayerId !== "number") {
          return Promise.resolve();
        }
        var seasons = lp.postseasonSeasons && lp.postseasonSeasons.length ? lp.postseasonSeasons : defaultSeasons;
        return fetchAllPlayoffSums(key, baseUrl, lp.balldontliePlayerId, seasons).then(function (sums) {
          applySumsToPlayer(p, sums);
        });
      });

      return Promise.all(tasks).catch(function () {}).then(function () {});
    }
  };
})();
