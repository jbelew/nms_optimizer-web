import { useContext } from "react";

import { ToastContext } from "../../context/createToastContext";

export { ToastProvider } from "../../context/ToastContext";

export type { ToastConfig } from "../../context/createToastContext";

/**
 * Custom hook for accessing the application's toast notification system.
 *
 * Provides functions to show success, error, or informational toasts.
 * **Must be used within a `ToastProvider`.**
 *
 * @returns {ToastContextValue} The toast context containing notification handlers.
 * @throws {Error} If called outside of a `ToastProvider`.
 *
 * @example
 * const { showSuccess } = useToast();
 * showSuccess("Success!", "Your build has been saved.");
 */
export const useToast = () => {
	const context = useContext(ToastContext);

	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}

	return context;
};
