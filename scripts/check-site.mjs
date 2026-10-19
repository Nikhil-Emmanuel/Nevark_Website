// Post-build checks for _site, following Netlify's routing rules.
//   npm run build && node scripts/check-site.mjs
// - internal links/assets resolve (file, file.html, dir/index.html, or a _redirects rule)
// - every URL from the previous sitemap and old file names still resolves
// - CSP-safe markup: no inline scripts (except JSON-LD), no style="" attributes, no on*="" handlers
// - basic SEO/a11y: one <h1>, <title>, meta description, canonical, lang, img alt
// - estimated first-load weight per page (gzip), counting eager images only
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const SITE = "_site";
const errors = [];
const warn = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(SITE);
const htmlFiles = files.filter((f) => f.endsWith(".html"));

const redirects = fs.readFileSync(path.join(SITE, "_redirects"), "utf8").split(/\r?\n/)
  .map((l) => l.trim()).filter((l) => l && !l.startsWith("#")).map((l) => l.split(/\s+/)[0].toLowerCase());

function resolves(urlPath) {
  const p = decodeURIComponent(urlPath.split("#")[0].split("?")[0]);
  if (p === "" || p === "/") return fs.existsSync(path.join(SITE, "index.html"));
  const fsPath = path.join(SITE, p);
  if (fs.existsSync(fsPath) && fs.statSync(fsPath).isFile()) return true;
  if (fs.existsSync(fsPath + ".html")) return true;
  if (fs.existsSync(path.join(fsPath, "index.html"))) return true;
  return redirects.some((r) => (r.endsWith("*") ? p.toLowerCase().startsWith(r.slice(0, -1)) : r === p.toLowerCase()));
}

const gz = (buf) => zlib.gzipSync(buf, { level: 9 }).length;
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const weights = [];

for (const file of htmlFiles) {
  const rel = "/" + path.relative(SITE, file).replace(/\\/g, "/");
  const html = fs.readFileSync(file, "utf8");
  const isRedirectOnly = /http-equiv="refresh"/i.test(html);
  if (isRedirectOnly) continue;

  // Links & assets
  const refs = new Set();
  for (const m of html.matchAll(/\s(?:href|src|poster|data-src-hd|data-src-sd)="([^"]+)"/g)) refs.add(m[1]);
  for (const m of html.matchAll(/\ssrcset="([^"]+)"/g)) m[1].split(",").forEach((c) => refs.add(c.trim().split(/\s+/)[0]));
  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|data:|#)/.test(ref) || ref.startsWith("//")) continue;
    const abs = ref.startsWith("/") ? ref : path.posix.join(path.posix.dirname(rel), ref);
    if (!resolves(abs)) errors.push(`${rel}: broken link/asset ${ref}`);
    const hash = ref.split("#")[1];
    if (hash && ref.split("#")[0].replace(/\/$/, "") === "") {
      if (!html.includes(`id="${hash}"`)) errors.push(`${rel}: missing anchor #${hash}`);
    }
  }
  for (const m of html.matchAll(/href="(\/[^"#?]*)#([^"]+)"/g)) {
    const target = [path.join(SITE, m[1]), path.join(SITE, m[1] + ".html"), path.join(SITE, m[1], "index.html")].find((f) => fs.existsSync(f) && fs.statSync(f).isFile());
    if (target && !fs.readFileSync(target, "utf8").includes(`id="${m[2]}"`)) errors.push(`${rel}: link to missing anchor ${m[1]}#${m[2]}`);
  }

  // Link previews: og:image must point at a file we actually publish
  for (const m of html.matchAll(/<meta[^>]*property="og:image"[^>]*>/g)) {
    const url = (m[0].match(/content="([^"]+)"/) || [])[1] || "";
    const local = url.replace(/^https:\/\/(www\.)?nevark\.in/, "");
    if (local.startsWith("/") && !resolves(local)) errors.push(`${rel}: og:image not published ${local}`);
  }

  // CSP-safe markup
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>/g)) {
    if (!/type="application\/ld\+json"/.test(m[1])) errors.push(`${rel}: inline <script> blocked by CSP`);
  }
  if (/\sstyle="/.test(html)) errors.push(`${rel}: style="" attribute blocked by CSP`);
  if (/\son[a-z]+="/.test(html)) errors.push(`${rel}: inline event handler blocked by CSP`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { errors.push(`${rel}: invalid JSON-LD`); }
  }

  // SEO / a11y basics
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${rel}: ${h1} <h1> elements`);
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${rel}: missing <title>`);
  if (!/<meta content="[^"]{50,}" name="description">|<meta name="description" content="[^"]{50,}">/.test(html)) warn.push(`${rel}: short/missing meta description`);
  if (!/rel="canonical"/.test(html)) errors.push(`${rel}: missing canonical`);
  if (!/<html lang="/.test(html)) errors.push(`${rel}: missing lang`);
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt="/.test(m[0])) errors.push(`${rel}: <img> without alt`);

  // Weight: html + css + js + preloaded fonts + eager images (best format = first <source> or img src)
  let total = gz(Buffer.from(html));
  const assets = new Set();
  for (const m of html.matchAll(/<link[^>]+href="([^"]+)"[^>]*>/g)) if (/stylesheet|preload/.test(m[0])) assets.add(m[1].split("?")[0]);
  for (const m of html.matchAll(/<script[^>]+src="([^"]+)"/g)) assets.add(m[1].split("?")[0]);
  for (const m of html.matchAll(/<picture>(.*?)<\/picture>/g)) {
    if (/loading="lazy"/.test(m[1])) continue;
    const first = m[1].match(/srcset="([^"]+)"/);
    if (first) { const cands = first[1].split(",").map((c) => c.trim().split(/\s+/)[0]); assets.add(cands[Math.min(1, cands.length - 1)]); }
  }
  for (const a of assets) {
    const f = path.join(SITE, a);
    if (fs.existsSync(f)) total += /\.(woff2|avif|webp|png|jpe?g|mp4)$/.test(a) ? fs.statSync(f).size : gz(fs.readFileSync(f));
  }
  weights.push([rel, total]);
}

// URLs that existed before this rebuild must keep working
const legacy = ["/", "/build-pc", "/about", "/projects", "/bookmeeting", "/privacy", "/terms-condition",
  "/index.html", "/projects.html", "/build-pc.html", "/about.html", "/bookMeeting.html", "/privacy.html", "/terms-condition.html",
  "/Testimonals.html", "/documentaion.html", "/home.html", "/favicon.ico", "/sitemap.xml", "/robots.txt"];
for (const u of legacy) if (!resolves(u)) errors.push(`legacy URL no longer resolves: ${u}`);

console.log("\nFirst-load weight (gzip, eager assets only):");
for (const [p, w] of weights.sort((a, b) => b[1] - a[1])) console.log(`  ${kb(w).padStart(10)}  ${p}`);
if (warn.length) console.log(`\nWarnings (${warn.length}):\n  ` + warn.join("\n  "));
console.log(errors.length ? `\nErrors (${errors.length}):\n  ` + errors.join("\n  ") : "\nNo errors.");
process.exit(errors.length ? 1 : 0);
