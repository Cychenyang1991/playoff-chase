/**
 * Legacy extractor: expected inline `var PLAYERS = [` in index.html.
 * The site now loads `players.json` at runtime — edit that file (playerPages, players, meta, sitePages) instead.
 * Do not run this script on a modern index: it overwrites players.json and drops sitePages / custom fields.
 * This script is kept only if you restore an old index layout; otherwise it will exit with an error.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

const start = html.indexOf("var PLAYERS = [");
let endMarker = html.indexOf("      ];\r\n\r\n      function getPlayerById");
if (endMarker < 0) endMarker = html.indexOf("      ];\n\n      function getPlayerById");
if (start < 0 || endMarker < 0) {
  console.error("PLAYERS markers missing", start, endMarker);
  process.exit(1);
}
const src = html.slice(start + "var PLAYERS = ".length, endMarker + 7);
const PLAYERS = eval("(" + src + ")");

function tplFor(p) {
  if (p.id === "lebron") {
    return {
      kind: "milestone-gap",
      milestoneIndex: 1,
      template:
        "LeBron is {{gap}} playoff assists away from passing Magic Johnson for the all-time postseason assists record."
    };
  }
  if (p.id === "curry") {
    return {
      kind: "milestone-gap",
      milestoneIndex: 1,
      template:
        "Curry is {{gap}} playoff points away from passing Jerry West on the all-time postseason scoring list."
    };
  }
  if (p.id === "durant") {
    return {
      kind: "milestone-gap",
      milestoneIndex: 0,
      template:
        "Durant is {{gap}} playoff points from climbing another spot on the all-time postseason scoring list."
    };
  }
  if (p.id === "giannis") {
    return {
      kind: "milestone-gap",
      milestoneIndex: 0,
      template:
        "Giannis is {{gap}} playoff points away from passing Al Horford on the career postseason scoring list."
    };
  }
  if (p.id === "jokic") {
    return {
      kind: "assist-gap",
      milestoneIndex: 0,
      one: "Jokić is 1 playoff assist away from matching Bill Russell's career playoff assist total.",
      many: "Jokić is {{gap}} playoff assists away from matching Bill Russell's career playoff assist total."
    };
  }
  return null;
}

const outPlayers = PLAYERS.map(function (p) {
  var o = Object.assign({}, p);
  delete o.statusTemplate;
  var t = tplFor(p);
  if (t) o.statusTemplate = t;
  return o;
});

const startP = html.indexOf("var PLAYER_PAGES = {");
let endP = html.indexOf("      };\r\n\r\n      var PLAYERS");
if (endP < 0) endP = html.indexOf("      };\n\n      var PLAYERS");
if (startP < 0 || endP < 0) {
  console.error("PLAYER_PAGES markers missing", startP, endP);
  process.exit(1);
}
const pagesSrc = html.slice(startP + "var PLAYER_PAGES = ".length, endP + 7);
const playerPages = eval("(" + pagesSrc + ")");

const data = {
  meta: {
    postseasonSeasons: [2025],
    note:
      "Optional live totals via Ball Don't Lie: set NBA_SITE_CONFIG.balldontlieApiKey (app.balldontlie.io), then per player liveProfile.balldontliePlayerId + per milestone live { stat, baseline }. Display current = baseline + sum(stat) for listed playoff seasons."
  },
  playerPages,
  players: outPlayers
};

fs.writeFileSync(path.join(root, "players.json"), JSON.stringify(data, null, 2));
console.log("wrote players.json", outPlayers.length, "players");
