import { beforeEach, describe, expect, it } from "vitest";

import { useOptimizeStore } from "./optimizeStore";

describe("OptimizeStore", () => {
	beforeEach(() => {
		// Reset the store state before each test
		useOptimizeStore.setState({
			status: { type: "idle" },
		});
	});

	describe("Initial state", () => {
		it("should have status type set to 'idle' by default", () => {
			const store = useOptimizeStore.getState();
			expect(store.status.type).toBe("idle");
		});
	});

	describe("Actions", () => {
		it("should set solving status", () => {
			const { setSolving } = useOptimizeStore.getState();
			setSolving(true);
			const state = useOptimizeStore.getState();
			expect(state.status).toEqual({ progress: 0, type: "solving" });
		});

		it("should set progressPercent when in solving status", () => {
			const { setProgressPercent, setSolving } = useOptimizeStore.getState();
			setSolving(true);
			setProgressPercent(50);
			const state = useOptimizeStore.getState();
			expect(state.status).toEqual({ progress: 50, type: "solving" });
		});

		it("should not set progressPercent when not in solving status", () => {
			const { setProgressPercent } = useOptimizeStore.getState();
			setProgressPercent(50);
			const state = useOptimizeStore.getState();
			expect(state.status.type).toBe("idle");
		});

		it("should set error status", () => {
			const { setShowError } = useOptimizeStore.getState();
			const testError = new Error("Test error");
			setShowError(true, "fatal", testError);
			const state = useOptimizeStore.getState();
			expect(state.status).toEqual({
				details: testError,
				severity: "fatal",
				type: "error",
			});
		});

		it("should set warning status", () => {
			const { setPatternNoFitTech } = useOptimizeStore.getState();
			setPatternNoFitTech("test-tech");
			const state = useOptimizeStore.getState();
			expect(state.status).toEqual({ tech: "test-tech", type: "warning" });
		});

		it("should return to idle when clearing status", () => {
			const { setPatternNoFitTech, setShowError, setSolving } = useOptimizeStore.getState();

			setSolving(true);
			setSolving(false);
			expect(useOptimizeStore.getState().status.type).toBe("idle");

			setShowError(true);
			setShowError(false);
			expect(useOptimizeStore.getState().status.type).toBe("idle");

			setPatternNoFitTech("tech");
			setPatternNoFitTech(null);
			expect(useOptimizeStore.getState().status.type).toBe("idle");
		});
	});

	describe("Transitions", () => {
		it("should transition from solving to error", () => {
			const { setShowError, setSolving } = useOptimizeStore.getState();
			setSolving(true);
			setShowError(true, "recoverable");
			expect(useOptimizeStore.getState().status.type).toBe("error");
		});

		it("should transition from error to solving", () => {
			const { setShowError, setSolving } = useOptimizeStore.getState();
			setShowError(true);
			setSolving(true);
			expect(useOptimizeStore.getState().status.type).toBe("solving");
		});
	});
});
