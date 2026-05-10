/**
 * Merge site-pages-extracted.json (from build-site-pages-json.mjs) into players.json → sitePages.
 * Run: node scripts/build-site-pages-json.mjs && node scripts/merge-site-pages-into-players.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const playersPath = path.join(root, "players.json");
const extractedPath = path.join(root, "site-pages-extracted.json");

if (!fs.existsSync(extractedPath)) {
  console.error("Missing", extractedPath, "— run: node scripts/build-site-pages-json.mjs");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(playersPath, "utf8"));
const sitePages = JSON.parse(fs.readFileSync(extractedPath, "utf8"));

data.sitePages = sitePages;
if (!data.meta) data.meta = {};
data.meta.sitePagesNote =
  "Each key is an HTML filename. seo.title / seo.description hydrate <title> and meta description when the page includes js/hydrate-site-pages.js and data-site-page. Add hero.h1, hero.sub (plain) or hero.subHtml (trusted HTML) and bind with data-json-field / data-json-html-field.";

fs.writeFileSync(playersPath, JSON.stringify(data, null, 2), "utf8");
console.log("merged sitePages into players.json, keys:", Object.keys(sitePages).length);
