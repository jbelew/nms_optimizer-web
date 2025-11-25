import type { ToastConfig, ToastContextType } from "./createToastContext";
import type { ReactNode } from "react";
import React, { useCallback, useState } from "react";

import { ToastContext } from "./createToastContext";

/**
 * Provider component for centralized toast notifications.
 * Wraps the application to provide toast functionality throughout.
 */
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [toastConfig, setToastConfig] = useState<ToastConfig | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	const showToast = useCallback((config: ToastConfig) => {
		setToastConfig(config);
		setIsOpen(true);
	}, []);

	const showSuccess = useCallback(
		(title: string, description: ReactNode, duration?: number) => {
			showToast({ title, description, variant: "success", duration });
		},
		[showToast]
	);

	const showError = useCallback(
		(title: string, description: ReactNode, duration?: number) => {
			showToast({ title, description, variant: "error", duration });
		},
		[showToast]
	);

	const showInfo = useCallback(
		(title: string, description: ReactNode, duration?: number) => {
			showToast({ title, description, duration });
		},
		[showToast]
	);

	const closeToast = useCallback(() => {
		setIsOpen(false);
	}, []);

	const value: ToastContextType = {
		toastConfig,
		isOpen,
		showToast,
		showSuccess,
		showError,
		showInfo,
		closeToast,
	};

	return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};
