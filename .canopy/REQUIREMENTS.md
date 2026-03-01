# Requirements: Mike's Coney Island

**Defined:** 2026-03-01
**Core Value:** Customers can find Mike's Coney Island online, view the full menu, and get the information they need to visit or order — presented in a way that reflects the restaurant's personality and charm.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUN-01**: Site scaffolded with Astro 5 + Tailwind CSS 4 and deployed to Cloudflare Pages
- [x] **FOUN-02**: All restaurant facts (name, address, phone, hours) stored in a single typed data file (site.ts) used across all pages
- [x] **FOUN-03**: Menu content stored as structured JSON data (menu.json), not hardcoded in templates
- [x] **FOUN-04**: Base layout with consistent navigation and footer across all pages

### Homepage

- [x] **HOME-01**: Hero section with full-bleed food photography, restaurant name, and tagline that loads in under 2.5 seconds (LCP)
- [x] **HOME-02**: Hours of operation prominently displayed on homepage (not buried in footer)
- [x] **HOME-03**: Click-to-call phone number accessible from homepage
- [x] **HOME-04**: Brief about teaser with link to full About page
- [x] **HOME-05**: Social media links (Instagram, Facebook) visible on homepage

### Menu

- [ ] **MENU-01**: Full menu displayed as HTML pages organized by category (not PDF)
- [ ] **MENU-02**: Menu items show name, description, and price
- [ ] **MENU-03**: Menu is mobile-friendly with readable text and clear category navigation
- [ ] **MENU-04**: Menu content can be updated by editing a single JSON file without touching templates

### Gallery

- [x] **GALL-01**: Photo gallery page displaying food and atmosphere photos
- [x] **GALL-02**: Gallery images optimized for web (WebP format, responsive sizes)
- [x] **GALL-03**: Gallery works gracefully with placeholder images until owner provides real photos

### About

- [x] **ABUT-01**: About page telling Mike's Coney Island brand story with personality and Holly, MI community identity
- [x] **ABUT-02**: Static Google reviews callout featuring 3-5 highlighted customer reviews

### Contact

- [ ] **CONT-01**: Contact/Location page with embedded Google Map showing restaurant location
- [ ] **CONT-02**: Address linked to Google Maps directions
- [ ] **CONT-03**: Hours of operation displayed clearly on contact page
- [ ] **CONT-04**: Click-to-call phone number on contact page

### FAQ

- [ ] **FAQQ-01**: FAQ section with 5-10 questions targeting common customer queries (hours, parking, takeout, kids menu)

### SEO

- [ ] **SEOO-01**: JSON-LD Restaurant schema markup on all pages with accurate NAP (Name, Address, Phone)
- [ ] **SEOO-02**: Open Graph meta tags on all pages for social sharing
- [ ] **SEOO-03**: Sitemap.xml auto-generated and submitted
- [ ] **SEOO-04**: All images have descriptive alt text
- [ ] **SEOO-05**: Lighthouse Performance score > 90 and Accessibility score > 95

### Design

- [x] **DSGN-01**: Mobile-responsive design that works on all screen sizes (375px and up)
- [x] **DSGN-02**: Visually striking design that stands out from generic Michigan coney island competitor sites
- [x] **DSGN-03**: Self-hosted fonts (via Fontsource) for consistent typography without third-party DNS lookups
- [ ] **DSGN-04**: Fast page loads — all pages under 2 seconds on mobile

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Content Enhancements

- **CENH-01**: Dietary callout tags on menu items (GF, V, Spicy)
- **CENH-02**: Email capture form in footer for specials and promotions
- **CENH-03**: Online ordering link to external platform (DoorDash/Grubhub) if owner uses one

### App & Operations (Future Milestone)

- **AOPS-01**: Mobile app for customers
- **AOPS-02**: Inventory management system
- **AOPS-03**: Loyalty / rewards program

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| PDF menu served as-is | Unindexable by Google, unusable on mobile, hard to update |
| Online ordering system (native) | Significant complexity, requires payment processing — deferred to app milestone |
| Reservation system | Coney island / diner style is walk-in; adds friction and maintenance that doesn't match dining style |
| Embedded live social media feed | Adds 200-500ms load time, breaks when APIs change, adds visual clutter |
| Splash screen / intro animation | 68% of diners skip sites with friction; blocks critical first 3 seconds |
| Pop-up email capture / newsletter | Intrusive on a restaurant discovery site; diners come for hours and menu |
| Gift card e-commerce system | Requires e-commerce and payment processing — disproportionate complexity for v1 |
| Multiple language support | No evidence Holly, MI market requires it; adds unnecessary complexity |

## Traceability

Which phases cover which requirements. Finalized during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 1 | Complete |
| FOUN-02 | Phase 1 | Complete |
| FOUN-03 | Phase 1 | Complete |
| FOUN-04 | Phase 1 | Complete |
| DSGN-01 | Phase 1 | Complete |
| DSGN-03 | Phase 1 | Complete |
| HOME-01 | Phase 2 | Complete |
| HOME-02 | Phase 2 | Complete |
| HOME-03 | Phase 2 | Complete |
| HOME-04 | Phase 2 | Complete |
| HOME-05 | Phase 2 | Complete |
| DSGN-02 | Phase 2 | Complete |
| MENU-01 | Phase 3 | Pending |
| MENU-02 | Phase 3 | Pending |
| MENU-03 | Phase 3 | Pending |
| MENU-04 | Phase 3 | Pending |
| GALL-01 | Phase 4 | Complete |
| GALL-02 | Phase 4 | Complete |
| GALL-03 | Phase 4 | Complete |
| ABUT-01 | Phase 4 | Complete |
| ABUT-02 | Phase 4 | Complete |
| CONT-01 | Phase 5 | Pending |
| CONT-02 | Phase 5 | Pending |
| CONT-03 | Phase 5 | Pending |
| CONT-04 | Phase 5 | Pending |
| FAQQ-01 | Phase 5 | Pending |
| SEOO-01 | Phase 6 | Pending |
| SEOO-02 | Phase 6 | Pending |
| SEOO-03 | Phase 6 | Pending |
| SEOO-04 | Phase 6 | Pending |
| SEOO-05 | Phase 6 | Pending |
| DSGN-04 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0

---
*Requirements defined: 2026-03-01*
*Last updated: 2026-03-01 after roadmap creation — traceability finalized*
