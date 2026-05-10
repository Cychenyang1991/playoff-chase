/**
 * Fix broken meta description tags introduced by naive regex (/> split).
 * Normalizes to:
 *   <meta name="description" data-json-field="seo.description" content="..." />
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const files = fs.readdirSync(root).filter((f) => f.endsWith(".html"));

for (const f of files) {
  const fp = path.join(root, f);
  let html = fs.readFileSync(fp, "utf8");
  const before = html;

  html = html.replace(
    /<meta\s+name="description"\s+content="([^"]*)"\s*\/\s*data-json-field="seo\.description">/gi,
    '<meta name="description" data-json-field="seo.description" content="$1" />'
  );

  html = html.replace(
    /<meta\s+name="description"\s*\n\s*content="([^"]*)"\s*\n\s*\/\s*data-json-field="seo\.description">/gi,
    '<meta name="description" data-json-field="seo.description"\n    content="$1"\n  />'
  );

  if (html !== before) {
    fs.writeFileSync(fp, html, "utf8");
    console.log("fixed single-line meta", f);
  }
}

for (const f of files) {
  const fp = path.join(root, f);
  let html = fs.readFileSync(fp, "utf8");
  if (!html.includes('/ data-json-field="seo.description">')) continue;

  const re =
    /<meta\s+name="description"\s*\n\s*content="([^"]*)"\s*\n\s*\/\s*data-json-field="seo\.description">/gi;
  const after = html.replace(
    re,
    '<meta name="description" data-json-field="seo.description"\n    content="$1"\n  />'
  );
  if (after !== html) {
    fs.writeFileSync(fp, after, "utf8");
    console.log("fixed multiline meta", f);
  }
}
