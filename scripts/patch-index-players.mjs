import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const fp = path.join(root, "index.html");
let html = fs.readFileSync(fp, "utf8");

const needleStart = "      var PLAYER_PAGES = {";
const needleMid = "      };\n\n      var PLAYERS = [";
const needleMidCr = "      };\r\n\r\n      var PLAYERS = [";
const needleEndWin = "      ];\r\n\r\n      function getPlayerById";
const needleEndUnix = "      ];\n\n      function getPlayerById";

let mid = html.indexOf(needleMidCr) >= 0 ? needleMidCr : needleMid;
let endM = html.indexOf(needleEndWin) >= 0 ? needleEndWin : needleEndUnix;

const i0 = html.indexOf(needleStart);
const i1 = html.indexOf(mid);
const i2 = html.indexOf(endM);
if (i0 < 0 || i1 < 0 || i2 < 0) {
  console.error("patch markers", i0, i1, i2);
  process.exit(1);
}

const insert = `      /* Player data lives in players.json (optional live totals: js/nba-live.js + NBA_SITE_CONFIG). */
      var PLAYER_PAGES = {};
      var PLAYERS = [];

      function normalizeStatusTemplate(tpl) {
        if (!tpl) {
          return function () {
            return "";
          };
        }
        if (typeof tpl === "string") {
          return function () {
            return tpl;
          };
        }
        if (tpl.kind === "milestone-gap") {
          var gapTemplate = String(tpl.template || "");
          var gapMilestoneIndex = typeof tpl.milestoneIndex === "number" ? tpl.milestoneIndex : 0;
          var gapTplVars = {};
          if (tpl.vars && typeof tpl.vars === "object") {
            for (var gvk in tpl.vars) {
              if (Object.prototype.hasOwnProperty.call(tpl.vars, gvk)) {
                gapTplVars[gvk] = tpl.vars[gvk];
              }
            }
          }
          return function (p) {
            var m = p.milestones && p.milestones[gapMilestoneIndex];
            if (!m) return "";
            var gap = m.target - m.current;
            var str = gapTemplate;
            str = str.replace(/\{\{gap\}\}/g, String(gap));
            str = str.replace(/\{\{current\}\}/g, String(m.current));
            str = str.replace(/\{\{target\}\}/g, String(m.target));
            var merged = {};
            for (var gk in gapTplVars) {
              if (Object.prototype.hasOwnProperty.call(gapTplVars, gk)) {
                merged[gk] = gapTplVars[gk];
              }
            }
            if (p.statusVars && typeof p.statusVars === "object") {
              for (var pk in p.statusVars) {
                if (!Object.prototype.hasOwnProperty.call(merged, pk)) {
                  merged[pk] = p.statusVars[pk];
                }
              }
            }
            for (var rep in merged) {
              str = str.split("{{" + rep + "}}").join(String(merged[rep]));
            }
            return str;
          };
        }
        if (tpl.kind === "assist-gap") {
          return function (p) {
            var m = p.milestones && p.milestones[tpl.milestoneIndex];
            if (!m) return "";
            var gap = m.target - m.current;
            return gap === 1 ? tpl.one || "" : String(tpl.many || "").replace(/\{\{gap\}\}/g, String(gap));
          };
        }
        return function () {
          return "";
        };
      }

      function normalizePlayersFromJson(arr) {
        return (arr || []).map(function (p) {
          var o = {};
          for (var key in p) {
            if (Object.prototype.hasOwnProperty.call(p, key)) {
              o[key] = p[key];
            }
          }
          if (p.statusTemplate) {
            o.statusTemplate = normalizeStatusTemplate(p.statusTemplate);
          }
          return o;
        });
      }

      function loadPlayersThen(done) {
        var cfg = window.NBA_SITE_CONFIG || {};
        var url = String(cfg.playersJsonUrl || "players.json").trim();
        var si = document.getElementById("player-search");
        if (si) {
          si.placeholder = "Loading player data…";
          si.disabled = true;
        }
        fetch(url, { credentials: "same-origin" })
          .then(function (r) {
            if (!r.ok) throw new Error("players " + r.status);
            return r.json();
          })
          .then(function (data) {
            PLAYER_PAGES = data.playerPages || {};
            PLAYERS = normalizePlayersFromJson(data.players || []);
            var meta = data.meta || {};
            if (window.NBALive && typeof window.NBALive.enrich === "function") {
              return window.NBALive.enrich(PLAYERS, meta);
            }
          })
          .catch(function () {
            PLAYER_PAGES = {};
            PLAYERS = [];
          })
          .finally(function () {
            if (si) {
              si.disabled = false;
              si.placeholder = "Enter player name (e.g. Stephen Curry)";
            }
            if (!PLAYERS.length && typeof showToast === "function") {
              showToast("Could not load players.json");
            }
            done();
          });
      }

`;

const before = html.slice(0, i0);
const after = html.slice(i2);
html = before + insert + after;

const needleScriptClose =
  "      }\n    })();\n  </script>\n  <script src=\"js/site-config.js\" defer></script>";
const needleScriptCloseCr =
  "      }\r\n    })();\r\n  </script>\r\n  <script src=\"js/site-config.js\" defer></script>";
const sc = html.indexOf(needleScriptCloseCr) >= 0 ? needleScriptCloseCr : needleScriptClose;
if (html.indexOf(sc) < 0) {
  console.error("script close marker missing");
  process.exit(1);
}
const rep =
  "      }\n" +
  "      loadPlayersThen(function () {});\n" +
  "    })();\n" +
  "  </script>\n" +
  "  <script src=\"js/site-config.js\"></script>\n" +
  "  <script src=\"js/nba-live.js\"></script>";
const repCr =
  "      }\r\n" +
  "      loadPlayersThen(function () {});\r\n" +
  "    })();\r\n" +
  "  </script>\r\n" +
  "  <script src=\"js/site-config.js\"></script>\r\n" +
  "  <script src=\"js/nba-live.js\"></script>";
html = html.replace(sc, html.indexOf(needleScriptCloseCr) >= 0 ? repCr : rep);

fs.writeFileSync(fp, html);
console.log("patched index.html");
