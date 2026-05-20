import { describe, expect, it, vi } from "vitest";

import { lazyNamed } from "./lazyNamed";

describe("lazyNamed", () => {
	it("should return a lazy component that resolves the named export", async () => {
		const mockModule = {
			MyComponent: () => "RenderedComponent",
		};
		const importFn = vi.fn().mockResolvedValue(mockModule);

		const LazyComp = lazyNamed(importFn, "MyComponent");

		expect(LazyComp).toBeDefined();

		interface ReactLazyInternal {
			_init?: () => Promise<{ default: unknown }>;
			_payload?: {
				_ctor: () => Promise<{ default: unknown }>;
				_result: unknown;
			};
		}

		// Act: call the load function on the internal _init property if available,
		// or simulate component loading
		const lazyInternal = LazyComp as unknown as ReactLazyInternal;
		const initPromise = lazyInternal._payload?._result || lazyInternal._init;

		if (typeof initPromise === "function") {
			const res = await initPromise();
			expect(res.default).toBe(mockModule.MyComponent);
		} else {
			const payload = lazyInternal._payload;

			if (payload) {
				const result = await payload._ctor();
				expect(result.default).toBe(mockModule.MyComponent);
			}
		}
	});
});
