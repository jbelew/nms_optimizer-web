import type { ReactNode } from "react";
import React, { createContext, use } from "react";
import { create } from "zustand";

/**
 * Shorthand callback signature for displaying a toast notification with a preset variant.
 *
 * @param {string} title - The primary text displayed at the top of the toast.
 * @param {ReactNode} description - The detailed message or React content.
 * @param {number} [duration] - Optional auto-close delay in milliseconds.
 *
 * @returns {void} Side-effects only.
 *
 * @category Context
 */
export type ShowToastFn = (title: string, description: ReactNode, duration?: number) => void;

/**
 * Configuration for an individual toast notification.
 *
 * @category Context
 */
export interface ToastConfig {
	/** The detailed content or message. Can be a string or React elements. */
	description: ReactNode;
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
 * @see {@link ToastConfig}
 * @see {@link ShowToastFn}
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
	/** Shorthand function to display an error-themed toast. */
	showError: ShowToastFn;
	/** Shorthand function to display a neutral informational toast. */
	showInfo: ShowToastFn;
	/** Shorthand function to display a success-themed toast. */
	showSuccess: ShowToastFn;
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
 * Props for the {@link ToastProvider} component.
 *
 * @category Context
 */
export interface ToastProviderProps {
	/** The application component tree wrapped by the toast provider. */
	children: ReactNode;
}

/**
 * React Context for managing application-wide toast notifications.
 *
 * @default undefined
 *
 * @see {@link ToastProvider}
 * @see {@link useToast}
 *
 * @category Context
 */
export const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Internal flat Zustand store backing {@link ToastProvider} and {@link showGlobalError}.
 */
const useToastStore = create<ToastContextType>((set, get) => ({
	closeToast: () => {
		set({ isOpen: false });
		setTimeout(() => {
			set({ toastConfig: null });
		}, 500);
	},
	isOpen: false,
	showError: (title, description, duration) => {
		get().showToast({ description, duration, title, variant: "error" });
	},
	showInfo: (title, description, duration) => {
		get().showToast({ description, duration, title });
	},
	showSuccess: (title, description, duration) => {
		get().showToast({ description, duration, title, variant: "success" });
	},
	showToast: (config) => {
		set({
			isOpen: true,
			toastConfig: {
				...config,
				id: config.id || Date.now().toString(),
			},
		});
	},
	toastConfig: null,
}));

/**
 * Triggers an error-themed toast notification from non-React modules (such as store validation rules).
 *
 * @remarks
 * Dispatches directly to the underlying toast Zustand store so store-level Slot Restriction
 * warnings and network handlers can surface user-friendly toasts without imperative callback singletons.
 *
 * @param title - The primary text displayed at the top of the toast.
 * @param description - The detailed warning or error message.
 * @param [duration] - Optional expiry delay in milliseconds.
 *
 * @returns Side-effects only.
 *
 * @see {@link ToastProvider}
 * @see {@link useToast}
 *
 * @category Utilities
 *
 * @example
 * ```ts
 * showGlobalError("Action Unavailable", "You can only have up to four supercharged slots.", 5000);
 * // updates toast store with an error-variant notification
 * ```
 */
export const showGlobalError: ShowToastFn = (title, description, duration) => {
	useToastStore.getState().showError(title, description, duration);
};

/**
 * Provider component for the centralized toast notification system.
 *
 * @remarks
 * Subscribes to the toast store to manage visibility, configuration, and automatic
 * global click/touch dismissal of active toasts.
 *
 * @param props - Component properties.
 *
 * @returns The provider element wrapping children.
 *
 * @see {@link ToastProviderProps}
 * @see {@link useToast}
 * @see {@link ToastConfig}
 *
 * @component
 *
 * @category Context
 *
 * @example Application wrapper
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * // provides toast context to descendants
 * ```
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
	const value = useToastStore();
	const { closeToast, isOpen } = value;

	React.useEffect(() => {
		return () => {
			useToastStore.setState({ isOpen: false, toastConfig: null });
		};
	}, []);

	React.useEffect(() => {
		if (!isOpen) return;

		const handleGlobalDismiss = () => {
			closeToast();
		};

		const timer = setTimeout(() => {
			window.addEventListener("click", handleGlobalDismiss);
			window.addEventListener("touchstart", handleGlobalDismiss);
		}, 100);

		return () => {
			clearTimeout(timer);
			window.removeEventListener("click", handleGlobalDismiss);
			window.removeEventListener("touchstart", handleGlobalDismiss);
		};
	}, [closeToast, isOpen]);

	return React.createElement(ToastContext.Provider, { value }, children);
};

/**
 * Custom hook for accessing the application's toast notification system.
 *
 * @remarks
 * Reads the active {@link ToastContext} provided by {@link ToastProvider} and throws
 * if invoked outside a provider boundary.
 *
 * @returns The toast context containing notification handlers.
 *
 * @throws {Error} If called outside of a {@link ToastProvider}.
 *
 * @see {@link ToastContext}
 * @see {@link ToastProvider}
 *
 * @hook
 *
 * @category Hooks
 *
 * @example Hook usage in a component
 * ```tsx
 * const { showSuccess, showError } = useToast();
 * showSuccess("Saved", "Build updated successfully.");
 * // displays a success toast notification
 * ```
 */
export const useToast = (): ToastContextType => {
	const context = use(ToastContext);

	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}

	return context;
};
