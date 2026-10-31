# Agent Guidelines

NMS Optimizer Web is a React-based frontend application for optimizing technology layouts (adjacency bonuses and supercharged slots) in No Man's Sky.

## Core Directives

- **Package Manager**: Exclusively use **Bun** (version 1.2.0+). Always invoke scripts with `bun`.
- **Strict TypeScript**: Write explicit types, interfaces, and discriminated unions. The `any` type is strictly prohibited.
- **Zero Linter Suppressions**: Resolve underlying type or logic issues; inline `eslint-disable` comments are disallowed.
- **Documentation**: Document all exported and top-level declarations, public APIs, functions, hooks, stores, and React components with JSDoc; read [`.agents/skills/agentic-jsdoc/SKILL.md`](.agents/skills/agentic-jsdoc/SKILL.md) and [`.agents/skills/agentic-jsdoc/reference/react.md`](.agents/skills/agentic-jsdoc/reference/react.md) when writing or updating JSDoc.

## Pre-Refactor Baseline Gate (Bundle / Runtime / SSG Refactors)

Before modifying client runtime, styling, or SSG build inputs (`src/**` non-test files, `shared/**`, `public/**`, `index.html`, `vite.config.ts`, `package.json`, `scripts/generate-*.mjs`) in a multi-file refactor, run `bun run perf:baseline` to record bundle sizes and Desktop/Mobile Lighthouse Web Vitals to `/tmp/nms-perf-baseline.json`. Skip for ops-script, test-only, or documentation tasks.

## Verification Gate (Definition of Done)

Before marking any code task complete, execute this sequence (also enforced automatically on `git commit` / `git push` via Lefthook):

1. `bun run typecheck` — Must report 0 TypeScript diagnostics (`tsgo`).
2. Targeted tests — Run `bun run test -- <path>` / `bun run test:related` for `src/` or `shared/` changes, `bun test --dots scripts/` for `scripts/` or `functions/` changes, and `bun run lint:md` for Markdown/Mermaid changes.
3. `bun run lint` — Must report 0 oxlint/ESLint errors and 0 warnings (use `bunx eslint --fix <touched-files>` to auto-fix `perfectionist` sorting).
4. **Code Review (when running `/implement`)**: After committing, run [`.agents/skills/code-review/SKILL.md`](.agents/skills/code-review/SKILL.md) against `HEAD~1` and amend any fixes (`git commit --amend --no-edit`) before running `perf:compare` or closing the ticket.
5. **Post-Refactor Validation**: When the commit touches bundle, CSS, or SSG build inputs (checkable automatically via `bun run perf:compare:if-needed`), run `bun run perf:compare` (or `bun run perf:compare <base-git-ref>`) on the final commit and **include the generated Before vs. After Bundle Size and Desktop/Mobile Lighthouse Markdown tables in your response to the user**.

## Key Gotchas

- **Dev Server (`bun run dev`)**: Starts Vite on <http://localhost:5173> and requires the Python backend running on <http://127.0.0.1:5000>; bypasses SSG pre-rendering.
- **E2E Tests**: Rely on CI to run Playwright E2E suites; run locally (`bun run test:e2e:ci` or a single spec) only when actively debugging CI failures.
- **Formatting**: Format touched files with `bunx prettier --write <touched-files>` (or let Lefthook format staged files on `git commit`) rather than running repo-wide `bun run format`.

## Reference Guides (Progressive Disclosure)

Read these specialized guides when working on matching branches:

- **When naming props, variables, JSDoc, or test cases**: Read [`GLOSSARY.md`](GLOSSARY.md) for canonical domain terms (even when destructuring legacy store keys like `state.techGroups` or `state.checkedModules`) and [`docs/agents/domain.md`](docs/agents/domain.md) for ADR conventions.
- **When writing CSS, SEO metadata, or commit messages**: Read [`docs/agents/project-rules.md`](docs/agents/project-rules.md) for critical iOS Safari GPU rendering workarounds, `<meta>` description preservation, and Angular commit conventions.
- **When creating or refactoring UI components**: Read [`docs/agents/component-architecture.md`](docs/agents/component-architecture.md) for dialog directory layout, prop drilling prevention, and the Colocated Hook Pattern.
- **When writing Zustand stores, React hooks, or Tailwind styling**: Read [`docs/agents/code-style.md`](docs/agents/code-style.md) for `perfectionist` alphabetical sorting, Immer deep mutation rules, Tailwind v4 CSS-first config, and pre-paint `useLayoutEffect` measurement rules.
- **When writing or fixing tests, Storybook stories, or running Chrome/Lighthouse audits**: Read [`docs/agents/testing.md`](docs/agents/testing.md) for module mocking, console log bans, Storybook bundle cache safeguards, and WSL2 Chrome DevTools / Lighthouse workflows.
- **When modifying Vite build config, SSG scripts, Cloudflare Pages Functions (`functions/`), or Zone/edge routing**: Read [`docs/agents/architecture.md`](docs/agents/architecture.md) for hybrid rendering flow, Cloudflare token roles & Ruleset invariants, local Wrangler `workerd` testing, and Rolldown chunking groups.
- **When implementing or debugging Python backend solver tickets (`nms_optimizer-service`)**: Read [`../nms_optimizer-service/AGENTS.md`](../nms_optimizer-service/AGENTS.md) and run its verification gate (`./venv/bin/pyright`, `./venv/bin/ruff check`, `./venv/bin/ruff format --check`, `./venv/bin/pytest`) instead of the frontend Bun/Lighthouse gate.
- **When reading, triaging, spec'ing, or closing GitHub issues or PRs (`/to-spec`, `/to-tickets`, `/implement`, `/triage`, `/pr`)**: Read [`docs/agents/issue-tracker.md`](docs/agents/issue-tracker.md) and [`docs/agents/triage-labels.md`](docs/agents/triage-labels.md) (format `gh issue view --json` with `--jq`; patch PR bodies via REST `gh api --method PATCH`; close resolved tickets immediately on commit).
