# Project State: Mike's Coney Island

## Project Reference

**Core Value:** Customers can find Mike's Coney Island online, view the full menu, and get the information they need to visit or order — presented in a way that reflects the restaurant's personality and charm.

**Stack:** Astro 5.18.0 + Tailwind CSS 4.2.1, deployed to Cloudflare Pages (free tier)

**Repository:** GitHub (to be created)

---

## Current Position

**Current Phase:** 05
**Current Plan:** Not started
**Status:** Milestone complete
**Mode:** yolo (auto-advance, no approval gates)

```
Progress: [####------] 33% complete
Phase 1 [####] | Phase 2 [####] | Phase 3 [----] | Phase 4 [----] | Phase 5 [----] | Phase 6 [----]
```

---

## Phase Summary

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 1 | Foundation | FOUN-01, FOUN-02, FOUN-03, FOUN-04, DSGN-01, DSGN-03 | Complete (2026-03-01) |
| 2 | Homepage | HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, DSGN-02 | Complete (2026-03-01) |
| 3 | Menu | MENU-01, MENU-02, MENU-03, MENU-04 | Not started |
| 4 | Gallery and About | GALL-01, GALL-02, GALL-03, ABUT-01, ABUT-02 | Not started |
| 5 | Contact and FAQ | CONT-01, CONT-02, CONT-03, CONT-04, FAQQ-01 | Not started |
| 6 | SEO and Launch | SEOO-01, SEOO-02, SEOO-03, SEOO-04, SEOO-05, DSGN-04 | Not started |

---

## Accumulated Context

### Key Decisions

| Decision | Rationale |
|----------|-----------|
| Astro 5 + Tailwind CSS 4 via `@tailwindcss/vite` | Static output, zero JS by default, free Cloudflare hosting — do NOT use deprecated `@astrojs/tailwind` |
| All restaurant facts in `src/data/site.ts` | Single source of truth — changing hours/phone updates footer, contact page, and JSON-LD schema simultaneously |
| Menu content in `src/data/menu.json` | Owner updates menu by editing one JSON file, no template changes |
| Hero image: `loading="eager"` + `fetchpriority="high"` | Lazy-loading the hero image fails LCP; this is a hard rule |
| No external placeholder image URLs in production | Use local branded placeholders; never ship `picsum.photos` or `placehold.co` URLs |

### Critical Pitfalls to Avoid

1. Using `@astrojs/tailwind` — it pins the project to Tailwind v3
2. Hard-coding phone/hours/address in any template — use `site.ts` only
3. Applying `loading="lazy"` globally to all images — hero must be eager
4. Serving the PDF menu as a link — must be HTML
5. Skipping JSON-LD schema — implement in BaseLayout from Phase 1, validate in Phase 6

### Content Delivery Dependencies

| Content | Owner Action Required | Needed By |
|---------|----------------------|-----------|
| Menu PDF | Owner provides finalized PDF | Phase 3 start |
| Food + atmosphere photos | Owner provides images per spec | Phase 4 start |
| Confirmed hours, address, phone | Owner verifies accuracy | Phase 6 (before SEO validation) |
| Google Business Profile status | Owner confirms listing is claimed | Phase 6 |
| Domain + DNS | Owner confirms domain, points to Cloudflare Pages | Phase 6 |

### Todos

- [ ] Send photo specification document to owner at Phase 3 kickoff (count, orientation, min resolution, max file size)
- [ ] Confirm target domain with owner before Phase 6
- [ ] Confirm Google Business Profile is claimed before Phase 6 SEO validation

### Blockers

None currently.

---

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse Performance | > 90 | - |
| Lighthouse Accessibility | > 95 | - |
| LCP (mobile) | < 2.5s | - |
| Page load (mobile) | < 2.0s | - |

---

## Session Continuity

**Last active:** 2026-03-01
**Last action:** Phase 2 (Homepage) complete — Hero with SVG placeholder, hours card, about teaser, social proof, nav social icons. All 3 plans executed, verification passed.
**Next action:** Run `/canopy:discuss-phase 3` or `/canopy:plan-phase 3` to begin Menu phase

---

*State initialized: 2026-03-01*
