# Implementation Plan: Schema & SEO Localization Synchronization

## Phase 1: Shared Schema Logic (Build & Client) [x] [checkpoint: 7430fa1]
- [x] Task 1.1: Create `src/utils/seo-schema.ts` (or `shared/seo-schema.js`) <!-- files: src/utils/seo-schema.ts --> fcbecc9
    - [ ] Define functions (e.g., `getLocalizedSchema(t, lang, url)`) that return Schema objects.
    - [ ] These functions must only depend on the translation function `t` and local variables.
    - [ ] Include: `SoftwareApplication`, `WebSite`, `Organization`, `FAQPage`, and `BreadcrumbList`.
    - [ ] Write Vitest unit tests to ensure the JSON structure is correct for multiple languages.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Shared Schema Logic' (Protocol in workflow.md)

## Phase 2: Client-Side React Update <!-- depends: Phase 1 --> [~]
<!-- execution: parallel -->
- [x] Task 2.1: Update `useSeoAndTitle.ts` to use the new shared templates <!-- files: src/hooks/useSeoAndTitle/useSeoAndTitle.ts --> 73b6713
    - [ ] Replace hardcoded FAQ schema with calls to the shared utility.
    - [ ] Ensure all new schema types are injected into the DOM.
    - [ ] Verify with existing/updated unit tests in `useSeoAndTitle.test.tsx`.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Client-Side React Update' (Protocol in workflow.md)

## Phase 3: Build-Time SSG Update <!-- depends: Phase 1 --> [~]
<!-- execution: parallel -->
- [x] Task 3.1: Update `scripts/generate-ssg.mjs` to inject shared Schema <!-- files: scripts/generate-ssg.mjs --> e94a76d
    - [ ] Import the shared utility.
    - [ ] During the static generation of each page (for every language), call the utility to get the localized Schema.
    - [ ] Inject the resulting `<script type="application/ld+json">` into the static HTML files.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Build-Time SSG Update' (Protocol in workflow.md)

## Phase 4: Build & Audit <!-- depends: Phase 2, Phase 3 --> [~]
- [~] Task 4.1: Final Validation
    - [ ] Run `npm run build` (which triggers `generate-ssg.mjs`).
    - [ ] Inspect `dist/index.html` and localized versions (e.g., `dist/fr/index.html`) to verify static Schema presence.
    - [ ] Run a local preview and check the browser console/head for CSR parity.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Build & Audit' (Protocol in workflow.md)
