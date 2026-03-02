---
phase: 05-contact-and-faq
plan: 02
subsystem: ui
tags: [astro, google-maps, contact, hours, accessibility]

requires:
  - phase: 05-contact-and-faq
    provides: FaqAccordion component, faq.ts data
  - phase: 01-foundation
    provides: BaseLayout, site.ts data, Tailwind brand classes
provides:
  - Complete contact page with Google Maps, directions, hours, click-to-call, and FAQ
affects: [06-seo-and-launch]

tech-stack:
  added: []
  patterns: [Google Maps iframe embed, today-highlighting with data-day attributes]

key-files:
  created: []
  modified: [src/pages/contact.astro]

key-decisions:
  - "Used contact-hours-* prefixed class names to avoid conflicts with homepage HoursCard"
  - "Map iframe uses loading=lazy since it's below the page header fold"

patterns-established:
  - "Contact page two-column layout: info cards left, map right, FAQ below"
  - "Today-highlighting pattern reused from HoursCard with prefixed class names"

requirements-completed: [CONT-01, CONT-02, CONT-03, CONT-04]

duration: 3min
completed: 2026-03-01
---

# Phase 5 Plan 02: Contact Page with Map, Hours, and FAQ Summary

**Full contact page with Google Maps iframe embed, today-highlighted hours, click-to-call phone, directions link, and integrated FAQ accordion**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-01
- **Completed:** 2026-03-01
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Replaced "Map coming soon" placeholder with real Google Maps iframe embed
- Two-column desktop layout (contact cards left, map right) with mobile stacking
- Today's day highlighted in hours display matching homepage HoursCard pattern
- FAQ accordion section integrated below contact info with accent background
- Click-to-call phone number with large tap target (text-lg)

## Task Commits

1. **Task 1: Rebuild contact page** - `a3fbdb3` (feat)

## Files Created/Modified
- `src/pages/contact.astro` - Complete contact page with map embed, hours, phone, directions, and FAQ section

## Decisions Made
- Used `contact-hours-*` prefixed CSS class names to avoid conflicts with the homepage HoursCard component's `.hours-*` classes
- Map iframe uses `loading="lazy"` since it's below the page header and not in the viewport on initial load
- Page header changed from "Contact Us" to "Find Us" per CONTEXT.md design decisions

## Deviations from Plan
None - plan executed exactly as written

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All contact and FAQ requirements complete
- Ready for Phase 6 SEO validation (structured data, meta tags, performance audit)
- Google Maps embed URL in site.ts uses placeholder coordinates — owner should verify before launch

---
*Phase: 05-contact-and-faq*
*Completed: 2026-03-01*
