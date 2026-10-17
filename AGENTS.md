# Agent Guidelines

NMS Optimizer Web is a React-based frontend application for optimizing technology layouts (adjacency bonuses and supercharged slots) in No Man's Sky.

## Core Directives

- **Package Manager**: Exclusively use **Bun** (version 1.2.0+). Always invoke scripts with `bun`.
- **Strict TypeScript**: Write explicit types, interfaces, and discriminated unions. The `any` type is strictly prohibited.
- **Zero Linter Suppressions**: Resolve underlying type or logic issues; inline `eslint-disable` comments are disallowed.
- **Documentation**: Document all public APIs, functions, and complex utilities with JSDoc containing `@param` and `@returns` types (conforming to the `agentic-jsdoc` skill).

## Verification Gate (Definition of Done)

Before marking any code task complete, execute this sequence:

1. `bun run typecheck` — Must report 0 TypeScript diagnostics (`tsgo`).
2. `bun run test -- <path>` or `bun run test:related` — Ensure targeted unit/component tests pass.
3. `bun run lint` — Must report 0 oxlint/ESLint errors.

## Key Commands & Gotchas

- **Dev**: `bun run dev` (starts dev server on <http://localhost:5173>; requires Python backend running on <http://127.0.0.1:5000>).
- **Build**: `bun run build` (production build, includes static site pre-rendering via SSG).
- **Single Test**: `bun run test -- src/path/to/file.test.tsx`.
- **Storybook**: `bun run test:storybook` (unit test stories) and `bun run test:storybook:a11y` (CLI a11y audit).
- **E2E Tests**: Do not run locally due to duration; CI runs them automatically. Only run locally (`bun run test:e2e:ci` or targeted spec) when actively debugging CI failures.
- **Format**: `bun run format` (formats `src/`, `README.md`, markdown assets, and locale JSON bundles).

## Reference Guides (Progressive Disclosure)

Read these specialized guides when working on matching branches:

- **When writing CSS, SEO metadata, or commit messages**: Read [`docs/agents/project-rules.md`](docs/agents/project-rules.md) for critical iOS Safari GPU rendering workarounds, `<meta>` description preservation, and Angular commit conventions.
- **When creating or refactoring UI components**: Read [`docs/agents/component-architecture.md`](docs/agents/component-architecture.md) for prop drilling prevention and the Colocated Hook Pattern.
- **When writing Zustand stores, React hooks, or Tailwind styling**: Read [`docs/agents/code-style.md`](docs/agents/code-style.md) for Immer deep mutation rules, Tailwind v4 CSS-first config, and hook error handling.
- **When writing or fixing tests or Storybook stories**: Read [`docs/agents/testing.md`](docs/agents/testing.md) for module mocking, console log bans, and Storybook bundle cache safeguards.
- **When modifying Vite build config, SSG scripts, or server routing**: Read [`docs/agents/architecture.md`](docs/agents/architecture.md) for hybrid rendering flow and Rolldown chunking groups.

## Agent skills

### Issue tracker

Issues and specs are tracked in GitHub Issues via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses the five default canonical triage labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`GLOSSARY.md` at the repo root and ADRs in `docs/adr/`). See `docs/agents/domain.md`.
