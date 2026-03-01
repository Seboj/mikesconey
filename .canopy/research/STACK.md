# Stack Research

**Domain:** Restaurant website (static, content-driven, local business)
**Researched:** 2026-03-01
**Confidence:** HIGH

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Astro | 5.18.0 (stable) | Site framework | Ships zero JS by default; best-in-class Lighthouse scores without configuration tricks; islands architecture means any interactivity (e.g., mobile menu toggle) is surgically added. Content-focused sites like this are Astro's primary use case. Next.js is overkill — it ships a full React runtime for a menu page. |
| Tailwind CSS | 4.2.1 (stable) | Utility-first styling | Released stable January 2025. Full builds 5x faster than v3, incremental builds 100x faster. CSS-native configuration (no more `tailwind.config.mjs`). The utility model is ideal for one-developer builds: fast to ship, no CSS file sprawl, composable components. |
| @tailwindcss/vite | (bundled with tailwindcss 4.x) | Vite plugin for Tailwind v4 | Replaces the deprecated `@astrojs/tailwind` integration. The new official way to use Tailwind 4 with Astro — configured in `astro.config.mjs` under `vite.plugins`. |
| Cloudflare Pages | Free tier | Hosting and CDN | Unlimited bandwidth on the free tier (no bandwidth cap, unlike Netlify's 125 GB). 500 build minutes/month free. Cloudflare's global edge network makes static assets fast for users everywhere. Git-connected deployment. Ideal for a restaurant that will never pay for hosting. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@astrojs/sitemap` | latest | Auto-generate sitemap.xml | Always — Google requires it for proper indexing of multi-page sites. One-line integration. |
| `schema-dts` | latest | TypeScript types for JSON-LD structured data | Use when writing the Restaurant schema markup; prevents typos in property names. Structured data (Restaurant, Menu, LocalBusiness) is table stakes for Google rich results in 2025/2026. |
| `@unpic/astro` | latest | Advanced responsive image handling | Use if Astro's built-in `<Image>` proves insufficient for gallery requirements. Provides blurhash placeholders, art direction, and CDN-agnostic optimization. Otherwise Astro's native image pipeline handles WebP/AVIF conversion automatically — prefer native first. |
| `sharp` | latest (auto-installed) | Image processing | Installed automatically by Astro for local image optimization. Required for WebP/AVIF generation at build time. No configuration needed. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Node.js 22 | Runtime | Cloudflare Pages build image now defaults to Node 22 (upgraded from 18 in 2025). Use 22 locally to match CI. |
| `wrangler` CLI | Local Cloudflare Pages preview | `npx wrangler pages dev dist/` runs local preview matching Cloudflare's edge environment. Optional but useful. |
| Astro Check (`astro check`) | TypeScript type checking for `.astro` files | Run before commits to catch type errors in frontmatter and component props. |
| Prettier + `prettier-plugin-astro` | Code formatting | The official Prettier plugin supports `.astro` file formatting. Use `prettier --write .` to keep code consistent. |

---

## Installation

```bash
# Create project
npm create astro@latest mikes-coney -- --template minimal --typescript strict

cd mikes-coney

# Install Tailwind v4 with Vite plugin (NOT @astrojs/tailwind — that's deprecated for v4)
npm install tailwindcss @tailwindcss/vite

# Install Astro integrations
npx astro add sitemap

# Dev dependencies
npm install -D prettier prettier-plugin-astro schema-dts
```

**`astro.config.mjs` after setup:**

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mikesconey.com',   // set real domain when known
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

**`src/styles/global.css`:**

```css
@import "tailwindcss";

/* Custom brand tokens go here via @theme */
@theme {
  --color-brand-red: #c0392b;      /* adjust to actual brand color */
  --color-brand-cream: #fdf6ec;
  --font-display: 'Oswald', sans-serif;
  --font-body: 'Open Sans', sans-serif;
}
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Astro | Next.js | If the site needs real-time features (online ordering, dynamic reservations). Next.js SSR would be required. Not needed for v1. |
| Astro | SvelteKit | If the team prefers Svelte syntax. SvelteKit generates excellent static sites and is a valid swap. Astro is better documented for content sites with zero JS defaults. |
| Astro | Hugo | If the site is content-only with no interactive components whatsoever. Hugo builds are faster but the template language (Go templates) has steep DX costs. Astro's JSX-like syntax is simpler. |
| Cloudflare Pages | Netlify | If you need Netlify's form handling without any code. Cloudflare Pages requires a simple Worker for form submissions. For a pure static read-only site, Cloudflare is better. |
| Cloudflare Pages | Vercel | Vercel is optimized for Next.js. For a pure Astro static site, Cloudflare Pages has unlimited bandwidth vs Vercel's 100GB limit on free tier. |
| Tailwind CSS v4 | CSS Modules | If the team dislikes utility classes. Not recommended here — one developer building a small site, utility CSS is fastest path. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| WordPress | Requires PHP hosting (costs money), constant security patches, plugin bloat. A $5/month static site has better performance and zero attack surface. | Astro + Cloudflare Pages |
| Wix / Squarespace | Vendor lock-in, no GitHub integration (owner explicitly requested), difficult to customize beyond templates, monthly cost forever. | Astro + Cloudflare Pages |
| `@astrojs/tailwind` integration | **Deprecated** for Tailwind v4. Using it will pin you to Tailwind v3. The Vite plugin is the official v4 approach per Tailwind's own documentation. | `@tailwindcss/vite` plugin |
| PDF-embedded menus (iframe or link) | Kills SEO — Googlebot cannot index PDF menu content. Mobile usability is poor (pinch-zoom on phone). | HTML menu section with structured `Menu` schema JSON-LD |
| JavaScript-heavy hero sections (full-page video autoplay) | Dramatically increases LCP (Largest Contentful Paint), hurting Core Web Vitals and search rankings. | CSS-driven hero with a high-quality WebP image + CSS `object-fit: cover`. Add video only if owner provides it and it's served from Cloudflare's CDN. |
| Google Fonts via `<link>` tag | Third-party DNS lookup + render-blocking. Penalizes Core Web Vitals. | Self-host fonts using Astro's font pipeline or Fontsource npm packages (`@fontsource/oswald`) |

---

## Stack Patterns by Variant

**For static-only site (v1 — no contact form):**
- Pure static output (`output: 'static'` in Astro config, which is the default)
- Deploy to Cloudflare Pages with zero server-side code
- Zero hosting cost indefinitely

**If contact form is added later:**
- Add a Cloudflare Worker (free tier: 100k requests/day) to handle POST submissions
- Or use Resend's free tier (3,000 emails/month) with a Worker relay
- Do NOT add a Node.js server — keep the static core

**If online ordering is added in a future milestone:**
- Introduce Astro with `output: 'server'` + `@astrojs/cloudflare` adapter
- This enables server-side rendering while keeping the static pages fast
- Or integrate a third-party ordering embed (Toast, Square) as an island component

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| astro@5.x | tailwindcss@4.x | Requires `@tailwindcss/vite` plugin, NOT `@astrojs/tailwind`. Per official Tailwind docs (verified 2026-03-01). |
| astro@5.x | @astrojs/sitemap@latest | Full compatibility. |
| tailwindcss@4.x | Node.js 18+ | Node 22 recommended to match Cloudflare Pages build environment. |
| Astro 5.x | Cloudflare Pages | Native support. `output: 'static'` (default) requires no adapter. SSR requires `@astrojs/cloudflare` adapter. |

---

## SEO Stack Notes

For a local restaurant, search visibility depends heavily on non-code factors. These are the technical SEO requirements to bake in at build time:

1. **JSON-LD structured data** — `Restaurant` schema with `name`, `address`, `telephone`, `servesCuisine`, `openingHours`, `hasMenu`. Inject in `<head>` via Astro layout. Use `schema-dts` types to avoid property errors.
2. **Sitemap** — Auto-generated by `@astrojs/sitemap`. Submit to Google Search Console.
3. **Meta tags** — `<title>`, `<meta name="description">`, Open Graph tags for social sharing. Build a reusable `<SEO>` Astro component.
4. **Core Web Vitals** — Astro's zero-JS default + WebP images via `<Image>` + self-hosted fonts covers this automatically.
5. **Google Business Profile** — Not a code concern, but must be set up. Flag for owner.

---

## Sources

- `npm show astro version` — returns `5.18.0` (verified 2026-03-01, HIGH confidence)
- `npm show tailwindcss version` — returns `4.2.1` (verified 2026-03-01, HIGH confidence)
- [Tailwind CSS v4 official announcement](https://tailwindcss.com/blog/tailwindcss-v4) — stable January 22, 2025 (HIGH confidence)
- [Official Tailwind + Astro installation guide](https://tailwindcss.com/docs/installation/framework-guides/astro) — confirms `@tailwindcss/vite` approach, `@astrojs/tailwind` deprecated (HIGH confidence)
- [Cloudflare Pages free tier limits](https://developers.cloudflare.com/pages/platform/limits/) — unlimited bandwidth, 500 builds/month (HIGH confidence)
- [Astro Cloudflare Pages deployment docs](https://docs.astro.build/en/guides/deploy/cloudflare/) — official deployment guide (HIGH confidence)
- [Astro 5.10 responsive images release](https://astro.build/blog/astro-5100/) — responsive images now stable (HIGH confidence)
- WebSearch: Astro vs Next.js 2025/2026 comparisons — multiple sources converge on Astro for content sites (MEDIUM confidence, corroborated by official feature descriptions)
- WebSearch: Restaurant SEO structured data 2025 — JSON-LD Restaurant schema pattern confirmed by multiple SEO sources (MEDIUM confidence)

---

*Stack research for: Mike's Coney Island restaurant website*
*Researched: 2026-03-01*
