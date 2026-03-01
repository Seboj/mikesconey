# Roadmap: Mike's Coney Island

**Project:** Mike's Coney Island Restaurant Website
**Milestone:** v1 — Public launch
**Depth:** Quick
**Created:** 2026-03-01

---

## Phases

- [x] **Phase 1: Foundation** - Scaffold the project, establish data layer, deploy skeleton to Cloudflare Pages (completed 2026-03-01)
- [ ] **Phase 2: Homepage** - Build the public face of the restaurant — hero, hours, call to action
- [ ] **Phase 3: Menu** - Deliver the site's most important feature as a full HTML menu
- [ ] **Phase 4: Gallery and About** - Owner-asset-dependent pages: photo gallery and brand story
- [ ] **Phase 5: Contact and FAQ** - Location page with map and FAQ section targeting common visitor queries
- [ ] **Phase 6: SEO and Launch** - Validate structured data, audit performance, confirm site is launch-ready

---

## Phase Details

### Phase 1: Foundation
**Goal**: The project skeleton exists, deploys automatically, and all data-driven content has a single source of truth
**Depends on**: Nothing
**Requirements**: FOUN-01, FOUN-02, FOUN-03, FOUN-04, DSGN-01, DSGN-03
**Success Criteria** (what must be TRUE):
  1. A visitor can load a live URL on Cloudflare Pages and see a working site shell with nav and footer
  2. Editing `src/data/site.ts` changes the restaurant name, address, and phone wherever they appear site-wide without touching any other file
  3. The menu data schema (`menu.json`) is defined and populated with placeholder categories and items
  4. The site renders correctly on a 375px wide screen with no horizontal overflow
  5. Self-hosted fonts load without any third-party DNS requests
**Plans**: TBD

### Phase 2: Homepage
**Goal**: Customers who land on the homepage immediately know where Mike's is, when it's open, and how to call
**Depends on**: Phase 1
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, DSGN-02
**Success Criteria** (what must be TRUE):
  1. The hero section displays a full-bleed food photograph with the restaurant name and loads in under 2.5 seconds on mobile
  2. Hours of operation are visible above the fold on a phone screen without scrolling
  3. Tapping the phone number on a mobile device initiates a call directly
  4. The homepage has a distinct visual style that does not look like a generic Michigan coney island competitor site
  5. Instagram and Facebook links are visible and open the correct profiles
**Plans**: TBD

### Phase 3: Menu
**Goal**: Customers can read the full menu on their phone, organized by category, without downloading a PDF
**Depends on**: Phase 1
**Requirements**: MENU-01, MENU-02, MENU-03, MENU-04
**Success Criteria** (what must be TRUE):
  1. Every menu item displays its name, description, and price in readable HTML — no PDF link anywhere on the page
  2. A user on a 375px screen can navigate between menu categories without pinching or horizontal scrolling
  3. Editing a single JSON file updates menu content site-wide without modifying any template or component
**Plans**: TBD

### Phase 4: Gallery and About
**Goal**: Customers can see the food and atmosphere before visiting, and read a brand story that makes Mike's feel like a local neighborhood spot
**Depends on**: Phase 2
**Requirements**: GALL-01, GALL-02, GALL-03, ABUT-01, ABUT-02
**Success Criteria** (what must be TRUE):
  1. The gallery page displays a grid of food and atmosphere photos in WebP format with no layout shift
  2. When real owner photos are not yet available, the gallery renders with branded placeholder images rather than broken images or external URLs
  3. The About page tells a brand story specific to Mike's Coney Island and Holly, MI — not generic restaurant copy
  4. The About page displays 3-5 highlighted customer reviews as a static callout
**Plans**: TBD

### Phase 5: Contact and FAQ
**Goal**: Customers can find the restaurant, get directions, and have their common questions answered without calling
**Depends on**: Phase 2
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, FAQQ-01
**Success Criteria** (what must be TRUE):
  1. The contact page embeds a Google Map showing the restaurant's exact location
  2. Tapping the address on mobile opens Google Maps with directions pre-populated to the restaurant
  3. Hours and click-to-call phone number are present on the contact page and match the homepage exactly
  4. The FAQ section answers at least 5 customer questions covering hours, parking, takeout, and kids menu
**Plans**: TBD

### Phase 6: SEO and Launch
**Goal**: The site is fully indexed by Google, passes Core Web Vitals, and is ready for real customers
**Depends on**: Phases 3, 4, 5
**Requirements**: SEOO-01, SEOO-02, SEOO-03, SEOO-04, SEOO-05, DSGN-04
**Success Criteria** (what must be TRUE):
  1. Google's Rich Results Test passes for the Restaurant JSON-LD schema on all pages
  2. Every image on the site has a descriptive alt text attribute — no empty or missing alt attributes
  3. A sitemap.xml is auto-generated, accessible at `/sitemap.xml`, and submitted to Google Search Console
  4. Lighthouse Performance score is 90 or above and Accessibility score is 95 or above on mobile
  5. All pages load in under 2 seconds on a simulated mobile connection
**Plans**: TBD

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/? | Complete    | 2026-03-01 |
| 2. Homepage | 0/? | Not started | - |
| 3. Menu | 0/? | Not started | - |
| 4. Gallery and About | 0/? | Not started | - |
| 5. Contact and FAQ | 0/? | Not started | - |
| 6. SEO and Launch | 0/? | Not started | - |

---

## Coverage

**v1 requirements:** 32 total
**Mapped:** 32
**Unmapped:** 0

| Requirement | Phase |
|-------------|-------|
| FOUN-01 | 1 |
| FOUN-02 | 1 |
| FOUN-03 | 1 |
| FOUN-04 | 1 |
| DSGN-01 | 1 |
| DSGN-03 | 1 |
| HOME-01 | 2 |
| HOME-02 | 2 |
| HOME-03 | 2 |
| HOME-04 | 2 |
| HOME-05 | 2 |
| DSGN-02 | 2 |
| MENU-01 | 3 |
| MENU-02 | 3 |
| MENU-03 | 3 |
| MENU-04 | 3 |
| GALL-01 | 4 |
| GALL-02 | 4 |
| GALL-03 | 4 |
| ABUT-01 | 4 |
| ABUT-02 | 4 |
| CONT-01 | 5 |
| CONT-02 | 5 |
| CONT-03 | 5 |
| CONT-04 | 5 |
| FAQQ-01 | 5 |
| SEOO-01 | 6 |
| SEOO-02 | 6 |
| SEOO-03 | 6 |
| SEOO-04 | 6 |
| SEOO-05 | 6 |
| DSGN-04 | 6 |

---

*Roadmap created: 2026-03-01*
