# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Nevark Website is a static HTML/CSS/JavaScript website for Nevark Technologies, a technology consultancy company. The site showcases services in modern frontend development, backend & APIs, machine learning, cloud services (Azure), AI engineering, and app hosting (Firebase).

## Technology Stack

- **Frontend Framework**: Pure HTML5 with Tailwind CSS (via CDN)
- **Styling**: Tailwind CSS, custom CSS, glassmorphism design patterns
- **JavaScript Libraries**: 
  - GSAP (GreenSock Animation Platform) with ScrollTrigger
  - Three.js for 3D graphics
  - Chart.js for data visualization
  - Lucide icons
- **Fonts**: Custom "Angora" font (from Aquire font family), Inter, Space Grotesk, Audiowide
- **3D Background**: Spline embedded via iframe (`https://my.spline.design/thresholddarkambientui-v0gkZCfi6zXm69kE0wccy70f/`)

## Project Structure

```
Nevark_Website/
├── assests/              # Static assets (note: misspelled "assets")
│   ├── fonts/           # Custom font files (Angora, Aquire)
│   └── *.png, *.jpg     # Images (logos, testimonial photos)
├── *.html               # HTML pages (see below)
├── changes.css          # Custom cursor styles
└── .vscode/             # VS Code settings
```

### HTML Pages

- `home.html` - Main landing page with hero, services, clients, testimonials, and CTA
- `about.html` - About page with 3D animated background using Three.js and GSAP ScrollTrigger
- `projects.html` - Projects showcase page
- `bookMeeting.html` - Contact/booking form with Spline 3D background
- `documentaion.html` - Documentation page (note: misspelled "documentation")
- `Testimonals.html` - Testimonials page (note: misspelled "Testimonials")
- `privacy.html` - Privacy policy
- `terms-condition.html` - Terms and conditions
- `temp.html` - Temporary/development file

## Design System

### Color Palette
- **Dark backgrounds**: `#000000`, `#0a0a0a`, `#0f172a`, `#111827`
- **Glass effects**: `bg-white/5`, `bg-white/10` with backdrop-blur
- **Accent colors**: Indigo (`#6366f1`), Purple (`#8b5cf6`), Cyan, Pink gradients
- **Text**: White (`#ffffff`), Gray variants (`#e2e8f0`, `#d1d5db`)

### Custom Scrollbar
All pages use a custom scrollbar with indigo-to-purple gradient:
```css
::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #6366f1, #8b5cf6);
}
```

### Navigation Pattern
Consistent glassmorphic navigation across all pages:
- Fixed position, centered at top
- Rounded pill shape with backdrop blur
- Links: Home, Projects, About, Bookings
- Brand logo "NEVARK" in top-left corner

### Custom Cursor
`changes.css` implements a glowing cursor effect (disabled on mobile):
- Cyan-to-purple radial gradient
- Follows mouse position
- Hidden on screens ≤768px

## Development Commands

### Viewing the Website
Since this is a static HTML website with no build process:

1. **Using Live Server (recommended)**:
   - Install VS Code extension "Live Server"
   - Right-click `home.html` → "Open with Live Server"
   - Opens at `http://localhost:5500/home.html` (or similar)

2. **Using Python HTTP Server**:
   ```powershell
   python -m http.server 8000
   ```
   Then navigate to `http://localhost:8000/home.html`

3. **Direct file open**:
   - Open `home.html` directly in browser (may have CORS issues with iframe)

### Performance Testing
Test page performance using Chrome DevTools:
```powershell
# Open DevTools (F12)
# Navigate to Lighthouse tab
# Run performance audit
```

Throttle connection to simulate mobile:
- DevTools → Network tab → Throttle to "Fast 3G" or "Slow 3G"
- DevTools → Performance tab → CPU: 4x slowdown

### Git Operations
```powershell
# View git status
git status

# Add changes
git add .

# Commit changes
git commit -m "Description of changes"

# View commit history
git --no-pager log --oneline
```

### Finding Files
```powershell
# List all HTML files
Get-ChildItem -Filter "*.html"

# Search for text in files
Select-String -Path "*.html" -Pattern "search-term"
```

## Architecture Notes

### Page Load Performance
- All external dependencies loaded via CDN (Tailwind, GSAP, Three.js, Lucide)
- Heavy reliance on CDN availability
- **Spline 3D iframe uses lazy loading with Intersection Observer** to prevent blocking initial render
- Animated gradient loading skeleton displays while Spline loads
- Fonts loaded asynchronously using `media="print" onload` technique
- Preconnect hints added for faster CDN resource loading
- No bundling or minification in place

### Font Loading
Custom "Angora" font is loaded via `@font-face` but has inconsistent path references:
- Some files reference `./assests/fonts/aquire-font/Aquire-BW0ox.otf`
- Some files reference `./assets/fonts/aquire-font/Aquire-BW0ox.otf` (incorrect path)
- Actual path is `assests/` (misspelled)

### Animations
- **home.html**: 
  - Canvas wave animation (optimized: reduced wave count on mobile, step rendering, pauses when tab hidden)
  - Counter animations with Intersection Observer
  - Floating elements
  - Lazy-loaded Spline 3D background
- **about.html**: Three.js particle system with parallax scrolling using GSAP ScrollTrigger
- **bookMeeting.html**: Form with lucide icons, glass effects

### Responsive Design
- Mobile-first approach with Tailwind responsive utilities
- Custom breakpoints for navigation collapse
- Mobile: Custom cursor disabled, adjusted layout for small screens

## Common Tasks

### Adding a New Page
1. Create new HTML file in root directory
2. Copy navigation structure from existing page (e.g., `home.html`)
3. Include custom font definitions and scrollbar styles
4. Add Spline iframe background if desired:
   ```html
   <div class="fixed inset-0 -z-10">
     <iframe src="https://my.spline.design/thresholddarkambientui-v0gkZCfi6zXm69kE0wccy70f/" 
             frameborder="0" width="100%" height="100%"></iframe>
   </div>
   ```
5. Update navigation links in all pages to include the new page

### Modifying Styles
- **Global styles**: Add to inline `<style>` tags in each HTML file
- **Custom cursor**: Edit `changes.css`
- **Tailwind utilities**: Use Tailwind CDN classes directly in HTML
- Note: No CSS build process exists; changes are immediate

### Working with Assets
- Add images to `assests/` directory (maintain misspelling for consistency)
- Reference with relative paths: `assests/image-name.png`
- Custom fonts go in `assests/fonts/`

### Updating Content
- Services section: Edit cards in `home.html` (lines 165-233)
- Testimonials: Edit `home.html` (lines 422-454) or `Testimonals.html`
- Client logos: Replace images in `assests/` directory
- Contact form: Modify `bookMeeting.html` (form starts line 115)

## Performance Optimizations

The website has been optimized for smooth, lag-free performance on all devices. See `PERFORMANCE_OPTIMIZATIONS.md` for detailed information.

**Key optimizations in home.html**:
- Lazy loading of Spline 3D background (saves 3-5 seconds on initial load)
- Canvas wave animation optimized for mobile (50-75% CPU reduction)
- Async font loading to eliminate render-blocking
- Removed unused Chart.js library (~200KB savings)
- Animation pauses when tab is not visible (battery/CPU savings)

**Expected Performance**:
- Desktop: ~1-2 seconds to interactive (down from 5-8 seconds)
- Mobile: ~2-3 seconds to interactive (down from 8-12 seconds)
- Smooth 60fps animations on most devices

## Known Issues & Quirks

1. **Typos in filenames**: `assests/` instead of `assets/`, `documentaion.html` instead of `documentation.html`, `Testimonals.html` instead of `Testimonials.html`
2. **Font path inconsistency**: Some files reference incorrect `./assets/` path
3. **No build system**: All dependencies loaded via CDN, no package manager
4. **Duplicated styles**: Font definitions and scrollbar styles repeated in each HTML file

## Code Patterns to Follow

### Adding Icons
Use Lucide icons with the `data-lucide` attribute:
```html
<i data-lucide="icon-name" class="w-5 h-5"></i>
<script>lucide.createIcons();</script>
```

### Glass Effect Cards
Standard pattern for glassmorphic cards:
```html
<div class="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg">
  <!-- content -->
</div>
```

### Consistent Spacing
- Section padding: `py-24 px-6`
- Container max-width: `max-w-7xl` or `max-w-5xl`
- Card padding: `p-8` or `p-10`

### Navigation Updates
When adding or renaming pages, update the navigation in ALL HTML files:
```html
<a href="home.html" class="hover:text-white transition-colors">Home</a>
<a href="projects.html" class="hover:text-white transition-colors">Projects</a>
<a href="about.html" class="hover:text-white transition-colors">About</a>
<a href="bookMeeting.html" class="hover:text-white transition-colors">Bookings</a>
```

## Deployment

The website appears to be designed for Firebase hosting (mentioned in services section). To deploy:

1. Ensure all file paths use relative references
2. Test all internal links work correctly
3. Verify Spline iframe loads properly in production
4. Check CORS policies for external CDN resources
5. Firebase deployment (if configured):
   ```powershell
   firebase deploy
   ```

Note: No firebase configuration files exist in the repository yet.
