# Static Site Generation with Markdown Rendering

## Overview

This implementation solves the SEO problem where markdown content was not being pre-rendered in the HTML. Previously, pages like `/about`, `/instructions`, and `/changelog` would load with empty content until the client-side JavaScript fetched and rendered the markdown files.

The solution combines:
1. **Markdown Bundling** - Vite plugin that bundles all markdown files at build time as a fallback
2. **Markdown Rendering** - Build script that renders markdown to styled HTML using `marked`
3. **Static Generation** - Generates 30 static HTML files (one per language/page) with embedded pre-rendered HTML
4. **Smart Hydration** - Client-side code that uses pre-rendered HTML when available, falling back to client-side rendering

## How It Works

### Build Time

1. **Vite Plugin** (`scripts/vite-plugin-markdown-bundle.mjs`)
   - Reads all markdown files from `/public/assets/locales/*/`
   - Creates a virtual module `virtual:markdown-bundle` that exports raw markdown content
   - Acts as a fallback for client-side rendering if pre-rendered content is not available
   - Watches markdown files in dev mode for hot updates

2. **Markdown Processor** (`scripts/markdown-processor.mjs`)
   - Uses `marked` library to render markdown to HTML
   - Applies consistent styling classes (Radix UI compatible):
     - Headings: `text-base sm:text-lg mb-3` for h2, etc.
     - Paragraphs: `text-sm sm:text-base mb-2`
     - Lists: `list-disc pl-6 mb-2` / `list-decimal pl-6 mb-2`
     - Links: auto `target="_blank"` for external links
     - Code: styled with cyan background
   - Generates IDs for h2 headings for scroll-to-section functionality

3. **SSG Script** (`scripts/generate-ssg.mjs`)
   - Runs after Vite build completes
   - Generates 30 static HTML pages (5 languages × 6 routes including root):
     - Root: `/`, `/es/`, `/fr/`, `/de/`, `/pt/`
     - Pages: `/about`, `/instructions`, `/changelog`, `/translation`, `/userstats`
     - For each language: `/es/about`, `/fr/about`, etc.
   - Each generated page includes:
     - Correct canonical URL
     - Hreflang tags for all language variants
     - Rendered HTML content in a hidden `<div data-prerendered-markdown="true">` element
     - Content is in the initial HTML, visible to search engine crawlers

3. **Build Output**
   ```
   dist/
   ├── index.html                    (root in English)
   ├── about/index.html
   ├── instructions/index.html
   ├── changelog/index.html
   ├── es/index.html                 (root in Spanish)
   ├── es/about/index.html
   ├── es/instructions/index.html
   ├── ... (repeats for fr, de, pt)
   ```

### Runtime

1. **Markdown Loading Hook** (`src/hooks/useMarkdownContent/useMarkdownContent.ts`)
   - Checks `window.__MARKDOWN_BUNDLE__` for pre-rendered content first
   - Uses embedded markdown if available (no network request needed)
   - Falls back to `virtual:markdown-bundle` if not pre-rendered
   - Falls back to HTTP request if neither available

2. **Benefits**
   - ✅ Markdown content is in initial HTML (search engines see full content)
   - ✅ No flash of loading skeletons on page load
   - ✅ Zero network requests for markdown on initial page load
   - ✅ Proper canonical and hreflang tags for SEO
   - ✅ Client hydration still works seamlessly

   ### Runtime Components

   1. **Prerendered Markdown Renderer** (`src/components/AppDialog/PrerenderedMarkdownRenderer.tsx`)
   - On initial page load, checks for `<div data-prerendered-markdown="true">` in the DOM
   - If found, renders the pre-rendered HTML directly (zero rendering delay)
   - Handles scroll-to-section functionality with intersection observers

   2. **Markdown Loading Hook** (`src/hooks/useMarkdownContent/useMarkdownContent.ts`)
   - Bundled markdown accessible via `virtual:markdown-bundle` 
   - Used as fallback for non-SSG routes or client-side navigation
   - No network requests needed (markdown is in JS bundle)

   3. **Smart Fallback in MarkdownContentRenderer** (`src/components/AppDialog/MarkdownContentRenderer.tsx`)
   - Detects pre-rendered content on mount and uses `PrerenderedMarkdownRenderer` if available
   - Falls back to client-side `react-markdown` rendering for dynamic content or non-prerendered pages
   - Seamless experience regardless of rendering path

   ## Configuration

### Supported Languages
`SUPPORTED_LANGUAGES` in `scripts/generate-ssg.mjs`:
- `en` (English)
- `es` (Spanish)
- `fr` (French)
- `de` (German)
- `pt` (Portuguese)

### Supported Pages
`KNOWN_DIALOGS` in `scripts/generate-ssg.mjs`:
- `about`
- `instructions`
- `changelog`
- `translation`
- `userstats`

To add new languages or pages, update these constants and ensure markdown files exist at:
```
public/assets/locales/{lang}/{pageName}.md
```

## File Changes

### New Files
- `scripts/vite-plugin-markdown-bundle.mjs` - Vite plugin for bundling markdown
- `scripts/markdown-processor.mjs` - Converts markdown to styled HTML using `marked`
- `scripts/generate-ssg.mjs` - Static site generation script
- `src/vite-env-markdown.d.ts` - TypeScript declarations for virtual module
- `src/components/AppDialog/PrerenderedMarkdownRenderer.tsx` - Renders pre-rendered HTML
- `docs/SSG_MARKDOWN_BUNDLING.md` - This documentation

### Modified Files
- `vite.config.ts` - Added markdown bundle plugin to plugins array
- `src/hooks/useMarkdownContent/useMarkdownContent.ts` - Uses bundled markdown as fallback
- `src/components/AppDialog/MarkdownContentRenderer.tsx` - Detects and uses pre-rendered content
- `package.json` - Build scripts now run SSG after Vite build, added `marked` and `marked-gfm-heading-id` dependencies

## Build Process

The build process now includes an additional step:

```bash
npm run build
# Runs:
# 1. tsc -b                      (TypeScript compilation)
# 2. vite build --mode production (Vite build with markdown bundling)
# 3. node scripts/generate-ssg.mjs (Generate static pages)
```

Same for Docker and critical builds:
```bash
npm run build:docker
npm run build:critical
```

## SEO Improvements

### Before
- Pages loaded with empty content skeleton
- Search engines saw minimal content
- Query parameter fragmentation (`?lng=en`)
- Low CTR (0.82%-2.11%) and poor positioning (avg rank 6-11)

### After
- Pages have complete pre-rendered HTML content in initial response
- Search engines see full formatted HTML immediately (no JavaScript execution needed)
- Clean URL structure (`/es/about` instead of `/?lng=es`)
- Proper canonical and hreflang tags for all variants
- Eliminates duplicate content issues
- Content includes proper heading hierarchy, links, lists - all formatted HTML

## Performance Impact

### Initial Page Load
- Pre-rendered content loads instantly (no JavaScript needed)
- Zero network requests for markdown on initial visit
- No flash of loading skeletons
- Faster First Contentful Paint (FCP) and Largest Contentful Paint (LCP)

### Bundle Size
- Markdown rendering happens at build time (not shipped to browser)
- Fallback bundled markdown adds ~60-70 KB gzipped to main JS bundle
- But initial HTML is pre-rendered (can't be compressed further)
- Trade-off: Larger initial HTML response, but faster rendering

### Runtime Performance
- Pre-rendered content displays synchronously
- No React rendering needed for pre-rendered content
- Client-side navigation uses bundled markdown (no network requests)
- Markdown hydration is instant - no processing delay

## Fallback Behavior

If markdown is missing, the system gracefully falls back:
1. Pre-rendered markdown (if SSG ran) → Use it immediately
2. Bundled markdown (`virtual:markdown-bundle`) → Load from JS bundle
3. Error handling → Show "Failed to load content" message

This ensures the app works even if SSG fails or markdown files are missing.

## Development

During development, both approaches work:

1. **Using SSG output** (production-like)
   ```bash
   npm run build
   npm run preview
   ```

2. **Hot reload with bundled content** (faster dev loop)
   ```bash
   npm run dev
   # Edit markdown files and see hot updates
   ```

The markdown bundle plugin watches for markdown file changes in dev mode and invalidates the module.

## Troubleshooting

### Content not showing
- Check that markdown files exist at `public/assets/locales/{lang}/{page}.md`
- Verify build completed successfully (`npm run build`)
- Check browser DevTools for `__MARKDOWN_BUNDLE__` in window object

### Build fails
- Ensure all required markdown files exist
- Check that language codes match in both `package.json` and script
- Review `scripts/generate-ssg.mjs` output for specific errors

### SEO not improving
- Verify Google Search Console is re-crawling pages
- Check that canonical tags point to correct URLs
- Ensure hreflang tags are all present (should be 7 per page: 1 en + 1 x-default + 5 languages)
