# Phase 5: Contact and FAQ - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the Contact/Location page with embedded Google Map, directions link, hours, click-to-call phone, and a FAQ section answering common customer questions. All data pulled from site.ts — no hardcoded contact info in templates.

</domain>

<decisions>
## Implementation Decisions

### Contact Page Layout
- Two-column layout on desktop: left side has contact details + hours, right side has embedded Google Map
- Stacks vertically on mobile: contact info first, then map below
- Page header with warm accent background: "Find Us" or "Visit Us"
- Large, tappable phone number with phone icon
- Address with a "Get Directions" link that opens Google Maps with the restaurant pre-populated as destination
- Hours displayed in a clean table format (day | open - close), matching the homepage hours card data

### Google Maps Embed
- Standard Google Maps iframe embed (no API key needed for basic embed)
- Map centered on the restaurant's location
- Reasonable zoom level to show surrounding Holly, MI area for context
- Map takes full width of its column on desktop, full width on mobile
- Use the placeholder embed URL from site.ts — swap to real coordinates when confirmed

### Hours Display
- Clean table or list format showing all 7 days
- Today's hours highlighted (matching homepage HoursCard behavior)
- Pull from site.ts hours data — same source as homepage, guaranteed consistency
- "Closed" shown clearly for any closed days

### FAQ Section
- Placed below the contact info and map on the same page
- "Frequently Asked Questions" section heading with accent styling
- Accordion-style expand/collapse (click question to reveal answer)
- 8-10 questions covering:
  - Hours: "What are your hours?" / "Are you open on holidays?"
  - Ordering: "Do you offer takeout?" / "Can I call ahead for pickup?"
  - Parking: "Where can I park?"
  - Menu: "Do you have a kids menu?" / "Do you have vegetarian options?"
  - General: "Do you accept credit cards?" / "Is there seating available?"
  - Location: "Where exactly are you in Holly?"
- Answers should be conversational, not corporate — match the brand voice
- FAQ data stored in a TypeScript array, not hardcoded in HTML

### Accessibility
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

</decisions>

<specifics>
## Specific Ideas

- Contact page is about removing friction — someone should be able to find the address, call, or get directions within 3 seconds of landing on this page
- FAQ targets voice search and Google AI Overviews — "Is Mike's Coney Island open on Sunday?" should be answerable from the FAQ
- The hours on this page MUST match the homepage exactly (same data source prevents drift)
- Keep it simple — this is the least "flashy" page but the most functional

</specifics>

<deferred>
## Deferred Ideas

- Contact form (email submission) — adds complexity, phone/visit is the primary contact method for a diner
- Live chat widget — out of scope for v1
- Event booking / catering inquiries — could be added if owner offers catering

</deferred>

---

*Phase: 05-contact-and-faq*
*Context gathered: 2026-03-01*
