# Feature Research

**Domain:** Local coney island / diner restaurant website (Mike's Coney Island, Holly, MI)
**Researched:** 2026-03-01
**Confidence:** HIGH (multiple authoritative sources corroborate findings; industry data from owner.com survey of 1,300 US guests, Homebase 2026 guide, BentoBox, ChowNow, DoorDash)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Location and address with embedded map | 91% of guests visit restaurant websites before going; they need directions | LOW | Google Maps embed; also essential for local SEO |
| Hours of operation | First thing diners check; missing hours = they go elsewhere | LOW | Must be visually prominent, not buried in footer |
| Phone number (click-to-call) | Mobile-first users tap to call; 63% of searches are on mobile | LOW | `tel:` link is sufficient; no third-party needed |
| Menu (HTML, not PDF) | 80% of website visitors come specifically to see the menu | MEDIUM | PDF menus are unindexable, unusable on mobile, and can't be updated easily — build HTML menu pages |
| Food photography | 84% of guests look at menu photos before ordering; 24% are deterred by unappealing photos | LOW | Owner will provide photos; design must accommodate real images, not stock |
| Mobile-responsive design | 70% of restaurant website visitors are on mobile; 36% abandoned ordering due to poor mobile UX | MEDIUM | Must test on iOS Safari and Android Chrome; portrait-first layouts |
| Fast load times | Sites loading under 2 seconds see significantly higher conversions | MEDIUM | Static or JAMstack architecture; optimize images aggressively |
| Social media links | Standard expectation; customers follow restaurants on Instagram and Facebook | LOW | Links to existing profiles; do not build social feeds into site (they slow it down) |
| Contact info visible on every page | Reduces friction to contact or visit | LOW | Footer at minimum; consider sticky header with phone number |

### Differentiators (Competitive Advantage)

Features that set Mike's Coney Island apart from generic restaurant websites. These are where personality and "awesome" comes from.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Brand story / About page with personality | Coney island joints have history; a personal story builds emotional connection before the first bite | LOW | Tell Mike's origin story, the owners, what makes this place a community staple in Holly. Authenticity over marketing speak. |
| Local SEO via structured data (JSON-LD schema) | Restaurant schema markup boosts click-through by 20-30%; shows up in Google AI Overviews and "near me" searches | MEDIUM | Implement `Restaurant` + `LocalBusiness` JSON-LD schema with name, address, hours, phone, menu link, geo-coordinates |
| Menu with dietary callouts | Customers increasingly filter by gluten-free, vegan, etc.; tagging items prevents phone calls asking | LOW | Even basic tags (GF, V, Spicy) add value; can be done in markup without a dynamic system |
| Hero section with strong visual impact | First impression within 3 seconds: who you are, what you serve, where you are | LOW | Full-bleed photo of the signature Coney dog; a single punchy headline like "Holly's Classic Coney Since [year]" |
| Google reviews integration / social proof callout | 75% of guests seek validation from reviews before ordering or visiting; displaying reviews on-site removes the step of going to Google | LOW | Static embed of top reviews or a simple badge showing star rating; do NOT use a dynamic widget that loads slow |
| Photo gallery with atmosphere shots | Lets potential visitors "feel" the restaurant before coming; interior, counter, staff shots build warmth | LOW | Lightbox gallery or simple grid; owner to provide photos |
| FAQ section for voice and AI search | Adding a short FAQ helps the site appear in Google AI Overviews ("is Mike's Coney Island open on Sunday?") | LOW | 5-10 questions: hours, parking, kids menu, takeout, etc. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for a single-location diner-style restaurant site.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| PDF menu download | Owner has a PDF already; seems like easy copy-paste | PDFs are unindexable by Google, don't work on mobile, require design software to update, and create duplicate content confusion | Build HTML menu pages from the PDF content; optionally offer PDF as secondary download link for print purposes |
| Online ordering system (v1) | More revenue, convenience | Significant complexity, requires payment processor, fulfillment workflow, ongoing maintenance — out of scope per PROJECT.md | Add a link to an existing platform (e.g., DoorDash, Grubhub) if they already use one; or flag as v2 |
| Reservation system (v1) | Seems professional | Coney island / diner style is walk-in by nature; a reservation widget adds friction and maintenance burden that doesn't match the dining style | Omit entirely; add "Walk-ins welcome" messaging instead |
| Live social media feed embedded on site | Shows active social presence | Third-party feed widgets add 200-500ms load time, break when APIs change, and add visual clutter | Static social proof (selected review quotes) + links to social profiles is cleaner and faster |
| Splash screen / intro animation | Looks "fancy" | 68% of diners have skipped a restaurant because of its website; intro animations block the critical first 3 seconds and frustrate mobile users | Jump directly to hero with food imagery and key info |
| Pop-up email capture / newsletter | Building a customer list | Intrusive on a restaurant discovery site; diners come to see hours and menu, not subscribe | If email capture is desired later, use a subtle footer form as v1.x |
| Online gift card system | Revenue stream | Requires e-commerce, payment processing, and redemption workflow — disproportionate complexity for a small diner | Defer to v2+ if owner requests; for now, mention gift cards available in-store |
| Loyalty / rewards program | Drives repeat visits | Requires account creation, backend, ongoing management — a full product feature, not a website feature | Out of scope; could be part of future app milestone |
| Multiple language support | Inclusivity | No evidence Holly, MI market requires it; adds complexity | Not needed for v1 |

---

## Feature Dependencies

```
[Location + Hours]
    └──required by──> [Google My Business / Local SEO]

[Menu (HTML pages)]
    └──required by──> [Local SEO / Schema Markup]
    └──required by──> [Dietary callouts]

[Food Photography]
    └──required by──> [Hero Section]
    └──required by──> [Photo Gallery]
    └──required by──> [Menu with photos]

[Hero Section]
    └──requires──> [Brand Story / Positioning]

[Google Reviews Integration]
    └──enhances──> [Brand Story / About Page]

[FAQ Section]
    └──enhances──> [Local SEO]
```

### Dependency Notes

- **Menu (HTML) requires owner's PDF content:** Build page structure and design around placeholder menu items first; swap in real content when PDF is delivered. Do not block design on PDF arrival.
- **Food Photography required by Hero, Gallery, Menu:** Design must use placeholder images initially. Use high-quality stock coney island / diner photos for development; owner to swap with real photos before launch.
- **Local SEO / Schema Markup requires Location, Hours, Menu:** Implement schema only after these pages are live and accurate.
- **About page and brand story require input from owner:** Write a placeholder version that owner approves or edits before launch.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what a visitor needs to decide to visit Mike's Coney Island.

- [ ] Hero section with punchy headline, location context, and hero food image — because first impression is everything and visitors decide in 3 seconds
- [ ] HTML menu pages (structured from PDF content) — because 80% of visitors come specifically for the menu
- [ ] Location, hours, and click-to-call phone number prominently displayed — because this is what people look for first
- [ ] Mobile-responsive layout — because 70% of visitors are on phones
- [ ] Food and atmosphere photo gallery — because 84% look at photos before deciding
- [ ] About / story page — because this differentiates a local spot from a chain and builds emotional connection
- [ ] Social media links (Instagram, Facebook) — because standard expectation and drives follows
- [ ] Google reviews callout (static, 3-5 highlighted reviews) — because social proof drives conversions
- [ ] Local SEO: JSON-LD schema markup + meta tags — because it's implementation-level, low cost, and delivers 20-30% CTR improvement
- [ ] FAQ section (5-10 questions) — because it captures voice and AI search traffic with minimal effort

### Add After Validation (v1.x)

Features to add once core site is live and owner has provided real photos and menu content.

- [ ] Menu dietary filtering or callout tags — add when real menu content is confirmed; implement with CSS classes, no JavaScript framework needed
- [ ] Email capture form in footer — add if owner wants to build a list for specials; simple form to a service like Mailchimp or Buttondown
- [ ] Online ordering link — add if owner uses a third-party platform (DoorDash/Grubhub); just a prominent button linking out

### Future Consideration (v2+)

Features to defer until the future app milestone or owner explicitly requests.

- [ ] Online ordering system (native) — significant complexity; belongs in app milestone per PROJECT.md
- [ ] Inventory management — separate milestone, owner wants to discuss separately
- [ ] Gift card e-commerce — requires payment processing; only worth building if owner has demand
- [ ] Loyalty / rewards program — belongs in the app milestone

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| HTML Menu pages | HIGH | MEDIUM | P1 |
| Location, hours, phone | HIGH | LOW | P1 |
| Mobile-responsive design | HIGH | MEDIUM | P1 |
| Hero section with photography | HIGH | LOW | P1 |
| Food/atmosphere photo gallery | HIGH | LOW | P1 |
| About / brand story page | HIGH | LOW | P1 |
| Local SEO (schema + meta) | HIGH | LOW | P1 |
| FAQ section | MEDIUM | LOW | P1 |
| Google reviews callout (static) | MEDIUM | LOW | P1 |
| Social media links | LOW | LOW | P1 |
| Dietary menu callouts | MEDIUM | LOW | P2 |
| Email capture form | LOW | LOW | P2 |
| Online ordering link (external) | HIGH | LOW | P2 (conditional on owner using a platform) |
| Online ordering (native) | HIGH | HIGH | P3 |
| Gift card system | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

Reviewed competitor Michigan coney island / diner websites (National Coney Island, Leo's, Unique Coney Island, St Clair Coney Island, Bedford Coney, Gillie's Coney Island).

| Feature | Typical Competitor | Most Do Wrong | Mike's Opportunity |
|---------|-------------------|---------------|-------------------|
| Menu display | Often PDF-only or poorly formatted | PDFs not mobile-friendly; hard to find | Build a proper HTML menu that works on mobile and ranks on Google |
| Photography | Mixed quality; many use generic or low-quality shots | Stock photos, dark lighting | Owner-provided photos of actual food — authenticity wins |
| Story / About | Usually minimal or generic | Corporate-sounding, no personality | Write in the voice of a local spot; Holly, MI community identity |
| Local SEO | Most lack structured data | No schema markup = poor AI/voice search presence | Implement JSON-LD schema from day one |
| Mobile experience | Many still poor on mobile | Desktop-first layouts that shrink badly | Mobile-first design is the differentiator at this tier |
| Load speed | Often slow (image-heavy, no optimization) | Large unoptimized images, heavy scripts | Static/JAMstack + image optimization = clearly faster than competitors |

The majority of Michigan coney island websites are functional but not impressive. A visually striking, fast, mobile-first site with a strong brand personality would stand out significantly in this segment.

---

## Sources

- [11 Restaurant Website Features You Need in 2026 | Homebase](https://www.joinhomebase.com/blog/restaurant-website) — MEDIUM confidence (industry guide, 2026)
- [New Data: The 6 Elements of a Perfect Restaurant Website | owner.com](https://www.owner.com/blog/restaurant-website-design) — HIGH confidence (survey of 1,300 US restaurant guests)
- [10 Essential Elements + Design Tips for Restaurant Websites | BentoBox](https://www.getbento.com/blog/the-10-essential-elements-of-a-restaurant-website/) — MEDIUM confidence (industry practitioner)
- [5 Biggest Restaurant Website Mistakes to Avoid | Tablein](https://www.tablein.com/blog/restaurant-website-mistakes) — MEDIUM confidence (practical industry source)
- [Restaurant Website Guide 2026 | DoorDash Merchants](https://merchants.doordash.com/en-us/blog/building-restaurant-website) — MEDIUM confidence (2026 guide from major platform)
- [Restaurant SEO Strategy 2026 | Chowly](https://chowly.com/resources/blogs/how-to-tackle-restaurant-seo-a-guide-to-top-google-rankings-in-2026/) — MEDIUM confidence (current year guide)
- [Local Business Schema Markup | Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/local-business) — HIGH confidence (official Google documentation)
- Michigan coney island competitor analysis: [National Coney Island](https://www.nationalconeyisland.com/), [Leo's Coney Island](https://www.leosconeyisland.com/), [Unique Coney Island](https://uniqueconeyisland.com/), [St Clair Coney Island](https://stclairconeyisland.com/), [Bedford Coney](https://bedfordconey.com/), [Gillie's Coney Island](https://www.gilliesconeyisland.com/) — MEDIUM confidence (direct observation)

---

*Feature research for: Local coney island / diner restaurant website*
*Researched: 2026-03-01*
