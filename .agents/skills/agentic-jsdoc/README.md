# Agentic JSDoc: Enhanced JSDoc Patterns for LLM Workflows

An Agent Skill providing a set of JSDoc patterns designed to improve Large Language Model (LLM) comprehension for code generation, documentation, and RAG (Retrieval-Augmented Generation) retrieval.

When an LLM agent creates or reads code without a clear convention, it often misses critical architecture links and struggles with React edge cases. This skill guides the agent to document React context hooks, Zustand stores, Suspense boundaries, and explicit routing.

## The Patterns ([SKILL.md](./SKILL.md))

The core of this project is [SKILL.md](./SKILL.md). It provides a set of patterns for your AI agent to follow:
- **Priority Tags**: Recommended usage of `@param`, `@returns`, `@throws`, `@category`, `@example`, and `{@link path/to/file Label}` for RAG clarity.
- **Hierarchical Structure**: A deterministic block order (Summary → `@remarks` → Tags → Example) to improve LLM parsing and TypeDoc compatibility.
- **Architecture Primitives**: Specialized JSDoc patterns for React Components, Custom Hooks, Zustand Stores, and Zod Schemas.
- **Review Criteria**: A built-in guide for agents to audit and refactor existing documentation.

Your agent will automatically ingest `SKILL.md` when installed as a skill, providing persistent grounding for all documentation tasks.

## Installation

Install this skill automatically into your project using the `skills` CLI:

```bash
npx skills add jbelew/agentic-jsdoc
```

Alternatively, you can add it to your local environment manually by cloning it into your skills directory:

```bash
mkdir -p .agents/skills
git clone https://github.com/jbelew/agentic-jsdoc.git .agents/skills/agentic-jsdoc
```

## Linting Enforcement

To help your team naturally adhere to these patterns before an LLM even touches the codebase, you can use these `eslint-plugin-jsdoc` rules.

Add this to your ESLint configuration (`eslint.config.js`):

```javascript
import jsdoc from "eslint-plugin-jsdoc";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,ts,tsx}"],
    plugins: { jsdoc },
    settings: {
      jsdoc: {
        mode: "typescript",
      },
    },
    rules: {
      // Force JSDoc on functions, classes, and crucially: React components/hooks (VariableDeclarations)
      "jsdoc/require-jsdoc": ["warn", {
        require: { FunctionDeclaration: true, MethodDefinition: true, ClassDeclaration: true },
        contexts: ["TSInterfaceDeclaration", "TSTypeAliasDeclaration", "ExportNamedDeclaration > VariableDeclaration", "Program > VariableDeclaration"],
      }],
      "jsdoc/require-param-description": "warn",
      "jsdoc/require-returns-description": "warn",
      "jsdoc/require-example": "warn",
      "jsdoc/require-description": "warn",
      "jsdoc/check-tag-names": ["warn", {
        "definedTags": ["hook", "component", "remarks", "performance", "accessibility", "security"]
      }],
      // Enforce {@link} instead of Markdown links for cross-references
      "jsdoc/no-undefined-types": ["warn", { "definedTypes": ["JSX"] }],
    },
  },
]);
```

## Strict TypeDoc Generation

Because these patterns encourage rich metadata tags and explicit linking, the codebase becomes fully compatible with automatic wiki generators natively. You can drop in `typedoc` and it will read these structured comments flawlessly!

```bash
npm install -D typedoc
npx typedoc --entryPointStrategy expand --entryPoints src/ --exclude "**/*.test.*" --exclude "**/*.stories.*" --out docs/api --tsconfig tsconfig.json
```

## Examples Directory

This skill ships with an `examples/` directory that provides exact 1-to-1 examples of how architecture elements should be fully documented for maximum agent comprehension. The agent can use these files as grounding truth.

## Testing the Skill

The `tests/` directory contains a fixture for smoke-testing the skill after changes.

### Test 1: `@see` conventions and structure (review mode)

1. Load the skill: `Load agentic-jsdoc`
2. Ask: `Review the JSDoc in tests/test_fixture.tsx`
3. Compare against `tests/test_fixture.expects.md`

Covers `@see` consistency, proper use of `{@link}` vs Markdown links, `@typedef` redundancy, missing `@param`/`@returns` types, and the new `@remarks`, `@hook`, and `@component` requirements. Expects 8 violations flagged and 3 correct usages left alone.

### Test 2: Tag-specific rules (review mode)

1. Load the skill: `Load agentic-jsdoc`
2. Ask: `Review the JSDoc in tests/test_fixture_tags.tsx`
3. Compare against `tests/test_fixture_tags.expects.md`

Covers `@deprecated` without migration path, missing `@throws`, `{any}`/`{*}` types, void hooks without `@returns {void}`, and missing `@remarks` or `@hook` tags. Expects 5 violations flagged.

### Test 3: Writing JSDoc from scratch (write mode)

1. Load the skill: `Load agentic-jsdoc`
2. Ask: `Write JSDoc for every export in tests/test_fixture_write.tsx`
3. Compare against the checklist in `tests/test_fixture_write.expects.md`

Covers a bare file with no JSDoc across a component, context hook, Zod schema, utility function, and side-effect hook. Verifies the agent produces correct hierarchical structure, proper `@see` link styles, and complete tag coverage.
