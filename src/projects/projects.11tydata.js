import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

/* Link-preview image (og:image) per case study: the cover (or `ogSource`) fitted to 1200×630.
   The <img> transform renames files, so the raw /assets/img/… path would 404 for crawlers. */
const OG_DIR = "_site/assets/og/projects";
async function ogImageFor(data) {
  const src = data.ogSource || data.cover;
  if (!src) return undefined;
  const input = path.join("src", src);
  const name = `${data.page.fileSlug}.jpg`;
  const output = path.join(OG_DIR, name);
  const fresh = fs.existsSync(output) && fs.statSync(output).mtimeMs >= fs.statSync(input).mtimeMs;
  if (!fresh) {
    const background = data.coverBg === "light" ? "#ffffff" : "#0a0a0a";
    const contain = data.ogSource || data.coverFit === "contain";
    fs.mkdirSync(OG_DIR, { recursive: true });
    const inner = contain
      ? await sharp(input).resize(1040, 520, { fit: "inside" }).toBuffer()
      : await sharp(input).resize(1200, 630, { fit: "cover" }).toBuffer();
    await sharp({ create: { width: 1200, height: 630, channels: 3, background } })
      .composite([{ input: inner, gravity: "center" }])
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(output);
  }
  return `/assets/og/projects/${name}`;
}

export default {
  layout: "layouts/case-study.njk",
  permalink: "/projects/{{ page.fileSlug }}/",
  ogType: "article",
  eleventyComputed: {
    ogImage: (data) => data.ogImage || ogImageFor(data),
    breadcrumbs: (data) => [
      { name: "Home", url: "/" },
      { name: "Projects", url: "/projects" },
      { name: data.title, url: data.page.url },
    ],
  },
};
