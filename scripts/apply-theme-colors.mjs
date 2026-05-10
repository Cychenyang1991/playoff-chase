/**
 * One-shot theme refresh: replaces legacy near-black neutrals across root *.html.
 * Run from repo root: node scripts/apply-theme-colors.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const skip = new Set(["google2c89f85cbeacf5ad.html"]);

const pairs = [
  ["--bg: #0a0a0a;", "--bg: #10131a;"],
  ["--bg-elevated: #141414;", "--bg-elevated: #181c26;"],
  ["--bg-card: #111111;", "--bg-card: #141820;"],
  ["--surface: #141414;", "--surface: #181c26;"],
  ["--card: #111111;", "--card: #141820;"],
  ["--border: #2a2a2a;", "--border: #2e3548;"],
  ["--text: #f0f0f0;", "--text: #eef1f6;"],
  ["--text-muted: #8a8a8a;", "--text-muted: #8b92a3;"],
  ["--muted: #9a9a9a;", "--muted: #8b92a3;"],
  ["--accent: #f5a623;", "--accent: #f2b024;"],
  ["--accent-dim: rgba(245, 166, 35, 0.15);", "--accent-dim: rgba(242, 176, 36, 0.16);"],
  ["--gold: #f5a623;", "--gold: #f2b024;"],
  ["linear-gradient(165deg, #161616 0%", "linear-gradient(165deg, #1f2534 0%"],
  ["linear-gradient(165deg, #0a0a0a 0%", "linear-gradient(165deg, #10131a 0%"],
  ["background: #161616;", "background: #1f2534;"],
  ["background: #141414;", "background: #181c26;"],
  ["color: #0a0a0a;", "color: #10131a;"],
  ["#f5a623", "#f2b024"],
];

const files = fs.readdirSync(root).filter((f) => f.endsWith(".html") && !skip.has(f));

for (const f of files) {
  const fp = path.join(root, f);
  let s = fs.readFileSync(fp, "utf8");
  const orig = s;
  for (const [a, b] of pairs) {
    s = s.split(a).join(b);
  }
  if (s !== orig) {
    fs.writeFileSync(fp, s, "utf8");
    console.log("updated", f);
  } else {
    console.log("unchanged", f);
  }
}
