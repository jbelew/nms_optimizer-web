/**
 * @file Type augmentation for `@testing-library/jest-dom` with Vitest 5+.
 *
 * Vitest 5 introduced a two-parameter generic interface for `Assertion<R, T>`
 * where `R` is the matcher return type (e.g. `void` or `Promise<void>`) and `T`
 * is the actual value type being asserted. `@testing-library/jest-dom` (<= 7.0.1)
 * only provides module declarations for single-parameter `Assertion<T>`, which causes
 * TypeScript type-checking errors when calling DOM matchers like `toBeInTheDocument()`.
 */

import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare module "vitest" {
	interface Assertion<R = void, T = unknown> extends TestingLibraryMatchers<
		ReturnType<typeof import("vitest").expect.stringContaining>,
		R
	> {}

	interface AsymmetricMatchersContaining extends TestingLibraryMatchers<
		ReturnType<typeof import("vitest").expect.stringContaining>,
		void
	> {}
}
