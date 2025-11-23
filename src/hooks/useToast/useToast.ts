import { useCallback, useState } from "react";

/**
 * Toast notification configuration.
 */
export interface ToastConfig {
	title: string;
	description: string;
	variant?: "success" | "error";
	duration?: number; // Duration in milliseconds, defaults to 8000
}

/**
 * Custom hook for managing toast notifications.
 * Provides methods to show success, error, and info toasts.
 *
 * @returns {{
 *   toastConfig: ToastConfig | null,
 *   isOpen: boolean,
 *   showToast: (config: ToastConfig) => void,
 *   showSuccess: (title: string, description: string) => void,
 *   showError: (title: string, description: string) => void,
 *   showInfo: (title: string, description: string) => void,
 *   closeToast: () => void
 * }} Toast control functions and state.
 */
export const useToast = () => {
	const [toastConfig, setToastConfig] = useState<ToastConfig | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	const showToast = useCallback((config: ToastConfig) => {
		setToastConfig(config);
		setIsOpen(true);
	}, []);

	const showSuccess = useCallback(
		(title: string, description: string, duration?: number) => {
			showToast({ title, description, variant: "success", duration });
		},
		[showToast]
	);

	const showError = useCallback(
		(title: string, description: string, duration?: number) => {
			showToast({ title, description, variant: "error", duration });
		},
		[showToast]
	);

	const showInfo = useCallback(
		(title: string, description: string, duration?: number) => {
			showToast({ title, description, duration });
		},
		[showToast]
	);

	const closeToast = useCallback(() => {
		setIsOpen(false);
	}, []);

	return {
		toastConfig,
		isOpen,
		showToast,
		showSuccess,
		showError,
		showInfo,
		closeToast,
	};
};
