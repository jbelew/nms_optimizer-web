import { beforeEach, describe, expect, it } from "vitest";

import { useA11yStore } from "./A11yStore";

describe("A11yStore", () => {
	beforeEach(() => {
		// Reset the store state before each test
		useA11yStore.setState({ a11yMode: false });
		// Clear localStorage
		localStorage.clear();
	});

	describe("Initial state", () => {
		it("should have a11yMode set to false by default", () => {
			const store = useA11yStore.getState();
			expect(store.a11yMode).toBe(false);
		});

		it("should have setA11yMode function", () => {
			const store = useA11yStore.getState();
			expect(typeof store.setA11yMode).toBe("function");
		});

		it("should have toggleA11yMode function", () => {
			const store = useA11yStore.getState();
			expect(typeof store.toggleA11yMode).toBe("function");
		});
	});

	describe("setA11yMode", () => {
		it("should set a11yMode to true", () => {
			const { setA11yMode } = useA11yStore.getState();
			setA11yMode(true);

			const state = useA11yStore.getState();
			expect(state.a11yMode).toBe(true);
		});

		it("should set a11yMode to false", () => {
			useA11yStore.setState({ a11yMode: true });

			const { setA11yMode } = useA11yStore.getState();
			setA11yMode(false);

			const state = useA11yStore.getState();
			expect(state.a11yMode).toBe(false);
		});

		it("should update state immediately", () => {
			const { setA11yMode } = useA11yStore.getState();

			setA11yMode(true);
			expect(useA11yStore.getState().a11yMode).toBe(true);

			setA11yMode(false);
			expect(useA11yStore.getState().a11yMode).toBe(false);
		});

		it("should handle multiple consecutive calls", () => {
			const { setA11yMode } = useA11yStore.getState();

			setA11yMode(true);
			expect(useA11yStore.getState().a11yMode).toBe(true);

			setA11yMode(true);
			expect(useA11yStore.getState().a11yMode).toBe(true);

			setA11yMode(false);
			expect(useA11yStore.getState().a11yMode).toBe(false);
		});
	});

	describe("toggleA11yMode", () => {
		it("should toggle a11yMode from false to true", () => {
			useA11yStore.setState({ a11yMode: false });
			const { toggleA11yMode } = useA11yStore.getState();

			toggleA11yMode();

			expect(useA11yStore.getState().a11yMode).toBe(true);
		});

		it("should toggle a11yMode from true to false", () => {
			useA11yStore.setState({ a11yMode: true });
			const { toggleA11yMode } = useA11yStore.getState();

			toggleA11yMode();

			expect(useA11yStore.getState().a11yMode).toBe(false);
		});

		it("should toggle a11yMode multiple times", () => {
			const { toggleA11yMode } = useA11yStore.getState();

			expect(useA11yStore.getState().a11yMode).toBe(false);

			toggleA11yMode();
			expect(useA11yStore.getState().a11yMode).toBe(true);

			toggleA11yMode();
			expect(useA11yStore.getState().a11yMode).toBe(false);

			toggleA11yMode();
			expect(useA11yStore.getState().a11yMode).toBe(true);
		});
	});

	describe("Store persistence", () => {
		it("should persist state to localStorage with correct key", () => {
			const { setA11yMode } = useA11yStore.getState();
			setA11yMode(true);

			// The persist middleware stores the state in localStorage
			const stored = localStorage.getItem("nms-optimizer-a11y-mode");
			expect(stored).toBeTruthy();
		});

		it("should use the correct storage key", () => {
			const { setA11yMode } = useA11yStore.getState();
			setA11yMode(true);

			const stored = localStorage.getItem("nms-optimizer-a11y-mode");
			expect(stored).toContain("a11yMode");
		});
	});

	describe("State immutability", () => {
		it("should not modify previous state when updating", () => {
			const { setA11yMode } = useA11yStore.getState();
			const state1 = useA11yStore.getState();

			setA11yMode(true);
			const state2 = useA11yStore.getState();

			expect(state1.a11yMode).toBe(false);
			expect(state2.a11yMode).toBe(true);
			expect(state1).not.toBe(state2);
		});
	});

	describe("Integration", () => {
		it("should work with multiple store instances", () => {
			useA11yStore.setState({ a11yMode: false });

			const { setA11yMode: setA11yMode1 } = useA11yStore.getState();
			const { toggleA11yMode: toggleA11yMode2 } = useA11yStore.getState();

			setA11yMode1(true);
			expect(useA11yStore.getState().a11yMode).toBe(true);

			toggleA11yMode2();
			expect(useA11yStore.getState().a11yMode).toBe(false);
		});

		it("should maintain state across multiple operations", () => {
			const { setA11yMode, toggleA11yMode } = useA11yStore.getState();

			setA11yMode(true);
			expect(useA11yStore.getState().a11yMode).toBe(true);

			toggleA11yMode();
			expect(useA11yStore.getState().a11yMode).toBe(false);

			setA11yMode(true);
			expect(useA11yStore.getState().a11yMode).toBe(true);
		});
	});
});
