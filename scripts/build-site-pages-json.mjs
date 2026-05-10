/**
 * One-off helper: scan *.html for <title> and meta description → stdout as JSON fragment.
 * Run: node scripts/build-site-pages-json.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function extractDescription(html) {
  const idx = html.search(/name\s*=\s*["']description["']/i);
  if (idx === -1) return "";
  const slice = html.slice(idx, idx + 4000);
  const cm = slice.match(/content\s*=\s*"((?:\\.|[^"\\])*)"/i);
  if (cm) return cm[1].trim().replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  const cm2 = slice.match(/content\s*=\s*'((?:\\.|[^'\\])*)'/i);
  return cm2 ? cm2[1].trim() : "";
}

function extractHead(html) {
  const titleM = html.match(/<title>([^<]*)<\/title>/i);
  const title = titleM ? titleM[1].trim() : "";
  const description = extractDescription(html);
  return { title, description };
}

const files = fs
  .readdirSync(root)
  .filter((f) => f.endsWith(".html") && f !== "google2c89f85cbeacf5ad.html");

const sitePages = {};
for (const f of files.sort()) {
  const html = fs.readFileSync(path.join(root, f), "utf8");
  const { title, description } = extractHead(html);
  sitePages[f] = {
    seo: { title, description },
  };
}

const outPath = path.join(root, "site-pages-extracted.json");
fs.writeFileSync(outPath, JSON.stringify(sitePages, null, 2), "utf8");
process.stdout.write("wrote " + outPath + "\n");
