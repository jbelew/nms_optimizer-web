# Architecture Primitives: React & State Management

## React Components ([`examples/good_react_component.tsx`](../examples/good_react_component.tsx))

1. **Props interface:** Add a summary JSDoc block on the `Props` interface and an inline `/** */` description on every property.
2. **Component block:** Include Summary, `@remarks`, `@see {@link PropsInterface}`, `@component`, and `@category Components`. Omit boilerplate `@param props` and `@returns {JSX.Element}` lines—the `Props` interface and component signature already express them.
3. **Tests & stories:** When sibling `.test.*` or `.stories.*` files exist, link them with file links (`@see {@link ./MyComponent.test.tsx Tests}`, `@see {@link ./MyComponent.stories.tsx Stories}`).
4. **Suspense & errors:** Document defensive throws or `<Suspense>` boundaries in `@remarks` or `@throws`.
5. **Example:** Render the component in `@example` and end with `// mounts ComponentName`.

## React Router Components ([`examples/good_route_component.tsx`](../examples/good_route_component.tsx))

For top-level route/page components that read URL parameters via `useParams()` or `useSearchParams()` (which do not appear in `Props`), document each route parameter with `[URL/paramName]` notation:
- `@param [URL/projectId] - The active project ID extracted via \`useParams()\`.`

## Validation Schemas: Zod & Yup ([`examples/good_zod_schema.ts`](../examples/good_zod_schema.ts))

Pair runtime schemas and compile-time types with bidirectional symbol links (and inline `/** */` descriptions on each schema field):
- On the schema (`CreateUserSchema`): `@see {@link CreateUserPayload}`
- On the inferred or standalone type (`CreateUserPayload`): `@see {@link CreateUserSchema}`

## Data Fetching: React Query & SWR ([`examples/good_api_fetcher.ts`](../examples/good_api_fetcher.ts))

On query/mutation hooks (e.g., `useUserQuery`), document the cache invalidation keys managed by the hook as a bullet point inside `@remarks`.

## Zustand Stores ([`examples/good_zustand_store.ts`](../examples/good_zustand_store.ts))

1. Document the `State` interface with a summary block and inline `/** */` comments on every state property and action.
2. On the `useStore` hook, include `@remarks`, `@returns Description`, `@see {@link StateInterface}`, `@hook`, `@category Hooks`, and `@example` (omit verbose `import("zustand").UseBoundStore<...>` type annotations).

## React Context & Hooks ([`examples/good_react_context.tsx`](../examples/good_react_context.tsx))

1. Document the context value interface (`Summary` + inline `/** */` per property).
2. Document the `createContext` declaration with a summary and `@default` showing the initial value.
3. On the consumer hook (`useMyContext`), include `@remarks` (provider requirement), `@returns Description`, `@see {@link MyContext}`, `@hook`, `@category Hooks`, and `@example`.

