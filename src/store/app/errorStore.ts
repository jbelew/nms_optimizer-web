// src/store/app/errorStore.ts
import { create } from "zustand";

/**
 * Represents a single notification or error message displayed to the user.
 */
export interface ErrorMessage {
	/** Unique identifier for the message. */
	id: string;
	/** The human-readable message string. */
	message: string;
	/** The severity level of the message. */
	type: "warning" | "error" | "info";
	/** Whether the user is allowed to manually dismiss this message. */
	dismissible: boolean;
	/** Unix timestamp when the message was generated. */
	timestamp: number;
}

/**
 * State and actions for managing global error notifications.
 */
export interface ErrorState {
	/** An array of active error messages. */
	errors: ErrorMessage[];
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
	 * Removes a specific error message from the queue by its ID.
	 *
	 * @param {string} id - The unique identifier of the error to remove.
	 */
	removeError: (id: string) => void;
	/**
	 * Clears all active error messages from the store.
	 */
	clearErrors: () => void;
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
export const useErrorStore = create<ErrorState>((set) => ({
	errors: [],
	addError: (message: string, type: ErrorMessage["type"] = "error") => {
		const id = `${Date.now()}-${Math.random()}`;
		set((state) => ({
			errors: [
				...state.errors,
				{
					id,
					message,
					type,
					dismissible: true,
					timestamp: Date.now(),
				},
			],
		}));

		console.log(`Error added: ${message} (Type: ${type})`);

		return id;
	},
	removeError: (id: string) => {
		set((state) => ({
			errors: state.errors.filter((error) => error.id !== id),
		}));
	},
	clearErrors: () => {
		console.log("Clearing errors");
		set({ errors: [] });
	},
}));

if (import.meta.env.VITE_E2E_TESTING) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	window.useErrorStore = useErrorStore;
}
