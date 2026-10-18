# Agent Guidelines

NMS Optimizer Web is a React-based frontend application for optimizing technology layouts (adjacency bonuses and supercharged slots) in No Man's Sky.

## Core Directives

- **Package Manager**: Exclusively use **Bun** (version 1.2.0+). Always invoke scripts with `bun`.
- **Strict TypeScript**: Write explicit types, interfaces, and discriminated unions. The `any` type is strictly prohibited.
- **Zero Linter Suppressions**: Resolve underlying type or logic issues; inline `eslint-disable` comments are disallowed.
- **Documentation**: Document all exported and top-level declarations, public APIs, functions, and complex utilities with JSDoc (conforming to the `agentic-jsdoc` skill; omit redundant `{type}` annotations on `@param` and `@returns` in `.ts`/`.tsx` files).

## Pre-Refactor Baseline Gate (Before Editing Code)

Before modifying any source files in a multi-file refactor (including `/improve-codebase-architecture` deepenings, store/hook consolidations, UI, layout, routing, bootstrap, or bundle changes), capture a baseline performance & bundle check (`bun run build && bun run perf:check`, plus a Lighthouse / Web Vitals baseline audit against `bun run preview` when touching UI, layout, routing, bootstrap, or bundle chunks; see [`docs/agents/testing.md`](docs/agents/testing.md)).

## Verification Gate (Definition of Done)

Before marking any code task complete, execute this sequence (also enforced automatically on `git commit` via Lefthook pre-commit hooks):

1. `bun run typecheck` — Must report 0 TypeScript diagnostics (`tsgo`).
2. `bun run test -- <path>` or `bun run test:related` — Ensure targeted unit/component tests pass.
3. `bun run lint` — Must report 0 oxlint/ESLint errors (use `bunx eslint --fix <touched-files>` to auto-fix `perfectionist` sorting).
4. **Post-Refactor Validation**: Re-run `bun run build && bun run perf:check` (and the validation Lighthouse / Web Vitals audit against `bun run preview` after purging Service Worker / Cache Storage) to confirm zero regressions in bundle size, Performance score, CLS, LCP, and TBT (see [`docs/agents/testing.md`](docs/agents/testing.md)).

## Key Commands & Gotchas

- **Dev**: `bun run dev` (starts dev server on <http://localhost:5173>; requires Python backend running on <http://127.0.0.1:5000>).
- **Build**: `bun run build` (production build, includes static site pre-rendering via SSG).
- **Single Test**: `bun run test -- src/path/to/file.test.tsx`.
- **Storybook**: `bun run test:storybook` (unit test stories) and `bun run test:storybook:a11y` (CLI a11y audit).
- **E2E Tests**: Do not run locally due to duration; CI runs them automatically. Only run locally (`bun run test:e2e:ci` or targeted spec) when actively debugging CI failures.
- **Format**: Prefer `bunx prettier --write <touched-files>` (or let Lefthook format staged files on `git commit`); `bun run format` formats the entire repository (`src/`, `README.md`, markdown assets, and locale JSON bundles).

## Reference Guides (Progressive Disclosure)

Read these specialized guides when working on matching branches:

- **When naming props, variables, JSDoc, or test cases**: Read [`GLOSSARY.md`](GLOSSARY.md) for canonical domain terms (even when destructuring legacy store keys like `state.techGroups` or `state.checkedModules`) and [`docs/agents/domain.md`](docs/agents/domain.md) for ADR conventions.
- **When writing CSS, SEO metadata, or commit messages**: Read [`docs/agents/project-rules.md`](docs/agents/project-rules.md) for critical iOS Safari GPU rendering workarounds, `<meta>` description preservation, and Angular commit conventions.
- **When creating or refactoring UI components**: Read [`docs/agents/component-architecture.md`](docs/agents/component-architecture.md) for dialog directory layout, prop drilling prevention, and the Colocated Hook Pattern.
- **When writing Zustand stores, React hooks, or Tailwind styling**: Read [`docs/agents/code-style.md`](docs/agents/code-style.md) for `perfectionist` alphabetical sorting, Immer deep mutation rules, Tailwind v4 CSS-first config, and pre-paint `useLayoutEffect` measurement rules.
- **When writing or fixing tests, Storybook stories, or running Chrome/Lighthouse audits**: Read [`docs/agents/testing.md`](docs/agents/testing.md) for module mocking, console log bans, Storybook bundle cache safeguards, and WSL2 Chrome DevTools / Lighthouse workflows.
- **When modifying Vite build config, SSG scripts, or server routing**: Read [`docs/agents/architecture.md`](docs/agents/architecture.md) for hybrid rendering flow and Rolldown chunking groups.
- **When reading, triaging, spec'ing, or closing GitHub issues (`/to-spec`, `/to-tickets`, `/implement`, `/triage`)**: Read [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md) and [`docs/agents/triage-labels.md`](docs/agents/triage-labels.md) (always pass `--json` to `gh issue view`; prefix specs with `spec:` + `spec` label; close resolved tickets immediately on commit).
