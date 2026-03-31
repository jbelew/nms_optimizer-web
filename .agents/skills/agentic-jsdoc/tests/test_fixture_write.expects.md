# test_fixture_write.tsx — Expected Write Findings

Load `agentic-jsdoc`, then ask: **"Write JSDoc for every export in this file."**

## What to verify in the output

### AlertBannerProps interface
- [ ] Has a JSDoc summary line
- [ ] Each property has an inline `/** */` description

### AlertBanner component
- [ ] Summary line describing what it renders
- [ ] `@remarks` block for detailed rationale
- [ ] `@param {AlertBannerProps} props - ...` with description
- [ ] `@returns {JSX.Element}`
- [ ] `@see {@link AlertBannerProps}` — code symbol, uses `{@link}`
- [ ] `@see {@link ./AlertBanner.test.tsx Tests}` — file reference, uses `{@link}`
- [ ] `@component` tag present
- [ ] `@category Components`
- [ ] `@example` with output comment

### NotificationContextValue interface
- [ ] Has a JSDoc summary line
- [ ] Each property has an inline `/** */` description

### NotificationContext
- [ ] Has a JSDoc summary line
- [ ] `@default` documents the default value

### useNotifications hook
- [ ] Summary line
- [ ] `@remarks` block for usage constraints
- [ ] `@returns {NotificationContextValue}` with description
- [ ] `@see {@link NotificationContext}` — code symbol, uses `{@link}`
- [ ] `@hook` tag present
- [ ] `@category Hooks`
- [ ] `@example` with output comment

### alertPayloadSchema
- [ ] Summary line
- [ ] `@see {@link AlertPayload}` — code symbol, uses `{@link}`
- [ ] No redundant `@typedef` (TypeScript type already exists)

### AlertPayload type
- [ ] Summary line
- [ ] `@see {@link alertPayloadSchema}` — code symbol, uses `{@link}`

### truncateMessage utility
- [ ] Summary line
- [ ] `@remarks` block for implementation details
- [ ] `@param {string} message - ...` with description
- [ ] `@param {number} maxLength - ...` with description
- [ ] `@returns {string}` with description
- [ ] `@category Utilities`
- [ ] `@example` with output comment (e.g., `// returns "Hello…"`)

### useDocumentTitle hook
- [ ] Summary line
- [ ] `@remarks` block for side-effect explanation
- [ ] `@param {string} title - ...` with description
- [ ] `@returns {void} Side-effects only.`
- [ ] `@hook` tag present
- [ ] `@category Hooks`
- [ ] `@example` with output comment
