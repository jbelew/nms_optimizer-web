# Track Learnings: localization_remediation_20260418

Patterns, gotchas, and context discovered during implementation.

## Codebase Patterns (Inherited)

- **Localization Single Source of Truth**: All user-facing strings should reside in `public/locales/[lang]/translation.json`.
- **SSG & SEO Alignment**: SEO metadata and Schema.org markup (`ld+json`) must be synchronized with the localization files to ensure consistency between CSR and pre-rendered SSG pages (Refer to archived track `schema-localization-sync_20260418`).
- **i18next Integration**: Use the `useTranslation` hook for functional components and the `t()` function for string extraction.

---

<!-- Learnings from implementation will be appended below -->
