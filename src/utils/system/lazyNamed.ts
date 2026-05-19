import type { ComponentType } from "react";
import { lazy } from "react";

/**
 * A helper to dynamically import named exports with React.lazy.
 *
 * @param importFn - Function that returns a dynamic import promise.
 * @param name - The named export key to load.
 *
 * @returns A lazy-loaded React component.
 *
 * @example
 * ```typescript
 * const MyComponent = lazyNamed(() => import("./MyComponent"), "MyComponent");
 * ```
 */
export function lazyNamed<T extends Record<string, unknown>>(
	importFn: () => Promise<T>,
	name: keyof T
) {
	return lazy(() =>
		importFn().then((module) => ({ default: module[name] as ComponentType<unknown> }))
	);
}
