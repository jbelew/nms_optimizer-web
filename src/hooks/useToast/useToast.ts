import { useContext } from "react";

import { ToastContext } from "../../context/createToastContext";

export { ToastProvider } from "../../context/ToastContext";

export type { ToastConfig } from "../../context/createToastContext";

/**
 * Hook to use toast notifications from any component.
 * Must be used within a ToastProvider.
 */
export const useToast = () => {
	const context = useContext(ToastContext);

	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}

	return context;
};
