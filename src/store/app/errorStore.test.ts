import { beforeEach, describe, expect, it, vi } from "vitest";

import { useErrorStore } from "./errorStore";

describe("ErrorStore", () => {
	beforeEach(() => {
		// Reset the store before each test
		useErrorStore.getState().clearErrors();
		vi.clearAllMocks();
	});

	it("should initialize with an empty errors array", () => {
		expect(useErrorStore.getState().errors).toEqual([]);
	});

	it("should add an error to the store", () => {
		const message = "Test error message";
		const type = "warning";
		const id = useErrorStore.getState().addError(message, type);

		const { errors } = useErrorStore.getState();
		expect(errors).toHaveLength(1);
		expect(errors[0]).toMatchObject({
			dismissible: true,
			id,
			message,
			type,
		});
		expect(typeof errors[0].timestamp).toBe("number");
	});

	it("should default to type 'error' if not specified", () => {
		useErrorStore.getState().addError("Default error");
		const { errors } = useErrorStore.getState();
		expect(errors[0].type).toBe("error");
	});

	it("should remove an error by ID", () => {
		const id1 = useErrorStore.getState().addError("Error 1");
		const id2 = useErrorStore.getState().addError("Error 2");

		expect(useErrorStore.getState().errors).toHaveLength(2);

		useErrorStore.getState().removeError(id1);

		const { errors } = useErrorStore.getState();
		expect(errors).toHaveLength(1);
		expect(errors[0].id).toBe(id2);
	});

	it("should clear all errors", () => {
		useErrorStore.getState().addError("Error 1");
		useErrorStore.getState().addError("Error 2");

		expect(useErrorStore.getState().errors).toHaveLength(2);

		useErrorStore.getState().clearErrors();

		expect(useErrorStore.getState().errors).toHaveLength(0);
	});

	it("should generate unique IDs", () => {
		const id1 = useErrorStore.getState().addError("Error 1");
		const id2 = useErrorStore.getState().addError("Error 2");
		expect(id1).not.toBe(id2);
	});
});
