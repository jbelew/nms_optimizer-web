import type { ComponentType, LazyExoticComponent } from "react";
import { lazy } from "react";

/**
 * Dynamically imports a named or default React component export with `React.lazy` while guarding against nullish module resolution during **PWA Self-Healing** preload recovery.
 *
 * @remarks
 * When Vite's `__vitePreload` dispatches `vite:preloadError` and the preload recovery listener
 * calls `event.preventDefault()`, the dynamic `import()` resolves to `undefined` while cache
 * eviction and `window.location.replace(...)` are in flight. Returning a never-resolving
 * `Promise` in that state keeps `<Suspense>` on its fallback instead of throwing a `TypeError`
 * into `ErrorBoundary` and Sentry.
 *
 * @template P - The component props type.
 * @template K - The module export key to load (defaults to `"default"`).
 *
 * @param importFn - Function that returns a dynamic `import()` promise containing the target component export.
 * @param [name="default"] - The export key to load from the resolved module.
 *
 * @returns A lazy-loaded React component preserving the prop type `P`.
 *
 * @see {@link ./lazyNamed.test.ts Unit Tests}
 *
 * @category Utilities
 *
 * @example
 * ```typescript
 * const MyNamedComponent = lazyNamed(() => import("./MyComponent"), "MyComponent");
 * const MyDefaultComponent = lazyNamed(() => import("./MyDefaultComponent"));
 * // returns LazyExoticComponent<ComponentType<P>>
 * ```
 */
function lazyNamed<P>(
	importFn: () => Promise<{ default: ComponentType<P> }>,
	name?: "default",
): LazyExoticComponent<ComponentType<P>>;
function lazyNamed<P, K extends PropertyKey>(
	importFn: () => Promise<Record<K, ComponentType<P>>>,
	name: K,
): LazyExoticComponent<ComponentType<P>>;
function lazyNamed<P, K extends PropertyKey = "default">(
	importFn: () => Promise<Record<K, ComponentType<P>>>,
	name?: K,
): LazyExoticComponent<ComponentType<P>> {
	const exportKey = (name ?? "default") as K;

	return lazy(() =>
		importFn().then((module) => {
			if (
				!module
				|| typeof module !== "object"
				|| !(exportKey in module)
				|| !module[exportKey]
			) {
				return new Promise<never>(() => {});
			}

			return { default: module[exportKey] };
		}),
	);
}

export { lazyNamed };
