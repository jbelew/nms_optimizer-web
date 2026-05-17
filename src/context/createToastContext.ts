import { createContext } from "react";

/**
 * Configuration for an individual toast notification.
 *
 * @category Context
 */
export interface ToastConfig {
	/** The detailed content or message. Can be a string or React elements. */
	description: React.ReactNode;
	/** Time in milliseconds before the toast is automatically dismissed. Defaults to `8000`. */
	duration?: number;
	/** Unique identifier for the toast. Generated automatically if not provided. */
	id?: string;
	/** The primary text to display at the top of the toast. */
	title: string;
	/** The visual style of the toast. Affects background and icon colors. */
	variant?: "error" | "success";
}

/**
 * Context type for the application's toast notification system.
 *
 * @category Context
 */
export interface ToastContextType {
	/**
	 * Immediately hides the current toast.
	 *
	 * @returns {void} Side-effects only.
	 */
	closeToast: () => void;
	/** Whether a toast is currently visible on the screen. */
	isOpen: boolean;
	/**
	 * Shorthand function to display an error-themed toast.
	 *
	 * @param {string} title - The toast title.
	 * @param {React.ReactNode} description - The toast message.
	 * @param {number} [duration] - Auto-close delay in ms.
	 *
	 * @returns {void} Side-effects only.
	 */
	showError: (title: string, description: React.ReactNode, duration?: number) => void;
	/**
	 * Shorthand function to display a neutral informational toast.
	 *
	 * @param {string} title - The toast title.
	 * @param {React.ReactNode} description - The toast message.
	 * @param {number} [duration] - Auto-close delay in ms.
	 *
	 * @returns {void} Side-effects only.
	 */
	showInfo: (title: string, description: React.ReactNode, duration?: number) => void;
	/**
	 * Shorthand function to display a success-themed toast.
	 *
	 * @param {string} title - The toast title.
	 * @param {React.ReactNode} description - The toast message.
	 * @param {number} [duration] - Auto-close delay in ms.
	 *
	 * @returns {void} Side-effects only.
	 */
	showSuccess: (title: string, description: React.ReactNode, duration?: number) => void;
	/**
	 * Displays a toast with the specified full configuration.
	 *
	 * @param {ToastConfig} config - The configuration object for the toast.
	 *
	 * @returns {void} Side-effects only.
	 */
	showToast: (config: ToastConfig) => void;
	/** The configuration of the currently active toast. `null` if none. */
	toastConfig: null | ToastConfig;
}

/**
 * React Context for managing application-wide toast notifications.
 *
 * @remarks
 * This context provides the foundation for the application's toast notification system.
 * It is typically consumed via the `useToast` hook.
 *
 * @default undefined
 *
 * @see {@link import('./ToastContext').ToastProvider}
 * @see {@link import('@/hooks/useToast/useToast').useToast}
 *
 * @category Context
 */
export const ToastContext = createContext<ToastContextType | undefined>(undefined);
