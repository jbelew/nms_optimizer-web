// src/store/app/errorStore.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

/**
 * Represents a single notification or error message displayed to the user.
 */
export interface ErrorMessage {
	/** Whether the user is allowed to manually dismiss this message. */
	dismissible: boolean;
	/** Unique identifier for the message. */
	id: string;
	/** The human-readable message string. */
	message: string;
	/** Unix timestamp when the message was generated. */
	timestamp: number;
	/** The severity level of the message. */
	type: "error" | "info" | "warning";
}

/**
 * State and actions for managing global error notifications.
 */
export interface ErrorState {
	/**
	 * Adds a new error message to the global queue.
	 *
	 * @param {string} message - The message text to display. **Must not be empty.**
	 * @param {ErrorMessage["type"]} [type="error"] - The severity level of the notification.
	 *
	 * @returns {string} The unique ID assigned to the new error message.
	 */
	addError: (message: string, type?: ErrorMessage["type"]) => string;
	/**
	 * Clears all active error messages from the store.
	 */
	clearErrors: () => void;
	/** An array of active error messages. */
	errors: ErrorMessage[];
	/**
	 * Removes a specific error message from the queue by its ID.
	 *
	 * @param {string} id - The unique identifier of the error to remove.
	 */
	removeError: (id: string) => void;
}

/**
 * Zustand store for orchestrating user-facing notifications and error reporting.
 *
 * This store provides a centralized mechanism for various parts of the application
 * (like the `useErrorDispatcher` hook or API catch blocks) to report issues to the UI.
 *
 * @returns {ErrorState} The error store state and actions.
 *
 * @example
 * const addError = useErrorStore((s) => s.addError);
 * addError("Failed to save build", "warning");
 */
export const useErrorStore = create<ErrorState>()(
	immer((set) => ({
		addError: (message: string, type: ErrorMessage["type"] = "error") => {
			const id = `${Date.now()}-${Math.random()}`;
			set((state) => {
				state.errors.push({
					dismissible: true,
					id,
					message,
					timestamp: Date.now(),
					type,
				});
			});

			return id;
		},
		clearErrors: () => {
			set((state) => {
				state.errors = [];
			});
		},
		errors: [],
		removeError: (id: string) => {
			set((state) => {
				state.errors = state.errors.filter((error) => error.id !== id);
			});
		},
	}))
);

if (typeof window !== "undefined" && import.meta.env.VITE_E2E_TESTING) {
	const w = window as typeof window & {
		useErrorStore?: typeof useErrorStore;
	};

	w["useErrorStore"] = useErrorStore;
}
