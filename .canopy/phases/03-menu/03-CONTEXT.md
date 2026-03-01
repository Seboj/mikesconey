# Phase 3: Menu - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the full HTML menu page — the site's most important feature (80% of visitors come for the menu). Menu items rendered from menu.json data, organized by category, mobile-friendly, no PDF. The menu data structure already exists from Phase 1 with placeholder items. This phase builds the page components and ensures the menu looks great on all screen sizes.

</domain>

<decisions>
## Implementation Decisions

### Menu Page Layout
- Single-page menu with all categories visible via scroll
- Category navigation at top (sticky or anchored) — tap a category name to jump to that section
- Each category gets a clear heading with a subtle accent divider
- On mobile: vertical single-column layout, items stacked
- On desktop: consider 2-column grid within each category for better use of horizontal space

### Menu Item Display
- Each item shows: name (bold), description (lighter text below), price (right-aligned or on its own line on mobile)
- Clean, readable typography — menu items should be scannable, not dense
- Subtle hover effect on desktop (slight background change or shadow)
- No images per menu item in v1 — keep it clean and text-focused (photos go in gallery)
- Tags (GF, V, Spicy) should be supported in the data structure but render as small colored badges only if present

### Category Navigation
- Horizontal scrollable category bar at top of menu page
- Sticky below the site nav on scroll so users always have category access
- Active category highlighted as user scrolls through sections
- Categories from menu.json — automatically generated, not hardcoded

### Mobile Experience
- Menu must be the best mobile experience on the site — this is what people look at on their phones while deciding to visit
- Category names in the sticky nav should be abbreviated if needed to fit on 375px screens
- Price should be clearly visible without horizontal scrolling
- Touch targets large enough for easy tapping on category links

### Visual Style
- Menu page should feel warm and appetizing — use the brand color palette
- Category headers in deep red or mustard yellow accent
- Light warm background (amber-50) to differentiate from white card backgrounds
- Subtle visual separators between items (hairline divider or spacing, not heavy borders)
- The menu page header could include a small illustration or icon (fork/knife, coney dog) for personality

### Data-Driven Rendering
- All menu content rendered from menu.json — zero hardcoded item text in components
- MenuSection component receives a category object and renders heading + items
- MenuItem component receives an item object and renders name/description/price/tags
- Updating the menu = editing menu.json only, no template changes needed

### Claude's Discretion
- Exact scroll-spy implementation for active category highlighting
- Whether category nav uses anchor links or smooth-scroll JavaScript
- Spacing and padding values between items
- Whether to include a "Download PDF Menu" link at the bottom (as secondary option, not primary)
- Any subtle animations or transitions on scroll

</decisions>

<specifics>
## Specific Ideas

- The menu should make you hungry — clean, scannable, appetizing. Not a wall of text.
- Michigan coney island competitors mostly have terrible menu pages (PDF links, tiny text, no mobile thought). This should feel effortless to browse on a phone.
- The existing menu.json from Phase 1 has 6 categories and 38 items — that's the data to render.
- Category navigation is key because coney island menus span breakfast, lunch, dogs, burgers, sides, drinks — users need to jump around.

</specifics>

<deferred>
## Deferred Ideas

- Dietary filtering (show only GF items) — potential v1.x feature after launch
- Menu item photos — would require owner to photograph individual items; gallery covers food photography
- Specials / daily specials section — could be added when owner provides this info

</deferred>

---

*Phase: 03-menu*
*Context gathered: 2026-03-01*
