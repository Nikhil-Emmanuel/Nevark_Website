---
description: Repository Information Overview
alwaysApply: true
---

# Nevark Website Information

## Summary
Nevark Website is a high-performance, modern static website for Nevark Technologies, a technology consultancy. The site utilizes a "glassmorphism" design aesthetic, featuring 3D background animations (Spline and Three.js), custom typography, and smooth transitions. It is optimized for mobile performance and fast loading times through lazy loading and resource prefetching.

## Structure
The repository follows a flat structure for HTML pages with a dedicated directory for static assets.
- **Root**: Contains all primary HTML pages (`home.html`, `about.html`, etc.), JavaScript logic for animations (`background-waves.js`), and custom styles (`changes.css`).
- **assests/**: (Note: misspelled) Contains subdirectories for fonts (`fonts/`) and various image assets (PNG, JPG) for logos and testimonials.
- **.vscode/**: Project-specific VS Code settings.
- **.zencoder/** & **.zenflow/**: AI-assisted development rules and workflows.

### Main HTML Pages
- `home.html`: Landing page with hero section, service cards, and testimonials.
- `about.html`: Company information featuring a custom Three.js particle background.
- `projects.html`: Portfolio showcase.
- `bookMeeting.html`: Consultation booking form with 3D Spline background.
- `documentaion.html`: (Note: misspelled) Technical documentation and guides.
- `Testimonals.html`: (Note: misspelled) Client feedback section.

## Language & Runtime
**Language**: HTML5, JavaScript (ES6+)  
**CSS**: Tailwind CSS (v3.x via CDN), Custom CSS  
**Build System**: None (Static Site)  
**Package Manager**: None (All libraries loaded via CDN)

## Dependencies
**Main Dependencies (External CDNs)**:
- **Tailwind CSS**: Utility-first CSS framework.
- **GSAP (GreenSock)**: Professional-grade JavaScript animations and ScrollTrigger.
- **Three.js**: 3D engine for particle systems and complex graphics.
- **Spline**: 3D design tool embedded via iframes.
- **Lucide Icons**: Clean, consistent SVG icons.
- **Font Awesome**: Additional iconography.
- **Google Fonts**: Inter, Space Grotesk, Audiowide.

## Build & Installation
This project does not require a build or compilation step. It can be served locally using any static file server.

**Recommended Local Server**:
```bash
# Using Python 3
python -m http.server 8000
```
Then access the site at `http://localhost:8000/home.html`.

## Performance & Optimization
The project includes a dedicated performance strategy documented in `PERFORMANCE_OPTIMIZATIONS.md`.
- **Lazy Loading**: Spline 3D backgrounds are deferred until the page is interactive or visible.
- **Wave Optimization**: `background-waves.js` reduces fidelity on mobile and pauses when the tab is hidden to save CPU.
- **Async Assets**: Fonts and icons are loaded asynchronously to prevent render-blocking.
- **Resource Hints**: `preconnect` and `dns-prefetch` are used for all CDN domains.

## Testing & Validation
Testing is primarily manual and performance-driven.
- **Validation**: Google Lighthouse for Performance, SEO, and Accessibility.
- **Performance Targets**: 
  - Desktop TTI: < 2 seconds.
  - Mobile TTI: < 3 seconds.
- **Lighthouse Goals**: 90+ across all core metrics.

## Development Quirks
- **Filename Typos**: Be aware of `assests/`, `documentaion.html`, and `Testimonals.html`.
- **Font Paths**: Relative paths for custom fonts (`Angora`) may vary between `./assests/` and `assests/`.
- **Global Styles**: Most styling is either Tailwind classes or inline `<style>` blocks in individual HTML files.
