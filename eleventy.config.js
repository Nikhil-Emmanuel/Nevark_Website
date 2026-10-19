import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import { buildSync } from "esbuild";
import { minify } from "html-minifier-terser";

const require = createRequire(import.meta.url);
const isServe = process.argv.includes("--serve");
const OUTPUT = "_site";

/* Icons: project overrides in src/_includes/icons, everything else from lucide-static */
const LUCIDE_DIR = path.join(path.dirname(require.resolve("lucide-static/package.json")), "icons");
const iconCache = new Map();
function readIcon(name) {
  if (iconCache.has(name)) return iconCache.get(name);
  const local = path.join("src/_includes/icons", `${name}.svg`);
  const file = fs.existsSync(local) ? local : path.join(LUCIDE_DIR, `${name}.svg`);
  if (!fs.existsSync(file)) throw new Error(`Unknown icon "${name}"`);
  const svg = fs.readFileSync(file, "utf8")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s*class="[^"]*"/, "")
    .replace(/\s+/g, " ")
    .trim();
  iconCache.set(name, svg);
  return svg;
}

/* Compile Tailwind once per build (and on every rebuild in --serve) */
function buildCss() {
  const cli = path.join(path.dirname(require.resolve("@tailwindcss/cli/package.json")), "dist/index.mjs");
  fs.mkdirSync(path.join(OUTPUT, "css"), { recursive: true });
  execFileSync(process.execPath, [cli, "-i", "src/css/main.css", "-o", `${OUTPUT}/css/main.css`, "--minify"], {
    stdio: ["ignore", "ignore", "inherit"],
  });
}

/* Bundle the few scripts that import npm packages (src/_scripts/*.js -> /js/*.js) */
function buildScripts() {
  buildSync({
    entryPoints: ["src/_scripts/about-scene.js"],
    outdir: `${OUTPUT}/js`,
    bundle: true,
    minify: true,
    format: "esm",
    target: ["es2020", "safari15"],
    legalComments: "none",
    logLevel: "warning",
  });
}

const hashCache = new Map();
function fileHash(file) {
  if (!isServe && hashCache.has(file)) return hashCache.get(file);
  const hash = createHash("sha256").update(fs.readFileSync(file)).digest("hex").slice(0, 10);
  hashCache.set(file, hash);
  return hash;
}

export default function (eleventyConfig) {
  eleventyConfig.on("eleventy.before", buildCss);
  eleventyConfig.on("eleventy.before", buildScripts);
  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/_scripts/");
  eleventyConfig.setServerOptions({ watch: [`${OUTPUT}/css/main.css`, `${OUTPUT}/js/about-scene.js`] });

  /* Static files */
  eleventyConfig.addPassthroughCopy({ "src/assets/fonts/*.woff2": "assets/fonts" });
  eleventyConfig.addPassthroughCopy({ "src/assets/icons": "assets/icons" });
  eleventyConfig.addPassthroughCopy({ "src/assets/og": "assets/og" });
  eleventyConfig.addPassthroughCopy({ "src/video": "video" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });

  /* Responsive AVIF/WebP for every <img> pointing at a local raster file */
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["avif", "webp", "auto"],
    widths: [480, 960, "auto"],
    urlPath: "/assets/img/",
    outputDir: `${OUTPUT}/assets/img/`,
    sharpAvifOptions: { quality: 55 },
    sharpWebpOptions: { quality: 72 },
    sharpPngOptions: { compressionLevel: 9, palette: true },
    htmlOptions: {
      imgAttributes: { loading: "lazy", decoding: "async", sizes: "(min-width: 1024px) 960px, 100vw" },
    },
  });

  /* Shortcodes & filters */
  eleventyConfig.addShortcode("icon", (name, cls = "w-5 h-5", label = "") => {
    const a11y = label ? `role="img" aria-label="${label}"` : `aria-hidden="true" focusable="false"`;
    return readIcon(name).replace("<svg", `<svg class="${cls}" ${a11y}`);
  });
  eleventyConfig.addFilter("hashed", (url) => {
    const src = path.join("src", url);
    const file = url.startsWith("/css/") || !fs.existsSync(src) ? path.join(OUTPUT, url) : src; // built files live in _site
    return `${url}?v=${fileHash(file)}`;
  });
  eleventyConfig.addFilter("absoluteUrl", (url, base) => new URL(url, base).href);
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("readableDate", (d) =>
    new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }));
  eleventyConfig.addFilter("monthYear", (d) =>
    new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", timeZone: "UTC" }));
  eleventyConfig.addFilter("head", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v).replace(/</g, "\\u003c"));
  eleventyConfig.addFilter("projectRefs", (items, base) =>
    items.map((p) => ({ "@type": "CreativeWork", name: p.data.title, url: new URL(p.url, base).href })));
  eleventyConfig.addFilter("breadcrumbList", (crumbs, base) =>
    crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: new URL(c.url, base).href })));
  eleventyConfig.addFilter("where", (arr, key, value) => (arr || []).filter((x) => x.data?.[key] === value || x[key] === value));
  eleventyConfig.addFilter("statusIncludes", (arr, text) => (arr || []).filter((x) => String(x.data.status || "").includes(text)));
  eleventyConfig.addFilter("bySlugs", (arr, slugs = []) => slugs.map((s) => (arr || []).find((x) => x.fileSlug === s)).filter(Boolean));
  eleventyConfig.addFilter("uniqueBy", (arr, key) => [...new Set((arr || []).map((x) => x.data[key]))]);
  eleventyConfig.addFilter("slugifyIndustry", (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));

  /* Collections, newest first */
  const byDate = (a, b) => b.date - a.date;
  /* Projects: `order` front matter first (flagship work leads), then newest */
  const byOrder = (a, b) => (a.data.order ?? 99) - (b.data.order ?? 99) || byDate(a, b);
  eleventyConfig.addCollection("projects", (api) => api.getFilteredByGlob("src/projects/*.md").sort(byOrder));
  eleventyConfig.addCollection("jobs", (api) => api.getFilteredByGlob("src/careers/*.md").filter((j) => !j.data.draft).sort(byDate));

  /* Minify HTML on production builds */
  if (!isServe) {
    eleventyConfig.addTransform("htmlmin", async function (content) {
      if (!(this.page.outputPath || "").endsWith(".html")) return content;
      return minify(content, {
        collapseWhitespace: true,
        conservativeCollapse: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true,
        sortAttributes: true,
      });
    });
  }

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: OUTPUT },
    templateFormats: ["njk", "md", "html", "11ty.js"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
