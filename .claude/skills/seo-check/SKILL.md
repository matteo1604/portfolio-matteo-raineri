---
name: seo-check
description: SEO and meta tag audit for the portfolio. Triggers before deploy or on explicit SEO check requests. Verifies meta tags (OG, Twitter), favicon set, font preload strategy, heading hierarchy, semantic HTML, robots.txt, sitemap.xml, JSON-LD structured data, and canonical URL. Outputs a checklist with status indicators.
---

# SEO Check Skill

This portfolio is a Vite SPA with minimal `index.html`. Most SEO fundamentals are currently missing. This skill audits and tracks implementation of all SEO requirements.

## When to trigger

- Before any deploy or production build
- When the user asks to check SEO ("seo", "meta tag", "og:image", "social preview", "controlla seo", "lighthouse seo")
- After modifying `index.html`, heading structure, or adding new sections
- After modifying font loading strategy

## Audit checklist

Run each check and report status using:
- ✅ Present and correct
- ❌ Missing
- ⚠️ Present but needs improvement

---

### 1. Meta tags in index.html

**File:** `index.html`

Check for ALL of the following in `<head>`:

```
[ ] <title> — should be descriptive, 50-60 chars
    e.g. "Matteo Raineri — Frontend Engineer & Interactive Systems"
[ ] <meta name="description"> — 150-160 chars, compelling
[ ] <meta name="viewport"> — should already exist
[ ] <link rel="canonical" href="https://[domain]">

Open Graph:
[ ] <meta property="og:type" content="website">
[ ] <meta property="og:title">
[ ] <meta property="og:description">
[ ] <meta property="og:image"> — absolute URL, min 1200x630px
[ ] <meta property="og:url">
[ ] <meta property="og:site_name">
[ ] <meta property="og:locale" content="en_US">

Twitter Card:
[ ] <meta name="twitter:card" content="summary_large_image">
[ ] <meta name="twitter:title">
[ ] <meta name="twitter:description">
[ ] <meta name="twitter:image">
[ ] <meta name="twitter:creator" content="@handle"> (if applicable)
```

Severity: ❌ for each missing tag

---

### 2. Favicon set

**Directory:** `/public`

Check for:

```
[ ] favicon.ico (16x16 or multi-size .ico)
[ ] favicon-16x16.png
[ ] favicon-32x32.png
[ ] apple-touch-icon.png (180x180)
[ ] android-chrome-192x192.png
[ ] android-chrome-512x512.png
[ ] site.webmanifest (references the icons above)
```

And in `index.html <head>`:

```
[ ] <link rel="icon" type="image/x-icon" href="/favicon.ico">
[ ] <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
[ ] <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
[ ] <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
[ ] <link rel="manifest" href="/site.webmanifest">
```

Severity: ❌ if no favicon at all, ⚠️ if only partial set

---

### 3. Font preload strategy

**Files:** `index.html`, `src/app/components/Hero.tsx`, `src/styles/fonts.css`

Check:

```
[ ] Fonts are loaded via <link> in index.html, NOT via JS (createElement)
[ ] <link rel="preconnect" href="https://fonts.googleapis.com">
[ ] <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
[ ] <link rel="preload" as="style" href="[google fonts URL]">
[ ] <link rel="stylesheet" href="[google fonts URL]">
[ ] font-display: swap is present (Google Fonts adds this via &display=swap)
[ ] No JS-based font injection in Hero.tsx or any component
```

Required fonts: Inter (body), Syne (display), DM Mono (code)

Recommended `index.html` pattern:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" />
```

Severity: ⚠️ if loaded via JS (causes FOIT/FOUT, delays LCP)

---

### 4. Heading hierarchy

**Files:** All section components

Check:

```
[ ] Exactly ONE <h1> in the entire page — should be in Hero.tsx
[ ] Each section has an <h2> as its primary heading
[ ] No heading level skips (h1 → h3 without h2)
[ ] Headings are semantic, not just styled (no <div> styled as heading)
[ ] Headings follow document order (h1 → h2 → h3, never h3 → h2)
```

Use grep to find all heading tags:
- Search for `<h1`, `<h2`, `<h3`, `<h4`, `<h5`, `<h6` across `src/`
- Also search for role="heading" for ARIA headings

Severity: ⚠️ for multiple h1 or skipped levels

---

### 5. Alt text and ARIA

**Files:** All components

Check:

```
[ ] All <img> tags have alt="" (decorative) or descriptive alt text
[ ] Decorative elements (particles, cursor, bleed, transitions) have aria-hidden="true"
[ ] Interactive elements have accessible names
[ ] Canvas elements (FloatingElements) have aria-hidden="true"
[ ] Icon-only buttons have aria-label
[ ] No aria-hidden="true" on focusable elements
```

Grep patterns:
- `<img` without `alt`
- `<canvas` without `aria-hidden`
- `<button` without accessible text
- `role="presentation"` or `aria-hidden="true"` on existing decorative elements

Severity: ⚠️ for missing alt/aria on decorative, ❌ for missing on interactive

---

### 6. Semantic HTML

**Files:** `App.tsx`, section components

Check:

```
[ ] <main> wraps the primary content area
[ ] <nav> wraps the navigation
[ ] Each section uses <section> with aria-label or aria-labelledby
[ ] <footer> wraps the contact/closing section (or a dedicated footer)
[ ] <header> wraps the hero or top section if applicable
[ ] Skip-to-content link exists for keyboard navigation
```

Severity: ⚠️ for missing semantic landmarks

---

### 7. robots.txt and sitemap.xml

**Directory:** `/public`

Check:

```
[ ] /public/robots.txt exists
[ ] robots.txt allows all crawlers (or has intentional restrictions)
[ ] /public/sitemap.xml exists
[ ] sitemap.xml has the correct <url> for the canonical domain
[ ] sitemap.xml has <lastmod> date
```

Minimal `robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://[domain]/sitemap.xml
```

Minimal `sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://[domain]/</loc>
    <lastmod>[YYYY-MM-DD]</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

Severity: ❌ for missing files

---

### 8. Performance hints

**File:** `index.html`

Check:

```
[ ] <link rel="preconnect"> for Google Fonts (see check 3)
[ ] <link rel="dns-prefetch"> for any external domains
[ ] <meta name="theme-color" content="#000000"> (matches dark background)
[ ] No render-blocking scripts in <head> without defer/async
```

Severity: ⚠️ for missing performance hints

---

### 9. JSON-LD structured data

**File:** `index.html`

Check:

```
[ ] <script type="application/ld+json"> exists in <head>
[ ] Contains Person schema (or WebSite + Person)
```

Recommended schema:
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Matteo Raineri",
  "jobTitle": "Frontend Engineer",
  "url": "https://[domain]",
  "sameAs": [
    "https://github.com/[handle]",
    "https://linkedin.com/in/[handle]"
  ],
  "knowsAbout": ["React", "TypeScript", "Interactive Systems", "Motion Design"]
}
```

Severity: ❌ if no structured data at all

---

### 10. Canonical URL

**File:** `index.html`

Check:

```
[ ] <link rel="canonical" href="https://[domain]/"> exists
[ ] URL matches the actual production domain
[ ] No trailing slash inconsistency
```

Severity: ❌ if missing

---

## Output format

```
## SEO Audit Report — [date]

### Summary
- ✅ Passing: [count]
- ❌ Missing: [count]
- ⚠️ Needs improvement: [count]

### Results

| # | Check | Status | Details |
|---|-------|--------|---------|
| 1 | Meta tags | ❌/⚠️/✅ | [specifics] |
| 2 | Favicon set | ❌/⚠️/✅ | [specifics] |
| 3 | Font preload | ❌/⚠️/✅ | [specifics] |
| 4 | Heading hierarchy | ❌/⚠️/✅ | [specifics] |
| 5 | Alt text & ARIA | ❌/⚠️/✅ | [specifics] |
| 6 | Semantic HTML | ❌/⚠️/✅ | [specifics] |
| 7 | robots.txt & sitemap | ❌/⚠️/✅ | [specifics] |
| 8 | Performance hints | ❌/⚠️/✅ | [specifics] |
| 9 | JSON-LD | ❌/⚠️/✅ | [specifics] |
| 10 | Canonical URL | ❌/⚠️/✅ | [specifics] |

### Priority fixes (ordered)
1. [highest impact fix]
2. ...

### Implementation snippets
[Ready-to-paste code for each fix]
```

## Rules

- Always verify against actual files, not assumptions
- Report the domain as `[domain]` placeholder if not known — ask the user
- Font loading is both an SEO issue (LCP) and a perf issue — coordinate with perf-audit skill
- Do not suggest SSR/SSG migration — this is a Vite SPA by design
- For a SPA, focus on what can be done in index.html and build config
- Open Graph images need to be actual files in /public, not dynamically generated
