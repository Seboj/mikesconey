# Project Research Summary

**Project:** Mike's Coney Island — Restaurant Website
**Domain:** Local single-location coney island / diner restaurant website (static, content-driven)
**Researched:** 2026-03-01
**Confidence:** HIGH

## Executive Summary

Mike's Coney Island (Holly, MI) needs a fast, mobile-first static website that serves as a digital storefront for a walk-in diner. Research across all four domains converges on a clear, well-understood technical pattern: Astro 5 + Tailwind CSS 4 deployed to Cloudflare Pages. This stack ships zero JavaScript by default, produces perfect Lighthouse scores without special configuration, and has zero ongoing hosting cost. Next.js is overkill for a read-only content site. WordPress and site builders introduce vendor lock-in, monthly costs, and security maintenance that a small restaurant should never carry. The site must be built as a pure static output, with all content rendered at build time from JSON data files.

The recommended approach centers on three architectural decisions made from day one: a typed singleton for all restaurant facts (`site.ts`), a JSON data file for menu content (`menu.json`), and JSON-LD schema markup baked into the base layout. These decisions eliminate the most common long-term failure mode for local restaurant sites — content staleness — by making data changes a single-file edit rather than a code change. The HTML menu (not a PDF link) is the single most important feature, as 80% of visitors come specifically for the menu and Google cannot index PDF content.

The primary risks are content-delivery dependencies (real photos and finalized menu data must come from the owner), a single critical image performance mistake (lazy-loading the hero image destroys LCP), and schema markup being skipped as "extra work." All three are preventable with proper phase sequencing. The build order from architecture research — site config first, layout second, homepage third, content pages fourth, SEO last — eliminates rework by establishing dependencies before dependent components are built.

---

## Key Findings

### Recommended Stack

The stack is settled with high confidence across all sources. Astro 5 (v5.18.0 as of 2026-03-01) is the right framework for a content-driven site: it ships no JavaScript by default, its islands architecture allows surgical interactivity (mobile nav toggle), and its built-in image pipeline handles WebP/AVIF conversion automatically. Tailwind CSS 4 (v4.2.1, stable since January 2025) provides 5x faster full builds and 100x faster incremental builds versus v3, and is configured via CSS `@import` rather than a JavaScript config file. Cloudflare Pages on the free tier provides unlimited bandwidth with no hosting cost — superior to Netlify (125 GB cap) or Vercel for a pure static site.

One critical version-compatibility note: `@astrojs/tailwind` is deprecated for Tailwind v4. The correct integration is `@tailwindcss/vite` registered as a Vite plugin in `astro.config.mjs`. Using the deprecated integration silently pins the project to Tailwind v3.

**Core technologies:**
- **Astro 5.18.0:** Site framework — ships zero JS by default; best-in-class for content sites; islands architecture for selective interactivity
- **Tailwind CSS 4.2.1:** Utility-first styling — CSS-native config, 5-100x faster builds than v3, ideal for one-developer builds
- **@tailwindcss/vite:** Tailwind 4 integration — replaces the deprecated `@astrojs/tailwind`; configured under `vite.plugins` in Astro config
- **Cloudflare Pages:** Hosting and CDN — unlimited bandwidth on free tier, global edge, Git-connected deploys
- **@astrojs/sitemap:** Auto-generates sitemap.xml for search indexing
- **schema-dts:** TypeScript types for JSON-LD structured data, prevents property-name errors at build time

### Expected Features

Research (including owner.com survey of 1,300 US restaurant guests, Homebase 2026 guide, BentoBox, and direct competitor analysis of 6 Michigan coney island sites) establishes a clear feature hierarchy. Michigan coney island competitors largely have functional but unimpressive sites — poor mobile UX, PDF-only menus, no schema markup. A well-executed v1 is a genuine competitive differentiator in this segment.

**Must have (table stakes — v1 launch):**
- HTML menu pages (not PDF) — 80% of visitors come for the menu; Google cannot index PDF content
- Location, hours, and click-to-call phone number — first thing diners check; 91% visit before going
- Mobile-responsive design — 70% of restaurant site traffic is mobile; portrait-first layouts required
- Hero section with strong food photography — visitors decide in 3 seconds; full-bleed hero image critical
- Food and atmosphere photo gallery — 84% look at photos before deciding; owner must provide real photos
- About / brand story page — differentiates a local spot from a chain; Holly, MI community identity
- Google reviews callout (static, 3-5 quotes) — 75% seek social proof before visiting
- Local SEO: JSON-LD Restaurant schema + meta tags — 20-30% CTR improvement; enables rich results
- FAQ section (5-10 questions) — captures voice and AI search traffic ("is Mike's open Sunday?")
- Social media links (Instagram, Facebook) — standard expectation

**Should have (post-launch v1.x):**
- Dietary menu callouts (GF, V, Spicy tags) — reduces phone calls; implement with CSS classes, no JS framework
- Email capture form in footer — if owner wants to build a list for specials
- Online ordering link (external) — prominent button to DoorDash/Grubhub if already in use

**Defer (v2+):**
- Native online ordering — significant complexity; payment processing, fulfillment workflow; flag for app milestone
- Gift card e-commerce — requires payment processing; only worth building on demonstrated owner demand
- Loyalty / rewards program — belongs in the future app milestone

**Anti-features to reject outright:**
- PDF menu served as-is (Google can't index it; mobile unusable)
- Reservation system (coney island / diner is walk-in by nature; mismatched to dining style)
- Embedded live social media feed (adds 200-500ms load time; breaks when APIs change)
- Intro animations / splash screens (68% of diners have skipped a restaurant because of its site)

### Architecture Approach

The architecture is a pure static site with no runtime backend, no database, and no API calls during page load. All content is rendered at build time from two data sources: `src/data/site.ts` (typed singleton for all restaurant facts) and `src/data/menu.json` (structured menu data by category). Components consume these via direct TypeScript imports, ensuring a single update to hours or a phone number propagates to the footer, contact page, and JSON-LD schema simultaneously. Build outputs are HTML/CSS files deployed to Cloudflare's CDN edge; visitors receive pre-built pages with zero JavaScript overhead.

**Build order (established by architecture research — follow this to avoid rework):**
1. `src/data/site.ts` — no dependencies; everything else reads from it; build this first
2. `BaseLayout.astro` + `Nav.astro` + `Footer.astro` — depends on site.ts; establishes page chrome
3. Homepage (`index.astro`) — first thing owner sees; validates visual direction before detail pages
4. Menu page (`menu.astro`) — depends on BaseLayout + menu.json schema; data format must be locked before components are built
5. Gallery page (`gallery.astro`) — scaffold with placeholder local images; owner swaps real photos
6. Contact / Location page (`contact.astro`) — simplest content page; good candidate for last
7. SEO / JSON-LD schema — bake into BaseLayout from day one; validate before any "live" deploy

**Major components:**
1. `BaseLayout.astro` — wraps every page: `<head>`, nav, footer, SEO meta; single source of truth for all head content
2. `SEOHead.astro` — injects JSON-LD Restaurant schema and Open Graph tags; pulls from site.ts singleton
3. `MenuSection.astro` / `MenuItem.astro` — renders menu categories and items from `menu.json`; no hardcoded menu text in component files
4. `HeroSection.astro` — full-bleed image + restaurant name + CTA; hero image must have `loading="eager"` and `fetchpriority="high"`
5. `GalleryGrid.astro` — lazy-loaded image grid; build to handle missing images gracefully with local branded placeholders
6. `LocationCard.astro` — Google Maps embed, address linked to directions, hours, click-to-call phone

### Critical Pitfalls

Research identifies 4 critical pitfalls and 4 moderate pitfalls. The critical ones all relate to content architecture decisions made early; the moderate ones are primarily performance and SEO mistakes.

1. **PDF menu served as-is** — Extract all content from the PDF into `menu.json` before building any UI. The PDF is source material, not the deliverable. A PDF link on the menu page means Google indexes none of the menu items.

2. **Hours and contact info hard-coded in HTML** — Store all restaurant facts in `src/data/site.ts` only. Never type the phone number or hours directly into a template. One update to `site.ts` propagates to footer, contact page, and JSON-LD schema simultaneously.

3. **Gallery built without real photos, then stock photos ship to production** — Define photo requirements (count, orientation, resolution, max file size) before any gallery component work begins. Build the component to degrade gracefully with local placeholder images. Never ship external placeholder URLs (`picsum.photos`, `placehold.co`) to production.

4. **Hero image lazy-loaded, destroying LCP** — The hero image must have `loading="eager"` and `fetchpriority="high"`. Never apply `loading="lazy"` globally to all images. LCP failing the 2.5-second threshold directly hurts search rankings.

5. **Missing JSON-LD Restaurant schema** — Implement from day one in `BaseLayout.astro`. Validate with Google's Rich Results Test before any deploy intended as "live." NAP (Name, Address, Phone) must match exactly across the website, Google Business Profile, and Yelp.

---

## Implications for Roadmap

Based on all four research files, the following phase structure is recommended. Phases are ordered by dependency: data layer before UI, mobile layout before content pages, SEO baked in during construction rather than retrofitted.

### Phase 1: Foundation and Data Architecture

**Rationale:** The typed site config singleton (`site.ts`) and menu data schema (`menu.json`) are zero-dependency starting points that every other component depends on. Building these first eliminates the most common long-term failure mode (content staleness) before any UI work begins. This is the most important architectural decision in the entire project.

**Delivers:** Project scaffolding with Astro + Tailwind v4, typed restaurant data singleton, menu JSON schema, BaseLayout with Nav and Footer, favicon set, robots.txt, and self-hosted fonts. All placeholder data; no real content yet.

**Addresses:** Location/hours/contact (data structure), menu data structure
**Avoids:** Hard-coded hours pitfall, external placeholder URL pitfall, `@astrojs/tailwind` deprecation trap

**Research flag:** Standard patterns — no phase research needed. Stack is fully documented.

---

### Phase 2: Homepage and Core Visual Identity

**Rationale:** The homepage is the first thing the owner sees and validates visual direction before detail pages are built. Establishing brand colors, typography, and hero design early prevents rework across all subsequent pages. The hero section must be built correctly from day one (eager-loaded image, WebP format, explicit dimensions to prevent CLS).

**Delivers:** Homepage with hero section, hours prominently displayed, click-to-call phone number, brief About teaser, and social media links. First Lighthouse audit run.

**Addresses:** Hero section, hours visible on homepage, click-to-call, social media links
**Avoids:** Hero lazy-loading LCP pitfall, mobile-first discipline (design from 375px up from day one)

**Research flag:** Standard patterns — Astro/Tailwind component patterns are well-documented.

---

### Phase 3: Menu Pages

**Rationale:** The HTML menu is the site's most important feature (80% of visitors come specifically for it) and has the most content-delivery risk. Building the menu requires the owner's PDF content, which must be transcribed into `menu.json`. This phase should begin only after the data schema from Phase 1 is locked, and design work should not block on receiving the final PDF — use placeholder menu items with the same category structure as the real menu.

**Delivers:** Full HTML menu page organized by category, dietary callout tags, mobile-friendly vertical layout, and menu items in JSON with no hardcoded content in component files. Owner can update menu by editing one JSON file.

**Addresses:** HTML menu (P1), dietary callouts (P2)
**Avoids:** PDF-as-menu pitfall, menu data staleness pitfall

**Research flag:** Standard patterns — data-driven rendering with Astro is well-documented. No phase research needed.

---

### Phase 4: Gallery and About Pages

**Rationale:** Both pages depend on owner-provided assets (photos for gallery, story/brand copy for About). They are grouped together because they share the same content-delivery dependency. Gallery must be built to degrade gracefully when photos are missing — the component works with local branded placeholders and swaps to real photos when the owner delivers them.

**Delivers:** Photo gallery with lazy-loaded WebP images, lightbox or grid display, local placeholder fallbacks; About/Story page with brand narrative, community identity, and Google reviews callout (3-5 static quotes).

**Addresses:** Photo gallery (P1), About/brand story (P1), Google reviews callout (P1)
**Avoids:** Stock photos in production pitfall, missing alt text pitfall (alt text baked into image data structure)

**Research flag:** Standard patterns, but requires owner coordination checkpoint before this phase begins. Define photo spec (count, orientation, min resolution, max file size) and deliver to owner at Phase 3 kickoff so photos arrive in time for Phase 4.

---

### Phase 5: Contact/Location Page and FAQ

**Rationale:** The contact page is the simplest content page and a good candidate for last among content pages, since the Google Maps embed URL and verified address should be confirmed before it goes live. FAQ is grouped here because both pages target the same user intent (visiting the restaurant) and both enhance local SEO.

**Delivers:** Location page with embedded Google Map, address linked to directions, hours table, click-to-call, FAQ section (5-10 questions targeting voice/AI search queries).

**Addresses:** Location + map (P1), FAQ (P1)
**Avoids:** Address-in-multiple-places pitfall (LocationCard reads from site.ts singleton)

**Research flag:** Standard patterns — no phase research needed.

---

### Phase 6: SEO, Performance Audit, and Launch Prep

**Rationale:** SEO is baked in throughout construction (JSON-LD in BaseLayout, meta tags in every page head) but must be validated as a discrete phase before launch. This phase also runs Lighthouse audits, verifies Core Web Vitals, confirms NAP consistency across Google Business Profile and the website, and completes the "Looks Done But Isn't" checklist from PITFALLS.md.

**Delivers:** Validated JSON-LD Restaurant schema (Google Rich Results Test passing), Open Graph tags on all pages, sitemap.xml submitted to Google Search Console, Lighthouse scores confirmed (LCP < 2.5s, Accessibility > 95, Performance > 90), HTTPS confirmed, NAP consistency verified, favicon set complete.

**Addresses:** Local SEO schema (P1), Open Graph tags, sitemap, Core Web Vitals
**Avoids:** Missing JSON-LD pitfall, lazy-loaded hero LCP pitfall, missing alt text pitfall, NAP mismatch pitfall

**Research flag:** Standard patterns for JSON-LD and Core Web Vitals. Google Rich Results Test and Lighthouse are the validation tools — no phase research needed.

---

### Phase Ordering Rationale

- **Data before UI:** `site.ts` and `menu.json` must exist before any component that displays restaurant facts. Building UI before the data contract is locked causes rework.
- **Homepage before detail pages:** Visual direction validated by owner before investing time in menu/gallery/about components.
- **Menu before gallery:** Menu is higher-value (80% of visitors) and has a longer content-delivery timeline (PDF transcription). Starting earlier reduces deadline risk.
- **Gallery and About together:** Both blocked on owner-provided assets; grouping them creates a single content-delivery checkpoint rather than two.
- **SEO as final phase:** JSON-LD is added to BaseLayout in Phase 1 but validated only in Phase 6, when all page content is accurate and stable. Validating schema against placeholder data wastes cycles.

### Research Flags

Phases with well-documented patterns (skip `/canopy:research-phase`):
- **Phase 1 (Foundation):** Astro + Tailwind v4 setup is fully documented in official sources; version compatibility verified
- **Phase 2 (Homepage):** Astro component patterns and Tailwind utility approach are standard
- **Phase 3 (Menu):** Data-driven rendering with JSON import in Astro is documented in official Astro docs
- **Phase 5 (Contact/FAQ):** Static page with Google Maps embed — no novel patterns
- **Phase 6 (SEO/Launch):** JSON-LD Restaurant schema and Core Web Vitals validation are fully documented

Phases needing owner coordination (not technical research):
- **Phase 3 (Menu):** Requires PDF content transcription; owner must provide PDF at or before Phase 3 start
- **Phase 4 (Gallery/About):** Requires photo delivery and brand story approval from owner; photo spec must be sent to owner at Phase 3 start

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versions verified via npm on 2026-03-01; official docs consulted for all integration patterns; Tailwind v4 + Astro v5 compatibility confirmed |
| Features | HIGH | Based on owner.com survey of 1,300 US guests plus corroboration from 5 industry sources; competitor analysis of 6 Michigan coney island sites conducted |
| Architecture | HIGH | Patterns verified against Astro official docs, Schema.org specs, and Google web.dev; build order derived from documented component dependencies |
| Pitfalls | HIGH | Critical pitfalls corroborated by multiple independent sources including Google official documentation (LCP lazy-loading, structured data); accessibility pitfalls confirmed by BOIA |

**Overall confidence:** HIGH

### Gaps to Address

- **Owner's actual menu content:** The menu data schema can be designed now, but final item names, prices, descriptions, and categories depend on the PDF the owner provides. Build schema with placeholder data; plan a content-transcription step when PDF arrives.
- **Real photography timeline:** The gallery component can be scaffolded, but real launch readiness depends on owner-provided food and atmosphere photos. A photo specification document should be created and delivered to the owner at Phase 3 kickoff.
- **Actual business hours and address:** `site.ts` will be populated with placeholder data initially. The owner must confirm final hours, address, and phone number — and these must match Google Business Profile exactly — before Phase 6 SEO validation.
- **Google Business Profile status:** Whether the GBP listing exists, is claimed, and is accurate is not a code concern but is critical for local SEO. Flag for owner at project kickoff.
- **Domain and DNS:** The target domain (`mikesconey.com` or similar) must be confirmed and pointed to Cloudflare Pages before launch. No blocker for development phases.

---

## Sources

### Primary (HIGH confidence)
- `npm show astro version` — returns 5.18.0 (verified 2026-03-01)
- `npm show tailwindcss version` — returns 4.2.1 (verified 2026-03-01)
- [Tailwind CSS official installation guide for Astro](https://tailwindcss.com/docs/installation/framework-guides/astro) — confirms `@tailwindcss/vite` approach
- [Cloudflare Pages free tier limits](https://developers.cloudflare.com/pages/platform/limits/) — unlimited bandwidth confirmed
- [Astro project structure](https://docs.astro.build/en/basics/project-structure/) — component and layout patterns
- [Astro content collections](https://docs.astro.build/en/guides/content-collections/) — data layer patterns
- [Schema.org/Restaurant](https://schema.org/Restaurant) — JSON-LD type hierarchy
- [Google Local Business Structured Data](https://developers.google.com/search/docs/appearance/structured-data/local-business) — required schema properties
- [Google web.dev — LCP lazy loading](https://web.dev/articles/lcp-lazy-loading) — hero image performance
- [Google web.dev — browser-level image lazy loading](https://web.dev/articles/browser-level-image-lazy-loading) — gallery lazy load patterns
- [BOIA — PDF menus and accessibility](https://www.boia.org/blog/why-pdf-menus-are-a-problem-for-accessibility) — PDF menu anti-pattern
- [owner.com — 6 elements of a perfect restaurant website](https://www.owner.com/blog/restaurant-website-design) — survey of 1,300 US guests

### Secondary (MEDIUM confidence)
- [Homebase 2026 restaurant website guide](https://www.joinhomebase.com/blog/restaurant-website) — feature landscape
- [BentoBox — 10 essential elements](https://www.getbento.com/blog/the-10-essential-elements-of-a-restaurant-website/) — feature validation
- [DoorDash Merchants — restaurant website guide 2026](https://merchants.doordash.com/en-us/blog/building-restaurant-website) — feature validation
- [Chowly — restaurant SEO 2026](https://chowly.com/resources/blogs/how-to-tackle-restaurant-seo-a-guide-to-top-google-rankings-in-2026/) — local SEO patterns
- [Tablein — restaurant website mistakes](https://www.tablein.com/blog/restaurant-website-mistakes) — pitfall validation
- [Tailwind CSS v4 announcement](https://tailwindcss.com/blog/tailwindcss-v4) — stable January 2025
- Michigan coney island competitor analysis: National Coney Island, Leo's, Unique Coney Island, St Clair Coney Island, Bedford Coney, Gillie's Coney Island (direct observation)
- [pagepro.co — Astro vs Next.js 2026](https://pagepro.co/blog/astro-nextjs/) — framework comparison corroboration

---

*Research completed: 2026-03-01*
*Ready for roadmap: yes*
