# Architecture Primitives: React & State Management

Detailed JSDoc patterns for React components, routing, state management, and data fetching.

## React Components

> See `examples/good_react_component.tsx` and `examples/bad_react_component.tsx` for a before/after comparison.

LLMs heavily rely on the **Props Interface** rather than the component function itself.

1. Document every property in the `interface` using JSDoc.
2. In the component JSDoc, do not re-document destructured props. Just refer to the Props interface.
3. **Tests & Stories**: Proactively search for associated test and story files (e.g. `MyComponent.test.tsx`, `MyComponent.stories.tsx`). If they exist, ALWAYS use the `{@link RelativePath Label}` syntax (e.g., `@see {@link ./MyComponent.stories.tsx Stories}`). This pulls in test coverage and visual variants automatically.
4. Include an `@example` of how to render the component.
5. **Suspense & Errors**: If the component throws errors defensively or suspends, note this explicitly in the `@remarks` or using `@throws`.

## React Router (Route Components)

> See `examples/good_route_component.tsx` for a complete example.

When a component is a top-level route/page, document the expected URL parameters natively fetched via `useParams()` or `useSearchParams()`. Since they won't appear in the `Props` interface, list them out in the `@remarks` or using `@param` with `[URL]` notation (e.g., `@param {string} [URL/projectId] - The active project ID mapped by the router`).

## Validation Schemas (Zod/Yup)

> See `examples/good_zod_schema.ts` for a complete example.

Whenever documenting a TypeScript type paired with a Zod schema or Yup runtime validation (whether a standalone `interface` or an inferred type via `z.infer`), you MUST include `@see {@link MySchema}` on the type and `@see {@link MyType}` on the schema to keep LLMs aligned between compile-time and runtime validation.

## Data Fetching (React Query / SWR)

> See `examples/good_api_fetcher.ts` and `examples/bad_api_fetcher.ts` for a before/after comparison.

When creating abstract fetching hooks (e.g. `useUserQuery`), strictly define the cache invalidation keys or unique identifiers managed by the hook in a dedicated bullet point inside the `@remarks` so LLMs know exactly what tokens invalidate the data natively.

## Zustand Stores

> See `examples/good_zustand_store.ts` for a complete example.

When documenting a generated `useStore` hook from Zustand, ensure the `@returns` explicitly reflects the hook nature (e.g., `@returns {import("zustand").UseBoundStore...}`) and must strictly `@see {@link StateInterface}` the State interface above it.

## React Context Hooks

> See `examples/good_react_context.tsx` for a complete example.

When exporting a custom hook like `useMyContext`, strictly `@see {@link MyContext}` and include the `@hook` tag so RAG engines can map the usage correctly.
