# Track Learnings: code_review_followup_20260518

Patterns, gotchas, and context discovered during implementation.

## Codebase Patterns (Inherited)

- **Store Orchestration**: Use `sessionCoordinator` for multi-store side effects to keep individual stores decoupled.
- **React 19 SEO**: Use declarative tags in `Seo.tsx` rather than imperative DOM manipulation.
- **Headless Performance**: Always use `--headless --no-sandbox --disable-gpu` for Chrome in WSL2 environments.

---

---

## [2026-05-18] - Final Track Summary
- **Implemented:** Full code review follow-up pass.
- **Files changed:** `src/App.tsx`, `src/store/app/optimizeStore.ts`, `src/store/grid/gridStore.ts`, `src/store/sessionCoordinator.ts`, and multiple components/tests for PascalCase renaming.
- **Commit:** `8bd9984`
- **Learnings:**
  - **Patterns:** 
    - **Discriminated Store Unions:** Migrating from boolean-bag state (e.g., `solving`, `showError`) to a single `status` union dramatically simplifies UI conditional rendering and eliminates invalid state combinations.
    - **Centralized Timing:** Extracting UI timings to `constants.ts` makes the application's interactive feel much easier to tune.
    - **Dynamic i18n Discovery:** Deriving the supported language list from the i18n configuration ensures the router and UI never drift from the available translations.
  - **Gotchas:** 
    - **PascalCase Enforcement:** Bulk renaming requires careful attention to case-insensitive file systems (like macOS or Windows) vs case-sensitive CI/CD environments. Always use `git mv`.
    - **Zustand Getter Removal:** Removing zero-arg getters improves performance and predictability by encouraging reactive property access via selectors.
  - **Context:** The codebase is now in high alignment with the project's engineering standards (PascalCase, decoupled stores, explicit JSDoc).
