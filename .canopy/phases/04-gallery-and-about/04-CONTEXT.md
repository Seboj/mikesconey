# Phase 4: Gallery and About - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the photo gallery page and the About/brand story page. Both depend on owner-provided assets (photos and brand narrative). Gallery must work gracefully with placeholders until real photos arrive. About page tells Mike's Coney Island story with personality and includes a static Google reviews callout.

</domain>

<decisions>
## Implementation Decisions

### Gallery Page Layout
- Responsive masonry-style or uniform grid layout — 3 columns on desktop, 2 on tablet, 1 on mobile
- Photos displayed in WebP format with responsive srcset via Astro's Image component
- Click/tap on a photo opens a simple lightbox overlay with larger view and close button
- Caption below each photo (optional — only if the photo has one in the data)
- Gallery data stored as a JSON or TypeScript array of image objects { src, alt, caption? }

### Placeholder Strategy for Gallery
- Use branded SVG placeholder cards (same warm color palette) with text like "Photo coming soon"
- Each placeholder should be sized consistently (e.g., 4:3 or 3:2 aspect ratio)
- No external URLs (no picsum.photos, no placehold.co) — all local files
- When owner provides real photos, swap the data array entries — components don't change
- The gallery should look intentional with placeholders, not broken or empty

### Lightbox Behavior
- Simple, lightweight lightbox — no third-party library, build with Astro island
- Click photo → overlay with dark background, centered larger image, close button (X) and click-outside-to-close
- Arrow keys / swipe to navigate between photos
- Escape key to close
- No zoom — just a larger view

### About Page Structure
- Hero-style header with warm background and page title "Our Story"
- Brand narrative section: 2-3 paragraphs telling Mike's Coney Island story
  - Tone: warm, personal, community-focused — "Welcome to Mike's" feeling
  - Mention Holly, MI specifically — local identity matters
  - Reference the tradition of Michigan coney islands
  - Placeholder text should be warm and realistic (not lorem ipsum)
- Photo of the restaurant or owner (placeholder for now)
- "What brings people back" section — 2-3 short highlight cards (e.g., "Classic Coneys", "Homestyle Breakfast", "Friendly Faces")

### Google Reviews Callout
- Dedicated section on the About page: "What Our Customers Say"
- Display 3-5 static customer review quotes (placeholders styled as real reviews)
- Each review: star rating (SVG stars), quote text, reviewer first name
- Overall rating badge: "4.8 stars on Google" or similar
- Warm accent background to make the section visually distinct
- No dynamic Google API integration — these are curated, static quotes

### Visual Consistency
- Both pages use the same brand palette and typography from Phases 1-2
- Gallery page: cleaner, let photos speak — minimal UI chrome
- About page: warmer, more text-heavy — use accent backgrounds for sections
- Both pages should feel like they belong to the same site as the homepage and menu

### Claude's Discretion
- Exact gallery grid implementation (CSS Grid vs flexbox masonry)
- Lightbox animation/transition style
- Whether About page includes a timeline/history section or keeps it simple
- Exact number of placeholder gallery images (8-12 suggested)
- Whether to reuse the SocialProof component from homepage or build a separate reviews section for About

</decisions>

<specifics>
## Specific Ideas

- Gallery should feel like peeking inside the restaurant before visiting — atmosphere, food close-ups, the counter, the people
- About page should NOT read like corporate copy. It should feel like the owner is talking to you. "We've been flipping burgers and topping coneys in Holly for [X] years..."
- The reviews section is social proof — it should make someone think "I need to try this place"
- 84% of diners look at photos before deciding to visit — the gallery is a conversion tool, not decoration

</specifics>

<deferred>
## Deferred Ideas

- Video content in gallery — potential future enhancement if owner provides video
- Dynamic Google reviews via API — too complex for v1, static quotes work fine
- Staff bios / team section — could be added to About page later

</deferred>

---

*Phase: 04-gallery-and-about*
*Context gathered: 2026-03-01*
