# Gemini Agent: Core Directives & Protocols

This document captures project-specific protocols and configurations for AI agents.

## Learning Protocol

- **Learning Log**: Maintain `LEARNINGS.gemini.md` in the root directory.
- **Record Cycles**: Summarize each PRAR cycle at the end of the log. Do not modify or remove past entries; only append.

## JSDoc Guidelines

- Ensure all public APIs, functions, classes, and complex variables are documented with JSDoc conforming to the **agentic-jsdoc** skill.
- Always include `@param` tags for parameters and `@returns` for return values, using TypeScript types where applicable.

## Tool Protocols

- **Beads**: Only use Beads in conjunction with Conductor. Do not use Beads for independent tasks unless a Conductor track or plan is active.

## Graphify (Knowledge Graph)

This project has a knowledge graph at `graphify-out/`.
- For codebase questions, run `graphify query "<question>"` when `graphify-out/graph.json` exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts.
- If `graphify-out/wiki/index.md` exists, use it for broad navigation instead of raw source browsing.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
