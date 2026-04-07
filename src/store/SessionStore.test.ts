import { beforeEach, describe, expect, it } from "vitest";

import { useSessionStore } from "./SessionStore";

describe("SessionStore", () => {
	beforeEach(() => {
		useSessionStore.getState().resetSession();
	});

	it("should initialize with all counters at zero", () => {
		const state = useSessionStore.getState();
		expect(state.supercharged_limit).toBe(0);
		expect(state.supercharged_fixed).toBe(0);
		expect(state.grid_fixed).toBe(0);
		expect(state.module_locked).toBe(0);
		expect(state.row_limit).toBe(0);
	});

	it("should increment supercharged_limit", () => {
		useSessionStore.getState().incrementSuperchargedLimit();
		expect(useSessionStore.getState().supercharged_limit).toBe(1);
		useSessionStore.getState().incrementSuperchargedLimit();
		expect(useSessionStore.getState().supercharged_limit).toBe(2);
	});

	it("should increment supercharged_fixed", () => {
		useSessionStore.getState().incrementSuperchargedFixed();
		expect(useSessionStore.getState().supercharged_fixed).toBe(1);
	});

	it("should increment grid_fixed", () => {
		useSessionStore.getState().incrementGridFixed();
		expect(useSessionStore.getState().grid_fixed).toBe(1);
	});

	it("should increment module_locked", () => {
		useSessionStore.getState().incrementModuleLocked();
		expect(useSessionStore.getState().module_locked).toBe(1);
	});

	it("should increment row_limit", () => {
		useSessionStore.getState().incrementRowLimit();
		expect(useSessionStore.getState().row_limit).toBe(1);
	});

	it("should reset all counters", () => {
		const store = useSessionStore.getState();
		store.incrementSuperchargedLimit();
		store.incrementGridFixed();
		expect(useSessionStore.getState().supercharged_limit).toBe(1);
		expect(useSessionStore.getState().grid_fixed).toBe(1);

		useSessionStore.getState().resetSession();
		const newState = useSessionStore.getState();
		expect(newState.supercharged_limit).toBe(0);
		expect(newState.grid_fixed).toBe(0);
	});
});
