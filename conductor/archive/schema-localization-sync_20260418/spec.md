# Specification: Schema & SEO Localization Synchronization

## Overview
Synchronize and localize `ld+json` structured data across the React application and the Static Site Generation (SSG) layer. Ensure that bots and non-JS users receive accurate, localized Schema markup that matches the dynamic React views, using the existing `translation.json` files as the single source of truth for all content.

## Functional Requirements
- **Shared Schema Logic:** Create a shared utility (e.g., `src/utils/seo-schema.ts`) to define the structure for `SoftwareApplication`, `WebSite`, `Organization`, `FAQPage`, and `BreadcrumbList`. This logic will be populated with localized text from `translation.json`.
- **Build-Time SSG Injection:** Pre-render localized `ld+json` blocks into the `<head>` of all static HTML files during the build process (`generate-ssg.mjs`). This ensures zero request-time overhead on Cloudflare Pages.
- **React Parity (CSR):** The `useSeoAndTitle` hook in React will use the same shared logic and `translation.json` content to inject/update Schema dynamically during client-side navigation.
- **Localization Alignment:** Ensure that all Schema fields (names, descriptions, FAQ text) are correctly pulled from the existing `i18n` resources for each supported language.

## Non-Functional Requirements
- **TTFB Optimization:** No request-time Schema generation in Cloudflare functions. All static content must be pre-rendered.
- **Lightweight SSG:** SSG pages must remain lean; Schema should be injected as static `<script>` tags without requiring runtime JS for initial bot indexing.

## Acceptance Criteria
- [ ] Localized `ld+json` blocks exist in the `<head>` of all generated static HTML files in `dist/`.
- [ ] Schema content matches the translations in `translation.json` for each respective language.
- [ ] Rich Results Test (Google) validates the markup for `SoftwareApplication` and `FAQPage`.
- [ ] Initial page load (SSG) and subsequent React-based navigations show consistent, localized Schema.

## Out of Scope
- Server-side logic or middleware for Schema generation.
- Redesigning the application UI or adding new analytics.
