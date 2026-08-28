# Agent Guidelines

NMS Optimizer Web is a React-based frontend application for optimizing technology layouts (adjacency bonuses and supercharged slots) in No Man's Sky.

## Package Manager
This project uses **Bun** (version 1.2.0+) as its package manager instead of npm/pnpm. Always run commands using `bun`.

## Core Constraints
- **Strict TypeScript**: This is a strict TypeScript project. The use of `any` is never permitted.

## Build & Test Commands

- **Dev**: `bun run dev` (starts development server at http://localhost:5173, expects Python API at http://127.0.0.1:5000)
- **Build**: `bun run build` (production build, includes static site generation)
- **Test all**: `bun run test` (Vitest unit and component tests with coverage)
- **Test single file**: `bun run test -- src/path/to/file.test.tsx`
- **Test watch**: `bun run test -- --watch`
- **Storybook tests**: `bun run test:storybook` (runs story-based tests with Vitest)
- **Storybook watch**: `bun run test:storybook:watch`
- **Storybook a11y**: `bun run test:storybook:a11y` (accessibility violations check via CLI)
- **Lint**: `bun run lint` (ESLint 10 check) and `bun run lint:fix` (auto-fix)
- **Format**: `bun run format` (formats the `src/` directory using Prettier)
- **Type check**: `bun run typecheck` (TypeScript 6.0+ type checking)

## Reference Guides (Progressive Disclosure)

For detailed instructions and constraints, refer to the following guides:

- 🏗️ **[System Architecture](file:///home/jbelew/projects/nms_optimizer-web/docs/agents/architecture.md)** — Hybrid rendering (SSG + client fallback), directory structure, and Vite 8/Rolldown build settings.
- 🎨 **[Code Style Guidelines](file:///home/jbelew/projects/nms_optimizer-web/docs/agents/code-style.md)** — TypeScript conventions, Zustand/Immer patterns, Tailwind v4 setups, React hooks, and error handling.
- 🧪 **[Testing Guidelines](file:///home/jbelew/projects/nms_optimizer-web/docs/agents/testing.md)** — Vitest mocking patterns, console log bans, and Storybook build limits.
- 📐 **[Component Architecture](file:///home/jbelew/projects/nms_optimizer-web/docs/agents/component-architecture.md)** — Prevention of prop drilling and use of the Colocated Hook Pattern.
- 🚨 **[Project Safeguards & Rules](file:///home/jbelew/projects/nms_optimizer-web/docs/agents/project-rules.md)** — Critical warnings for iOS Safari GPU rendering bugs, SEO metadata, and Angular commit formatting.

### Agent Workflow References
- 🎫 **[Issue Tracker Conventions](file:///home/jbelew/projects/nms_optimizer-web/docs/agents/issue-tracker.md)** — Creating, reading, wayfinding, and resolving issues via the `gh` CLI.
- 🏷️ **[Triage Labels Map](file:///home/jbelew/projects/nms_optimizer-web/docs/agents/triage-labels.md)** — Canonical roles mapped to GitHub label strings.
- 📖 **[Domain Documentation Map](file:///home/jbelew/projects/nms_optimizer-web/docs/agents/domain.md)** — How to read and apply the domain context glossary.
