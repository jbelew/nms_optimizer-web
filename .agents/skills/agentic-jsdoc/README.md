# Agentic JSDoc: Enhanced JSDoc Patterns for LLM Workflows

An Agent Skill providing a set of JSDoc patterns designed to improve Large Language Model (LLM) comprehension for code generation, documentation, and RAG (Retrieval-Augmented Generation) retrieval.

When an LLM agent creates or reads code without a clear convention, it often misses critical architecture links and struggles with React edge cases. This skill guides the agent to document React context hooks, Zustand stores, Suspense boundaries, and explicit routing.

## The Patterns ([SKILL.md](./SKILL.md))

The core of this project is [SKILL.md](./SKILL.md). It provides a set of patterns for your AI agent to follow:
- **Priority Tags**: Recommended usage of `@remarks`, `@param`, `@returns`, `@throws`, `@category`, `@example`, and `{@link SymbolName}` for RAG clarity.
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

To help your team naturally adhere to these patterns before an LLM even touches the codebase, you can use these recommended `eslint-plugin-jsdoc` rules.

> [!IMPORTANT]
> **Anti-Artifact Fix:** Always disable the JSDoc fixer by setting `enableFixer: false` on `jsdoc/require-jsdoc` and `jsdoc/require-example`. If enabled, ESLint will insert empty `/** */` blocks or empty `@example` tags during `--fix` runs, which creates noise for LLMs and consumes unnecessary tokens. You want the linter to warn you about missing docs so you (or your agent) can write meaningful ones.

Add this to your ESLint configuration (`eslint.config.js`):

```javascript
import jsdoc from "eslint-plugin-jsdoc";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: { jsdoc },
    settings: {
      jsdoc: {
        mode: "typescript",
      },
    },
    rules: {
      // Force JSDoc on exported/public functions, classes, interfaces, types, and variable declarations
      "jsdoc/require-jsdoc": ["warn", {
        enableFixer: false, // Prevent empty JSDoc artifacts
        publicOnly: true,
        require: {
          ArrowFunctionExpression: true,
          ClassDeclaration: true,
          FunctionDeclaration: true,
          MethodDefinition: true,
        },
        contexts: [
          "TSInterfaceDeclaration",
          "TSTypeAliasDeclaration",
          "ExportNamedDeclaration[declaration.type='VariableDeclaration']",
        ],
      }],
      "jsdoc/require-param-description": "warn",
      "jsdoc/require-returns-description": "warn",
      "jsdoc/require-example": ["warn", {
        enableFixer: false, // Prevent empty @example artifacts
        contexts: [
          "ExportNamedDeclaration > FunctionDeclaration",
          "ExportDefaultDeclaration > FunctionDeclaration",
          "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression",
          "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > FunctionExpression",
        ],
      }],
      "jsdoc/require-description": "warn",
      "jsdoc/check-tag-names": ["warn", {
        definedTags: ["hook", "component", "remarks", "performance", "accessibility", "security", "category"],
      }],
      "jsdoc/sort-tags": ["warn", {
        tagSequence: [
          { tags: ["remarks"] },
          { tags: ["typedef"] },
          { tags: ["template"] },
          { tags: ["param"] },
          { tags: ["returns"] },
          { tags: ["throws"] },
          { tags: ["deprecated"] },
          { tags: ["default"] },
          { tags: ["see"] },
          { tags: ["hook", "component"] },
          { tags: ["category"] },
          { tags: ["example"] },
        ],
      }],
    },
  },
  {
    // In TypeScript, rely on the AST for types and forbid redundant {type} annotations on @param/@returns
    files: ["**/*.{ts,tsx}"],
    plugins: { jsdoc },
    rules: {
      "jsdoc/no-types": "warn",
      // Mark `import type { Symbol }` references used in `{@link Symbol}` as used for no-unused-vars
      "jsdoc/no-undefined-types": ["warn", {
        disableReporting: true,
        markVariablesAsUsed: true,
      }],
    },
  },
  {
    // In plain JavaScript, require explicit TypeScript-flavor {type} annotations
    files: ["**/*.{js,jsx}"],
    plugins: { jsdoc },
    rules: {
      "jsdoc/require-param-type": "warn",
      "jsdoc/require-returns-type": "warn",
      "jsdoc/no-undefined-types": "warn",
    },
  },
]);
```

### Tag Philosophy: Why this order?

The hierarchical order in `jsdoc/sort-tags` is designed for **Agentic Retrieval**:

*   **`@remarks` First**: Putting the "Why" before the "How" (params) helps agents understand architectural intent before getting bogged down in implementation details.
*   **`@example` Last**: Keeping the example at the bottom provides a "clean exit" for RAG (Retrieval-Augmented Generation) systems, ensuring the code snippet is captured in its entirety without being interleaved with metadata.
*   **Context Selectors**: Standard JSDoc linting often misses React components, hooks, or Zustand stores defined on `export const`. The `ExportNamedDeclaration[declaration.type='VariableDeclaration']` selector ensures these critical primitives are always documented while checking the `ExportNamedDeclaration` node where the JSDoc comment is attached.

## Lessons from the Field

This project follows an "eat your own dog food" philosophy. During a large-scale migration of the [NMS Technology Optimizer](https://github.com/jbelew/nms_optimizer-web), we discovered that automated `--fix` runs were generating hundreds of empty JSDoc blocks and `@example` tags. This led to the `enableFixer: false` requirement on both `jsdoc/require-jsdoc` and `jsdoc/require-example`, which is now a foundational recommendation of this skill.

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

Covers `@see` consistency, proper use of `{@link}` vs Markdown links, `@typedef` redundancy, boilerplate component `@param`/`@returns` tags, and `@remarks`, `@hook`, and `@component` requirements. Expects 8 violations flagged and 3 correct usages left alone.

### Test 2: Tag-specific rules (review mode)

1. Load the skill: `Load agentic-jsdoc`
2. Ask: `Review the JSDoc in tests/test_fixture_tags.tsx`
3. Compare against `tests/test_fixture_tags.expects.md`

Covers `@deprecated` without migration path, missing `@throws`, redundant/vague `{any}`/`{*}` types, void hooks without `@returns Side-effects only.`, and missing `@remarks` or `@hook` tags. Expects 5 violations flagged.

### Test 3: Writing JSDoc from scratch (write mode)

1. Load the skill: `Load agentic-jsdoc`
2. Ask: `Write JSDoc for every export in tests/test_fixture_write.tsx`
3. Compare against the checklist in `tests/test_fixture_write.expects.md`

Covers a bare file with no JSDoc across a component, context hook, Zod schema, utility function, and side-effect hook. Verifies the agent produces correct hierarchical structure, proper `@see` link styles, and complete tag coverage.
