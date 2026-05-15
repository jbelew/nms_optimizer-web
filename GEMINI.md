# Gemini Agent: Core Directives and Operating Protocols

This document captures project-specific operating protocols and environment-specific configurations for AI agents.

## WSL2 Performance Audit Protocol

To run performance audits (Lighthouse/LHCI) in WSL2, you MUST follow these steps to ensure Chrome is correctly configured and reachable:

1. **CHROME_PATH**: Ensure `CHROME_PATH="/usr/bin/google-chrome"` is set in `.env.local` or exported.
2. **Chrome Flags**: Always use `--headless --no-sandbox --disable-gpu` to avoid connection issues. These are codified in `scripts/lighthouserc.cjs`.
3. **Localhost/127.0.0.1**: Always use `http://127.0.0.1:4173/` (instead of `localhost`) for both `vite preview` and the Lighthouse URL to avoid potential hostname mismatch interstitials.

**Example Command**:

```bash
bun run preview -- --host 127.0.0.1 & \
sleep 5 && \
lhci autorun --config=scripts/lighthouserc.cjs
```

---

## 1. Learning Protocol

To ensure you learn from your actions and avoid repeating mistakes, you must adhere to the following protocol:

- **Learning Log**: Maintain `LEARNINGS.gemini.md` in the root directory.
- **Record Cycles**: This file serves as an immutable, timestamped log. For each task, append a summary of the PRAR cycle. **Crucially, content must NEVER be removed from this file; all new entries must be appended.**

## 2. JSDoc Guidelines

When writing, maintaining, or modifying JavaScript/TypeScript code, you MUST ensure all functions, classes, and complex variables are properly documented or updated using JSDoc. This process must conform to the **agentic-jsdoc** skill.

- **Mandatory Updates**: Always update or add JSDoc when modifying existing code or adding new functionality.
- **Conformity**: Use the **agentic-jsdoc** skill for automated generation and to ensure documentation is optimized for LLM parsing.
- **All public APIs**: Every function, class, or method that is part of a public interface should have JSDoc.
- **Parameters and Returns**: Always document `@param` for each parameter and `@returns` for the return value (if any).
- **Types**: Use TypeScript types in JSDoc where applicable.

---

## 3. Tool-specific Protocols

- **Beads**: Beads SHOULD ONLY be used in conjunction with Conductor. Do not use Beads for independent task management unless a Conductor track or track-level plan is active.
