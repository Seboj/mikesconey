# Phase 1: Foundation - Research

**Researched:** 2026-03-01
**Status:** Complete

## Stack Setup: Astro 5 + Tailwind CSS 4

### Correct Integration Pattern
- **Use `@tailwindcss/vite`** plugin — NOT the deprecated `@astrojs/tailwind` integration
- Install: `npm install tailwindcss @tailwindcss/vite`
- Configure in `astro.config.mjs`:
  ```js
  import { defineConfig } from "astro/config";
  import tailwindcss from "@tailwindcss/vite";
  export default defineConfig({
    vite: { plugins: [tailwindcss()] }
  });
  ```
- Create `src/styles/global.css` with `@import "tailwindcss";`
- Import global.css in the base layout component
- Define brand design tokens in global.css using `@theme { }` block

### Project Initialization
- `npm create astro@latest` to scaffold Astro 5 project
- Select "Empty" template for clean start
- Enable TypeScript (strict mode)
- Add Tailwind via Vite plugin as above (do NOT use `npx astro add tailwind` as it may pull the deprecated integration)

### Tailwind CSS 4 Design Tokens
- Use `@theme { }` in global.css to define brand colors, font families, spacing
- Example:
  ```css
  @import "tailwindcss";
  @theme {
    --color-brand-primary: #B91C1C;
    --color-brand-secondary: #CA8A04;
    --color-brand-dark: #1E293B;
    --color-brand-light: #FFFBEB;
    --color-brand-accent: #FEF3C7;
    --font-heading: "Outfit", sans-serif;
    --font-body: "Inter", sans-serif;
  }
  ```
- Tailwind v4 uses CSS-first configuration — no tailwind.config.js file needed

## Cloudflare Pages Deployment

### Static Site (Recommended for Phase 1)
- Astro pre-renders all pages by default (static output mode)
- No adapter needed for static deployment
- Build command: `npm run build`
- Output directory: `dist/`
- Cloudflare Pages serves static files directly from edge CDN

### Deployment Setup
- Option 1: Connect GitHub repo to Cloudflare Pages dashboard (auto-deploy on push)
- Option 2: Use `wrangler pages deploy dist/` for CLI deployment
- Install wrangler: `npm install -D wrangler`
- Add deploy script to package.json: `"deploy": "astro build && wrangler pages deploy dist/"`
- For Phase 1 without a GitHub repo yet: use direct wrangler upload or Cloudflare Pages dashboard with direct upload

### Important Notes
- Cloudflare is consolidating Pages and Workers — the deployment target remains Cloudflare Pages
- Node.js 18.17.1+ required (Astro 5 requirement)
- No SSR adapter needed since this is a fully static site
- `wrangler.toml` not strictly required for static Pages but useful for project config

## Self-Hosted Fonts via Fontsource

### Setup Pattern
1. Install font packages:
   ```
   npm install @fontsource/outfit @fontsource/inter
   ```
   Or for variable fonts (recommended for performance):
   ```
   npm install @fontsource-variable/outfit @fontsource-variable/inter
   ```
2. Import in base layout:
   ```astro
   ---
   import "@fontsource-variable/outfit";
   import "@fontsource-variable/inter";
   ---
   ```
3. Reference in Tailwind @theme:
   ```css
   @theme {
    --font-heading: "Outfit Variable", sans-serif;
    --font-body: "Inter Variable", sans-serif;
   }
   ```

### Why Variable Fonts
- Single file covers all weights (400-700+) vs multiple static font files
- Smaller total payload for multiple weight usage
- Better browser caching — one file to cache

### Zero Third-Party DNS
- Fontsource bundles font files into node_modules and Vite processes them at build time
- Font files end up in the `dist/_astro/` directory as local assets
- No Google Fonts CDN requests — fully self-hosted
- Verify: After build, no `fonts.googleapis.com` or `fonts.gstatic.com` in output HTML

## Data Layer Architecture

### site.ts — Typed Site Configuration
- Location: `src/data/site.ts`
- Export a typed object with all restaurant facts
- TypeScript interface defines the shape — changing the type catches missing fields at build time
- Pattern:
  ```ts
  export interface SiteConfig {
    name: string;
    tagline: string;
    since: string;
    address: { street: string; city: string; state: string; zip: string; full: string; };
    phone: { display: string; tel: string; };
    hours: Array<{ day: string; open: string; close: string; closed?: boolean; }>;
    social: { instagram: string; facebook: string; };
    maps: { embedUrl: string; directionsUrl: string; };
    seo: { titleTemplate: string; description: string; ogImage: string; };
  }
  export const site: SiteConfig = { /* ... */ };
  ```
- Import in any component: `import { site } from "../data/site";`

### menu.json — Menu Data
- Location: `src/data/menu.json`
- JSON file for easy non-developer editing
- Can optionally define as a content collection with schema validation using Astro 5 Content Layer
- Simple approach for Phase 1: plain JSON import
  ```ts
  // In component
  import menuData from "../data/menu.json";
  ```
- Astro handles JSON imports natively with TypeScript support
- Schema: categories[] > items[] with name, description, price, tags

## Navigation Component

### Desktop Navigation
- Static Astro component — no client-side JavaScript needed
- Sticky header with `position: sticky; top: 0;`
- Active page detection using `Astro.url.pathname`
- Restaurant name/logo on left, nav links on right, phone number on far right

### Mobile Hamburger Menu
- Two approaches:
  1. **Astro `<script>` tag** (recommended for simplicity): Add a `<script>` in the nav component that toggles a class on the menu panel. Zero framework JS.
  2. **Island with `client:media`**: Create a small component (can be vanilla JS or any framework) that only hydrates below a breakpoint. More structured but adds framework dependency.
- Recommended: Use approach 1 — inline `<script>` tag in the Nav component
  - Toggle button shows/hides a slide-in panel
  - Use `aria-expanded`, `aria-controls` for accessibility
  - CSS transition for smooth open/close animation
  - Close on escape key and outside click

### Accessibility Requirements
- Skip navigation link (visually hidden, visible on focus)
- Proper ARIA attributes on mobile menu toggle
- Focus trap inside open mobile menu
- Keyboard navigable (Tab, Escape to close)

## Footer Component

### Layout Pattern
- Three-column grid on desktop (md+ breakpoint)
- Stacked single-column on mobile
- Columns: Location/Hours | Quick Links | Social/Contact
- Dark background (slate-800) with light text
- Copyright line spanning full width at bottom

### Data Binding
- All content from `site.ts` — no hardcoded values
- Hours rendered from `site.hours` array
- Phone from `site.phone.tel` and `site.phone.display`
- Address from `site.address`
- Social links from `site.social`

## Project Structure

```
mikesconey/
├── public/
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   └── BaseHead.astro
│   ├── data/
│   │   ├── site.ts
│   │   └── menu.json
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── menu.astro
│   │   ├── gallery.astro
│   │   ├── about.astro
│   │   └── contact.astro
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Responsive Design

### Mobile-First Approach
- Start from 375px width (smallest target)
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`
- Key breakpoints: 375px (base), 640px (sm), 768px (md), 1024px (lg)
- Test: No horizontal overflow at 375px — use `overflow-x: hidden` on body as safety net but fix root causes

### Critical Checks
- Navigation collapses to hamburger below md (768px)
- Footer stacks below md
- Text remains readable at all sizes
- Touch targets minimum 44x44px on mobile
- No fixed-width elements that exceed viewport

## Pitfalls and Warnings

1. **Do NOT use `@astrojs/tailwind`** — it pins to Tailwind v3 and is deprecated
2. **Do NOT hardcode any restaurant fact in templates** — always import from `site.ts`
3. **Do NOT use external placeholder image URLs** — create local SVG placeholders with brand colors
4. **Do NOT forget `@import "tailwindcss"` in global.css** — Tailwind v4 requires this CSS import
5. **Do NOT create `tailwind.config.js`** — Tailwind v4 uses CSS-first configuration via `@theme`
6. **Variable font names include "Variable"** — e.g., `"Outfit Variable"` not `"Outfit"` when using @fontsource-variable
7. **JSON-LD schema stub** — STATE.md says "implement in BaseLayout from Phase 1" — include a basic Restaurant schema stub in BaseHead even though full validation is Phase 6

---

## RESEARCH COMPLETE

*Phase: 01-foundation*
*Research completed: 2026-03-01*
