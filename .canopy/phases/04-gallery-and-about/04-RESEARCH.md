# Phase 4: Gallery and About - Research

**Researched:** 2026-03-01
**Domain:** Astro static pages — image gallery with lightbox, brand story page with reviews
**Confidence:** HIGH

## Summary

Phase 4 builds two content-heavy pages on the existing Astro 5 + Tailwind CSS 4 foundation. The gallery page needs a responsive grid of WebP images with a custom lightbox (no third-party library per CONTEXT.md), plus branded SVG placeholders until real photos arrive. The About page needs a warm brand narrative specific to Mike's Coney Island in Holly, MI, plus a static Google reviews section.

The existing codebase already has skeleton pages (`gallery.astro`, `about.astro`), a `SocialProof.astro` component with review cards, and all the brand theming (colors, fonts, textures) established in `global.css`. The main technical work is: (1) creating the gallery data layer and image grid, (2) building a vanilla JS lightbox as an Astro island, (3) expanding the About page with structured sections and a reviews callout, and (4) generating branded SVG placeholder images.

**Primary recommendation:** Build the gallery with CSS Grid (not masonry — too complex for placeholders), use Astro's built-in `<Image>` component for WebP optimization when real photos arrive, and reuse the star-rating pattern from `SocialProof.astro` for the About page reviews section.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Responsive grid layout: 3 columns desktop, 2 tablet, 1 mobile
- Photos in WebP format with responsive srcset via Astro's Image component
- Click/tap opens lightbox overlay with larger view and close button
- Caption below each photo (optional)
- Gallery data stored as TypeScript array of image objects { src, alt, caption? }
- Branded SVG placeholder cards with warm color palette and "Photo coming soon" text
- Consistent placeholder sizing (4:3 or 3:2 aspect ratio)
- No external URLs — all local files
- Simple lightweight lightbox — no third-party library, build with Astro island
- Dark background overlay, centered larger image, close button (X), click-outside-to-close
- Arrow keys / swipe to navigate between photos
- Escape key to close, no zoom
- About page: hero-style header, 2-3 paragraph brand narrative
- Warm, personal, community-focused tone mentioning Holly, MI
- Photo placeholder for restaurant/owner image
- "What brings people back" highlight cards (2-3)
- Google reviews callout: 3-5 static review quotes with star ratings, reviewer names
- Overall rating badge ("4.8 stars on Google")
- Warm accent background for reviews section
- No dynamic Google API integration

### Claude's Discretion
- Exact gallery grid implementation (CSS Grid vs flexbox masonry)
- Lightbox animation/transition style
- Whether About page includes a timeline/history section or keeps it simple
- Exact number of placeholder gallery images (8-12 suggested)
- Whether to reuse the SocialProof component from homepage or build a separate reviews section for About

### Deferred Ideas (OUT OF SCOPE)
- Video content in gallery
- Dynamic Google reviews via API
- Staff bios / team section
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GALL-01 | Photo gallery page displaying food and atmosphere photos | Gallery data layer + CSS Grid responsive layout |
| GALL-02 | Gallery images optimized for web (WebP format, responsive sizes) | Astro Image component with format/width props; placeholder SVGs for now |
| GALL-03 | Gallery works gracefully with placeholder images until owner provides real photos | Branded SVG placeholders stored locally, swappable data array |
| ABUT-01 | About page with brand story specific to Mike's/Holly, MI | Expanded about.astro with hero, narrative, highlight cards |
| ABUT-02 | Static Google reviews callout with 3-5 highlighted reviews | Dedicated reviews section on About page (separate from homepage SocialProof) |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | 5.18.0 | Static site framework | Already in project, zero-JS by default |
| Tailwind CSS | 4.2.1 | Utility-first CSS | Already in project via @tailwindcss/vite |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| astro:assets | built-in | Image optimization (WebP, srcset) | When real photos are added; placeholder SVGs skip this |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS Grid | CSS Masonry (experimental) | Masonry not supported in Safari/Firefox; Grid with fixed aspect ratio is safer |
| Custom lightbox | GLightbox / Fancybox | Context says no third-party library; custom is lighter and dependency-free |
| Separate reviews component | Reuse SocialProof | About page reviews need different layout (more reviews, different visual weight); build separate |

**Installation:**
No new dependencies needed. Everything uses Astro built-ins and Tailwind.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── gallery/
│   │   ├── GalleryGrid.astro      # Responsive image grid
│   │   ├── GalleryPlaceholder.astro # Single branded SVG placeholder card
│   │   └── Lightbox.astro          # Lightbox overlay (Astro island with <script>)
│   ├── about/
│   │   ├── AboutHero.astro         # Hero header for About page
│   │   ├── BrandStory.astro        # 2-3 paragraph narrative
│   │   ├── HighlightCards.astro    # "What brings people back" cards
│   │   └── ReviewsCallout.astro    # Static Google reviews section
│   └── ...existing components
├── data/
│   ├── gallery.ts                  # Gallery image data array
│   ├── reviews.ts                  # About page review data (separate from homepage)
│   └── ...existing data files
├── pages/
│   ├── gallery.astro               # EXISTS — needs full rebuild
│   └── about.astro                 # EXISTS — needs full rebuild
└── assets/
    └── gallery/                    # Placeholder SVG files (or inline SVGs)
```

### Pattern 1: Gallery Data Layer
**What:** TypeScript array of image objects driving the gallery grid
**When to use:** Always — decouples image data from layout
**Example:**
```typescript
// src/data/gallery.ts
export interface GalleryImage {
  id: string;
  src: string;           // Path to image or placeholder SVG
  alt: string;           // Descriptive alt text
  caption?: string;      // Optional caption
  category: 'food' | 'atmosphere' | 'people';
  isPlaceholder: boolean; // true = branded SVG, false = real photo
}

export const galleryImages: GalleryImage[] = [
  {
    id: 'food-1',
    src: '/images/gallery/placeholder-food-1.svg',
    alt: 'Classic coney dogs with homemade chili sauce',
    caption: 'Our famous coneys',
    category: 'food',
    isPlaceholder: true,
  },
  // ... 8-12 entries
];
```

### Pattern 2: Astro Island Lightbox
**What:** Vanilla JS lightbox rendered as an Astro component with a `<script>` tag
**When to use:** For the gallery photo overlay
**Key considerations:**
- Astro ships zero JS by default; the lightbox script is added via `<script>` in the component
- Use `data-` attributes on gallery items to pass image data to JS
- Trap focus inside lightbox for accessibility (focus the close button on open)
- Listen for keyboard events (Escape, ArrowLeft, ArrowRight)
- Handle touch swipe with pointer events (not a library)

### Pattern 3: Branded SVG Placeholders
**What:** Inline or file-based SVG images with brand colors and "Photo coming soon" text
**When to use:** Until owner provides real photos
**Key approach:**
- Generate SVG with brand colors from global.css (brand-primary, brand-accent, brand-secondary)
- Use 4:3 aspect ratio consistently
- Include a camera/image icon and "Photo coming soon" text
- Different placeholder variants for food vs atmosphere categories
- Store as actual .svg files in public/images/gallery/ so they work as `<img>` sources

### Anti-Patterns to Avoid
- **External placeholder URLs:** Never use picsum.photos, placehold.co, or unsplash. Local SVGs only.
- **Heavy JS lightbox libraries:** No GLightbox, Fancybox, or PhotoSwipe. Build minimal vanilla JS.
- **CSS masonry layout:** `grid-template-rows: masonry` is not supported cross-browser. Use fixed-aspect-ratio grid.
- **Lazy-loading everything:** The first 4-6 gallery images should be eager or have no `loading` attribute. Only lazy-load below the fold.
- **Duplicating review data:** Homepage SocialProof and About page reviews should use DIFFERENT review datasets to avoid redundancy.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image optimization | Manual WebP conversion scripts | Astro `<Image>` / `<Picture>` | Built-in, handles format conversion, srcset, dimensions |
| Touch swipe detection | Full gesture library | Simple pointer event tracking (pointerdown/pointermove/pointerup) | Lightbox only needs left/right swipe; 20 lines of JS |
| Star rating SVGs | Dynamic star generation per-render | Reuse the star SVG pattern from existing SocialProof.astro | Already built and tested |

**Key insight:** The existing SocialProof.astro already has a working star rating implementation. Extract the star SVG markup pattern for reuse in the About page reviews section.

## Common Pitfalls

### Pitfall 1: Layout Shift from Images
**What goes wrong:** Gallery grid jumps around as images load, especially on slow connections
**Why it happens:** No explicit width/height or aspect-ratio on image containers
**How to avoid:** Use `aspect-[4/3]` Tailwind class on every grid cell; placeholder and real images fill the same container
**Warning signs:** CLS (Cumulative Layout Shift) > 0.1 in Lighthouse

### Pitfall 2: Lightbox Focus Trap Missing
**What goes wrong:** User opens lightbox, tabs out to page behind the overlay
**Why it happens:** No focus management in vanilla JS lightbox
**How to avoid:** On open: focus close button, trap Tab/Shift+Tab within overlay. On close: return focus to triggering element.
**Warning signs:** Accessibility audit flags "focus not trapped in dialog"

### Pitfall 3: Placeholder SVGs Not Matching Grid
**What goes wrong:** SVG placeholders render at wrong size or don't fill grid cells
**Why it happens:** SVGs need explicit viewBox and the container needs `object-cover` or equivalent
**How to avoid:** SVGs use viewBox="0 0 400 300" (4:3), container uses `w-full h-full` with `object-cover`
**Warning signs:** Inconsistent cell sizes, SVGs floating in whitespace

### Pitfall 4: About Page Generic Copy
**What goes wrong:** Brand story reads like template text, not specific to Mike's
**Why it happens:** Placeholder copy is too generic
**How to avoid:** Reference Holly, MI by name; mention "Since 1995" from site.ts; use conversational tone
**Warning signs:** Story could apply to any restaurant anywhere

### Pitfall 5: Review Section Looks Like Homepage Duplicate
**What goes wrong:** About page reviews look identical to homepage SocialProof
**Why it happens:** Copy-pasting SocialProof component
**How to avoid:** Use different reviews (5 vs 3), different layout (full-width callout vs card grid), and include the overall Google rating badge prominently
**Warning signs:** User sees same 3 reviews on both pages

## Code Examples

### Responsive Gallery Grid (CSS Grid)
```astro
---
import { galleryImages } from '../data/gallery';
---
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {galleryImages.map((image, index) => (
    <button
      type="button"
      class="group aspect-[4/3] overflow-hidden rounded-lg cursor-pointer relative"
      data-gallery-item
      data-index={index}
      data-src={image.src}
      data-alt={image.alt}
      data-caption={image.caption || ''}
      aria-label={`View ${image.alt}`}
    >
      <img
        src={image.src}
        alt={image.alt}
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading={index < 6 ? 'eager' : 'lazy'}
        width="400"
        height="300"
      />
      {image.caption && (
        <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <p class="text-sm text-white">{image.caption}</p>
        </div>
      )}
    </button>
  ))}
</div>
```

### Lightbox Vanilla JS Pattern
```javascript
// Core lightbox logic (inside <script> tag in Lightbox.astro)
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
let currentIndex = 0;
const items = document.querySelectorAll('[data-gallery-item]');

function openLightbox(index) {
  currentIndex = index;
  const item = items[index];
  lightboxImg.src = item.dataset.src;
  lightboxImg.alt = item.dataset.alt;
  lightboxCaption.textContent = item.dataset.caption;
  lightbox.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  document.getElementById('lightbox-close').focus();
}

function closeLightbox() {
  lightbox.classList.add('hidden');
  document.body.style.overflow = '';
  items[currentIndex].focus(); // Return focus
}

function navigate(direction) {
  currentIndex = (currentIndex + direction + items.length) % items.length;
  openLightbox(currentIndex);
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (lightbox.classList.contains('hidden')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navigate(-1);
  if (e.key === 'ArrowRight') navigate(1);
});
```

### Branded SVG Placeholder
```svg
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#FEF3C7" rx="8"/>
  <rect x="0" y="0" width="400" height="300" fill="#CA8A04" fill-opacity="0.08" rx="8"/>
  <!-- Camera icon -->
  <path d="M180 130h40l8-12h24l8 12h20c4.4 0 8 3.6 8 8v72c0 4.4-3.6 8-8 8H120c-4.4 0-8-3.6-8-8v-72c0-4.4 3.6-8 8-8h20l8-12h24l8 12z" fill="none" stroke="#B91C1C" stroke-width="2" stroke-opacity="0.3"/>
  <circle cx="200" cy="170" r="24" fill="none" stroke="#B91C1C" stroke-width="2" stroke-opacity="0.3"/>
  <!-- Text -->
  <text x="200" y="235" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#B91C1C" fill-opacity="0.5">Photo coming soon</text>
</svg>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<img>` with manual WebP | Astro `<Image>` with `format="webp"` | Astro 3.0+ (2023) | Auto-optimization, srcset generation |
| `@astrojs/image` | `astro:assets` (built-in) | Astro 3.0 | No separate package needed |
| CSS `object-fit` polyfill | Native `object-fit: cover` | All modern browsers | No polyfill needed |
| JS masonry libraries | CSS Grid with fixed aspect ratio | Current | Simpler, lighter, no dependencies |

**Deprecated/outdated:**
- `@astrojs/image`: Replaced by built-in `astro:assets` in Astro 3.0+
- `@astrojs/tailwind`: Replaced by `@tailwindcss/vite` in Tailwind 4

## Open Questions

1. **How many placeholder images?**
   - Context suggests 8-12
   - Recommendation: 9 images (3x3 grid fills nicely on desktop) with variety across food/atmosphere/people categories

2. **Should About page reviews overlap with homepage reviews?**
   - Recommendation: NO. Use different reviews. Homepage has 3 short reviews (social proof teaser). About page has 5 longer reviews (deeper credibility). Different reviewer names.

3. **Lightbox touch swipe — how sophisticated?**
   - Recommendation: Simple left/right swipe using pointer events. No momentum, no pinch-to-zoom. Just detect horizontal swipe > 50px threshold and navigate.

## Sources

### Primary (HIGH confidence)
- Astro 5 documentation: Image component, astro:assets, script handling
- Tailwind CSS 4 documentation: Grid layout, aspect-ratio utility
- Existing codebase: SocialProof.astro, global.css brand tokens, BaseLayout.astro patterns

### Secondary (MEDIUM confidence)
- MDN Web Docs: Pointer Events API for touch swipe detection
- MDN Web Docs: CSS Grid layout specification
- WAI-ARIA: Dialog/lightbox accessibility patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - using existing project dependencies only
- Architecture: HIGH - patterns derived from existing codebase + Astro conventions
- Pitfalls: HIGH - common web gallery issues well-documented
- Lightbox: MEDIUM - custom implementation needs testing for edge cases

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable stack, no fast-moving dependencies)
