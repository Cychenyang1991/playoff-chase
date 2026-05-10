/**
 * Add data-site-page, data-json-field on title + meta description, and hydrate-site-pages.js
 * to every *.html except the Google verification file.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const skip = new Set(["google2c89f85cbeacf5ad.html"]);

function patch(html, filename) {
  let out = html;

  if (!/\bdata-site-page=/.test(out)) {
    out = out.replace(/<html\s+lang="en"/i, `<html lang="en" data-site-page="${filename}"`);
  }

  if (!/\bdata-json-field="seo\.title"/.test(out)) {
    out = out.replace(/<title>/i, '<title data-json-field="seo.title">');
  }

  if (!/\bdata-json-field="seo\.description"/.test(out)) {
    out = out.replace(
      /<meta\s+name="description"\s+content="([^"]*)"\s*\/>/gi,
      '<meta name="description" data-json-field="seo.description" content="$1" />'
    );
    out = out.replace(
      /<meta\s+name="description"\s*\n\s*content="([^"]*)"\s*\n\s*\/>/gi,
      '<meta name="description" data-json-field="seo.description"\n    content="$1"\n  />'
    );
  }

  if (!/hydrate-site-pages\.js/.test(out)) {
    const inject =
      '  <script src="js/hydrate-site-pages.js" defer></script>\n';
    if (out.includes("js/site-config.js")) {
      out = out.replace(
        /(<script\s+src="js\/site-config\.js"[^>]*><\/script>\s*\n)/i,
        "$1" + inject
      );
    } else if (out.includes("</body>")) {
      out = out.replace(/<\/body>/i, inject + "</body>");
    }
  }

  return out;
}

const files = fs
  .readdirSync(root)
  .filter((f) => f.endsWith(".html") && !skip.has(f));

for (const f of files) {
  const fp = path.join(root, f);
  const before = fs.readFileSync(fp, "utf8");
  const after = patch(before, f);
  if (after !== before) {
    fs.writeFileSync(fp, after, "utf8");
    console.log("patched", f);
  } else {
    console.log("skip (no changes)", f);
  }
}
