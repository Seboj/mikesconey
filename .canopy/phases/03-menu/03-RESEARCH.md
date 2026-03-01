# Phase 3: Menu - Research

**Researched:** 2026-03-01
**Domain:** Astro static-site menu page with scroll-spy category navigation
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Single-page menu with all categories visible via scroll
- Category navigation at top (sticky or anchored) — tap a category name to jump to that section
- Each category gets a clear heading with a subtle accent divider
- On mobile: vertical single-column layout, items stacked
- On desktop: consider 2-column grid within each category for better use of horizontal space
- Each item shows: name (bold), description (lighter text below), price (right-aligned or on its own line on mobile)
- Clean, readable typography — menu items should be scannable, not dense
- Subtle hover effect on desktop (slight background change or shadow)
- No images per menu item in v1 — keep it clean and text-focused
- Tags (GF, V, Spicy) supported in data structure, render as small colored badges only if present
- Horizontal scrollable category bar at top of menu page
- Sticky below the site nav on scroll so users always have category access
- Active category highlighted as user scrolls through sections
- Categories from menu.json — automatically generated, not hardcoded
- Menu must be the best mobile experience on the site
- Category names in the sticky nav should be abbreviated if needed to fit on 375px screens
- Price should be clearly visible without horizontal scrolling
- Touch targets large enough for easy tapping on category links
- Category headers in deep red or mustard yellow accent
- Light warm background (amber-50) to differentiate from white card backgrounds
- Subtle visual separators between items (hairline divider or spacing, not heavy borders)
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

### Deferred Ideas (OUT OF SCOPE)
- Dietary filtering (show only GF items) — potential v1.x feature after launch
- Menu item photos — would require owner to photograph individual items
- Specials / daily specials section — could be added when owner provides this info
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MENU-01 | Full menu displayed as HTML pages organized by category (not PDF) | Astro component architecture: MenuSection + MenuItem components rendering from menu.json |
| MENU-02 | Menu items show name, description, and price | MenuItem component pattern with proper typography hierarchy |
| MENU-03 | Menu is mobile-friendly with readable text and clear category navigation | Sticky category nav with scroll-spy, responsive layout patterns |
| MENU-04 | Menu content can be updated by editing a single JSON file without touching templates | Data-driven rendering pattern — components receive typed props from menu.json |
</phase_requirements>

## Summary

Phase 3 builds the site's most important page: the full HTML menu. The existing codebase (Astro 5 + Tailwind CSS 4) already has a `menu.astro` page with a placeholder that imports `menu.json` (6 categories, 38 items). The foundation is solid — we need to replace the placeholder with real components.

The core technical challenge is the sticky category navigation bar with scroll-spy highlighting. This requires a small amount of client-side JavaScript (Intersection Observer API) in an otherwise static Astro page. Astro's island architecture supports this cleanly via `<script>` tags in components.

**Primary recommendation:** Build three Astro components (CategoryNav, MenuSection, MenuItem), use native Intersection Observer for scroll-spy, and leverage Tailwind's scroll-behavior utilities for smooth scrolling. No external libraries needed.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | 5.18.0 | Static page generation | Already in project — zero-JS output by default |
| Tailwind CSS | 4.2.1 | Responsive styling | Already in project via @tailwindcss/vite |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Intersection Observer API | Native | Scroll-spy for category nav | Built into all modern browsers, no polyfill needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Intersection Observer | scroll event listener | IO is async, doesn't block main thread, better perf |
| CSS scroll-snap | Manual scroll-spy | snap is too rigid for a menu page, users need free scrolling |
| React/Vue island | Astro `<script>` | Full framework island is overkill for scroll-spy + click handling |

**Installation:**
No new packages needed. Everything is already available in the project.

## Architecture Patterns

### Recommended Component Structure
```
src/
├── components/
│   ├── menu/
│   │   ├── CategoryNav.astro      # Sticky horizontal category bar
│   │   ├── MenuSection.astro      # Category heading + item grid
│   │   └── MenuItem.astro         # Individual item card (name/desc/price/tags)
│   └── ...existing components
├── pages/
│   └── menu.astro                 # Page shell — imports menu.json + renders components
└── data/
    └── menu.json                  # Already exists — 6 categories, 38 items
```

### Pattern 1: Data-Driven Component Rendering
**What:** Astro components receive typed props from JSON data. The page iterates menu.json categories and passes each to MenuSection, which iterates items and passes each to MenuItem.
**When to use:** Always — this is the core pattern for MENU-04 compliance.
**Example:**
```astro
---
// menu.astro
import menuData from "../data/menu.json";
import CategoryNav from "../components/menu/CategoryNav.astro";
import MenuSection from "../components/menu/MenuSection.astro";
---
<CategoryNav categories={menuData.categories} />
{menuData.categories.map((category) => (
  <MenuSection category={category} />
))}
```

### Pattern 2: Scroll-Spy with Intersection Observer
**What:** Each MenuSection has an `id` attribute derived from the category name (slugified). A `<script>` tag on the page sets up an IntersectionObserver that watches all sections and updates the active category in the nav.
**When to use:** For the sticky category navigation highlighting.
**Example:**
```javascript
// Scroll-spy script (in menu.astro or CategoryNav.astro)
const sections = document.querySelectorAll('[data-menu-section]');
const navLinks = document.querySelectorAll('[data-category-link]');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
);

sections.forEach((section) => observer.observe(section));
```

### Pattern 3: Sticky Category Nav Below Site Header
**What:** The category nav uses `position: sticky` with a `top` value that accounts for the site header height (64px / h-16). This puts it right below the main nav.
**When to use:** Always — user locked this decision.
**Key detail:** The main site nav is `sticky top-0 z-50 h-16` with a 4px accent stripe below. Category nav should be `sticky top-[68px] z-40` (64px header + 4px stripe).

### Pattern 4: Slug Generation for Category IDs
**What:** Generate URL-safe IDs from category names for anchor links.
**Example:**
```javascript
// "Coney Dogs" → "coney-dogs"
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
```

### Anti-Patterns to Avoid
- **Hardcoding category names in the nav:** Categories MUST come from menu.json iteration, not hardcoded HTML
- **Using `@astrojs/tailwind`:** Project uses `@tailwindcss/vite` — never add the deprecated integration
- **Framework islands for scroll-spy:** A React/Vue component for this is massive overkill — use a plain `<script>` tag
- **Lazy-loading above-the-fold menu content:** The menu IS the content — render it statically at build time
- **Using `scroll` event for spy:** Use IntersectionObserver — it's non-blocking and more reliable
- **CSS `scroll-behavior: smooth` on `html`:** Can cause issues with page load hash navigation. Apply smooth scrolling only on category nav click via JavaScript.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll-spy | Custom scroll position math | IntersectionObserver | Handles edge cases (fast scroll, resize), non-blocking |
| Responsive grid | Manual breakpoint logic | Tailwind `grid-cols-1 md:grid-cols-2` | Battle-tested, maintainable |
| Slug generation | Complex regex | Simple `.toLowerCase().replace()` | Only 6 category names, don't over-engineer |
| Smooth scrolling | Custom animation | `element.scrollIntoView({ behavior: 'smooth' })` | Native, accessible, respects reduced-motion |

**Key insight:** This phase has zero external dependencies. Everything needed is either already in the project or available as browser-native APIs.

## Common Pitfalls

### Pitfall 1: Sticky Nav Overlap
**What goes wrong:** The sticky category nav overlaps with the sticky site header, creating a double-sticky that covers too much viewport.
**Why it happens:** Both elements use `position: sticky; top: 0` without coordinating.
**How to avoid:** Category nav uses `top: 68px` (header height 64px + accent stripe 4px). Keep the category nav compact (single line, horizontal scroll).
**Warning signs:** Content jumps when scrolling, nav covers menu items on small screens.

### Pitfall 2: Horizontal Scroll on Category Nav Hiding Items
**What goes wrong:** On 375px screens, category names overflow and the rightmost categories are invisible without scrolling.
**Why it happens:** 6 category names don't fit in 375px without scrolling. Users don't know to scroll.
**How to avoid:** Use `overflow-x-auto` with `-webkit-overflow-scrolling: touch` and add visual indicators (gradient fade on right edge) to hint at scrollability. Keep category name text short.
**Warning signs:** Users can't find "Beverages" category on mobile.

### Pitfall 3: Scroll-Spy rootMargin Miscalculation
**What goes wrong:** Active category highlights incorrectly — changes too early or too late as user scrolls.
**Why it happens:** The rootMargin doesn't account for the total sticky header height (site nav + category nav).
**How to avoid:** Set rootMargin top to negative of combined sticky heights (e.g., `-120px`). Test on mobile where sticky elements take proportionally more space.
**Warning signs:** Active category doesn't match what's visually in the viewport.

### Pitfall 4: Anchor Jump Offset
**What goes wrong:** Clicking a category link scrolls to the section, but the heading is hidden behind the sticky headers.
**Why it happens:** Native anchor links scroll the element to the very top of the viewport, behind any sticky elements.
**How to avoid:** Use `scroll-margin-top` CSS on the section elements (e.g., `scroll-mt-32` or appropriate Tailwind class matching sticky header heights). Or use JavaScript `scrollIntoView` with offset calculation.
**Warning signs:** After clicking a category, the heading is not visible.

### Pitfall 5: Tags Rendering When Empty
**What goes wrong:** Empty tag arrays render empty badge containers, creating phantom spacing.
**Why it happens:** The tags array exists but is empty (`[]`) on most items.
**How to avoid:** Conditional rendering — only render the tags container when `tags.length > 0`.
**Warning signs:** Uneven spacing between items that have tags and those that don't.

## Code Examples

### MenuSection Component
```astro
---
// MenuSection.astro
import MenuItem from "./MenuItem.astro";

interface Props {
  category: {
    name: string;
    description: string;
    items: Array<{
      name: string;
      description: string;
      price: string;
      tags: string[];
    }>;
  };
}

const { category } = Astro.props;
const sectionId = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
---

<section id={sectionId} data-menu-section class="scroll-mt-32 mb-12">
  <div class="mb-6">
    <h2 class="font-heading text-2xl md:text-3xl font-bold text-brand-primary">
      {category.name}
    </h2>
    <p class="text-brand-text-muted mt-1">{category.description}</p>
    <div class="h-0.5 w-16 bg-brand-secondary mt-3"></div>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    {category.items.map((item) => (
      <MenuItem item={item} />
    ))}
  </div>
</section>
```

### MenuItem Component
```astro
---
// MenuItem.astro
interface Props {
  item: {
    name: string;
    description: string;
    price: string;
    tags: string[];
  };
}

const { item } = Astro.props;

const tagColors: Record<string, string> = {
  GF: "bg-green-100 text-green-800",
  V: "bg-emerald-100 text-emerald-800",
  Spicy: "bg-red-100 text-red-800",
};
---

<div class="group flex justify-between gap-4 p-4 rounded-lg hover:bg-white/60 transition-colors">
  <div class="flex-1 min-w-0">
    <div class="flex items-center gap-2 flex-wrap">
      <h3 class="font-heading font-semibold text-brand-text-heading">{item.name}</h3>
      {item.tags.length > 0 && item.tags.map((tag) => (
        <span class={`text-xs font-medium px-1.5 py-0.5 rounded ${tagColors[tag] || "bg-gray-100 text-gray-700"}`}>
          {tag}
        </span>
      ))}
    </div>
    <p class="text-sm text-brand-text-muted mt-1 leading-relaxed">{item.description}</p>
  </div>
  <div class="flex-shrink-0 font-heading font-semibold text-brand-text-heading">
    {item.price}
  </div>
</div>
```

### CategoryNav Component
```astro
---
// CategoryNav.astro
interface Props {
  categories: Array<{ name: string }>;
}

const { categories } = Astro.props;

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
---

<nav
  class="sticky top-[68px] z-40 bg-brand-light/95 backdrop-blur-sm border-b border-brand-divider"
  aria-label="Menu categories"
>
  <div class="mx-auto max-w-4xl px-4 md:px-8">
    <div class="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
      {categories.map((cat) => (
        <a
          href={`#${slugify(cat.name)}`}
          data-category-link
          class="flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-full text-brand-text-muted hover:text-brand-primary hover:bg-brand-accent transition-colors whitespace-nowrap"
        >
          {cat.name}
        </a>
      ))}
    </div>
  </div>
</nav>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `scroll` event listeners | IntersectionObserver | 2019+ (universal support) | Non-blocking, GPU-friendly |
| jQuery scroll-to plugins | Native `scrollIntoView({ behavior: 'smooth' })` | 2020+ | Zero dependencies |
| CSS `position: fixed` + JS offset | CSS `position: sticky` | 2017+ (universal support) | Declarative, no JS needed |
| Manual scroll offset calculation | CSS `scroll-margin-top` | 2020+ | One CSS property vs JS math |
| Tailwind v3 `@apply` | Tailwind v4 `@theme` + CSS variables | 2024 | Already using v4 in project |

**Deprecated/outdated:**
- `@astrojs/tailwind` integration: Replaced by `@tailwindcss/vite` — project already uses the correct approach
- jQuery-based scroll plugins: Native APIs cover all needs
- `scroll` event for intersection detection: IntersectionObserver is universally supported and more performant

## Open Questions

1. **Scroll-spy rootMargin fine-tuning**
   - What we know: The combined sticky height is ~116px (68px header + ~48px category nav)
   - What's unclear: Exact category nav height depends on padding/font choices
   - Recommendation: Use `-120px 0px -60% 0px` as starting point, adjust during implementation

2. **Category nav scrollbar visibility on mobile**
   - What we know: `overflow-x-auto` creates a scrollbar on some mobile browsers
   - What's unclear: Whether the scrollbar disappears after initial scroll on iOS Safari
   - Recommendation: Use `scrollbar-hide` utility (or CSS `scrollbar-width: none; -webkit-overflow-scrolling: touch`) and add a subtle gradient fade on the right edge to hint at more content

## Sources

### Primary (HIGH confidence)
- Astro project codebase — direct inspection of existing components, layout, data structure
- menu.json — 6 categories, 38 items, tags array on each item (GF, V, Spicy)
- MDN IntersectionObserver — standard API documentation
- MDN scrollIntoView — standard API documentation
- MDN scroll-margin-top — standard CSS property documentation

### Secondary (MEDIUM confidence)
- Tailwind CSS v4 documentation — @theme variable system, utility classes
- Astro documentation — component props, script tags, static rendering

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies, everything is native or already installed
- Architecture: HIGH — straightforward component decomposition from existing patterns
- Pitfalls: HIGH — well-known CSS/JS issues with sticky elements and scroll-spy

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable — no fast-moving dependencies)
