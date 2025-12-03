# Accessibility (a11y) Testing via CLI

## Running a11y Tests

Run accessibility tests with:

```bash
npm run test:storybook:a11y
```

This runs all Storybook stories through accessibility checks using the `@storybook/addon-a11y` with axe-core.

## How It Works

1. **Storybook a11y Addon** (`@storybook/addon-a11y`): Automatically runs accessibility checks using axe-core on each story
2. **Vitest Integration** (`@storybook/addon-vitest`): Creates test cases from stories
3. **Test Configuration** (`.storybook/preview.ts`): Set `a11y.test: "error"` to fail tests on violations

## Configuration

The a11y configuration is in `.storybook/preview.ts`:

```typescript
a11y: {
  test: "error", // fail on a11y violations
}
```

Options:
- `"error"` - Fail tests on violations (what we use for CLI)
- `"warn"` - Log warnings only
- `"todo"` - Show violations in UI only
- `"off"` - Skip a11y checks

## Current a11y Violations

Run `npm run test:storybook:a11y` to see the latest violations.

Common issues:
- **empty-heading**: `<h1>` or heading tags with no visible text
- **button-name**: Buttons without discernible text or labels
- **color-contrast**: Insufficient contrast between text and background

## Fixing Violations

For each failing story, the output shows:
1. The element causing the violation
2. The rule that failed (e.g., `button-name`, `empty-heading`)
3. A link to the Deque University documentation

Example fix for a disabled button without text:
```tsx
<button 
  disabled 
  aria-label="Select module" // Add aria-label
>
</button>
```

## Watch Mode

To watch for changes:

```bash
npm run test:storybook:watch
```

This runs the regular story tests. Combine with `--reporter=verbose` for detailed output.
