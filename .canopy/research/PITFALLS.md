# Pitfalls Research

**Domain:** Local restaurant static website (coney island / diner)
**Researched:** 2026-03-01
**Confidence:** HIGH (multiple credible sources, cross-verified)

---

## Critical Pitfalls

### Pitfall 1: PDF Menu Served as-is Instead of Converted to HTML

**What goes wrong:**
The owner provides a PDF menu. The developer embeds a `<a href="menu.pdf">` link or renders the PDF in an iframe instead of converting the content to an HTML menu. The result is: search engines cannot index menu items, mobile users must pinch-and-zoom or download a file, screen readers cannot parse image-based PDFs, and menu updates require replacing the entire PDF rather than editing text.

**Why it happens:**
It looks like it works. The PDF displays. The developer ships and moves on. Converting PDF content to structured HTML requires extra effort that feels unnecessary when the PDF "already has the information."

**How to avoid:**
Extract all menu items, categories, prices, and descriptions from the PDF and encode them in HTML — either as static markup or a structured data file (JSON/YAML) that drives a component. The PDF should be source material, not the deliverable. Use `<section>` elements per menu category with proper heading hierarchy (`h2` for category, `h3` for item name). Keep the PDF around for print use only.

**Warning signs:**
- Developer asks "where should I put the PDF?" rather than "how do I structure the menu data?"
- Menu page has `<embed>` or `<iframe>` tags pointing to a `.pdf` file
- Menu is an `<img>` tag of a photographed paper menu
- Lighthouse accessibility score is low on the menu page

**Phase to address:**
Menu phase. Establish the data structure before any layout work begins. Define the JSON/content schema for menu items first.

---

### Pitfall 2: Outdated Hours, Contact, and Location Displayed as Static Text

**What goes wrong:**
Hours, address, and phone number are hard-coded in HTML. When hours change (holiday hours, new schedule), there is no easy update path for a non-technical owner. The site goes stale. Customers arrive at a closed restaurant. Trust erodes. Google Business Profile shows different hours than the website, which splits trust signals.

**Why it happens:**
Static sites make it easy to hard-code content. Developers build once, ship, and don't think about the update workflow. Holiday hours require a code change + deploy rather than a simple text edit.

**How to avoid:**
Store hours and contact info in a single source-of-truth data file (e.g., `_data/hours.json` or a Markdown frontmatter block) that the template reads. Document the update process for the owner in plain language. Even better: sync hours from Google Business Profile as the canonical source, or provide the owner with a simple way to edit this one file without touching the rest of the codebase.

**Warning signs:**
- Hours appear in multiple places in the codebase
- No content update documentation exists for the owner
- Hours are styled in a way that would require a developer to change them

**Phase to address:**
Content/data architecture phase. Establish the data layer for business info before building any UI around it.

---

### Pitfall 3: Photo Gallery Built Without Real Photos, Then Forgotten

**What goes wrong:**
Developer builds a beautiful gallery using placeholder images (Lorem Picsum, stock photos, or gray boxes). Owner is supposed to "send photos later." Launch approaches, real photos never arrive, and the site either ships with stock images that misrepresent the restaurant — or the gallery section is removed entirely. Neither outcome serves the restaurant. When real photos eventually arrive, they are wrong dimensions, wrong orientation, or uncompressed 8MB JPEGs that destroy load time.

**Why it happens:**
Photo delivery is a coordination dependency that neither party takes seriously during build. Developers assume owners will provide "appropriate" images without specifying what appropriate means.

**How to avoid:**
1. Define exact photo requirements before build starts: count, orientation (landscape vs portrait), minimum resolution, maximum file size.
2. Designate a specific named folder in the repository (e.g., `/public/images/gallery/`) with a README that says exactly what goes there.
3. Build the gallery component to gracefully handle missing images (show a branded placeholder, not a broken layout).
4. If photos don't arrive before launch, launch without the gallery section — not with stock photos of food that isn't Mike's Coney Island.
5. When photos do arrive, run them through image optimization (WebP conversion, resize to display dimensions) before adding to the repo.

**Warning signs:**
- No photo spec document exists
- Placeholder services (placehold.co, picsum.photos) appear in production code
- Gallery section shows generic Midwest diner stock photos
- Lighthouse shows images served in legacy formats (JPEG instead of WebP)

**Phase to address:**
Asset strategy phase (early). Photo requirements must be specified and communicated to the owner before any gallery UI is built.

---

### Pitfall 4: PDF-Sourced Menu Data Becomes Stale When Menu Changes

**What goes wrong:**
The HTML menu is built from the PDF provided at launch. Menu prices change, items are added, seasonal specials rotate. The owner has no way to update the website menu without hiring a developer. The website menu and the actual restaurant menu diverge. This is the #1 content staleness problem for local restaurant sites.

**Why it happens:**
Developers build for launch, not for maintenance. A static HTML menu requires developer access to update. Owners are not developers.

**How to avoid:**
Structure menu data in an editable format the owner can maintain — a simple JSON file, a Markdown file with frontmatter, or a headless CMS with a simple UI. The rendering is code; the content is data. Keep them separated. Document the update workflow explicitly. Consider Netlify CMS, Decap CMS, or a simple Google Sheet that drives menu data as options that require zero developer involvement for content edits.

**Warning signs:**
- Menu data is embedded directly in JSX/HTML component files with no separation
- No CMS or content management workflow is specified in the project
- Owner says "just update it whenever I call you" as the plan

**Phase to address:**
Content architecture phase. Decide on the data/content layer before implementing the menu UI.

---

## Moderate Pitfalls

### Pitfall 5: Missing or Incorrect Local SEO Signals

**What goes wrong:**
The site launches without JSON-LD structured data for the Restaurant schema type. Google cannot confirm the business hours, address, cuisine type, or menu URL as machine-readable data. The restaurant misses rich results (knowledge panel, hours in search, map pack visibility). Additionally, NAP (Name, Address, Phone) information differs between the website, Google Business Profile, and Yelp, splitting authority signals.

**Why it happens:**
JSON-LD schema is invisible to end users and feels like extra work. Developers skip it, especially on tight timelines.

**How to avoid:**
Implement `schema.org/Restaurant` JSON-LD in the `<head>` on every page. Required properties: `name`, `address`, `telephone`, `openingHours`, `url`, `servesCuisine`, `menu`. Validate with Google's Rich Results Test. Ensure NAP matches exactly across the website, Google Business Profile, Yelp, and Facebook. Use the `FoodEstablishment` type hierarchy (Restaurant is a subtype — use Restaurant, not LocalBusiness).

**Warning signs:**
- No `<script type="application/ld+json">` in page source
- Google Rich Results Test returns errors or warnings
- Google Business Profile hours differ from website hours

**Phase to address:**
SEO phase or final polish phase. Implement before launch, validate with Google tools.

---

### Pitfall 6: Hero Image Lazy-Loaded, Destroying LCP Score

**What goes wrong:**
The hero image — typically the largest, most visually prominent element on the page — gets `loading="lazy"` applied to it. This is correct for below-the-fold images but catastrophic for the above-the-fold hero. The browser delays loading the hero image until other content renders, causing a multi-second blank space at the top of the page. Largest Contentful Paint (LCP) fails Google's 2.5-second threshold, which directly affects search ranking.

**Why it happens:**
Developers apply `loading="lazy"` globally to all images as a performance "best practice," not realizing it applies to the hero image. Some frameworks and image components do this automatically.

**How to avoid:**
The hero image must have `loading="eager"` and `fetchpriority="high"`. All images below the fold use `loading="lazy"`. The hero image should be served as WebP, sized to display dimensions (not 4K originals), and either inlined as a CSS background with a preload `<link>` or served via an `<img>` with explicit `width` and `height` attributes to prevent layout shift (CLS).

**Warning signs:**
- Lighthouse LCP score above 2.5s
- Hero image appears in the lazy-loaded images list in DevTools Network tab
- `loading="lazy"` on the first `<img>` in the document

**Phase to address:**
Performance phase / image optimization phase. Check Lighthouse scores before launch.

---

### Pitfall 7: No Accessible Alt Text on Food Photos

**What goes wrong:**
Food photos ship with `alt=""` or `alt="photo1.jpg"`. Screen readers skip the images entirely or read the filename aloud. This fails WCAG 2.1 accessibility requirements, hurts SEO (image alt text is an indexing signal), and excludes visually impaired customers. For a restaurant, food image descriptions are also conversion copy — they describe what a dish looks like and makes it appetizing.

**Why it happens:**
Alt text feels like a formality. When placeholder images are used during development, alt text gets left as empty or generic. When real images swap in, no one updates the alt text.

**How to avoid:**
Treat alt text as content, not an attribute. Write descriptive alt text for every food photo: "Classic Michigan coney dog topped with chili, mustard, and onions" not "hotdog.jpg". Build the alt text requirement into the image data structure so it cannot be omitted.

**Warning signs:**
- Images have `alt=""` or no alt attribute
- Alt text reads like filenames or image IDs
- Lighthouse accessibility audit flags image alt issues

**Phase to address:**
Content/asset phase. Alt text specification belongs in the photo handoff requirements document.

---

### Pitfall 8: Mobile Menu Navigation Unusable on Small Screens

**What goes wrong:**
Navigation items are too small to tap, hamburger menu requires precise taps, or the mobile menu overlaps content and has no close button. 63% of global web traffic is mobile. Restaurant websites get even higher mobile usage — customers are often standing outside the restaurant or in the car looking up hours.

**Why it happens:**
Developers test on desktop with browser DevTools resize. Actual mobile interaction (fat fingers, one-handed use, bright sunlight) reveals issues that DevTools doesn't catch.

**How to avoid:**
Test on a real physical device before any milestone sign-off. Touch targets must be at least 44x44px (Apple HIG) / 48x48dp (Material). The hamburger menu must have a visible close button. Navigation items must have sufficient tap spacing. Test the most critical user journey on mobile: Can a customer find the hours and phone number in under 15 seconds?

**Warning signs:**
- No physical device testing documented
- Tap targets smaller than 44px in DevTools
- Navigation tested only in Chrome DevTools responsive mode

**Phase to address:**
Core layout/navigation phase. Establish mobile-first development discipline from the start.

---

## Minor Pitfalls

### Pitfall 9: No Open Graph / Social Meta Tags

**What goes wrong:**
When someone shares the website URL on Facebook, iMessage, or Twitter/X, the link preview shows a blank card or the wrong image. For a local restaurant, word-of-mouth sharing on Facebook is a significant discovery channel. A broken preview looks unprofessional.

**How to avoid:**
Add `og:title`, `og:description`, `og:image`, and `og:url` meta tags to every page. The `og:image` should be a high-quality horizontal photo (1200x630px) of the restaurant's food or interior. Validate with Facebook's Sharing Debugger.

**Phase to address:**
SEO / meta phase. Trivial to add during the HTML head setup phase.

---

### Pitfall 10: Missing Favicon and Apple Touch Icon

**What goes wrong:**
No favicon means a generic browser icon appears in tabs and bookmarks. On iPhone "Add to Home Screen," a blank or distorted icon appears. Small but visible signal of an unfinished site.

**How to avoid:**
Generate a complete favicon set from a square logo asset: `favicon.ico`, `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png` (180x180px), and a `site.webmanifest`. Tools like favicon.io make this a 2-minute task.

**Phase to address:**
Brand / design phase, before any public preview links are shared.

---

### Pitfall 11: Shipping with External Placeholder Image Service URLs

**What goes wrong:**
Development uses `https://picsum.photos/800/600` or `https://placehold.co/400x300` for missing photos. These URLs persist into production. External services can go down, be blocked by corporate firewalls, or change their URL structure — causing broken images in production. Many early placeholder services from the 2010s are now defunct.

**How to avoid:**
All placeholder images in development must be local files in the repository (e.g., `/public/images/placeholder-food.jpg`) — not external URLs. Local placeholders survive internet outages and are always under project control.

**Phase to address:**
Asset setup phase. Establish this rule before any component development begins.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Embed PDF menu directly | Zero conversion work at launch | Menu not indexed by search engines, mobile unusable, no easy updates | Never — convert to HTML |
| Hard-code hours in HTML | Simple to implement | Requires developer for every hour change; goes stale | Never for a live site |
| Stock photos for food | Gallery looks full at launch | Misrepresents the restaurant; must be replaced | Development only, never production |
| No image optimization pipeline | Skip complexity | 8MB JPEGs from the owner's iPhone; site loads slowly on mobile | Never — automate optimization early |
| Skip JSON-LD schema | Save time | Invisible to search engines for rich results | Never — 30 minutes of work with high SEO payoff |
| `loading="lazy"` on all images | One-liner "optimization" | Hero image LCP destroyed | Never apply globally; evaluate per-image |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Google Maps embed | Embedding raw iframe without API key quota awareness | Use a static map image + link to Google Maps for simple sites; reserve live embed for pages that need it |
| Google Business Profile | Hours on website differ from GBP hours | GBP is canonical; website must match exactly |
| Schema.org JSON-LD | Using `LocalBusiness` type instead of `Restaurant` | Use `https://schema.org/Restaurant` — it is a subtype of `FoodEstablishment` which is a subtype of `LocalBusiness`; specificity improves rich result eligibility |
| Social sharing meta | og:image pointing to a relative path | og:image must be an absolute URL with protocol and domain |
| GitHub Pages / Netlify deployment | Hard-coded absolute paths that break on subdirectory deployments | Use relative paths or configure base URL in build config |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Unoptimized hero images | LCP > 2.5s, blank white space on load | Serve WebP at display dimensions, use `fetchpriority="high"` | Day one on mobile connections |
| Full-resolution gallery photos | Gallery page takes 10+ seconds to load on mobile data | Resize to display dimensions, serve WebP, lazy load gallery images | As soon as owner adds photos |
| Inline critical CSS missing | Flash of unstyled content, layout shift | Extract and inline above-the-fold CSS | On slow connections |
| External font loaded synchronously | Text invisible until font downloads (FOIT) | Use `font-display: swap` and preconnect to font CDN | On any slow connection |

---

## Security Mistakes

Domain-specific security issues for a static restaurant site.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Contact form with no spam protection | Bot spam flooding owner's email | Add honeypot field or Cloudflare Turnstile; avoid exposing raw email addresses |
| Email address in plain HTML | Email harvesting bots collect it | Use a contact form, or encode the email with CSS/JS obfuscation; at minimum use `mailto:` with no plaintext display |
| No HTTPS | Browser shows "Not Secure" warning; Google penalizes in rankings | All static hosting (Netlify, Vercel, GitHub Pages, Cloudflare Pages) provides free TLS — use it |
| Outdated dependencies with known CVEs | Vulnerable JavaScript in production | Pin dependency versions, enable Dependabot or similar on the GitHub repo |

---

## UX Pitfalls

Common user experience mistakes specific to restaurant websites.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Hours buried in footer or "Contact" page | Customers can't find hours quickly; call the restaurant instead | Show hours prominently on the homepage hero or a sticky banner |
| No click-to-call phone number on mobile | Mobile users must manually dial | Wrap phone number in `<a href="tel:+15551234567">` so it's one tap |
| Menu organized like the PDF (columns, layout) rather than for web | Hard to scan on mobile, items get cut off | Reorganize menu into vertical accordion sections by category |
| No address linked to maps | Customers must copy-paste address | Wrap address in a link to Google Maps directions |
| Auto-playing music or video | Startles users, burns mobile data | Never auto-play audio or video; if video, use `autoplay muted playsinline` for ambient loops only |
| Flash or animation-heavy intro | Delays access to information | Skip it. Diners want hours and location, not a loading screen |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Menu page:** Verify every item, price, and category matches the current printed menu — not just the PDF provided at project start
- [ ] **Hours:** Verify the website hours match the Google Business Profile hours exactly, character for character
- [ ] **Contact info:** Phone number taps to call on mobile (`href="tel:"` present), address links to Google Maps directions
- [ ] **Images:** No external placeholder service URLs (picsum.photos, placehold.co) in production HTML or CSS
- [ ] **Hero image:** `loading="eager"` and `fetchpriority="high"` confirmed, not lazy-loaded
- [ ] **JSON-LD schema:** Validated with Google's Rich Results Test — no errors
- [ ] **Open Graph:** Facebook Sharing Debugger shows correct title, description, and image
- [ ] **Favicon:** Appears correctly in browser tab, iOS home screen save, and Android home screen save
- [ ] **Alt text:** Every food photo has a descriptive alt attribute (not empty, not a filename)
- [ ] **Mobile navigation:** Tested on a real iPhone — hamburger menu opens and closes, all links tap correctly
- [ ] **HTTPS:** Site loads with green padlock, no mixed content warnings in console

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| PDF menu discovered in production | MEDIUM | Extract menu content, build HTML menu component, replace PDF link, reindex with Google Search Console |
| Stock photos shipped to production | LOW | Owner provides real photos; optimize and swap; redeploy; no structural code changes needed if gallery component is built correctly |
| Hours stale/wrong | LOW | Update data file, redeploy (under 5 minutes if data is separated from code) |
| No JSON-LD schema added at launch | LOW | Add to `<head>`, validate, redeploy; submit URL to Google Search Console for reindexing |
| LCP failing due to lazy-loaded hero | LOW | Remove `loading="lazy"` from hero `<img>`, add `fetchpriority="high"`, redeploy |
| NAP mismatch across platforms | MEDIUM | Audit all listings (Google Business Profile, Yelp, Facebook), update each to match exactly, wait 2-4 weeks for search engines to reconcile |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| PDF menu served directly | Menu data architecture phase | Menu page passes Lighthouse accessibility; no `<embed>`/PDF links in menu HTML |
| Hours hard-coded in HTML | Content/data architecture phase | Hours live in a single data file; update documented for owner |
| Stock photos in production | Asset strategy phase (early) | No external image URLs in production; all images are local and WebP |
| Photo gallery without real photos | Asset strategy phase | Photo spec delivered to owner; placeholder is local, not external service |
| Menu data staleness | Content architecture phase | Owner can update menu items without touching code |
| Missing local SEO / JSON-LD | SEO / launch prep phase | Google Rich Results Test passes with no errors |
| Lazy-loaded hero image | Performance phase | Lighthouse LCP < 2.5s on mobile simulation |
| Missing alt text | Content/asset phase | Lighthouse accessibility score > 95; all `<img>` tags have non-empty alt attributes |
| Mobile navigation issues | Core layout phase | Real device test documented; all tap targets >= 44px |
| No Open Graph tags | SEO / meta phase | Facebook Sharing Debugger shows correct preview |
| External placeholder URLs | Asset setup phase (day one) | grep for picsum/placehold URLs returns zero results before any deploy |

---

## Sources

- Tablein — "5 Biggest Restaurant Website Mistakes to Avoid": https://www.tablein.com/blog/restaurant-website-mistakes (MEDIUM confidence — multiple corroborating sources)
- Orderable — "10 Mistakes New Restaurant Websites Make": https://orderable.com/blog/new-restaurant-websites-mistakes/ (MEDIUM confidence)
- HostMe App — "Avoiding Common Pitfalls in Restaurant Website Design": https://www.hostmeapp.com/blog/how-to-avoid-common-restaurant-website-mistakes (MEDIUM confidence)
- BOIA — "Why PDF Menus Are a Problem for Accessibility": https://www.boia.org/blog/why-pdf-menus-are-a-problem-for-accessibility (HIGH confidence — accessibility authority)
- Google web.dev — "The performance effects of too much lazy loading": https://web.dev/articles/lcp-lazy-loading (HIGH confidence — official Google source)
- Google Developers — "Local Business Structured Data": https://developers.google.com/search/docs/appearance/structured-data/local-business (HIGH confidence — official Google source)
- BlogCog — "How to use schema markup for a local restaurant website": https://blogcog.com/blogs/news/how-to-use-schema-markup-for-a-local-restaurant-website (MEDIUM confidence)
- LocalBrandHub — "Restaurant SEO Mistakes: 10 Errors Hurting Visibility": https://localbrandhub.com/blog/restaurant-seo-mistakes (MEDIUM confidence)
- Malou — "30 Restaurant SEO Tips to Boost Local Traffic in 2025": https://www.malou.io/en-us/blog/restaurant-seo-tips (MEDIUM confidence)
- Zenzino Design — "PDF Menus vs. Responsive HTML Menus": https://zenzino.design/blog/web-design/pdf-menus-vs-responsive-html-menus/ (MEDIUM confidence)

---
*Pitfalls research for: Local restaurant website — Mike's Coney Island, Holly MI*
*Researched: 2026-03-01*
