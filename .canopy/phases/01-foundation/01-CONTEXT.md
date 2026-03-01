# Phase 1: Foundation - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Project skeleton with Astro 5 + Tailwind CSS 4 deployed to Cloudflare Pages, typed data layer (site.ts + menu.json), base layout with navigation and footer, mobile-responsive from 375px up, and self-hosted fonts. No page content beyond the shell — homepage, menu, gallery, about, and contact pages are built in later phases.

</domain>

<decisions>
## Implementation Decisions

### Brand Colors and Visual Identity
- Primary color: Deep red (#B91C1C / red-700) — classic coney island / diner energy, ketchup and hot dogs
- Secondary color: Mustard yellow (#CA8A04 / yellow-600) — the mustard on a coney dog, warm and inviting
- Dark background: Charcoal slate (#1E293B / slate-800) — for header band and footer
- Light background: Warm white (#FFFBEB / amber-50) — slightly warm, not sterile white
- Accent: Cream (#FEF3C7 / amber-100) — for callout boxes and section backgrounds
- Text colors: Slate-900 for headings, Slate-700 for body, Slate-500 for muted
- Overall vibe: Classic American diner meets modern web — warm, approachable, slightly retro personality without being kitschy

### Typography
- Heading font: A bold display font with personality — something like "Outfit" or "Lexend" via Fontsource (self-hosted, no Google Fonts CDN)
- Body font: Clean, highly readable sans-serif — "Inter" via Fontsource
- Menu item names should feel slightly different from body text (semi-bold, slightly larger)
- No serif fonts — keep it casual and approachable, matching coney island personality

### Navigation Structure
- Pages in nav: Home, Menu, Gallery, About, Contact
- Mobile nav: Hamburger menu with slide-in panel (Astro island for the toggle — only interactive component)
- Desktop nav: Horizontal top bar with restaurant name/logo on left, nav links on right
- Phone number visible in header on desktop (click-to-call), in mobile menu on mobile
- Nav is sticky on scroll (stays at top)
- Active page indicator in nav (underline or color change)

### Data Schema — site.ts
- Restaurant name, tagline, and "since year" (placeholder: "Since 1995")
- Full address (street, city, state, zip)
- Phone number (formatted and raw tel: link)
- Hours of operation (per-day structure: { day, open, close, closed? })
- Social media URLs (Instagram, Facebook — placeholders initially)
- Google Maps embed URL (placeholder)
- Google Maps directions URL (placeholder)
- SEO defaults: site title template, meta description, Open Graph image path

### Data Schema — menu.json
- Top-level: array of categories (e.g., "Coney Dogs", "Burgers", "Sides", "Breakfast", "Beverages")
- Each category: { name, description?, items[] }
- Each item: { name, description?, price, tags?[] } — tags for future dietary callouts (GF, V, Spicy)
- Prices as strings (e.g., "$4.99") not numbers — display-only, no math needed
- Populate with realistic placeholder coney island menu items (coneys, burgers, fries, chili, omelettes, etc.)

### Footer Design
- Three-column layout on desktop: Location/hours | Quick links | Social/contact
- Collapses to stacked on mobile
- Restaurant name and "Holly, Michigan" tagline
- Click-to-call phone number
- Social media icon links
- Copyright line at bottom

### Placeholder Content Strategy
- Use realistic placeholder data that resembles actual coney island restaurant content
- Menu: 5-6 categories with 4-8 items each (classic Michigan coney island menu items)
- Photos: Use local SVG placeholder graphics with branded colors (no external placeholder URLs)
- Hours: Typical diner hours (6 AM - 9 PM weekdays, 7 AM - 10 PM weekends)
- All placeholder content clearly marked in data files with comments

### Claude's Discretion
- Exact Tailwind @theme token naming
- Astro project file structure beyond the standard conventions
- Favicon design (use a simple branded placeholder)
- robots.txt content
- Exact responsive breakpoints beyond the 375px minimum
- Loading spinner / skeleton design choices
- Cloudflare Pages deployment configuration details

</decisions>

<specifics>
## Specific Ideas

- Owner wants this to look "awesome and great" — not a generic template site. The color palette and typography should feel like walking into a warm, bustling coney island joint.
- Michigan coney island competitors have mostly mediocre websites — this should clearly stand out with modern design, fast loading, and personality.
- The site needs to handle absent content gracefully since photos and the real menu PDF haven't been provided yet. Everything should look intentional even with placeholder data.

</specifics>

<deferred>
## Deferred Ideas

- GitHub repository creation — owner requested this; handle after initial code exists (Phase 1 completion or Phase 2)
- Mobile app with inventory management — separate milestone, owner wants to discuss later
- Online ordering integration — potential v2 feature
- Agent to manage the site — explore after site is built

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-01*
