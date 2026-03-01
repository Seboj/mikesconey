# Phase 2: Homepage - Research

**Researched:** 2026-03-01
**Domain:** Astro 5 static site — homepage sections (hero, hours, about teaser, social proof, social links)
**Confidence:** HIGH

## Summary

Phase 2 builds the homepage for Mike's Coney Island on the existing Astro 5 + Tailwind CSS 4 foundation from Phase 1. The current `index.astro` is a minimal placeholder with the restaurant name, tagline, and two CTAs. This phase replaces it with a full-featured homepage: hero section with branded SVG placeholder, hours display, click-to-call, about teaser, social proof, and social media links in the nav.

The technical domain is straightforward — all work is static Astro components with Tailwind CSS styling. No new dependencies are needed. The `site.ts` data singleton already provides hours, phone, social URLs, and all restaurant facts. The main challenge is visual design quality (DSGN-02: must NOT look generic) and performance (HOME-01: hero LCP under 2.5s).

**Primary recommendation:** Build new Astro components for each homepage section, compose them in `index.astro`, and create a branded inline SVG hero placeholder. All data comes from `site.ts` — zero hardcoded content.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Full-bleed hero image spanning viewport width, warm dark overlay for text readability
- Restaurant name "Mike's Coney Island" large and bold, centered
- Tagline below: "Holly's Classic Coney" (or similar — warm, local, not corporate)
- Single CTA button: "View Our Menu" linking to the menu page
- Hero image must use `loading="eager"` and `fetchpriority="high"` — never lazy-load the hero
- Use a branded SVG placeholder hero (warm colors, coney dog illustration style) until real photos arrive
- Hours displayed prominently on homepage — visible without scrolling on mobile (above the fold or near top)
- Use a clean card or section with today's hours highlighted
- Pull hours from site.ts data singleton — never hardcode
- If closed today, show "Closed Today" prominently with next open day
- Short 2-3 sentence about paragraph — personality, not corporate
- "Read Our Story" link to the full About page
- Brief social proof section with warm background, 3 short customer quotes, star rating (placeholder 4.8)
- Instagram and Facebook icons in the header/nav area on desktop, also in footer
- Use simple SVG icons — no third-party icon library needed
- Links open in new tab
- Must NOT look like a generic restaurant template
- Use brand color palette from Phase 1 (deep red, mustard yellow, warm white, charcoal)
- Subtle texture or pattern in section backgrounds to add warmth
- Generous whitespace

### Claude's Discretion
- Exact section ordering below the hero (hours -> about teaser -> social proof is suggested but flexible)
- Spacing and padding values
- Hover effects and micro-interactions
- Exact placeholder illustration style
- Whether to include a "Find Us" mini-map teaser on homepage (or save entirely for Contact page)

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HOME-01 | Hero section with full-bleed food photography, restaurant name, and tagline that loads in under 2.5 seconds (LCP) | Hero component with inline SVG placeholder, `loading="eager"` + `fetchpriority="high"` on img, warm overlay technique via Tailwind |
| HOME-02 | Hours of operation prominently displayed on homepage (not buried in footer) | HoursCard component reading from `site.hours` array, today-highlighting logic, above-the-fold placement |
| HOME-03 | Click-to-call phone number accessible from homepage | Already partially done (CTA exists in current index.astro), ensure `tel:` link is prominent in hero area |
| HOME-04 | Brief about teaser with link to full About page | AboutTeaser component with 2-3 sentences + "Read Our Story" link |
| HOME-05 | Social media links (Instagram, Facebook) visible on homepage | Social icons in Nav.astro header area (desktop) + existing footer coverage |
| DSGN-02 | Visually striking design that stands out from generic Michigan coney island competitor sites | Brand color palette usage, subtle background textures, custom SVG hero, generous whitespace, warm visual identity |
</phase_requirements>

## Standard Stack

### Core (Already Installed — No New Dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | ^5.18.0 | Static site framework | Already in project, zero-JS by default |
| Tailwind CSS | ^4.2.1 | Utility-first CSS | Already configured via `@tailwindcss/vite` |
| @fontsource-variable/outfit | ^5.2.8 | Heading font | Already self-hosted |
| @fontsource-variable/inter | ^5.2.8 | Body font | Already self-hosted |

### No New Dependencies Needed
This phase requires zero npm installs. Everything is Astro components + Tailwind CSS + inline SVG.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline SVG hero placeholder | External placeholder image service | Violates STATE.md rule: "No external placeholder image URLs in production" |
| Simple SVG social icons | Icon library (lucide, heroicons) | Adds dependency for 2 icons — not worth it |
| CSS background textures | Image-based textures | CSS keeps bundle tiny, no extra HTTP requests |

## Architecture Patterns

### Recommended Component Structure
```
src/
├── components/
│   ├── BaseHead.astro          # (exists)
│   ├── Nav.astro               # (exists — add social icons)
│   ├── Footer.astro            # (exists)
│   ├── HeroSection.astro       # NEW — full-bleed hero with SVG placeholder
│   ├── HoursCard.astro         # NEW — today-highlighted hours display
│   ├── AboutTeaser.astro       # NEW — short about + "Read Our Story"
│   └── SocialProof.astro       # NEW — customer quotes + star rating
├── data/
│   ├── site.ts                 # (exists — all data source)
│   └── menu.json               # (exists)
├── pages/
│   └── index.astro             # MODIFY — compose new sections
└── styles/
    └── global.css              # MODIFY — add subtle texture utilities if needed
```

### Pattern 1: Section Components
**What:** Each homepage section is a self-contained Astro component that imports from `site.ts`.
**When to use:** Always — keeps `index.astro` clean and sections reusable.
**Example:**
```astro
---
// HoursCard.astro
import { site } from "../data/site";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const today = days[new Date().getDay()];
---

<section class="...">
  {site.hours.map((h) => (
    <div class:list={[h.day === today && "font-bold text-brand-primary"]}>
      <span>{h.day}</span>
      <span>{h.closed ? "Closed" : `${h.open} – ${h.close}`}</span>
    </div>
  ))}
</section>
```

**Important note on today-highlighting:** Astro builds statically, so `new Date().getDay()` runs at BUILD TIME, not at visit time. For a restaurant site that rebuilds daily (or on content change), this is acceptable. If real-time "open now" status is needed, a small client-side `<script>` can re-highlight at visit time. Recommendation: build static + add a tiny `<script>` that re-checks the day client-side for correctness.

### Pattern 2: Inline SVG Hero Placeholder
**What:** A branded SVG embedded directly in the component, not loaded as an external file.
**When to use:** Until owner provides real food photography.
**Why inline:** Zero HTTP requests, instant render (helps LCP), fully styleable with CSS, trivially replaceable with `<img>` later.

### Pattern 3: Social Icons in Nav
**What:** Add Instagram/Facebook SVG icons to the desktop nav area in Nav.astro.
**When to use:** HOME-05 requires social links visible on homepage — header is the natural place for desktop.
**Approach:** Add icons after the phone number in the desktop nav row. Mobile: already covered by footer (visible when scrolling).

### Anti-Patterns to Avoid
- **Hardcoding hours or phone number in any component** — always use `site.ts` imports
- **Using `loading="lazy"` on the hero image/SVG** — must be eager for LCP
- **Adding external image CDN URLs** — STATE.md explicitly prohibits `picsum.photos` and `placehold.co`
- **Installing icon libraries for 2-3 icons** — just use inline SVGs
- **Making the hero a background-image** — harder to control LCP, harder to swap for real photo later; use foreground `<img>` or inline SVG

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Today's day detection | Manual day-name comparison | `new Date().getDay()` + days array | Standard JS, no edge cases |
| Star rating display | Custom star SVG math | 5 SVG stars with filled/empty based on rating | Simple pattern, no library needed |
| Background texture | Image files | CSS `background-image` with inline SVG data URI or repeating gradient | Zero HTTP requests |
| Responsive images | Custom srcset logic | Astro `<Image>` component (when real photos arrive) | Astro handles format conversion and srcset |

## Common Pitfalls

### Pitfall 1: Static Build Time vs. Visit Time for Hours
**What goes wrong:** `new Date()` in Astro frontmatter runs at build time. If site builds Monday but visitor comes Thursday, "today" is wrong.
**Why it happens:** Astro is static — frontmatter is server-side at build.
**How to avoid:** Add a small `<script>` tag that runs client-side to re-highlight the current day. Keep the static render as a fallback (for no-JS).
**Warning signs:** Hours card always highlights the same day regardless of when you visit.

### Pitfall 2: Hero LCP Regression
**What goes wrong:** Hero image/SVG is not the Largest Contentful Paint element, or it loads too slowly.
**Why it happens:** Lazy loading, render-blocking CSS, or the SVG is too complex.
**How to avoid:** Keep SVG simple (under 10KB), use `fetchpriority="high"` on any `<img>`, ensure no render-blocking resources above the hero.
**Warning signs:** Lighthouse LCP > 2.5s on mobile throttling.

### Pitfall 3: Generic Template Look (DSGN-02 Failure)
**What goes wrong:** Homepage looks like every other restaurant template.
**Why it happens:** Using only default Tailwind utilities without brand personality.
**How to avoid:** Use the brand color palette (deep red, mustard, warm white), add subtle background textures, use the custom fonts (Outfit + Inter), ensure generous whitespace and intentional visual hierarchy.
**Warning signs:** Homepage could pass for any restaurant if you changed the name.

### Pitfall 4: Social Links Not Opening in New Tab
**What goes wrong:** Clicking Instagram/Facebook navigates away from the site.
**Why it happens:** Missing `target="_blank"` and `rel="noopener noreferrer"`.
**How to avoid:** Always add both attributes to external social links.
**Warning signs:** User leaves site when clicking social icon.

### Pitfall 5: Hours Data Closed Day Handling
**What goes wrong:** "Closed" days show "undefined - undefined" instead of "Closed".
**Why it happens:** Not checking the `closed` boolean field on hours entries.
**How to avoid:** Always check `h.closed` before rendering open/close times. Currently no days are marked closed in `site.ts`, but the interface supports it.
**Warning signs:** Template renders time fields for closed days.

## Code Examples

### Hero Section with SVG Placeholder
```astro
---
import { site } from "../data/site";
---

<section class="relative w-full min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden">
  <!-- SVG Placeholder Background -->
  <div class="absolute inset-0 bg-brand-dark">
    <svg class="w-full h-full opacity-20" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
      <!-- Warm-toned abstract food shapes -->
    </svg>
  </div>

  <!-- Dark overlay for text readability -->
  <div class="absolute inset-0 bg-gradient-to-b from-brand-dark/70 via-brand-dark/50 to-brand-dark/80"></div>

  <!-- Content -->
  <div class="relative z-10 text-center px-4">
    <h1 class="font-heading text-4xl md:text-6xl font-bold text-brand-text-light">
      {site.name}
    </h1>
    <p class="text-brand-secondary text-lg md:text-xl mt-3">
      {site.tagline}
    </p>
    <a href="/menu/" class="mt-8 inline-block px-8 py-3 bg-brand-primary text-brand-text-light font-medium rounded hover:bg-brand-primary-light transition-colors">
      View Our Menu
    </a>
  </div>
</section>
```

### Hours Card with Client-Side Today Detection
```astro
---
import { site } from "../data/site";
---

<section id="hours-section">
  <h2>Hours</h2>
  <div id="hours-list">
    {site.hours.map((h) => (
      <div class="hours-row" data-day={h.day}>
        <span>{h.day}</span>
        <span>{h.closed ? "Closed" : `${h.open} – ${h.close}`}</span>
      </div>
    ))}
  </div>
</section>

<script>
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const today = days[new Date().getDay()];
  document.querySelectorAll('.hours-row').forEach(row => {
    if (row.dataset.day === today) {
      row.classList.add('font-bold', 'text-brand-primary');
    }
  });
</script>
```

### Social Icons in Nav (Desktop)
```astro
<!-- Add after phone number in desktop nav -->
<div class="flex items-center gap-2 ml-2">
  <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
    <svg class="w-5 h-5 text-brand-text-light/70 hover:text-brand-secondary transition-colors" fill="currentColor" viewBox="0 0 24 24">
      <!-- Instagram path -->
    </svg>
  </a>
  <a href={site.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
    <svg class="w-5 h-5 text-brand-text-light/70 hover:text-brand-secondary transition-colors" fill="currentColor" viewBox="0 0 24 24">
      <!-- Facebook path -->
    </svg>
  </a>
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind config file (v3) | CSS-based config via `@theme` (v4) | Tailwind v4 (2025) | Project already uses v4 — do NOT create tailwind.config.js |
| `@astrojs/tailwind` integration | `@tailwindcss/vite` plugin | Astro 5 + Tailwind 4 | Project already uses vite plugin — do NOT add astrojs integration |
| External font CDNs | Self-hosted via Fontsource | Standard practice | Already configured — Outfit + Inter Variable |
| `@astrojs/image` component | Built-in `astro:assets` | Astro 3+ | Use `import { Image } from 'astro:assets'` when real photos arrive |

## Open Questions

1. **Real hero photo replacement strategy**
   - What we know: SVG placeholder now, real photo later
   - What's unclear: When owner will provide photos
   - Recommendation: Build the hero component so swapping the SVG for an `<Image>` component requires changing ~3 lines. Document the swap in a code comment.

2. **"Open Now" vs. static today-highlight**
   - What we know: Client-side script can detect today's day
   - What's unclear: Whether to show "Open Now" / "Closed Now" with current time comparison
   - Recommendation: Start with day-highlighting only. Time-based "Open Now" is a nice-to-have that adds complexity (timezone handling, parsing time strings). Can be added in a future iteration.

## Sources

### Primary (HIGH confidence)
- Project codebase inspection — `src/data/site.ts`, `src/pages/index.astro`, `src/styles/global.css`, `src/components/Nav.astro`, `src/components/Footer.astro`, `package.json`, `astro.config.mjs`
- Astro 5 documentation — static rendering, component model, `<Image>` component
- Tailwind CSS 4 — `@theme` configuration, utility classes

### Secondary (MEDIUM confidence)
- LCP optimization patterns — `loading="eager"` + `fetchpriority="high"` for hero images

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, building on existing Phase 1 foundation
- Architecture: HIGH - standard Astro component composition, well-understood patterns
- Pitfalls: HIGH - common static site pitfalls, well-documented

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable stack, no fast-moving dependencies)
