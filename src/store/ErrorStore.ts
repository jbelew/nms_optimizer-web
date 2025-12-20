// src/store/ErrorStore.ts
import { create } from "zustand";

/**
 * Represents a single error message to be displayed to the user
 */
export interface ErrorMessage {
	id: string;
	message: string;
	type: "warning" | "error" | "info";
	dismissible: boolean;
	timestamp: number;
}

/**
 * @interface ErrorState
 * @property {ErrorMessage[]} errors - Array of active error messages
 * @property {(message: string, type: ErrorMessage['type']) => void} addError - Add an error message
 * @property {(id: string) => void} removeError - Remove an error message by ID
 * @property {() => void} clearErrors - Clear all error messages
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

		return id;
	},
	removeError: (id: string) => {
		set((state) => ({
			errors: state.errors.filter((error) => error.id !== id),
		}));
	},
	clearErrors: () => {
		set({ errors: [] });
	},
}));

if (import.meta.env.VITE_E2E_TESTING) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	window.useErrorStore = useErrorStore;
}
