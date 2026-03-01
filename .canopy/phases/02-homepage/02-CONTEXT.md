# Phase 2: Homepage - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the homepage that makes customers immediately know where Mike's is, when it's open, and how to call. This is the first real page — it validates the visual direction before detail pages are built. Includes hero section, hours display, click-to-call, about teaser, and social links. Menu page, gallery, about, and contact pages are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Hero Section Design
- Full-bleed hero image spanning the viewport width, with a warm dark overlay for text readability
- Restaurant name "Mike's Coney Island" large and bold, centered
- Tagline below: "Holly's Classic Coney" (or similar — warm, local, not corporate)
- Single CTA button: "View Our Menu" linking to the menu page
- Hero image must use `loading="eager"` and `fetchpriority="high"` — never lazy-load the hero
- Use a branded SVG placeholder hero (warm colors, coney dog illustration style) until real photos arrive
- Hero should feel warm and inviting — like you can almost smell the chili dogs

### Hours Display
- Hours displayed prominently on the homepage — visible without scrolling on mobile (above the fold or near top)
- Use a clean card or section with today's hours highlighted
- Pull hours from site.ts data singleton — never hardcode
- If closed today, show "Closed Today" prominently with next open day

### About Teaser Section
- Short 2-3 sentence paragraph about Mike's Coney Island — personality, not corporate
- Tone: "We've been serving Holly's best coneys since [year]. Stop in for a dog, stay for the conversation."
- "Read Our Story" link to the full About page
- Optional: small photo or illustration next to the text

### Social Proof Section
- Brief section before the footer with a warm background
- "What Our Customers Say" or similar heading
- 3 short customer quotes (placeholder text styled as reviews)
- Star rating displayed (placeholder 4.8 stars)
- This section bridges to the full reviews callout on the About page

### Social Media Links
- Instagram and Facebook icons in the header/nav area on desktop
- Also in the footer (already built in Phase 1)
- Use simple SVG icons — no third-party icon library needed
- Links open in new tab

### Visual Identity Execution
- The homepage must NOT look like a generic restaurant template
- Use the brand color palette from Phase 1 (deep red, mustard yellow, warm white, charcoal)
- Subtle texture or pattern in section backgrounds to add warmth (e.g., subtle paper texture)
- Generous whitespace — don't cram everything above the fold
- Design should feel like a modern local restaurant website, not a chain

### Claude's Discretion
- Exact section ordering below the hero (hours → about teaser → social proof is suggested but flexible)
- Spacing and padding values
- Hover effects and micro-interactions
- Exact placeholder illustration style
- Whether to include a "Find Us" mini-map teaser on homepage (or save entirely for Contact page)

</decisions>

<specifics>
## Specific Ideas

- The homepage is where "awesome and great" has to land first. If this page doesn't make someone hungry, we failed.
- Michigan coney island competitors have bland homepages — this should feel alive, warm, and distinctly Mike's.
- The hero needs to work with a placeholder NOW but be trivially swappable when the owner sends real food photography.
- Hours visibility is critical — people visit the site to check if Mike's is open right now.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-homepage*
*Context gathered: 2026-03-01*
