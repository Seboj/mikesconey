---
phase: 02-homepage
plan: 01
status: complete
completed: 2026-03-01
---

## Summary

Created the two most critical above-the-fold homepage components: HeroSection with a branded inline SVG placeholder and HoursCard with client-side today-highlighting.

## Tasks Completed

| # | Task | Status |
|---|------|--------|
| 1 | Create HeroSection with branded SVG placeholder | Complete |
| 2 | Create HoursCard with client-side today highlighting | Complete |

## Key Files

### Created
- `src/components/HeroSection.astro` — Full-bleed hero with inline SVG placeholder, gradient overlay, restaurant name/tagline from site.ts, View Our Menu + Call Us CTAs
- `src/components/HoursCard.astro` — Hours display card reading from site.hours, today-highlighting via client-side script, closed day handling

### Modified
- `src/styles/global.css` — Added `.bg-texture-warm` subtle dot pattern utility

## Decisions Made
- Used inline SVG geometric shapes (circles, wavy lines, dots) for hero placeholder — keeps it under 2KB, zero HTTP requests
- Hero gradient uses from-brand-dark-deeper/60 via-brand-dark/40 to-brand-dark-deeper/70 for readability
- Hours card uses data-day attribute + client-side JS for today detection (Astro builds statically)
- Added "Hours may vary on holidays" disclaimer below hours card

## Self-Check: PASSED
- HeroSection imports site.ts: YES
- HeroSection has no external image URLs: YES
- HoursCard has data-day attributes: YES
- HoursCard has client-side script: YES
- global.css has bg-texture-warm: YES
