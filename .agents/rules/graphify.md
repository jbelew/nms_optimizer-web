---
description: Mandatory use of Graphify knowledge graph for codebase navigation and ban on broad greps
globs: "**/*"
always_on: true
---

# Graphify Knowledge Graph Directives

1. **MANDATORY First-Line Tool**:
   - For ANY codebase question, architecture lookup, symbol search, or file relationship inquiry, you MUST run `venv/bin/graphify query "<question>"` or `venv/bin/graphify explain "<concept>"` BEFORE running any search or file-reading commands.
   - Use `venv/bin/graphify path "<A>" "<B>"` to trace dependencies and interactions between components.

2. **Broad Grep Ban**:
   - Running broad `grep`, `rg`, or `find` across `src/` or the repository root is STRICTLY PROHIBITED.
   - Falling back to scoped `grep` or file inspection is only permitted if `venv/bin/graphify query` returns no results or fails.

3. **Invocation Path**:
   - Always run Graphify from the project's virtual environment: `venv/bin/graphify`.

4. **Synchronization**:
   - After creating, updating, or deleting code, always run `venv/bin/graphify update .` to synchronize the AST graph (zero LLM token cost).
