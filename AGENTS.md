# Agent Guidelines

NMS Optimizer Web is a React-based frontend application for optimizing technology layouts (adjacency bonuses and supercharged slots) in No Man's Sky.

## Core Directives

- **Package Manager**: Exclusively use **Bun** (version 1.2.0+). Always invoke scripts with `bun`.
- **Strict TypeScript**: Write explicit types, interfaces, and discriminated unions. The `any` type is strictly prohibited.
- **Zero Linter Suppressions**: Resolve underlying type or logic issues; inline `eslint-disable` comments are disallowed.
- **Documentation**: Document all public APIs, functions, and complex utilities with JSDoc containing `@param` and `@returns` types.
- **Knowledge Graph**: Check `graphify-out/` for codebase navigation (`graphify query "<question>"`). Always run `graphify update .` after modifying code.

## Verification Gate (Definition of Done)

Before marking any code task complete, execute this sequence:

1. `bun run typecheck` — Must report 0 TypeScript diagnostics (`tsgo`).
2. `bun run test -- <path>` or `bun run test` — Ensure targeted unit/component tests pass.
3. `bun run lint` — Must report 0 oxlint/ESLint errors.
4. `graphify update .` — Synchronize the knowledge graph.

## Key Commands & Gotchas

- **Dev**: `bun run dev` (starts dev server on <http://localhost:5173>; requires Python backend running on <http://127.0.0.1:5000>).
- **Build**: `bun run build` (production build, includes static site pre-rendering via SSG).
- **Single Test**: `bun run test -- src/path/to/file.test.tsx`.
- **Storybook**: `bun run test:storybook` (unit test stories) and `bun run test:storybook:a11y` (CLI a11y audit).
- **Format**: `bun run format` (formats `src/`, `README.md`, and markdown assets).

## Reference Guides (Progressive Disclosure)

Read these specialized guides when working on matching branches:

- **When writing CSS, SEO metadata, or commit messages**: Read [`docs/agents/project-rules.md`](docs/agents/project-rules.md) for critical iOS Safari GPU rendering workarounds, `<meta>` description preservation, and Angular commit conventions.
- **When creating or refactoring UI components**: Read [`docs/agents/component-architecture.md`](docs/agents/component-architecture.md) for prop drilling prevention and the Colocated Hook Pattern.
- **When writing Zustand stores, React hooks, or Tailwind styling**: Read [`docs/agents/code-style.md`](docs/agents/code-style.md) for Immer deep mutation rules, Tailwind v4 CSS-first config, and hook error handling.
- **When writing or fixing tests or Storybook stories**: Read [`docs/agents/testing.md`](docs/agents/testing.md) for module mocking, console log bans, and Storybook bundle cache safeguards.
- **When modifying Vite build config, SSG scripts, or server routing**: Read [`docs/agents/architecture.md`](docs/agents/architecture.md) for hybrid rendering flow and Rolldown chunking groups.

### Workflow References

- **When interacting with GitHub issues, PRs, or `/wayfinder`**: Read [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md).
- **When updating issue labels or triage states**: Read [`docs/agents/triage-labels.md`](docs/agents/triage-labels.md).
- **When referencing domain terminology or ADRs**: Read [`docs/agents/domain.md`](docs/agents/domain.md) and [`CONTEXT.md`](CONTEXT.md).
