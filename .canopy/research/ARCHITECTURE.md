# Architecture Research

**Domain:** Local restaurant website (static, content-focused)
**Researched:** 2026-03-01
**Confidence:** HIGH — patterns verified across Astro official docs, multiple industry guides, and Schema.org specs

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Visitor's Browser                         │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │   Home   │  │  Menu    │  │  Gallery │  │  Contact /   │    │
│  │   Page   │  │   Page   │  │   Page   │  │  Location    │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘    │
│       │              │             │                │            │
├───────┴──────────────┴─────────────┴────────────────┴───────────┤
│                     Shared UI Components                         │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────────┐   │
│  │   Nav    │  │  Footer  │  │       SEO / Schema Head       │   │
│  └──────────┘  └──────────┘  └──────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      Content Layer                               │
│                                                                  │
│  ┌─────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  Menu Data      │  │  Site Config   │  │  Static Assets   │  │
│  │  (JSON/YAML via │  │  (hours, addr, │  │  (images,        │  │
│  │  content coll.) │  │   contact)     │  │   fonts, icons)  │  │
│  └─────────────────┘  └────────────────┘  └──────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                   Build + Deployment Layer                        │
│                                                                  │
│  ┌──────────────────────┐  ┌────────────────────────────────┐   │
│  │   Astro Build        │  │   Static Host (Netlify/        │   │
│  │   (static HTML out)  │  │   Cloudflare Pages / Vercel)   │   │
│  └──────────────────────┘  └────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Key insight:** This is a pure static site. There is no backend server, no database at runtime, no API calls during page load. All content is rendered at build time. The "data layer" is files on disk consumed by Astro's build process.

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| BaseLayout | Wraps every page: `<head>`, nav, footer, SEO meta | `src/layouts/BaseLayout.astro` |
| Nav | Site navigation, mobile hamburger menu | `src/components/Nav.astro` |
| Footer | Address, hours summary, social links, copyright | `src/components/Footer.astro` |
| HeroSection | Full-bleed image + restaurant name + CTA | `src/components/HeroSection.astro` |
| MenuSection | Renders menu categories and items from data | `src/components/MenuSection.astro` |
| GalleryGrid | Lazy-loaded image grid with lightbox | `src/components/GalleryGrid.astro` |
| LocationCard | Map embed, address, hours, phone | `src/components/LocationCard.astro` |
| SEOHead | JSON-LD schema injection, meta tags, Open Graph | `src/components/SEOHead.astro` |
| Menu data | Structured menu items by category | `src/data/menu.json` or `src/content/menu/` |
| Site config | Restaurant name, address, hours, contact | `src/data/site.ts` (typed constants) |

## Recommended Project Structure

```
mikesconey/
├── public/
│   ├── images/              # Restaurant photos (optimized originals)
│   │   ├── gallery/         # Gallery photos, named consistently
│   │   ├── hero.jpg         # Hero/banner image
│   │   └── og-image.jpg     # Open Graph social share image
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── content/
│   │   └── config.ts        # Astro content collection schemas
│   │
│   ├── data/
│   │   ├── menu.json        # Menu categories, items, prices
│   │   └── site.ts          # Typed site config: name, address, hours, phone
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro # Common wrapper: head, nav, footer, SEO
│   │
│   ├── pages/
│   │   ├── index.astro      # Homepage (hero + about teaser + hours + CTA)
│   │   ├── menu.astro       # Full menu display
│   │   ├── gallery.astro    # Photo gallery
│   │   └── contact.astro    # Location, map, hours, phone
│   │
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   ├── HeroSection.astro
│   │   ├── MenuSection.astro    # One category + its items
│   │   ├── MenuItem.astro       # Single menu item card
│   │   ├── GalleryGrid.astro
│   │   └── LocationCard.astro
│   │
│   └── styles/
│       ├── global.css       # CSS reset, font imports, CSS variables
│       └── tokens.css       # Color palette, spacing, typography scale
│
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

### Structure Rationale

- **`src/data/`:** Separates content from presentation. `menu.json` can be updated without touching any component. `site.ts` as typed TypeScript means a typo in an address field causes a build error rather than silent wrong data on the live site.
- **`src/content/`:** Used if menu data grows complex enough to benefit from Astro's content collection validation (Zod schemas, type inference). Start with `src/data/menu.json` and migrate if needed.
- **`public/images/`:** Static assets Astro does not process — useful for images managed externally. Use Astro's `<Image />` component from `src/` imports when build-time optimization is needed.
- **`src/components/`:** One component per distinct UI concern. `MenuSection` renders one category, `menu.astro` maps all categories to `MenuSection` instances. Keeps iteration and styling localized.
- **`src/layouts/BaseLayout.astro`:** Single source of truth for `<head>` content, ensuring SEO and meta tags are consistent across all pages.

## Architectural Patterns

### Pattern 1: Data-Driven Menu Rendering

**What:** Menu content lives in a JSON file. The menu page imports it and maps over categories and items. No hardcoded menu text in component files.

**When to use:** Always — for Mike's Coney Island this is critical because the menu comes from a PDF and will need updates. Changing a price means editing one JSON file, not hunting through template code.

**Trade-offs:** Simple to maintain, no CMS overhead, no database. Limitation: updating menu requires a redeploy (acceptable for this use case — owner is not updating daily).

**Example:**
```typescript
// src/data/menu.json
{
  "categories": [
    {
      "name": "Coneys & Dogs",
      "items": [
        { "name": "Classic Coney", "price": 4.50, "description": "All-beef dog, coney sauce, mustard, onion" },
        { "name": "Chicago Dog", "price": 4.75, "description": "Poppy seed bun, the works" }
      ]
    },
    {
      "name": "Breakfast",
      "items": [...]
    }
  ]
}

// src/pages/menu.astro
---
import menuData from '../data/menu.json';
import MenuSection from '../components/MenuSection.astro';
---
{menuData.categories.map(cat => (
  <MenuSection category={cat} />
))}
```

### Pattern 2: Typed Site Config Singleton

**What:** All restaurant-specific facts (name, address, phone, hours, Google Maps embed URL) live in one exported TypeScript object. Every component that needs this data imports from a single source.

**When to use:** Always — prevents the address from being typed differently in the footer vs. the contact page vs. the JSON-LD schema markup.

**Trade-offs:** Zero overhead. A typed constant means IDE autocomplete and build-time errors if you access a field that doesn't exist.

**Example:**
```typescript
// src/data/site.ts
export const site = {
  name: "Mike's Coney Island",
  tagline: "Holly's Classic Coney Since [year]",
  address: {
    street: "123 Main St",
    city: "Holly",
    state: "MI",
    zip: "48442",
  },
  phone: "(555) 555-5555",
  hours: [
    { days: "Mon–Fri", open: "7:00 AM", close: "3:00 PM" },
    { days: "Sat–Sun", open: "8:00 AM", close: "2:00 PM" },
  ],
  googleMapsEmbedUrl: "https://maps.google.com/...",
} as const;
```

### Pattern 3: JSON-LD Schema in BaseLayout

**What:** Inject Restaurant and Menu schema.org JSON-LD in the `<head>` of every page using the site config singleton. This is what enables Google rich results (star ratings, hours in search results, etc.).

**When to use:** From day one — much easier to add at the start than retrofit later. Critical for local SEO.

**Trade-offs:** Zero runtime cost (it's a static `<script>` tag). Required fields: `name`, `address`, `telephone`, `openingHours`, `servesCuisine`, `url`.

**Example:**
```astro
<!-- src/components/SEOHead.astro -->
---
import { site } from '../data/site';
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": site.name,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": site.address.street,
    "addressLocality": site.address.city,
    "addressRegion": site.address.state,
    "postalCode": site.address.zip
  },
  "telephone": site.phone,
  "servesCuisine": "American, Coney Island",
  "url": Astro.site?.href
};
---
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

## Data Flow

### Build-Time Rendering Flow

```
menu.json / site.ts
       |
       | (imported at build time)
       v
  Astro Pages (.astro)
       |
       | (props passed down)
       v
  Astro Components
       |
       | (Astro build)
       v
  Static HTML + CSS files
       |
       | (deployed to CDN)
       v
  Visitor's Browser (zero JS by default)
```

### Request Flow (Runtime — no server)

```
User visits URL
       |
       v
CDN Edge Node (Netlify/Cloudflare)
       |
       | (serves pre-built HTML file)
       v
Browser renders page
       |
       | (native loading="lazy" on images)
       v
Gallery images load as user scrolls
```

### Key Data Flows

1. **Menu display:** `src/data/menu.json` → `src/pages/menu.astro` → `MenuSection.astro` → `MenuItem.astro` → static HTML at build
2. **Site info reuse:** `src/data/site.ts` → imported by `BaseLayout.astro`, `Footer.astro`, `LocationCard.astro`, and `SEOHead.astro` — single source, no drift
3. **Images:** placed in `public/images/` or imported into `src/` for Astro image optimization → served from CDN, lazy-loaded in browser

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Launch (local restaurant) | Static site on Netlify free tier — zero cost, handles easily |
| 1k–100k monthly visitors | Same architecture — CDN edge handles this trivially; add Cloudflare in front if desired |
| Menu updates needed frequently | Add a headless CMS (Contentful, Sanity) as data source — Astro's content loaders support this without changing component architecture |
| Online ordering added later | Add a separate route or iframe embed from a third-party ordering service (Toast, Square) — doesn't require rewriting the static site |

### Scaling Priorities

1. **First bottleneck:** Image load time on slow mobile connections — solved at launch with `loading="lazy"` on all gallery images and Astro's built-in `<Image />` optimization (WebP conversion, responsive sizes)
2. **Second bottleneck:** Menu freshness — if owner wants to update menu without a redeploy, integrate a lightweight CMS as a data source (Sanity has a free tier; Astro supports it natively)

## Anti-Patterns

### Anti-Pattern 1: Embedding the Menu as a PDF Download

**What people do:** Link to a PDF of the menu as the "menu page" — common shortcut for restaurants.

**Why it's wrong:** PDFs are not crawlable by search engines, not mobile-friendly, cannot be styled to match the brand, and block Google from indexing menu item names (which drives local search traffic for "coney island Holly MI"). Google explicitly recommends HTML menus over PDFs.

**Do this instead:** Parse the PDF menu once into `menu.json` at project setup. Render it as structured HTML. Update JSON when menu changes.

### Anti-Pattern 2: Hardcoding Restaurant Info in Multiple Places

**What people do:** Type the phone number in the footer template, the contact page, and the JSON-LD schema separately.

**Why it's wrong:** When hours change or the phone number changes, three places need updating. One will be missed. Schema markup shows stale hours in Google Search for months.

**Do this instead:** Use the `site.ts` singleton pattern. One update propagates everywhere at the next build.

### Anti-Pattern 3: Skipping Mobile-First Layout

**What people do:** Design desktop layout first, bolt on responsive CSS afterward.

**Why it's wrong:** Restaurant sites receive 70–85% mobile traffic (users checking hours and menus on the go). A desktop-first approach produces cramped mobile views that require horizontal scrolling or tiny text — directly causing visitors to bounce. Google's Mobile-First Index also penalizes non-mobile-optimized sites in rankings.

**Do this instead:** Design every component starting at 375px width. Use CSS Grid and Flexbox with responsive breakpoints. Test on actual phone before shipping any page.

### Anti-Pattern 4: No Image Optimization

**What people do:** Drop raw DSLR photos (5–10 MB JPEG) directly into the gallery.

**Why it's wrong:** Kills LCP score, burns mobile data, causes layout shift. A gallery of 12 unoptimized food photos will take 30+ seconds to load on a slow connection.

**Do this instead:** Use Astro's built-in `<Image />` component which auto-converts to WebP and generates responsive srcset. For `public/` images, pre-process with Squoosh or sharp to under 200KB per image before adding to the repo.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google Maps | Embed iframe on contact page | Free, reliable, no API key needed for embed-only |
| Google Business Profile | JSON-LD schema + NAP consistency | Not a code integration — ensure name/address/phone match exactly |
| Facebook / Instagram | Social links in footer | Link-only, no SDK needed for v1 |
| Future online ordering | iframe embed or link-out | Toast, Square, or DoorDash can be added without restructuring the site |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `site.ts` → all components | Direct TypeScript import | Single source of truth for restaurant facts |
| `menu.json` → menu page | Direct JSON import | Validated by Zod schema in content config |
| `BaseLayout` → all pages | Astro slot injection | Pages pass title/description as props; layout handles head |
| `public/images` → components | Direct URL reference (`/images/...`) | No build processing; pre-optimize before adding |
| `src/assets/images` → components | Astro `<Image />` component | Build-time WebP conversion and srcset generation |

## Build Order Implications for Roadmap

Components depend on each other in this order. Build in this sequence to avoid rework:

1. **Site config (`src/data/site.ts`)** — No dependencies. Everything else reads from it. Build first.
2. **BaseLayout + Nav + Footer** — Depends on site.ts. Once done, all pages have consistent chrome.
3. **Homepage** — Depends on BaseLayout and HeroSection. The first thing the owner sees; validates the visual direction before building detail pages.
4. **Menu page** — Depends on BaseLayout + menu.json structure. Menu data format must be decided before building MenuSection components.
5. **Gallery page** — Depends on BaseLayout + placeholder images. Can be scaffolded with placeholders; owner swaps in real photos.
6. **Contact / Location page** — Depends on BaseLayout + site.ts. Simplest content page; good candidate for last so map embed URL is tested.
7. **SEO / Schema markup** — Can be added incrementally but should be complete before any deployment intended as "live."

## Sources

- [Astro Project Structure — Official Docs](https://docs.astro.build/en/basics/project-structure/) (HIGH confidence)
- [Astro Content Collections — Official Docs](https://docs.astro.build/en/guides/content-collections/) (HIGH confidence)
- [Astro Components — Official Docs](https://docs.astro.build/en/basics/astro-components/) (HIGH confidence)
- [Schema.org Restaurant Type](https://schema.org/Restaurant) (HIGH confidence)
- [Restaurant website structure guide — ishopo.ca](https://www.ishopo.ca/blog/guide-to-building-a-restaurant-website/) (MEDIUM confidence — industry guide)
- [Astro vs Next.js for content sites 2026 — pagepro.co](https://pagepro.co/blog/astro-nextjs/) (MEDIUM confidence — multiple sources agree)
- [Restaurant SEO checklist 2026 — thedigitalrestaurant.com](https://thedigitalrestaurant.com/restaurant-seo-checklist/) (MEDIUM confidence — industry guide)
- [Browser-level image lazy loading — web.dev](https://web.dev/articles/browser-level-image-lazy-loading) (HIGH confidence — Google official)
- [Astro in 2026 for content sites — DEV Community](https://dev.to/polliog/astro-in-2026-why-its-beating-nextjs-for-content-sites-and-what-cloudflares-acquisition-means-6kl) (MEDIUM confidence — community article)
- [Netlify demo-restaurant-sites-data — GitHub](https://github.com/netlify/demo-restaurant-sites-data) (MEDIUM confidence — official Netlify reference project)

---
*Architecture research for: Local restaurant website (Mike's Coney Island, Holly MI)*
*Researched: 2026-03-01*
