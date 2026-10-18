# nevark.in

Website for Nevark Technologies LLP. Static site built with [Eleventy](https://www.11ty.dev/) and Tailwind CSS v4, deployed on Netlify (behind Cloudflare).

## Run it locally

```bash
npm install
npm run dev        # http://localhost:8080
npm test           # full build + link/CSP/SEO checks + HTML validation
```

## Where things live

| Path | What it is |
| --- | --- |
| `src/_data/*.json` | Site-wide content: company details, legal IDs, clients, metrics, services, industries, milestones, team. See `src/_data/README.md`. |
| `src/projects/*.md` | One file per case study. Front matter drives the cards, filters and detail pages. Add `outcomes` when you have measured results. |
| `src/careers/*.md` | One file per open role. Copy `example-role.md`, fill it in and set `draft: false`. |
| `src/*.njk`, `src/*.md` | Pages (home, about, industries, build-pc, bookmeeting, contact, careers, legal). |
| `src/_includes/` | Layouts and shared partials (header, footer, cards, CTA). |
| `src/css/main.css` | Tailwind entry point and the site's design tokens and components. |
| `src/js/` | Small, dependency-free scripts (nav, reveal, particle background, Build-PC intro, forms, filters). |
| `src/assets/img/` | Source images. Any `<img>` pointing here is converted to AVIF/WebP at several widths at build time. |
| `src/video/` | Web-optimised Build-PC video (made with `scripts/encode-video.mjs`). |
| `src/static/` | Copied to the site root: `_headers` (security + caching), `_redirects`, favicon, manifest. |
| `scripts/` | One-off tools: video encoding, brand icon/OG image generation, post-build checks. |

## Deploying

Netlify reads `netlify.toml` (`npm run build`, publish `_site`). Production currently deploys from the branch selected in Netlify → Site configuration → Build & deploy → Branches. Push a branch to get a branch deploy preview, review it, then switch the production branch.

## Before go-live checklist

- Fill in `src/_data/site.json`: `phone`, `address`, `legal.llpin`, `legal.gstin`, `legal.dpiitCertificate`, `grievanceOfficer.name`.
- Add leadership to `src/_data/team.json` and client outcomes to each project's `outcomes`.
- Confirm the Aquire display font licence (`src/assets/fonts/AQUIRE-LICENSE.txt` says non-commercial).
- Have the Privacy Policy and Terms reviewed by counsel.
