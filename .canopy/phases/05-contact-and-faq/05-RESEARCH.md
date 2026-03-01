# Phase 5: Contact and FAQ - Research

**Researched:** 2026-03-01
**Domain:** Google Maps embed, accordion FAQ, Astro static pages
**Confidence:** HIGH

## Summary

Phase 5 extends the existing `contact.astro` page skeleton (which already has address, phone, hours, and a "Map coming soon" placeholder) with a real Google Maps iframe embed, enhanced mobile-friendly directions linking, and an accordion FAQ section. The project's `site.ts` already defines `maps.embedUrl` and `maps.directionsUrl` fields with placeholder coordinates. The `HoursCard.astro` component demonstrates the today-highlighting pattern used on the homepage.

This is a straightforward Astro static page build. No new dependencies are needed — Google Maps iframe embeds require no API key, accordion behavior uses native HTML `<details>`/`<summary>` elements (or minimal client-side JS matching the HoursCard pattern), and FAQ data lives in a TypeScript array following the `site.ts` pattern.

**Primary recommendation:** Replace the contact page map placeholder with the `site.maps.embedUrl` iframe, add the accordion FAQ section below the map using a data-driven approach with a new `faq.ts` data file, and enhance the hours display to highlight today (matching the homepage HoursCard pattern).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Two-column layout on desktop: left side has contact details + hours, right side has embedded Google Map
- Stacks vertically on mobile: contact info first, then map below
- Page header with warm accent background: "Find Us" or "Visit Us"
- Large, tappable phone number with phone icon
- Address with a "Get Directions" link that opens Google Maps with the restaurant pre-populated as destination
- Hours displayed in a clean table format (day | open - close), matching the homepage hours card data
- Standard Google Maps iframe embed (no API key needed for basic embed)
- Map centered on the restaurant's location with reasonable zoom level to show surrounding Holly, MI area
- Map takes full width of its column on desktop, full width on mobile
- Use the placeholder embed URL from site.ts — swap to real coordinates when confirmed
- Clean hours table/list format showing all 7 days
- Today's hours highlighted (matching homepage HoursCard behavior)
- Pull from site.ts hours data — same source as homepage
- FAQ placed below the contact info and map on the same page
- "Frequently Asked Questions" section heading with accent styling
- Accordion-style expand/collapse (click question to reveal answer)
- 8-10 questions covering hours, ordering, parking, menu, general, location
- Answers should be conversational, not corporate — match the brand voice
- FAQ data stored in a TypeScript array, not hardcoded in HTML
- FAQ accordion must be keyboard accessible (Enter/Space to toggle)
- Proper aria-expanded and aria-controls attributes
- Map iframe must have descriptive title attribute
- Phone number and address must be semantically marked up

### Claude's Discretion
- Exact FAQ questions and answers (use the categories above as guidance)
- Whether FAQ uses a separate component or is built into the contact page
- Animation style for accordion open/close
- Whether to include an email address or contact form placeholder
- Exact map zoom level and styling

### Deferred Ideas (OUT OF SCOPE)
- Contact form (email submission) — adds complexity, phone/visit is the primary contact method for a diner
- Live chat widget — out of scope for v1
- Event booking / catering inquiries — could be added if owner offers catering
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CONT-01 | Contact/Location page with embedded Google Map showing restaurant location | Google Maps iframe embed using `site.maps.embedUrl`; no API key needed for basic embed |
| CONT-02 | Address linked to Google Maps directions | `site.maps.directionsUrl` already defined; wrap address in anchor tag targeting this URL |
| CONT-03 | Hours of operation displayed clearly on contact page | Reuse `site.hours` data; add today-highlighting script matching HoursCard pattern |
| CONT-04 | Click-to-call phone number on contact page | Already partially implemented in skeleton; uses `site.phone.tel` with `tel:` href |
| FAQQ-01 | FAQ section with 5-10 questions targeting common customer queries | New `faq.ts` data file + accordion component using `<details>`/`<summary>` or aria-expanded pattern |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | 5.18.0 | Static site generator | Already in use; pages are `.astro` files |
| Tailwind CSS | 4.2.1 | Utility-first CSS framework | Already in use via `@tailwindcss/vite` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | - | - | Google Maps embed is a plain iframe; FAQ accordion uses native HTML/JS |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `<details>/<summary>` | Custom JS accordion | `<details>` has built-in keyboard/accessibility but limited animation control; custom JS gives smooth height transitions but needs aria attributes. Given accessibility requirement, use custom JS with aria-expanded for best UX. |
| Google Maps iframe (free, no key) | Google Maps JavaScript API | JS API requires API key and billing; iframe is zero-cost, zero-dependency, and sufficient for a static location display |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── data/
│   ├── site.ts          # Existing: address, phone, hours, maps config
│   └── faq.ts           # NEW: FAQ question/answer array
├── components/
│   └── FaqAccordion.astro  # NEW: Accordion FAQ component
├── pages/
│   └── contact.astro    # MODIFY: Replace skeleton with full implementation
```

### Pattern 1: Data-Driven Content from TypeScript Arrays
**What:** All display content (FAQ questions, hours, site info) lives in typed TypeScript files under `src/data/`, imported at build time by `.astro` components.
**When to use:** Any content that appears on the page and may need updating.
**Example:**
```typescript
// src/data/faq.ts
export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: "What are your hours?",
    answer: "We're open Monday through Friday from 6:00 AM to 9:00 PM, Saturday 7:00 AM to 10:00 PM, and Sunday 7:00 AM to 8:00 PM."
  },
  // ...
];
```

### Pattern 2: Google Maps Iframe Embed (No API Key)
**What:** Standard `<iframe>` embed using the Google Maps embed URL format.
**When to use:** Displaying a static map showing a single location.
**Example:**
```html
<iframe
  src={site.maps.embedUrl}
  width="100%"
  height="400"
  style="border:0;"
  allowfullscreen=""
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
  title="Mike's Coney Island location on Google Maps"
></iframe>
```

### Pattern 3: Accessible Accordion with Client-Side JS
**What:** FAQ items rendered as buttons with controlled content panels, toggled via client-side JavaScript.
**When to use:** When accordion needs keyboard accessibility + smooth animations.
**Example:**
```astro
<div class="faq-item">
  <button
    class="faq-question"
    aria-expanded="false"
    aria-controls="faq-1"
  >
    {item.question}
    <svg class="faq-chevron">...</svg>
  </button>
  <div id="faq-1" class="faq-answer" hidden>
    <p>{item.answer}</p>
  </div>
</div>

<script>
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      const panel = document.getElementById(btn.getAttribute('aria-controls')!);
      if (panel) panel.hidden = expanded;
    });
  });
</script>
```

### Pattern 4: Today-Highlighting for Hours (Matching HoursCard)
**What:** Client-side script that detects today's day of week and adds highlight styling.
**When to use:** Hours display on the contact page, matching the homepage HoursCard pattern.
**Example:** See existing `HoursCard.astro` script — use the same `data-day` attribute approach with `bg-brand-accent/50` highlight classes.

### Anti-Patterns to Avoid
- **Hardcoding contact info in templates:** Always import from `site.ts` — the project enforces single-source-of-truth for phone, address, hours
- **Using Google Maps JavaScript API:** Overkill for a static location pin; requires API key and billing account
- **Hardcoding FAQ content in HTML:** Store in `faq.ts` data file for maintainability
- **Using `<details>/<summary>` without aria attributes:** While native disclosure has built-in accessibility, the animation requirements favor a custom JS approach with explicit aria-expanded/aria-controls
- **Lazy-loading the map iframe on desktop:** Map is the primary content of the page; use `loading="lazy"` only because the map is below the fold in the two-column layout

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Map embedding | Custom map widget with JS API | Google Maps iframe `<iframe>` | Zero dependencies, no API key, free, sufficient for static location |
| Directions linking | Custom routing logic | `https://www.google.com/maps/dir/?api=1&destination=...` URL | Standard Google Maps deep link format; works on mobile and desktop |
| Click-to-call | Custom phone dialer | `<a href="tel:+1...">` | Standard HTML; works on all mobile devices |

**Key insight:** This phase is about assembling standard HTML patterns with the project's existing data layer. No custom engineering is needed — just clean integration.

## Common Pitfalls

### Pitfall 1: Map Embed URL Format
**What goes wrong:** Using the wrong Google Maps embed URL format, resulting in a broken or generic map.
**Why it happens:** Multiple Google Maps URL formats exist (embed, directions, search, place). The embed format uses `/maps/embed` with specific `pb` parameters.
**How to avoid:** Use `site.maps.embedUrl` which is already configured with the correct embed format. The URL should start with `https://www.google.com/maps/embed?pb=`.
**Warning signs:** Map shows generic location or "Google Maps can't find" error.

### Pitfall 2: Hours Data Drift Between Pages
**What goes wrong:** Contact page hours don't match homepage hours.
**Why it happens:** Copying hours data instead of importing from `site.ts`.
**How to avoid:** Always import `{ site }` from `../data/site` and iterate `site.hours`. Never hardcode hours.
**Warning signs:** Different hours showing on different pages.

### Pitfall 3: Accordion Accessibility Gaps
**What goes wrong:** FAQ accordion works with mouse but not keyboard; screen readers can't detect open/closed state.
**Why it happens:** Using `<div>` with `onclick` instead of `<button>` with proper aria attributes.
**How to avoid:** Use `<button>` elements for triggers, `aria-expanded` to indicate state, `aria-controls` to link trigger to panel, and `hidden` attribute on collapsed panels.
**Warning signs:** Tab key doesn't reach FAQ items; Enter/Space doesn't toggle.

### Pitfall 4: Missing iframe title Attribute
**What goes wrong:** Screen readers announce the map iframe as "untitled frame".
**Why it happens:** Forgetting the `title` attribute on the `<iframe>`.
**How to avoid:** Always add `title="Mike's Coney Island location on Google Maps"` to the map iframe.
**Warning signs:** Lighthouse accessibility audit flags missing iframe title.

### Pitfall 5: Address Not Semantically Marked Up
**What goes wrong:** Address looks right visually but isn't machine-readable.
**Why it happens:** Using `<div>` instead of `<address>` element.
**How to avoid:** Wrap the address in `<address>` with `class="not-italic"` (to override default italic styling). The existing contact.astro skeleton already does this correctly.
**Warning signs:** Google can't extract structured address from the page.

## Code Examples

### Google Maps Iframe with Proper Attributes
```html
<div class="rounded-lg overflow-hidden shadow-sm border border-brand-divider">
  <iframe
    src={site.maps.embedUrl}
    width="100%"
    height="400"
    style="border:0;"
    allowfullscreen=""
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade"
    title="Mike's Coney Island location on Google Maps"
  ></iframe>
</div>
```

### Directions Link with Mobile Deep Linking
```html
<a
  href={site.maps.directionsUrl}
  target="_blank"
  rel="noopener noreferrer"
  class="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary-light font-medium transition-colors"
>
  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"></path>
    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"></path>
  </svg>
  Get Directions
</a>
```
Note: `https://www.google.com/maps/dir/?api=1&destination=...` automatically opens the Google Maps app on mobile devices when installed, or Google Maps web otherwise.

### FAQ Data Structure
```typescript
// src/data/faq.ts
export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: "What are your hours?",
    answer: "We're open Monday through Friday from 6:00 AM to 9:00 PM, Saturday from 7:00 AM to 10:00 PM, and Sunday from 7:00 AM to 8:00 PM. Hours may vary on holidays — give us a call to confirm!"
  },
  {
    question: "Do you offer takeout?",
    answer: "Absolutely! You can call ahead at (248) 634-3555 to place your order and we'll have it ready for pickup when you arrive."
  },
  {
    question: "Where can I park?",
    answer: "We have a free parking lot right in front of the restaurant on N Holly Rd. There's plenty of space, so finding a spot is never an issue."
  },
  {
    question: "Do you have a kids menu?",
    answer: "You bet! We've got kid-friendly favorites like grilled cheese, chicken tenders, and mini corn dogs — all at kid-friendly prices."
  },
  {
    question: "Do you have vegetarian options?",
    answer: "Yes! We offer salads, grilled cheese, veggie wraps, and several breakfast options that don't include meat. Just ask your server and they'll point you in the right direction."
  },
  {
    question: "Do you accept credit cards?",
    answer: "We accept all major credit and debit cards, as well as cash. Whatever's easiest for you!"
  },
  {
    question: "Are you open on holidays?",
    answer: "We're open most holidays, but hours may vary. We recommend calling ahead at (248) 634-3555 to confirm our holiday schedule."
  },
  {
    question: "Where exactly are you in Holly?",
    answer: "We're located at 15203 N Holly Rd in Holly, Michigan — right on the main road, easy to find. Look for us just north of downtown Holly!"
  },
  {
    question: "Is there dine-in seating available?",
    answer: "Yes! We have plenty of booth and table seating for families, couples, and groups. Come on in and grab a seat — no reservations needed."
  },
  {
    question: "Can I call ahead for a large order?",
    answer: "Definitely! For large orders or group pickups, give us a call at (248) 634-3555 and we'll make sure everything is ready when you need it."
  }
];
```

### Accessible Accordion Component Pattern
```astro
---
import { faqItems } from "../data/faq";
---

<div class="space-y-3">
  {faqItems.map((item, index) => (
    <div class="bg-white rounded-lg border border-brand-divider overflow-hidden">
      <button
        class="faq-toggle w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-medium text-brand-text-heading hover:bg-brand-accent/30 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:ring-inset"
        aria-expanded="false"
        aria-controls={`faq-panel-${index}`}
      >
        <span>{item.question}</span>
        <svg class="faq-icon w-5 h-5 shrink-0 text-brand-primary transition-transform duration-200" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        id={`faq-panel-${index}`}
        class="faq-panel px-6 pb-4 text-brand-text-body leading-relaxed"
        hidden
      >
        <p>{item.answer}</p>
      </div>
    </div>
  ))}
</div>

<script>
  document.querySelectorAll('.faq-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isExpanded));
      const panelId = btn.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;
      if (panel) {
        panel.hidden = isExpanded;
      }
      // Rotate chevron
      const icon = btn.querySelector('.faq-icon');
      if (icon) {
        icon.style.transform = isExpanded ? '' : 'rotate(180deg)';
      }
    });
  });
</script>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Google Maps JS API for simple pins | iframe embed (free, no key) | Always available | No billing, no API key, no JavaScript overhead |
| jQuery accordion plugins | Native `<details>` or aria-pattern with vanilla JS | 2020+ | Zero dependencies, better accessibility |
| Hardcoded FAQ in HTML | Data-driven from TypeScript arrays | Project convention | Maintainability, single source of truth |

**Deprecated/outdated:**
- Google Maps Embed API v1 `maps.googleapis.com/maps/api/staticmap` — still works but iframe embed is more interactive and equally free
- jQuery UI Accordion — replaced by native HTML/CSS/JS patterns

## Open Questions

1. **Exact map embed coordinates**
   - What we know: `site.ts` has placeholder coordinates (`42.791, -83.627`) for Holly, MI area
   - What's unclear: Whether these are the exact restaurant coordinates
   - Recommendation: Use as-is; the PLACEHOLDER comment in `site.ts` indicates owner will verify before launch (Phase 6)

2. **Number of FAQ items**
   - What we know: CONTEXT.md says 8-10, requirements say 5-10
   - What's unclear: Exact ideal count
   - Recommendation: Start with 10 covering all required categories (hours, parking, takeout, kids menu, plus extras)

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/data/site.ts`, `src/pages/contact.astro`, `src/components/HoursCard.astro` — established project patterns
- Google Maps iframe embed documentation — standard web pattern, no API key required

### Secondary (MEDIUM confidence)
- WAI-ARIA accordion pattern — standard accessibility pattern for disclosure widgets

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies; using established project patterns
- Architecture: HIGH - Follows existing `site.ts` data-driven pattern; component structure mirrors HoursCard
- Pitfalls: HIGH - Well-known accessibility and iframe patterns; no edge cases unique to this domain

**Research date:** 2026-03-01
**Valid until:** Indefinite — patterns are stable
