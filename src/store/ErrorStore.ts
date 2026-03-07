// src/store/ErrorStore.ts
import { create } from "zustand";

/**
 * Represents a single error message to be displayed to the user.
 * @typedef {object} ErrorMessage
 * @property {string} id - Unique identifier for the error message.
 * @property {string} message - The human-readable message to display.
 * @property {"warning" | "error" | "info"} type - The severity/type of the message.
 * @property {boolean} dismissible - Whether the user can manually dismiss the message.
 * @property {number} timestamp - Unix timestamp when the error was created.
 */
export interface ErrorMessage {
	id: string;
	message: string;
	type: "warning" | "error" | "info";
	dismissible: boolean;
	timestamp: number;
}

/**
 * State and actions for the error store.
 * @typedef {object} ErrorState
 * @property {ErrorMessage[]} errors - Active error messages currently being displayed.
 * @property {(message: string, type?: ErrorMessage["type"]) => string} addError - Adds a new error message to the store. Returns the new message ID.
 * @property {(id: string) => void} removeError - Removes an error message by its ID.
 * @property {() => void} clearErrors - Clears all error messages from the store.
 */
export interface ErrorState {
	errors: ErrorMessage[];
	addError: (message: string, type?: ErrorMessage["type"]) => string;
	removeError: (id: string) => void;
	clearErrors: () => void;
}

/**
 * Zustand store for managing error/notification messages.
 * Provides a centralized way to queue and display user-facing error messages.
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
