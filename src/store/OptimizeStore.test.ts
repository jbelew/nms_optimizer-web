import { beforeEach, describe, expect, it } from "vitest";

import { useOptimizeStore } from "./OptimizeStore";

describe("OptimizeStore", () => {
	beforeEach(() => {
		// Reset the store state before each test
		useOptimizeStore.setState({
			showError: false,
			patternNoFitTech: null,
		});
	});

	describe("Initial state", () => {
		it("should have showError set to false by default", () => {
			const store = useOptimizeStore.getState();
			expect(store.showError).toBe(false);
		});

		it("should have patternNoFitTech set to null by default", () => {
			const store = useOptimizeStore.getState();
			expect(store.patternNoFitTech).toBeNull();
		});

		it("should have setShowError function", () => {
			const store = useOptimizeStore.getState();
			expect(typeof store.setShowError).toBe("function");
		});

		it("should have setPatternNoFitTech function", () => {
			const store = useOptimizeStore.getState();
			expect(typeof store.setPatternNoFitTech).toBe("function");
		});
	});

	describe("setShowError", () => {
		it("should set showError to true", () => {
			const { setShowError } = useOptimizeStore.getState();
			setShowError(true);

			const state = useOptimizeStore.getState();
			expect(state.showError).toBe(true);
		});

		it("should set showError to false", () => {
			useOptimizeStore.setState({ showError: true });

			const { setShowError } = useOptimizeStore.getState();
			setShowError(false);

			const state = useOptimizeStore.getState();
			expect(state.showError).toBe(false);
		});

		it("should update state immediately", () => {
			const { setShowError } = useOptimizeStore.getState();

			setShowError(true);
			expect(useOptimizeStore.getState().showError).toBe(true);

			setShowError(false);
			expect(useOptimizeStore.getState().showError).toBe(false);
		});

		it("should handle multiple consecutive calls", () => {
			const { setShowError } = useOptimizeStore.getState();

			setShowError(true);
			expect(useOptimizeStore.getState().showError).toBe(true);

			setShowError(true);
			expect(useOptimizeStore.getState().showError).toBe(true);

			setShowError(false);
			expect(useOptimizeStore.getState().showError).toBe(false);
		});

		it("should not affect patternNoFitTech", () => {
			useOptimizeStore.setState({ patternNoFitTech: "test-tech" });

			const { setShowError } = useOptimizeStore.getState();
			setShowError(true);

			expect(useOptimizeStore.getState().patternNoFitTech).toBe("test-tech");
		});
	});

	describe("setPatternNoFitTech", () => {
		it("should set patternNoFitTech to a string value", () => {
			const { setPatternNoFitTech } = useOptimizeStore.getState();
			setPatternNoFitTech("armor-plating");

			const state = useOptimizeStore.getState();
			expect(state.patternNoFitTech).toBe("armor-plating");
		});

		it("should set patternNoFitTech to null", () => {
			useOptimizeStore.setState({ patternNoFitTech: "some-tech" });

			const { setPatternNoFitTech } = useOptimizeStore.getState();
			setPatternNoFitTech(null);

			const state = useOptimizeStore.getState();
			expect(state.patternNoFitTech).toBeNull();
		});

		it("should update state immediately", () => {
			const { setPatternNoFitTech } = useOptimizeStore.getState();

			setPatternNoFitTech("tech1");
			expect(useOptimizeStore.getState().patternNoFitTech).toBe("tech1");

			setPatternNoFitTech("tech2");
			expect(useOptimizeStore.getState().patternNoFitTech).toBe("tech2");

			setPatternNoFitTech(null);
			expect(useOptimizeStore.getState().patternNoFitTech).toBeNull();
		});

		it("should handle different tech values", () => {
			const { setPatternNoFitTech } = useOptimizeStore.getState();

			const techs = ["armor-plating", "hyperdrive", "warp-core", "shield"];

			for (const tech of techs) {
				setPatternNoFitTech(tech);
				expect(useOptimizeStore.getState().patternNoFitTech).toBe(tech);
			}
		});

		it("should not affect showError", () => {
			useOptimizeStore.setState({ showError: true });

			const { setPatternNoFitTech } = useOptimizeStore.getState();
			setPatternNoFitTech("test-tech");

			expect(useOptimizeStore.getState().showError).toBe(true);
		});
	});

	describe("State management", () => {
		it("should allow independent updates to both properties", () => {
			const { setShowError, setPatternNoFitTech } = useOptimizeStore.getState();

			setShowError(true);
			expect(useOptimizeStore.getState().showError).toBe(true);
			expect(useOptimizeStore.getState().patternNoFitTech).toBeNull();

			setPatternNoFitTech("tech1");
			expect(useOptimizeStore.getState().showError).toBe(true);
			expect(useOptimizeStore.getState().patternNoFitTech).toBe("tech1");

			setShowError(false);
			expect(useOptimizeStore.getState().showError).toBe(false);
			expect(useOptimizeStore.getState().patternNoFitTech).toBe("tech1");
		});

		it("should manage complex update sequences", () => {
			const { setShowError, setPatternNoFitTech } = useOptimizeStore.getState();

			// Scenario 1: Set error
			setShowError(true);
			setPatternNoFitTech("armor-plating");

			expect(useOptimizeStore.getState()).toEqual({
				showError: true,
				patternNoFitTech: "armor-plating",
				setShowError,
				setPatternNoFitTech,
			});

			// Scenario 2: Clear error
			setShowError(false);

			expect(useOptimizeStore.getState()).toEqual({
				showError: false,
				patternNoFitTech: "armor-plating",
				setShowError,
				setPatternNoFitTech,
			});

			// Scenario 3: Clear tech
			setPatternNoFitTech(null);

			expect(useOptimizeStore.getState()).toEqual({
				showError: false,
				patternNoFitTech: null,
				setShowError,
				setPatternNoFitTech,
			});
		});
	});

	describe("State immutability", () => {
		it("should not modify previous state when updating", () => {
			const { setShowError } = useOptimizeStore.getState();
			const state1 = useOptimizeStore.getState();

			setShowError(true);
			const state2 = useOptimizeStore.getState();

			expect(state1.showError).toBe(false);
			expect(state2.showError).toBe(true);
			expect(state1).not.toBe(state2);
		});

		it("should not modify previous state when patternNoFitTech changes", () => {
			const { setPatternNoFitTech } = useOptimizeStore.getState();
			const state1 = useOptimizeStore.getState();

			setPatternNoFitTech("tech");
			const state2 = useOptimizeStore.getState();

			expect(state1.patternNoFitTech).toBeNull();
			expect(state2.patternNoFitTech).toBe("tech");
			expect(state1).not.toBe(state2);
		});
	});

	describe("Integration", () => {
		it("should work with direct setState", () => {
			useOptimizeStore.setState({
				showError: true,
				patternNoFitTech: "hyperdrive",
			});

			const state = useOptimizeStore.getState();
			expect(state.showError).toBe(true);
			expect(state.patternNoFitTech).toBe("hyperdrive");
		});

		it("should work with partial setState", () => {
			useOptimizeStore.setState({ showError: true });

			expect(useOptimizeStore.getState().showError).toBe(true);
			expect(useOptimizeStore.getState().patternNoFitTech).toBeNull();

			useOptimizeStore.setState({ patternNoFitTech: "warp-core" });

			expect(useOptimizeStore.getState().showError).toBe(true);
			expect(useOptimizeStore.getState().patternNoFitTech).toBe("warp-core");
		});
	});
});
