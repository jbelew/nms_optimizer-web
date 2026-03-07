import { createContext } from "react";

/**
 * Configuration for a toast notification.
 * @typedef {object} ToastConfig
 * @property {string} [id] - Unique identifier for the toast.
 * @property {string} title - The title of the toast.
 * @property {React.ReactNode} description - The description or content of the toast.
 * @property {"success" | "error"} [variant] - The visual variant of the toast.
 * @property {number} [duration] - Duration in milliseconds before the toast auto-closes. Defaults to 8000.
 */
export interface ToastConfig {
	id?: string;
	title: string;
	description: React.ReactNode;
	variant?: "success" | "error";
	duration?: number;
}

/**
 * Context type for managing toast notifications.
 * @typedef {object} ToastContextType
 * @property {ToastConfig | null} toastConfig - Current toast configuration or null if none is being shown.
 * @property {boolean} isOpen - Whether the toast is currently open.
 * @property {(config: ToastConfig) => void} showToast - Shows a toast with the given configuration.
 * @property {(title: string, description: React.ReactNode, duration?: number) => void} showSuccess - Shortcut to show a success toast.
 * @property {(title: string, description: React.ReactNode, duration?: number) => void} showError - Shortcut to show an error toast.
 * @property {(title: string, description: React.ReactNode, duration?: number) => void} showInfo - Shortcut to show an info toast.
 * @property {() => void} closeToast - Closes the currently active toast.
 */
export interface ToastContextType {
	toastConfig: ToastConfig | null;
	isOpen: boolean;
	showToast: (config: ToastConfig) => void;
	showSuccess: (title: string, description: React.ReactNode, duration?: number) => void;
	showError: (title: string, description: React.ReactNode, duration?: number) => void;
	showInfo: (title: string, description: React.ReactNode, duration?: number) => void;
	closeToast: () => void;
}

/**
 * Context for managing application-wide toast notifications.
 */
export const ToastContext = createContext<ToastContextType | undefined>(undefined);
