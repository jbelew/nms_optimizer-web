# Gemini Agent: Core Directives & Protocols

This document captures project-specific protocols and configurations for AI agents.

## JSDoc Guidelines

- Ensure all public APIs, functions, classes, and complex variables are documented with JSDoc conforming to the **agentic-jsdoc** skill.
- Always include `@param` tags for parameters and `@returns` for return values, using TypeScript types where applicable.

## Tool Protocols

- **Beads**: Only use Beads in conjunction with Conductor. Do not use Beads for independent tasks unless a Conductor track or plan is active.

## Graphify (Knowledge Graph)

This project has a knowledge graph at `graphify-out/`.

- **MANDATORY First Step**: For any codebase question, architecture lookup, or symbol search, you MUST run `venv/bin/graphify query "<question>"` or `venv/bin/graphify explain "<concept>"` FIRST.
- **Broad Grep Ban**: Running broad `grep`, `rg`, or `find` across `src/` or the repository root is STRICTLY PROHIBITED unless `graphify query` specifically returns no results or fails.
- **Binary Path**: Always invoke via `venv/bin/graphify` (in the local virtualenv).
- **Relationships & Navigation**: Use `venv/bin/graphify path "<A>" "<B>"` for relationships and `graphify-out/wiki/index.md` (if it exists) for broad navigation instead of raw source browsing.
- **Broad Review**: Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review.
- **Post-Modification**: After modifying code, run `venv/bin/graphify update .` to keep the graph current (AST-only, no API cost).
