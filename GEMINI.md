# Gemini Agent: Core Directives & Protocols

This document captures project-specific protocols and configurations for AI agents.

## JSDoc Guidelines

- Ensure all public APIs, functions, classes, and complex variables are documented with JSDoc conforming to the **agentic-jsdoc** skill.
- Always include `@param` tags for parameters and `@returns` for return values, using TypeScript types where applicable.

## Tool Protocols

- **Beads**: Only use Beads in conjunction with Conductor. Do not use Beads for independent tasks unless a Conductor track or plan is active.
